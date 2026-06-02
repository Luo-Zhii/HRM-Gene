# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payroll/payroll.spec.ts >> [M09] Payroll - Admin >> TC_PAY_003 - Nút Generate/Calculate
- Location: specs/payroll/payroll.spec.ts:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button').filter({ hasText: /Calculate|Tính|Generate|Tạo/i }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('button').filter({ hasText: /Calculate|Tính|Generate|Tạo/i }).first()

```

```yaml
- alert
- complementary:
  - link "Logo":
    - /url: /dashboard
    - img "Logo"
  - navigation:
    - link "Dashboard":
      - /url: /dashboard
    - link "News Feed":
      - /url: /company-news
    - link "Staff Directory":
      - /url: /directory
    - button "My Workspace"
    - paragraph: Administration
    - button "People"
    - button "Attend & Leave"
    - button "Payroll"
    - link "Salary Configuration":
      - /url: /admin/payroll/config
    - link "Salary Adjustment":
      - /url: /admin/payroll/adjustment
    - link "Create Payroll":
      - /url: /admin/payroll/generate
    - link "Issue Payslips":
      - /url: /admin/payroll/issue
    - button "Performance"
    - button "Communication"
    - button "Analytics"
  - link "System Settings":
    - /url: /admin/settings
  - link "Payroll Settings":
    - /url: /admin/settings/payroll
- banner:
  - textbox "Search pages & features..."
  - button "🇬🇧 EN"
  - button "1"
  - button "System Director S":
    - paragraph: System
    - paragraph: Director
    - text: S
