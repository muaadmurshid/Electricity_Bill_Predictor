package com.example.electricity_bill_predictor.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/")
    public String home() {
        return "Electricity Bill Predictor Backend is Running!";
    }
}