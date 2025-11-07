// ============================================
// app/(tabs)/help.jsx  – Help Tab (Redesigned)
// ============================================

import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    Pressable,
    TextInput,
    ActivityIndicator,
} from "react-native";
import LottieView from "lottie-react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import { helpAnswer } from "../../services/geminiService";
import { useFieldData } from "../../contexts/FieldContext";

export default function Help() {
    const { fieldData } = useFieldData();
    const [q, setQ] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const onAsk = async () => {
        if (!q.trim()) return;
        try {
            setErr("");
            setAnswer("");
            setLoading(true);
            const text = await helpAnswer({ question: q, context: fieldData });
            setAnswer(text);
        } catch (e) {
            setErr(e.message || "Error answering.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper bg="white">
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.pageTitle}>Help</Text>

                <Accordion title="About AgroSync" defaultOpen>
                    <Text style={styles.bodyText}>
                        AgroSync uses IoT + Weather + AI (Gemini + Crop Recommender Engine)
                        to assist farmers with crop planning decisions.
                    </Text>
                </Accordion>

                <Accordion title="Understanding Sensor Data">
                    <Text style={styles.bodyText}>
                        Temperature & Humidity come from your IoT device.
                        {"\n"}Rainfall (mm) is fetched from weather API.
                        {"\n"}Moisture % is computed from soil raw value (0–4095).
                    </Text>
                </Accordion>

                <Accordion title="NPK & Soil pH Explained">
                    <Text style={styles.bodyText}>
                        AgroSync estimates these using AI based on current field
                        environment. Values are used by the recommendation engine.
                    </Text>
                </Accordion>

                <Accordion title="How Crop Recommendation Works">
                    <Text style={styles.bodyText}>
                        Your N,P,K,pH + Temperature, Humidity, Moisture & Rainfall are sent
                        to ML model which returns best possible crop today.
                    </Text>
                </Accordion>

                {/* ASK AI - REDESIGNED */}
                <View style={styles.aiCardWrapper}>
                    {/* Gradient Background Effect */}
                    <View style={styles.gradientBg} />

                    <View style={styles.aiCard}>
                        {/* Header Section */}
                        <View style={styles.aiHeader}>
                            <View style={styles.aiIconContainer}>
                                <LottieView
                                    source={require("../../assets/animations/sparkle.json")}
                                    autoPlay
                                    loop
                                    style={styles.lottieAnimation}
                                />
                            </View>
                            <View style={styles.headerText}>
                                <Text style={styles.aiMainTitle}>Ask AI</Text>
                                <Text style={styles.aiSubtitle}>Get instant farming insights</Text>
                            </View>
                        </View>

                        {/* Description */}
                        <Text style={styles.aiDescription}>
                            Ask anything about field conditions, crop recommendations, or farming tips
                        </Text>

                        {/* Input Section */}
                        <View style={styles.inputContainer}>
                            <TextInput
                                value={q}
                                onChangeText={setQ}
                                placeholder="Ask your farming question..."
                                placeholderTextColor="#a3b5b7"
                                multiline
                                style={styles.aiInput}
                                editable={!loading}
                            />
                            <View style={styles.inputDecor} />
                        </View>

                        {/* Ask Button */}
                        <Pressable
                            onPress={onAsk}
                            style={({ pressed }) => [
                                styles.aiAskBtn,
                                pressed && styles.aiAskBtnPressed,
                            ]}
                            disabled={loading}
                        >
                            {loading ? (
                                <View style={styles.loadingBtn}>
                                    <ActivityIndicator color="white" size="small" />
                                    <Text style={styles.aiAskBtnText}>Asking...</Text>
                                </View>
                            ) : (
                                <View style={styles.btnContent}>
                                    <Text style={styles.aiAskBtnText}>Ask AI</Text>
                                    <Text style={styles.btnArrow}>→</Text>
                                </View>
                            )}
                        </Pressable>

                        {/* Error State */}
                        {err ? (
                            <View style={styles.aiErrorCard}>
                                <Text style={styles.aiErrorIcon}>⚠️</Text>
                                <Text style={styles.aiErrorText}>{err}</Text>
                            </View>
                        ) : null}

                        {/* Answer State */}
                        {answer ? (
                            <View style={styles.aiAnswerBox}>
                                <View style={styles.answerHeader}>
                                    <Text style={styles.answerIcon}>💡</Text>
                                    <Text style={styles.answerLabel}>AI Response</Text>
                                </View>
                                <Text style={styles.answerText}>{answer}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

// --- Accordion ---
function Accordion({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <View style={styles.card}>
            <Pressable
                onPress={() => setOpen(!open)}
                style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.chevron}>{open ? "▾" : "▸"}</Text>
            </Pressable>
            {open && <View style={{ marginTop: hp(0.8) }}>{children}</View>}
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
        gap: hp(1),
    },
    cardTitle: {
        fontSize: hp(2),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
    },
    bodyText: {
        fontSize: hp(1.6),
        fontFamily: "SFNSText-Regular",
        color: theme.colors.textDark,
        lineHeight: hp(2.3),
    },
    chevron: {
        fontSize: hp(2.2),
        color: theme.colors.textLight,
    },

    // ===== ASK AI CARD STYLES =====
    aiCardWrapper: {
        position: "relative",
        marginTop: hp(2),
        marginBottom: hp(6),
    },
    gradientBg: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "100%",
        backgroundColor: "rgba(63,191,101,0.08)",
        borderRadius: 20,
        zIndex: 0,
    },
    aiCard: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: wp(5),
        borderWidth: 2,
        borderColor: theme.colors.primary,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
        gap: hp(2),
        zIndex: 1,
    },
    aiHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
    },
    aiIconContainer: {
        width: wp(14),
        height: wp(14),
        borderRadius: wp(7),
        backgroundColor: "rgba(63,191,101,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    lottieAnimation: {
        width: "200%",
        height: "200%",
    },
    headerText: {
        flex: 1,
        gap: hp(0.2),
    },
    aiMainTitle: {
        fontSize: hp(2.4),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.primary,
    },
    aiSubtitle: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Regular",
        color: theme.colors.textLight,
    },
    aiDescription: {
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Regular",
        color: theme.colors.textDark,
        lineHeight: hp(2.1),
    },
    inputContainer: {
        position: "relative",
    },
    aiInput: {
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        borderRadius: 14,
        padding: wp(4),
        minHeight: hp(12),
        textAlignVertical: "top",
        color: theme.colors.textDark,
        fontFamily: "SFNSText-Regular",
        fontSize: hp(1.6),
        backgroundColor: "#fafbfa",
    },
    inputDecor: {
        position: "absolute",
        bottom: hp(1),
        right: wp(3),
        width: wp(2),
        height: wp(2),
        borderRadius: wp(1),
        backgroundColor: theme.colors.primary,
        opacity: 0.3,
    },
    aiAskBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: hp(1.6),
        paddingHorizontal: wp(4),
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    aiAskBtnPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    btnContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
    },
    aiAskBtnText: {
        color: "white",
        fontFamily: "SFNSText-Medium",
        fontSize: hp(1.9),
    },
    btnArrow: {
        color: "white",
        fontSize: hp(2),
    },
    loadingBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
    },
    aiErrorCard: {
        backgroundColor: "#fff5f5",
        borderRadius: 14,
        padding: wp(4),
        borderWidth: 1.5,
        borderColor: "#ffc0c0",
        flexDirection: "row",
        gap: wp(3),
        alignItems: "flex-start",
    },
    aiErrorIcon: {
        fontSize: hp(2.2),
    },
    aiErrorText: {
        color: "#c0392b",
        fontFamily: "SFNSText-Medium",
        fontSize: hp(1.5),
        flex: 1,
    },
    aiAnswerBox: {
        backgroundColor: "#f0fdf4",
        borderRadius: 14,
        padding: wp(4),
        borderWidth: 1.5,
        borderColor: "rgba(63,191,101,0.3)",
        gap: hp(1.2),
    },
    answerHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
    },
    answerIcon: {
        fontSize: hp(2),
    },
    answerLabel: {
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Medium",
        color: theme.colors.primary,
    },
    answerText: {
        fontSize: hp(1.6),
        fontFamily: "SFNSText-Regular",
        color: theme.colors.textDark,
        lineHeight: hp(2.4),
    },
});