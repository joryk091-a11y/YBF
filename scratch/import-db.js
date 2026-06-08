import mysql from 'mysql2/promise';
import fs from 'fs';
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
    let connConfig;
    
    if (typeof config === 'string') {
      console.log('Connecting to database using connection URI string...');
      connConfig = config + (config.includes('?') ? '&' : '?') + 'multipleStatements=true';
    } else {
      console.log('Connecting to database using connection object...');
      connConfig = {
        ...config,
        multipleStatements: true
      };
    }

    connection = await mysql.createConnection(connConfig);

    console.log('Reading database.sql...');
    const sql = fs.readFileSync('database.sql', 'utf8');

    console.log('Importing schema and data into MySQL...');
    await connection.query(sql);
    console.log('Database imported successfully!');
  } catch (error) {
    console.error('Import error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

main();
