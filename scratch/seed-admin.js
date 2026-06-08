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

const seedAdmin = async () => {
  let connection;
  try {
    const config = getDbConfig();
    connection = await mysql.createConnection(config);
    const [rows] = await connection.execute('SELECT id_admin FROM admins WHERE email = ?', ['admin@gmail.com']);
    if (rows.length === 0) {
      const [maxIdRows] = await connection.execute('SELECT COALESCE(MAX(id_admin), 0) + 1 as nextId FROM admins');
      const nextId = maxIdRows[0].nextId;
      await connection.execute(
        'INSERT INTO admins (id_admin, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
        [nextId, 'admin@gmail.com', 'ADMIN123', 'admin']
      );
      console.log('Seeded default admin account (admin@gmail.com) successfully.');
    } else {
      console.log('Admin account already exists.');
    }
  } catch (error) {
    console.error('Error seeding admin account:', error);
  } finally {
    if (connection) await connection.end();
  }
};

seedAdmin();
