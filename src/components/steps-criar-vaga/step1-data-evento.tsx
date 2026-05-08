import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useCallback, useMemo, useRef, useState } from "react";
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

function formatDateLong(display: string): string {
  if (!display) return "";
  const [day, month, year] = display.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type QuickChip = {
  label: string;
  date: Date;
};

function getQuickChips(): QuickChip[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dayOfWeek = today.getDay();
  const daysUntilSat = (6 - dayOfWeek + 7) % 7 || 7;
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysUntilSat);

  return [
    { label: "Hoje", date: today },
    { label: "Amanhã", date: tomorrow },
    { label: "Próx. sábado", date: saturday },
  ];
}

export function Step1DataEvento({ value, onChange }: Step1Props) {
  const [showIOS, setShowIOS] = useState(false);
  const [pickerValue, setPickerValue] = useState<Date>(minDate);
  const pendingDateRef = useRef<Date>(minDate);

  const quickChips = useMemo(() => getQuickChips(), []);

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

  const handleQuickChip = useCallback((date: Date) => {
    onChange(formatDateDisplay(date));
  }, [onChange]);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.quickLabel}>Datas rápidas</Text>
      <View style={styles.chipsRow}>
        {quickChips.map((chip) => {
          const chipFormatted = formatDateDisplay(chip.date);
          const isSelected = value === chipFormatted;
          return (
            <TouchableOpacity
              key={chip.label}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => handleQuickChip(chip.date)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.orLabel}>ou escolha outra data</Text>

      <TouchableOpacity
        style={[styles.dateButton, value ? styles.dateButtonFilled : styles.dateButtonEmpty]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <View style={styles.dateIconBox}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color={value ? colors.primary : colors.muted}
          />
        </View>
        <View style={styles.dateTextContainer}>
          {value ? (
            <>
              <Text style={styles.dateText}>{formatDateLong(value)}</Text>
              <Text style={styles.dateHint}>Toque para alterar</Text>
            </>
          ) : (
            <Text style={styles.dateTextEmpty}>Selecione uma data</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="time-outline" size={16} color={colors.primary} />
        <Text style={styles.infoText}>Até 3 meses de antecedência</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing["8"],
    paddingTop: spacing["10"],
    paddingBottom: spacing["10"],
  },
  quickLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing["5"],
  },
  chipsRow: {
    flexDirection: "row",
    gap: spacing["3"],
    marginBottom: spacing["8"],
  },
  chip: {
    flex: 1,
    paddingVertical: spacing["6"],
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: "#FFFBEB",
  },
  chipText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  orLabel: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    textAlign: "center",
    marginBottom: spacing["6"],
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing["8"],
    paddingHorizontal: spacing["8"],
    borderRadius: radii.lg,
    borderWidth: 1.5,
    marginBottom: spacing["8"],
    gap: spacing["5"],
  },
  dateButtonEmpty: {
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  dateButtonFilled: {
    borderColor: colors.primary,
    backgroundColor: "#FFFBEB",
  },
  dateIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  dateTextContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
    textTransform: "capitalize",
  },
  dateTextEmpty: {
    fontSize: fontSizes.md,
    color: colors.muted,
  },
  dateHint: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    opacity: 0.65,
    marginTop: 2,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: radii.md,
    paddingHorizontal: spacing["6"],
    paddingVertical: spacing["5"],
    gap: spacing["4"],
    alignSelf: "flex-start",
  },
  infoText: {
    fontSize: fontSizes.sm,
    color: colors.primaryDark,
    fontWeight: fontWeights.medium,
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