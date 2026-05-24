import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.DATABASE_URL;
const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
const match = url.match(regex);
const config = {
  host: match[3], user: match[1],
  password: match[2], port: match[4], database: match[5]
};

const connection = await mysql.createConnection(config);

// بلقيس (BS) → SABA789
await connection.execute("UPDATE admins SET password = 'SABA789' WHERE airline_code = 'BS'");
// فلاي عدن (QY) → QUTAIBI456
await connection.execute("UPDATE admins SET password = 'QUTAIBI456' WHERE airline_code = 'QY'");

const [rows] = await connection.execute('SELECT email, password, role, airline_code FROM admins');
console.log('✅ تم التحديث:');
console.table(rows);

await connection.end();
