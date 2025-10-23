import {StyleSheet, Text, View, Image, Pressable} from 'react-native'
import React from 'react'
import ScreenWrapper from "../components/ScreenWrapper";
import {StatusBar} from "expo-status-bar";
import {hp, wp} from "../helpers/common";
import {theme} from "../constants/theme";
import Button from "../components/Button";
import {useRouter} from "expo-router";

export default function Welcome() {

    const router = useRouter();

    return (
        <ScreenWrapper bg='white'>
            <StatusBar style="dark" />
            <View style={styles.container}>

                {/* Welcome Image */}
                <Image
                    style={styles.welcomeImage}
                    resizeMode='contain'
                    source={require('../assets/images/boardingImage.png')}
                />

                {/*  Title  */}
                <View style={{gap: 8}}>
                    <Text style={styles.title}>AgroSync</Text>
                    <Text style={styles.punchline}>Where farming meets foresight.</Text>
                </View>

                <View style={styles.footer}>
                    <Button
                        title = "Getting Started"
                        style={{marginHorizontal: wp(3)}}
                        onPress={() => router.push('signUp')}
                    />

                    <View style={styles.bottomTextContainer}>
                        <Text style={styles.loginText}>
                            Already have an account?
                        </Text>
                        <Pressable onPress={()=> router.push('login')}>
                            <Text style={[styles.loginText, {color: theme.colors.primaryDark, fontWeight: 'bold'}]}>
                                Login
                            </Text>
                        </Pressable>
                    </View>
                </View>

            </View>
        </ScreenWrapper>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: wp(4)
    },
    welcomeImage: {
        height: hp(50),
        width: wp(100),
        alignSelf: 'center',
    },
    title: {
        color: 'black',
        fontSize: hp(5),
        textAlign: 'center',
        fontWeight: 'bold'

    },
    punchline: {
        textAlign: 'center',
        paddingHorizontal: wp(4),
        fontSize: hp(1.7),
        color: theme.colors.text
    },
    footer: {
        gap: 30,
        width: '100%'
    },
    bottomTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        marginBottom: hp(10),
    },
    loginText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6),
    }
})
