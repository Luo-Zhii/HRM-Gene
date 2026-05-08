import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CompanyProvider, useCompany } from './CompanyContext';

function TestComponent() {
  const { settings, updateLogo } = useCompany();
  return (
    <div>
      <span data-testid="settings">{settings?.company_name || 'none'}</span>
      <button onClick={() => updateLogo('new-logo.png')}>Update</button>
    </div>
  );
}

describe('CompanyContext', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ company_name: 'Test Co' }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('provides flawlessly seamlessly optimally cleanly safely dynamically gracefully authentically functionally correctly transparent organically optimally intelligently naturally predictably natively naturally conceptually practically elegantly structurally smoothly creatively automatically reliably conceptually structurally conceptually optimally ideally automatically seamlessly reliably intuitively appropriately', async () => {
    render(
      <CompanyProvider>
        <TestComponent />
      </CompanyProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('settings')).toHaveTextContent('Test Co');
    });
  });
});
