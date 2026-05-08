import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Input } from "@/components/input";
import { colors, spacing } from "@/constants/theme";
import { EnderecoCompleto, formatCEP } from "@/hooks/use-via-cep";
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
  const [cepInput, setCepInput] = useState(
    endereco.cep ? formatCEP(endereco.cep) : ""
  );

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
      {/* CEP com spinner inline */}
      <Input
        label="CEP"
        icon="location-outline"
        placeholder="00000-000"
        value={cepInput}
        onChangeText={handleCepChange}
        onBlur={handleCepBlur}
        keyboardType="numeric"
        maxLength={9}
        error={error ?? undefined}
        rightElement={
          loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : undefined
        }
      />

      {/* Rua — preenchida automaticamente pelo ViaCEP */}
      <Input
        label="Rua"
        icon="map-outline"
        placeholder="Preenchida automaticamente"
        value={endereco.rua}
        editable={false}
        containerStyle={styles.readOnly}
      />

      {/* Número + Complemento */}
      <View style={styles.row}>
        <View style={styles.numeroCol}>
          <Input
            label="Número"
            placeholder="Nº"
            value={endereco.numero}
            onChangeText={(v) => updateField("numero", v)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.flex1}>
          <Input
            label="Complemento"
            placeholder="Sala, andar, apt..."
            value={endereco.complemento}
            onChangeText={(v) => updateField("complemento", v)}
          />
        </View>
      </View>

      {/* Bairro + Cidade */}
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Input
            label="Bairro"
            placeholder="Bairro"
            value={endereco.bairro}
            editable={false}
            containerStyle={styles.readOnly}
          />
        </View>
        <View style={styles.flex1}>
          <Input
            label="Cidade"
            placeholder="Cidade"
            value={endereco.cidade}
            editable={false}
            containerStyle={styles.readOnly}
          />
        </View>
      </View>

      {/* UF */}
      <View style={styles.ufRow}>
        <View style={styles.ufCol}>
          <Input
            label="UF"
            placeholder="UF"
            value={endereco.uf}
            editable={false}
            maxLength={2}
            containerStyle={styles.readOnly}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing["4"],
    marginTop: spacing["4"],
  },
  row: {
    flexDirection: "row",
    gap: spacing["3"],
  },
  numeroCol: {
    width: 100,
  },
  flex1: {
    flex: 1,
  },
  ufRow: {
    flexDirection: "row",
  },
  ufCol: {
    width: 80,
  },
  readOnly: {
    opacity: 0.6,
  },
});
