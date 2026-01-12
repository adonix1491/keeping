import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function SettingsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>設定</Text>
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
        fontSize: 28,
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: 24,
    },
    section: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 12,
    },
    text: {
        fontSize: 16,
        color: Colors.light.text,
    },
});
