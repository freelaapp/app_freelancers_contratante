import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { authService } from "@/services/auth.service";
import { toast } from "@/utils/toast";
import { Controller, useForm } from "react-hook-form";
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
import { Input } from "@/components/input";
import {
  forgotEmailSchema,
  forgotNewPasswordSchema,
  ForgotEmailValues,
  ForgotNewPasswordValues,
} from "@/validation/forgot-password.schema";

type Step = 1 | 2 | 3;

const STEPS = ["E-mail", "Código", "Nova senha"];
const OTP_LENGTH = 6;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();

  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const emailRef = useRef<string>("");

  const emailForm = useForm<ForgotEmailValues>({
    resolver: yupResolver(forgotEmailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<ForgotNewPasswordValues>({
    resolver: yupResolver(forgotNewPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

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

  async function handleEmailSubmit(data: ForgotEmailValues) {
    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: data.email });
      emailRef.current = data.email;
      setStep(2);
    } catch {
      // erro tratado pelo interceptor
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOtpSubmit() {
    if (!otp.every((d) => d.length === 1)) return;
    setStep(3);
  }

  async function handlePasswordSubmit(data: ForgotNewPasswordValues) {
    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: emailRef.current,
        code: otp.join(""),
        password: data.password,
      });
      toast.success("Senha redefinida! Faça login.");
      router.replace("/(auth)/login");
    } catch {
      // erro tratado pelo interceptor
    } finally {
      setIsLoading(false);
    }
  }

  const otpComplete = otp.every((d) => d.length === 1);
  const buttonLabel = step === 3 ? "→ Redefinir Senha" : "→ Enviar Código";

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
            <Controller
              control={emailForm.control}
              name="email"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <Input
                  label="E-mail"
                  icon="mail-outline"
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={emailForm.handleSubmit(handleEmailSubmit)}
                  editable={!isLoading}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
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
                  style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                  value={digit}
                  onChangeText={(v) => handleOtpChange(v, i)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
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
          <View style={styles.fieldGroup}>
            <Controller
              control={passwordForm.control}
              name="password"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <Input
                  label="Nova senha"
                  icon="lock-closed-outline"
                  placeholder="Mínimo 8 caracteres"
                  secureTextEntry
                  returnKeyType="next"
                  editable={!isLoading}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                  containerStyle={styles.inputSpacing}
                />
              )}
            />
            <Controller
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value }, fieldState }) => (
                <Input
                  label="Confirmar senha"
                  icon="lock-closed-outline"
                  placeholder="Repita a senha"
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={passwordForm.handleSubmit(handlePasswordSubmit)}
                  editable={!isLoading}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                  containerStyle={styles.inputSpacing}
                />
              )}
            />
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (step === 2 && !otpComplete) && styles.submitButtonDisabled,
          ]}
          onPress={
            step === 1
              ? emailForm.handleSubmit(handleEmailSubmit)
              : step === 2
              ? handleOtpSubmit
              : passwordForm.handleSubmit(handlePasswordSubmit)
          }
          disabled={isLoading || (step === 2 && !otpComplete)}
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
    <View style={stepStyles.row}>
      {STEPS.map((label, i) => {
        const stepNum = (i + 1) as Step;
        const isCompleted = currentStep > stepNum;
        const isActive = currentStep === stepNum;

        return (
          <View key={label} style={stepStyles.itemWrapper}>
            {i > 0 && (
              <View
                style={[
                  stepStyles.connector,
                  isCompleted && stepStyles.connectorDone,
                ]}
              />
            )}
            <View style={stepStyles.item}>
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
              <Text
                style={[
                  stepStyles.label,
                  isCompleted && stepStyles.labelCompleted,
                  isActive && stepStyles.labelActive,
                ]}
              >
                {label}
              </Text>
            </View>
          </View>
        );
      })}
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
  inputSpacing: {
    marginTop: 16,
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
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 8,
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
    marginTop: 24,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  itemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  connector: {
    flex: 1,
    minWidth: 12,
    height: 1.5,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 6,
  },
  connectorDone: {
    backgroundColor: "#22C55E",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    fontSize: 12,
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
