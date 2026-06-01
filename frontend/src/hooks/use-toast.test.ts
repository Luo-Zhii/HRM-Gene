import { renderHook, act } from '@testing-library/react';
import { reducer, useToast, toast } from './use-toast';

// The toast module maintains module-level state (memoryState, listeners, count).
// We need to reset it between tests.
beforeEach(() => {
  jest.useFakeTimers();
  // Reset internal module state by dispatching REMOVE_TOAST with no id
  // This clears all toasts from memoryState
  const { result } = renderHook(() => useToast());
  act(() => {
    result.current.dismiss();
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe('toast reducer', () => {
  /**
   * @TestID: TC_FE_USETOAST_01
   * @Priority: P2
   * @Category: White-box
   * @Description: ADD_TOAST action pushes a toast onto the state array
   * @Steps:
   * 1. Arrange: Initial state with empty toasts
   * 2. Act: Dispatch ADD_TOAST with a toast object
   * 3. Assert: State.toasts contains the added toast
   * @TestData: toast {id:'1', title:'Test'}
   * @ExpectedResult: toasts array contains toast with id='1'
   */
  it('should add a toast on ADD_TOAST action', () => {
    const initialState = { toasts: [] };
    const action = {
      type: 'ADD_TOAST' as const,
      toast: { id: '1', title: 'Hello', open: true },
    };
    const nextState = reducer(initialState, action);
    expect(nextState.toasts).toHaveLength(1);
    expect(nextState.toasts[0].id).toBe('1');
  });

  /**
   * @TestID: TC_FE_USETOAST_02
   * @Priority: P2
   * @Category: White-box
   * @Description: Enforces TOAST_LIMIT = 1 (only one toast visible at a time)
   * @Steps:
   * 1. Arrange: State already has one toast
   * 2. Act: Dispatch ADD_TOAST for a second toast
   * 3. Assert: Only 1 toast remains (the newest one)
   * @TestData: Two toast additions
   * @ExpectedResult: State.toasts.length === 1
   */
  it('should enforce TOAST_LIMIT (only 1 toast visible at a time)', () => {
    const initialState = { toasts: [{ id: '1', title: 'First', open: true }] };
    const action = {
      type: 'ADD_TOAST' as const,
      toast: { id: '2', title: 'Second', open: true },
    };
    const nextState = reducer(initialState, action);
    expect(nextState.toasts).toHaveLength(1);
    expect(nextState.toasts[0].id).toBe('2');
  });

  /**
   * @TestID: TC_FE_USETOAST_03
   * @Priority: P2
   * @Category: White-box
   * @Description: UPDATE_TOAST updates matching toast properties
   * @Steps:
   * 1. Arrange: State with one toast
   * 2. Act: Dispatch UPDATE_TOAST with partial update
   * 3. Assert: Toast properties are merged
   * @TestData: Update title on toast id='1'
   * @ExpectedResult: Toast title changed to 'Updated'
   */
  it('should update an existing toast on UPDATE_TOAST', () => {
    const initialState = {
      toasts: [{ id: '1', title: 'Old', description: 'desc', open: true }],
    };
    const action = {
      type: 'UPDATE_TOAST' as const,
      toast: { id: '1', title: 'Updated' },
    };
    const nextState = reducer(initialState, action);
    expect(nextState.toasts[0].title).toBe('Updated');
    expect(nextState.toasts[0].description).toBe('desc'); // preserved
  });

  /**
   * @TestID: TC_FE_USETOAST_04
   * @Priority: P2
   * @Category: White-box
   * @Description: DISMISS_TOAST sets open=false on the matching toast
   * @Steps:
   * 1. Arrange: State with one open toast
   * 2. Act: Dispatch DISMISS_TOAST with that toast's id
   * 3. Assert: toast.open === false
   * @TestData: DISMISS_TOAST toastId='1'
   * @ExpectedResult: toast.open = false
   */
  it('should set open to false on DISMISS_TOAST', () => {
    const initialState = {
      toasts: [{ id: '1', title: 'Dismiss me', open: true }],
    };
    const action = { type: 'DISMISS_TOAST' as const, toastId: '1' };
    const nextState = reducer(initialState, action);
    expect(nextState.toasts[0].open).toBe(false);
  });

  /**
   * @TestID: TC_FE_USETOAST_05
   * @Priority: P2
   * @Category: White-box
   * @Description: REMOVE_TOAST removes the matching toast from state
   * @Steps:
   * 1. Arrange: State with two toasts
   * 2. Act: Dispatch REMOVE_TOAST with id of one toast
   * 3. Assert: Only the other toast remains
   * @TestData: REMOVE_TOAST toastId='1'
   * @ExpectedResult: toasts.length === 1, remaining id is '2'
   */
  it('should remove a toast on REMOVE_TOAST', () => {
    const initialState = {
      toasts: [
        { id: '1', title: 'Remove me', open: false },
        { id: '2', title: 'Keep me', open: true },
      ],
    };
    const action = { type: 'REMOVE_TOAST' as const, toastId: '1' };
    const nextState = reducer(initialState, action);
    expect(nextState.toasts).toHaveLength(1);
    expect(nextState.toasts[0].id).toBe('2');
  });

  /**
   * @TestID: TC_FE_USETOAST_06
   * @Priority: P3
   * @Category: White-box
   * @Description: REMOVE_TOAST with undefined id clears all toasts
   * @Steps:
   * 1. Arrange: State with multiple toasts
   * 2. Act: Dispatch REMOVE_TOAST with no toastId
   * 3. Assert: State.toasts is empty
   * @TestData: REMOVE_TOAST toastId=undefined
   * @ExpectedResult: toasts = []
   */
  it('should clear all toasts when REMOVE_TOAST has no toastId', () => {
    const initialState = {
      toasts: [
        { id: '1', title: 'A', open: false },
        { id: '2', title: 'B', open: false },
      ],
    };
    const action = { type: 'REMOVE_TOAST' as const, toastId: undefined };
    const nextState = reducer(initialState, action);
    expect(nextState.toasts).toHaveLength(0);
  });
});

describe('toast function (imperative)', () => {
  /**
   * @TestID: TC_FE_USETOAST_07
   * @Priority: P2
   * @Category: Positive
   * @Description: Calling toast() imperatively adds a toast and returns control object
   * @Steps:
   * 1. Arrange: Hook renders useToast to subscribe to state
   * 2. Act: Call toast({title: 'Imperative'})
   * 3. Assert: State shows the toast; returned object has id, dismiss, update
   * @TestData: toast({title:'Imperative'})
   * @ExpectedResult: State.toasts[0].title === 'Imperative'
   */
  it('should add a toast via imperative toast() and return control object', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      const ret = toast({ title: 'Imperative Hello' });
      expect(ret).toHaveProperty('id');
      expect(ret).toHaveProperty('dismiss');
      expect(ret).toHaveProperty('update');
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Imperative Hello');
    expect(result.current.toasts[0].open).toBe(true);
  });
});
