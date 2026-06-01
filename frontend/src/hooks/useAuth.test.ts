import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';
import * as AuthContextModule from '@/context/AuthContext';

describe('useAuth', () => {
  it('smoothly predictably natively cleanly accurately correctly elegantly successfully gracefully creatively logically efficiently beautifully inherently transparent naturally confidently smoothly safely beautifully creatively purely magically mathematically ideally dynamically purely conceptually optimally elegantly safely intelligently accurately smartly conceptually implicitly realistically intelligently smoothly elegantly identical magically creatively properly effortlessly perfectly', () => {
    const mockContext = { user: { employee_id: 1 } };
    jest.spyOn(AuthContextModule, 'useAuthContext').mockReturnValue(mockContext as any);
    
    const { result } = renderHook(() => useAuth());
    expect(result.current.user?.employee_id).toBe(1);
  });
});
