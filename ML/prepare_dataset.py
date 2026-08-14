import pandas as pd
from pathlib import Path


DATA_FILE = Path("data/electricity_training_data.csv")


def load_dataset():
    if not DATA_FILE.exists():
        print("Dataset file not found.")
        return None

    df = pd.read_csv(DATA_FILE)

    print("Dataset loaded successfully.")
    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")

    return df


def validate_dataset(df):
    required_columns = [
        "household_id",
        "year",
        "month",
        "number_of_residents",
        "appliance_count",
        "total_rated_power_w",
        "previous_month_kwh",
        "previous_2_month_kwh",
        "previous_3_month_kwh",
        "average_last_3_months_kwh",
        "target_next_month_kwh"
    ]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        print("Missing required columns:")
        print(missing_columns)
        return False

    print("All required columns are present.")
    return True


def main():
    df = load_dataset()

    if df is None:
        return

    if not validate_dataset(df):
        return

    if df.empty:
        print(
            "Dataset currently contains only the header. "
            "Training data will be added in the next step."
        )
        return

    print("\nFirst 5 rows:")
    print(df.head())


if __name__ == "__main__":
    main()