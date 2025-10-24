import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from 'lottie-react-native';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Icons from "../assets/icons/Icons";
import AnimatedUnderline from "../components/AnimatedUnderline";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import Input from "../components/Input";
import LeafAnimation from "../components/LeafAnimation";
import ScreenWrapper from "../components/ScreenWrapper";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import { supabase } from "../lib/supabase";
// Note: useFonts and SplashScreen imports are now handled in app/_layout.js

const SignUp = () => {
    const router = useRouter();
    const emailRef = useRef("");
    const passwordRef = useRef("");
    const nameRef = useRef("");
    const [loading, setLoading] = useState(false);

    const onSubmit= async () => {
        if(!emailRef.current || !passwordRef.current) {
            Alert.alert('Sign Up', 'Please fill in all fields!');
            return;
        }

        let name = nameRef.current.trim();
        let email = emailRef.current.trim();
        let password = passwordRef.current.trim();

        setLoading(true);
        const {data: {session}, error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name
                }
            }
        });

        setLoading(false);

        // console.log('session: ',session);
        // console.log('error: ',error);
        if(error){
            Alert.alert('Sign Up', error.message);
        } else if(session) {
            // Success! User has been signed up and logged in
            console.log('Sign up successful! User:', session.user.email);
            // Navigate to home immediately
            setTimeout(() => {
                router.replace('/home');
            }, 100);
        } else {
            // Email confirmation might be required - navigate to login
            router.replace('login');
        }

    }

    return (
        <ScreenWrapper bg='white'>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={0}
            >
                <View style={styles.container}>
                <StatusBar style="dark" />
                <BackButton router={router} />

                {/* Premium Leaf Animation */}
                <LeafAnimation />

                {/* Welcome Text with enhanced styling */}
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>Let&#39;s</Text>
                    <Text style={styles.welcomeText}>Get Started</Text>
                    <AnimatedUnderline width={wp(20)} />
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.formText}>Please fill the details to create an account</Text>

                    <Input
                        icon={<Icons name='user' size={26} color='grey' />}
                        placeholder="Enter your name"
                        keyboardType="default"
                        onChangeText={value => nameRef.current = value}
                    />

                    <Input
                        icon={<Icons name='mail' size={26} color='grey' />}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        onChangeText={value => emailRef.current = value}
                    />

                    <Input
                        icon={<Icons name='lock' size={26} color='grey' />}
                        placeholder="Enter your password"
                        keyboardType="default"
                        secureTextEntry
                        onChangeText={value => passwordRef.current = value}
                    />

                    {/*button*/}
                    <Button title={'Sign Up'} loading={loading} onPress={onSubmit} />
                </View>

                {/*footer*/}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Already have an account?
                    </Text>
                    <Pressable onPress={() => router.push('login')}>
                        <Text style={[styles.footerText, {color: theme.colors.primaryDark, fontWeight: 'bold'}]}>
                            Login
                        </Text>
                    </Pressable>
                </View>

            </View>
            
            {/* Bottom Nature Animation */}
            <View style={styles.bottomAnimation}>
                <LottieView
                    source={require('../assets/animations/nature.json')}
                    style={styles.natureAnimation}
                    autoPlay
                    loop
                    speed={0.8}
                />
            </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default SignUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 45,
        paddingHorizontal: wp(5),
        position: 'relative',
    },
    welcomeContainer: {
        position: 'relative',
        zIndex: 2, // Above the leaf animation
        paddingTop: hp(2),
    },
    welcomeText: {
        fontSize: hp(4.2),
        fontFamily: 'SFNSDisplay-Heavy',
        color: '#1a1a1a',
        lineHeight: hp(4.8),
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.05)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    form: {
        gap: 25,
        zIndex: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: wp(4),
        shadowColor: 'rgba(0, 0, 0, 0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 4,
    },
    formText: {
        fontSize: hp(1.7),
        color: theme.colors.text,
        textAlign: 'center',
        opacity: 0.8,
        fontFamily: 'SFNSText-Medium',
    },
    forgotPassword: {
        textAlign: "right",
        fontWeight: "500",
        color: theme.colors.textLight,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: "center",
        alignItems: "center",
        gap: 5,
        zIndex: 10,
        paddingBottom: hp(3),
        position: 'relative',
    },
    footerText: {
        textAlign: "center",
        color: theme.colors.text,
        fontSize: hp(1.6),
        fontFamily: 'SFNSText-Regular',
    },
    bottomAnimation: {
        position: 'absolute',
        bottom: -hp(3),
        left: -wp(30),
        right: -wp(30),
        width: wp(160),
        height: hp(20),
        zIndex: 1,
        opacity: 0.8,
        overflow: 'visible',
        marginLeft: 0,
        marginRight: 0,
        paddingLeft: 0,
        paddingRight: 0,
    },
    natureAnimation: {
        width: wp(160),
        height: hp(20),
        tintColor: '#2E86C1',
        resizeMode: 'stretch',
        transform: [{ scaleX: 1.5 }],
    }
});
