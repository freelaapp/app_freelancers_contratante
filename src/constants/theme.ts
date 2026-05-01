export const colors = {
  // Brand
  primary: "#F5A623",
  primaryDark: "#D4891A",
  primaryDarker: "#B87516",
  gradientStart: "#ECA826",
  gradientEnd: "#F2C94C",

  // Dark / text
  dark: "#1A1A2E",
  darkMuted: "rgba(26, 26, 46, 0.70)",
  ink: "#11181C",
  inkButton: "#1C1005",

  // Neutrals
  white: "#FFFFFF",
  background: "#F5F5F0",
  surface: "#F9FAFB",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  muted: "#9CA3AF",
  textSecondary: "#687076",

  // Semantic
  error: "#EF4444",

  // Overlays
  overlayDark: "rgba(0, 0, 0, 0.08)",
  overlayDarkCard: "rgba(0, 0, 0, 0.12)",
  overlayWhite: "rgba(255, 255, 255, 0.25)",
  overlayWhiteStrong: "rgba(255, 255, 255, 0.40)",
  overlayButtonShade: "rgba(120, 70, 0, 0.30)",
} as const;

export const fontSizes = {
  xs: 10,
  sm: 11,
  base: 13,
  md: 14,
  lg: 16,
  xl: 18,
  "2xl": 22,
  "3xl": 24,
} as const;

export const fontWeights = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const radii = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 15,
  "2xl": 20,
  "3xl": 28,
  full: 9999,
} as const;

export const spacing = {
  "1": 2,
  "2": 4,
  "3": 6,
  "4": 8,
  "5": 10,
  "6": 12,
  "7": 14,
  "8": 16,
  "10": 20,
  "12": 24,
  "14": 28,
  "16": 32,
} as const;

export const gradients = {
  primary: {
    colors: [colors.gradientStart, colors.gradientEnd] as [string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  button: {
    colors: [colors.primary, colors.primaryDark] as [string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
} as const;

export const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
} as const;

export const cardShadowStrong = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
} as const;

export const tabShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2,
} as const;

export const statusColors = {
  confirmado: { bg: "#D1FAE5", text: "#065F46" },
  aguardando: { bg: "#FEF3C7", text: "#92400E" },
  cancelado:  { bg: "#FEE2E2", text: "#991B1B" },
  finalizado: { bg: "#F3F4F6", text: "#6B7280" },
  aceito:     { bg: "#DCFCE7", text: "#16A34A" },
  recusado:   { bg: "#FEE2E2", text: "#DC2626" },
} as const;
