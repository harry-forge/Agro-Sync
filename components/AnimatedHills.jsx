import { useEffect, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width: screenWidth } = Dimensions.get('window');

const AnimatedHills = ({ height = 100, colors = ['#4CAF50', '#66BB6A', '#81C784'] }) => {
    const translateX1 = useRef(new Animated.Value(0)).current;
    const translateX2 = useRef(new Animated.Value(-screenWidth * 0.3)).current;
    const translateX3 = useRef(new Animated.Value(-screenWidth * 0.6)).current;

    useEffect(() => {
        const createAnimation = (animatedValue, duration, delay = 0) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(animatedValue, {
                        toValue: -screenWidth * 0.3,
                        duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        // Very slow, subtle animations for parallax effect
        const anim1 = createAnimation(translateX1, 25000); // Very slow background
        const anim2 = createAnimation(translateX2, 20000, 2000); // Medium
        const anim3 = createAnimation(translateX3, 15000, 4000); // Foreground

        anim1.start();
        anim2.start();
        anim3.start();

        return () => {
            anim1.stop();
            anim2.stop();
            anim3.stop();
        };
    }, [translateX1, translateX2, translateX3]);

    // Generate more organic hill paths
    const createHillPath = (amplitude = 40, frequency = 0.002, phase = 0, peaks = 3) => {
        const points = [];
        const extendedWidth = screenWidth * 1.8; // Extend beyond screen for seamless animation
        
        for (let x = 0; x <= extendedWidth; x += 3) {
            // Multiple sine waves for more natural hills
            const baseWave = Math.sin(x * frequency + phase) * amplitude;
            const detailWave = Math.sin(x * frequency * 2.5 + phase) * (amplitude * 0.3);
            const microWave = Math.sin(x * frequency * 4 + phase) * (amplitude * 0.1);
            
            const y = baseWave + detailWave + microWave + height * 0.6;
            points.push(`${x},${Math.max(y, height * 0.3)}`); // Ensure minimum height
        }
        
        return `M0,${height} L${points.join(' L')} L${extendedWidth},${height} Z`;
    };

    const AnimatedSvg = Animated.createAnimatedComponent(Svg);

    return (
        <View style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height,
            overflow: 'hidden',
            zIndex: -1
        }}>
            {/* Background Hill - Slowest, largest */}
            <AnimatedSvg
                height={height}
                width={screenWidth * 1.8}
                style={{
                    position: 'absolute',
                    transform: [{ translateX: translateX1 }],
                }}
                viewBox={`0 0 ${screenWidth * 1.8} ${height}`}
            >
                <Defs>
                    <LinearGradient id="hillGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={colors[0]} stopOpacity="0.9" />
                        <Stop offset="100%" stopColor={colors[0]} stopOpacity="0.7" />
                    </LinearGradient>
                </Defs>
                <Path
                    d={createHillPath(35, 0.0015, 0)}
                    fill="url(#hillGradient1)"
                />
            </AnimatedSvg>

            {/* Middle Hill - Medium speed */}
            <AnimatedSvg
                height={height}
                width={screenWidth * 1.8}
                style={{
                    position: 'absolute',
                    transform: [{ translateX: translateX2 }],
                }}
                viewBox={`0 0 ${screenWidth * 1.8} ${height}`}
            >
                <Defs>
                    <LinearGradient id="hillGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={colors[1]} stopOpacity="0.8" />
                        <Stop offset="100%" stopColor={colors[1]} stopOpacity="0.5" />
                    </LinearGradient>
                </Defs>
                <Path
                    d={createHillPath(30, 0.002, Math.PI / 4)}
                    fill="url(#hillGradient2)"
                />
            </AnimatedSvg>

            {/* Front Hill - Fastest, smallest */}
            <AnimatedSvg
                height={height}
                width={screenWidth * 1.8}
                style={{
                    position: 'absolute',
                    transform: [{ translateX: translateX3 }],
                }}
                viewBox={`0 0 ${screenWidth * 1.8} ${height}`}
            >
                <Defs>
                    <LinearGradient id="hillGradient3" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={colors[2]} stopOpacity="0.6" />
                        <Stop offset="100%" stopColor={colors[2]} stopOpacity="0.3" />
                    </LinearGradient>
                </Defs>
                <Path
                    d={createHillPath(25, 0.0025, Math.PI / 2)}
                    fill="url(#hillGradient3)"
                />
            </AnimatedSvg>

            {/* Soft gradient overlay for smooth blending with content */}
            <View style={{
                position: 'absolute',
                bottom: -2,
                left: 0,
                right: 0,
                height: 30,
                backgroundColor: 'white',
                opacity: 0.8,
            }} />
        </View>
    );
};

export default AnimatedHills;