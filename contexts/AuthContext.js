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
            // Force clear user state immediately and wait briefly for state update
            setUser(null);
            setIsInitialized(false);
            
            // Small delay to ensure state updates propagate
            await new Promise(resolve => setTimeout(resolve, 100));
            setIsInitialized(true);
            
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
            
            // Log important auth events for debugging
            if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || (_event === 'INITIAL_SESSION' && !isInitialized)) {
                console.log('Auth Event:', _event, 'Session User:', session?.user?.id || 'No user');
            }

            if (session && session.user) {
                console.log('Setting user from session:', session.user); // Debug log
                console.log('Session user email:', session.user.email); // Debug log
                
                // Always keep the session user as base data
                let finalUser = session.user;
                
                // Try to get additional user data from database
                try {
                    const res = await getUserData(session?.user?.id);
                    if (res.success && res.data) {
                        // Merge database data with session data, keeping session email
                        finalUser = {
                            ...session.user,  // Session data (including email) comes first
                            ...res.data,      // Database data overlays
                            email: session.user.email  // Ensure email always comes from session
                        };
                        console.log('Merged user data:', finalUser); // Debug log
                    } else {
                        console.log('No database user data, using session data only');
                    }
                } catch (error) {
                    console.log('Error getting user data, using session data only:', error);
                }
                
                // Set the final user data
                setUser(finalUser);
            } else {
                console.log('No session, clearing user state');
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