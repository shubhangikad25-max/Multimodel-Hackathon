# Dataset Analysis Report: Z-Alizadeh Sani Extension

## 1. File Details
- **File Name:** `extention of Z-Alizadeh sani dataset.xlsx`
- **Location:** `dataset/extention of Z-Alizadeh sani dataset.xlsx`
- **Format:** Excel (`.xlsx`)

## 2. Dataset Shape & Integrity
- **Rows (Records):** 303
- **Columns (Features & Labels):** 59
- **Missing Values:** 0
- **Duplicate Rows:** 0

## 3. Target Labels (Prediction Goals)
The hackathon requires predicting overall CAD and specific vessel stenosis (LAD, LCX, RCA). The targets are clearly identifiable:
- `Cath` (Overall CAD status): CAD (216), Normal (87)
- `LAD` (Left Anterior Descending): Stenotic (177), Normal (126)
- `LCX` (Left Circumflex): Normal (184), Stenotic (119)
- `RCA` (Right Coronary Artery): Normal (189), Stenotic (114)

*Note: As per the leakage rule, when predicting any of these targets, the other three targets must be excluded from the feature set.*

## 4. Input Features (Predictors)
The remaining 55 columns form the feature space. They encompass several clinical categories:

**Demographics & Physical:**
`Age`, `Weight`, `Length`, `Sex`, `BMI`, `Obesity`

**Comorbidities & Risk Factors:**
`DM`, `HTN`, `Current Smoker`, `EX-Smoker`, `FH`, `CRF`, `CVA`, `Airway disease`, `Thyroid Disease`, `CHF`, `DLP`

**Clinical Symptoms & Examination:**
`BP`, `PR`, `Edema`, `Weak Peripheral Pulse`, `Lung rales`, `Systolic Murmur`, `Diastolic Murmur`, `Typical Chest Pain`, `Dyspnea`, `Function Class`, `Atypical`, `Nonanginal`, `Exertional CP`, `LowTH Ang`

**ECG Features:**
`Q Wave`, `St Elevation`, `St Depression`, `Tinversion`, `LVH`, `Poor R Progression`, `BBB`

**Laboratory Tests:**
`FBS`, `CR`, `TG`, `LDL`, `HDL`, `BUN`, `ESR`, `HB`, `K`, `Na`, `WBC`, `Lymph`, `Neut`, `PLT`

**Echocardiography:**
`EF-TTE`, `Region RWMA`, `VHD`

## 5. Data Types
- **Numeric (Integer/Float):** Age, Weight, Length, BMI, BP, PR, FBS, CR, TG, LDL, HDL, BUN, ESR, HB, K, Na, WBC, Lymph, Neut, PLT, EF-TTE, Region RWMA, etc.
- **Categorical (String/Object):** Sex, Obesity, CRF, CVA, Airway disease, Thyroid Disease, CHF, DLP, Weak Peripheral Pulse, Lung rales, Systolic Murmur, Diastolic Murmur, Dyspnea, Atypical, Nonanginal, Exertional CP, LowTH Ang, LVH, Poor R Progression, BBB, VHD.
- **Binary Encoded as Integers (0/1 or similar):** DM, HTN, Current Smoker, EX-Smoker, FH, Typical Chest Pain, Q Wave, St Elevation, St Depression, Tinversion, etc.

## 6. Preprocessing Plan
1. Ensure categorical targets (Cath, LAD, LCX, RCA) are encoded as binary (1: CAD/Stenotic, 0: Normal).
2. Apply One-Hot Encoding for string-based categorical inputs (`Sex`, `Obesity`, `Dyspnea`, etc.).
3. Apply Standard Scaling to continuous numeric inputs (`Age`, `BMI`, `BP`, `PR`, Labs).
4. Strictly exclude `Cath`, `LAD`, `LCX`, `RCA` from the features `X`.
5. Apply stratified train/test split.
