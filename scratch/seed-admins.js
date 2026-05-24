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

const admins = [
  { email: 'admin@ybf.com',    password: 'ADMIN123',    role: 'admin',   airline_code: null },
  { email: 'yemenia@ybf.com',  password: 'YEMENIA123',  role: 'company', airline_code: 'IY' },
  { email: 'balqis@ybf.com',   password: 'QUTAIBI456',  role: 'company', airline_code: 'BS' },
  { email: 'aden@ybf.com',     password: 'SABA789',     role: 'company', airline_code: 'QY' },
];

let connection;
try {
  connection = await mysql.createConnection(config);
  
  // Clear existing and re-insert
  await connection.execute('DELETE FROM admins');
  
  for (const a of admins) {
    await connection.execute(
      'INSERT INTO admins (email, password, role, airline_code) VALUES (?, ?, ?, ?)',
      [a.email, a.password, a.role, a.airline_code]
    );
  }

  const [rows] = await connection.execute('SELECT id_admin, email, role, airline_code FROM admins');
  console.log('✅ تم إدراج بيانات الأدمن والشركات بنجاح:');
  console.table(rows);

} catch (err) {
  console.error('❌ Error:', err);
} finally {
  if (connection) await connection.end();
}
