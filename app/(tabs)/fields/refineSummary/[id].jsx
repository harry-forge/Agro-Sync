// app/(tabs)/fields/refineSummary/[id].jsx

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
                {/* Banner - UNCHANGED */}
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

                {/* Sensor Snapshot - UNCHANGED */}
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
                        {/* PREMIUM TOP CROPS SECTION */}
                        <MotiView
                            from={{ opacity: 0, translateY: 40 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 250 }}
                        >
                            <View style={styles.premiumSectionHeader}>
                                <View style={styles.premiumIconBadge}>
                                    <Ionicons name="trophy" size={20} color="#f59e0b" />
                                </View>
                                <Text style={styles.premiumSectionTitle}>Top Crop Recommendations</Text>
                            </View>

                            <View style={styles.cropsContainer}>
                                {refined.topCrops.map((crop, idx) => (
                                    <PremiumCropCard
                                        key={idx}
                                        crop={crop}
                                        rank={idx + 1}
                                        isPrimary={idx === 0}
                                    />
                                ))}
                            </View>
                        </MotiView>

                        {/* PREMIUM CROPS TO AVOID */}
                        <MotiView
                            from={{ opacity: 0, translateY: 40 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 350 }}
                        >
                            <View style={styles.premiumSectionHeader}>
                                <View style={[styles.premiumIconBadge, { backgroundColor: "#fef2f2" }]}>
                                    <Ionicons name="warning" size={20} color="#dc2626" />
                                </View>
                                <Text style={styles.premiumSectionTitle}>Crops to Avoid</Text>
                            </View>

                            <View style={styles.avoidContainer}>
                                {refined.avoidCrops.map((crop, idx) => (
                                    <PremiumAvoidCard key={idx} crop={crop} />
                                ))}
                            </View>
                        </MotiView>

                        {/* PREMIUM SOIL IMPROVEMENTS */}
                        <MotiView
                            from={{ opacity: 0, translateY: 40 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 450 }}
                        >
                            <View style={styles.premiumSectionHeader}>
                                <View style={[styles.premiumIconBadge, { backgroundColor: "#fef3c7" }]}>
                                    <Ionicons name="leaf" size={20} color="#d97706" />
                                </View>
                                <Text style={styles.premiumSectionTitle}>Soil Enhancement</Text>
                            </View>

                            <View style={styles.improvementsCard}>
                                {refined.soilImprovements.map((tip, idx) => (
                                    <PremiumTipItem key={idx} tip={tip} index={idx} />
                                ))}
                            </View>
                        </MotiView>

                        {/* PREMIUM PROFIT STRATEGIES */}
                        <MotiView
                            from={{ opacity: 0, translateY: 40 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ delay: 550 }}
                        >
                            <View style={styles.premiumSectionHeader}>
                                <View style={[styles.premiumIconBadge, { backgroundColor: "#faf5ff" }]}>
                                    <Ionicons name="trending-up" size={20} color="#8b5cf6" />
                                </View>
                                <Text style={styles.premiumSectionTitle}>Profit Maximization</Text>
                            </View>

                            <View style={styles.strategiesCard}>
                                {refined.profitStrategies.map((strategy, idx) => (
                                    <PremiumStrategyItem key={idx} strategy={strategy} />
                                ))}
                            </View>
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

// PREMIUM CROP CARD COMPONENT
function PremiumCropCard({ crop, rank, isPrimary }) {
    return (
        <View style={[styles.premiumCropCard, isPrimary && styles.primaryCropCard]}>
            {/* Header with Rank Badge */}
            <View style={styles.cropCardHeader}>
                <View style={[styles.rankBadge, isPrimary && styles.primaryRankBadge]}>
                    <Ionicons
                        name={isPrimary ? "trophy" : "leaf"}
                        size={16}
                        color="white"
                    />
                    <Text style={styles.rankText}>#{rank}</Text>
                </View>
                <View style={styles.cropNameContainer}>
                    <Text style={[styles.cropCardName, isPrimary && styles.primaryCropName]}>
                        {crop.name}
                    </Text>
                    {isPrimary && (
                        <View style={styles.bestChoicePill}>
                            <Text style={styles.bestChoiceText}>BEST CHOICE</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Reason */}
            <Text style={styles.cropCardReason}>{crop.reason}</Text>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
                <MetricPill
                    icon="analytics"
                    label="Yield"
                    value={crop.expectedYield}
                    color="#10b981"
                />
                <MetricPill
                    icon="cash"
                    label="Profit"
                    value={crop.estimatedProfit}
                    color="#f59e0b"
                />
                <MetricPill
                    icon="time"
                    label="Duration"
                    value={crop.growingPeriod}
                    color="#6366f1"
                />
            </View>
        </View>
    );
}

// METRIC PILL COMPONENT
function MetricPill({ icon, label, value, color }) {
    return (
        <View style={[styles.metricPill, { borderColor: color + "30" }]}>
            <View style={[styles.metricIconSmall, { backgroundColor: color + "15" }]}>
                <Ionicons name={icon} size={14} color={color} />
            </View>
            <View style={styles.metricContent}>
                <Text style={styles.metricLabel}>{label}</Text>
                <Text style={[styles.metricValue, { color }]}>{value}</Text>
            </View>
        </View>
    );
}

// PREMIUM AVOID CARD
function PremiumAvoidCard({ crop }) {
    return (
        <View style={styles.premiumAvoidCard}>
            <View style={styles.avoidHeader}>
                <View style={styles.avoidIconBadge}>
                    <Ionicons name="close" size={16} color="#dc2626" />
                </View>
                <Text style={styles.avoidCardName}>{crop.name}</Text>
            </View>
            <Text style={styles.avoidCardReason}>{crop.reason}</Text>
        </View>
    );
}

// PREMIUM TIP ITEM
function PremiumTipItem({ tip, index }) {
    return (
        <View style={styles.tipItem}>
            <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.tipItemText}>{tip}</Text>
        </View>
    );
}

