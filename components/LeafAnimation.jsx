import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Continuous floating particles that flow upward
const FloatingParticle = ({ delay = 0, startX, size = 4, color = 'rgba(76, 175, 80, 0.6)' }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const scaleValue = useRef(new Animated.Value(1)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let isMounted = true;
        
        const startAnimation = () => {
            if (!isMounted) return;
            
            // Reset to starting position
            animatedValue.setValue(0);
            opacityValue.setValue(0);

            // Start the continuous animation cycle
            Animated.sequence([
                // Fade in
                Animated.timing(opacityValue, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                // Main movement with fade out at the end
                Animated.parallel([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 4000,
                        useNativeDriver: true,
                    }),
                    Animated.sequence([
                        Animated.delay(3000),
                        Animated.timing(opacityValue, {
                            toValue: 0,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]).start((finished) => {
                // Only restart if animation completed and component is still mounted
                if (finished && isMounted) {
                    // Small delay before restarting to prevent overwhelming
                    setTimeout(() => {
                        if (isMounted) {
                            startAnimation();
                        }
                    }, 100);
                }
            });
        };

        // Start scale animation separately (infinite loop)
        const startScaleAnimation = () => {
            if (!isMounted) return;
            
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleValue, {
                        toValue: 1.2,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleValue, {
                        toValue: 0.8,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        // Start both animations with delay
        const timeoutId = setTimeout(() => {
            if (isMounted) {
                startAnimation();
                startScaleAnimation();
            }
        }, delay);
        
        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            // Stop all animations when component unmounts
            animatedValue.stopAnimation();
            scaleValue.stopAnimation();
            opacityValue.stopAnimation();
        };
    }, [animatedValue, scaleValue, opacityValue, delay]);

    // Continuous upward movement with gentle horizontal drift
    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [300, -50], // Start from below title area, flow up and disappear above
    });

    const translateX = animatedValue.interpolate({
        inputRange: [0, 0.25, 0.5, 0.75, 1],
        outputRange: [startX, startX + 10, startX - 8, startX + 12, startX - 5],
    });

    return (
        <Animated.View
            style={[
                styles.particleContainer,
                {
                    transform: [
                        { translateY },
                        { translateX },
                        { scale: scaleValue },
                    ],
                    opacity: opacityValue,
                },
            ]}
        >
            <View style={[styles.particle, { width: size, height: size, backgroundColor: color, borderRadius: size / 2 }]} />
        </Animated.View>
    );
};

// Main Premium Particle Animation Component
const LeafAnimation = () => {
    const [key, setKey] = React.useState(0);
    
    // Refresh the entire animation every 2 minutes to prevent any stalling
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            setKey(prev => prev + 1);
        }, 120000); // 2 minutes
        
        return () => clearInterval(refreshInterval);
    }, []);

    // Create more particles with staggered delays for continuous flow
    const particles = Array.from({ length: 12 }, (_, index) => ({
        id: `${key}-${index}`, // Include key to force re-render
        delay: index * 400, // Staggered delays
        startX: Math.random() * (SCREEN_WIDTH - 60) + 30,
        size: 2 + Math.random() * 3, // 2-5px particles
        color: `rgba(76, 175, 80, ${0.4 + Math.random() * 0.3})`, // Varying opacity
    }));

    return (
        <View style={styles.container} pointerEvents="none">
            {particles.map((particle) => (
                <FloatingParticle
                    key={particle.id}
                    delay={particle.delay}
                    startX={particle.startX}
                    size={particle.size}
                    color={particle.color}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT * 0.4, // Only animate in top 40% of screen
        zIndex: 0, // Behind content but visible
    },
    particleContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    particle: {
        // Dynamic styles applied inline for size and color
        shadowColor: 'rgba(76, 175, 80, 0.4)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 2,
    },
});

export default LeafAnimation;