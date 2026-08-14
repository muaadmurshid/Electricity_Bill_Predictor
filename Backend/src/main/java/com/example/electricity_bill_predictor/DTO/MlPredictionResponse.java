package com.example.electricity_bill_predictor.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MlPredictionResponse {

    @JsonProperty("predicted_next_month_kwh")
    private Double predictedNextMonthKwh;

    public MlPredictionResponse() {
    }

    public Double getPredictedNextMonthKwh() {
        return predictedNextMonthKwh;
    }

    public void setPredictedNextMonthKwh(
            Double predictedNextMonthKwh) {

        this.predictedNextMonthKwh =
                predictedNextMonthKwh;
    }
}