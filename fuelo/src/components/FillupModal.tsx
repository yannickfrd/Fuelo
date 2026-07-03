import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { useRef, useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Primary, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { COMPATIBLE_FUELS, EngineType, FillUp, FuelType } from '@/types/vehicle';

type Props = {
  visible: boolean;
  vehicleId: number;
  engineType: EngineType;
  fillup?: FillUp;
  onSave: (data: Omit<FillUp, 'id'>) => void;
  onDelete: () => void;
  onClose: () => void;
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function displayToISO(display: string): string | null {
  const parts = display.split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  if (d.length !== 2 || m.length !== 2 || y.length !== 4) return null;
  return `${y}-${m}-${d}`;
}

type FormProps = Omit<Props, 'visible'>;

function FillupForm({ vehicleId, engineType, fillup, onSave, onDelete, onClose }: FormProps) {
  const theme = useTheme();
  const compatibleFuels = COMPATIBLE_FUELS[engineType];

  const [dateDisplay, setDateDisplay] = useState(
    fillup ? isoToDisplay(fillup.date) : isoToDisplay(todayISO())
  );
  const [odometer, setOdometer] = useState(fillup ? String(fillup.odometer) : '');
  const [fuelType, setFuelType] = useState<FuelType>(() => {
    if (fillup) {
      const saved = fillup.fuelType as FuelType;
      return compatibleFuels.includes(saved) ? saved : compatibleFuels[0];
    }
    return compatibleFuels[0];
  });
  const [liters, setLiters] = useState(fillup ? String(fillup.liters) : '');
  const [pricePerLiter, setPricePerLiter] = useState(fillup ? String(fillup.pricePerLiter) : '');
  const [totalPrice, setTotalPrice] = useState(fillup ? fillup.totalPrice.toFixed(2) : '');
  const totalManualRef = useRef(!!fillup);
  const [isFullTank, setIsFullTank] = useState(fillup ? fillup.isFullTank === 1 : true);

  function recalcTotal(l: string, p: string) {
    const lNum = parseFloat(l);
    const pNum = parseFloat(p);
    if (!isNaN(lNum) && !isNaN(pNum) && lNum > 0 && pNum > 0) {
      setTotalPrice((lNum * pNum).toFixed(2));
    }
  }

  function handleLitersChange(val: string) {
    setLiters(val);
    if (!totalManualRef.current) recalcTotal(val, pricePerLiter);
  }

  function handlePriceChange(val: string) {
    setPricePerLiter(val);
    if (!totalManualRef.current) recalcTotal(liters, val);
  }

  function handleSave() {
    const isoDate = displayToISO(dateDisplay);
    if (!isoDate) {
      Alert.alert('Date invalide', 'Format attendu : JJ/MM/AAAA');
      return;
    }
    const odometerNum = parseInt(odometer, 10);
    const litersNum = parseFloat(liters);
    const pricePerLiterNum = parseFloat(pricePerLiter);
    const totalPriceNum = parseFloat(totalPrice);

    if (isNaN(odometerNum) || odometerNum <= 0) { Alert.alert('Kilométrage invalide'); return; }
    if (isNaN(litersNum) || litersNum <= 0)     { Alert.alert('Quantité invalide'); return; }
    if (isNaN(pricePerLiterNum) || pricePerLiterNum <= 0) { Alert.alert('Prix invalide'); return; }
    if (isNaN(totalPriceNum) || totalPriceNum <= 0) { Alert.alert('Total invalide'); return; }

    onSave({
      vehicleId,
      date: isoDate,
      odometer: odometerNum,
      fuelType,
      liters: litersNum,
      pricePerLiter: pricePerLiterNum,
      totalPrice: totalPriceNum,
      isFullTank: isFullTank ? 1 : 0,
    });
    onClose();
  }

  function handleDelete() {
    Alert.alert('Supprimer', 'Supprimer ce plein ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => { onDelete(); onClose(); } },
    ]);
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <Pressable onPress={onClose}>
          <ThemedText type="link" themeColor="textSecondary">Annuler</ThemedText>
        </Pressable>
        <ThemedText type="smallBold">{fillup ? 'Modifier le plein' : 'Nouveau plein'}</ThemedText>
        <Pressable onPress={handleSave}>
          <ThemedText type="smallBold" style={{ color: Primary }}>Enregistrer</ThemedText>
        </Pressable>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>DATE</ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }]}
          value={dateDisplay}
          onChangeText={setDateDisplay}
          placeholder="JJ/MM/AAAA"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
        />

        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>KILOMÉTRAGE (km)</ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }]}
          value={odometer}
          onChangeText={setOdometer}
          placeholder="ex : 45 000"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
        />

        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>CARBURANT</ThemedText>
        <View style={styles.pills}>
          {compatibleFuels.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFuelType(f)}
              style={[styles.pill, { borderColor: theme.backgroundSelected }, fuelType === f && { backgroundColor: Primary, borderColor: Primary }]}>
              <ThemedText
                type="small"
                style={fuelType === f ? styles.pillTextActive : undefined}
                themeColor={fuelType === f ? undefined : 'textSecondary'}>
                {f}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>QUANTITÉ (L)</ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }]}
          value={liters}
          onChangeText={handleLitersChange}
          placeholder="ex : 40.5"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
        />

        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>PRIX AU LITRE (€)</ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }]}
          value={pricePerLiter}
          onChangeText={handlePriceChange}
          placeholder="ex : 1.85"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
        />

        <ThemedText type="small" themeColor="textSecondary" style={styles.label}>TOTAL (€)</ThemedText>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement }]}
          value={totalPrice}
          onChangeText={(v) => { totalManualRef.current = true; setTotalPrice(v); }}
          placeholder="calculé automatiquement"
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
        />

        <View style={styles.toggleRow}>
          <View style={styles.toggleLabel}>
            <ThemedText type="small">Plein complet</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Nécessaire pour le calcul de consommation</ThemedText>
          </View>
          <Switch
            value={isFullTank}
            onValueChange={setIsFullTank}
            trackColor={{ true: Primary, false: undefined }}
          />
        </View>

        {fillup && (
          <Pressable onPress={handleDelete} style={styles.deleteButton}>
            <ThemedText type="small" style={styles.deleteText}>Supprimer ce plein</ThemedText>
          </Pressable>
        )}
        <View style={{ height: Spacing.six }} />
      </ScrollView>
    </ThemedView>
  );
}

export function FillupModal({ visible, vehicleId, engineType, fillup, onSave, onDelete, onClose }: Props) {
  const formKey = `${visible ? 'open' : 'closed'}-${fillup?.id ?? 'new'}`;
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <FillupForm
        key={formKey}
        vehicleId={vehicleId}
        engineType={engineType}
        fillup={fillup}
        onSave={onSave}
        onDelete={onDelete}
        onClose={onClose}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.two,
  },
  label: {
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
    marginLeft: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  pill: {
    borderWidth: 1,
    borderRadius: Spacing.five,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  pillTextActive: {
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
    gap: Spacing.three,
  },
  toggleLabel: {
    flex: 1,
    gap: 2,
  },
  deleteButton: {
    marginTop: Spacing.five,
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  deleteText: {
    color: '#E53935',
  },
});
