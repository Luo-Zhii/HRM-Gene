/**
 * @jest-environment jsdom
 */
import {
  isAdminBypassRole,
  canManageSystem,
  canManagePayroll,
  getPositionName,
  canManagePermissions,
  canManageLeave,
  canManageEmployees,
} from './adminAccess';

/**
 * Seed-aligned user fixtures.
 * admin@example.com → Director → always bypasses all access guards.
 */
const directorUser = {
  email: 'admin@example.com',
  position: { position_name: 'Director' },
  department: { department_name: 'HR' },
  role: 'Director',
  permissions: [],
};

const hrManagerUser = {
  email: 'hr@corp.com',
  position: { position_name: 'HR Manager' },
  department: { department_name: 'HR' },
  role: 'HR Manager',
  permissions: ['manage:system'],
};

const financeUser = {
  email: 'finance@corp.com',
  position: { position_name: 'Accountant' },
  department: { department_name: 'Finance' },
  role: 'Accountant',
  permissions: [],
};

const employeeWithSystemPerm = {
  email: 'emp@corp.com',
  position: { position_name: 'Employee' },
  department: { department_name: 'Engineering' },
  role: 'Employee',
  permissions: ['PATCH:/api/admin/settings'],
};

const emptyUser = {
  email: 'basic@corp.com',
  position: {},
  department: {},
  role: '',
  permissions: [],
};

// --- Helpers ---
// isPathAllowedForDept reads from sessionStorage; ensure it is clean.
function setDeptVisibilityCache(path: string, visible: boolean): void {
  const cache = { [path]: visible };
  sessionStorage.setItem('sidebar_dept_visibility_test', JSON.stringify(cache));
  // We cannot control the exact cache key used by the source, so we override
  // sessionStorage to have a predictable key matching the prefix pattern.
  Object.keys(sessionStorage).forEach((k) => {
    if (k.startsWith('sidebar_dept_visibility_')) sessionStorage.removeItem(k);
  });
  sessionStorage.setItem('sidebar_dept_visibility_test', JSON.stringify(cache));
}

function clearDeptVisibilityCache(): void {
  Object.keys(sessionStorage).forEach((k) => {
    if (k.startsWith('sidebar_dept_visibility_')) sessionStorage.removeItem(k);
  });
}

beforeEach(() => {
  clearDeptVisibilityCache();
});

// Note: isPathAllowedForDept reads from sessionStorage keys starting with
// "sidebar_dept_visibility_". We can't control the exact key; it depends on
// the runtime. We'll test the guards that don't rely on sessionStorage.

describe('getPositionName', () => {
  /**
   * @TestID: TC_FE_ADMINACCESS_01
   * @Priority: P2
   * @Category: White-box
   * @Description: getPositionName returns lowercased position_name
   * @Steps:
   * 1. Arrange: User with position.position_name = 'Director'
   * 2. Act: Call getPositionName(user)
   * 3. Assert: Returns 'director'
   * @TestData: directorUser
   * @ExpectedResult: 'director'
   */
  // [TC_FE_LIB_058]
  // [TC_FE_LIB_058]
  // [TC_FE_LIB_058]
  // [TC_FE_LIB_058]
  // [TC_FE_LIB_058]
  // [TC_FE_LIB_058]
  // [TC_FE_LIB_058]
  // [TC_FE_LIB_058]
  // [TC_FE_LIB_058]
  // [TC_FE_LIB_058]
  it('should return lowercased position_name from position object', () => {
    expect(getPositionName(directorUser)).toBe('director');
  });

  /**
   * @TestID: TC_FE_ADMINACCESS_02
   * @Priority: P2
   * @Category: White-box
   * @Description: getPositionName falls back to role when position_name is absent
   * @Steps:
   * 1. Arrange: User with role='Manager' and no position object
   * 2. Act: Call getPositionName
   * 3. Assert: Returns 'manager'
   * @TestData: user with role only
   * @ExpectedResult: 'manager'
   */
  // [TC_FE_LIB_059]
  // [TC_FE_LIB_059]
  // [TC_FE_LIB_059]
  // [TC_FE_LIB_059]
  // [TC_FE_LIB_059]
  // [TC_FE_LIB_059]
  // [TC_FE_LIB_059]
  // [TC_FE_LIB_059]
  // [TC_FE_LIB_059]
  // [TC_FE_LIB_059]
  it('should fall back to role when position_name is missing', () => {
    const user = { role: 'Manager', position: undefined };
    expect(getPositionName(user)).toBe('manager');
  });

  /**
   * @TestID: TC_FE_ADMINACCESS_03
   * @Priority: P3
   * @Category: Exception Handling
   * @Description: getPositionName returns empty string for null user
   * @Steps:
   * 1. Arrange: User is null
   * 2. Act: Call getPositionName(null)
   * 3. Assert: Returns ''
   * @TestData: null
   * @ExpectedResult: ''
   */
  // [TC_FE_LIB_060]
  // [TC_FE_LIB_060]
  // [TC_FE_LIB_060]
  // [TC_FE_LIB_060]
  // [TC_FE_LIB_060]
  // [TC_FE_LIB_060]
  // [TC_FE_LIB_060]
  // [TC_FE_LIB_060]
  // [TC_FE_LIB_060]
  // [TC_FE_LIB_060]
  it('should return empty string for null user', () => {
    expect(getPositionName(null)).toBe('');
  });
});

