// File: app/profile/contributors.jsx
// RENOVATED: Premium UI with Haptics, Blur, and Enhanced Animations

import React, { useCallback } from 'react'; // --- Added useCallback
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    Pressable,
    Linking,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import BackButton from '../../components/BackButton';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

// --- PREMIUM ADDITION: Haptics and Blur ---
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

// Hardcoded contributors list
const contributors = [
    {
        id: '1',
        name: 'Harjinder Singh Saini',
        role: 'App Developer',
        image: require('../../assets/contributors/harry1.jpeg'),
        socials: [
            { icon: 'logo-github', url: 'https://github.com/harry-forge/' },
            { icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/harjinder-singh-saini/' },
        ],
    },
    {
        id: '2',
        name: 'Debjyoti Sarkar',
        role: 'IoT Engineer & Performance Analyst',
        image: require('../../assets/contributors/dedhjyoti.png'),
        socials: [
            { icon: 'logo-github', url: 'https://github.com/Debjyoti121' },
            { icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/debjyoti-sarkar-1087b3258/' },
        ],
    },
    {
        id: '3',
        name: 'Nilotpal Basu',
        role: 'AI/ML Developer',
        image: require('../../assets/contributors/Maach.png'),
        socials: [
            { icon: 'logo-github', url: 'https://github.com/nilotpal-basu/' },
            { icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/nilotpal-basu/' },
        ],
    },
    {
        id: '4',
        name: 'Ayush Kedia',
        role: 'UI/UX Designer',
        image: require('../../assets/contributors/gaydia.jpeg'),
        socials: [
            { icon: 'logo-github', url: 'https://github.com/gcckd01' },
            { icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/ayush-kedia-92813824a/' },
        ],
    },
    {
        id: '5',
        name: 'Aditya Bahadur',
        role: 'UI/UX Collaborator',
        image: require('../../assets/contributors/aditya.png'),
        socials: [
            { icon: 'logo-github', url: 'https://github.com/abahadur29' },
            { icon: 'logo-linkedin', url: 'https://www.linkedin.com/in/aditya-bahadur-b3b709197/' },
        ],
    },
];

// Function to handle opening social links
const handleSocialPress = async (url) => {
    if (!url) return;

    // --- PREMIUM ADDITION: Haptic Feedback ---
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const supported = await Linking.canOpenURL(url);
    if (supported) {
        await Linking.openURL(url);
    } else {
        Alert.alert(`Don't know how to open this URL: ${url}`);
    }
};

const Contributors = () => {

    // --- PREMIUM ADDITION: useCallback for list optimization ---
    const renderContributorTile = useCallback(({ item, index }) => {
        return (
            <MotiView
                from={{ opacity: 0, scale: 0.9, translateY: 30 }}
                animate={{ opacity: 1, scale: 1, translateY: 0 }}
                transition={{
                    type: 'spring',
                    delay: index * 120,
                    damping: 15,
                    stiffness: 90,
                }}
                style={styles.tileContainer}
            >
                <Pressable
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} // --- Haptic feedback on card press
                    style={({ pressed }) => [
                        styles.tile,
                        pressed && styles.tilePressed
                    ]}
                >
                    {/* --- PREMIUM ADDITION: Pulsing Accent Animation --- */}
                    <MotiView
                        style={styles.topAccent}
                        from={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            type: 'timing',
                            duration: 2000,
                            loop: true,
                            repeatReverse: true,
                        }}
                    >
                        <LinearGradient
                            colors={['#22c55e', '#16a34a']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.accentGradient}
                        />
                    </MotiView>

                    {/* Avatar with Enhanced Border */}
                    <View style={styles.avatarWrapper}>
                        <LinearGradient
                            colors={['#22c55e', '#16a34a', '#15803d']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.avatarGradientBorder}
                        >
                            <View style={styles.avatarInner}>
                                {item.image ? (
                                    <Image source={item.image} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatar, styles.iconAvatar]}>
                                        <Ionicons name="person" size={hp(5)} color={theme.colors.primary} />
                                    </View>
                                )}
                            </View>
                        </LinearGradient>

                        {/* Floating Badge */}
                        <View style={styles.badgeContainer}>
                            <LinearGradient
                                colors={['#22c55e', '#16a34a']}
                                style={styles.badge}
                            >
                                <Ionicons name="checkmark-circle" size={14} color="white" />
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Name with Better Typography */}
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>

                    {/* --- PREMIUM ADDITION: Frosted Glass Role Badge --- */}
                    <BlurView
                        intensity={95}
                        tint="light"
                        style={styles.roleContainer}
                    >
                        <Ionicons name="briefcase-outline" size={12} color="#166534" />
                        <Text style={styles.role} numberOfLines={2}>{item.role}</Text>
                    </BlurView>

                    {/* Socials with Enhanced Design */}
                    {item.socials && item.socials.length > 0 && (
                        <View style={styles.socialsContainer}>
                            {item.socials.map((social, idx) => (
                                <Pressable
                                    key={idx}
                                    onPress={() => handleSocialPress(social.url)}
                                    style={({ pressed }) => [
                                        styles.socialButton,
                                        pressed && styles.socialButtonPressed
                                    ]}
                                >
                                    <LinearGradient
                                        colors={['#f0fdf4', '#dcfce7']}
                                        style={styles.socialGradient}
                                    >
                                        <Ionicons
                                            name={social.icon}
                                            size={18}
                                            color="#16a34a"
                                        />
                                    </LinearGradient>
                                </Pressable>
                            ))}
                        </View>
                    )}

                    {/* Bottom Shine Effect */}
                    <View style={styles.bottomShine} />
                </Pressable>
            </MotiView>
        );
    }, []); // --- Empty dependency array for useCallback

    return (
        <SafeAreaView style={styles.container}>
            {/* Enhanced Header */}
            <View style={styles.header}>
                <BackButton router={router} />
                <View style={styles.headerTitleContainer}>
                    {/* --- PREMIUM ADDITION: Header Animation --- */}
                    <MotiView
                        from={{ opacity: 0, translateY: -10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                    >
                        <View style={styles.titleWrapper}>
                            <Ionicons name="people" size={24} color="#22c55e" style={styles.headerIcon} />
                            <Text style={styles.headerTitle}>Contributors</Text>
                        </View>
                    </MotiView>
                    <MotiView
                        from={{ opacity: 0, translateY: -10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'spring', damping: 15, delay: 100 }}
                    >
                        <Text style={styles.headerSubtitle}>Meet our amazing team</Text>
                    </MotiView>
                </View>
                <View style={{ width: 40, height: 40 }} />
            </View>

            {/* Grid with Enhanced Spacing */}
            <FlatList
                data={contributors}
                renderItem={renderContributorTile}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={styles.columnWrapper}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerTitleContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: -1,
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIcon: {
        marginTop: 2,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'SFNSDisplay-Bold',
        color: '#1f2937',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: 'SFNSText-Regular',
        color: '#6b7280',
        marginTop: 2,
    },
    listContent: {
        paddingHorizontal: wp(4),
        paddingTop: hp(2),
        paddingBottom: hp(3),
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    tileContainer: {
        width: '48%',
        marginBottom: hp(2),
    },
    tile: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: wp(4),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
        minHeight: hp(28),
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
    },
    tilePressed: {
        transform: [{ scale: 0.97 }],
        shadowOpacity: 0.12,
    },
    topAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        overflow: 'hidden',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    accentGradient: {
        flex: 1,
    },
    avatarWrapper: {
        marginTop: hp(1),
        marginBottom: hp(1.5),
        position: 'relative',
    },
    avatarGradientBorder: {
        width: wp(22),
        height: wp(22),
        borderRadius: wp(11),
        padding: 3,
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    avatarInner: {
        width: '100%',
        height: '100%',
        borderRadius: wp(11),
        overflow: 'hidden',
        backgroundColor: '#ffffff',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: wp(11),
    },
    iconAvatar: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
    },
    badgeContainer: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    badge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2.5,
        borderColor: '#ffffff',
    },
    name: {
        fontSize: hp(1.9),
        fontFamily: 'SFNSDisplay-Bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: hp(0.5),
        lineHeight: hp(2.3),
        paddingHorizontal: wp(1),
    },
    // --- Styles modified for BlurView ---
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: wp(2),
        paddingVertical: hp(0.8),
        // backgroundColor: '#f0fdf4', // Replaced by BlurView
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(187, 247, 208, 0.5)', // Made border semi-transparent
        marginBottom: hp(1.2),
        minHeight: hp(4),
        overflow: 'hidden', // Required for BlurView border radius
        width: '100%',
    },
    role: {
        fontSize: hp(1.4),
        fontFamily: 'SFNSText-Medium',
        color: '#166534', // Kept text color dark for readability on blur
        textAlign: 'center',
        flex: 1,
        lineHeight: hp(1.8),
    },
    // --- End of modified styles ---
    socialsContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 'auto',
        paddingTop: hp(1.5),
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        width: '100%',
        justifyContent: 'center',
    },
    socialButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    socialButtonPressed: {
        transform: [{ scale: 0.95 }],
        shadowOpacity: 0.15,
    },
    socialGradient: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#bbf7d0',
        borderRadius: 12,
    },
    bottomShine: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: 'transparent',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        opacity: 0.4,
    },
});

export default Contributors;