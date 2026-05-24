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

try {
  const connection = await mysql.createConnection(config);
  console.log('Database connected successfully!');
  await connection.end();
} catch (err) {
  console.error('Database connection failed:', err);
}