- main:
  - heading "Create Payroll" [level=1]
  - paragraph: Generate and manage monthly payroll for all employees
  - button "Detailed Report"
  - text: Month
  - combobox:
    - option "January"
    - option "February"
    - option "March"
    - option "April"
    - option "May"
    - option "June" [selected]
    - option "July"
    - option "August"
    - option "September"
    - option "October"
    - option "November"
    - option "December"
  - text: Year
  - combobox:
    - option "2024"
    - option "2025"
    - option "2026" [selected]
    - option "2027"
    - option "2028"
  - button "Automatic payroll calculation"
  - paragraph: Total Employees
  - paragraph: "40"
  - paragraph: Base Salary
  - paragraph: 1.702.942.943 ₫
  - paragraph: Commission / Bonus
  - paragraph: 140.654.083 ₫
  - paragraph: Deductions (Insurance 10.5%)
  - paragraph: 155.049.791 ₫
  - paragraph: Net Salary
  - paragraph: 1.688.547.234 ₫
  - heading "Preview payrollJune 2026" [level=2]
  - table:
    - rowgroup:
      - row "Employee Base Salary Commission / Bonus Deductions (Insurance 10.5%) Net Received Status Actions":
        - columnheader "Employee"
        - columnheader "Base Salary"
        - columnheader "Commission / Bonus"
        - columnheader "Deductions (Insurance 10.5%)"
        - columnheader "Net Received"
        - columnheader "Status"
        - columnheader "Actions"
    - rowgroup:
      - row "AD An Do 31 HR 95.796.351 ₫ 5.360.884 ₫ -9.756.810 ₫ 91.400.426 ₫ Paid":
        - cell "AD An Do 31 HR":
          - text: AD
          - paragraph: An Do 31
          - paragraph: HR
        - cell "95.796.351 ₫"
        - cell "5.360.884 ₫"
        - cell "-9.756.810 ₫"
        - cell "91.400.426 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "AV An Vu 17 Sales 18.064.524 ₫ 149.296 ₫ -724.584 ₫ 17.489.236 ₫ Paid":
        - cell "AV An Vu 17 Sales":
          - text: AV
          - paragraph: An Vu 17
          - paragraph: Sales
        - cell "18.064.524 ₫"
        - cell "149.296 ₫"
        - cell "-724.584 ₫"
        - cell "17.489.236 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "AV An Vu 3 Engineering 16.527.791 ₫ 3.006.495 ₫ -931.374 ₫ 18.602.913 ₫ Paid":
        - cell "AV An Vu 3 Engineering":
          - text: AV
          - paragraph: An Vu 3
          - paragraph: Engineering
        - cell "16.527.791 ₫"
        - cell "3.006.495 ₫"
        - cell "-931.374 ₫"
        - cell "18.602.913 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "BH Binh Hoang 39 Sales 11.980.049 ₫ 663.792 ₫ -1.073.868 ₫ 11.569.973 ₫ Paid":
        - cell "BH Binh Hoang 39 Sales":
          - text: BH
          - paragraph: Binh Hoang 39
          - paragraph: Sales
        - cell "11.980.049 ₫"
        - cell "663.792 ₫"
        - cell "-1.073.868 ₫"
        - cell "11.569.973 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "BB Binh Bui 29 HR 20.062.948 ₫ 262.676 ₫ -1.912.281 ₫ 18.413.343 ₫ Paid":
        - cell "BB Binh Bui 29 HR":
          - text: BB
          - paragraph: Binh Bui 29
          - paragraph: HR
        - cell "20.062.948 ₫"
        - cell "262.676 ₫"
        - cell "-1.912.281 ₫"
        - cell "18.413.343 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "BV Binh Vo 7 Sales 63.781.576 ₫ 363.759 ₫ -5.296.332 ₫ 58.849.003 ₫ Paid":
        - cell "BV Binh Vo 7 Sales":
          - text: BV
          - paragraph: Binh Vo 7
          - paragraph: Sales
        - cell "63.781.576 ₫"
        - cell "363.759 ₫"
        - cell "-5.296.332 ₫"
        - cell "58.849.003 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "BB Binh Bui 11 Marketing 7.309.607 ₫ 172.542 ₫ -628.053 ₫ 6.854.096 ₫ Paid":
        - cell "BB Binh Bui 11 Marketing":
          - text: BB
          - paragraph: Binh Bui 11
          - paragraph: Marketing
        - cell "7.309.607 ₫"
        - cell "172.542 ₫"
        - cell "-628.053 ₫"
        - cell "6.854.096 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "BB Binh Bui 24 Engineering 60.750.883 ₫ 14.390.253 ₫ -5.372.361 ₫ 69.768.775 ₫ Paid":
        - cell "BB Binh Bui 24 Engineering":
          - text: BB
          - paragraph: Binh Bui 24
          - paragraph: Engineering
        - cell "60.750.883 ₫"
        - cell "14.390.253 ₫"
        - cell "-5.372.361 ₫"
        - cell "69.768.775 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "BD Binh Do 13 Engineering 66.302.696 ₫ 16.527.544 ₫ -5.869.294 ₫ 76.960.947 ₫ Paid":
        - cell "BD Binh Do 13 Engineering":
          - text: BD
          - paragraph: Binh Do 13
          - paragraph: Engineering
        - cell "66.302.696 ₫"
        - cell "16.527.544 ₫"
        - cell "-5.869.294 ₫"
        - cell "76.960.947 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "BH Binh Hoang 22 HR 13.566.445 ₫ 0 ₫ -1.225.297 ₫ 12.341.148 ₫ Paid":
        - cell "BH Binh Hoang 22 HR":
          - text: BH
          - paragraph: Binh Hoang 22
          - paragraph: HR
        - cell "13.566.445 ₫"
        - cell "0 ₫"
        - cell "-1.225.297 ₫"
        - cell "12.341.148 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "CV Cuong Vu 9 Finance 59.423.670 ₫ 2.096.203 ₫ -5.086.785 ₫ 56.433.088 ₫ Paid":
        - cell "CV Cuong Vu 9 Finance":
          - text: CV
          - paragraph: Cuong Vu 9
          - paragraph: Finance
        - cell "59.423.670 ₫"
        - cell "2.096.203 ₫"
        - cell "-5.086.785 ₫"
        - cell "56.433.088 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "CV Cuong Vu 1 Marketing 17.748.300 ₫ 123.958 ₫ -902.416 ₫ 16.969.842 ₫ Paid":
        - cell "CV Cuong Vu 1 Marketing":
          - text: CV
          - paragraph: Cuong Vu 1
          - paragraph: Marketing
        - cell "17.748.300 ₫"
        - cell "123.958 ₫"
        - cell "-902.416 ₫"
        - cell "16.969.842 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "DL Dung Le 35 Sales 12.587.222 ₫ 250.740 ₫ -1.216.925 ₫ 11.621.037 ₫ Paid":
        - cell "DL Dung Le 35 Sales":
          - text: DL
          - paragraph: Dung Le 35
          - paragraph: Sales
        - cell "12.587.222 ₫"
        - cell "250.740 ₫"
        - cell "-1.216.925 ₫"
        - cell "11.621.037 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "DV Dung Vu 21 Marketing 22.580.518 ₫ 148.441 ₫ -2.161.301 ₫ 20.567.657 ₫ Paid":
        - cell "DV Dung Vu 21 Marketing":
          - text: DV
          - paragraph: Dung Vu 21
          - paragraph: Marketing
        - cell "22.580.518 ₫"
        - cell "148.441 ₫"
        - cell "-2.161.301 ₫"
        - cell "20.567.657 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "GP Giang Pham 37 HR 69.535.924 ₫ 819.118 ₫ -5.963.180 ₫ 64.391.862 ₫ Paid":
        - cell "GP Giang Pham 37 HR":
          - text: GP
          - paragraph: Giang Pham 37
          - paragraph: HR
        - cell "69.535.924 ₫"
        - cell "819.118 ₫"
        - cell "-5.963.180 ₫"
        - cell "64.391.862 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "GN Giang Nguyen 18 Marketing 101.594.617 ₫ 6.754.200 ₫ -9.834.114 ₫ 98.514.702 ₫ Paid":
        - cell "GN Giang Nguyen 18 Marketing":
          - text: GN
          - paragraph: Giang Nguyen 18
          - paragraph: Marketing
        - cell "101.594.617 ₫"
        - cell "6.754.200 ₫"
        - cell "-9.834.114 ₫"
        - cell "98.514.702 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "GV Giang Vo 6 Marketing 29.024.389 ₫ 774.238 ₫ -2.254.581 ₫ 27.544.046 ₫ Paid":
        - cell "GV Giang Vo 6 Marketing":
          - text: GV
          - paragraph: Giang Vo 6
          - paragraph: Marketing
        - cell "29.024.389 ₫"
        - cell "774.238 ₫"
        - cell "-2.254.581 ₫"
        - cell "27.544.046 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "GD Giang Dang 36 Finance 31.623.765 ₫ 177.737 ₫ -2.587.858 ₫ 29.213.645 ₫ Paid":
        - cell "GD Giang Dang 36 Finance":
          - text: GD
          - paragraph: Giang Dang 36
          - paragraph: Finance
        - cell "31.623.765 ₫"
        - cell "177.737 ₫"
        - cell "-2.587.858 ₫"
        - cell "29.213.645 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "GN Giang Nguyen 16 Finance 12.051.213 ₫ 76.910 ₫ -1.119.816 ₫ 11.008.308 ₫ Paid":
        - cell "GN Giang Nguyen 16 Finance":
          - text: GN
          - paragraph: Giang Nguyen 16
          - paragraph: Finance
        - cell "12.051.213 ₫"
        - cell "76.910 ₫"
        - cell "-1.119.816 ₫"
        - cell "11.008.308 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "HD Hoa Do 10 Sales 59.296.429 ₫ 675.766 ₫ -4.919.580 ₫ 55.052.615 ₫ Paid":
        - cell "HD Hoa Do 10 Sales":
          - text: HD
          - paragraph: Hoa Do 10
          - paragraph: Sales
        - cell "59.296.429 ₫"
        - cell "675.766 ₫"
        - cell "-4.919.580 ₫"
        - cell "55.052.615 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "HP Hoa Pham 27 Marketing 13.951.895 ₫ 628.759 ₫ -1.307.818 ₫ 13.272.835 ₫ Paid":
        - cell "HP Hoa Pham 27 Marketing":
          - text: HP
          - paragraph: Hoa Pham 27
          - paragraph: Marketing
        - cell "13.951.895 ₫"
        - cell "628.759 ₫"
        - cell "-1.307.818 ₫"
        - cell "13.272.835 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "HL Hung Le 19 Sales 75.209.005 ₫ 2.888.315 ₫ -7.008.979 ₫ 71.088.342 ₫ Paid":
        - cell "HL Hung Le 19 Sales":
          - text: HL
          - paragraph: Hung Le 19
          - paragraph: Sales
        - cell "75.209.005 ₫"
        - cell "2.888.315 ₫"
        - cell "-7.008.979 ₫"
        - cell "71.088.342 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "HL Hung Le 4 HR 26.604.398 ₫ 1.054.663 ₫ -2.559.315 ₫ 25.099.746 ₫ Paid":
        - cell "HL Hung Le 4 HR":
          - text: HL
          - paragraph: Hung Le 4
          - paragraph: HR
        - cell "26.604.398 ₫"
        - cell "1.054.663 ₫"
        - cell "-2.559.315 ₫"
        - cell "25.099.746 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "HV Hung Vu 25 Sales 97.631.571 ₫ 5.924.688 ₫ -9.584.829 ₫ 93.971.431 ₫ Paid":
        - cell "HV Hung Vu 25 Sales":
          - text: HV
          - paragraph: Hung Vu 25
          - paragraph: Sales
        - cell "97.631.571 ₫"
        - cell "5.924.688 ₫"
        - cell "-9.584.829 ₫"
        - cell "93.971.431 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "KD Khanh Do 20 Marketing 13.522.176 ₫ 270.511 ₫ -1.312.881 ₫ 12.479.806 ₫ Paid":
        - cell "KD Khanh Do 20 Marketing":
          - text: KD
          - paragraph: Khanh Do 20
          - paragraph: Marketing
        - cell "13.522.176 ₫"
        - cell "270.511 ₫"
        - cell "-1.312.881 ₫"
        - cell "12.479.806 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "KD Khanh Dang 5 HR 9.607.200 ₫ 312.871 ₫ -911.081 ₫ 9.008.990 ₫ Paid":
        - cell "KD Khanh Dang 5 HR":
          - text: KD
          - paragraph: Khanh Dang 5
          - paragraph: HR
        - cell "9.607.200 ₫"
        - cell "312.871 ₫"
        - cell "-911.081 ₫"
        - cell "9.008.990 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "KL Khanh Le 12 Engineering 10.766.246 ₫ 2.931.784 ₫ -992.716 ₫ 12.705.315 ₫ Paid":
        - cell "KL Khanh Le 12 Engineering":
          - text: KL
          - paragraph: Khanh Le 12
          - paragraph: Engineering
        - cell "10.766.246 ₫"
        - cell "2.931.784 ₫"
        - cell "-992.716 ₫"
        - cell "12.705.315 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "KH Khanh Hoang 23 Engineering 93.242.460 ₫ 29.112.312 ₫ -8.830.735 ₫ 113.524.037 ₫ Paid":
        - cell "KH Khanh Hoang 23 Engineering":
          - text: KH
          - paragraph: Khanh Hoang 23
          - paragraph: Engineering
        - cell "93.242.460 ₫"
        - cell "29.112.312 ₫"
        - cell "-8.830.735 ₫"
        - cell "113.524.037 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "KN Khanh Nguyen 32 Marketing 46.605.423 ₫ 1.852.661 ₫ -3.853.535 ₫ 44.604.548 ₫ Paid":
        - cell "KN Khanh Nguyen 32 Marketing":
          - text: KN
          - paragraph: Khanh Nguyen 32
          - paragraph: Marketing
        - cell "46.605.423 ₫"
        - cell "1.852.661 ₫"
        - cell "-3.853.535 ₫"
        - cell "44.604.548 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "KD Khanh Dang 38 Engineering 91.909.363 ₫ 19.924.062 ₫ -9.357.882 ₫ 102.475.543 ₫ Paid":
        - cell "KD Khanh Dang 38 Engineering":
          - text: KD
          - paragraph: Khanh Dang 38
          - paragraph: Engineering
        - cell "91.909.363 ₫"
        - cell "19.924.062 ₫"
        - cell "-9.357.882 ₫"
        - cell "102.475.543 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "LB Linh Bui 30 HR 94.564.622 ₫ 637.463 ₫ -9.281.468 ₫ 85.920.618 ₫ Paid":
        - cell "LB Linh Bui 30 HR":
          - text: LB
          - paragraph: Linh Bui 30
          - paragraph: HR
        - cell "94.564.622 ₫"
        - cell "637.463 ₫"
        - cell "-9.281.468 ₫"
        - cell "85.920.618 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "LD Linh Dang 2 Sales 24.065.442 ₫ 657.954 ₫ -2.394.953 ₫ 22.328.443 ₫ Paid":
        - cell "LD Linh Dang 2 Sales":
          - text: LD
          - paragraph: Linh Dang 2
          - paragraph: Sales
        - cell "24.065.442 ₫"
        - cell "657.954 ₫"
        - cell "-2.394.953 ₫"
        - cell "22.328.443 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "LL Linh Le 15 Marketing 9.901.688 ₫ 481.033 ₫ -875.479 ₫ 9.507.241 ₫ Paid":
        - cell "LL Linh Le 15 Marketing":
          - text: LL
          - paragraph: Linh Le 15
          - paragraph: Marketing
        - cell "9.901.688 ₫"
        - cell "481.033 ₫"
        - cell "-875.479 ₫"
        - cell "9.507.241 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "LP Linh Pham 14 Sales 20.001.075 ₫ 662.410 ₫ -1.071.632 ₫ 19.591.853 ₫ Paid":
        - cell "LP Linh Pham 14 Sales":
          - text: LP
          - paragraph: Linh Pham 14
          - paragraph: Sales
        - cell "20.001.075 ₫"
        - cell "662.410 ₫"
        - cell "-1.071.632 ₫"
        - cell "19.591.853 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "LP Linh Pham 8 HR 70.948.631 ₫ 4.770.287 ₫ -6.945.539 ₫ 68.773.380 ₫ Paid":
        - cell "LP Linh Pham 8 HR":
          - text: LP
          - paragraph: Linh Pham 8
          - paragraph: HR
        - cell "70.948.631 ₫"
        - cell "4.770.287 ₫"
        - cell "-6.945.539 ₫"
        - cell "68.773.380 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "MD Minh Dang 26 Sales 21.378.982 ₫ 270.747 ₫ -1.971.039 ₫ 19.678.690 ₫ Paid":
        - cell "MD Minh Dang 26 Sales":
          - text: MD
          - paragraph: Minh Dang 26
          - paragraph: Sales
        - cell "21.378.982 ₫"
        - cell "270.747 ₫"
        - cell "-1.971.039 ₫"
        - cell "19.678.690 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "ML Minh Le 28 Sales 11.646.678 ₫ 143.138 ₫ -1.042.047 ₫ 10.747.770 ₫ Paid":
        - cell "ML Minh Le 28 Sales":
          - text: ML
          - paragraph: Minh Le 28
          - paragraph: Sales
        - cell "11.646.678 ₫"
        - cell "143.138 ₫"
        - cell "-1.042.047 ₫"
        - cell "10.747.770 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "MH Minh Hoang 33 Engineering 44.879.490 ₫ 8.914.801 ₫ -3.708.557 ₫ 50.085.734 ₫ Paid":
        - cell "MH Minh Hoang 33 Engineering":
          - text: MH
          - paragraph: Minh Hoang 33
          - paragraph: Engineering
        - cell "44.879.490 ₫"
        - cell "8.914.801 ₫"
        - cell "-3.708.557 ₫"
        - cell "50.085.734 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "MP Minh Pham 34 Marketing 53.893.734 ₫ 2.941.436 ₫ -4.758.590 ₫ 52.076.580 ₫ Paid":
        - cell "MP Minh Pham 34 Marketing":
          - text: MP
          - paragraph: Minh Pham 34
          - paragraph: Marketing
        - cell "53.893.734 ₫"
        - cell "2.941.436 ₫"
        - cell "-4.758.590 ₫"
        - cell "52.076.580 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
      - row "SA System Admin HR 83.003.946 ₫ 3.479.631 ₫ -8.443.905 ₫ 78.039.672 ₫ Paid":
        - cell "SA System Admin HR":
          - text: SA
          - paragraph: System Admin
          - paragraph: HR
        - cell "83.003.946 ₫"
        - cell "3.479.631 ₫"
        - cell "-8.443.905 ₫"
        - cell "78.039.672 ₫"
        - cell "Paid"
        - cell:
          - button "payroll.view"
