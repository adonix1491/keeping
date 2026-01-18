const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
    try {
        let logs = [];
        logs.push('Starting Schema Update & Full Reseed...');

        // 1. Drop and recreate restaurants table with new schema
        await sql`DROP TABLE IF EXISTS tasks`;
        await sql`DROP TABLE IF EXISTS restaurants`;
        logs.push('Dropped old tables.');

        // 2. Create restaurants table with full schema
        await sql`
            CREATE TABLE restaurants (
                id SERIAL PRIMARY KEY,
                inline_id VARCHAR(255),
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255),
                tags TEXT[],
                booking_url TEXT,
                image_url TEXT,
                rating DECIMAL(2,1) DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;
        logs.push('Created restaurants table with new schema.');

        // 3. Create tasks table
        await sql`
            CREATE TABLE tasks (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                line_user_id VARCHAR(255),
                restaurant_id INTEGER REFERENCES restaurants(id),
                target_date DATE NOT NULL,
                party_size INTEGER NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;
        logs.push('Created tasks table.');

        // 4. Seed restaurants with full data
        const restaurants = [
            {
                inline_id: '-NeqTStJZDIBQHEMSDI8',
                name: '島語自助餐廳 台北漢來店',
                location: '台北市',
                tags: ['Buffet', '自助餐', '漢來'],
                booking_url: 'https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-NeqTStJZDIBQHEMSDI8',
                image_url: 'https://inline.imgix.net/branch/-NeqTSgDQOAYi30lg4a7:inline-live-3--NeqTStJZDIBQHEMSDI8-e59e210c-b228-4ce2-b6de-f6c4b04f4943.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.8
            },
            {
                inline_id: '-OUYVD5L8af9l-fOxBi5',
                name: '島語自助餐廳 高雄漢神店',
                location: '高雄市',
                tags: ['Buffet', '自助餐', '漢來'],
                booking_url: 'https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-OUYVD5L8af9l-fOxBi5',
                image_url: 'https://inline.imgix.net/branch/-NeqTSgDQOAYi30lg4a7:inline-live-3--NeqTStJZDIBQHEMSDI8-e59e210c-b228-4ce2-b6de-f6c4b04f4943.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.7
            },
            {
                inline_id: '-OfXjSw3386qiY1yTpOZ',
                name: '島語自助餐廳 桃園台茂店',
                location: '桃園市',
                tags: ['Buffet', '自助餐', '漢來'],
                booking_url: 'https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-OfXjSw3386qiY1yTpOZ',
                image_url: 'https://inline.imgix.net/branch/-NeqTSgDQOAYi30lg4a7:inline-live-3--NeqTStJZDIBQHEMSDI8-e59e210c-b228-4ce2-b6de-f6c4b04f4943.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.6
            },
            {
                inline_id: '-NdcVTuhlCqT4WfSAaUm',
                name: 'fumée Yakitori 本店',
                location: '台北市',
                tags: ['燒鳥', '日式', '居酒屋'],
                booking_url: 'https://inline.app/booking/-NdcVTihF03AzdgpS38Q:inline-live-3/-NdcVTuhlCqT4WfSAaUm',
                image_url: 'https://inline.imgix.net/branch/-NdcVTihF03AzdgpS38Q:inline-live-3--NdcVTuhlCqT4WfSAaUm.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.5
            },
            {
                inline_id: '-LzoDjNruO8RBsVIMQ9W',
                name: 'AKAME 本店',
                location: '屏東縣',
                tags: ['原住民料理', 'Fire', 'Fine Dining'],
                booking_url: 'https://inline.app/booking/-LzoDiSgrwoz1PHLtibz:inline-live-1/-LzoDjNruO8RBsVIMQ9W',
                image_url: 'https://inline.imgix.net/branch/-LzoDiSgrwoz1PHLtibz:inline-live-1--LzoDjNruO8RBsVIMQ9W.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.9
            },
            {
                inline_id: '-LOcon_dHjl7H4_PR39w',
                name: '詹記麻辣火鍋 敦南店',
                location: '台北市',
                tags: ['麻辣鍋', '火鍋', '老字號'],
                booking_url: 'https://inline.app/booking/-KO9-zyZTRpTH7LNAe99/-LOcon_dHjl7H4_PR39w',
                image_url: 'https://inline.imgix.net/branch/-KO9-zyZTRpTH7LNAe99--LOcon_dHjl7H4_PR39w.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.7
            },
            {
                inline_id: '-KO9-zyZTRpTH7LNAe9A',
                name: '詹記麻辣火鍋 新莊總店',
                location: '新北市',
                tags: ['麻辣鍋', '火鍋', '老字號'],
                booking_url: 'https://inline.app/booking/-KO9-zyZTRpTH7LNAe99/-KO9-zyZTRpTH7LNAe9A',
                image_url: 'https://inline.imgix.net/branch/-KO9-zyZTRpTH7LNAe99--KO9-zyZTRpTH7LNAe9A.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.6
            },
            {
                inline_id: '-KbyW5SxxkVi6Bf3dk8X',
                name: '屋馬燒肉 中港店',
                location: '台中市',
                tags: ['燒肉', '台中美食'],
                booking_url: 'https://inline.app/booking/-Kbsjto8qbSr0Yza-1gk:inline-live-wuma/-KbyW5SxxkVi6Bf3dk8X',
                image_url: 'https://inline.imgix.net/branch/-Kbsjto8qbSr0Yza-1gk:inline-live-wuma--KbyW5SxxkVi6Bf3dk8X-1520a59e-38d1-4c93-9039-57b96dab9e3c.JPG?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.8
            },
            {
                inline_id: '-KbyW5SmQykgA3BRcyCF',
                name: '屋馬燒肉 文心店',
                location: '台中市',
                tags: ['燒肉', '台中美食'],
                booking_url: 'https://inline.app/booking/-Kbsjto8qbSr0Yza-1gk:inline-live-wuma/-KbyW5SmQykgA3BRcyCF',
                image_url: 'https://inline.imgix.net/branch/-Kbsjto8qbSr0Yza-1gk:inline-live-wuma--KbyW5SxxkVi6Bf3dk8X-1520a59e-38d1-4c93-9039-57b96dab9e3c.JPG?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.7
            },
            {
                inline_id: '-MW5LEJ0qvn9Xc5-azxz',
                name: 'Mathariri 本店',
                location: '屏東縣',
                tags: ['景觀餐廳', '鐵板燒', '原住民料理'],
                booking_url: 'https://inline.app/booking/-MW5LEBQ8Wkn308HkJZD:inline-live-2/-MW5LEJ0qvn9Xc5-azxz',
                image_url: 'https://inline.imgix.net/branch/-MW5LEBQ8Wkn308HkJZD:inline-live-2--MW5LEJ0qvn9Xc5-azxz.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.8
            },
            {
                inline_id: '-MZH-xfUSdEozfSeH4dk',
                name: '漢來海港 高雄漢來店',
                location: '高雄市',
                tags: ['Buffet', '海鮮', '吃到飽'],
                booking_url: 'https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZH-xfUSdEozfSeH4dk',
                image_url: 'https://inline.imgix.net/branch/-MZH-xZRTVVGkgxbWV95:inline-live-2--MZH-xfUSdEozfSeH4dk.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.5
            },
            {
                inline_id: '-MZMQIyR-XSNcmtWFhQa',
                name: '漢來海港 高雄漢神巨蛋店',
                location: '高雄市',
                tags: ['Buffet', '海鮮', '吃到飽'],
                booking_url: 'https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZMQIyR-XSNcmtWFhQa',
                image_url: 'https://inline.imgix.net/branch/-MZH-xZRTVVGkgxbWV95:inline-live-2--MZH-xfUSdEozfSeH4dk.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.6
            },
            {
                inline_id: '-MZY7xXP5cU_rBCfm0HP',
                name: '漢來海港 台北天母SOGO店',
                location: '台北市',
                tags: ['Buffet', '海鮮', '吃到飽'],
                booking_url: 'https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZY7xXP5cU_rBCfm0HP',
                image_url: 'https://inline.imgix.net/branch/-MZH-xZRTVVGkgxbWV95:inline-live-2--MZH-xfUSdEozfSeH4dk.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.4
            },
            {
                inline_id: '-N_1xDQeMXaa3du_tCti',
                name: '挽肉と米 華山店',
                location: '台北市',
                tags: ['漢堡排', '日式', '排隊名店'],
                booking_url: 'https://inline.app/booking/-N_1xDQeMXaa3du_tCti:inline-live-3',
                image_url: 'https://inline.imgix.net/branch/-N_1xDQeMXaa3du_tCti:inline-live-3.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.9
            },
            {
                inline_id: '-OF2BPF7euiO9DQ0WJbt',
                name: '挽肉と米 信義店',
                location: '台北市',
                tags: ['漢堡排', '日式', '排隊名店'],
                booking_url: 'https://inline.app/booking/-N_1xDQeMXaa3du_tCti:inline-live-3/-OF2BPF7euiO9DQ0WJbt',
                image_url: 'https://inline.imgix.net/branch/-N_1xDQeMXaa3du_tCti:inline-live-3.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.8
            },
            {
                inline_id: '-MhvwcJZa51GNd1tunpV',
                name: '興蓬萊台菜 中山北路創始店',
                location: '台北市',
                tags: ['台菜', '老字號', '宴客'],
                booking_url: 'https://inline.app/booking/-Mhvwc9-HQ6yRj6fGAPt:inline-live-2/-MhvwcJZa51GNd1tunpV',
                image_url: 'https://inline.imgix.net/branch/-Mhvwc9-HQ6yRj6fGAPt:inline-live-2--MhvwcJZa51GNd1tunpV.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.5
            },
            {
                inline_id: '-NUeidn-dQnkyI7PxmDD',
                name: '興蓬萊台菜 大葉高島屋旗艦店',
                location: '台北市',
                tags: ['台菜', '老字號', '宴客'],
                booking_url: 'https://inline.app/booking/-Mhvwc9-HQ6yRj6fGAPt:inline-live-2/-NUeidn-dQnkyI7PxmDD',
                image_url: 'https://inline.imgix.net/branch/-Mhvwc9-HQ6yRj6fGAPt:inline-live-2--MhvwcJZa51GNd1tunpV.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
            },
            {
                inline_id: '-MsjWKiEKbCA9-9BbWhB',
                name: '肉次方 台中文心崇德店',
                location: '台中市',
                tags: ['燒肉', '和牛', '約會'],
                booking_url: 'https://inline.app/booking/-MUktnbN0m8ZbMM-UzyR:inline-live-2/-MsjWKiEKbCA9-9BbWhB',
                image_url: 'https://inline.imgix.net/branch/-MUktnbN0m8ZbMM-UzyR:inline-live-2--MsjWKiEKbCA9-9BbWhB.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.7
            },
            {
                inline_id: '-ORZoK_x9823z1fLmVvO',
                name: '尚石苑石頭火鍋 太平店',
                location: '台中市',
                tags: ['火鍋', '石頭鍋', '聚餐'],
                booking_url: 'https://inline.app/booking/-ML2ClCSWqvYXVKATF3k:inline-live-1/-ORZoK_x9823z1fLmVvO',
                image_url: 'https://inline.imgix.net/branch/-ML2ClCSWqvYXVKATF3k:inline-live-1--ORZoK_x9823z1fLmVvO.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.5
            },
            {
                inline_id: '-O1PwZsMcMpz6R22x_xj',
                name: '花娘小館 南京店',
                location: '台北市',
                tags: ['川菜', '熱炒', '聚餐'],
                booking_url: 'https://inline.app/booking/-NxuTOP0taCoQTNLDSOB:inline-live-3/-O1PwZsMcMpz6R22x_xj?language=zh-tw',
                image_url: 'https://inline.imgix.net/branch/-NxuTOP0taCoQTNLDSOB:inline-live-3--O1PwZsMcMpz6R22x_xj.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.6
            },
            {
                inline_id: '-NxuTOcBfhTil0vSRGef',
                name: '花娘小館 創始店',
                location: '台北市',
                tags: ['川菜', '熱炒', '老字號'],
                booking_url: 'https://inline.app/booking/-NxuTOP0taCoQTNLDSOB:inline-live-3/-NxuTOcBfhTil0vSRGef?language=zh-tw',
                image_url: 'https://inline.imgix.net/branch/-NxuTOP0taCoQTNLDSOB:inline-live-3--NxuTOcBfhTil0vSRGef.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.7
            },
            {
                inline_id: '-MkM2_238WfoeXNthg4P',
                name: '法森小館 國美',
                location: '台中市',
                tags: ['法式料理', '約會', '精緻'],
                booking_url: 'https://inline.app/booking/-L1WFaCfzl5tayaJ4gpY/-MkM2_238WfoeXNthg4P',
                image_url: 'https://inline.imgix.net/branch/-L1WFaCfzl5tayaJ4gpY--MkM2_238WfoeXNthg4P.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.8
            },
            {
                inline_id: '-MYcfjcXLJmiPsUwEFWu',
                name: '萬客什鍋 台北八德店',
                location: '台北市',
                tags: ['火鍋', '涮涮鍋', '人氣'],
                booking_url: 'https://inline.app/booking/-MYcfjTWHCbsasKqbe6Q:inline-live-2/-MYcfjcXLJmiPsUwEFWu',
                image_url: 'https://inline.imgix.net/branch/-MYcfjTWHCbsasKqbe6Q:inline-live-2--MYcfjcXLJmiPsUwEFWu.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
                rating: 4.5
            }
        ];

        for (const r of restaurants) {
            await sql`
                INSERT INTO restaurants (inline_id, name, location, tags, booking_url, image_url, rating)
                VALUES (${r.inline_id}, ${r.name}, ${r.location}, ${r.tags}, ${r.booking_url}, ${r.image_url}, ${r.rating})
            `;
        }
        logs.push(`Seeded ${restaurants.length} restaurants with full data.`);

        return res.status(200).json({
            message: 'Full Reseed Complete',
            logs: logs
        });
    } catch (error) {
        return res.status(500).json({ error: String(error), stack: error.stack });
    }
};
