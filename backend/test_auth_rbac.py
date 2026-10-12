"""
Comprehensive Verification Test Suite for CardioVision AI
Role-Based Access Control (RBAC), Authentication & Patient Isolation
"""

import sys
import os
import json

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app, load_assets

# Load model assets before tests
load_assets()

client = TestClient(app)

def test_rbac_suite():
    print("=" * 70)
    print("CARDIOVISION AI - ROLE-BASED ACCESS CONTROL (RBAC) TEST SUITE")
    print("=" * 70)

    # 1. Health & Public Endpoints
    print("\n[TEST 1] Public Metadata & Health Check...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert res.json()["auth_system"] == "RBAC Enforced"
    print("  PASS: Health check accessible without authentication.")

    # 2. Authentication Failures
    print("\n[TEST 2] Authentication with Invalid Credentials...")
    res = client.post("/api/auth/login", json={"email": "wrong@test.com", "password": "BadPassword123!"})
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("  PASS: Invalid login rejected with HTTP 401 Unauthorized.")

    # 3. Successful Login for All 4 Roles
    print("\n[TEST 3] Authentication for All 4 Demo Clinical Roles...")
    credentials = {
        "doctor": ("doctor@cardiovision.ai", "DoctorPass2026!"),
        "patient": ("patient@cardiovision.ai", "PatientPass2026!"),
        "lab_tech": ("labtech@cardiovision.ai", "LabTechPass2026!"),
        "admin": ("admin@cardiovision.ai", "AdminPass2026!")
    }
    tokens = {}
    for role, (email, pwd) in credentials.items():
        res = client.post("/api/auth/login", json={"email": email, "password": pwd})
        assert res.status_code == 200, f"Failed to login as {role}: {res.text}"
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] == role
        tokens[role] = data["access_token"]
        print(f"  PASS: {role.upper()} authenticated successfully. Token issued for {data['user']['name']}.")

    # 4. Enforce Protection on Sensitive Prediction Endpoint (/api/predict)
    print("\n[TEST 4] Unauthenticated Access to /api/predict...")
    res = client.post("/api/predict", json={})
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("  PASS: Unauthenticated prediction attempt blocked (401).")

    print("\n[TEST 5] Patient Role Access to /api/predict (Should be FORBIDDEN)...")
    res = client.post(
        "/api/predict", 
        json={"Age": 55, "BP": 120},
        headers={"Authorization": f"Bearer {tokens['patient']}"}
    )
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    print(f"  PASS: Patient blocked with 403: {res.json()['detail']}")

    print("\n[TEST 6] Lab Tech Role Access to /api/predict (Should be FORBIDDEN)...")
    res = client.post(
        "/api/predict", 
        json={"Age": 55, "BP": 120},
        headers={"Authorization": f"Bearer {tokens['lab_tech']}"}
    )
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    print("  PASS: Lab Technician blocked with 403 Forbidden.")

    print("\n[TEST 7] Doctor Role Access to /api/predict (Authorized Clinician)...")
    sample_patient = {
        "Age": 58, "Weight": 72, "Length": 172, "Sex": "F", "BMI": 24.3, "Obesity": "N",
        "DM": 0, "HTN": 0, "Current Smoker": 0, "EX-Smoker": 0, "FH": 0, "CRF": "N", "CVA": "N",
        "Airway disease": "N", "Thyroid Disease": "N", "CHF": "N", "DLP": "N",
        "BP": 125, "PR": 72, "Edema": 0, "Weak Peripheral Pulse": "N", "Lung rales": "N",
        "Systolic Murmur": "N", "Diastolic Murmur": "N", "Typical Chest Pain": 0, "Dyspnea": "N",
        "Function Class": 0, "Atypical": "N", "Nonanginal": "N", "Exertional CP": "N", "LowTH Ang": "N",
        "Q Wave": 0, "St Elevation": 0, "St Depression": 0, "Tinversion": 0, "LVH": "N",
        "Poor R Progression": "N", "BBB": "N", "FBS": 94, "CR": 0.88, "TG": 140, "LDL": 102,
        "HDL": 56, "BUN": 15, "ESR": 10, "HB": 13.8, "K": 4.3, "Na": 140, "WBC": 6200,
        "Lymph": 31, "Neut": 59, "PLT": 255000, "EF-TTE": 55, "Region RWMA": 0, "VHD": "N"
    }
    res = client.post(
        "/api/predict", 
        json={"features": sample_patient, "patient_name": "Elena Rostova"},
        headers={"Authorization": f"Bearer {tokens['doctor']}"}
    )
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    pred_data = res.json()
    assert "Cath" in pred_data and "LAD" in pred_data and "LCX" in pred_data and "RCA" in pred_data
    print(f"  PASS: Doctor computed predictions successfully. Cath risk: {pred_data['Cath']['probability']*100:.1f}%.")

    # 5. Doctor SHAP Explanations
    print("\n[TEST 8] Doctor Access to /api/explain...")
    res = client.post(
        "/api/explain",
        json={"target": "Cath", "features": sample_patient},
        headers={"Authorization": f"Bearer {tokens['doctor']}"}
    )
    assert res.status_code == 200
    explain_data = res.json()
    assert "top_features" in explain_data
    print(f"  PASS: Doctor received clinical drivers: {len(explain_data['top_features'])} key features.")

    # 6. Patient Isolation Verification
    print("\n[TEST 9] Patient Record Access & Isolation...")
    # Patient gets their own record
    res = client.get(
        "/api/patient/my-record",
        headers={"Authorization": f"Bearer {tokens['patient']}"}
    )
    assert res.status_code == 200
    pat_rec = res.json()
    assert pat_rec["patient_id"] == "usr_pat_01"
    assert pat_rec["full_name"] == "Elena Rostova"
    print(f"  PASS: Patient successfully fetched own authorized record ({pat_rec['full_name']}).")

    # Patient tries to access another patient's record
    print("\n[TEST 10] Patient Cross-Record Unauthorized Access Attempt...")
    res = client.get(
        "/api/patient/records/usr_pat_02",
        headers={"Authorization": f"Bearer {tokens['patient']}"}
    )
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    print(f"  PASS: Backend blocked cross-patient access: {res.json()['detail']}")

    # 7. Lab Technician Submission
    print("\n[TEST 11] Lab Technician Submitting Lab Measurements...")
    lab_entry = {
        "patient_id": "usr_pat_01",
        "patient_name": "Elena Rostova",
        "measurements": {
            "FBS": 105.0,
            "CR": 0.92,
            "TG": 160.0,
            "LDL": 115.0,
            "HDL": 52.0,
            "BP": 122,
            "PR": 74
        },
        "notes": "Follow-up lab panel test."
    }
    res = client.post(
        "/api/lab/submit",
        json=lab_entry,
        headers={"Authorization": f"Bearer {tokens['lab_tech']}"}
    )
    assert res.status_code == 200
    lab_res = res.json()
    assert lab_res["status"] == "PENDING_REVIEW"
    sub_id = lab_res["id"]
    print(f"  PASS: Lab Technician submitted measurement #{sub_id} with status {lab_res['status']}.")

    # 8. Doctor Approves Lab Submission
    print("\n[TEST 12] Doctor Approving Lab Submission...")
    res = client.post(
        f"/api/lab/submissions/{sub_id}/approve",
        headers={"Authorization": f"Bearer {tokens['doctor']}"}
    )
    assert res.status_code == 200
    assert res.json()["submission"]["status"] == "APPROVED"
    print(f"  PASS: Doctor approved lab submission #{sub_id}.")

    # 9. Non-Admin Blocked from Administrative Endpoints
    print("\n[TEST 13] Non-Admin Access to /api/admin/users...")
    for unauthorized_role in ["patient", "doctor", "lab_tech"]:
        res = client.get(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {tokens[unauthorized_role]}"}
        )
        assert res.status_code == 403, f"Expected 403 for {unauthorized_role}, got {res.status_code}"
        print(f"  PASS: Role '{unauthorized_role}' blocked from /api/admin/users (403 Forbidden).")

    # 10. Administrator Full Operations
    print("\n[TEST 14] Administrator Operations (/api/admin/users, /api/admin/system-status, /api/admin/audit-logs)...")
    res = client.get(
        "/api/admin/users",
        headers={"Authorization": f"Bearer {tokens['admin']}"}
    )
    assert res.status_code == 200
    users_list = res.json()
    assert len(users_list) >= 4
    print(f"  PASS: Administrator retrieved user directory ({len(users_list)} registered clinical users).")

    res = client.get(
        "/api/admin/system-status",
        headers={"Authorization": f"Bearer {tokens['admin']}"}
    )
    assert res.status_code == 200
    sys_status = res.json()
    assert sys_status["models"]["status"] == "OPERATIONAL"
    print("  PASS: Administrator retrieved system status & model operational registry.")

    res = client.get(
        "/api/admin/audit-logs",
        headers={"Authorization": f"Bearer {tokens['admin']}"}
    )
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) > 0
    print(f"  PASS: Administrator retrieved security audit trail ({len(logs)} audit events).")

    print("\n" + "=" * 70)
    print("ALL 14 RBAC & SECURITY VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 70)

if __name__ == "__main__":
    test_rbac_suite()
