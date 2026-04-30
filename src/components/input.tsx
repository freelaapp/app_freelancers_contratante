import { Ionicons } from "@expo/vector-icons";
import { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

type Props = TextInputProps & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
};

export const Input = forwardRef<TextInput, Props>(
  ({ label, icon, error, secureTextEntry, style, ...rest }, ref) => {
    const [hidden, setHidden] = useState(secureTextEntry ?? false);

    return (
      <View style={styles.wrapper}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View
          style={[
            styles.container,
            error ? styles.containerError : styles.containerDefault,
          ]}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color="#9CA3AF"
              style={styles.icon}
            />
          )}

          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor="#9CA3AF"
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
                color="#9CA3AF"
              />
            </TouchableOpacity>
          )}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181C",
  },
  container: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  containerDefault: {
    borderColor: "#E5E7EB",
  },
  containerError: {
    borderColor: "#EF4444",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#11181C",
  },
  error: {
    fontSize: 12,
    color: "#EF4444",
  },
});