describe('isAdminBypassRole', () => {
  /**
   * @TestID: TC_FE_ADMINACCESS_04
   * @Priority: P1
   * @Category: Positive
   * @Description: Director role returns true for admin bypass
   * @Steps:
   * 1. Arrange: User with position_name='Director'
   * 2. Act: Call isAdminBypassRole
   * 3. Assert: Returns true
   * @TestData: directorUser
   * @ExpectedResult: true
   */
  // [TC_FE_LIB_061]
  // [TC_FE_LIB_061]
  // [TC_FE_LIB_061]
  // [TC_FE_LIB_061]
  // [TC_FE_LIB_061]
  // [TC_FE_LIB_061]
  // [TC_FE_LIB_061]
  // [TC_FE_LIB_061]
  // [TC_FE_LIB_061]
  // [TC_FE_LIB_061]
  it('should return true for Director role', () => {
    expect(isAdminBypassRole(directorUser)).toBe(true);
  });

  /**
   * @TestID: TC_FE_ADMINACCESS_05
   * @Priority: P2
   * @Category: Positive
   * @Description: HR Manager role returns true for admin bypass
   * @Steps:
   * 1. Arrange: User with position_name='HR Manager'
   * 2. Act: Call isAdminBypassRole
   * 3. Assert: Returns true (includes 'hr')
   * @TestData: hrManagerUser
   * @ExpectedResult: true
   */
  // [TC_FE_LIB_062]
  // [TC_FE_LIB_062]
  // [TC_FE_LIB_062]
  // [TC_FE_LIB_062]
  // [TC_FE_LIB_062]
  // [TC_FE_LIB_062]
  // [TC_FE_LIB_062]
  // [TC_FE_LIB_062]
  // [TC_FE_LIB_062]
  // [TC_FE_LIB_062]
  it('should return true for HR Manager (includes hr in bypass list)', () => {
    expect(isAdminBypassRole(hrManagerUser)).toBe(true);
  });

  /**
   * @TestID: TC_FE_ADMINACCESS_06
   * @Priority: P2
   * @Category: Negative
   * @Description: Regular employee does not bypass admin checks
   * @Steps:
   * 1. Arrange: Employee with no special role
   * 2. Act: Call isAdminBypassRole
   * 3. Assert: Returns false
   * @TestData: employeeWithSystemPerm (Employee role)
   * @ExpectedResult: false
   */
  // [TC_FE_LIB_063]
  // [TC_FE_LIB_063]
  // [TC_FE_LIB_063]
  // [TC_FE_LIB_063]
  // [TC_FE_LIB_063]
  // [TC_FE_LIB_063]
  // [TC_FE_LIB_063]
  // [TC_FE_LIB_063]
  // [TC_FE_LIB_063]
  // [TC_FE_LIB_063]
  it('should return false for regular Employee', () => {
    expect(isAdminBypassRole(employeeWithSystemPerm)).toBe(false);
  });
});

