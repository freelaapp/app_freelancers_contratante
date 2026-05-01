import { radii } from "@/constants/theme";
import { Modal, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

export function CenteredModal({ visible, onClose, children, contentStyle }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.content, contentStyle]}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: radii["2xl"],
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    width: "100%",
  },
});
