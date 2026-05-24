import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function add() {
  const c = await mysql.createConnection(process.env.DATABASE_URL);
  await c.execute(`
    INSERT INTO flights 
    (flight_number, airline_code, airportOrigin_code, airportDestination_code, departure_time, arrival_time, aircraft_type, total_seats, available_seats, status, price) 
    VALUES 
    ('YF-AUTO', 'IY', 'ADE', 'RIY', '2026-12-01 08:00:00', '2026-12-01 09:30:00', 'A320', 150, 150, 'active', 120)
  `);
  console.log('Flight added: ADE to RIY (Aden to Mukalla)');
  process.exit();
}
add();
