import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/Colors';
import { api, UserProfile } from '../../services/api';

// 裝置 ID 儲存金鑰
const DEVICE_ID_KEY = 'DEVICE_ID';

/**
 * 生成唯一裝置 ID
 * @returns 隨機生成的 UUID 格式字串
 */
function generateDeviceId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default function SettingsScreen() {
    // 狀態管理
    const [isLoading, setIsLoading] = useState(true);
    const [deviceId, setDeviceId] = useState('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // LINE ID 輸入
    const [lineIdInput, setLineIdInput] = useState('');
    const [isEditingLineId, setIsEditingLineId] = useState(false);

    // Email 輸入
    const [emailInput, setEmailInput] = useState('');
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    // 初始化載入
    useEffect(() => {
        initializeUser();
    }, []);

    /**
     * 初始化用戶資料
     * 載入或創建裝置 ID，並從伺服器取得用戶資料
     */
    const initializeUser = async () => {
        try {
            setIsLoading(true);

            // 取得或創建裝置 ID
            let storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
            if (!storedDeviceId) {
                storedDeviceId = generateDeviceId();
                await AsyncStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
            }
            setDeviceId(storedDeviceId);

            // 從伺服器取得用戶資料
            const profile = await api.getUserProfile(storedDeviceId);
            if (profile) {
                setUserProfile(profile);
                // 同步本地 LINE_USER_ID（相容舊版）
                if (profile.lineUserId) {
                    await AsyncStorage.setItem('LINE_USER_ID', profile.lineUserId);
                }
            }
        } catch (e) {
            console.error('Failed to initialize user:', e);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 綁定 LINE ID
     */
    const handleBindLineId = async () => {
        if (!lineIdInput.trim()) {
            Alert.alert('錯誤', '請輸入 LINE User ID');
            return;
        }

        try {
            setIsLoading(true);
            const result = await api.bindLineId(deviceId, lineIdInput.trim());

            if (result.success) {
                // 更新本地狀態
                if (result.user) {
                    setUserProfile(result.user);
                }
                // 同步本地儲存（相容舊版）
                await AsyncStorage.setItem('LINE_USER_ID', lineIdInput.trim());

                setIsEditingLineId(false);
                Alert.alert('成功', result.message || 'LINE ID 綁定成功！');
            } else {
                Alert.alert('錯誤', result.error || '綁定失敗');
            }
        } catch (e) {
            Alert.alert('錯誤', '綁定失敗，請稍後再試');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 綁定 Email
     */
    const handleBindEmail = async () => {
        if (!emailInput.trim()) {
            Alert.alert('錯誤', '請輸入 Email');
            return;
        }

        // 基本 Email 格式驗證
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.trim())) {
            Alert.alert('錯誤', '請輸入有效的 Email 格式');
            return;
        }

        try {
            setIsLoading(true);
            const result = await api.bindEmail(deviceId, emailInput.trim());

            if (result.success) {
                if (result.user) {
                    setUserProfile(result.user);
                }
                setIsEditingEmail(false);
                Alert.alert('成功', result.message || 'Email 綁定成功！');
            } else {
                Alert.alert('錯誤', result.error || '綁定失敗');
            }
        } catch (e) {
            Alert.alert('錯誤', '綁定失敗，請稍後再試');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 開始編輯 LINE ID
     */
    const startEditingLineId = () => {
        setLineIdInput(userProfile?.lineUserId || '');
        setIsEditingLineId(true);
    };

    /**
     * 開始編輯 Email
     */
    const startEditingEmail = () => {
        setEmailInput(userProfile?.email || '');
        setIsEditingEmail(true);
    };

    // 載入中畫面
    if (isLoading && !userProfile) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
            </SafeAreaView>
        );
    }

    const points = userProfile?.points ?? 0;
    const isLineBound = userProfile?.isLineBound ?? false;
    const isEmailBound = userProfile?.isEmailBound ?? false;

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>設定</Text>

            {/* 點數顯示區塊 */}
            <View style={styles.pointsSection}>
                <View style={styles.pointsHeader}>
                    <Text style={styles.pointsLabel}>會員點數</Text>
                    <Text style={styles.pointsValue}>{points} 點</Text>
                </View>
                {points < 5 && (
                    <View style={styles.warningBox}>
                        <Text style={styles.warningText}>
                            ⚠️ 點數不足 5 點，無法接收候位推播通知
                        </Text>
                    </View>
                )}
                <Text style={styles.pointsHint}>
                    • 訂閱監控消耗 1 點{'\n'}
                    • 接收推播消耗 5 點
                </Text>
            </View>

            {/* LINE ID 綁定區塊 */}
            <View style={styles.section}>
                <Text style={styles.label}>LINE User ID</Text>
                <Text style={styles.hint}>請從官方帳號回應中複製 ID 並貼上</Text>

                {isEditingLineId || !isLineBound ? (
                    <>
                        <TextInput
                            style={styles.input}
                            value={lineIdInput}
                            onChangeText={setLineIdInput}
                            placeholder="Uxxxxxxxx..."
                            autoCapitalize="none"
                            editable={!isLoading}
                        />
                        <Pressable
                            onPress={handleBindLineId}
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? '處理中...' : '輸入ID'}
                            </Text>
                        </Pressable>
                        {isEditingLineId && (
                            <Pressable
                                onPress={() => setIsEditingLineId(false)}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelButtonText}>取消</Text>
                            </Pressable>
                        )}
                    </>
                ) : (
                    <Pressable
                        onPress={startEditingLineId}
                        style={styles.boundButton}
                    >
                        <Text style={styles.boundButtonText}>已綁定LINE ID</Text>
                    </Pressable>
                )}
            </View>

            {/* Email 綁定區塊 */}
            <View style={styles.section}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.hint}>綁定 Email 可接收 PWD WEB 及 APP 推播</Text>

                {isEditingEmail || !isEmailBound ? (
                    <>
                        <TextInput
                            style={styles.input}
                            value={emailInput}
                            onChangeText={setEmailInput}
                            placeholder="your@email.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!isLoading}
                        />
                        <Pressable
                            onPress={handleBindEmail}
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? '處理中...' : (isEmailBound ? '變更 Email' : '綁定 Email')}
                            </Text>
                        </Pressable>
                        {isEditingEmail && (
                            <Pressable
                                onPress={() => setIsEditingEmail(false)}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelButtonText}>取消</Text>
                            </Pressable>
                        )}
                    </>
                ) : (
                    <Pressable
                        onPress={startEditingEmail}
                        style={styles.boundButton}
                    >
                        <Text style={styles.boundButtonText}>已綁定 Email</Text>
                    </Pressable>
                )}
            </View>

            {/* 獎勵提示 */}
            {(!isLineBound || !isEmailBound) && (
                <View style={styles.rewardHint}>
                    <Text style={styles.rewardHintText}>
                        🎁 首次綁定可獲得 30 點獎勵！
                    </Text>
                </View>
            )}

            {/* 版本資訊 */}
            <View style={styles.section}>
                <Text style={styles.text}>版本 1.1.0</Text>
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
    // 點數區塊樣式
    pointsSection: {
        backgroundColor: '#4F46E5',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    pointsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    pointsLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
    },
    pointsValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    pointsHint: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        lineHeight: 18,
    },
    warningBox: {
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.5)',
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    warningText: {
        fontSize: 13,
        color: '#FCD34D',
        fontWeight: '500',
    },
    // 區塊樣式
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
        color: '#334155',
    },
    hint: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
        backgroundColor: '#F8FAFC',
    },
    // 按鈕樣式
    button: {
        backgroundColor: Colors.light.tint,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // 已綁定按鈕樣式
    boundButton: {
        backgroundColor: '#4B5563',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    boundButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // 取消按鈕
    cancelButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    cancelButtonText: {
        color: '#64748B',
        fontSize: 14,
    },
    // 獎勵提示
    rewardHint: {
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    rewardHintText: {
        fontSize: 14,
        color: '#92400E',
        textAlign: 'center',
        fontWeight: '500',
    },
    text: {
        fontSize: 14,
        color: '#64748B',
    },
});
