// app/(tabs)/fields/refine/[id].jsx

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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ScreenWrapper from "../../../../components/ScreenWrapper";
import BackButton from "../../../../components/BackButton";
import { theme } from "../../../../constants/theme";
import { hp, wp } from "../../../../helpers/common";
import { useFieldData } from "../../../../contexts/FieldContext";
import { getRefinedRecommendation } from "../../../../services/geminiService";

export default function RefineRecommendation() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { fieldData, setFieldData } = useFieldData();

    const [farmSize, setFarmSize] = useState("");
    const [budget, setBudget] = useState("");
    const [laborAvailability, setLaborAvailability] = useState("moderate");
    const [waterSource, setWaterSource] = useState("rainwater");
    const [irrigationSystem, setIrrigationSystem] = useState("none");
    const [marketDistance, setMarketDistance] = useState("");
    const [farmingExperience, setFarmingExperience] = useState("intermediate");
    const [previousCrop, setPreviousCrop] = useState("");
    const [soilTexture, setSoilTexture] = useState("loamy");
    const [organicPreference, setOrganicPreference] = useState("mixed");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGetRefinedRecommendation = async () => {
        if (!farmSize || !budget || !marketDistance) {
            setError("Please fill Farm Size, Budget & Market Distance");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const refinementData = {
                temperature: fieldData.temperature || 25,
                humidity: fieldData.humidity || 65,
                moisture: fieldData.moisture || 50,
                rainfall: fieldData.rainfall || 800,
                N: fieldData.N || 80,
                P: fieldData.P || 40,
                K: fieldData.K || 40,
                pH: fieldData.pH || 6.5,
                currentRecommendation: fieldData.recommendation?.best_crop || "Rice",
                farmSize: parseFloat(farmSize),
                budget: parseFloat(budget),
                laborAvailability,
                waterSource,
                irrigationSystem,
                marketDistance: parseFloat(marketDistance),
                farmingExperience,
                previousCrop: previousCrop || "none",
                soilTexture,
                organicPreference,
            };

            const refinedData = await getRefinedRecommendation(refinementData);

            setFieldData({
                ...fieldData,
                refinedRecommendation: refinedData,
            });

            router.replace(`/fields/refineSummary/${id}`);
        } catch (e) {
            console.error("Refine error", e);
            setError(e.message || "Failed to get refined recommendation. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const OptionRow = ({ label, options, valueSetter, value }) => (
        <View style={styles.optionsRow}>
            {options.map((opt) => (
                <Pressable
                    key={opt}
                    style={[styles.optionChip, value === opt && styles.optionChipSelected]}
                    onPress={() => valueSetter(opt)}
                >
                    <Text style={[styles.optionText, value === opt && styles.optionTextSelected]}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </Text>
                </Pressable>
            ))}
        </View>
    );

    return (
        <ScreenWrapper bg="#f8fafb">
            {/* Premium Header */}
            <View style={styles.header}>
                <BackButton router={router} />
                <View style={styles.headerContent}>
                    <View style={styles.sparkleIcon}>
                        <Ionicons name="sparkles" size={20} color="#8b5cf6" />
                    </View>
                    <Text style={styles.pageTitle}>Refine Recommendation</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={styles.heroCard}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="analytics" size={32} color="#8b5cf6" />
                    </View>
                    <Text style={styles.heroTitle}>Personalized Insights</Text>
                    <Text style={styles.heroDesc}>
                        Share your field details to get AI-powered recommendations tailored to your resources and goals.
                    </Text>
                </View>

                {/* Farm Details Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconContainer}>
                            <Ionicons name="home" size={18} color="#16a34a" />
                        </View>
                        <Text style={styles.sectionTitle}>Farm Details</Text>
                        <View style={styles.requiredBadge}>
                            <Text style={styles.requiredText}>Required</Text>
                        </View>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Farm Size (acres) *</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="resize" size={18} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 5"
                                    placeholderTextColor="#94a3b8"
                                    value={farmSize}
                                    onChangeText={setFarmSize}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Budget (₹) *</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="cash" size={18} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 50000"
                                    placeholderTextColor="#94a3b8"
                                    value={budget}
                                    onChangeText={setBudget}
                                    keyboardType="number-pad"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Water & Irrigation */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconContainer, { backgroundColor: "#eff6ff" }]}>
                            <Ionicons name="water" size={18} color="#3b82f6" />
                        </View>
                        <Text style={styles.sectionTitle}>Water & Irrigation</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>Primary Water Source</Text>
                        <OptionRow
                            options={["rainwater", "borewell", "canal", "river"]}
                            value={waterSource}
                            valueSetter={setWaterSource}
                        />

                        <View style={styles.divider} />

                        <Text style={styles.label}>Irrigation System</Text>
                        <OptionRow
                            options={["none", "drip", "sprinkler", "flood"]}
                            value={irrigationSystem}
                            valueSetter={setIrrigationSystem}
                        />
                    </View>
                </View>

                {/* Resources & Market */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconContainer, { backgroundColor: "#fef3c7" }]}>
                            <Ionicons name="people" size={18} color="#f59e0b" />
                        </View>
                        <Text style={styles.sectionTitle}>Resources & Market</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>Labor Availability</Text>
                        <OptionRow
                            options={["low", "moderate", "high"]}
                            value={laborAvailability}
                            valueSetter={setLaborAvailability}
                        />

                        <View style={styles.divider} />

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Market Distance (km) *</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="navigate" size={18} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 15"
                                    placeholderTextColor="#94a3b8"
                                    value={marketDistance}
                                    onChangeText={setMarketDistance}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Experience & Soil */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconContainer, { backgroundColor: "#faf5ff" }]}>
                            <Ionicons name="school" size={18} color="#8b5cf6" />
                        </View>
                        <Text style={styles.sectionTitle}>Experience & Soil</Text>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.label}>Farming Experience</Text>
                        <OptionRow
                            options={["beginner", "intermediate", "expert"]}
                            value={farmingExperience}
                            valueSetter={setFarmingExperience}
                        />

                        <View style={styles.divider} />

                        <Text style={styles.label}>Soil Texture</Text>
                        <OptionRow
                            options={["sandy", "loamy", "clayey", "silty"]}
                            value={soilTexture}
                            valueSetter={setSoilTexture}
                        />

                        <View style={styles.divider} />

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Previous Crop (Optional)</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="leaf-outline" size={18} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., Wheat, Rice"
                                    placeholderTextColor="#94a3b8"
                                    value={previousCrop}
                                    onChangeText={setPreviousCrop}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Error Message */}
                {error ? (
                    <View style={styles.errorCard}>
                        <Ionicons name="alert-circle" size={22} color="#dc2626" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {/* Submit Button */}
                <Pressable
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleGetRefinedRecommendation}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="white" size="small" />
                            <Text style={styles.submitButtonText}>Analyzing...</Text>
                        </View>
                    ) : (
                        <View style={styles.buttonContent}>
                            <Ionicons name="sparkles" size={22} color="white" />
                            <View>
                                <Text style={styles.submitButtonText}>Get Refined Recommendation</Text>
                                <Text style={styles.submitButtonSubtext}>AI-powered analysis</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color="white" />
                        </View>
                    )}
                </Pressable>

                <View style={{ height: hp(4) }} />
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: wp(5),
        paddingTop: hp(2),
        paddingBottom: hp(1.5),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
    },
    sparkleIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "#faf5ff",
        alignItems: "center",
        justifyContent: "center",
    },
    pageTitle: {
        fontSize: hp(2.2),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
    },
    container: {
        paddingTop: hp(2),
        paddingBottom: hp(12),
    },
    heroCard: {
        marginHorizontal: wp(5),
        backgroundColor: "white",
        borderRadius: 20,
        padding: wp(5),
        alignItems: "center",
        marginBottom: hp(3),
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#8b5cf6",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 6,
    },
    heroIcon: {
        width: 70,
        height: 70,
        borderRadius: 20,
        backgroundColor: "#faf5ff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: hp(1.5),
        borderWidth: 2,
        borderColor: "#e9d5ff",
    },
    heroTitle: {
        fontSize: hp(2.2),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
        marginBottom: hp(0.8),
    },
    heroDesc: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Regular",
        color: "#64748b",
        textAlign: "center",
        lineHeight: hp(2.1),
    },
    section: {
        marginBottom: hp(2.5),
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
        paddingHorizontal: wp(5),
        marginBottom: hp(1.2),
    },
    sectionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "#f0fdf4",
        alignItems: "center",
        justifyContent: "center",
    },
    sectionTitle: {
        fontSize: hp(1.8),
        fontFamily: "SFNSDisplay-Bold",
        color: "#0f172a",
        flex: 1,
    },
    requiredBadge: {
        backgroundColor: "#fef2f2",
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.4),
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    requiredText: {
        fontSize: hp(1.1),
        fontFamily: "SFNSText-Bold",
        color: "#dc2626",
    },
    card: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: wp(4),
        marginHorizontal: wp(5),
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
        gap: hp(1.8),
    },
    inputGroup: {
        gap: hp(0.8),
    },
    label: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Bold",
        color: "#334155",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        paddingHorizontal: wp(3.5),
        borderWidth: 1.5,
        borderColor: "#e2e8f0",
    },
    input: {
        flex: 1,
        fontSize: hp(1.6),
        fontFamily: "SFNSText-Regular",
        color: "#0f172a",
        paddingVertical: hp(1.5),
    },
    divider: {
        height: 1,
        backgroundColor: "#f1f5f9",
        marginVertical: hp(0.5),
    },
    optionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: wp(2),
    },
    optionChip: {
        paddingVertical: hp(1),
        paddingHorizontal: wp(4),
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#e2e8f0",
        backgroundColor: "#fafafa",
    },
    optionChipSelected: {
        backgroundColor: "#8b5cf6",
        borderColor: "#8b5cf6",
        shadowColor: "#8b5cf6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    optionText: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Medium",
        color: "#64748b",
    },
    optionTextSelected: {
        color: "white",
        fontFamily: "SFNSText-Bold",
    },
    errorCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(3),
        backgroundColor: "#fef2f2",
        marginHorizontal: wp(5),
        padding: wp(4),
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#fecaca",
        marginBottom: hp(2),
    },
    errorText: {
        flex: 1,
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Medium",
        color: "#dc2626",
    },
    submitButton: {
        marginHorizontal: wp(5),
        backgroundColor: "#8b5cf6",
        borderRadius: 16,
        padding: wp(4.5),
        shadowColor: "#8b5cf6",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 12,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: wp(3),
    },
    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: wp(3),
    },
    submitButtonText: {
        color: "white",
        fontSize: hp(1.7),
        fontFamily: "SFNSDisplay-Bold",
    },
    submitButtonSubtext: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: hp(1.2),
        fontFamily: "SFNSText-Regular",
    },
});