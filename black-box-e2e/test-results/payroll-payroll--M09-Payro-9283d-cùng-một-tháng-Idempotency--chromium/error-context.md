# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payroll/payroll.spec.ts >> [M09] Payroll - E2E Workflows >> TC_PAY_022 - Tính lương 2 lần cho cùng một tháng (Idempotency)
- Location: specs/payroll/payroll.spec.ts:426:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Create Payroll/i })
Expected: visible
Error: strict mode violation: getByRole('heading', { name: /Create Payroll/i }) resolved to 2 elements:
    1) <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Payroll</h1> aka getByRole('heading', { name: 'Create Payroll', exact: true })
    2) <h3 class="text-sm font-bold">✅ Create Payroll June 2026</h3> aka getByRole('heading', { name: '✅ Create Payroll June' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /Create Payroll/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - link "Logo" [ref=e5] [cursor=pointer]:
        - /url: /dashboard
        - img "Logo" [ref=e6]
      - navigation [ref=e7]:
        - link "Dashboard" [ref=e8] [cursor=pointer]:
          - /url: /dashboard
          - img [ref=e9]
          - generic [ref=e14]: Dashboard
        - link "News Feed" [ref=e15] [cursor=pointer]:
          - /url: /company-news
          - img [ref=e16]
          - generic [ref=e19]: News Feed
        - link "Staff Directory" [ref=e20] [cursor=pointer]:
          - /url: /directory
          - img [ref=e21]
          - generic [ref=e26]: Staff Directory
        - button "My Workspace" [ref=e29] [cursor=pointer]:
          - generic [ref=e30]:
            - img [ref=e32]
            - generic [ref=e35]: My Workspace
          - img [ref=e36]
        - paragraph [ref=e39]: Administration
        - button "People" [ref=e41] [cursor=pointer]:
          - generic [ref=e42]:
            - img [ref=e44]
            - generic [ref=e48]: People
          - img [ref=e49]
        - button "Attend & Leave" [ref=e52] [cursor=pointer]:
          - generic [ref=e53]:
            - img [ref=e55]
            - generic [ref=e57]: Attend & Leave
          - img [ref=e58]
        - generic [ref=e60]:
          - button "Payroll" [ref=e61] [cursor=pointer]:
            - generic [ref=e62]:
              - img [ref=e64]
              - generic [ref=e67]: Payroll
            - img [ref=e68]
          - generic [ref=e70]:
            - link "Salary Configuration" [ref=e71] [cursor=pointer]:
              - /url: /admin/payroll/config
              - img [ref=e72]
              - generic [ref=e74]: Salary Configuration
            - link "Salary Adjustment" [ref=e75] [cursor=pointer]:
              - /url: /admin/payroll/adjustment
              - img [ref=e76]
              - generic [ref=e78]: Salary Adjustment
            - link "Create Payroll" [ref=e79] [cursor=pointer]:
              - /url: /admin/payroll/generate
              - img [ref=e80]
              - generic [ref=e83]: Create Payroll
            - link "Issue Payslips" [ref=e84] [cursor=pointer]:
              - /url: /admin/payroll/issue
              - img [ref=e85]
              - generic [ref=e88]: Issue Payslips
        - button "Performance" [ref=e90] [cursor=pointer]:
          - generic [ref=e91]:
            - img [ref=e93]
            - generic [ref=e96]: Performance
          - img [ref=e97]
        - button "Communication" [ref=e100] [cursor=pointer]:
          - generic [ref=e101]:
            - img [ref=e103]
            - generic [ref=e109]: Communication
          - img [ref=e110]
        - button "Analytics" [ref=e113] [cursor=pointer]:
          - generic [ref=e114]:
            - img [ref=e116]
            - generic [ref=e119]: Analytics
          - img [ref=e120]
      - generic [ref=e122]:
        - link "System Settings" [ref=e123] [cursor=pointer]:
          - /url: /admin/settings
          - img [ref=e124]
          - generic [ref=e135]: System Settings
        - link "Payroll Settings" [ref=e136] [cursor=pointer]:
          - /url: /admin/settings/payroll
          - img [ref=e137]
          - generic [ref=e140]: Payroll Settings
    - generic [ref=e141]:
      - banner [ref=e142]:
        - generic [ref=e143]:
          - generic [ref=e145]:
            - img [ref=e146]
            - textbox "Search pages & features..." [ref=e149]
          - button "🇬🇧 EN" [ref=e150] [cursor=pointer]:
            - img [ref=e151]
            - generic [ref=e154]: 🇬🇧
            - generic [ref=e155]: EN
          - button "9+" [ref=e157] [cursor=pointer]:
            - img [ref=e158]
            - generic [ref=e161]: 9+
          - button "System Director S" [ref=e163] [cursor=pointer]:
            - generic [ref=e164]:
              - paragraph [ref=e165]: System
              - paragraph [ref=e166]: Director
            - generic [ref=e168]: S
            - img [ref=e169]
      - main [ref=e171]:
        - generic [ref=e173]:
          - generic [ref=e174]:
            - generic [ref=e175]:
              - heading "Create Payroll" [level=1] [ref=e176]
              - paragraph [ref=e177]: Generate and manage monthly payroll for all employees
            - button "Detailed Report" [ref=e178] [cursor=pointer]:
              - img [ref=e179]
              - text: Detailed Report
          - generic [ref=e183]:
            - generic [ref=e184]:
              - generic [ref=e185]: Month
              - generic [ref=e186]:
                - combobox [ref=e187]:
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
                - img
            - generic [ref=e188]:
              - generic [ref=e189]: Year
              - generic [ref=e190]:
                - combobox [ref=e191]:
                  - option "2024"
                  - option "2025"
                  - option "2026" [selected]
                  - option "2027"
                  - option "2028"
                - img
            - button "Automatic payroll calculation" [ref=e192] [cursor=pointer]:
              - img [ref=e193]
              - text: Automatic payroll calculation
          - generic [ref=e195]:
            - generic [ref=e196]:
              - img [ref=e198]
              - generic [ref=e203]:
                - paragraph [ref=e204]: Total Employees
                - paragraph [ref=e205]: "40"
            - generic [ref=e206]:
              - img [ref=e208]
              - generic [ref=e211]:
                - paragraph [ref=e212]: Base Salary
                - paragraph [ref=e213]: 1.686.448.477 ₫
            - generic [ref=e214]:
              - img [ref=e216]
              - generic [ref=e219]:
                - paragraph [ref=e220]: Commission / Bonus
                - paragraph [ref=e221]: 53.376.883 ₫
            - generic [ref=e222]:
              - img [ref=e224]
              - generic [ref=e227]:
                - paragraph [ref=e228]: Deductions (Insurance 10.5%)
                - paragraph [ref=e229]: 413.540.426 ₫
            - generic [ref=e230]:
              - img [ref=e232]
              - generic [ref=e234]:
                - paragraph [ref=e235]: Net Salary
                - paragraph [ref=e236]: 1.326.284.933 ₫
          - generic [ref=e237]:
            - generic [ref=e238]:
              - heading "Preview payrollJune 2026" [level=2] [ref=e240]:
                - text: Preview payroll
                - generic [ref=e241]: June 2026
              - button "Approve payroll (40)" [ref=e242] [cursor=pointer]:
                - img [ref=e243]
                - text: Approve payroll (40)
            - table [ref=e247]:
              - rowgroup [ref=e248]:
                - row "Employee Base Salary Commission / Bonus Deductions (Insurance 10.5%) Net Received Status Actions" [ref=e249]:
                  - columnheader "Employee" [ref=e250]
                  - columnheader "Base Salary" [ref=e251]
                  - columnheader "Commission / Bonus" [ref=e252]
                  - columnheader "Deductions (Insurance 10.5%)" [ref=e253]
                  - columnheader "Net Received" [ref=e254]
                  - columnheader "Status" [ref=e255]
                  - columnheader "Actions" [ref=e256]
              - rowgroup [ref=e257]:
                - row "AP An Pham 33 Engineering 82.806.943 ₫ 3.748.422 ₫ -22.107.790 ₫ 64.447.575 ₫ Pending approval Approve" [ref=e258]:
                  - cell "AP An Pham 33 Engineering" [ref=e259]:
                    - generic [ref=e260]:
                      - generic [ref=e261]: AP
                      - generic [ref=e262]:
                        - paragraph [ref=e263]: An Pham 33
                        - paragraph [ref=e264]: Engineering
                  - cell "82.806.943 ₫" [ref=e265]
                  - cell "3.748.422 ₫" [ref=e266]
                  - cell "-22.107.790 ₫" [ref=e267]:
                    - generic [ref=e268]: "-22.107.790 ₫"
                  - cell "64.447.575 ₫" [ref=e269]
                  - cell "Pending approval" [ref=e270]:
                    - generic [ref=e271]: Pending approval
                  - cell "Approve" [ref=e272]:
                    - generic [ref=e273]:
                      - button "payroll.view" [ref=e274] [cursor=pointer]:
                        - img [ref=e275]
                      - button "Approve" [ref=e278] [cursor=pointer]
                - row "BD Binh Dang 39 Finance 50.688.224 ₫ 997.340 ₫ -11.970.771 ₫ 39.714.794 ₫ Pending approval Approve" [ref=e279]:
                  - cell "BD Binh Dang 39 Finance" [ref=e280]:
                    - generic [ref=e281]:
                      - generic [ref=e282]: BD
                      - generic [ref=e283]:
                        - paragraph [ref=e284]: Binh Dang 39
                        - paragraph [ref=e285]: Finance
                  - cell "50.688.224 ₫" [ref=e286]
                  - cell "997.340 ₫" [ref=e287]
                  - cell "-11.970.771 ₫" [ref=e288]:
                    - generic [ref=e289]: "-11.970.771 ₫"
                  - cell "39.714.794 ₫" [ref=e290]
                  - cell "Pending approval" [ref=e291]:
                    - generic [ref=e292]: Pending approval
                  - cell "Approve" [ref=e293]:
                    - generic [ref=e294]:
                      - button "payroll.view" [ref=e295] [cursor=pointer]:
                        - img [ref=e296]
                      - button "Approve" [ref=e299] [cursor=pointer]
                - row "BP Binh Pham 37 Marketing 78.400.619 ₫ 1.926.943 ₫ -23.359.008 ₫ 56.968.554 ₫ Pending approval Approve" [ref=e300]:
                  - cell "BP Binh Pham 37 Marketing" [ref=e301]:
                    - generic [ref=e302]:
                      - generic [ref=e303]: BP
                      - generic [ref=e304]:
                        - paragraph [ref=e305]: Binh Pham 37
                        - paragraph [ref=e306]: Marketing
                  - cell "78.400.619 ₫" [ref=e307]
                  - cell "1.926.943 ₫" [ref=e308]
                  - cell "-23.359.008 ₫" [ref=e309]:
                    - generic [ref=e310]: "-23.359.008 ₫"
                  - cell "56.968.554 ₫" [ref=e311]
                  - cell "Pending approval" [ref=e312]:
                    - generic [ref=e313]: Pending approval
                  - cell "Approve" [ref=e314]:
                    - generic [ref=e315]:
                      - button "payroll.view" [ref=e316] [cursor=pointer]:
                        - img [ref=e317]
                      - button "Approve" [ref=e320] [cursor=pointer]
                - row "CP Cuong Pham 34 Sales 16.910.962 ₫ 401.436 ₫ -2.498.443 ₫ 14.813.954 ₫ Pending approval Approve" [ref=e321]:
                  - cell "CP Cuong Pham 34 Sales" [ref=e322]:
                    - generic [ref=e323]:
                      - generic [ref=e324]: CP
                      - generic [ref=e325]:
                        - paragraph [ref=e326]: Cuong Pham 34
                        - paragraph [ref=e327]: Sales
                  - cell "16.910.962 ₫" [ref=e328]
                  - cell "401.436 ₫" [ref=e329]
                  - cell "-2.498.443 ₫" [ref=e330]:
                    - generic [ref=e331]: "-2.498.443 ₫"
                  - cell "14.813.954 ₫" [ref=e332]
                  - cell "Pending approval" [ref=e333]:
                    - generic [ref=e334]: Pending approval
                  - cell "Approve" [ref=e335]:
                    - generic [ref=e336]:
                      - button "payroll.view" [ref=e337] [cursor=pointer]:
                        - img [ref=e338]
                      - button "Approve" [ref=e341] [cursor=pointer]
                - row "DT Dung Tran 20 Finance 19.196.950 ₫ 885.947 ₫ -2.317.095 ₫ 17.765.802 ₫ Pending approval Approve" [ref=e342]:
                  - cell "DT Dung Tran 20 Finance" [ref=e343]:
                    - generic [ref=e344]:
                      - generic [ref=e345]: DT
                      - generic [ref=e346]:
                        - paragraph [ref=e347]: Dung Tran 20
                        - paragraph [ref=e348]: Finance
                  - cell "19.196.950 ₫" [ref=e349]
                  - cell "885.947 ₫" [ref=e350]
                  - cell "-2.317.095 ₫" [ref=e351]:
                    - generic [ref=e352]: "-2.317.095 ₫"
                  - cell "17.765.802 ₫" [ref=e353]
                  - cell "Pending approval" [ref=e354]:
                    - generic [ref=e355]: Pending approval
                  - cell "Approve" [ref=e356]:
                    - generic [ref=e357]:
                      - button "payroll.view" [ref=e358] [cursor=pointer]:
                        - img [ref=e359]
                      - button "Approve" [ref=e362] [cursor=pointer]
                - row "DN Dung Nguyen 25 Finance 12.661.932 ₫ 570.276 ₫ -1.212.811 ₫ 12.019.397 ₫ Pending approval Approve" [ref=e363]:
                  - cell "DN Dung Nguyen 25 Finance" [ref=e364]:
                    - generic [ref=e365]:
                      - generic [ref=e366]: DN
                      - generic [ref=e367]:
                        - paragraph [ref=e368]: Dung Nguyen 25
                        - paragraph [ref=e369]: Finance
                  - cell "12.661.932 ₫" [ref=e370]
                  - cell "570.276 ₫" [ref=e371]
                  - cell "-1.212.811 ₫" [ref=e372]:
                    - generic [ref=e373]: "-1.212.811 ₫"
                  - cell "12.019.397 ₫" [ref=e374]
                  - cell "Pending approval" [ref=e375]:
                    - generic [ref=e376]: Pending approval
                  - cell "Approve" [ref=e377]:
                    - generic [ref=e378]:
                      - button "payroll.view" [ref=e379] [cursor=pointer]:
                        - img [ref=e380]
                      - button "Approve" [ref=e383] [cursor=pointer]
                - row "DD Dung Do 17 Engineering 42.430.174 ₫ 1.743.094 ₫ -7.767.052 ₫ 36.406.217 ₫ Pending approval Approve" [ref=e384]:
                  - cell "DD Dung Do 17 Engineering" [ref=e385]:
                    - generic [ref=e386]:
                      - generic [ref=e387]: DD
                      - generic [ref=e388]:
                        - paragraph [ref=e389]: Dung Do 17
                        - paragraph [ref=e390]: Engineering
                  - cell "42.430.174 ₫" [ref=e391]
                  - cell "1.743.094 ₫" [ref=e392]
                  - cell "-7.767.052 ₫" [ref=e393]:
                    - generic [ref=e394]: "-7.767.052 ₫"
                  - cell "36.406.217 ₫" [ref=e395]
                  - cell "Pending approval" [ref=e396]:
                    - generic [ref=e397]: Pending approval
                  - cell "Approve" [ref=e398]:
                    - generic [ref=e399]:
                      - button "payroll.view" [ref=e400] [cursor=pointer]:
                        - img [ref=e401]
                      - button "Approve" [ref=e404] [cursor=pointer]
                - row "DB Dung Bui 2 Engineering 18.090.989 ₫ 0 ₫ -3.982.641 ₫ 14.108.348 ₫ Pending approval Approve" [ref=e405]:
                  - cell "DB Dung Bui 2 Engineering" [ref=e406]:
                    - generic [ref=e407]:
                      - generic [ref=e408]: DB
                      - generic [ref=e409]:
                        - paragraph [ref=e410]: Dung Bui 2
                        - paragraph [ref=e411]: Engineering
                  - cell "18.090.989 ₫" [ref=e412]
                  - cell "0 ₫" [ref=e413]
                  - cell "-3.982.641 ₫" [ref=e414]:
                    - generic [ref=e415]: "-3.982.641 ₫"
                  - cell "14.108.348 ₫" [ref=e416]
                  - cell "Pending approval" [ref=e417]:
                    - generic [ref=e418]: Pending approval
                  - cell "Approve" [ref=e419]:
                    - generic [ref=e420]:
                      - button "payroll.view" [ref=e421] [cursor=pointer]:
                        - img [ref=e422]
                      - button "Approve" [ref=e425] [cursor=pointer]
                - row "DD Dung Dang 26 Marketing 57.177.215 ₫ 2.407.418 ₫ -12.826.672 ₫ 46.757.962 ₫ Pending approval Approve" [ref=e426]:
                  - cell "DD Dung Dang 26 Marketing" [ref=e427]:
                    - generic [ref=e428]:
                      - generic [ref=e429]: DD
                      - generic [ref=e430]:
                        - paragraph [ref=e431]: Dung Dang 26
                        - paragraph [ref=e432]: Marketing
                  - cell "57.177.215 ₫" [ref=e433]
                  - cell "2.407.418 ₫" [ref=e434]
                  - cell "-12.826.672 ₫" [ref=e435]:
                    - generic [ref=e436]: "-12.826.672 ₫"
                  - cell "46.757.962 ₫" [ref=e437]
                  - cell "Pending approval" [ref=e438]:
                    - generic [ref=e439]: Pending approval
                  - cell "Approve" [ref=e440]:
                    - generic [ref=e441]:
                      - button "payroll.view" [ref=e442] [cursor=pointer]:
                        - img [ref=e443]
                      - button "Approve" [ref=e446] [cursor=pointer]
                - row "GT Giang Tran 1 Engineering 18.233.675 ₫ 2.000.000 ₫ -3.968.525 ₫ 16.265.150 ₫ Pending approval Approve" [ref=e447]:
                  - cell "GT Giang Tran 1 Engineering" [ref=e448]:
                    - generic [ref=e449]:
                      - generic [ref=e450]: GT
                      - generic [ref=e451]:
                        - paragraph [ref=e452]: Giang Tran 1
                        - paragraph [ref=e453]: Engineering
                  - cell "18.233.675 ₫" [ref=e454]
                  - cell "2.000.000 ₫" [ref=e455]
                  - cell "-3.968.525 ₫" [ref=e456]:
                    - generic [ref=e457]: "-3.968.525 ₫"
                  - cell "16.265.150 ₫" [ref=e458]
                  - cell "Pending approval" [ref=e459]:
                    - generic [ref=e460]: Pending approval
                  - cell "Approve" [ref=e461]:
                    - generic [ref=e462]:
                      - button "payroll.view" [ref=e463] [cursor=pointer]:
                        - img [ref=e464]
                      - button "Approve" [ref=e467] [cursor=pointer]
                - row "GD Giang Do 4 Sales 54.913.907 ₫ 1.170.084 ₫ -13.324.393 ₫ 42.759.598 ₫ Pending approval Approve" [ref=e468]:
                  - cell "GD Giang Do 4 Sales" [ref=e469]:
                    - generic [ref=e470]:
                      - generic [ref=e471]: GD
                      - generic [ref=e472]:
                        - paragraph [ref=e473]: Giang Do 4
                        - paragraph [ref=e474]: Sales
                  - cell "54.913.907 ₫" [ref=e475]
                  - cell "1.170.084 ₫" [ref=e476]
                  - cell "-13.324.393 ₫" [ref=e477]:
                    - generic [ref=e478]: "-13.324.393 ₫"
                  - cell "42.759.598 ₫" [ref=e479]
                  - cell "Pending approval" [ref=e480]:
                    - generic [ref=e481]: Pending approval
                  - cell "Approve" [ref=e482]:
                    - generic [ref=e483]:
                      - button "payroll.view" [ref=e484] [cursor=pointer]:
                        - img [ref=e485]
                      - button "Approve" [ref=e488] [cursor=pointer]
                - row "GN Giang Nguyen 21 Engineering 7.634.177 ₫ 364.855 ₫ -766.195 ₫ 7.232.837 ₫ Pending approval Approve" [ref=e489]:
                  - cell "GN Giang Nguyen 21 Engineering" [ref=e490]:
                    - generic [ref=e491]:
                      - generic [ref=e492]: GN
                      - generic [ref=e493]:
                        - paragraph [ref=e494]: Giang Nguyen 21
                        - paragraph [ref=e495]: Engineering
                  - cell "7.634.177 ₫" [ref=e496]
                  - cell "364.855 ₫" [ref=e497]
                  - cell "-766.195 ₫" [ref=e498]:
                    - generic [ref=e499]: "-766.195 ₫"
                  - cell "7.232.837 ₫" [ref=e500]
                  - cell "Pending approval" [ref=e501]:
                    - generic [ref=e502]: Pending approval
                  - cell "Approve" [ref=e503]:
                    - generic [ref=e504]:
                      - button "payroll.view" [ref=e505] [cursor=pointer]:
                        - img [ref=e506]
                      - button "Approve" [ref=e509] [cursor=pointer]
                - row "GH Giang Hoang 22 Sales 61.321.042 ₫ 1.094.978 ₫ -15.992.722 ₫ 46.423.299 ₫ Pending approval Approve" [ref=e510]:
                  - cell "GH Giang Hoang 22 Sales" [ref=e511]:
                    - generic [ref=e512]:
                      - generic [ref=e513]: GH
                      - generic [ref=e514]:
                        - paragraph [ref=e515]: Giang Hoang 22
                        - paragraph [ref=e516]: Sales
                  - cell "61.321.042 ₫" [ref=e517]
                  - cell "1.094.978 ₫" [ref=e518]
                  - cell "-15.992.722 ₫" [ref=e519]:
                    - generic [ref=e520]: "-15.992.722 ₫"
                  - cell "46.423.299 ₫" [ref=e521]
                  - cell "Pending approval" [ref=e522]:
                    - generic [ref=e523]: Pending approval
                  - cell "Approve" [ref=e524]:
                    - generic [ref=e525]:
                      - button "payroll.view" [ref=e526] [cursor=pointer]:
                        - img [ref=e527]
                      - button "Approve" [ref=e530] [cursor=pointer]
                - row "GB Giang Bui 24 HR 37.296.390 ₫ 1.528.499 ₫ -6.336.855 ₫ 32.488.033 ₫ Pending approval Approve" [ref=e531]:
                  - cell "GB Giang Bui 24 HR" [ref=e532]:
                    - generic [ref=e533]:
                      - generic [ref=e534]: GB
                      - generic [ref=e535]:
                        - paragraph [ref=e536]: Giang Bui 24
                        - paragraph [ref=e537]: HR
                  - cell "37.296.390 ₫" [ref=e538]
                  - cell "1.528.499 ₫" [ref=e539]
                  - cell "-6.336.855 ₫" [ref=e540]:
                    - generic [ref=e541]: "-6.336.855 ₫"
                  - cell "32.488.033 ₫" [ref=e542]
                  - cell "Pending approval" [ref=e543]:
                    - generic [ref=e544]: Pending approval
                  - cell "Approve" [ref=e545]:
                    - generic [ref=e546]:
                      - button "payroll.view" [ref=e547] [cursor=pointer]:
                        - img [ref=e548]
                      - button "Approve" [ref=e551] [cursor=pointer]
                - row "GB Giang Bui 36 Sales 23.006.433 ₫ 1.064.682 ₫ -3.001.625 ₫ 21.069.490 ₫ Pending approval Approve" [ref=e552]:
                  - cell "GB Giang Bui 36 Sales" [ref=e553]:
                    - generic [ref=e554]:
                      - generic [ref=e555]: GB
                      - generic [ref=e556]:
                        - paragraph [ref=e557]: Giang Bui 36
                        - paragraph [ref=e558]: Sales
                  - cell "23.006.433 ₫" [ref=e559]
                  - cell "1.064.682 ₫" [ref=e560]
                  - cell "-3.001.625 ₫" [ref=e561]:
                    - generic [ref=e562]: "-3.001.625 ₫"
                  - cell "21.069.490 ₫" [ref=e563]
                  - cell "Pending approval" [ref=e564]:
                    - generic [ref=e565]: Pending approval
                  - cell "Approve" [ref=e566]:
                    - generic [ref=e567]:
                      - button "payroll.view" [ref=e568] [cursor=pointer]:
                        - img [ref=e569]
                      - button "Approve" [ref=e572] [cursor=pointer]
                - row "HH Hoa Hoang 3 Sales 6.372.506 ₫ 146.462 ₫ -931.263 ₫ 5.587.705 ₫ Pending approval Approve" [ref=e573]:
                  - cell "HH Hoa Hoang 3 Sales" [ref=e574]:
                    - generic [ref=e575]:
                      - generic [ref=e576]: HH
                      - generic [ref=e577]:
                        - paragraph [ref=e578]: Hoa Hoang 3
                        - paragraph [ref=e579]: Sales
                  - cell "6.372.506 ₫" [ref=e580]
                  - cell "146.462 ₫" [ref=e581]
                  - cell "-931.263 ₫" [ref=e582]:
                    - generic [ref=e583]: "-931.263 ₫"
                  - cell "5.587.705 ₫" [ref=e584]
                  - cell "Pending approval" [ref=e585]:
                    - generic [ref=e586]: Pending approval
                  - cell "Approve" [ref=e587]:
                    - generic [ref=e588]:
                      - button "payroll.view" [ref=e589] [cursor=pointer]:
                        - img [ref=e590]
                      - button "Approve" [ref=e593] [cursor=pointer]
                - row "HN Hoa Nguyen 10 Marketing 57.405.240 ₫ 0 ₫ -16.332.263 ₫ 41.072.977 ₫ Pending approval Approve" [ref=e594]:
                  - cell "HN Hoa Nguyen 10 Marketing" [ref=e595]:
                    - generic [ref=e596]:
                      - generic [ref=e597]: HN
                      - generic [ref=e598]:
                        - paragraph [ref=e599]: Hoa Nguyen 10
                        - paragraph [ref=e600]: Marketing
                  - cell "57.405.240 ₫" [ref=e601]
                  - cell "0 ₫" [ref=e602]
                  - cell "-16.332.263 ₫" [ref=e603]:
                    - generic [ref=e604]: "-16.332.263 ₫"
                  - cell "41.072.977 ₫" [ref=e605]
                  - cell "Pending approval" [ref=e606]:
                    - generic [ref=e607]: Pending approval
                  - cell "Approve" [ref=e608]:
                    - generic [ref=e609]:
                      - button "payroll.view" [ref=e610] [cursor=pointer]:
                        - img [ref=e611]
                      - button "Approve" [ref=e614] [cursor=pointer]
                - row "HP Hoa Pham 35 HR 45.116.902 ₫ 1.855.401 ₫ -8.515.534 ₫ 38.456.769 ₫ Pending approval Approve" [ref=e615]:
                  - cell "HP Hoa Pham 35 HR" [ref=e616]:
                    - generic [ref=e617]:
                      - generic [ref=e618]: HP
                      - generic [ref=e619]:
                        - paragraph [ref=e620]: Hoa Pham 35
                        - paragraph [ref=e621]: HR
                  - cell "45.116.902 ₫" [ref=e622]
                  - cell "1.855.401 ₫" [ref=e623]
                  - cell "-8.515.534 ₫" [ref=e624]:
                    - generic [ref=e625]: "-8.515.534 ₫"
                  - cell "38.456.769 ₫" [ref=e626]
                  - cell "Pending approval" [ref=e627]:
                    - generic [ref=e628]: Pending approval
                  - cell "Approve" [ref=e629]:
                    - generic [ref=e630]:
                      - button "payroll.view" [ref=e631] [cursor=pointer]:
                        - img [ref=e632]
                      - button "Approve" [ref=e635] [cursor=pointer]
                - row "KH Khanh Hoang 15 HR 62.972.525 ₫ 0 ₫ -18.217.903 ₫ 44.754.622 ₫ Pending approval Approve" [ref=e636]:
                  - cell "KH Khanh Hoang 15 HR" [ref=e637]:
                    - generic [ref=e638]:
                      - generic [ref=e639]: KH
                      - generic [ref=e640]:
                        - paragraph [ref=e641]: Khanh Hoang 15
                        - paragraph [ref=e642]: HR
                  - cell "62.972.525 ₫" [ref=e643]
                  - cell "0 ₫" [ref=e644]
                  - cell "-18.217.903 ₫" [ref=e645]:
                    - generic [ref=e646]: "-18.217.903 ₫"
                  - cell "44.754.622 ₫" [ref=e647]
                  - cell "Pending approval" [ref=e648]:
                    - generic [ref=e649]: Pending approval
                  - cell "Approve" [ref=e650]:
                    - generic [ref=e651]:
                      - button "payroll.view" [ref=e652] [cursor=pointer]:
                        - img [ref=e653]
                      - button "Approve" [ref=e656] [cursor=pointer]
                - row "KB Khanh Bui 11 Engineering 99.689.265 ₫ 2.455.096 ₫ -32.274.511 ₫ 69.869.851 ₫ Pending approval Approve" [ref=e657]:
                  - cell "KB Khanh Bui 11 Engineering" [ref=e658]:
                    - generic [ref=e659]:
                      - generic [ref=e660]: KB
                      - generic [ref=e661]:
                        - paragraph [ref=e662]: Khanh Bui 11
                        - paragraph [ref=e663]: Engineering
                  - cell "99.689.265 ₫" [ref=e664]
                  - cell "2.455.096 ₫" [ref=e665]
                  - cell "-32.274.511 ₫" [ref=e666]:
                    - generic [ref=e667]: "-32.274.511 ₫"
                  - cell "69.869.851 ₫" [ref=e668]
                  - cell "Pending approval" [ref=e669]:
                    - generic [ref=e670]: Pending approval
                  - cell "Approve" [ref=e671]:
                    - generic [ref=e672]:
                      - button "payroll.view" [ref=e673] [cursor=pointer]:
                        - img [ref=e674]
                      - button "Approve" [ref=e677] [cursor=pointer]
                - row "KV Khanh Vu 28 Engineering 40.043.200 ₫ 0 ₫ -9.665.095 ₫ 30.378.105 ₫ Pending approval Approve" [ref=e678]:
                  - cell "KV Khanh Vu 28 Engineering" [ref=e679]:
                    - generic [ref=e680]:
                      - generic [ref=e681]: KV
                      - generic [ref=e682]:
                        - paragraph [ref=e683]: Khanh Vu 28
                        - paragraph [ref=e684]: Engineering
                  - cell "40.043.200 ₫" [ref=e685]
                  - cell "0 ₫" [ref=e686]
                  - cell "-9.665.095 ₫" [ref=e687]:
                    - generic [ref=e688]: "-9.665.095 ₫"
                  - cell "30.378.105 ₫" [ref=e689]
                  - cell "Pending approval" [ref=e690]:
                    - generic [ref=e691]: Pending approval
                  - cell "Approve" [ref=e692]:
                    - generic [ref=e693]:
                      - button "payroll.view" [ref=e694] [cursor=pointer]:
                        - img [ref=e695]
                      - button "Approve" [ref=e698] [cursor=pointer]
                - row "KD Khanh Do 30 Marketing 11.174.244 ₫ 504.622 ₫ -1.088.274 ₫ 10.590.592 ₫ Pending approval Approve" [ref=e699]:
                  - cell "KD Khanh Do 30 Marketing" [ref=e700]:
                    - generic [ref=e701]:
                      - generic [ref=e702]: KD
                      - generic [ref=e703]:
                        - paragraph [ref=e704]: Khanh Do 30
                        - paragraph [ref=e705]: Marketing
                  - cell "11.174.244 ₫" [ref=e706]
                  - cell "504.622 ₫" [ref=e707]
                  - cell "-1.088.274 ₫" [ref=e708]:
                    - generic [ref=e709]: "-1.088.274 ₫"
                  - cell "10.590.592 ₫" [ref=e710]
                  - cell "Pending approval" [ref=e711]:
                    - generic [ref=e712]: Pending approval
                  - cell "Approve" [ref=e713]:
                    - generic [ref=e714]:
                      - button "payroll.view" [ref=e715] [cursor=pointer]:
                        - img [ref=e716]
                      - button "Approve" [ref=e719] [cursor=pointer]
                - row "KP Khanh Pham 6 Marketing 103.569.979 ₫ 4.915.146 ₫ -30.723.468 ₫ 77.761.657 ₫ Pending approval Approve" [ref=e720]:
                  - cell "KP Khanh Pham 6 Marketing" [ref=e721]:
                    - generic [ref=e722]:
                      - generic [ref=e723]: KP
                      - generic [ref=e724]:
                        - paragraph [ref=e725]: Khanh Pham 6
                        - paragraph [ref=e726]: Marketing
                  - cell "103.569.979 ₫" [ref=e727]
                  - cell "4.915.146 ₫" [ref=e728]
                  - cell "-30.723.468 ₫" [ref=e729]:
                    - generic [ref=e730]: "-30.723.468 ₫"
                  - cell "77.761.657 ₫" [ref=e731]
                  - cell "Pending approval" [ref=e732]:
                    - generic [ref=e733]: Pending approval
                  - cell "Approve" [ref=e734]:
                    - generic [ref=e735]:
                      - button "payroll.view" [ref=e736] [cursor=pointer]:
                        - img [ref=e737]
                      - button "Approve" [ref=e740] [cursor=pointer]
                - row "KT Khanh Tran 12 Sales 60.635.202 ₫ 0 ₫ -19.427.434 ₫ 41.207.768 ₫ Pending approval Approve" [ref=e741]:
                  - cell "KT Khanh Tran 12 Sales" [ref=e742]:
                    - generic [ref=e743]:
                      - generic [ref=e744]: KT
                      - generic [ref=e745]:
                        - paragraph [ref=e746]: Khanh Tran 12
                        - paragraph [ref=e747]: Sales
                  - cell "60.635.202 ₫" [ref=e748]
                  - cell "0 ₫" [ref=e749]
                  - cell "-19.427.434 ₫" [ref=e750]:
                    - generic [ref=e751]: "-19.427.434 ₫"
                  - cell "41.207.768 ₫" [ref=e752]
                  - cell "Pending approval" [ref=e753]:
                    - generic [ref=e754]: Pending approval
                  - cell "Approve" [ref=e755]:
                    - generic [ref=e756]:
                      - button "payroll.view" [ref=e757] [cursor=pointer]:
                        - img [ref=e758]
                      - button "Approve" [ref=e761] [cursor=pointer]
                - row "LV Linh Vo 19 Sales 16.476.505 ₫ 357.387 ₫ -2.593.421 ₫ 14.240.471 ₫ Pending approval Approve" [ref=e762]:
                  - cell "LV Linh Vo 19 Sales" [ref=e763]:
                    - generic [ref=e764]:
                      - generic [ref=e765]: LV
                      - generic [ref=e766]:
                        - paragraph [ref=e767]: Linh Vo 19
                        - paragraph [ref=e768]: Sales
                  - cell "16.476.505 ₫" [ref=e769]
                  - cell "357.387 ₫" [ref=e770]
                  - cell "-2.593.421 ₫" [ref=e771]:
                    - generic [ref=e772]: "-2.593.421 ₫"
                  - cell "14.240.471 ₫" [ref=e773]
                  - cell "Pending approval" [ref=e774]:
                    - generic [ref=e775]: Pending approval
                  - cell "Approve" [ref=e776]:
                    - generic [ref=e777]:
                      - button "payroll.view" [ref=e778] [cursor=pointer]:
                        - img [ref=e779]
                      - button "Approve" [ref=e782] [cursor=pointer]
                - row "LH Linh Hoang 13 Finance 5.792.798 ₫ 270.516 ₫ -585.654 ₫ 5.477.660 ₫ Pending approval Approve" [ref=e783]:
                  - cell "LH Linh Hoang 13 Finance" [ref=e784]:
                    - generic [ref=e785]:
                      - generic [ref=e786]: LH
                      - generic [ref=e787]:
                        - paragraph [ref=e788]: Linh Hoang 13
                        - paragraph [ref=e789]: Finance
                  - cell "5.792.798 ₫" [ref=e790]
                  - cell "270.516 ₫" [ref=e791]
                  - cell "-585.654 ₫" [ref=e792]:
                    - generic [ref=e793]: "-585.654 ₫"
                  - cell "5.477.660 ₫" [ref=e794]
                  - cell "Pending approval" [ref=e795]:
                    - generic [ref=e796]: Pending approval
                  - cell "Approve" [ref=e797]:
                    - generic [ref=e798]:
                      - button "payroll.view" [ref=e799] [cursor=pointer]:
                        - img [ref=e800]
                      - button "Approve" [ref=e803] [cursor=pointer]
                - row "LT Linh Tran 31 Sales 18.624.951 ₫ 401.342 ₫ -3.035.946 ₫ 15.990.347 ₫ Pending approval Approve" [ref=e804]:
                  - cell "LT Linh Tran 31 Sales" [ref=e805]:
                    - generic [ref=e806]:
                      - generic [ref=e807]: LT
                      - generic [ref=e808]:
                        - paragraph [ref=e809]: Linh Tran 31
                        - paragraph [ref=e810]: Sales
                  - cell "18.624.951 ₫" [ref=e811]
                  - cell "401.342 ₫" [ref=e812]
                  - cell "-3.035.946 ₫" [ref=e813]:
                    - generic [ref=e814]: "-3.035.946 ₫"
                  - cell "15.990.347 ₫" [ref=e815]
                  - cell "Pending approval" [ref=e816]:
                    - generic [ref=e817]: Pending approval
                  - cell "Approve" [ref=e818]:
                    - generic [ref=e819]:
                      - button "payroll.view" [ref=e820] [cursor=pointer]:
                        - img [ref=e821]
                      - button "Approve" [ref=e824] [cursor=pointer]
                - row "LD Linh Dang 32 Sales 21.135.265 ₫ 957.422 ₫ -2.699.847 ₫ 19.392.841 ₫ Pending approval Approve" [ref=e825]:
                  - cell "LD Linh Dang 32 Sales" [ref=e826]:
                    - generic [ref=e827]:
                      - generic [ref=e828]: LD
                      - generic [ref=e829]:
                        - paragraph [ref=e830]: Linh Dang 32
                        - paragraph [ref=e831]: Sales
                  - cell "21.135.265 ₫" [ref=e832]
                  - cell "957.422 ₫" [ref=e833]
                  - cell "-2.699.847 ₫" [ref=e834]:
                    - generic [ref=e835]: "-2.699.847 ₫"
                  - cell "19.392.841 ₫" [ref=e836]
                  - cell "Pending approval" [ref=e837]:
                    - generic [ref=e838]: Pending approval
                  - cell "Approve" [ref=e839]:
                    - generic [ref=e840]:
                      - button "payroll.view" [ref=e841] [cursor=pointer]:
                        - img [ref=e842]
                      - button "Approve" [ref=e845] [cursor=pointer]
                - row "LV Linh Vo 7 Finance 12.722.765 ₫ 573.862 ₫ -1.265.478 ₫ 12.031.149 ₫ Pending approval Approve" [ref=e846]:
                  - cell "LV Linh Vo 7 Finance" [ref=e847]:
                    - generic [ref=e848]:
                      - generic [ref=e849]: LV
                      - generic [ref=e850]:
                        - paragraph [ref=e851]: Linh Vo 7
                        - paragraph [ref=e852]: Finance
                  - cell "12.722.765 ₫" [ref=e853]
                  - cell "573.862 ₫" [ref=e854]
                  - cell "-1.265.478 ₫" [ref=e855]:
                    - generic [ref=e856]: "-1.265.478 ₫"
                  - cell "12.031.149 ₫" [ref=e857]
                  - cell "Pending approval" [ref=e858]:
                    - generic [ref=e859]: Pending approval
                  - cell "Approve" [ref=e860]:
                    - generic [ref=e861]:
                      - button "payroll.view" [ref=e862] [cursor=pointer]:
                        - img [ref=e863]
                      - button "Approve" [ref=e866] [cursor=pointer]
                - row "LV Linh Vo 5 Sales 8.620.129 ₫ 0 ₫ -1.651.341 ₫ 6.968.787 ₫ Pending approval Approve" [ref=e867]:
                  - cell "LV Linh Vo 5 Sales" [ref=e868]:
                    - generic [ref=e869]:
                      - generic [ref=e870]: LV
                      - generic [ref=e871]:
                        - paragraph [ref=e872]: Linh Vo 5
                        - paragraph [ref=e873]: Sales
                  - cell "8.620.129 ₫" [ref=e874]
                  - cell "0 ₫" [ref=e875]
                  - cell "-1.651.341 ₫" [ref=e876]:
                    - generic [ref=e877]: "-1.651.341 ₫"
                  - cell "6.968.787 ₫" [ref=e878]
                  - cell "Pending approval" [ref=e879]:
                    - generic [ref=e880]: Pending approval
                  - cell "Approve" [ref=e881]:
                    - generic [ref=e882]:
                      - button "payroll.view" [ref=e883] [cursor=pointer]:
                        - img [ref=e884]
                      - button "Approve" [ref=e887] [cursor=pointer]
                - row "LL Linh Le 9 Marketing 43.210.077 ₫ 847.523 ₫ -9.628.920 ₫ 34.428.679 ₫ Pending approval Approve" [ref=e888]:
                  - cell "LL Linh Le 9 Marketing" [ref=e889]:
                    - generic [ref=e890]:
                      - generic [ref=e891]: LL
                      - generic [ref=e892]:
                        - paragraph [ref=e893]: Linh Le 9
                        - paragraph [ref=e894]: Marketing
                  - cell "43.210.077 ₫" [ref=e895]
                  - cell "847.523 ₫" [ref=e896]
                  - cell "-9.628.920 ₫" [ref=e897]:
                    - generic [ref=e898]: "-9.628.920 ₫"
                  - cell "34.428.679 ₫" [ref=e899]
                  - cell "Pending approval" [ref=e900]:
                    - generic [ref=e901]: Pending approval
                  - cell "Approve" [ref=e902]:
                    - generic [ref=e903]:
                      - button "payroll.view" [ref=e904] [cursor=pointer]:
                        - img [ref=e905]
                      - button "Approve" [ref=e908] [cursor=pointer]
                - row "MN Minh Nguyen 23 Sales 8.936.226 ₫ 433.674 ₫ -949.279 ₫ 8.420.620 ₫ Pending approval Approve" [ref=e909]:
                  - cell "MN Minh Nguyen 23 Sales" [ref=e910]:
                    - generic [ref=e911]:
                      - generic [ref=e912]: MN
                      - generic [ref=e913]:
                        - paragraph [ref=e914]: Minh Nguyen 23
                        - paragraph [ref=e915]: Sales
                  - cell "8.936.226 ₫" [ref=e916]
                  - cell "433.674 ₫" [ref=e917]
                  - cell "-949.279 ₫" [ref=e918]:
                    - generic [ref=e919]: "-949.279 ₫"
                  - cell "8.420.620 ₫" [ref=e920]
                  - cell "Pending approval" [ref=e921]:
                    - generic [ref=e922]: Pending approval
                  - cell "Approve" [ref=e923]:
                    - generic [ref=e924]:
                      - button "payroll.view" [ref=e925] [cursor=pointer]:
                        - img [ref=e926]
                      - button "Approve" [ref=e929] [cursor=pointer]
                - row "MP Minh Pham 38 Finance 56.472.537 ₫ 2.290.999 ₫ -12.430.476 ₫ 46.333.061 ₫ Pending approval Approve" [ref=e930]:
                  - cell "MP Minh Pham 38 Finance" [ref=e931]:
                    - generic [ref=e932]:
                      - generic [ref=e933]: MP
                      - generic [ref=e934]:
                        - paragraph [ref=e935]: Minh Pham 38
                        - paragraph [ref=e936]: Finance
                  - cell "56.472.537 ₫" [ref=e937]
                  - cell "2.290.999 ₫" [ref=e938]
                  - cell "-12.430.476 ₫" [ref=e939]:
                    - generic [ref=e940]: "-12.430.476 ₫"
                  - cell "46.333.061 ₫" [ref=e941]
                  - cell "Pending approval" [ref=e942]:
                    - generic [ref=e943]: Pending approval
                  - cell "Approve" [ref=e944]:
                    - generic [ref=e945]:
                      - button "payroll.view" [ref=e946] [cursor=pointer]:
                        - img [ref=e947]
                      - button "Approve" [ref=e950] [cursor=pointer]
                - row "MD Minh Do 14 Sales 41.487.142 ₫ 1.703.675 ₫ -7.504.337 ₫ 35.686.480 ₫ Pending approval Approve" [ref=e951]:
                  - cell "MD Minh Do 14 Sales" [ref=e952]:
                    - generic [ref=e953]:
                      - generic [ref=e954]: MD
                      - generic [ref=e955]:
                        - paragraph [ref=e956]: Minh Do 14
                        - paragraph [ref=e957]: Sales
                  - cell "41.487.142 ₫" [ref=e958]
                  - cell "1.703.675 ₫" [ref=e959]
                  - cell "-7.504.337 ₫" [ref=e960]:
                    - generic [ref=e961]: "-7.504.337 ₫"
                  - cell "35.686.480 ₫" [ref=e962]
                  - cell "Pending approval" [ref=e963]:
                    - generic [ref=e964]: Pending approval
                  - cell "Approve" [ref=e965]:
                    - generic [ref=e966]:
                      - button "payroll.view" [ref=e967] [cursor=pointer]:
                        - img [ref=e968]
                      - button "Approve" [ref=e971] [cursor=pointer]
                - row "MP Minh Pham 8 Sales 47.146.178 ₫ 1.940.226 ₫ -9.144.957 ₫ 39.941.448 ₫ Pending approval Approve" [ref=e972]:
                  - cell "MP Minh Pham 8 Sales" [ref=e973]:
                    - generic [ref=e974]:
                      - generic [ref=e975]: MP
                      - generic [ref=e976]:
                        - paragraph [ref=e977]: Minh Pham 8
                        - paragraph [ref=e978]: Sales
                  - cell "47.146.178 ₫" [ref=e979]
                  - cell "1.940.226 ₫" [ref=e980]
                  - cell "-9.144.957 ₫" [ref=e981]:
                    - generic [ref=e982]: "-9.144.957 ₫"
                  - cell "39.941.448 ₫" [ref=e983]
                  - cell "Pending approval" [ref=e984]:
                    - generic [ref=e985]: Pending approval
                  - cell "Approve" [ref=e986]:
                    - generic [ref=e987]:
                      - button "payroll.view" [ref=e988] [cursor=pointer]:
                        - img [ref=e989]
                      - button "Approve" [ref=e992] [cursor=pointer]
                - row "MT Minh Tran 27 Marketing 80.454.032 ₫ 3.810.340 ₫ -21.511.510 ₫ 62.752.861 ₫ Pending approval Approve" [ref=e993]:
                  - cell "MT Minh Tran 27 Marketing" [ref=e994]:
                    - generic [ref=e995]:
                      - generic [ref=e996]: MT
                      - generic [ref=e997]:
                        - paragraph [ref=e998]: Minh Tran 27
                        - paragraph [ref=e999]: Marketing
                  - cell "80.454.032 ₫" [ref=e1000]
                  - cell "3.810.340 ₫" [ref=e1001]
                  - cell "-21.511.510 ₫" [ref=e1002]:
                    - generic [ref=e1003]: "-21.511.510 ₫"
                  - cell "62.752.861 ₫" [ref=e1004]
                  - cell "Pending approval" [ref=e1005]:
                    - generic [ref=e1006]: Pending approval
                  - cell "Approve" [ref=e1007]:
                    - generic [ref=e1008]:
                      - button "payroll.view" [ref=e1009] [cursor=pointer]:
                        - img [ref=e1010]
                      - button "Approve" [ref=e1013] [cursor=pointer]
                - row "MV Minh Vo 16 Engineering 83.528.033 ₫ 3.957.259 ₫ -22.693.759 ₫ 64.791.534 ₫ Pending approval Approve" [ref=e1014]:
                  - cell "MV Minh Vo 16 Engineering" [ref=e1015]:
                    - generic [ref=e1016]:
                      - generic [ref=e1017]: MV
                      - generic [ref=e1018]:
                        - paragraph [ref=e1019]: Minh Vo 16
                        - paragraph [ref=e1020]: Engineering
                  - cell "83.528.033 ₫" [ref=e1021]
                  - cell "3.957.259 ₫" [ref=e1022]
                  - cell "-22.693.759 ₫" [ref=e1023]:
                    - generic [ref=e1024]: "-22.693.759 ₫"
                  - cell "64.791.534 ₫" [ref=e1025]
                  - cell "Pending approval" [ref=e1026]:
                    - generic [ref=e1027]: Pending approval
                  - cell "Approve" [ref=e1028]:
                    - generic [ref=e1029]:
                      - button "payroll.view" [ref=e1030] [cursor=pointer]:
                        - img [ref=e1031]
                      - button "Approve" [ref=e1034] [cursor=pointer]
                - row "ML Minh Le 29 Marketing 98.563.988 ₫ 4.560.063 ₫ -28.764.117 ₫ 74.359.934 ₫ Pending approval Approve" [ref=e1035]:
                  - cell "ML Minh Le 29 Marketing" [ref=e1036]:
                    - generic [ref=e1037]:
                      - generic [ref=e1038]: ML
                      - generic [ref=e1039]:
                        - paragraph [ref=e1040]: Minh Le 29
                        - paragraph [ref=e1041]: Marketing
                  - cell "98.563.988 ₫" [ref=e1042]
                  - cell "4.560.063 ₫" [ref=e1043]
                  - cell "-28.764.117 ₫" [ref=e1044]:
                    - generic [ref=e1045]: "-28.764.117 ₫"
                  - cell "74.359.934 ₫" [ref=e1046]
                  - cell "Pending approval" [ref=e1047]:
                    - generic [ref=e1048]: Pending approval
                  - cell "Approve" [ref=e1049]:
                    - generic [ref=e1050]:
                      - button "payroll.view" [ref=e1051] [cursor=pointer]:
                        - img [ref=e1052]
                      - button "Approve" [ref=e1055] [cursor=pointer]
                - row "MP Minh Pham 18 Sales 10.976.241 ₫ 0 ₫ -2.426.073 ₫ 8.550.168 ₫ Pending approval Approve" [ref=e1056]:
                  - cell "MP Minh Pham 18 Sales" [ref=e1057]:
                    - generic [ref=e1058]:
                      - generic [ref=e1059]: MP
                      - generic [ref=e1060]:
                        - paragraph [ref=e1061]: Minh Pham 18
                        - paragraph [ref=e1062]: Sales
                  - cell "10.976.241 ₫" [ref=e1063]
                  - cell "0 ₫" [ref=e1064]
                  - cell "-2.426.073 ₫" [ref=e1065]:
                    - generic [ref=e1066]: "-2.426.073 ₫"
                  - cell "8.550.168 ₫" [ref=e1067]
                  - cell "Pending approval" [ref=e1068]:
                    - generic [ref=e1069]: Pending approval
                  - cell "Approve" [ref=e1070]:
                    - generic [ref=e1071]:
                      - button "payroll.view" [ref=e1072] [cursor=pointer]:
                        - img [ref=e1073]
                      - button "Approve" [ref=e1076] [cursor=pointer]
                - row "SA System Admin HR 64.552.914 ₫ 1.491.892 ₫ -18.046.968 ₫ 47.997.838 ₫ Pending approval Approve" [ref=e1077]:
                  - cell "SA System Admin HR" [ref=e1078]:
                    - generic [ref=e1079]:
                      - generic [ref=e1080]: SA
                      - generic [ref=e1081]:
                        - paragraph [ref=e1082]: System Admin
                        - paragraph [ref=e1083]: HR
                  - cell "64.552.914 ₫" [ref=e1084]
                  - cell "1.491.892 ₫" [ref=e1085]
                  - cell "-18.046.968 ₫" [ref=e1086]:
                    - generic [ref=e1087]: "-18.046.968 ₫"
                  - cell "47.997.838 ₫" [ref=e1088]
                  - cell "Pending approval" [ref=e1089]:
                    - generic [ref=e1090]: Pending approval
                  - cell "Approve" [ref=e1091]:
                    - generic [ref=e1092]:
                      - button "payroll.view" [ref=e1093] [cursor=pointer]:
                        - img [ref=e1094]
                      - button "Approve" [ref=e1097] [cursor=pointer]
      - generic [ref=e1098]:
        - img [ref=e1099]
        - generic [ref=e1101]:
          - heading "✅ Create Payroll June 2026" [level=3] [ref=e1102]
          - paragraph [ref=e1103]: 40 Payslips Sent
        - button [ref=e1104] [cursor=pointer]:
          - img [ref=e1105]
  - alert [ref=e1108]
```

# Test source

```ts
  359 |     await ap.fillMonth(futureMonthFormatted);
  360 |     await ap.fillReason('TC_PAY_021 future bonus test');
  361 | 
  362 |     const adjResp = page.waitForResponse(
  363 |       r => r.url().includes('/api/payroll/adjustments') && r.request().method() === 'POST',
  364 |       { timeout: 15000 }
  365 |     );
  366 |     await ap.submit();
  367 |     const adjResult = await adjResp;
  368 |     if (!adjResult.ok()) { test.skip(true, `Adjustment POST ${adjResult.status()}`); return; }
  369 | 
  370 |     // Step 2: Generate payroll cho July 2026
  371 |     await gp.goto();
  372 |     await gp.waitForPageLoad();
  373 |     await gp.selectMonth(futureMonth);
  374 |     await gp.selectYear(year);
  375 | 
  376 |     const genResp = gp.waitForGenerateResponse();
  377 |     await gp.clickGenerate();
  378 |     const genResult = await genResp;
  379 |     if (!genResult.ok()) { test.skip(true, `Generate ${genResult.status()}`); return; }
  380 |     await page.waitForTimeout(2000);
  381 | 
  382 |     // Step 3: View July payslip - should include the bonus in Income
  383 |     const rowCount = await gp.getPayslipRowCount();
  384 |     if (rowCount === 0) { test.skip(true, 'No payslips generated for July'); return; }
  385 | 
  386 |     await gp.viewFirstPayslip();
  387 |     await expect(gp.detailPrintArea).toBeVisible({ timeout: 5000 });
  388 | 
  389 |     const julyDetailText = await gp.detailPrintArea.textContent();
  390 |     expect(julyDetailText).toMatch(/Income|Thu nhập/i);
  391 |     expect(julyDetailText).not.toMatch(/Error|NaN|undefined/i);
  392 | 
  393 |     await gp.closeDetailModal();
  394 | 
  395 |     // Step 4: Xác nhận lại phiếu lương June 2026 KHÔNG bị cộng khoản bonus này
  396 |     await gp.selectMonth(currentMonth);
  397 |     await gp.selectYear(year);
  398 |     await page.waitForTimeout(1500);
  399 | 
  400 |     const juneRowCount = await gp.getPayslipRowCount();
  401 |     if (juneRowCount > 0) {
  402 |       await gp.viewFirstPayslip();
  403 |       await expect(gp.detailPrintArea).toBeVisible({ timeout: 5000 });
  404 | 
  405 |       // June payslip should not contain the July bonus marker
  406 |       const juneDetailText = await gp.detailPrintArea.textContent();
  407 |       // The future adjustment should not be applied to current month
  408 |       expect(juneDetailText).not.toMatch(/Error|NaN|undefined/i);
  409 |       await gp.closeDetailModal();
  410 |     }
  411 | 
  412 |     // Cleanup
  413 |     await ap.goto();
  414 |     await ap.waitForPageLoad();
  415 |     const afterRows = await ap.getHistoryRowCount();
  416 |     if (afterRows > 0) {
  417 |       page.once('dialog', d => d.accept());
  418 |       const delBtn = ap.historyRows().first().locator('svg.lucide-trash2').first();
  419 |       if ((await delBtn.count()) > 0) {
  420 |         await delBtn.click();
  421 |         await page.waitForTimeout(500);
  422 |       }
  423 |     }
  424 |   });
  425 | 
  426 |   test('TC_PAY_022 - Tính lương 2 lần cho cùng một tháng (Idempotency)', async ({ adminPage: page }) => {
  427 |     const gp = new PayrollGeneratePage(page);
  428 | 
  429 |     await gp.goto();
  430 |     await gp.waitForPageLoad();
  431 | 
  432 |     await gp.selectMonth('6');
  433 |     await gp.selectYear('2026');
  434 | 
  435 |     // First generate
  436 |     const genResp1 = gp.waitForGenerateResponse();
  437 |     await gp.clickGenerate();
  438 |     const genResult1 = await genResp1;
  439 |     if (!genResult1.ok()) { test.skip(true, `First generate ${genResult1.status()}`); return; }
  440 |     await page.waitForTimeout(2000);
  441 | 
  442 |     // Second generate for the same month
  443 |     const genResp2 = page.waitForResponse(
  444 |       r => r.url().includes('/api/payroll/generate') && r.request().method() === 'POST',
  445 |       { timeout: 30000 }
  446 |     ).catch(() => null);
  447 |     await gp.clickGenerate();
  448 |     const genResult2 = await genResp2;
  449 | 
  450 |     if (genResult2) {
  451 |       // If API allows duplicate generate, verify:
  452 |       // 1. It returns success (200/201) for overwrite, OR
  453 |       // 2. It returns a warning/conflict (409/400) for duplicate
  454 |       const status = genResult2.status();
  455 |       expect([200, 201, 400, 409]).toContain(status);
  456 | 
  457 |       if (status === 200 || status === 201) {
  458 |         // If overwrite is allowed, page should still be functional
> 459 |         await expect(gp.pageTitle).toBeVisible({ timeout: 5000 });
      |                                    ^ Error: expect(locator).toBeVisible() failed
  460 |         const rowCount = await gp.getPayslipRowCount();
  461 |         expect(rowCount).toBeGreaterThanOrEqual(0);
  462 |       }
  463 |     } else {
  464 |       // No response captured - check if page shows warning/error
  465 |       const hasWarning = await page.getByText(/already|đã được tạo|exists|duplicate/i).isVisible({ timeout: 3000 }).catch(() => false);
  466 |       // Page should still be functional either way
  467 |       await expect(gp.pageTitle).toBeVisible({ timeout: 5000 });
  468 |     }
  469 |   });
  470 | 
  471 |   test('TC_PAY_023 - Phạt vượt quá Tổng thu nhập dẫn đến lương âm', async ({ adminPage: page }) => {
  472 |     const ap = new PayrollAdjustmentPage(page);
  473 |     const gp = new PayrollGeneratePage(page);
  474 | 
  475 |     const currentMonthFormatted = '2026-06';
  476 | 
  477 |     // Step 1: Tạo Penalty 100,000,000đ (lớn hơn lương cơ bản)
  478 |     await ap.goto();
  479 |     await ap.waitForPageLoad();
  480 |     await page.waitForTimeout(2000);
  481 | 
  482 |     const options = ap.employeeSelect.locator('option');
  483 |     const optCount = await options.count();
  484 |     if (optCount < 2) { test.skip(true, 'No valid employee options'); return; }
  485 |     let selectedValue = '';
  486 |     for (let i = 1; i < optCount; i++) {
  487 |       const v = await options.nth(i).getAttribute('value');
  488 |       if (v && v !== '') { selectedValue = v; break; }
  489 |     }
  490 |     if (!selectedValue) { test.skip(true, 'No valid employee options'); return; }
  491 |     await ap.employeeSelect.selectOption(selectedValue);
  492 | 
  493 |     await ap.selectType('Penalty');
  494 |     await ap.fillAmount('100000000');
  495 |     await ap.fillMonth(currentMonthFormatted);
  496 |     await ap.fillReason('TC_PAY_023 negative salary test');
  497 | 
  498 |     const adjResp = page.waitForResponse(
  499 |       r => r.url().includes('/api/payroll/adjustments') && r.request().method() === 'POST',
  500 |       { timeout: 15000 }
  501 |     );
  502 |     await ap.submit();
  503 |     const adjResult = await adjResp;
  504 |     if (!adjResult.ok()) { test.skip(true, `Adjustment POST ${adjResult.status()}`); return; }
  505 | 
  506 |     // Step 2: Generate payroll
  507 |     await gp.goto();
  508 |     await gp.waitForPageLoad();
  509 |     await gp.selectMonth('6');
  510 |     await gp.selectYear('2026');
  511 | 
  512 |     const genResp = gp.waitForGenerateResponse();
  513 |     await gp.clickGenerate();
  514 |     const genResult = await genResp;
  515 |     if (!genResult.ok()) { test.skip(true, `Generate ${genResult.status()}`); return; }
  516 |     await page.waitForTimeout(2000);
  517 | 
  518 |     // Step 3: View payslip
  519 |     const rowCount = await gp.getPayslipRowCount();
  520 |     if (rowCount === 0) { test.skip(true, 'No payslips generated'); return; }
  521 | 
  522 |     await gp.viewFirstPayslip();
  523 |     await expect(gp.detailPrintArea).toBeVisible({ timeout: 5000 });
  524 | 
  525 |     // Pay slip should not crash UI
  526 |     const detailText = await gp.detailPrintArea.textContent();
  527 |     expect(detailText).not.toMatch(/Error|NaN|undefined/i);
  528 |     // Should contain Deductions section
  529 |     expect(detailText).toContain('Deductions');
  530 | 
  531 |     await gp.closeDetailModal();
  532 | 
  533 |     // Cleanup
  534 |     await ap.goto();
  535 |     await ap.waitForPageLoad();
  536 |     const afterRows = await ap.getHistoryRowCount();
  537 |     if (afterRows > 0) {
  538 |       page.once('dialog', d => d.accept());
  539 |       const delBtn = ap.historyRows().first().locator('svg.lucide-trash2').first();
  540 |       if ((await delBtn.count()) > 0) {
  541 |         await delBtn.click();
  542 |         await page.waitForTimeout(500);
  543 |       }
  544 |     }
  545 |   });
  546 | 
  547 |   test('TC_PAY_024 - Thuế TNCN (PIT) và Bảo hiểm (10.5%) tự động cập nhật khi Lương cơ bản đổi', async ({ adminPage: page }) => {
  548 |     const cp = new PayrollConfigPage(page);
  549 |     const gp = new PayrollGeneratePage(page);
  550 | 
  551 |     // Step 1: Generate payroll for June, record PIT & Insurance from payslip
  552 |     await gp.goto();
  553 |     await gp.waitForPageLoad();
  554 |     await gp.selectMonth('6');
  555 |     await gp.selectYear('2026');
  556 | 
  557 |     const genResp1 = gp.waitForGenerateResponse();
  558 |     await gp.clickGenerate();
  559 |     const genResult1 = await genResp1;
```