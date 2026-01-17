import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
    try {
        // 1. Create Restaurants Table
        await sql`
      CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        company_id TEXT NOT NULL,
        branch_id TEXT NOT NULL,
        name TEXT NOT NULL,
        booking_url TEXT,
        UNIQUE(company_id, branch_id)
      );
    `;

        // 2. Create Tasks Table
        await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        restaurant_id INTEGER NOT NULL,
        target_date TEXT NOT NULL,
        party_size INTEGER NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        line_user_id TEXT, 
        FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
      );
    `;
        // Note: added line_user_id column just in case it's missing in older schema, 
        // though usually we alter table. For MVP, CREATE IF NOT EXISTS won't add column if table exists.
        // We might need to run an ALTER command if we want to ensure it exists.
        // Let's assume for now.

        // 3. Seed Data
        const { rows } = await sql`SELECT count(*) FROM restaurants`;
        const count = parseInt(rows[0].count);

        if (count === 0) {
            const presets = [
                { "name": "島語自助餐廳 台北漢來店", "url": "https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-NeqTStJZDIBQHEMSDI8" },
                { "name": "島語自助餐廳 高雄漢神店", "url": "https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-OUYVD5L8af9l-fOxBi5" },
                { "name": "島語自助餐廳 桃園台茂店", "url": "https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-OfXjSw3386qiY1yTpOZ" },
                { "name": "fumée Yakitori 本店", "url": "https://inline.app/booking/-NdcVTihF03AzdgpS38Q:inline-live-3/-NdcVTuhlCqT4WfSAaUm" },
                { "name": "AKAME 本店", "url": "https://inline.app/booking/-LzoDiSgrwoz1PHLtibz:inline-live-1/-LzoDjNruO8RBsVIMQ9W" },
                { "name": "詹記麻辣火鍋 敦南店", "url": "https://inline.app/booking/-KO9-zyZTRpTH7LNAe99/-LOcon_dHjl7H4_PR39w" },
                { "name": "詹記麻辣火鍋 新莊總店", "url": "https://inline.app/booking/-KO9-zyZTRpTH7LNAe99/-KO9-zyZTRpTH7LNAe9A" },
                { "name": "屋馬燒肉 中港店", "url": "https://inline.app/booking/-Kbsjto8qbSr0Yza-1gk:inline-live-wuma/-KbyW5SxxkVi6Bf3dk8X" },
                { "name": "屋馬燒肉 文心店", "url": "https://inline.app/booking/-Kbsjto8qbSr0Yza-1gk:inline-live-wuma/-KbyW5SmQykgA3BRcyCF" },
                { "name": "Mathariri 本店", "url": "https://inline.app/booking/-MW5LEBQ8Wkn308HkJZD:inline-live-2/-MW5LEJ0qvn9Xc5-azxz" },
                { "name": "漢來海港 高雄漢來店", "url": "https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZH-xfUSdEozfSeH4dk" },
                { "name": "漢來海港 高雄漢神巨蛋店", "url": "https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZMQIyR-XSNcmtWFhQa" },
                { "name": "漢來海港 台北天母SOGO店", "url": "https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZY7xXP5cU_rBCfm0HP" },
                { "name": "挽肉と米 華山店", "url": "https://inline.app/booking/-N_1xDQeMXaa3du_tCti:inline-live-3" },
                { "name": "挽肉と米 信義店", "url": "https://inline.app/booking/-N_1xDQeMXaa3du_tCti:inline-live-3/-OF2BPF7euiO9DQ0WJbt" },
                { "name": "興蓬萊台菜 中山北路創始店", "url": "https://inline.app/booking/-Mhvwc9-HQ6yRj6fGAPt:inline-live-2/-MhvwcJZa51GNd1tunpV" },
                { "name": "興蓬萊台菜 大葉高島屋旗艦店", "url": "https://inline.app/booking/-Mhvwc9-HQ6yRj6fGAPt:inline-live-2/-NUeidn-dQnkyI7PxmDD" },
                { "name": "金豬食堂 台北店", "url": "https://inline.app/booking/-OP3RPkD3dPc7GzBlZx8:inline-live-3/-OP3RPuOlbzd5GAxzLfe" },
            ];

            for (const r of presets) {
                try {
                    const parts = r.url.split('/booking/');
                    if (parts.length > 1) {
                        const ids = parts[1].split('/');
                        if (ids.length >= 2) {
                            const cid = ids[0];
                            const bid = ids[1].split('?')[0];
                            await sql`
                INSERT INTO restaurants (company_id, branch_id, name, booking_url) 
                VALUES (${cid}, ${bid}, ${r.name}, ${r.url})
                ON CONFLICT (company_id, branch_id) DO NOTHING;
              `; // Added ON CONFLICT just in case
                        }
                    }
                } catch (e) {
                    console.error(`Skipped ${r.name}:`, e);
                }
            }
        }

        // Try adding line_user_id column if not exists (Hack for migration)
        try {
            await sql`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS line_user_id TEXT;`;
        } catch (e) {
            // Ignore if error
        }

        return Response.json({ result: `✅ Database initialized! (Restaurants: ${count})` });
    } catch (error) {
        return Response.json({ error: String(error) }, { status: 500 });
    }
}
