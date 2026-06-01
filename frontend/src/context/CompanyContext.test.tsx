import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, act, renderHook } from '@testing-library/react';
import { CompanyProvider, useCompany } from './CompanyContext';

/**
 * TestComponent renders the company name and provides an update button.
 */
function TestComponent() {
  const { settings, loading, updateLogo, refreshSettings } = useCompany();
  if (loading) return <div data-testid="loading">Loading...</div>;
  return (
    <div>
      <span data-testid="company-name">{settings?.company_name || 'none'}</span>
      <span data-testid="base-currency">{settings?.base_currency || 'N/A'}</span>
      <span data-testid="logo-url">{settings?.logo_url || 'N/A'}</span>
      <button data-testid="update-logo-btn" onClick={() => updateLogo('/logos/new.png')}>
        Update Logo
      </button>
      <button data-testid="refresh-btn" onClick={() => refreshSettings()}>
        Refresh
      </button>
    </div>
  );
}

describe('CompanyContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clean up favicon link elements from previous tests
    document.querySelectorAll("link[rel~='icon']").forEach((el) => el.remove());
  });

  /**
   * @TestID: TC_FE_COMPANYCTX_01
   * @Priority: P1
   * @Category: Positive
   * @Description: CompanyProvider fetches and provides company settings successfully
   * @Steps:
   * 1. Arrange: Mock fetch to return company_name='Acme Corp' and base_currency='USD'
   * 2. Act: Render CompanyProvider with TestComponent
   * 3. Assert: Company name and currency displayed after loading
   * @TestData: fetch returns {company_name:'Acme Corp', base_currency:'USD'}
   * @ExpectedResult: screen shows 'Acme Corp' and 'USD'
   */
  it('should fetch and display company settings (name and base currency)', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ company_name: 'Acme Corp', base_currency: 'USD' }),
      }),
    ) as jest.Mock;

    render(
      <CompanyProvider>
        <TestComponent />
      </CompanyProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('company-name')).toHaveTextContent('Acme Corp');
      expect(screen.getByTestId('base-currency')).toHaveTextContent('USD');
    });
  });

  /**
   * @TestID: TC_FE_COMPANYCTX_02
   * @Priority: P2
   * @Category: Positive
   * @Description: updateLogo modifies settings.logo_url and persists existing fields
   * @Steps:
   * 1. Arrange: Mock fetch to return initial settings
   * 2. Act: Click "Update Logo" button to set a new logo URL
   * 3. Assert: logo_url updated, but company_name preserved
   * @TestData: Initial logo_url='', updateLogo('/logos/new.png')
   * @ExpectedResult: logo-url shows '/logos/new.png', company-name unchanged
   */
  it('should update logo_url via updateLogo while preserving other settings', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ company_name: 'Acme Corp', logo_url: '' }),
      }),
    ) as jest.Mock;

    render(
      <CompanyProvider>
        <TestComponent />
      </CompanyProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('company-name')).toHaveTextContent('Acme Corp');
    });

    act(() => {
      screen.getByTestId('update-logo-btn').click();
    });

    expect(screen.getByTestId('logo-url')).toHaveTextContent('/logos/new.png');
    expect(screen.getByTestId('company-name')).toHaveTextContent('Acme Corp');
  });

  /**
   * @TestID: TC_FE_COMPANYCTX_03
   * @Priority: P2
   * @Category: Exception Handling
   * @Description: CompanyProvider handles non-ok fetch response with null settings
   * @Steps:
   * 1. Arrange: Mock fetch to return ok:false (API error)
   * 2. Act: Render CompanyProvider
   * 3. Assert: Company name shows 'none' (settings remains null)
   * @TestData: fetch returns {ok:false}
   * @ExpectedResult: company name shows 'none'
   */
  it('should handle non-ok fetch response (settings remains null)', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      }),
    ) as jest.Mock;

    render(
      <CompanyProvider>
        <TestComponent />
      </CompanyProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('company-name')).toHaveTextContent('none');
    });
  });

  /**
   * @TestID: TC_FE_COMPANYCTX_04
   * @Priority: P2
   * @Category: Negative
   * @Description: useCompany throws error when used outside CompanyProvider
   * @Steps:
   * 1. Arrange: Render TestComponent without CompanyProvider
   * 2. Act: Attempt render
   * 3. Assert: Error thrown with expected message
   * @TestData: No CompanyProvider wrapper
   * @ExpectedResult: Error: 'useCompany must be used within a CompanyProvider'
   */
  it('should throw error when useCompany is used without CompanyProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow(
      'useCompany must be used within a CompanyProvider',
    );
    consoleError.mockRestore();
  });

  /**
   * @TestID: TC_FE_COMPANYCTX_05
   * @Priority: P2
   * @Category: Positive
   * @Description: refreshSettings re-fetches company profile and updates state
   * @Steps:
   * 1. Arrange: Initial fetch returns settings, then override fetch for refresh
   * 2. Act: Click Refresh button to trigger refreshSettings()
   * 3. Assert: Settings updated to new values from second fetch
   * @TestData: First fetch: 'Acme Corp', Second fetch: 'Renamed Corp'
   * @ExpectedResult: company-name changes to 'Renamed Corp'
   */
  it('should refresh settings with new data on refreshSettings call', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ company_name: 'Acme Corp', base_currency: 'USD' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ company_name: 'Renamed Corp', base_currency: 'EUR' }),
      }) as jest.Mock;

    render(
      <CompanyProvider>
        <TestComponent />
      </CompanyProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('company-name')).toHaveTextContent('Acme Corp');
    });

    act(() => {
      screen.getByTestId('refresh-btn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('company-name')).toHaveTextContent('Renamed Corp');
      expect(screen.getByTestId('base-currency')).toHaveTextContent('EUR');
    });
  });

  /**
   * @TestID: TC_FE_COMPANYCTX_06
   * @Priority: P3
   * @Category: Positive
   * @Description: updateLogo preserves null state when settings is null (prev is null)
   * @Steps:
   * 1. Arrange: Fetch fails, settings is null
   * 2. Act: Call updateLogo with a URL
   * 3. Assert: settings remains null, logo-url shows 'N/A'
   * @TestData: fetch fails, updateLogo('/logos/test.png')
   * @ExpectedResult: logo-url remains 'N/A'
   */
  it('should not crash calling updateLogo when settings is null', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 500 }),
    ) as jest.Mock;

    render(
      <CompanyProvider>
        <TestComponent />
      </CompanyProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('company-name')).toHaveTextContent('none');
    });

    act(() => {
      screen.getByTestId('update-logo-btn').click();
    });

    expect(screen.getByTestId('logo-url')).toHaveTextContent('N/A');
  });
});