describe('canManageSystem', () => {
  /**
   * @TestID: TC_FE_ADMINACCESS_07
   * @Priority: P1
   * @Category: Positive
   * @Description: Director can always manage system
   * @Steps:
   * 1. Arrange: Director user with no explicit system permissions
   * 2. Act: Call canManageSystem
   * 3. Assert: Returns true via role bypass
   * @TestData: directorUser
   * @ExpectedResult: true
   */
  // [TC_FE_LIB_064]
  // [TC_FE_LIB_064]
  // [TC_FE_LIB_064]
  // [TC_FE_LIB_064]
  // [TC_FE_LIB_064]
  // [TC_FE_LIB_064]
  // [TC_FE_LIB_064]
  // [TC_FE_LIB_064]
  // [TC_FE_LIB_064]
  // [TC_FE_LIB_064]
  it('should return true for Director via admin bypass role', () => {
    expect(canManageSystem(directorUser)).toBe(true);
  });

  /**
   * @TestID: TC_FE_ADMINACCESS_08
   * @Priority: P1
   * @Category: Positive
   * @Description: User with manage:system permission can manage system
   * @Steps:
   * 1. Arrange: Non-bypass user with permissions=['manage:system']
   * 2. Act: Call canManageSystem
   * 3. Assert: Returns true
   * @TestData: hrManagerUser (has manage:system)
   * @ExpectedResult: true
   */
  // [TC_FE_LIB_065]
  // [TC_FE_LIB_065]
  // [TC_FE_LIB_065]
  // [TC_FE_LIB_065]
  // [TC_FE_LIB_065]
  // [TC_FE_LIB_065]
  // [TC_FE_LIB_065]
  // [TC_FE_LIB_065]
  // [TC_FE_LIB_065]
  // [TC_FE_LIB_065]
  it('should return true for HR Manager with manage:system permission', () => {
    // HR Manager is a bypass role in the list ("hr", "hr manager"),
    // but our hrManagerUser has position_name='HR Manager'.
    // isAdminBypassRole would match "hr" or "hr manager", so it'd
    // be true regardless. Let's test a user who only has the permission:
    const user = { ...employeeWithSystemPerm, permissions: ['manage:system'] };
    expect(canManageSystem(user)).toBe(true);
  });

  /**
   * @TestID: TC_FE_ADMINACCESS_09
   * @Priority: P2
   * @Category: Negative
   * @Description: User with no system permissions cannot manage system
   * @Steps:
   * 1. Arrange: User with no system permissions or bypass role
   * 2. Act: Call canManageSystem
   * 3. Assert: Returns false
   * @TestData: emptyUser
   * @ExpectedResult: false
   */
  // [TC_FE_LIB_066]
  // [TC_FE_LIB_066]
  // [TC_FE_LIB_066]
  // [TC_FE_LIB_066]
  // [TC_FE_LIB_066]
  // [TC_FE_LIB_066]
  // [TC_FE_LIB_066]
  // [TC_FE_LIB_066]
  // [TC_FE_LIB_066]
  // [TC_FE_LIB_066]
  it('should return false for user without system permissions', () => {
    expect(canManageSystem(emptyUser)).toBe(false);
  });
});

