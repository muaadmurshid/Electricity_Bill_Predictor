import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor


DATA_FILE = Path("data/electricity_training_data.csv")
MODEL_FILE = Path("model/xgboost_energy_model.pkl")
METRICS_FILE = Path("model/model_metrics.json")


FEATURE_COLUMNS = [
    "year",
    "month",
    "number_of_residents",
    "appliance_count",
    "total_rated_power_w",
    "previous_month_kwh",
    "previous_2_month_kwh",
    "previous_3_month_kwh",
    "average_last_3_months_kwh"
]

TARGET_COLUMN = "target_next_month_kwh"


def main():

    # Load dataset
    df = pd.read_csv(DATA_FILE)

    print("Dataset loaded.")
    print(f"Rows: {len(df)}")

    # Prepare features and target
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    # Split training and testing data
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42
    )

    print(f"Training rows: {len(X_train)}")
    print(f"Testing rows: {len(X_test)}")

    # Create XGBoost regression model
    model = XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=4,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=42
    )

    # Train model
    print("\nTraining XGBoost model...")

    model.fit(
        X_train,
        y_train
    )

    print("Training completed.")

    # Make predictions
    predictions = model.predict(X_test)

    # Evaluate model
    mae = mean_absolute_error(
        y_test,
        predictions
    )

    mse = mean_squared_error(
        y_test,
        predictions
    )

    rmse = mse ** 0.5

    r2 = r2_score(
        y_test,
        predictions
    )

    print("\nModel Evaluation")
    print("----------------")
    print(f"MAE:  {mae:.3f} kWh")
    print(f"RMSE: {rmse:.3f} kWh")
    print(f"R²:   {r2:.3f}")

    # Save trained model
    MODEL_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    joblib.dump(
        model,
        MODEL_FILE
    )

    # Save model metrics
    metrics = {
        "mae": round(float(mae), 3),
        "rmse": round(float(rmse), 3),
        "r2": round(float(r2), 3),
        "training_rows": len(X_train),
        "testing_rows": len(X_test)
    }

    with open(
        METRICS_FILE,
        "w"
    ) as file:

        json.dump(
            metrics,
            file,
            indent=4
        )

    print(
        f"\nModel saved to: {MODEL_FILE}"
    )

    print(
        f"Metrics saved to: {METRICS_FILE}"
    )


if __name__ == "__main__":
    main()