import * as FileSystem from 'expo-file-system';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { LocationProvider } from "../contexts/LocationContext";
import { FieldProvider } from "../contexts/FieldContext";

// Prevent the splash screen from auto-hiding while we load the fonts
SplashScreen.preventAutoHideAsync();

const RootLayoutWithProvider = () => {
    return(
        <AuthProvider>
            <LocationProvider>
                <FieldProvider>
                    <MainLayout />
                </FieldProvider>
            </LocationProvider>
        </AuthProvider>
    )
}

export default RootLayoutWithProvider;

export function MainLayout() {
    const {setAuth, setUserData} = useAuth();
    const router = useRouter();

    const [fontsLoaded, fontError] = useFonts({
        // --- LOAD ALL YOUR FONTS HERE ---
        'SFNSDisplay-Black': require('../assets/fonts/SFNSDisplay-Black.otf'),
        'SFNSDisplay-Bold': require('../assets/fonts/SFNSDisplay-Bold.otf'),
        'SFNSDisplay-Heavy': require('../assets/fonts/SFNSDisplay-Heavy.otf'),
        'SFNSDisplay-Light': require('../assets/fonts/SFNSDisplay-Light.otf'),
        'SFNSDisplay-Medium': require('../assets/fonts/SFNSDisplay-Medium.otf'),
        'SFNSDisplay-Regular': require('../assets/fonts/SFNSDisplay-Regular.otf'),
        'SFNSDisplay-Semibold': require('../assets/fonts/SFNSDisplay-Semibold.otf'),
        'SFNSDisplay-Thin': require('../assets/fonts/SFNSDisplay-Thin.otf'),
        'SFNSDisplay-Ultralight': require('../assets/fonts/SFNSDisplay-Ultralight.otf'),

        // SFNSText Fonts
        'SFNSText-Bold': require('../assets/fonts/SFNSText-Bold.otf'),
        'SFNSText-BoldItalic': require('../assets/fonts/SFNSText-BoldItalic.otf'),
        'SFNSText-BoldItalicG1': require('../assets/fonts/SFNSText-BoldItalicG1.otf'),
        'SFNSText-BoldItalicG2': require('../assets/fonts/SFNSText-BoldItalicG2.otf'),
        'SFNSText-BoldItalicG3': require('../assets/fonts/SFNSText-BoldItalicG3.otf'),
        'SFNSText-BoldG1': require('../assets/fonts/SFNSText-BoldG1.otf'),
        'SFNSText-BoldG2': require('../assets/fonts/SFNSText-BoldG2.otf'),
        'SFNSText-BoldG3': require('../assets/fonts/SFNSText-BoldG3.otf'),
        'SFNSText-HeavyItalic': require('../assets/fonts/SFNSText-HeavyItalic.otf'),
        'SFNSText-LightItalic': require('../assets/fonts/SFNSText-LightItalic.otf'),
        'SFNSText-Medium': require('../assets/fonts/SFNSText-Medium.otf'),
        'SFNSText-MediumItalic': require('../assets/fonts/SFNSText-MediumItalic.otf'),
        'SFNSText-Regular': require('../assets/fonts/SFNSText-Regular.otf'),
        'SFNSText-RegularG1': require('../assets/fonts/SFNSText-RegularG1.otf'),
        'SFNSText-RegularG2': require('../assets/fonts/SFNSText-RegularG2.otf'),
        'SFNSText-RegularG3': require('../assets/fonts/SFNSText-RegularG3.otf'),
        'SFNSText-RegularItalic': require('../assets/fonts/SFNSText-RegularItalic.otf'),
        'SFNSText-RegularItalicG1': require('../assets/fonts/SFNSText-RegularItalicG1.otf'),
        'SFNSText-RegularItalicG2': require('../assets/fonts/SFNSText-RegularItalicG2.otf'),
        'SFNSText-RegularItalicG3': require('../assets/fonts/SFNSText-RegularItalicG3.otf'),
        'SFNSText-Semibold': require('../assets/fonts/SFNSText-Semibold.otf'),
        'SFNSText-SemiboldItalic': require('../assets/fonts/SFNSText-SemiboldItalic.otf'),
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    useEffect(() => {
        if (fontError) {
            console.error(fontError);
        }
    }, [fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    // Global JS error handler - captures uncaught exceptions in release builds
    // and logs them to a file for later inspection.
    // This helps diagnose crashes that only happen in production APKs.
    try {
        const globalHandler = global.ErrorUtils && global.ErrorUtils.getGlobalHandler && global.ErrorUtils.getGlobalHandler();
        const setHandler = (error, isFatal) => {
            const timestamp = new Date().toISOString();
            const content = `${timestamp} - ${isFatal ? 'FATAL' : 'ERROR'} - ${error?.message || error}\n${error?.stack || ''}\n\n`;
            const logFile = FileSystem.documentDirectory + 'app_error_logs.txt';
            FileSystem.appendFileAsync
                ? FileSystem.appendFileAsync(logFile, content).catch(() => {})
                : FileSystem.writeAsStringAsync(logFile, content, { encoding: FileSystem.EncodingType.UTF8 }).catch(() => {});
            // Show an alert in debug builds so developer notices; in production this won't be intrusive.
            try {
                Alert.alert('App error', 'An unexpected error occurred. A log has been saved.');
            } catch (e) {}
            // call original handler if present
            if (typeof globalHandler === 'function') {
                try { globalHandler(error, isFatal); } catch (e) {}
            }
        };

        if (global.ErrorUtils && global.ErrorUtils.setGlobalHandler) {
            global.ErrorUtils.setGlobalHandler(setHandler);
        }
    } catch (e) {
        // ignore
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="profile" options={{ presentation: 'card' }} />
        </Stack>
    );
}