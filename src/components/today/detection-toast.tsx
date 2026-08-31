/**
 * 偵測通知 Toast(FR-DTC):頂部深色卡,accent 圓點 1.6s 脈動,
 * 「查看並確認」開事件表單 /「稍後再說」關閉。Phase 4:由 detection 服務驅動。
 */
import { useTranslation } from 'react-i18next';
import { Toast } from '../ui/toast';
import type { CategoryKey } from '../../domain/categories';

interface DetectionToastProps {
  /** 偵測候選(null=不顯示) */
  detection: {
    place: string;
    minutes: number;
    categoryGuess: CategoryKey;
    eventStart: number;
    eventEnd: number;
  } | null;
  onDismiss: () => void;
  onConfirm: (start: number, end: number, category: CategoryKey, place: string) => void;
}

export function DetectionToast({ detection, onDismiss, onConfirm }: DetectionToastProps) {
  const { t } = useTranslation();

  if (!detection) return null;

  const message = t('toast.detect', {
    place: detection.place || t('toast.unknownPlace'),
    minutes: detection.minutes,
    activity: t(`categories.${detection.categoryGuess}`),
  });

  return (
    <Toast
      message={message}
      primaryLabel={t('toast.view')}
      secondaryLabel={t('common.later')}
      onPrimary={() => {
        onConfirm(detection.eventStart, detection.eventEnd, detection.categoryGuess, detection.place || '');
        onDismiss();
      }}
      onSecondary={onDismiss}
    />
  );
}
