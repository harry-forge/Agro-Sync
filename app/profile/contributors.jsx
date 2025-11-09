// File: app/profile/contributors.jsx
// (Renovated with Animated Tiles)

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList, // Use FlatList for a performant grid
    Pressable,
    Linking, // To open social links
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import BackButton from '../../components/BackButton';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti'; // Import Moti

// Hardcoded contributors list (with new 'socials' array)
const contributors = [
    {
        id: '1',
        name: 'Harjinder Singh Saini',
        role: 'App Developer',
        image: require('../../assets/contributors/harry.jpeg'),
        socials: [
            { icon: 'logo-github', url: 'https://github.com/harry-forge/' }, // Example URL
            { icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/harjinder-singh-saini/' }, // Example URL
        ],
    },
    {
        id: '2',
        name: 'Debjyoti Sarkar',
        role: 'IoT Engineer & Performance Analyst',
        image: require('../../assets/contributors/dedhjyoti.png'),
        socials: [
            { icon: 'logo-github', url: 'https://github.com/Debjyoti121' }, // Example URL
            { icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/debjyoti-sarkar-1087b3258/' }, // Example URL
        ],
    },
    {
        id: '3',
        name: 'Nilotpal Basu',
        role: 'AI/ML Developer',
        image: require('../../assets/contributors/Maach.png'),
        socials: [
            { icon: 'logo-github', url: 'https://github.com/nilotpal-basu/' }, // Example URL
            { icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/nilotpal-basu/' }, // Example URL
        ],
    },
    {
        id: '4',
        name: 'Ayush Kedia',
        role: 'UI/UX Designer',
        image: require('../../assets/contributors/gaydia.jpeg'),
        socials: [
            { icon: 'logo-github', url: 'https://github.com/gcckd01' }, // Example URL
            { icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/ayush-kedia-92813824a/' }, // Example URL
        ],
    },
    {
        id: '5',
        name: 'Aditya Bahadur',
        role: 'UI/UX Collaborator',
        image: require('../../assets/contributors/aditya.png'),
        socials: [
            { icon: 'logo-github', url: 'https://github.com/abahadur29' }, // Example URL
            { icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/aditya-bahadur-b3b709197/' }, // Example URL
        ],
    },
    // Add more contributors here
    // {
    //     id: '3',
    //     name: 'Jane Doe',
    //     role: 'Backend Developer',
    //     image: require('../../assets/images/womanAvatar.png'), // Example
    //     socials: [
    //         { icon: 'logo-github', url: 'https://github.com/' },
    //     ],
    // },
    // {
    //     id: '4',
    //     name: 'John Smith',
    //     role: 'QA Tester',
    //     image: require('../../assets/images/manAvatar.png'), // Example
    //     socials: [],
    // },
];

// Function to handle opening social links
const handleSocialPress = async (url) => {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
        await Linking.openURL(url);
    } else {
        Alert.alert(`Don't know how to open this URL: ${url}`);
    }
};

const Contributors = () => {

    const renderContributorTile = ({ item, index }) => {
        return (
            // MOTI Animation: Staggered entry
            <MotiView
                from={{ opacity: 0, scale: 0.8, translateY: 20 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{
                    type: 'spring',
                    delay: index * 100, // Staggered delay
                    damping: 14,
                    stiffness: 100,
                }}
                style={styles.tileContainer}
            >
                <Pressable
                    style={({ pressed }) => [
                        styles.tile,
                        pressed && styles.tilePressed
                    ]}
                >
                    {/* Avatar / Icon */}
                    {item.image ? (
                        <Image source={item.image} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.iconAvatar]}>
                            <Ionicons name={item.icon} size={hp(5)} color={theme.colors.primary} />
                        </View>
                    )}

                    {/* Info */}
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.role}>{item.role}</Text>

                    {/* Socials */}
                    <View style={styles.socialsContainer}>
                        {item.socials.map((social, idx) => (
                            <Pressable
                                key={idx}
                                onPress={() => handleSocialPress(social.url)}
                                style={styles.socialIcon}
                            >
                                <Ionicons name={social.icon} size={hp(2.5)} color="#64748b" />
                            </Pressable>
                        ))}
                    </View>
                </Pressable>
            </MotiView>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header (from edit.jsx) */}
            <View style={styles.header}>
                <BackButton router={router} />
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Contributors</Text>
                </View>
                <View style={{ width: 40, height: 40 }} />
            </View>

            {/* Grid */}
            <FlatList
                data={contributors}
                renderItem={renderContributorTile}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafb', // Premium background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9', // Lighter border
    },
    headerTitleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: -1,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'SFNSDisplay-Bold',
        color: '#2D3748',
    },
    listContent: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2.5),
        paddingBottom: hp(5),
    },
    tileContainer: {
        width: '50%', // 2 columns
        padding: wp(1.5), // Gutter between columns
    },
    tile: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20, // More rounded
        padding: wp(4),
        alignItems: 'center', // Center content
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06, // Softer shadow
        shadowRadius: 12,
        elevation: 5,
        minHeight: hp(24), // Ensure tiles have a good height
        justifyContent: 'center',
    },
    tilePressed: {
        transform: [{ scale: 0.98 }],
        backgroundColor: '#fdfdfd',
    },
    avatar: {
        width: wp(20), // BIGGER avatar
        height: wp(20),
        borderRadius: wp(10),
        marginBottom: hp(1.5),
        backgroundColor: '#f0fdf4',
        borderWidth: 3, // Thicker border
        borderColor: '#bbf7d0',
    },
    iconAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: hp(2),
        fontFamily: 'SFNSDisplay-Bold',
        color: '#1A202C',
        textAlign: 'center',
        marginBottom: hp(0.5),
    },
    role: {
        fontSize: hp(1.5),
        fontFamily: 'SFNSText-Regular',
        color: '#64748b', // Lighter role text
        textAlign: 'center',
    },
    socialsContainer: {
        flexDirection: 'row',
        marginTop: hp(1.5),
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: hp(1.5),
    },
    socialIcon: {
        paddingHorizontal: wp(2.5),
    },
});

export default Contributors;