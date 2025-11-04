// Simple test to check if the market price API is working
const API_BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = '579b464db66ec23bdd000001bc96414976a7475e48eb5efbbb1c9496';

async function testAPI() {
    try {
        console.log('🧪 Testing Market Price API...');
        
        const queryParams = new URLSearchParams({
            'api-key': API_KEY,
            format: 'json',
            limit: '5'
        });

        const url = `${API_BASE_URL}?${queryParams.toString()}`;
        console.log('🌐 Request URL:', url);
        
        const response = await fetch(url);
        
        console.log('📡 Response Status:', response.status, response.statusText);
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status);
            return;
        }
        
        const data = await response.json();
        
        console.log('📊 API Response:', {
            records: data.records?.length || 0,
            total: data.total,
            count: data.count,
            error: data.error
        });
        
        if (data.records && data.records.length > 0) {
            console.log('✅ Sample Record:', data.records[0]);
            console.log('📝 Available Fields:', Object.keys(data.records[0]));
        } else {
            console.log('❌ No records found');
        }
        
    } catch (error) {
        console.error('💥 Test Error:', error);
    }
}

// Run the test
testAPI();