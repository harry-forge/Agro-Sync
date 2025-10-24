import { useRouter } from "expo-router";
import { useEffect } from 'react';
import { View } from 'react-native';
import Loading from "../components/Loading";
import { useAuth } from "../contexts/AuthContext";

const Index = () => {
    const router = useRouter();
    const { user, isInitialized } = useAuth();

    useEffect(() => {
        if (isInitialized) {
            if (user) {
                router.replace('/home');
            } else {
                router.replace('/welcome');
            }
        }
    }, [user, isInitialized, router]);

    return (
       <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
           <Loading />
       </View>
    )
}
export default Index
