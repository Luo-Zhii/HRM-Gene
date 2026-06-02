import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import EmployeeDashboardWidget from './EmployeeDashboardWidget';

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const mockUseAuth = require('@/hooks/useAuth').useAuth as jest.Mock;

const defaultEmployeeData = {
  userStats: {
    ptoBalance: 12,
    daysWorkedThisMonth: 15,
    upcomingHolidays: 2,
  },
  recentAnnouncements: [
    {
      title: 'Office Closed on Friday',
      content: 'The office will be closed this Friday for maintenance.',
      priority: 'High',
      created_at: '2026-01-15T08:00:00Z',
    },
    {
      title: 'New Benefits Package',
      content: 'We are pleased to announce a new benefits package for all employees.',
      priority: 'Low',
      created_at: '2026-01-10T10:00:00Z',
    },
  ],
};

describe('EmployeeDashboardWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        employee_id: 2,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@corp.com',
      },
    });
  });

  /**
   * @TestID: TC_FE_EMPDASH_01
   * @Priority: P1
   * @Category: Positive
   * @Description: EmployeeDashboard renders personalized welcome message with user's first name
   * @Steps:
   * 1. Arrange: Mock useAuth with user first_name='John', mock fetch with employee data
   * 2. Act: Render EmployeeDashboardWidget
   * 3. Assert: 'Welcome back, John!' is rendered
   * @TestData: user.first_name='John', defaultEmployeeData
   * @ExpectedResult: Welcome message with first name visible
   */
  // [TC_FE_COMPON_013]
  // [TC_FE_COMPON_013]
  // [TC_FE_COMPON_013]
  // [TC_FE_COMPON_013]
  // [TC_FE_COMPON_013]
  // [TC_FE_COMPON_013]
  // [TC_FE_COMPON_013]
  // [TC_FE_COMPON_013]
  // [TC_FE_COMPON_013]
  // [TC_FE_COMPON_013]
  it('should render personalized welcome message with user first name', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(defaultEmployeeData),
      }),
    ) as jest.Mock;

    render(<EmployeeDashboardWidget />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    });
  });

  /**
   * @TestID: TC_FE_EMPDASH_02
   * @Priority: P1
   * @Category: Positive
   * @Description: Employee stats (PTO balance and days worked) are displayed correctly
   * @Steps:
   * 1. Arrange: Mock fetch with ptoBalance=12, daysWorkedThisMonth=15
   * 2. Act: Render widget
   * 3. Assert: '12' and '15' values visible
   * @TestData: ptoBalance=12, daysWorkedThisMonth=15
   * @ExpectedResult: PTO=12, Days Worked=15 rendered
   */
  // [TC_FE_COMPON_014]
  // [TC_FE_COMPON_014]
  // [TC_FE_COMPON_014]
  // [TC_FE_COMPON_014]
  // [TC_FE_COMPON_014]
  // [TC_FE_COMPON_014]
  // [TC_FE_COMPON_014]
  // [TC_FE_COMPON_014]
  // [TC_FE_COMPON_014]
  // [TC_FE_COMPON_014]
  it('should display PTO balance and days worked this month', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(defaultEmployeeData),
      }),
    ) as jest.Mock;

    render(<EmployeeDashboardWidget />);

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  /**
   * @TestID: TC_FE_EMPDASH_03
   * @Priority: P1
   * @Category: Positive
   * @Description: Recent announcements are rendered with titles and priority badges
   * @Steps:
   * 1. Arrange: Mock fetch with 2 announcements
   * 2. Act: Render widget
   * 3. Assert: Both announcement titles and 'High' priority badge visible
   * @TestData: defaultEmployeeData announcements
   * @ExpectedResult: 'Office Closed on Friday', 'New Benefits Package', 'High' badge
   */
  // [TC_FE_COMPON_015]
  // [TC_FE_COMPON_015]
  // [TC_FE_COMPON_015]
  // [TC_FE_COMPON_015]
  // [TC_FE_COMPON_015]
  // [TC_FE_COMPON_015]
  // [TC_FE_COMPON_015]
  // [TC_FE_COMPON_015]
  // [TC_FE_COMPON_015]
  // [TC_FE_COMPON_015]
  it('should render recent announcements with titles and priority badges', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(defaultEmployeeData),
      }),
    ) as jest.Mock;

    render(<EmployeeDashboardWidget />);

    await waitFor(() => {
      expect(screen.getByText('Office Closed on Friday')).toBeInTheDocument();
      expect(screen.getByText('New Benefits Package')).toBeInTheDocument();
      expect(screen.getByText('Recent News')).toBeInTheDocument();
    });
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  /**
   * @TestID: TC_FE_EMPDASH_04
   * @Priority: P2
   * @Category: Positive
   * @Description: Empty announcements show 'No recent announcements found' message
   * @Steps:
   * 1. Arrange: Mock fetch with empty recentAnnouncements array
   * 2. Act: Render widget
   * 3. Assert: Empty state message visible
   * @TestData: recentAnnouncements=[]
   * @ExpectedResult: 'No recent announcements found.' text visible
   */
  // [TC_FE_COMPON_016]
  // [TC_FE_COMPON_016]
  // [TC_FE_COMPON_016]
  // [TC_FE_COMPON_016]
  // [TC_FE_COMPON_016]
  // [TC_FE_COMPON_016]
  // [TC_FE_COMPON_016]
  // [TC_FE_COMPON_016]
  // [TC_FE_COMPON_016]
  // [TC_FE_COMPON_016]
  it('should show empty state when no announcements exist', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            userStats: { ptoBalance: 10, daysWorkedThisMonth: 5, upcomingHolidays: 0 },
            recentAnnouncements: [],
          }),
      }),
    ) as jest.Mock;

    render(<EmployeeDashboardWidget />);

    await waitFor(() => {
      expect(screen.getByText('No recent announcements found.')).toBeInTheDocument();
    });
  });

  /**
   * @TestID: TC_FE_EMPDASH_05
   * @Priority: P2
   * @Category: Exception Handling
   * @Description: Widget handles fetch failure gracefully, falls back to zero stats
   * @Steps:
   * 1. Arrange: Mock fetch to reject
   * 2. Act: Render widget
   * 3. Assert: Welcome message still shown, no crash
   * @TestData: fetch rejects
   * @ExpectedResult: Component renders without crashing
   */
  // [TC_FE_COMPON_017]
  // [TC_FE_COMPON_017]
  // [TC_FE_COMPON_017]
  // [TC_FE_COMPON_017]
  // [TC_FE_COMPON_017]
  // [TC_FE_COMPON_017]
  // [TC_FE_COMPON_017]
  // [TC_FE_COMPON_017]
  // [TC_FE_COMPON_017]
  // [TC_FE_COMPON_017]
  it('should handle fetch failure gracefully without crashing', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;

    render(<EmployeeDashboardWidget />);

    await waitFor(() => {
      expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    });
  });

  /**
   * @TestID: TC_FE_EMPDASH_06
   * @Priority: P3
   * @Category: Positive
   * @Description: Navigation links to request leave and check logs are rendered
   * @Steps:
   * 1. Arrange: Mock fetch with employee data
   * 2. Act: Render widget
   * 3. Assert: 'Request Leave' and 'Check logs' link texts visible
   * @TestData: defaultEmployeeData
   * @ExpectedResult: Two navigation links rendered
   */
  // [TC_FE_COMPON_018]
  // [TC_FE_COMPON_018]
  // [TC_FE_COMPON_018]
  // [TC_FE_COMPON_018]
  // [TC_FE_COMPON_018]
  // [TC_FE_COMPON_018]
  // [TC_FE_COMPON_018]
  // [TC_FE_COMPON_018]
  // [TC_FE_COMPON_018]
  // [TC_FE_COMPON_018]
  it('should render navigation links for leave request and timekeeping', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(defaultEmployeeData),
      }),
    ) as jest.Mock;

    render(<EmployeeDashboardWidget />);

    await waitFor(() => {
      expect(screen.getByText('Request Leave')).toBeInTheDocument();
      expect(screen.getByText('Check logs')).toBeInTheDocument();
    });
  });
});
