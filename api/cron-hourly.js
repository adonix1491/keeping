const { sql } = require('@vercel/postgres');

// Hourly refresh cron job
// Runs every hour to update availability cache for all restaurants

module.exports = async (req, res) => {
    // Verify cron secret (Vercel sets this automatically for cron jobs)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        // Allow in development, require auth in production
        if (process.env.VERCEL) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        const logs = [];
        const startTime = Date.now();
        logs.push(`Hourly refresh started at ${new Date().toISOString()}`);

        // 1. Get all restaurants
        const { rows: restaurants } = await sql`SELECT id, name, booking_url FROM restaurants`;
        logs.push(`Found ${restaurants.length} restaurants`);

        // 2. Get dates to refresh (today + next 30 days)
        const dates = [];
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d.toISOString().split('T')[0]);
        }
        logs.push(`Will refresh dates: ${dates.join(', ')}`);

        // 3. For each restaurant and date, trigger scrape
        let successCount = 0;
        let errorCount = 0;

        for (const restaurant of restaurants) {
            for (const date of dates) {
                try {
                    // Call internal scrape function
                    await scrapeAndCache(restaurant.id, date);
                    successCount++;
                } catch (e) {
                    errorCount++;
                    logs.push(`Error scraping ${restaurant.name} on ${date}: ${e.message}`);
                }
            }
        }

        const duration = Date.now() - startTime;
        logs.push(`Completed: ${successCount} success, ${errorCount} errors in ${duration}ms`);

        return res.status(200).json({
            success: true,
            message: 'Hourly refresh completed',
            stats: {
                restaurants: restaurants.length,
                dates: dates.length,
                successCount,
                errorCount,
                durationMs: duration
            },
            logs
        });

    } catch (error) {
        console.error('Hourly refresh error:', error);
        return res.status(500).json({ error: String(error) });
    }
};

// Simplified scrape function (generates simulated data)
async function scrapeAndCache(restaurantId, date) {
    const dateObj = new Date(date);

    const allSlots = [
        '11:00', '11:15', '11:30', '11:45', '12:00', '12:30', '13:00', '13:30',
        '14:30', '15:00', '15:30',
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
    ];

    const seed = dateObj.getTime() + restaurantId * 12345;

    for (let i = 0; i < allSlots.length; i++) {
        const time = allSlots[i];
        const hash = (seed + i * 7919) % 100;

        const isPeakTime = ['12:00', '18:00', '18:30', '19:00', '19:30'].includes(time);
        const threshold = isPeakTime ? 70 : 40;
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        const adjustedThreshold = isWeekend ? threshold + 20 : threshold;

        const isFull = hash < adjustedThreshold;
        const hasWaitlist = isFull && (hash % 4 === 0);
        const status = isFull ? 'FULL' : 'AVAILABLE';

        await sql`
            INSERT INTO availability_cache (restaurant_id, date, time_slot, status, has_inline_waitlist, last_updated)
            VALUES (${restaurantId}, ${date}, ${time}, ${status}, ${hasWaitlist}, NOW())
            ON CONFLICT (restaurant_id, date, time_slot)
            DO UPDATE SET 
                status = ${status},
                has_inline_waitlist = ${hasWaitlist},
                last_updated = NOW()
        `;
    }
}
