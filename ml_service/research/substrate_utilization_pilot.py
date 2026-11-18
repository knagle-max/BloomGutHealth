"""Research-only substrate-use phenotype pilot: source-qualified, real-data required.

Input is a long-form TSV/CSV generated from authorized experimental records.
This module NEVER downloads datasets, trains on user records, or invents labels.
Run:
 python -m ml_service.research.substrate_utilization_pilot inspect --data observations.tsv --manifest source.json
 python -m ml_service.research.substrate_utilization_pilot freeze --data observations.tsv --manifest source.json --splits split.json
 python -m ml_service.research.substrate_utilization_pilot evaluate --data observations.tsv --manifest source.json --splits split.json --output results.json
All outputs are research-only. A scientific promotion requires independent review.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np
import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    balanced_accuracy_score, brier_score_loss, precision_score,
    recall_score, f1_score, confusion_matrix,
)
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

REQUIRED = ("source_row_id", "study_id", "experiment_id", "strain_id",
            "substrate_id", "assay_family", "phenotype")
TARGETS = {"growth": 1, "no_growth": 0}
VERSION = "substrate-utilization-pilot-v1"

def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def load(data_path: Path, manifest_path: Path, *, training: bool):
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("schemaVersion") != "bloom-substrate-source-v1":
        raise ValueError("Unrecognized provenance manifest")
    if not manifest.get("sourceId") or not manifest.get("sourceVersion"):
        raise ValueError("Missing source ID/version")
    if manifest.get("sourceSha256") != digest(data_path):
        raise ValueError("Dataset byte hash differs from the approved manifest")
    if not manifest.get("originUrl") or not manifest.get("acquiredAt"):
        raise ValueError("Missing acquisition provenance")
    if training and (
        manifest.get("commercialTrainingRights") != "approved"
        or not manifest.get("rightsEvidence")
        or not manifest.get("rightsReviewer")
        or manifest.get("measurementClass") != "direct_experimental_measurement"
    ):
        raise PermissionError("Dataset not approved for commercial scientific model training")
    frame = pd.read_csv(data_path, sep="\t" if data_path.suffix.lower() == ".tsv" else ",", dtype={k: str for k in REQUIRED}, keep_default_na=False)
    missing = set(REQUIRED) - set(frame.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")
    if len(frame) == 0:
        raise ValueError("No observed rows")
    if frame["source_row_id"].duplicated().any():
        raise ValueError("Duplicate source row identities; do not collapse silently")
    for col in REQUIRED[:-1]:
        if (frame[col].str.strip() == "").any():
            raise ValueError(f"Missing {col} in measured source record")
    if "source_rights" in frame and (frame["source_rights"] != "approved").any():
        raise PermissionError("Some upstream observation rows have no commercial training clearance")
    if "measurement_class" in frame and (frame["measurement_class"] != "direct_experimental_measurement").any():
        raise ValueError("Unverified inferred/synthetic rows cannot be experimental ground truth")
    unresolved = frame.loc[~frame["phenotype"].isin(TARGETS), "phenotype"].value_counts().to_dict()
    valid = frame.loc[frame["phenotype"].isin(TARGETS)].copy()
    valid["target"] = valid["phenotype"].map(TARGETS).astype(int)
    if "genome_accession" in valid.columns:
        valid["genome_accession"] = valid["genome_accession"].astype(str)
    features = [c for c in valid if c.startswith("feature_")]
    for col in features:
        vals = pd.to_numeric(valid[col].replace("", np.nan), errors="coerce")
        if not np.isfinite(vals.dropna()).all():
            raise ValueError(f"Nonfinite feature {col}")
        valid[col] = vals
    report = {
        "sourceId": manifest["sourceId"],
        "sourceVersion": manifest["sourceVersion"],
        "sourceSha256": manifest["sourceSha256"],
        "commercialTrainingRights": manifest.get("commercialTrainingRights", "unresolved"),
        "sourceRows": len(frame),
        "eligibleMeasuredRows": len(valid),
        "excludedUnresolvedLabels": unresolved,
        "classCounts": {str(k): int(v) for k, v in valid["target"].value_counts().items()},
        "independentStrains": int(valid["strain_id"].nunique()),
        "independentStudyIds": int(valid["study_id"].nunique()),
        "independentExperimentIds": int(valid["experiment_id"].nunique()),
        "assayFamilies": sorted(valid["assay_family"].unique().tolist()),
        "featureColumns": features,
        "status": "QUALIFIED_FOR_SPLIT" if training else "INSPECTION_ONLY_NOT_TRAINING_ELIGIBILITY",
    }
    return valid, manifest, report

def connected_groups(df: pd.DataFrame):
    """Close transitive study/experiment/strain/genome overlap before splitting.

    A strain appearing in two studies links both studies into one component;
    therefore neither study/strain can leak into a different partition.
    """
    parent = {}
    def root(x):
        parent.setdefault(x, x)
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def merge(a, b):
        parent[root(a)] = root(b)
    for _, r in df.iterrows():
        keys = ["study:" + r["study_id"], "strain:" + r["strain_id"],
                "experiment:" + r["experiment_id"]]
        if "genome_accession" in df and r.get("genome_accession"):
            keys.append("genome:" + r["genome_accession"])
        for k in keys[1:]:
            merge(keys[0], k)
    return np.asarray([root("strain:" + x) for x in df["strain_id"]])

def freeze(df, report, *, seed=271828):
    if len(df) < 12 or df["target"].nunique() < 2:
        raise ValueError("Too few diverse experimentally measured records")
    groups = connected_groups(df)
    if len(set(groups)) < 4:
        raise ValueError("Insufficient independent connected study/strain groups for train/validation/test")
    indices = np.arange(len(df))
    first = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=seed)
    rest_idx, test_idx = next(first.split(indices, df["target"], groups))
    second = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=seed + 1)
    train_rel, val_rel = next(second.split(rest_idx, df["target"].iloc[rest_idx], groups[rest_idx]))
    train_idx, val_idx = rest_idx[train_rel], rest_idx[val_rel]
    assignments = {}
    for label, ix in (("train", train_idx), ("validation", val_idx), ("test", test_idx)):
        if len(ix) == 0:
            raise ValueError("Empty independent " + label + " partition")
        for row in df.iloc[ix]["source_row_id"]:
            assignments[row] = label
    if df.iloc[train_idx]["target"].nunique() != 2:
        raise ValueError("Training partition has only one measured outcome class")
    for column in ("strain_id", "study_id", "experiment_id", "genome_accession"):
        if column not in df:
            continue
        for a, b in (("train", "test"), ("train", "validation"), ("validation", "test")):
            x = set(df.loc[df["source_row_id"].isin(k for k, v in assignments.items() if v == a), column])
            y = set(df.loc[df["source_row_id"].isin(k for k, v in assignments.items() if v == b), column])
            if x & y:
                raise AssertionError("Group leakage: " + column)
    return {
        "schemaVersion": "bloom-frozen-split-v1", "pilotVersion": VERSION,
        "sourceSha256": report["sourceSha256"], "seed": seed,
        "assignments": assignments,
        "counts": dict(Counter(assignments.values())),
        "grouping": "transitive-study-experiment-strain-genome-components",
        "createdForIndependentEvaluation": True,
    }

def evaluate_model(name, model, Xtrain, ytrain, Xtest, ytest):
    model.fit(Xtrain, ytrain)
    scores = model.predict_proba(Xtest)[:, 1]
    predicted = (scores >= 0.5).astype(int)
    return model, {
        "model": name, "testN": int(len(ytest)),
        "testPositiveN": int(np.sum(ytest)), "testNegativeN": int(len(ytest) - np.sum(ytest)),
        "balancedAccuracy": float(balanced_accuracy_score(ytest, predicted)),
        "precision": float(precision_score(ytest, predicted, zero_division=0)),
        "recall": float(recall_score(ytest, predicted, zero_division=0)),
        "macroF1": float(f1_score(ytest, predicted, average="macro", zero_division=0)),
        "brier": float(brier_score_loss(ytest, scores)),
        "confusionMatrix": confusion_matrix(ytest, predicted, labels=[0, 1]).tolist(),
        "limitations": ["No clinical validation; labels are assay-specific experimental growth phenotypes"],
    }

def run_benchmark(df, report, split):
    if split.get("schemaVersion") != "bloom-frozen-split-v1" or split.get("sourceSha256") != report["sourceSha256"]:
        raise ValueError("Invalid or stale split manifest")
    if set(split.get("assignments", {})) != set(df["source_row_id"]):
        raise ValueError("Split does not match eligible source row identities")
    assignments = split["assignments"]
    if set(assignments.values()) != {"train", "validation", "test"}:
        raise ValueError("Missing an evaluation partition")
    for col in ("study_id", "experiment_id", "strain_id", "genome_accession"):
        if col not in df:
            continue
        sets = [set(df.loc[df["source_row_id"].map(assignments) == p, col]) for p in ("train", "validation", "test")]
        if any(sets[a] & sets[b] for a, b in ((0,1),(0,2),(1,2))):
            raise ValueError("Leakage across frozen partitions: " + col)
    train = df.loc[df["source_row_id"].map(assignments) == "train"]
    test = df.loc[df["source_row_id"].map(assignments) == "test"]
    if train["target"].nunique() < 2:
        raise ValueError("Training set contains only one class")
    numeric_cols = report["featureColumns"]
    results = []
    y_train, y_test = train["target"], test["target"]
    _, majority = evaluate_model("majority-class", DummyClassifier(strategy="most_frequent"), np.zeros((len(train),1)), y_train, np.zeros((len(test),1)), y_test)
    results.append(majority)
    for name, categorical, numerical in [
        ("organism-only", ["strain_id"], []),
        ("substrate-only", ["substrate_id"], []),
        ("regularized-logistic", ["substrate_id"], numeric_cols),
    ]:
        transforms = []
        if categorical:
            transforms.append(("category", OneHotEncoder(handle_unknown="ignore"), categorical))
        if numerical:
            transforms.append(("genome", Pipeline([("imputer", SimpleImputer(strategy="constant", fill_value=0))]), numerical))
        pipeline = Pipeline([
            ("features", ColumnTransformer(transforms)),
            ("classifier", LogisticRegression(max_iter=1500, class_weight="balanced", random_state=split["seed"])),
        ])
        _, score = evaluate_model(name, pipeline, train, y_train, test, y_test)
        results.append(score)
    return results

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("inspect", "freeze", "evaluate"))
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--splits", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--seed", type=int, default=271828)
    args = parser.parse_args(argv)
    if args.operation != "inspect" and not args.splits:
        parser.error("--splits is mandatory for freeze/evaluate")
    try:
        start = time.perf_counter()
        df, manifest, audit = load(args.data, args.manifest, training=args.operation != "inspect")
        result = {"pilotVersion": VERSION, "operation": args.operation, "sourceAudit": audit}
        if args.operation == "freeze":
            split = freeze(df, audit, seed=args.seed)
            if args.splits.exists():
                raise FileExistsError("Frozen split already exists; do not overwrite it")
            args.splits.write_text(json.dumps(split, indent=2, sort_keys=True) + "\n")
            result["frozenSplit"] = {"sha256": digest(args.splits), "counts": split["counts"]}
        elif args.operation == "evaluate":
            split = json.loads(args.splits.read_text())
            result["splitSha256"] = digest(args.splits)
            result["models"] = run_benchmark(df, audit, split)
            result["status"] = "INTERNAL_RESEARCH_BENCHMARK_NOT_INDEPENDENTLY_REVIEWED"
        result["environment"] = {"python": sys.version.split()[0], "sklearn": sklearn.__version__,
                                 "platform": platform.platform(), "cpuCount": os.cpu_count()}
        result["runtimeSeconds"] = round(time.perf_counter() - start, 4)
        result["incrementalComputeCostUsd"] = None  # Needs actual metered environment/rate; not invented.
        encoded = json.dumps(result, indent=2, sort_keys=True) + "\n"
        if args.output:
            args.output.write_text(encoded)
        print(encoded)
        return 0
    except (ValueError, PermissionError, FileNotFoundError, FileExistsError) as exc:
        print(json.dumps({"status": "BLOCKED", "reason": str(exc), "operation": args.operation}), file=sys.stderr)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
