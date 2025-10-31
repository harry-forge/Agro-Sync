import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

// ... rest of the file
// --- Helper Functions for Supabase Operations ---

/**
 * Fetches the user's profile data from the public.users table.
 * @param {string} userId - The UUID of the authenticated user.
 */
export const getUserData = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('name, image, bio, address, "phoneNumber", created_at')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return { success: true, data: data };
    } catch (error) {
        console.error('Error fetching user data:', error);
        return { success: true, data: {} };
    }
}

/**
 * Handles updating fields in the public.users table.
 * @param {string} userId - The UUID of the authenticated user.
 * @param {object} updateFields - Object containing fields and values to update.
 */
export const updateProfile = async (userId, updateFields) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update(updateFields)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: data };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Handles uploading the image file to Supabase Storage and returns the URL.
 * NOTE: Ensure you have a storage bucket named 'avatars'.
 */
export const uploadAvatar = async (fileUri) => {
    try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // 1. Prepare file path and name
        const fileExt = fileUri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        // 2. Read file as base64 using expo-file-system


        // Correct: Use the destructured/separately imported symbol.
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'base64', // ✅ plain string, not EncodingType.Base64
        });



        // 3. Convert base64 to ArrayBuffer
        const arrayBuffer = decode(base64);

        // 4. Upload to storage
        const { data, error } = await supabase.storage
            .from('avatars')
            .upload(filePath, arrayBuffer, {
                contentType: `image/${fileExt}`,
                cacheControl: '3600',
                upsert: true,
            });

        if (error) {
            console.error('Storage upload error:', error);
            throw error;
        }

        // 5. Get the public URL for the image
        const { data: publicUrlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(data.path);

        return { success: true, url: publicUrlData.publicUrl, path: data.path };
    } catch (error) {
        console.error('Error in uploadAvatar:', error);
        return { success: false, error: error.message || 'Upload failed' };
    }
}