import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Step = 1 | 2 | 3;

const STEPS = ["E-mail", "Código", "Nova senha"];
const OTP_LENGTH = 6;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();

  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const confirmRef = useRef<TextInput>(null);

  function handleOtpChange(value: string, index: number) {
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyPress(key: string, index: number) {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit() {
    if (isLoading) return;
    setIsLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1000));
    setIsLoading(false);
    if (step < 3) setStep((s) => (s + 1) as Step);
  }

  const canSubmit =
    (step === 1 && email.length > 0) ||
    (step === 2 && otp.every((d) => d.length === 1)) ||
    (step === 3 && password.length >= 6 && password === confirmPassword);

  const buttonLabel =
    step === 3 ? "→ Redefinir Senha" : "→ Enviar Código";

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: top + 16 }]}>
        <View style={styles.circleL} />
        <View style={styles.circleM} />
        <View style={styles.circleS} />
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>freela</Text>
        </View>
        <Text style={styles.headerTitle}>Freela</Text>
        <Text style={styles.headerSubtitle}>
          {"Encontre os melhores profissionais\npara seus eventos."}
        </Text>
      </View>

      <ScrollView
        style={styles.card}
        contentContainerStyle={[
          styles.cardContent,
          { paddingBottom: Math.max(bottom, 24) + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.cardTitle}>Esqueci minha senha</Text>
        <Text style={styles.cardSubtitle}>
          Informe seu e-mail para receber o código
        </Text>

        <StepIndicator currentStep={step} />

        {step === 1 && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              E-mail <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                editable={!isLoading}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Código de verificação <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.otpRow}>
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { otpRefs.current[i] = r; }}
                  style={[
                    styles.otpBox,
                    digit ? styles.otpBoxFilled : null,
                  ]}
                  value={digit}
                  onChangeText={(v) => handleOtpChange(v, i)}
                  onKeyPress={({ nativeEvent }) =>
                    handleOtpKeyPress(nativeEvent.key, i)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  editable={!isLoading}
                />
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Nova senha <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmRef.current?.focus()}
                  blurOnSubmit={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.fieldGroup, styles.fieldSpacing]}>
              <Text style={styles.label}>
                Confirmar senha <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={confirmRef}
                  style={styles.input}
                  placeholder="Repita a senha"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm((p) => !p)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#1A1A2E" />
          ) : (
            <Text style={styles.submitButtonText}>{buttonLabel}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Lembrou sua senha? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.footerLink}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  return (
    <View style={stepStyles.wrapper}>
      {/* Row 1: circles + connector lines perfectly aligned */}
      <View style={stepStyles.circlesRow}>
        {STEPS.map((label, i) => {
          const stepNum = (i + 1) as Step;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;
          const connectorDone = currentStep > stepNum;

          return (
            <View key={label} style={stepStyles.circleCell}>
              {i > 0 && (
                <View
                  style={[
                    stepStyles.connector,
                    connectorDone && stepStyles.connectorDone,
                  ]}
                />
              )}
              <View
                style={[
                  stepStyles.circle,
                  isCompleted && stepStyles.circleCompleted,
                  isActive && stepStyles.circleActive,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text
                    style={[
                      stepStyles.circleText,
                      isActive && stepStyles.circleTextActive,
                    ]}
                  >
                    {stepNum}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Row 2: labels aligned below each circle */}
      <View style={stepStyles.labelsRow}>
        {STEPS.map((label, i) => {
          const stepNum = (i + 1) as Step;
          const isCompleted = currentStep > stepNum;
          const isActive = currentStep === stepNum;

          return (
            <Text
              key={label}
              style={[
                stepStyles.label,
                isCompleted && stepStyles.labelCompleted,
                isActive && stepStyles.labelActive,
              ]}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5A623",
  },
  header: {
    flex: 0.28,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 32,
    overflow: "hidden",
  },
  circleL: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(0,0,0,0.08)",
    top: -40,
    left: -40,
  },
  circleM: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.08)",
    bottom: -20,
    right: -20,
  },
  circleS: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.08)",
    top: 10,
    right: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    fontStyle: "italic",
    color: "#F5A623",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#1A1A2E",
    opacity: 0.85,
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#11181C",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#687076",
    marginTop: 4,
  },
  fieldGroup: {
    marginTop: 20,
  },
  fieldSpacing: {
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#11181C",
    marginBottom: 6,
  },
  required: {
    color: "#EF4444",
  },
  inputContainer: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#11181C",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    fontSize: 20,
    fontWeight: "700",
    color: "#11181C",
  },
  otpBoxFilled: {
    borderColor: "#22C55E",
  },
  submitButton: {
    marginTop: 20,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F5A623",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#687076",
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F5A623",
  },
});

const stepStyles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    marginBottom: 4,
  },
  circlesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  circleCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  connector: {
    flex: 1,
    height: 1.5,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 6,
  },
  connectorDone: {
    backgroundColor: "#22C55E",
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  circleActive: {
    backgroundColor: "#F5A623",
    borderWidth: 0,
  },
  circleCompleted: {
    backgroundColor: "#22C55E",
    borderWidth: 0,
  },
  circleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
  },
  circleTextActive: {
    color: "#fff",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
  },
  labelActive: {
    color: "#F5A623",
  },
  labelCompleted: {
    color: "#22C55E",
  },
});
