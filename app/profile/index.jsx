import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { getUserData, updateProfile, uploadAvatar } from '../../services/userService';
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common"; // Import hp/wp
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import LottieView from 'lottie-react-native'; // Import Lottie
import { MotiView } from 'moti'; // Import Moti

const Profile = () => {
    const { user, setUserData, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [userData, setLocalUserData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        address: '',
        bio: 'New user to our community! Set your bio to let people know more about you.',
        image: null,
        created_at: null,
    });

    // Fetch user data on component mount
    useFocusEffect(
        useCallback(() => {
            if (user?.id) {
                fetchUserData();
            }
        }, [user?.id])
    );


    const fetchUserData = async () => {
        try {
            setLoading(true);
            const res = await getUserData(user.id);
            if (res.success && res.data) {
                setLocalUserData({
                    name: res.data.name || 'User',
                    email: user.email || 'xyz@email.com',
                    phoneNumber: res.data.phoneNumber || '',
                    address: res.data.address || '',
                    bio: res.data.bio || 'New user to our community! Set your bio to let people know more about you.',
                    image: res.data.image || null,
                    created_at: res.data.created_at || null,
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    // ... (Image picking and upload functions remain unchanged) ...
    // pickImage, uploadImage, pickFromGallery, pickFromCamera, removeProfilePhoto, showImageOptions
    const pickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera roll permissions to change your profile picture');
                return;
            }

            // Pick image
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const uploadImage = async (imageUri) => {
        try {
            setUploading(true);

            // Upload to storage
            const uploadRes = await uploadAvatar(imageUri);
            if (!uploadRes.success) {
                throw new Error(uploadRes.error || 'Upload failed');
            }

            // Update user profile with new image URL
            const updateRes = await updateProfile(user.id, { image: uploadRes.url });
            if (!updateRes.success) {
                throw new Error(updateRes.error || 'Update failed');
            }

            // Update local state and context
            setLocalUserData(prev => ({ ...prev, image: uploadRes.url }));
            setUserData({ ...user, image: uploadRes.url });

            Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            Alert.alert('Error', error.message || 'Failed to update profile picture');
        } finally {
            setUploading(false);
        }
    };

    // Pick image from gallery
    const pickFromGallery = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need permission to access your photos');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    // Capture image from camera
    const pickFromCamera = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera access to take a picture');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.7,
            });

            if (!result.canceled && result.assets[0]) {
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to capture image');
        }
    };

    // Remove profile photo completely
    const removeProfilePhoto = async () => {
        try {
            if (!userData.image) {
                Alert.alert('No image to remove');
                return;
            }

            setUploading(true);

            const imageUrl = userData.image;

            // Extract the exact path after the bucket name `avatars/`
            const parts = imageUrl.split('/storage/v1/object/public/avatars/');
            const imagePath = parts.length > 1 ? parts[1] : null;

            if (imagePath) {
                const { error: deleteError } = await supabase
                    .storage
                    .from('avatars')
                    .remove([imagePath]);

                if (deleteError) {
                    console.error('Supabase delete error:', deleteError);
                    Alert.alert('Warning', 'Could not delete image from storage.');
                } else {
                    console.log('✅ Image deleted from Supabase:', imagePath);
                }
            } else {
                console.warn('⚠️ Could not extract valid image path from URL:', imageUrl);
            }

            // Update database
            const updateRes = await updateProfile(user.id, { image: null });
            if (!updateRes.success) throw new Error(updateRes.error || 'Update failed');

            // Update UI
            setLocalUserData(prev => ({ ...prev, image: null }));
            setUserData({ ...user, image: null });

            Alert.alert('Removed', 'Profile photo removed successfully!');
        } catch (error) {
            console.error('Remove photo error:', error);
            Alert.alert('Error', error.message || 'Failed to remove profile photo');
        } finally {
            setUploading(false);
        }
    };

    // Dialog with all options
    const showImageOptions = () => {
        Alert.alert(
            'Change Profile Photo',
            'Select an option',
            [
                { text: 'Camera', onPress: pickFromCamera },
                { text: 'Gallery', onPress: pickFromGallery },
                { text: 'Remove Photo', onPress: removeProfilePhoto, style: 'destructive' },
                { text: 'Cancel', style: 'cancel' },
            ],
            { cancelable: true }
        );
    };


    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true); // Use the main loader
                        const result = await logout();
                        if (result.success) {
                            router.replace('/welcome');
                        } else {
                            Alert.alert('LogOut Error', result.error || 'Failed to log out. Please try again.');
                        }
                        setLoading(false);
                    },
                },
            ]
        );
    };

    const menuItems = [
        {
            id: '1',
            title: 'Edit Profile',
            subtitle: 'Update your name, bio, and info',
            icon: 'person-outline',
            onPress: () => router.push('/profile/edit'),
        },
        {
            id: '2',
            title: 'Notifications',
            subtitle: 'Manage app notifications',
            icon: 'notifications-outline',
            onPress: () => Alert.alert('Coming Soon', 'Notifications feature will be available soon'),
        },
        {
            id: '3',
            title: 'Privacy & Security',
            subtitle: 'Manage data and security settings',
            icon: 'shield-checkmark-outline',
            onPress: () => Alert.alert('Coming Soon', 'Privacy & Security settings coming soon'),
        },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingScreenContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Renovated Premium Header */}
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'timing', duration: 600 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>My Profile</Text>
                    <Text style={styles.headerSubtitle}>
                        Manage your account and settings
                    </Text>
                </View>
                <View style={styles.headerIconBadge}>
                    <LottieView
                        source={require("../../assets/animations/user.json")} // Using user animation from home screen
                        autoPlay
                        loop
                        style={styles.headerLottie}
                    />
                </View>
            </MotiView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {/* Profile Info Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        {userData.image ? (
                            <Image
                                style={styles.avatar}
                                resizeMode="cover"
                                source={{ uri: userData.image }}
                                onError={(e) => {
                                    console.log('Image load error:', e.nativeEvent.error);
                                    setLocalUserData(prev => ({ ...prev, image: null }));
                                }}
                            />
                        ) : (
                            <Image
                                style={styles.avatar}
                                resizeMode="cover"
                                source={require("../../assets/images/manAvatar.png")}
                            />
                        )}
                        <TouchableOpacity
                            style={styles.editAvatarButton}
                            onPress={showImageOptions}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Ionicons name="camera" size={18} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userInfoContainer}>
                        <View style={styles.nameRow}>
                            <Text style={styles.userName}>{userData.name || 'User'}</Text>
                            {/* === THEME UPDATE: Blue icon changed to green === */}
                            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} style={styles.verifiedIcon} />
                        </View>
                        {/* === THEME UPDATE: Blue badge changed to green === */}
                        <View style={styles.emailBadge}>
                            <Ionicons name="mail" size={12} color={theme.colors.primary} />
                            <Text style={styles.userEmail}>{userData.email}</Text>
                        </View>
                    </View>

                    {/* Bio Section */}
                    <View style={styles.bioWrapper}>
                        <View style={styles.bioIconWrapper}>
                            {/* === THEME UPDATE: Blue icon changed to green === */}
                            <Ionicons name="person-circle-outline" size={16} color={theme.colors.primary} />
                        </View>
                        <View style={styles.bioContainer}>
                            <Text style={styles.bioText}>{userData.bio}</Text>
                        </View>
                    </View>
                </View>

                {/* === RENOVATED: Menu Items as Action Cards === */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.actionCard}
                            onPress={item.onPress}
                        >
                            <View style={styles.actionIconContainer}>
                                <Ionicons name={item.icon} size={24} color="#16a34a" />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={styles.actionTitle}>{item.title}</Text>
                                <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>More</Text>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/help')}
                    >
                        <View style={styles.actionIconContainer}>
                            <Ionicons name="help-circle-outline" size={24} color="#16a34a" />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Help & Support</Text>
                            <Text style={styles.actionSubtitle}>Get help with the app</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                    </TouchableOpacity>

                    {/* === ADD THIS BUTTON === */}
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/profile/contributors')}
                    >
                        <View style={styles.actionIconContainer}>
                            <Ionicons name="people-outline" size={24} color="#16a34a" />
                        </View>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Contributors</Text>
                            <Text style={styles.actionSubtitle}>See who built this app</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                    </TouchableOpacity>
                    {/* === END OF ADDED BUTTON === */}
                </View>

                {/* Logout Button (remains the same, style is good) */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#E53E3E" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Footer (remains the same) */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Member since {formatDate(userData.created_at)}</Text>
                    <Text style={styles.versionText}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafb', // === THEME UPDATE: Background color
    },
    loadingScreenContainer: { // Renamed from loadingContainer to avoid conflict
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafb',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#718096',
        fontFamily: 'SFNSText-Regular',
    },
    scrollContainer: {
        paddingBottom: hp(4),
    },

    // ===== NEW HEADER STYLES =====
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        paddingBottom: hp(3),
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: hp(2.4),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
    },
    headerSubtitle: {
        fontSize: hp(1.4),
        fontFamily: 'SFNSText-Regular',
        color: '#64748b',
        marginTop: hp(0.5),
    },
    headerIconBadge: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bbf7d0',
        marginLeft: wp(4),
    },
    headerLottie: {
        width: wp(8),
        height: wp(8),
    },

    // Profile Card Styles (with theme updates)
    profileCard: {
        backgroundColor: '#fff',
        marginHorizontal: wp(5),
        marginTop: hp(2.5),
        borderRadius: 20,
        paddingTop: 32,
        paddingBottom: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4, // Increased border
        borderColor: '#bbf7d0', // === THEME UPDATE: Green border
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: theme.colors.primary, // This is already green
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userInfoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    userName: {
        fontSize: 26,
        fontFamily: 'SFNSDisplay-Bold', // Use custom font
        color: '#1A202C',
        letterSpacing: -0.5,
    },
    verifiedIcon: {
        marginLeft: 6,
    },
    emailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdf4', // === THEME UPDATE: Light green
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    userEmail: {
        fontSize: 13,
        color: '#15803d', // === THEME UPDATE: Dark green
        fontFamily: 'SFNSText-Medium', // Use custom font
    },
    bioWrapper: {
        width: '100%',
        alignItems: 'center',
        position: 'relative',
    },
    bioIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9', // === THEME UPDATE
        marginBottom: -16,
        zIndex: 1,
    },
    bioContainer: {
        width: '100%',
        backgroundColor: '#f8fafc', // === THEME UPDATE
        borderRadius: 16,
        padding: 18,
        paddingTop: 26,
        borderWidth: 1,
        borderColor: '#f1f5f9', // === THEME UPDATE
    },
    bioText: {
        fontSize: 14,
        color: '#4A5568',
        lineHeight: 22,
        textAlign: 'center',
        fontFamily: 'SFNSText-Regular',
    },

    // ===== RENOVATED Menu Section =====
    menuSection: {
        marginTop: hp(3),
        paddingHorizontal: wp(5),
        gap: hp(1.5),
    },
    sectionTitle: {
        fontSize: hp(1.8),
        fontFamily: 'SFNSDisplay-Bold',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: hp(0.5),
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: wp(4),
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f0fdf4',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#bbf7d0',
        marginRight: wp(3),
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: hp(1.7),
        fontFamily: 'SFNSDisplay-Bold',
        color: '#0f172a',
        marginBottom: hp(0.2),
    },
    actionSubtitle: {
        fontSize: hp(1.3),
        fontFamily: 'SFNSText-Regular',
        color: '#64748b',
    },

    // Original Logout/Footer
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: wp(5),
        marginTop: hp(3),
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FEB2B2',
        shadowColor: '#E53E3E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    logoutText: {
        fontSize: 16,
        fontFamily: 'SFNSDisplay-Bold',
        color: '#E53E3E',
        marginLeft: 12,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 24,
        marginTop: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#718096',
        marginBottom: 4,
        fontFamily: 'SFNSText-Regular',
    },
    versionText: {
        fontSize: 12,
        color: '#A0AEC0',
        fontFamily: 'SFNSText-Regular',
    },
});

export default Profile;