// app/(tabs)/fields/[id].jsx - UPDATED VERSION
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import ScreenWrapper from "../../../components/ScreenWrapper";
import { theme } from "../../../constants/theme";
import { hp, wp } from "../../../helpers/common";
import { iotService } from "../../../services/iotService";
import { weatherService } from "../../../services/weatherService";
import { predictSoilParams, generateCropDescriptionBoth } from "../../../services/geminiService";
import { getCropRecommendation } from "../../../services/cropRecommendationService";
import LottieView from "lottie-react-native";
import { useFieldData, useFields } from "../../../contexts/FieldContext";
import {router, useLocalSearchParams} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import BackButton from "../../../components/BackButton";

const TTL = 5 * 60 * 1000; // 5 mins

export default function FieldDetails() {
    const { id } = useLocalSearchParams();
    const { fields, fieldData, setFieldData, lastFetchedAt, setLastFetchedAt } = useFieldData();
    const field = fields.find(f => f.id === id) || { id, name: "Field" };

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
            const lon = loc?.longitude ?? 77.2090;
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
                // Keep existing refined recommendation
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

    const hasRefinedRecommendation = fieldData.refinedRecommendation != null;

    return (
        <ScreenWrapper bg="white">
            <View style={styles.headerRow}>
                <BackButton router={router} />
                <Text style={styles.pageTitle}>{field.name}</Text>
                <Pressable onPress={fetchAll}>
                    <Ionicons name="refresh" size={26} color={theme.colors.primary} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                {loading ? (
                    <View style={styles.loadingCard}>
                        <LottieView
                            source={require("../../../assets/animations/loading.json")}
                            style={styles.loadingAnimation}
                            autoPlay
                            loop
                            speed={1.2}
                        />
                        <Text style={styles.loadingText}>Collecting field data…</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorCard}>
                        <Text style={styles.errorText}>⚠️ {error}</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Current Inputs</Text>

                            <View style={styles.row}>
                                <Item label="Temperature" value={temperature ?? "—"} unit="°C" source="IoT" />
                                <Item label="Humidity" value={humidity ?? "—"} unit="%" source="IoT" />
                            </View>

                            <View style={styles.row}>
                                <Item label="Moisture" value={moisturePct ?? fieldData.moisture ?? "—"} unit="%" source="IoT" />
                                <Item label="Rainfall" value={rainfall ?? 0} unit="mm" source="Weather" />
                            </View>

                            <View style={styles.separator} />

                            <View style={styles.row}>
                                <Item label="Nitrogen (N)" value={predicted?.N ?? fieldData.N ?? "—"} unit="kg/ha" source="Predicted" />
                                <Item label="Phosphorus (P)" value={predicted?.P ?? fieldData.P ?? "—"} unit="kg/ha" source="Predicted" />
                            </View>
                            <View style={styles.row}>
                                <Item label="Potassium (K)" value={predicted?.K ?? fieldData.K ?? "—"} unit="kg/ha" source="Predicted" />
                                <Item label="Soil pH" value={predicted?.pH ?? fieldData.pH ?? "—"} unit="" source="Predicted" />
                            </View>
                        </View>

                        {/* Simple Recommendation Card */}
                        <View style={[styles.card,styles.lastCard]}>
                            <Text style={styles.cardTitle}>Today's Recommendation</Text>
                            {recommendation || fieldData.recommendation ? (
                                <View style={{ gap: hp(1) }}>
                                    <Text style={styles.recoCrop}>{(recommendation || fieldData.recommendation)?.best_crop}</Text>
                                    <Text style={styles.recoProb}>
                                        Confidence: {Number((recommendation || fieldData.recommendation)?.probability).toFixed(2)}
                                    </Text>

                                    {(englishDesc || fieldData.englishDesc) && (
                                        <>
                                            <View style={styles.descBox}>
                                                <Text style={styles.descPlaceholder}>
                                                    {isHindi
                                                        ? (hindiDesc || fieldData.hindiDesc)
                                                        : (englishDesc || fieldData.englishDesc)
                                                    }
                                                </Text>
                                            </View>

                                            <Pressable
                                                onPress={handleTranslate}
                                                style={styles.translateBtn}
                                            >
                                                <Text style={styles.translateBtnText}>
                                                    {isHindi ? "Show English" : "Translate to Hindi"}
                                                </Text>
                                            </Pressable>
                                        </>
                                    )}

                                    {/* Refine Button - Only show if no refined recommendation yet */}
                                    {!hasRefinedRecommendation && (
                                        <Pressable
                                            style={styles.refineBtn}
                                            onPress={() => router.push(`/fields/refine/${id}`)}
                                        >
                                            <Ionicons name="options-outline" size={20} color="white" />
                                            <Text style={styles.refineBtnText}>Refine My Recommendation</Text>
                                        </Pressable>
                                    )}
                                </View>
                            ) : (
                                <Text style={styles.descPlaceholder}>No recommendation available.</Text>
                            )}
                        </View>

                        {/* Refined Recommendation Section */}
                        {hasRefinedRecommendation && (
                            <>
                                <View style={styles.refinedHeaderCard}>
                                    <View style={styles.refinedHeader}>
                                        <Ionicons name="sparkles" size={24} color={theme.colors.primary} />
                                        <Text style={styles.refinedTitle}>Refined Recommendation</Text>
                                    </View>
                                    <Pressable
                                        style={styles.refineAgainBtn}
                                        onPress={() => router.push(`/fields/refine/${id}`)}
                                    >
                                        <Ionicons name="refresh-outline" size={18} color={theme.colors.primary} />
                                        <Text style={styles.refineAgainText}>Refine Again</Text>
                                    </Pressable>
                                </View>

                                {/* Top 3 Crops */}
                                <View style={styles.card}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="leaf" size={22} color="#22c55e" />
                                        <Text style={styles.sectionTitle}>Best Crops for Your Field</Text>
                                    </View>
                                    {fieldData.refinedRecommendation.topCrops?.map((crop, idx) => (
                                        <View key={idx} style={styles.cropCard}>
                                            <View style={styles.cropHeader}>
                                                <Text style={styles.cropRank}>#{idx + 1}</Text>
                                                <Text style={styles.cropName}>{crop.name}</Text>
                                            </View>
                                            <Text style={styles.cropReason}>{crop.reason}</Text>
                                            <View style={styles.cropMetrics}>
                                                <View style={styles.metricItem}>
                                                    <Ionicons name="trending-up" size={16} color="#22c55e" />
                                                    <Text style={styles.metricText}>{crop.expectedYield}</Text>
                                                </View>
                                                <View style={styles.metricItem}>
                                                    <Ionicons name="cash-outline" size={16} color="#22c55e" />
                                                    <Text style={styles.metricText}>{crop.estimatedProfit}</Text>
                                                </View>
                                                <View style={styles.metricItem}>
                                                    <Ionicons name="time-outline" size={16} color="#64748b" />
                                                    <Text style={styles.metricText}>{crop.growingPeriod}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Crops to Avoid */}
                                <View style={styles.card}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="close-circle" size={22} color="#ef4444" />
                                        <Text style={styles.sectionTitle}>Crops to Avoid</Text>
                                    </View>
                                    {fieldData.refinedRecommendation.avoidCrops?.map((crop, idx) => (
                                        <View key={idx} style={styles.avoidCropCard}>
                                            <Text style={styles.avoidCropName}>{crop.name}</Text>
                                            <Text style={styles.avoidCropReason}>{crop.reason}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Soil Improvements */}
                                <View style={styles.card}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="flask" size={22} color="#f59e0b" />
                                        <Text style={styles.sectionTitle}>Soil Improvement Tips</Text>
                                    </View>
                                    {fieldData.refinedRecommendation.soilImprovements?.map((tip, idx) => (
                                        <View key={idx} style={styles.tipCard}>
                                            <View style={styles.tipBullet}>
                                                <Text style={styles.tipBulletText}>{idx + 1}</Text>
                                            </View>
                                            <Text style={styles.tipText}>{tip}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Profit Strategies */}
                                <View style={styles.card}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="bulb" size={22} color="#8b5cf6" />
                                        <Text style={styles.sectionTitle}>Profit Maximization Strategies</Text>
                                    </View>
                                    {fieldData.refinedRecommendation.profitStrategies?.map((strategy, idx) => (
                                        <View key={idx} style={styles.strategyCard}>
                                            <View style={styles.strategyBullet}>
                                                <Ionicons name="checkmark" size={18} color="white" />
                                            </View>
                                            <Text style={styles.strategyText}>{strategy}</Text>
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

function Item({ label, value, unit, source }) {
    return (
        <View style={styles.item}>
            <Text style={styles.itemLabel}>{label}</Text>
            <Text style={styles.itemValue}>
                {value}
                {unit ? ` ${unit}` : ""} <Text style={styles.sourceTag}>({source})</Text>
            </Text>
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
        marginBottom: 10,
    },
    container: {
        paddingHorizontal: wp(5),
        paddingTop: hp(0.5),
        paddingBottom: hp(12),
        gap: hp(2),
    },
    pageTitle: {
        fontSize: hp(2.4),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: wp(4),
        borderWidth: 1,
        borderColor: "rgba(80,200,120,0.12)",
        shadowColor: "rgb(2,57,18)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
        gap: hp(1.2),
    },
    cardTitle: {
        fontSize: hp(2),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
    },
    row: {
        flexDirection: "row",
        gap: wp(4),
    },
    item: {
        flex: 1,
        gap: hp(0.5),
    },
    itemLabel: {
        fontSize: hp(1.5),
        color: theme.colors.textLight,
        fontFamily: "SFNSText-Regular",
    },
    itemValue: {
        fontSize: hp(2.1),
        color: theme.colors.textDark,
        fontFamily: "SFNSDisplay-Bold",
    },
    sourceTag: {
        fontSize: hp(1.5),
        color: theme.colors.primary,
        fontFamily: "SFNSText-Medium",
    },
    separator: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.06)",
        marginVertical: hp(0.5),
    },
    loadingCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: wp(6),
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(80,200,120,0.12)",
    },
    loadingAnimation: { width: wp(20), height: wp(20) },
    loadingText: {
        marginTop: hp(1),
        color: theme.colors.textLight,
        fontFamily: "SFNSText-Regular",
    },
    errorCard: {
        backgroundColor: "#fff5f5",
        borderRadius: 16,
        padding: wp(4),
        borderWidth: 1,
        borderColor: "#ffd6d6",
    },
    errorText: {
        color: "#c0392b",
        fontFamily: "SFNSDisplay-Bold",
    },
    recoCrop: {
        fontSize: hp(2.2),
        fontFamily: "SFNSDisplay-Heavy",
        color: theme.colors.primary,
    },
    recoProb: {
        fontSize: hp(1.8),
        fontFamily: "SFNSText-Medium",
        color: theme.colors.textDark,
    },
    descBox: {
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        borderRadius: 12,
        padding: wp(3),
        backgroundColor: "#fafafa",
    },
    descPlaceholder: {
        fontSize: hp(1.6),
        color: theme.colors.textLight,
        fontFamily: "SFNSText-Regular",
    },
    translateBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: hp(1.2),
        borderRadius: 8,
        alignItems: "center",
    },
    translateBtnText: {
        color: "white",
        fontFamily: "SFNSText-Medium",
    },
    refineBtn: {
        backgroundColor: "#8b5cf6",
        paddingVertical: hp(1.4),
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: wp(2),
        marginTop: hp(0.5),
        shadowColor: "#8b5cf6",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    refineBtnText: {
        color: "white",
        fontFamily: "SFNSDisplay-Bold",
        fontSize: hp(1.6),
    },

    // Refined Recommendation Styles
    refinedHeaderCard: {
        backgroundColor: "#f0fdf4",
        borderRadius: 16,
        padding: wp(4),
        borderWidth: 2,
        borderColor: "rgba(34, 197, 94, 0.3)",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    refinedHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
    },
    refinedTitle: {
        fontSize: hp(2.1),
        fontFamily: "SFNSDisplay-Heavy",
        color: theme.colors.primary,
    },
    refineAgainBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(1.5),
        paddingVertical: hp(0.8),
        paddingHorizontal: wp(3),
        backgroundColor: "white",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    refineAgainText: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Medium",
        color: theme.colors.primary,
    },

    // Section Headers
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
        marginBottom: hp(0.5),
    },
    sectionTitle: {
        fontSize: hp(1.9),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
    },

    // Crop Cards
    cropCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        padding: wp(3.5),
        borderWidth: 1,
        borderColor: "#e2e8f0",
        gap: hp(0.8),
    },
    cropHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
        marginBottom: hp(0.3),
    },
    cropRank: {
        fontSize: hp(1.5),
        fontFamily: "SFNSDisplay-Heavy",
        color: "#22c55e",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.3),
        borderRadius: 6,
    },
    cropName: {
        fontSize: hp(1.9),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
        flex: 1,
    },
    cropReason: {
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Regular",
        color: theme.colors.textLight,
        lineHeight: hp(2.1),
    },
    cropMetrics: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: wp(3),
        marginTop: hp(0.5),
    },
    metricItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(1),
    },
    metricText: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Medium",
        color: theme.colors.textDark,
    },

    // Avoid Crops
    avoidCropCard: {
        backgroundColor: "#fef2f2",
        borderRadius: 10,
        padding: wp(3),
        borderWidth: 1,
        borderColor: "#fecaca",
        gap: hp(0.5),
    },
    avoidCropName: {
        fontSize: hp(1.7),
        fontFamily: "SFNSDisplay-Bold",
        color: "#dc2626",
    },
    avoidCropReason: {
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Regular",
        color: "#991b1b",
        lineHeight: hp(2),
    },

    // Tips
    tipCard: {
        flexDirection: "row",
        gap: wp(3),
        alignItems: "flex-start",
    },
    tipBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#f59e0b",
        alignItems: "center",
        justifyContent: "center",
        marginTop: hp(0.2),
    },
    tipBulletText: {
        fontSize: hp(1.4),
        fontFamily: "SFNSDisplay-Bold",
        color: "white",
    },
    tipText: {
        flex: 1,
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Regular",
        color: theme.colors.textDark,
        lineHeight: hp(2.1),
    },

    // Strategies
    strategyCard: {
        flexDirection: "row",
        gap: wp(3),
        alignItems: "flex-start",
        backgroundColor: "#faf5ff",
        padding: wp(3),
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e9d5ff",
    },
    strategyBullet: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#8b5cf6",
        alignItems: "center",
        justifyContent: "center",
        marginTop: hp(0.2),
    },
    strategyText: {
        flex: 1,
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Regular",
        color: theme.colors.textDark,
        lineHeight: hp(2.1),
    },
    lastCard: {
        marginBottom: 130,
    }
});