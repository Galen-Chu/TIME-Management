/**
 * 進入點:Onboarding 閘門(FR-ONB:完成或跳過後不再出現)。
 */
import { Redirect } from 'expo-router';

import { useSettings } from '../state/settings';

export default function Gate() {
  const done = useSettings((s) => s.settings.onboardingDone);
  return <Redirect href={done ? '/(tabs)' : '/onboarding'} />;
}
