package com.example.electricity_bill_predictor.Service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    public Long getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "User is not authenticated"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof Jwt jwt)) {

            throw new IllegalStateException(
                    "Invalid authentication principal"
            );
        }

        Object userIdClaim =
                jwt.getClaim("userId");

        if (userIdClaim == null) {

            throw new IllegalStateException(
                    "JWT does not contain userId"
            );
        }

        return Long.valueOf(
                userIdClaim.toString()
        );
    }

    public String getCurrentUserEmail() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new IllegalStateException(
                    "User is not authenticated"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (!(principal instanceof Jwt jwt)) {

            throw new IllegalStateException(
                    "Invalid authentication principal"
            );
        }

        return jwt.getSubject();
    }
}