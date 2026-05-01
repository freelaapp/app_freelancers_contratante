import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { authService } from "@/services/auth.service";
import { tokenStore } from "@/services/token-store";
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
import { CompactHeader } from "@/components/compact-header";
import { Input } from "@/components/input";
import { registerSchema, RegisterFormValues } from "@/validation/register.schema";

export default function RegisterScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
    mode: "onSubmit",
  });

  async function handleRegister(data: RegisterFormValues) {
    try {
      const digits = data.phone.replace(/\D/g, "");
      const phoneNumber = digits ? (digits.startsWith("55") ? `+${digits}` : `+55${digits}`) : undefined;

      // v2: apenas name, email, password, phoneNumber (opcional)
      // persona e module são definidos no onboarding, não no registro
      const { data: tokens } = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        ...(phoneNumber ? { phoneNumber } : {}),
      });

      // Salva o token retornado para usar na confirmação de email
      await tokenStore.set(tokens.accessToken);

      toast.success("Cadastro realizado! Verifique seu e-mail.");
      router.push({ pathname: "/(auth)/confirm-email", params: { email: data.email } });
    } catch {
      // erro tratado pelo interceptor
    }
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
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              label="Nome completo"
              icon="person-outline"
              placeholder="Seu nome completo"
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
              editable={!isSubmitting}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              containerStyle={styles.inputWhite}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
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
              editable={!isSubmitting}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              containerStyle={styles.inputWhite}
            />
          )}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              ref={phoneRef}
              label="Celular"
              icon="call-outline"
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              editable={!isSubmitting}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              containerStyle={styles.inputWhite}
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
              placeholder="Mín. 8 chars, maiúscula, número e símbolo"
              secureTextEntry
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              blurOnSubmit={false}
              editable={!isSubmitting}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              containerStyle={styles.inputWhite}
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              ref={confirmPasswordRef}
              label="Confirmar senha"
              icon="lock-closed-outline"
              placeholder="Repita a senha"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit(handleRegister)}
              editable={!isSubmitting}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={fieldState.error?.message}
              containerStyle={styles.inputWhite}
            />
          )}
        />

        <Controller
          control={control}
          name="acceptedTerms"
          render={({ field: { onChange, value }, fieldState }) => (
            <View>
              <View style={styles.termsRow}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    value ? styles.checkboxChecked : styles.checkboxUnchecked,
                  ]}
                  onPress={() => onChange(!value)}
                  activeOpacity={0.7}
                >
                  {value && <Ionicons name="checkmark" size={14} color="#fff" />}
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
              {fieldState.error?.message && (
                <Text style={styles.termsError}>{fieldState.error.message}</Text>
              )}
            </View>
          )}
        />

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit(handleRegister)}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
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
  termsError: {
    fontSize: 11,
    color: "#DC2626",
    marginTop: 4,
    marginLeft: 30,
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
