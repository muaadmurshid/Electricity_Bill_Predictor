from pathlib import Path

import joblib
import pandas as pd


MODEL_FILE = Path("model/xgboost_energy_model.pkl")


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


def main():

    model = joblib.load(MODEL_FILE)

    print("Model loaded successfully.")

    input_data = {
        "year": 2026,
        "month": 8,
        "number_of_residents": 4,
        "appliance_count": 12,
        "total_rated_power_w": 8500,
        "previous_month_kwh": 160.0,
        "previous_2_month_kwh": 155.0,
        "previous_3_month_kwh": 150.0,
        "average_last_3_months_kwh": 155.0
    }

    input_df = pd.DataFrame(
        [input_data],
        columns=FEATURE_COLUMNS
    )

    prediction = model.predict(input_df)

    predicted_kwh = float(prediction[0])

    print()
    print("Prediction Result")
    print("-----------------")
    print(
        f"Predicted next month consumption: "
        f"{predicted_kwh:.2f} kWh"
    )


if __name__ == "__main__":
    main()