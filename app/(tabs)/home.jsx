import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from 'expo-location';
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from 'lottie-react-native';
import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import AskAIFab from "../../components/AskAIFab";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { hp, wp } from "../../helpers/common";
import { iotService } from "../../services/iotService";
import { weatherService } from "../../services/weatherService";

const Home = () => {
    const { user, logout } = useAuth();
    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(false);
    const [displayedText, setDisplayedText] = useState('');
    const [isHindi, setIsHindi] = useState(false);
    const [weatherCondition, setWeatherCondition] = useState('sunny');
    const [currentLottieSource, setCurrentLottieSource] = useState(require('../../assets/animations/sunny.json'));
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [iotData, setIotData] = useState(null);
    const [iotLoading, setIotLoading] = useState(true);
    const [lastIotUpdate, setLastIotUpdate] = useState(null);
    const [isIotOnline, setIsIotOnline] = useState(false);
    const [healthData, setHealthData] = useState(null);
    const [healthLoading, setHealthLoading] = useState(false);
    const [showHealthCheck, setShowHealthCheck] = useState(false);
    const previousTimestampRef = useRef(null);
    const lottieRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const moveUpAnim = useRef(new Animated.Value(0)).current;
    const cursorAnim = useRef(new Animated.Value(1)).current;
    const weatherIconAnim = useRef(new Animated.Value(1)).current;
    const bounceAnim = useRef(new Animated.Value(1)).current;
    const healthModalFadeAnim = useRef(new Animated.Value(0)).current;
    const healthModalScaleAnim = useRef(new Animated.Value(0.8)).current;
    const statusFadeAnim = useRef(new Animated.Value(1)).current;

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

    const animateTypingEffect = (newText) => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(moveUpAnim, { toValue: -2, duration: 200, useNativeDriver: true })
        ]).start(() => {
            setDisplayedText('');
            moveUpAnim.setValue(0);
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
            const fullText = `${newText}, ${getUserName()}`;
            let currentIndex = 0;
            const typingInterval = setInterval(() => {
                if (currentIndex <= fullText.length) {
                    setDisplayedText(fullText.substring(0, currentIndex));
                    currentIndex++;
                } else {
                    clearInterval(typingInterval);
                    setGreeting(newText);
                }
            }, 80);
        });
    };

    useEffect(() => {
        const blinkCursor = () => {
            Animated.sequence([
                Animated.timing(cursorAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
                Animated.timing(cursorAnim, { toValue: 1, duration: 500, useNativeDriver: false })
            ]).start(() => blinkCursor());
        };
        blinkCursor();
    }, []);

    useEffect(() => {
        const pulseWeatherIcon = () => {
            Animated.sequence([
                Animated.timing(bounceAnim, { toValue: 1.1, duration: 2000, useNativeDriver: true }),
                Animated.timing(bounceAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
            ]).start(() => pulseWeatherIcon());
        };
        pulseWeatherIcon();
    }, []);

    useEffect(() => {
        const initialGreeting = getGreeting(false);
        setGreeting(initialGreeting);
        weatherService.testApiKey();
        getUserLocation();
        fetchIoTData();

        const iotInterval = setInterval(() => { fetchIoTData(); }, 30000);
        setTimeout(() => { animateTypingEffect(initialGreeting); }, 500);
        const languageInterval = setInterval(() => {
            setIsHindi(prev => {
                const newIsHindi = !prev;
                const newGreeting = getGreeting(newIsHindi);
                animateTypingEffect(newGreeting);
                return newIsHindi;
            });
        }, 5000);

        return () => {
            clearInterval(languageInterval);
            clearInterval(iotInterval);
        };
    }, []);

    useEffect(() => {
        if (location.latitude && location.longitude) {
            fetchWeatherData(location.latitude, location.longitude);
            const weatherInterval = setInterval(() => {
                fetchWeatherData(location.latitude, location.longitude);
            }, 600000);
            return () => clearInterval(weatherInterval);
        }
    }, [location]);

    useEffect(() => {
        if (user) {
            const newGreeting = getGreeting(isHindi);
            animateTypingEffect(newGreeting);
        }
    }, [user]);

    const fetchWeatherData = async (lat, lon) => {
        try {
            setWeatherLoading(true);
            const result = await weatherService.getCurrentWeather(lat, lon);
            if (result.success) {
                setWeatherData(result.data);
                const condition = mapWeatherCondition(result.data.current.condition.code, result.data.current.is_day);
                setWeatherCondition(condition);
                setCurrentLottieSource(weatherAnimations[condition] || weatherAnimations['sunny']);
            }
        } catch (error) {
            console.error('Error fetching weather:', error);
        } finally {
            setWeatherLoading(false);
        }
    };

    // --- IoT Logic (from prevHome.jsx, identical to home.jsx but kept for clarity) ---
    const fetchIoTData = async () => {
        try {
            if (!iotData) setIotLoading(true);
            const result = await iotService.getData();
            if (result.success) {
                const newData = result.data;
                const previousOnlineStatus = isIotOnline;
                let newOnlineStatus = false;

                if (previousTimestampRef.current !== null) {
                    if (previousTimestampRef.current === newData.timestamp) {
                        newOnlineStatus = false;
                    } else {
                        newOnlineStatus = true;
                        setLastIotUpdate(new Date());
                    }
                } else {
                    if (newData.timestamp === "Never") {
                        newOnlineStatus = false;
                    } else {
                        newOnlineStatus = true;
                        setLastIotUpdate(new Date());
                    }
                }

                if (previousOnlineStatus !== newOnlineStatus) {
                    Animated.timing(statusFadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                        setIsIotOnline(newOnlineStatus);
                        Animated.timing(statusFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
                    });
                } else {
                    setIsIotOnline(newOnlineStatus);
                }

                previousTimestampRef.current = newData.timestamp;
                setIotData(newData);
            } else {
                setIsIotOnline(false);
            }
        } catch (error) {
            setIsIotOnline(false);
        } finally {
            if (!iotData) setIotLoading(false);
        }
    };

    const fetchHealthCheck = async () => {
        try {
            setHealthLoading(true);
            setShowHealthCheck(true);
            healthModalFadeAnim.setValue(0);
            healthModalScaleAnim.setValue(0.8);
            Animated.parallel([
                Animated.timing(healthModalFadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.spring(healthModalScaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true })
            ]).start();

            if (!iotData) {
                await new Promise(resolve => setTimeout(resolve, 4000));
                setHealthData(null);
                setHealthLoading(false);
                return;
            }

            await new Promise(resolve => setTimeout(resolve, 4000));
            const healthStatus = {
                temperature: analyzeTemperatureSensor(iotData.temperature),
                humidity: analyzeHumiditySensor(iotData.humidity),
                soil: analyzeSoilSensor(iotData.soil),
                light: analyzeLightSensor(iotData.light),
                rain: analyzeRainSensor(iotData.rain),
                overall: isIotOnline ? 'System Online' : 'System Offline'
            };
            setHealthData(healthStatus);
        } catch (error) {
            console.error('Error analyzing health check:', error);
        } finally {
            setHealthLoading(false);
        }
    };

    const analyzeTemperatureSensor = (temp) => {
        if (!isIotOnline || temp === 0) return 'ERROR - No Data';
        if (temp < 0 || temp > 50) return 'WARNING - Out of Range';
        if (temp >= 10 && temp <= 35) return 'OK - Optimal';
        return 'OK - Acceptable';
    };

    const analyzeHumiditySensor = (humidity) => {
        if (!isIotOnline || humidity === 0) return 'ERROR - No Data';
        if (humidity < 0 || humidity > 100) return 'WARNING - Invalid';
        if (humidity >= 30 && humidity <= 80) return 'OK - Optimal';
        return 'OK - Acceptable';
    };

    const analyzeSoilSensor = (soil) => {
        if (!isIotOnline) return 'ERROR - No Data';
        if (soil < 0 || soil > 4095) return 'WARNING - Invalid';
        const percentage = (soil / 4095) * 100;
        if (percentage >= 20 && percentage <= 80) return 'OK - Optimal';
        if (percentage < 10) return 'WARNING - Too Dry';
        if (percentage > 90) return 'WARNING - Too Wet';
        return 'OK - Acceptable';
    };

    const analyzeLightSensor = (light) => {
        if (!isIotOnline || light === 'N/A') return 'ERROR - No Data';
        if (light === 'Dark' || light === 'Bright' || light === 'Moderate') return 'OK - Working';
        return 'WARNING - Unknown State';
    };

    const analyzeRainSensor = (rain) => {
        if (!isIotOnline || rain === 0) return 'ERROR - No Data';
        if (rain < 0 || rain > 4095) return 'WARNING - Invalid';
        return 'OK - Working';
    };
    // --- End IoT Logic ---


    const getUserName = () => {
        if (user?.name) return user.name.split(' ')[0];
        if (user?.user_metadata?.name) return user.user_metadata.name.split(' ')[0];
        if (user?.email) return user.email.split('@')[0];
        return 'Friend';
    };

    const getUserLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocation({ latitude: 28.6139, longitude: 77.2090 });
                return;
            }
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeout: 10000,
            });
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
        } catch (error) {
            setLocation({ latitude: 28.6139, longitude: 77.2090 });
        }
    };

    const mapWeatherCondition = (code, isDay) => {
        const conditionMap = {
            1000: isDay ? 'sunny' : 'clear-night',
            1003: 'cloudy', 1006: 'cloudy', 1009: 'cloudy', 1030: 'cloudy',
            1063: 'rainy', 1066: 'storm', 1069: 'storm', 1072: 'storm',
            1087: 'storm', 1114: 'windy', 1117: 'storm', 1135: 'cloudy',
            1147: 'cloudy', 1150: 'rainy', 1153: 'rainy', 1168: 'rainy',
            1171: 'rainy', 1180: 'rainy', 1183: 'rainy', 1186: 'rainy',
            1189: 'rainy', 1192: 'rainy', 1195: 'rainy', 1198: 'rainy',
            1201: 'rainy', 1204: 'storm', 1207: 'storm', 1210: 'storm',
            1213: 'storm', 1216: 'storm', 1219: 'storm', 1222: 'storm',
            1225: 'storm', 1237: 'storm', 1240: 'rainy', 1243: 'rainy',
            1246: 'storm', 1249: 'storm', 1252: 'storm', 1255: 'storm',
            1258: 'storm', 1261: 'storm', 1264: 'storm', 1273: 'storm',
            1276: 'storm', 1279: 'storm', 1282: 'storm'
        };
        return conditionMap[code] || (isDay ? 'sunny' : 'clear-night');
    };

    const weatherAnimations = {
        'sunny': require('../../assets/animations/sunny.json'),
        'rainy': require('../../assets/animations/rainy.json'),
        'rainy-night': require('../../assets/animations/rainy-night.json'),
        'cloudy': require('../../assets/animations/clouds.json'),
        'clear-night': require('../../assets/animations/night.json'),
        'storm': require('../../assets/animations/storm.json'),
        'windy': require('../../assets/animations/windy.json')
    };

    const onProfilePress = () => {
        router.push("/profile");
    };

    const onLogout = async () => {
        try {
            const result = await logout();
            if (result.success) {
                router.replace('/welcome');
            } else {
                console.error('Logout failed:', result.error);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <ScreenWrapper bg='#f8fafb'>
            <StatusBar style="dark" />

            {/* Premium Header (from home.jsx) */}
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 600 }}
                style={styles.header}
            >
                <View style={styles.greetingSection}>
                    <View style={styles.backgroundAnimationContainer}>
                        <LottieView
                            source={require('../../assets/animations/autumn-plants.json')}
                            style={styles.backgroundAnimation}
                            autoPlay
                            loop
                            speed={0.5}
                        />
                    </View>

                    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: moveUpAnim }] }]}>
                        <Text style={styles.greetingText} numberOfLines={1} ellipsizeMode="tail">
                            {displayedText}
                            <Animated.Text style={{ opacity: cursorAnim, color: '#16a34a' }}>|</Animated.Text>
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

                <View style={styles.headerActions}>
                    <Animated.View style={[styles.weatherBadge, {
                        opacity: weatherIconAnim,
                        transform: [{ scale: bounceAnim }]
                    }]}>
                        {currentLottieSource && (
                            <LottieView
                                ref={lottieRef}
                                source={currentLottieSource}
                                style={styles.headerWeatherIcon}
                                autoPlay
                                loop
                                speed={0.8}
                            />
                        )}
                    </Animated.View>

                    <Pressable style={styles.profileBadge} onPress={onProfilePress}>
                        <LottieView
                            source={require('../../assets/animations/user.json')}
                            autoPlay
                            loop
                            style={styles.profileIcon}
                        />
                    </Pressable>
                </View>
            </MotiView>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Weather Card with Moti Animation (from home.jsx) */}
                <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', delay: 200 }}
                >
                    {weatherLoading ? (
                        <View style={styles.loadingCard}>
                            <LottieView
                                source={require('../../assets/animations/loading.json')}
                                style={styles.loadingAnimation}
                                autoPlay
                                loop
                                speed={1.5}
                            />
                            <Text style={styles.loadingText}>Loading weather...</Text>
                        </View>
                    ) : weatherData ? (
                        <View style={styles.weatherCard}>
                            <View style={styles.weatherHeader}>
                                <View style={styles.locationRow}>
                                    <View style={styles.locationIcon}>
                                        <Ionicons name="location" size={16} color="#16a34a" />
                                    </View>
                                    <View>
                                        <Text style={styles.locationText}>
                                            {weatherData.location.name}, {weatherData.location.country}
                                        </Text>
                                        <Text style={styles.lastUpdated}>
                                            Updated: {new Date(weatherData.current.last_updated).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.weatherMain}>
                                <View style={styles.temperatureSection}>
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

                                <View style={styles.weatherIconSection}>
                                    {currentLottieSource && (
                                        <LottieView
                                            source={currentLottieSource}
                                            style={styles.mainWeatherIcon}
                                            autoPlay
                                            loop
                                            speed={0.8}
                                        />
                                    )}
                                </View>
                            </View>

                            <View style={styles.weatherMetrics}>
                                <WeatherMetric
                                    icon="water"
                                    label="Humidity"
                                    value={`${weatherData.current.humidity}%`}
                                />
                                <WeatherMetric
                                    icon="speedometer"
                                    label="Wind"
                                    value={`${weatherData.current.wind_kph} km/h`}
                                />
                                <WeatherMetric
                                    icon="sunny"
                                    label="UV Index"
                                    value={weatherData.current.uv}
                                />
                                <WeatherMetric
                                    icon="eye"
                                    label="Visibility"
                                    value={`${weatherData.current.vis_km} km`}
                                />
                                <WeatherMetric
                                    icon="rainy"
                                    label="Rainfall"
                                    value={`${weatherData.current.precip_mm} mm`}
                                />
                            </View>
                        </View>
                    ) : null}
                </MotiView>

                {/* IoT Sensors Card (from prevHome.jsx) */}
                <MotiView
                    from={{ opacity: 0, translateY: 40 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'spring', delay: 400 }}
                >
                    <Text style={styles.sectionTitle}>🌱 Smart Farm Sensors</Text>

                    {iotLoading ? (
                        <View style={styles.loadingContainer}>
                            <LottieView
                                source={require('../../assets/animations/loading.json')}
                                style={styles.loadingAnimation}
                                autoPlay
                                loop
                                speed={1.5}
                            />
                            <Text style={styles.loadingText}>Loading sensor data...</Text>
                        </View>
                    ) : iotData ? (
                        <View style={styles.iotSingleCard}>
                            <View style={styles.iotSingleHeader}>
                                <Text style={styles.locationText}>🔗 Farm Sensor Hub</Text>
                                <Text style={styles.lastUpdated}>
                                    Updated: {lastIotUpdate
                                    ? lastIotUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                    : 'Never'}
                                </Text>
                            </View>

                            <View style={styles.iotSingleBody}>
                                <View style={styles.iotRow}>
                                    <Animated.View style={[styles.rowLeft, { opacity: statusFadeAnim }]}>
                                        <LottieView
                                            source={isIotOnline
                                                ? require('../../assets/animations/connection.json')
                                                : require('../../assets/animations/offline.json')}
                                            style={styles.rowIcon}
                                            autoPlay
                                            loop
                                            speed={0.8}
                                        />
                                        <View style={styles.rowText}>
                                            <Text style={styles.iotLabel}>System Status</Text>
                                            <Text style={[styles.iotValue, { color: isIotOnline ? '#4CAF50' : '#F44336' }]}>
                                                {isIotOnline ? 'Online' : 'Offline'}
                                            </Text>
                                            <Text style={[styles.iotStatus, { color: isIotOnline ? '#757575' : '#F44336' }]}>
                                                {isIotOnline ? 'Connected' : 'Disconnected'}
                                            </Text>
                                        </View>
                                    </Animated.View>

                                    <View style={styles.rowRight}>
                                        <View style={styles.smallMetric}>
                                            <LottieView source={require('../../assets/animations/temperature.json')} style={styles.smallIcon} autoPlay loop speed={0.8} />
                                            <Text style={styles.smallLabel}>Temperature</Text>
                                            <Text style={[styles.smallValue, { color: iotService.getTemperatureStatus(iotData.temperature).color }]}>{iotService.formatTemperature(iotData.temperature)}</Text>
                                        </View>

                                        <View style={styles.smallMetric}>
                                            <LottieView source={require('../../assets/animations/clouds.json')} style={styles.smallIcon} autoPlay loop speed={0.8} />
                                            <Text style={styles.smallLabel}>Humidity</Text>
                                            <Text style={styles.smallValue}>{iotService.formatHumidity(iotData.humidity)}</Text>
                                        </View>

                                        <View style={styles.smallMetric}>
                                            <LottieView source={require('../../assets/animations/Seedling.json')} style={styles.smallIcon} autoPlay loop speed={0.8} />
                                            <Text style={styles.smallLabel}>Soil</Text>
                                            <Text style={styles.smallValue}>{iotService.formatSoilMoisture(iotData.soil)}</Text>
                                        </View>

                                        <View style={styles.smallMetric}>
                                            <LottieView
                                                source={iotData.light === 'Dark'
                                                    ? require('../../assets/animations/night.json')
                                                    : require('../../assets/animations/sunny.json')}
                                                style={styles.smallIcon}
                                                autoPlay
                                                loop
                                                speed={0.8}
                                            />
                                            <Text style={styles.smallLabel}>Source</Text>
                                            <Text style={styles.smallValue}>{iotService.formatLightLevel(iotData.light)}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.iotDivider} />

                                <View style={styles.iotRowBottom}>
                                    <View style={styles.bottomItem}>
                                        <LottieView
                                            source={!isIotOnline || iotService.getRainStatus(iotData.rain).status === 'Clear'
                                                ? require('../../assets/animations/sunny.json')
                                                : require('../../assets/animations/rainy.json')}
                                            style={styles.smallIcon}
                                            autoPlay
                                            loop
                                            speed={0.8}
                                        />
                                        <View style={{marginLeft: wp(3)}}>
                                            <Text style={styles.smallLabel}>Rain</Text>
                                            <Text style={[styles.smallValue, { color: isIotOnline ? iotService.getRainStatus(iotData.rain).color : '#999' }]}>
                                                {isIotOnline ? `${iotService.formatRainLevel(iotData.rain)} · ${iotService.getRainStatus(iotData.rain).status}` : 'N/A · Offline'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Pressable
                                        style={styles.healthCheckButton}
                                        onPress={fetchHealthCheck}
                                        disabled={healthLoading}
                                    >
                                        {healthLoading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.healthCheckButtonText}>Health Check</Text>
                                        )}
                                    </Pressable>
                                </View>

                                {/* Health Check Modal (from prevHome.jsx) */}
                                {showHealthCheck && (
                                    <Animated.View
                                        style={[
                                            styles.healthCheckModal,
                                            {
                                                opacity: healthModalFadeAnim,
                                                transform: [{ scale: healthModalScaleAnim }]
                                            }
                                        ]}
                                    >
                                        <View style={styles.healthCheckHeader}>
                                            <Text style={styles.healthCheckTitle}>
                                                {healthLoading ? 'Analyzing Sensors...' : 'Device Health Status'}
                                            </Text>
                                            <Pressable onPress={() => {
                                                setShowHealthCheck(false);
                                                setHealthData(null);
                                            }}>
                                                <Text style={styles.healthCheckClose}>✕</Text>
                                            </Pressable>
                                        </View>

                                        {healthLoading ? (
                                            <View style={styles.healthCheckLoading}>
                                                <LottieView
                                                    source={require('../../assets/animations/health-heart.json')}
                                                    style={styles.healthHeartAnimation}
                                                    autoPlay
                                                    loop
                                                    speed={1}
                                                />
                                                <Text style={styles.checkingText}>Checking Sensors</Text>
                                                <View style={styles.sensorCheckList}>
                                                    <Text style={styles.sensorCheckItem}>• Temperature Sensor</Text>
                                                    <Text style={styles.sensorCheckItem}>• Humidity Sensor</Text>
                                                    <Text style={styles.sensorCheckItem}>• Soil Moisture Sensor</Text>
                                                    <Text style={styles.sensorCheckItem}>• Light Sensor</Text>
                                                    <Text style={styles.sensorCheckItem}>• Rain Sensor</Text>
                                                </View>
                                            </View>
                                        ) : healthData ? (
                                            <>
                                                {/* Overall Status */}
                                                <View style={styles.overallStatus}>
                                                    <Text style={styles.overallStatusLabel}>Overall System:</Text>
                                                    <Text style={[styles.overallStatusValue, { color: isIotOnline ? '#4CAF50' : '#F44336' }]}>
                                                        {healthData.overall}
                                                    </Text>
                                                </View>

                                                <View style={styles.healthCheckContent}>
                                                    <View style={styles.healthItem}>
                                                        <Text style={styles.healthLabel}>Temperature Sensor:</Text>
                                                        <Text style={[styles.healthStatus, {
                                                            color: healthData.temperature.includes('OK') ? '#4CAF50' :
                                                                healthData.temperature.includes('WARNING') ? '#FF9800' : '#F44336'
                                                        }]}>
                                                            {healthData.temperature}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.healthItem}>
                                                        <Text style={styles.healthLabel}>Humidity Sensor:</Text>
                                                        <Text style={[styles.healthStatus, {
                                                            color: healthData.humidity.includes('OK') ? '#4CAF50' :
                                                                healthData.humidity.includes('WARNING') ? '#FF9800' : '#F44336'
                                                        }]}>
                                                            {healthData.humidity}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.healthItem}>
                                                        <Text style={styles.healthLabel}>Soil Moisture Sensor:</Text>
                                                        <Text style={[styles.healthStatus, {
                                                            color: healthData.soil.includes('OK') ? '#4CAF50' :
                                                                healthData.soil.includes('WARNING') ? '#FF9800' : '#F44336'
                                                        }]}>
                                                            {healthData.soil}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.healthItem}>
                                                        <Text style={styles.healthLabel}>Light Sensor:</Text>
                                                        <Text style={[styles.healthStatus, {
                                                            color: healthData.light.includes('OK') ? '#4CAF50' :
                                                                healthData.light.includes('WARNING') ? '#FF9800' : '#F44336'
                                                        }]}>
                                                            {healthData.light}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.healthItem}>
                                                        <Text style={styles.healthLabel}>Rain Sensor:</Text>
                                                        <Text style={[styles.healthStatus, {
                                                            color: healthData.rain.includes('OK') ? '#4CAF50' :
                                                                healthData.rain.includes('WARNING') ? '#FF9800' : '#F44336'
                                                        }]}>
                                                            {healthData.rain}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </>
                                        ) : null}
                                    </Animated.View>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.iotError}>
                            <Text style={styles.errorText}>Unable to load sensor data</Text>
                            <Pressable style={styles.retryButton} onPress={fetchIoTData}><Text style={styles.retryButtonText}>Retry</Text></Pressable>
                        </View>
                    )}
                </MotiView>


                {/* Quick Actions (from home.jsx) */}
                <MotiView
                    from={{ opacity: 0, translateY: 40 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'spring', delay: 600 }}
                >
                    <View style={styles.actionsSection}>
                        <Pressable
                            style={styles.actionCard}
                            onPress={() => router.push('/fields')}
                        >
                            <View style={styles.actionIconContainer}>
                                <Ionicons name="analytics" size={24} color="#16a34a" />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={styles.actionTitle}>Field Analysis</Text>
                                <Text style={styles.actionSubtitle}>Get AI recommendations</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </Pressable>

                        <Pressable
                            style={styles.actionCard}
                            onPress={() => router.push('/profile')}
                        >
                            <View style={styles.actionIconContainer}>
                                <Ionicons name="settings" size={24} color="#16a34a" />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={styles.actionTitle}>Settings</Text>
                                <Text style={styles.actionSubtitle}>Manage your account</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </Pressable>

                        <Pressable
                            style={styles.logoutButton}
                            onPress={onLogout}
                        >
                            <View style={styles.logoutIconContainer}>
                                <Ionicons name="log-out-outline" size={24} color="#dc2626" />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={styles.logoutTitle}>Log Out</Text>
                                <Text style={styles.logoutSubtitle}>Sign out of your account</Text>
                            </View>
                        </Pressable>
                    </View>
                </MotiView>
            </ScrollView>
            <AskAIFab />
        </ScreenWrapper>
    )
}

