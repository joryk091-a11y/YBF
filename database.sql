-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: airlines
-- ------------------------------------------------------
-- Server version	8.0.40

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
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id_company` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(100) NOT NULL,
  `airline_code` varchar(10) NOT NULL,
  PRIMARY KEY (`id_company`),
  UNIQUE KEY `airline_code_UNIQUE` (`airline_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id_admin` int NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','company') DEFAULT 'company',
  `airline_code` varchar(10) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `department` varchar(45) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_admin`),
  UNIQUE KEY `employee_id_UNIQUE` (`employee_id`),
  KEY `airline_code_idx` (`airline_code`),
  CONSTRAINT `fk_admins_companies` FOREIGN KEY (`airline_code`) REFERENCES `companies` (`airline_code`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `baggage`
--

DROP TABLE IF EXISTS `baggage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `baggage` (
  `id_baggage` int NOT NULL,
  `booking_id` int NOT NULL,
  `passenger_id` int NOT NULL,
  `weight` decimal(6,2) NOT NULL,
  `base_price` decimal(10,2) DEFAULT NULL,
  `extra_price` decimal(10,2) DEFAULT NULL,
  `total_price` decimal(10,2) GENERATED ALWAYS AS ((`base_price` + `extra_price`)) VIRTUAL,
  PRIMARY KEY (`id_baggage`),
  KEY `booking_id` (`booking_id`),
  KEY `passenger_id` (`passenger_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `baggage`
--

LOCK TABLES `baggage` WRITE;
/*!40000 ALTER TABLE `baggage` DISABLE KEYS */;
/*!40000 ALTER TABLE `baggage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id_bookings` int NOT NULL,
  `flight_id` int NOT NULL,
  `booking_date` timestamp(3) NULL DEFAULT NULL,
  `total_passengers` int DEFAULT NULL,
  `base_price` decimal(10,0) NOT NULL,
  `extra_total` decimal(10,0) DEFAULT NULL,
  `final_price` decimal(10,0) NOT NULL,
  `status` enum('temporary','certain','canceled') DEFAULT NULL,
  `payment_deadline` timestamp(3) NULL DEFAULT NULL,
  `cancelled_date` timestamp(3) NULL DEFAULT NULL,
  `booking_reference` varchar(20) NOT NULL,
  PRIMARY KEY (`id_bookings`),
  KEY `flight_id` (`flight_id`),
  KEY `booking_reference` (`booking_reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings_passengers`
--

DROP TABLE IF EXISTS `bookings_passengers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings_passengers` (
  `id_bookings_passengers` int NOT NULL,
  `booking_id` int NOT NULL,
  `passenger_id` int NOT NULL,
  `seat_id` int DEFAULT NULL,
  `baggage_id` int DEFAULT NULL,
  PRIMARY KEY (`id_bookings_passengers`),
  KEY `booking_id` (`booking_id`),
  KEY `passenger_id` (`passenger_id`),
  KEY `seat_id` (`seat_id`),
  KEY `baggage_id` (`baggage_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings_passengers`
--

LOCK TABLES `bookings_passengers` WRITE;
/*!40000 ALTER TABLE `bookings_passengers` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings_passengers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flights`
--

DROP TABLE IF EXISTS `flights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flights` (
  `id_flights` int NOT NULL,
  `flight_number` varchar(20) NOT NULL,
  `airline_code` varchar(10) DEFAULT NULL,
  `airportOrigin_code` varchar(10) DEFAULT NULL,
  `airportDestination_code` varchar(10) DEFAULT NULL,
  `departure_time` datetime NOT NULL,
  `arrival_time` datetime NOT NULL,
  `duration` int DEFAULT NULL,
  `aircraft_type` varchar(45) DEFAULT NULL,
  `total_seats` int DEFAULT NULL,
  `available_seats` int DEFAULT NULL,
  `status` enum('active','cancelled','copmleted') DEFAULT NULL,
  `created_at` timestamp(3) NULL DEFAULT NULL,
  `update` timestamp(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id_flights`),
  KEY `airline_code_idx` (`airline_code`),
  CONSTRAINT `fk_flights_companies` FOREIGN KEY (`airline_code`) REFERENCES `companies` (`airline_code`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flights`
--

LOCK TABLES `flights` WRITE;
/*!40000 ALTER TABLE `flights` DISABLE KEYS */;
/*!40000 ALTER TABLE `flights` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flights_logs`
--

DROP TABLE IF EXISTS `flights_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flights_logs` (
  `id_flights_logs` int NOT NULL,
  `admin_id` int NOT NULL,
  `action_type` enum('create','update','delete','status_changr') NOT NULL,
  `flight_id` int NOT NULL,
  `action_details` json DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_flights_logs`),
  KEY `admin_id` (`admin_id`),
  KEY `flight_id` (`flight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flights_logs`
--

LOCK TABLES `flights_logs` WRITE;
/*!40000 ALTER TABLE `flights_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `flights_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ground_services`
--

DROP TABLE IF EXISTS `ground_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ground_services` (
  `id_Ground_services` int NOT NULL,
  `booking_id` int NOT NULL,
  `service_name` varchar(50) NOT NULL,
  `price` decimal(10,0) NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` timestamp(3) NULL DEFAULT NULL,
  PRIMARY KEY (`id_Ground_services`),
  KEY `booking_id` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ground_services`
--

LOCK TABLES `ground_services` WRITE;
/*!40000 ALTER TABLE `ground_services` DISABLE KEYS */;
/*!40000 ALTER TABLE `ground_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id_notifications` int NOT NULL AUTO_INCREMENT,
  `passenger_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `booking_id` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` varchar(5000) DEFAULT NULL,
  `type` enum('booking','reminder','payment','cancellation','general') DEFAULT NULL,
  `is_read` tinyint DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_notifications`),
  KEY `passenger_id` (`passenger_id`),
  KEY `user_id` (`user_id`),
  KEY `booking_id` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `passengers`
--

DROP TABLE IF EXISTS `passengers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passengers` (
  `id_passengers` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `passport_number` varchar(50) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `nationality` varchar(45) DEFAULT NULL,
  `gander` enum('male','female') NOT NULL,
  PRIMARY KEY (`id_passengers`),
  UNIQUE KEY `passport_number` (`passport_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `passengers`
--

LOCK TABLES `passengers` WRITE;
/*!40000 ALTER TABLE `passengers` DISABLE KEYS */;
/*!40000 ALTER TABLE `passengers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id_payments` int NOT NULL,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('credit_card','debit_card','paypal','bank_transfer') NOT NULL,
  `tansaction_id` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','success','failed','refunded') DEFAULT NULL,
  `gateway_response` varchar(10000) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT NULL,
  `refund_date` timestamp NULL DEFAULT NULL,
  `refund_amount` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_payments`),
  UNIQUE KEY `tansaction_id_UNIQUE` (`tansaction_id`),
  KEY `booking_id` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seats`
--

DROP TABLE IF EXISTS `seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seats` (
  `id_seats` int NOT NULL,
  `flight_id` int NOT NULL,
  `seat_number` varchar(15) NOT NULL,
  `seat_class` enum('economy',' business','first') DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `seat_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_seats`),
  UNIQUE KEY `seat_number_UNIQUE` (`seat_number`),
  UNIQUE KEY `flight_id_UNIQUE` (`flight_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seats`
--

LOCK TABLES `seats` WRITE;
/*!40000 ALTER TABLE `seats` DISABLE KEYS */;
/*!40000 ALTER TABLE `seats` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-11  0:15:04
