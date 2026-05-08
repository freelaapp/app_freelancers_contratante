import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useCallback, useRef, useState } from "react";
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
      <View style={styles.iconContainer}>
        <Ionicons name="calendar" size={32} color={colors.primary} />
      </View>

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
        <View style={styles.dateTextContainer}>
          <Text style={[styles.dateText, value ? styles.dateTextFilled : styles.dateTextEmpty]}>
            {value || "Selecione uma data"}
          </Text>
          {value && (
            <Text style={styles.dateHint}>Toque para alterar</Text>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Você pode criar vagas com antecedência de até 3 meses
        </Text>
      </View>

      <Modal
        visible={Platform.OS === "ios" && showIOS}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIOS(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowIOS(false)}
        />
        <View style={styles.pickerContainer}>
          <View style={styles.pickerToolbar}>
            <TouchableOpacity onPress={() => setShowIOS(false)}>
              <Text style={styles.toolbarCancel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.toolbarConfirm}>Confirmar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerWrapper}>
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
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing["10"],
    paddingTop: spacing["12"],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing["8"],
  },
  title: {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing["3"],
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.muted,
    marginBottom: 28,
    lineHeight: 20,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing["10"],
    paddingHorizontal: spacing["10"],
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: spacing["6"],
  },
  dateButtonEmpty: {
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dateButtonFilled: {
    borderStyle: "solid",
    borderColor: colors.primary,
    backgroundColor: "#FFFBEB",
  },
  icon: {
    marginRight: spacing["4"],
  },
  dateTextContainer: {
    flex: 1,
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
  dateHint: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    opacity: 0.7,
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 8,
    padding: spacing["6"],
    gap: spacing["3"],
  },
  infoText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: "hidden",
  },
  pickerWrapper: {
    width: "100%",
    alignItems: "center",
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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