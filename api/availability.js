const { sql } = require('@vercel/postgres');

// GET availability from cache, trigger scrape if stale
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { restaurantId, date, partySize = 2 } = req.query;

    if (!restaurantId || !date) {
        return res.status(400).json({ error: 'Missing restaurantId or date' });
    }

    try {
        // 1. Get restaurant info
        const { rows: restaurants } = await sql`
            SELECT * FROM restaurants WHERE id = ${restaurantId}
        `;

        if (restaurants.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        const restaurant = restaurants[0];

        // 2. Check cache
        const { rows: cachedSlots } = await sql`
            SELECT time_slot, status, has_inline_waitlist, last_updated
            FROM availability_cache
            WHERE restaurant_id = ${restaurantId} AND date = ${date}
            ORDER BY time_slot ASC
        `;

        let slots = [];
        let cacheStatus = 'fresh';
        let lastUpdated = null;

        if (cachedSlots.length > 0) {
            // Check if cache is stale (older than 1 hour)
            const lastUpdate = new Date(cachedSlots[0].last_updated);
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

            if (lastUpdate < hourAgo) {
                cacheStatus = 'stale';
            }

            lastUpdated = cachedSlots[0].last_updated;

            slots = cachedSlots.map(row => ({
                time: row.time_slot,
                status: row.status,
                hasWaitlist: row.has_inline_waitlist,
                canSubscribe: row.status === 'FULL' && !row.has_inline_waitlist
            }));
        } else {
            // No cache - generate initial data
            // In production, this would trigger a scrape
            cacheStatus = 'miss';
            slots = generateDefaultSlots(date);
        }

        // Group by period
        const groupedSlots = groupSlotsByPeriod(slots);

        return res.status(200).json({
            restaurantId: parseInt(restaurantId),
            restaurantName: restaurant.name,
            date: date,
            partySize: parseInt(partySize),
            slots: slots,
            groupedSlots: groupedSlots,
            bookingUrl: restaurant.booking_url,
            cacheStatus: cacheStatus,
            lastUpdated: lastUpdated
        });

    } catch (error) {
        console.error('Availability error:', error);
        return res.status(500).json({ error: String(error) });
    }
};

function generateDefaultSlots(date) {
    const dateObj = new Date(date);
    const allSlots = [
        '11:00', '11:15', '11:30', '11:45', '12:00', '12:30', '13:00', '13:30',
        '14:30', '15:00', '15:30',
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
    ];

    const seed = dateObj.getTime();

    return allSlots.map((time, index) => {
        const hash = (seed + index * 7919) % 100;
        const isPeakTime = ['12:00', '18:00', '18:30', '19:00', '19:30'].includes(time);
        const threshold = isPeakTime ? 70 : 40;
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        const adjustedThreshold = isWeekend ? threshold + 20 : threshold;

        const isFull = hash < adjustedThreshold;
        const hasWaitlist = isFull && (hash % 4 === 0);

        return {
            time,
            status: isFull ? 'FULL' : 'AVAILABLE',
            hasWaitlist,
            canSubscribe: isFull && !hasWaitlist
        };
    });
}

function groupSlotsByPeriod(slots) {
    const lunch = [];
    const afternoon = [];
    const dinner = [];

    slots.forEach(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        if (hour < 14) {
            lunch.push(slot);
        } else if (hour < 17) {
            afternoon.push(slot);
        } else {
            dinner.push(slot);
        }
    });

    return { lunch, afternoon, dinner };
}
