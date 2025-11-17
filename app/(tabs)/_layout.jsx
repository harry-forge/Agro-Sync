import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

const TabBarIcon = ({ name, color, focused }) => {
    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Ionicons
                name={name}
                size={focused ? 28 : 26}
                color={color}
            />
        </View>
    );
};

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#22C55E',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
                    height: 80,
                    paddingBottom: 15,
                    paddingTop: 12,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 8,
                },
                tabBarItemStyle: {
                    paddingVertical: 5,
                },
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
    );
}
