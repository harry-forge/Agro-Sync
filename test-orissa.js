// Test to check for Orissa/Odisha data in the market price API
const API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = '579b464db66ec23bdd000001bc96414976a7475e48eb5efbbb1c9496';

async function testOrissaData() {
    try {
        console.log('🧪 Testing Market Price API for Orissa/Odisha...');
        
        // Test 1: Search for "Orissa"
        console.log('\n1️⃣ Testing filter for "Orissa":');
        const queryParams1 = new URLSearchParams({
            'api-key': API_KEY,
            format: 'json',
            limit: '10',
            'filters[state]': 'Orissa'
        });

        const url1 = `${API_BASE_URL}?${queryParams1.toString()}`;
        console.log('🌐 Request URL:', url1);
        
        const response1 = await fetch(url1);
        const data1 = await response1.json();
        
        console.log('📡 Response:', {
            status: response1.status,
            records: data1.records?.length || 0,
            total: data1.total,
            error: data1.error
        });
        
        if (data1.records && data1.records.length > 0) {
            console.log('✅ Found Orissa data:', data1.records[0]);
        }
        
        // Test 2: Search for "Odisha"
        console.log('\n2️⃣ Testing filter for "Odisha":');
        const queryParams2 = new URLSearchParams({
            'api-key': API_KEY,
            format: 'json',
            limit: '10',
            'filters[state]': 'Odisha'
        });

        const url2 = `${API_BASE_URL}?${queryParams2.toString()}`;
        console.log('🌐 Request URL:', url2);
        
        const response2 = await fetch(url2);
        const data2 = await response2.json();
        
        console.log('📡 Response:', {
            status: response2.status,
            records: data2.records?.length || 0,
            total: data2.total,
            error: data2.error
        });
        
        if (data2.records && data2.records.length > 0) {
            console.log('✅ Found Odisha data:', data2.records[0]);
        }
        
        // Test 3: Get all available states to see what Orissa is called
        console.log('\n3️⃣ Getting all available states to find Orissa/Odisha:');
        const queryParams3 = new URLSearchParams({
            'api-key': API_KEY,
            format: 'json',
            limit: '100'
        });

        const url3 = `${API_BASE_URL}?${queryParams3.toString()}`;
        const response3 = await fetch(url3);
        const data3 = await response3.json();
        
        if (data3.records) {
            const states = [...new Set(data3.records.map(item => item.state))].filter(Boolean);
            console.log('📊 Available states containing "Or" or "Od":', 
                states.filter(state => 
                    state.toLowerCase().includes('or') || 
                    state.toLowerCase().includes('od')
                )
            );
            
            console.log('📊 All available states (first 20):', states.slice(0, 20));
        }
        
        // Test 4: Search for partial match
        console.log('\n4️⃣ Testing search in commodity/market names for Orissa terms:');
        const sampleData = data3.records?.slice(0, 50) || [];
        const orissaRelated = sampleData.filter(item => 
            (item.state && (item.state.toLowerCase().includes('or') || item.state.toLowerCase().includes('od'))) ||
            (item.district && (item.district.toLowerCase().includes('or') || item.district.toLowerCase().includes('od'))) ||
            (item.market && (item.market.toLowerCase().includes('or') || item.market.toLowerCase().includes('od')))
        );
        
        console.log('🔍 Found Orissa/Odisha related records:', orissaRelated.length);
        if (orissaRelated.length > 0) {
            console.log('📝 Sample:', orissaRelated[0]);
        }
        
    } catch (error) {
        console.error('💥 Test Error:', error);
    }
}

// Run the test
testOrissaData();