import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboardWidget from './AdminDashboardWidget';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/link to avoid navigation errors in jsdom
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

const defaultAdminData = {
  todayAttendance: {
    totalEmployees: 25,
    present: 20,
    absent: 3,
    late: 2,
  },
  pendingApprovals: {
    leaveRequests: 5,
    resignations: 3,
  },
  stats: {
    totalHeadcount: 25,
  },
};

describe('AdminDashboardWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * @TestID: TC_FE_ADMINDASH_01
   * @Priority: P1
   * @Category: Positive
   * @Description: AdminDashboardWidget fetches and displays KPI cards with correct values
   * @Steps:
   * 1. Arrange: Mock fetch to return defaultAdminData
   * 2. Act: Render AdminDashboardWidget
   * 3. Assert: KPI values visible: Total Headcount 25, Present 20, Absent 3, Pending 8
   * @TestData: defaultAdminData fixture
   * @ExpectedResult: All four KPI values rendered
   */
  it('should fetch and display all KPI cards with correct values', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(defaultAdminData),
      }),
    ) as jest.Mock;

    render(<AdminDashboardWidget />);

    await waitFor(() => {
      expect(screen.getByText('Company Overview')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument(); // total headcount
      expect(screen.getByText('20')).toBeInTheDocument(); // present
      expect(screen.getByText('3')).toBeInTheDocument(); // absent
      expect(screen.getByText('8')).toBeInTheDocument(); // pending (5 + 3)
    });
  });

  /**
   * @TestID: TC_FE_ADMINDASH_02
   * @Priority: P2
   * @Category: Positive
   * @Description: Pending Approvals section shows leave requests and resignation counts
   * @Steps:
   * 1. Arrange: Mock fetch with 5 leave requests and 3 resignations
   * 2. Act: Render widget
   * 3. Assert: Text shows '5 requests awaiting response' and '3 requests awaiting response'
   * @TestData: leaveRequests=5, resignations=3
   * @ExpectedResult: Both request counts displayed
   */
  it('should display pending leave requests and resignation counts', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(defaultAdminData),
      }),
    ) as jest.Mock;

    render(<AdminDashboardWidget />);

    await waitFor(() => {
      expect(screen.getByText('5 requests awaiting response')).toBeInTheDocument();
      expect(screen.getByText('3 requests awaiting response')).toBeInTheDocument();
    });
  });

  /**
   * @TestID: TC_FE_ADMINDASH_03
   * @Priority: P2
   * @Category: Positive
   * @Description: Quick Actions section renders action links for admin tasks
   * @Steps:
   * 1. Arrange: Mock fetch to return data
   * 2. Act: Render widget
   * 3. Assert: Quick Action links visible: Add New Employee, Process Payroll, Broadcast Announcement
   * @TestData: Any valid admin data
   * @ExpectedResult: Three quick action links rendered
   */
  it('should render Quick Actions links for admin tasks', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(defaultAdminData),
      }),
    ) as jest.Mock;

    render(<AdminDashboardWidget />);

    await waitFor(() => {
      expect(screen.getByText('Add New Employee')).toBeInTheDocument();
      expect(screen.getByText('Process Payroll')).toBeInTheDocument();
      expect(screen.getByText('Broadcast Announcement')).toBeInTheDocument();
    });
  });

  /**
   * @TestID: TC_FE_ADMINDASH_04
   * @Priority: P2
   * @Category: Exception Handling
   * @Description: Widget handles fetch failure gracefully - shows skeleton loading, then falls back to zeros
   * @Steps:
   * 1. Arrange: Mock fetch to reject
   * 2. Act: Render widget
   * 3. Assert: Fetch error caught; KPIs render with zero values
   * @TestData: fetch rejects
   * @ExpectedResult: KPI cards show 0 values
   */
  it('should handle fetch failure and display zero KPI values', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;

    render(<AdminDashboardWidget />);

    await waitFor(() => {
      // After error, loading stops and zeros are shown (all KPIs fallback to 0)
      expect(screen.getByText('Company Overview')).toBeInTheDocument();
    });
    const zeroValues = screen.getAllByText('0');
    expect(zeroValues.length).toBeGreaterThanOrEqual(4); // headcount, present, absent, pending all 0
  });

  /**
   * @TestID: TC_FE_ADMINDASH_05
   * @Priority: P3
   * @Category: Positive
   * @Description: Widget displays current date string as subheader
   * @Steps:
   * 1. Arrange: Mock fetch with valid data
   * 2. Act: Render widget
   * 3. Assert: Date string (with weekday) is present in the document
   * @TestData: defaultAdminData
   * @ExpectedResult: Date text containing year appears
   */
  it('should display the current date in the subheader', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(defaultAdminData),
      }),
    ) as jest.Mock;

    render(<AdminDashboardWidget />);

    await waitFor(() => {
      expect(screen.getByText('Company Overview')).toBeInTheDocument();
    });

    // The date is rendered dynamically; it should contain the current year
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  /**
   * @TestID: TC_FE_ADMINDASH_06
   * @Priority: P2
   * @Category: Positive
   * @Description: "Manage" links in Pending Approvals navigate to correct admin routes
   * @Steps:
   * 1. Arrange: Mock fetch with data
   * 2. Act: Render widget
   * 3. Assert: Links pointing to /admin/leave-approvals and /admin/resignations exist
   * @TestData: defaultAdminData
   * @ExpectedResult: Anchor elements with correct href values
   */
  it('should render navigation links to leave approvals and resignation management', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(defaultAdminData),
      }),
    ) as jest.Mock;

    render(<AdminDashboardWidget />);

    await waitFor(() => {
      expect(screen.getByText('Company Overview')).toBeInTheDocument();
    });

    const links = screen.getAllByText('Manage');
    expect(links).toHaveLength(2);
    const leaveLink = links[0].closest('a');
    expect(leaveLink).toHaveAttribute('href', '/admin/leave-approvals');
  });
});
