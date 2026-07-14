import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import Stripe from 'stripe';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));


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
  return url;
};




const authAliasHandler = (originalPath) => async (req, res, next) => {
  req.url = originalPath;
  next();
};


app.post('/api/passengers', async (req, res) => {
  const { passengers, userId } = req.body;
  let connection;

  try {
    connection = await mysql.createConnection(getDbConfig());
    const results = [];

    for (const p of passengers) {
      const birthDate = p.birthDate || null;
      const passportExpiry = p.passportExpiry || null;


      const [existing] = await connection.execute(
        'SELECT id_passengers FROM passengers WHERE passport_number = ?',
        [p.passportNumber]
      );

      if (existing.length > 0) {
        await connection.execute(
          'UPDATE passengers SET name = ?, date_of_birth = ?, passport_expiry = ?, nationality = ?, gander = ?, user_id = ? WHERE passport_number = ?',
          [p.fullName, birthDate, passportExpiry, p.nationality || null, p.gender, userId || null, p.passportNumber]
        );
        results.push({ id: existing[0].id_passengers, status: 'updated' });
      } else {
        const [insertResult] = await connection.execute(
          'INSERT INTO passengers (name, passport_number, date_of_birth, passport_expiry, nationality, gander, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [p.fullName, p.passportNumber, birthDate, passportExpiry, p.nationality || null, p.gender, userId || null]
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
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      'INSERT INTO users (full_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())',
      [fullName, email, phone, hashedPassword]
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


app.post('/api/auth/login', async (req, res) => loginHandler(req, res));

async function loginHandler(req, res) {
  const { email, password } = req.body;
  console.log('Login Request:', { email });
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (rows.length > 0) {
      const user = rows[0];
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (e) {
        isMatch = password === user.password;
      }

      if (isMatch) {
        res.json({
          success: true,
          user: { id: user.id_users, fullName: user.full_name, email: user.email }
        });
      } else {
        res.status(401).json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      }
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


    const [existing] = await connection.execute('SELECT id_users FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل بالفعل' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      'INSERT INTO users (full_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())',
      [full_name, email, phone, hashedPassword]
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


    const [existing] = await connection.execute('SELECT id_users FROM users WHERE email = ? AND id_users != ?', [email, id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل بمستخدم آخر' });
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.execute(
        'UPDATE users SET full_name = ?, email = ?, phone = ?, password = ? WHERE id_users = ?',
        [full_name, email, phone, hashedPassword, id]
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



app.get('/api/admin/dashboard-stats', async (req, res) => {
  const { period, date, year, month, flightNumber } = req.query;
  const isCurrentMonth = period === 'current_month';
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const isCustomDate = date && dateRegex.test(date);
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


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


    const [[{ totalTickets }]] = await connection.execute(
      `SELECT COALESCE(SUM(total_passengers), 0) as totalTickets FROM bookings ${dateFilterBookings}`
    );


    const [[{ totalRevenue }]] = await connection.execute(
      `SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM payments WHERE payment_status = 'success' ${dateFilterPayments}`
    );


    const [[{ pendingPayments }]] = await connection.execute(
      `SELECT COUNT(*) as pendingPayments FROM bookings WHERE status = 'temporary' ${dateFilterBookingsAnd}`
    );


    const [[{ totalUsers }]] = await connection.execute('SELECT COUNT(*) as totalUsers FROM users');


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


    const [destinationsStats] = await connection.execute(`
      SELECT f.airportDestination_code as destination, COALESCE(SUM(b.total_passengers), 0) as count 
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      ${dateFilterBookingsWhereAlias}
      GROUP BY f.airportDestination_code
      ORDER BY count DESC
      LIMIT 5
    `);


    const [monthlySales] = await connection.execute(`
      SELECT DATE_FORMAT(booking_date, '%Y-%m') as month, COALESCE(SUM(final_price), 0) as sales, COALESCE(SUM(total_passengers), 0) as passengers
      FROM bookings
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
      ORDER BY month ASC
      LIMIT 6
    `);


    const [dailySales] = await connection.execute(`
      SELECT DATE_FORMAT(booking_date, '%Y-%m-%d') as day, COALESCE(SUM(final_price), 0) as sales, COALESCE(SUM(total_passengers), 0) as passengers
      FROM bookings
      WHERE booking_date >= DATE_SUB(NOW(), INTERVAL 14 DAY)
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m-%d')
      ORDER BY day ASC
    `);


    const [airlineStats] = await connection.execute(`
      SELECT f.airline_code as name, COUNT(b.id_bookings) as value
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      ${dateFilterBookingsWhereAlias}
      GROUP BY f.airline_code
    `);


    const [classStats] = await connection.execute(`
      SELECT s.seat_class as name, COUNT(bp.id_bookings_passengers) as value
      FROM bookings_passengers bp
      JOIN seats s ON bp.seat_id = s.id_seats
      JOIN bookings b ON bp.booking_id = b.id_bookings
      ${dateFilterBookingsWhereAlias}
      GROUP BY s.seat_class
    `);


    const [[{ activePassengers }]] = await connection.execute(
      `SELECT COUNT(DISTINCT bp.passenger_id) as activePassengers FROM bookings_passengers bp JOIN bookings b ON bp.booking_id = b.id_bookings ${dateFilterBookingsWhereAlias}`
    );


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


    const [aircraftStats] = await connection.execute(`
      SELECT aircraft_type as name, COALESCE(AVG(price), 0) as price
      FROM flights
      GROUP BY aircraft_type
      HAVING price > 0
    `);


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


app.get('/api/bookings/pending', async (req, res) => {
  const { airline_id } = req.query;

  if (!airline_id || airline_id === 'undefined' || airline_id === 'null' || airline_id.toString().trim() === '') {
    return res.status(400).json({ success: false, error: 'airline_id query parameter is required for data isolation.' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    // Resolve airline_id to airline_code
    const [companies] = await connection.execute('SELECT airline_code FROM companies WHERE id_company = ?', [airline_id]);
    const airlineCode = companies.length > 0 ? companies[0].airline_code : '';
    
    const [rows] = await connection.execute(`
      SELECT b.id_bookings, b.booking_reference, b.booking_date, b.total_passengers, b.base_price, b.extra_total, b.final_price, b.status,
             f.flight_number, f.airline_code, f.airportOrigin_code, f.airportDestination_code, f.departure_time, f.arrival_time, f.price as flight_price,
             p.payment_method, p.payment_status, p.tansaction_id, p.payment_date, p.gateway_response,
             (SELECT GROUP_CONCAT(name SEPARATOR ', ') FROM bookings_passengers bp JOIN passengers pass ON bp.passenger_id = pass.id_passengers WHERE bp.booking_id = b.id_bookings) as passengers
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      LEFT JOIN payments p ON p.booking_id = b.id_bookings
      WHERE b.status = 'temporary' AND f.airline_code = ?
      ORDER BY b.booking_date DESC
    `, [airlineCode]);


    const bookings = rows.map(r => {
      let paymentProof = null;
      let selectedBranchId = null;
      if (r.gateway_response) {
        try {
          const parsed = JSON.parse(r.gateway_response);
          paymentProof = parsed.paymentProof;
          selectedBranchId = parsed.selectedBranchId;
        } catch (e) {
          paymentProof = r.gateway_response;
        }
      }
      return {
        ...r,
        paymentProof,
        selectedBranchId
      };
    });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching pending bookings:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


app.get('/api/company/dashboard-stats', async (req, res) => {
  const { airline_code } = req.query;

  if (!airline_code || airline_code === 'undefined' || airline_code === 'null' || airline_code.toString().trim() === '') {
    return res.status(400).json({ success: false, error: 'airline_code query parameter is required for data isolation.' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    const [[{ totalFlights }]] = await connection.execute(
      'SELECT COUNT(*) as totalFlights FROM flights WHERE airline_code = ?',
      [airline_code]
    );


    const [[{ totalBookingsCount }]] = await connection.execute(`
      SELECT COUNT(*) as totalBookingsCount 
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE f.airline_code = ? AND b.status != 'canceled'
    `, [airline_code]);


    const [[{ totalRevenueSum }]] = await connection.execute(`
      SELECT COALESCE(SUM(p.amount), 0) as totalRevenueSum 
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE f.airline_code = ? AND p.payment_status = 'success'
    `, [airline_code]);

    res.json({
      success: true,
      stats: {
        totalFlights: Number(totalFlights) || 0,
        totalBookingsCount: Number(totalBookingsCount) || 0,
        totalRevenueSum: Number(totalRevenueSum) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});



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


      const [[bookingRow]] = await connection.execute(
        'SELECT booking_reference FROM bookings WHERE id_bookings = ?',
        [id]
      );
      const reference = bookingRow ? bookingRow.booking_reference : id;

      const [passengersRows] = await connection.execute(
        'SELECT passenger_id FROM bookings_passengers WHERE booking_id = ? ORDER BY id_bookings_passengers ASC LIMIT 1',
        [id]
      );
      if (passengersRows.length > 0) {
        const passengerId = passengersRows[0].passenger_id;
        const title = status === 'certain' ? 'تم تأكيد حجزك بنجاح' : 'تم إلغاء حجزك';
        const message = status === 'certain'
          ? `تهانينا! تم تأكيد حجزك برقم المرجع ${reference} بنجاح.`
          : `نأسف، تم رفض طلب حجزك برقم المرجع ${reference} وإلغاء الحجز.`;
        const type = status === 'certain' ? 'payment' : 'cancellation';

        await connection.execute(
          'INSERT INTO notifications (passenger_id, booking_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())',
          [passengerId, id, title, message, type]
        );
      }
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


app.post('/api/auth/company/login', async (req, res) => companyLoginHandler(req, res));

async function companyLoginHandler(req, res) {
  const { username, password } = req.body;
  console.log('Company Login Request:', { username });
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      `SELECT a.*, c.company_name AS airline_name, NULL AS logo_url, c.id_company AS id_airline
       FROM admins a
       LEFT JOIN companies c ON a.airline_code = c.airline_code
       WHERE a.username = ?`,
      [username]
    );
    if (rows.length > 0) {
      const admin = rows[0];
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, admin.password);
      } catch (e) {
        isMatch = password === admin.password;
      }

      if (isMatch) {
        await connection.execute('UPDATE admins SET last_login = NOW() WHERE id_admin = ?', [admin.id_admin]);
        res.json({
          success: true,
          role: admin.role,
          airline_code: admin.airline_code,
          airline_id: admin.id_airline || admin.airlineId_airline,
          airline_name: admin.airline_name,
          logo_url: admin.logo_url,
          id: admin.id_admin,
          username: admin.username,
        });
      } else {
        res.status(401).json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
      }
    } else {
      res.status(401).json({ success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}

app.post('/api/company-login', companyLoginHandler);




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
        p.passport_expiry AS passportExpiry,
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


app.get('/api/bookings/:id/ticket', async (req, res) => {
  const { id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      `SELECT b.id_bookings, b.booking_reference, b.status AS booking_status, b.booking_date, b.final_price,
              f.flight_number, f.airline_code, f.airportOrigin_code, f.airportDestination_code, f.departure_time, f.arrival_time, f.aircraft_type,
              c.company_name AS airline_name,
              p.payment_method, p.payment_status, p.gateway_response,
              pass.name AS passenger_name, pass.passport_number,
              s.seat_class, s.seat_number,
              bg.weight AS baggage_weight
       FROM bookings b
       JOIN bookings_passengers bp ON b.id_bookings = bp.booking_id
       JOIN passengers pass ON bp.passenger_id = pass.id_passengers
       JOIN flights f ON b.flight_id = f.id_flights
       LEFT JOIN companies c ON f.airline_code = c.airline_code
       LEFT JOIN payments p ON p.booking_id = b.id_bookings
       LEFT JOIN seats s ON bp.seat_id = s.id_seats
       LEFT JOIN baggage bg ON (bp.baggage_id = bg.id_baggage OR (bg.booking_id = b.id_bookings AND bg.passenger_id = pass.id_passengers))
       WHERE b.id_bookings = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }


    const firstRow = rows[0];
    const passengersMap = new Map();
    rows.forEach(r => {

      passengersMap.set(r.passenger_name + '_' + r.passport_number, {
        name: r.passenger_name,
        passport_number: r.passport_number || 'N/A',
        seat_class: r.seat_class || 'Economy',
        seat_number: r.seat_number || 'N/A',
        baggage_weight: r.baggage_weight ? `${Math.round(r.baggage_weight)} KG` : '23 KG'
      });
    });

    const booking = {
      id_bookings: firstRow.id_bookings,
      booking_reference: firstRow.booking_reference,
      booking_status: firstRow.booking_status,
      booking_date: firstRow.booking_date,
      final_price: firstRow.final_price,
      flight_number: firstRow.flight_number,
      airline_code: firstRow.airline_code,
      airportOrigin_code: firstRow.airportOrigin_code,
      airportDestination_code: firstRow.airportDestination_code,
      departure_time: firstRow.departure_time,
      arrival_time: firstRow.arrival_time,
      aircraft_type: firstRow.aircraft_type,
      airline_name: firstRow.airline_name || 'Yemen Airways',
      payment_method: firstRow.payment_method,
      payment_status: firstRow.payment_status,
      gateway_response: firstRow.gateway_response,
      passengers: Array.from(passengersMap.values())
    };


    const htmlContent = generateTicketHtml(booking);


    const localHeadlessShell = 'C:\\Users\\ABRAG Soft\\.cache\\puppeteer\\chrome-headless-shell\\win64-150.0.7871.24\\chrome-headless-shell-win64\\chrome-headless-shell.exe';
    const standardChromePaths = [
      localHeadlessShell,
      path.join(process.env.USERPROFILE || 'C:\\Users\\PC', 'AppData', 'Local', 'Google', 'Chrome', 'Application', 'chrome.exe'),
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];

    let chosenPath = null;
    for (const p of standardChromePaths) {
      if (fs.existsSync(p)) {
        chosenPath = p;
        break;
      }
    }

    const launchOptions = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--no-zygote'
      ]
    };
    if (chosenPath) {
      launchOptions.executablePath = chosenPath;
    }
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      },
      printBackground: true
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${booking.booking_reference}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF ticket:', error);
    res.status(500).json({ success: false, error: 'حدث خطأ أثناء إصدار التذكرة: ' + error.message });
  } finally {
    if (connection) await connection.end();
  }
});

function generateTicketHtml(booking) {
  const issueDateStr = new Date(booking.booking_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const depDateStr = new Date(booking.departure_time).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const depTimeStr = new Date(booking.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const arrTimeStr = new Date(booking.arrival_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  const passengerNames = booking.passengers.map(p => p.name.toUpperCase()).join(' / ');
  const passengerPassports = booking.passengers.map(p => p.passport_number.toUpperCase()).join(' / ');
  const baggageAllowance = booking.passengers[0]?.baggage_weight || '23 KG';
  const resClass = (booking.passengers[0]?.seat_class || 'Economy').toUpperCase();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Passenger Itinerary Receipt - ${booking.booking_reference}</title>
  <style>
    body {
      font-family: 'Courier New', Courier, monospace;
      color: #000;
      background-color: #fff;
      font-size: 12px;
      line-height: 1.5;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px dashed #000;
      padding-bottom: 10px;
    }
    .header h1 {
      font-size: 18px;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .header h2 {
      font-size: 12px;
      margin: 5px 0 0 0;
      font-weight: normal;
      text-transform: uppercase;
    }
    .info-section {
      width: 100%;
      margin-bottom: 30px;
      border-collapse: collapse;
    }
    .info-section td {
      padding: 4px 0;
      vertical-align: top;
    }
    .info-label {
      font-weight: bold;
      width: 220px;
      text-transform: uppercase;
    }
    .info-value {
      text-transform: uppercase;
    }
    .itinerary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .itinerary-table th {
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
      padding: 8px 5px;
      text-align: left;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 11px;
    }
    .itinerary-table td {
      padding: 10px 5px;
      border-bottom: 1px dashed #000;
      font-size: 11px;
    }
    .payment-section {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      border-top: 2px dashed #000;
      padding-top: 15px;
    }
    .payment-section td {
      padding: 4px 0;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 10px;
      border-top: 1px solid #000;
      padding-top: 10px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${booking.airline_name}</h1>
    <h2>Passenger Itinerary Receipt / Electronic Ticket</h2>
  </div>

  <table class="info-section">
    <tr>
      <td class="info-label">PASSENGER NAME</td>
      <td class="info-value">: ${passengerNames}</td>
    </tr>
    <tr>
      <td class="info-label">PASSENGER PASSPORT NO</td>
      <td class="info-value">: ${passengerPassports}</td>
    </tr>
    <tr>
      <td class="info-label">BOOKING REF</td>
      <td class="info-value" style="font-weight: bold; letter-spacing: 1px;">: ${booking.booking_reference}</td>
    </tr>
    <tr>
      <td class="info-label">DATE OF ISSUE</td>
      <td class="info-value">: ${issueDateStr}</td>
    </tr>
  </table>

  <table class="itinerary-table">
    <thead>
      <tr>
        <th>ROUTE</th>
        <th>AIRLINE CODE</th>
        <th>FLIGHT NO</th>
        <th>RES. CLASS</th>
        <th>DATE</th>
        <th>DEP TIME</th>
        <th>ARR TIME</th>
        <th>BAGGAGE ALLOWANCE</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${booking.airportOrigin_code} - ${booking.airportDestination_code}</td>
        <td>${booking.airline_code}</td>
        <td>${booking.flight_number}</td>
        <td>${resClass}</td>
        <td>${depDateStr}</td>
        <td>${depTimeStr}</td>
        <td>${arrTimeStr}</td>
        <td>${baggageAllowance}</td>
      </tr>
    </tbody>
  </table>

  <table class="payment-section">
    <tr>
      <td class="info-label">FARE AMOUNT</td>
      <td>: USD ${Number(booking.final_price).toFixed(2)}</td>
    </tr>
    <tr>
      <td class="info-label">TOTAL PAID</td>
      <td style="font-weight: bold;">: USD ${Number(booking.final_price).toFixed(2)}</td>
    </tr>
    <tr>
      <td class="info-label">PAYMENT METHOD</td>
      <td>: ${booking.payment_method === 'bank_transfer' ? 'BANK TRANSFER / CASH' : (booking.payment_method || 'N/A').toUpperCase()}</td>
    </tr>
    <tr>
      <td class="info-label">BOOKING STATUS</td>
      <td style="font-weight: bold; color: #000;">: ${booking.booking_status === 'certain' ? 'CONFIRMED / PAID' : booking.booking_status.toUpperCase()}</td>
    </tr>
  </table>

  <div class="footer">
    Thank you for choosing ${booking.airline_name}. Wish you a pleasant flight.
  </div>
</body>
</html>
  `;
}




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

app.get('/api/flights/starting-prices', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      "SELECT airportDestination_code AS destination, MIN(price) AS minPrice FROM flights WHERE status = 'active' AND departure_time >= NOW() GROUP BY airportDestination_code"
    );
    const prices = {};
    for (const r of rows) {
      prices[r.destination.toUpperCase()] = parseFloat(r.minPrice) || 0;
    }
    res.json({ success: true, prices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


app.post('/api/flights', async (req, res) => {
  const f = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [result] = await connection.execute(
      'INSERT INTO flights (flight_number, airline_code, airline_id, airportOrigin_code, airportDestination_code, departure_time, arrival_time, aircraft_type, total_seats, available_seats, status, price, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TIMESTAMPDIFF(MINUTE, ?, ?))',
      [f.flight_number, f.airline_code, f.airline_id || 1, f.airportOrigin_code, f.airportDestination_code, f.departure_time, f.arrival_time, f.aircraft_type, f.total_seats, f.available_seats, 'active', f.price || 0, f.departure_time, f.arrival_time]
    );
    res.json({ success: true, flightId: result.insertId });
  } catch (error) {
    console.error('Database INSERT Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


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


app.get('/api/flights/search', async (req, res) => { return searchFlightsHandler(req, res); });
app.get('/api/search-flights', async (req, res) => { return searchFlightsHandler(req, res); });
async function searchFlightsHandler(req, res) {
  let { from, to, date } = req.query;
  let connection;


  const codeMap = {
    'aden': 'ADE',
    'cairo': 'CAI',
    'riyadh': 'RUH',
    'jeddah': 'JED',
    'dubai': 'DXB',
    'doha': 'DOH',
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


    try {
      await connection.execute(
        "UPDATE flights SET status = 'cancelled' WHERE departure_time < NOW() AND status != 'cancelled'"
      );
    } catch (updateErr) {
      console.error('Error auto-cancelling past flights:', updateErr);
    }

    console.log(`Search Request: from=${fromCode}, to=${toCode}, date=${date}`);

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


const handleFlightUpdate = async (req, res) => {
  const f = req.body;
  const { id } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute(
      'UPDATE flights SET flight_number = ?, airline_code = ?, airline_id = ?, airportOrigin_code = ?, airportDestination_code = ?, departure_time = ?, arrival_time = ?, aircraft_type = ?, total_seats = ?, available_seats = ?, price = ?, status = ?, duration = TIMESTAMPDIFF(MINUTE, ?, ?), `update` = NOW() WHERE id_flights = ?',
      [f.flight_number, f.airline_code, f.airline_id || 1, f.airportOrigin_code, f.airportDestination_code, f.departure_time, f.arrival_time, f.aircraft_type, f.total_seats, f.available_seats, f.price, f.status || 'active', f.departure_time, f.arrival_time, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Database UPDATE Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

app.put('/api/flights/:id', handleFlightUpdate);
app.post('/api/flights/:id', handleFlightUpdate);


app.post('/api/bookings', async (req, res) => {
  const { flightId, passengers, totalPrice, basePrice, extraBags, selectedServices, extrasTotal, paymentMethod: rawMethod, reference, userId, selectedSeats, seatsSelectionMap } = req.body;

  const serviceDataMap = {
    'wheelchair': { label: 'مساعدة بالكرسي المتحرك', price: 0 },
    'oxygen': { label: 'أكسجين طبي على المتن', price: 15 },
    'medical': { label: 'مساعدة طبية متخصصة', price: 50 },
    'medmeal': { label: 'سيارة إسعاف', price: 12.50 }
  };


  const methodMap = {
    'card': 'credit_card',
    'paypal': 'paypal',
    'branch': 'bank_transfer',
    'transfer': 'bank_transfer'
  };
  const paymentMethod = methodMap[rawMethod] || 'credit_card';


  const bookingStatus = 'temporary';
  const paymentStatus = (rawMethod === 'branch' || rawMethod === 'transfer') ? 'pending' : 'success';


  let proofPath = null;
  if (req.body.paymentProof) {
    try {
      if (typeof req.body.paymentProof === 'string' && (req.body.paymentProof.startsWith('http') || req.body.paymentProof.startsWith('/'))) {
        proofPath = req.body.paymentProof;
      } else if (typeof req.body.paymentProof === 'string' && req.body.paymentProof.startsWith('data:image/')) {
        const parts = req.body.paymentProof.split(',');
        if (parts.length === 2) {
          const header = parts[0];
          const base64Data = parts[1];
          const matches = header.match(/data:image\/([a-zA-Z+]+);base64/);
          if (matches && matches.length === 2) {
            const extension = matches[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
            if (allowedExtensions.includes(extension.toLowerCase())) {
              const uploadDir = path.join(__dirname, 'public', 'receipts');
              if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
              }
              const fileName = `proof-${reference}-${Date.now()}.${extension}`;
              fs.writeFileSync(path.join(uploadDir, fileName), buffer);
              proofPath = `/receipts/${fileName}`;
            }
          }
        }
      } else {
        proofPath = req.body.paymentProof;
      }
    } catch (err) {
      console.error('Error processing payment proof:', err);
    }
  }


  const flightIds = Array.isArray(flightId) ? flightId : (req.body.flightIds || [flightId]);
  const seatsMap = seatsSelectionMap || { 0: selectedSeats || [] };

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    for (const fId of flightIds) {
      const [flightRows] = await connection.execute(
        'SELECT airportOrigin_code as origin, airportDestination_code as destination FROM flights WHERE id_flights = ?',
        [fId]
      );

      if (flightRows.length > 0) {
        const origin = flightRows[0].origin;
        const destination = flightRows[0].destination;
        const YEMEN_AIRPORTS = ['ADE', 'RIY', 'GXF', 'SCT', 'AAY', 'ATQ'];
        const isInternational = !YEMEN_AIRPORTS.includes(String(origin).toUpperCase().trim()) ||
          !YEMEN_AIRPORTS.includes(String(destination).toUpperCase().trim());

        if (isInternational) {
          const limitDate = new Date();
          limitDate.setMonth(limitDate.getMonth() + 6);
          limitDate.setHours(0, 0, 0, 0);

          for (const p of passengers) {
            const pExpiry = p.passportExpiry || p.passport_expiry || null;
            if (!pExpiry) {
              return res.status(400).json({
                success: false,
                error: `يرجى تحديد تاريخ انتهاء الجواز للمسافر (${p.fullName || p.name}) لأن الرحلة دولية.`
              });
            }

            const expiryDate = new Date(pExpiry);
            if (expiryDate < limitDate) {
              return res.status(400).json({
                success: false,
                error: `يجب أن يكون جواز سفر المسافر (${p.fullName || p.name}) صالحاً لمدة 6 أشهر على الأقل للسفر الدولي. أقل تاريخ انتهاء مقبول هو: ${limitDate.toISOString().split('T')[0]}`
              });
            }
          }
        }
      }
    }

    await connection.beginTransaction();

    let firstBookingId = null;
    let leadPassengerId = null;

    for (let fIdx = 0; fIdx < flightIds.length; fIdx++) {
      const currentFlightId = flightIds[fIdx];


      const segmentBasePrice = Math.round(basePrice / flightIds.length);
      const segmentExtraPrice = Math.round(extrasTotal / flightIds.length);
      const segmentTotalPrice = Math.round(totalPrice / flightIds.length);


      const [bookingResult] = await connection.execute(
        'INSERT INTO bookings (flight_id, booking_date, total_passengers, base_price, extra_total, final_price, status, booking_reference) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)',
        [currentFlightId, passengers.length, segmentBasePrice, segmentExtraPrice, segmentTotalPrice, bookingStatus, reference]
      );
      const bookingId = bookingResult.insertId;
      if (fIdx === 0) {
        firstBookingId = bookingId;
      }


      let passengerIndex = 0;
      for (const p of passengers) {
        const pName = p.name || p.fullName || 'مسافر';
        const pPassport = p.passport_number || p.passportNumber || `TMP-${Math.random()}`;
        const pDob = p.date_of_birth || p.birthDate || null;
        const pExpiry = p.passportExpiry || p.passport_expiry || null;
        const pNationality = p.nationality || '';
        const pGender = (p.gender || p.gander || 'male').toLowerCase();

        let passengerId;
        const [existing] = await connection.execute('SELECT id_passengers FROM passengers WHERE passport_number = ?', [pPassport]);

        if (existing.length > 0) {
          passengerId = existing[0].id_passengers;
          await connection.execute(
            'UPDATE passengers SET passport_expiry = ?, user_id = COALESCE(user_id, ?) WHERE id_passengers = ?',
            [pExpiry, userId || null, passengerId]
          );
        } else {
          const [passResult] = await connection.execute(
            'INSERT INTO passengers (name, passport_number, date_of_birth, passport_expiry, nationality, gander, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [pName, pPassport, pDob, pExpiry, pNationality, pGender, userId || null]
          );
          passengerId = passResult.insertId;
        }

        if (fIdx === 0 && passengerIndex === 0) {
          leadPassengerId = passengerId;
        }
        passengerIndex++;


        const flightSeats = seatsMap[fIdx] || [];
        const seatNumber = flightSeats[passengerIndex - 1] ? String(flightSeats[passengerIndex - 1]) : '';
        const seatRow = parseInt(seatNumber, 10);
        const isBusinessSeat = !isNaN(seatRow) && seatRow >= 1 && seatRow <= 3;
        const seatClass = isBusinessSeat ? 'Business' : 'Economy';

        let baseWeight = 30.0;
        const pCode = p.passengerCode || '';

        if (pCode === 'INF') {
          baseWeight = 10.0;
        } else if (seatClass === 'Business') {
          if (pCode === 'ADT') {
            baseWeight = 40.0;
          } else {
            baseWeight = 30.0;
          }
        }

        const extraBagsCount = extraBags ? Number(extraBags[p.id] || 0) : 0;
        const extraWeight = extraBagsCount * 1.0;
        const totalBaggageWeight = baseWeight + extraWeight;
        const extraBaggagePrice = extraBagsCount * 2.0;

        const [baggageResult] = await connection.execute(
          'INSERT INTO baggage (booking_id, passenger_id, weight, base_price, extra_price) VALUES (?, ?, ?, ?, ?)',
          [bookingId, passengerId, totalBaggageWeight, 0.0, extraBaggagePrice]
        );
        const baggageId = baggageResult.insertId;

        await connection.execute(
          'INSERT INTO bookings_passengers (booking_id, passenger_id, baggage_id) VALUES (?, ?, ?)',
          [bookingId, passengerId, baggageId]
        );
      }


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

      const gatewayResponse = JSON.stringify({
        paymentProof: proofPath,
        selectedBranchId: req.body.selectedBranchId || null
      });


      await connection.execute(
        'INSERT INTO payments (booking_id, amount, payment_method, payment_status, gateway_response, payment_date) VALUES (?, ?, ?, ?, ?, NOW())',
        [bookingId, segmentTotalPrice, paymentMethod, paymentStatus, gatewayResponse]
      );
    }


    if (leadPassengerId && firstBookingId) {
      await connection.execute(
        'INSERT INTO notifications (passenger_id, booking_id, title, message, type, is_read, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())',
        [
          leadPassengerId,
          firstBookingId,
          'طلب حجز جديد معلق',
          `تم تقديم طلب حجزك برقم المرجع ${reference}. يرجى الانتظار لحين مراجعة سند الدفع وتأكيد الحجز.`,
          'booking'
        ]
      );
    }

    await connection.commit();
    res.json({ success: true, bookingId: firstBookingId, reference });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Booking Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


app.post('/api/create-checkout-session', async (req, res) => {
  const { bookingId, reference, amount, flightNumber, origin, destination } = req.body;
  if (!stripe) {
    return res.status(400).json({ success: false, error: 'Stripe is not configured on this server. Please set STRIPE_SECRET_KEY.' });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `حجز رحلة طيران ${flightNumber}`,
              description: `من ${origin} إلى ${destination} (رمز الحجز: ${reference})`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/payment-success?reference=${reference}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/payment?cancel=true`,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Stripe Session Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});


app.post('/api/bookings/confirm-payment', async (req, res) => {
  const { reference } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.beginTransaction();

    const [bookings] = await connection.execute(
      'SELECT id_bookings FROM bookings WHERE booking_reference = ?',
      [reference]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }


    await connection.execute(
      "UPDATE bookings SET status = 'certain' WHERE booking_reference = ?",
      [reference]
    );


    await connection.execute(
      "UPDATE payments SET payment_status = 'success' WHERE booking_id IN (SELECT id_bookings FROM bookings WHERE booking_reference = ?)",
      [reference]
    );

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Confirm Payment Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});




app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      `SELECT n.id_notifications, n.passenger_id, n.booking_id, n.title, n.message, n.type, n.is_read, n.created_at
       FROM notifications n
       JOIN passengers p ON n.passenger_id = p.id_passengers
       WHERE p.user_id = ?
       ORDER BY n.created_at DESC LIMIT 20`,
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


app.patch('/api/notifications/read-all/:userId', async (req, res) => {
  const { userId } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute(
      `UPDATE notifications n
       JOIN passengers p ON n.passenger_id = p.id_passengers
       SET n.is_read = 1
       WHERE p.user_id = ?`,
      [userId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


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





app.get('/api/company/analytics-stats', async (req, res) => {
  const { airlineCode, airline_id } = req.query;
  if (!airlineCode && !airline_id) {
    return res.status(400).json({ success: false, error: 'airlineCode or airline_id is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    const [revRow] = await connection.execute(`
      SELECT COALESCE(SUM(p.amount), 0) as totalRevenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
    `, [airlineCode || '', airline_id || 0]);
    const totalRevenue = Number(revRow[0].totalRevenue) || 0;


    const [actRow] = await connection.execute(`
      SELECT COUNT(b.id_bookings) as activeBookings
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE b.status = 'certain' AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
    `, [airlineCode || '', airline_id || 0]);
    const activeBookings = Number(actRow[0].activeBookings) || 0;


    const [avRow] = await connection.execute(`
      SELECT COUNT(id_flights) as availableFlights
      FROM flights
      WHERE status = 'active' AND (airline_code = ? OR airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
    `, [airlineCode || '', airline_id || 0]);
    const availableFlights = Number(avRow[0].availableFlights) || 0;


    const [passRow] = await connection.execute(`
      SELECT COALESCE(SUM(b.total_passengers), 0) as totalPassengers
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE b.status = 'certain' AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
    `, [airlineCode || '', airline_id || 0]);
    const totalPassengers = Number(passRow[0].totalPassengers) || 0;


    const [destRows] = await connection.execute(`
      SELECT f.airportDestination_code as name, COUNT(b.id_bookings) as bookings
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
      GROUP BY f.airportDestination_code
      ORDER BY bookings DESC
      LIMIT 5
    `, [airlineCode || '', airline_id || 0]);

    const destinationsStats = destRows.map(r => ({
      name: arabicCityMap[r.name] || r.name,
      bookings: Number(r.bookings) || 0
    }));


    const [serviceRows] = await connection.execute(`
      SELECT gs.service_name as name, COUNT(*) as value
      FROM ground_services gs
      JOIN bookings b ON gs.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE gs.is_active = 1 AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
      GROUP BY gs.service_name
    `, [airlineCode || '', airline_id || 0]);

    const servicesStats = serviceRows.map(r => ({
      name: serviceMap[r.name] || r.name,
      value: Number(r.value) || 0
    }));


    const [recentRows] = await connection.execute(`
      SELECT b.id_bookings, b.booking_reference, b.final_price, b.status,
             f.airportOrigin_code, f.airportDestination_code,
             (SELECT p.name FROM bookings_passengers bp JOIN passengers p ON bp.passenger_id = p.id_passengers WHERE bp.booking_id = b.id_bookings LIMIT 1) as passenger
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
      ORDER BY b.booking_date DESC
      LIMIT 5
    `, [airlineCode || '', airline_id || 0]);

    const recentBookings = recentRows.map(r => ({
      id: r.booking_reference,
      route: `${arabicCityMap[r.airportOrigin_code] || r.airportOrigin_code} - ${arabicCityMap[r.airportDestination_code] || r.airportDestination_code}`,
      passenger: r.passenger || 'مسافر',
      total: `$${Number(r.final_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status: r.status === 'certain' ? 'مؤكد' : r.status === 'temporary' ? 'مؤقت' : 'ملغي',
      badgeColor: r.status === 'certain' ? 'green' : r.status === 'temporary' ? 'yellow' : 'red'
    }));


    const [sparkRows] = await connection.execute(`
      SELECT SUM(p.amount) as revenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
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


app.get('/api/financial-stats', async (req, res) => {
  const { airlineCode, airline_id } = req.query;
  if (!airlineCode && !airline_id) {
    return res.status(400).json({ success: false, error: 'airlineCode or airline_id is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    const [revRow] = await connection.execute(`
      SELECT COALESCE(SUM(p.amount), 0) as totalRevenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
    `, [airlineCode || '', airline_id || 0]);
    const totalRevenue = Number(revRow[0].totalRevenue) || 0;


    const [currRow] = await connection.execute(`
      SELECT COALESCE(SUM(p.amount), 0) as currentMonthRevenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' 
        AND MONTH(b.booking_date) = MONTH(CURRENT_DATE())
        AND YEAR(b.booking_date) = YEAR(CURRENT_DATE())
        AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
    `, [airlineCode || '', airline_id || 0]);
    const currentMonthRevenue = Number(currRow[0].currentMonthRevenue) || 0;


    const [prevRow] = await connection.execute(`
      SELECT COALESCE(SUM(p.amount), 0) as previousMonthRevenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' 
        AND b.booking_date >= DATE_SUB(DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
        AND b.booking_date < DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')
        AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
    `, [airlineCode || '', airline_id || 0]);
    const previousMonthRevenue = Number(prevRow[0].previousMonthRevenue) || 0;


    const revenueGrowth = previousMonthRevenue > 0
      ? Number(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1))
      : 0;


    const [monthRows] = await connection.execute(`
      SELECT DATE_FORMAT(b.booking_date, '%m') as monthNum, SUM(p.amount) as revenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
      GROUP BY monthNum
      ORDER BY monthNum ASC
      LIMIT 6
    `, [airlineCode || '', airline_id || 0]);

    const monthlyRevenue = monthRows.map(r => ({
      name: arabicMonths[r.monthNum] || r.monthNum,
      revenue: Number(r.revenue) || 0
    }));


    const [weekRows] = await connection.execute(`
      SELECT DAYOFWEEK(b.booking_date) as dayNum, SUM(p.amount) as revenue
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE p.payment_status = 'success' AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
        AND b.booking_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
      GROUP BY dayNum
      ORDER BY dayNum ASC
    `, [airlineCode || '', airline_id || 0]);

    const weeklyRevenue = weekRows.map(r => ({
      name: arabicWeekdays[r.dayNum] || `اليوم ${r.dayNum}`,
      revenue: Number(r.revenue) || 0
    }));


    const [classRows] = await connection.execute(`
      SELECT s.seat_class as name, COUNT(bp.id_bookings_passengers) as value
      FROM bookings_passengers bp
      JOIN seats s ON bp.seat_id = s.id_seats
      JOIN bookings b ON bp.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
      GROUP BY s.seat_class
    `, [airlineCode || '', airline_id || 0]);

    const classStats = classRows.map(r => ({
      name: classMap[r.name] || r.name,
      value: Number(r.value) || 0
    }));


    const [profitRows] = await connection.execute(`
      SELECT f.flight_number, f.airportOrigin_code, f.airportDestination_code,
             COALESCE(SUM(b.final_price), 0) as revenue
      FROM flights f
      LEFT JOIN bookings b ON b.flight_id = f.id_flights AND b.status = 'certain'
      WHERE (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
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


app.get('/api/traffic-stats', async (req, res) => {
  const { airlineCode, airline_id } = req.query;
  if (!airlineCode && !airline_id) {
    return res.status(400).json({ success: false, error: 'airlineCode or airline_id is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    const [destRows] = await connection.execute(`
      SELECT f.airportDestination_code as name, COUNT(b.id_bookings) as bookings
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE b.status = 'certain' AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
      GROUP BY f.airportDestination_code
      ORDER BY bookings DESC
      LIMIT 5
    `, [airlineCode || '', airline_id || 0]);

    const topDestinations = destRows.map(r => ({
      name: arabicCityMap[r.name] || r.name,
      bookings: Number(r.bookings) || 0
    }));


    const [occRows] = await connection.execute(`
      SELECT flight_number, airportOrigin_code, airportDestination_code, total_seats, available_seats
      FROM flights
      WHERE (airline_code = ? OR airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
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


app.get('/api/medical-services', async (req, res) => {
  const { airlineCode, airline_id } = req.query;
  if (!airlineCode && !airline_id) {
    return res.status(400).json({ success: false, error: 'airlineCode or airline_id is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    const [serviceRows] = await connection.execute(`
      SELECT gs.service_name as name, COUNT(*) as value
      FROM ground_services gs
      JOIN bookings b ON gs.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE gs.is_active = 1 AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
      GROUP BY gs.service_name
    `, [airlineCode || '', airline_id || 0]);

    const servicesStats = serviceRows.map(r => ({
      name: serviceMap[r.name] || r.name,
      value: Number(r.value) || 0
    }));


    const [critRows] = await connection.execute(`
      SELECT f.flight_number, f.airportOrigin_code, f.airportDestination_code,
             COUNT(gs.id_Ground_services) as criticalCount,
             GROUP_CONCAT(gs.service_name) as servicesList
      FROM ground_services gs
      JOIN bookings b ON gs.booking_id = b.id_bookings
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE gs.is_active = 1 AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
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


app.get('/api/passenger-stats', async (req, res) => {
  const { airlineCode, airline_id } = req.query;
  if (!airlineCode && !airline_id) {
    return res.status(400).json({ success: false, error: 'airlineCode or airline_id is required' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    const [statusRows] = await connection.execute(`
      SELECT b.status, COUNT(*) as value
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
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


    const [dayRows] = await connection.execute(`
      SELECT DAYOFWEEK(b.booking_date) as dayNum, COUNT(b.id_bookings) as count
      FROM bookings b
      JOIN flights f ON b.flight_id = f.id_flights
      WHERE (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
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
      WHERE DAYOFWEEK(f.departure_time) = ? AND (f.airline_code = ? OR f.airline_code = (SELECT airline_code FROM companies WHERE id_company = ?))
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
      extraWeight: r.extraBaggagePrice > 0 ? Math.round(Number(r.extraBaggagePrice) / 2) : 0,
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


app.get('/api/flight-details/:flightNumber', async (req, res) => {
  const { flightNumber } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    const [flights] = await connection.execute(
      'SELECT id_flights as id, flight_number as flightNumber, airportOrigin_code as origin, airportDestination_code as destination, aircraft_type as aircraftType, departure_time as departureTime, arrival_time as arrivalTime FROM flights WHERE REPLACE(flight_number, " ", "") = ?',
      [flightNumber.replace(/\s+/g, '')]
    );

    if (flights.length === 0) {
      return res.status(404).json({ success: false, error: 'الرحلة غير موجودة' });
    }

    const flight = flights[0];


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





app.get('/api/admin/companies', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      `SELECT 
         a.id_admin, 
         a.email AS username, 
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


app.post('/api/admin/companies', async (req, res) => {
  const { username, password, airline_code, company_name, employee_id, department } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    const [existing] = await connection.execute('SELECT id_admin FROM admins WHERE email = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'اسم المستخدم مسجل بالفعل' });
    }


    if (airline_code && company_name) {
      await connection.execute(
        `INSERT INTO companies (company_name, airline_code) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE company_name = VALUES(company_name)`,
        [company_name, airline_code]
      );
    }


    const [maxIdRows] = await connection.execute('SELECT COALESCE(MAX(id_admin), 0) + 1 as nextId FROM admins');
    const nextId = maxIdRows[0].nextId;

    const hashedPassword = await bcrypt.hash(password, 10);


    await connection.execute(
      `INSERT INTO admins (id_admin, email, password, role, airline_code, employee_id, department, created_at) 
       VALUES (?, ?, ?, 'company', ?, ?, ?, NOW())`,
      [nextId, username, hashedPassword, airline_code || null, employee_id || null, department || null]
    );

    res.status(201).json({ success: true, companyId: nextId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


app.put('/api/admin/companies/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, airline_code, company_name, employee_id, department } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    const [existing] = await connection.execute('SELECT id_admin FROM admins WHERE email = ? AND id_admin != ?', [username, id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'اسم المستخدم مسجل بمستخدم آخر' });
    }


    if (airline_code && company_name) {
      await connection.execute(
        `INSERT INTO companies (company_name, airline_code) 
         VALUES (?, ?) 
         ON DUPLICATE KEY UPDATE company_name = VALUES(company_name)`,
        [company_name, airline_code]
      );
    }


    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await connection.execute(
        `UPDATE admins 
         SET username = ?, password = ?, airline_code = ?, employee_id = ?, department = ? 
         WHERE id_admin = ? AND role = 'company'`,
        [username, hashedPassword, airline_code || null, employee_id || null, department || null, id]
      );
    } else {
      await connection.execute(
        `UPDATE admins 
         SET username = ?, airline_code = ?, employee_id = ?, department = ? 
         WHERE id_admin = ? AND role = 'company'`,
        [username, airline_code || null, employee_id || null, department || null, id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


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



const seedAdmin = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute('SELECT id_admin FROM admins WHERE email = ?', ['admin']);
    if (rows.length === 0) {
      const [maxIdRows] = await connection.execute('SELECT COALESCE(MAX(id_admin), 0) + 1 as nextId FROM admins');
      const nextId = maxIdRows[0].nextId;
      const hashedPassword = await bcrypt.hash('ADMIN123', 10);
      await connection.execute(
        'INSERT INTO admins (id_admin, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
        [nextId, 'admin', hashedPassword, 'admin']
      );
      console.log('Seeded default admin account successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin account:', error);
  } finally {
    if (connection) await connection.end();
  }
};


async function cancelBookingHandler(req, res) {
  const bookingId = req.params.id || req.body.bookingId;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.beginTransaction();


    const [bookingRows] = await connection.execute(
      'SELECT booking_reference FROM bookings WHERE id_bookings = ?',
      [bookingId]
    );

    if (bookingRows.length > 0) {
      const reference = bookingRows[0].booking_reference;
      await connection.execute(
        "UPDATE bookings SET status = 'cancelled' WHERE booking_reference = ?",
        [reference]
      );
    } else {
      await connection.execute(
        "UPDATE bookings SET status = 'cancelled' WHERE id_bookings = ?",
        [bookingId]
      );
    }

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error canceling booking:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}

app.patch('/api/bookings/:id/cancel', cancelBookingHandler);
app.post('/api/bookings/cancel', cancelBookingHandler);





app.get('/api/chat/sessions', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [sessions] = await connection.execute(`
      SELECT 
        cs.id, cs.session_key, cs.user_name, cs.user_email, cs.status, cs.created_at, cs.updated_at,
        (SELECT COUNT(*) FROM chat_messages cm WHERE cm.session_id = cs.id AND cm.sender = 'user' AND cm.is_read = 0) as unread_count,
        (SELECT cm2.text FROM chat_messages cm2 WHERE cm2.session_id = cs.id ORDER BY cm2.created_at DESC LIMIT 1) as last_message,
        (SELECT cm3.created_at FROM chat_messages cm3 WHERE cm3.session_id = cs.id ORDER BY cm3.created_at DESC LIMIT 1) as last_message_time
      FROM chat_sessions cs
      ORDER BY cs.updated_at DESC
    `);
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Chat sessions error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


app.get('/api/chat/sessions/:key/messages', async (req, res) => {
  const { key } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    await connection.execute(
      `UPDATE chat_messages cm JOIN chat_sessions cs ON cm.session_id = cs.id SET cm.is_read = 1 WHERE cs.session_key = ? AND cm.sender = 'user'`,
      [key]
    );
    const [messages] = await connection.execute(`
      SELECT cm.*, cm.id_chat AS id FROM chat_messages cm 
      JOIN chat_sessions cs ON cm.session_id = cs.id 
      WHERE cs.session_key = ? 
      ORDER BY cm.created_at ASC
    `, [key]);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Chat messages error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


app.post('/api/chat/send', async (req, res) => {
  const { session_key, text, sender, user_name, user_email } = req.body;
  if (!session_key || !text || !sender) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    await connection.execute(`
      INSERT INTO chat_sessions (session_key, user_name, user_email, status, created_at, updated_at)
      VALUES (?, ?, ?, 'open', NOW(), NOW())
      ON DUPLICATE KEY UPDATE updated_at = NOW(), user_name = COALESCE(?, user_name), user_email = COALESCE(?, user_email)
    `, [session_key, user_name || 'زائر', user_email || null, user_name || null, user_email || null]);


    const [[session]] = await connection.execute('SELECT id FROM chat_sessions WHERE session_key = ?', [session_key]);
    const session_id = session.id;


    const [result] = await connection.execute(
      'INSERT INTO chat_messages (session_id, sender, text, is_read, created_at) VALUES (?, ?, ?, ?, NOW())',
      [session_id, sender, text, sender === 'admin' ? 1 : 0]
    );


    await connection.execute('UPDATE chat_sessions SET updated_at = NOW(), status = ? WHERE id = ?', [
      sender === 'admin' ? 'replied' : 'open', session_id
    ]);

    res.json({ success: true, messageId: result.insertId });
  } catch (error) {
    console.error('Chat send error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


app.get('/api/chat/poll/:key', async (req, res) => {
  const { key } = req.params;
  const { after } = req.query;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [messages] = await connection.execute(`
      SELECT cm.*, cm.id_chat AS id FROM chat_messages cm
      JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cs.session_key = ? AND cm.id_chat > ?
      ORDER BY cm.created_at ASC
    `, [key, after || 0]);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


app.patch('/api/chat/sessions/:key/close', async (req, res) => {
  const { key } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute("UPDATE chat_sessions SET status = 'closed' WHERE session_key = ?", [key]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


const ensureSettingsTable = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(64) PRIMARY KEY,
        setting_value VARCHAR(255) NOT NULL
      )
    `);


    await connection.execute(`
      INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES 
      ('markup_rate', '5'),
      ('exchange_rate', '530'),
      ('support_email', 'support@ybf.com')
    `);
    console.log('✅ Settings table ready.');
  } catch (err) {
    console.error('Settings table creation error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
};


app.get('/api/admin/settings', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute('SELECT * FROM system_settings');
    const settings = {};
    rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


app.post('/api/admin/settings', async (req, res) => {
  const { markup_rate, exchange_rate, support_email } = req.body;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    await connection.execute(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['markup_rate', String(markup_rate), String(markup_rate)]
    );
    await connection.execute(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['exchange_rate', String(exchange_rate), String(exchange_rate)]
    );
    await connection.execute(
      'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      ['support_email', String(support_email), String(support_email)]
    );

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});


const ensureChatTables = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());


    let hasIdChat = false;
    try {
      const [columns] = await connection.execute("SHOW COLUMNS FROM chat_messages LIKE 'id_chat'");
      if (columns.length > 0) {
        hasIdChat = true;
      }
    } catch (e) {

    }


    if (!hasIdChat) {
      try {
        const [tables] = await connection.execute("SHOW TABLES LIKE 'chat_messages'");
        if (tables.length > 0) {
          await connection.execute("DROP TABLE chat_messages");
          console.log('⚠️ Dropped legacy chat_messages table to apply unified schema.');
        }
      } catch (e) {
        console.error('Error dropping chat_messages:', e.message);
      }
    }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_key VARCHAR(64) UNIQUE NOT NULL,
        user_name VARCHAR(100) DEFAULT 'زائر',
        user_email VARCHAR(150),
        status ENUM('open','replied','closed') DEFAULT 'open',
        created_at DATETIME DEFAULT NOW(),
        updated_at DATETIME DEFAULT NOW()
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id_chat INT AUTO_INCREMENT PRIMARY KEY,
        session_id INT DEFAULT NULL,
        sender ENUM('user','admin') NOT NULL,
        sender_name VARCHAR(100) DEFAULT NULL,
        sender_email VARCHAR(150) DEFAULT NULL,
        message TEXT DEFAULT NULL,
        text TEXT DEFAULT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT NOW(),
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Chat tables ready (unified schema).');
  } catch (err) {
    console.error('Chat table creation error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
};


app.use(express.static(path.join(__dirname, 'dist')));

app.get('*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  seedAdmin();
  ensureChatTables();
  ensureSettingsTable();
});
