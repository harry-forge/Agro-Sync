// app/(tabs)/fields/[id].jsx

import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, Animated } from "react-native";
import ScreenWrapper from "../../../components/ScreenWrapper";
import { theme } from "../../../constants/theme";
import { hp, wp } from "../../../helpers/common";
import { iotService } from "../../../services/iotService";
import { weatherService } from "../../../services/weatherService";
import { predictSoilParams, generateCropDescriptionBoth } from "../../../services/geminiService";
import { getCropRecommendation } from "../../../services/cropRecommendationService";
import LottieView from "lottie-react-native";
import { useFieldData } from "../../../contexts/FieldContext";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import BackButton from "../../../components/BackButton";

const TTL = 5 * 60 * 1000;

export default function FieldDetails() {
    const { id } = useLocalSearchParams();
    const { fields, fieldData, setFieldData, lastFetchedAt, setLastFetchedAt } = useFieldData();
    const field = fields.find((f) => f.id === id) || { id, name: "Field" };

    const [loading, setLoading] = useState(true);
    const [iot, setIot] = useState(null);
    const [weather, setWeather] = useState(null);
    const [predicted, setPredicted] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [error, setError] = useState("");

    const [englishDesc, setEnglishDesc] = useState(null);
    const [hindiDesc, setHindiDesc] = useState(null);
    const [isHindi, setIsHindi] = useState(false);

    const moisturePct = useMemo(() => {
        if (!iot?.soil && iot?.soil !== 0) return null;
        return Math.max(0, Math.min(100, Math.round((Number(iot.soil) / 4095) * 100)));
    }, [iot?.soil]);

    const temperature = iot?.temperature ?? fieldData.temperature ?? null;
    const humidity = iot?.humidity ?? fieldData.humidity ?? null;
    const rainfall = weather?.current?.precip_mm ?? fieldData.rainfall ?? null;

    const fetchAll = async () => {
        try {
            setLoading(true);

            const iotRes = await iotService.getData();
            if (!iotRes.success) throw new Error(iotRes.error || "IoT fetch failed");
            setIot(iotRes.data);

            const loc = await weatherService.getCachedOrCurrentLocation?.();
            const lat = loc?.latitude ?? 28.6139;
            const lon = loc?.longitude ?? 77.209;
            const w = await weatherService.getCurrentWeather(lat, lon);
            if (!w.success) throw new Error(w.error || "Weather fetch failed");
            setWeather(w.data);

            const preds = await predictSoilParams({
                temperature: iotRes.data.temperature,
                humidity: iotRes.data.humidity,
                moisture: Math.max(0, Math.min(100, Math.round((Number(iotRes.data.soil) / 4095) * 100))),
                rainfall: w.data?.current?.precip_mm ?? 0,
            });
            setPredicted(preds);

            const payload = {
                K: preds.K,
                N: preds.N,
                P: preds.P,
                humidity: iotRes.data.humidity,
                moisture: Math.max(0, Math.min(100, Math.round((Number(iotRes.data.soil) / 4095) * 100))),
                pH: preds.pH,
                rainfall: w.data?.current?.precip_mm ?? 0,
                temperature: iotRes.data.temperature,
            };
            const rec = await getCropRecommendation(payload);
            setRecommendation(rec);

            const both = await generateCropDescriptionBoth({
                crop: rec.best_crop,
                N: preds.N,
                P: preds.P,
                K: preds.K,
                pH: preds.pH,
                temperature: iotRes.data.temperature,
                humidity: iotRes.data.humidity,
                moisture: Math.max(0, Math.min(100, Math.round((Number(iotRes.data.soil) / 4095) * 100))),
                rainfall: w.data?.current?.precip_mm ?? 0,
            });
            setEnglishDesc(both.english);
            setHindiDesc(both.hindi);

            setFieldData({
                temperature: iotRes.data.temperature,
                humidity: iotRes.data.humidity,
                moisture: Math.max(0, Math.min(100, Math.round((Number(iotRes.data.soil) / 4095) * 100))),
                rainfall: w.data?.current?.precip_mm ?? 0,
                N: preds.N,
                P: preds.P,
                K: preds.K,
                pH: preds.pH,
                recommendation: rec,
                englishDesc: both.english,
                hindiDesc: both.hindi,
                refinedRecommendation: fieldData.refinedRecommendation,
            });

            setLastFetchedAt(Date.now());
        } catch (e) {
            console.log("💥 error:", e);
            setError(e.message || JSON.stringify(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (lastFetchedAt && Date.now() - lastFetchedAt < TTL && fieldData.temperature !== null) {
            setLoading(false);
        } else {
            fetchAll();
        }
    }, [id]);

    const handleTranslate = () => setIsHindi(!isHindi);

    return (
        <ScreenWrapper bg="#f8fafb">
            {/* Premium Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTopRow}>
                    <BackButton router={router} />
                    <View style={styles.headerCenter}>
                        <View style={styles.fieldIconBadge}>
                            <Ionicons name="location" size={16} color="#16a34a" />
                        </View>
                        <View>
                            <Text style={styles.pageTitle}>{field.name}</Text>
                            <View style={styles.statusRow}>
                                <View style={styles.liveDot} />
                                <Text style={styles.statusText}>Live Monitoring</Text>
                            </View>
                        </View>
                    </View>
                    <Pressable style={styles.refreshButton} onPress={fetchAll}>
                        <Ionicons name="sync" size={20} color="#16a34a" />
                    </Pressable>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <View style={styles.loadingCard}>
                            <View style={styles.loadingIconWrapper}>
                                <LottieView
                                    source={require("../../../assets/animations/loading.json")}
                                    style={styles.loadingAnimation}
                                    autoPlay
                                    loop
                                    speed={1.2}
                                />
                            </View>
                            <Text style={styles.loadingTitle}>Analyzing Your Field</Text>
                            <Text style={styles.loadingText}>Gathering sensor data, weather updates, and AI predictions...</Text>

                            <View style={styles.loadingSteps}>
                                <LoadingStep icon="hardware-chip" text="Reading sensors" />
                                <LoadingStep icon="cloudy" text="Fetching weather" />
                                <LoadingStep icon="sparkles" text="AI processing" />
                            </View>
                        </View>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <View style={styles.errorCard}>
                            <View style={styles.errorIconContainer}>
                                <Ionicons name="alert-circle" size={48} color="#dc2626" />
                            </View>
                            <Text style={styles.errorTitle}>Connection Failed</Text>
                            <Text style={styles.errorMessage}>{error}</Text>
                            <Pressable style={styles.retryButton} onPress={fetchAll}>
                                <Ionicons name="reload" size={20} color="white" />
                                <Text style={styles.retryText}>Retry Connection</Text>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <>
                        {/* Compact Premium Data Cards */}
                        <View style={styles.dataCardsContainer}>
                            {/* Live Sensors - Compact 2x2 Grid */}
                            <View style={styles.compactCard}>
                                <View style={styles.compactCardHeader}>
                                    <View style={styles.compactHeaderLeft}>
                                        <View style={[styles.compactIconBadge, { backgroundColor: "#eff6ff" }]}>
                                            <Ionicons name="pulse" size={14} color="#3b82f6" />
                                        </View>
                                        <Text style={styles.compactCardTitle}>Live Sensors</Text>
                                    </View>
                                    <View style={styles.microLiveBadge}>
                                        <View style={styles.microLiveDot} />
                                        <Text style={styles.microLiveText}>LIVE</Text>
                                    </View>
                                </View>

                                <View style={styles.compactGrid}>
                                    <CompactMetric
                                        icon="thermometer"
                                        value={temperature ?? "—"}
                                        unit="°C"
                                        color="#ef4444"
                                        source="IoT"
                                    />
                                    <CompactMetric
                                        icon="water"
                                        value={humidity ?? "—"}
                                        unit="%"
                                        color="#3b82f6"
                                        source="IoT"
                                    />
                                    <CompactMetric
                                        icon="leaf"
                                        value={moisturePct ?? fieldData.moisture ?? "—"}
                                        unit="%"
                                        color="#10b981"
                                        source="IoT"
                                    />
                                    <CompactMetric
                                        icon="rainy"
                                        value={rainfall ?? 0}
                                        unit="mm"
                                        color="#0ea5e9"
                                        source="Weather"
                                    />
                                </View>
                            </View>

                            {/* AI Soil Analysis - Compact Horizontal */}
                            <View style={styles.compactCard}>
                                <View style={styles.compactCardHeader}>
                                    <View style={styles.compactHeaderLeft}>
                                        <View style={[styles.compactIconBadge, { backgroundColor: "#faf5ff" }]}>
                                            <Ionicons name="flask" size={14} color="#8b5cf6" />
                                        </View>
                                        <Text style={styles.compactCardTitle}>Soil Analysis</Text>
                                    </View>
                                    <View style={styles.microAiBadge}>
                                        <Ionicons name="sparkles" size={10} color="white" />
                                        <Text style={styles.microAiText}>AI</Text>
                                    </View>
                                </View>

                                <View style={styles.soilMetricsRow}>
                                    <SoilMetric
                                        label="N"
                                        value={predicted?.N ?? fieldData.N ?? "—"}
                                        color="#16a34a"
                                        source="AI"
                                    />
                                    <SoilMetric
                                        label="P"
                                        value={predicted?.P ?? fieldData.P ?? "—"}
                                        color="#f59e0b"
                                        source="AI"
                                    />
                                    <SoilMetric
                                        label="K"
                                        value={predicted?.K ?? fieldData.K ?? "—"}
                                        color="#06b6d4"
                                        source="AI"
                                    />
                                    <SoilMetric
                                        label="pH"
                                        value={predicted?.pH ?? fieldData.pH ?? "—"}
                                        color="#8b5cf6"
                                        source="AI"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Today's Recommendation Section - KEPT AS IS */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIconContainer, { backgroundColor: "#fffbeb" }]}>
                                    <Ionicons name="trophy" size={18} color="#f59e0b" />
                                </View>
                                <Text style={styles.sectionTitle}>Today's Recommendation</Text>
                            </View>

                            {recommendation || fieldData.recommendation ? (
                                <View style={styles.recommendationCard}>
                                    {/* Hero Section */}
                                    <View style={styles.cropHeroSection}>
                                        <View style={styles.cropIconLarge}>
                                            <Ionicons name="leaf" size={32} color="#16a34a" />
                                        </View>
                                        <View style={styles.cropHeroText}>
                                            <Text style={styles.recommendedLabel}>Recommended Crop</Text>
                                            <Text style={styles.cropName}>
                                                {(recommendation || fieldData.recommendation)?.best_crop}
                                            </Text>
                                        </View>
                                        <View style={styles.confidenceContainer}>
                                            <View style={styles.confidenceCircle}>
                                                <Text style={styles.confidenceValue}>
                                                    {Math.round(Number((recommendation || fieldData.recommendation)?.probability) * 100)}%
                                                </Text>
                                            </View>
                                            <Text style={styles.confidenceLabel}>Match</Text>
                                        </View>
                                    </View>

                                    {/* Description */}
                                    {(englishDesc || fieldData.englishDesc) && (
                                        <View style={styles.descriptionContainer}>
                                            <View style={styles.descriptionHeader}>
                                                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                                                <Text style={styles.descriptionTitle}>Why This Crop?</Text>
                                            </View>
                                            <View style={styles.descriptionBox}>
                                                <Text style={styles.descriptionText}>
                                                    {isHindi
                                                        ? (hindiDesc || fieldData.hindiDesc)
                                                        : (englishDesc || fieldData.englishDesc)}
                                                </Text>
                                            </View>

                                            <Pressable
                                                onPress={handleTranslate}
                                                style={styles.translateButton}
                                            >
                                                <Ionicons
                                                    name="language"
                                                    size={18}
                                                    color="#6366f1"
                                                />
                                                <Text style={styles.translateText}>
                                                    {isHindi ? "Show in English" : "हिंदी में देखें"}
                                                </Text>
                                            </Pressable>
                                        </View>
                                    )}

                                    {/* Refine CTA */}
                                    <View style={styles.ctaSection}>
                                        <View style={styles.ctaDivider} />
                                        <Pressable
                                            style={styles.refineButton}
                                            onPress={() => router.push(`/fields/refineSummary/${id}`)}
                                        >
                                            <View style={styles.refineButtonContent}>
                                                <View style={styles.refineIconContainer}>
                                                    <Ionicons name="analytics" size={24} color="white" />
                                                </View>
                                                <View style={styles.refineTextContainer}>
                                                    <Text style={styles.refineButtonTitle}>Get Advanced Insights</Text>
                                                    <Text style={styles.refineButtonSubtitle}>Personalized analysis with profit strategies</Text>
                                                </View>
                                            </View>
                                            <Ionicons name="arrow-forward" size={22} color="white" />
                                        </Pressable>
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.noRecommendationCard}>
                                    <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
                                    <Text style={styles.noRecommendationText}>No recommendation available</Text>
                                    <Text style={styles.noRecommendationSubtext}>Please check sensor connectivity</Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

// Compact Metric Component for 2x2 Grid
function CompactMetric({ icon, value, unit, color, source }) {
    return (
        <View style={styles.compactMetric}>
            <Ionicons name={icon} size={18} color={color} style={styles.compactMetricIcon} />
            <View style={styles.compactMetricValue}>
                <View style={styles.compactMetricTop}>
                    <Text style={[styles.compactMetricNumber, { color }]}>{value}</Text>
                    <Text style={styles.compactMetricUnit}>{unit}</Text>
                </View>
                <View style={styles.compactSourceTag}>
                    <View style={[styles.compactSourceDot, { backgroundColor: color }]} />
                    <Text style={[styles.compactSourceText, { color }]}>{source}</Text>
                </View>
            </View>
        </View>
    );
}

// Soil Metric Component for Horizontal Layout
function SoilMetric({ label, value, color, source }) {
    return (
        <View style={styles.soilMetricItem}>
            <View style={[styles.soilMetricDot, { backgroundColor: color }]} />
            <Text style={styles.soilMetricLabel}>{label}</Text>
            <Text style={[styles.soilMetricValue, { color }]}>{value}</Text>
            <View style={styles.soilSourceTag}>
                <Text style={styles.soilSourceText}>{source}</Text>
            </View>
        </View>
    );
}

function LoadingStep({ icon, text }) {
    return (
        <View style={styles.loadingStep}>
            <Ionicons name={icon} size={16} color="#64748b" />
            <Text style={styles.loadingStepText}>{text}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: "white",
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        paddingBottom: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    headerTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        flex: 1,
        marginLeft: wp(3),
    },
    fieldIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#f0fdf4",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    pageTitle: {
        fontSize: hp(2.2),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(1.5),
        marginTop: hp(0.2),
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#22c55e",
    },
    statusText: {
        fontSize: hp(1.2),
        fontFamily: "SFNSText-Medium",
        color: "#22c55e",
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#f0fdf4",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#bbf7d0",
    },
    container: {
        paddingTop: hp(2),
        paddingBottom: hp(15),
    },

    // NEW COMPACT DESIGN STYLES
    dataCardsContainer: {
        paddingHorizontal: wp(5),
        gap: hp(1.5),
        marginBottom: hp(2.5),
    },
    compactCard: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: wp(4),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.04)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
    compactCardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: hp(1.5),
    },
    compactHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
    },
    compactIconBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    compactCardTitle: {
        fontSize: hp(1.6),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
    },
    microLiveBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(1),
        backgroundColor: "#dcfce7",
        paddingHorizontal: wp(2),
        paddingVertical: hp(0.4),
        borderRadius: 6,
    },
    microLiveDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#22c55e",
    },
    microLiveText: {
        fontSize: hp(0.95),
        fontFamily: "SFNSText-Bold",
        color: "#16a34a",
    },
    microAiBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(0.8),
        backgroundColor: "#8b5cf6",
        paddingHorizontal: wp(2),
        paddingVertical: hp(0.4),
        borderRadius: 6,
    },
    microAiText: {
        fontSize: hp(0.95),
        fontFamily: "SFNSText-Bold",
        color: "white",
    },

    // Compact 2x2 Grid
    compactGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: wp(2),
    },
    compactMetric: {
        width: "48%",
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
        backgroundColor: "#fafafa",
        padding: wp(3),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    compactMetricIcon: {
        opacity: 0.9,
    },
    compactMetricValue: {
        flex: 1,
    },
    compactMetricTop: {
        flexDirection: "row",
        alignItems: "baseline",
        gap: wp(1),
    },
    compactMetricNumber: {
        fontSize: hp(2),
        fontFamily: "SFNSDisplay-Bold",
        lineHeight: hp(2.2),
    },
    compactMetricUnit: {
        fontSize: hp(1.1),
        fontFamily: "SFNSText-Medium",
        color: "#94a3b8",
    },
    compactSourceTag: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(0.8),
        marginTop: hp(0.3),
    },
    compactSourceDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
    },
    compactSourceText: {
        fontSize: hp(0.95),
        fontFamily: "SFNSText-Medium",
        opacity: 0.7,
    },

    // Soil Metrics Horizontal Row
    soilMetricsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: wp(2),
    },
    soilMetricItem: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#fafafa",
        padding: wp(2.5),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    soilMetricDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginBottom: hp(0.5),
    },
    soilMetricLabel: {
        fontSize: hp(1.1),
        fontFamily: "SFNSText-Bold",
        color: "#64748b",
        marginBottom: hp(0.3),
    },
    soilMetricValue: {
        fontSize: hp(1.8),
        fontFamily: "SFNSDisplay-Bold",
    },
    soilSourceTag: {
        marginTop: hp(0.4),
        backgroundColor: "#f8fafc",
        paddingHorizontal: wp(1.5),
        paddingVertical: hp(0.2),
        borderRadius: 4,
    },
    soilSourceText: {
        fontSize: hp(0.9),
        fontFamily: "SFNSText-Bold",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },

    // Section Styles (for Recommendation)
    section: {
        marginBottom: hp(2.5),
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
        paddingHorizontal: wp(5),
        marginBottom: hp(1.5),
    },
    sectionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    sectionTitle: {
        fontSize: hp(1.8),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
        flex: 1,
    },

    // Recommendation Card Styles (UNCHANGED)
    recommendationCard: {
        marginHorizontal: wp(5),
        backgroundColor: "white",
        borderRadius: 24,
        padding: wp(5),
        borderWidth: 1,
        borderColor: "rgba(245, 158, 11, 0.15)",
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
        marginBottom: 60
    },
    cropHeroSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        marginBottom: hp(2.5),
        paddingBottom: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    cropIconLarge: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: "#f0fdf4",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#bbf7d0",
    },
    cropHeroText: {
        flex: 1,
    },
    recommendedLabel: {
        fontSize: hp(1.2),
        fontFamily: "SFNSText-Medium",
        color: "#64748b",
        marginBottom: hp(0.3),
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    cropName: {
        fontSize: hp(2.4),
        fontFamily: "SFNSDisplay-Heavy",
        color: "#16a34a",
        letterSpacing: -0.3,
    },
    confidenceContainer: {
        alignItems: "center",
    },
    confidenceCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#f0fdf4",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: "#16a34a",
        marginBottom: hp(0.5),
    },
    confidenceValue: {
        fontSize: hp(1.8),
        fontFamily: "SFNSDisplay-Bold",
        color: "#16a34a",
    },
    confidenceLabel: {
        fontSize: hp(1.1),
        fontFamily: "SFNSText-Medium",
        color: "#64748b",
    },
    descriptionContainer: {
        gap: hp(1.5),
        marginBottom: hp(2),
    },
    descriptionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
    },
    descriptionTitle: {
        fontSize: hp(1.6),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
    },
    descriptionBox: {
        backgroundColor: "#fafafa",
        borderRadius: 14,
        padding: wp(4),
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    descriptionText: {
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Regular",
        color: "#475569",
        lineHeight: hp(2.3),
    },
    translateButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: wp(2),
        paddingVertical: hp(1.2),
        paddingHorizontal: wp(4),
        backgroundColor: "#eef2ff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#c7d2fe",
    },
    translateText: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Bold",
        color: "#6366f1",
    },
    ctaSection: {
        gap: hp(2),
    },
    ctaDivider: {
        height: 1,
        backgroundColor: "#f1f5f9",
    },
    refineButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#8b5cf6",
        borderRadius: 16,
        padding: wp(4),
        shadowColor: "#8b5cf6",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 12,
    },
    refineButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        flex: 1,
    },
    refineIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    refineTextContainer: {
        flex: 1,
    },
    refineButtonTitle: {
        fontSize: hp(1.7),
        fontFamily: "SFNSDisplay-Bold",
        color: "white",
        marginBottom: hp(0.2),
    },
    refineButtonSubtitle: {
        fontSize: hp(1.3),
        fontFamily: "SFNSText-Regular",
        color: "rgba(255, 255, 255, 0.85)",
    },
    noRecommendationCard: {
        marginHorizontal: wp(5),
        backgroundColor: "white",
        borderRadius: 20,
        padding: wp(6),
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    noRecommendationText: {
        fontSize: hp(1.8),
        fontFamily: "SFNSDisplay-Bold",
        color: "#64748b",
        marginTop: hp(1.5),
    },
    noRecommendationSubtext: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Regular",
        color: "#94a3b8",
        marginTop: hp(0.5),
    },

    // Loading & Error States
    loadingContainer: {
        paddingHorizontal: wp(5),
    },
    loadingCard: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: wp(6),
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
    },
    loadingIconWrapper: {
        marginBottom: hp(2),
    },
    loadingAnimation: {
        width: wp(30),
        height: wp(30)
    },
    loadingTitle: {
        fontSize: hp(2.2),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
        marginBottom: hp(0.8),
    },
    loadingText: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Regular",
        color: "#64748b",
        textAlign: "center",
        lineHeight: hp(2.1),
        marginBottom: hp(2.5),
    },
    loadingSteps: {
        width: "100%",
        gap: hp(1.2),
    },
    loadingStep: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        backgroundColor: "#f8fafc",
        padding: wp(3),
        borderRadius: 12,
    },
    loadingStepText: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Medium",
        color: "#64748b",
    },
    errorContainer: {
        paddingHorizontal: wp(5),
    },
    errorCard: {
        backgroundColor: "white",
        borderRadius: 24,
        padding: wp(6),
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#fee2e2",
        shadowColor: "#dc2626",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
    },
    errorIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#fef2f2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: hp(2),
    },
    errorTitle: {
        fontSize: hp(2.2),
        fontFamily: "SFNSDisplay-Bold",
        color: "#dc2626",
        marginBottom: hp(0.8),
    },
    errorMessage: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Regular",
        color: "#991b1b",
        textAlign: "center",
        lineHeight: hp(2.1),
        marginBottom: hp(2.5),
    },
    retryButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
        backgroundColor: "#dc2626",
        paddingVertical: hp(1.4),
        paddingHorizontal: wp(6),
        borderRadius: 14,
        shadowColor: "#dc2626",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    retryText: {
        fontSize: hp(1.6),
        fontFamily: "SFNSDisplay-Bold",
        color: "white",
    },
});