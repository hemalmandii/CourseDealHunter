export const Colors = {
    light: {
        background: '#F8F9FA', // Light Gray-White
        card: '#FFFFFF',
        text: '#111827', // Gray 900
        textSecondary: '#6B7280', // Gray 500
        border: '#111827', // Black border (Pop style)
        primary: '#F59E0B', // Amber 500
        secondary: '#3B82F6', // Blue 500
        accent: '#EC4899', // Pink 500
        success: '#10B981', // Emerald 500
        danger: '#EF4444', // Red 500
        shadow: '#111827',
    },
    dark: {
        background: '#111827', // Gray 900
        card: '#1F2937', // Gray 800
        text: '#F9FAFB', // Gray 50
        textSecondary: '#9CA3AF', // Gray 400
        border: '#374151', // Gray 700 (Softer border for dark mode)
        primary: '#FBBF24', // Amber 400 (Brighter for dark)
        secondary: '#60A5FA', // Blue 400
        accent: '#F472B6', // Pink 400
        success: '#34D399', // Emerald 400
        danger: '#F87171', // Red 400
        shadow: '#000000',
    }
};

export type ThemeColors = typeof Colors.light;
