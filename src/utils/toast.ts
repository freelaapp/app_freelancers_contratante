import Toast from "react-native-toast-message";

export const toast = {
  success: (message: string, subtitle?: string) =>
    Toast.show({ type: "success", text1: message, text2: subtitle, visibilityTime: 3000 }),

  error: (message: string, subtitle?: string) =>
    Toast.show({ type: "error", text1: message, text2: subtitle, visibilityTime: 4000 }),

  info: (message: string) =>
    Toast.show({ type: "info", text1: message, visibilityTime: 3000 }),
};
