import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Jory774432',
  database: 'airlines',
  port: 3306,
};

async function run() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to DB successfully!');
    
    const [companies] = await connection.execute('SELECT * FROM companies');
    console.log('Companies:', companies);
    
    const [flights] = await connection.execute('SELECT * FROM flights');
    console.log('Flights count:', flights.length);
    if (flights.length > 0) {
      console.log('Sample Flight:', flights[0]);
    }
    
    const [bookings] = await connection.execute('SELECT * FROM bookings');
    console.log('Bookings count:', bookings.length);
    if (bookings.length > 0) {
      console.log('Sample Booking:', bookings[0]);
    }

    const [payments] = await connection.execute('SELECT * FROM payments');
    console.log('Payments count:', payments.length);
    if (payments.length > 0) {
      console.log('Sample Payment:', payments[0]);
    }

  } catch (error) {
    console.error('Error querying DB:', error);
  } finally {
    if (connection) await connection.end();
  }
}

run();
