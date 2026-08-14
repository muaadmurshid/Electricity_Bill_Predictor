package com.example.electricity_bill_predictor.Repository;

import com.example.electricity_bill_predictor.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}
