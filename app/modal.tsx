import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/Colors';

export default function ModalScreen() {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Text style={styles.text}>通知設定</Text>

            <View style={styles.settingRow}>
                <Text style={styles.label}>啟用推播通知</Text>
                <Switch value={true} />
            </View>
            <View style={styles.settingRow}>
                <Text style={styles.label}>啟用 LINE 通知</Text>
                <Switch value={false} />
            </View>

            <Text style={styles.hint}>
                當您監控的餐廳有空位時，我們將透過上述方式通知您。
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 24,
        backgroundColor: 'white',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 32,
        color: Colors.light.text,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    label: {
        fontSize: 18,
        color: Colors.light.text,
    },
    hint: {
        marginTop: 20,
        color: Colors.light.icon,
        textAlign: 'center',
    },
});
