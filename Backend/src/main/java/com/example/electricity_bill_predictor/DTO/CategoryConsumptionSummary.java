package com.example.electricity_bill_predictor.DTO;

import java.math.BigDecimal;

public class CategoryConsumptionSummary {

    private Long categoryId;
    private String categoryName;
    private BigDecimal totalConsumptionKwh;
    private BigDecimal percentageShare;

    public CategoryConsumptionSummary() {
    }

    public CategoryConsumptionSummary(
            Long categoryId,
            String categoryName,
            BigDecimal totalConsumptionKwh,
            BigDecimal percentageShare) {

        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.totalConsumptionKwh = totalConsumptionKwh;
        this.percentageShare = percentageShare;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getTotalConsumptionKwh() {
        return totalConsumptionKwh;
    }

    public void setTotalConsumptionKwh(
            BigDecimal totalConsumptionKwh) {

        this.totalConsumptionKwh =
                totalConsumptionKwh;
    }

    public BigDecimal getPercentageShare() {
        return percentageShare;
    }

    public void setPercentageShare(
            BigDecimal percentageShare) {

        this.percentageShare =
                percentageShare;
    }
}