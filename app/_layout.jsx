import {View, Text} from 'react-native'
import React from 'react'
import {Stack} from "expo-router";

const _Layout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false
            }}
        />
    )
}
export default _Layout
