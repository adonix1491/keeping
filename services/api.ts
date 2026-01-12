import { RESTAURANTS, Restaurant, WATCHLIST, WatchlistItem } from './mockData';

const DELAY_MS = 800;

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
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(WATCHLIST);
            }, DELAY_MS);
        });
    },

    addToWatchlist: async (restaurantId: string, date: string, partySize: number): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Added to watchlist: ${restaurantId}, ${date}, ${partySize} pax`);
                resolve(true);
            }, DELAY_MS);
        });
    },

    deleteFromWatchlist: async (id: string): Promise<boolean> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Deleted watchlist item: ${id}`);
                resolve(true);
            }, 500);
        });
    }
};
