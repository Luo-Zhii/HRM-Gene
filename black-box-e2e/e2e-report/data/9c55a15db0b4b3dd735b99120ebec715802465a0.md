# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payroll/payroll.spec.ts >> [M09] Payroll - Salary Adjustment >> TC_PAY_011 - Adjustments page load được
- Location: specs/payroll/payroll.spec.ts:111:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('form').or(locator('table'))
Expected: visible
Error: strict mode violation: locator('form').or(locator('table')) resolved to 2 elements:
    1) <form class="p-6">…</form> aka locator('form')
    2) <table class="w-full text-sm">…</table> aka getByRole('table')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('form').or(locator('table'))

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
            - heading "Salary Adjustments" [level=1] [ref=e175]
            - paragraph [ref=e176]: Create bonus or penalty adjustments for employees
          - generic [ref=e177]:
            - generic [ref=e178]:
              - img [ref=e180]
              - generic [ref=e183]:
                - paragraph [ref=e184]: Total Bonuses
                - paragraph [ref=e185]: 14.709.841 ₫
            - generic [ref=e186]:
              - img [ref=e188]
              - generic [ref=e191]:
                - paragraph [ref=e192]: Total Penalties
                - paragraph [ref=e193]: 6.224.202 ₫
            - generic [ref=e194]:
              - img [ref=e196]
              - generic [ref=e199]:
                - paragraph [ref=e200]: Pending Review
                - paragraph [ref=e201]: "0"
          - generic [ref=e202]:
            - generic [ref=e203]:
              - img [ref=e204]
              - heading "Create New Adjustment" [level=2] [ref=e205]
            - generic [ref=e206]:
              - generic [ref=e207]:
                - generic [ref=e208]:
                  - generic [ref=e209]: Employee *
                  - combobox [ref=e210]:
                    - option "Select an employee..." [selected]
                    - option "An Pham 33 — Engineering"
                    - option "Binh Dang 39 — Finance"
                    - option "Binh Pham 37 — Marketing"
                    - option "Cuong Pham 34 — Sales"
                    - option "Dung Tran 20 — Finance"
                    - option "Dung Nguyen 25 — Finance"
                    - option "Dung Do 17 — Engineering"
                    - option "Dung Bui 2 — Engineering"
                    - option "Dung Dang 26 — Marketing"
                    - option "Giang Tran 1 — Engineering"
                    - option "Giang Do 4 — Sales"
                    - option "Giang Nguyen 21 — Engineering"
                    - option "Giang Hoang 22 — Sales"
                    - option "Giang Bui 24 — HR"
                    - option "Giang Bui 36 — Sales"
                    - option "Hoa Hoang 3 — Sales"
                    - option "Hoa Nguyen 10 — Marketing"
                    - option "Hoa Pham 35 — HR"
                    - option "Khanh Hoang 15 — HR"
                    - option "Khanh Bui 11 — Engineering"
                    - option "Khanh Vu 28 — Engineering"
                    - option "Khanh Do 30 — Marketing"
                    - option "Khanh Pham 6 — Marketing"
                    - option "Khanh Tran 12 — Sales"
                    - option "Linh Vo 19 — Sales"
                    - option "Linh Hoang 13 — Finance"
                    - option "Linh Tran 31 — Sales"
                    - option "Linh Dang 32 — Sales"
                    - option "Linh Vo 7 — Finance"
                    - option "Linh Vo 5 — Sales"
                    - option "Linh Le 9 — Marketing"
                    - option "Minh Nguyen 23 — Sales"
                    - option "Minh Pham 38 — Finance"
                    - option "Minh Do 14 — Sales"
                    - option "Minh Pham 8 — Sales"
                    - option "Minh Tran 27 — Marketing"
                    - option "Minh Vo 16 — Engineering"
                    - option "Minh Le 29 — Marketing"
                    - option "Minh Pham 18 — Sales"
                    - option "System Admin — HR"
                - generic [ref=e211]:
                  - generic [ref=e212]: Adjustment Type *
                  - generic [ref=e213]:
                    - button "Bonus" [ref=e214] [cursor=pointer]:
                      - img [ref=e215]
                      - text: Bonus
                    - button "Penalty" [ref=e218] [cursor=pointer]:
                      - img [ref=e219]
                      - text: Penalty
                - generic [ref=e222]:
                  - generic [ref=e223]: Amount (VND) *
                  - generic [ref=e224]:
                    - generic [ref=e225]: ₫
                    - spinbutton [ref=e226]
                - generic [ref=e227]:
                  - generic [ref=e228]: Applied Month *
                  - textbox [ref=e229]
                - generic [ref=e230]:
                  - generic [ref=e231]: Reason
                  - textbox "Describe the reason for the adjustment..." [ref=e232]
              - button "Save Adjustment" [ref=e234] [cursor=pointer]:
                - img [ref=e235]
                - text: Save Adjustment
          - generic [ref=e236]:
            - generic [ref=e237]:
              - heading "Recent History" [level=2] [ref=e238]
              - generic [ref=e239]:
                - button "All" [ref=e240] [cursor=pointer]
                - button "Bonus" [ref=e241] [cursor=pointer]
                - button "Penalty" [ref=e242] [cursor=pointer]
            - table [ref=e244]:
              - rowgroup [ref=e245]:
                - row "Employee Adjustment Type Amount (VND) Applied Month Reason Date Created Status Actions" [ref=e246]:
                  - columnheader "Employee" [ref=e247]
                  - columnheader "Adjustment Type" [ref=e248]
                  - columnheader "Amount (VND)" [ref=e249]
                  - columnheader "Applied Month" [ref=e250]
                  - columnheader "Reason" [ref=e251]
                  - columnheader "Date Created" [ref=e252]
                  - columnheader "Status" [ref=e253]
                  - columnheader "Actions" [ref=e254]
              - rowgroup [ref=e255]:
                - row "DB Dung Bui 2 Engineering Penalty 500.000 ₫ 06/2026 Late submission - seeded 8/6/2026 Approved" [ref=e256]:
                  - cell "DB Dung Bui 2 Engineering" [ref=e257]:
                    - generic [ref=e258]:
                      - generic [ref=e259]: DB
                      - generic [ref=e260]:
                        - paragraph [ref=e261]: Dung Bui 2
                        - paragraph [ref=e262]: Engineering
                  - cell "Penalty" [ref=e263]:
                    - generic [ref=e264]:
                      - img [ref=e265]
                      - text: Penalty
                  - cell "500.000 ₫" [ref=e268]
                  - cell "06/2026" [ref=e269]
                  - cell "Late submission - seeded" [ref=e270]
                  - cell "8/6/2026" [ref=e271]
                  - cell "Approved" [ref=e272]:
                    - generic [ref=e273]: Approved
                  - cell [ref=e274]:
                    - button "Delete" [ref=e276] [cursor=pointer]:
                      - img [ref=e277]
                - row "GT Giang Tran 1 Engineering Bonus 1.500.000 ₫ 07/2026 Upcoming performance bonus - seeded 8/6/2026 Approved" [ref=e280]:
                  - cell "GT Giang Tran 1 Engineering" [ref=e281]:
                    - generic [ref=e282]:
                      - generic [ref=e283]: GT
                      - generic [ref=e284]:
                        - paragraph [ref=e285]: Giang Tran 1
                        - paragraph [ref=e286]: Engineering
                  - cell "Bonus" [ref=e287]:
                    - generic [ref=e288]:
                      - img [ref=e289]
                      - text: Bonus
                  - cell "1.500.000 ₫" [ref=e292]
                  - cell "07/2026" [ref=e293]
                  - cell "Upcoming performance bonus - seeded" [ref=e294]
                  - cell "8/6/2026" [ref=e295]
                  - cell "Approved" [ref=e296]:
                    - generic [ref=e297]: Approved
                  - cell [ref=e298]:
                    - button "Delete" [ref=e300] [cursor=pointer]:
                      - img [ref=e301]
                - row "GT Giang Tran 1 Engineering Bonus 2.000.000 ₫ 06/2026 Project completion bonus - seeded 8/6/2026 Approved" [ref=e304]:
                  - cell "GT Giang Tran 1 Engineering" [ref=e305]:
                    - generic [ref=e306]:
                      - generic [ref=e307]: GT
                      - generic [ref=e308]:
                        - paragraph [ref=e309]: Giang Tran 1
                        - paragraph [ref=e310]: Engineering
                  - cell "Bonus" [ref=e311]:
                    - generic [ref=e312]:
                      - img [ref=e313]
                      - text: Bonus
                  - cell "2.000.000 ₫" [ref=e316]
                  - cell "06/2026" [ref=e317]
                  - cell "Project completion bonus - seeded" [ref=e318]
                  - cell "8/6/2026" [ref=e319]
                  - cell "Approved" [ref=e320]:
                    - generic [ref=e321]: Approved
                  - cell [ref=e322]:
                    - button "Delete" [ref=e324] [cursor=pointer]:
                      - img [ref=e325]
                - row "GT Giang Tran 1 Engineering Penalty 300.000 ₫ 06/2026 Minor policy violation - seeded 8/6/2026 Approved" [ref=e328]:
                  - cell "GT Giang Tran 1 Engineering" [ref=e329]:
                    - generic [ref=e330]:
                      - generic [ref=e331]: GT
                      - generic [ref=e332]:
                        - paragraph [ref=e333]: Giang Tran 1
                        - paragraph [ref=e334]: Engineering
                  - cell "Penalty" [ref=e335]:
                    - generic [ref=e336]:
                      - img [ref=e337]
                      - text: Penalty
                  - cell "300.000 ₫" [ref=e340]
                  - cell "06/2026" [ref=e341]
                  - cell "Minor policy violation - seeded" [ref=e342]
                  - cell "8/6/2026" [ref=e343]
                  - cell "Approved" [ref=e344]:
                    - generic [ref=e345]: Approved
                  - cell [ref=e346]:
                    - button "Delete" [ref=e348] [cursor=pointer]:
                      - img [ref=e349]
                - row "GB Giang Bui 36 Sales Bonus 2.301.152 ₫ 05/2026 Excellent Performance 8/6/2026 Approved" [ref=e352]:
                  - cell "GB Giang Bui 36 Sales" [ref=e353]:
                    - generic [ref=e354]:
                      - generic [ref=e355]: GB
                      - generic [ref=e356]:
                        - paragraph [ref=e357]: Giang Bui 36
                        - paragraph [ref=e358]: Sales
                  - cell "Bonus" [ref=e359]:
                    - generic [ref=e360]:
                      - img [ref=e361]
                      - text: Bonus
                  - cell "2.301.152 ₫" [ref=e364]
                  - cell "05/2026" [ref=e365]
                  - cell "Excellent Performance" [ref=e366]
                  - cell "8/6/2026" [ref=e367]
                  - cell "Approved" [ref=e368]:
                    - generic [ref=e369]: Approved
                  - cell [ref=e370]:
                    - button "Delete" [ref=e372] [cursor=pointer]:
                      - img [ref=e373]
                - row "HP Hoa Pham 35 HR Penalty 774.602 ₫ 05/2026 Policy Violation 8/6/2026 Approved" [ref=e376]:
                  - cell "HP Hoa Pham 35 HR" [ref=e377]:
                    - generic [ref=e378]:
                      - generic [ref=e379]: HP
                      - generic [ref=e380]:
                        - paragraph [ref=e381]: Hoa Pham 35
                        - paragraph [ref=e382]: HR
                  - cell "Penalty" [ref=e383]:
                    - generic [ref=e384]:
                      - img [ref=e385]
                      - text: Penalty
                  - cell "774.602 ₫" [ref=e388]
                  - cell "05/2026" [ref=e389]
                  - cell "Policy Violation" [ref=e390]
                  - cell "8/6/2026" [ref=e391]
                  - cell "Approved" [ref=e392]:
                    - generic [ref=e393]: Approved
                  - cell [ref=e394]:
                    - button "Delete" [ref=e396] [cursor=pointer]:
                      - img [ref=e397]
                - row "LT Linh Tran 31 Sales Bonus 2.765.513 ₫ 03/2026 Excellent Performance 8/6/2026 Approved" [ref=e400]:
                  - cell "LT Linh Tran 31 Sales" [ref=e401]:
                    - generic [ref=e402]:
                      - generic [ref=e403]: LT
                      - generic [ref=e404]:
                        - paragraph [ref=e405]: Linh Tran 31
                        - paragraph [ref=e406]: Sales
                  - cell "Bonus" [ref=e407]:
                    - generic [ref=e408]:
                      - img [ref=e409]
                      - text: Bonus
                  - cell "2.765.513 ₫" [ref=e412]
                  - cell "03/2026" [ref=e413]
                  - cell "Excellent Performance" [ref=e414]
                  - cell "8/6/2026" [ref=e415]
                  - cell "Approved" [ref=e416]:
                    - generic [ref=e417]: Approved
                  - cell [ref=e418]:
                    - button "Delete" [ref=e420] [cursor=pointer]:
                      - img [ref=e421]
                - row "KV Khanh Vu 28 Engineering Bonus 856.607 ₫ 03/2026 Excellent Performance 8/6/2026 Approved" [ref=e424]:
                  - cell "KV Khanh Vu 28 Engineering" [ref=e425]:
                    - generic [ref=e426]:
                      - generic [ref=e427]: KV
                      - generic [ref=e428]:
                        - paragraph [ref=e429]: Khanh Vu 28
                        - paragraph [ref=e430]: Engineering
                  - cell "Bonus" [ref=e431]:
                    - generic [ref=e432]:
                      - img [ref=e433]
                      - text: Bonus
                  - cell "856.607 ₫" [ref=e436]
                  - cell "03/2026" [ref=e437]
                  - cell "Excellent Performance" [ref=e438]
                  - cell "8/6/2026" [ref=e439]
                  - cell "Approved" [ref=e440]:
                    - generic [ref=e441]: Approved
                  - cell [ref=e442]:
                    - button "Delete" [ref=e444] [cursor=pointer]:
                      - img [ref=e445]
                - row "MT Minh Tran 27 Marketing Penalty 974.461 ₫ 03/2026 Policy Violation 8/6/2026 Approved" [ref=e448]:
                  - cell "MT Minh Tran 27 Marketing" [ref=e449]:
                    - generic [ref=e450]:
                      - generic [ref=e451]: MT
                      - generic [ref=e452]:
                        - paragraph [ref=e453]: Minh Tran 27
                        - paragraph [ref=e454]: Marketing
                  - cell "Penalty" [ref=e455]:
                    - generic [ref=e456]:
                      - img [ref=e457]
                      - text: Penalty
                  - cell "974.461 ₫" [ref=e460]
                  - cell "03/2026" [ref=e461]
                  - cell "Policy Violation" [ref=e462]
                  - cell "8/6/2026" [ref=e463]
                  - cell "Approved" [ref=e464]:
                    - generic [ref=e465]: Approved
                  - cell [ref=e466]:
                    - button "Delete" [ref=e468] [cursor=pointer]:
                      - img [ref=e469]
                - row "DD Dung Dang 26 Marketing Bonus 1.868.555 ₫ 03/2026 Excellent Performance 8/6/2026 Approved" [ref=e472]:
                  - cell "DD Dung Dang 26 Marketing" [ref=e473]:
                    - generic [ref=e474]:
                      - generic [ref=e475]: DD
                      - generic [ref=e476]:
                        - paragraph [ref=e477]: Dung Dang 26
                        - paragraph [ref=e478]: Marketing
                  - cell "Bonus" [ref=e479]:
                    - generic [ref=e480]:
                      - img [ref=e481]
                      - text: Bonus
                  - cell "1.868.555 ₫" [ref=e484]
                  - cell "03/2026" [ref=e485]
                  - cell "Excellent Performance" [ref=e486]
                  - cell "8/6/2026" [ref=e487]
                  - cell "Approved" [ref=e488]:
                    - generic [ref=e489]: Approved
                  - cell [ref=e490]:
                    - button "Delete" [ref=e492] [cursor=pointer]:
                      - img [ref=e493]
                - row "GB Giang Bui 24 HR Bonus 506.032 ₫ 04/2026 Excellent Performance 8/6/2026 Approved" [ref=e496]:
                  - cell "GB Giang Bui 24 HR" [ref=e497]:
                    - generic [ref=e498]:
                      - generic [ref=e499]: GB
                      - generic [ref=e500]:
                        - paragraph [ref=e501]: Giang Bui 24
                        - paragraph [ref=e502]: HR
                  - cell "Bonus" [ref=e503]:
                    - generic [ref=e504]:
                      - img [ref=e505]
                      - text: Bonus
                  - cell "506.032 ₫" [ref=e508]
                  - cell "04/2026" [ref=e509]
                  - cell "Excellent Performance" [ref=e510]
                  - cell "8/6/2026" [ref=e511]
                  - cell "Approved" [ref=e512]:
                    - generic [ref=e513]: Approved
                  - cell [ref=e514]:
                    - button "Delete" [ref=e516] [cursor=pointer]:
                      - img [ref=e517]
                - row "GH Giang Hoang 22 Sales Penalty 2.892.952 ₫ 04/2026 Policy Violation 8/6/2026 Approved" [ref=e520]:
                  - cell "GH Giang Hoang 22 Sales" [ref=e521]:
                    - generic [ref=e522]:
                      - generic [ref=e523]: GH
                      - generic [ref=e524]:
                        - paragraph [ref=e525]: Giang Hoang 22
                        - paragraph [ref=e526]: Sales
                  - cell "Penalty" [ref=e527]:
                    - generic [ref=e528]:
                      - img [ref=e529]
                      - text: Penalty
                  - cell "2.892.952 ₫" [ref=e532]
                  - cell "04/2026" [ref=e533]
                  - cell "Policy Violation" [ref=e534]
                  - cell "8/6/2026" [ref=e535]
                  - cell "Approved" [ref=e536]:
                    - generic [ref=e537]: Approved
                  - cell [ref=e538]:
                    - button "Delete" [ref=e540] [cursor=pointer]:
                      - img [ref=e541]
                - row "DD Dung Do 17 Engineering Bonus 717.843 ₫ 04/2026 Excellent Performance 8/6/2026 Approved" [ref=e544]:
                  - cell "DD Dung Do 17 Engineering" [ref=e545]:
                    - generic [ref=e546]:
                      - generic [ref=e547]: DD
                      - generic [ref=e548]:
                        - paragraph [ref=e549]: Dung Do 17
                        - paragraph [ref=e550]: Engineering
                  - cell "Bonus" [ref=e551]:
                    - generic [ref=e552]:
                      - img [ref=e553]
                      - text: Bonus
                  - cell "717.843 ₫" [ref=e556]
                  - cell "04/2026" [ref=e557]
                  - cell "Excellent Performance" [ref=e558]
                  - cell "8/6/2026" [ref=e559]
                  - cell "Approved" [ref=e560]:
                    - generic [ref=e561]: Approved
                  - cell [ref=e562]:
                    - button "Delete" [ref=e564] [cursor=pointer]:
                      - img [ref=e565]
                - row "MV Minh Vo 16 Engineering Penalty 782.187 ₫ 05/2026 Policy Violation 8/6/2026 Approved" [ref=e568]:
                  - cell "MV Minh Vo 16 Engineering" [ref=e569]:
                    - generic [ref=e570]:
                      - generic [ref=e571]: MV
                      - generic [ref=e572]:
                        - paragraph [ref=e573]: Minh Vo 16
                        - paragraph [ref=e574]: Engineering
                  - cell "Penalty" [ref=e575]:
                    - generic [ref=e576]:
                      - img [ref=e577]
                      - text: Penalty
                  - cell "782.187 ₫" [ref=e580]
                  - cell "05/2026" [ref=e581]
                  - cell "Policy Violation" [ref=e582]
                  - cell "8/6/2026" [ref=e583]
                  - cell "Approved" [ref=e584]:
                    - generic [ref=e585]: Approved
                  - cell [ref=e586]:
                    - button "Delete" [ref=e588] [cursor=pointer]:
                      - img [ref=e589]
                - row "MP Minh Pham 8 Sales Bonus 2.194.139 ₫ 03/2026 Excellent Performance 8/6/2026 Approved" [ref=e592]:
                  - cell "MP Minh Pham 8 Sales" [ref=e593]:
                    - generic [ref=e594]:
                      - generic [ref=e595]: MP
                      - generic [ref=e596]:
                        - paragraph [ref=e597]: Minh Pham 8
                        - paragraph [ref=e598]: Sales
                  - cell "Bonus" [ref=e599]:
                    - generic [ref=e600]:
                      - img [ref=e601]
                      - text: Bonus
                  - cell "2.194.139 ₫" [ref=e604]
                  - cell "03/2026" [ref=e605]
                  - cell "Excellent Performance" [ref=e606]
                  - cell "8/6/2026" [ref=e607]
                  - cell "Approved" [ref=e608]:
                    - generic [ref=e609]: Approved
                  - cell [ref=e610]:
                    - button "Delete" [ref=e612] [cursor=pointer]:
                      - img [ref=e613]
  - alert [ref=e616]
