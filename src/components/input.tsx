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

type Props = TextInputProps & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  containerStyle?: ViewStyle;
  rightElement?: ReactNode;
};

export const Input = forwardRef<TextInput, Props>(
  ({ label, icon, error, secureTextEntry, style, containerStyle, rightElement, ...rest }, ref) => {
    const [hidden, setHidden] = useState(secureTextEntry ?? false);

    return (
      <View style={styles.wrapper}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View
          style={[
            styles.container,
            error ? styles.containerError : styles.containerDefault,
            containerStyle,
          ]}
        >
          {icon && (
            <Ionicons name={icon} size={20} color={colors.muted} style={styles.icon} />
          )}

          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={colors.muted}
            secureTextEntry={hidden}
            {...rest}
          />

          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setHidden((h) => !h)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={hidden ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={colors.muted}
              />
            </TouchableOpacity>
          )}

          {!secureTextEntry && rightElement}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = "Input";

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
});
