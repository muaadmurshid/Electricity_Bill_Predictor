import random
from pathlib import Path

import pandas as pd


OUTPUT_FILE = Path("data/electricity_training_data.csv")

random.seed(42)

rows = []

household_count = 40
months_per_household = 18

for household_id in range(1, household_count + 1):

    number_of_residents = random.randint(1, 6)
    appliance_count = random.randint(5, 20)

    total_rated_power_w = random.randint(
        3000,
        15000
    )

    # Starting monthly consumption
    consumption_history = [
        random.uniform(60, 300),
        random.uniform(60, 300),
        random.uniform(60, 300)
    ]

    for month_index in range(months_per_household):

        previous_3_month_kwh = consumption_history[-3]
        previous_2_month_kwh = consumption_history[-2]
        previous_month_kwh = consumption_history[-1]

        average_last_3_months_kwh = (
            previous_month_kwh
            + previous_2_month_kwh
            + previous_3_month_kwh
        ) / 3

        # Create a realistic trend for prototype purposes
        resident_effect = number_of_residents * 4
        appliance_effect = appliance_count * 1.5

        trend = (
            average_last_3_months_kwh * 0.75
            + resident_effect
            + appliance_effect
        )

        noise = random.uniform(-15, 15)

        target_next_month_kwh = max(
            20,
            trend + noise
        )

        year = 2025 + (
            month_index // 12
        )

        month = (
            month_index % 12
        ) + 1

        rows.append({
            "household_id": household_id,
            "year": year,
            "month": month,
            "number_of_residents": number_of_residents,
            "appliance_count": appliance_count,
            "total_rated_power_w": total_rated_power_w,
            "previous_month_kwh": round(
                previous_month_kwh,
                3
            ),
            "previous_2_month_kwh": round(
                previous_2_month_kwh,
                3
            ),
            "previous_3_month_kwh": round(
                previous_3_month_kwh,
                3
            ),
            "average_last_3_months_kwh": round(
                average_last_3_months_kwh,
                3
            ),
            "target_next_month_kwh": round(
                target_next_month_kwh,
                3
            )
        })

        consumption_history.append(
            target_next_month_kwh
        )


df = pd.DataFrame(rows)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("Training dataset generated successfully.")
print(f"Rows created: {len(df)}")
print(f"Columns: {len(df.columns)}")

print("\nFirst 5 rows:")
print(df.head())