const fetch = require('node-fetch');

const API_KEY = '579b464db66ec23bdd000001beb77a6c77b64c884b816bcbd6ae14cb';
const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

async function testRealTimeSearch(searchTerm) {
    console.log(`\n🔍 Testing real-time search for: "${searchTerm}"`);
    console.log('=' .repeat(50));

    try {
        // Test searching by different parameters
        const searchPromises = [];
        
        // Search by state
        const stateParams = new URLSearchParams({
            'api-key': API_KEY,
            format: 'json',
            limit: '100',
            'filters[state]': searchTerm
        });
        searchPromises.push({
            type: 'State',
            promise: fetch(`${BASE_URL}?${stateParams.toString()}`)
        });

        // Search by district  
        const districtParams = new URLSearchParams({
            'api-key': API_KEY,
            format: 'json',
            limit: '100',
            'filters[district]': searchTerm
        });  
        searchPromises.push({
            type: 'District',
            promise: fetch(`${BASE_URL}?${districtParams.toString()}`)
        });

        // Search by market
        const marketParams = new URLSearchParams({
            'api-key': API_KEY,
            format: 'json',
            limit: '100',
            'filters[market]': searchTerm
        });
        searchPromises.push({
            type: 'Market',
            promise: fetch(`${BASE_URL}?${marketParams.toString()}`)
        });

        // Search by commodity
        const commodityParams = new URLSearchParams({
            'api-key': API_KEY,
            format: 'json',
            limit: '100',
            'filters[commodity]': searchTerm
        });
        searchPromises.push({
            type: 'Commodity',
            promise: fetch(`${BASE_URL}?${commodityParams.toString()}`)
        });

        // Execute all searches
        const results = await Promise.all(
            searchPromises.map(async ({ type, promise }) => {
                try {
                    const response = await promise;
                    const data = await response.json();
                    return {
                        type,
                        success: true,
                        count: data.records ? data.records.length : 0,
                        records: data.records || []
                    };
                } catch (error) {
                    return {
                        type,
                        success: false,
                        error: error.message
                    };
                }
            })
        );

        // Display results
        let totalResults = 0;
        let allRecords = [];
        const seenIds = new Set();

        results.forEach(result => {
            if (result.success) {
                console.log(`📊 ${result.type} search: ${result.count} results`);
                
                // Add unique records
                result.records.forEach(record => {
                    const id = `${record.state}-${record.district}-${record.market}-${record.commodity}-${record.arrival_date}`;
                    if (!seenIds.has(id)) {
                        seenIds.add(id);
                        allRecords.push(record);
                    }
                });
            } else {
                console.log(`❌ ${result.type} search failed: ${result.error}`);
            }
        });

        console.log(`\n🎯 Total unique results: ${allRecords.length}`);
        
        if (allRecords.length > 0) {
            console.log('\n📝 Sample results:');
            allRecords.slice(0, 3).forEach((record, index) => {
                console.log(`${index + 1}. ${record.commodity} - ${record.state}, ${record.district}, ${record.market} (₹${record.min_price}-₹${record.max_price})`);
            });
        }

        return {
            searchTerm,
            totalResults: allRecords.length,
            success: true,
            sampleRecords: allRecords.slice(0, 3)
        };

    } catch (error) {
        console.error('💥 Error in real-time search test:', error);
        return {
            searchTerm,
            success: false,
            error: error.message
        };
    }
}

async function runTests() {
    console.log('🚀 Starting Real-Time Search API Tests');
    console.log('=====================================');

    const searchTerms = ['Odisha', 'Banana', 'Delhi', 'Onion', 'Pune'];
    
    for (const term of searchTerms) {
        const result = await testRealTimeSearch(term);
        
        if (result.success) {
            console.log(`✅ "${term}" search completed: ${result.totalResults} results`);
        } else {
            console.log(`❌ "${term}" search failed: ${result.error}`);
        }
        
        // Add small delay between searches
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

runTests();