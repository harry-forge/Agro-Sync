import * as Location from 'expo-location';
import { createContext, useContext, useEffect, useState } from 'react';
import { weatherService } from '../services/weatherService';

const LocationContext = createContext({});

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within LocationProvider');
    }
    return context;
};

export const LocationProvider = ({ children }) => {
    const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });
    const [locationInfo, setLocationInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            setLoading(true);
            console.log('Requesting location permissions...');
            
            // Request permissions
            let { status } = await Location.requestForegroundPermissionsAsync();
            console.log('Location permission status:', status);

            if (status !== 'granted') {
                console.log('Permission to access location was denied, using fallback');
                // Fallback to a default location (New Delhi)
                await setFallbackLocation();
                return;
            }

            console.log('Getting current position...');
            // Get current location
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeout: 10000,
            });

            console.log('Got location:', location.coords.latitude, location.coords.longitude);
            const coords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            };
            
            setCoordinates(coords);
            await fetchLocationInfo(coords.latitude, coords.longitude);
            
        } catch (error) {
            console.log('Location error:', error);
            await setFallbackLocation();
        } finally {
            setLoading(false);
        }
    };

    const setFallbackLocation = async () => {
        // Fallback to a default location (New Delhi)
        console.log('Using fallback location: New Delhi');
        const coords = {
            latitude: 28.6139,
            longitude: 77.2090
        };
        setCoordinates(coords);
        await fetchLocationInfo(coords.latitude, coords.longitude);
    };

    const fetchLocationInfo = async (lat, lon) => {
        try {
            const result = await weatherService.getCurrentWeather(lat, lon);
            if (result.success) {
                setLocationInfo({
                    name: result.data.location.name,
                    region: result.data.location.region,
                    country: result.data.location.country,
                    state: result.data.location.region, // Using region as state
                    district: result.data.location.name, // Using name as district approximation
                });
                console.log('Location info set:', result.data.location);
            }
        } catch (error) {
            console.error('Error fetching location info:', error);
        }
    };

    const refreshLocation = async () => {
        await getCurrentLocation();
    };

    const value = {
        coordinates,
        locationInfo,
        loading,
        refreshLocation,
        hasLocation: coordinates.latitude !== null && coordinates.longitude !== null
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};

export default LocationContext;