import {Alert, Pressable, StyleSheet, Text, View} from 'react-native';
import React, { useRef, useState } from 'react';
import ScreenWrapper from "../components/ScreenWrapper";
import BackButton from "../components/BackButton";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import Input from "../components/Input";
import Icons from "../assets/icons/Icons";
import Button from "../components/Button";
import {supabase} from "../lib/supabase";
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
        }

    }

    return (
        <ScreenWrapper bg='white'>
            <View style={styles.container}>
                <StatusBar style="dark" />
                <BackButton router={router} />

                {/* Welcome Text */}
                <View>
                    <Text style={styles.welcomeText}>Let&#39;s</Text>
                    <Text style={styles.welcomeText}>Get Started</Text>
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
        </ScreenWrapper>
    );
};

export default SignUp;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 45,
        paddingHorizontal: wp(5),
    },
    welcomeText: {
        fontSize: hp(4),
        fontFamily: 'SFNSDisplay-Heavy',
    },
    form: {
        gap: 25,
    },
    formText: {
        fontSize: hp(1.7),
        color: theme.colors.text,
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
    },
    footerText: {
        textAlign: "center",
        color: theme.colors.text,
        fontSize: hp(1.6),
    }
});
