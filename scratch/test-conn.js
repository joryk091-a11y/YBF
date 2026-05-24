import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const getDbConfig = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
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

async function test() {
  let connection;
  try {
    const config = getDbConfig();
    console.log("Config:", config);
    connection = await mysql.createConnection(config);
    console.log("Connected to DB successfully!");

    const [tables] = await connection.execute("SHOW TABLES");
    console.log("Tables in database:", tables);

    const [users] = await connection.execute("SELECT * FROM users");
    console.log("Users count:", users.length);
    console.log("Users:", users);

    const [admins] = await connection.execute("SELECT * FROM admins");
    console.log("Admins count:", admins.length);
    console.log("Admins:", admins);

  } catch (err) {
    console.error("Error occurred:", err);
  } finally {
    if (connection) await connection.end();
  }
}

test();