```

# Test source

```ts
  1   | import { test, expect } from '../../fixtures/auth';
  2   | import { Sidebar } from '../../pages/base';
  3   | 
  4   | test.describe('[M09] Payroll - Admin', () => {
  5   | 
  6   |   test('TC_PAY_001 - Admin → Create Payroll', async ({ adminPage: page }) => {
  7   |     await new Sidebar(page).navigateTo('Create Payroll');
  8   |     await page.waitForTimeout(1000);
  9   |   });
  10  | 
  11  |   test('TC_PAY_002 - Month/Year selectors', async ({ adminPage: page }) => {
  12  |     await page.goto('/admin/payroll/generate');
  13  |     await page.waitForLoadState('domcontentloaded');
  14  |     await expect(page.locator('select').first()).toBeVisible({ timeout: 10000 });
  15  |   });
  16  | 
  17  |   test('TC_PAY_003 - Nút Generate/Calculate', async ({ adminPage: page }) => {
  18  |     await page.goto('/admin/payroll/generate');
  19  |     await page.waitForLoadState('domcontentloaded');
> 20  |     await expect(page.getByRole('button').filter({ hasText: /Calculate|Tính|Generate|Tạo/i }).first()).toBeVisible();
      |                                                                                                        ^ Error: expect(locator).toBeVisible() failed
  21  |   });
  22  | 
  23  |   test('TC_PAY_004 - Bảng payslip hiển thị', async ({ adminPage: page }) => {
  24  |     await page.goto('/admin/payroll/generate');
  25  |     await page.waitForLoadState('domcontentloaded');
  26  |     await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  27  |   });
  28  | 
  29  |   test('TC_PAY_005 - Summary cards hiển thị', async ({ adminPage: page }) => {
  30  |     await page.goto('/admin/payroll/generate');
  31  |     await page.waitForLoadState('domcontentloaded');
  32  |     await page.waitForTimeout(500);
  33  |   });
  34  | 
  35  |   test('TC_PAY_006 - Employee bị chặn /admin/payroll', async ({ employeePage: page }) => {
  36  |     await page.goto('/admin/payroll/generate');
  37  |     await page.waitForTimeout(2000);
  38  |     const onPage = page.url().includes('/admin/payroll');
  39  |     if (onPage) {
  40  |       await expect(page.locator('body')).not.toBeEmpty();
  41  |     }
  42  |     expect(true).toBeTruthy();
  43  |   });
  44  | 
  45  |   test('TC_PAY_007 - Admin → Salary Configuration', async ({ adminPage: page }) => {
  46  |     await new Sidebar(page).navigateTo('Salary Configuration');
  47  |     await page.waitForTimeout(1000);
  48  |   });
  49  | 
  50  |   test('TC_PAY_008 - Salary config hiển thị danh sách', async ({ adminPage: page }) => {
  51  |     await page.goto('/admin/payroll/config');
  52  |     await page.waitForLoadState('domcontentloaded');
  53  |     await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  54  |   });
  55  | 
  56  |   test('TC_PAY_009 - Nút Edit config', async ({ adminPage: page }) => {
  57  |     await page.goto('/admin/payroll/config');
  58  |     await page.waitForLoadState('domcontentloaded');
  59  |     const btns = page.locator('button').filter({ hasText: /Edit|Sửa|Configure|Cấu hình/i });
  60  |     expect(await btns.count()).toBeGreaterThanOrEqual(0);
  61  |   });
  62  | 
  63  |   test('TC_PAY_010 - Admin → Salary Adjustment', async ({ adminPage: page }) => {
  64  |     await new Sidebar(page).navigateTo('Salary Adjustment');
  65  |     await page.waitForTimeout(1000);
  66  |   });
  67  | 
  68  |   test('TC_PAY_011 - Adjustments page load được', async ({ adminPage: page }) => {
  69  |     await page.goto('/admin/payroll/adjustment');
  70  |     await page.waitForLoadState('domcontentloaded');
  71  |     await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  72  |   });
  73  | 
  74  |   test('TC_PAY_012 - Có nút Add Adjustment', async ({ adminPage: page }) => {
  75  |     await page.goto('/admin/payroll/adjustment');
  76  |     await page.waitForLoadState('domcontentloaded');
  77  |     const btns = page.locator('button').filter({ hasText: /Add|Thêm|Create|Tạo/i });
  78  |     expect(await btns.count()).toBeGreaterThanOrEqual(0);
  79  |   });
  80  | 
  81  |   test('TC_PAY_013 - Có filter status', async ({ adminPage: page }) => {
  82  |     await page.goto('/admin/payroll/adjustment');
  83  |     await page.waitForLoadState('domcontentloaded');
  84  |     await expect(page.locator('select').first()).toBeVisible({ timeout: 10000 });
  85  |   });
  86  | 
  87  |   test('TC_PAY_014 - Admin → Issue Payslips', async ({ adminPage: page }) => {
  88  |     await new Sidebar(page).navigateTo('Issue Payslips');
  89  |     await page.waitForTimeout(1000);
  90  |   });
  91  | 
  92  |   test('TC_PAY_015 - Issue page load được', async ({ adminPage: page }) => {
  93  |     await page.goto('/admin/payroll/issue');
  94  |     await page.waitForLoadState('domcontentloaded');
  95  |     await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  96  |   });
  97  | });
  98  | 
  99  | test.describe('[M09] Payroll - Employee', () => {
  100 | 
  101 |   test('TC_PAY_016 - Employee → My Salary', async ({ employeePage: page }) => {
  102 |     await page.goto('/dashboard/salary');
  103 |     await page.waitForLoadState('domcontentloaded');
  104 |     await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  105 |   });
  106 | 
  107 |   test('TC_PAY_017 - Bảng lịch sử payslip', async ({ employeePage: page }) => {
  108 |     await page.goto('/dashboard/salary');
  109 |     await page.waitForLoadState('domcontentloaded');
  110 |     await expect(page.locator('table, [role="table"]').first()).toBeVisible({ timeout: 10000 });
  111 |   });
  112 | 
  113 |   test('TC_PAY_018 - Nút View payslip detail', async ({ employeePage: page }) => {
  114 |     await page.goto('/dashboard/salary');
  115 |     await page.waitForLoadState('domcontentloaded');
  116 |     const btn = page.locator('button').filter({ hasText: /View|Xem|Detail|Chi tiết/i }).first();
  117 |     if (await btn.isVisible()) {
  118 |       await btn.click();
  119 |       await page.waitForTimeout(500);
  120 |     }
```