const API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = '579b464db66ec23bdd000001bc96414976a7475e48eb5efbbb1c9496';

class MarketPriceService {
    constructor() {
        this.apiKey = API_KEY;
        this.baseUrl = API_BASE_URL;
    }

    // Get market prices for crops
    async getMarketPrices(params = {}) {
        try {
            const {
                limit = 200,  // Increased from 10 to 200 for better geographic coverage
                offset = 0,
                state = '',
                district = '',
                market = '',
                commodity = ''
            } = params;

            const queryParams = new URLSearchParams({
                'api-key': this.apiKey,
                format: 'json',
                limit: limit.toString(),
                offset: offset.toString()
            });

            // Add optional filters
            if (state) queryParams.append('filters[state]', state);
            if (district) queryParams.append('filters[district]', district);
            if (market) queryParams.append('filters[market]', market);
            if (commodity) queryParams.append('filters[commodity]', commodity);

            const url = `${this.baseUrl}?${queryParams.toString()}`;
            console.log('🌐 Fetching market prices from:', url);
            console.log('📋 Request params:', { limit, offset, state, district, market, commodity });

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                console.error('❌ HTTP Error:', response.status, response.statusText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📡 Market price API response:', {
                recordsCount: data.records?.length || 0,
                total: data.total || 0,
                count: data.count || 0,
                firstRecord: data.records?.[0],
                error: data.error
            });

            return {
                success: true,
                data: data.records || [],
                total: data.total || 0,
                count: data.count || 0
            };

        } catch (error) {
            console.error('Market price API error:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    // Get unique states from the data
    async getStates() {
        try {
            const result = await this.getMarketPrices({ limit: 500 });
            if (result.success) {
                const states = [...new Set(result.data.map(item => item.state))].filter(Boolean);
                console.log('Available states in API:', states);
                return { success: true, data: states.sort() };
            }
            return { success: false, data: [] };
        } catch (error) {
            console.error('Error fetching states:', error);
            return { success: false, data: [] };
        }
    }

    // Get unique districts from the data
    async getDistricts() {
        try {
            const result = await this.getMarketPrices({ limit: 200 });
            if (result.success) {
                const districts = [...new Set(result.data.map(item => item.district))].filter(Boolean);
                console.log('Available districts in API:', districts.slice(0, 10));
                return { success: true, data: districts.sort() };
            }
            return { success: false, data: [] };
        } catch (error) {
            console.error('Error fetching districts:', error);
            return { success: false, data: [] };
        }
    }

    // Find best matching location from API data
    findBestLocationMatch(userLocation, availableLocations) {
        if (!userLocation || !availableLocations) return null;
        
        const userLoc = userLocation.toLowerCase().trim();
        
        // Exact match first
        const exactMatch = availableLocations.find(loc => 
            loc.toLowerCase().trim() === userLoc
        );
        if (exactMatch) return exactMatch;
        
        // Partial match
        const partialMatch = availableLocations.find(loc => 
            loc.toLowerCase().includes(userLoc) || userLoc.includes(loc.toLowerCase())
        );
        if (partialMatch) return partialMatch;
        
        // Fuzzy match (first few characters)
        const fuzzyMatch = availableLocations.find(loc => {
            const locLower = loc.toLowerCase().trim();
            return locLower.startsWith(userLoc.substring(0, 3)) || 
                   userLoc.startsWith(locLower.substring(0, 3));
        });
        
        return fuzzyMatch || null;
    }

    // Get unique commodities from the data
    async getCommodities() {
        try {
            const result = await this.getMarketPrices({ limit: 100 });
            if (result.success) {
                const commodities = [...new Set(result.data.map(item => item.commodity))].filter(Boolean);
                return { success: true, data: commodities.sort() };
            }
            return { success: false, data: [] };
        } catch (error) {
            console.error('Error fetching commodities:', error);
            return { success: false, data: [] };
        }
    }

    // Format price data for display
    formatPriceData(record) {
        return {
            id: `${record.state}_${record.district}_${record.market}_${record.commodity}_${record.arrival_date}`,
            commodity: record.commodity || 'N/A',
            variety: record.variety || 'N/A',
            state: record.state || 'N/A',
            district: record.district || 'N/A',
            market: record.market || 'N/A',
            arrivalDate: record.arrival_date || 'N/A',
            minPrice: record.min_price ? `₹${record.min_price}` : 'N/A',
            maxPrice: record.max_price ? `₹${record.max_price}` : 'N/A',
            modalPrice: record.modal_price ? `₹${record.modal_price}` : 'N/A',
            priceUnit: record.price_unit || 'Quintal'
        };
    }

    // Get price trend for a specific commodity
    async getPriceTrend(commodity, limit = 20) {
        try {
            const result = await this.getMarketPrices({ 
                commodity: commodity, 
                limit: limit 
            });
            
            if (result.success) {
                const formattedData = result.data.map(record => this.formatPriceData(record));
                return { success: true, data: formattedData };
            }
            
            return { success: false, data: [] };
        } catch (error) {
            console.error('Error fetching price trend:', error);
            return { success: false, data: [] };
        }
    }

    // Get market prices near user's location with improved matching
    async getNearbyMarketPrices(locationInfo, limit = 20) {
        try {
            console.log('User location info:', locationInfo);
            
            if (!locationInfo) {
                console.log('No location info, fetching general market prices');
                return await this.getMarketPrices({ limit });
            }

            let result;
            let isLocal = false;
            let matchedLocation = null;
            
            // Get available states and districts for matching
            const statesResult = await this.getStates();
            const districtsResult = await this.getDistricts();
            
            // Try to match user's state with available states
            if (locationInfo.state && statesResult.success) {
                matchedLocation = this.findBestLocationMatch(locationInfo.state, statesResult.data);
                
                if (matchedLocation) {
                    console.log(`Matched user state "${locationInfo.state}" with API state "${matchedLocation}"`);
                    result = await this.getMarketPrices({ 
                        state: matchedLocation,
                        limit: limit 
                    });
                    
                    if (result.success && result.data.length > 0) {
                        console.log(`Found ${result.data.length} markets in state: ${matchedLocation}`);
                        isLocal = true;
                    }
                } else {
                    console.log(`No matching state found for "${locationInfo.state}"`);
                    console.log('Available states sample:', statesResult.data.slice(0, 5));
                }
            }
            
            // If no state match, try district matching
            if ((!result || !result.success || result.data.length === 0) && locationInfo.district && districtsResult.success) {
                matchedLocation = this.findBestLocationMatch(locationInfo.district, districtsResult.data);
                
                if (matchedLocation) {
                    console.log(`Matched user district "${locationInfo.district}" with API district "${matchedLocation}"`);
                    result = await this.getMarketPrices({ 
                        district: matchedLocation,
                        limit: limit 
                    });
                    
                    if (result.success && result.data.length > 0) {
                        console.log(`Found ${result.data.length} markets in district: ${matchedLocation}`);
                        isLocal = true;
                    }
                } else {
                    console.log(`No matching district found for "${locationInfo.district}"`);
                    console.log('Available districts sample:', districtsResult.data.slice(0, 5));
                }
            }
            
            // Try exact location names as fallback
            if (!result || !result.success || result.data.length === 0) {
                console.log('Trying exact location names as fallback...');
                
                // Try city name as state
                if (locationInfo.city) {
                    console.log('Trying city as state:', locationInfo.city);
                    result = await this.getMarketPrices({ 
                        state: locationInfo.city,
                        limit: limit 
                    });
                    
                    if (result.success && result.data.length > 0) {
                        console.log(`Found ${result.data.length} markets using city as state`);
                        isLocal = true;
                        matchedLocation = locationInfo.city;
                    }
                }
                
                // Try city name as district
                if ((!result || !result.success || result.data.length === 0) && locationInfo.city) {
                    console.log('Trying city as district:', locationInfo.city);
                    result = await this.getMarketPrices({ 
                        district: locationInfo.city,
                        limit: limit 
                    });
                    
                    if (result.success && result.data.length > 0) {
                        console.log(`Found ${result.data.length} markets using city as district`);
                        isLocal = true;
                        matchedLocation = locationInfo.city;
                    }
                }
            }
            
            // If still no data, fetch general market prices
            if (!result || !result.success || result.data.length === 0) {
                console.log('No local data found, fetching general market prices');
                result = await this.getMarketPrices({ limit });
                isLocal = false;
                matchedLocation = null;
            }
            
            if (result.success) {
                const formattedData = result.data.map(record => this.formatPriceData(record));
                return {
                    success: true,
                    data: formattedData,
                    isLocal,
                    locationUsed: matchedLocation
                };
            }
            
            return { success: false, data: [], isLocal: false };
        } catch (error) {
            console.error('Error fetching nearby market prices:', error);
            return { success: false, data: [], isLocal: false };
        }
    }

    // Calculate distance between two coordinates (Haversine formula)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in kilometers
        return distance;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }
}

export const marketPriceService = new MarketPriceService();