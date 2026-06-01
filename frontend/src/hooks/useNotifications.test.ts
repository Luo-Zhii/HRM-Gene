import { renderHook, act } from '@testing-library/react-hooks';
import { useNotifications } from './useNotifications';
import { useNotificationContext } from '../context/NotificationContext';

jest.mock('../context/NotificationContext', () => ({
  useNotificationContext: jest.fn(),
  AppNotification: {},
}));

describe('useNotifications', () => {
  const mockMarkAsRead = jest.fn();
  const mockRemoveNotification = jest.fn();
  const mockMarkAllAsRead = jest.fn();

  const defaultContext = {
    notifications: [
      { id: 1, isRead: false, title: 'Test 1' },
      { id: 2, isRead: true, title: 'Test 2' },
    ],
    unreadCount: 1,
    markAsRead: mockMarkAsRead,
    removeNotification: mockRemoveNotification,
    markAllAsRead: mockMarkAllAsRead,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useNotificationContext as jest.Mock).mockReturnValue(defaultContext);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * @TestID: TC_FE_NOTIF_01
   * @Priority: P1
   * @Category: Positive
   * @Description: useNotifications returns notifications array and unread count from context
   * @Steps:
   * 1. Arrange: Mock useNotificationContext with 2 notifications (1 unread)
   * 2. Act: Render hook
   * 3. Assert: notifications.length=2, unreadCount=1
   * @TestData: notifications=[{id:1,isRead:false},{id:2,isRead:true}]
   * @ExpectedResult: notifications length 2, unread count 1
   */
  it('should return notifications array and unread count from context', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications.length).toBe(2);
    expect(result.current.unreadCount).toBe(1);
  });

  /**
   * @TestID: TC_FE_NOTIF_02
   * @Priority: P1
   * @Category: Positive
   * @Description: markAsRead calls context method and updates unread count
   * @Steps:
   * 1. Arrange: Mock useNotificationContext
   * 2. Act: Call result.current.markAsRead(1)
   * 3. Assert: mockMarkAsRead called with 1
   * @TestData: notification id 1
   * @ExpectedResult: mockMarkAsRead(1) called
   */
  it('should call markAsRead from context when invoked', async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.markAsRead(1);
    });

    expect(mockMarkAsRead).toHaveBeenCalledWith(1);
  });

  /**
   * @TestID: TC_FE_NOTIF_03
   * @Priority: P2
   * @Category: Positive
   * @Description: removeNotification calls context method
   * @Steps:
   * 1. Arrange: Mock useNotificationContext
   * 2. Act: Call result.current.removeNotification(1)
   * 3. Assert: mockRemoveNotification called with 1
   * @TestData: notification id 1
   * @ExpectedResult: mockRemoveNotification(1) called
   */
  it('should call removeNotification from context when invoked', async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.removeNotification(1);
    });

    expect(mockRemoveNotification).toHaveBeenCalledWith(1);
  });

  /**
   * @TestID: TC_FE_NOTIF_04
   * @Priority: P2
   * @Category: Positive
   * @Description: markAllAsRead calls context method
   * @Steps:
   * 1. Arrange: Mock useNotificationContext
   * 2. Act: Call result.current.markAllAsRead()
   * 3. Assert: mockMarkAllAsRead called
   * @TestData: none
   * @ExpectedResult: mockMarkAllAsRead() called
   */
  it('should call markAllAsRead from context when invoked', async () => {
    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });
});
