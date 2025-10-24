import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding while we load the fonts
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

    // Load all font files from the assets folder at the root level.
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
        // ---------------------------------
    });

    // Effect to hide the splash screen when loading is complete or failed.
    useEffect(() => {
        if (fontsLoaded || fontError) {
            // Hides the splash screen once fonts are loaded (or if an error occurred)
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    // Handle font loading error
    useEffect(() => {
        if (fontError) {
            console.error(fontError);
            // In a real app, you might render an error page here.
        }
    }, [fontError]);

    // Don't render any routes until the fonts are loaded
    if (!fontsLoaded && !fontError) {
        return null;
    }

    // Render the application stack
    return <Stack screenOptions={{ headerShown: false }} />;
}
