import os
import random

import numpy as np
import pandas as pd


SEED = 42
ROWS_PER_CLASS = 700

random.seed(SEED)
np.random.seed(SEED)

OUTPUT_DIR = os.path.join(
    os.path.dirname(__file__),
    "data"
)

OUTPUT_FILE = os.path.join(
    OUTPUT_DIR,
    "recommendation_training_data.csv"
)

LABELS = [
    "REDUCE_COOLING_USAGE",
    "REDUCE_LIGHTING_USAGE",
    "OPTIMIZE_REFRIGERATION",
    "REDUCE_HEATING_USAGE",
    "REDUCE_HIGH_USAGE_APPLIANCE",
    "HIGH_BILL_WARNING",
    "GENERAL_ENERGY_SAVING",
]


def random_value(minimum, maximum, decimals=2):
    return round(
        random.uniform(
            minimum,
            maximum
        ),
        decimals
    )


def clamp(value, minimum=0):
    return max(
        minimum,
        value
    )


def create_cooling_row():
    monthly = random_value(180, 550)
    predicted = monthly * random.uniform(1.00, 1.30)

    category_usage = random_value(
        monthly * 0.30,
        monthly * 0.60
    )

    appliance_usage = random_value(
        category_usage * 0.40,
        category_usage * 0.85
    )

    bill = random_value(7000, 28000)

    return {
        "month": random.randint(1, 12),
        "monthlyConsumptionKwh": round(monthly, 2),
        "predictedConsumptionKwh": round(predicted, 2),
        "predictedBillAmount": bill,
        "highestApplianceConsumptionKwh": round(appliance_usage, 2),
        "highestCategoryConsumptionKwh": round(category_usage, 2),
        "highestConsumingCategory": random.choice([
            "Cooling",
            "Cooling",
            "Cooling",
            "Air Conditioning"
        ]),
        "recommendationClass": "REDUCE_COOLING_USAGE",
    }


def create_lighting_row():
    monthly = random_value(90, 320)
    predicted = monthly * random.uniform(0.95, 1.20)

    category_usage = random_value(
        monthly * 0.20,
        monthly * 0.45
    )

    appliance_usage = random_value(
        category_usage * 0.20,
        category_usage * 0.60
    )

    bill = random_value(3500, 16000)

    return {
        "month": random.randint(1, 12),
        "monthlyConsumptionKwh": round(monthly, 2),
        "predictedConsumptionKwh": round(predicted, 2),
        "predictedBillAmount": bill,
        "highestApplianceConsumptionKwh": round(appliance_usage, 2),
        "highestCategoryConsumptionKwh": round(category_usage, 2),
        "highestConsumingCategory": "Lighting",
        "recommendationClass": "REDUCE_LIGHTING_USAGE",
    }


def create_refrigeration_row():
    monthly = random_value(110, 380)
    predicted = monthly * random.uniform(0.95, 1.20)

    category_usage = random_value(
        monthly * 0.25,
        monthly * 0.50
    )

    appliance_usage = random_value(
        category_usage * 0.55,
        category_usage * 0.95
    )

    bill = random_value(4000, 19000)

    return {
        "month": random.randint(1, 12),
        "monthlyConsumptionKwh": round(monthly, 2),
        "predictedConsumptionKwh": round(predicted, 2),
        "predictedBillAmount": bill,
        "highestApplianceConsumptionKwh": round(appliance_usage, 2),
        "highestCategoryConsumptionKwh": round(category_usage, 2),
        "highestConsumingCategory": random.choice([
            "Refrigeration",
            "Refrigeration",
            "Kitchen"
        ]),
        "recommendationClass": "OPTIMIZE_REFRIGERATION",
    }


def create_heating_row():
    monthly = random_value(140, 480)
    predicted = monthly * random.uniform(1.00, 1.28)

    category_usage = random_value(
        monthly * 0.25,
        monthly * 0.55
    )

    appliance_usage = random_value(
        category_usage * 0.45,
        category_usage * 0.90
    )

    bill = random_value(5500, 24000)

    return {
        "month": random.randint(1, 12),
        "monthlyConsumptionKwh": round(monthly, 2),
        "predictedConsumptionKwh": round(predicted, 2),
        "predictedBillAmount": bill,
        "highestApplianceConsumptionKwh": round(appliance_usage, 2),
        "highestCategoryConsumptionKwh": round(category_usage, 2),
        "highestConsumingCategory": random.choice([
            "Heating",
            "Heating",
            "Water Heating"
        ]),
        "recommendationClass": "REDUCE_HEATING_USAGE",
    }


