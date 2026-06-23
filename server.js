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


// ===== LIVE SUPPORT CHAT API ENDPOINTS =====

// 1. GET chat history for a specific conversation thread (by email)
app.get('/api/chat/messages', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, error: 'البريد الإلكتروني مطلوب' });
  }
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [messages] = await connection.execute(
      'SELECT * FROM chat_messages WHERE sender_email = ? ORDER BY created_at ASC',
      [email]
    );
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 2. POST a message in a conversation thread (used by both users and admin)
app.post('/api/chat/messages', async (req, res) => {
  const { user_id, sender, sender_name, sender_email, message } = req.body;
  if (!sender || !sender_name || !sender_email || !message) {
    return res.status(400).json({ success: false, error: 'البيانات غير مكتملة لإرسال الرسالة' });
  }
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [result] = await connection.execute(
      'INSERT INTO chat_messages (user_id, sender, sender_name, sender_email, message, is_read) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id || null, sender, sender_name, sender_email, message, sender === 'admin' ? 1 : 0]
    );
    res.json({ success: true, id_chat: result.insertId });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 3. GET all active conversations for the Admin Dashboard (WhatsApp style list)
app.get('/api/admin/chat/conversations', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [conversations] = await connection.execute(`
      SELECT 
        c.sender_email,
        COALESCE(
          (
            SELECT sender_name 
            FROM chat_messages 
            WHERE sender_email = c.sender_email AND sender = 'user' 
            ORDER BY id_chat DESC 
            LIMIT 1
          ),
          c.sender_name
        ) AS sender_name,
        c.user_id,
        c.message AS last_message,
        c.created_at AS last_message_time,
        (
          SELECT COUNT(*) 
          FROM chat_messages 
          WHERE sender_email = c.sender_email AND sender = 'user' AND is_read = 0
        ) AS unread_count
      FROM chat_messages c
      INNER JOIN (
        SELECT sender_email, MAX(id_chat) AS max_id
        FROM chat_messages
        GROUP BY sender_email
      ) m ON c.id_chat = m.max_id
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Error fetching admin chat conversations:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 4. PUT mark all messages in a conversation as read
app.put('/api/admin/chat/read', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, error: 'البريد الإلكتروني مطلوب' });
  }
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute(
      "UPDATE chat_messages SET is_read = 1 WHERE sender_email = ? AND sender = 'user'",
      [email]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 5. DELETE a full conversation thread
app.delete('/api/admin/chat/conversations', async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, error: 'البريد الإلكتروني مطلوب' });
  }
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute('DELETE FROM chat_messages WHERE sender_email = ?', [email]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


// GET Admin Dashboard stats from database
app.get('/api/admin/dashboard-stats', async (req, res) => {
  const { period, date, year, month, flightNumber } = req.query; // 'current_month', 'current_year', YYYY-MM-DD or custom year & month
  const isCurrentMonth = period === 'current_month';
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const isCustomDate = date && dateRegex.test(date);
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    // شروط تصفية التواريخ للشهر الحالي أو السنة الحالية أو تاريخ محدد أو سنة وشهر معينين
    let dateFilterBookings;
    let dateFilterPayments;
    let dateFilterBookingsAnd;
    let dateFilterBookingsWhereAlias;
    let dateFilterSubqueryBookings;
    let dateFilterSubqueryPayments;

    if (year && year.trim() !== '') {
      if (month && month.trim() !== '') {
        const targetYearMonth = `${year}-${String(month).padStart(2, '0')}`;
        dateFilterBookings = `WHERE DATE_FORMAT(booking_date, '%Y-%m') = '${targetYearMonth}'`;
        dateFilterPayments = `AND DATE_FORMAT(payment_date, '%Y-%m') = '${targetYearMonth}'`;
        dateFilterBookingsAnd = `AND DATE_FORMAT(booking_date, '%Y-%m') = '${targetYearMonth}'`;
        dateFilterBookingsWhereAlias = `WHERE DATE_FORMAT(b.booking_date, '%Y-%m') = '${targetYearMonth}'`;
        
        dateFilterSubqueryBookings = `AND DATE_FORMAT(b.booking_date, '%Y-%m') = '${targetYearMonth}'`;
        dateFilterSubqueryPayments = `AND DATE_FORMAT(p.payment_date, '%Y-%m') = '${targetYearMonth}'`;
      } else {
        dateFilterBookings = `WHERE DATE_FORMAT(booking_date, '%Y') = '${year}'`;
        dateFilterPayments = `AND DATE_FORMAT(payment_date, '%Y') = '${year}'`;
        dateFilterBookingsAnd = `AND DATE_FORMAT(booking_date, '%Y') = '${year}'`;
        dateFilterBookingsWhereAlias = `WHERE DATE_FORMAT(b.booking_date, '%Y') = '${year}'`;
        
        dateFilterSubqueryBookings = `AND DATE_FORMAT(b.booking_date, '%Y') = '${year}'`;
        dateFilterSubqueryPayments = `AND DATE_FORMAT(p.payment_date, '%Y') = '${year}'`;
      }
    } else if (isCustomDate) {
      dateFilterBookings = `WHERE DATE(booking_date) = '${date}'`;
      dateFilterPayments = `AND DATE(payment_date) = '${date}'`;
      dateFilterBookingsAnd = `AND DATE(booking_date) = '${date}'`;
      dateFilterBookingsWhereAlias = `WHERE DATE(b.booking_date) = '${date}'`;
      
      dateFilterSubqueryBookings = `AND DATE(b.booking_date) = '${date}'`;
      dateFilterSubqueryPayments = `AND DATE(p.payment_date) = '${date}'`;
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
        
      dateFilterSubqueryBookings = isCurrentMonth
        ? "AND DATE_FORMAT(b.booking_date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')"
        : "AND DATE_FORMAT(b.booking_date, '%Y') = DATE_FORMAT(NOW(), '%Y')";
        
      dateFilterSubqueryPayments = isCurrentMonth
        ? "AND DATE_FORMAT(p.payment_date, '%Y-%m') = DATE_FORMAT(NOW(), '%Y-%m')"
        : "AND DATE_FORMAT(p.payment_date, '%Y') = DATE_FORMAT(NOW(), '%Y')";
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
    let flightFilter = '';
    const recentParams = [];
    if (flightNumber && flightNumber.trim() !== '') {
      flightFilter = ` AND f.flight_number LIKE ? `;
      recentParams.push(`%${flightNumber.trim()}%`);
    }
    const [recentBookings] = await connection.execute(`
      SELECT b.id_bookings, b.booking_reference, b.booking_date, b.total_passengers, b.final_price, b.status, 
             f.flight_number, f.airline_code, f.airportOrigin_code, f.airportDestination_code, f.departure_time,
             (SELECT p.name FROM bookings_passengers bp JOIN passengers p ON bp.passenger_id = p.id_passengers WHERE bp.booking_id = b.id_bookings LIMIT 1) as lead_passenger
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      ${dateFilterBookingsWhereAlias} ${flightFilter}
      ORDER BY b.booking_date DESC
      LIMIT 100
    `, recentParams);

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

    // 13. Company Breakdown
    const [companyBreakdown] = await connection.execute(`
      SELECT 
        c.airline_code,
        c.company_name,
        (
          SELECT COALESCE(SUM(b.total_passengers), 0) 
          FROM bookings b 
          JOIN flights f ON b.flight_id = f.id_flights 
          WHERE f.airline_code = c.airline_code ${dateFilterSubqueryBookings}
        ) as tickets,
        (
          SELECT COALESCE(SUM(p.amount), 0) 
          FROM payments p 
          JOIN bookings b ON p.booking_id = b.id_bookings
          JOIN flights f ON b.flight_id = f.id_flights
          WHERE f.airline_code = c.airline_code AND p.payment_status = 'success' ${dateFilterSubqueryPayments}
        ) as revenue,
        (
          SELECT COUNT(*) 
          FROM bookings b 
          JOIN flights f ON b.flight_id = f.id_flights 
          WHERE f.airline_code = c.airline_code AND b.status = 'canceled' ${dateFilterSubqueryBookings}
        ) as cancelled_bookings
      FROM companies c
    `);

    res.json({
      success: true,
      stats: {
        totalTickets: Number(totalTickets) || 0,
        totalRevenue: Number(totalRevenue) || 0,
        pendingPayments: Number(pendingPayments) || 0,
        totalUsers: Number(totalUsers) || 0,
        activePassengers: Number(activePassengers) || 0,
        recentBookings,
        destinationsStats: (destinationsStats || []).map(d => ({ ...d, count: Number(d.count) || 0 })),
        monthlySales: (monthlySales || []).map(m => ({ ...m, sales: Number(m.sales) || 0, passengers: Number(m.passengers) || 0 })),
        dailySales: (dailySales || []).map(d => ({ ...d, sales: Number(d.sales) || 0, passengers: Number(d.passengers) || 0 })),
        airlineStats: (airlineStats || []).map(a => ({ ...a, value: Number(a.value) || 0 })),
        cancellationRate: Number(cancellationRate) || 0,
        statusStats,
        companyBreakdown: (companyBreakdown || []).map(c => ({
          ...c,
          tickets: Number(c.tickets) || 0,
          revenue: Number(c.revenue) || 0,
          cancelled_bookings: Number(c.cancelled_bookings) || 0
        })),
        classStats: classStats.length > 0 
          ? classStats.map(c => ({ ...c, value: Number(c.value) || 0 })) 
          : [
            { name: 'economy', value: totalTickets ? Math.round(Number(totalTickets) * 0.7) : 0 },
            { name: 'business', value: totalTickets ? Math.round(Number(totalTickets) * 0.2) : 0 },
            { name: 'first', value: totalTickets ? Math.round(Number(totalTickets) * 0.1) : 0 }
          ],
        aircraftStats: aircraftStats.length > 0 
          ? aircraftStats.map(a => ({ ...a, price: Number(a.price) || 0 })) 
          : [
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
  const { date, year, month } = req.query;
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
    const conditions = [];

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (date && dateRegex.test(date)) {
      conditions.push(`DATE(b.booking_date) = ?`);
      params.push(date);
    }
    if (year) {
      conditions.push(`YEAR(b.booking_date) = ?`);
      params.push(year);
    }
    if (month) {
      conditions.push(`MONTH(b.booking_date) = ?`);
      params.push(month);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
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
      `SELECT a.*, c.airline_name, c.logo_url, c.id_airline
       FROM admins a
       LEFT JOIN airline_companies c ON a.airlineId_airline = c.id_airline
       WHERE a.email = ? AND a.password = ?`,
      [email, password]
    );
    if (rows.length > 0) {
      const admin = rows[0];
      await connection.execute('UPDATE admins SET last_login = NOW() WHERE id_admin = ?', [admin.id_admin]);
      res.json({
        success: true,
        role: admin.role,
        airline_code: admin.airline_code,
        airline_id: admin.id_airline || admin.airlineId_airline,
        airline_name: admin.airline_name,
        logo_url: admin.logo_url,
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

app.get('/api/flights', async (req, res) => {
  const { airlineCode, airline_id, date } = req.query;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    let query = 'SELECT * FROM flights WHERE 1=1';
    const params = [];
    if (airlineCode && airlineCode !== 'undefined' && airlineCode !== 'null' && airlineCode.trim() !== '') {
      query += ' AND airline_code = ?';
      params.push(airlineCode);
    } else if (airline_id) {
      query += ' AND airline_id = ?';
      params.push(airline_id);
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

    // 1. Auto-update: Set past active flights to cancelled
    try {
      await connection.execute(
        "UPDATE flights SET status = 'cancelled' WHERE departure_time < NOW() AND status != 'cancelled'"
      );
    } catch (updateErr) {
      console.error('Error auto-cancelling past flights:', updateErr);
    }

    console.log(`Search Request: from=${fromCode}, to=${toCode}, date=${date}`);
    // 2. Fetch only active and future flights
    let query = `
      SELECT f.*, c.company_name AS airline_name 
      FROM flights f 
      LEFT JOIN companies c ON f.airline_code = c.airline_code 
      WHERE f.status = 'active' AND f.departure_time >= NOW()
    `;
    const params = [];

    if (fromCode) {
      query += ' AND f.airportOrigin_code = ?';
      params.push(fromCode);
    }
    if (toCode) {
      query += ' AND f.airportDestination_code = ?';
      params.push(toCode);
    }
    if (date && date !== 'undefined' && date !== 'null' && date.trim() !== '') {
      query += ' AND DATE(f.departure_time) = ?';
      params.push(date);
    }

    query += ' ORDER BY f.departure_time ASC';

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


// --- HELPER TRANSLATION MAPS ---
const arabicCityMap = {
  'ADE': 'عدن',
  'CAI': 'القاهرة',
  'RUH': 'الرياض',
  'JED': 'جدة',
  'RIY': 'المكلا',
  'GXF': 'سيئون',
  'SCT': 'سقطرى',
  'AMM': 'عمان',
  'KWI': 'الكويت',
  'JIB': 'جيبوتي',
  'ADD': 'أديس أبابا',
  'SAH': 'صنعاء',
  'SNA': 'صنعاء'
};

const serviceMap = {
  'مساعدة بالكرسي المتحرك': 'كرسي متحرك',
  'أكسجين طبي على المتن': 'أكسجين طبي',
  'مساعدة طبية متخصصة': 'مرافقة طبية',
  'وجبة غذائية طبية': 'وجبة طبية'
};

const classMap = {
  'economy': 'الدرجة السياحية',
  'business': 'درجة الأعمال',
  'first': 'الدرجة الأولى',
  ' business': 'درجة الأعمال'
};

const arabicMonths = {
  '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل', '05': 'مايو', '06': 'يونيو',
  '07': 'يوليو', '08': 'أغسطس', '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
};

const arabicWeekdays = {
  1: 'الأحد', 2: 'الاثنين', 3: 'الثلاثاء', 4: 'الأربعاء', 5: 'الخميس', 6: 'الجمعة', 7: 'السبت'
};


// --- MULTI-TENANT STATISTICS & REPORTING ENDPOINTS ---

// Get analytics stats for company dashboard
app.get('/api/company/analytics-stats', async (req, res) => {
  const { airlineCode, airline_id } = req.query;
  if (!airlineCode && !airline_id) {
    return res.status(400).json({ success: false, error: 'airlineCode or airline_id is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    // 1. Total Revenue
    const [revRow] = await connection.execute(`
      SELECT COALESCE(SUM(p.amount), 0) as totalRevenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' AND (f.airline_code = ? OR f.airline_id = ?)
    `, [airlineCode || '', airline_id || 0]);
    const totalRevenue = Number(revRow[0].totalRevenue) || 0;

    // 2. Active Bookings
    const [actRow] = await connection.execute(`
      SELECT COUNT(b.id_bookings) as activeBookings
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE b.status = 'certain' AND (f.airline_code = ? OR f.airline_id = ?)
    `, [airlineCode || '', airline_id || 0]);
    const activeBookings = Number(actRow[0].activeBookings) || 0;

    // 3. Available Flights
    const [avRow] = await connection.execute(`
      SELECT COUNT(id_flights) as availableFlights
      FROM flights
      WHERE status = 'active' AND (airline_code = ? OR airline_id = ?)
    `, [airlineCode || '', airline_id || 0]);
    const availableFlights = Number(avRow[0].availableFlights) || 0;

    // 4. Total Passengers
    const [passRow] = await connection.execute(`
      SELECT COALESCE(SUM(b.total_passengers), 0) as totalPassengers
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE b.status = 'certain' AND (f.airline_code = ? OR f.airline_id = ?)
    `, [airlineCode || '', airline_id || 0]);
    const totalPassengers = Number(passRow[0].totalPassengers) || 0;

    // 5. Destinations Stats
    const [destRows] = await connection.execute(`
      SELECT f.airportDestination_code as name, COUNT(b.id_bookings) as bookings
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE (f.airline_code = ? OR f.airline_id = ?)
      GROUP BY f.airportDestination_code
      ORDER BY bookings DESC
      LIMIT 5
    `, [airlineCode || '', airline_id || 0]);

    const destinationsStats = destRows.map(r => ({
      name: arabicCityMap[r.name] || r.name,
      bookings: Number(r.bookings) || 0
    }));

    // 6. Services Stats
    const [serviceRows] = await connection.execute(`
      SELECT gs.service_name as name, COUNT(*) as value
      FROM ground_services gs
      JOIN bookings b ON gs.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE gs.is_active = 1 AND (f.airline_code = ? OR f.airline_id = ?)
      GROUP BY gs.service_name
    `, [airlineCode || '', airline_id || 0]);

    const servicesStats = serviceRows.map(r => ({
      name: serviceMap[r.name] || r.name,
      value: Number(r.value) || 0
    }));

    // 7. Recent Bookings
    const [recentRows] = await connection.execute(`
      SELECT b.id_bookings, b.booking_reference, b.final_price, b.status,
             f.airportOrigin_code, f.airportDestination_code,
             (SELECT p.name FROM bookings_passengers bp JOIN passengers p ON bp.passenger_id = p.id_passengers WHERE bp.booking_id = b.id_bookings LIMIT 1) as passenger
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE (f.airline_code = ? OR f.airline_id = ?)
      ORDER BY b.booking_date DESC
      LIMIT 5
    `, [airlineCode || '', airline_id || 0]);

    const recentBookings = recentRows.map(r => ({
      id: r.booking_reference,
      route: `${arabicCityMap[r.airportOrigin_code] || r.airportOrigin_code} - ${arabicCityMap[r.airportDestination_code] || r.airportDestination_code}`,
      passenger: r.passenger || 'مسافر',
      total: `$${Number(r.final_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: r.status === 'certain' ? 'مؤكد' : r.status === 'temporary' ? 'مؤقت' : 'ملغي',
      badgeColor: r.status === 'certain' ? 'green' : r.status === 'temporary' ? 'yellow' : 'red'
    }));

    // 8. Sparkline Data
    const [sparkRows] = await connection.execute(`
      SELECT SUM(p.amount) as revenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' AND (f.airline_code = ? OR f.airline_id = ?)
      GROUP BY DATE_FORMAT(b.booking_date, '%Y-%m')
      ORDER BY DATE_FORMAT(b.booking_date, '%Y-%m') ASC
      LIMIT 7
    `, [airlineCode || '', airline_id || 0]);

    const sparklineData = sparkRows.map(r => ({ pv: Number(r.revenue) || 0 }));

    res.json({
      success: true,
      stats: {
        totalRevenue,
        activeBookings,
        availableFlights,
        totalPassengers,
        destinationsStats,
        servicesStats,
        recentBookings,
        sparklineData
      }
    });
  } catch (error) {
    console.error('Error fetching analytics stats:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Get financial stats for company dashboard
app.get('/api/financial-stats', async (req, res) => {
  const { airlineCode, airline_id } = req.query;
  if (!airlineCode && !airline_id) {
    return res.status(400).json({ success: false, error: 'airlineCode or airline_id is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    // 1. Total Revenue
    const [revRow] = await connection.execute(`
      SELECT COALESCE(SUM(p.amount), 0) as totalRevenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' AND (f.airline_code = ? OR f.airline_id = ?)
    `, [airlineCode || '', airline_id || 0]);
    const totalRevenue = Number(revRow[0].totalRevenue) || 0;

    // 2. Current Month Revenue
    const [currRow] = await connection.execute(`
      SELECT COALESCE(SUM(p.amount), 0) as currentMonthRevenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' 
        AND MONTH(b.booking_date) = MONTH(CURRENT_DATE())
        AND YEAR(b.booking_date) = YEAR(CURRENT_DATE())
        AND (f.airline_code = ? OR f.airline_id = ?)
    `, [airlineCode || '', airline_id || 0]);
    const currentMonthRevenue = Number(currRow[0].currentMonthRevenue) || 0;

    // 3. Previous Month Revenue
    const [prevRow] = await connection.execute(`
      SELECT COALESCE(SUM(p.amount), 0) as previousMonthRevenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' 
        AND b.booking_date >= DATE_SUB(DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
        AND b.booking_date < DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
        AND (f.airline_code = ? OR f.airline_id = ?)
    `, [airlineCode || '', airline_id || 0]);
    const previousMonthRevenue = Number(prevRow[0].previousMonthRevenue) || 0;

    // 4. Growth
    const revenueGrowth = previousMonthRevenue > 0 
      ? Number(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1))
      : 0;

    // 5. Monthly Revenue
    const [monthRows] = await connection.execute(`
      SELECT DATE_FORMAT(b.booking_date, '%m') as monthNum, SUM(p.amount) as revenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' AND (f.airline_code = ? OR f.airline_id = ?)
      GROUP BY monthNum
      ORDER BY monthNum ASC
      LIMIT 6
    `, [airlineCode || '', airline_id || 0]);

    const monthlyRevenue = monthRows.map(r => ({
      name: arabicMonths[r.monthNum] || r.monthNum,
      revenue: Number(r.revenue) || 0
    }));

    // 6. Weekly Revenue
    const [weekRows] = await connection.execute(`
      SELECT DAYOFWEEK(b.booking_date) as dayNum, SUM(p.amount) as revenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' AND (f.airline_code = ? OR f.airline_id = ?)
        AND b.booking_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
      GROUP BY dayNum
      ORDER BY dayNum ASC
    `, [airlineCode || '', airline_id || 0]);

    const weeklyRevenue = weekRows.map(r => ({
      name: arabicWeekdays[r.dayNum] || `اليوم ${r.dayNum}`,
      revenue: Number(r.revenue) || 0
    }));

    // 7. Class Stats
    const [classRows] = await connection.execute(`
      SELECT s.seat_class as name, COUNT(bp.id_bookings_passengers) as value
      FROM bookings_passengers bp
      JOIN seats s ON bp.seat_id = s.id_seats
      JOIN bookings b ON bp.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE (f.airline_code = ? OR f.airline_id = ?)
      GROUP BY s.seat_class
    `, [airlineCode || '', airline_id || 0]);

    const classStats = classRows.map(r => ({
      name: classMap[r.name] || r.name,
      value: Number(r.value) || 0
    }));

    // 8. Flight Profits
    const [profitRows] = await connection.execute(`
      SELECT f.flight_number, f.airportOrigin_code, f.airportDestination_code,
             COALESCE(SUM(b.final_price), 0) as revenue
      FROM flights f
      LEFT JOIN bookings b ON b.flight_id = f.id_flights AND b.status = 'certain'
      WHERE (f.airline_code = ? OR f.airline_id = ?)
      GROUP BY f.id_flights
      ORDER BY revenue DESC
      LIMIT 5
    `, [airlineCode || '', airline_id || 0]);

    const flightsProfits = profitRows.map(r => {
      const rev = Number(r.revenue) || 0;
      const costs = Math.round(rev * 0.4);
      const netProfit = rev - costs;
      return {
        flightNumber: r.flight_number,
        route: `${arabicCityMap[r.airportOrigin_code] || r.airportOrigin_code} - ${arabicCityMap[r.airportDestination_code] || r.airportDestination_code}`,
        costs,
        revenue: rev,
        netProfit
      };
    });

    res.json({
      success: true,
      stats: {
        totalRevenue,
        currentMonthRevenue,
        previousMonthRevenue,
        revenueGrowth,
        monthlyRevenue,
        weeklyRevenue,
        classStats,
        flightsProfits
      }
    });
  } catch (error) {
    console.error('Error fetching financial stats:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Get traffic stats for company dashboard
app.get('/api/traffic-stats', async (req, res) => {
  const { airlineCode, airline_id } = req.query;
  if (!airlineCode && !airline_id) {
    return res.status(400).json({ success: false, error: 'airlineCode or airline_id is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    // 1. Top Destinations
    const [destRows] = await connection.execute(`
      SELECT f.airportDestination_code as name, COUNT(b.id_bookings) as bookings
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE b.status = 'certain' AND (f.airline_code = ? OR f.airline_id = ?)
      GROUP BY f.airportDestination_code
      ORDER BY bookings DESC
      LIMIT 5
    `, [airlineCode || '', airline_id || 0]);

    const topDestinations = destRows.map(r => ({
      name: arabicCityMap[r.name] || r.name,
      bookings: Number(r.bookings) || 0
    }));

    // 2. Occupancy Rates
    const [occRows] = await connection.execute(`
      SELECT flight_number, airportOrigin_code, airportDestination_code, total_seats, available_seats
      FROM flights
      WHERE (airline_code = ? OR airline_id = ?)
      ORDER BY departure_time DESC
      LIMIT 10
    `, [airlineCode || '', airline_id || 0]);

    const occupancyRates = occRows.map(r => {
      const total = r.total_seats || 150;
      const available = r.available_seats !== null ? r.available_seats : total;
      const booked = total - available;
      const rate = Math.round((booked / total) * 100);
      return {
        flightNumber: r.flight_number,
        route: `${arabicCityMap[r.airportOrigin_code] || r.airportOrigin_code} - ${arabicCityMap[r.airportDestination_code] || r.airportDestination_code}`,
        bookedSeats: booked,
        totalSeats: total,
        rate: Math.min(100, Math.max(0, rate))
      };
    });

    res.json({
      success: true,
      stats: {
        topDestinations,
        occupancyRates
      }
    });
  } catch (error) {
    console.error('Error fetching traffic stats:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Get medical services stats for company dashboard
app.get('/api/medical-services', async (req, res) => {
  const { airlineCode, airline_id } = req.query;
  if (!airlineCode && !airline_id) {
    return res.status(400).json({ success: false, error: 'airlineCode or airline_id is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    // 1. Services Stats
    const [serviceRows] = await connection.execute(`
      SELECT gs.service_name as name, COUNT(*) as value
      FROM ground_services gs
      JOIN bookings b ON gs.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE gs.is_active = 1 AND (f.airline_code = ? OR f.airline_id = ?)
      GROUP BY gs.service_name
    `, [airlineCode || '', airline_id || 0]);

    const servicesStats = serviceRows.map(r => ({
      name: serviceMap[r.name] || r.name,
      value: Number(r.value) || 0
    }));

    // 2. Critical Flights
    const [critRows] = await connection.execute(`
      SELECT f.flight_number, f.airportOrigin_code, f.airportDestination_code,
             COUNT(gs.id_Ground_services) as criticalCount,
             GROUP_CONCAT(gs.service_name) as servicesList
      FROM ground_services gs
      JOIN bookings b ON gs.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE gs.is_active = 1 AND (f.airline_code = ? OR f.airline_id = ?)
      GROUP BY f.id_flights
      ORDER BY criticalCount DESC
      LIMIT 10
    `, [airlineCode || '', airline_id || 0]);

    const criticalFlights = critRows.map(r => {
      const list = r.servicesList ? r.servicesList.split(',') : [];
      const counts = {};
      list.forEach(s => {
        const shortName = serviceMap[s] || s;
        counts[shortName] = (counts[shortName] || 0) + 1;
      });
      const servicesStr = Object.entries(counts)
        .map(([name, count]) => `${name} (${count})`)
        .join('، ');

      return {
        flightNumber: r.flight_number,
        route: `${arabicCityMap[r.airportOrigin_code] || r.airportOrigin_code} - ${arabicCityMap[r.airportDestination_code] || r.airportDestination_code}`,
        criticalCount: Number(r.criticalCount) || 0,
        services: servicesStr || 'لا توجد خدمات حالية'
      };
    });

    res.json({
      success: true,
      stats: {
        servicesStats,
        criticalFlights
      }
    });
  } catch (error) {
    console.error('Error fetching medical services stats:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Get passenger stats for company dashboard
app.get('/api/passenger-stats', async (req, res) => {
  const { airlineCode, airline_id } = req.query;
  if (!airlineCode && !airline_id) {
    return res.status(400).json({ success: false, error: 'airlineCode or airline_id is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    // 1. Status Distribution
    const [statusRows] = await connection.execute(`
      SELECT b.status, COUNT(*) as value
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE (f.airline_code = ? OR f.airline_id = ?)
      GROUP BY b.status
    `, [airlineCode || '', airline_id || 0]);

    const statusMapLocal = {
      'certain': 'مؤكد',
      'temporary': 'مؤقت',
      'canceled': 'ملغي'
    };

    const statusDistribution = statusRows.map(r => ({
      name: statusMapLocal[r.status] || r.status,
      value: Number(r.value) || 0
    }));

    // 2. Peak Times
    const [dayRows] = await connection.execute(`
      SELECT DAYOFWEEK(b.booking_date) as dayNum, COUNT(b.id_bookings) as count
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE (f.airline_code = ? OR f.airline_id = ?)
      GROUP BY dayNum
    `, [airlineCode || '', airline_id || 0]);

    const weekDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const peakTimes = weekDays.map((d, index) => {
      const match = dayRows.find(r => r.dayNum === (index + 1));
      return {
        day: d,
        bookings: match ? Number(match.count) : 0
      };
    });

    res.json({
      success: true,
      stats: {
        statusDistribution,
        peakTimes
      }
    });
  } catch (error) {
    console.error('Error fetching passenger stats:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Get flights by day for drill-down reporting
app.get('/api/flights-by-day/:day', async (req, res) => {
  const { day } = req.params;
  const { airlineCode, airline_id } = req.query;
  if (!airlineCode && !airline_id) {
    return res.status(400).json({ success: false, error: 'airlineCode or airline_id is required' });
  }

  const dayMap = {
    'الأحد': 1, 'الاحد': 1,
    'الإثنين': 2, 'الاثنين': 2,
    'الثلاثاء': 3,
    'الأربعاء': 4, 'الاربعاء': 4,
    'الخميس': 5,
    'الجمعة': 6,
    'السبت': 7
  };

  const dayIndex = dayMap[day];
  if (!dayIndex) {
    return res.status(400).json({ success: false, error: 'Invalid day name' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    const [rows] = await connection.execute(`
      SELECT f.id_flights as id, f.flight_number as flightNumber, f.departure_time as departureTime,
             f.airportOrigin_code, f.airportDestination_code,
             COALESCE((
               SELECT SUM(b.total_passengers)
               FROM bookings b
               WHERE b.flight_id = f.id_flights AND b.status = 'certain'
             ), 0) as totalPassengers
      FROM flights f
      WHERE DAYOFWEEK(f.departure_time) = ? AND (f.airline_code = ? OR f.airline_id = ?)
    `, [dayIndex, airlineCode || '', airline_id || 0]);

    const flights = rows.map(r => ({
      id: r.id,
      flightNumber: r.flightNumber,
      route: `${arabicCityMap[r.airportOrigin_code] || r.airportOrigin_code} - ${arabicCityMap[r.airportDestination_code] || r.airportDestination_code}`,
      departureTime: r.departureTime,
      totalPassengers: Number(r.totalPassengers) || 0
    }));

    res.json({ success: true, flights });
  } catch (error) {
    console.error('Error fetching flights by day:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Get passenger details for a specific flight
app.get('/api/flight-passengers/:flightNumber', async (req, res) => {
  const { flightNumber } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    const [bookedRows] = await connection.execute(`
      SELECT p.id_passengers as id, p.name as passengerName, p.passport_number as passportNumber,
             p.nationality, p.gander as gender, s.seat_number as seatNumber, b.booking_reference as bookingReference,
             bg.weight as baggageWeight, bg.extra_price as extraBaggagePrice, b.final_price as finalPrice,
             b.id_bookings as bookingId
      FROM passengers p
      JOIN bookings_passengers bp ON bp.passenger_id = p.id_passengers
      JOIN bookings b ON bp.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      LEFT JOIN seats s ON bp.seat_id = s.id_seats
      LEFT JOIN baggage bg ON bp.baggage_id = bg.id_baggage
      WHERE REPLACE(f.flight_number, ' ', '') = ? AND b.status = 'certain'
    `, [flightNumber.replace(/\s+/g, '')]);

    const bookingIds = [...new Set(bookedRows.map(r => r.bookingId))];
    let servicesMap = {};
    if (bookingIds.length > 0) {
      const [serviceRows] = await connection.query(
        'SELECT booking_id, service_name FROM ground_services WHERE booking_id IN (?) AND is_active = 1',
        [bookingIds]
      );
      serviceRows.forEach(sr => {
        servicesMap[sr.booking_id] = servicesMap[sr.booking_id] || [];
        servicesMap[sr.booking_id].push(serviceMap[sr.service_name] || sr.service_name);
      });
    }

    const passengers = bookedRows.map(r => ({
      id: r.id,
      passengerName: r.passengerName,
      passportNumber: r.passportNumber,
      nationality: r.nationality,
      gender: r.gender === 'female' ? 'أنثى' : 'ذكر',
      seatNumber: r.seatNumber || 'غير محدد',
      bookingReference: r.bookingReference,
      extraWeight: r.baggageWeight > 23 ? Math.round(r.baggageWeight - 23) : 0,
      extraBaggagePrice: Number(r.extraBaggagePrice) || 0,
      services: servicesMap[r.bookingId] || [],
      finalPrice: Number(r.finalPrice) || 0
    }));

    res.json({ success: true, passengers });
  } catch (error) {
    console.error('Error fetching flight passengers:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// Get seat map status and details for a specific flight
app.get('/api/flight-details/:flightNumber', async (req, res) => {
  const { flightNumber } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    
    // Fetch the flight
    const [flights] = await connection.execute(
      'SELECT id_flights as id, flight_number as flightNumber, airportOrigin_code as origin, airportDestination_code as destination, aircraft_type as aircraftType, departure_time as departureTime, arrival_time as arrivalTime FROM flights WHERE REPLACE(flight_number, " ", "") = ?',
      [flightNumber.replace(/\s+/g, '')]
    );
    
    if (flights.length === 0) {
      return res.status(404).json({ success: false, error: 'الرحلة غير موجودة' });
    }
    
    const flight = flights[0];
    
    // Fetch the booked seats
    const [bookedRows] = await connection.execute(`
      SELECT s.seat_number as seatNumber, s.seat_class as seatClass, p.name as passengerName,
             p.passport_number as passportNumber, p.nationality, p.gander as gender,
             b.booking_reference as bookingReference, b.id_bookings as bookingId
      FROM bookings_passengers bp
      JOIN passengers p ON bp.passenger_id = p.id_passengers
      JOIN bookings b ON bp.booking_id = b.id_bookings
      JOIN seats s ON bp.seat_id = s.id_seats
      WHERE b.flight_id = ? AND b.status = 'certain'
    `, [flight.id]);
    
    const bookingIds = [...new Set(bookedRows.map(r => r.bookingId))];
    let servicesMap = {};
    if (bookingIds.length > 0) {
      const [serviceRows] = await connection.query(
        'SELECT booking_id, service_name FROM ground_services WHERE booking_id IN (?) AND is_active = 1',
        [bookingIds]
      );
      serviceRows.forEach(sr => {
        servicesMap[sr.booking_id] = servicesMap[sr.booking_id] || [];
        servicesMap[sr.booking_id].push(serviceMap[sr.service_name] || sr.service_name);
      });
    }
    
    const bookedSeats = bookedRows.map(r => ({
      seatNumber: r.seatNumber,
      seatClass: (r.seatClass || '').trim().toLowerCase() === 'economy' ? 'economy' : 'business',
      passengerName: r.passengerName,
      passportNumber: r.passportNumber,
      nationality: r.nationality,
      gender: r.gender,
      bookingReference: r.bookingReference,
      services: servicesMap[r.bookingId] || []
    }));
    
    // Calculate stats
    const businessOccupied = bookedSeats.filter(s => s.seatClass === 'business').length;
    const economyOccupied = bookedSeats.filter(s => s.seatClass === 'economy').length;
    
    res.json({
      success: true,
      flight: {
        id: flight.id,
        flightNumber: flight.flightNumber,
        origin: arabicCityMap[flight.origin] || flight.origin,
        destination: arabicCityMap[flight.destination] || flight.destination,
        aircraftType: flight.aircraftType,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime
      },
      bookedSeats,
      stats: {
        business: {
          total: 12,
          occupied: businessOccupied,
          vacant: Math.max(0, 12 - businessOccupied)
        },
        economy: {
          total: 138,
          occupied: economyOccupied,
          vacant: Math.max(0, 138 - economyOccupied)
        },
        first: {
          total: 0,
          occupied: 0,
          vacant: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching flight details:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


// --- COMPANY MANAGEMENT ENDPOINTS ---

// Get all companies (admins with role = 'company' joined with companies table)
app.get('/api/admin/companies', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      `SELECT 
         a.id_admin, 
         a.email, 
         a.password, 
         a.role, 
         a.airline_code, 
         a.employee_id,
         a.department,
         a.last_login, 
         a.created_at,
         c.company_name
       FROM admins a
       LEFT JOIN companies c ON a.airline_code = c.airline_code
       WHERE a.role = 'company' 
       ORDER BY a.created_at DESC`
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
  const { email, password, airline_code, company_name, employee_id, department } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    
    // Check if email already exists
    const [existing] = await connection.execute('SELECT id_admin FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل بالفعل' });
    }

    // 1. Insert or update company in companies table
    if (airline_code && company_name) {
      await connection.execute(
        `INSERT INTO companies (company_name, airline_code) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE company_name = VALUES(company_name)`,
        [company_name, airline_code]
      );
    }

    // 2. Get next auto-increment id
    const [maxIdRows] = await connection.execute('SELECT COALESCE(MAX(id_admin), 0) + 1 as nextId FROM admins');
    const nextId = maxIdRows[0].nextId;

    // 3. Insert admin account
    await connection.execute(
      `INSERT INTO admins (id_admin, email, password, role, airline_code, employee_id, department, created_at) 
       VALUES (?, ?, ?, 'company', ?, ?, ?, NOW())`,
      [nextId, email, password, airline_code || null, employee_id || null, department || null]
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
  const { email, password, airline_code, company_name, employee_id, department } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    // Check if email already exists for another user
    const [existing] = await connection.execute('SELECT id_admin FROM admins WHERE email = ? AND id_admin != ?', [email, id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل بمستخدم آخر' });
    }

    // 1. Insert or update company if provided
    if (airline_code && company_name) {
      await connection.execute(
        `INSERT INTO companies (company_name, airline_code) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE company_name = VALUES(company_name)`,
        [company_name, airline_code]
      );
    }

    // 2. Update admin account
    if (password && password.trim() !== '') {
      await connection.execute(
        `UPDATE admins 
         SET email = ?, password = ?, airline_code = ?, employee_id = ?, department = ? 
         WHERE id_admin = ? AND role = 'company'`,
        [email, password, airline_code || null, employee_id || null, department || null, id]
      );
    } else {
      await connection.execute(
        `UPDATE admins 
         SET email = ?, airline_code = ?, employee_id = ?, department = ? 
         WHERE id_admin = ? AND role = 'company'`,
        [email, airline_code || null, employee_id || null, department || null, id]
      );
    }

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
