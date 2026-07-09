import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const getDbConfig = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not defined in .env file!');
    process.exit(1);
  }
  return url;
};

async function seed() {
  let connection;
  try {
    const config = getDbConfig();
    console.log('Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('Connected successfully. Starting seeding process...\n');

    // Disable foreign key checks to safely truncate
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    console.log('Clearing old database records...');
    await connection.query('TRUNCATE TABLE bookings_passengers');
    await connection.query('TRUNCATE TABLE baggage');
    await connection.query('TRUNCATE TABLE ground_services');
    await connection.query('TRUNCATE TABLE payments');
    await connection.query('TRUNCATE TABLE notifications');
    await connection.query('TRUNCATE TABLE bookings');
    await connection.query('TRUNCATE TABLE seats');
    await connection.query('TRUNCATE TABLE flights_logs');
    await connection.query('TRUNCATE TABLE flights');
    await connection.query('TRUNCATE TABLE passengers');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('TRUNCATE TABLE admins');
    await connection.query('TRUNCATE TABLE companies'); 
    try { await connection.query('TRUNCATE TABLE chat_messages'); } catch (e) {}
    try { await connection.query('TRUNCATE TABLE chat_sessions'); } catch (e) {}

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database tables cleared successfully.\n');

    // 1. Insert Companies
    console.log('Inserting Companies...');
    const companies = [
      ['الخطوط الجوية اليمنية', 'IY'],
      ['طيران بلقيس', 'BS'],
      ['طيران فلاي عدن', 'QY']
    ];
    for (const company of companies) {
      await connection.execute(
        'INSERT INTO companies (company_name, airline_code) VALUES (?, ?)',
        company
      );
    }
    console.log('Companies inserted.');

    // 2. Insert Admins
    console.log('Inserting Admins...');
    const admins = [
      [1, 'admin', 'ADMIN123', 'admin', null, '1', 'الادارة'],
      [2, 'yemenia', 'YEMENIA123', 'company', 'IY', '2', 'اليمنية'],
      [3, 'balqis', 'BALQIS123', 'company', 'BS', '3', 'بلقيس'],
      [4, 'aden', 'ADEN123', 'company', 'QY', '4', 'عدن']
    ];
    for (const admin of admins) {
      const hashedPassword = await bcrypt.hash(admin[2], 10);
      const adminData = [...admin];
      adminData[2] = hashedPassword;
      await connection.execute(
        'INSERT INTO admins (id_admin, username, password, role, airline_code, employee_id, department, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        adminData
      );
    }
    console.log('Admins inserted.');

    // 3. Insert Users
    console.log('Inserting Users...');
    const users = [
      [1, 'محمد علي', '777777777', 'user@gmail.com', 'user123']
    ];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user[4], 10);
      const userData = [...user];
      userData[4] = hashedPassword;
      await connection.execute(
        'INSERT INTO users (id_users, full_name, phone, email, password, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        userData
      );
    }
    console.log('Users inserted.');

    // 4. Insert Flights (Scheduled in the future)
    console.log('Inserting Flights...');
    const now = new Date();
    
    // Tomorrow flights
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dep1 = new Date(tomorrow); dep1.setHours(8, 0, 0, 0);
    const arr1 = new Date(tomorrow); arr1.setHours(11, 30, 0, 0);
    const dep2 = new Date(tomorrow); dep2.setHours(14, 0, 0, 0);
    const arr2 = new Date(tomorrow); arr2.setHours(17, 30, 0, 0);

    // In 2 days flights
    const in2Days = new Date(now);
    in2Days.setDate(in2Days.getDate() + 2);
    const dep3 = new Date(in2Days); dep3.setHours(9, 0, 0, 0);
    const arr3 = new Date(in2Days); arr3.setHours(11, 30, 0, 0);
    const dep4 = new Date(in2Days); dep4.setHours(15, 0, 0, 0);
    const arr4 = new Date(in2Days); arr4.setHours(17, 30, 0, 0);

    // In 3 days flights
    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);
    const dep5 = new Date(in3Days); dep5.setHours(10, 0, 0, 0);
    const arr5 = new Date(in3Days); arr5.setHours(12, 30, 0, 0);
    const dep6 = new Date(in3Days); dep6.setHours(16, 0, 0, 0);
    const arr6 = new Date(in3Days); arr6.setHours(18, 30, 0, 0);

    const flights = [
      [1, 'IY101', 'IY', 'ADE', 'CAI', dep1, arr1, 210, 'Airbus A320', 150, 150, 'active', 450.00],
      [2, 'IY102', 'IY', 'CAI', 'ADE', dep2, arr2, 210, 'Airbus A320', 150, 150, 'active', 480.00],
      [3, 'BS201', 'BS', 'ADE', 'JED', dep3, arr3, 150, 'Boeing 737', 120, 120, 'active', 380.00],
      [4, 'BS202', 'BS', 'JED', 'ADE', dep4, arr4, 150, 'Boeing 737', 120, 120, 'active', 390.00],
      [5, 'QY301', 'QY', 'ADE', 'RUH', dep5, arr5, 150, 'Boeing 737', 120, 120, 'active', 420.00],
      [6, 'QY302', 'QY', 'RUH', 'ADE', dep6, arr6, 150, 'Boeing 737', 120, 120, 'active', 430.00]
    ];

    for (const flight of flights) {
      await connection.execute(
        'INSERT INTO flights (id_flights, flight_number, airline_code, airportOrigin_code, airportDestination_code, departure_time, arrival_time, duration, aircraft_type, total_seats, available_seats, status, price, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        flight
      );
    }
    console.log('Flights inserted.');

    // 5. Insert Passengers
    console.log('Inserting Passengers...');
    const passengers = [
      [1, 'محمد علي', 'P123456', '1990-01-01', 'يمني', 'male', 1],
      [2, 'سارة أحمد', 'P654321', '1995-05-15', 'يمنية', 'female', 1]
    ];
    for (const passenger of passengers) {
      await connection.execute(
        'INSERT INTO passengers (id_passengers, name, passport_number, date_of_birth, nationality, gander, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        passenger
      );
    }
    console.log('Passengers inserted.');

    // 6. Insert Bookings
    console.log('Inserting Bookings...');
    const bookings = [
      [1, 1, new Date(), 2, 450.00, 0.00, 900.00, 'certain', 'PNR101'],
      [2, 3, new Date(), 1, 380.00, 0.00, 380.00, 'temporary', 'PNR201']
    ];
    for (const booking of bookings) {
      await connection.execute(
        'INSERT INTO bookings (id_bookings, flight_id, booking_date, total_passengers, base_price, extra_total, final_price, status, booking_reference) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        booking
      );
    }
    console.log('Bookings inserted.');

    // 7. Insert Payments
    console.log('Inserting Payments...');
    const payments = [
      [1, 1, 900.00, 'credit_card', 'TXN-998877', 'success'],
      [2, 2, 380.00, 'paypal', 'TXN-112233', 'pending']
    ];
    for (const payment of payments) {
      await connection.execute(
        'INSERT INTO payments (id_payments, booking_id, amount, payment_method, tansaction_id, payment_status, payment_date) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        payment
      );
    }
    console.log('Payments inserted.');

    // 8. Insert Booking Passengers Link
    console.log('Inserting Booking Passengers Link...');
    const bookingPassengers = [
      [1, 1, 1],
      [2, 1, 2],
      [3, 2, 1]
    ];
    for (const bp of bookingPassengers) {
      await connection.execute(
        'INSERT INTO bookings_passengers (id_bookings_passengers, booking_id, passenger_id) VALUES (?, ?, ?)',
        bp
      );
    }
    console.log('Booking Passengers Links inserted.');

    console.log('\nSeeding completed successfully! 🎉');
    console.log('Your local MySQL database has been populated with mock data.');

  } catch (err) {
    console.error('Error during seeding:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

seed();