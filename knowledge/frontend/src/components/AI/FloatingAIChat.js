
import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, SafeAreaView, Animated, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../../styles/theme';
import AIAssistantScreen from '../../screens/AI/AIAssistantScreen';

const FloatingAIChat = () => {
    const [isVisible, setIsVisible] = useState(false);
    const queuedCount = useSelector(state => state.ai?.queuedItems?.length || 0);
    const bubbleScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (queuedCount > 0) {
            Animated.sequence([
                Animated.timing(bubbleScale, { toValue: 1.15, duration: 140, useNativeDriver: true }),
                Animated.spring(bubbleScale, { toValue: 1, friction: 4, useNativeDriver: true }),
            ]).start();
        }
    }, [queuedCount, bubbleScale]);

    // If modal is visible, show full screen chat
    // Otherwise show bubble
    return (
        <>
            <TouchableOpacity
                style={styles.touchWrapper}
                onPress={() => setIsVisible(true)}
                activeOpacity={0.8}
            >
                <Animated.View style={[styles.bubble, { transform: [{ scale: bubbleScale }] }]}>                    
                    <MaterialCommunityIcons name="robot" size={28} color="white" />
                    {queuedCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{queuedCount}</Text>
                        </View>
                    )}
                </Animated.View>
            </TouchableOpacity>

            <Modal
                visible={isVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setIsVisible(false)} style={styles.closeBtn}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
                            <Text style={styles.headerText}>Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>AI Assistant</Text>
                        <View style={{ width: 60 }} />
                    </View>
                    <AIAssistantScreen />
                </SafeAreaView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    touchWrapper: {
        position: 'absolute',
        bottom: 160, // Above floating cart
        right: 20,
        zIndex: 1000,
    },
    bubble: {
        backgroundColor: theme.colors.secondary, // Different color for AI
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.secondary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: theme.colors.secondary,
        fontSize: 11,
        fontWeight: '700',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    closeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerText: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '600',
    },
    headerTitle: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '700',
    }
});

export default FloatingAIChat;
