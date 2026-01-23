import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'device_id';

export async function getDeviceId(): Promise<string> {
    try {
        let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (!id) {
            id = uuidv4();
            await AsyncStorage.setItem(DEVICE_ID_KEY, id);
        }
        return id;
    } catch (e) {
        console.error('Failed to get device ID', e);
        // Fallback temp id if storage fails
        return 'temp-device-id-' + Math.random().toString(36).substring(7);
    }
}

export async function getSavedDeals(): Promise<string[]> {
    try {
        const saved = await AsyncStorage.getItem('saved_deals');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}
