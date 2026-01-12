import { Stack } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
                name="restaurant/[id]"
                options={{
                    title: '餐廳詳情',
                    headerBackTitle: '返回',
                    headerTintColor: Colors.primary,
                }}
            />
            <Stack.Screen
                name="modal"
                options={{
                    presentation: 'modal',
                    title: '通知設定',
                }}
            />
        </Stack>
    );
}
