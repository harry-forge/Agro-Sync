// components/AskAIFab.jsx - REDESIGNED VERSION
import { useState } from "react";
import {
    Modal,
    View,
    Text,
    Pressable,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFieldData } from "../contexts/FieldContext";
import { helpAnswer } from "../services/geminiService";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import LottieView from "lottie-react-native";

export default function AskAIFab() {
    const { fieldData } = useFieldData();
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");
    const [answer, setAnswer] = useState("");
    const [loading, setLoading] = useState(false);

    const ask = async() => {
        if (!q.trim()) return;
        setLoading(true);
        const res = await helpAnswer({question:q, context:fieldData});
        setAnswer(res);
        setLoading(false);
    }

    const handleClose = () => {
        setOpen(false);
        // Clear after animation completes
        setTimeout(() => {
            setQ("");
            setAnswer("");
        }, 300);
    }

    return (
        <>
            {/* Floating Action Button with Gradient Effect */}
            <Pressable
                onPress={() => setOpen(true)}
                style={({ pressed }) => [
                    styles.fab,
                    pressed && styles.fabPressed
                ]}
            >
                <View style={styles.fabGradient}>
                    <View style={styles.fabInner}>
                        <View style={styles.lottieWrapper}>
                            <LottieView
                                source={require("../assets/animations/sparkle.json")}
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
                        {/*<Ionicons*/}
                        {/*    name="sparkles"*/}
                        {/*    size={28}*/}
                        {/*    color="white"*/}
                        {/*    style={styles.overlayIcon}*/}
                        {/*/>*/}
                    </View>
                </View>
                {/* Pulse Ring Effect */}
                <View style={styles.pulseRing1} />
                <View style={styles.pulseRing2} />
            </Pressable>

            <Modal
                visible={open}
                transparent
                animationType="slide"
                statusBarTranslucent
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalContainer}
                >
                    <Pressable
                        style={styles.backdrop}
                        onPress={handleClose}
                    />

                    <View style={styles.modalContent}>
                        {/* Decorative Top Bar */}
                        <View style={styles.modalTopBar} />

                        {/* Header with Close Button */}
                        <View style={styles.modalHeader}>
                            <View style={styles.headerLeft}>
                                <View style={styles.aiIconContainer}>
                                    <LottieView
                                        source={require("../assets/animations/sparkle.json")}
                                        autoPlay
                                        loop
                                        style={styles.headerLottie}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.modalTitle}>AI Assistant</Text>
                                    <Text style={styles.modalSubtitle}>Ask me anything about farming</Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={handleClose}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close-circle" size={28} color="#64748b"/>
                            </Pressable>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Input Section */}
                            <View style={styles.inputSection}>
                                <Text style={styles.inputLabel}>Your Question</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., What's the best time to plant rice?"
                                        placeholderTextColor="#94a3b8"
                                        value={q}
                                        onChangeText={setQ}
                                        multiline
                                        maxLength={500}
                                        editable={!loading}
                                    />
                                    <View style={styles.inputDecoration} />
                                </View>
                                <Text style={styles.charCount}>{q.length}/500</Text>
                            </View>

                            {/* Ask Button */}
                            <Pressable
                                onPress={ask}
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

                            {/* Answer Section */}
                            {answer && (
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

                                    {/* Action Buttons */}
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
                            )}

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
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    // FAB Styles
    fab: {
        position: "absolute",
        bottom: 110,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        shadowColor: "#16a34a",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
        zIndex: 999,
        marginBottom: 15
    },
    fabPressed: {
        transform: [{ scale: 0.92 }],
        shadowOpacity: 0.2,
    },
    fabGradient: {
        width: "100%",
        height: "100%",
        borderRadius: 28,
        backgroundColor: "#16a34a",
        overflow: "hidden",
    },
    fabInner: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        borderRadius: 28,
        borderWidth: 2.5,
        borderColor: "rgba(255, 255, 255, 0.25)",
    },
    lottieWrapper: {
        position: "absolute",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    lottieAnimation: {
        width: "180%",
        height: "180%",
    },
    overlayIcon: {
        zIndex: 10,
    },
    pulseRing1: {
        position: "absolute",
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: "rgba(22, 163, 74, 0.25)",
        top: -7,
        left: -7,
    },
    pulseRing2: {
        position: "absolute",
        width: 84,
        height: 84,
        borderRadius: 42,
        borderWidth: 1.5,
        borderColor: "rgba(22, 163, 74, 0.15)",
        top: -14,
        left: -14,
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: "90%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 20,
    },
    modalTopBar: {
        width: 48,
        height: 5,
        backgroundColor: "#e2e8f0",
        borderRadius: 3,
        alignSelf: "center",
        marginTop: 12,
        marginBottom: 8,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
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
    headerLottie: {
        width: "140%",
        height: "140%",
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: "SFNSDisplay-Bold",
        color: "#1e293b",
    },
    modalSubtitle: {
        fontSize: 13,
        fontFamily: "SFNSText-Regular",
        color: "#64748b",
        marginTop: 2,
    },
    closeButton: {
        padding: 4,
    },

    // Scroll Content
    scrollContent: {
        padding: 24,
        paddingBottom: 32,
    },

    // Input Section
    inputSection: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: "SFNSText-Medium",
        color: "#475569",
        marginBottom: 8,
    },
    inputWrapper: {
        position: "relative",
    },
    input: {
        borderWidth: 2,
        borderColor: "#e2e8f0",
        borderRadius: 16,
        padding: 16,
        minHeight: 120,
        textAlignVertical: "top",
        color: "#1e293b",
        fontFamily: "SFNSText-Regular",
        fontSize: 15,
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
        fontSize: 12,
        fontFamily: "SFNSText-Regular",
        color: "#94a3b8",
        textAlign: "right",
        marginTop: 6,
    },

    // Ask Button
    askButton: {
        backgroundColor: "#22c55e",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
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
        fontSize: 16,
    },

    // Answer Section
    answerSection: {
        marginTop: 8,
    },
    answerHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
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
        fontSize: 16,
        fontFamily: "SFNSDisplay-Bold",
        color: "#22c55e",
    },
    answerBox: {
        backgroundColor: "#f0fdf4",
        padding: 18,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "rgba(34, 197, 94, 0.2)",
    },
    answerText: {
        fontSize: 15,
        fontFamily: "SFNSText-Regular",
        color: "#1e293b",
        lineHeight: 24,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        marginTop: 12,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: "#f1f5f9",
    },
    actionButtonText: {
        fontSize: 13,
        fontFamily: "SFNSText-Medium",
        color: "#64748b",
    },

    // Suggestions Section
    suggestionsSection: {
        marginTop: 8,
    },
    suggestionsTitle: {
        fontSize: 14,
        fontFamily: "SFNSDisplay-Bold",
        color: "#475569",
        marginBottom: 12,
    },
    suggestionChip: {
        backgroundColor: "#f8fafc",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    suggestionText: {
        fontSize: 14,
        fontFamily: "SFNSText-Regular",
        color: "#475569",
    },
});