package com.example.electricity_bill_predictor.DTO;

public class AdminDashboardSummary {

    private long totalUsers;
    private long totalHouseholds;
    private long totalAppliances;
    private long totalElectricityBills;
    private long totalBillPredictions;

    public AdminDashboardSummary(
            long totalUsers,
            long totalHouseholds,
            long totalAppliances,
            long totalElectricityBills,
            long totalBillPredictions) {

        this.totalUsers = totalUsers;
        this.totalHouseholds = totalHouseholds;
        this.totalAppliances = totalAppliances;
        this.totalElectricityBills = totalElectricityBills;
        this.totalBillPredictions = totalBillPredictions;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalHouseholds() {
        return totalHouseholds;
    }

    public void setTotalHouseholds(long totalHouseholds) {
        this.totalHouseholds = totalHouseholds;
    }

    public long getTotalAppliances() {
        return totalAppliances;
    }

    public void setTotalAppliances(long totalAppliances) {
        this.totalAppliances = totalAppliances;
    }

    public long getTotalElectricityBills() {
        return totalElectricityBills;
    }

    public void setTotalElectricityBills(
            long totalElectricityBills) {
        this.totalElectricityBills =
                totalElectricityBills;
    }

    public long getTotalBillPredictions() {
        return totalBillPredictions;
    }

    public void setTotalBillPredictions(
            long totalBillPredictions) {
        this.totalBillPredictions =
                totalBillPredictions;
    }
}