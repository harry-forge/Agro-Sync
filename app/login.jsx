import {StyleSheet, Text, View} from 'react-native'
import React from 'react'
import ScreenWrapper from "../components/ScreenWrapper";

const Login = () => {
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <Text style={styles.headerText}>Login Page</Text>
            </View>
        </ScreenWrapper>
    )
}
export default Login
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
    }
})
