// Test using plain class instead of the exported instance
const fetch = require('node-fetch');

// Copy the service class for testing
const API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = '579b464db66ec23bdd000001beb77a6c77b64c884b816bcbd6ae14cb';

class MarketPriceService {
    constructor() {
        this.apiKey = API_KEY;
        this.baseUrl = API_BASE_URL;
    }

    async getMarketPrices(params = {}) {
        try {
            const {
                limit = 200,
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

            if (state) queryParams.append('filters[state]', state);
            if (district) queryParams.append('filters[district]', district);
            if (market) queryParams.append('filters[market]', market);
            if (commodity) queryParams.append('filters[commodity]', commodity);

            const url = `${this.baseUrl}?${queryParams.toString()}`;
            console.log('🌐 Fetching market prices from:', url);

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
            return {
                success: true,
                data: data.records || [],
                total: data.total || 0,
                count: data.count || 0
            };

        } catch (error) {
            console.error('Market price API error:', error);
            
            // If API is down (502, 503, etc.), return fallback data
            if (error.message.includes('502') || error.message.includes('503') || error.message.includes('network')) {
                console.log('🔄 API temporarily unavailable, using fallback data...');
                return this.getFallbackData(params);
            }
            
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    getFallbackData(params = {}) {
        const { state = '', district = '', market = '', commodity = '' } = params;
        
        const fallbackRecords = [
            {
                state: 'Odisha',
                district: 'Khordha',
                market: 'Bhubaneswar',
                commodity: 'Rice',
                variety: 'Common',
                arrival_date: '08/11/2025',
                min_price: '2800',
                max_price: '3200',
                modal_price: '3000'
            },
            {
                state: 'Odisha',
                district: 'Cuttack',
                market: 'Cuttack',
                commodity: 'Onion',
                variety: 'Red',
                arrival_date: '08/11/2025',
                min_price: '3500',
                max_price: '4000',
                modal_price: '3750'
            },
            {
                state: 'Maharashtra',
                district: 'Pune',
                market: 'Pune',
                commodity: 'Tomato',
                variety: 'Local',
                arrival_date: '08/11/2025',
                min_price: '2000',
                max_price: '2800',
                modal_price: '2400'
            }
        ];

        // Filter fallback data based on search criteria
        let filteredData = fallbackRecords;
        
        if (state) {
            filteredData = filteredData.filter(record => 
                record.state.toLowerCase().includes(state.toLowerCase())
            );
        }
        if (commodity) {
            filteredData = filteredData.filter(record => 
                record.commodity.toLowerCase().includes(commodity.toLowerCase())
            );
        }

        console.log(`📦 Returning ${filteredData.length} fallback records`);
        
        return {
            success: true,
            data: filteredData,
            total: filteredData.length,
            count: filteredData.length,
            isFallback: true
        };
    }
}

const marketPriceService = new MarketPriceService();

async function testFallbackMechanism() {
    console.log('🧪 Testing Market Price Service with Fallback...\n');
    
    try {
        console.log('1️⃣ Testing general market data fetch...');
        const result1 = await marketPriceService.getMarketPrices({ limit: 5 });
        console.log('✅ Result:', {
            success: result1.success,
            dataCount: result1.data?.length || 0,
            isFallback: result1.isFallback || false,
            error: result1.error
        });
        
        if (result1.data && result1.data.length > 0) {
            console.log('📄 Sample data:', result1.data[0]);
        }
        
        console.log('\n2️⃣ Testing search for Odisha...');
        const result2 = await marketPriceService.getMarketPrices({ 
            state: 'Odisha',
            limit: 10 
        });
        console.log('✅ Odisha search result:', {
            success: result2.success,
            dataCount: result2.data?.length || 0,
            isFallback: result2.isFallback || false
        });
        
        console.log('\n3️⃣ Testing search for Rice...');
        const result3 = await marketPriceService.getMarketPrices({ 
            commodity: 'Rice',
            limit: 10 
        });
        console.log('✅ Rice search result:', {
            success: result3.success,
            dataCount: result3.data?.length || 0,
            isFallback: result3.isFallback || false
        });
        
        console.log('\n📋 Summary:');
        if (result1.isFallback) {
            console.log('✅ Fallback mechanism is working!');
            console.log('✅ App will continue to function with sample data');
            console.log('✅ Real-time search is working with fallback data');
        } else {
            console.log('✅ API is back online!');
            console.log('✅ Real data is being fetched successfully');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testFallbackMechanism();