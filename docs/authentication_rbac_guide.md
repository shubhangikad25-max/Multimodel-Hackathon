# CardioVision AI — Role-Based Access Control (RBAC) & Security Architecture

## 1. Executive Summary

This document details the secure, professional Role-Based Access Control (RBAC) authentication subsystem implemented in **CardioVision AI**. The system integrates **cryptographic authentication**, **backend-enforced permission barriers**, and **patient data isolation** while strictly preserving the existing **Random Forest prediction pipeline** (`backend/models/`) and **interactive Three.js 3D anatomical heart viewer** (`HeartModel.tsx`).

---

## 2. Four Clinical Roles & Permissions Matrix

| Capability / API Route | Doctor / Cardiologist | Patient | Lab Technician | Administrator |
|---|:---:|:---:|:---:|:---:|
| **Public Metadata** (`/api/health`, `/api/features/schema`) | ✅ | ✅ | ✅ | ✅ |
| **Model Predictions & Probabilities** (`/api/predict`) | ✅ (Full CAD & Vessels) | ❌ (Blocked 403) | ❌ (Blocked 403) | ✅ (Evaluation) |
| **SHAP Clinical Feature Drivers** (`/api/explain`) | ✅ | ❌ (Blocked 403) | ❌ (Blocked 403) | ✅ |
| **Interactive 3D Heart Viewer** | ✅ (Clinical Risk Sulci) | ✅ (Educational Callouts) | ❌ (Intake view) | ✅ (Monitoring) |
| **Patient Record Inspection** (`/api/patient/*`) | ✅ (All in scope) | ✅ **Own Record Only** | ❌ (Blocked 403) | ✅ (Governance) |
| **Laboratory Measurement Entry** (`/api/lab/submit`) | ✅ | ❌ (Blocked 403) | ✅ (Intake Queue) | ✅ |
| **Approve Laboratory Findings** (`/api/lab/submissions/*/approve`) | ✅ | ❌ (Blocked 403) | ❌ (Blocked 403) | ✅ |
| **User Directory & Roles** (`/api/admin/users`) | ❌ (Blocked 403) | ❌ (Blocked 403) | ❌ (Blocked 403) | ✅ (Create/Update/Deactivate) |
| **Security Audit Trail** (`/api/admin/audit-logs`) | ❌ (Blocked 403) | ❌ (Blocked 403) | ❌ (Blocked 403) | ✅ (Full Immutable Log) |

---

## 3. Security Implementation Details

### A. Cryptographic Password Hashing
- Utilizes industry-standard **Bcrypt (12 rounds)** via the native `bcrypt` library.
- No plaintext passwords or sensitive secrets are stored in code, databases, or frontend `localStorage`.

### B. Validated JWT Token Authentication
- Generates standard **RFC 7519 JSON Web Tokens** (`HS256`) containing claims:
  - `sub`: User ID (e.g., `usr_doc_01`)
  - `role`: Role identifier (`doctor`, `patient`, `lab_tech`, `admin`)
  - `name`: User display name
  - `iat`: Timestamp issued
  - `exp`: 12-hour expiration window
- Verified via FastAPI `HTTPBearer` dependency on every protected endpoint.
- Revocation and logout clear client session storage and record `LOGOUT` audit events.

### C. Backend-Enforced Patient Data Isolation
- Cross-patient records access is strictly rejected:
  ```python
  if current_user["role"] == ROLE_PATIENT:
      if current_user["id"] != patient_id:
          raise HTTPException(status_code=403, detail="Security Violation: Patients are strictly restricted to their own authorized medical records.")
  ```
- Any unauthorized inspection attempt triggers an immediate `403 Forbidden` response and writes to the security audit trail.

---

## 4. Development Demo Accounts

For hackathon evaluation and development testing, the system provides 4 pre-seeded demo accounts with 1-click login buttons on the login page:

1. **Doctor / Cardiologist:**
   - **Email:** `doctor@cardiovision.ai`
   - **Password:** `DoctorPass2026!`
   - **Identity:** Dr. Sarah Chen, MD, FACC (Lead Cardiologist & Electrophysiologist)

2. **Patient:**
   - **Email:** `patient@cardiovision.ai`
   - **Password:** `PatientPass2026!`
   - **Identity:** Elena Rostova (Patient #CV-8821, Outpatient Cardiac Monitoring)

3. **Lab Technician / Medical Staff:**
   - **Email:** `labtech@cardiovision.ai`
   - **Password:** `LabTechPass2026!`
   - **Identity:** Marcus Vance, MLS (Senior Clinical Laboratory Technologist)

4. **Administrator:**
   - **Email:** `admin@cardiovision.ai`
   - **Password:** `AdminPass2026!`
   - **Identity:** Alex Mercer, CISSP (Healthcare Systems & Security Administrator)

---

## 5. Windows Setup & Execution Instructions

### A. Backend Server
In Windows PowerShell:
```powershell
# Navigate to backend directory
cd "c:\Users\Shubhangi Kad\Downloads\Multimodel-hackathon\backend"

# Ensure dependencies are installed
pip install -r requirements.txt
pip install pyjwt bcrypt

# Run the automated RBAC and permissions test suite (all 14 tests)
python test_auth_rbac.py

# Launch the FastAPI backend server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### B. Frontend Application
In a separate Windows PowerShell window:
```powershell
# Navigate to frontend directory
cd "c:\Users\Shubhangi Kad\Downloads\Multimodel-hackathon\frontend"

# Build production bundle / type check
npm run build

# Start the Vite development server
npm run dev
```
Open **`http://localhost:5173`** or **`http://localhost:5174`** in your browser.

---

## 6. Automated Verification Test Suite

The test suite (`backend/test_auth_rbac.py`) tests and validates the entire permission matrix:
1. `[TEST 1]` Public metadata & health check (200 OK without token).
2. `[TEST 2]` Rejection of invalid credentials (401 Unauthorized).
3. `[TEST 3]` Successful login and JWT issuance for all 4 roles.
4. `[TEST 4]` Unauthenticated access to `/api/predict` (401 Unauthorized).
5. `[TEST 5]` Patient role attempting `/api/predict` (403 Forbidden).
6. `[TEST 6]` Lab technician attempting `/api/predict` (403 Forbidden).
7. `[TEST 7]` Doctor role executing `/api/predict` (200 OK with CAD, LAD, LCX, RCA probabilities).
8. `[TEST 8]` Doctor role fetching SHAP clinical drivers (`/api/explain`).
9. `[TEST 9]` Patient fetching own medical record (`/api/patient/my-record` - 200 OK).
10. `[TEST 10]` Patient attempting cross-record access (`/api/patient/records/usr_pat_02` - 403 Forbidden).
11. `[TEST 11]` Lab technician submitting measurements with range flags (`/api/lab/submit` - 200 OK).
12. `[TEST 12]` Doctor reviewing and approving queued lab findings (`/api/lab/submissions/{id}/approve` - 200 OK).
13. `[TEST 13]` Non-admin accounts attempting admin operations (`/api/admin/users` - 403 Forbidden).
14. `[TEST 14]` Administrator full operations (user directory, model health registry, and security audit log - 200 OK).
