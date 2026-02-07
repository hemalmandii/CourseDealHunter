import { LogLevel, OneSignal } from 'react-native-onesignal';
import Constants from 'expo-constants';

// Get OneSignal App ID from app.json extra config
const ONESIGNAL_APP_ID = Constants.expoConfig?.extra?.oneSignalAppId || '';

/**
 * Initialize OneSignal push notifications
 * Call this once in your app entry point (_layout.tsx)
 */
export function initializeOneSignal(prompt: boolean = false) {
    try {
        if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID') {
            console.warn('OneSignal App ID not configured. Push notifications disabled.');
            return;
        }

        // Check if native module exists to prevent crash in Expo Go
        if (!OneSignal) {
            console.warn('[OneSignal] Native module not found. Are you in Expo Go? Push notifications require a Development Build.');
            return;
        }

        // Enable verbose logging for debugging (remove in production)
        OneSignal.Debug.setLogLevel(LogLevel.Verbose);

        // Initialize OneSignal
        OneSignal.initialize(ONESIGNAL_APP_ID);

        // Request notification permissions ONLY if prompt is true
        if (prompt) {
            OneSignal.Notifications.requestPermission(true);
        }

        console.log('OneSignal initialized successfully');

        // Add observer to log subscription changes
        OneSignal.User.pushSubscription.addEventListener('change', (event) => {
            console.log('[OneSignal] Push Subscription Changed:', event);
        });

    } catch (error) {
        console.error('[OneSignal] Initialization error:', error);
    }
}

/**
 * Force sync notification state
 * Call this from debug menu if permissions are stuck
 */
export function forceOneSignalSync() {
    try {
        if (!OneSignal) return;
        console.log('[OneSignal] Forcing opt-in sync...');
        OneSignal.User.pushSubscription.optIn();
    } catch (error) {
        console.error('[OneSignal] Error forcing sync:', error);
    }
}

/**
 * Set external user ID for targeting specific users
 * Call this after user identification (e.g., after getting device ID)
 */
export function setOneSignalExternalUserId(userId: string) {
    try {
        if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID' || !OneSignal) return;
        OneSignal.login(userId);
    } catch (error) {
        console.error('[OneSignal] Error setting external user ID:', error);
    }
}

/**
 * Add tags for segmentation (e.g., user preferences)
 */
export function setOneSignalTags(tags: Record<string, string>) {
    try {
        if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID' || !OneSignal) return;
        OneSignal.User.addTags(tags);
    } catch (error) {
        console.error('[OneSignal] Error setting tags:', error);
    }
}

/**
 * Handle notification opened event
 * Returns a cleanup function
 */
export function onNotificationOpened(callback: (data: any) => void) {
    try {
        if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID' || !OneSignal) {
            return () => { };
        }

        const listener = OneSignal.Notifications.addEventListener('click', (event) => {
            callback(event.notification);
        });

        return () => {
            // OneSignal SDK handles cleanup internally
        };
    } catch (error) {
        console.error('[OneSignal] Error setting up notification listener:', error);
        return () => { };
    }
}

/**
 * Check if push notifications are enabled
 */
export async function isPushEnabled(): Promise<boolean> {
    try {
        if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID' || !OneSignal) return false;
        return OneSignal.Notifications.hasPermission();
    } catch (error) {
        console.error('[OneSignal] Error checking permission:', error);
        return false;
    }
}
