package com.example.electricity_bill_predictor.Service;

import com.example.electricity_bill_predictor.DTO.AiRecommendationResponse;

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
    private final CurrentUserService currentUserService;

    public RecommendationService(
            RecommendationRepository recommendationRepository,
            HouseholdRepository householdRepository,
            CurrentUserService currentUserService) {

        this.recommendationRepository =
                recommendationRepository;

        this.householdRepository =
                householdRepository;

        this.currentUserService =
                currentUserService;
    }

    // GET ALL RECOMMENDATIONS FOR CURRENT USER
    public List<Recommendation> getAllRecommendations() {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        return recommendationRepository
                .findByHouseholdUserUserIdOrderByCreatedDateDesc(
                        currentUserId
                );
    }

    // GET RECOMMENDATION BY ID
    public Recommendation getRecommendationById(
            Long id) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Recommendation recommendation =
                recommendationRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recommendation not found with id: "
                                                + id
                                )
                        );

        validateRecommendationOwnership(
                recommendation,
                currentUserId
        );

        return recommendation;
    }

    // GET RECOMMENDATIONS FOR HOUSEHOLD
    public List<Recommendation> getRecommendationsByHousehold(
            Long householdId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        getOwnedHousehold(
                householdId,
                currentUserId
        );

        return recommendationRepository
                .findByHouseholdHouseholdIdOrderByCreatedDateDesc(
                        householdId
                );
    }

    // CREATE RECOMMENDATION
    public Recommendation createRecommendation(
            Recommendation recommendation) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        if (recommendation.getHousehold() == null ||
                recommendation
                        .getHousehold()
                        .getHouseholdId() == null) {

            throw new IllegalArgumentException(
                    "Household is required"
            );
        }

        Long householdId =
                recommendation
                        .getHousehold()
                        .getHouseholdId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        recommendation.setHousehold(
                household
        );

        return recommendationRepository.save(
                recommendation
        );
    }

    // UPDATE RECOMMENDATION
    public Recommendation updateRecommendation(
            Long recommendationId,
            Recommendation recommendationDetails) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Recommendation existingRecommendation =
                recommendationRepository
                        .findById(recommendationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recommendation not found with id: "
                                                + recommendationId
                                )
                        );

        validateRecommendationOwnership(
                existingRecommendation,
                currentUserId
        );

        if (recommendationDetails.getHousehold() == null ||
                recommendationDetails
                        .getHousehold()
                        .getHouseholdId() == null) {

            throw new IllegalArgumentException(
                    "Household is required"
            );
        }

        Long householdId =
                recommendationDetails
                        .getHousehold()
                        .getHouseholdId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        existingRecommendation.setHousehold(
                household
        );

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

        return recommendationRepository.save(
                existingRecommendation
        );
    }

    // DELETE RECOMMENDATION
    public void deleteRecommendation(
            Long recommendationId) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Recommendation existingRecommendation =
                recommendationRepository
                        .findById(recommendationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Recommendation not found with id: "
                                                + recommendationId
                                )
                        );

        validateRecommendationOwnership(
                existingRecommendation,
                currentUserId
        );

        recommendationRepository.delete(
                existingRecommendation
        );
    }

    // SAVE AI GENERATED RECOMMENDATION
    public Recommendation saveAiRecommendation(
            Long householdId,
            AiRecommendationResponse aiResponse) {

        Long currentUserId =
                currentUserService.getCurrentUserId();

        Household household =
                getOwnedHousehold(
                        householdId,
                        currentUserId
                );

        if (aiResponse == null) {

            throw new IllegalArgumentException(
                    "AI recommendation response cannot be null"
            );
        }

        Recommendation recommendation =
                new Recommendation();

        recommendation.setHousehold(
                household
        );

        recommendation.setRecommendationTitle(
                aiResponse.getRecommendationTitle()
        );

        recommendation.setRecommendationDescription(
                aiResponse.getRecommendationDescription()
        );

        recommendation.setRecommendationType(
                aiResponse.getRecommendationType()
        );

        recommendation.setPriority(
                aiResponse.getPriority()
        );

        recommendation.setEstimatedSavingKwh(
                aiResponse.getEstimatedSavingKwh()
        );

        recommendation.setEstimatedSavingAmount(
                aiResponse.getEstimatedSavingAmount()
        );

        recommendation.setStatus(
                "ACTIVE"
        );

        return recommendationRepository.save(
                recommendation
        );
    }

    // HOUSEHOLD OWNERSHIP
    private Household getOwnedHousehold(
            Long householdId,
            Long currentUserId) {

        Household household =
                householdRepository
                        .findById(householdId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Household not found with id: "
                                                + householdId
                                )
                        );

        if (household.getUser() == null ||
                household
                        .getUser()
                        .getUserId() == null ||
                !household
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Household not found with id: "
                            + householdId
            );
        }

        return household;
    }

    // RECOMMENDATION OWNERSHIP
    private void validateRecommendationOwnership(
            Recommendation recommendation,
            Long currentUserId) {

        if (recommendation.getHousehold() == null ||
                recommendation
                        .getHousehold()
                        .getUser() == null ||
                recommendation
                        .getHousehold()
                        .getUser()
                        .getUserId() == null ||
                !recommendation
                        .getHousehold()
                        .getUser()
                        .getUserId()
                        .equals(currentUserId)) {

            throw new ResourceNotFoundException(
                    "Recommendation not found with id: "
                            + recommendation.getRecommendationId()
            );
        }
    }
}