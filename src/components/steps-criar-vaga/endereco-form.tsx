import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Input } from "@/components/input";
import { colors, fontSizes, fontWeights, radii, spacing } from "@/constants/theme";
import { EnderecoCompleto } from "@/hooks/use-via-cep";
import { formatCEP } from "@/hooks/use-via-cep";
import { useState } from "react";

export type EnderecoFormProps = {
  endereco: EnderecoCompleto;
  onEnderecoChange: (endereco: EnderecoCompleto) => void;
  onBuscarCep: (cep: string) => Promise<void>;
  loading: boolean;
  error: string | null;
};

export function EnderecoForm({
  endereco,
  onEnderecoChange,
  onBuscarCep,
  loading,
  error,
}: EnderecoFormProps) {
  const [cepInput, setCepInput] = useState(endereco.cep);

  const handleCepChange = (value: string) => {
    const formatted = formatCEP(value);
    setCepInput(formatted);
    onEnderecoChange({ ...endereco, cep: value.replace(/\D/g, "") });
  };

  const handleCepBlur = () => {
    if (cepInput.replace(/\D/g, "").length === 8) {
      onBuscarCep(cepInput);
    }
  };

  const updateField = <K extends keyof EnderecoCompleto>(
    field: K,
    value: EnderecoCompleto[K]
  ) => {
    onEnderecoChange({ ...endereco, [field]: value });
  };

  return (
    <View style={styles.container}>
      <View style={styles.cepRow}>
        <View style={styles.cepInputContainer}>
          <Input
            label="CEP"
            icon="mail-outline"
            placeholder="00000-000"
            value={cepInput}
            onChangeText={handleCepChange}
            onBlur={handleCepBlur}
            keyboardType="numeric"
            maxLength={9}
            error={error ?? undefined}
            containerStyle={styles.cepInput}
          />
        </View>
        {loading && (
          <View style={styles.loadingBox}>
            <Ionicons name="reload" size={20} color={colors.primary} />
          </View>
        )}
      </View>

      {endereco.rua && (
        <View style={styles.enderecoDisplay}>
          <Text style={styles.enderecoText}>
            {endereco.rua}
            {endereco.bairro && `, ${endereco.bairro}`}
          </Text>
          <Text style={styles.enderecoCidade}>
            {endereco.cidade}/{endereco.uf}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.numeroContainer}>
          <Input
            label="Número"
            icon="navigate-outline"
            placeholder="0"
            value={endereco.numero}
            onChangeText={(v) => updateField("numero", v)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.complementoContainer}>
          <Input
            label="Complemento"
            placeholder="Sala, andar, apt..."
            value={endereco.complemento}
            onChangeText={(v) => updateField("complemento", v)}
          />
        </View>
      </View>

      <Input
        label="Rua"
        icon="location-outline"
        placeholder="Rua..."
        value={endereco.rua}
        onChangeText={(v) => updateField("rua", v)}
        editable={false}
        containerStyle={styles.readOnlyInput}
      />

      <View style={styles.row}>
        <View style={styles.bairroContainer}>
          <Input
            label="Bairro"
            placeholder="Bairro..."
            value={endereco.bairro}
            onChangeText={(v) => updateField("bairro", v)}
            editable={false}
          />
        </View>
        <View style={styles.cidadeContainer}>
          <Input
            label="Cidade"
            placeholder="Cidade..."
            value={endereco.cidade}
            onChangeText={(v) => updateField("cidade", v)}
            editable={false}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.ufContainer}>
          <Input
            label="UF"
            placeholder="UF"
            value={endereco.uf}
            onChangeText={(v) => updateField("uf", v.toUpperCase())}
            maxLength={2}
            editable={false}
          />
        </View>
        <View style={styles.cepDisplayContainer}>
          <Input
            label="CEP"
            placeholder="CEP"
            value={formatCEP(endereco.cep)}
            editable={false}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing["4"],
  },
  cepRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing["3"],
  },
  cepInputContainer: {
    flex: 1,
  },
  cepInput: {
    flex: 1,
  },
  loadingBox: {
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  enderecoDisplay: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing["4"],
    borderWidth: 1,
    borderColor: colors.border,
  },
  enderecoText: {
    fontSize: fontSizes.md,
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },
  enderecoCidade: {
    fontSize: fontSizes.sm,
    color: colors.muted,
    marginTop: spacing["1"],
  },
  row: {
    flexDirection: "row",
    gap: spacing["3"],
  },
  numeroContainer: {
    width: 100,
  },
  complementoContainer: {
    flex: 1,
  },
  bairroContainer: {
    flex: 1,
  },
  cidadeContainer: {
    flex: 1,
  },
  ufContainer: {
    width: 60,
  },
  cepDisplayContainer: {
    flex: 1,
  },
  readOnlyInput: {
    opacity: 0.7,
  },
});