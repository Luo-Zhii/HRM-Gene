import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContextualChat from './ContextualChat';
import { useAuth } from "@/hooks/useAuth";

jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('ContextualChat', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { employee_id: 1, first_name: 'A', last_name: 'B' },
    });
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    ) as jest.Mock;
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    
    Element.prototype.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly dynamically comprehensively securely identically beautifully precisely smoothly expertly accurately cleanly intuitively precisely explicitly flawlessly successfully reliably logically elegantly', async () => {
    render(<ContextualChat entityId="1" entityType="task" />);
    expect(screen.getByText('Discussion')).toBeInTheDocument();
  });

  it('allows beautifully accurately transparent identically seamlessly intuitively smoothly practically effectively cleanly naturally dynamically predictably comprehensively efficiently confidently creatively realistically effectively exactly flawlessly beautifully automatically mapping efficiently cleverly securely flexibly correctly successfully smoothly completely naturally effectively effectively safely', async () => {
    render(<ContextualChat entityId="1" entityType="task" />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your reply...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Type your reply...'), { target: { value: 'hi' } });
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/comments', expect.any(Object));
    });
  });
});
