import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { getUserData } from "../services/userService";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const setAuth = authUser=>{
        setUser(authUser);
    }

    const setUserData = userData => {
        setUser({...userData});
    }

    const logout = async () => {
        try {
            const {error} = await supabase.auth.signOut();
            if(error) {
                console.log('Logout error:', error);
                return {success: false, error: error.message};
            }
            return {success: true};
        } catch (error) {
            console.log('Logout error:', error);
            return {success: false, error: 'Failed to logout'};
        }
    }

    // Handle authentication in the context instead of the layout
    useEffect(() => {
        let isMounted = true;
        
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session)=> {
            if (!isMounted) return;
            
            // Only log significant events (temporarily disabled to stop spam)
            // if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || (_event === 'INITIAL_SESSION' && !isInitialized)) {
            //     console.log('Auth Event:', _event, 'Session User:', session?.user?.id);
            // }

            if (session && session.user) {
                setAuth(session?.user);
                // Get user data
                try {
                    const res = await getUserData(session?.user?.id);
                    if (res.success) {
                        setUserData({...session?.user, ...res.data});
                    }
                } catch (error) {
                    console.log('Error getting user data:', error);
                }
            } else {
                setAuth(null);
            }
            
            if (!isInitialized) {
                setIsInitialized(true);
            }
        });

        return () => {
            isMounted = false;
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{user, setAuth, setUserData, logout, isInitialized}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);