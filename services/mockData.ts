export type Status = 'AVAILABLE' | 'FULL';

export interface Restaurant {
    id: string;
    name: string;
    image: string;
    location: string;
    rating: number;
    status: Status;
    tags: string[];
    slots: string[]; // e.g., ['18:00', '19:30']
    bookingUrl?: string;
    inlineId?: string;
}

export interface WatchlistItem {
    id: string;
    restaurantId: string;
    restaurantName: string;
    targetDate: string; // ISO Date
    partySize: number;
    status: 'LOADING' | 'FOUND' | 'EXPIRED';
    foundSlot?: string;
    createdAt: string;
}

export const RESTAURANTS: Restaurant[] = [
    // New Restaurants (Now Main List)

    {
        id: '201',
        name: '島語自助餐廳 台北漢來店',
        image: 'https://inline.imgix.net/branch/-NeqTSgDQOAYi30lg4a7:inline-live-3--NeqTStJZDIBQHEMSDI8-e59e210c-b228-4ce2-b6de-f6c4b04f4943.jpg?auto=format&dpr=1&fit=crop&fm=jpg&h=456&w=1140',
        location: '台北市',
        rating: 4.8,
        status: 'FULL',
        tags: ['Buffet', '自助餐', '漢來'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-NeqTStJZDIBQHEMSDI8',
        inlineId: '-NeqTStJZDIBQHEMSDI8'
    },
    {
        id: '202',
        name: '島語自助餐廳 高雄漢神店',
        image: 'https://placehold.co/600x400?text=Island+Buffet+KS',
        location: '高雄市',
        rating: 4.7,
        status: 'FULL',
        tags: ['Buffet', '自助餐', '漢來'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-OUYVD5L8af9l-fOxBi5',
        inlineId: '-OUYVD5L8af9l-fOxBi5'
    },
    {
        id: '203',
        name: '島語自助餐廳 桃園台茂店',
        image: 'https://placehold.co/600x400?text=Island+Buffet+TY',
        location: '桃園市',
        rating: 4.6,
        status: 'FULL',
        tags: ['Buffet', '自助餐', '漢來'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-NeqTSgDQOAYi30lg4a7:inline-live-3/-OfXjSw3386qiY1yTpOZ',
        inlineId: '-OfXjSw3386qiY1yTpOZ'
    },
    {
        id: '204',
        name: 'fumée Yakitori 本店',
        image: 'https://placehold.co/600x400?text=fumee',
        location: '台北市',
        rating: 4.5,
        status: 'FULL',
        tags: ['燒鳥', '日式', '居酒屋'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-NdcVTihF03AzdgpS38Q:inline-live-3/-NdcVTuhlCqT4WfSAaUm',
        inlineId: '-NdcVTuhlCqT4WfSAaUm'
    },
    {
        id: '205',
        name: 'AKAME 本店',
        image: 'https://placehold.co/600x400?text=AKAME',
        location: '屏東縣',
        rating: 4.9,
        status: 'FULL',
        tags: ['原住民料理', 'Fire', 'Fine Dining'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-LzoDiSgrwoz1PHLtibz:inline-live-1/-LzoDjNruO8RBsVIMQ9W',
        inlineId: '-LzoDjNruO8RBsVIMQ9W'
    },
    {
        id: '206',
        name: '詹記麻辣火鍋 敦南店',
        image: 'https://placehold.co/600x400?text=Chan+Chi+Dunnan',
        location: '台北市',
        rating: 4.7,
        status: 'FULL',
        tags: ['麻辣鍋', '火鍋', '老字號'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-KO9-zyZTRpTH7LNAe99/-LOcon_dHjl7H4_PR39w',
        inlineId: '-LOcon_dHjl7H4_PR39w'
    },
    {
        id: '207',
        name: '詹記麻辣火鍋 新莊總店',
        image: 'https://placehold.co/600x400?text=Chan+Chi+Xinzhuang',
        location: '新北市',
        rating: 4.6,
        status: 'FULL',
        tags: ['麻辣鍋', '火鍋', '老字號'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-KO9-zyZTRpTH7LNAe99/-KO9-zyZTRpTH7LNAe9A',
        inlineId: '-KO9-zyZTRpTH7LNAe9A'
    },
    {
        id: '208',
        name: '屋馬燒肉 中港店',
        image: 'https://placehold.co/600x400?text=Umai+Zhonggang',
        location: '台中市',
        rating: 4.8,
        status: 'FULL',
        tags: ['燒肉', '台中美食'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-Kbsjto8qbSr0Yza-1gk:inline-live-wuma/-KbyW5SxxkVi6Bf3dk8X',
        inlineId: '-KbyW5SxxkVi6Bf3dk8X'
    },
    {
        id: '209',
        name: '屋馬燒肉 文心店',
        image: 'https://placehold.co/600x400?text=Umai+Wenxin',
        location: '台中市',
        rating: 4.7,
        status: 'FULL',
        tags: ['燒肉', '台中美食'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-Kbsjto8qbSr0Yza-1gk:inline-live-wuma/-KbyW5SmQykgA3BRcyCF',
        inlineId: '-KbyW5SmQykgA3BRcyCF'
    },
    {
        id: '210',
        name: 'Mathariri 本店',
        image: 'https://placehold.co/600x400?text=Mathariri',
        location: '屏東縣',
        rating: 4.8,
        status: 'FULL',
        tags: ['景觀餐廳', '鐵板燒', '原住民料理'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-MW5LEBQ8Wkn308HkJZD:inline-live-2/-MW5LEJ0qvn9Xc5-azxz',
        inlineId: '-MW5LEJ0qvn9Xc5-azxz'
    },
    {
        id: '211',
        name: '漢來海港 高雄漢來店',
        image: 'https://placehold.co/600x400?text=Harbour+KS',
        location: '高雄市',
        rating: 4.5,
        status: 'FULL',
        tags: ['Buffet', '海鮮', '吃到飽'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZH-xfUSdEozfSeH4dk',
        inlineId: '-MZH-xfUSdEozfSeH4dk'
    },
    {
        id: '212',
        name: '漢來海港 高雄漢神巨蛋店',
        image: 'https://placehold.co/600x400?text=Harbour+Arena',
        location: '高雄市',
        rating: 4.6,
        status: 'FULL',
        tags: ['Buffet', '海鮮', '吃到飽'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZMQIyR-XSNcmtWFhQa',
        inlineId: '-MZMQIyR-XSNcmtWFhQa'
    },
    {
        id: '213',
        name: '漢來海港 台北天母SOGO店',
        image: 'https://placehold.co/600x400?text=Harbour+Tianmu',
        location: '台北市',
        rating: 4.4,
        status: 'FULL',
        tags: ['Buffet', '海鮮', '吃到飽'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-MZH-xZRTVVGkgxbWV95:inline-live-2/-MZY7xXP5cU_rBCfm0HP',
        inlineId: '-MZY7xXP5cU_rBCfm0HP'
    },
    {
        id: '214',
        name: '挽肉と米 華山店',
        image: 'https://placehold.co/600x400?text=Hikiniku+Huashan',
        location: '台北市',
        rating: 4.9,
        status: 'FULL',
        tags: ['漢堡排', '日式', '排隊名店'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-N_1xDQeMXaa3du_tCti:inline-live-3',
        inlineId: '-N_1xDQeMXaa3du_tCti'
    },
    {
        id: '215',
        name: '挽肉と米 信義店',
        image: 'https://placehold.co/600x400?text=Hikiniku+Xinyi',
        location: '台北市',
        rating: 4.8,
        status: 'FULL',
        tags: ['漢堡排', '日式', '排隊名店'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-N_1xDQeMXaa3du_tCti:inline-live-3/-OF2BPF7euiO9DQ0WJbt',
        inlineId: '-OF2BPF7euiO9DQ0WJbt'
    },
    {
        id: '216',
        name: '興蓬萊台菜 中山北路創始店',
        image: 'https://placehold.co/600x400?text=Xing+Peng+Lai',
        location: '台北市',
        rating: 4.5,
        status: 'FULL',
        tags: ['台菜', '老字號', '宴客'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-Mhvwc9-HQ6yRj6fGAPt:inline-live-2/-MhvwcJZa51GNd1tunpV',
        inlineId: '-MhvwcJZa51GNd1tunpV'
    },
    {
        id: '217',
        name: '興蓬萊台菜 大葉高島屋旗艦店',
        image: 'https://placehold.co/600x400?text=Xing+Peng+Lai+Takashimaya',
        location: '台北市',
        rating: 4.6,
        status: 'FULL',
        tags: ['台菜', '老字號', '宴客'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-Mhvwc9-HQ6yRj6fGAPt:inline-live-2/-NUeidn-dQnkyI7PxmDD',
        inlineId: '-NUeidn-dQnkyI7PxmDD'
    },
    {
        id: '218',
        name: '金豬食堂 台北店',
        image: 'https://placehold.co/600x400?text=Piggy+Canteen',
        location: '台北市',
        rating: 4.7,
        status: 'FULL',
        tags: ['韓式燒肉', '米其林', '聚餐'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-OP3RPkD3dPc7GzBlZx8:inline-live-3/-OP3RPuOlbzd5GAxzLfe',
        inlineId: '-OP3RPuOlbzd5GAxzLfe'
    },
];

export const WATCHLIST: WatchlistItem[] = [
    {
        id: 'w1',
        restaurantId: '2',
        restaurantName: '橘色涮涮屋',
        targetDate: '2023-10-20',
        partySize: 2,
        status: 'LOADING',
        createdAt: '2023-10-10T10:00:00Z',
    },
    {
        id: 'w2',
        restaurantId: '3',
        restaurantName: 'RAW',
        targetDate: '2023-11-01',
        partySize: 4,
        status: 'FOUND',
        foundSlot: '19:00',
        createdAt: '2023-10-12T09:30:00Z',
    },
    {
        id: 'w3',
        restaurantId: '5',
        restaurantName: '響響 INPARADISE',
        targetDate: '2023-09-15',
        partySize: 2,
        status: 'EXPIRED',
        createdAt: '2023-09-01T12:00:00Z',
    },
];
