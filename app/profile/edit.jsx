import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getUserData, updateProfile } from '../../services/userService';
import BackButton from '../../components/BackButton';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';

const EditProfile = () => {
    const { user, setUserData } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        phoneNumber: '',
        address: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user?.id) {
            fetchUserData();
        }
    }, [user?.id]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const res = await getUserData(user.id);
            if (res.success && res.data) {
                setFormData({
                    name: res.data.name || '',
                    bio: res.data.bio || '',
                    phoneNumber: res.data.phoneNumber || '',
                    address: res.data.address || '',
                });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (formData.phoneNumber && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Invalid phone number format';
        }

        if (formData.bio && formData.bio.length > 500) {
            newErrors.bio = 'Bio must be less than 500 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);

            const updateData = {
                name: formData.name.trim(),
                bio: formData.bio.trim() || null,
                phoneNumber: formData.phoneNumber.trim() || null,
                address: formData.address.trim() || null,
            };

            const res = await updateProfile(user.id, updateData);

            if (res.success) {
                // Update context with new data
                setUserData({ ...user, ...updateData });

                Alert.alert('Success', 'Profile updated successfully!', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                Alert.alert('Error', res.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Discard Changes?',
            'Are you sure you want to discard your changes?',
            [
                { text: 'Keep Editing', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: () => router.back() },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >


                {/* Header */}
                <View style={styles.header}>
                    {/* 1. Back Button (Left) */}
                    <BackButton router={router} />

                    {/* 2. Title Container (Absolute/Centered) */}
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                    </View>

                    {/* 3. Spacer (Right) - IMPORTANT: Must match the size of the BackButton */}
                    {/* Assuming BackButton is about 40x40. Adjust the width if necessary. */}
                    <View style={{ width: 40, height: 40 }} />
                </View>


                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Name Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>
                            Full Name <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                            <Ionicons name="person-outline" size={20} color={theme.colors.textLight} />
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, name: text });
                                    if (errors.name) {
                                        setErrors({ ...errors, name: null });
                                    }
                                }}
                                placeholder="Enter your full name"
                                placeholderTextColor={theme.colors.textLight}
                                maxLength={50}
                            />
                        </View>
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    {/* Phone Number Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={[styles.inputWrapper, errors.phoneNumber && styles.inputError]}>
                            <Ionicons name="call-outline" size={20} color={theme.colors.textLight} />
                            <TextInput
                                style={styles.input}
                                value={formData.phoneNumber}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, phoneNumber: text });
                                    if (errors.phoneNumber) {
                                        setErrors({ ...errors, phoneNumber: null });
                                    }
                                }}
                                placeholder="+1 234 567 8900"
                                placeholderTextColor={theme.colors.textLight}
                                keyboardType="phone-pad"
                                maxLength={20}
                            />
                        </View>
                        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                    </View>

                    {/* Address Field */}
                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Address</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="location-outline" size={20} color={theme.colors.textLight} />
                            <TextInput
                                style={styles.input}
                                value={formData.address}
                                onChangeText={(text) => setFormData({ ...formData, address: text })}
                                placeholder="Enter your address"
                                placeholderTextColor={theme.colors.textLight}
                                maxLength={200}
                            />
                        </View>
                    </View>

                    {/* Bio Field */}
                    <View style={styles.fieldContainer}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Bio</Text>
                            <Text style={styles.characterCount}>
                                {formData.bio.length}/500
                            </Text>
                        </View>
                        <View style={[styles.textAreaWrapper, errors.bio && styles.inputError]}>
                            <TextInput
                                style={styles.textArea}
                                value={formData.bio}
                                onChangeText={(text) => {
                                    setFormData({ ...formData, bio: text });
                                    if (errors.bio) {
                                        setErrors({ ...errors, bio: null });
                                    }
                                }}
                                placeholder="Tell us about yourself..."
                                placeholderTextColor={theme.colors.textLight}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                maxLength={500}
                            />
                        </View>
                        {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.cancelButtonNew}
                            onPress={handleCancel}
                            disabled={saving}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close-circle-outline" size={20} color="#718096" />
                            <Text style={styles.cancelButtonTextNew}>Cancel</Text>
                        </TouchableOpacity>

                        {/* Save Button */}
                        <TouchableOpacity
                            style={styles.saveMainButton}
                            onPress={handleSave}
                            disabled={saving}
                            activeOpacity={0.8}
                        >
                            {saving ? (
                                <View style={styles.savingContainer}>
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text style={styles.savingText}>Saving...</Text>
                                </View>
                            ) : (
                                <View style={styles.saveButtonContent}>
                                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                    <Text style={styles.saveMainButtonText}>Save Changes</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7FAFC',
    },
    keyboardView: {
        flex: 1,
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
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2D3748',
    },
    saveButton: {
        width: 60,
        alignItems: 'flex-end',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    fieldContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2D3748',
        marginBottom: 8,
    },
    required: {
        color: '#E53E3E',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    characterCount: {
        fontSize: 13,
        color: '#A0AEC0',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    inputError: {
        borderColor: '#FC8181',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#2D3748',
        padding: 0,
    },
    textAreaWrapper: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        padding: 16,
    },
    textArea: {
        fontSize: 16,
        color: '#2D3748',
        minHeight: 120,
        padding: 0,
    },
    errorText: {
        fontSize: 13,
        color: '#E53E3E',
        marginTop: 6,
        marginLeft: 4,
    },
    cancelButtonNew: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cancelButtonTextNew: {
        fontSize: 16,
        fontWeight: '600',
        color: '#718096',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    saveMainButton: {
        flex: 1.2,
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    saveMainButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    savingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    savingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default EditProfile;