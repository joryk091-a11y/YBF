import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
const match = url.match(regex);
const config = match ? {
  host: match[3],
  user: match[1],
  password: match[2],
  port: match[4],
  database: match[5]
} : url;

async function check() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected to MySQL successfully!');
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables in database:', tables);
    
    // Check users table columns
    try {
      try {
        console.log('Altering "notifications" table to add "user_id" column...');
        await connection.execute(`
          ALTER TABLE notifications 
          ADD COLUMN user_id INT NULL, 
          ADD CONSTRAINT fk_notifications_users FOREIGN KEY (user_id) REFERENCES users(id_users) ON DELETE SET NULL
        `);
        console.log('"user_id" column and foreign key added successfully!');
      } catch (alterError) {
        console.log('Migration status:', alterError.message);
      }

      const [columns] = await connection.execute('DESCRIBE notifications');
      console.log('Columns in "notifications" table after migration:', columns);
      
      const [usersCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log('Number of users in "users" table:', usersCount[0].count);
      
      const [allUsers] = await connection.execute('SELECT * FROM users');
      console.log('Users (with passwords):', allUsers);

      const [allAdmins] = await connection.execute('SELECT * FROM admins');
      console.log('Admins (with passwords):', allAdmins);
    } catch (e) {
      console.error('Error querying "users" table:', e.message);
    }
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    if (connection) await connection.end();
  }
}

check();
