"""
Authentication & Role-Based Access Control (RBAC) Module for CardioVision AI
Enforces secure backend authorization, JWT issuance, password hashing (bcrypt),
and patient data isolation.
"""

import os
import time
import uuid
import datetime
from typing import Optional, List, Dict, Any
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

# Security Configuration
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "cardiovision_super_secure_hackathon_jwt_secret_2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 12

security_bearer = HTTPBearer(auto_error=False)

# User Roles
ROLE_DOCTOR = "doctor"
ROLE_PATIENT = "patient"
ROLE_LAB_TECH = "lab_tech"
ROLE_ADMIN = "admin"

ALL_ROLES = [ROLE_DOCTOR, ROLE_PATIENT, ROLE_LAB_TECH, ROLE_ADMIN]

# Helper for password hashing
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

# Token helpers
def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.timezone.utc) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire, "iat": datetime.datetime.now(datetime.timezone.utc)})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

# In-memory User Store pre-seeded with demo accounts
# Demo passwords are secure and bcrypt-hashed
USERS_DB: Dict[str, Dict[str, Any]] = {
    "usr_doc_01": {
        "id": "usr_doc_01",
        "email": "doctor@cardiovision.ai",
        "hashed_password": hash_password("DoctorPass2026!"),
        "name": "Dr. Sarah Chen, MD",
        "title": "Lead Cardiologist & Electrophysiologist",
        "department": "Interventional Cardiology",
        "role": ROLE_DOCTOR,
        "is_active": True,
        "created_at": "2026-01-15T08:00:00Z",
        "last_login": None
    },
    "usr_pat_01": {
        "id": "usr_pat_01",
        "email": "patient@cardiovision.ai",
        "hashed_password": hash_password("PatientPass2026!"),
        "name": "Elena Rostova",
        "title": "Patient Record #CV-8821",
        "department": "Outpatient Cardiac Monitoring",
        "role": ROLE_PATIENT,
        "is_active": True,
        "created_at": "2026-02-10T11:30:00Z",
        "last_login": None
    },
    "usr_lab_01": {
        "id": "usr_lab_01",
        "email": "labtech@cardiovision.ai",
        "hashed_password": hash_password("LabTechPass2026!"),
        "name": "Marcus Vance, MLS",
        "title": "Senior Clinical Laboratory Technologist",
        "department": "Cardiovascular Biomarker Lab",
        "role": ROLE_LAB_TECH,
        "is_active": True,
        "created_at": "2026-01-20T09:15:00Z",
        "last_login": None
    },
    "usr_adm_01": {
        "id": "usr_adm_01",
        "email": "admin@cardiovision.ai",
        "hashed_password": hash_password("AdminPass2026!"),
        "name": "Alex Mercer, CISSP",
        "title": "Healthcare Systems & Security Administrator",
        "department": "Medical Informatics & Governance",
        "role": ROLE_ADMIN,
        "is_active": True,
        "created_at": "2026-01-01T00:00:00Z",
        "last_login": None
    }
}

# Audit Logs
AUDIT_LOGS: List[Dict[str, Any]] = [
    {
        "id": "log_init_01",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "user_email": "system@cardiovision.ai",
        "role": "system",
        "action": "SYSTEM_STARTUP",
        "detail": "RBAC Security Subsystem initialized. 4 distinct clinical roles active.",
        "status": "SUCCESS"
    }
]

def log_audit_event(user_email: str, role: str, action: str, detail: str, status: str = "SUCCESS"):
    AUDIT_LOGS.insert(0, {
        "id": f"log_{uuid.uuid4().hex[:8]}",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "user_email": user_email,
        "role": role,
        "action": action,
        "detail": detail,
        "status": status
    })
    # Keep last 200 logs
    if len(AUDIT_LOGS) > 200:
        AUDIT_LOGS.pop()

# Lab Submissions Store
LAB_SUBMISSIONS: List[Dict[str, Any]] = [
    {
        "id": "LAB-2026-0101",
        "patient_id": "usr_pat_01",
        "patient_name": "Elena Rostova",
        "submitted_by": "Marcus Vance, MLS",
        "submitted_at": "2026-10-10T09:45:00Z",
        "status": "APPROVED",
        "reviewed_by": "Dr. Sarah Chen, MD",
        "measurements": {
            "FBS": 98.0,
            "CR": 0.85,
            "TG": 145.0,
            "LDL": 105.0,
            "HDL": 58.0,
            "BUN": 14.0,
            "ESR": 8.0,
            "HB": 13.8,
            "K": 4.2,
            "Na": 141.0,
            "WBC": 6400,
            "Lymph": 32,
            "Neut": 58,
            "PLT": 260000,
            "BP": 118,
            "PR": 72
        },
        "flags": ["All parameters within reference limits"],
        "notes": "Routine biannual lipid panel and electrolytes. Stable baseline."
    },
    {
        "id": "LAB-2026-0102",
        "patient_id": "usr_pat_02",
        "patient_name": "Arthur Pendelton (ID #CV-9042)",
        "submitted_by": "Marcus Vance, MLS",
        "submitted_at": "2026-10-12T08:15:00Z",
        "status": "PENDING_REVIEW",
        "reviewed_by": None,
        "measurements": {
            "FBS": 138.0,
            "CR": 1.25,
            "TG": 235.0,
            "LDL": 168.0,
            "HDL": 34.0,
            "BUN": 22.0,
            "ESR": 24.0,
            "HB": 14.2,
            "K": 4.7,
            "Na": 139.0,
            "WBC": 9200,
            "Lymph": 24,
            "Neut": 68,
            "PLT": 285000,
            "BP": 146,
            "PR": 84
        },
        "flags": [
            "ELEVATED: Fasting Blood Sugar (138 mg/dL)",
            "HIGH: Serum Triglycerides (235 mg/dL)",
            "HIGH: LDL Cholesterol (168 mg/dL)",
            "LOW: HDL Cholesterol (34 mg/dL)",
            "HYPERTENSIVE: Systolic BP 146 mmHg"
        ],
        "notes": "Fasting confirmed 12 hours. Severe dyslipidemia and hyperglycemia flagged for urgent cardiology assessment."
    }
]

