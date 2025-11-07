import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import {FieldProvider} from "../../contexts/FieldContext";

const COLORS = {
    primary: '#22C55E', // Vibrant green
    primaryDark: '#16A34A',
    background: '#FFFFFF',
    inactive: '#94A3B8',
    activeBackground: '#DCFCE7', // Light green background
    shadow: '#000000',
    border: '#F1F5F9',
};

// Enhanced Tab Bar Icon Component
const TabBarIcon = ({ name, color, focused }) => {
    return (
        <View style={[
            styles.iconWrapper,
            focused && styles.iconWrapperActive
        ]}>
            <View style={[
                styles.iconContainer,
                focused && styles.iconContainerActive
            ]}>
                <Ionicons
                    name={name}
                    size={focused ? 28 : 26}
                    color={focused ? COLORS.primary : color}
                />
            </View>
            {focused && <View style={styles.activeIndicator} />}
        </View>
    );
};

export default function TabLayout() {
    return (
        <FieldProvider>
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.inactive,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    backgroundColor: COLORS.background,
                    borderRadius: 30,
                    height: 80,
                    paddingBottom: 15,
                    paddingTop: 12,
                    paddingHorizontal: 15,
                    borderTopWidth: 0,
                    borderWidth: 0,
                    marginHorizontal: 15,
                    ...Platform.select({
                        ios: {
                            shadowColor: COLORS.shadow,
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.15,
                            shadowRadius: 25,
                        },
                        android: {
                            elevation: 15,
                        },
                    }),
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontFamily: 'SFNSText-Bold',
                    fontWeight: '700',
                    letterSpacing: 0.5,
                    marginTop: 8,
                },
                tabBarItemStyle: {
                    paddingVertical: 5,
                },
                tabBarShowLabel: true,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "home" : "home-outline"}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="recommendation"
                options={{
                    title: "Market",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "telescope" : "telescope-outline"}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="fields"
                options={{
                    title: "Fields",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "leaf" : "leaf-outline"}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="help"
                options={{
                    title: "Help",
                    tabBarIcon: ({ color, focused }) => (
                        <TabBarIcon
                            name={focused ? "compass" : "compass-outline"}
                            color={color}
                            focused={focused}
                        />
                    ),
                }}
            />
        </Tabs>
        </FieldProvider>
    );
}

const styles = StyleSheet.create({
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapperActive: {
        transform: [{ translateY: -3 }],
    },
    iconContainer: {
        width: 66,
        height: 42,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
        backgroundColor: 'transparent',
    },
    iconContainerActive: {
        backgroundColor: COLORS.activeBackground,
        ...Platform.select({
            ios: {
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
            },
            android: {
                elevation: 5,
                marginBottom: 6,
            },
        }),
    },
    activeIndicator: {
        width: 30,
        height: 3,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
        marginTop: 6,
        marginBottom: -14,
        position: 'absolute',
        bottom: -10,
    },
});