// ============================================
// app/(tabs)/fields.jsx  — Fields tab UI + glue
// ============================================

import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { iotService } from "../../services/iotService";
import { weatherService } from "../../services/weatherService";
import { predictSoilParams, generateCropDescriptionBoth } from "../../services/geminiService";
import { getCropRecommendation } from "../../services/cropRecommendationService";
import LottieView from "lottie-react-native";
import { useFieldData } from "../../contexts/FieldContext";   // <--- ADDED


export default function Fields() {
    // NEW
    const { setFieldData } = useFieldData();  // <--- ADDED

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

    const temperature = iot?.temperature ?? null;
    const humidity = iot?.humidity ?? null;
    const rainfall = weather?.current?.precip_mm ?? null;

    useEffect(() => {
        (async () => {
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


                // =====================
                // UPDATE GLOBAL CONTEXT
                // =====================
                setFieldData({
                    temperature: iotRes.data.temperature,
                    humidity: iotRes.data.humidity,
                    moisture: Math.max(0, Math.min(100, Math.round((Number(iotRes.data.soil) / 4095) * 100))),
                    rainfall: w.data?.current?.precip_mm ?? 0,
                    N: preds.N,
                    P: preds.P,
                    K: preds.K,
                    pH: preds.pH,
                });

            } catch (e) {
                console.log("💥 GEMINI / RECOMMENDER ERROR:", e);
                setError(e.message || JSON.stringify(e));
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleTranslate = () => {
        setIsHindi(!isHindi);
    };


    return (
        <ScreenWrapper bg="white">
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.pageTitle}>Fields</Text>

                {loading ? (
                    <View style={styles.loadingCard}>
                        <LottieView
                            source={require("../../assets/animations/loading.json")}
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
                                <Item label="Moisture" value={moisturePct ?? "—"} unit="%" source="IoT" />
                                <Item label="Rainfall" value={rainfall ?? 0} unit="mm" source="Weather" />
                            </View>

                            <View style={styles.separator} />

                            <View style={styles.row}>
                                <Item label="Nitrogen (N)" value={predicted?.N ?? "—"} unit="kg/ha" source="Predicted" />
                                <Item label="Phosphorus (P)" value={predicted?.P ?? "—"} unit="kg/ha" source="Predicted" />
                            </View>
                            <View style={styles.row}>
                                <Item label="Potassium (K)" value={predicted?.K ?? "—"} unit="kg/ha" source="Predicted" />
                                <Item label="Soil pH" value={predicted?.pH ?? "—"} unit="" source="Predicted" />
                            </View>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Today’s Recommendation</Text>
                            {recommendation ? (
                                <View style={{ gap: hp(1) }}>
                                    <Text style={styles.recoCrop}>{recommendation.best_crop}</Text>
                                    <Text style={styles.recoProb}>Confidence: {Number(recommendation.probability).toFixed(2)}</Text>

                                    {englishDesc && (
                                        <>
                                            <View style={styles.descBox}>
                                                <Text style={styles.descPlaceholder}>
                                                    {isHindi ? hindiDesc : englishDesc}
                                                </Text>
                                            </View>

                                            <Pressable
                                                onPress={handleTranslate}
                                                style={{
                                                    backgroundColor: theme.colors.primary,
                                                    paddingVertical: hp(1.2),
                                                    borderRadius: 8,
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Text style={{ color: "white", fontFamily: "SFNSText-Medium" }}>
                                                    {isHindi ? "Show English" : "Translate to Hindi"}
                                                </Text>
                                            </Pressable>
                                        </>
                                    )}
                                </View>
                            ) : (
                                <Text style={styles.descPlaceholder}>No recommendation available.</Text>
                            )}
                        </View>
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
                {value}{unit ? ` ${unit}` : ""} <Text style={styles.sourceTag}>({source})</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
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
});
