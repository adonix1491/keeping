import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';

export default function SettingsScreen() {
    const [userId, setUserId] = useState('');

    useEffect(() => {
        loadUserId();
    }, []);

    const loadUserId = async () => {
        try {
            const savedId = await AsyncStorage.getItem('LINE_USER_ID');
            if (savedId) setUserId(savedId);
        } catch (e) {
            console.error('Failed to load ID');
        }
    };

    const saveUserId = async () => {
        try {
            await AsyncStorage.setItem('LINE_USER_ID', userId);
            setUserId(userId); // Ensure state update
            Alert.alert('成功', 'User ID 已儲存！'); // Web alert might fall back to window.alert
        } catch (e) {
            Alert.alert('錯誤', '儲存失敗');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>設定</Text>

            <View style={styles.section}>
                <Text style={styles.label}>LINE User ID</Text>
                <Text style={styles.hint}>請從官方帳號回應中複製 ID 並貼上</Text>
                <TextInput
                    style={styles.input}
                    value={userId}
                    onChangeText={setUserId}
                    placeholder="Uxxxxxxxx..."
                    autoCapitalize="none"
                />
                <Pressable onPress={saveUserId} style={styles.button}>
                    <Text style={styles.buttonText}>儲存 ID</Text>
                </Pressable>
            </View>

            <View style={styles.section}>
                <Text style={styles.text}>版本 1.0.0 (MVP)</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.light.text,
        marginBottom: 20,
    },
    section: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#334155'
    },
    hint: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 12
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: '#F8FAFC'
    },
    button: {
        backgroundColor: Colors.light.tint,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    text: {
        fontSize: 14,
        color: '#64748B',
    },
});
