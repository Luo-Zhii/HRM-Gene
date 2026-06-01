import { checkMenuVisibility, MenuItem } from './menuVisibility';

/**
 * Seed-aligned user fixtures.
 * admin@example.com → Director, always bypasses.
 */
const directorUser = {
  employee_id: 1,
  email: 'admin@example.com',
  role: 'Director',
  position: { position_name: 'Director' },
  department: { department_name: 'HR' },
};

const hrManagerUser = {
  employee_id: 2,
  email: 'hr@corp.com',
  role: 'HR Manager',
  position: { position_name: 'HR Manager' },
  department: { department_name: 'HR' },
};

const financeUser = {
  employee_id: 3,
  email: 'finance@corp.com',
  role: 'Accountant',
  position: { position_name: 'Accountant' },
  department: { department_name: 'Finance' },
};

const salesManagerUser = {
  employee_id: 4,
  email: 'sales@corp.com',
  role: 'Manager',
  position: { position_name: 'Manager' },
  department: { department_name: 'Sales' },
};

const payrollMenuItem: MenuItem = {
  name: 'Payroll',
  href: '/admin/payroll',
  departments: ['Finance'],
  roles: ['Director'],
};

const peopleMenuItem: MenuItem = {
  name: 'People',
  href: '/admin/employees',
  departments: ['HR'],
  roles: ['Manager'],
};

describe('checkMenuVisibility', () => {
  /**
   * @TestID: TC_FE_MENUVIS_01
   * @Priority: P1
   * @Category: Positive
   * @Description: Director bypass: Director sees all menus regardless of restrictions
   * @Steps:
   * 1. Arrange: User is Director (admin@example.com)
   * 2. Act: Call checkMenuVisibility with finance-only Payroll menu
   * 3. Assert: Returns true (Director bypass)
   * @TestData: directorUser, payrollMenuItem
   * @ExpectedResult: true
   */
  it('should return true for Director bypassing all menu restrictions', () => {
    expect(checkMenuVisibility(directorUser, payrollMenuItem)).toBe(true);
  });

  /**
   * @TestID: TC_FE_MENUVIS_02
   * @Priority: P1
   * @Category: Positive
   * @Description: System Admin role bypasses all menu visibility checks
   * @Steps:
   * 1. Arrange: User with role 'System Admin' and no matching department
   * 2. Act: Call checkMenuVisibility with Payroll menu (Finance-only)
   * 3. Assert: Returns true
   * @TestData: systemAdminUser, payrollMenuItem
   * @ExpectedResult: true
   */
  it('should return true for System Admin bypassing menu checks', () => {
    const sysAdmin = { role: 'System Admin', position: {}, department: { department_name: 'IT' } };
    expect(checkMenuVisibility(sysAdmin, payrollMenuItem)).toBe(true);
  });

  /**
   * @TestID: TC_FE_MENUVIS_03
   * @Priority: P1
   * @Category: Positive
   * @Description: Department match: Finance user sees Finance-only menu
   * @Steps:
   * 1. Arrange: User in Finance department, Payroll menu restricted to Finance
   * 2. Act: Call checkMenuVisibility
   * 3. Assert: Returns true
   * @TestData: financeUser, payrollMenuItem
   * @ExpectedResult: true
   */
  it('should return true when user department matches the menu department restriction', () => {
    expect(checkMenuVisibility(financeUser, payrollMenuItem)).toBe(true);
  });

  /**
   * @TestID: TC_FE_MENUVIS_04
   * @Priority: P1
   * @Category: Negative
   * @Description: Functional segregation: HR user cannot see Finance-only menu
   * @Steps:
   * 1. Arrange: HR Manager user, Payroll menu restricted to Finance only
   * 2. Act: Call checkMenuVisibility
   * 3. Assert: Returns false (functional department segregation)
   * @TestData: hrManagerUser, payrollMenuItem
   * @ExpectedResult: false
   */
  it('should return false when HR user tries to access Finance-only menu (functional segregation)', () => {
    expect(checkMenuVisibility(hrManagerUser, payrollMenuItem)).toBe(false);
  });

  /**
   * @TestID: TC_FE_MENUVIS_05
   * @Priority: P1
   * @Category: Positive
   * @Description: Role fallback: Sales Manager sees People menu via Manager role
   * @Steps:
   * 1. Arrange: Sales Manager user (not HR), People menu with HR department + Manager role
   * 2. Act: Call checkMenuVisibility
   * 3. Assert: Returns true via role-based fallback
   * @TestData: salesManagerUser, peopleMenuItem
   * @ExpectedResult: true
   */
  it('should return true for Sales Manager via role-based fallback (not department match)', () => {
    expect(checkMenuVisibility(salesManagerUser, peopleMenuItem)).toBe(true);
  });

  /**
   * @TestID: TC_FE_MENUVIS_06
   * @Priority: P2
   * @Category: Negative
   * @Description: Null/undefined user returns false
   * @Steps:
   * 1. Arrange: User is null
   * 2. Act: Call checkMenuVisibility
   * 3. Assert: Returns false
   * @TestData: user=null, payrollMenuItem
   * @ExpectedResult: false
   */
  it('should return false when user is null', () => {
    expect(checkMenuVisibility(null, payrollMenuItem)).toBe(false);
  });
});
