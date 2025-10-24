import {Pressable, StyleSheet, Text, View} from 'react-native'
import React from 'react'
import {theme} from "../constants/theme";
import {hp} from "../helpers/common";
import Loading from "./Loading";

const Button = (
    {
        buttonStyle,
        textStyle,
        title = '',
        onPress = () => {
        },
        loading = false,
        hasShadow = true,
    }
) => {
    const shadowStyle = {
        shadowColor: theme.colors.dark,
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    }

    if(loading){
        // CRITICAL FIX: Use a dedicated 'loading' style.
        // The default button style applies the primary color, which might clash.
        // The `loadingButton` style ensures the button remains its height/width
        // but has a clean, non-shadow background for the spinner.
        return (
            <View style={[styles.button, buttonStyle, styles.loadingButton]}>
                <Loading color={theme.colors.primaryDark} />
            </View>
        )
    }

    return (
        <Pressable
            onPress={onPress}
            style={[styles.button, buttonStyle, hasShadow && shadowStyle]}
        >
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </Pressable>
    )
}
export default Button

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        height: hp(6.6),
        justifyContent: 'center',
        alignItems: 'center',
        borderCurve: 'continuous',
        borderRadius: theme.radius.sm,
    },
    // New style for the loading state
    loadingButton: {
        backgroundColor: theme.colors.white, // Ensure a clean background when loading
        shadowOpacity: 0, // Explicitly remove shadow in loading state
        elevation: 0,
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
})
