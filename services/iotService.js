// IoT Device Service
class IoTService {
    constructor() {
        this.baseUrl = 'https://iot-device-backend-dguk.onrender.com';
        // this.baseUrl = 'https://mocki.io/v1/1588969d-1261-4a66-a509-2ce3bb95bd8a';
    }

    async getData() {
        try {
            console.log('Fetching IoT data...');
            const response = await fetch(`${this.baseUrl}/data`, {
            //     const response = await fetch(`${this.baseUrl}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('IoT Data Response:', data);

            return {
                success: true,
                data: data
            };
        } catch (error) {
            console.error('IoT Service Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch IoT data'
            };
        }
    }

    // Helper methods to format data
    formatTemperature(temp) {
        return `${Math.round(temp)}°C`;
    }

    formatHumidity(humidity) {
        return `${Math.round(humidity)}%`;
    }

    formatSoilMoisture(soil) {
        // Convert soil sensor reading to percentage (0-4095 range)
       return `${Math.round(soil)}%`;
    }

    formatLightLevel(light) {
        return light || 'Unknown';
    }

    formatRainLevel(rain) {
        // Rain sensor: higher values typically mean less rain
        if (rain > 3500) return 'No Rain';
        if (rain > 2500) return 'Light Rain';
        if (rain > 1500) return 'Moderate Rain';
        return 'Heavy Rain';
    }

    // Get sensor status colors
    getTemperatureStatus(temp) {
        if (temp < 10) return { status: 'Cold', color: '#64B5F6' };
        if (temp < 25) return { status: 'Optimal', color: '#4CAF50' };
        if (temp < 35) return { status: 'Warm', color: '#FF9800' };
        return { status: 'Hot', color: '#F44336' };
    }

    getHumidityStatus(humidity) {
        if (humidity < 30) return { status: 'Low', color: '#FF9800' };
        if (humidity < 70) return { status: 'Optimal', color: '#4CAF50' };
        return { status: 'High', color: '#2196F3' };
    }

    getSoilMoistureStatus(soil) {
        const percentage = (soil / 4095) * 100;
        if (percentage < 20) return { status: 'Dry', color: '#F44336' };
        if (percentage < 60) return { status: 'Optimal', color: '#4CAF50' };
        return { status: 'Wet', color: '#2196F3' };
    }

    getLightStatus(light) {
        const status = light?.toLowerCase() || 'unknown';
        switch (status) {
            case 'bright':
                return { status: 'Bright', color: '#FFD54F' };
            case 'moderate':
                return { status: 'Moderate', color: '#FFA726' };
            case 'dark':
                return { status: 'Dark', color: '#90A4AE' };
            default:
                return { status: 'Unknown', color: '#BDBDBD' };
        }
    }

    getRainStatus(rain) {
        if (rain > 3500) return { status: 'Clear', color: '#4CAF50' };
        if (rain > 2500) return { status: 'Light Rain', color: '#2196F3' };
        if (rain > 1500) return { status: 'Moderate Rain', color: '#FF9800' };
        return { status: 'Heavy Rain', color: '#F44336' };
    }
}

export const iotService = new IoTService();