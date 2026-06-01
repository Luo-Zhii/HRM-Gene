import { renderHook } from '@testing-library/react';
import { useCheckPermission } from './useCheckPermission';
import * as AuthModule from './useAuth';

/**
 * Seeded user fixtures matching the application's bootstrap data.
 * - admin@example.com → Director role → always bypass permission checks.
 */
const directorUser = {
  employee_id: 1,
  email: 'admin@example.com',
  role: 'Director',
  position: { position_name: 'Director' },
  permissions: [],
};

const managerWithPerms = {
  employee_id: 2,
  email: 'manager@corp.com',
  role: 'Manager',
  position: { position_name: 'Manager' },
  permissions: ['GET:/api/employees', 'POST:/api/employees'],
};

const managerWithObjectPerms = {
  employee_id: 3,
  email: 'manager2@corp.com',
  role: 'Manager',
  position: { position_name: 'Manager' },
  permissions: [
    { method: 'GET', apiPath: '/api/employees' },
    { method: 'POST', apiPath: '/api/employees' },
  ],
};

const employeeWithPartialPerms = {
  employee_id: 4,
  email: 'employee@corp.com',
  role: 'Employee',
  position: { position_name: 'Employee' },
  permissions: ['GET:/api/employees'],
};

describe('useCheckPermission', () => {
  const mockUseAuth = jest.spyOn(AuthModule, 'useAuth');

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * @TestID: TC_FE_CHECKPERM_01
   * @Priority: P1
   * @Category: Positive
   * @Description: Director bypass: checkPermission returns true for any method+path
   * @Steps:
   * 1. Arrange: Mock useAuth to return admin@example.com (Director)
   * 2. Act: Call checkPermission with arbitrary method and path
   * 3. Assert: Returns true regardless of stored permissions
   * @TestData: directorUser fixture, method='DELETE', apiPath='/api/anything'
   * @ExpectedResult: true (Director bypass)
   */
  it('should return true for Director using admin@example.com bypassing all checks', () => {
    mockUseAuth.mockReturnValue({ user: directorUser, loading: false, refresh: jest.fn(), logout: jest.fn() });

    const { result } = renderHook(() => useCheckPermission());
    const outcome = result.current.checkPermission('DELETE', '/api/anything');

    expect(outcome).toBe(true);
  });

  /**
   * @TestID: TC_FE_CHECKPERM_02
   * @Priority: P1
   * @Category: Positive
   * @Description: System Admin role bypasses all permission checks
   * @Steps:
   * 1. Arrange: Mock useAuth with role "System Admin" and no permissions array
   * 2. Act: Call checkPermission for a restricted endpoint
   * 3. Assert: Returns true via role-based bypass
   * @TestData: user fixture with role='System Admin'
   * @ExpectedResult: true
   */
  it('should return true for System Admin role bypass', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'System Admin', email: 'sysadmin@corp.com' },
      loading: false,
      refresh: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useCheckPermission());
    expect(result.current.checkPermission('DELETE', '/api/system/settings')).toBe(true);
  });

  /**
   * @TestID: TC_FE_CHECKPERM_03
   * @Priority: P1
   * @Category: White-box
   * @Description: Exact string permission match succeeds
   * @Steps:
   * 1. Arrange: Mock useAuth with a user holding the exact permission string
   * 2. Act: Call checkPermission with matching method + path
   * 3. Assert: Returns true
   * @TestData: managerWithPerms, method='GET', apiPath='/api/employees'
   * @ExpectedResult: true
   */
  it('should return true when user holds an exact string permission match', () => {
    mockUseAuth.mockReturnValue({
      user: managerWithPerms,
      loading: false,
      refresh: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useCheckPermission());
    expect(result.current.checkPermission('GET', '/api/employees')).toBe(true);
  });

  /**
   * @TestID: TC_FE_CHECKPERM_04
   * @Priority: P1
   * @Category: Negative
   * @Description: No matching permission returns false
   * @Steps:
   * 1. Arrange: Mock useAuth with a user lacking the required permission
   * 2. Act: Call checkPermission for an endpoint not in their permissions
   * 3. Assert: Returns false
   * @TestData: employeeWithPartialPerms, method='DELETE', apiPath='/api/employees'
   * @ExpectedResult: false
   */
  it('should return false when user lacks the required permission', () => {
    mockUseAuth.mockReturnValue({
      user: employeeWithPartialPerms,
      loading: false,
      refresh: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useCheckPermission());
    expect(result.current.checkPermission('DELETE', '/api/employees')).toBe(false);
  });

  /**
   * @TestID: TC_FE_CHECKPERM_05
   * @Priority: P1
   * @Category: Exception Handling
   * @Description: Null user returns false
   * @Steps:
   * 1. Arrange: Mock useAuth with user = null
   * 2. Act: Call checkPermission
   * 3. Assert: Returns false (no user → no permission)
   * @TestData: user=null
   * @ExpectedResult: false
   */
  it('should return false when no user is logged in (null user)', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, refresh: jest.fn(), logout: jest.fn() });

    const { result } = renderHook(() => useCheckPermission());
    expect(result.current.checkPermission('GET', '/api/employees')).toBe(false);
  });

  /**
   * @TestID: TC_FE_CHECKPERM_06
   * @Priority: P2
   * @Category: Positive
   * @Description: Object-format permissions (nested objects) match correctly
   * @Steps:
   * 1. Arrange: Mock useAuth with permissions that are objects {method, apiPath}
   * 2. Act: Call checkPermission with matching method and apiPath
   * 3. Assert: Returns true
   * @TestData: managerWithObjectPerms, method='GET', apiPath='/api/employees'
   * @ExpectedResult: true
   */
  it('should match object-format permissions (method and apiPath fields)', () => {
    mockUseAuth.mockReturnValue({
      user: managerWithObjectPerms,
      loading: false,
      refresh: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useCheckPermission());
    expect(result.current.checkPermission('GET', '/api/employees')).toBe(true);
  });

  /**
   * @TestID: TC_FE_CHECKPERM_07
   * @Priority: P2
   * @Category: Negative
   * @Description: Admin keyword in role name (case-insensitive) triggers bypass
   * @Steps:
   * 1. Arrange: Mock useAuth with role='Admin' (lowercase)
   * 2. Act: Call checkPermission for an endpoint the user does not hold
   * 3. Assert: Returns true due to admin keyword bypass
   * @TestData: user fixture with role='admin'
   * @ExpectedResult: true
   */
  it('should return true for user with role "admin" (lowercase keyword bypass)', () => {
    mockUseAuth.mockReturnValue({
      user: { role: 'admin', email: 'a@b.com', permissions: [] },
      loading: false,
      refresh: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useCheckPermission());
    expect(result.current.checkPermission('PATCH', '/api/secure/endpoint')).toBe(true);
  });

  /**
   * @TestID: TC_FE_CHECKPERM_08
   * @Priority: P2
   * @Category: Positive
   * @Description: System Admin role bypasses via position_name (case-insensitive)
   * @Steps:
   * 1. Arrange: Mock useAuth with position.position_name = 'System Admin'
   * 2. Act: Call checkPermission for a restricted endpoint
   * 3. Assert: Returns true via position-based role resolve
   * @TestData: user.position.position_name = 'System Admin', email != admin@example.com
   * @ExpectedResult: true
   */
  it('should detect System Admin from position_name when role field is empty', () => {
    mockUseAuth.mockReturnValue({
      user: { position: { position_name: 'System Admin' }, email: 'sa@corp.com', permissions: [] },
      loading: false,
      refresh: jest.fn(),
      logout: jest.fn(),
    });

    const { result } = renderHook(() => useCheckPermission());
    expect(result.current.checkPermission('GET', '/api/reports')).toBe(true);
  });
});
