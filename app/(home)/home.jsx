import {Alert, StyleSheet, Text, View} from 'react-native'
import React from 'react'
import ScreenWrapper from "../../components/ScreenWrapper";
import Button from "../../components/Button";
import {useAuth} from "../../contexts/AuthContext";
import {supabase} from "../../lib/supabase";

const Home = () => {

    const {setAuth} = useAuth();
    const onLogout = async () => {
        // setAuth(null);
        const {error} = await supabase.auth.signOut();
        if(error){
            Alert.alert('LogOut', error.message);
        }
    }

    return (
        <ScreenWrapper style={{flex:1, justifyContent: 'center', alignItems: 'center'}} bg='white'>
            <Text style={styles.headerText}>Home</Text>
            <Button title={'Log Out'} onPress={onLogout} />
        </ScreenWrapper>
    )
}
export default Home
const styles = StyleSheet.create({
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,

    }
})
