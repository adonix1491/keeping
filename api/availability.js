const { sql } = require('@vercel/postgres');

// This API fetches availability for a restaurant based on date
// For now, we'll implement a simple scraping approach or return cached data

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { restaurantId, date, partySize = 2 } = req.query;

    if (!restaurantId || !date) {
        return res.status(400).json({ error: 'Missing restaurantId or date' });
    }

    try {
        // Get restaurant info from database
        const { rows } = await sql`SELECT * FROM restaurants WHERE id = ${restaurantId}`;

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const restaurant = rows[0];
        const bookingUrl = restaurant.booking_url;

        // For now, generate realistic time slots based on typical restaurant hours
        // In production, this would scrape the Inline page or use their API
        const slots = generateTimeSlots(date, bookingUrl);

        return res.status(200).json({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            date: date,
            partySize: parseInt(partySize),
            slots: slots,
            bookingUrl: bookingUrl,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({ error: String(error) });
    }
};

// Generate realistic time slots
// In production, this would be replaced with actual scraping
function generateTimeSlots(date, bookingUrl) {
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // All time slots
    const lunchSlots = ['11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '13:00', '13:15', '13:30'];
    const dinnerSlots = ['17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:30', '21:00', '21:15', '21:30', '22:00', '22:30', '23:00'];

    const allSlots = [...lunchSlots, ...dinnerSlots];

    // Use date as seed for consistent (but varied) results
    const dateSeed = dateObj.getTime();

    return allSlots.map((time, index) => {
        // Simple deterministic "randomness" based on date + time index
        const hash = (dateSeed + index * 12345) % 100;

        // Most popular times (12:00, 18:00-19:30) are more likely to be full
        const isPeakTime = ['12:00', '18:00', '18:30', '19:00', '19:30'].includes(time);
        const threshold = isPeakTime ? 70 : 40; // 70% chance full at peak, 40% otherwise

        // Weekend dates are busier
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        const adjustedThreshold = isWeekend ? threshold + 20 : threshold;

        const status = hash < adjustedThreshold ? 'FULL' : 'AVAILABLE';

        return {
            time,
            status,
            canWaitlist: status === 'FULL' // Only show waitlist option for full slots
        };
    });
}
