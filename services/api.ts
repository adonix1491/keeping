import { RESTAURANTS, Restaurant, WATCHLIST, WatchlistItem } from './mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DELAY_MS = 800;
const API_BASE_URL = 'https://holdwait.vercel.app';

/**
 * 將 API 狀態轉換為前端狀態
 * @param apiStatus API 返回的狀態
 * @returns 前端使用的狀態
 */
function mapStatus(apiStatus: string): 'LOADING' | 'FOUND' | 'EXPIRED' {
    switch (apiStatus) {
        case 'FOUND':
            return 'FOUND';
        case 'EXPIRED':
        case 'CANCELLED':
            return 'EXPIRED';
        case 'PENDING':
        default:
            return 'LOADING';
    }
}

export const api = {
    getRestaurants: async (): Promise<Restaurant[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/restaurants`);
            if (!response.ok) throw new Error('Failed to fetch restaurants');
            const data = await response.json();
            // Map backend format to frontend format
            return data.map((r: any) => ({
                id: String(r.id),
                name: r.name,
                image: r.image_url || '',
                location: r.location || '',
                rating: parseFloat(r.rating) || 0,
                status: 'FULL' as const,
                tags: r.tags || [],
                slots: [],
                bookingUrl: r.booking_url || '',
                inlineId: r.inline_id || ''
            }));
        } catch (e) {
            console.error('Failed to fetch restaurants:', e);
            return RESTAURANTS; // Fallback to mock
        }
    },

    getRestaurantById: async (id: string): Promise<Restaurant | undefined> => {
        try {
            const restaurants = await api.getRestaurants();
            return restaurants.find((r) => r.id === id);
        } catch (e) {
            console.error('Failed to get restaurant by id:', e);
            return undefined;
        }
    },

    getWatchlist: async (): Promise<WatchlistItem[]> => {
        try {
            const userId = await AsyncStorage.getItem('LINE_USER_ID');
            if (!userId) return [];

            const response = await fetch(`${API_BASE_URL}/api/watchlist?userId=${userId}`);
            if (!response.ok) return [];

            const data = await response.json();

            // 轉換 API 格式為前端格式
            return data.map((item: any) => ({
                id: String(item.id),
                restaurantId: String(item.restaurant_id),
                restaurantName: item.restaurant_name || '',
                targetDate: item.target_date ? item.target_date.split('T')[0] : '',
                partySize: item.party_size || 2,
                status: mapStatus(item.status),
                foundSlot: item.target_time || undefined,
                createdAt: item.created_at || ''
            }));
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

            // Backend will validate restaurant ID, no need for local lookup

            const response = await fetch(`${API_BASE_URL}/api/watchlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    restaurantId: restaurantId,
                    targetDate: date,
                    partySize: partySize
                }),
            });

            if (response.ok) {
                console.log(`Added to watchlist: restaurantId=${restaurantId}`);
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
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/availability?restaurantId=${restaurantId}&date=${date}&partySize=${partySize}`
            );
            if (!response.ok) throw new Error('Failed to fetch availability');
            const data = await response.json();
            return data.slots || [];
        } catch (e) {
            console.error('Failed to fetch availability:', e);
            // Return empty slots on error
            return [];
        }
    },

    /**
     * 取得用戶資料與點數
     * @param deviceId 裝置唯一識別碼
     * @returns 用戶資料或 null
     */
    getUserProfile: async (deviceId: string): Promise<UserProfile | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user?deviceId=${deviceId}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data.user || null;
        } catch (e) {
            console.error('Failed to fetch user profile:', e);
            return null;
        }
    },

    /**
     * 綁定 LINE ID
     * @param deviceId 裝置唯一識別碼
     * @param lineUserId LINE User ID
     * @returns 綁定結果
     */
    bindLineId: async (deviceId: string, lineUserId: string): Promise<BindResult> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId,
                    lineUserId,
                    action: 'bind_line'
                })
            });
            const data = await response.json();
            if (!response.ok) {
                return { success: false, error: data.error, code: data.code };
            }
            return {
                success: true,
                message: data.message,
                pointsAwarded: data.pointsAwarded,
                user: data.user
            };
        } catch (e) {
            console.error('Failed to bind LINE ID:', e);
            return { success: false, error: '綁定失敗，請稍後再試' };
        }
    },

    /**
     * 綁定 Email
     * @param deviceId 裝置唯一識別碼
     * @param email Email 地址
     * @returns 綁定結果
     */
    bindEmail: async (deviceId: string, email: string): Promise<BindResult> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deviceId,
                    email,
                    action: 'bind_email'
                })
            });
            const data = await response.json();
            if (!response.ok) {
                return { success: false, error: data.error, code: data.code };
            }
            return {
                success: true,
                message: data.message,
                pointsAwarded: data.pointsAwarded,
                user: data.user
            };
        } catch (e) {
            console.error('Failed to bind email:', e);
            return { success: false, error: '綁定失敗，請稍後再試' };
        }
    }
};

// 用戶資料型別
export interface UserProfile {
    deviceId: string;
    lineUserId: string | null;
    email: string | null;
    points: number;
    isLineBound: boolean;
    isEmailBound: boolean;
    lineBoundAt: string | null;
    emailBoundAt: string | null;
}

// 綁定結果型別
export interface BindResult {
    success: boolean;
    message?: string;
    error?: string;
    code?: string;
    pointsAwarded?: number;
    user?: UserProfile;
}
