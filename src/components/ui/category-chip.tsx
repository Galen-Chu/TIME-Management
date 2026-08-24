/**
 * 類別膠囊 CategoryChip(DESIGN-SPEC):
 * 選中 = 類別色實底白字;未選 = 白底 + 1.5px 類別色框 + 類別色字。
 */
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import { categoryLabelKey, type CategoryKey } from '../../domain/categories';
import { color, font, radius } from '../../theme';

interface Props {
  category: CategoryKey;
  selected: boolean;
  onPress: (c: CategoryKey) => void;
}

export function CategoryChip({ category, selected, onPress }: Props) {
  const { t } = useTranslation();
  const catColor = color.category[category];
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={() => onPress(category)}
      style={[
        styles.chip,
        { borderColor: catColor },
        selected && { backgroundColor: catColor },
      ]}
    >
      <Text style={[styles.text, { color: selected ? '#FFFFFF' : catColor }]}>
        {t(categoryLabelKey(category))}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  text: {
    fontSize: 13,
    fontFamily: font.rounded.semibold,
  },
});
