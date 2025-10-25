// Weather API Service
import Constants from 'expo-constants';

// Try multiple ways to get the API key
const getApiKey = () => {
    // Method 1: From Expo Constants (app.config.js)
    if (Constants.expoConfig?.extra?.weatherApiKey) {
        return Constants.expoConfig.extra.weatherApiKey;
    }
    
    // Method 2: From process.env (direct access)
    if (process.env.EXPO_PUBLIC_WEATHER_API_KEY) {
        return process.env.EXPO_PUBLIC_WEATHER_API_KEY;
    }
    
    // Method 3: Fallback to hardcoded (not recommended for production)
    return '3b0832ddf6dc414c815190329252410';
};

const WEATHER_API_KEY = getApiKey();
const BASE_URL = 'https://api.weatherapi.com/v1';

export const weatherService = {
    // Test API key
    testApiKey: async () => {
        try {
            console.log('Testing API key:', WEATHER_API_KEY);
            const response = await fetch(
                `${BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=London&aqi=no`
            );
            
            const responseText = await response.text();
            console.log('Test API Response:', response.status, responseText);
            
            return {
                success: response.ok,
                status: response.status,
                data: responseText
            };
        } catch (error) {
            console.error('API Test error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Get current weather by coordinates
    getCurrentWeather: async (latitude, longitude) => {
        try {
            console.log('API Key being used:', WEATHER_API_KEY ? 'Present' : 'Missing');
            console.log('Making request to:', `${BASE_URL}/current.json?key=${WEATHER_API_KEY?.substring(0, 8)}...&q=${latitude},${longitude}&aqi=no`);
            
            const response = await fetch(
                `${BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&aqi=no`
            );
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response:', response.status, errorText);
                throw new Error(`Weather API error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Weather service error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Get weather forecast (optional for future use)
    getForecast: async (latitude, longitude, days = 3) => {
        try {
            const response = await fetch(
                `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${latitude},${longitude}&days=${days}&aqi=no&alerts=no`
            );
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const data = await response.json();
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Weather forecast service error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};