```

# Test source

```ts
  16  |   test('TC_PAY_001 - Admin → Create Payroll via sidebar', async ({ adminPage: page }) => {
  17  |     await new Sidebar(page).navigateTo('Create Payroll');
  18  |     await page.waitForTimeout(1000);
  19  |     const gp = new PayrollGeneratePage(page);
  20  |     await expect(gp.pageTitle).toBeVisible({ timeout: 10000 });
  21  |   });
  22  | 
  23  |   test('TC_PAY_002 - Month/Year selectors hiển thị', async ({ adminPage: page }) => {
  24  |     const gp = new PayrollGeneratePage(page);
  25  |     await gp.goto();
  26  |     await gp.waitForPageLoad();
  27  |     await expect(gp.monthSelect).toBeVisible({ timeout: 5000 });
  28  |     await expect(gp.yearSelect).toBeVisible({ timeout: 5000 });
  29  |   });
  30  | 
  31  |   test('TC_PAY_003 - Nút Generate/Calculate hiển thị', async ({ adminPage: page }) => {
  32  |     const gp = new PayrollGeneratePage(page);
  33  |     await gp.goto();
  34  |     await gp.waitForPageLoad();
  35  |     await expect(gp.generateBtn.or(page.getByRole('button', { name: /Calculate|Tính|Generate|Tạo/i }))).toBeVisible({ timeout: 5000 });
  36  |   });
  37  | 
  38  |   test('TC_PAY_004 - Bảng payslip hiển thị', async ({ adminPage: page }) => {
  39  |     const gp = new PayrollGeneratePage(page);
  40  |     await gp.goto();
  41  |     await gp.waitForPageLoad();
  42  |     await page.waitForTimeout(3000);
  43  |     const hasTable = await gp.payslipTable.isVisible({ timeout: 3000 }).catch(() => false);
  44  |     const hasEmpty = await gp.emptyState.isVisible({ timeout: 3000 }).catch(() => false);
  45  |     const hasPreview = await page.getByText(/Preview payroll/i).isVisible({ timeout: 3000 }).catch(() => false);
  46  |     expect(hasTable || hasEmpty || hasPreview).toBeTruthy();
  47  |   });
  48  | 
  49  |   test('TC_PAY_005 - Summary cards hiển thị', async ({ adminPage: page }) => {
  50  |     const gp = new PayrollGeneratePage(page);
  51  |     await gp.goto();
  52  |     await gp.waitForPageLoad();
  53  |     await page.waitForTimeout(500);
  54  |     await expect(page.getByText(/Total Employees/i).first()).toBeVisible({ timeout: 5000 });
  55  |   });
  56  | 
  57  |   test('TC_PAY_006 - Employee bị chặn truy cập /admin/payroll', async ({ employeePage: page }) => {
  58  |     await page.goto('/admin/payroll/generate');
  59  |     await page.waitForTimeout(2000);
  60  | 
  61  |     const denied = await page.getByText(/Access Denied/i).isVisible().catch(() => false);
  62  |     const redirected = !page.url().includes('/admin/payroll');
  63  |     expect(denied || redirected).toBeTruthy();
  64  |   });
  65  | });
  66  | 
  67  | // ──────────────────────────────────────────────────────────────────────────────
  68  | // [M09] Payroll – Salary Configuration (TC_PAY_007 → TC_PAY_009)
  69  | // ──────────────────────────────────────────────────────────────────────────────
  70  | test.describe('[M09] Payroll - Salary Configuration', () => {
  71  | 
  72  |   test('TC_PAY_007 - Admin → Salary Configuration via sidebar', async ({ adminPage: page }) => {
  73  |     await new Sidebar(page).navigateTo('Salary Configuration');
  74  |     await page.waitForTimeout(1000);
  75  |     const cp = new PayrollConfigPage(page);
  76  |     await expect(cp.pageTitle).toBeVisible({ timeout: 10000 });
  77  |   });
  78  | 
  79  |   test('TC_PAY_008 - Salary config hiển thị danh sách', async ({ adminPage: page }) => {
  80  |     const cp = new PayrollConfigPage(page);
  81  |     await cp.goto();
  82  |     await cp.waitForPageLoad();
  83  |     await expect(cp.configTable).toBeVisible({ timeout: 10000 });
  84  |     const rows = await cp.getRowCount();
  85  |     expect(rows).toBeGreaterThan(0);
  86  |   });
  87  | 
  88  |   test('TC_PAY_009 - Nút Edit config hiển thị', async ({ adminPage: page }) => {
  89  |     const cp = new PayrollConfigPage(page);
  90  |     await cp.goto();
  91  |     await cp.waitForPageLoad();
  92  | 
  93  |     // Verify edit buttons exist in the table
  94  |     const editButtons = cp.configRows().first().locator('button, a, [role="button"]').filter({ has: page.locator('svg') }).first();
  95  |     await expect(editButtons).toBeVisible({ timeout: 5000 });
  96  |   });
  97  | });
  98  | 
  99  | // ──────────────────────────────────────────────────────────────────────────────
  100 | // [M09] Payroll – Salary Adjustment (TC_PAY_010 → TC_PAY_013)
  101 | // ──────────────────────────────────────────────────────────────────────────────
  102 | test.describe('[M09] Payroll - Salary Adjustment', () => {
  103 | 
  104 |   test('TC_PAY_010 - Admin → Salary Adjustment via sidebar', async ({ adminPage: page }) => {
  105 |     await new Sidebar(page).navigateTo('Salary Adjustment');
  106 |     await page.waitForTimeout(1000);
  107 |     const ap = new PayrollAdjustmentPage(page);
  108 |     await expect(ap.pageTitle).toBeVisible({ timeout: 10000 });
  109 |   });
  110 | 
  111 |   test('TC_PAY_011 - Adjustments page load được', async ({ adminPage: page }) => {
  112 |     const ap = new PayrollAdjustmentPage(page);
  113 |     await ap.goto();
  114 |     await ap.waitForPageLoad();
  115 |     await expect(ap.pageTitle).toBeVisible({ timeout: 5000 });
> 116 |     await expect(ap.createForm.or(ap.historyTable)).toBeVisible({ timeout: 5000 });
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  117 |   });
  118 | 
  119 |   test('TC_PAY_012 - Có nút Add Adjustment', async ({ adminPage: page }) => {
  120 |     const ap = new PayrollAdjustmentPage(page);
  121 |     await ap.goto();
  122 |     await ap.waitForPageLoad();
  123 |     await expect(ap.submitBtn).toBeVisible({ timeout: 5000 });
  124 |   });
  125 | 
  126 |   test('TC_PAY_013 - Có filter status', async ({ adminPage: page }) => {
  127 |     const ap = new PayrollAdjustmentPage(page);
  128 |     await ap.goto();
  129 |     await ap.waitForPageLoad();
  130 |     // Tab filters hoặc dropdown filter
  131 |     const hasTabs = await ap.tabAll.isVisible({ timeout: 3000 }).catch(() => false);
  132 |     const hasDropdown = await page.locator('select').filter({ hasText: /All|Status|Trạng thái/i }).first().isVisible({ timeout: 3000 }).catch(() => false);
  133 |     expect(hasTabs || hasDropdown).toBeTruthy();
  134 |   });
  135 | });
  136 | 
  137 | // ──────────────────────────────────────────────────────────────────────────────
  138 | // [M09] Payroll – Issue Payslips (TC_PAY_014 → TC_PAY_015)
  139 | // ──────────────────────────────────────────────────────────────────────────────
  140 | test.describe('[M09] Payroll - Issue Payslips', () => {
  141 | 
  142 |   test('TC_PAY_014 - Admin → Issue Payslips via sidebar', async ({ adminPage: page }) => {
  143 |     await new Sidebar(page).navigateTo('Issue Payslips');
  144 |     await page.waitForTimeout(1000);
  145 |     const ip = new PayrollIssuePage(page);
  146 |     await expect(ip.pageTitle).toBeVisible({ timeout: 10000 });
  147 |   });
  148 | 
  149 |   test('TC_PAY_015 - Issue page load được', async ({ adminPage: page }) => {
  150 |     const ip = new PayrollIssuePage(page);
  151 |     await ip.goto();
  152 |     await ip.waitForPageLoad();
  153 |     await expect(ip.monthSelect).toBeVisible({ timeout: 5000 });
  154 |     await expect(ip.yearSelect).toBeVisible({ timeout: 5000 });
  155 |     await expect(ip.sendBulkBtn).toBeVisible({ timeout: 5000 });
  156 | 
  157 |     const hasTable = await ip.payslipTable.isVisible({ timeout: 3000 }).catch(() => false);
  158 |     const hasEmpty = await page.getByText(/No payslips/i).isVisible({ timeout: 3000 }).catch(() => false);
  159 |     expect(hasTable || hasEmpty).toBeTruthy();
  160 |   });
  161 | });
  162 | 
  163 | // ──────────────────────────────────────────────────────────────────────────────
  164 | // [M09] Payroll – Employee (TC_PAY_016 → TC_PAY_018)
  165 | // ──────────────────────────────────────────────────────────────────────────────
  166 | test.describe('[M09] Payroll - Employee', () => {
  167 | 
  168 |   test('TC_PAY_016 - Employee → My Salary page loads', async ({ employeePage: page }) => {
  169 |     await page.goto('/dashboard/salary');
  170 |     await page.waitForLoadState('domcontentloaded');
  171 |     const sp = new EmployeeSalaryPage(page);
  172 |     await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
  173 |   });
  174 | 
  175 |   test('TC_PAY_017 - Bảng lịch sử payslip hiển thị', async ({ employeePage: page }) => {
  176 |     const sp = new EmployeeSalaryPage(page);
  177 |     await sp.goto();
  178 |     await sp.waitForPageLoad();
  179 |     await page.waitForTimeout(2000);
  180 |     const hasTable = await sp.payslipTable.isVisible({ timeout: 5000 }).catch(() => false);
  181 |     const hasCards = await page.locator('.card, [class*="card"], .border.rounded').first().isVisible({ timeout: 3000 }).catch(() => false);
  182 |     expect(hasTable || hasCards).toBeTruthy();
  183 |   });
  184 | 
  185 |   test('TC_PAY_018 - Nút View payslip detail', async ({ employeePage: page }) => {
  186 |     const sp = new EmployeeSalaryPage(page);
  187 |     await sp.goto();
  188 |     await sp.waitForPageLoad();
  189 | 
  190 |     const hasTable = await sp.payslipTable.isVisible({ timeout: 5000 }).catch(() => false);
  191 |     if (!hasTable) { test.skip(true, 'No payslip table'); return; }
  192 | 
  193 |     const viewCount = await sp.viewBtns.count();
  194 |     if (viewCount > 0) {
  195 |       await sp.viewBtns.first().click();
  196 |       await page.waitForTimeout(500);
  197 |       await expect(sp.detailModal).toBeVisible({ timeout: 5000 });
  198 |       await page.keyboard.press('Escape');
  199 |     }
  200 |   });
  201 | });
  202 | 
  203 | // ──────────────────────────────────────────────────────────────────────────────
  204 | // [M09] Payroll – E2E Workflows (TC_PAY_019 → TC_PAY_024)
  205 | // ──────────────────────────────────────────────────────────────────────────────
  206 | test.describe('[M09] Payroll - E2E Workflows', () => {
  207 | 
  208 |   test('TC_PAY_019 - Cập nhật cấu hình lương (Salary Config)', async ({ adminPage: page }) => {
  209 |     const cp = new PayrollConfigPage(page);
  210 |     await cp.goto();
  211 |     await cp.waitForPageLoad();
  212 | 
  213 |     // Find and click edit button on the first row
  214 |     const firstRow = cp.configRows().first();
  215 |     const editBtn = firstRow.locator('button').first();
  216 |     const editBtnCount = await editBtn.count();
```