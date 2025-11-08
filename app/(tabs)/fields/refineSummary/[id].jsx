import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFieldData } from "../../../../contexts/FieldContext";
import { theme } from "../../../../constants/theme";
import { hp, wp } from "../../../../helpers/common";
import ScreenWrapper from "../../../../components/ScreenWrapper";
import BackButton from "../../../../components/BackButton";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MotiView } from "moti";

export default function RefineSummary() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { fieldData } = useFieldData();
    const refined = fieldData?.refinedRecommendation;
    const hasRefined = !!refined;

    const moisturePct =
        fieldData?.moisture != null
            ? `${Math.max(0, Math.min(100, Math.round(Number(fieldData.moisture))))}%`
            : "—";

    return (
        <ScreenWrapper bg="white">
            <View style={styles.header}>
                <BackButton router={router} />
                <Text style={styles.pageTitle}>Refined Recommendation</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Banner */}
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: "timing", duration: 600 }}
                    style={styles.banner}
                >
                    <View style={styles.bannerLeft}>
                        <Ionicons name="sparkles" size={30} color="white" />
                        <View style={{ marginLeft: wp(3) }}>
                            <Text style={styles.bannerTitle}>
                                {hasRefined ? "Tailored Insights" : "Refine Your Field"}
                            </Text>
                            <Text style={styles.bannerSubtitle}>
                                {hasRefined
                                    ? "Based on real sensor and field data"
                                    : "No refined recommendations yet"}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.bestCropPill}>
                        <Text style={styles.bestCropText}>
                            {hasRefined ? refined.topCrops?.[0]?.name || "—" : "None"}
                        </Text>
                    </View>
                </MotiView>

                {/* Sensor Snapshot */}
                <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 200 }}
                    style={styles.sensorsCard}
                >
                    <Text style={styles.cardTitleSmall}>Sensor Snapshot</Text>
                    <View style={styles.sensorRow}>
                        <SensorItem label="Temperature" value={`${fieldData.temperature ?? "—"}°C`} icon="thermometer" />
                        <SensorItem label="Humidity" value={`${fieldData.humidity ?? "—"}%`} icon="water" />
                        <SensorItem label="Moisture" value={moisturePct} icon="leaf" />
                    </View>
                    <View style={[styles.sensorRow, { marginTop: hp(1) }]}>
                        <SensorItem label="Rainfall" value={`${fieldData.rainfall ?? "—"} mm`} icon="cloudy" />
                        <SensorItem label="Soil pH" value={`${fieldData.pH ?? "—"}`} icon="flask" />
                        <SensorItem
                            label="N / P / K"
                            value={`${fieldData.N ?? "—"} / ${fieldData.P ?? "—"} / ${fieldData.K ?? "—"}`}
                            icon="bar-chart"
                        />
                    </View>
                </MotiView>

                {!hasRefined ? (
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: 300 }}
                        style={styles.emptyCard}
                    >
                        <Ionicons name="sparkles-outline" size={38} color={theme.colors.primary} />
                        <Text style={styles.emptyText}>No refined recommendations yet</Text>
                        <Text style={styles.emptySubText}>
                            Provide additional details about your field to get advanced crop recommendations and profitability insights.
                        </Text>
                        <Pressable
                            style={styles.actionBtn}
                            onPress={() => router.push(`/fields/refine/${id}`)}
                        >
                            <Ionicons name="options-outline" size={18} color="white" />
                            <Text style={styles.actionBtnText}>Start Refinement</Text>
                        </Pressable>
                    </MotiView>
                ) : (
                    <>
                        {/* Top Crops */}
                        <MotiView
                            from={{ opacity: 0, translateY: 40 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 250 }}
                            style={styles.sectionCard}
                        >
                            <View style={styles.sectionHeader}>
                                <Ionicons name="leaf" size={20} color="#16a34a" />
                                <Text style={styles.sectionTitle}>Top Crop Recommendations</Text>
                            </View>
                            {refined.topCrops.map((c, idx) => (
                                <View key={idx} style={[styles.cropCard, idx === 0 && styles.cropCardPrimary]}>
                                    <View style={styles.cropHeader}>
                                        <Text style={styles.cropRank}>#{idx + 1}</Text>
                                        <Text style={styles.cropName}>{c.name}</Text>
                                    </View>
                                    <Text style={styles.cropReason}>{c.reason}</Text>
                                    <View style={styles.cropMetrics}>
                                        <Metric icon="trending-up" text={c.expectedYield} color="#22c55e" />
                                        <Metric icon="cash-outline" text={c.estimatedProfit} color="#22c55e" />
                                        <Metric icon="time-outline" text={c.growingPeriod} color="#64748b" />
                                    </View>
                                </View>
                            ))}
                        </MotiView>

                        {/* Crops to Avoid */}
                        <MotiView
                            from={{ opacity: 0, translateY: 40 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 350 }}
                            style={styles.sectionCard}
                        >
                            <View style={styles.sectionHeader}>
                                <Ionicons name="close-circle" size={20} color="#ef4444" />
                                <Text style={styles.sectionTitle}>Crops to Avoid</Text>
                            </View>
                            {refined.avoidCrops.map((c, idx) => (
                                <View key={idx} style={styles.avoidCard}>
                                    <Text style={styles.avoidName}>{c.name}</Text>
                                    <Text style={styles.avoidReason}>{c.reason}</Text>
                                </View>
                            ))}
                        </MotiView>

                        {/* Soil Improvements */}
                        <MotiView
                            from={{ opacity: 0, translateY: 40 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 450 }}
                            style={styles.sectionCard}
                        >
                            <View style={styles.sectionHeader}>
                                <Ionicons name="flask" size={20} color="#f59e0b" />
                                <Text style={styles.sectionTitle}>Soil Improvement Tips</Text>
                            </View>
                            {refined.soilImprovements.map((t, idx) => (
                                <View key={idx} style={styles.tipRow}>
                                    <View style={styles.tipBullet}><Text style={styles.tipBulletText}>{idx + 1}</Text></View>
                                    <Text style={styles.tipText}>{t}</Text>
                                </View>
                            ))}
                        </MotiView>

                        {/* Profit Strategies */}
                        <MotiView
                            from={{ opacity: 0, translateY: 40 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 550 }}
                            style={styles.sectionCard}
                        >
                            <View style={styles.sectionHeader}>
                                <Ionicons name="bulb" size={20} color="#8b5cf6" />
                                <Text style={styles.sectionTitle}>Profit Maximization</Text>
                            </View>
                            {refined.profitStrategies.map((p, idx) => (
                                <View key={idx} style={styles.strategyRow}>
                                    <View style={styles.strategyBullet}><Ionicons name="checkmark" size={14} color="white" /></View>
                                    <Text style={styles.strategyText}>{p}</Text>
                                </View>
                            ))}
                        </MotiView>

                        {/* Refine Again CTA */}
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 650 }}
                        >
                            <Pressable
                                style={[styles.actionBtn, { marginTop: hp(3) }]}
                                onPress={() => router.push(`/fields/refine/${id}`)}
                            >
                                <Ionicons name="refresh-outline" size={18} color="white" />
                                <Text style={styles.actionBtnText}>Refine Again</Text>
                            </Pressable>
                        </MotiView>
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

