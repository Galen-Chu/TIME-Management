/**
 * 溫和提醒卡片(FR-SET:溫和建議卡片=App 內呈現):
 * 複用 Toast 深色卡;內容 = 提醒標題 + 事件/分鐘數;動作:查看(開事件表單)/稍後。
 */
import { useTranslation } from 'react-i18next';

import type { InAppCard } from '../../services/notify';
import { Toast } from '../ui/toast';

interface Props {
  card: InAppCard | null;
  onView: (eventId: string) => void;
  onDismiss: () => void;
}

export function ReminderToast({ card, onView, onDismiss }: Props) {
  const { t } = useTranslation();

  if (!card) return null;

  const label = card.bodyParams.label || t('categories.other');
  const message = `${t(card.titleKey)} · ${t('notify.push.body', {
    label,
    minutes: card.bodyParams.minutes,
  })}`;

  return (
    <Toast
      message={message}
      primaryLabel={t('toast.view')}
      secondaryLabel={t('common.later')}
      onPrimary={() => {
        onView(card.eventId);
        onDismiss();
      }}
      onSecondary={onDismiss}
    />
  );
}