# Patient Medical Records Store (Patient isolation demo)
PATIENT_RECORDS: Dict[str, Dict[str, Any]] = {
    "usr_pat_01": {
        "patient_id": "usr_pat_01",
        "full_name": "Elena Rostova",
        "dob": "1971-04-18",
        "age": 55,
        "sex": "Female",
        "mrn": "CV-8821",
        "attending_physician": "Dr. Sarah Chen, MD, FACC",
        "latest_evaluation_date": "2026-10-10",
        "overall_risk_category": "LOW_RISK",
        "overall_probability": 0.18,
        "vessel_status": {
            "LAD": {"risk": "Low Likelihood", "probability": 0.14, "status": "Patent"},
            "LCX": {"risk": "Low Likelihood", "probability": 0.11, "status": "Patent"},
            "RCA": {"risk": "Low Likelihood", "probability": 0.16, "status": "Patent"}
        },
        "simplified_summary": "Your multimodal cardiovascular screening shows normal arterial blood flow with low statistical risk of coronary stenosis. Biomarkers are within recommended targets.",
        "key_vitals": {
            "blood_pressure": "118/76 mmHg",
            "heart_rate": "72 bpm",
            "bmi": "24.2 kg/m²",
            "total_cholesterol": "182 mg/dL",
            "ldl": "105 mg/dL",
            "hdl": "58 mg/dL",
            "fbs": "98 mg/dL"
        },
        "lifestyle_recommendations": [
            "Maintain current aerobic exercise regimen (150 min/week moderate activity).",
            "Continue Mediterranean-pattern diet rich in dietary fiber and omega-3 fatty acids.",
            "Next scheduled preventive lipid panel in 6 months."
        ],
        "history": [
            {
                "date": "2026-10-10",
                "event": "Comprehensive Multimodal Evaluation",
                "finding": "Cath Risk: 18% (Normal). No significant stenoses detected."
            },
            {
                "date": "2026-04-12",
                "event": "Routine Cardiology Consultation",
                "finding": "Normal resting ECG. Baseline echocardiogram EF 60%."
            }
        ]
    }
}

# Pydantic Schemas for Auth
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class CreateUserRequest(BaseModel):
    email: str
    password: str
    name: str
    title: str
    role: str
    department: Optional[str] = "Cardiovascular Center"

class UpdateRoleRequest(BaseModel):
    role: str
    is_active: Optional[bool] = None

class LabMeasurementSubmission(BaseModel):
    patient_id: str
    patient_name: str
    measurements: Dict[str, Any]
    notes: Optional[str] = ""

# Authentication Dependency
def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header. Bearer token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id or user_id not in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User identity associated with token not found or revoked.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = USERS_DB[user_id]
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated by an administrator.",
        )
    
    return user

def require_role(allowed_roles: List[str]):
    """
    Factory dependency for role-based access control.
    Enforces authorization strictly at the backend level.
    """
    def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            log_audit_event(
                user_email=current_user.get("email", "unknown"),
                role=user_role,
                action="PERMISSION_DENIED",
                detail=f"Access denied to resource requiring roles {allowed_roles}. User has role '{user_role}'.",
                status="FORBIDDEN"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User role '{user_role}' is not authorized for this operation. Required: {allowed_roles}."
            )
        return current_user
    return role_checker

def verify_patient_ownership(patient_id: str, current_user: Dict[str, Any]):
    """
    Backend-enforced Patient Data Isolation:
    - If user is a Patient, they can ONLY access their own record.
    - Clinicians (doctor/admin) can view any patient record in their scope.
    """
    role = current_user.get("role")
    if role == ROLE_PATIENT:
        if current_user.get("id") != patient_id:
            log_audit_event(
                user_email=current_user.get("email", "unknown"),
                role=role,
                action="CROSS_PATIENT_ACCESS_BLOCKED",
                detail=f"Patient attempted unauthorized access to record of patient '{patient_id}'.",
                status="FORBIDDEN"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Security Violation: Patients are strictly restricted to their own authorized medical records."
            )
