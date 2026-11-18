"""Synthetic software contract tests: NOT an experimental prediction benchmark.

Tests call the unpromoted algorithm functions on synthetic inputs; the public
training/CLI loader explicitly rejects these same synthetic source records.
"""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

import pandas as pd

from ml_service.research.substrate_utilization_pilot import (
    connected_groups, freeze, load, run_benchmark, VERSION,
)


class SubstrateUtilizationSoftwareTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.data = self.base / "synthetic-software-only.tsv"
        self.meta = self.base / "source.json"
        rows = []
        for study in range(10):
            for strain in range(2):
                for substrate in ("glucose", "acetate", "lactose", "sucrose"):
                    rows.append({
                        "source_row_id": f"fixture-{study}-{strain}-{substrate}",
                        "study_id": f"synthetic-study-{study}",
                        "experiment_id": f"synthetic-exp-{study}-{strain}",
                        "strain_id": f"synthetic-strain-{study}-{strain}",
                        "substrate_id": substrate,
                        "assay_family": "synthetic-test-only",
                        "phenotype": "growth" if (study + strain + len(substrate)) % 2 else "no_growth",
                        "feature_pathway_a": float(study % 3),
                        "measurement_class": "direct_experimental_measurement",
                        "source_rights": "approved",
                    })
        pd.DataFrame(rows).to_csv(self.data, sep="\t", index=False)
        self.manifest = {
            "schemaVersion": "bloom-substrate-source-v1",
            "sourceId": "SYNTHETIC-SOFTWARE-FIXTURE-DO-NOT-TRAIN",
            "sourceVersion": "fixture-v1",
            "sourceSha256": hashlib.sha256(self.data.read_bytes()).hexdigest(),
            "originUrl": "internal://synthetic-software-test",
            "acquiredAt": "2026-11-18",
            "commercialTrainingRights": "approved",
            "rightsEvidence": "synthetic software-test fixture created in this test",
            "rightsReviewer": "internal-test-only",
            "measurementClass": "direct_experimental_measurement",
        }
        self.meta.write_text(json.dumps(self.manifest))

    def test_inspection_never_promotes_source(self):
        frame, m, report = load(self.data, self.meta, training=False)
        self.assertEqual(report["status"], "INSPECTION_ONLY_NOT_TRAINING_ELIGIBILITY")
        self.assertEqual(len(frame), 80)
        self.assertEqual(report["independentStudyIds"], 10)

    def test_training_rights_restrictions_are_hard_gates(self):
        self.manifest["commercialTrainingRights"] = "unresolved"
        self.meta.write_text(json.dumps(self.manifest))
        with self.assertRaises(PermissionError):
            load(self.data, self.meta, training=True)

    def test_synthetic_data_remains_blocked_even_if_rights_flag_is_fake(self):
        self.manifest.update({
            "commercialTrainingRights": "approved",
            "dataOrigin": "verified_experimental",
            "originalExperimentSource": "synthetic-placeholder",
            "upstreamRightsStatus": "approved",
        })
        self.meta.write_text(json.dumps(self.manifest))
        with self.assertRaises(PermissionError):
            load(self.data, self.meta, training=True)

    def test_raw_source_byte_change_invalidates_manifest(self):
        self.data.write_bytes(self.data.read_bytes() + b"\n")
        with self.assertRaises(ValueError):
            load(self.data, self.meta, training=False)

    def test_missing_labels_not_negative(self):
        frame = pd.read_csv(self.data, sep="\t")
        frame.loc[0, "phenotype"] = "not_measured"
        frame.to_csv(self.data, sep="\t", index=False)
        self.manifest["sourceSha256"] = hashlib.sha256(self.data.read_bytes()).hexdigest()
        self.meta.write_text(json.dumps(self.manifest))
        _, _, report = load(self.data, self.meta, training=False)
        self.assertEqual(report["eligibleMeasuredRows"], 79)
        self.assertEqual(report["excludedUnresolvedLabels"]["not_measured"], 1)

    def test_connected_studies_do_not_cross_holdout(self):
        df, _, report = load(self.data, self.meta, training=False)
        split = freeze(df, report)
        labels = pd.Series(split["assignments"])
        self.assertEqual(len(labels), len(df))
        self.assertEqual(set(labels.unique()), {"train", "validation", "test"})
        for key in ("study_id", "strain_id", "experiment_id"):
            groups = df.groupby(key)["source_row_id"].apply(list)
            for ids in groups:
                self.assertEqual(len({split["assignments"][x] for x in ids}), 1)
        # Changes in group assignment invalidate the independent split.
        broken = dict(split)
        broken["assignments"] = dict(split["assignments"])
        row = next(iter(broken["assignments"]))
        broken["assignments"][row] = "test" if broken["assignments"][row] != "test" else "train"
        with self.assertRaises(ValueError):
            run_benchmark(df, report, broken)

    def test_synthetic_fixture_scores_are_never_real_science(self):
        df, _, report = load(self.data, self.meta, training=False)
        split = freeze(df, report)
        scores = run_benchmark(df, report, split)
        self.assertEqual([r["model"] for r in scores],
                         ["majority-class", "organism-only", "substrate-only", "regularized-logistic"])
        self.assertTrue(all(0 <= r["balancedAccuracy"] <= 1 for r in scores))
        self.assertEqual(VERSION, "substrate-utilization-pilot-v1")
        # Synthetic values below are for software test behavior only, not cited scientific scores.


if __name__ == "__main__":
    unittest.main()
