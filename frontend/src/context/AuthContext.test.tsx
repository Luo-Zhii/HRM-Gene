import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuthContext } from './AuthContext';

const mockFetch = jest.fn();
global.fetch = mockFetch as any;

const originalLocation = window.location;

beforeEach(() => {
  jest.clearAllMocks();
  delete (window as any).location;
  (window as any).location = {
    ...originalLocation,
    href: '',
    pathname: '/',
  };
  Storage.prototype.clear = jest.fn();
  document.cookie = '';
});

afterAll(() => {
  window.location = originalLocation;
});

const DummyComponent = () => {
  const { user, loading, refresh, logout } = useAuthContext();
  if (loading) return <div data-testid="loading">Loading...</div>;
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <button onClick={refresh}>Refresh</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  it('should render loading initially and then fetch profile success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: 'test@example.com' }),
    } as Response);

    render(
      <AuthProvider>
        <DummyComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/auth/profile'), expect.any(Object));
  });

  it('should handle fetch profile failure (401)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);

    render(
      <AuthProvider>
        <DummyComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
  });

  it('should logout correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: 'test@example.com' }),
    } as Response);
    
    render(
      <AuthProvider>
        <DummyComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
    } as Response);

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(localStorage.clear).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');
  });

  it('should trigger redirect to login if unauthenticated on protected route', async () => {
    (window as any).location.pathname = '/dashboard';
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response);

    render(
      <AuthProvider>
        <DummyComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(window.location.href).toBe('/login');
    });
  });

  it('should not redirect if unauthenticated on public route', async () => {
    (window as any).location.pathname = '/login';
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response);

    render(
      <AuthProvider>
        <DummyComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });
    expect(window.location.href).toBe(''); // unchanged
  });

  it('should handle fetch interceptor for 401 on other API calls', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ email: 'test@example.com' }),
    } as Response);

    render(
      <AuthProvider>
        <DummyComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response);

    await act(async () => {
      try {
        await global.fetch('/api/secure');
      } catch (e) {}
    });

    expect(localStorage.clear).toHaveBeenCalled();
    expect(window.location.href).toBe('/login');
  });

  it('should throw error if useAuthContext is used outside component', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<DummyComponent />)).toThrow('useAuthContext must be used within AuthProvider');
    consoleError.mockRestore();
  });
});
