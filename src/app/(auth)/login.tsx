import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { useRef } from "react";
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
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/input";
import { loginSchema, LoginFormValues } from "@/validation/login.schema";

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();

  const passwordRef = useRef<TextInput>(null);

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleSignIn(data: LoginFormValues) {
    await signIn(data.email, data.password);
  }

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
        <Text style={styles.welcomeTitle}>Bem-vindo de volta</Text>
        <Text style={styles.welcomeSubtitle}>
          Faça login para contratar profissionais
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              label="E-mail"
              icon="mail-outline"
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
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
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              ref={passwordRef}
              label="Senha"
              icon="lock-closed-outline"
              placeholder="Digite sua senha"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit(handleSignIn)}
              editable={!isLoading}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
            />
          )}
        />

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSubmit(handleSignIn)}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#1A1A2E" />
          ) : (
            <Text style={styles.signInButtonText}>Entrar →</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}> ou </Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleButton} activeOpacity={0.85}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.googleButtonText}>Entrar com Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.appleButton} activeOpacity={0.85}>
          <Ionicons
            name="logo-apple"
            size={22}
            color="#fff"
            style={styles.appleIcon}
          />
          <Text style={styles.appleButtonText}>Entrar com Apple</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ainda não tem cadastro? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <Text style={styles.footerLink}>Criar minha conta</Text>
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
    zIndex: -1,
  },
  circleM: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,0,0,0.08)",
    bottom: -20,
    right: -20,
    zIndex: -1,
  },
  circleS: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(0,0,0,0.08)",
    top: 10,
    right: 60,
    zIndex: -1,
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
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#11181C",
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#687076",
    marginTop: 4,
    marginBottom: 4,
  },
  inputSpacing: {
    marginTop: 16,
    marginBottom: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F5A623",
  },
  signInButton: {
    marginTop: 20,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#F5A623",
    alignItems: "center",
    justifyContent: "center",
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  divider: {
    marginVertical: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: 13,
    color: "#687076",
    paddingHorizontal: 12,
  },
  googleButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DADCE0",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4285F4",
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#11181C",
  },
  appleButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  appleIcon: {
    marginRight: 10,
  },
  appleButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#fff",
  },
  footer: {
    marginTop: 20,
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
