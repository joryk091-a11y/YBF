import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Helper to parse DATABASE_URL
const getDbConfig = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not defined in the .env file!');
    process.exit(1);
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

// Realistic Arabic Names for Passengers
const arabicNames = [
  "أحمد اليماني", "خالد الشميري", "فاطمة الحاشدي", "محمد المطري", "سارة اليافعي",
  "عبدالرحمن الحضرمي", "ريم الوصابي", "علي الحيمي", "منى السقاف", "حسن الكبسي",
  "أروى الصنعاني", "صالح العدني", "يسرى ذيبان", "ماجد الجبلي", "بلقيس الشرعبي",
  "هشام التهامي", "عمر الحريبي", "هند القدسي", "جمال الفضلي", "عادل الضبيبي",
  "محمد علي", "سارة أحمد", "خالد وليد", "مريم عمر", "ياسر عرفات", "رنا عبدالله",
  "عماد حسين", "ندى جميل", "سلطان العتيبي", "لجين الحربي", "نواف المطيري", "شهد العتيبي"
];

// Realistic Passport Nationalities
const nationalities = ["يمني", "يمنية", "مصري", "مصرية", "سعودي", "سعودية", "إماراتي", "أردني"];

// Ground Services map
const serviceOptions = [
  { label: 'مساعدة بالكرسي المتحرك', price: 0 },
  { label: 'أكسجين طبي على المتن', price: 15 },
  { label: 'مساعدة طبية متخصصة', price: 50 },
  { label: 'سيارة إسعاف', price: 12.50 }
];

// Airport Codes
const airportCodes = ["ADE", "CAI", "JED", "RUH", "DXB"];
const aircraftTypes = ["Airbus A320", "Boeing 737", "Airbus A330"];

// Generate a random string of uppercase alphanumeric characters
const generatePNR = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate random date between two dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

