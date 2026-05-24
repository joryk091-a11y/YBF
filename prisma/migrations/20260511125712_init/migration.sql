-- CreateTable
CREATE TABLE `admins` (
    `id_admin` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(50) NOT NULL,
    `password` VARCHAR(50) NOT NULL,
    `employee_id` VARCHAR(50) NULL,
    `department` VARCHAR(45) NULL,
    `last_login` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `admins_employee_id_key`(`employee_id`),
    PRIMARY KEY (`id_admin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `baggage` (
    `id_baggage` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `passenger_id` INTEGER NOT NULL,
    `weight` DECIMAL(6, 2) NOT NULL,
    `base_price` DECIMAL(10, 2) NULL,
    `extra_price` DECIMAL(10, 2) NULL,
    `total_price` DECIMAL(10, 2) NULL,

    PRIMARY KEY (`id_baggage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id_bookings` INTEGER NOT NULL AUTO_INCREMENT,
    `flight_id` INTEGER NOT NULL,
    `booking_date` TIMESTAMP(3) NULL,
    `total_passengers` INTEGER NULL,
    `base_price` DECIMAL(10, 0) NOT NULL,
    `extra_total` DECIMAL(10, 0) NULL,
    `final_price` DECIMAL(10, 0) NOT NULL,
    `status` ENUM('temporary', 'certain', 'canceled') NULL,
    `payment_deadline` TIMESTAMP(3) NULL,
    `cancelled_date` TIMESTAMP(3) NULL,
    `booking_reference` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id_bookings`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings_passengers` (
    `id_bookings_passengers` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `passenger_id` INTEGER NOT NULL,
    `seat_id` INTEGER NULL,
    `baggage_id` INTEGER NULL,

    PRIMARY KEY (`id_bookings_passengers`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flights` (
    `id_flights` INTEGER NOT NULL AUTO_INCREMENT,
    `flight_number` VARCHAR(20) NOT NULL,
    `airline_code` VARCHAR(10) NULL,
    `airportOrigin_code` VARCHAR(10) NULL,
    `airportDestination_code` VARCHAR(10) NULL,
    `departure_time` DATETIME(0) NOT NULL,
    `arrival_time` DATETIME(0) NOT NULL,
    `duration` INTEGER NULL,
    `aircraft_type` VARCHAR(45) NULL,
    `total_seats` INTEGER NULL,
    `available_seats` INTEGER NULL,
    `status` ENUM('active', 'cancelled', 'copmleted') NULL,
    `created_at` TIMESTAMP(3) NULL,
    `update` TIMESTAMP(3) NULL,

    PRIMARY KEY (`id_flights`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `flights_logs` (
    `id_flights_logs` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NOT NULL,
    `action_type` ENUM('create', 'update', 'delete', 'status_changr') NOT NULL,
    `flight_id` INTEGER NOT NULL,
    `action_details` JSON NULL,
    `timestamp` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id_flights_logs`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ground_services` (
    `id_Ground_services` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `service_name` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 0) NOT NULL,
    `is_active` BOOLEAN NULL,
    `created_at` TIMESTAMP(3) NULL,

    PRIMARY KEY (`id_Ground_services`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id_notifications` INTEGER NOT NULL AUTO_INCREMENT,
    `passenger_id` INTEGER NOT NULL,
    `booking_id` INTEGER NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` VARCHAR(5000) NULL,
    `type` ENUM('booking', 'reminder', 'payment', 'cancellation', 'general') NULL,
    `is_read` TINYINT NULL,
    `created_at` TIMESTAMP(0) NULL,

    PRIMARY KEY (`id_notifications`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `passengers` (
    `id_passengers` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `passport_number` VARCHAR(50) NOT NULL,
    `email` VARCHAR(45) NULL,
    `phone` VARCHAR(20) NULL,
    `date_of_birth` DATE NULL,
    `nationality` VARCHAR(45) NULL,
    `gander` ENUM('male', 'female') NOT NULL,

    UNIQUE INDEX `passengers_passport_number_key`(`passport_number`),
    PRIMARY KEY (`id_passengers`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id_payments` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('credit_card', 'debit_card', 'paypal', 'bank_transfer') NOT NULL,
    `tansaction_id` VARCHAR(50) NULL,
    `payment_status` ENUM('pending', 'success', 'failed', 'refunded') NULL,
    `gateway_response` VARCHAR(10000) NULL,
    `payment_date` TIMESTAMP(0) NULL,
    `refund_date` TIMESTAMP(0) NULL,
    `refund_amount` DECIMAL(10, 2) NULL,

    UNIQUE INDEX `payments_tansaction_id_key`(`tansaction_id`),
    PRIMARY KEY (`id_payments`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seats` (
    `id_seats` INTEGER NOT NULL AUTO_INCREMENT,
    `flight_id` INTEGER NOT NULL,
    `seat_number` VARCHAR(15) NOT NULL,
    `seat_class` ENUM('economy', ' business', 'first') NULL,
    `is_available` TINYINT NULL DEFAULT 1,
    `seat_price` DECIMAL(10, 2) NULL,

    UNIQUE INDEX `seats_flight_id_key`(`flight_id`),
    UNIQUE INDEX `seats_seat_number_key`(`seat_number`),
    PRIMARY KEY (`id_seats`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `baggage` ADD CONSTRAINT `baggage_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id_bookings`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `baggage` ADD CONSTRAINT `baggage_passenger_id_fkey` FOREIGN KEY (`passenger_id`) REFERENCES `passengers`(`id_passengers`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_flight_id_fkey` FOREIGN KEY (`flight_id`) REFERENCES `flights`(`id_flights`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings_passengers` ADD CONSTRAINT `bookings_passengers_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id_bookings`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings_passengers` ADD CONSTRAINT `bookings_passengers_passenger_id_fkey` FOREIGN KEY (`passenger_id`) REFERENCES `passengers`(`id_passengers`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings_passengers` ADD CONSTRAINT `bookings_passengers_seat_id_fkey` FOREIGN KEY (`seat_id`) REFERENCES `seats`(`id_seats`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings_passengers` ADD CONSTRAINT `bookings_passengers_baggage_id_fkey` FOREIGN KEY (`baggage_id`) REFERENCES `baggage`(`id_baggage`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flights_logs` ADD CONSTRAINT `flights_logs_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id_admin`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `flights_logs` ADD CONSTRAINT `flights_logs_flight_id_fkey` FOREIGN KEY (`flight_id`) REFERENCES `flights`(`id_flights`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ground_services` ADD CONSTRAINT `ground_services_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id_bookings`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_passenger_id_fkey` FOREIGN KEY (`passenger_id`) REFERENCES `passengers`(`id_passengers`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id_bookings`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id_bookings`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seats` ADD CONSTRAINT `seats_flight_id_fkey` FOREIGN KEY (`flight_id`) REFERENCES `flights`(`id_flights`) ON DELETE RESTRICT ON UPDATE CASCADE;
