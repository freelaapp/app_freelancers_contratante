import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useCallback, useRef, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";

const minDate = new Date();
const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

export type Step1Props = {
  value: string;
  onChange: (value: string) => void;
};

function parseDisplayDate(display: string): Date {
  const [day, month, year] = display.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateDisplay(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function Step1DataEvento({ value, onChange }: Step1Props) {
  const [showIOS, setShowIOS] = useState(false);
  const [pickerValue, setPickerValue] = useState<Date>(minDate);
  const pendingDateRef = useRef<Date>(minDate);

  const openPicker = useCallback(() => {
    const initial = value ? parseDisplayDate(value) : minDate;
    pendingDateRef.current = initial;
    setPickerValue(initial);
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        mode: "date",
        value: initial,
        minimumDate: minDate,
        maximumDate: maxDate,
        onChange: (_e, date) => {
          if (date) onChange(formatDateDisplay(date));
        },
      });
    } else {
      setShowIOS((prev) => !prev);
    }
  }, [value, onChange]);

  const handleConfirm = useCallback(() => {
    onChange(formatDateDisplay(pendingDateRef.current));
    setShowIOS(false);
  }, [onChange]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qual a data do seu evento?</Text>
      <Text style={styles.subtitle}>Escolha o dia em que você precisa dos profissionais</Text>

      <TouchableOpacity
        style={[styles.dateButton, value ? styles.dateButtonFilled : styles.dateButtonEmpty]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <Ionicons
          name="calendar-outline"
          size={24}
          color={value ? colors.primary : colors.muted}
          style={styles.icon}
        />
        <Text style={[styles.dateText, value ? styles.dateTextFilled : styles.dateTextEmpty]}>
          {value || "Selecione uma data"}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={colors.muted} />
        <Text style={styles.infoText}>
          Você pode criar vagas com antecedência de até 3 meses
        </Text>
      </View>

      {Platform.OS === "ios" && showIOS && (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            mode="date"
            display="spinner"
            value={pickerValue}
            minimumDate={minDate}
            maximumDate={maxDate}
            locale="pt-BR"
            style={styles.picker}
            onChange={(_e, date) => {
              if (date) pendingDateRef.current = date;
            }}
          />
          <View style={styles.pickerToolbar}>
            <TouchableOpacity onPress={() => setShowIOS(false)}>
              <Text style={styles.toolbarCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.toolbarConfirm}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing["6"],
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing["2"],
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.muted,
    marginBottom: spacing["8"],
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["6"],
    paddingHorizontal: spacing["6"],
    borderRadius: radii.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    marginBottom: spacing["6"],
  },
  dateButtonEmpty: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dateButtonFilled: {
    borderColor: colors.primary,
    backgroundColor: "#FEF3C7",
  },
  icon: {
    marginRight: spacing["4"],
  },
  dateText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  dateTextEmpty: {
    color: colors.muted,
  },
  dateTextFilled: {
    color: colors.primary,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing["5"],
    borderRadius: radii.lg,
    gap: spacing["3"],
  },
  infoText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.muted,
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    marginTop: spacing["6"],
    overflow: "hidden",
  },
  picker: {
    height: 216,
    width: "100%",
  },
  pickerToolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing["8"],
    paddingVertical: spacing["5"],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toolbarCancel: {
    fontSize: fontSizes.md,
    color: colors.muted,
  },
  toolbarConfirm: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
});