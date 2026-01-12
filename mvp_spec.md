# Project: 候位通 (Waitlist Agent) - Mobile App MVP
> Context: This file contains the Master Plan derived from previous architectural discussions. Use this as the source of truth for building the React Native + Expo app.

## 1. Project Overview (專案概述)
我們正在構建一個「餐廳候位監控」的 iOS/Android 應用程式。
* **Goal:** 解決熱門餐廳一位難求的問題。
* **Core Loop:** 用戶搜尋/選擇餐廳 -> 查看狀態 -> 若滿位則「訂閱通知」 -> 模擬後端監控 -> 跳出通知。
* **Tech Stack:**
    * Framework: React Native (Expo)
    * Routing: Expo Router (File-based routing)
    * Styling: NativeWind (Tailwind CSS)
    * Language: TypeScript
    * Environment: Antigravity (Expo Setup)

## 2. MVP Features (最小可行產品功能)
我們採用 **"Mock Data First"** 策略，先專注於 UI/UX 互動，暫不串接真實後端。

### Phase 1: Screens & UI (主要畫面)
1.  **Home Screen (`app/(tabs)/index.tsx`)**
    * **Hero:** 顯示「熱門餐廳」輪播卡片。
    * **Search Input:** 允許輸入文字或貼上 URL。
    * **Filters:** 日期選擇器 (Date Picker)、人數選擇 (1-8人)。
    * **Restaurant List:** 垂直列表，顯示 mock data 中的餐廳。

2.  **Restaurant Detail Screen (`app/restaurant/[id].tsx`)**
    * **Dynamic UI:** 根據 mock data 的 `status` 改變介面。
    * **Case A (Available):** 綠色主題，顯示 "Immediate Booking"，列出 available slots (Tags)。
    * **Case B (Full):** 琥珀色/黃色主題，顯示 "Full - Notify Me"，顯示訂閱按鈕。

3.  **Subscription Modal (Bottom Sheet)**
    * 當用戶點擊 "Notify Me" 時觸發。
    * 顯示確認資訊 (餐廳/日期/人數)。
    * 模擬 "Login with LINE" 按鈕。
    * Success State: 顯示打勾動畫與 Toast。

4.  **Watchlist Screen (`app/(tabs)/watchlist.tsx`)**
    * 顯示用戶已訂閱的監控任務。
    * 模擬不同狀態：`Scanning` (監控中), `Found` (已找到), `Expired` (過期).

## 3. Data Structure (Mock Data Schema)
Create a service file `services/mockData.ts` to drive the UI.

```typescript
export interface Restaurant {
  id: string;
  name: string;
  image: string; // URL
  bookingUrl: string;
  status: 'AVAILABLE' | 'FULL';
  slots: string[]; // e.g., ["11:30", "13:00"]
  description: string;
}

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: '1',
    name: '尚石苑石頭火鍋 (太平店)',
    image: '[https://placehold.co/600x400/png](https://placehold.co/600x400/png)',
    bookingUrl: '[https://inline.app/](https://inline.app/)...',
    status: 'FULL',
    slots: [],
    description: '台中最熱門的石頭火鍋...'
  },
  {
    id: '2',
    name: '島語自助餐廳',
    image: '[https://placehold.co/600x400/png](https://placehold.co/600x400/png)',
    bookingUrl: '[https://inline.app/](https://inline.app/)...',
    status: 'AVAILABLE',
    slots: ['11:30', '13:00', '14:30'],
    description: '一位難求的頂級 Buffet...'
  }
];