function SensorItem({ label, value, icon }) {
    return (
        <View style={styles.sensorItem}>
            <View style={styles.sensorIcon}>
                <Ionicons name={icon} size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.sensorLabel}>{label}</Text>
            <Text style={styles.sensorValue}>{value}</Text>
        </View>
    );
}

function Metric({ icon, text, color }) {
    return (
        <View style={styles.metricItem}>
            <Ionicons name={icon} size={16} color={color} />
            <Text style={styles.metricText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: hp(1),
    },
    pageTitle: {
        fontSize: hp(2.3),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
    },
    container: {
        paddingHorizontal: wp(5),
        paddingTop: hp(1),
        paddingBottom: hp(16),
        gap: hp(2),
    },
    banner: {
        borderRadius: 16,
        padding: wp(4),
        backgroundColor: "#065f46",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#064e3b",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
        elevation: 14,
    },
    bannerLeft: { flexDirection: "row", alignItems: "center" },
    bannerTitle: { color: "white", fontSize: hp(1.9), fontFamily: "SFNSDisplay-Bold" },
    bannerSubtitle: { color: "rgba(255,255,255,0.9)", fontSize: hp(1.2), marginTop: hp(0.2) },
    bestCropPill: {
        backgroundColor: "rgba(255,255,255,0.12)",
        paddingVertical: hp(0.6),
        paddingHorizontal: wp(3),
        borderRadius: 20,
    },
    bestCropText: { color: "white", fontFamily: "SFNSDisplay-Heavy", fontSize: hp(1.6) },
    sensorsCard: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: wp(3.5),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.04)",
        shadowColor: "#0b3b1f",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 18,
        elevation: 8,
        gap: hp(1),
    },
    cardTitleSmall: {
        fontSize: hp(1.3),
        color: theme.colors.textLight,
        fontFamily: "SFNSText-Medium",
        marginBottom: hp(0.6),
    },
    sensorRow: {
        flexDirection: "row",
        gap: wp(3),
        justifyContent: "space-between",
    },
    sensorItem: { flex: 1, alignItems: "center", paddingVertical: hp(1) },
    sensorIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#f0fdf4",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: hp(0.6),
    },
    sensorLabel: {
        fontSize: hp(1.1),
        color: theme.colors.textLight,
        fontFamily: "SFNSText-Medium",
    },
    sensorValue: {
        fontSize: hp(1.5),
        color: theme.colors.textDark,
        fontFamily: "SFNSDisplay-Bold",
        marginTop: hp(0.3),
    },
    emptyCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: wp(6),
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 6,
        marginTop: hp(3),
    },
    emptyText: {
        fontFamily: "SFNSDisplay-Bold",
        fontSize: hp(1.9),
        color: theme.colors.textDark,
        marginVertical: hp(0.8),
    },
    emptySubText: {
        color: theme.colors.textLight,
        fontSize: hp(1.4),
        textAlign: "center",
        lineHeight: hp(2),
        marginBottom: hp(2),
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.primary,
        paddingVertical: hp(1.4),
        paddingHorizontal: wp(6),
        borderRadius: 12,
        gap: wp(2),
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
        elevation: 10,
    },
    actionBtnText: {
        color: "white",
        fontFamily: "SFNSDisplay-Bold",
        fontSize: hp(1.6),
    },
    sectionCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: wp(3.5),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        gap: hp(1),
    },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: wp(2), marginBottom: hp(0.6) },
    sectionTitle: { fontSize: hp(1.7), fontFamily: "SFNSDisplay-Bold", color: theme.colors.textDark },
    cropCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 10,
        padding: wp(3),
        marginBottom: hp(1),
        borderWidth: 1,
        borderColor: "#e6eef5",
        gap: hp(0.6),
    },
    cropCardPrimary: {
        backgroundColor: "#ecfccb",
        borderColor: "#d9f99d",
        shadowColor: "#65a30d",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
        elevation: 8,
    },
    cropHeader: { flexDirection: "row", alignItems: "center", gap: wp(2) },
    cropRank: {
        fontSize: hp(1.4),
        fontFamily: "SFNSDisplay-Heavy",
        color: "#16a34a",
        backgroundColor: "rgba(16,185,129,0.08)",
        paddingHorizontal: wp(2.2),
        paddingVertical: hp(0.3),
        borderRadius: 6,
    },
    cropName: { fontSize: hp(1.6), fontFamily: "SFNSDisplay-Bold", color: theme.colors.textDark, flex: 1 },
    cropReason: { fontSize: hp(1.4), color: theme.colors.textLight, fontFamily: "SFNSText-Regular" },
    cropMetrics: { flexDirection: "row", flexWrap: "wrap", gap: wp(3), marginTop: hp(0.5) },
    metricItem: { flexDirection: "row", alignItems: "center", gap: wp(1) },
    metricText: { fontSize: hp(1.4), fontFamily: "SFNSText-Medium", color: theme.colors.textDark },
    avoidCard: {
        backgroundColor: "#fff5f5",
        borderRadius: 10,
        padding: wp(3),
        borderWidth: 1,
        borderColor: "#ffdadb",
        marginBottom: hp(1),
    },
    avoidName: { fontSize: hp(1.5), fontFamily: "SFNSDisplay-Bold", color: "#dc2626" },
    avoidReason: { fontSize: hp(1.3), color: "#991b1b", marginTop: hp(0.4) },
    tipRow: { flexDirection: "row", gap: wp(3), alignItems: "flex-start", marginBottom: hp(0.8) },
    tipBullet: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#f59e0b",
        alignItems: "center",
        justifyContent: "center",
    },
    tipBulletText: { color: "white", fontFamily: "SFNSDisplay-Bold" },
    tipText: { flex: 1, fontSize: hp(1.4), color: theme.colors.textDark },
    strategyRow: {
        flexDirection: "row",
        gap: wp(3),
        alignItems: "center",
        backgroundColor: "#faf5ff",
        padding: wp(3),
        borderRadius: 8,
    },
    strategyBullet: {
        width: 30,
        height: 30,
        borderRadius: 8,
        backgroundColor: "#8b5cf6",
        alignItems: "center",
        justifyContent: "center",
    },
    strategyText: { fontSize: hp(1.4), color: theme.colors.textDark, flex: 1 },
});
