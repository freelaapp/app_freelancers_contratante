import { HomeHeader } from "@/components/home-header";
import { useAuth } from "@/context/auth-context";
import { ScrollView, StyleSheet, View } from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <HomeHeader userName={user?.name ?? "Usuário"} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});
