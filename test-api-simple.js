const fetch = require('node-fetch');

const API_KEY = '579b464db66ec23bdd000001beb77a6c77b64c884b816bcbd6ae14cb';
const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

async function testAPI() {
    console.log('🔍 Testing Market Price API...');
    console.log('API URL:', BASE_URL);
    console.log('API Key:', API_KEY.substring(0, 10) + '...');
    
    try {
        const url = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=5`;
        console.log('\n📡 Making request to:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Agro-Sync-App/1.0'
            }
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response status text:', response.statusText);
        console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('❌ Error body:', errorText);
            return;
        }
        
        const data = await response.json();
        console.log('✅ Success! Data received:');
        console.log('- Total records in response:', data.records ? data.records.length : 0);
        console.log('- Response structure:', Object.keys(data));
        
        if (data.records && data.records.length > 0) {
            console.log('- First record:', data.records[0]);
        }
        
    } catch (error) {
        console.error('💥 Fetch error:', error.message);
        console.error('💥 Full error:', error);
    }
}

testAPI();