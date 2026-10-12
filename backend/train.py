import pandas as pd
import numpy as np
import json
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import warnings

warnings.filterwarnings("ignore")

DATA_PATH = r"c:\Users\Shubhangi Kad\Downloads\Multimodel-hackathon\dataset\extention of Z-Alizadeh sani dataset.xlsx"
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

TARGETS = {
    'Cath': {'positive': 'CAD', 'negative': 'Normal'},
    'LAD': {'positive': 'Stenotic', 'negative': 'Normal'},
    'LCX': {'positive': 'Stenotic', 'negative': 'Normal'},
    'RCA': {'positive': 'Stenotic', 'negative': 'Normal'}
}

def train_and_evaluate():
    print("Loading dataset...")
    df = pd.read_excel(DATA_PATH)
    
    # Exclude leakage columns from features
    leakage_cols = ['Cath', 'LAD', 'LCX', 'RCA']
    
    # Identify feature columns
    feature_cols = [c for c in df.columns if c not in leakage_cols]
    
    # Identify categorical and numerical columns
    categorical_features = []
    numeric_features = []
    
    for col in feature_cols:
        if df[col].dtype == 'object' or df[col].nunique() <= 10:
            # Treating features with few unique values (like 0/1 binary flags) as categorical
            categorical_features.append(col)
        else:
            numeric_features.append(col)
            
    print(f"Numeric features: {len(numeric_features)}")
    print(f"Categorical features: {len(categorical_features)}")
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ])
    
    metrics = {}
    
    for target, classes in TARGETS.items():
        print(f"\nTraining model for {target}...")
        
        # Prepare labels
        y = (df[target] == classes['positive']).astype(int)
        X = df[feature_cols]
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # Create pipeline
        # RandomForest is robust and provides good feature importance natively (useful before SHAP)
        model = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced'))
        ])
        
        # Train
        model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        try:
            auc = roc_auc_score(y_test, y_prob)
        except ValueError:
            auc = None
            
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        metrics[target] = {
            'Accuracy': round(acc, 4),
            'Precision': round(prec, 4),
            'Recall': round(rec, 4),
            'F1': round(f1, 4),
            'ROC-AUC': round(auc, 4) if auc is not None else None,
            'ConfusionMatrix': cm,
            'Classes': {'0': classes['negative'], '1': classes['positive']},
            'Support': int(len(y_test))
        }
        
        print(f"Metrics for {target}: Acc={acc:.4f}, AUC={auc:.4f}")
        
        # Save model
        model_path = os.path.join(MODELS_DIR, f"model_{target}.joblib")
        joblib.dump(model, model_path)
        print(f"Saved {model_path}")
        
    # Save schema and metrics
    schema = {
        'numeric': numeric_features,
        'categorical': categorical_features,
        'all_features': feature_cols
    }
    
    with open(os.path.join(MODELS_DIR, 'schema.json'), 'w') as f:
        json.dump(schema, f, indent=2)
        
    with open(os.path.join(MODELS_DIR, 'metrics.json'), 'w') as f:
        json.dump(metrics, f, indent=2)
        
    print("\nTraining completed.")

if __name__ == "__main__":
    train_and_evaluate()
