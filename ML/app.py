from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel


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


app = FastAPI(
    title="Electricity Consumption Prediction API",
    version="1.0"
)

model = joblib.load(MODEL_FILE)


class PredictionRequest(BaseModel):
    year: int
    month: int
    number_of_residents: int
    appliance_count: int
    total_rated_power_w: float
    previous_month_kwh: float
    previous_2_month_kwh: float
    previous_3_month_kwh: float
    average_last_3_months_kwh: float


class PredictionResponse(BaseModel):
    predicted_next_month_kwh: float


@app.get("/")
def root():
    return {
        "message": "Electricity Consumption Prediction API is running"
    }


@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict_consumption(
        request: PredictionRequest):

    input_data = {
        "year": request.year,
        "month": request.month,
        "number_of_residents":
            request.number_of_residents,
        "appliance_count":
            request.appliance_count,
        "total_rated_power_w":
            request.total_rated_power_w,
        "previous_month_kwh":
            request.previous_month_kwh,
        "previous_2_month_kwh":
            request.previous_2_month_kwh,
        "previous_3_month_kwh":
            request.previous_3_month_kwh,
        "average_last_3_months_kwh":
            request.average_last_3_months_kwh
    }

    input_df = pd.DataFrame(
        [input_data],
        columns=FEATURE_COLUMNS
    )

    prediction = model.predict(input_df)

    predicted_kwh = round(
        float(prediction[0]),
        2
    )

    return PredictionResponse(
        predicted_next_month_kwh=predicted_kwh
    )