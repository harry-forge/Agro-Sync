import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LottieView from 'lottie-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from "../components/Button";
import LeafAnimation from "../components/LeafAnimation";
import ScreenWrapper from "../components/ScreenWrapper";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";

export default function Welcome() {

    const router = useRouter();

    return (
        <ScreenWrapper bg='white'>
            <StatusBar style="dark" />
            <LeafAnimation />
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
        zIndex: 20,
        position: 'relative',
    },
    loginText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6),
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
})
