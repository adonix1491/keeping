import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Status } from '../services/mockData';

interface StatusBadgeProps {
    status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const isAvailable = status === 'AVAILABLE';
    const colorSet = isAvailable ? Colors.available : Colors.full;
    const label = isAvailable ? '可訂位' : '已滿位';

    return (
        <View style={[styles.container, { backgroundColor: colorSet.secondary }]}>
            <View style={[styles.dot, { backgroundColor: colorSet.primary }]} />
            <Text style={[styles.text, { color: colorSet.text }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    text: {
        fontSize: 12,
        fontWeight: '600',
    },
});
