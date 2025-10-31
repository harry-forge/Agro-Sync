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
import BackButton from "../../components/BackButton";
import { useAuth } from '../../contexts/AuthContext';
import { getUserData, updateProfile, uploadAvatar } from '../../services/userService';
import {theme} from "../../constants/theme";
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


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
                        setLoading(true);
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
            icon: 'person-outline',
            onPress: () => router.push('/profile/edit'),
        },
        {
            id: '2',
            title: 'Notifications',
            icon: 'notifications-outline',
            onPress: () => Alert.alert('Coming Soon', 'Notifications feature will be available soon'),
        },
        {
            id: '3',
            title: 'Privacy & Security',
            icon: 'shield-checkmark-outline',
            onPress: () => Alert.alert('Coming Soon', 'Privacy & Security settings coming soon'),
        },
        {
            id: '4',
            title: 'Help & Support',
            icon: 'help-circle-outline',
            onPress: () => Alert.alert('Coming Soon', 'Help & Support will be available soon'),
        },
        {
            id: '5',
            title: 'Settings',
            icon: 'settings-outline',
            onPress: () => Alert.alert('Coming Soon', 'Settings feature will be available soon'),
        },
    ];

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4299E1" />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <BackButton router={router} />
                <Text style={styles.headerTitle}>User Profile</Text>
                <TouchableOpacity style={styles.settingsButton} onPress={() => Alert.alert('Coming Soon', 'In progress....')}>
                    <Ionicons name="settings-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

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
                            <Ionicons name="checkmark-circle" size={24} color="#4299E1" style={styles.verifiedIcon} />
                        </View>
                        <View style={styles.emailBadge}>
                            <Ionicons name="mail" size={12} color="#4299E1" />
                            <Text style={styles.userEmail}>{userData.email}</Text>
                        </View>
                    </View>

                    {/* Bio Section */}
                    <View style={styles.bioWrapper}>
                        <View style={styles.bioIconWrapper}>
                            <Ionicons name="person-circle-outline" size={16} color="#4299E1" />
                        </View>
                        <View style={styles.bioContainer}>
                            <Text style={styles.bioText}>{userData.bio}</Text>
                        </View>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >

                            <View style={styles.menuItemLeft}>
                                <Ionicons name={item.icon} size={24} color="#4A5568" />
                                <Text style={styles.menuItemText}>{item.title}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#E53E3E" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                {/* Footer */}
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
        backgroundColor: '#edecec',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#718096',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D3748',
        letterSpacing: 0.3,
    },
    settingsButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.7,
    },
    profileCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 20,
        paddingTop: 32,
        paddingBottom: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: 'rgba(35,119,62,0.53)',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: theme.colors.primary,
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
        fontWeight: '700',
        color: '#1A202C',
        letterSpacing: -0.5,
    },
    verifiedIcon: {
        marginLeft: 6,
    },
    emailBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBF5FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    userEmail: {
        fontSize: 13,
        color: '#2B6CB0',
        fontWeight: '600',
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
        borderWidth: 2,
        borderColor: '#E8F4FD',
        marginBottom: -16,
        zIndex: 1,
    },
    bioContainer: {
        width: '100%',
        backgroundColor: '#FAFBFC',
        borderRadius: 16,
        padding: 18,
        paddingTop: 26,
        borderWidth: 1,
        borderColor: '#E8EDF2',
    },
    bioText: {
        fontSize: 14,
        color: '#4A5568',
        lineHeight: 22,
        textAlign: 'center',
    },
    menuContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: '#2D3748',
        marginLeft: 16,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 20,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FEB2B2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
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
    },
    versionText: {
        fontSize: 12,
        color: '#A0AEC0',
    },
});

export default Profile;