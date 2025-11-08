// app/(tabs)/fields/index.jsx
import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from "react-native";
import ScreenWrapper from "../../../components/ScreenWrapper";
import { hp, wp } from "../../../helpers/common";
import { theme } from "../../../constants/theme";
import { useRouter } from "expo-router";
import { useFields } from "../../../contexts/FieldContext";

export default function FieldsIndex() {
    const router = useRouter();
    const { fields } = useFields(); // future-proof list

    return (
        <ScreenWrapper bg="white">
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Your Fields</Text>

                {fields.map((f) => (
                    <Pressable
                        key={f.id}
                        style={styles.card}
                        onPress={() => router.push(`/fields/${f.id}`)}
                    >
                        <Text style={styles.cardTitle}>{f.name}</Text>
                        <Text style={styles.small}>Tap to open details</Text>
                    </Pressable>
                ))}

                <Pressable
                    style={[styles.card, styles.addCard]}
                    onPress={() =>
                        // Alert.alert("Coming Soon", "Multiple fields support is coming soon!")
                        Alert.alert("Coming Soon", "Oooo Madarchod, Kal Aana!")
                    }
                >
                    <Text style={styles.addText}>+ Add Field</Text>
                </Pressable>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        gap: hp(2),
        paddingBottom: hp(20),
    },
    title: {
        fontSize: hp(2.4),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
        marginBottom: hp(1),
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: wp(5),
        borderWidth: 1,
        borderColor: "rgba(80,200,120,0.12)",
        shadowColor: "rgb(2,57,18)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    cardTitle: {
        fontSize: hp(2),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
    },
    small: {
        marginTop: hp(0.5),
        fontSize: hp(1.5),
        color: theme.colors.textLight,
        fontFamily: "SFNSText-Regular",
    },
    addCard: { alignItems: "center" },
    addText: {
        fontSize: hp(2),
        fontFamily: "SFNSDisplay-Heavy",
        color: theme.colors.primary,
    },
});
