// app/(tabs)/fields/refine/[id].jsx - DEBUG VERSION
import { useState, useEffect } from "react";
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

    // Form state
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
            setError("Please fill in all required fields (Farm Size, Budget, Market Distance)");
            return;
        }

        try {
            setLoading(true);
            setError("");

            console.log("📝 Sending refinement data...");
            console.log("Field Data:", {
                temperature: fieldData.temperature,
                humidity: fieldData.humidity,
                moisture: fieldData.moisture,
                N: fieldData.N,
                P: fieldData.P,
                K: fieldData.K,
                pH: fieldData.pH,
            });

            const refinementData = {
                // Original field data
                temperature: fieldData.temperature || 25,
                humidity: fieldData.humidity || 65,
                moisture: fieldData.moisture || 50,
                rainfall: fieldData.rainfall || 800,
                N: fieldData.N || 80,
                P: fieldData.P || 40,
                K: fieldData.K || 40,
                pH: fieldData.pH || 6.5,
                currentRecommendation: fieldData.recommendation?.best_crop || "Rice",

                // User-provided refinement data
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

            console.log("📤 Refinement payload:", refinementData);

            const refinedData = await getRefinedRecommendation(refinementData);

            console.log("✅ Received refined data:", refinedData);

            // Store refined data in context
            setFieldData({
                ...fieldData,
                refinedRecommendation: refinedData,
            });

            console.log("💾 Stored in context, navigating back...");

            // Navigate back to field details
            router.back();
        } catch (e) {
            console.error("❌ Refinement error:", e);
            console.error("❌ Error stack:", e.stack);
            setError(e.message || "Failed to get refined recommendation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper bg="white">
            <View style={styles.header}>
                <BackButton router={router} />
                <Text style={styles.pageTitle}>Refine Recommendation</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.sectionDesc}>
                    Help us understand your farming conditions better for a more personalized recommendation.
                </Text>

                {/* Farm Size & Budget */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Farm Details</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Farm Size (acres) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 5"
                            value={farmSize}
                            onChangeText={setFarmSize}
                            keyboardType="decimal-pad"
                        />
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Budget (₹) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 50000"
                            value={budget}
                            onChangeText={setBudget}
                            keyboardType="number-pad"
                        />
                    </View>
                </View>

                {/* Water & Irrigation */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Water Resources</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Primary Water Source</Text>
                        <View style={styles.optionsRow}>
                            {["rainwater", "borewell", "canal", "river"].map((option) => (
                                <Pressable
                                    key={option}
                                    style={[
                                        styles.optionChip,
                                        waterSource === option && styles.optionChipSelected,
                                    ]}
                                    onPress={() => setWaterSource(option)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            waterSource === option && styles.optionTextSelected,
                                        ]}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Irrigation System</Text>
                        <View style={styles.optionsRow}>
                            {["none", "drip", "sprinkler", "flood"].map((option) => (
                                <Pressable
                                    key={option}
                                    style={[
                                        styles.optionChip,
                                        irrigationSystem === option && styles.optionChipSelected,
                                    ]}
                                    onPress={() => setIrrigationSystem(option)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            irrigationSystem === option && styles.optionTextSelected,
                                        ]}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Labor & Market */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Resources & Market</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Labor Availability</Text>
                        <View style={styles.optionsRow}>
                            {["low", "moderate", "high"].map((option) => (
                                <Pressable
                                    key={option}
                                    style={[
                                        styles.optionChip,
                                        laborAvailability === option && styles.optionChipSelected,
                                    ]}
                                    onPress={() => setLaborAvailability(option)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            laborAvailability === option && styles.optionTextSelected,
                                        ]}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Market Distance (km) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 15"
                            value={marketDistance}
                            onChangeText={setMarketDistance}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                {/* Farming Experience */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Experience & Preferences</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Farming Experience</Text>
                        <View style={styles.optionsRow}>
                            {["beginner", "intermediate", "expert"].map((option) => (
                                <Pressable
                                    key={option}
                                    style={[
                                        styles.optionChip,
                                        farmingExperience === option && styles.optionChipSelected,
                                    ]}
                                    onPress={() => setFarmingExperience(option)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            farmingExperience === option && styles.optionTextSelected,
                                        ]}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Organic Farming Preference</Text>
                        <View style={styles.optionsRow}>
                            {["organic", "mixed", "conventional"].map((option) => (
                                <Pressable
                                    key={option}
                                    style={[
                                        styles.optionChip,
                                        organicPreference === option && styles.optionChipSelected,
                                    ]}
                                    onPress={() => setOrganicPreference(option)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            organicPreference === option && styles.optionTextSelected,
                                        ]}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Soil & Previous Crop */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Soil & Crop History</Text>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Soil Texture</Text>
                        <View style={styles.optionsRow}>
                            {["sandy", "loamy", "clayey", "silty"].map((option) => (
                                <Pressable
                                    key={option}
                                    style={[
                                        styles.optionChip,
                                        soilTexture === option && styles.optionChipSelected,
                                    ]}
                                    onPress={() => setSoilTexture(option)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            soilTexture === option && styles.optionTextSelected,
                                        ]}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Previous Crop (Optional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Wheat, Rice, etc."
                            value={previousCrop}
                            onChangeText={setPreviousCrop}
                        />
                    </View>
                </View>

                {error ? (
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={20} color="#dc2626" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <Pressable
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleGetRefinedRecommendation}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <ActivityIndicator color="white" />
                            <Text style={styles.submitButtonText}>Getting Recommendation...</Text>
                        </View>
                    ) : (
                        <>
                            <Ionicons name="sparkles" size={22} color="white" />
                            <Text style={styles.submitButtonText}>Get Refined Recommendation</Text>
                        </>
                    )}
                </Pressable>
            </ScrollView>
        </ScreenWrapper>
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
        fontSize: hp(2.2),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
    },
    container: {
        paddingHorizontal: wp(5),
        paddingTop: hp(1),
        paddingBottom: hp(12),
        gap: hp(2),
    },
    sectionDesc: {
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Regular",
        color: theme.colors.textLight,
        lineHeight: hp(2.1),
        marginBottom: hp(0.5),
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
        gap: hp(1.5),
    },
    cardTitle: {
        fontSize: hp(1.9),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
        marginBottom: hp(0.5),
    },
    fieldGroup: {
        gap: hp(0.8),
    },
    label: {
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Medium",
        color: theme.colors.textDark,
    },
    input: {
        borderWidth: 1.5,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        padding: wp(3.5),
        fontSize: hp(1.6),
        fontFamily: "SFNSText-Regular",
        color: theme.colors.textDark,
        backgroundColor: "#f8fafc",
    },
    optionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: wp(2),
    },
    optionChip: {
        paddingVertical: hp(1),
        paddingHorizontal: wp(4),
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#e2e8f0",
        backgroundColor: "#fff",
    },
    optionChipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    optionText: {
        fontSize: hp(1.4),
        fontFamily: "SFNSText-Medium",
        color: theme.colors.textLight,
    },
    optionTextSelected: {
        color: "#fff",
    },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
        backgroundColor: "#fef2f2",
        padding: wp(3.5),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    errorText: {
        flex: 1,
        fontSize: hp(1.5),
        fontFamily: "SFNSText-Medium",
        color: "#dc2626",
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: hp(1.8),
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: wp(2),
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        marginTop: hp(1),
    },
    submitButtonDisabled: {
        backgroundColor: "#94a3b8",
        shadowOpacity: 0.1,
    },
    submitButtonText: {
        color: "white",
        fontSize: hp(1.7),
        fontFamily: "SFNSDisplay-Bold",
    },
});