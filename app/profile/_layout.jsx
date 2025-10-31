import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen
                name="edit"
                options={{
                    presentation: 'card',
                    animation: 'slide_from_right'
                }}
            />
        </Stack>
    );
}