def create_high_appliance_row():
    monthly = random_value(160, 520)
    predicted = monthly * random.uniform(0.98, 1.25)

    category_usage = random_value(
        monthly * 0.25,
        monthly * 0.55
    )

    appliance_usage = random_value(
        category_usage * 0.65,
        category_usage * 0.95
    )

    bill = random_value(6000, 26000)

    category = random.choice([
        "Kitchen",
        "Laundry",
        "Entertainment",
        "Other"
    ])

    return {
        "month": random.randint(1, 12),
        "monthlyConsumptionKwh": round(monthly, 2),
        "predictedConsumptionKwh": round(predicted, 2),
        "predictedBillAmount": bill,
        "highestApplianceConsumptionKwh": round(appliance_usage, 2),
        "highestCategoryConsumptionKwh": round(category_usage, 2),
        "highestConsumingCategory": category,
        "recommendationClass": "REDUCE_HIGH_USAGE_APPLIANCE",
    }


def create_high_bill_row():
    monthly = random_value(350, 850)
    predicted = monthly * random.uniform(1.05, 1.35)

    category_usage = random_value(
        monthly * 0.15,
        monthly * 0.35
    )

    appliance_usage = random_value(
        category_usage * 0.30,
        category_usage * 0.70
    )

    bill = random_value(22000, 65000)

    category = random.choice([
        "Cooling",
        "Kitchen",
        "Laundry",
        "Entertainment",
        "Other"
    ])

    return {
        "month": random.randint(1, 12),
        "monthlyConsumptionKwh": round(monthly, 2),
        "predictedConsumptionKwh": round(predicted, 2),
        "predictedBillAmount": bill,
        "highestApplianceConsumptionKwh": round(appliance_usage, 2),
        "highestCategoryConsumptionKwh": round(category_usage, 2),
        "highestConsumingCategory": category,
        "recommendationClass": "HIGH_BILL_WARNING",
    }


def create_general_saving_row():
    monthly = random_value(40, 180)
    predicted = monthly * random.uniform(0.85, 1.10)

    category_usage = random_value(
        monthly * 0.10,
        monthly * 0.30
    )

    appliance_usage = random_value(
        category_usage * 0.20,
        category_usage * 0.60
    )

    bill = random_value(1000, 7500)

    category = random.choice([
        "Lighting",
        "Entertainment",
        "Kitchen",
        "Other"
    ])

    return {
        "month": random.randint(1, 12),
        "monthlyConsumptionKwh": round(monthly, 2),
        "predictedConsumptionKwh": round(predicted, 2),
        "predictedBillAmount": bill,
        "highestApplianceConsumptionKwh": round(appliance_usage, 2),
        "highestCategoryConsumptionKwh": round(category_usage, 2),
        "highestConsumingCategory": category,
        "recommendationClass": "GENERAL_ENERGY_SAVING",
    }


GENERATORS = {
    "REDUCE_COOLING_USAGE": create_cooling_row,
    "REDUCE_LIGHTING_USAGE": create_lighting_row,
    "OPTIMIZE_REFRIGERATION": create_refrigeration_row,
    "REDUCE_HEATING_USAGE": create_heating_row,
    "REDUCE_HIGH_USAGE_APPLIANCE": create_high_appliance_row,
    "HIGH_BILL_WARNING": create_high_bill_row,
    "GENERAL_ENERGY_SAVING": create_general_saving_row,
}


def add_small_variation(row):
    if random.random() < 0.08:
        row["monthlyConsumptionKwh"] = round(
            clamp(
                row["monthlyConsumptionKwh"]
                * random.uniform(0.90, 1.10)
            ),
            2
        )

    if random.random() < 0.08:
        row["predictedConsumptionKwh"] = round(
            clamp(
                row["predictedConsumptionKwh"]
                * random.uniform(0.90, 1.10)
            ),
            2
        )

    if random.random() < 0.08:
        row["predictedBillAmount"] = round(
            clamp(
                row["predictedBillAmount"]
                * random.uniform(0.90, 1.10)
            ),
            2
        )

    return row


def generate_dataset():
    rows = []

    for label in LABELS:
        generator = GENERATORS[label]

        for _ in range(
            ROWS_PER_CLASS
        ):
            row = generator()
            row = add_small_variation(row)
            rows.append(row)

    random.shuffle(rows)

    dataframe = pd.DataFrame(
        rows
    )

    os.makedirs(
        OUTPUT_DIR,
        exist_ok=True
    )

    dataframe.to_csv(
        OUTPUT_FILE,
        index=False
    )

    return dataframe


if __name__ == "__main__":
    dataframe = generate_dataset()

    print()
    print(
        "Recommendation training dataset created successfully."
    )
    print()
    print(
        f"Rows: {len(dataframe)}"
    )
    print(
        f"Columns: {len(dataframe.columns)}"
    )
    print()
    print(
        dataframe[
            "recommendationClass"
        ].value_counts()
    )
    print()
    print(
        f"Saved to: {OUTPUT_FILE}"
    )