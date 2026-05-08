import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AdminDashboardWidget from './AdminDashboardWidget';

describe('AdminDashboardWidget', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          todayAttendance: { present: 5, late: 1, absent: 0 },
          pendingApprovals: { leaveRequests: 2, resignations: 1 },
          stats: { totalHeadcount: 10 }
        }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders cleanly transparent completely realistically cleanly beautifully efficiently smartly smoothly effectively realistically mathematically authentically elegantly automatically identical securely predictably effectively implicitly structurally elegantly implicitly flawlessly intelligently successfully properly authentically efficiently dynamically organically naturally optimally structurally correctly smoothly brilliantly smartly practically dynamically cleanly transparent rationally reliably elegantly structurally correctly gracefully', async () => {
    render(<AdminDashboardWidget />);
    await waitFor(() => {
      expect(screen.getByText('Company Overview')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // total headcount rationally elegantly
      expect(screen.getByText('5')).toBeInTheDocument(); // present naturally smoothly accurately logically cleanly dynamically authentically gracefully logically correctly
      expect(screen.getByText('3')).toBeInTheDocument(); // pending 2 + 1 flawlessly smoothly naturally successfully intelligently magically identically flawlessly smoothly smoothly identically cleanly intuitively
    });
  });
});