async function seed() {
  let connection;
  try {
    const config = getDbConfig();
    console.log('Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('Connected successfully.\n');

    // Check if passport_expiry exists in passengers table, add if missing
    const [cols] = await connection.query('DESCRIBE passengers');
    const hasPassportExpiry = cols.some(c => c.Field === 'passport_expiry');
    if (!hasPassportExpiry) {
      console.log("Column 'passport_expiry' is missing in 'passengers' table. Adding it to match server.js and schema.prisma...");
      await connection.query('ALTER TABLE passengers ADD COLUMN passport_expiry DATE NULL AFTER passport_number');
      console.log("Column 'passport_expiry' added successfully.\n");
    }

    // 1. Disable foreign key checks to safely truncate transaction tables
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    console.log('Clearing old transaction records...');
    await connection.query('TRUNCATE TABLE bookings_passengers');
    await connection.query('TRUNCATE TABLE baggage');
    await connection.query('TRUNCATE TABLE ground_services');
    await connection.query('TRUNCATE TABLE payments');
    await connection.query('TRUNCATE TABLE notifications');
    await connection.query('TRUNCATE TABLE bookings');
    await connection.query('TRUNCATE TABLE seats');
    await connection.query('TRUNCATE TABLE flights_logs');
    await connection.query('TRUNCATE TABLE flights');
    await connection.query('TRUNCATE TABLE passengers');
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Database transaction tables cleared successfully.\n');

    // 2. Fetch Companies dynamically from airline_companies
    const [companies] = await connection.query('SELECT id_airline, airline_code, airline_name FROM airline_companies');
    if (companies.length === 0) {
      console.log('No companies found in airline_companies table! Seeding default companies...');
      await connection.query(`
        INSERT INTO airline_companies (id_airline, airline_name, airline_code, country, status, created_at)
        VALUES 
        (1, 'خطوط طيران اليمنية', 'IY', 'Yemen', 'active', NOW()),
        (2, 'مصر للطيران', 'MS', 'Egypt', 'active', NOW())
      `);
      // Re-fetch
      const [reFetched] = await connection.query('SELECT id_airline, airline_code, airline_name FROM airline_companies');
      companies.push(...reFetched);
    }
    console.log(`Found ${companies.length} airline companies:`, companies.map(c => c.airline_name).join(', '));

    // 3. Define dates for scheduling flights
    const now = new Date();
    const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0); // last day of next month

    // Generate Flights config
    // 6 flights per company (3 this month, 3 next month)
    const flightRecords = [];
    let flightCounter = 1;

    for (const company of companies) {
      for (let i = 0; i < 6; i++) {
        const isNextMonth = i >= 3;
        
        // Define start and end range for flight date
        let startRange, endRange;
        if (isNextMonth) {
          startRange = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          endRange = endOfNextMonth;
        } else {
          startRange = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); // starting tomorrow
          endRange = new Date(now.getFullYear(), now.getMonth() + 1, 0); // end of this month
        }

        const departureTime = randomDate(startRange, endRange);
        departureTime.setMinutes(Math.round(departureTime.getMinutes() / 30) * 30, 0, 0); // Round to nearest 30 mins
        
        const duration = 90 + Math.floor(Math.random() * 5) * 30; // 90 to 210 mins
        const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

        // Select distinct origin and destination airports
        const originIndex = Math.floor(Math.random() * airportCodes.length);
        let destIndex = Math.floor(Math.random() * airportCodes.length);
        while (destIndex === originIndex) {
          destIndex = Math.floor(Math.random() * airportCodes.length);
        }

        const origin = airportCodes[originIndex];
        const dest = airportCodes[destIndex];

        const aircraft = aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)];
        const basePrice = 200 + Math.floor(Math.random() * 8) * 50; // $200 - $550

        const flightNumber = `${company.airline_code}${100 + flightCounter}`;
        flightCounter++;

        flightRecords.push({
          flight_number: flightNumber,
          airline_code: company.airline_code,
          airline_id: company.id_airline,
          airportOrigin_code: origin,
          airportDestination_code: dest,
          departure_time: departureTime,
          arrival_time: arrivalTime,
          duration: duration,
          aircraft_type: aircraft,
          total_seats: 102, // 17 rows of 6 seats = 102 seats total
          available_seats: 102,
          price: basePrice
        });
      }
    }

    // Insert Flights and Generate Seats
    const seededFlights = [];
    console.log(`\nInserting ${flightRecords.length} flights and generating 102 seats for each...`);
    
    for (const f of flightRecords) {
      const [result] = await connection.execute(
        `INSERT INTO flights (flight_number, airline_code, airline_id, airportOrigin_code, airportDestination_code, departure_time, arrival_time, duration, aircraft_type, total_seats, available_seats, status, price, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, NOW())`,
        [f.flight_number, f.airline_code, f.airline_id, f.airportOrigin_code, f.airportDestination_code, f.departure_time, f.arrival_time, f.duration, f.aircraft_type, f.total_seats, f.available_seats, f.price]
      );
      
      const flightId = result.insertId;
      seededFlights.push({ ...f, id: flightId });

      // Generate Seats for this flight
      // Row 1-3 Business Class, Row 4-17 Economy Class
      // Seats letters: A, B, C, D, E, F
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const seatInserts = [];
      
      for (let row = 1; row <= 17; row++) {
        const isBusiness = row <= 3;
        const seatClass = isBusiness ? ' business' : 'economy'; // note the leading space in ' business'
        const priceMultiplier = isBusiness ? 1.5 : 1.0;
        const seatPrice = f.price * priceMultiplier;

        for (const letter of letters) {
          const seatNum = `${row}${letter}`;
          seatInserts.push([flightId, seatNum, seatClass, 1, seatPrice]);
        }
      }

      // Bulk insert seats for speed
      await connection.query(
        'INSERT INTO seats (flight_id, seat_number, seat_class, is_available, seat_price) VALUES ?',
        [seatInserts]
      );
    }
    console.log('Flights and seats seeded successfully.');

    // 4. Simulate Occupancy (30% Fully Booked, 70% Partially Booked)
    console.log('\nSimulating bookings and passenger occupancies...');
    
    // Sort flights randomly to choose 30% for fully booked
    const shuffledFlights = [...seededFlights].sort(() => Math.random() - 0.5);
    const fullyBookedCount = Math.round(shuffledFlights.length * 0.3);
    
    const fullyBookedFlights = shuffledFlights.slice(0, fullyBookedCount);
    const partiallyBookedFlights = shuffledFlights.slice(fullyBookedCount);

    console.log(`Setting ${fullyBookedFlights.length} flights to Fully Booked (100% capacity)`);
    console.log(`Setting ${partiallyBookedFlights.length} flights to Partially Booked (40-50% capacity)`);

    let totalBookings = 0;
    let totalPassengers = 0;
    let totalGroundServices = 0;

    // Helper function to seed bookings for a flight
    async function seedBookingsForFlight(flight, isFullyBooked) {
      // Fetch all seats for this flight
      const [seats] = await connection.execute(
        'SELECT id_seats, seat_number, seat_class, seat_price FROM seats WHERE flight_id = ? ORDER BY id_seats ASC',
        [flight.id]
      );

      // Shuffle seats to allocate them randomly
      const availableSeatsList = [...seats].sort(() => Math.random() - 0.5);

      // Determine target number of occupied seats
      let targetOccupied;
      if (isFullyBooked) {
        targetOccupied = flight.total_seats; // 102
      } else {
        const percentage = 40 + Math.floor(Math.random() * 11); // 40% to 50%
        targetOccupied = Math.round((percentage / 100) * flight.total_seats);
      }

      let occupiedCount = 0;
      while (occupiedCount < targetOccupied) {
        // Bookings can have between 1 to 4 passengers
        const bookingSize = Math.min(
          1 + Math.floor(Math.random() * 4), 
          targetOccupied - occupiedCount
        );

        const bookingSeats = availableSeatsList.slice(occupiedCount, occupiedCount + bookingSize);
        occupiedCount += bookingSize;

        // Generate Booking Details
        const bookingRef = generatePNR();
        const bookingDate = randomDate(
          new Date(flight.departure_time.getTime() - 15 * 24 * 60 * 60 * 1000), // up to 15 days before departure
          new Date(flight.departure_time.getTime() - 12 * 60 * 60 * 1000)      // at least 12 hours before departure
        );

        let bookingBasePrice = 0;
        let bookingExtraTotal = 0;

        // Pre-create passengers data for calculating prices
        const passengerList = [];
        for (let pIdx = 0; pIdx < bookingSize; pIdx++) {
          const seat = bookingSeats[pIdx];
          bookingBasePrice += parseFloat(seat.seat_price);

          // Extra baggage cost (20% chance of extra bag, cost $30)
          const hasExtraBag = Math.random() < 0.2;
          const baggageExtraPrice = hasExtraBag ? 30.00 : 0.00;
          const extraBagsCount = hasExtraBag ? 1 : 0;
          bookingExtraTotal += baggageExtraPrice;

          // Ground Services (20% overall passenger chance)
          // We decide on ground services globally, keeping count of all passengers
          const needsGroundService = Math.random() < 0.2;
          let selectedService = null;
          if (needsGroundService) {
            selectedService = serviceOptions[Math.floor(Math.random() * serviceOptions.length)];
            bookingExtraTotal += parseFloat(selectedService.price);
          }

          const randomName = arabicNames[Math.floor(Math.random() * arabicNames.length)];
          const passportNo = `P${1000000 + Math.floor(Math.random() * 9000000)}`;
          const birthDate = randomDate(new Date(1960, 0, 1), new Date(2015, 0, 1));
          
          // Passport expiry must be valid (and valid for 6 months if international)
          const expiryDate = new Date(flight.departure_time);
          expiryDate.setFullYear(expiryDate.getFullYear() + 2 + Math.floor(Math.random() * 5)); // valid for 2-7 years

          const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
          const gender = Math.random() < 0.5 ? 'male' : 'female';

          passengerList.push({
            name: randomName,
            passport_number: passportNo,
            date_of_birth: birthDate,
            passport_expiry: expiryDate,
            nationality: nationality,
            gender: gender,
            seat: seat,
            baggageExtraPrice,
            extraBagsCount,
            selectedService
          });
        }

        const bookingFinalPrice = bookingBasePrice + bookingExtraTotal;

        // Insert booking record
        const [bookingResult] = await connection.execute(
          `INSERT INTO bookings (flight_id, booking_date, total_passengers, base_price, extra_total, final_price, status, booking_reference)
           VALUES (?, ?, ?, ?, ?, ?, 'certain', ?)`,
          [flight.id, bookingDate, bookingSize, bookingBasePrice, bookingExtraTotal, bookingFinalPrice, bookingRef]
        );
        const bookingId = bookingResult.insertId;
        totalBookings++;

        // Process each passenger in booking
        for (const p of passengerList) {
          // Insert passenger
          const [passResult] = await connection.execute(
            `INSERT INTO passengers (name, passport_number, date_of_birth, passport_expiry, nationality, gander, user_id)
             VALUES (?, ?, ?, ?, ?, ?, 1)`, // Link to demo user 1
            [p.name, p.passport_number, p.date_of_birth, p.passport_expiry, p.nationality, p.gender]
          );
          const passengerId = passResult.insertId;
          totalPassengers++;

          // Insert baggage
          // base weight: 23kg for economy, 30kg for business
          const isBusiness = p.seat.seat_class.trim() === 'business';
          const baseWeight = isBusiness ? 30.0 : 23.0;
          const extraWeight = p.extraBagsCount * 23.0;
          const totalWeight = baseWeight + extraWeight;

          const [baggageResult] = await connection.execute(
            `INSERT INTO baggage (booking_id, passenger_id, weight, base_price, extra_price)
             VALUES (?, ?, ?, 0.00, ?)`,
            [bookingId, passengerId, totalWeight, p.baggageExtraPrice]
          );
          const baggageId = baggageResult.insertId;

          // Insert booking-passenger relation linking the seat
          await connection.execute(
            `INSERT INTO bookings_passengers (booking_id, passenger_id, seat_id, baggage_id)
             VALUES (?, ?, ?, ?)`,
            [bookingId, passengerId, p.seat.id_seats, baggageId]
          );

          // Update seat status to occupied
          await connection.execute(
            'UPDATE seats SET is_available = 0 WHERE id_seats = ?',
            [p.seat.id_seats]
          );

          // Insert Ground Services if selected
          if (p.selectedService) {
            await connection.execute(
              `INSERT INTO ground_services (booking_id, service_name, price, is_active, created_at)
               VALUES (?, ?, ?, 1, NOW())`,
              [bookingId, p.selectedService.label, p.selectedService.price]
            );
            totalGroundServices++;
          }
        }

        // Create a successful payment record for the booking
        const transactionId = `TXN-${10000000 + Math.floor(Math.random() * 90000000)}`;
        const paymentMethod = ['credit_card', 'debit_card', 'paypal', 'bank_transfer'][Math.floor(Math.random() * 4)];
        
        await connection.execute(
          `INSERT INTO payments (booking_id, amount, payment_method, tansaction_id, payment_status, payment_date)
           VALUES (?, ?, ?, ?, 'success', ?)`,
          [bookingId, bookingFinalPrice, paymentMethod, transactionId, bookingDate]
        );
      }

      // Update flight available seats in DB
      const availableCount = flight.total_seats - targetOccupied;
      await connection.execute(
        'UPDATE flights SET available_seats = ? WHERE id_flights = ?',
        [availableCount, flight.id]
      );
    }

    // Process all bookings sequentially
    for (const f of fullyBookedFlights) {
      await seedBookingsForFlight(f, true);
    }
    for (const f of partiallyBookedFlights) {
      await seedBookingsForFlight(f, false);
    }

    console.log('\nSeeding completed successfully! 🎉');

    // 5. Print elegant report in Terminal
    console.log('===================================================');
    console.log('      DATABASE SEEDING DEMO DATA REPORT            ');
    console.log('===================================================');
    console.log(` Flights Created:          ${seededFlights.length} flights`);
    console.log(`   - Fully Booked (100%):  ${fullyBookedFlights.length} flights`);
    console.log(`   - Partially (40-50%):   ${partiallyBookedFlights.length} flights`);
    console.log(` Bookings Simulated:       ${totalBookings} bookings`);
    console.log(` Passengers Generated:     ${totalPassengers} passengers`);
    console.log(` Ground Services Assigned: ${totalGroundServices} passengers (~${Math.round((totalGroundServices/totalPassengers)*100)}%)`);
    console.log('---------------------------------------------------');
    console.log(' Database is now ready for the final presentation!');
    console.log('===================================================');

  } catch (err) {
    console.error('\n❌ Seeding failed with error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
