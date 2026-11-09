/** Source identities and physical unit conversions; no clinical thresholds. */
export const ADDITIONAL_LAB_CATALOG_VERSION="bloodwork-catalog-2026-11-09-v2";
export const additionalLabMarkers=[
  {
    "id": "alp",
    "name": "Alkaline phosphatase (ALP)",
    "units": [
      "U/L"
    ],
    "aliases": [
      "ALP",
      "alkaline phosphatase",
      "alk phos"
    ],
    "categories": [
      "liver",
      "bone"
    ],
    "canonicalUnit": "U/L",
    "factors": {
      "U/L": 1
    }
  },
  {
    "id": "bilirubin",
    "name": "Bilirubin — fraction not recorded",
    "units": [
      "umol/L",
      "mg/dL"
    ],
    "aliases": [
      "bilirubin"
    ],
    "categories": [
      "liver"
    ],
    "canonicalUnit": "umol/L",
    "factors": {
      "umol/L": 1,
      "mg/dL": 17.1
    }
  },
  {
    "id": "bilirubin_total",
    "name": "Total bilirubin",
    "units": [
      "umol/L",
      "mg/dL"
    ],
    "aliases": [
      "total bilirubin",
      "bilirubin total",
      "bilirubin,t"
    ],
    "categories": [
      "liver"
    ],
    "canonicalUnit": "umol/L",
    "factors": {
      "umol/L": 1,
      "mg/dL": 17.1
    }
  },
  {
    "id": "bilirubin_direct",
    "name": "Direct bilirubin",
    "units": [
      "umol/L",
      "mg/dL"
    ],
    "aliases": [
      "direct bilirubin",
      "bilirubin direct"
    ],
    "categories": [
      "liver"
    ],
    "canonicalUnit": "umol/L",
    "factors": {
      "umol/L": 1,
      "mg/dL": 17.1
    }
  },
  {
    "id": "bilirubin_indirect",
    "name": "Indirect bilirubin",
    "units": [
      "umol/L",
      "mg/dL"
    ],
    "aliases": [
      "indirect bilirubin",
      "bilirubin indirect"
    ],
    "categories": [
      "liver"
    ],
    "canonicalUnit": "umol/L",
    "factors": {
      "umol/L": 1,
      "mg/dL": 17.1
    }
  },
  {
    "id": "hemoglobin",
    "name": "Hemoglobin",
    "units": [
      "g/L",
      "g/dL"
    ],
    "aliases": [
      "hemoglobin",
      "haemoglobin",
      "hgb",
      "hb"
    ],
    "categories": [
      "blood-count",
      "nutrients"
    ],
    "canonicalUnit": "g/L",
    "factors": {
      "g/L": 1,
      "g/dL": 10
    }
  },
  {
    "id": "hematocrit",
    "name": "Hematocrit",
    "units": [
      "L/L",
      "%"
    ],
    "aliases": [
      "hematocrit",
      "haematocrit",
      "hct",
      "pcv",
      "packed cell volume"
    ],
    "categories": [
      "blood-count"
    ],
    "canonicalUnit": "L/L",
    "factors": {
      "L/L": 1,
      "%": 0.01
    }
  },
  {
    "id": "rbc",
    "name": "Red blood cell count (RBC)",
    "units": [
      "10^12/L",
      "10^6/uL"
    ],
    "aliases": [
      "rbc",
      "red blood cell count",
      "red blood cells",
      "erythrocytes"
    ],
    "categories": [
      "blood-count"
    ],
    "canonicalUnit": "10^12/L",
    "factors": {
      "10^12/L": 1,
      "10^6/uL": 1
    }
  },
  {
    "id": "wbc",
    "name": "White blood cell count (WBC)",
    "units": [
      "10^9/L",
      "10^3/uL"
    ],
    "aliases": [
      "wbc",
      "white blood cell count",
      "white blood cells",
      "leukocytes",
      "leucocytes"
    ],
    "categories": [
      "blood-count",
      "inflammation"
    ],
    "canonicalUnit": "10^9/L",
    "factors": {
      "10^9/L": 1,
      "10^3/uL": 1
    }
  },
  {
    "id": "platelets",
    "name": "Platelet count",
    "units": [
      "10^9/L",
      "10^3/uL"
    ],
    "aliases": [
      "platelets",
      "platelet count",
      "plt",
      "thrombocytes"
    ],
    "categories": [
      "blood-count"
    ],
    "canonicalUnit": "10^9/L",
    "factors": {
      "10^9/L": 1,
      "10^3/uL": 1
    }
  },
  {
    "id": "neutrophils",
    "name": "Neutrophils (absolute)",
    "units": [
      "10^9/L",
      "10^3/uL"
    ],
    "aliases": [
      "neutrophils absolute",
      "neutrophil count absolute",
      "neutrophil absolute",
      "neut absolute",
      "neutrophils abs",
      "neutrophil count abs",
      "neutrophil abs",
      "neut abs"
    ],
    "categories": [
      "blood-count",
      "inflammation"
    ],
    "canonicalUnit": "10^9/L",
    "factors": {
      "10^9/L": 1,
      "10^3/uL": 1
    }
  },
  {
    "id": "neutrophils_percent",
    "name": "Neutrophils (%)",
    "units": [
      "%"
    ],
    "aliases": [
      "neutrophils percent",
      "neutrophil count percent",
      "neutrophil percent",
      "neut percent",
      "neutrophils percentage",
      "neutrophil count percentage",
      "neutrophil percentage",
      "neut percentage",
      "neutrophils %",
      "neutrophil count %",
      "neutrophil %",
      "neut %"
    ],
    "categories": [
      "blood-count",
      "inflammation"
    ],
    "canonicalUnit": "%",
    "factors": {
      "%": 1
    }
  },
  {
    "id": "lymphocytes",
    "name": "Lymphocytes (absolute)",
    "units": [
      "10^9/L",
      "10^3/uL"
    ],
    "aliases": [
      "lymphocytes absolute",
      "lymphocyte count absolute",
      "lymphocyte absolute",
      "lymph absolute",
      "lymphocytes abs",
      "lymphocyte count abs",
      "lymphocyte abs",
      "lymph abs"
    ],
    "categories": [
      "blood-count",
      "inflammation"
    ],
    "canonicalUnit": "10^9/L",
    "factors": {
      "10^9/L": 1,
      "10^3/uL": 1
    }
  },
  {
    "id": "lymphocytes_percent",
    "name": "Lymphocytes (%)",
    "units": [
      "%"
    ],
    "aliases": [
      "lymphocytes percent",
      "lymphocyte count percent",
      "lymphocyte percent",
      "lymph percent",
      "lymphocytes percentage",
      "lymphocyte count percentage",
      "lymphocyte percentage",
      "lymph percentage",
      "lymphocytes %",
      "lymphocyte count %",
      "lymphocyte %",
      "lymph %"
    ],
    "categories": [
      "blood-count",
      "inflammation"
    ],
    "canonicalUnit": "%",
    "factors": {
      "%": 1
    }
  },
  {
    "id": "monocytes",
    "name": "Monocytes (absolute)",
    "units": [
      "10^9/L",
      "10^3/uL"
    ],
    "aliases": [
      "monocytes absolute",
      "monocyte count absolute",
      "monocyte absolute",
      "mono absolute",
      "monocytes abs",
      "monocyte count abs",
      "monocyte abs",
      "mono abs"
    ],
    "categories": [
      "blood-count",
      "inflammation"
    ],
    "canonicalUnit": "10^9/L",
    "factors": {
      "10^9/L": 1,
      "10^3/uL": 1
    }
  },
  {
    "id": "monocytes_percent",
    "name": "Monocytes (%)",
    "units": [
      "%"
    ],
    "aliases": [
      "monocytes percent",
      "monocyte count percent",
      "monocyte percent",
      "mono percent",
      "monocytes percentage",
      "monocyte count percentage",
      "monocyte percentage",
      "mono percentage",
      "monocytes %",
      "monocyte count %",
      "monocyte %",
      "mono %"
    ],
    "categories": [
      "blood-count",
      "inflammation"
    ],
    "canonicalUnit": "%",
    "factors": {
      "%": 1
    }
  },
  {
    "id": "eosinophils",
    "name": "Eosinophils (absolute)",
    "units": [
      "10^9/L",
      "10^3/uL"
    ],
    "aliases": [
      "eosinophils absolute",
      "eosinophil count absolute",
      "eosinophil absolute",
      "eos absolute",
      "eosinophils abs",
      "eosinophil count abs",
      "eosinophil abs",
      "eos abs"
    ],
    "categories": [
      "blood-count",
      "inflammation"
    ],
    "canonicalUnit": "10^9/L",
    "factors": {
      "10^9/L": 1,
      "10^3/uL": 1
    }
  },
  {
    "id": "eosinophils_percent",
    "name": "Eosinophils (%)",
    "units": [
      "%"
    ],
    "aliases": [
      "eosinophils percent",
      "eosinophil count percent",
      "eosinophil percent",
      "eos percent",
      "eosinophils percentage",
      "eosinophil count percentage",
      "eosinophil percentage",
      "eos percentage",
      "eosinophils %",
      "eosinophil count %",
      "eosinophil %",
      "eos %"
    ],
    "categories": [
      "blood-count",
      "inflammation"
    ],
    "canonicalUnit": "%",
    "factors": {
      "%": 1
    }
  },
  {
    "id": "basophils",
    "name": "Basophils (absolute)",
    "units": [
      "10^9/L",
      "10^3/uL"
    ],
    "aliases": [
      "basophils absolute",
      "basophil count absolute",
      "basophil absolute",
      "baso absolute",
      "basophils abs",
      "basophil count abs",
      "basophil abs",
      "baso abs"
    ],
    "categories": [
      "blood-count",
      "inflammation"
    ],
    "canonicalUnit": "10^9/L",
    "factors": {
      "10^9/L": 1,
      "10^3/uL": 1
    }
  },
  {
    "id": "basophils_percent",
    "name": "Basophils (%)",
    "units": [
      "%"
    ],
    "aliases": [
      "basophils percent",
      "basophil count percent",
      "basophil percent",
      "baso percent",
      "basophils percentage",
      "basophil count percentage",
      "basophil percentage",
      "baso percentage",
      "basophils %",
      "basophil count %",
      "basophil %",
      "baso %"
    ],
    "categories": [
      "blood-count",
      "inflammation"
    ],
    "canonicalUnit": "%",
    "factors": {
      "%": 1
    }
  },
  {
    "id": "mcv",
    "name": "Mean corpuscular volume (MCV)",
    "units": [
      "fL"
    ],
    "aliases": [
      "mcv",
      "mean corpuscular volume"
    ],
    "categories": [
      "blood-count",
      "nutrients"
    ],
    "canonicalUnit": "fL",
    "factors": {
      "fL": 1
    }
  },
  {
    "id": "mch",
    "name": "Mean corpuscular hemoglobin (MCH)",
    "units": [
      "pg"
    ],
    "aliases": [
      "mch",
      "mean corpuscular hemoglobin",
      "mean corpuscular haemoglobin"
    ],
    "categories": [
      "blood-count"
    ],
    "canonicalUnit": "pg",
    "factors": {
      "pg": 1
    }
  },
  {
    "id": "mchc",
    "name": "Mean corpuscular hemoglobin concentration (MCHC)",
    "units": [
      "g/L",
      "g/dL"
    ],
    "aliases": [
      "mchc",
      "mean corpuscular hemoglobin concentration",
      "mean corpuscular haemoglobin concentration"
    ],
    "categories": [
      "blood-count"
    ],
    "canonicalUnit": "g/L",
    "factors": {
      "g/L": 1,
      "g/dL": 10
    }
  },
  {
    "id": "rdw_cv",
    "name": "Red cell distribution width — CV (RDW-CV)",
    "units": [
      "%"
    ],
    "aliases": [
      "rdw-cv",
      "rdw cv",
      "red cell distribution width cv"
    ],
    "categories": [
      "blood-count"
    ],
    "canonicalUnit": "%",
    "factors": {
      "%": 1
    }
  },
  {
    "id": "rdw_sd",
    "name": "Red cell distribution width — SD (RDW-SD)",
    "units": [
      "fL"
    ],
    "aliases": [
      "rdw-sd",
      "rdw sd",
      "red cell distribution width sd"
    ],
    "categories": [
      "blood-count"
    ],
    "canonicalUnit": "fL",
    "factors": {
      "fL": 1
    }
  },
  {
    "id": "mpv",
    "name": "Mean platelet volume (MPV)",
    "units": [
      "fL"
    ],
    "aliases": [
      "mpv",
      "mean platelet volume"
    ],
    "categories": [
      "blood-count"
    ],
    "canonicalUnit": "fL",
    "factors": {
      "fL": 1
    }
  },
  {
    "id": "iron",
    "name": "Serum iron",
    "units": [
      "umol/L",
      "ug/dL"
    ],
    "aliases": [
      "iron",
      "serum iron",
      "iron serum"
    ],
    "categories": [
      "nutrients"
    ],
    "canonicalUnit": "umol/L",
    "factors": {
      "umol/L": 1,
      "ug/dL": 0.17906706061420002
    }
  },
  {
    "id": "tibc",
    "name": "Total iron-binding capacity (TIBC)",
    "units": [
      "umol/L",
      "ug/dL"
    ],
    "aliases": [
      "tibc",
      "total iron binding capacity",
      "total iron-binding capacity"
    ],
    "categories": [
      "nutrients"
    ],
    "canonicalUnit": "umol/L",
    "factors": {
      "umol/L": 1,
      "ug/dL": 0.17906706061420002
    }
  },
  {
    "id": "transferrin",
    "name": "Transferrin",
    "units": [
      "g/L",
      "mg/dL",
      "mg/L"
    ],
    "aliases": [
      "transferrin",
      "serum transferrin"
    ],
    "categories": [
      "nutrients"
    ],
    "canonicalUnit": "g/L",
    "factors": {
      "g/L": 1,
      "mg/dL": 0.01,
      "mg/L": 0.001
    }
  },
  {
    "id": "non_hdl",
    "name": "Non-HDL cholesterol",
    "units": [
      "mmol/L",
      "mg/dL"
    ],
    "aliases": [
      "non-hdl cholesterol",
      "non hdl cholesterol",
      "nonhdl cholesterol",
      "non-hdl",
      "non hdl"
    ],
    "categories": [
      "heart"
    ],
    "canonicalUnit": "mmol/L",
    "factors": {
      "mmol/L": 1,
      "mg/dL": 0.02585983966899405
    }
  },
  {
    "id": "testosterone_total",
    "name": "Total testosterone",
    "units": [
      "nmol/L",
      "ng/dL",
      "ng/mL"
    ],
    "aliases": [
      "total testosterone",
      "testosterone total",
      "testosterone,total"
    ],
    "categories": [
      "hormones"
    ],
    "canonicalUnit": "nmol/L",
    "factors": {
      "nmol/L": 1,
      "ng/dL": 0.03467165938561819,
      "ng/mL": 3.4671659385618194
    }
  },
  {
    "id": "immature_granulocytes",
    "name": "Immature granulocytes — absolute count",
    "units": [
      "10^9/L",
      "10^3/uL"
    ],
    "aliases": [
      "immature granulocytes absolute",
      "absolute immature granulocytes",
      "immature granulocyte absolute count",
      "IG absolute",
      "IG count"
    ],
    "categories": [
      "blood-count"
    ],
    "canonicalUnit": "10^9/L",
    "factors": {
      "10^9/L": 1,
      "10^3/uL": 1
    }
  },
  {
    "id": "iron_saturation",
    "name": "Transferrin saturation",
    "units": [
      "%"
    ],
    "aliases": [
      "iron saturation",
      "transferrin saturation",
      "transferrin saturation percent",
      "TSAT"
    ],
    "categories": [
      "nutrients"
    ],
    "canonicalUnit": "%",
    "factors": {
      "%": 1
    }
  },
  {
    "id": "psa_total",
    "name": "Total prostate-specific antigen (PSA)",
    "units": [
      "ng/mL",
      "ug/L"
    ],
    "aliases": [
      "total PSA",
      "PSA total",
      "total prostate specific antigen",
      "prostate specific antigen total"
    ],
    "categories": [
      "other"
    ],
    "canonicalUnit": "ng/mL",
    "factors": {
      "ng/mL": 1,
      "ug/L": 1
    }
  },
  {
    "id": "cholesterol_total",
    "name": "Total cholesterol",
    "units": [
      "mmol/L",
      "mg/dL"
    ],
    "aliases": [
      "total cholesterol",
      "cholesterol total",
      "cholesterol,t"
    ],
    "categories": [
      "heart"
    ],
    "canonicalUnit": "mmol/L",
    "factors": {
      "mmol/L": 1,
      "mg/dL": 0.02585983966899405
    }
  }
] as const;
export type AdditionalLabMarkerId=typeof additionalLabMarkers[number]["id"];
export const additionalLabProfiles=[
  {
    "id": "alp",
    "type": "lab_marker",
    "name": "Alkaline phosphatase (ALP)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Alkaline phosphatase is a group of enzymes found especially in bile-duct tissue and bone. A blood result usually measures total enzyme activity, rather than identifying the tissue that produced it.",
      "whyLowHigh": "Higher activity can accompany impaired bile flow, increased bone turnover, growth or pregnancy. Related liver tests, age and sometimes enzyme fractions help distinguish these contexts. Lower activity has several possible explanations, including uncommon inherited conditions and nutritional or laboratory factors. A single result does not identify one cause.",
      "whyItMatters": "ALP adds context to liver and bone assessment. It does not measure bone strength, dietary absorption or the effectiveness of a supplement.",
      "whatToDiscuss": "Ask whether the laboratory interval fits your age and whether GGT, bilirubin or a bone-focused investigation is relevant. Use the actual report rather than a universal target."
    },
    "directionalContext": {
      "higher": "Higher activity can accompany impaired bile flow, increased bone turnover, growth or pregnancy. Related liver tests, age and sometimes enzyme fractions help distinguish these contexts.",
      "lower": "Lower activity has several possible explanations, including uncommon inherited conditions and nutritional or laboratory factors. A single result does not identify one cause."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-alp",
        "title": "Alkaline phosphatase — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/alkaline-phosphatase/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "bilirubin",
    "type": "lab_marker",
    "name": "Bilirubin — fraction not recorded",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Bilirubin is a pigment formed during breakdown of heme. Blood reports may describe total, direct or indirect bilirubin; an unqualified label does not establish which fraction was reported.",
      "whyLowHigh": "The explanation of a higher value depends on the fraction, related liver tests and blood-cell turnover. Do not apply a total-bilirubin interpretation to an unidentified fraction. A low bilirubin result generally has a different significance from an elevated result and is not, by itself, a reason to try to raise bilirubin.",
      "whyItMatters": "This entry keeps a reported number available without assigning an unreported fraction. Confirm total, direct or indirect identity before comparing observations or using directional biological context.",
      "whatToDiscuss": "Check the fraction name, source units, laboratory method and interval. Discuss the pattern across related tests and whether repeat testing is appropriate in your circumstances."
    },
    "directionalContext": {
      "higher": "The explanation of a higher value depends on the fraction, related liver tests and blood-cell turnover. Do not apply a total-bilirubin interpretation to an unidentified fraction.",
      "lower": "A low bilirubin result generally has a different significance from an elevated result and is not, by itself, a reason to try to raise bilirubin."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": true,
    "citations": [
      {
        "id": "lab-expansion-bilirubin",
        "title": "Bilirubin blood test — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/bilirubin-blood-test/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "bilirubin_total",
    "type": "lab_marker",
    "name": "Total bilirubin",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Total bilirubin includes the bilirubin fractions reported together in blood. Heme breakdown produces bilirubin, which is processed by the liver and excreted through bile.",
      "whyLowHigh": "A higher total can reflect increased pigment production, altered liver handling or reduced bile flow. Separating the fractions and reviewing related tests helps distinguish these possibilities. A low bilirubin result generally has a different significance from an elevated result and is not, by itself, a reason to try to raise bilirubin.",
      "whyItMatters": "Total bilirubin provides context for pigment processing. The same total can arise from different fraction patterns, so it does not identify a liver disease or a nutritional cause.",
      "whatToDiscuss": "Check the fraction name, source units, laboratory method and interval. Discuss the pattern across related tests and whether repeat testing is appropriate in your circumstances."
    },
    "directionalContext": {
      "higher": "A higher total can reflect increased pigment production, altered liver handling or reduced bile flow. Separating the fractions and reviewing related tests helps distinguish these possibilities.",
      "lower": "A low bilirubin result generally has a different significance from an elevated result and is not, by itself, a reason to try to raise bilirubin."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-bilirubin",
        "title": "Bilirubin blood test — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/bilirubin-blood-test/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "bilirubin_direct",
    "type": "lab_marker",
    "name": "Direct bilirubin",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Direct bilirubin is the fraction reacting directly in the laboratory assay, largely associated with conjugated bilirubin. The measurement and its relationship to conjugated forms depend on the method.",
      "whyLowHigh": "Higher direct bilirubin can accompany changes in liver processing or bile flow. The total, other liver tests and the laboratory method provide necessary context. A low bilirubin result generally has a different significance from an elevated result and is not, by itself, a reason to try to raise bilirubin.",
      "whyItMatters": "Direct and total bilirubin are different reported measurements. Their values must not be merged into one trend or treated as interchangeable descriptions of liver function.",
      "whatToDiscuss": "Check the fraction name, source units, laboratory method and interval. Discuss the pattern across related tests and whether repeat testing is appropriate in your circumstances."
    },
    "directionalContext": {
      "higher": "Higher direct bilirubin can accompany changes in liver processing or bile flow. The total, other liver tests and the laboratory method provide necessary context.",
      "lower": "A low bilirubin result generally has a different significance from an elevated result and is not, by itself, a reason to try to raise bilirubin."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-bilirubin",
        "title": "Bilirubin blood test — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/bilirubin-blood-test/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "bilirubin_indirect",
    "type": "lab_marker",
    "name": "Indirect bilirubin",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Indirect bilirubin describes the non-direct portion of a bilirubin report. Laboratories may calculate it from total and direct results; Bloom retains the reported value without inventing that calculation.",
      "whyLowHigh": "Higher indirect bilirubin can occur with increased heme turnover or differences in bilirubin conjugation. Related blood counts and the actual fraction measurements help explain the pattern. A low bilirubin result generally has a different significance from an elevated result and is not, by itself, a reason to try to raise bilirubin.",
      "whyItMatters": "Indirect, direct and total bilirubin retain separate identities. An isolated fraction cannot establish the cause of a change or identify a need for a dietary treatment.",
      "whatToDiscuss": "Check the fraction name, source units, laboratory method and interval. Discuss the pattern across related tests and whether repeat testing is appropriate in your circumstances."
    },
    "directionalContext": {
      "higher": "Higher indirect bilirubin can occur with increased heme turnover or differences in bilirubin conjugation. Related blood counts and the actual fraction measurements help explain the pattern.",
      "lower": "A low bilirubin result generally has a different significance from an elevated result and is not, by itself, a reason to try to raise bilirubin."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-bilirubin",
        "title": "Bilirubin blood test — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/bilirubin-blood-test/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "hemoglobin",
    "type": "lab_marker",
    "name": "Hemoglobin",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Hemoglobin is the oxygen-carrying protein inside red blood cells. This test reports its concentration in whole blood, which reflects red-cell production and the amount of fluid in the sample.",
      "whyLowHigh": "A higher concentration can accompany reduced plasma volume, altitude exposure or increased red-cell production. It does not by itself demonstrate better oxygen delivery or fitness. A lower concentration can occur with blood loss, reduced production or increased cell destruction. Nutrient-related causes are only part of the possible explanation.",
      "whyItMatters": "Hemoglobin is central to describing an anemia pattern, but it cannot identify the cause alone. Hematocrit, cell indices and appropriate follow-up provide complementary information.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "A higher concentration can accompany reduced plasma volume, altitude exposure or increased red-cell production. It does not by itself demonstrate better oxygen delivery or fitness.",
      "lower": "A lower concentration can occur with blood loss, reduced production or increased cell destruction. Nutrient-related causes are only part of the possible explanation."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-cbc",
        "title": "Complete blood count — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "hematocrit",
    "type": "lab_marker",
    "name": "Hematocrit",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Hematocrit describes the fraction of blood volume occupied by red blood cells. Laboratories report it as a proportion or percentage; those units describe the same quantity but have different numeric scales.",
      "whyLowHigh": "A higher fraction may reflect reduced plasma volume or increased red-cell mass. Hydration, altitude and sample conditions can influence the interpretation. A lower fraction can accompany fewer red cells or increased plasma volume. Pregnancy and other physiological or clinical contexts affect the relevant source interval.",
      "whyItMatters": "Hematocrit complements hemoglobin and red-cell count. A change in volume fraction is not a direct measurement of dietary iron, oxygen delivery or training adaptation.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "A higher fraction may reflect reduced plasma volume or increased red-cell mass. Hydration, altitude and sample conditions can influence the interpretation.",
      "lower": "A lower fraction can accompany fewer red cells or increased plasma volume. Pregnancy and other physiological or clinical contexts affect the relevant source interval."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-cbc",
        "title": "Complete blood count — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "rbc",
    "type": "lab_marker",
    "name": "Red blood cell count (RBC)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "The red blood cell count measures the number of erythrocytes in a volume of blood. It is distinct from hemoglobin concentration and from hematocrit, even though these results are often reviewed together.",
      "whyLowHigh": "Higher counts may accompany increased cell production or a change in plasma volume. Altitude and the broader clinical context can matter. Lower counts can reflect reduced production, blood loss or increased cell destruction. Cell size and hemoglobin results help characterize the pattern.",
      "whyItMatters": "A count alone does not establish whether oxygen transport is adequate or whether a particular nutrient is deficient. Related measurements describe different aspects of the same sample.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "Higher counts may accompany increased cell production or a change in plasma volume. Altitude and the broader clinical context can matter.",
      "lower": "Lower counts can reflect reduced production, blood loss or increased cell destruction. Cell size and hemoglobin results help characterize the pattern."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-cbc",
        "title": "Complete blood count — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "wbc",
    "type": "lab_marker",
    "name": "White blood cell count (WBC)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "The white blood cell count measures the combined number of several immune-cell types in blood. A differential separates these cells into groups with different roles.",
      "whyLowHigh": "Higher counts can accompany infection, inflammation, physiological stress, medicines or blood-cell disorders. The total does not identify which process is present. Lower counts can occur with some infections, medicines or changes in blood-cell production. The affected cell types and source method are important.",
      "whyItMatters": "WBC is a broad observation rather than a direct measure of immune strength. The differential, symptoms and repeat results often provide more useful context than a single total.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "Higher counts can accompany infection, inflammation, physiological stress, medicines or blood-cell disorders. The total does not identify which process is present.",
      "lower": "Lower counts can occur with some infections, medicines or changes in blood-cell production. The affected cell types and source method are important."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-differential",
        "title": "Blood differential — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003657.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "platelets",
    "type": "lab_marker",
    "name": "Platelet count",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Platelets are small cell fragments involved in forming a blood clot. The platelet count measures their number, not how well they function or a person’s individual clotting risk.",
      "whyLowHigh": "Higher counts can occur as a reaction to inflammation, blood loss or iron deficiency, as well as in disorders of platelet production. Lower counts may reflect reduced production, increased destruction or consumption, or a sample artifact such as platelet clumping. Confirmation and context matter.",
      "whyItMatters": "The count is interpreted with other blood results and the reason for testing. Mean platelet volume adds a separate size measurement and must not replace the count.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "Higher counts can occur as a reaction to inflammation, blood loss or iron deficiency, as well as in disorders of platelet production.",
      "lower": "Lower counts may reflect reduced production, increased destruction or consumption, or a sample artifact such as platelet clumping. Confirmation and context matter."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-cbc",
        "title": "Complete blood count — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "neutrophils",
    "type": "lab_marker",
    "name": "Neutrophils (absolute)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Neutrophils are immune cells involved in rapid responses to microbes and tissue injury, including engulfing organisms and releasing antimicrobial substances. The absolute result reports cells per volume rather than their percentage among white cells.",
      "whyLowHigh": "Higher absolute counts can accompany infection, inflammation, stress or corticosteroid use. It does not identify the cause on its own. Lower absolute counts have several possible explanations, including medicines, some infections and changes in marrow production. Review the laboratory interval and related cell populations.",
      "whyItMatters": "Absolute and percentage results are separate measurements. A percentage can change when other white-cell populations change, even if this absolute count stays similar.",
      "whatToDiscuss": "Review the total WBC, the differential, collection time and relevant medicines or symptoms. Do not convert a percentage into a cell count without compatible source measurements."
    },
    "directionalContext": {
      "higher": "Higher absolute counts can accompany infection, inflammation, stress or corticosteroid use. It does not identify the cause on its own.",
      "lower": "Lower absolute counts have several possible explanations, including medicines, some infections and changes in marrow production. Review the laboratory interval and related cell populations."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-differential",
        "title": "Blood differential — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003657.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "neutrophils_percent",
    "type": "lab_marker",
    "name": "Neutrophils (%)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Neutrophils are immune cells involved in rapid responses to microbes and tissue injury, including engulfing organisms and releasing antimicrobial substances. This result describes their percentage among the white blood cells counted in the differential.",
      "whyLowHigh": "A higher percentage can reflect more of this cell type, fewer other white cells, or both. The absolute count helps distinguish those situations. A lower percentage can reflect changes in this population or in the other cells forming the denominator. It does not by itself establish a low absolute count.",
      "whyItMatters": "Percentage and absolute results must remain separate; their numeric scales cannot be converted without a compatible total white-cell count from the same source context.",
      "whatToDiscuss": "Review the absolute count and total WBC alongside this percentage. Ask how the complete differential and your testing context affect the report’s interval."
    },
    "directionalContext": {
      "higher": "A higher percentage can reflect more of this cell type, fewer other white cells, or both. The absolute count helps distinguish those situations.",
      "lower": "A lower percentage can reflect changes in this population or in the other cells forming the denominator. It does not by itself establish a low absolute count."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-differential",
        "title": "Blood differential — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003657.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "lymphocytes",
    "type": "lab_marker",
    "name": "Lymphocytes (absolute)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Lymphocytes include T cells, B cells and natural killer cells, which have different roles in immune recognition, antibody production and responses to infected cells. The absolute result reports cells per volume rather than their percentage among white cells.",
      "whyLowHigh": "Higher absolute counts may accompany reactive immune responses or some blood-cell conditions. It does not identify the cause on its own. Lower absolute counts can occur with stress, medicines or changes in immune-cell production and survival. Review the laboratory interval and related cell populations.",
      "whyItMatters": "Absolute and percentage results are separate measurements. A percentage can change when other white-cell populations change, even if this absolute count stays similar.",
      "whatToDiscuss": "Review the total WBC, the differential, collection time and relevant medicines or symptoms. Do not convert a percentage into a cell count without compatible source measurements."
    },
    "directionalContext": {
      "higher": "Higher absolute counts may accompany reactive immune responses or some blood-cell conditions. It does not identify the cause on its own.",
      "lower": "Lower absolute counts can occur with stress, medicines or changes in immune-cell production and survival. Review the laboratory interval and related cell populations."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-differential",
        "title": "Blood differential — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003657.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "lymphocytes_percent",
    "type": "lab_marker",
    "name": "Lymphocytes (%)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Lymphocytes include T cells, B cells and natural killer cells, which have different roles in immune recognition, antibody production and responses to infected cells. This result describes their percentage among the white blood cells counted in the differential.",
      "whyLowHigh": "A higher percentage can reflect more of this cell type, fewer other white cells, or both. The absolute count helps distinguish those situations. A lower percentage can reflect changes in this population or in the other cells forming the denominator. It does not by itself establish a low absolute count.",
      "whyItMatters": "Percentage and absolute results must remain separate; their numeric scales cannot be converted without a compatible total white-cell count from the same source context.",
      "whatToDiscuss": "Review the absolute count and total WBC alongside this percentage. Ask how the complete differential and your testing context affect the report’s interval."
    },
    "directionalContext": {
      "higher": "A higher percentage can reflect more of this cell type, fewer other white cells, or both. The absolute count helps distinguish those situations.",
      "lower": "A lower percentage can reflect changes in this population or in the other cells forming the denominator. It does not by itself establish a low absolute count."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-differential",
        "title": "Blood differential — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003657.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "monocytes",
    "type": "lab_marker",
    "name": "Monocytes (absolute)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Monocytes are circulating immune cells that participate in clearing material and coordinating inflammation. Some move into tissues and develop into related cell types. The absolute result reports cells per volume rather than their percentage among white cells.",
      "whyLowHigh": "Higher absolute counts may accompany inflammation, infection or recovery from another blood-cell change. It does not identify the cause on its own. Lower absolute counts are less specific and need the full blood count and clinical context for interpretation. Review the laboratory interval and related cell populations.",
      "whyItMatters": "Absolute and percentage results are separate measurements. A percentage can change when other white-cell populations change, even if this absolute count stays similar.",
      "whatToDiscuss": "Review the total WBC, the differential, collection time and relevant medicines or symptoms. Do not convert a percentage into a cell count without compatible source measurements."
    },
    "directionalContext": {
      "higher": "Higher absolute counts may accompany inflammation, infection or recovery from another blood-cell change. It does not identify the cause on its own.",
      "lower": "Lower absolute counts are less specific and need the full blood count and clinical context for interpretation. Review the laboratory interval and related cell populations."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-differential",
        "title": "Blood differential — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003657.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "monocytes_percent",
    "type": "lab_marker",
    "name": "Monocytes (%)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Monocytes are circulating immune cells that participate in clearing material and coordinating inflammation. Some move into tissues and develop into related cell types. This result describes their percentage among the white blood cells counted in the differential.",
      "whyLowHigh": "A higher percentage can reflect more of this cell type, fewer other white cells, or both. The absolute count helps distinguish those situations. A lower percentage can reflect changes in this population or in the other cells forming the denominator. It does not by itself establish a low absolute count.",
      "whyItMatters": "Percentage and absolute results must remain separate; their numeric scales cannot be converted without a compatible total white-cell count from the same source context.",
      "whatToDiscuss": "Review the absolute count and total WBC alongside this percentage. Ask how the complete differential and your testing context affect the report’s interval."
    },
    "directionalContext": {
      "higher": "A higher percentage can reflect more of this cell type, fewer other white cells, or both. The absolute count helps distinguish those situations.",
      "lower": "A lower percentage can reflect changes in this population or in the other cells forming the denominator. It does not by itself establish a low absolute count."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-differential",
        "title": "Blood differential — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003657.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "eosinophils",
    "type": "lab_marker",
    "name": "Eosinophils (absolute)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Eosinophils participate in allergic inflammation and responses to some parasites. Their effects depend on the tissue and the reason an immune response is occurring. The absolute result reports cells per volume rather than their percentage among white cells.",
      "whyLowHigh": "Higher absolute counts can accompany allergic conditions, medicine reactions, some parasitic infections or other disorders. It does not identify the cause on its own. Low counts can occur with stress or corticosteroid exposure and are not usually interpreted as a stand-alone deficiency. Review the laboratory interval and related cell populations.",
      "whyItMatters": "Absolute and percentage results are separate measurements. A percentage can change when other white-cell populations change, even if this absolute count stays similar.",
      "whatToDiscuss": "Review the total WBC, the differential, collection time and relevant medicines or symptoms. Do not convert a percentage into a cell count without compatible source measurements."
    },
    "directionalContext": {
      "higher": "Higher absolute counts can accompany allergic conditions, medicine reactions, some parasitic infections or other disorders. It does not identify the cause on its own.",
      "lower": "Low counts can occur with stress or corticosteroid exposure and are not usually interpreted as a stand-alone deficiency. Review the laboratory interval and related cell populations."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-differential",
        "title": "Blood differential — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003657.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "eosinophils_percent",
    "type": "lab_marker",
    "name": "Eosinophils (%)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Eosinophils participate in allergic inflammation and responses to some parasites. Their effects depend on the tissue and the reason an immune response is occurring. This result describes their percentage among the white blood cells counted in the differential.",
      "whyLowHigh": "A higher percentage can reflect more of this cell type, fewer other white cells, or both. The absolute count helps distinguish those situations. A lower percentage can reflect changes in this population or in the other cells forming the denominator. It does not by itself establish a low absolute count.",
      "whyItMatters": "Percentage and absolute results must remain separate; their numeric scales cannot be converted without a compatible total white-cell count from the same source context.",
      "whatToDiscuss": "Review the absolute count and total WBC alongside this percentage. Ask how the complete differential and your testing context affect the report’s interval."
    },
    "directionalContext": {
      "higher": "A higher percentage can reflect more of this cell type, fewer other white cells, or both. The absolute count helps distinguish those situations.",
      "lower": "A lower percentage can reflect changes in this population or in the other cells forming the denominator. It does not by itself establish a low absolute count."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-differential",
        "title": "Blood differential — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003657.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "basophils",
    "type": "lab_marker",
    "name": "Basophils (absolute)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Basophils are a small population of white blood cells that release mediators involved in allergic and inflammatory responses. Their circulating count is normally much smaller than several other white-cell populations. The absolute result reports cells per volume rather than their percentage among white cells.",
      "whyLowHigh": "Higher absolute counts need context from the full differential and may accompany inflammatory or blood-cell conditions. It does not identify the cause on its own. A low or source-reported zero count does not establish an absence of basophil activity in tissues. Review the laboratory interval and related cell populations.",
      "whyItMatters": "Absolute and percentage results are separate measurements. A percentage can change when other white-cell populations change, even if this absolute count stays similar.",
      "whatToDiscuss": "Review the total WBC, the differential, collection time and relevant medicines or symptoms. Do not convert a percentage into a cell count without compatible source measurements."
    },
    "directionalContext": {
      "higher": "Higher absolute counts need context from the full differential and may accompany inflammatory or blood-cell conditions. It does not identify the cause on its own.",
      "lower": "A low or source-reported zero count does not establish an absence of basophil activity in tissues. Review the laboratory interval and related cell populations."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-differential",
        "title": "Blood differential — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003657.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "basophils_percent",
    "type": "lab_marker",
    "name": "Basophils (%)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Basophils are a small population of white blood cells that release mediators involved in allergic and inflammatory responses. Their circulating count is normally much smaller than several other white-cell populations. This result describes their percentage among the white blood cells counted in the differential.",
      "whyLowHigh": "A higher percentage can reflect more of this cell type, fewer other white cells, or both. The absolute count helps distinguish those situations. A lower percentage can reflect changes in this population or in the other cells forming the denominator. It does not by itself establish a low absolute count.",
      "whyItMatters": "Percentage and absolute results must remain separate; their numeric scales cannot be converted without a compatible total white-cell count from the same source context.",
      "whatToDiscuss": "Review the absolute count and total WBC alongside this percentage. Ask how the complete differential and your testing context affect the report’s interval."
    },
    "directionalContext": {
      "higher": "A higher percentage can reflect more of this cell type, fewer other white cells, or both. The absolute count helps distinguish those situations.",
      "lower": "A lower percentage can reflect changes in this population or in the other cells forming the denominator. It does not by itself establish a low absolute count."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-differential",
        "title": "Blood differential — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003657.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "mcv",
    "type": "lab_marker",
    "name": "Mean corpuscular volume (MCV)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Mean corpuscular volume describes the average size of red blood cells. It is a cell-volume measurement, not the number of cells or their total hemoglobin concentration.",
      "whyLowHigh": "A larger average size can accompany several contexts, including changes in B12 or folate status, medicines, liver conditions or a greater proportion of young red cells. A smaller average size can accompany iron-related changes or inherited hemoglobin traits, among other causes. Size alone does not establish the cause.",
      "whyItMatters": "MCV helps describe a blood-count pattern with hemoglobin and RDW. A normal average can also conceal a mixture of smaller and larger cells.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "A larger average size can accompany several contexts, including changes in B12 or folate status, medicines, liver conditions or a greater proportion of young red cells.",
      "lower": "A smaller average size can accompany iron-related changes or inherited hemoglobin traits, among other causes. Size alone does not establish the cause."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-indices",
        "title": "Red blood cell indices — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003648.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "mch",
    "type": "lab_marker",
    "name": "Mean corpuscular hemoglobin (MCH)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Mean corpuscular hemoglobin is the average amount of hemoglobin in one red blood cell. It differs from whole-blood hemoglobin concentration and from hemoglobin concentration within the cells.",
      "whyLowHigh": "A higher average amount often accompanies larger red cells. The meaning depends on the accompanying cell-size and concentration measurements. A lower average amount can accompany red cells containing less hemoglobin, including some iron-related or inherited blood-count patterns.",
      "whyItMatters": "MCH helps describe red-cell characteristics rather than identifying a particular nutrient deficit. MCV, MCHC, hemoglobin and the source interval should be reviewed together.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "A higher average amount often accompanies larger red cells. The meaning depends on the accompanying cell-size and concentration measurements.",
      "lower": "A lower average amount can accompany red cells containing less hemoglobin, including some iron-related or inherited blood-count patterns."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-indices",
        "title": "Red blood cell indices — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003648.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "mchc",
    "type": "lab_marker",
    "name": "Mean corpuscular hemoglobin concentration (MCHC)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Mean corpuscular hemoglobin concentration describes the average concentration of hemoglobin within red blood cells. It is a different measurement from hemoglobin concentration in whole blood, despite sharing concentration units.",
      "whyLowHigh": "Higher values can accompany particular red-cell characteristics or sample and measurement artifacts. The laboratory may need to check a discordant result. Lower values can accompany reduced hemoglobin concentration in cells, including some iron-related patterns. Other causes and the complete count remain relevant.",
      "whyItMatters": "MCHC belongs with MCV, MCH, hemoglobin and the laboratory’s own interval. It is not a direct measure of iron intake, absorption or a treatment response.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "Higher values can accompany particular red-cell characteristics or sample and measurement artifacts. The laboratory may need to check a discordant result.",
      "lower": "Lower values can accompany reduced hemoglobin concentration in cells, including some iron-related patterns. Other causes and the complete count remain relevant."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-indices",
        "title": "Red blood cell indices — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003648.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "rdw_cv",
    "type": "lab_marker",
    "name": "Red cell distribution width — CV (RDW-CV)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "RDW-CV describes variation in red-cell size relative to the average cell volume, reported as a percentage. It is a coefficient of variation, not a cell count.",
      "whyLowHigh": "A wider size distribution can accompany mixed cell populations, changes in production, some nutrient-related patterns or recent treatment or transfusion. It is not specific to one cause. A narrower distribution is not ordinarily a reason to try to increase variability. The full blood count and the laboratory’s method provide context.",
      "whyItMatters": "RDW-CV and RDW-SD are not interchangeable and must not be merged or converted using a fixed factor. MCV and hemoglobin help characterize the same sample.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "A wider size distribution can accompany mixed cell populations, changes in production, some nutrient-related patterns or recent treatment or transfusion. It is not specific to one cause.",
      "lower": "A narrower distribution is not ordinarily a reason to try to increase variability. The full blood count and the laboratory’s method provide context."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-indices",
        "title": "Red blood cell indices — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003648.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "rdw_sd",
    "type": "lab_marker",
    "name": "Red cell distribution width — SD (RDW-SD)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "RDW-SD describes the width of the red-cell size distribution in volume units. It is a separate laboratory measurement from the percentage-based RDW-CV.",
      "whyLowHigh": "A wider size distribution can accompany mixed cell populations, changes in production, some nutrient-related patterns or recent treatment or transfusion. It is not specific to one cause. A narrower distribution is not ordinarily a reason to try to increase variability. The full blood count and the laboratory’s method provide context.",
      "whyItMatters": "RDW-CV and RDW-SD are not interchangeable and must not be merged or converted using a fixed factor. MCV and hemoglobin help characterize the same sample.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "A wider size distribution can accompany mixed cell populations, changes in production, some nutrient-related patterns or recent treatment or transfusion. It is not specific to one cause.",
      "lower": "A narrower distribution is not ordinarily a reason to try to increase variability. The full blood count and the laboratory’s method provide context."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-indices",
        "title": "Red blood cell indices — MedlinePlus Medical Encyclopedia",
        "url": "https://medlineplus.gov/ency/article/003648.htm",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "mpv",
    "type": "lab_marker",
    "name": "Mean platelet volume (MPV)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Mean platelet volume is the average size of platelets detected in the sample. It is distinct from platelet count and does not directly measure platelet function.",
      "whyLowHigh": "A larger average size can accompany changes in platelet production or turnover. Collection conditions, anticoagulant and time before analysis can also change the measurement. A smaller average size has several possible explanations and should be interpreted with the platelet count and laboratory method.",
      "whyItMatters": "MPV alone cannot establish clotting risk or the cause of a platelet-count change. Method and sample handling matter when comparing results between laboratories or dates.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "A larger average size can accompany changes in platelet production or turnover. Collection conditions, anticoagulant and time before analysis can also change the measurement.",
      "lower": "A smaller average size has several possible explanations and should be interpreted with the platelet count and laboratory method."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-mpv",
        "title": "MPV blood test — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/mpv-blood-test/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "iron",
    "type": "lab_marker",
    "name": "Serum iron",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Serum iron measures circulating iron, much of it carried by transferrin. It is a time-sensitive blood observation rather than a measurement of the amount of iron eaten or absorbed.",
      "whyLowHigh": "Higher values can reflect recent supplementation, sample factors or changes in iron handling, among other explanations. A single result does not establish iron overload. Lower values can accompany reduced iron availability or inflammation as well as iron deficiency. Ferritin, binding capacity and clinical context help distinguish these situations.",
      "whyItMatters": "Serum iron fluctuates and should be considered with related iron studies, collection timing and relevant medicines or supplements. It does not determine a supplement dose.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "Higher values can reflect recent supplementation, sample factors or changes in iron handling, among other explanations. A single result does not establish iron overload.",
      "lower": "Lower values can accompany reduced iron availability or inflammation as well as iron deficiency. Ferritin, binding capacity and clinical context help distinguish these situations."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-iron",
        "title": "Iron tests — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/iron-tests/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "tibc",
    "type": "lab_marker",
    "name": "Total iron-binding capacity (TIBC)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Total iron-binding capacity describes the capacity of circulating proteins, mainly transferrin, to bind iron. It is not the same measurement as the amount of circulating serum iron.",
      "whyLowHigh": "Higher capacity can accompany increased transferrin, including some iron-deficiency or hormonal contexts. The complete iron-study pattern is needed. Lower capacity can accompany inflammation, reduced protein production or protein loss, among other causes. A low result does not identify which explanation applies.",
      "whyItMatters": "TIBC, serum iron and ferritin provide different information. Bloom keeps reported measurements separate and does not assume an unreported transferrin saturation or a dietary cause.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "Higher capacity can accompany increased transferrin, including some iron-deficiency or hormonal contexts. The complete iron-study pattern is needed.",
      "lower": "Lower capacity can accompany inflammation, reduced protein production or protein loss, among other causes. A low result does not identify which explanation applies."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-iron",
        "title": "Iron tests — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/iron-tests/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "transferrin",
    "type": "lab_marker",
    "name": "Transferrin",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Transferrin is a blood protein that transports iron. Its concentration is different from serum iron and from iron-binding capacity, even though these measurements are related.",
      "whyLowHigh": "Higher concentrations can occur with iron deficiency or hormonal changes, including some pregnancy-related contexts. An increased carrier concentration does not prove increased iron availability. Lower concentrations can accompany inflammation, altered liver protein production or protein loss, among other explanations. Nutrition is only one part of the possible context.",
      "whyItMatters": "Transferrin belongs in a broader iron-study assessment. It should not be treated as a direct measure of absorbed iron or used alone to choose a supplement.",
      "whatToDiscuss": "Review this result with the related blood count, the report’s own interval, symptoms and previous results. Ask whether the sample or timing could explain a difference before changing food or supplements."
    },
    "directionalContext": {
      "higher": "Higher concentrations can occur with iron deficiency or hormonal changes, including some pregnancy-related contexts. An increased carrier concentration does not prove increased iron availability.",
      "lower": "Lower concentrations can accompany inflammation, altered liver protein production or protein loss, among other explanations. Nutrition is only one part of the possible context."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-iron",
        "title": "Iron tests — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/iron-tests/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "non_hdl",
    "type": "lab_marker",
    "name": "Non-HDL cholesterol",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Non-HDL cholesterol is the cholesterol carried outside the HDL fraction. Laboratories commonly report it from total cholesterol minus HDL; Bloom records the reported result without inventing missing component measurements.",
      "whyLowHigh": "Higher values describe more cholesterol in these lipoprotein fractions. Their clinical significance depends on the broader cardiovascular context rather than this number alone. A lower value is not automatically evidence that all risk has resolved or that a particular food caused a change. Source and treatment context remain relevant.",
      "whyItMatters": "Non-HDL cholesterol is distinct from LDL cholesterol and ApoB particle-related measurement. These identities and their units must remain separate in trends.",
      "whatToDiscuss": "Review the report’s reference information and the context used by your clinician. A laboratory interval is not necessarily an individualized cardiovascular treatment target."
    },
    "directionalContext": {
      "higher": "Higher values describe more cholesterol in these lipoprotein fractions. Their clinical significance depends on the broader cardiovascular context rather than this number alone.",
      "lower": "A lower value is not automatically evidence that all risk has resolved or that a particular food caused a change. Source and treatment context remain relevant."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-cholesterol",
        "title": "Cholesterol levels — MedlinePlus",
        "url": "https://medlineplus.gov/cholesterollevelswhatyouneedtoknow.html",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "testosterone_total",
    "type": "lab_marker",
    "name": "Total testosterone",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v1",
    "firstLayer": {
      "whatItDoes": "Total testosterone includes circulating testosterone in bound and unbound forms. It is a different measurement from free testosterone and cannot establish a free concentration without additional appropriate information.",
      "whyLowHigh": "Higher total results have different meanings across age, sex, medicines and clinical circumstances. Binding proteins and the assay method also affect interpretation. Lower total results likewise require context, including collection timing and sometimes repeat measurement. One observation does not establish an endocrine diagnosis.",
      "whyItMatters": "Testosterone varies over time, and the relevant report interval depends on the tested population and method. No universal range or hormone-treatment target is inferred.",
      "whatToDiscuss": "Review the exact total-versus-free label, collection time, laboratory interval and relevant medicines. Discuss whether repeat testing or additional source measurements would be useful."
    },
    "directionalContext": {
      "higher": "Higher total results have different meanings across age, sex, medicines and clinical circumstances. Binding proteins and the assay method also affect interpretation.",
      "lower": "Lower total results likewise require context, including collection timing and sometimes repeat measurement. One observation does not establish an endocrine diagnosis."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-testosterone",
        "title": "Testosterone levels test — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/testosterone-levels-test/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "immature_granulocytes",
    "type": "lab_marker",
    "name": "Immature granulocytes — absolute count",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v2",
    "firstLayer": {
      "whatItDoes": "Immature granulocytes are developing white blood cells. This result is their absolute number per volume of blood, not their percentage among white cells.",
      "whyLowHigh": "Counts vary with the blood-cell population and laboratory method; a percentage is a different measurement.",
      "whyItMatters": "Counts vary with the blood-cell population and laboratory method; a percentage is a different measurement.",
      "whatToDiscuss": "Review the original differential, specimen and measurement method; a count alone does not identify an infection or marrow condition."
    },
    "directionalContext": {
      "higher": "A higher reported value needs the original assay, reference interval and clinical context; no diagnosis or treatment target is inferred.",
      "lower": "A lower reported value likewise needs source context; it is not a reason to try to change the result through an unreviewed intervention."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-immature_granulocytes",
        "title": "Blood differential — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/blood-differential/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "iron_saturation",
    "type": "lab_marker",
    "name": "Transferrin saturation",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v2",
    "firstLayer": {
      "whatItDoes": "Transferrin saturation is the reported percentage of iron-binding capacity occupied by iron. It is distinct from the amount of iron, TIBC and transferrin concentration.",
      "whyLowHigh": "Interpretation depends on the source calculation or assay, timing and other iron indices. Bloom does not recalculate a missing saturation from unrelated samples.",
      "whyItMatters": "Interpretation depends on the source calculation or assay, timing and other iron indices. Bloom does not recalculate a missing saturation from unrelated samples.",
      "whatToDiscuss": "Review ferritin, serum iron and the original report together, including collection context; no iron dose is inferred."
    },
    "directionalContext": {
      "higher": "A higher reported value needs the original assay, reference interval and clinical context; no diagnosis or treatment target is inferred.",
      "lower": "A lower reported value likewise needs source context; it is not a reason to try to change the result through an unreviewed intervention."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-iron_saturation",
        "title": "Iron tests — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/iron-tests/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "psa_total",
    "type": "lab_marker",
    "name": "Total prostate-specific antigen (PSA)",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v2",
    "firstLayer": {
      "whatItDoes": "Total PSA measures the total concentration of prostate-specific antigen reported by the assay. Free PSA and the free-to-total ratio are different tests.",
      "whyLowHigh": "A total result can vary with prostate conditions, recent procedures, medicines and the assay. It does not establish a cancer diagnosis.",
      "whyItMatters": "A total result can vary with prostate conditions, recent procedures, medicines and the assay. It does not establish a cancer diagnosis.",
      "whatToDiscuss": "Discuss the purpose, method and collection circumstances with the ordering clinician. No screening threshold, cancer probability or treatment target is supplied."
    },
    "directionalContext": {
      "higher": "A higher reported value needs the original assay, reference interval and clinical context; no diagnosis or treatment target is inferred.",
      "lower": "A lower reported value likewise needs source context; it is not a reason to try to change the result through an unreviewed intervention."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-psa_total",
        "title": "PSA test — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/prostate-specific-antigen-psa-test/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  },
  {
    "id": "cholesterol_total",
    "type": "lab_marker",
    "name": "Total cholesterol",
    "reviewStatus": "developer_draft_not_independently_reviewed",
    "coverageStatus": "limited",
    "reviewedAt": null,
    "version": "bloodwork-catalog-2026-11-09-v2",
    "firstLayer": {
      "whatItDoes": "Total cholesterol is cholesterol measured across the circulating lipoprotein fractions. It is not LDL cholesterol, HDL cholesterol or non-HDL cholesterol.",
      "whyLowHigh": "The lipid fractions and collection context provide information that the total alone cannot separate. A missing total is not reconstructed from unrelated results.",
      "whyItMatters": "The lipid fractions and collection context provide information that the total alone cannot separate. A missing total is not reconstructed from unrelated results.",
      "whatToDiscuss": "Review the original lipid panel and laboratory interval; total cholesterol alone does not set an individual cardiovascular treatment target."
    },
    "directionalContext": {
      "higher": "A higher reported value needs the original assay, reference interval and clinical context; no diagnosis or treatment target is inferred.",
      "lower": "A lower reported value likewise needs source context; it is not a reason to try to change the result through an unreviewed intervention."
    },
    "limitations": [
      "General educational draft, not an interpretation of your result. Independent specialist review is not claimed.",
      "Use the source laboratory’s interval and exact measurement identity; no universal normal range or personal treatment target is supplied.",
      "Citation retrieval could not be verified from this environment. Open the cited reference and original report for context."
    ],
    "scopeLimit": "Source-faithful reported values and general education only; no diagnosis, urgency, dose or personal clinical target.",
    "assayIdentityRequired": false,
    "citations": [
      {
        "id": "lab-expansion-cholesterol_total",
        "title": "Cholesterol levels — MedlinePlus",
        "url": "https://medlineplus.gov/lab-tests/cholesterol-levels/",
        "design": "General medical test reference; cited educational background",
        "studyDesign": "General medical test reference",
        "evidenceLevel": "clinical guidance",
        "scopeLimit": "General test description, not an individualized interpretation or treatment recommendation.",
        "verifiedOn": null,
        "verification": "citation-not-retrieved",
        "reviewStatus": "not_independently_verified"
      }
    ]
  }
];
