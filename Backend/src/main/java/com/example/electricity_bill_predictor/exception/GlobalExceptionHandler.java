package com.example.electricity_bill_predictor.exception;

import org.springframework.dao.DataIntegrityViolationException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================================================
    // VALIDATION ERRORS
    // =========================================================
    @ExceptionHandler(
            MethodArgumentNotValidException.class
    )
    public ResponseEntity<Map<String, String>>
    handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors =
                new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return new ResponseEntity<>(
                errors,
                HttpStatus.BAD_REQUEST
        );
    }

    // =========================================================
    // DATABASE CONSTRAINT ERRORS
    // =========================================================
    @ExceptionHandler(
            DataIntegrityViolationException.class
    )
    public ResponseEntity<Map<String, String>>
    handleDuplicateData(
            DataIntegrityViolationException ex) {

        Map<String, String> error =
                new HashMap<>();

        /*
         * Do NOT expose raw MySQL/Hibernate
         * exception details to API clients.
         */
        error.put(
                "error",
                "The request conflicts with existing data."
        );

        return new ResponseEntity<>(
                error,
                HttpStatus.CONFLICT
        );
    }

    // =========================================================
    // RESOURCE NOT FOUND
    // =========================================================
    @ExceptionHandler(
            ResourceNotFoundException.class
    )
    public ResponseEntity<Map<String, String>>
    handleResourceNotFound(
            ResourceNotFoundException ex) {

        Map<String, String> error =
                new HashMap<>();

        error.put(
                "error",
                ex.getMessage()
        );

        return new ResponseEntity<>(
                error,
                HttpStatus.NOT_FOUND
        );
    }

    // =========================================================
    // INVALID ARGUMENT / BUSINESS RULE
    // =========================================================
    @ExceptionHandler(
            IllegalArgumentException.class
    )
    public ResponseEntity<Map<String, String>>
    handleIllegalArgument(
            IllegalArgumentException ex) {

        Map<String, String> error =
                new HashMap<>();

        error.put(
                "error",
                ex.getMessage()
        );

        return new ResponseEntity<>(
                error,
                HttpStatus.BAD_REQUEST
        );
    }

    // =========================================================
    // UNEXPECTED SERVER ERRORS
    // =========================================================
    @ExceptionHandler(
            Exception.class
    )
    public ResponseEntity<Map<String, String>>
    handleUnexpectedException(
            Exception ex) {

        Map<String, String> error =
                new HashMap<>();

        /*
         * Do not return the real internal
         * exception or stack trace.
         */
        error.put(
                "error",
                "An unexpected server error occurred."
        );

        return new ResponseEntity<>(
                error,
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}