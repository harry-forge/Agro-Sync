import {Pressable, StyleSheet, Text, View} from 'react-native' // Removed unused 'View'
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
        loading = false, // Corrected typo: 'laoding' to 'loading'
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
        return (
            <View style={[styles.button, buttonStyle, {backgroundColor: 'white'}]}>
                <Loading />
            </View>
        )
    }

    return (
        <Pressable onPress={onPress} style={[styles.button, buttonStyle, hasShadow && shadowStyle]}>
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
    text: {
        color: 'white', // Ensure text color is visible against the button background
        fontWeight: 'bold',
        fontSize: 16
    }
})