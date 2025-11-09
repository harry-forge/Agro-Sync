// app/(tabs)/fields/index.jsx
import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from "react-native";
import ScreenWrapper from "../../../components/ScreenWrapper";
import { hp, wp } from "../../../helpers/common";
import { theme } from "../../../constants/theme";
import { useRouter } from "expo-router";
import { useFields } from "../../../contexts/FieldContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

export default function FieldsIndex() {
    const router = useRouter();
    const { fields } = useFields();

    return (
        <ScreenWrapper bg="#f8fafb">
            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <View>
                        <Text style={styles.greeting}>Your Farm</Text>
                        <Text style={styles.title}>Field Management</Text>
                    </View>
                    <View style={styles.statsChip}>
                        <Ionicons name="leaf" size={16} color="#16a34a" />
                        <Text style={styles.statsText}>{fields.length} Field{fields.length !== 1 ? 's' : ''}</Text>
                    </View>
                </View>

                {/* Field Cards */}
                <View style={styles.fieldsGrid}>
                    {fields.map((f, idx) => (
                        <Pressable
                            key={f.id}
                            style={({ pressed }) => [
                                styles.fieldCard,
                                pressed && styles.fieldCardPressed
                            ]}
                            onPress={() => router.push(`/fields/${f.id}`)}
                        >
                            {/* Gradient Overlay */}
                            <View style={styles.cardGradientTop} />

                            {/* Icon Badge */}
                            <View style={styles.iconBadge}>
                                <Ionicons name="location" size={20} color="#16a34a" />
                            </View>

                            {/* Field Content */}
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{f.name}</Text>
                                <Text style={styles.cardSubtitle}>Active • Monitoring</Text>

                                {/* Quick Stats */}
                                <View style={styles.quickStats}>
                                    <View style={styles.statItem}>
                                        <Ionicons name="thermometer-outline" size={14} color="#64748b" />
                                        <Text style={styles.statLabel}>Live Data</Text>
                                    </View>
                                    <View style={styles.statDivider} />
                                    <View style={styles.statItem}>
                                        <Ionicons name="analytics-outline" size={14} color="#64748b" />
                                        <Text style={styles.statLabel}>AI Ready</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Action Arrow */}
                            <View style={styles.arrowContainer}>
                                <Ionicons name="arrow-forward" size={20} color="#16a34a" />
                            </View>

                            {/* Decorative Elements */}
                            <View style={styles.decorCircle1} />
                            <View style={styles.decorCircle2} />
                        </Pressable>
                    ))}

                    {/* Add Field Card */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.addFieldCard,
                            pressed && styles.addFieldCardPressed
                        ]}
                        onPress={() =>
                            Alert.alert("Coming Soon", "Multiple fields support.json is coming soon!")
                        }
                    >
                        <View style={styles.addIconContainer}>
                            <View style={styles.addIconCircle}>
                                <Ionicons name="add" size={32} color="#16a34a" />
                            </View>
                            <View style={styles.pulseRing} />
                        </View>
                        <Text style={styles.addTitle}>Add New Field</Text>
                        <Text style={styles.addSubtitle}>Expand your farm monitoring</Text>

                        {/* Coming Soon Badge */}
                        <View style={styles.comingSoonBadge}>
                            <Text style={styles.comingSoonText}>Soon</Text>
                        </View>
                    </Pressable>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoIconContainer}>
                            <Ionicons name="bulb" size={24} color="#f59e0b" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.infoTitle}>Smart Monitoring</Text>
                            <Text style={styles.infoText}>
                                Real-time IoT sensors track temperature, humidity, and soil moisture for optimal crop health.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: hp(2),
        paddingBottom: hp(12),
    },
    headerSection: {
        paddingHorizontal: wp(5),
        marginBottom: hp(3),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    greeting: {
        fontSize: hp(1.6),
        fontFamily: "SFNSText-Medium",
        color: "#64748b",
        marginBottom: hp(0.3),
    },
    title: {
        fontSize: hp(3.2),
        fontFamily: "SFNSDisplay-Heavy",
        color: "#0f172a",
        letterSpacing: -0.5,
    },
    statsChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(1.5),
        backgroundColor: "#f0fdf4",
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    statsText: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Bold",
        color: "#16a34a",
    },
    fieldsGrid: {
        paddingHorizontal: wp(5),
        gap: hp(2),
    },
    fieldCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: wp(5),
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.1)",
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
        overflow: "hidden",
        position: "relative",
    },
    fieldCardPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    cardGradientTop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: "#16a34a",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    iconBadge: {
        position: "absolute",
        top: wp(5),
        right: wp(5),
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#f0fdf4",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    cardContent: {
        gap: hp(0.8),
        paddingRight: wp(12),
    },
    cardTitle: {
        fontSize: hp(2.2),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
        marginTop: hp(0.5),
    },
    cardSubtitle: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Medium",
        color: "#16a34a",
    },
    quickStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        marginTop: hp(1),
        paddingTop: hp(1.5),
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    },
    statItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(1.5),
    },
    statLabel: {
        fontSize: hp(1.3),
        fontFamily: "SFNSText-Medium",
        color: "#64748b",
    },
    statDivider: {
        width: 1,
        height: 16,
        backgroundColor: "#e2e8f0",
    },
    arrowContainer: {
        position: "absolute",
        bottom: wp(5),
        right: wp(5),
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0fdf4",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    decorCircle1: {
        position: "absolute",
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(16, 185, 129, 0.03)",
    },
    decorCircle2: {
        position: "absolute",
        bottom: -20,
        left: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(16, 185, 129, 0.02)",
    },
    addFieldCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: wp(6),
        borderWidth: 2,
        borderColor: "#e2e8f0",
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        minHeight: hp(22),
        position: "relative",
        overflow: "hidden",
    },
    addFieldCardPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.8,
    },
    addIconContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: hp(2),
    },
    addIconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#f0fdf4",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#bbf7d0",
        zIndex: 2,
    },
    pulseRing: {
        position: "absolute",
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        zIndex: 1,
    },
    addTitle: {
        fontSize: hp(2),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
        marginBottom: hp(0.5),
    },
    addSubtitle: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Regular",
        color: "#64748b",
        textAlign: "center",
    },
    comingSoonBadge: {
        position: "absolute",
        top: wp(4),
        right: wp(4),
        backgroundColor: "#fef3c7",
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.5),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#fde047",
    },
    comingSoonText: {
        fontSize: hp(1.2),
        fontFamily: "SFNSText-Bold",
        color: "#ca8a04",
        textTransform: "uppercase",
    },
    infoSection: {
        paddingHorizontal: wp(5),
        marginTop: hp(3),
    },
    infoCard: {
        backgroundColor: "#fffbeb",
        borderRadius: 16,
        padding: wp(4),
        flexDirection: "row",
        gap: wp(3),
        borderWidth: 1,
        borderColor: "#fef3c7",
    },
    infoIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#fef9c3",
        alignItems: "center",
        justifyContent: "center",
    },
    infoContent: {
        flex: 1,
        gap: hp(0.4),
    },
    infoTitle: {
        fontSize: hp(1.6),
        fontFamily: "SFNSDisplay-Bold",
        color: "#78350f",
    },
    infoText: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Regular",
        color: "#92400e",
        lineHeight: hp(2),
    },
});