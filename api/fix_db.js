const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    try {
        let logs = [];
        logs.push('Starting ID Reset & Reseed...');

        // 1. TRUNCATE Tasks and Restaurants with Restart Identity
        // CASCADE is needed because tasks reference restaurants
        await sql`TRUNCATE TABLE restaurants, tasks RESTART IDENTITY CASCADE`;
        logs.push('Truncated (Reset IDs) restaurants and tasks.');

        // 2. Insert Real Restaurants (IDs will start at 1)
        const restaurants = [
            { branch_id: 1, name: '饗饗 INPARADISE 微風信義店', booking_url: 'https://www.feastogether.com.tw/booking/Paradise' },
            { branch_id: 2, name: '饗饗 INPARADISE 新莊店', booking_url: 'https://www.feastogether.com.tw/booking/Paradise' },
            { branch_id: 3, name: '旭集 和食集錦 信義店', booking_url: 'https://www.feastogether.com.tw/booking/Sunrise' },
            { branch_id: 4, name: '旭集 和食集錦 竹北遠百店', booking_url: 'https://www.feastogether.com.tw/booking/Sunrise' },
            { branch_id: 5, name: '旭集 和食集錦 高雄義享店', booking_url: 'https://www.feastogether.com.tw/booking/Sunrise' },
            { branch_id: 6, name: '旭集 和食集錦 天母店', booking_url: 'https://www.feastogether.com.tw/booking/Sunrise' },
            { branch_id: 7, name: '旭集 和食集錦 中茂店', booking_url: 'https://www.feastogether.com.tw/booking/Sunrise' },
            { branch_id: 8, name: '饗 A Joy', booking_url: 'https://www.feastogether.com.tw/booking/Ajoy' },
            { branch_id: 9, name: '果然匯 台北明曜店', booking_url: 'https://www.feastogether.com.tw/booking/Fruitfulfood' },
            { branch_id: 10, name: '果然匯 新北板橋店', booking_url: 'https://www.feastogether.com.tw/booking/Fruitfulfood' },
            { branch_id: 11, name: '果然匯 桃園統領店', booking_url: 'https://www.feastogether.com.tw/booking/Fruitfulfood' },
            { branch_id: 12, name: '果然匯 竹北遠百店', booking_url: 'https://www.feastogether.com.tw/booking/Fruitfulfood' },
            { branch_id: 13, name: '果然匯 高雄夢時代店', booking_url: 'https://www.feastogether.com.tw/booking/Fruitfulfood' },
            { branch_id: 14, name: '小福利 麻辣鍋 中和環球店', booking_url: 'https://www.feastogether.com.tw/booking/Xiaofuli' },
            { branch_id: 15, name: '小福利 麻辣鍋 竹北遠百店', booking_url: 'https://www.feastogether.com.tw/booking/Xiaofuli' },
            { branch_id: 16, name: '小福利 麻辣鍋 小碧潭店', booking_url: 'https://www.feastogether.com.tw/booking/Xiaofuli' },
            { branch_id: 17, name: '小福利 麻辣鍋 桃園中茂店', booking_url: 'https://www.feastogether.com.tw/booking/Xiaofuli' },
        ];

        for (const r of restaurants) {
            await sql`
                INSERT INTO restaurants (company_id, branch_id, name, booking_url)
                VALUES (1, ${r.branch_id}, ${r.name}, ${r.booking_url})
            `;
        }
        logs.push(`Seeded ${restaurants.length} restaurants (IDs 1-17).`);

        return res.status(200).json({
            message: 'Reseed Complete',
            logs: logs
        });
    } catch (error) {
        return res.status(500).json({ error: String(error) });
    }
};
