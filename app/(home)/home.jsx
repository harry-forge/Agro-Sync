import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from "../../components/Button";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";

const Home = () => {
    const { user, logout } = useAuth();
    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isHindi, setIsHindi] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [weatherCondition, setWeatherCondition] = useState('sunny');
    const [currentLottieSource, setCurrentLottieSource] = useState(null);
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
        
        // Set initial weather
        const initialWeather = getWeatherCondition();
        setWeatherCondition(initialWeather.condition);
        setCurrentLottieSource(initialWeather.lottie);
        
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

        // Weather animation - change every 8 seconds
        const weatherInterval = setInterval(() => {
            const newWeather = getWeatherCondition();
            animateWeatherChange(newWeather);
        }, 8000); // Change weather every 8 seconds

        return () => {
            clearInterval(languageInterval);
            clearInterval(weatherInterval);
        };
    }, []);

    // Get user's first name
    const getUserName = () => {
        if (user?.user_metadata?.name) return user.user_metadata.name.split(' ')[0];
        if (user?.name) return user.name.split(' ')[0];
        if (user?.email) return user.email.split('@')[0];
        return 'Friend';
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
                            <LottieView
                                ref={lottieRef}
                                source={currentLottieSource}
                                style={styles.lottieWeather}
                                autoPlay
                                loop
                                speed={0.8}
                            />
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
    content: {
        flex: 1,
        paddingVertical: hp(4),
    },
    footer: {
        paddingBottom: hp(4),
    },
})
