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
import { useAuth } from "@/context/auth-context";
import { CompactHeader } from "@/components/compact-header";
import { Input } from "@/components/input";

export default function RegisterScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const canSubmit =
    name.length > 0 &&
    email.length > 0 &&
    phone.length > 0 &&
    password.length >= 8 &&
    password === confirmPassword &&
    acceptedTerms;

  async function handleRegister() {
    if (!canSubmit) return;
    setIsLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1000));
    setIsLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CompactHeader
        title="Criar conta"
        subtitle="Cadastre-se e comece a contratar"
      />

      <ScrollView
        style={styles.card}
        contentContainerStyle={[
          styles.cardContent,
          { paddingBottom: Math.max(bottom, 24) + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          label="Nome completo"
          icon="person-outline"
          placeholder="Seu nome completo"
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          blurOnSubmit={false}
          editable={!isLoading}
          value={name}
          onChangeText={setName}
          containerStyle={styles.inputWhite}
        />

        <Input
          ref={emailRef}
          label="E-mail"
          icon="mail-outline"
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          onSubmitEditing={() => phoneRef.current?.focus()}
          blurOnSubmit={false}
          editable={!isLoading}
          value={email}
          onChangeText={setEmail}
          containerStyle={styles.inputWhite}
        />

        <Input
          ref={phoneRef}
          label="Celular"
          icon="call-outline"
          placeholder="(11) 99999-9999"
          keyboardType="phone-pad"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          blurOnSubmit={false}
          editable={!isLoading}
          value={phone}
          onChangeText={setPhone}
          containerStyle={styles.inputWhite}
        />

        <Input
          ref={passwordRef}
          label="Senha"
          icon="lock-closed-outline"
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          blurOnSubmit={false}
          editable={!isLoading}
          value={password}
          onChangeText={setPassword}
          containerStyle={styles.inputWhite}
        />

        <Input
          ref={confirmPasswordRef}
          label="Confirmar senha"
          icon="lock-closed-outline"
          placeholder="Repita a senha"
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleRegister}
          editable={!isLoading}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          containerStyle={styles.inputWhite}
        />

        <View style={styles.termsRow}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              acceptedTerms ? styles.checkboxChecked : styles.checkboxUnchecked,
            ]}
            onPress={() => setAcceptedTerms((prev) => !prev)}
            activeOpacity={0.7}
          >
            {acceptedTerms && (
              <Ionicons name="checkmark" size={14} color="#fff" />
            )}
          </TouchableOpacity>

          <View style={styles.termsTextWrapper}>
            <Text style={styles.termsText}>
              {"Li e aceito os "}
              <Text style={styles.termsLink} onPress={() => {}}>
                Termos de Uso
              </Text>
              {" e a "}
              <Text style={styles.termsLink} onPress={() => {}}>
                Política de Privacidade
              </Text>
              {"."}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleRegister}
          disabled={!canSubmit || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#1A1A2E" />
          ) : (
            <Text style={styles.submitButtonText}>Criar minha conta</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")} activeOpacity={0.7}>
            <Text style={styles.footerLink}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 16,
  },
  inputWhite: {
    backgroundColor: "#fff",
    borderWidth: 0,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxUnchecked: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  checkboxChecked: {
    borderColor: "#F5A623",
    backgroundColor: "#F5A623",
  },
  termsTextWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  termsText: {
    fontSize: 13,
    color: "#687076",
    flexWrap: "wrap",
  },
  termsLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F5A623",
  },
  submitButton: {
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
    fontWeight: "700",
    color: "#1A1A2E",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#687076",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F5A623",
  },
});
