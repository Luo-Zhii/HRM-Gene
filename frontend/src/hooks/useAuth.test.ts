import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';
import * as AuthContextModule from '@/context/AuthContext';

describe('useAuth', () => {
  // [TC_FE_HOOK_044]
  // [TC_FE_HOOK_044]
  // [TC_FE_HOOK_044]
  // [TC_FE_HOOK_044]
  // [TC_FE_HOOK_044]
  // [TC_FE_HOOK_044]
  // [TC_FE_HOOK_044]
  // [TC_FE_HOOK_044]
  // [TC_FE_HOOK_044]
  // [TC_FE_HOOK_044]
  it('useAuth: Trả về thông tin user (employee_id) từ AuthContext',
    const mockContext = { user: { employee_id: 1 } };
    jest.spyOn(AuthContextModule, 'useAuthContext').mockReturnValue(mockContext as any);
    
    const { result } = renderHook(() => useAuth());
    expect(result.current.user?.employee_id).toBe(1);
  });
});
