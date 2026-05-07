import { Ionicons } from "@expo/vector-icons";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { router } from "expo-router";
import React, { Component, ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[ERROR_BOUNDARY] Erro capturado:", error, errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = (): void => {
    this.setState({ hasError: false, error: null });
    router.replace("/(home)");
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={64} color={colors.error} />
          </View>

          <Text style={styles.title}>Algo deu errado</Text>
          <Text style={styles.message}>
            Ocorreu um erro inesperado. Tente novamente ou volte para a tela inicial.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeButton} onPress={this.handleGoHome}>
              <Text style={styles.homeButtonText}>Voltar ao início</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: spacing["8"],
    gap: spacing["6"],
  },
  iconContainer: {
    marginBottom: spacing["4"],
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    textAlign: "center",
  },
  message: {
    fontSize: fontSizes.base,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    gap: spacing["4"],
    marginTop: spacing["4"],
    width: "100%",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing["5"],
    paddingHorizontal: spacing["8"],
    borderRadius: radii.lg,
    alignItems: "center",
  },
  retryButtonText: {
    color: colors.white,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
  },
  homeButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing["5"],
    paddingHorizontal: spacing["8"],
    borderRadius: radii.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  homeButtonText: {
    color: colors.ink,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
  },
});