// Native fetch in Node 25

async function test() {
    const flight = {
        flight_number: 'TEST-999',
        airline_code: 'IY',
        airportOrigin_code: 'ADE',
        airportDestination_code: 'CAI',
        departure_time: '2025-06-01T10:00:00',
        arrival_time: '2025-06-01T13:00:00',
        aircraft_type: 'Boeing 737',
        total_seats: 100,
        available_seats: 100,
        price: 500
    };

    try {
        const response = await fetch('http://localhost:5001/api/flights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(flight)
        });
        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

test();
