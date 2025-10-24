import { router } from "expo-router";
import { Alert, StyleSheet, Text } from 'react-native';
import Button from "../../components/Button";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";

const Home = () => {

    const {logout} = useAuth();
    
    const onLogout = async () => {
        const result = await logout();
        if(result.success) {
            // Successfully logged out, navigate to welcome screen
            router.replace('/welcome');
        } else {
            Alert.alert('LogOut Error', result.error || 'Failed to log out. Please try again.');
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