describe('canManagePayroll', () => {
  /**
   * @TestID: TC_FE_ADMINACCESS_10
   * @Priority: P1
   * @Category: Positive
   * @Description: Finance department user can manage payroll
   * @Steps:
   * 1. Arrange: User in Finance department with no explicit payroll perms
   * 2. Act: Call canManagePayroll
   * 3. Assert: Returns true via department bypass
   * @TestData: financeUser
   * @ExpectedResult: true
   */
  // [TC_FE_LIB_067]
  // [TC_FE_LIB_067]
  // [TC_FE_LIB_067]
  // [TC_FE_LIB_067]
  // [TC_FE_LIB_067]
  // [TC_FE_LIB_067]
  // [TC_FE_LIB_067]
  // [TC_FE_LIB_067]
  // [TC_FE_LIB_067]
  // [TC_FE_LIB_067]
  it('should return true for Finance department user', () => {
    expect(canManagePayroll(financeUser)).toBe(true);
  });

  /**
   * @TestID: TC_FE_ADMINACCESS_11
   * @Priority: P2
   * @Category: Negative
   * @Description: Non-finance, non-admin user cannot manage payroll
   * @Steps:
   * 1. Arrange: Employee in Engineering with no payroll perms
   * 2. Act: Call canManagePayroll
   * 3. Assert: Returns false
   * @TestData: emptyUser
   * @ExpectedResult: false
   */
  // [TC_FE_LIB_068]
  // [TC_FE_LIB_068]
  // [TC_FE_LIB_068]
  // [TC_FE_LIB_068]
  // [TC_FE_LIB_068]
  // [TC_FE_LIB_068]
  // [TC_FE_LIB_068]
  // [TC_FE_LIB_068]
  // [TC_FE_LIB_068]
  // [TC_FE_LIB_068]
  it('should return false for non-finance, non-admin user', () => {
    expect(canManagePayroll(emptyUser)).toBe(false);
  });
});

describe('canManagePermissions', () => {
  /**
   * @TestID: TC_FE_ADMINACCESS_12
   * @Priority: P1
   * @Category: Positive
   * @Description: Director can manage permissions
   * @Steps:
   * 1. Arrange: Director user
   * 2. Act: Call canManagePermissions
   * 3. Assert: Returns true via bypass
   * @TestData: directorUser
   * @ExpectedResult: true
   */
  // [TC_FE_LIB_069]
  // [TC_FE_LIB_069]
  // [TC_FE_LIB_069]
  // [TC_FE_LIB_069]
  // [TC_FE_LIB_069]
  // [TC_FE_LIB_069]
  // [TC_FE_LIB_069]
  // [TC_FE_LIB_069]
  // [TC_FE_LIB_069]
  // [TC_FE_LIB_069]
  it('should return true for Director', () => {
    expect(canManagePermissions(directorUser)).toBe(true);
  });

  /**
   * @TestID: TC_FE_ADMINACCESS_13
   * @Priority: P2
   * @Category: Negative
   * @Description: Regular user cannot manage permissions
   * @Steps:
   * 1. Arrange: User with no permission-related perms
   * 2. Act: Call canManagePermissions
   * 3. Assert: Returns false
   * @TestData: emptyUser
   * @ExpectedResult: false
   */
  // [TC_FE_LIB_070]
  // [TC_FE_LIB_070]
  // [TC_FE_LIB_070]
  // [TC_FE_LIB_070]
  // [TC_FE_LIB_070]
  // [TC_FE_LIB_070]
  // [TC_FE_LIB_070]
  // [TC_FE_LIB_070]
  // [TC_FE_LIB_070]
  // [TC_FE_LIB_070]
  it('should return false for regular user without permissions', () => {
    expect(canManagePermissions(emptyUser)).toBe(false);
  });
});

