package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.Entity.Household;
import com.example.electricity_bill_predictor.Entity.Recommendation;
import com.example.electricity_bill_predictor.Repository.HouseholdRepository;
import com.example.electricity_bill_predictor.Repository.RecommendationRepository;
import com.example.electricity_bill_predictor.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final HouseholdRepository householdRepository;

    public RecommendationService(
            RecommendationRepository recommendationRepository,
            HouseholdRepository householdRepository) {

        this.recommendationRepository = recommendationRepository;
        this.householdRepository = householdRepository;
    }

    // Get all recommendations
    public List<Recommendation> getAllRecommendations() {
        return recommendationRepository.findAll();
    }

    // Get recommendation by ID
    public Recommendation getRecommendationById(Long id) {
        return recommendationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Recommendation not found with id: " + id
                        )
                );
    }

    // Create recommendation
    public Recommendation createRecommendation(
            Recommendation recommendation) {

        Long householdId =
                recommendation.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        recommendation.setHousehold(household);

        return recommendationRepository.save(recommendation);
    }

    // Update recommendation
    public Recommendation updateRecommendation(
            Long recommendationId,
            Recommendation recommendationDetails) {

        Recommendation existingRecommendation =
                recommendationRepository.findById(recommendationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recommendation not found with id: "
                                                + recommendationId
                                )
                        );

        Long householdId =
                recommendationDetails.getHousehold().getHouseholdId();

        Household household =
                householdRepository.findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        existingRecommendation.setHousehold(household);

        existingRecommendation.setRecommendationTitle(
                recommendationDetails.getRecommendationTitle()
        );

        existingRecommendation.setRecommendationDescription(
                recommendationDetails.getRecommendationDescription()
        );

        existingRecommendation.setRecommendationType(
                recommendationDetails.getRecommendationType()
        );

        existingRecommendation.setPriority(
                recommendationDetails.getPriority()
        );

        existingRecommendation.setEstimatedSavingKwh(
                recommendationDetails.getEstimatedSavingKwh()
        );

        existingRecommendation.setEstimatedSavingAmount(
                recommendationDetails.getEstimatedSavingAmount()
        );

        existingRecommendation.setStatus(
                recommendationDetails.getStatus()
        );

        return recommendationRepository.save(existingRecommendation);
    }

    // Delete recommendation
    public void deleteRecommendation(Long recommendationId) {

        Recommendation existingRecommendation =
                recommendationRepository.findById(recommendationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recommendation not found with id: "
                                                + recommendationId
                                )
                        );

        recommendationRepository.delete(existingRecommendation);
    }
}