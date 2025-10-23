import {View, Text, Button} from 'react-native'
import React from 'react'
import {useRouter} from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";

const Index = () => {

    const router = useRouter();

    return (
        <ScreenWrapper>
            <Text>Index</Text>
            <Button title="welcome" onPress={() => router.push('welcome')} />
        </ScreenWrapper>
    )
}
export default Index
