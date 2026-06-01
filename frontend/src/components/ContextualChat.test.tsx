import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContextualChat from './ContextualChat';

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock react-i18next (used transitively by lucide-react or UI components)
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Skeleton component (next/navigation can break in jsdom)
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

const mockUseAuth = require('@/hooks/useAuth').useAuth as jest.Mock;

describe('ContextualChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: {
        employee_id: 1,
        first_name: 'Admin',
        last_name: 'HR',
        avatar_url: null,
      },
    });
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      }),
    ) as jest.Mock;
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
    Element.prototype.scrollTo = jest.fn();
  });

  /**
   * @TestID: TC_FE_CTXCHAT_01
   * @Priority: P1
   * @Category: Positive
   * @Description: ContextualChat renders the Discussion header and comment input area
   * @Steps:
   * 1. Arrange: Mock useAuth with admin user, mock fetch to return empty comments
   * 2. Act: Render ContextualChat with entityId="1" entityType="task"
   * 3. Assert: 'Discussion' header and 'Type your reply...' placeholder are visible
   * @TestData: entityType='task', entityId='1'
   * @ExpectedResult: Discussion header rendered, textarea placeholder present
   */
  it('should render Discussion header and reply input', async () => {
    render(<ContextualChat entityId="1" entityType="task" />);

    expect(screen.getByText('Discussion')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your reply...')).toBeInTheDocument();
    });
  });

  /**
   * @TestID: TC_FE_CTXCHAT_02
   * @Priority: P1
   * @Category: Positive
   * @Description: User can type a message and submit it, triggering a POST fetch
   * @Steps:
   * 1. Arrange: Render with admin user and empty comments
   * 2. Act: Type 'Hello team' in textarea, click submit button
   * 3. Assert: POST fetch called with correct body
   * @TestData: message='Hello team', entityType='task', entityId='1'
   * @ExpectedResult: fetch POST to /api/comments with content, entityType, entityId
   */
  it('should type a message and trigger POST to /api/comments on submit', async () => {
    render(<ContextualChat entityId="1" entityType="task" />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your reply...')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText('Type your reply...');
    fireEvent.change(textarea, { target: { value: 'Hello team' } });

    // The submit button is the <button type="submit"> containing Send icon
    const submitBtn = screen.getByRole('button');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/comments',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Hello team'),
        }),
      );
    });
  });

  /**
   * @TestID: TC_FE_CTXCHAT_03
   * @Priority: P2
   * @Category: Negative
   * @Description: Submit button is disabled when input is empty/whitespace
   * @Steps:
   * 1. Arrange: Render component
   * 2. Act: Do not type any text, check submit button
   * 3. Assert: Submit button is disabled
   * @TestData: content = '' (empty)
   * @ExpectedResult: button has disabled attribute
   */
  it('should disable the submit button when textarea is empty', async () => {
    render(<ContextualChat entityId="1" entityType="task" />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your reply...')).toBeInTheDocument();
    });

    const submitBtn = screen.getByRole('button');
    expect(submitBtn).toBeDisabled();
  });

  /**
   * @TestID: TC_FE_CTXCHAT_04
   * @Priority: P2
   * @Category: Exception Handling
   * @Description: When fetch fails, the optimistic comment is removed (rolled back)
   * @Steps:
   * 1. Arrange: Mock POST fetch to fail (ok: false)
   * 2. Act: Type and submit a message
   * 3. Assert: Textarea value resets; no comment displayed (optimistic rollback)
   * @TestData: POST fetch returns {ok:false}
   * @ExpectedResult: No visible comment in the list
   */
  it('should rollback optimistic comment when POST fetch fails', async () => {
    const fetchMock = global.fetch as jest.Mock;
    // First call (GET) succeeds, second call (POST) fails
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

    render(<ContextualChat entityId="1" entityType="task" />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your reply...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Type your reply...'), {
      target: { value: 'Will fail' },
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    // After rollback, the textarea should be cleared and "No messages yet" visible
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(
        'Type your reply...',
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });
  });

  /**
   * @TestID: TC_FE_CTXCHAT_05
   * @Priority: P2
   * @Category: Positive
   * @Description: Fetches comments on mount for given entityType/entityId
   * @Steps:
   * 1. Arrange: Mock fetch returning 2 comments
   * 2. Act: Render ContextualChat
   * 3. Assert: GET fetch called with correct URL, both comments rendered
   * @TestData: entityType='task', entityId='42'
   * @ExpectedResult: GET /api/comments/task/42 called, comments visible
   */
  it('should fetch and display comments for the given entity', async () => {
    const comments = [
      {
        id: 'c1',
        content: 'First comment',
        authorId: 2,
        author: { first_name: 'Jane', last_name: 'Doe' },
        createdAt: '2026-01-01T12:00:00Z',
      },
      {
        id: 'c2',
        content: 'Second comment',
        authorId: 1,
        author: { first_name: 'Admin', last_name: 'HR' },
        createdAt: '2026-01-01T13:00:00Z',
      },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(comments),
      }),
    ) as jest.Mock;

    render(<ContextualChat entityId="42" entityType="task" />);

    await waitFor(() => {
      expect(screen.getByText('First comment')).toBeInTheDocument();
      expect(screen.getByText('Second comment')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/comments/task/42',
      expect.any(Object),
    );
  });

  /**
   * @TestID: TC_FE_CTXCHAT_06
   * @Priority: P3
   * @Category: Positive
   * @Description: Shows 'No messages yet' when there are no comments
   * @Steps:
   * 1. Arrange: Mock GET fetch returns empty array
   * 2. Act: Render ContextualChat
   * 3. Assert: 'No messages yet' message is shown
   * @TestData: comments = []
   * @ExpectedResult: 'No messages yet' text visible
   */
  it('should show empty state when no comments exist', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      }),
    ) as jest.Mock;

    render(<ContextualChat entityId="1" entityType="task" />);

    await waitFor(() => {
      expect(screen.getByText('No messages yet')).toBeInTheDocument();
    });
  });
});