// PREMIUM STRATEGY ITEM
function PremiumStrategyItem({ strategy }) {
    return (
        <View style={styles.strategyItem}>
            <View style={styles.strategyCheck}>
                <Ionicons name="checkmark-circle" size={20} color="#8b5cf6" />
            </View>
            <Text style={styles.strategyItemText}>{strategy}</Text>
        </View>
    );
}

// SENSOR ITEM - UNCHANGED
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

const styles = StyleSheet.create({
    // UNCHANGED STYLES
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

    // NEW PREMIUM STYLES
    premiumSectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        marginBottom: hp(1.5),
        marginTop: hp(1),
    },
    premiumIconBadge: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#fffbeb",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    premiumSectionTitle: {
        fontSize: hp(2),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
        flex: 1,
    },

    // CROP CARDS
    cropsContainer: {
        gap: hp(1.5),
    },
    premiumCropCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: wp(4),
        borderWidth: 1,
        borderColor: "#e2e8f0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
    primaryCropCard: {
        backgroundColor: "#fefce8",
        borderColor: "#fde047",
        borderWidth: 2,
        shadowColor: "#eab308",
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    cropCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        marginBottom: hp(1.2),
    },
    rankBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(1),
        backgroundColor: "#10b981",
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.6),
        borderRadius: 10,
    },
    primaryRankBadge: {
        backgroundColor: "#f59e0b",
    },
    rankText: {
        fontSize: hp(1.3),
        fontFamily: "SFNSDisplay-Bold",
        color: "white",
    },
    cropNameContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
    },
    cropCardName: {
        fontSize: hp(1.9),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
    },
    primaryCropName: {
        color: "#92400e",
    },
    bestChoicePill: {
        backgroundColor: "#16a34a",
        paddingHorizontal: wp(2),
        paddingVertical: hp(0.3),
        borderRadius: 6,
    },
    bestChoiceText: {
        fontSize: hp(0.9),
        fontFamily: "SFNSDisplay-Heavy",
        color: "white",
        letterSpacing: 0.5,
    },
    cropCardReason: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Regular",
        color: "#64748b",
        lineHeight: hp(2),
        marginBottom: hp(1.2),
    },
    metricsGrid: {
        flexDirection: "row",
        gap: wp(2),
    },
    metricPill: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: wp(1.5),
        backgroundColor: "#fafafa",
        padding: wp(2),
        borderRadius: 10,
        borderWidth: 1,
    },
    metricIconSmall: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    metricContent: {
        flex: 1,
    },
    metricLabel: {
        fontSize: hp(1),
        fontFamily: "SFNSText-Medium",
        color: "#94a3b8",
    },
    metricValue: {
        fontSize: hp(1.3),
        fontFamily: "SFNSDisplay-Bold",
        marginTop: hp(0.1),
    },

    // AVOID CARDS
    avoidContainer: {
        gap: hp(1.2),
    },
    premiumAvoidCard: {
        backgroundColor: "#fff5f5",
        borderRadius: 14,
        padding: wp(3.5),
        borderWidth: 1,
        borderLeftWidth: 4,
        borderColor: "#fecaca",
        borderLeftColor: "#dc2626",
    },
    avoidHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
        marginBottom: hp(0.6),
    },
    avoidIconBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#fee2e2",
        alignItems: "center",
        justifyContent: "center",
    },
    avoidCardName: {
        fontSize: hp(1.6),
        fontFamily: "SFNSDisplay-Bold",
        color: "#dc2626",
    },
    avoidCardReason: {
        fontSize: hp(1.3),
        fontFamily: "SFNSText-Regular",
        color: "#991b1b",
        lineHeight: hp(1.9),
        marginLeft: wp(8),
    },

    // IMPROVEMENTS
    improvementsCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: wp(4),
        gap: hp(1.2),
        borderWidth: 1,
        borderColor: "#fef3c7",
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    tipItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: wp(3),
        backgroundColor: "#fffbeb",
        padding: wp(3),
        borderRadius: 12,
    },
    tipNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#f59e0b",
        alignItems: "center",
        justifyContent: "center",
    },
    tipNumberText: {
        fontSize: hp(1.3),
        fontFamily: "SFNSDisplay-Bold",
        color: "white",
    },
    tipItemText: {
        flex: 1,
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Regular",
        color: "#78350f",
        lineHeight: hp(2),
    },

    // STRATEGIES
    strategiesCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: wp(4),
        gap: hp(1.2),
        borderWidth: 1,
        borderColor: "#f3e8ff",
        shadowColor: "#8b5cf6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    strategyItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        backgroundColor: "#faf5ff",
        padding: wp(3),
        borderRadius: 12,
    },
    strategyCheck: {
        width: 28,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
    },
    strategyItemText: {
        flex: 1,
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Regular",
        color: "#581c87",
        lineHeight: hp(2),
    },
});