const fetch = require('node-fetch');

async function testAlternateApproaches() {
    console.log('🔍 Testing alternate API approaches...\n');
    
    // Test 1: Original API with different parameters
    console.log('1️⃣ Testing original API with minimal parameters...');
    try {
        const response1 = await fetch('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001bc96414976a7475e48eb5efbbb1c9496&format=json&limit=1', {
            timeout: 10000
        });
        console.log('Status:', response1.status, response1.statusText);
    } catch (error) {
        console.log('❌ Failed:', error.message);
    }
    
    // Test 2: Try without any filters
    console.log('\n2️⃣ Testing base API endpoint...');
    try {
        const response2 = await fetch('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070', {
            timeout: 10000
        });
        console.log('Status:', response2.status, response2.statusText);
    } catch (error) {
        console.log('❌ Failed:', error.message);
    }
    
    // Test 3: Try with different API key format
    console.log('\n3️⃣ Testing with headers...');
    try {
        const response3 = await fetch('https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?format=json&limit=1', {
            headers: {
                'Accept': 'application/json'
            },
            timeout: 10000
        });
        console.log('Status:', response3.status, response3.statusText);
    } catch (error) {
        console.log('❌ Failed:', error.message);
    }
    
    // Test 4: Check if data.gov.in is accessible
    console.log('\n4️⃣ Testing data.gov.in main site...');
    try {
        const response4 = await fetch('https://data.gov.in/', {
            timeout: 10000
        });
        console.log('Status:', response4.status, response4.statusText);
    } catch (error) {
        console.log('❌ Failed:', error.message);
    }
    
    console.log('\n📋 Summary:');
    console.log('The 502 Bad Gateway error indicates:');
    console.log('• The API server is temporarily down');
    console.log('• Server maintenance or overload');
    console.log('• Network issues on the government side');
    console.log('\n💡 Recommendations:');
    console.log('• Try again in a few minutes/hours');
    console.log('• Implement error handling with retry logic');
    console.log('• Consider caching previous API responses');
    console.log('• Add offline mode with sample data');
}

testAlternateApproaches();
