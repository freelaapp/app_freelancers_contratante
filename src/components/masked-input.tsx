import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef, ReactNode, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import MaskInput, { Mask } from "react-native-mask-input";
import { Input } from "./input";

type InputProps = React.ComponentProps<typeof Input>;

type MaskedInputProps = Omit<InputProps, "onChangeText"> & {
  mask: Mask;
  onChangeText?: (raw: string) => void;
};

export const MaskedInput = forwardRef<TextInput, MaskedInputProps>(
  (
    {
      mask,
      label,
      icon,
      error,
      hint,
      value,
      onChangeText,
      style,
      containerStyle,
      rightElement,
      onFocus,
      onBlur,
      ...rest
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    return (
      <View style={styles.wrapper}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View
          style={[
            styles.container,
            error
              ? styles.containerError
              : focused
              ? styles.containerFocused
              : styles.containerDefault,
            containerStyle,
          ]}
        >
          {icon && (
            <Ionicons name={icon} size={20} color={colors.muted} style={styles.icon} />
          )}

          <MaskInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.muted}
            mask={mask}
            value={value}
            onChangeText={(_, raw) => {
              onChangeText?.(raw ?? "");
            }}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />

          {rightElement}
        </View>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : hint ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : null}
      </View>
    );
  }
);

MaskedInput.displayName = "MaskedInput";

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing["3"],
  },
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  container: {
    height: 52,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing["7"],
  },
  containerDefault: {
    borderColor: colors.border,
  },
  containerError: {
    borderColor: colors.error,
  },
  containerFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  icon: {
    marginRight: spacing["5"],
  },
  input: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  error: {
    fontSize: fontSizes.xs,
    color: colors.error,
  },
  hint: {
    fontSize: fontSizes.xs,
    color: colors.muted,
  },
});
