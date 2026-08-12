-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: electricity_bill_predictor
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appliance`
--

DROP TABLE IF EXISTS `appliance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appliance` (
  `appliance_id` bigint NOT NULL AUTO_INCREMENT,
  `room_id` bigint NOT NULL,
  `category_id` bigint NOT NULL,
  `appliance_name` varchar(100) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `rated_power` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `energy_rating` varchar(20) DEFAULT NULL,
  `typical_daily_hours` decimal(5,2) DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`appliance_id`),
  KEY `fk_appliance_room` (`room_id`),
  KEY `fk_appliance_category` (`category_id`),
  CONSTRAINT `fk_appliance_category` FOREIGN KEY (`category_id`) REFERENCES `appliance_category` (`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_appliance_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appliance`
--

LOCK TABLES `appliance` WRITE;
/*!40000 ALTER TABLE `appliance` DISABLE KEYS */;
/*!40000 ALTER TABLE `appliance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appliance_category`
--

DROP TABLE IF EXISTS `appliance_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appliance_category` (
  `category_id` bigint NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appliance_category`
--

LOCK TABLES `appliance_category` WRITE;
/*!40000 ALTER TABLE `appliance_category` DISABLE KEYS */;
INSERT INTO `appliance_category` VALUES (1,'Cooling','Cooling and ventilation appliances'),(2,'Kitchen','Kitchen and cooking appliances'),(3,'Lighting','Lighting appliances'),(4,'Entertainment','Entertainment and media appliances'),(5,'Washing','Washing and cleaning appliances'),(6,'Heating','Heating appliances');
/*!40000 ALTER TABLE `appliance_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bill_prediction`
--

DROP TABLE IF EXISTS `bill_prediction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_prediction` (
  `prediction_id` bigint NOT NULL AUTO_INCREMENT,
  `household_id` bigint NOT NULL,
  `tariff_id` bigint NOT NULL,
  `prediction_date` date NOT NULL,
  `target_month` date NOT NULL,
  `predicted_consumption_kwh` decimal(10,3) DEFAULT NULL,
  `predicted_bill_amount` decimal(10,2) DEFAULT NULL,
  `lower_estimate` decimal(10,2) DEFAULT NULL,
  `upper_estimate` decimal(10,2) DEFAULT NULL,
  `prediction_status` varchar(30) NOT NULL DEFAULT 'COMPLETED',
  PRIMARY KEY (`prediction_id`),
  KEY `fk_prediction_household` (`household_id`),
  KEY `fk_prediction_tariff` (`tariff_id`),
  CONSTRAINT `fk_prediction_household` FOREIGN KEY (`household_id`) REFERENCES `household` (`household_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_prediction_tariff` FOREIGN KEY (`tariff_id`) REFERENCES `tariff` (`tariff_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_prediction`
--

LOCK TABLES `bill_prediction` WRITE;
/*!40000 ALTER TABLE `bill_prediction` DISABLE KEYS */;
/*!40000 ALTER TABLE `bill_prediction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budget`
--

DROP TABLE IF EXISTS `budget`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget` (
  `budget_id` bigint NOT NULL AUTO_INCREMENT,
  `household_id` bigint NOT NULL,
  `budget_month` int NOT NULL,
  `budget_year` int NOT NULL,
  `budget_amount` decimal(10,2) NOT NULL,
  `warning_threshold` decimal(5,2) NOT NULL,
  `current_estimated_amount` decimal(10,2) DEFAULT '0.00',
  `status` varchar(30) NOT NULL DEFAULT 'ACTIVE',
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`budget_id`),
  UNIQUE KEY `uq_household_budget_month` (`household_id`,`budget_month`,`budget_year`),
  CONSTRAINT `fk_budget_household` FOREIGN KEY (`household_id`) REFERENCES `household` (`household_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget`
--

LOCK TABLES `budget` WRITE;
/*!40000 ALTER TABLE `budget` DISABLE KEYS */;
/*!40000 ALTER TABLE `budget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_usage`
--

DROP TABLE IF EXISTS `daily_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `daily_usage` (
  `usage_id` bigint NOT NULL AUTO_INCREMENT,
  `appliance_id` bigint NOT NULL,
  `usage_date` date NOT NULL,
  `hours_used` decimal(5,2) NOT NULL,
  `estimated_consumption_kwh` decimal(10,3) DEFAULT NULL,
  `usage_notes` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`usage_id`),
  UNIQUE KEY `uq_appliance_usage_date` (`appliance_id`,`usage_date`),
  CONSTRAINT `fk_usage_appliance` FOREIGN KEY (`appliance_id`) REFERENCES `appliance` (`appliance_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_usage`
--

LOCK TABLES `daily_usage` WRITE;
/*!40000 ALTER TABLE `daily_usage` DISABLE KEYS */;
/*!40000 ALTER TABLE `daily_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `electricity_bill`
--

DROP TABLE IF EXISTS `electricity_bill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `electricity_bill` (
  `bill_id` bigint NOT NULL AUTO_INCREMENT,
  `household_id` bigint NOT NULL,
  `billing_period` varchar(20) NOT NULL,
  `units_consumed_kwh` decimal(10,3) NOT NULL,
  `bill_amount` decimal(10,2) NOT NULL,
  `bill_date` date NOT NULL,
  `payment_status` varchar(30) NOT NULL DEFAULT 'PENDING',
  PRIMARY KEY (`bill_id`),
  KEY `fk_bill_household` (`household_id`),
  CONSTRAINT `fk_bill_household` FOREIGN KEY (`household_id`) REFERENCES `household` (`household_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `electricity_bill`
--

LOCK TABLES `electricity_bill` WRITE;
/*!40000 ALTER TABLE `electricity_bill` DISABLE KEYS */;
/*!40000 ALTER TABLE `electricity_bill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `energy_goal`
--

DROP TABLE IF EXISTS `energy_goal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `energy_goal` (
  `goal_id` bigint NOT NULL AUTO_INCREMENT,
  `household_id` bigint NOT NULL,
  `goal_name` varchar(150) NOT NULL,
  `goal_type` varchar(50) NOT NULL,
  `target_value` decimal(10,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `current_value` decimal(10,2) DEFAULT '0.00',
  `status` varchar(30) NOT NULL DEFAULT 'ACTIVE',
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`goal_id`),
  KEY `fk_goal_household` (`household_id`),
  CONSTRAINT `fk_goal_household` FOREIGN KEY (`household_id`) REFERENCES `household` (`household_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `energy_goal`
--

LOCK TABLES `energy_goal` WRITE;
/*!40000 ALTER TABLE `energy_goal` DISABLE KEYS */;
/*!40000 ALTER TABLE `energy_goal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `household`
--

DROP TABLE IF EXISTS `household`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `household` (
  `household_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `household_name` varchar(100) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `house_type` varchar(50) DEFAULT NULL,
  `number_of_residents` int NOT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`household_id`),
  KEY `fk_household_user` (`user_id`),
  CONSTRAINT `fk_household_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `household`
--

LOCK TABLES `household` WRITE;
/*!40000 ALTER TABLE `household` DISABLE KEYS */;
/*!40000 ALTER TABLE `household` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `household_id` bigint NOT NULL,
  `notification_title` varchar(150) NOT NULL,
  `notification_message` text NOT NULL,
  `notification_type` varchar(50) DEFAULT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`notification_id`),
  KEY `fk_notification_household` (`household_id`),
  CONSTRAINT `fk_notification_household` FOREIGN KEY (`household_id`) REFERENCES `household` (`household_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommendation`
--

DROP TABLE IF EXISTS `recommendation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommendation` (
  `recommendation_id` bigint NOT NULL AUTO_INCREMENT,
  `household_id` bigint NOT NULL,
  `recommendation_title` varchar(150) NOT NULL,
  `recommendation_description` text,
  `recommendation_type` varchar(50) DEFAULT NULL,
  `priority` varchar(30) DEFAULT NULL,
  `estimated_saving_kwh` decimal(10,3) DEFAULT NULL,
  `estimated_saving_amount` decimal(10,2) DEFAULT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(30) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`recommendation_id`),
  KEY `fk_recommendation_household` (`household_id`),
  CONSTRAINT `fk_recommendation_household` FOREIGN KEY (`household_id`) REFERENCES `household` (`household_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommendation`
--

LOCK TABLES `recommendation` WRITE;
/*!40000 ALTER TABLE `recommendation` DISABLE KEYS */;
/*!40000 ALTER TABLE `recommendation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommendation_appliance`
--

DROP TABLE IF EXISTS `recommendation_appliance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommendation_appliance` (
  `recommendation_id` bigint NOT NULL,
  `appliance_id` bigint NOT NULL,
  PRIMARY KEY (`recommendation_id`,`appliance_id`),
  KEY `fk_ra_appliance` (`appliance_id`),
  CONSTRAINT `fk_ra_appliance` FOREIGN KEY (`appliance_id`) REFERENCES `appliance` (`appliance_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ra_recommendation` FOREIGN KEY (`recommendation_id`) REFERENCES `recommendation` (`recommendation_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommendation_appliance`
--

LOCK TABLES `recommendation_appliance` WRITE;
/*!40000 ALTER TABLE `recommendation_appliance` DISABLE KEYS */;
/*!40000 ALTER TABLE `recommendation_appliance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `room_id` bigint NOT NULL AUTO_INCREMENT,
  `household_id` bigint NOT NULL,
  `room_name` varchar(100) NOT NULL,
  `room_type` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`room_id`),
  KEY `fk_room_household` (`household_id`),
  CONSTRAINT `fk_room_household` FOREIGN KEY (`household_id`) REFERENCES `household` (`household_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tariff`
--

DROP TABLE IF EXISTS `tariff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tariff` (
  `tariff_id` bigint NOT NULL AUTO_INCREMENT,
  `tariff_name` varchar(100) NOT NULL,
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `rate_per_unit` decimal(10,2) NOT NULL,
  `fixed_charge` decimal(10,2) DEFAULT '0.00',
  `status` varchar(30) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`tariff_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tariff`
--

LOCK TABLES `tariff` WRITE;
/*!40000 ALTER TABLE `tariff` DISABLE KEYS */;
INSERT INTO `tariff` VALUES (1,'Development Tariff','2026-01-01',NULL,0.00,0.00,'ACTIVE');
/*!40000 ALTER TABLE `tariff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `account_status` varchar(30) NOT NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-12  2:29:57
