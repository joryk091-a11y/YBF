import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const getDbConfig = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not defined in .env file!');
    process.exit(1);
  }
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  if (match) {
    return {
      host: match[3],
      user: match[1],
      password: match[2],
      port: match[4],
      database: match[5]
    };
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

    // تعطيل التحقق من القيود مؤقتاً لتفريغ الجداول بأمان
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
    await connection.query('TRUNCATE TABLE airline_companies'); 

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database tables cleared successfully.\n');

    // 1. Insert Airline Companies 
    console.log('Inserting Airline Companies...');
    const companies = [
      ['خطوط طيران اليمنية', 'IY', 'Yemen', 'active'],
      ['مصر للطيران', 'MS', 'Egypt', 'active']
    ];
    
    const companyIds = {};
    for (const company of companies) {
      const [res] = await connection.execute(
        'INSERT INTO airline_companies (airline_name, airline_code, country, status, created_at) VALUES (?, ?, ?, ?, NOW())',
        [company[0], company[1], company[2], company[3]]
      );
      companyIds[company[1]] = res.insertId; 
    }
    console.log('Airline Companies inserted.');

    // 2. Insert Admins
    console.log('Inserting Admins...');
    const admins = [
      ['admin@gmail.com', 'admin123', 'admin', null, null],
      ['yemenia@gmail.com', 'yemenia123', 'company', 'IY', companyIds['IY']],
      ['egyptair@gmail.com', 'egyptair123', 'company', 'MS', companyIds['MS']]
    ];
    for (const admin of admins) {
      await connection.execute(
        'INSERT INTO admins (email, password, role, airline_code, airlineId_airline, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        admin
      );
    }
    console.log('Admins inserted.');

    // 3. Insert Users
    console.log('Inserting Users...');
    const users = [
      ['محمد علي', 'user@gmail.com', '777777777', 'user123']
    ];
    for (const user of users) {
      await connection.execute(
        'INSERT INTO users (full_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())',
        user
      );
    }
    console.log('Users inserted.');

    // 4. Insert Flights
    console.log('Inserting Flights...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const departure1 = new Date(tomorrow); departure1.setHours(8, 0, 0, 0);
    const arrival1 = new Date(tomorrow); arrival1.setHours(11, 30, 0, 0);
    const departure2 = new Date(tomorrow); departure2.setHours(14, 0, 0, 0);
    const arrival2 = new Date(tomorrow); arrival2.setHours(17, 30, 0, 0);

    const flights = [
      ['IY101', 'IY', companyIds['IY'], 'ADE', 'CAI', departure1, arrival1, 'Airbus A320', 150, 150, 'active', 450.00, 210],
      ['IY102', 'IY', companyIds['IY'], 'CAI', 'ADE', departure2, arrival2, 'Airbus A320', 150, 150, 'active', 480.00, 210]
    ];

    for (const flight of flights) {
      await connection.execute(
        'INSERT INTO flights (flight_number, airline_code, airline_id, airportOrigin_code, airportDestination_code, departure_time, arrival_time, aircraft_type, total_seats, available_seats, status, price, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        flight
      );
    }
    console.log('Flights inserted.');

    console.log('\nSeeding completed successfully! 🎉');
    console.log('Your local MySQL database has been populated with mock data.');

  } catch (err) {
    console.error('Error during seeding:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

seed();