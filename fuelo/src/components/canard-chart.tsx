import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Primary, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ChartBar } from '@/hooks/use-canard-stats';

type Props = { data: ChartBar[] };

const MAX_VISIBLE = 20;
const Y_AXIS_WIDTH = 32;

export function CanardChart({ data }: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  // Subtract: safeArea padding (×2) + card padding (×2) + yAxis label area
  const chartWidth = width - Spacing.three * 4 - Y_AXIS_WIDTH;

  const visible = useMemo(() => {
    if (data.length <= MAX_VISIBLE) return data;
    const step = Math.ceil(data.length / MAX_VISIBLE);
    return data.filter((_, i) => i % step === 0);
  }, [data]);

  const isEmpty = visible.every(d => d.value === 0);

  if (isEmpty) {
    return (
      <ThemedView type="backgroundElement" style={styles.empty}>
        <ThemedText type="small" themeColor="textSecondary">
          Aucun canard sur cette période 🦆
        </ThemedText>
      </ThemedView>
    );
  }

  const chartData = visible.map(d => ({
    value: d.value,
    label: d.label,
    dataPointText: d.value > 0 ? String(d.value) : '',
  }));

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <LineChart
        data={chartData}
        width={chartWidth}
        height={120}
        color={Primary}
        thickness={2}
        isAnimated
        dataPointsColor={Primary}
        dataPointsRadius={4}
        textColor={Primary}
        textFontSize={10}
        showTextOnFocus
        xAxisColor={theme.backgroundSelected}
        yAxisColor={theme.backgroundSelected}
        rulesColor={theme.backgroundSelected}
        rulesType="solid"
        yAxisLabelWidth={Y_AXIS_WIDTH}
        yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 9 }}
        noOfSections={3}
        hideDataPoints={false}
        focusEnabled
        showDataPointOnFocus
        showStripOnFocus
        stripColor={theme.backgroundSelected}
        stripWidth={1}
        focusedDataPointColor={Primary}
        focusedDataPointRadius={6}
        initialSpacing={10}
        endSpacing={10}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.two,
    padding: Spacing.three,
    overflow: 'hidden',
  },
  empty: {
    borderRadius: Spacing.two,
    padding: Spacing.four,
    alignItems: 'center',
  },
});
