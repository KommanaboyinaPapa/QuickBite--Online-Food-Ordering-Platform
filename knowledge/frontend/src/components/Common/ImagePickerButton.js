/**
 * ImagePickerButton - Cross-platform image picker component
 * Uses file input on web, expo-image-picker on native (if available)
 */
import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '@styles/theme';
import uploadService from '@services/uploadService';

const { colors, spacing, typography } = theme;

const ImagePickerButton = ({
    currentImage,
    onImageSelected,
    onUploadComplete,
    entityType,  // 'menuItem' or 'restaurant'
    entityId,
    imageType = 'logo',  // For restaurants: 'logo' or 'banner'
    placeholder = 'Tap to upload image',
    size = 'medium'  // 'small', 'medium', 'large'
}) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [previewUri, setPreviewUri] = useState(null);

    const sizes = {
        small: { width: 64, height: 64, iconSize: 24 },
        medium: { width: 120, height: 120, iconSize: 32 },
        large: { width: 200, height: 120, iconSize: 40 }
    };

    const currentSize = sizes[size] || sizes.medium;

    const handlePress = () => {
        if (Platform.OS === 'web' && fileInputRef.current) {
            fileInputRef.current.click();
        } else {
            // For native, we'd use expo-image-picker here
            // For now, show a message
            alert('Please use a URL or run on web browser to upload images');
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        try {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result;
                setPreviewUri(base64);

                if (onImageSelected) {
                    onImageSelected(base64);
                }

                // If entityId is provided, upload immediately
                if (entityId && entityType) {
                    setUploading(true);
                    try {
                        const result = await uploadService.uploadImage(base64, entityType, entityId, imageType);
                        if (onUploadComplete) {
                            onUploadComplete(result.data.imageUrl);
                        }
                    } catch (uploadError) {
                        console.error('Upload error:', uploadError);
                        alert('Failed to upload image. Please try again.');
                    } finally {
                        setUploading(false);
                    }
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Failed to read image file');
        }
    };

    const displayImage = previewUri || (currentImage ? uploadService.getImageUrl(currentImage) : null);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.pickerButton,
                    { width: currentSize.width, height: currentSize.height }
                ]}
                onPress={handlePress}
                disabled={uploading}
            >
                {uploading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <Text style={styles.uploadingText}>Uploading...</Text>
                    </View>
                ) : displayImage ? (
                    <Image
                        source={{ uri: displayImage }}
                        style={[styles.previewImage, { width: currentSize.width, height: currentSize.height }]}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="image-outline" size={currentSize.iconSize} color={colors.textSecondary} />
                        <Text style={styles.placeholderText}>{placeholder}</Text>
                    </View>
                )}

                {/* Overlay edit icon */}
                {!uploading && displayImage && (
                    <View style={styles.editOverlay}>
                        <Ionicons name="camera" size={16} color={colors.white} />
                    </View>
                )}
            </TouchableOpacity>

            {/* Hidden file input for web */}
            {Platform.OS === 'web' && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    pickerButton: {
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        overflow: 'hidden',
        backgroundColor: colors.light50,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.sm,
    },
    placeholderText: {
        ...typography.caption,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    previewImage: {
        borderRadius: 10,
    },
    editOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingText: {
        ...typography.caption,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    }
});

export default ImagePickerButton;
