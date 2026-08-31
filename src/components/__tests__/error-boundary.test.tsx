/**
 * 全域錯誤邊界測試(P1):子樹拋例 → fallback 呈現;重試後恢復渲染。
 */
import { act, fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import i18n from '../../i18n'; // 初始化 i18next(fallback 文案走 zh-TW 預設)
import { ErrorBoundary } from '../error-boundary';

void i18n;

let shouldThrow = false;
function Flaky() {
  if (shouldThrow) throw new Error('render boom');
  return <Text>recovered</Text>;
}

describe('ErrorBoundary', () => {
  it('子樹拋例 → 顯示 fallback(不白屏)', async () => {
    shouldThrow = true;
    const { getByText } = await render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>
    );
    expect(getByText('發生錯誤')).toBeTruthy();
    expect(getByText('重試')).toBeTruthy();
  });

  it('重試後子樹恢復渲染', async () => {
    shouldThrow = true;
    const { getByText, getByRole } = await render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>
    );
    shouldThrow = false;
    await act(async () => {
      fireEvent.press(getByRole('button'));
    });
    expect(getByText('recovered')).toBeTruthy();
  });
});
