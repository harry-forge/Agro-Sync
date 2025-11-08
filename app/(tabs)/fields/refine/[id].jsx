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
            setError("Please fill Farm Size, Budget & Market Distance");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const refinementData = {
                // Field context fallbacks
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

            const refinedData = await getRefinedRecommendation(refinementData);

            // Store refined data in context
            setFieldData({
                ...fieldData,
                refinedRecommendation: refinedData,
            });

            // Navigate to new premium result page
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
        <ScreenWrapper bg="white">
            <View style={styles.header}>
                <BackButton router={router} />
                <Text style={styles.pageTitle}>Refine Recommendation</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.sectionDesc}>
                    Tell us a bit about your field & resources so we can sharpen the recommendation.
                </Text>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Farm Details</Text>
                    <Text style={styles.label}>Farm Size (acres) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 5"
                        value={farmSize}
                        onChangeText={setFarmSize}
                        keyboardType="decimal-pad"
                    />

                    <Text style={[styles.label, { marginTop: hp(1.2) }]}>Budget (₹) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 50000"
                        value={budget}
                        onChangeText={setBudget}
                        keyboardType="number-pad"
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Water & Irrigation</Text>
                    <Text style={styles.label}>Primary Water Source</Text>
                    <OptionRow
                        options={["rainwater", "borewell", "canal", "river"]}
                        value={waterSource}
                        valueSetter={setWaterSource}
                    />

                    <Text style={[styles.label, { marginTop: hp(1) }]}>Irrigation System</Text>
                    <OptionRow
                        options={["none", "drip", "sprinkler", "flood"]}
                        value={irrigationSystem}
                        valueSetter={setIrrigationSystem}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Resources & Market</Text>
                    <Text style={styles.label}>Labor Availability</Text>
                    <OptionRow
                        options={["low", "moderate", "high"]}
                        value={laborAvailability}
                        valueSetter={setLaborAvailability}
                    />

                    <Text style={[styles.label, { marginTop: hp(1) }]}>Market Distance (km) *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 15"
                        value={marketDistance}
                        onChangeText={setMarketDistance}
                        keyboardType="decimal-pad"
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Experience & Soil</Text>
                    <Text style={styles.label}>Farming Experience</Text>
                    <OptionRow
                        options={["beginner", "intermediate", "expert"]}
                        value={farmingExperience}
                        valueSetter={setFarmingExperience}
                    />

                    <Text style={[styles.label, { marginTop: hp(1) }]}>Soil Texture</Text>
                    <OptionRow
                        options={["sandy", "loamy", "clayey", "silty"]}
                        value={soilTexture}
                        valueSetter={setSoilTexture}
                    />

                    <Text style={[styles.label, { marginTop: hp(1) }]}>Previous Crop (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Wheat, Rice"
                        value={previousCrop}
                        onChangeText={setPreviousCrop}
                    />
                </View>

                {error ? (
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={18} color="#b91c1c" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                <Pressable
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleGetRefinedRecommendation}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <ActivityIndicator color="white" />
                            <Text style={styles.submitButtonText}>Processing...</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="sparkles" size={20} color="white" />
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
        color: theme.colors.textLight,
        lineHeight: hp(2.1),
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: wp(4),
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.04)",
        shadowColor: "#0b3b1f",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
        elevation: 8,
        gap: hp(1.1),
    },
    cardTitle: {
        fontSize: hp(1.8),
        fontFamily: "SFNSDisplay-Bold",
        color: theme.colors.textDark,
        marginBottom: hp(0.6),
    },
    label: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontFamily: "SFNSText-Medium",
    },
    input: {
        borderWidth: 1,
        borderColor: "#e6eef5",
        borderRadius: 12,
        padding: wp(3.5),
        fontSize: hp(1.6),
        backgroundColor: "#fbfeff",
        marginTop: hp(0.6),
        fontFamily: "SFNSText-Regular",
    },
    optionsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: wp(2),
        marginTop: hp(0.6),
    },
    optionChip: {
        paddingVertical: hp(0.9),
        paddingHorizontal: wp(4),
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#eef6f0",
        backgroundColor: "#fff",
    },
    optionChipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    optionText: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontFamily: "SFNSText-Medium",
    },
    optionTextSelected: {
        color: "#fff",
    },
    errorBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: wp(2),
        backgroundColor: "#fff5f5",
        padding: wp(3),
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ffd6d6",
    },
    errorText: {
        fontSize: hp(1.5),
        color: "#b91c1c",
        fontFamily: "SFNSText-Medium",
    },
    submitButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: hp(1.6),
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: wp(2),
        marginTop: hp(1),
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
        elevation: 10,
    },
    submitButtonDisabled: {
        opacity: 0.8,
    },
    submitButtonText: {
        color: "white",
        fontSize: hp(1.7),
        fontFamily: "SFNSDisplay-Bold",
    },
});
