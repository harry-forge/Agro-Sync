import {StyleSheet, Text, TextInput, View} from 'react-native'
import React from 'react'
import ScreenWrapper from "../components/ScreenWrapper";

const SignUp = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Sign Up Page</Text>
        </View>
    )
}
export default SignUp
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
    },

})
