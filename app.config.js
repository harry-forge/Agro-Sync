import 'dotenv/config';

export default {
    expo: {
        name: "AgroSync",
        slug: "AgroSync",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/boardingImage.png",
        scheme: "agrosync",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,

        ios: { supportsTablet: true },

        android: {
            adaptiveIcon: {
                backgroundColor: "#E6F4FE",
                foregroundImage: "./assets/images/android-icon-foreground.png",
                backgroundImage: "./assets/images/android-icon-background.png",
                monochromeImage: "./assets/images/android-icon-monochrome.png"
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false
        },

        web: {
            output: "static",
            favicon: "./assets/images/boardingImage.png"
        },

        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/boardingImage.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff",
                    dark: { backgroundColor: "#000000" }
                }
            ],
            "expo-font",
            "expo-sqlite"
        ],

        experiments: {
            typedRoutes: true,
            reactCompiler: true
        },

        extra: {
            supabaseUrl: process.env.EXPO_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_SUPABASE_ANON_KEY,
            weatherApiKey: process.env.EXPO_PUBLIC_WEATHER_API_KEY
        }
    }
};
