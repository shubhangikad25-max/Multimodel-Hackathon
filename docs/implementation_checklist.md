# Cardiovision AI - Implementation Checklist

## Phase 1: Inspect Before Building
- [x] Inspect workspace and locate dataset (`extention of Z-Alizadeh sani dataset.xlsx`)
- [x] Analyze dataset (shape, columns, targets, missing values, duplicates)
- [x] Create `docs/dataset_analysis.md`
- [x] Create `docs/implementation_checklist.md`

## Phase 2: Project Technology Setup
- [ ] Initialize React + TypeScript + Vite frontend
- [ ] Install frontend dependencies (Tailwind CSS, shadcn/ui, Lucide, Recharts, Three.js, React Three Fiber)
- [ ] Initialize Python FastAPI backend
- [ ] Install backend dependencies (pandas, scikit-learn, xgboost, shap, fastapi)

## Phase 3: Train Real Machine Learning Models
- [ ] Create ML training pipeline (`train.py`)
- [ ] Preprocess data: encode categorical, scale numeric, split train/test
- [ ] Train 4 classifiers (Overall CAD, LAD, LCX, RCA) avoiding leakage
- [ ] Evaluate models (Accuracy, Precision, Recall, F1, ROC-AUC)
- [ ] Save trained models and preprocessors (`.joblib`)
- [ ] Save evaluation metrics to JSON for the dashboard

## Phase 4: Build The Complete Web Application
- [ ] Set up React app routing and layout
- [ ] Create UI shell (Navbar, Sidebar, Footer)
- [ ] Implement premium styling (dark/light mode, gradients, animations)
- [ ] Build 6 main views (Dashboard, Analysis, 3D Heart, Explainability, Performance, Docs)

## Phase 5: Dynamic Patient Input Form
- [ ] Create a form based on the actual 55 input features
- [ ] Add category groupings (Demographics, Labs, ECG, etc.)
- [ ] Implement form validation
- [ ] Add "Load Demo Patient" functionality
- [ ] Connect form to backend inference API

## Phase 6: FastAPI Prediction Backend
- [ ] Build `/api/health` endpoint
- [ ] Build `/api/predict` endpoint mapping form data to models
- [ ] Build `/api/explain` endpoint using SHAP
- [ ] Build endpoints for model metrics and metadata

## Phase 7: Interactive 3D Heart & Coronary Arteries
- [ ] Integrate React Three Fiber canvas
- [ ] Add 3D anatomical heart model (or detailed fallback geometry)
- [ ] Map prediction probabilities to vessel colors (Green/Amber/Red)
- [ ] Implement interactivity (rotate, zoom, select vessel)
- [ ] Display vessel-specific tooltips/cards with predictions

## Phase 8: Clinical Dashboard & Model Explanations
- [ ] Build Dashboard view to aggregate overall and vessel predictions
- [ ] Implement SHAP visualizations (Global importance, individual force plots)
- [ ] Ensure correct matching of explanation to selected vessel

## Phase 9: Model Performance Dashboard
- [ ] Build Performance view showing saved evaluation metrics
- [ ] Display Confusion Matrices and ROC curves

## Phase 10: Safety & Privacy
- [ ] Add prominent educational/decision-support disclaimer
- [ ] Ensure synthetic/demo data is clearly marked

## Phase 11: Testing & Documentation
- [ ] Write detailed `README.md` with setup instructions
- [ ] Add `.env.example`
- [ ] Write hackathon report outline

## Phase 12: Execution & Validation
- [ ] Run end-to-end inference
- [ ] Verify 3D updates correctly
- [ ] Fix any remaining integration bugs
