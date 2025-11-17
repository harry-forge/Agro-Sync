// Test script to check if the market API is returning data
const API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = '579b464db66ec23bdd000001beb77a6c77b64c884b816bcbd6ae14cb';

async function testMarketAPI() {
    try {
        console.log('🔍 Testing Market API...');
        console.log('API Key:', API_KEY);
        console.log('Base URL:', API_BASE_URL);
        console.log('');

        // Test 1: Basic API call
        const queryParams = new URLSearchParams({
            'api-key': API_KEY,
            format: 'json',
            limit: '5' // Small limit for testing
        });

        const url = `${API_BASE_URL}?${queryParams.toString()}`;
        console.log('📡 Making request to:', url);
        console.log('');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('📊 Response Status:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('✅ API Response received!');
        console.log('📈 Response details:');
        console.log('  - Records count:', data.records?.length || 0);
        console.log('  - Total records:', data.total || 'Not specified');
        console.log('  - Count:', data.count || 'Not specified');
        console.log('  - Field names:', data.field_names || 'Not available');
        console.log('');

        if (data.records && data.records.length > 0) {
            console.log('📋 Sample record:');
            console.log(JSON.stringify(data.records[0], null, 2));
            console.log('');
            
            console.log('🎯 Key fields in first record:');
            const firstRecord = data.records[0];
            console.log('  - State:', firstRecord.state);
            console.log('  - District:', firstRecord.district);
            console.log('  - Market:', firstRecord.market);
            console.log('  - Commodity:', firstRecord.commodity);
            console.log('  - Min Price:', firstRecord.min_price);
            console.log('  - Max Price:', firstRecord.max_price);
            console.log('  - Modal Price:', firstRecord.modal_price);
            console.log('  - Arrival Date:', firstRecord.arrival_date);
        } else {
            console.log('⚠️  No records found in response');
            if (data.error) {
                console.log('❌ API Error:', data.error);
            }
        }

        return {
            success: true,
            recordCount: data.records?.length || 0,
            sampleData: data.records?.[0] || null
        };

    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test 2: Check API with filters
async function testWithFilters() {
    try {
        console.log('\n🔍 Testing API with state filter...');
        
        const queryParams = new URLSearchParams({
            'api-key': API_KEY,
            format: 'json',
            limit: '3',
            'filters[state]': 'Maharashtra'
        });

        const url = `${API_BASE_URL}?${queryParams.toString()}`;
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Filtered results count:', data.records?.length || 0);
            if (data.records?.[0]) {
                console.log('📍 Sample filtered record state:', data.records[0].state);
            }
        } else {
            console.log('❌ Filtered request failed:', response.status);
        }
        
    } catch (error) {
        console.log('❌ Filter test failed:', error.message);
    }
}

// Run the tests
async function runAllTests() {
    console.log('🚀 Starting Market API Tests...\n');
    
    const result = await testMarketAPI();
    await testWithFilters();
    
    console.log('\n📊 Test Summary:');
    console.log('API Status:', result.success ? '✅ Working' : '❌ Failed');
    if (result.success) {
        console.log('Data Available:', result.recordCount > 0 ? '✅ Yes' : '⚠️ No records');
    } else {
        console.log('Error:', result.error);
    }
    
    console.log('\n🎉 Test completed!');
}

runAllTests();