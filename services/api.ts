import { RESTAURANTS, Restaurant, WATCHLIST, WatchlistItem } from './mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DELAY_MS = 800;
const API_BASE_URL = 'https://holdwait.vercel.app';

export const api = {
    getRestaurants: async (): Promise<Restaurant[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(RESTAURANTS);
            }, DELAY_MS);
        });
    },

    getRestaurantById: async (id: string): Promise<Restaurant | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const restaurant = RESTAURANTS.find((r) => r.id === id);
                resolve(restaurant);
            }, DELAY_MS);
        });
    },

    getWatchlist: async (): Promise<WatchlistItem[]> => {
        try {
            const userId = await AsyncStorage.getItem('LINE_USER_ID');
            if (!userId) return [];

            const response = await fetch(`${API_BASE_URL}/api/watchlist?userId=${userId}`);
            if (!response.ok) return [];

            const data = await response.json();
            return data;
        } catch (e) {
            console.error('Failed to fetch watchlist:', e);
            return [];
        }
    },

    addToWatchlist: async (restaurantId: string, date: string, partySize: number): Promise<boolean> => {
        try {
            // Get User ID
            const userId = await AsyncStorage.getItem('LINE_USER_ID');
            if (!userId) {
                alert('請先至設定頁面輸入 LINE User ID');
                return false;
            }

            const restaurant = RESTAURANTS.find(r => r.id === restaurantId);
            if (!restaurant) throw new Error('Restaurant not found');

            const response = await fetch(`${API_BASE_URL}/api/watchlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    restaurantId: restaurantId,
                    bookingUrl: restaurant.bookingUrl,
                    targetDate: date,
                    partySize: partySize
                }),
            });

            if (response.ok) {
                console.log(`Added to watchlist: ${restaurant.name}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('API Error:', error);
            return false;
        }
    },

    deleteFromWatchlist: async (id: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Deleted watchlist item: ${id}`);
                resolve(true);
            }, 500);
        });
    },

    getAvailability: async (restaurantId: string, date: string, partySize: number): Promise<{ time: string, status: 'AVAILABLE' | 'FULL' }[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock logic: randomly assign status
                const slots = ['11:30', '12:00', '13:30', '17:30', '18:00', '18:30', '19:00', '19:30'];
                const result = slots.map(time => ({
                    time,
                    status: Math.random() > 0.6 ? 'AVAILABLE' : 'FULL'
                }));
                // Force at least one FULL for demo
                result[0].status = 'FULL';
                resolve(result as any);
            }, 600);
        });
    }
};
