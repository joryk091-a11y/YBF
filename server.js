import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

// Helper to parse DATABASE_URL
const getDbConfig = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // Fallback to standard local MySQL (e.g. XAMPP) if DATABASE_URL is not set in environment
    return {
      host: '127.0.0.1',
      user: 'root',
      password: '',
      port: 3306,
      database: 'airlines'
    };
  }
  // Format: mysql://user:password@host:port/database
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
  return url; // Return as string if regex fails, mysql2 might handle it
};

// ─── RESTful Auth Aliases ──────────────────────────────────────────────────
// Allow both legacy paths and new /api/auth/* paths

const authAliasHandler = (originalPath) => async (req, res, next) => {
  req.url = originalPath;
  next();
};

// ─── Passengers ─────────────────────────────────────────────────────────────
app.post('/api/passengers', async (req, res) => {
  const { passengers, userId } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(getDbConfig());
    const results = [];

    for (const p of passengers) {
      const birthDate = p.birthDate || null;

      // Upsert logic using MySQL
      const [existing] = await connection.execute(
        'SELECT id_passengers FROM passengers WHERE passport_number = ?',
        [p.passportNumber]
      );

      if (existing.length > 0) {
        await connection.execute(
          'UPDATE passengers SET name = ?, date_of_birth = ?, nationality = ?, gander = ?, user_id = ? WHERE passport_number = ?',
          [p.fullName, birthDate, p.nationality || null, p.gender, userId || null, p.passportNumber]
        );
        results.push({ id: existing[0].id_passengers, status: 'updated' });
      } else {
        const [insertResult] = await connection.execute(
          'INSERT INTO passengers (name, passport_number, date_of_birth, nationality, gander, user_id) VALUES (?, ?, ?, ?, ?, ?)',
          [p.fullName, p.passportNumber, birthDate, p.nationality || null, p.gender, userId || null]
        );
        results.push({ id: insertResult.insertId, status: 'created' });
      }
    }

    res.status(200).json({ success: true, passengers: results });
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// --- NEW USER ACCOUNT ENDPOINTS ---

// POST /api/auth/register — RESTful alias
app.post('/api/auth/register', async (req, res, next) => { req.url = '/api/register'; return registerHandler(req, res); });

async function registerHandler(req, res) {
  const { fullName, email, phone, password } = req.body;
  console.log('Register Request:', { fullName, email, phone });
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [existing] = await connection.execute('SELECT id_users FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل بالفعل' });
    }
    const [result] = await connection.execute(
      'INSERT INTO users (full_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())',
      [fullName, email, phone, password]
    );
    res.status(201).json({ success: true, userId: result.insertId });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}

app.post('/api/register', registerHandler);

// POST /api/auth/login — RESTful alias
app.post('/api/auth/login', async (req, res) => loginHandler(req, res));

async function loginHandler(req, res) {
  const { email, password } = req.body;
  console.log('Login Request:', { email });
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length > 0) {
      const user = rows[0];
      res.json({
        success: true,
        user: { id: user.id_users, fullName: user.full_name, email: user.email }
      });
    } else {
      res.status(401).json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}

app.post('/api/login', loginHandler);

