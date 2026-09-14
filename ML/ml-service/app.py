from pathlib import Path
import json

import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field


BASE_DIR = Path(__file__).resolve().parent

PREDICTION_MODEL_FILE = (
    BASE_DIR
    / "model"
    / "xgboost_energy_model.pkl"
)

RECOMMENDATION_MODEL_FILE = (
    BASE_DIR
    / "model"
    / "recommendation_model.joblib"
)

RECOMMENDATION_LABEL_FILE = (
    BASE_DIR
    / "model"
    / "recommendation_labels.json"
)


PREDICTION_FEATURE_COLUMNS = [
    "year",
    "month",
    "number_of_residents",
    "appliance_count",
    "total_rated_power_w",
    "previous_month_kwh",
    "previous_2_month_kwh",
    "previous_3_month_kwh",
    "average_last_3_months_kwh",
]


RECOMMENDATION_FEATURE_COLUMNS = [
    "month",
    "monthlyConsumptionKwh",
    "predictedConsumptionKwh",
    "predictedBillAmount",
    "highestApplianceConsumptionKwh",
    "highestCategoryConsumptionKwh",
    "highestConsumingCategory",
]


app = FastAPI(
    title="Electricity Bill Predictor ML API",
    version="2.0"
)


prediction_model = joblib.load(
    PREDICTION_MODEL_FILE
)

recommendation_model = joblib.load(
    RECOMMENDATION_MODEL_FILE
)


with open(
    RECOMMENDATION_LABEL_FILE,
    "r",
    encoding="utf-8"
) as file:
    recommendation_label_data = json.load(
        file
    )


recommendation_id_to_label = (
    recommendation_label_data[
        "id_to_label"
    ]
)


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


class RecommendationRequest(BaseModel):
    month: int = Field(
        ge=1,
        le=12
    )

    monthlyConsumptionKwh: float = Field(
        ge=0
    )

    predictedConsumptionKwh: float = Field(
        ge=0
    )

    predictedBillAmount: float = Field(
        ge=0
    )

    highestApplianceConsumptionKwh: float = Field(
        ge=0
    )

    highestCategoryConsumptionKwh: float = Field(
        ge=0
    )

    highestConsumingCategory: str


class RecommendationResponse(BaseModel):
    recommendationClass: str


@app.get("/")
def root():
    return {
        "message":
            "Electricity Bill Predictor ML API is running",
        "version":
            "2.0",
        "services": [
            "electricity-consumption-prediction",
            "energy-recommendation-classification",
        ],
    }


@app.get("/health")
def health():
    return {
        "status": "UP",
        "predictionModelLoaded": True,
        "recommendationModelLoaded": True,
    }


@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict_consumption(
    request: PredictionRequest
):
    input_data = {
        "year":
            request.year,

        "month":
            request.month,

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
            request.average_last_3_months_kwh,
    }

    input_df = pd.DataFrame(
        [input_data],
        columns=PREDICTION_FEATURE_COLUMNS
    )

    prediction = prediction_model.predict(
        input_df
    )

    predicted_kwh = round(
        float(
            prediction[0]
        ),
        2
    )

    return PredictionResponse(
        predicted_next_month_kwh=
            predicted_kwh
    )


@app.post(
    "/recommend",
    response_model=RecommendationResponse
)
def recommend_energy_action(
    request: RecommendationRequest
):
    input_data = {
        "month":
            request.month,

        "monthlyConsumptionKwh":
            request.monthlyConsumptionKwh,

        "predictedConsumptionKwh":
            request.predictedConsumptionKwh,

        "predictedBillAmount":
            request.predictedBillAmount,

        "highestApplianceConsumptionKwh":
            request.highestApplianceConsumptionKwh,

        "highestCategoryConsumptionKwh":
            request.highestCategoryConsumptionKwh,

        "highestConsumingCategory":
            request.highestConsumingCategory,
    }

    input_df = pd.DataFrame(
        [input_data],
        columns=RECOMMENDATION_FEATURE_COLUMNS
    )

    prediction = recommendation_model.predict(
        input_df
    )

    predicted_class_id = int(
        prediction[0]
    )

    recommendation_class = (
        recommendation_id_to_label.get(
            str(
                predicted_class_id
            )
        )
    )

    if recommendation_class is None:
        raise ValueError(
            "Recommendation class could not be resolved"
        )

    return RecommendationResponse(
        recommendationClass=
            recommendation_class
    )