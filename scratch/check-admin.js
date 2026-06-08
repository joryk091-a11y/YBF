import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const getDbConfig = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return {
      host: '127.0.0.1',
      user: 'root',
      password: '',
      port: 3306,
      database: 'airlines'
    };
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

async function main() {
  let connection;
  try {
    const config = getDbConfig();
    console.log('Connecting to database with config:', { ...config, password: config.password ? '****' : '' });
    connection = await mysql.createConnection(config);
    const [rows] = await connection.execute('SELECT * FROM admins');
    console.log('Admins in database:', rows);
  } catch (error) {
    console.error('Database query error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

main();
