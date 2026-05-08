import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { authService } from "@/services/auth.service";
import { toast } from "@/utils/toast";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CompactHeader } from "@/components/compact-header";

const CODE_LENGTH = 6;

export default function ConfirmEmailScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current !== null) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const filledCount = code.filter((d) => d !== "").length;
  const canConfirm = filledCount === CODE_LENGTH;

  function handleChange(text: string, index: number) {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleConfirm() {
    if (!canConfirm) return;
    setIsLoading(true);
    try {
      await authService.confirmEmail({ email: emailParam ?? "", code: code.join("") });
      toast.success("E-mail validado com sucesso!", "Agora faça login para continuar.");
      router.replace("/(auth)/login");
    } catch {
      // erro tratado pelo interceptor
      toast.error("Código inválido ou expirado.", "Verifique o código e tente novamente.")
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    try {
      await authService.resendConfirmationCode(emailParam ?? "");
      toast.success("Código reenviado!", "Verifique sua caixa de entrada.");
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setCountdown(60);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            countdownRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      // erro tratado pelo interceptor
      toast.error("Não foi possível reenviar o código.", "Tente novamente.")
    } finally {
      setIsResending(false);
    }
  }

  return (
    <View style={styles.root}>
      <CompactHeader
        title="Confirmar e-mail"
        subtitle="Verifique seu e-mail para continuar"
        isFirstScreen={true}
      />

      <View style={[styles.card, { paddingBottom: Math.max(bottom, 24) + 16 }]}>
        <View style={styles.iconWrapper}>
          <Ionicons name="mail-outline" size={48} color="#F5A623" />
        </View>

        <Text style={styles.title}>Confirme seu email</Text>
        <Text style={styles.subtitle}>
          Enviamos um código de 6 dígitos para o seu email.{"\n"}Digite-o abaixo
          para continuar.
        </Text>

        <View style={styles.codeRow}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <TextInput
              key={i}
              ref={(r) => {
                inputRefs.current[i] = r;
              }}
              style={[styles.codeInput, code[i] ? styles.codeInputFilled : null]}
              value={code[i]}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, i)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isLoading}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!canConfirm || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#1A1A2E" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirmar →</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resendRow, countdown > 0 && styles.resendDisabled]}
          onPress={handleResend}
          disabled={isResending || isLoading || countdown > 0}
          activeOpacity={0.7}
        >
          {isResending ? (
            <ActivityIndicator size="small" color="#687076" />
          ) : countdown > 0 ? (
            <Ionicons name="time-outline" size={16} color="#B0B7C0" />
          ) : (
            <Ionicons name="refresh-outline" size={16} color="#687076" />
          )}
          <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>
            {countdown > 0 ? `Reenviar em ${countdown}s` : "Reenviar código"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5A623",
  },
  card: {
    flex: 1,
    backgroundColor: "#F5F5F0",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FEF3DA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#687076",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  codeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 32,
  },
  codeInput: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#fff",
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A2E",
    textAlign: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  codeInputFilled: {
    borderColor: "#F5A623",
  },
  confirmButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F5A623",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resendText: {
    fontSize: 14,
    color: "#687076",
  },
  resendDisabled: {
    opacity: 0.5,
  },
  resendTextDisabled: {
    color: "#B0B7C0",
  },
});
