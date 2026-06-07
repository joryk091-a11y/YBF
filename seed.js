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

    // Enable foreign key checks bypass during truncation if needed, but we'll delete in correct order
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

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database tables cleared successfully.\n');

    // 1. Insert Admins
    console.log('Inserting Admins...');
    const admins = [
      ['admin@gmail.com', 'admin123', 'admin', null],
      ['yemenia@gmail.com', 'yemenia123', 'company', 'IY'],
      ['egyptair@gmail.com', 'egyptair123', 'company', 'MS']
    ];
    for (const admin of admins) {
      await connection.execute(
        'INSERT INTO admins (email, password, role, airline_code, created_at) VALUES (?, ?, ?, ?, NOW())',
        admin
      );
    }
    console.log('Admins inserted.');

    // 2. Insert Users
    console.log('Inserting Users...');
    const users = [
      ['محمد علي', 'user@gmail.com', '777777777', 'user123']
    ];
    let insertedUserId;
    for (const user of users) {
      const [res] = await connection.execute(
        'INSERT INTO users (full_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())',
        user
      );
      insertedUserId = res.insertId;
    }
    console.log('Users inserted.');

    // 3. Insert Flights
    console.log('Inserting Flights...');
    
    // Create tomorrow's dates for realism
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const departure1 = new Date(tomorrow);
    departure1.setHours(8, 0, 0, 0);
    const arrival1 = new Date(tomorrow);
    arrival1.setHours(11, 30, 0, 0);

    const departure2 = new Date(tomorrow);
    departure2.setHours(14, 0, 0, 0);
    const arrival2 = new Date(tomorrow);
    arrival2.setHours(17, 30, 0, 0);

    const departure3 = new Date(tomorrow);
    departure3.setHours(10, 0, 0, 0);
    const arrival3 = new Date(tomorrow);
    arrival3.setHours(13, 30, 0, 0);

    const flights = [
      ['IY101', 'IY', 'ADE', 'CAI', departure1, arrival1, 'Airbus A320', 150, 150, 'active', 450.00, 210],
      ['IY102', 'IY', 'CAI', 'ADE', departure2, arrival2, 'Airbus A320', 150, 150, 'active', 480.00, 210],
      ['MS201', 'MS', 'CAI', 'RUH', departure3, arrival3, 'Boeing 737', 200, 200, 'active', 350.00, 210]
    ];

    const insertedFlightIds = [];
    for (const flight of flights) {
      const [res] = await connection.execute(
        'INSERT INTO flights (flight_number, airline_code, airportOrigin_code, airportDestination_code, departure_time, arrival_time, aircraft_type, total_seats, available_seats, status, price, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        flight
      );
      insertedFlightIds.push({ id: res.insertId, number: flight[0], price: flight[10] });
    }
    console.log('Flights inserted.');

    // 4. Insert Seats for Flights
    console.log('Inserting Seats for flights...');
    // We will generate 5 sample seats for each flight (to test with)
    const seatClasses = ['economy', 'business', 'first'];
    for (const flight of insertedFlightIds) {
      const seats = [
        ['1A', 'first', 1, flight.price * 2.0],
        ['2B', ' business', 1, flight.price * 1.5],
        ['10C', 'economy', 1, flight.price],
        ['11D', 'economy', 1, flight.price],
        ['12E', 'economy', 1, flight.price]
      ];
      for (const seat of seats) {
        // Seat number needs to be globally unique due to @unique constraint on seat_number
        const uniqueSeatNumber = `${flight.number}-${seat[0]}`;
        await connection.execute(
          'INSERT INTO seats (flight_id, seat_number, seat_class, is_available, seat_price) VALUES (?, ?, ?, ?, ?)',
          [flight.id, uniqueSeatNumber, seat[1], seat[2], seat[3]]
        );
      }
    }
    console.log('Seats inserted.');

    console.log('\nSeeding completed successfully! 🎉');
    console.log('Your local MySQL database has been populated with mock data.');
    console.log('Admins created:');
    console.log('  - Admin: admin@gmail.com / admin123');
    console.log('  - Yemenia Company: yemenia@gmail.com / yemenia123');
    console.log('  - EgyptAir Company: egyptair@gmail.com / egyptair123');
    console.log('Users created:');
    console.log('  - User: user@gmail.com / user123');

  } catch (err) {
    console.error('Error during seeding:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
