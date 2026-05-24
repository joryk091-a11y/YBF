import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
const match = url.match(regex);
const config = {
  host: match[3],
  user: match[1],
  password: match[2],
  port: match[4],
  database: match[5]
};

async function checkDb() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    
    const [users] = await connection.execute('SELECT count(*) as count FROM users');
    const [passengers] = await connection.execute('SELECT count(*) as count FROM passengers');
    const [bookings] = await connection.execute('SELECT count(*) as count FROM bookings');
    
    console.log('--- Database Status ---');
    console.log('Users:', users[0].count);
    console.log('Passengers:', passengers[0].count);
    console.log('Bookings:', bookings[0].count);
    
    if (passengers[0].count > 0) {
      const [latest] = await connection.execute('SELECT * FROM passengers ORDER BY id_passengers DESC LIMIT 5');
      console.log('\n--- Latest Passengers ---');
      console.table(latest);
    }

  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    if (connection) await connection.end();
  }
}

checkDb();
