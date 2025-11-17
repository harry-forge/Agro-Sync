import 'dotenv/config';

export default {
    expo: {
        name: "AgroSync",
        slug: "agrosync",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/logo.png",
        scheme: "agrosync",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        platforms: ["ios", "android", "web"],

        ios: { 
            supportsTablet: true,
            bundleIdentifier: "com.agrosync.app"
        },

        android: {
            adaptiveIcon: {
                backgroundColor: "#ffffff",
                foregroundImage: "./assets/images/logo.png"
            },
            package: "com.agrosync.app",
            versionCode: 1
        },

        web: {
            output: "static",
            favicon: "./assets/images/logo.png"
        },

        plugins: [
            "expo-router",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/logo.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff"
                }
            ],
            "expo-font",
            "expo-sqlite",
            [
                "expo-location",
                {
                    locationAlwaysAndWhenInUsePermission: "This app uses location to provide weather information."
                }
            ]
        ],

        assetBundlePatterns: [
            "**/*"
        ],

        experiments: {
            typedRoutes: true
        },

        extra: {
            eas: {
                projectId: "90f74014-2be5-45df-96aa-41e00f7e127c"
            },
            supabaseUrl: process.env.EXPO_SUPABASE_URL,
            supabaseAnonKey: process.env.EXPO_SUPABASE_ANON_KEY,
            weatherApiKey: process.env.EXPO_PUBLIC_WEATHER_API_KEY
        }
    }
};
