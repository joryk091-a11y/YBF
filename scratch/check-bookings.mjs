import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config();

const url = process.env.DATABASE_URL;
let config;
if (!url) {
  config = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    port: 3306,
    database: 'airlines'
  };
} else {
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);
  config = { host: match[3], user: match[1], password: match[2], port: Number(match[4]), database: match[5] };
}

const conn = await mysql.createConnection(config);

// Test the exact query used in the API for user_id = 1
const [rows] = await conn.execute(`
  SELECT
    b.id_bookings,
    b.booking_reference,
    b.status,
    f.flight_number,
    f.airline_code,
    py.payment_status,
    py.payment_method,
    p.name as passenger_name,
    p.user_id
  FROM bookings b
  JOIN flights f ON b.flight_id = f.id_flights
  LEFT JOIN payments py ON py.booking_id = b.id_bookings
  JOIN bookings_passengers bp ON bp.booking_id = b.id_bookings
  JOIN passengers p ON bp.passenger_id = p.id_passengers
  WHERE p.user_id = ?
  GROUP BY b.id_bookings
  ORDER BY b.booking_date DESC
`, [1]);

console.log('RESULT for user_id=1:', JSON.stringify(rows, null, 2));

// Check payments table
const [payments] = await conn.execute('SELECT * FROM payments LIMIT 10');
console.log('ALL PAYMENTS:', JSON.stringify(payments, null, 2));

await conn.end();
