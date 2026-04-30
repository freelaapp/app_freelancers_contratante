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

export default function RegisterScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (!name || !email || !phone || password.length < 8 || password !== confirmPassword || !acceptedTerms) return;
    setIsLoading(true);
    await new Promise<void>((r) => setTimeout(r, 1000));
    setIsLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <View style={styles.circleL} />
        <View style={styles.circleM} />
        <View style={styles.circleS} />

        <TouchableOpacity
          style={styles.backRow}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
          <Text style={styles.headerTitle}>Criar conta</Text>
        </TouchableOpacity>

        <View style={styles.subtitleRow}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>freela</Text>
          </View>
          <Text style={styles.subtitleText}>
            Cadastre-se e comece a contratar
          </Text>
        </View>
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
        <View>
          <Text style={styles.label}>Nome completo</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Seu nome completo"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              ref={emailRef}
              style={styles.textInput}
              placeholder="seu@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
              blurOnSubmit={false}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Celular</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              ref={phoneRef}
              style={styles.textInput}
              placeholder="(11) 99999-9999"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              ref={passwordRef}
              style={styles.textInput}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              blurOnSubmit={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
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

        <View style={styles.fieldWrapper}>
          <Text style={styles.label}>Confirmar senha</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              ref={confirmPasswordRef}
              style={styles.textInput}
              placeholder="Repita a senha"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              blurOnSubmit={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowConfirm((prev) => !prev)}
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
  header: {
    flex: 0.26,
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingBottom: 24,
    justifyContent: "flex-end",
  },
  circleL: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(0,0,0,0.08)",
    top: -40,
    right: -40,
  },
  circleM: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(0,0,0,0.08)",
    top: 10,
    right: 80,
  },
  circleS: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.08)",
    bottom: -10,
    left: -20,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A2E",
    marginLeft: 8,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 13,
    fontWeight: "700",
    fontStyle: "italic",
    color: "#F5A623",
  },
  subtitleText: {
    fontSize: 14,
    color: "#1A1A2E",
    opacity: 0.8,
    flex: 1,
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
  },
  fieldWrapper: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181C",
    marginBottom: 6,
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
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#11181C",
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
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
    fontWeight: "700",
    color: "#1A1A2E",
  },
  footer: {
    marginTop: 16,
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