describe('canManageLeave', () => {
  /**
   * @TestID: TC_FE_ADMINACCESS_14
   * @Priority: P1
   * @Category: Positive
   * @Description: HR department user can manage leave
   * @Steps:
   * 1. Arrange: User in HR department
   * 2. Act: Call canManageLeave
   * 3. Assert: Returns true via department bypass
   * @TestData: hrManagerUser (department=HR)
   * @ExpectedResult: true
   */
  // [TC_FE_LIB_071]
  // [TC_FE_LIB_071]
  // [TC_FE_LIB_071]
  // [TC_FE_LIB_071]
  // [TC_FE_LIB_071]
  // [TC_FE_LIB_071]
  // [TC_FE_LIB_071]
  // [TC_FE_LIB_071]
  // [TC_FE_LIB_071]
  // [TC_FE_LIB_071]
  it('should return true for HR department user', () => {
    // HR Manager is bypass role AND HR department
    expect(canManageLeave(hrManagerUser)).toBe(true);
  });

  /**
   * @TestID: TC_FE_ADMINACCESS_15
   * @Priority: P2
   * @Category: Negative
   * @Description: Non-HR, non-admin user cannot manage leave
   * @Steps:
   * 1. Arrange: Finance user with no leave perms
   * 2. Act: Call canManageLeave
   * 3. Assert: Returns false
   * @TestData: financeUser
   * @ExpectedResult: false
   */
  // [TC_FE_LIB_072]
  // [TC_FE_LIB_072]
  // [TC_FE_LIB_072]
  // [TC_FE_LIB_072]
  // [TC_FE_LIB_072]
  // [TC_FE_LIB_072]
  // [TC_FE_LIB_072]
  // [TC_FE_LIB_072]
  // [TC_FE_LIB_072]
  // [TC_FE_LIB_072]
  it('should return false for non-HR non-admin user', () => {
    expect(canManageLeave(financeUser)).toBe(false);
  });
});

describe('canManageEmployees', () => {
  /**
   * @TestID: TC_FE_ADMINACCESS_16
   * @Priority: P1
   * @Category: Positive
   * @Description: Director can manage employees via bypass
   * @Steps:
   * 1. Arrange: Director user
   * 2. Act: Call canManageEmployees
   * 3. Assert: Returns true
   * @TestData: directorUser
   * @ExpectedResult: true
   */
  // [TC_FE_LIB_073]
  // [TC_FE_LIB_073]
  // [TC_FE_LIB_073]
  // [TC_FE_LIB_073]
  // [TC_FE_LIB_073]
  // [TC_FE_LIB_073]
  // [TC_FE_LIB_073]
  // [TC_FE_LIB_073]
  // [TC_FE_LIB_073]
  // [TC_FE_LIB_073]
  it('should return true for Director', () => {
    expect(canManageEmployees(directorUser)).toBe(true);
  });

  /**
   * @TestID: TC_FE_ADMINACCESS_17
   * @Priority: P1
   * @Category: Positive
   * @Description: HR department user can manage employees
   * @Steps:
   * 1. Arrange: User in HR department
   * 2. Act: Call canManageEmployees
   * 3. Assert: Returns true via HR department bypass
   * @TestData: hrManagerUser
   * @ExpectedResult: true
   */
  // [TC_FE_LIB_074]
  // [TC_FE_LIB_074]
  // [TC_FE_LIB_074]
  // [TC_FE_LIB_074]
  // [TC_FE_LIB_074]
  // [TC_FE_LIB_074]
  // [TC_FE_LIB_074]
  // [TC_FE_LIB_074]
  // [TC_FE_LIB_074]
  // [TC_FE_LIB_074]
  it('should return true for HR department user', () => {
    expect(canManageEmployees(hrManagerUser)).toBe(true);
  });

  /**
   * @TestID: TC_FE_ADMINACCESS_18
   * @Priority: P2
   * @Category: Negative
   * @Description: Non-HR user cannot manage employees
   * @Steps:
   * 1. Arrange: Finance user with no HR perms
   * 2. Act: Call canManageEmployees
   * 3. Assert: Returns false
   * @TestData: financeUser
   * @ExpectedResult: false
   */
  // [TC_FE_LIB_075]
  // [TC_FE_LIB_075]
  // [TC_FE_LIB_075]
  // [TC_FE_LIB_075]
  // [TC_FE_LIB_075]
  // [TC_FE_LIB_075]
  // [TC_FE_LIB_075]
  // [TC_FE_LIB_075]
  // [TC_FE_LIB_075]
  // [TC_FE_LIB_075]
  it('should return false for non-HR user', () => {
    expect(canManageEmployees(financeUser)).toBe(false);
  });
});
