import { renderHook, act } from '@testing-library/react';
import { useShowStatus } from './use-status';
import { useToast } from './use-toast';

jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('useShowStatus', () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast, toasts: [], dismiss: jest.fn() });
  });

  /**
   * @TestID: TC_FE_USESTATUS_01
   * @Priority: P2
   * @Category: Positive
   * @Description: showStatus('success', ...) calls toast with default variant and green styling
   * @Steps:
   * 1. Arrange: Mock useToast to return a jest.fn() toast
   * 2. Act: Call showStatus('success', 'Operation completed')
   * 3. Assert: toast is called with variant='default', title='Success', green className
   * @TestData: type='success', text='Operation completed'
   * @ExpectedResult: toast({variant:'default', title:'Success', description:'Operation completed', className containing 'bg-green-600'})
   */
  it('should call toast with success variant and green styling', () => {
    const { result } = renderHook(() => useShowStatus());
    const showStatus = result.current;

    act(() => {
      showStatus('success', 'Operation completed');
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'default',
        title: 'Success',
        description: 'Operation completed',
        className: expect.stringContaining('bg-green-600'),
      }),
    );
  });

  /**
   * @TestID: TC_FE_USESTATUS_02
   * @Priority: P2
   * @Category: Positive
   * @Description: showStatus('error', ...) calls toast with destructive variant
   * @Steps:
   * 1. Arrange: Mock useToast
   * 2. Act: Call showStatus('error', 'Something went wrong')
   * 3. Assert: toast called with variant='destructive', title='Error'
   * @TestData: type='error', text='Something went wrong'
   * @ExpectedResult: toast({variant:'destructive', title:'Error', description:'Something went wrong'})
   */
  it('should call toast with destructive variant for errors', () => {
    const { result } = renderHook(() => useShowStatus());
    const showStatus = result.current;

    act(() => {
      showStatus('error', 'Something went wrong');
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      }),
    );
  });

  /**
   * @TestID: TC_FE_USESTATUS_03
   * @Priority: P2
   * @Category: Positive
   * @Description: showStatus('warning', ...) calls toast with yellow styling
   * @Steps:
   * 1. Arrange: Mock useToast
   * 2. Act: Call showStatus('warning', 'Proceed with caution')
   * 3. Assert: toast called with title='Warning' and yellow background className
   * @TestData: type='warning', text='Proceed with caution'
   * @ExpectedResult: toast({title:'Warning', className containing 'bg-yellow-500'})
   */
  it('should call toast with yellow styling for warnings', () => {
    const { result } = renderHook(() => useShowStatus());
    const showStatus = result.current;

    act(() => {
      showStatus('warning', 'Proceed with caution');
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'default',
        title: 'Warning',
        description: 'Proceed with caution',
        className: expect.stringContaining('bg-yellow-500'),
      }),
    );
  });

  /**
   * @TestID: TC_FE_USESTATUS_04
   * @Priority: P2
   * @Category: Positive
   * @Description: showStatus('info', ...) calls toast with blue styling
   * @Steps:
   * 1. Arrange: Mock useToast
   * 2. Act: Call showStatus('info', 'System update available')
   * 3. Assert: toast called with title='Info' and blue background className
   * @TestData: type='info', text='System update available'
   * @ExpectedResult: toast({title:'Info', className containing 'bg-blue-500'})
   */
  it('should call toast with blue styling for info messages', () => {
    const { result } = renderHook(() => useShowStatus());
    const showStatus = result.current;

    act(() => {
      showStatus('info', 'System update available');
    });

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'default',
        title: 'Info',
        description: 'System update available',
        className: expect.stringContaining('bg-blue-500'),
      }),
    );
  });

  /**
   * @TestID: TC_FE_USESTATUS_05
   * @Priority: P3
   * @Category: White-box
   * @Description: showStatus returns void (does not return a value)
   * @Steps:
   * 1. Arrange: Mock useToast
   * 2. Act: Call showStatus('info', 'test')
   * 3. Assert: Return value is undefined
   * @TestData: type='info', text='test'
   * @ExpectedResult: undefined
   */
  it('should return undefined (void) from showStatus', () => {
    const { result } = renderHook(() => useShowStatus());
    const showStatus = result.current;

    let returnValue: unknown;
    act(() => {
      returnValue = showStatus('info', 'test');
    });

    expect(returnValue).toBeUndefined();
  });
});
