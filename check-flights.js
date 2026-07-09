import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const getDbConfig = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return url;
};

async function check() {
  let connection;
  try {
    const config = getDbConfig();
    console.log('Connecting with config:', typeof config === 'string' ? 'string' : config.database);
    connection = await mysql.createConnection(config);
    const [rows] = await connection.execute('SELECT * FROM flights');
    console.log('Total Flights in DB:', rows.length);
    if (rows.length > 0) {
      console.log('Sample Flights:');
      console.log(rows.slice(0, 5));
    } else {
      console.log('No flights found in database.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

check();
