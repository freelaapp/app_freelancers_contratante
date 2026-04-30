import { View, Text, StyleSheet } from "react-native";

export default function CriarVagaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Criar Vaga</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
  },
});
