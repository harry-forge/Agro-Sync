import * as Location from 'expo-location';
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from "../../components/Button";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import { weatherService } from "../../services/weatherService";

const Home = () => {
    const { user, logout } = useAuth();
    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isHindi, setIsHindi] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [weatherCondition, setWeatherCondition] = useState('sunny');
    const [currentLottieSource, setCurrentLottieSource] = useState(require('../../assets/animations/sunny.json'));
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const lottieRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const moveUpAnim = useRef(new Animated.Value(0)).current;
    const cursorAnim = useRef(new Animated.Value(1)).current;
    const weatherIconAnim = useRef(new Animated.Value(1)).current;
    const bounceAnim = useRef(new Animated.Value(1)).current;

    // Get time-based greeting in both languages
    const getGreeting = (useHindi = false) => {
        const hour = new Date().getHours();
        
        const greetings = {
            english: {
                morning: 'Good Morning',
                afternoon: 'Good Afternoon', 
                evening: 'Good Evening',
                night: 'Good Night'
            },
            hindi: {
                morning: 'सुप्रभात',
                afternoon: 'नमस्ते',
                evening: 'शुभ संध्या',
                night: 'शुभ रात्रि'
            }
        };

        const lang = useHindi ? greetings.hindi : greetings.english;
        
        if (hour >= 5 && hour < 12) return lang.morning;
        if (hour >= 12 && hour < 17) return lang.afternoon;
        if (hour >= 17 && hour < 21) return lang.evening;
        return lang.night;
    };

    // Typing effect animation
    const animateTypingEffect = (newText) => {
        // First fade out current text and move up slightly
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(moveUpAnim, {
                toValue: -2, // Move 2px up
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Reset position and start typing
            setDisplayedText('');
            setGreeting(newText);
            moveUpAnim.setValue(0); // Reset position
            
            // Fade in and start typing effect
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Start typing animation
            const fullText = `${newText}, ${getUserName()}`;
            let currentIndex = 0;
            
            const typingInterval = setInterval(() => {
                if (currentIndex <= fullText.length) {
                    setDisplayedText(fullText.substring(0, currentIndex));
                    currentIndex++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 80); // 80ms between each character
        });
    };

    // Cursor blinking animation
    useEffect(() => {
        const blinkCursor = () => {
            Animated.sequence([
                Animated.timing(cursorAnim, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(cursorAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                })
            ]).start(() => blinkCursor());
        };
        
        blinkCursor();
    }, []);

    // Weather icon animation effect
    useEffect(() => {
        const pulseWeatherIcon = () => {
            Animated.sequence([
                Animated.timing(bounceAnim, {
                    toValue: 1.1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                })
            ]).start(() => pulseWeatherIcon());
        };
        
        pulseWeatherIcon();
    }, []);

    // Initialize greeting, weather and set up animations
    useEffect(() => {
        // Set initial greeting and start typing effect
        const initialGreeting = getGreeting(false);
        setGreeting(initialGreeting);
        
        // Test API key first
        weatherService.testApiKey();
        
        // Get user location and fetch weather
        getUserLocation();
        
        // Start initial typing effect
        setTimeout(() => {
            animateTypingEffect(initialGreeting);
        }, 500); // Small delay before starting

        // Language animation - switch every 5 seconds (increased for typing effect)
        const languageInterval = setInterval(() => {
            setIsHindi(prev => {
                const newIsHindi = !prev;
                const newGreeting = getGreeting(newIsHindi);
                animateTypingEffect(newGreeting);
                return newIsHindi;
            });
        }, 5000); // Switch every 5 seconds to allow typing animation to complete

        return () => {
            clearInterval(languageInterval);
        };
    }, []);

    // Fetch weather when location is available
    useEffect(() => {
        console.log('Location changed:', location);
        if (location.latitude && location.longitude) {
            console.log('Fetching weather for location:', location.latitude, location.longitude);
            fetchWeatherData(location.latitude, location.longitude);
            
            // Refresh weather every 10 minutes
            const weatherInterval = setInterval(() => {
                fetchWeatherData(location.latitude, location.longitude);
            }, 600000); // 10 minutes

            return () => clearInterval(weatherInterval);
        } else {
            console.log('Location not available yet');
        }
    }, [location]);

    // Fetch weather data from API
    const fetchWeatherData = async (lat, lon) => {
        try {
            setWeatherLoading(true);
            const result = await weatherService.getCurrentWeather(lat, lon);
            
            if (result.success) {
                setWeatherData(result.data);
                
                // Update animation based on real weather
                const condition = mapWeatherCondition(result.data.current.condition.code, result.data.current.is_day);
                setWeatherCondition(condition);
                setCurrentLottieSource(weatherAnimations[condition] || weatherAnimations['sunny']);
            } else {
                console.error('Weather API error:', result.error);
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
        } finally {
            setWeatherLoading(false);
        }
    };

    // Get user's first name
    const getUserName = () => {
        if (user?.user_metadata?.name) return user.user_metadata.name.split(' ')[0];
        if (user?.name) return user.name.split(' ')[0];
        if (user?.email) return user.email.split('@')[0];
        return 'Friend';
    };

    // Get user's location
    const getUserLocation = async () => {
        try {
            console.log('Requesting location permissions...');
            // Request permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            console.log('Location permission status:', status);
            
            if (status !== 'granted') {
                console.log('Permission to access location was denied, using fallback');
                // Fallback to a default location (New Delhi)
                setLocation({
                    latitude: 28.6139,
                    longitude: 77.2090
                });
                return;
            }

            console.log('Getting current position...');
            // Get current location
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeout: 10000,
            });
            
            console.log('Got location:', location.coords.latitude, location.coords.longitude);
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
        } catch (error) {
            console.log('Location error:', error);
            // Fallback to a default location (New Delhi)
            console.log('Using fallback location: New Delhi');
            setLocation({
                latitude: 28.6139,
                longitude: 77.2090
            });
        }
    };

    // Map weather API condition codes to our animations
    const mapWeatherCondition = (code, isDay) => {
        const conditionMap = {
            1000: isDay ? 'sunny' : 'clear-night', // Sunny/Clear
            1003: 'cloudy', // Partly cloudy
            1006: 'cloudy', // Cloudy
            1009: 'cloudy', // Overcast
            1030: 'cloudy', // Mist
            1063: 'rainy', // Patchy rain possible
            1066: 'storm', // Patchy snow possible
            1069: 'storm', // Patchy sleet possible
            1072: 'storm', // Patchy freezing drizzle possible
            1087: 'storm', // Thundery outbreaks possible
            1114: 'windy', // Blowing snow
            1117: 'storm', // Blizzard
            1135: 'cloudy', // Fog
            1147: 'cloudy', // Freezing fog
            1150: 'rainy', // Patchy light drizzle
            1153: 'rainy', // Light drizzle
            1168: 'rainy', // Freezing drizzle
            1171: 'rainy', // Heavy freezing drizzle
            1180: 'rainy', // Patchy light rain
            1183: 'rainy', // Light rain
            1186: 'rainy', // Moderate rain at times
            1189: 'rainy', // Moderate rain
            1192: 'rainy', // Heavy rain at times
            1195: 'rainy', // Heavy rain
            1198: 'rainy', // Light freezing rain
            1201: 'rainy', // Moderate or heavy freezing rain
            1204: 'storm', // Light sleet
            1207: 'storm', // Moderate or heavy sleet
            1210: 'storm', // Patchy light snow
            1213: 'storm', // Light snow
            1216: 'storm', // Patchy moderate snow
            1219: 'storm', // Moderate snow
            1222: 'storm', // Patchy heavy snow
            1225: 'storm', // Heavy snow
            1237: 'storm', // Ice pellets
            1240: 'rainy', // Light rain shower
            1243: 'rainy', // Moderate or heavy rain shower
            1246: 'storm', // Torrential rain shower
            1249: 'storm', // Light sleet showers
            1252: 'storm', // Moderate or heavy sleet showers
            1255: 'storm', // Light snow showers
            1258: 'storm', // Moderate or heavy snow showers
            1261: 'storm', // Light showers of ice pellets
            1264: 'storm', // Moderate or heavy showers of ice pellets
            1273: 'storm', // Patchy light rain with thunder
            1276: 'storm', // Moderate or heavy rain with thunder
            1279: 'storm', // Patchy light snow with thunder
            1282: 'storm', // Moderate or heavy snow with thunder
        };

        return conditionMap[code] || (isDay ? 'sunny' : 'clear-night');
    };

    // Weather animation sources - only Lottie animations
    const weatherAnimations = {
        'sunny': require('../../assets/animations/sunny.json'),
        'rainy': require('../../assets/animations/rainy.json'),
        'rainy-night': require('../../assets/animations/rainy-night.json'),
        'cloudy': require('../../assets/animations/clouds.json'),
        'clear-night': require('../../assets/animations/night.json'),
        'storm': require('../../assets/animations/storm.json'),
        'windy': require('../../assets/animations/windy.json')
    };

    // Get weather conditions based on time and random factors - only Lottie animations
    const getWeatherCondition = () => {
        const hour = new Date().getHours();
        const conditions = [];

        // Time-based conditions - only using available Lottie animations
        if (hour >= 6 && hour < 18) {
            // Day conditions
            conditions.push(
                { condition: 'sunny', lottie: weatherAnimations['sunny'], weight: 4 },
                { condition: 'cloudy', lottie: weatherAnimations['cloudy'], weight: 3 },
                { condition: 'rainy', lottie: weatherAnimations['rainy'], weight: 2 },
                { condition: 'windy', lottie: weatherAnimations['windy'], weight: 2 },
                { condition: 'storm', lottie: weatherAnimations['storm'], weight: 1 },
            );
        } else {
            // Night conditions
            conditions.push(
                { condition: 'clear-night', lottie: weatherAnimations['clear-night'], weight: 4 },
                { condition: 'cloudy', lottie: weatherAnimations['cloudy'], weight: 3 },
                { condition: 'rainy-night', lottie: weatherAnimations['rainy-night'], weight: 2 },
                { condition: 'storm', lottie: weatherAnimations['storm'], weight: 1 },
                { condition: 'windy', lottie: weatherAnimations['windy'], weight: 1 },
            );
        }

        // Weighted random selection
        const totalWeight = conditions.reduce((sum, c) => sum + c.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const condition of conditions) {
            random -= condition.weight;
            if (random <= 0) {
                return condition;
            }
        }
        
        return conditions[0]; // Fallback
    };

    // Animate weather icon change
    const animateWeatherChange = (newCondition) => {
        // Bounce and fade animation
        Animated.sequence([
            Animated.parallel([
                Animated.timing(weatherIconAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(bounceAnim, {
                    toValue: 1.2,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]),
            Animated.timing(bounceAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start(() => {
            setWeatherCondition(newCondition.condition);
            setCurrentLottieSource(newCondition.lottie);
            
            // Restart Lottie animation
            if (lottieRef.current) {
                lottieRef.current.reset();
                lottieRef.current.play();
            }
            
            Animated.timing(weatherIconAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();
        });
    };

    const onLogout = async () => {
        setLoading(true);
        const result = await logout();
        if(result.success) {
            router.replace('/welcome');
            setLoading(false);
        } else {
            Alert.alert('LogOut Error', result.error || 'Failed to log out. Please try again.');
            setLoading(false);
        }
        setLoading(false);
    };

    const onProfilePress = () => {
        // Navigate to profile/settings (placeholder for now)
        Alert.alert('Profile', 'Profile settings coming soon! 🚀');
    };



    return (
        <ScreenWrapper bg='white'>
            <StatusBar style="dark" />
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    {/* Left side - Greeting */}
                    <View style={styles.greetingContainer}>
                        {/* Background Autumn Plants Animation */}
                        <View style={styles.backgroundAnimationContainer}>
                            <LottieView
                                source={require('../../assets/animations/autumn-plants.json')}
                                style={styles.backgroundAnimation}
                                autoPlay
                                loop
                                speed={0.5}
                            />
                        </View>
                        
                        <Animated.View style={[
                            styles.animatedTextContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: moveUpAnim }]
                            }
                        ]}>
                            <Text style={styles.greetingText}>
                                {displayedText}
                                <Animated.Text style={[styles.cursor, { opacity: cursorAnim }]}>|</Animated.Text>
                            </Text>
                        </Animated.View>
                        <Text style={styles.dateText}>
                            {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </Text>
                    </View>

                    {/* Right side - Weather & Profile */}
                    <View style={styles.headerActions}>
                        {/* Animated Weather Icon */}
                        <Animated.View style={[
                            styles.weatherContainer,
                            {
                                opacity: weatherIconAnim,
                                transform: [{ scale: bounceAnim }]
                            }
                        ]}>
                            {currentLottieSource && (
                                <LottieView
                                    ref={lottieRef}
                                    source={currentLottieSource}
                                    style={styles.lottieWeather}
                                    autoPlay
                                    loop
                                    speed={0.8}
                                />
                            )}
                        </Animated.View>

                        {/* Animated Profile Icon */}
                        <Pressable style={styles.profileButton} onPress={onProfilePress}>
                            <LottieView
                                source={require('../../assets/animations/user.json')}
                                autoPlay
                                loop
                                style={styles.lottieProfile}
                            />
                        </Pressable>
                    </View>
                </View>

                {/* Weather Section */}
                <View style={styles.weatherSection}>
                    {weatherLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={styles.loadingText}>Loading weather...</Text>
                        </View>
                    ) : weatherData ? (
                        <View style={styles.weatherCard}>
                            <View style={styles.weatherHeader}>
                                <Text style={styles.locationText}>
                                    📍 {weatherData.location.name}, {weatherData.location.country}
                                </Text>
                                <Text style={styles.lastUpdated}>
                                    Updated: {new Date(weatherData.current.last_updated).toLocaleTimeString('en-US', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </Text>
                            </View>
                            
                            <View style={styles.weatherMain}>
                                <View style={styles.temperatureContainer}>
                                    <Text style={styles.temperature}>
                                        {Math.round(weatherData.current.temp_c)}°
                                    </Text>
                                    <View style={styles.temperatureDetails}>
                                        <Text style={styles.condition}>
                                            {weatherData.current.condition.text}
                                        </Text>
                                        <Text style={styles.feelsLike}>
                                            Feels like {Math.round(weatherData.current.feelslike_c)}°C
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={styles.weatherIcon}>
                                    {currentLottieSource && (
                                        <LottieView
                                            source={currentLottieSource}
                                            style={styles.weatherLottieIcon}
                                            autoPlay
                                            loop
                                            speed={0.8}
                                        />
                                    )}
                                </View>
                            </View>
                            
                            <View style={styles.weatherDetails}>
                                <View style={styles.detailItem}>
                                    <View style={styles.detailIcon}>
                                        <LottieView
                                            source={require('../../assets/animations/clouds.json')}
                                            style={styles.detailLottie}
                                            autoPlay
                                            loop
                                            speed={0.8}
                                        />
                                    </View>
                                    <View style={styles.detailTextGroup}>
                                        <Text style={styles.detailLabel}>Humidity</Text>
                                        <Text style={styles.detailValue}>{weatherData.current.humidity}%</Text>
                                    </View>
                                </View>

                                <View style={styles.detailItem}>
                                    <View style={styles.detailIcon}>
                                        <LottieView
                                            source={require('../../assets/animations/windblow.json')}
                                            style={styles.detailLottie}
                                            autoPlay
                                            loop
                                            speed={0.8}
                                        />
                                    </View>
                                    <View style={styles.detailTextGroup}>
                                        <Text style={styles.detailLabel}>Wind</Text>
                                        <Text style={styles.detailValue}>{weatherData.current.wind_kph} km/h</Text>
                                    </View>
                                </View>

                                <View style={styles.detailItem}>
                                    <View style={styles.detailIcon}>
                                        <LottieView
                                            source={require('../../assets/animations/uv-index.json')}
                                            style={styles.detailLottie}
                                            autoPlay
                                            loop
                                            speed={0.8}
                                        />
                                    </View>
                                    <View style={styles.detailTextGroup}>
                                        <Text style={styles.detailLabel}>UV Index</Text>
                                        <Text style={styles.detailValue}>{weatherData.current.uv}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailItem}>
                                    <View style={styles.detailIcon}>
                                        <LottieView
                                            source={require('../../assets/animations/sunny.json')}
                                            style={styles.detailLottie}
                                            autoPlay
                                            loop
                                            speed={0.8}
                                        />
                                    </View>
                                    <View style={styles.detailTextGroup}>
                                        <Text style={styles.detailLabel}>Visibility</Text>
                                        <Text style={styles.detailValue}>{weatherData.current.vis_km} km</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.weatherError}>
                            <Text style={styles.errorText}>Unable to load weather data</Text>
                            <Pressable 
                                style={styles.retryButton}
                                onPress={() => {
                                    if (location.latitude && location.longitude) {
                                        fetchWeatherData(location.latitude, location.longitude);
                                    } else {
                                        getUserLocation();
                                    }
                                }}
                            >
                                <Text style={styles.retryButtonText}>Retry</Text>
                            </Pressable>
                        </View>
                    )}
                </View>

                {/* Main Content Area */}
                <View style={styles.content}>
                    {/* Content will be added here */}
                </View>

                {/* Temporary logout button - will be moved to profile later */}
                <View style={styles.footer}>
                    <Button loading={loading} title={'Log Out'} onPress={onLogout} />
                </View>
            </View>
        </ScreenWrapper>
    )
}
export default Home
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: hp(2),
        paddingBottom: hp(3),
    },
    greetingContainer: {
        flex: 1,
        overflow: 'visible', // Changed to visible to show Hindi characters properly
        paddingVertical: hp(1), // More padding for better animation visibility
        paddingHorizontal: wp(2), // Add horizontal padding
        position: 'relative', // Enable positioning for background animation
        minHeight: hp(8), // Ensure enough height for the animation
    },
    backgroundAnimationContainer: {
        position: 'absolute',
        top: -hp(1),
        left: -wp(8), // Extended more to the left
        right: -wp(15), // Extended to the right
        bottom: -hp(1),
        zIndex: 0,
        opacity: 0.4, // Slightly more visible
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    backgroundAnimation: {
        width: wp(55), // Much wider to span left to right
        height: hp(10), // Slightly taller
        opacity: 0.7,
    },
    animatedTextContainer: {
        minHeight: hp(4), // Ensure container has enough height for Hindi characters
        justifyContent: 'center',
        zIndex: 2, // Ensure text appears above background animation
        position: 'relative',
        paddingVertical: hp(0.5),
        marginLeft: wp(1), // Slight left margin for better positioning
    },
    greetingText: {
        fontSize: hp(2.8),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.textDark,
        lineHeight: hp(3.8), // Increased line height for better Hindi character spacing
        includeFontPadding: false, // Remove extra font padding that can clip text
        textAlignVertical: 'center', // Center text vertically
    },
    cursor: {
        fontSize: hp(2.8),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.primary,
        opacity: 0.7,
    },
    dateText: {
        fontSize: hp(1.6),
        fontFamily: 'SFNSText-Regular',
        color: theme.colors.textLight,
        marginTop: hp(0.5),
        marginLeft: wp(1), // Align with greeting text
        zIndex: 2,
        position: 'relative',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(3),
    },
    weatherContainer: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        backgroundColor: 'rgba(80, 200, 120, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(80, 200, 120, 0.2)',
    },

    lottieWeather: {
        width: wp(10),
        height: wp(10),
    },
    lottieProfile: {
        width: wp(8),
        height: wp(8),
    },
    profileButton: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        backgroundColor: theme.colors.gray,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    weatherSection: {
        paddingHorizontal: wp(2),
        paddingBottom: hp(2),
    },
    loadingContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: wp(6),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 5,
        minHeight: hp(20),
    },
    loadingText: {
        fontSize: hp(1.8),
        fontFamily: 'SFNSText-Medium',
        color: theme.colors.textLight,
        marginTop: hp(1),
    },
    weatherCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: wp(5),
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(80, 200, 120, 0.1)',
    },
    weatherHeader: {
        marginBottom: hp(2),
    },
    locationText: {
        fontSize: hp(1.9),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.textDark,
        marginBottom: hp(0.5),
    },
    lastUpdated: {
        fontSize: hp(1.4),
        fontFamily: 'SFNSText-Regular',
        color: theme.colors.textLight,
    },
    weatherMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(2.5),
    },
    temperatureContainer: {
        flex: 1,
    },
    temperature: {
        fontSize: hp(7),
        fontFamily: 'SFNSDisplay-Heavy',
        color: theme.colors.primary,
        lineHeight: hp(7),
        marginBottom: hp(0.5),
    },
    temperatureDetails: {
        gap: hp(0.3),
    },
    condition: {
        fontSize: hp(2),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.textDark,
        textTransform: 'capitalize',
    },
    feelsLike: {
        fontSize: hp(1.6),
        fontFamily: 'SFNSText-Regular',
        color: theme.colors.textLight,
    },
    weatherIcon: {
        width: wp(20),
        height: wp(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
    weatherLottieIcon: {
        width: wp(18),
        height: wp(18),
    },
    weatherDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: hp(1),
        paddingTop: hp(2),
        paddingHorizontal: wp(1),
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    detailItem: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: wp(20),
        maxWidth: wp(22),
        paddingVertical: hp(0.8),
        paddingHorizontal: wp(1),
    },
    detailIcon: {
        width: wp(10),
        height: wp(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(0.3),
    },
    detailLottie: {
        width: wp(8),
        height: wp(8),
    },
    detailTextGroup: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: hp(0.1),
    },
    detailLabel: {
        fontSize: hp(1.4),
        fontFamily: 'SFNSText-Regular',
        color: theme.colors.textLight,
        marginBottom: hp(0.3),
    },
    detailValue: {
        fontSize: hp(1.7),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.textDark,
    },
    weatherError: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 20,
        padding: wp(6),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 5,
        minHeight: hp(15),
    },
    errorText: {
        fontSize: hp(1.8),
        fontFamily: 'SFNSText-Medium',
        color: theme.colors.textLight,
        marginBottom: hp(2),
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.2),
        borderRadius: 12,
    },
    retryButtonText: {
        fontSize: hp(1.6),
        fontFamily: 'SFNSDisplay-Bold',
        color: 'white',
    },
    content: {
        flex: 1,
        paddingVertical: hp(2),
    },
    footer: {
        paddingBottom: hp(4),
    },
})
