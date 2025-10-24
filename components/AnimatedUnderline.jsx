import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { hp, wp } from '../helpers/common';

const AnimatedUnderline = ({ width = wp(20), color = 'rgba(76, 175, 80, 0.6)' }) => {
    const scaleX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const pulseScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Initial entrance animation
        const entranceAnimation = Animated.sequence([
            // Delay before starting
            Animated.delay(500),
            // Grow from center with fade in
            Animated.parallel([
                Animated.timing(scaleX, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ]);

        // Continuous pulse animation
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseScale, {
                    toValue: 1.05,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseScale, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );

        // Start entrance animation, then pulse
        entranceAnimation.start(() => {
            pulseAnimation.start();
        });

        return () => {
            scaleX.stopAnimation();
            opacity.stopAnimation();
            pulseScale.stopAnimation();
        };
    }, []);

    return (
        <Animated.View
            style={[
                styles.underline,
                {
                    width: width,
                    backgroundColor: color,
                    transform: [
                        { scaleX: scaleX },
                        { scaleY: pulseScale },
                    ],
                    opacity: opacity,
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    underline: {
        height: 3,
        borderRadius: 1.5,
        marginTop: hp(1),
        shadowColor: 'rgba(76, 175, 80, 0.4)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 3,
    },
});

export default AnimatedUnderline;