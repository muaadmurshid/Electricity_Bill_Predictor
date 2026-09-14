import json
import os

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBClassifier


BASE_DIR = os.path.dirname(__file__)

DATA_FILE = os.path.join(
    BASE_DIR,
    "data",
    "recommendation_training_data.csv"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "models"
)

MODEL_FILE = os.path.join(
    MODEL_DIR,
    "recommendation_model.joblib"
)

LABEL_FILE = os.path.join(
    MODEL_DIR,
    "recommendation_labels.json"
)

FEATURE_COLUMNS = [
    "month",
    "monthlyConsumptionKwh",
    "predictedConsumptionKwh",
    "predictedBillAmount",
    "highestApplianceConsumptionKwh",
    "highestCategoryConsumptionKwh",
    "highestConsumingCategory",
]

TARGET_COLUMN = "recommendationClass"

NUMERIC_COLUMNS = [
    "month",
    "monthlyConsumptionKwh",
    "predictedConsumptionKwh",
    "predictedBillAmount",
    "highestApplianceConsumptionKwh",
    "highestCategoryConsumptionKwh",
]

CATEGORICAL_COLUMNS = [
    "highestConsumingCategory",
]


def load_dataset():
    dataframe = pd.read_csv(
        DATA_FILE
    )

    missing_columns = [
        column
        for column in FEATURE_COLUMNS + [TARGET_COLUMN]
        if column not in dataframe.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    return dataframe


def prepare_labels(dataframe):
    labels = sorted(
        dataframe[
            TARGET_COLUMN
        ].unique()
    )

    label_to_id = {
        label: index
        for index, label in enumerate(labels)
    }

    id_to_label = {
        index: label
        for label, index in label_to_id.items()
    }

    y = dataframe[
        TARGET_COLUMN
    ].map(
        label_to_id
    )

    return (
        y,
        label_to_id,
        id_to_label,
    )


def build_pipeline():
    preprocessing = ColumnTransformer(
        transformers=[
            (
                "numeric",
                "passthrough",
                NUMERIC_COLUMNS,
            ),
            (
                "category",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                CATEGORICAL_COLUMNS,
            ),
        ]
    )

    classifier = XGBClassifier(
        objective="multi:softprob",
        eval_metric="mlogloss",
        n_estimators=250,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline(
        steps=[
            (
                "preprocessing",
                preprocessing,
            ),
            (
                "classifier",
                classifier,
            ),
        ]
    )

    return pipeline


def main():
    dataframe = load_dataset()

    X = dataframe[
        FEATURE_COLUMNS
    ].copy()

    (
        y,
        label_to_id,
        id_to_label,
    ) = prepare_labels(
        dataframe
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    pipeline = build_pipeline()

    pipeline.fit(
        X_train,
        y_train
    )

    predictions = pipeline.predict(
        X_test
    )

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    print()
    print(
        "Recommendation model training completed."
    )
    print()

    print(
        f"Training rows: {len(X_train)}"
    )

    print(
        f"Testing rows: {len(X_test)}"
    )

    print()

    print(
        f"Accuracy: {accuracy:.4f}"
    )

    print()

    target_names = [
        id_to_label[index]
        for index in sorted(
            id_to_label.keys()
        )
    ]

    print(
        "Classification Report:"
    )

    print(
        classification_report(
            y_test,
            predictions,
            target_names=target_names,
            digits=4,
            zero_division=0,
        )
    )

    print(
        "Confusion Matrix:"
    )

    print(
        confusion_matrix(
            y_test,
            predictions
        )
    )

    os.makedirs(
        MODEL_DIR,
        exist_ok=True
    )

    joblib.dump(
        pipeline,
        MODEL_FILE
    )

    label_data = {
        "label_to_id":
            label_to_id,
        "id_to_label": {
            str(key): value
            for key, value in id_to_label.items()
        },
        "features":
            FEATURE_COLUMNS,
        "accuracy":
            round(
                float(accuracy),
                6
            ),
    }

    with open(
        LABEL_FILE,
        "w",
        encoding="utf-8"
    ) as file:
        json.dump(
            label_data,
            file,
            indent=2
        )

    print()

    print(
        f"Model saved to: {MODEL_FILE}"
    )

    print(
        f"Labels saved to: {LABEL_FILE}"
    )


if __name__ == "__main__":
    main()