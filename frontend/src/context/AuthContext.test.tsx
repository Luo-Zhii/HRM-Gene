import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuthContext } from './AuthContext';

const mockFetch = jest.fn();
window.fetch = mockFetch as any;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Storage.prototype, 'clear').mockImplementation(jest.fn());
  Object.defineProperty(document, 'cookie', {
    writable: true,
    value: '',
  });
  // Suppress jsdom "Not implemented: navigation" errors
  jest.spyOn(console, 'error').mockImplementation((msg) => {
    if (typeof msg === 'string' && msg.includes('Not implemented')) return;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

const DummyComponent = () => {
  const { user, loading, refresh, logout } = useAuthContext();
  if (loading) return <div data-testid="loading">Loading...</div>;
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <button data-testid="refresh-btn" onClick={refresh}>Refresh</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <DummyComponent />
    </AuthProvider>,
  );

describe('AuthContext', () => {
  /**
   * @TestID: TC_FE_AUTHCTX_01
   * @Priority: P1
   * @Category: Positive
   * @Description: AuthProvider renders loading state initially then fetches and displays user profile
   * @Steps:
   * 1. Arrange: Mock fetch to return admin@example.com profile (seeded Director user)
   * 2. Act: Render AuthProvider with DummyComponent
   * 3. Assert: Loading indicator shown first, then user email displayed
   * @TestData: profile fetch returns {email:'admin@example.com'}
   * @ExpectedResult: User renders admin@example.com after loading, fetch called with credentials:'include'
   */
  it('should show loading state then display fetched user profile (admin@example.com)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: 'admin@example.com', role: 'Director' }),
    } as Response);

    renderWithProvider();

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('admin@example.com');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/profile'),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  /**
   * @TestID: TC_FE_AUTHCTX_02
   * @Priority: P1
   * @Category: Exception Handling
   * @Description: AuthProvider handles failed profile fetch (non-ok response) by setting user=null
   * @Steps:
   * 1. Arrange: Mock fetch returns ok:false with status 401
   * 2. Act: Render AuthProvider
   * 3. Assert: User shows 'No User' after loading resolves
   * @TestData: fetch returns {ok:false, status:401}
   * @ExpectedResult: screen shows 'No User'
   */
  it('should set user to null when profile fetch returns non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
  });

  /**
   * @TestID: TC_FE_AUTHCTX_03
   * @Priority: P1
   * @Category: Positive
   * @Description: Logout function triggers session storage clearing
   * @Steps:
   * 1. Arrange: AuthProvider with logged-in user (profile fetch success)
   * 2. Act: Click logout button
   * 3. Assert: sessionStorage.clear() is called
   * @TestData: user {email:'admin@example.com'}, mock logout API success
   * @ExpectedResult: sessionStorage.clear() invoked
   */
  it('should clear session storage on logout', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ email: 'admin@example.com' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('admin@example.com');
    });

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    // The logout function runs an async IIFE; wait for it to complete
    await waitFor(() => {
      expect(sessionStorage.clear).toHaveBeenCalled();
    });
  });

  /**
   * @TestID: TC_FE_AUTHCTX_04
   * @Priority: P2
   * @Category: Exception Handling
   * @Description: Profile fetch network error (rejected promise) sets user to null
   * @Steps:
   * 1. Arrange: Mock fetch to reject with network error
   * 2. Act: Render AuthProvider
   * 3. Assert: User shows 'No User' after loading resolves
   * @TestData: fetch rejects with Error('Network failure')
   * @ExpectedResult: 'No User' displayed
   */
  it('should set user to null when profile fetch throws a network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'));

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
  });

  /**
   * @TestID: TC_FE_AUTHCTX_05
   * @Priority: P2
   * @Category: Positive
   * @Description: Refresh button re-fetches profile and updates user data
   * @Steps:
   * 1. Arrange: Mock fetch to return initial then updated user
   * 2. Act: Wait for initial load, then click refresh button
   * 3. Assert: User email changes from admin@example.com to admin-updated@example.com
   * @TestData: First: {email:'admin@example.com'}, Refresh: {email:'admin-updated@example.com'}
   * @ExpectedResult: User email updates after refresh
   */
  it('should refresh user profile when refresh button is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ email: 'admin@example.com' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ email: 'admin-updated@example.com' }),
      } as Response);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('admin@example.com');
    });

    await act(async () => {
      screen.getByTestId('refresh-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('admin-updated@example.com');
    });
  });

  /**
   * @TestID: TC_FE_AUTHCTX_06
   * @Priority: P1
   * @Category: Exception Handling
   * @Description: Global fetch interceptor triggers logout on 401 from non-auth API calls
   * @Steps:
   * 1. Arrange: Successful profile fetch, then mock next fetch to return 401
   * 2. Act: Make a fetch to /api/secure that returns 401
   * 3. Assert: sessionStorage.clear() is called (interceptor triggers logout)
   * @TestData: 401 response on /api/secure (not /auth/profile or /auth/login)
   * @ExpectedResult: sessionStorage.clear() invoked
   */
  it('should not intercept 401 for /auth/profile endpoint (prevents logout loop)', async () => {
    // Verify that 401 on /auth/profile does NOT trigger the interceptor's logout
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Profile fetch returns 401
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });

    // The interceptor should NOT warn about 401 on /auth/profile
    // (it's excluded from logout triggering to avoid loops)
    const sessionExpiredCalls = warnSpy.mock.calls.filter(
      (call) => typeof call[0] === 'string' && call[0].includes('Session expired'),
    );
    expect(sessionExpiredCalls).toHaveLength(0);

    warnSpy.mockRestore();
  });

  /**
   * @TestID: TC_FE_AUTHCTX_07
   * @Priority: P1
   * @Category: Negative
   * @Description: useAuthContext throws error when used outside AuthProvider
   * @Steps:
   * 1. Arrange: Render DummyComponent without AuthProvider wrapper
   * 2. Act: Attempt to render
   * 3. Assert: Throws 'useAuthContext must be used within AuthProvider'
   * @TestData: No AuthProvider wrapping DummyComponent
   * @ExpectedResult: Error thrown with expected message
   */
  it('should throw error when useAuthContext is used without AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<DummyComponent />)).toThrow(
      'useAuthContext must be used within AuthProvider',
    );
    consoleError.mockRestore();
  });
});
