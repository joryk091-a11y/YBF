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
  if (!url) return null;
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

app.post('/api/register', async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  console.log('Register Request:', { fullName, email, phone });
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());

    // Check if email exists
    const [existing] = await connection.execute('SELECT id_users FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مسجل بالفعل' });
    }

    const [result] = await connection.execute(
      'INSERT INTO users (full_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())',
      [fullName, email, phone, password] // In a real app, hash the password!
    );

    res.status(201).json({ success: true, userId: result.insertId });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/login', async (req, res) => {
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
        user: {
          id: user.id_users,
          fullName: user.full_name,
          email: user.email
        }
      });
    } else {
      res.status(401).json({ success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/admin/users', async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute('SELECT id_users, full_name, email, phone, created_at FROM users ORDER BY created_at DESC');
    res.json({ success: true, users: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/company-login', async (req, res) => {
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
});


// Get all bookings for a logged-in user
app.get('/api/my-bookings/:userId', async (req, res) => {
  const { userId } = req.params;
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
});

// Get all passengers for a specific booking (for individual boarding passes)
app.get('/api/booking-passengers/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
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
});


// --- NEW FLIGHT MANAGEMENT ENDPOINTS ---

// Get all flights for a specific airline/company
app.get('/api/flights', async (req, res) => {
  const { airlineCode } = req.query;
  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    const [rows] = await connection.execute(
      'SELECT * FROM flights WHERE airline_code = ? ORDER BY departure_time DESC',
      [airlineCode]
    );
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
// Search flights
app.get('/api/search-flights', async (req, res) => {
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
});

// Update flight
app.post('/api/flights/:id', async (req, res) => {
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

  let connection;
  try {
    connection = await mysql.createConnection(getDbConfig());
    await connection.beginTransaction();

    // 1. Create the booking record
    const [bookingResult] = await connection.execute(
      'INSERT INTO bookings (flight_id, booking_date, total_passengers, base_price, extra_total, final_price, status, booking_reference) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)',
      [flightId, passengers.length, basePrice || (totalPrice / passengers.length), extrasTotal || 0, totalPrice, 'certain', reference]
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
      [bookingId, totalPrice, paymentMethod, 'success']
    );

    // 6. Create booking notification linked to user_id and passenger_id
    if (userId) {
      const firstPassport = passengers[0]?.passportNumber || passengers[0]?.passport_number;
      let notifPassengerId = null;
      if (firstPassport) {
        const [pRow] = await connection.execute(
          'SELECT id_passengers FROM passengers WHERE passport_number = ?', [firstPassport]
        );
        if (pRow.length > 0) notifPassengerId = pRow[0].id_passengers;
      }
      await connection.execute(
        `INSERT INTO notifications (passenger_id, user_id, booking_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, 'booking', 0, NOW())`,
        [
          notifPassengerId,
          userId,
          bookingId,
          'تم تأكيد حجزك بنجاح! ✈️',
          `تم إنشاء الحجز برقم مرجعي ${reference}. يسعدنا خدمتك في رحلتك القادمة.`
        ]
      );
    }

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


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
