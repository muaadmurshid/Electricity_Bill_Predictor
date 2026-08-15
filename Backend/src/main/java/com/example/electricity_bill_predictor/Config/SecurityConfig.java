package com.example.electricity_bill_predictor.Config;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.core.convert.converter.Converter;

import org.springframework.security.authentication.AbstractAuthenticationToken;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;

import java.util.Collection;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Value("${jwt.secret}")
    private String jwtSecret;

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================
    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // JWT SECRET KEY
    // =========================================================
    @Bean
    public SecretKey jwtSecretKey() {

        if (jwtSecret == null ||
                jwtSecret.isBlank()) {

            throw new IllegalStateException(
                    "JWT_SECRET environment variable is required"
            );
        }

        return new SecretKeySpec(
                jwtSecret.getBytes(
                        StandardCharsets.UTF_8
                ),
                "HmacSHA256"
        );
    }

    // =========================================================
    // JWT ENCODER
    // =========================================================
    @Bean
    public JwtEncoder jwtEncoder(
            SecretKey secretKey) {

        return NimbusJwtEncoder
                .withSecretKey(secretKey)
                .algorithm(
                        MacAlgorithm.HS256
                )
                .build();
    }

    // =========================================================
    // JWT DECODER
    // =========================================================
    @Bean
    public JwtDecoder jwtDecoder(
            SecretKey secretKey) {

        return NimbusJwtDecoder
                .withSecretKey(secretKey)
                .macAlgorithm(
                        MacAlgorithm.HS256
                )
                .build();
    }

    // =========================================================
    // JWT ROLE CONVERTER
    //
    // role = USER
    // becomes ROLE_USER
    //
    // role = ADMIN
    // becomes ROLE_ADMIN
    // =========================================================
    @Bean
    public Converter<Jwt, ? extends AbstractAuthenticationToken>
    jwtAuthenticationConverter() {

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                jwt -> {

                    String role =
                            jwt.getClaimAsString(
                                    "role"
                            );

                    if (role == null ||
                            role.isBlank()) {

                        return List.of();
                    }

                    Collection<GrantedAuthority> authorities =
                            List.of(
                                    new SimpleGrantedAuthority(
                                            "ROLE_"
                                                    + role.toUpperCase()
                                    )
                            );

                    return authorities;
                }
        );

        return converter;
    }

    // =========================================================
    // CORS CONFIGURATION
    // =========================================================
    @Bean
    public UrlBasedCorsConfigurationSource
    corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:3000"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );

        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );

        configuration.setAllowCredentials(
                false
        );

        configuration.setMaxAge(
                3600L
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            Converter<Jwt, ? extends AbstractAuthenticationToken>
                    jwtAuthenticationConverter)
            throws Exception {

        http

                // =================================================
                // CSRF
                // JWT REST API does not use CSRF tokens
                // =================================================
                .csrf(csrf ->
                        csrf.disable()
                )

                // =================================================
                // CORS
                // =================================================
                .cors(cors -> {
                })

                // =================================================
                // STATELESS SESSION
                // =================================================
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // =================================================
                // AUTHORIZATION RULES
                // =================================================
                .authorizeHttpRequests(auth ->
                        auth

                                // =============================================
                                // PUBLIC AUTHENTICATION ENDPOINTS
                                // =============================================
                                .requestMatchers(
                                        "/api/auth/**"
                                )
                                .permitAll()

                                // =============================================
                                // TARIFF READ
                                // USER + ADMIN
                                // =============================================
                                .requestMatchers(
                                        org.springframework.http.HttpMethod.GET,
                                        "/api/tariffs/**",
                                        "/api/tariff-rates/**"
                                )
                                .authenticated()

                                // =============================================
                                // TARIFF CREATE
                                // ADMIN ONLY
                                // =============================================
                                .requestMatchers(
                                        org.springframework.http.HttpMethod.POST,
                                        "/api/tariffs/**",
                                        "/api/tariff-rates/**"
                                )
                                .hasRole("ADMIN")

                                // =============================================
                                // TARIFF UPDATE
                                // ADMIN ONLY
                                // =============================================
                                .requestMatchers(
                                        org.springframework.http.HttpMethod.PUT,
                                        "/api/tariffs/**",
                                        "/api/tariff-rates/**"
                                )
                                .hasRole("ADMIN")

                                // =============================================
                                // TARIFF PATCH
                                // ADMIN ONLY
                                // =============================================
                                .requestMatchers(
                                        org.springframework.http.HttpMethod.PATCH,
                                        "/api/tariffs/**",
                                        "/api/tariff-rates/**"
                                )
                                .hasRole("ADMIN")

                                // =============================================
                                // TARIFF DELETE
                                // ADMIN ONLY
                                // =============================================
                                .requestMatchers(
                                        org.springframework.http.HttpMethod.DELETE,
                                        "/api/tariffs/**",
                                        "/api/tariff-rates/**"
                                )
                                .hasRole("ADMIN")

                                // =============================================
                                // USER MANAGEMENT
                                // ADMIN ONLY
                                //
                                // GET    /api/users
                                // GET    /api/users/{id}
                                // POST   /api/users
                                // PUT    /api/users/{id}
                                // PUT    /api/users/{id}/status
                                // DELETE /api/users/{id}
                                // =============================================
                                .requestMatchers(
                                        "/api/users/**"
                                )
                                .hasRole("ADMIN")

                                // =============================================
                                // ADMIN DASHBOARD / ADMIN APIs
                                // ADMIN ONLY
                                // =============================================
                                .requestMatchers(
                                        "/api/admin/**"
                                )
                                .hasRole("ADMIN")

                                // =============================================
                                // ALL OTHER APIs
                                //
                                // Any authenticated USER or ADMIN.
                                // Ownership protection is handled
                                // inside service classes.
                                // =============================================
                                .anyRequest()
                                .authenticated()
                )

                // =========================================================
                // JWT RESOURCE SERVER
                // =========================================================
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter
                                )
                        )
                );

        return http.build();
    }
}