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
    console.log('Connecting to database...');
    connection = await mysql.createConnection(config);

    console.log('Creating admins table if not exists...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id_admin\` int NOT NULL AUTO_INCREMENT,
        \`email\` varchar(100) NOT NULL UNIQUE,
        \`password\` varchar(255) NOT NULL,
        \`role\` enum('admin', 'company') NOT NULL DEFAULT 'company',
        \`airline_code\` varchar(10) DEFAULT NULL,
        \`last_login\` timestamp NULL DEFAULT NULL,
        \`created_at\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id_admin\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Admins table created successfully.');

    console.log('Seeding default admin...');
    const [rows] = await connection.execute('SELECT id_admin FROM admins WHERE email = ?', ['admin@gmail.com']);
    if (rows.length === 0) {
      await connection.execute(
        'INSERT INTO admins (email, password, role) VALUES (?, ?, ?)',
        ['admin@gmail.com', 'ADMIN123', 'admin']
      );
      console.log('Seeded default admin account (admin@gmail.com) successfully.');
    } else {
      console.log('Admin account already exists.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

main();