app.get('/api/admin/users', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute('SELECT id_users, full_name, email, phone, password, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, users: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/admin/users', async (req, res) => {
  const { full_name, email, phone, password } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    
    // Check if email already exists
    const [existing] = await connection.execute('SELECT id_users FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل بالفعل' });
    }

    const [result] = await connection.execute(
      'INSERT INTO users (full_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())',
      [full_name, email, phone, password]
    );

    res.status(201).json({ success: true, userId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

app.put('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, password } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    // Check if email already exists for another user
    const [existing] = await connection.execute('SELECT id_users FROM users WHERE email = ? AND id_users != ?', [email, id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل بمستخدم آخر' });
    }

    if (password) {
      await connection.execute(
        'UPDATE users SET full_name = ?, email = ?, phone = ?, password = ? WHERE id_users = ?',
        [full_name, email, phone, password, id]
      );
    } else {
      await connection.execute(
        'UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id_users = ?',
        [full_name, email, phone, id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute('DELETE FROM users WHERE id_users = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


// GET Admin Dashboard stats from database
app.get('/api/admin/dashboard-stats', async (req, res) => {
  const { period, date } = req.query; // 'current_month', 'current_year' or YYYY-MM-DD
  const isCurrentMonth = period === 'current_month';
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const isCustomDate = date && dateRegex.test(date);
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    // شروط تصفية التواريخ للشهر الحالي أو السنة الحالية أو تاريخ محدد
    let dateFilterBookings;
    let dateFilterPayments;
    let dateFilterBookingsAnd;
    let dateFilterBookingsWhereAlias;

    if (isCustomDate) {
      dateFilterBookings = `WHERE DATE(booking_date) = '${date}'`;
      dateFilterPayments = `AND DATE(payment_date) = '${date}'`;
      dateFilterBookingsAnd = `AND DATE(booking_date) = '${date}'`;
      dateFilterBookingsWhereAlias = `WHERE DATE(b.booking_date) = '${date}'`;
    } else {
      dateFilterBookings = isCurrentMonth 
        ? "WHERE DATE_FORMAT(booking_date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')" 
        : "WHERE DATE_FORMAT(booking_date, '%Y') = DATE_FORMAT(NOW(), '%Y')";
        
      dateFilterPayments = isCurrentMonth 
        ? "AND DATE_FORMAT(payment_date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')" 
        : "AND DATE_FORMAT(payment_date, '%Y') = DATE_FORMAT(NOW(), '%Y')";
        
      dateFilterBookingsAnd = isCurrentMonth 
        ? "AND DATE_FORMAT(booking_date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')" 
        : "AND DATE_FORMAT(booking_date, '%Y') = DATE_FORMAT(NOW(), '%Y')";

      dateFilterBookingsWhereAlias = isCurrentMonth
        ? "WHERE DATE_FORMAT(b.booking_date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')"
        : "WHERE DATE_FORMAT(b.booking_date, '%Y') = DATE_FORMAT(NOW(), '%Y')";
    }

    // 1. Total tickets (number of passenger tickets booked)
    const [[{ totalTickets }]] = await connection.execute(
      `SELECT COALESCE(SUM(total_passengers), 0) as totalTickets FROM bookings ${dateFilterBookings}`
    );

    // 2. Total revenue (sum of amount of success payments)
    const [[{ totalRevenue }]] = await connection.execute(
      `SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM payments WHERE payment_status = 'success' ${dateFilterPayments}`
    );

    // 3. Pending payments (bookings count with 'temporary' status)
    const [[{ pendingPayments }]] = await connection.execute(
      `SELECT COUNT(*) as pendingPayments FROM bookings WHERE status = 'temporary' ${dateFilterBookingsAnd}`
    );

    // 4. Total users
    const [[{ totalUsers }]] = await connection.execute('SELECT COUNT(*) as totalUsers FROM users');

    // 5. Recent bookings
    const [recentBookings] = await connection.execute(`
      SELECT b.id_bookings, b.booking_reference, b.booking_date, b.total_passengers, b.final_price, b.status, 
             f.flight_number, f.airline_code, f.airportOrigin_code, f.airportDestination_code, f.departure_time,
             (SELECT p.name FROM bookings_passengers bp JOIN passengers p ON bp.passenger_id = p.id_passengers WHERE bp.booking_id = b.id_bookings LIMIT 1) as lead_passenger
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      ORDER BY b.booking_date DESC
      LIMIT 10
    `);

    // 6. Top Destinations and ticket counts (SUM of passengers)
    const [destinationsStats] = await connection.execute(`
      SELECT f.airportDestination_code as destination, COALESCE(SUM(b.total_passengers), 0) as count 
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      ${dateFilterBookingsWhereAlias}
      GROUP BY f.airportDestination_code
      ORDER BY count DESC
      LIMIT 5
    `);

    // 7. Monthly Sales and passenger count (last 6 months)
    const [monthlySales] = await connection.execute(`
      SELECT DATE_FORMAT(booking_date, '%Y-%m') as month, COALESCE(SUM(final_price), 0) as sales, COALESCE(SUM(total_passengers), 0) as passengers
      FROM bookings
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
      ORDER BY month ASC
      LIMIT 6
    `);

    // 7b. Daily Sales (last 14 days)
    const [dailySales] = await connection.execute(`
      SELECT DATE_FORMAT(booking_date, '%Y-%m-%d') as day, COALESCE(SUM(final_price), 0) as sales, COALESCE(SUM(total_passengers), 0) as passengers
      FROM bookings
      WHERE booking_date >= DATE_SUB(NOW(), INTERVAL 14 DAY)
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m-%d')
      ORDER BY day ASC
    `);

    // 8. Airline Share
    const [airlineStats] = await connection.execute(`
      SELECT f.airline_code as name, COUNT(b.id_bookings) as value
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      ${dateFilterBookingsWhereAlias}
      GROUP BY f.airline_code
    `);

    // 9. Class stats
    const [classStats] = await connection.execute(`
      SELECT s.seat_class as name, COUNT(bp.id_bookings_passengers) as value
      FROM bookings_passengers bp
      JOIN seats s ON bp.seat_id = s.id_seats
      JOIN bookings b ON bp.booking_id = b.id_bookings
      ${dateFilterBookingsWhereAlias}
      GROUP BY s.seat_class
    `);

    // 10. Active passengers
    const [[{ activePassengers }]] = await connection.execute(
      `SELECT COUNT(DISTINCT bp.passenger_id) as activePassengers FROM bookings_passengers bp JOIN bookings b ON bp.booking_id = b.id_bookings ${dateFilterBookingsWhereAlias}`
    );

    // 11. Cancellation Rate and Status Mapping
    const [[{ totalBookings }]] = await connection.execute(`SELECT COUNT(*) as totalBookings FROM bookings ${dateFilterBookings}`);
    const [[{ canceledBookings }]] = await connection.execute(
      `SELECT COUNT(*) as canceledBookings FROM bookings WHERE status = 'canceled' ${dateFilterBookingsAnd}`
    );
    const cancellationRate = totalBookings > 0 ? Number(((canceledBookings / totalBookings) * 100).toFixed(1)) : 0;

    const [statusStats] = await connection.execute(`
      SELECT status, COUNT(*) as count, COALESCE(SUM(final_price), 0) as amount 
      FROM bookings 
      ${dateFilterBookings}
      GROUP BY status
    `);

    // 12. Aircraft average pricing
    const [aircraftStats] = await connection.execute(`
      SELECT aircraft_type as name, COALESCE(AVG(price), 0) as price
      FROM flights
      GROUP BY aircraft_type
      HAVING price > 0
    `);

    res.json({
      success: true,
      stats: {
        totalTickets: totalTickets || 0,
        totalRevenue: Number(totalRevenue) || 0,
        pendingPayments: pendingPayments || 0,
        totalUsers: totalUsers || 0,
        activePassengers: activePassengers || 0,
        recentBookings,
        destinationsStats,
        monthlySales,
        dailySales,
        airlineStats,
        cancellationRate,
        statusStats,
        classStats: classStats.length > 0 ? classStats : [
          { name: 'economy', value: totalTickets ? Math.round(totalTickets * 0.7) : 0 },
          { name: 'business', value: totalTickets ? Math.round(totalTickets * 0.2) : 0 },
          { name: 'first', value: totalTickets ? Math.round(totalTickets * 0.1) : 0 }
        ],
        aircraftStats: aircraftStats.length > 0 ? aircraftStats : [
          { name: 'Boeing 787', price: 548 },
          { name: 'Airbus A350', price: 620 }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// GET all bookings for admin
app.get('/api/admin/bookings', async (req, res) => {
  const { date } = req.query;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    let query = `
      SELECT b.id_bookings, b.booking_reference, b.booking_date, b.total_passengers, b.base_price, b.extra_total, b.final_price, b.status,
             f.flight_number, f.airline_code, f.airportOrigin_code, f.airportDestination_code, f.departure_time, f.arrival_time, f.price as flight_price,
             p.payment_method, p.payment_status, p.tansaction_id, p.payment_date,
             (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM bookings_passengers bp JOIN passengers pass ON bp.passenger_id = pass.id_passengers WHERE bp.booking_id = b.id_bookings) as passengers
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      LEFT JOIN payments p ON p.booking_id = b.id_bookings
    `;
    const params = [];
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (date && dateRegex.test(date)) {
      query += ` WHERE DATE(b.booking_date) = ?`;
      params.push(date);
    }
    query += ` ORDER BY b.booking_date DESC`;

    const [rows] = await connection.execute(query, params);
    res.json({ success: true, bookings: rows });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// PATCH /api/admin/bookings/:id/status — RESTful
// POST kept as alias for backward compatibility
async function updateBookingStatusHandler(req, res) {
  const { id } = req.params;
  const { status, payment_status } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.beginTransaction();

    if (status) {
      await connection.execute(
        'UPDATE bookings SET status = ?, cancelled_date = ? WHERE id_bookings = ?',
        [status, status === 'canceled' ? new Date() : null, id]
      );
    }

    if (payment_status) {
      const [existingPayment] = await connection.execute(
        'SELECT id_payments FROM payments WHERE booking_id = ?',
        [id]
      );

      if (existingPayment.length > 0) {
        await connection.execute(
          'UPDATE payments SET payment_status = ?, payment_date = ? WHERE booking_id = ?',
          [payment_status, payment_status === 'success' ? new Date() : null, id]
        );
      } else {
        const [[bookingRow]] = await connection.execute(
          'SELECT final_price FROM bookings WHERE id_bookings = ?',
          [id]
        );
        const finalPrice = bookingRow ? bookingRow.final_price : 0;
        await connection.execute(
          'INSERT INTO payments (booking_id, amount, payment_method, payment_status, payment_date, tansaction_id) VALUES (?, ?, ?, ?, NOW(), ?)',
          [id, finalPrice, 'bank_transfer', payment_status, `ADM-TX-${id}-${Date.now()}`]
        );
      }
    }

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}

app.patch('/api/admin/bookings/:id/status', updateBookingStatusHandler);
app.post('/api/admin/bookings/:id/status', updateBookingStatusHandler);

// POST /api/auth/company/login — RESTful alias
app.post('/api/auth/company/login', async (req, res) => companyLoginHandler(req, res));

async function companyLoginHandler(req, res) {
  const { email, password } = req.body;
  console.log('Company Login Request:', { email });
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      'SELECT * FROM admins WHERE email = ? AND password = ?',
      [email, password]
    );
    if (rows.length > 0) {
      const admin = rows[0];
      await connection.execute('UPDATE admins SET last_login = NOW() WHERE id_admin = ?', [admin.id_admin]);
      res.json({
        success: true,
        role: admin.role,
        airline_code: admin.airline_code,
        id: admin.id_admin,
        email: admin.email,
      });
    } else {
      res.status(401).json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}

app.post('/api/company-login', companyLoginHandler);


// GET /api/bookings?userId= — RESTful route
// GET /api/my-bookings/:userId — legacy route (kept for compatibility)
async function getUserBookingsHandler(req, res) {
  const userId = req.params.userId || req.query.userId;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(`
      SELECT
        b.id_bookings,
        b.booking_reference,
        b.booking_date,
        b.total_passengers,
        b.final_price,
        b.status,
        MAX(f.flight_number) AS flight_number,
        MAX(f.airline_code) AS airline_code,
        MAX(f.airportOrigin_code) AS airportOrigin_code,
        MAX(f.airportDestination_code) AS airportDestination_code,
        MAX(f.departure_time) AS departure_time,
        MAX(f.arrival_time) AS arrival_time,
        MAX(f.duration) AS duration,
        MAX(py.payment_status) AS payment_status,
        MAX(py.payment_method) AS payment_method,
        MAX(py.payment_date) AS payment_date
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      LEFT JOIN payments py ON py.booking_id = b.id_bookings
      JOIN bookings_passengers bp ON bp.booking_id = b.id_bookings
      JOIN passengers p ON bp.passenger_id = p.id_passengers
      WHERE p.user_id = ?
      GROUP BY b.id_bookings, b.booking_reference, b.booking_date, b.total_passengers, b.final_price, b.status
      ORDER BY b.booking_date DESC
    `, [userId]);
    res.json({ success: true, bookings: rows });
  } catch (error) {
    console.error('My Bookings Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}

app.get('/api/bookings', getUserBookingsHandler);
app.get('/api/my-bookings/:userId', getUserBookingsHandler);

// GET /api/bookings/:id/passengers — RESTful route
// GET /api/booking-passengers/:bookingId — legacy route
async function getBookingPassengersHandler(req, res) {
  const bookingId = req.params.id || req.params.bookingId;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(`
      SELECT
        p.id_passengers,
        p.name,
        p.passport_number,
        p.date_of_birth,
        p.nationality,
        p.gander AS gender
      FROM bookings_passengers bp
      JOIN passengers p ON bp.passenger_id = p.id_passengers
      WHERE bp.booking_id = ?
      ORDER BY p.id_passengers ASC
    `, [bookingId]);
    res.json({ success: true, passengers: rows });
  } catch (error) {
    console.error('Booking Passengers Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}

app.get('/api/bookings/:id/passengers', getBookingPassengersHandler);
app.get('/api/booking-passengers/:bookingId', getBookingPassengersHandler);


// --- NEW FLIGHT MANAGEMENT ENDPOINTS ---

// Get all flights for a specific airline/company
app.get('/api/flights', async (req, res) => {
  const { airlineCode, date } = req.query;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    let query = 'SELECT * FROM flights WHERE 1=1';
    const params = [];
    if (airlineCode && airlineCode !== 'undefined' && airlineCode !== 'null' && airlineCode.trim() !== '') {
      query += ' AND airline_code = ?';
      params.push(airlineCode);
    }
    if (date && date !== 'undefined' && date !== 'null' && date.trim() !== '') {
      query += ' AND DATE(departure_time) = ?';
      params.push(date);
    }
    query += ' ORDER BY departure_time DESC';
    
    const [rows] = await connection.execute(query, params);
    res.json({ success: true, flights: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Add new flight
app.post('/api/flights', async (req, res) => {
  const f = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [result] = await connection.execute(
      'INSERT INTO flights (flight_number, airline_code, airportOrigin_code, airportDestination_code, departure_time, arrival_time, aircraft_type, total_seats, available_seats, status, price, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TIMESTAMPDIFF(MINUTE, ?, ?))',
      [f.flight_number, f.airline_code, f.airportOrigin_code, f.airportDestination_code, f.departure_time, f.arrival_time, f.aircraft_type, f.total_seats, f.available_seats, 'active', f.price || 0, f.departure_time, f.arrival_time]
    );
    res.json({ success: true, flightId: result.insertId });
  } catch (error) {
    console.error('Database INSERT Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Delete flight
app.delete('/api/flights/:id', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute('DELETE FROM flights WHERE id_flights = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});
// GET /api/flights/search — RESTful route
// GET /api/search-flights — legacy route
app.get('/api/flights/search', async (req, res) => { return searchFlightsHandler(req, res); });
app.get('/api/search-flights', async (req, res) => { return searchFlightsHandler(req, res); });
async function searchFlightsHandler(req, res) {
  let { from, to, date } = req.query;
  let connection;

  // Map common city names/keys to DB codes
  const codeMap = {
    'aden': 'ADE',
    'cairo': 'CAI',
    'riyadh': 'RUH',
    'jeddah': 'JED',
    'mukalla': 'RIY',
    'seiyun': 'GXF',
    'socotra': 'SCT',
    'amman': 'AMM',
    'kuwait': 'KWI',
    'djibouti': 'JIB',
    'addis': 'ADD'
  };

  const fromCode = (codeMap[from?.toLowerCase()] || from || '').toUpperCase();
  const toCode = (codeMap[to?.toLowerCase()] || to || '').toUpperCase();

  try {
    connection = await mysql.createConnection(getDbConfig());

    console.log(`Search Request: from=${fromCode}, to=${toCode}, date=${date}`);
    let query = 'SELECT * FROM flights WHERE 1=1';
    const params = [];

    if (fromCode) {
      query += ' AND airportOrigin_code = ?';
      params.push(fromCode);
    }
    if (toCode) {
      query += ' AND airportDestination_code = ?';
      params.push(toCode);
    }
    if (date && date !== 'undefined' && date !== 'null' && date.trim() !== '') {
      query += ' AND DATE(departure_time) = ?';
      params.push(date);
    }

    query += ' ORDER BY departure_time ASC';

    const [rows] = await connection.execute(query, params);
    res.json({ success: true, flights: rows });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}

// PUT /api/flights/:id — RESTful (replaces legacy POST)
app.put('/api/flights/:id', async (req, res) => {
  const f = req.body;
  const { id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute(
      'UPDATE flights SET flight_number = ?, airline_code = ?, airportOrigin_code = ?, airportDestination_code = ?, departure_time = ?, arrival_time = ?, aircraft_type = ?, total_seats = ?, available_seats = ?, price = ?, duration = TIMESTAMPDIFF(MINUTE, ?, ?), `update` = NOW() WHERE id_flights = ?',
      [f.flight_number, f.airline_code, f.airportOrigin_code, f.airportDestination_code, f.departure_time, f.arrival_time, f.aircraft_type, f.total_seats, f.available_seats, f.price, f.departure_time, f.arrival_time, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Database UPDATE Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  const { flightId, passengers, totalPrice, basePrice, extraBags, selectedServices, extrasTotal, paymentMethod: rawMethod, reference, userId } = req.body;

  const serviceDataMap = {
    'wheelchair': { label: 'مساعدة بالكرسي المتحرك', price: 20 },
    'oxygen': { label: 'أكسجين طبي على المتن', price: 55 },
    'medical': { label: 'مساعدة طبية متخصصة', price: 80 },
    'medmeal': { label: 'وجبة غذائية طبية', price: 18 }
  };

  // Map frontend payment method to DB Enum values
  const methodMap = {
    'card': 'credit_card',
    'paypal': 'paypal',
    'branch': 'bank_transfer', // 'branch_payment' is missing from DB Enum
    'transfer': 'bank_transfer'
  };
  const paymentMethod = methodMap[rawMethod] || 'credit_card';

  const bookingStatus = (rawMethod === 'branch' || rawMethod === 'transfer') ? 'temporary' : 'certain';
  const paymentStatus = (rawMethod === 'branch' || rawMethod === 'transfer') ? 'pending' : 'success';

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.beginTransaction();

    // 1. Create the booking record
    const [bookingResult] = await connection.execute(
      'INSERT INTO bookings (flight_id, booking_date, total_passengers, base_price, extra_total, final_price, status, booking_reference) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)',
      [flightId, passengers.length, basePrice || (totalPrice / passengers.length), extrasTotal || 0, totalPrice, bookingStatus, reference]
    );
    const bookingId = bookingResult.insertId;

    // 2. Process each passenger
    for (const p of passengers) {
      // Handle different field naming conventions from frontend
      const pName = p.name || p.fullName || 'مسافر';
      const pPassport = p.passport_number || p.passportNumber || `TMP-${Math.random()}`;
      const pDob = p.date_of_birth || p.birthDate || null;
      const pNationality = p.nationality || '';
      const pGender = (p.gender || p.gander || 'male').toLowerCase();

      // Check if passenger exists by passport number or create new
      let passengerId;
      const [existing] = await connection.execute('SELECT id_passengers FROM passengers WHERE passport_number = ?', [pPassport]);

      if (existing.length > 0) {
        passengerId = existing[0].id_passengers;
        // Link to user if not already linked
        await connection.execute('UPDATE passengers SET user_id = ? WHERE id_passengers = ? AND user_id IS NULL', [userId || null, passengerId]);
      } else {
        const [passResult] = await connection.execute(
          'INSERT INTO passengers (name, passport_number, date_of_birth, nationality, gander, user_id) VALUES (?, ?, ?, ?, ?, ?)',
          [pName, pPassport, pDob, pNationality, pGender, userId || null]
        );
        passengerId = passResult.insertId;
      }
      await connection.execute(
        'INSERT INTO bookings_passengers (booking_id, passenger_id) VALUES (?, ?)',
        [bookingId, passengerId]
      );

      // 3. Add baggage if selected
      const extraBagsCount = extraBags ? Number(extraBags[p.id] || 0) : 0;
      // Always add at least a base baggage record if it's expected, 
      // but here we specifically add the extra baggage data.
      if (extraBagsCount > 0) {
        await connection.execute(
          'INSERT INTO baggage (booking_id, passenger_id, weight, base_price, extra_price) VALUES (?, ?, ?, ?, ?)',
          [bookingId, passengerId, 23.0, 0, extraBagsCount * 35]
        );
      }
    }

    // 4. Process Ground Services
    if (selectedServices && Array.isArray(selectedServices)) {
      for (const serviceId of selectedServices) {
        const srv = serviceDataMap[serviceId];
        if (srv) {
          await connection.execute(
            'INSERT INTO ground_services (booking_id, service_name, price, is_active, created_at) VALUES (?, ?, ?, ?, NOW())',
            [bookingId, srv.label, srv.price, 1]
          );
        }
      }
    }

    // 5. Create payment record
    await connection.execute(
      'INSERT INTO payments (booking_id, amount, payment_method, payment_status, payment_date) VALUES (?, ?, ?, ?, NOW())',
      [bookingId, totalPrice, paymentMethod, paymentStatus]
    );

    await connection.commit();
    res.json({ success: true, bookingId, reference });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Booking Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// ─── Notifications API ─────────────────────────────────────────────────────

// Get notifications for a user (direct via user_id)
app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    res.json({ success: true, notifications: rows });
  } catch (error) {
    console.error('Notifications Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute('UPDATE notifications SET is_read = 1 WHERE id_notifications = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Mark all notifications as read for a user (direct via user_id)
app.patch('/api/notifications/read-all/:userId', async (req, res) => {
  const { userId } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Delete a notification
app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute('DELETE FROM notifications WHERE id_notifications = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


// --- COMPANY MANAGEMENT ENDPOINTS ---

// Get all companies (admins with role = 'company')
app.get('/api/admin/companies', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      "SELECT id_admin, email, password, role, airline_code, last_login, created_at FROM admins WHERE role = 'company' ORDER BY created_at DESC"
    );
    res.json({ success: true, companies: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Create a new company
app.post('/api/admin/companies', async (req, res) => {
  const { email, password, airline_code } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    
    // Check if email already exists
    const [existing] = await connection.execute('SELECT id_admin FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل بالفعل' });
    }

    // Get next auto-increment id
    const [maxIdRows] = await connection.execute('SELECT COALESCE(MAX(id_admin), 0) + 1 as nextId FROM admins');
    const nextId = maxIdRows[0].nextId;

    await connection.execute(
      "INSERT INTO admins (id_admin, email, password, role, airline_code, created_at) VALUES (?, ?, ?, 'company', ?, NOW())",
      [nextId, email, password, airline_code]
    );

    res.status(201).json({ success: true, companyId: nextId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Update a company
app.put('/api/admin/companies/:id', async (req, res) => {
  const { id } = req.params;
  const { email, password, airline_code } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    // Check if email already exists for another user
    const [existing] = await connection.execute('SELECT id_admin FROM admins WHERE email = ? AND id_admin != ?', [email, id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل بمستخدم آخر' });
    }

    await connection.execute(
      "UPDATE admins SET email = ?, password = ?, airline_code = ? WHERE id_admin = ? AND role = 'company'",
      [email, password, airline_code, id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Delete a company
app.delete('/api/admin/companies/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute("DELETE FROM admins WHERE id_admin = ? AND role = 'company'", [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


// Seed default admin account
const seedAdmin = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute('SELECT id_admin FROM admins WHERE email = ?', ['admin@gmail.com']);
    if (rows.length === 0) {
      const [maxIdRows] = await connection.execute('SELECT COALESCE(MAX(id_admin), 0) + 1 as nextId FROM admins');
      const nextId = maxIdRows[0].nextId;
      await connection.execute(
        'INSERT INTO admins (id_admin, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
        [nextId, 'admin@gmail.com', 'ADMIN123', 'admin']
      );
      console.log('Seeded default admin account (admin@gmail.com) successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin account:', error);
  } finally {
    if (connection) await connection.end();
  }
};

// PATCH /api/bookings/:id/cancel — RESTful route
// POST /api/bookings/cancel — legacy route (kept for compatibility)
async function cancelBookingHandler(req, res) {
  const bookingId = req.params.id || req.body.bookingId;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute(
      "UPDATE bookings SET status = 'cancelled' WHERE id_bookings = ?",
      [bookingId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}

app.patch('/api/bookings/:id/cancel', cancelBookingHandler);
app.post('/api/bookings/cancel', cancelBookingHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  seedAdmin();
});