// Weather Metric Component (from home.jsx)
function WeatherMetric({ icon, label, value }) {
    return (
        <View style={styles.metricItem}>
            <View style={styles.metricIcon}>
                <Ionicons name={icon} size={16} color="#16a34a" />
            </View>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value}</Text>
        </View>
    );
}

// NOTE: SensorCard component is removed as it's no longer used

export default Home;

const styles = StyleSheet.create({
    // --- Styles from home.jsx (Base) ---
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        paddingBottom: hp(3),
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    greetingSection: {
        flex: 1,
        paddingRight: wp(4),
        position: 'relative',
    },
    backgroundAnimationContainer: {
        position: 'absolute',
        top: -hp(1),
        left: -wp(2),
        right: -wp(2),
        bottom: -hp(1),
        zIndex: 0,
        opacity: 0.3,
    },
    backgroundAnimation: {
        width: wp(50),
        height: hp(8),
    },
    greetingText: {
        fontSize: hp(2.4),
        fontFamily: 'SFNSDisplay-Bold',
        color: '#0f172a',
        zIndex: 1,
    },
    dateText: {
        fontSize: hp(1.4),
        fontFamily: 'SFNSText-Regular',
        color: '#64748b',
        marginTop: hp(0.5),
        zIndex: 1,
    },
    headerActions: {
        flexDirection: 'row',
        gap: wp(3),
        alignItems: 'center',
    },
    weatherBadge: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    headerWeatherIcon: {
        width: wp(9),
        height: wp(9),
    },
    profileBadge: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    profileIcon: {
        width: wp(8),
        height: wp(8),
    },
    container: {
        paddingTop: hp(2),
        paddingHorizontal: wp(5),
        paddingBottom: hp(15),
        gap: hp(2.5),
    },
    loadingCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: wp(6),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
    weatherCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: wp(5),
        borderWidth: 1,
        borderColor: 'rgba(22, 163, 74, 0.1)',
        shadowColor: '#16a34a',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    weatherHeader: {
        marginBottom: hp(2),
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wp(2),
    },
    locationIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    locationText: {
        fontSize: hp(1.9),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.textDark, // Using theme color for consistency
        marginBottom: hp(0.5),
    },
    lastUpdated: {
        fontSize: hp(1.4),
        fontFamily: 'SFNSText-Regular',
        color: theme.colors.textLight, // Using theme color for consistency
    },
    weatherMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(2.5),
        paddingVertical: hp(2),
    },
    temperatureSection: {
        flex: 1,
    },
    temperature: {
        fontSize: hp(7),
        fontFamily: 'SFNSDisplay-Heavy',
        color: '#16a34a',
        lineHeight: hp(7),
        marginBottom: hp(0.5),
    },
    temperatureDetails: {
        gap: hp(0.3),
    },
    condition: {
        fontSize: hp(1.9),
        fontFamily: 'SFNSDisplay-Bold',
        color: '#0f172a',
        textTransform: 'capitalize',
    },
    feelsLike: {
        fontSize: hp(1.4),
        fontFamily: 'SFNSText-Regular',
        color: '#64748b',
    },
    weatherIconSection: {
        width: wp(22),
        height: wp(22),
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainWeatherIcon: {
        width: wp(20),
        height: wp(20),
    },
    weatherMetrics: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingTop: hp(2),
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: hp(1.5),
    },
    metricItem: {
        alignItems: 'center',
        width: wp(16),
    },
    metricIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hp(0.5),
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    metricLabel: {
        fontSize: hp(1.2),
        fontFamily: 'SFNSText-Regular',
        color: '#64748b',
        marginBottom: hp(0.3),
    },
    metricValue: {
        fontSize: hp(1.5),
        fontFamily: 'SFNSDisplay-Bold',
        color: '#0f172a',
    },
    actionsSection: {
        gap: hp(1.5),
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: wp(4),
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#bbf7d0',
        marginRight: wp(3),
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: hp(1.6),
        fontFamily: 'SFNSDisplay-Bold',
        color: '#0f172a',
        marginBottom: hp(0.2),
    },
    actionSubtitle: {
        fontSize: hp(1.3),
        fontFamily: 'SFNSText-Regular',
        color: '#64748b',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: wp(4),
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
        shadowColor: '#dc2626',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    logoutIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fecaca',
        marginRight: wp(3),
    },
    logoutTitle: {
        fontSize: hp(1.6),
        fontFamily: 'SFNSDisplay-Bold',
        color: '#dc2626',
        marginBottom: hp(0.2),
    },
    logoutSubtitle: {
        fontSize: hp(1.3),
        fontFamily: 'SFNSText-Regular',
        color: '#991b1b',
    },

    // --- Styles from prevHome.jsx (Merged IoT Section) ---
    sectionTitle: {
        fontSize: hp(2.2),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.textDark,
        marginBottom: hp(2),
        textAlign: 'center',
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
    loadingAnimation: {
        width: wp(20),
        height: wp(20),
    },
    loadingText: {
        fontSize: hp(1.8),
        fontFamily: 'SFNSText-Medium',
        color: theme.colors.textLight,
        marginTop: hp(1),
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
    iotSingleCard: {
        backgroundColor: 'rgba(255,255,255,0.98)',
        borderRadius: 18,
        padding: wp(4),
        borderWidth: 1,
        borderColor: 'rgba(80,200,120,0.08)',
        marginBottom: hp(2),
        shadowColor: 'rgb(2,57,18)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 10,
    },
    iotSingleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    iotSingleBody: {
        // main body
    },
    iotRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rowRight: {
        width: wp(36),
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    rowIcon: {
        width: wp(24),
        height: wp(24),
        marginRight: wp(3),
    },
    rowText: {
        justifyContent: 'center',
    },
    iotLabel: {
        fontSize: hp(1.4),
        fontFamily: 'SFNSText-Regular',
        color: theme.colors.textLight,
        marginBottom: hp(0.3),
    },
    iotValue: {
        fontSize: hp(2.2),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.textDark,
        marginBottom: hp(0.2),
    },
    iotStatus: {
        fontSize: hp(1.3),
        fontFamily: 'SFNSText-Medium',
        color: theme.colors.textLight,
    },
    smallMetric: {
        alignItems: 'center',
        marginBottom: hp(0.6),
    },
    smallIcon: {
        width: wp(8),
        height: wp(8),
    },
    smallLabel: {
        fontSize: hp(1.2),
        fontFamily: 'SFNSText-Regular',
        color: theme.colors.textLight,
    },
    smallValue: {
        fontSize: hp(1.6),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.textDark,
    },
    iotDivider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.04)',
        marginVertical: hp(1.2),
    },
    iotRowBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bottomItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    healthCheckButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: wp(25),
    },
    healthCheckButtonText: {
        fontSize: hp(1.4),
        fontFamily: 'SFNSDisplay-Bold',
        color: 'white',
    },
    healthCheckModal: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderRadius: 16,
        padding: wp(4),
        marginTop: hp(2),
        borderWidth: 1,
        borderColor: 'rgba(80, 200, 120, 0.2)',
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 5,
    },
    healthCheckHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1.5),
        paddingBottom: hp(1),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    healthCheckTitle: {
        fontSize: hp(2),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.textDark,
    },
    healthCheckClose: {
        fontSize: hp(2.5),
        color: theme.colors.textLight,
        fontFamily: 'SFNSDisplay-Bold',
    },
    overallStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(80, 200, 120, 0.1)',
        padding: wp(3),
        borderRadius: 12,
        marginBottom: hp(1.5),
    },
    overallStatusLabel: {
        fontSize: hp(1.8),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.textDark,
    },
    overallStatusValue: {
        fontSize: hp(1.8),
        fontFamily: 'SFNSDisplay-Bold',
    },
    healthCheckContent: {
        gap: hp(1),
    },
    healthItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp(0.8),
    },
    healthLabel: {
        fontSize: hp(1.6),
        fontFamily: 'SFNSText-Regular',
        color: theme.colors.textDark,
    },
    healthStatus: {
        fontSize: hp(1.6),
        fontFamily: 'SFNSDisplay-Bold',
    },
    healthCheckLoading: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hp(3),
    },
    healthHeartAnimation: {
        width: wp(40),
        height: wp(40),
    },
    checkingText: {
        fontSize: hp(2),
        fontFamily: 'SFNSDisplay-Bold',
        color: theme.colors.primary,
        marginTop: hp(2),
        marginBottom: hp(1.5),
    },
    sensorCheckList: {
        alignItems: 'flex-start',
        gap: hp(0.8),
    },
    sensorCheckItem: {
        fontSize: hp(1.6),
        fontFamily: 'SFNSText-Regular',
        color: theme.colors.textLight,
    },
    iotError: {
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
});