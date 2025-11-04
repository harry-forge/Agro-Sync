import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from "expo-status-bar";
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { marketPriceService } from "../../services/marketPriceService";

const Recommendation = () => {
    const [marketData, setMarketData] = useState([]);
    const [searchResults, setSearchResults] = useState([]); // New state for search results
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false); // New loading state for search
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCommodity, setSelectedCommodity] = useState('');
    const [commodities, setCommodities] = useState([]);
    const [isSearchMode, setIsSearchMode] = useState(false); // New state to track if we're in search mode

    useEffect(() => {
        fetchMarketData();
        fetchCommodities();
    }, []);

    // Debounced search effect for real-time search
    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setIsSearchMode(false);
            setSearchResults([]);
            return;
        }

        const debounceTimer = setTimeout(() => {
            performRealTimeSearch(searchQuery);
        }, 500); // 500ms delay for debouncing

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const fetchMarketData = async () => {
        try {
            setLoading(true);
            
            const result = await marketPriceService.getMarketPrices({
                limit: 50,
                commodity: selectedCommodity
            });

            if (result.success) {
                const formattedData = result.data.map(record => 
                    marketPriceService.formatPriceData(record)
                );
                setMarketData(formattedData);
            } else {
                console.error('❌ Failed to fetch market data:', result.error);
            }
        } catch (error) {
            console.error('💥 Error fetching market data:', error);
        } finally {
            setLoading(false);
        }
    };



    const fetchCommodities = async () => {
        try {
            const result = await marketPriceService.getCommodities();
            if (result.success) {
                setCommodities(result.data.slice(0, 10)); // Get first 10 commodities
            }
        } catch (error) {
            console.error('Error fetching commodities:', error);
        }
    };

    // New function for real-time search
    const performRealTimeSearch = async (query) => {
        if (!query || query.trim().length < 2) {
            setIsSearchMode(false);
            setSearchResults([]);
            return;
        }

        try {
            setSearchLoading(true);
            setIsSearchMode(true);

            // Try searching by different parameters
            const searchPromises = [];
            
            // Search by state (try both exact match and partial)
            searchPromises.push(
                marketPriceService.getMarketPrices({
                    state: query,
                    limit: 100
                })
            );

            // Search by district
            searchPromises.push(
                marketPriceService.getMarketPrices({
                    district: query,
                    limit: 100
                })
            );

            // Search by market
            searchPromises.push(
                marketPriceService.getMarketPrices({
                    market: query,
                    limit: 100
                })
            );

            // Search by commodity
            searchPromises.push(
                marketPriceService.getMarketPrices({
                    commodity: query,
                    limit: 100
                })
            );

            const results = await Promise.all(searchPromises);
            
            // Combine all results and remove duplicates
            const allResults = [];
            const seenIds = new Set();

            results.forEach(result => {
                if (result.success && result.data) {
                    result.data.forEach(record => {
                        const id = `${record.state}-${record.district}-${record.market}-${record.commodity}-${record.variety}-${record.arrival_date}-${record.min_price}-${record.max_price}`;
                        if (!seenIds.has(id)) {
                            seenIds.add(id);
                            allResults.push(marketPriceService.formatPriceData(record));
                        }
                    });
                }
            });

            setSearchResults(allResults);
            
        } catch (error) {
            console.error('💥 Error in real-time search:', error);
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        // Clear search and filters on refresh
        setSearchQuery('');
        setSelectedCommodity('');
        setIsSearchMode(false);
        setSearchResults([]);
        
        await fetchMarketData();
        setRefreshing(false);
    };

    const filterData = () => {
        // If we're in search mode, use search results instead of filtering static data
        if (isSearchMode && searchQuery.trim().length >= 2) {
            let filteredData = searchResults;

            // Apply commodity filter to search results if needed
            if (selectedCommodity && selectedCommodity.trim()) {
                filteredData = searchResults.filter(item =>
                    item.commodity && item.commodity.toLowerCase().includes(selectedCommodity.toLowerCase())
                );
            }

            return filteredData;
        }

        // Original filtering logic for when not in search mode - only market data now
        let filteredData = marketData;

        // Apply commodity filter to static data
        if (selectedCommodity && selectedCommodity.trim()) {
            filteredData = filteredData.filter(item =>
                item.commodity && item.commodity.toLowerCase().includes(selectedCommodity.toLowerCase())
            );
        }
        
        return filteredData;
    };

    const handleCommodityFilter = async (commodity) => {
        if (selectedCommodity === commodity) {
            // If same commodity is selected, clear the filter
            setSelectedCommodity('');
            return;
        }
        
        setSelectedCommodity(commodity);
        
        // Fetch filtered data
        setLoading(true);
        
        const result = await marketPriceService.getMarketPrices({
            limit: 100,
            commodity: commodity
        });

        if (result.success) {
            const formattedData = result.data.map(record => 
                marketPriceService.formatPriceData(record)
            );
            setMarketData(formattedData);
        }
        setLoading(false);
    };

    const renderMarketItem = ({ item }) => (
        <View style={styles.marketCard}>
            <View style={styles.cardHeader}>
                <View style={styles.commodityInfo}>
                    <Text style={styles.commodityName}>{item.commodity}</Text>
                    <Text style={styles.varietyText}>{item.variety}</Text>
                </View>
                <View style={styles.priceContainer}>
                    <Text style={styles.modalPrice}>{item.modalPrice}</Text>
                    <Text style={styles.priceUnit}>per {item.priceUnit}</Text>
                </View>
            </View>

            <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color={theme.colors.textLight} />
                <Text style={styles.locationText}>
                    {item.market}, {item.district}, {item.state}
                </Text>
            </View>

            <View style={styles.priceRange}>
                <View style={styles.priceRangeItem}>
                    <Text style={styles.priceLabel}>Min Price</Text>
                    <Text style={styles.minPrice}>{item.minPrice}</Text>
                </View>
                <View style={styles.priceRangeItem}>
                    <Text style={styles.priceLabel}>Max Price</Text>
                    <Text style={styles.maxPrice}>{item.maxPrice}</Text>
                </View>
                <View style={styles.priceRangeItem}>
                    <Text style={styles.priceLabel}>Date</Text>
                    <Text style={styles.dateText}>{item.arrivalDate}</Text>
                </View>
            </View>
        </View>
    );

    const renderCommodityFilter = ({ item }) => (
        <Pressable
            style={[
                styles.commodityChip,
                selectedCommodity === item && styles.commodityChipSelected
            ]}
            onPress={() => handleCommodityFilter(item)}
        >
            <Text style={[
                styles.commodityChipText,
                selectedCommodity === item && styles.commodityChipTextSelected
            ]}>
                {item}
            </Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <LottieView
                        source={require('../../assets/animations/nature.json')}
                        style={styles.headerIcon}
                        autoPlay
                        loop
                        speed={0.8}
                    />
                    <View>
                        <Text style={styles.headerTitle}>Market Prices</Text>
                        <Text style={styles.headerSubtitle}>Live crop market rates</Text>
                    </View>
                </View>
            </View>









            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color={theme.colors.textLight} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search crops, states, districts..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={theme.colors.textLight}
                />
                {searchQuery ? (
                    <Pressable onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color={theme.colors.textLight} />
                    </Pressable>
                ) : null}
            </View>

            {/* Results Counter */}
            {(searchQuery || selectedCommodity || isSearchMode) && !searchLoading && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsText}>
                        {filterData().length} results found
                        {isSearchMode && searchQuery && ` for "${searchQuery}"`}
                        {!isSearchMode && searchQuery && ` for "${searchQuery}"`}
                        {selectedCommodity && ` in ${selectedCommodity}`}
                        {isSearchMode && ` (live search)`}
                    </Text>
                </View>
            )}

            {/* Commodity Filters */}
            <View style={styles.filtersSection}>
                <Text style={styles.filtersTitle}>Filter by Commodity</Text>
                <FlatList
                    data={['', ...commodities]} // Empty string for "All" option
                    renderItem={({ item }) => (
                        <Pressable
                            style={[
                                styles.commodityChip,
                                selectedCommodity === item && styles.commodityChipSelected
                            ]}
                            onPress={() => handleCommodityFilter(item)}
                        >
                            <Text style={[
                                styles.commodityChipText,
                                selectedCommodity === item && styles.commodityChipTextSelected
                            ]}>
                                {item || 'All'}
                            </Text>
                        </Pressable>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.commodityFilters}
                />
            </View>

            {/* Market Data List */}
            {searchLoading || (isSearchMode ? false : loading) ? (
                <View style={styles.loadingContainer}>
                    <LottieView
                        source={require('../../assets/animations/loading.json')}
                        style={styles.loadingAnimation}
                        autoPlay
                        loop
                        speed={1.5}
                    />
                    <Text style={styles.loadingText}>
                        {searchLoading 
                            ? `Searching for "${searchQuery}"...` 
                            : `Loading market prices...`
                        }
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filterData()}
                    renderItem={renderMarketItem}
                    keyExtractor={(item, index) => `${item.state}-${item.district}-${item.market}-${item.commodity}-${item.arrivalDate}-${index}`}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <LottieView
                                source={require('../../assets/animations/nature.json')}
                                style={styles.emptyAnimation}
                                autoPlay
                                loop
                                speed={0.5}
                            />
                            <Text style={styles.emptyText}>
                                {searchQuery || selectedCommodity ? 'No results found' : 'No market data available'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {searchQuery || selectedCommodity 
                                    ? `Try a different search term or clear filters` 
                                    : 'Pull down to refresh or try changing location'}
                            </Text>
                            {(searchQuery || selectedCommodity) && (
                                <Pressable 
                                    style={styles.clearFiltersButton}
                                    onPress={() => {
                                        setSearchQuery('');
                                        setSelectedCommodity('');
                                    }}
                                >
                                    <Text style={styles.clearFiltersText}>Clear Filters</Text>
                                </Pressable>
                            )}
                        </View>
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

export default Recommendation;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
        paddingVertical: hp(2),
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        width: wp(12),
        height: wp(12),
        marginRight: wp(3),
    },
    headerTitle: {
        fontSize: hp(2.5),
        fontWeight: '700',
        color: theme.colors.textDark,
    },
    headerSubtitle: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        marginTop: 2,
    },


    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: wp(5),
        marginVertical: hp(1.5),
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.2),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    searchInput: {
        flex: 1,
        marginLeft: wp(2),
        fontSize: hp(1.8),
        color: theme.colors.textDark,
    },
    filtersSection: {
        backgroundColor: 'white',
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    filtersTitle: {
        fontSize: hp(1.6),
        fontWeight: '600',
        color: theme.colors.textDark,
        marginLeft: wp(5),
        marginBottom: hp(1),
    },
    commodityFilters: {
        paddingHorizontal: wp(5),
    },
    commodityChip: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: 20,
        marginRight: wp(2),
    },
    commodityChipSelected: {
        backgroundColor: theme.colors.primary,
    },
    commodityChipText: {
        fontSize: hp(1.4),
        color: theme.colors.textDark,
        fontWeight: '500',
    },
    commodityChipTextSelected: {
        color: 'white',
    },
    listContainer: {
        padding: wp(5),
    },
    marketCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: wp(4),
        marginBottom: hp(2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: hp(1.5),
    },
    commodityInfo: {
        flex: 1,
    },
    commodityName: {
        fontSize: hp(2),
        fontWeight: '700',
        color: theme.colors.textDark,
        marginBottom: 4,
    },
    varietyText: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    modalPrice: {
        fontSize: hp(2.2),
        fontWeight: '700',
        color: theme.colors.primary,
    },
    priceUnit: {
        fontSize: hp(1.2),
        color: theme.colors.textLight,
        marginTop: 2,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1.5),
    },
    locationText: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        marginLeft: wp(1),
        flex: 1,
    },
    priceRange: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: hp(1.5),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    priceRangeItem: {
        alignItems: 'center',
        flex: 1,
    },
    priceLabel: {
        fontSize: hp(1.2),
        color: theme.colors.textLight,
        marginBottom: 4,
    },
    minPrice: {
        fontSize: hp(1.6),
        fontWeight: '600',
        color: '#ff6b6b',
    },
    maxPrice: {
        fontSize: hp(1.6),
        fontWeight: '600',
        color: '#51cf66',
    },
    dateText: {
        fontSize: hp(1.4),
        fontWeight: '500',
        color: theme.colors.textDark,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: hp(10),
    },
    loadingAnimation: {
        width: wp(20),
        height: wp(20),
    },
    loadingText: {
        fontSize: hp(1.8),
        color: theme.colors.textLight,
        marginTop: hp(2),
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: hp(10),
    },
    emptyAnimation: {
        width: wp(40),
        height: wp(40),
    },
    emptyText: {
        fontSize: hp(2),
        fontWeight: '600',
        color: theme.colors.textDark,
        marginTop: hp(2),
    },
    emptySubtext: {
        fontSize: hp(1.6),
        color: theme.colors.textLight,
        marginTop: hp(1),
        textAlign: 'center',
    },


    clearFiltersButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: wp(6),
        marginTop: hp(2),
    },
    clearFiltersText: {
        color: 'white',
        fontSize: hp(1.6),
        fontWeight: '600',
    },
    resultsContainer: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        backgroundColor: '#f0f8ff',
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.primary,
    },
    resultsText: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontStyle: 'italic',
    },

});
