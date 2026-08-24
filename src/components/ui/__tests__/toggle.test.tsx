/**
 * Toggle 元件互動(DESIGN-SPEC:44×26 軌道、開關切換)。
 */
import { fireEvent, render } from '@testing-library/react-native';
import { Toggle } from '../toggle';

describe('Toggle', () => {
  it('點擊回傳反向值', async () => {
    const onChange = jest.fn();
    const { getByRole } = await render(
      <Toggle value={false} onChange={onChange} accessibilityLabel="flex" />
    );
    fireEvent(getByRole('switch', { name: 'flex' }), 'press');
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
