//app/(tabs)/fields/refineResult/[id].jsx


import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ScreenWrapper from "../../../../components/ScreenWrapper";
import BackButton from "../../../../components/BackButton";
import { theme } from "../../../../constants/theme";
import { hp, wp } from "../../../../helpers/common";
import { useFieldData } from "../../../../contexts/FieldContext";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function RefinedResult() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { fieldData } = useFieldData();

    const refined = fieldData?.refinedRecommendation || null;

    // Derived sensor values
    const moisturePct = useMemo(() => {
        if (fieldData?.moisture == null) return "—";
        return `${Math.max(0, Math.min(100, Math.round(Number(fieldData.moisture)) ))}%`;
    }, [fieldData?.moisture]);

    const temperature = fieldData?.temperature ?? "—";
    const humidity = fieldData?.humidity ?? "—";
    const rainfall = fieldData?.rainfall ?? "—";

    // If user somehow lands here without refined data, show a message
    const missing = !refined;

    return (
        <ScreenWrapper bg="white">
            <View style={styles.headerRow}>
                <BackButton router={router} />
                <Text style={styles.pageTitle}>Refined Recommendation</Text>
                <Pressable onPress={() => router.push(`/fields/${id}`)}>
                    <Ionicons name="chevron-forward" size={26} color={theme.colors.primary} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {/* Premium Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerLeft}>
                        <Ionicons name="sparkles" size={30} color="white" />
                        <View style={{ marginLeft: wp(3) }}>
                            <Text style={styles.bannerTitle}>Tailored for your field</Text>
                            <Text style={styles.bannerSubtitle}>Based on sensors + your inputs</Text>
                        </View>
                    </View>
                    <View style={styles.bestCropPill}>
                        <Text style={styles.bestCropText}>
                            {refined?.topCrops?.[0]?.name ?? (missing ? "No data" : "—")}
                        </Text>
                    </View>
                </View>

                {/* Sensors Summary */}
                <View style={styles.sensorsCard}>
                    <Text style={styles.cardTitleSmall}>Sensor Snapshot</Text>
                    <View style={styles.sensorRow}>
                        <SensorItem label="Temperature" value={`${temperature}°C`} icon="thermometer" />
                        <SensorItem label="Humidity" value={`${humidity}%`} icon="water" />
                        <SensorItem label="Moisture" value={moisturePct} icon="leaf" />
                    </View>
                    <View style={[styles.sensorRow, { marginTop: hp(1) }]}>
                        <SensorItem label="Rainfall" value={`${rainfall} mm`} icon="cloudy" />
                        <SensorItem label="Soil pH" value={`${fieldData?.pH ?? "—"}`} icon="construct" />
                        <SensorItem label="N/P/K" value={`${fieldData?.N ?? "—"}/${fieldData?.P ?? "—"}/${fieldData?.K ?? "—"}`} icon="bar-chart" />
                    </View>
                </View>

                {missing ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No refined recommendation found. Please refine again from field page.</Text>
                        <Pressable style={styles.actionBtn} onPress={() => router.push(`/fields/refine/${id}`)}>
                            <Ionicons name="options-outline" size={18} color="white" />
                            <Text style={styles.actionBtnText}>Refine Now</Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        {/* Top Crops */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="leaf" size={20} color="#16a34a" />
                                <Text style={styles.sectionTitle}>Top Recommendations</Text>
                            </View>

                            {refined.topCrops.map((c, idx) => (
                                <View key={idx} style={[styles.cropCard, idx === 0 && styles.cropCardPrimary]}>
                                    <View style={styles.cropHeader}>
                                        <Text style={styles.cropRank}>#{idx + 1}</Text>
                                        <Text style={styles.cropName}>{c.name}</Text>
                                        <View style={styles.cropMeta}>
                                            <Text style={styles.cropMetaText}>{c.expectedYield}</Text>
                                            <Text style={styles.cropMetaText}>{c.estimatedProfit}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.cropReason}>{c.reason}</Text>
                                    <View style={styles.cropFooter}>
                                        <Text style={styles.growingPeriod}>{c.growingPeriod}</Text>
                                        <Pressable style={styles.moreBtn} onPress={() => { /* expand details - future */ }}>
                                            <Text style={styles.moreBtnText}>More</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Avoid Crops */}
                        <View style={styles.sectionCard}>
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
                        </View>

                        {/* Soil Improvements */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="flask" size={20} color="#f59e0b" />
                                <Text style={styles.sectionTitle}>Soil Improvements</Text>
                            </View>
                            {refined.soilImprovements.map((t, idx) => (
                                <View key={idx} style={styles.tipRow}>
                                    <View style={styles.tipBullet}><Text style={styles.tipBulletText}>{idx + 1}</Text></View>
                                    <Text style={styles.tipText}>{t}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Profit Strategies */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="bulb" size={20} color="#8b5cf6" />
                                <Text style={styles.sectionTitle}>Profit Strategies</Text>
                            </View>
                            <View style={{ gap: hp(1) }}>
                                {refined.profitStrategies.map((p, idx) => (
                                    <View key={idx} style={styles.strategyRow}>
                                        <View style={styles.strategyBullet}><Ionicons name="checkmark" size={14} color="white" /></View>
                                        <Text style={styles.strategyText}>{p}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* CTA */}
                        <View style={{ height: hp(6) }} /> {/* spacing before bottom */}
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

const styles = StyleSheet.create({
    headerRow: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: hp(1),
    },
    pageTitle: {
        fontSize: hp(2.2),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
    },
    container: {
        paddingHorizontal: wp(5),
        paddingTop: hp(1),
        paddingBottom: hp(18),
        gap: hp(2),
    },

    // Banner
    banner: {
        borderRadius: 16,
        padding: wp(4),
        backgroundColor: "linear-gradient(90deg,#0f766e,#065f46)", // note: RN ignores CSS gradients; we style as solid fallback
        // backgroundColor: "#065f46",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#064e3b",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
        elevation: 14,
    },
    bannerLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    bannerTitle: {
        color: "white",
        fontSize: hp(1.9),
        fontFamily: "SFNSDisplay-Bold",
    },
    bannerSubtitle: {
        color: "rgba(255,255,255,0.9)",
        fontSize: hp(1.2),
        marginTop: hp(0.2),
    },
    bestCropPill: {
        backgroundColor: "rgba(255,255,255,0.12)",
        paddingVertical: hp(0.6),
        paddingHorizontal: wp(3),
        borderRadius: 20,
    },
    bestCropText: {
        color: "white",
        fontFamily: "SFNSDisplay-Heavy",
        fontSize: hp(1.6),
    },

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
    sensorItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: hp(1),
    },
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

    sectionCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: wp(3.5),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.04)",
        gap: hp(1),
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
        marginBottom: hp(0.8),
    },
    sectionTitle: {
        fontSize: hp(1.7),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
    },

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
    cropHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
    },
    cropRank: {
        fontSize: hp(1.4),
        fontFamily: "SFNSDisplay-Heavy",
        color: "#16a34a",
        backgroundColor: "rgba(16,185,129,0.08)",
        paddingHorizontal: wp(2.2),
        paddingVertical: hp(0.3),
        borderRadius: 6,
    },
    cropName: {
        fontSize: hp(1.6),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
        flex: 1,
    },
    cropMeta: {
        alignItems: "flex-end",
    },
    cropMetaText: {
        fontSize: hp(1.1),
        color: theme.colors.textLight,
        fontFamily: "SFNSText-Medium",
    },
    cropReason: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontFamily: "SFNSText-Regular",
        marginTop: hp(0.4),
    },
    cropFooter: {
        marginTop: hp(0.6),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    growingPeriod: {
        fontSize: hp(1.1),
        color: "#475569",
        fontFamily: "SFNSText-Medium",
    },
    moreBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: hp(0.5),
        paddingHorizontal: wp(3),
        borderRadius: 8,
    },
    moreBtnText: {
        color: "white",
        fontFamily: "SFNSText-Medium",
    },

    avoidCard: {
        backgroundColor: "#fff5f5",
        borderRadius: 10,
        padding: wp(3),
        borderWidth: 1,
        borderColor: "#ffdadb",
        marginBottom: hp(1),
    },
    avoidName: {
        fontSize: hp(1.5),
        fontFamily: "SFNSDisplay-Bold",
        color: "#dc2626",
    },
    avoidReason: {
        fontSize: hp(1.3),
        color: "#991b1b",
        marginTop: hp(0.4),
    },

    tipRow: {
        flexDirection: "row",
        gap: wp(3),
        alignItems: "flex-start",
        marginBottom: hp(0.8),
    },
    tipBullet: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#f59e0b",
        alignItems: "center",
        justifyContent: "center",
    },
    tipBulletText: {
        color: "white",
        fontFamily: "SFNSDisplay-Bold",
    },
    tipText: {
        flex: 1,
        fontSize: hp(1.4),
        color: theme.colors.textDark,
        fontFamily: "SFNSText-Regular",
    },

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
    strategyText: {
        fontSize: hp(1.4),
        color: theme.colors.textDark,
        marginLeft: wp(2),
        flex: 1,
    },

    emptyCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: wp(4),
        alignItems: "center",
        gap: hp(1),
    },
    emptyText: {
        color: theme.colors.textLight,
        fontFamily: "SFNSText-Medium",
    },
    actionBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: hp(1),
        paddingHorizontal: wp(4),
        borderRadius: 10,
        flexDirection: "row",
        gap: wp(2),
        alignItems: "center",
        marginTop: hp(1),
    },
    actionBtnText: {
        color: "white",
        fontFamily: "SFNSDisplay-Bold",
    },
});
