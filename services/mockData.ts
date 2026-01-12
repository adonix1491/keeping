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
    {
        id: '1',
        name: '尚石苑石頭火鍋 (太平店)',
        image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800&q=80',
        location: '台中市',
        rating: 4.5,
        status: 'AVAILABLE',
        tags: ['火鍋', '石頭火鍋'],
        slots: ['17:30', '20:00'],
        bookingUrl: 'https://inline.app/booking/-ML2ClCSWqvYXVKATF3k/-ORZoK_x9823z1fLmVvO'
    },
    {
        id: '2',
        name: '島語自助餐廳 (Island Buffet)',
        image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
        location: '台北市南港區',
        rating: 4.2,
        status: 'FULL',
        tags: ['吃到飽', 'Buffet'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-NeqTSgDQOAYi3Olg4a7/-NeqTSgDQOAYi3Olg4a8' // Simulated Branch ID
    },
    {
        id: '3',
        name: '旭集 和食集錦 (信義店)',
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80',
        location: '台北市信義區',
        rating: 4.8,
        status: 'FULL',
        tags: ['日式', '吃到飽'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-Lxz...'
    },
    {
        id: '99',
        name: '鼎泰豐 - 信義店 (Demo)',
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&q=80',
        location: '台北市信義區',
        rating: 4.8,
        status: 'AVAILABLE',
        tags: ['中式料理', '小籠包', '米其林'],
        slots: ['17:30', '20:00'],
    },
    {
        id: '4',
        name: '教父牛排 Danny\'s Steakhouse',
        image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
        location: '台北市中山區',
        rating: 4.7,
        status: 'AVAILABLE',
        tags: ['牛排', '西式料理', '米其林'],
        slots: ['12:00', '13:30', '18:00'],
    },
    {
        id: '101',
        name: '肉次方 台中文心崇德店',
        image: 'https://images.unsplash.com/photo-1596700096987-25e227090886?w=800&q=80',
        location: '台中市北屯區',
        rating: 4.8,
        status: 'FULL',
        tags: ['燒肉', '吃到飽', '王品集團'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-MUktnbN0m8ZbMM-UzyR:inline-live-2/-MsjWKiEKbCA9-9BbWhB'
    },
    {
        id: '102',
        name: '肉次方 台中文心五權西店',
        image: 'https://images.unsplash.com/photo-1596700096987-25e227090886?w=800&q=80',
        location: '台中市南屯區',
        rating: 4.7,
        status: 'FULL',
        tags: ['燒肉', '吃到飽', '王品集團'],
        slots: [],
        bookingUrl: 'https://inline.app/booking/-MUktnbN0m8ZbMM-UzyR:inline-live-2/-NfEaOcsPUN6aVM9egYz'
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
