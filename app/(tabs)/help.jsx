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
import { Ionicons } from "@expo/vector-icons";
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

                {/* ASK AI - REDESIGNED TO MATCH FAB MODAL */}
                <View style={styles.aiCard}>
                    {/* Header Section */}
                    <View style={styles.aiHeader}>
                        <View style={styles.aiIconContainer}>
                            <LottieView
                                source={require("../../assets/animations/sparkle.json")}
                                autoPlay
                                loop
                                style={styles.lottieAnimation}
                                colorFilters={[
                                    {
                                        keypath: "*",
                                        color: "#ffffff"
                                    }
                                ]}
                            />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.aiMainTitle}>AI Assistant</Text>
                            <Text style={styles.aiSubtitle}>Ask me anything about farming</Text>
                        </View>
                    </View>

                    {/* Input Section */}
                    <View style={styles.inputSection}>
                        <Text style={styles.inputLabel}>Your Question</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                value={q}
                                onChangeText={setQ}
                                placeholder="e.g., What's the best time to plant rice?"
                                placeholderTextColor="#94a3b8"
                                multiline
                                maxLength={500}
                                style={styles.aiInput}
                                editable={!loading}
                            />
                            <View style={styles.inputDecoration} />
                        </View>
                        <Text style={styles.charCount}>{q.length}/500</Text>
                    </View>

                    {/* Ask Button */}
                    <Pressable
                        onPress={onAsk}
                        style={({ pressed }) => [
                            styles.askButton,
                            pressed && styles.askButtonPressed,
                            loading && styles.askButtonDisabled
                        ]}
                        disabled={loading || !q.trim()}
                    >
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator color="white" size="small" />
                                <Text style={styles.askButtonText}>Thinking...</Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContent}>
                                <Ionicons name="sparkles" size={20} color="white" />
                                <Text style={styles.askButtonText}>Ask AI</Text>
                                <Ionicons name="arrow-forward" size={20} color="white" />
                            </View>
                        )}
                    </Pressable>

                    {/* Error State */}
                    {err ? (
                        <View style={styles.errorCard}>
                            <Ionicons name="alert-circle" size={20} color="#ef4444" />
                            <Text style={styles.errorText}>{err}</Text>
                        </View>
                    ) : null}

                    {/* Answer Section */}
                    {answer ? (
                        <View style={styles.answerSection}>
                            <View style={styles.answerHeader}>
                                <View style={styles.answerIconBox}>
                                    <Ionicons name="bulb" size={20} color="#22c55e" />
                                </View>
                                <Text style={styles.answerTitle}>AI Response</Text>
                            </View>
                            <View style={styles.answerBox}>
                                <Text style={styles.answerText}>{answer}</Text>
                            </View>

                            {/* Action Button */}
                            <View style={styles.actionButtons}>
                                <Pressable
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setAnswer("");
                                        setQ("");
                                    }}
                                >
                                    <Ionicons name="refresh-outline" size={18} color="#64748b" />
                                    <Text style={styles.actionButtonText}>New Question</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : null}

                    {/* Suggested Questions (only show when no answer) */}
                    {!answer && !loading && (
                        <View style={styles.suggestionsSection}>
                            <Text style={styles.suggestionsTitle}>💡 Suggested Questions</Text>
                            {[
                                "What crops are suitable for my soil?",
                                "How can I improve crop yield?",
                                "Best fertilizer for wheat?",
                                "When should I irrigate my field?"
                            ].map((suggestion, index) => (
                                <Pressable
                                    key={index}
                                    style={styles.suggestionChip}
                                    onPress={() => setQ(suggestion)}
                                >
                                    <Text style={styles.suggestionText}>{suggestion}</Text>
                                </Pressable>
                            ))}
                        </View>
                    )}
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

    // ===== ASK AI CARD STYLES (MATCHING FAB MODAL) =====
    aiCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: wp(5),
        marginTop: hp(2),
        marginBottom: hp(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    aiHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(2),
        paddingBottom: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    aiIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    lottieAnimation: {
        width: "140%",
        height: "140%",
    },
    headerText: {
        flex: 1,
    },
    aiMainTitle: {
        fontSize: hp(2.2),
        fontFamily: "SFNSDisplay-Bold",
        color: "#1e293b",
    },
    aiSubtitle: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Regular",
        color: "#64748b",
        marginTop: 2,
    },

    // Input Section
    inputSection: {
        marginBottom: hp(1.5),
    },
    inputLabel: {
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Medium",
        color: "#475569",
        marginBottom: hp(1),
    },
    inputWrapper: {
        position: "relative",
    },
    aiInput: {
        borderWidth: 2,
        borderColor: "#e2e8f0",
        borderRadius: 16,
        padding: wp(4),
        minHeight: hp(12),
        textAlignVertical: "top",
        color: "#1e293b",
        fontFamily: "SFNSText-Regular",
        fontSize: hp(1.6),
        backgroundColor: "#f8fafc",
    },
    inputDecoration: {
        position: "absolute",
        bottom: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#22c55e",
        opacity: 0.4,
    },
    charCount: {
        fontSize: hp(1.3),
        fontFamily: "SFNSText-Regular",
        color: "#94a3b8",
        textAlign: "right",
        marginTop: hp(0.5),
    },

    // Ask Button
    askButton: {
        backgroundColor: "#22c55e",
        paddingVertical: hp(1.6),
        paddingHorizontal: wp(4),
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: hp(2),
        shadowColor: "#22c55e",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    askButtonPressed: {
        backgroundColor: "#16a34a",
        transform: [{ scale: 0.98 }],
    },
    askButtonDisabled: {
        backgroundColor: "#94a3b8",
        shadowOpacity: 0.1,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    askButtonText: {
        color: "white",
        fontFamily: "SFNSDisplay-Bold",
        fontSize: hp(1.7),
    },

    // Error State
    errorCard: {
        backgroundColor: "#fef2f2",
        borderRadius: 12,
        padding: wp(3.5),
        flexDirection: "row",
        gap: wp(2.5),
        alignItems: "center",
        marginBottom: hp(2),
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    errorText: {
        color: "#dc2626",
        fontFamily: "SFNSText-Medium",
        fontSize: hp(1.5),
        flex: 1,
    },

    // Answer Section
    answerSection: {
        marginTop: hp(1),
    },
    answerHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: hp(1.2),
    },
    answerIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    answerTitle: {
        fontSize: hp(1.7),
        fontFamily: "SFNSDisplay-Bold",
        color: "#22c55e",
    },
    answerBox: {
        backgroundColor: "#f0fdf4",
        padding: wp(4),
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "rgba(34, 197, 94, 0.2)",
    },
    answerText: {
        fontSize: hp(1.6),
        fontFamily: "SFNSText-Regular",
        color: "#1e293b",
        lineHeight: hp(2.3),
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: hp(1.2),
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: hp(1),
        paddingHorizontal: wp(3.5),
        borderRadius: 10,
        backgroundColor: "#f1f5f9",
    },
    actionButtonText: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Medium",
        color: "#64748b",
    },

    // Suggestions Section
    suggestionsSection: {
        marginTop: hp(1),
    },
    suggestionsTitle: {
        fontSize: hp(1.5),
        fontFamily: "SFNSDisplay-Bold",
        color: "#475569",
        marginBottom: hp(1.2),
    },
    suggestionChip: {
        backgroundColor: "#f8fafc",
        paddingVertical: hp(1.2),
        paddingHorizontal: wp(4),
        borderRadius: 12,
        marginBottom: hp(1),
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    suggestionText: {
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Regular",
        color: "#475569",
    },
});