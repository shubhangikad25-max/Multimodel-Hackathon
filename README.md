# CardioVision AI — Multimodal Cardiovascular Risk Prediction & 3D Visualization Platform

> **Multimodal AI Hackathon 2026 — Track A: Cardiovascular Risk Visualization & Prediction**

CardioVision AI is a full-stack, multimodal medical AI application combining **stratified machine learning prediction models**, an **interactive Three.js 3D coronary artery tree**, **SHAP clinical explainability**, and a **secure backend-enforced Role-Based Access Control (RBAC)** architecture.

---

## 🌟 Key Features

1. **Multimodal Machine Learning Pipeline**:
   - 4 calibrated Random Forest classifiers predicting overall Coronary Artery Disease (**Cath**) and vessel-specific stenosis (**LAD**, **LCX**, **RCA**).
   - Zero Target Leakage: All target variables and downstream invasives were strictly excluded from predictor features.
   - Evaluated on a 20% stratified holdout set with full classification metrics (Accuracy, Precision, Recall, F1, ROC-AUC).

2. **Interactive 3D Anatomical Heart**:
   - Built with Three.js, React Three Fiber, and Drei.
   - Anatomically conformed Catmull-Rom tube geometries representing the coronary arterial tree along ventricular sulci:
     - **LAD (Left Anterior Descending)**: Courses down the anterior interventricular groove to the apex.
     - **LCX (Left Circumflex)**: Follows the left atrioventricular groove to nourish the posterolateral myocardium.
     - **RCA (Right Coronary Artery)**: Follows the right coronary sulcus to supply the right ventricle and inferior wall.
   - Dynamic probability heatmap mapping directly from model inference.

3. **SHAP Feature Importance & Clinical Explainability**:
   - Identifies patient-specific risk drivers (e.g., Typical Chest Pain, Age, Systolic BP, Regional Wall Motion Abnormalities, Fasting Blood Sugar, HDL).

4. **Secure Role-Based Access Control (RBAC)**:
   - Backend-enforced authorization with signed **JSON Web Tokens (JWT, HS256)** and **Bcrypt (12 rounds)** salted password hashing.
   - 4 distinct clinical roles with tailored workspaces:
     - **Doctor / Cardiologist**: Full clinical analysis, 3D arterial risk map, SHAP explanations, history archive, and lab review queue.
     - **Patient**: Strict cryptographic data isolation (only own record accessible), simplified risk explanation, educational 3D explorer, and printable medical report.
     - **Lab Technician**: 14-analyte laboratory measurement entry console with real-time biological reference range validation and clinical review queue.
     - **Administrator**: User & role management (create, update, deactivate), model health registry, and immutable security audit trail.

---

## 👥 Demo Clinical Accounts

For development and hackathon evaluation, 4 pre-seeded demo profiles with 1-click login buttons are provided:

| Role | Display Name | Email | Password |
|---|---|---|---|
| **Doctor / Cardiologist** | Dr. Sarah Chen, MD, FACC | `doctor@cardiovision.ai` | `DoctorPass2026!` |
| **Patient Portal** | Elena Rostova (Record #CV-8821) | `patient@cardiovision.ai` | `PatientPass2026!` |
| **Lab Technician** | Marcus Vance, MLS | `labtech@cardiovision.ai` | `LabTechPass2026!` |
| **Administrator** | Alex Mercer, CISSP | `admin@cardiovision.ai` | `AdminPass2026!` |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Three.js, React Three Fiber, Recharts, Lucide Icons.
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic, Scikit-learn, Pandas, NumPy, PyJWT, Bcrypt, Joblib.
- **Dataset**: Extension of Z-Alizadeh Sani clinical dataset (303 records, 59 multimodal features).

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/shubhangikad25-max/Multimodel-Hackathon.git
cd Multimodel-Hackathon
```

### 2. Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt
pip install pyjwt bcrypt

# Run the 14-step automated RBAC verification test suite
python test_auth_rbac.py

# Launch FastAPI backend server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API documentation available at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Open **`http://localhost:5173`** or **`http://localhost:5174`** in your browser.

---

## 🛡️ Security & Privacy Notice

**EDUCATIONAL AND DECISION-SUPPORT PROTOTYPE.**
Model-generated estimates and 3D arterial risk mappings are assistive tools and do not constitute a definitive medical diagnosis. This platform does not replace professional clinical judgment or indicated invasive coronary angiography.
