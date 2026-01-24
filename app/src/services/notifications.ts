import { LogLevel, OneSignal } from 'react-native-onesignal';
import Constants from 'expo-constants';

// Get OneSignal App ID from app.json extra config
const ONESIGNAL_APP_ID = Constants.expoConfig?.extra?.oneSignalAppId || '';

/**
 * Initialize OneSignal push notifications
 * Call this once in your app entry point (_layout.tsx)
 */
export function initializeOneSignal() {
    if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID') {
        console.warn('OneSignal App ID not configured. Push notifications disabled.');
        return;
    }

    // Enable verbose logging for debugging (remove in production)
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);

    // Initialize OneSignal
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // Request notification permissions
    OneSignal.Notifications.requestPermission(true);

    console.log('OneSignal initialized successfully');
}

/**
 * Set external user ID for targeting specific users
 * Call this after user identification (e.g., after getting device ID)
 */
export function setOneSignalExternalUserId(userId: string) {
    if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID') return;

    OneSignal.login(userId);
}

/**
 * Add tags for segmentation (e.g., user preferences)
 */
export function setOneSignalTags(tags: Record<string, string>) {
    if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID') return;

    OneSignal.User.addTags(tags);
}

/**
 * Handle notification opened event
 * Returns a cleanup function
 */
export function onNotificationOpened(callback: (data: any) => void) {
    if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID') return () => { };

    const listener = OneSignal.Notifications.addEventListener('click', (event) => {
        callback(event.notification);
    });

    return () => {
        // Note: OneSignal SDK handles cleanup internally
    };
}

/**
 * Check if push notifications are enabled
 */
export async function isPushEnabled(): Promise<boolean> {
    if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID') return false;

    return OneSignal.Notifications.hasPermission();
}
