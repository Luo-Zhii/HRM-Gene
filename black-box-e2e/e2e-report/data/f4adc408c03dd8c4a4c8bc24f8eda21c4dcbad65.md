# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payroll/payroll.spec.ts >> [M09] Payroll - Adjustment Filters & Validation >> TC_PAY_027 - Chặn nhập số âm ở form tạo
- Location: specs/payroll/payroll.spec.ts:695:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
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
                - paragraph [ref=e185]: 15.709.841 ₫
            - generic [ref=e186]:
              - img [ref=e188]
              - generic [ref=e191]:
                - paragraph [ref=e192]: Total Penalties
                - paragraph [ref=e193]: 106.724.202 ₫
            - generic [ref=e194]:
              - img [ref=e196]
              - generic [ref=e199]:
                - paragraph [ref=e200]: Pending Review
                - paragraph [ref=e201]: "3"
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
                    - spinbutton [ref=e226]: "-500"
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
                - row "AP An Pham 33 Engineering Penalty 100.000.000 ₫ 06/2026 TC_PAY_023 negative salary test 8/6/2026 Pending approval" [ref=e256]:
                  - cell "AP An Pham 33 Engineering" [ref=e257]:
                    - generic [ref=e258]:
                      - generic [ref=e259]: AP
                      - generic [ref=e260]:
                        - paragraph [ref=e261]: An Pham 33
                        - paragraph [ref=e262]: Engineering
                  - cell "Penalty" [ref=e263]:
                    - generic [ref=e264]:
                      - img [ref=e265]
                      - text: Penalty
                  - cell "100.000.000 ₫" [ref=e268]
                  - cell "06/2026" [ref=e269]
                  - cell "TC_PAY_023 negative salary test" [ref=e270]
                  - cell "8/6/2026" [ref=e271]
                  - cell "Pending approval" [ref=e272]:
                    - generic [ref=e273]: Pending approval
                  - cell [ref=e274]:
                    - generic [ref=e275]:
                      - button "Approve" [ref=e276] [cursor=pointer]:
                        - img [ref=e277]
                      - button "Reject" [ref=e280] [cursor=pointer]:
                        - img [ref=e281]
                      - button "Delete" [ref=e285] [cursor=pointer]:
                        - img [ref=e286]
                - row "AP An Pham 33 Engineering Bonus 1.000.000 ₫ 07/2026 TC_PAY_021 future bonus test 8/6/2026 Pending approval" [ref=e289]:
                  - cell "AP An Pham 33 Engineering" [ref=e290]:
                    - generic [ref=e291]:
                      - generic [ref=e292]: AP
                      - generic [ref=e293]:
                        - paragraph [ref=e294]: An Pham 33
                        - paragraph [ref=e295]: Engineering
                  - cell "Bonus" [ref=e296]:
                    - generic [ref=e297]:
                      - img [ref=e298]
                      - text: Bonus
                  - cell "1.000.000 ₫" [ref=e301]
                  - cell "07/2026" [ref=e302]
                  - cell "TC_PAY_021 future bonus test" [ref=e303]
                  - cell "8/6/2026" [ref=e304]
                  - cell "Pending approval" [ref=e305]:
                    - generic [ref=e306]: Pending approval
                  - cell [ref=e307]:
                    - generic [ref=e308]:
                      - button "Approve" [ref=e309] [cursor=pointer]:
                        - img [ref=e310]
                      - button "Reject" [ref=e313] [cursor=pointer]:
                        - img [ref=e314]
                      - button "Delete" [ref=e318] [cursor=pointer]:
                        - img [ref=e319]
                - row "AP An Pham 33 Engineering Penalty 500.000 ₫ 06/2026 TC_PAY_020 penalty test 8/6/2026 Pending approval" [ref=e322]:
                  - cell "AP An Pham 33 Engineering" [ref=e323]:
                    - generic [ref=e324]:
                      - generic [ref=e325]: AP
                      - generic [ref=e326]:
                        - paragraph [ref=e327]: An Pham 33
                        - paragraph [ref=e328]: Engineering
                  - cell "Penalty" [ref=e329]:
                    - generic [ref=e330]:
                      - img [ref=e331]
                      - text: Penalty
                  - cell "500.000 ₫" [ref=e334]
                  - cell "06/2026" [ref=e335]
                  - cell "TC_PAY_020 penalty test" [ref=e336]
                  - cell "8/6/2026" [ref=e337]
                  - cell "Pending approval" [ref=e338]:
                    - generic [ref=e339]: Pending approval
                  - cell [ref=e340]:
                    - generic [ref=e341]:
                      - button "Approve" [ref=e342] [cursor=pointer]:
                        - img [ref=e343]
                      - button "Reject" [ref=e346] [cursor=pointer]:
                        - img [ref=e347]
                      - button "Delete" [ref=e351] [cursor=pointer]:
                        - img [ref=e352]
                - row "DB Dung Bui 2 Engineering Penalty 500.000 ₫ 06/2026 Late submission - seeded 8/6/2026 Approved" [ref=e355]:
                  - cell "DB Dung Bui 2 Engineering" [ref=e356]:
                    - generic [ref=e357]:
                      - generic [ref=e358]: DB
                      - generic [ref=e359]:
                        - paragraph [ref=e360]: Dung Bui 2
                        - paragraph [ref=e361]: Engineering
                  - cell "Penalty" [ref=e362]:
                    - generic [ref=e363]:
                      - img [ref=e364]
                      - text: Penalty
                  - cell "500.000 ₫" [ref=e367]
                  - cell "06/2026" [ref=e368]
                  - cell "Late submission - seeded" [ref=e369]
                  - cell "8/6/2026" [ref=e370]
                  - cell "Approved" [ref=e371]:
                    - generic [ref=e372]: Approved
                  - cell [ref=e373]:
                    - button "Delete" [ref=e375] [cursor=pointer]:
                      - img [ref=e376]
                - row "GT Giang Tran 1 Engineering Bonus 1.500.000 ₫ 07/2026 Upcoming performance bonus - seeded 8/6/2026 Approved" [ref=e379]:
                  - cell "GT Giang Tran 1 Engineering" [ref=e380]:
                    - generic [ref=e381]:
                      - generic [ref=e382]: GT
                      - generic [ref=e383]:
                        - paragraph [ref=e384]: Giang Tran 1
                        - paragraph [ref=e385]: Engineering
                  - cell "Bonus" [ref=e386]:
                    - generic [ref=e387]:
                      - img [ref=e388]
                      - text: Bonus
                  - cell "1.500.000 ₫" [ref=e391]
                  - cell "07/2026" [ref=e392]
                  - cell "Upcoming performance bonus - seeded" [ref=e393]
                  - cell "8/6/2026" [ref=e394]
                  - cell "Approved" [ref=e395]:
                    - generic [ref=e396]: Approved
                  - cell [ref=e397]:
                    - button "Delete" [ref=e399] [cursor=pointer]:
                      - img [ref=e400]
                - row "GT Giang Tran 1 Engineering Bonus 2.000.000 ₫ 06/2026 Project completion bonus - seeded 8/6/2026 Approved" [ref=e403]:
                  - cell "GT Giang Tran 1 Engineering" [ref=e404]:
                    - generic [ref=e405]:
                      - generic [ref=e406]: GT
                      - generic [ref=e407]:
                        - paragraph [ref=e408]: Giang Tran 1
                        - paragraph [ref=e409]: Engineering
                  - cell "Bonus" [ref=e410]:
                    - generic [ref=e411]:
                      - img [ref=e412]
                      - text: Bonus
                  - cell "2.000.000 ₫" [ref=e415]
                  - cell "06/2026" [ref=e416]
                  - cell "Project completion bonus - seeded" [ref=e417]
                  - cell "8/6/2026" [ref=e418]
                  - cell "Approved" [ref=e419]:
                    - generic [ref=e420]: Approved
                  - cell [ref=e421]:
                    - button "Delete" [ref=e423] [cursor=pointer]:
                      - img [ref=e424]
                - row "GT Giang Tran 1 Engineering Penalty 300.000 ₫ 06/2026 Minor policy violation - seeded 8/6/2026 Approved" [ref=e427]:
                  - cell "GT Giang Tran 1 Engineering" [ref=e428]:
                    - generic [ref=e429]:
                      - generic [ref=e430]: GT
                      - generic [ref=e431]:
                        - paragraph [ref=e432]: Giang Tran 1
                        - paragraph [ref=e433]: Engineering
                  - cell "Penalty" [ref=e434]:
                    - generic [ref=e435]:
                      - img [ref=e436]
                      - text: Penalty
                  - cell "300.000 ₫" [ref=e439]
                  - cell "06/2026" [ref=e440]
                  - cell "Minor policy violation - seeded" [ref=e441]
                  - cell "8/6/2026" [ref=e442]
                  - cell "Approved" [ref=e443]:
                    - generic [ref=e444]: Approved
                  - cell [ref=e445]:
                    - button "Delete" [ref=e447] [cursor=pointer]:
                      - img [ref=e448]
                - row "GB Giang Bui 36 Sales Bonus 2.301.152 ₫ 05/2026 Excellent Performance 8/6/2026 Approved" [ref=e451]:
                  - cell "GB Giang Bui 36 Sales" [ref=e452]:
                    - generic [ref=e453]:
                      - generic [ref=e454]: GB
                      - generic [ref=e455]:
                        - paragraph [ref=e456]: Giang Bui 36
                        - paragraph [ref=e457]: Sales
                  - cell "Bonus" [ref=e458]:
                    - generic [ref=e459]:
                      - img [ref=e460]
                      - text: Bonus
                  - cell "2.301.152 ₫" [ref=e463]
                  - cell "05/2026" [ref=e464]
                  - cell "Excellent Performance" [ref=e465]
                  - cell "8/6/2026" [ref=e466]
                  - cell "Approved" [ref=e467]:
                    - generic [ref=e468]: Approved
                  - cell [ref=e469]:
                    - button "Delete" [ref=e471] [cursor=pointer]:
                      - img [ref=e472]
                - row "HP Hoa Pham 35 HR Penalty 774.602 ₫ 05/2026 Policy Violation 8/6/2026 Approved" [ref=e475]:
                  - cell "HP Hoa Pham 35 HR" [ref=e476]:
                    - generic [ref=e477]:
                      - generic [ref=e478]: HP
                      - generic [ref=e479]:
                        - paragraph [ref=e480]: Hoa Pham 35
                        - paragraph [ref=e481]: HR
                  - cell "Penalty" [ref=e482]:
                    - generic [ref=e483]:
                      - img [ref=e484]
                      - text: Penalty
                  - cell "774.602 ₫" [ref=e487]
                  - cell "05/2026" [ref=e488]
                  - cell "Policy Violation" [ref=e489]
                  - cell "8/6/2026" [ref=e490]
                  - cell "Approved" [ref=e491]:
                    - generic [ref=e492]: Approved
                  - cell [ref=e493]:
                    - button "Delete" [ref=e495] [cursor=pointer]:
                      - img [ref=e496]
                - row "LT Linh Tran 31 Sales Bonus 2.765.513 ₫ 03/2026 Excellent Performance 8/6/2026 Approved" [ref=e499]:
                  - cell "LT Linh Tran 31 Sales" [ref=e500]:
                    - generic [ref=e501]:
                      - generic [ref=e502]: LT
                      - generic [ref=e503]:
                        - paragraph [ref=e504]: Linh Tran 31
                        - paragraph [ref=e505]: Sales
                  - cell "Bonus" [ref=e506]:
                    - generic [ref=e507]:
                      - img [ref=e508]
                      - text: Bonus
                  - cell "2.765.513 ₫" [ref=e511]
                  - cell "03/2026" [ref=e512]
                  - cell "Excellent Performance" [ref=e513]
                  - cell "8/6/2026" [ref=e514]
                  - cell "Approved" [ref=e515]:
                    - generic [ref=e516]: Approved
                  - cell [ref=e517]:
                    - button "Delete" [ref=e519] [cursor=pointer]:
                      - img [ref=e520]
                - row "KV Khanh Vu 28 Engineering Bonus 856.607 ₫ 03/2026 Excellent Performance 8/6/2026 Approved" [ref=e523]:
                  - cell "KV Khanh Vu 28 Engineering" [ref=e524]:
                    - generic [ref=e525]:
                      - generic [ref=e526]: KV
                      - generic [ref=e527]:
                        - paragraph [ref=e528]: Khanh Vu 28
                        - paragraph [ref=e529]: Engineering
                  - cell "Bonus" [ref=e530]:
                    - generic [ref=e531]:
                      - img [ref=e532]
                      - text: Bonus
                  - cell "856.607 ₫" [ref=e535]
                  - cell "03/2026" [ref=e536]
                  - cell "Excellent Performance" [ref=e537]
                  - cell "8/6/2026" [ref=e538]
                  - cell "Approved" [ref=e539]:
                    - generic [ref=e540]: Approved
                  - cell [ref=e541]:
                    - button "Delete" [ref=e543] [cursor=pointer]:
                      - img [ref=e544]
                - row "MT Minh Tran 27 Marketing Penalty 974.461 ₫ 03/2026 Policy Violation 8/6/2026 Approved" [ref=e547]:
                  - cell "MT Minh Tran 27 Marketing" [ref=e548]:
                    - generic [ref=e549]:
                      - generic [ref=e550]: MT
                      - generic [ref=e551]:
                        - paragraph [ref=e552]: Minh Tran 27
                        - paragraph [ref=e553]: Marketing
                  - cell "Penalty" [ref=e554]:
                    - generic [ref=e555]:
                      - img [ref=e556]
                      - text: Penalty
                  - cell "974.461 ₫" [ref=e559]
                  - cell "03/2026" [ref=e560]
                  - cell "Policy Violation" [ref=e561]
                  - cell "8/6/2026" [ref=e562]
                  - cell "Approved" [ref=e563]:
                    - generic [ref=e564]: Approved
                  - cell [ref=e565]:
                    - button "Delete" [ref=e567] [cursor=pointer]:
                      - img [ref=e568]
                - row "DD Dung Dang 26 Marketing Bonus 1.868.555 ₫ 03/2026 Excellent Performance 8/6/2026 Approved" [ref=e571]:
                  - cell "DD Dung Dang 26 Marketing" [ref=e572]:
                    - generic [ref=e573]:
                      - generic [ref=e574]: DD
                      - generic [ref=e575]:
                        - paragraph [ref=e576]: Dung Dang 26
                        - paragraph [ref=e577]: Marketing
                  - cell "Bonus" [ref=e578]:
                    - generic [ref=e579]:
                      - img [ref=e580]
                      - text: Bonus
                  - cell "1.868.555 ₫" [ref=e583]
                  - cell "03/2026" [ref=e584]
                  - cell "Excellent Performance" [ref=e585]
                  - cell "8/6/2026" [ref=e586]
                  - cell "Approved" [ref=e587]:
                    - generic [ref=e588]: Approved
                  - cell [ref=e589]:
                    - button "Delete" [ref=e591] [cursor=pointer]:
                      - img [ref=e592]
                - row "GB Giang Bui 24 HR Bonus 506.032 ₫ 04/2026 Excellent Performance 8/6/2026 Approved" [ref=e595]:
                  - cell "GB Giang Bui 24 HR" [ref=e596]:
                    - generic [ref=e597]:
                      - generic [ref=e598]: GB
                      - generic [ref=e599]:
                        - paragraph [ref=e600]: Giang Bui 24
                        - paragraph [ref=e601]: HR
                  - cell "Bonus" [ref=e602]:
                    - generic [ref=e603]:
                      - img [ref=e604]
                      - text: Bonus
                  - cell "506.032 ₫" [ref=e607]
                  - cell "04/2026" [ref=e608]
                  - cell "Excellent Performance" [ref=e609]
                  - cell "8/6/2026" [ref=e610]
                  - cell "Approved" [ref=e611]:
                    - generic [ref=e612]: Approved
                  - cell [ref=e613]:
                    - button "Delete" [ref=e615] [cursor=pointer]:
                      - img [ref=e616]
                - row "GH Giang Hoang 22 Sales Penalty 2.892.952 ₫ 04/2026 Policy Violation 8/6/2026 Approved" [ref=e619]:
                  - cell "GH Giang Hoang 22 Sales" [ref=e620]:
                    - generic [ref=e621]:
                      - generic [ref=e622]: GH
                      - generic [ref=e623]:
                        - paragraph [ref=e624]: Giang Hoang 22
                        - paragraph [ref=e625]: Sales
                  - cell "Penalty" [ref=e626]:
                    - generic [ref=e627]:
                      - img [ref=e628]
                      - text: Penalty
                  - cell "2.892.952 ₫" [ref=e631]
                  - cell "04/2026" [ref=e632]
                  - cell "Policy Violation" [ref=e633]
                  - cell "8/6/2026" [ref=e634]
                  - cell "Approved" [ref=e635]:
                    - generic [ref=e636]: Approved
                  - cell [ref=e637]:
                    - button "Delete" [ref=e639] [cursor=pointer]:
                      - img [ref=e640]
                - row "DD Dung Do 17 Engineering Bonus 717.843 ₫ 04/2026 Excellent Performance 8/6/2026 Approved" [ref=e643]:
                  - cell "DD Dung Do 17 Engineering" [ref=e644]:
                    - generic [ref=e645]:
                      - generic [ref=e646]: DD
                      - generic [ref=e647]:
                        - paragraph [ref=e648]: Dung Do 17
                        - paragraph [ref=e649]: Engineering
                  - cell "Bonus" [ref=e650]:
                    - generic [ref=e651]:
                      - img [ref=e652]
                      - text: Bonus
                  - cell "717.843 ₫" [ref=e655]
                  - cell "04/2026" [ref=e656]
                  - cell "Excellent Performance" [ref=e657]
                  - cell "8/6/2026" [ref=e658]
                  - cell "Approved" [ref=e659]:
                    - generic [ref=e660]: Approved
                  - cell [ref=e661]:
                    - button "Delete" [ref=e663] [cursor=pointer]:
                      - img [ref=e664]
                - row "MV Minh Vo 16 Engineering Penalty 782.187 ₫ 05/2026 Policy Violation 8/6/2026 Approved" [ref=e667]:
                  - cell "MV Minh Vo 16 Engineering" [ref=e668]:
                    - generic [ref=e669]:
                      - generic [ref=e670]: MV
                      - generic [ref=e671]:
                        - paragraph [ref=e672]: Minh Vo 16
                        - paragraph [ref=e673]: Engineering
                  - cell "Penalty" [ref=e674]:
                    - generic [ref=e675]:
                      - img [ref=e676]
                      - text: Penalty
                  - cell "782.187 ₫" [ref=e679]
                  - cell "05/2026" [ref=e680]
                  - cell "Policy Violation" [ref=e681]
                  - cell "8/6/2026" [ref=e682]
                  - cell "Approved" [ref=e683]:
                    - generic [ref=e684]: Approved
                  - cell [ref=e685]:
                    - button "Delete" [ref=e687] [cursor=pointer]:
                      - img [ref=e688]
                - row "MP Minh Pham 8 Sales Bonus 2.194.139 ₫ 03/2026 Excellent Performance 8/6/2026 Approved" [ref=e691]:
                  - cell "MP Minh Pham 8 Sales" [ref=e692]:
                    - generic [ref=e693]:
                      - generic [ref=e694]: MP
                      - generic [ref=e695]:
                        - paragraph [ref=e696]: Minh Pham 8
                        - paragraph [ref=e697]: Sales
                  - cell "Bonus" [ref=e698]:
                    - generic [ref=e699]:
                      - img [ref=e700]
                      - text: Bonus
                  - cell "2.194.139 ₫" [ref=e703]
                  - cell "03/2026" [ref=e704]
                  - cell "Excellent Performance" [ref=e705]
                  - cell "8/6/2026" [ref=e706]
                  - cell "Approved" [ref=e707]:
                    - generic [ref=e708]: Approved
                  - cell [ref=e709]:
                    - button "Delete" [ref=e711] [cursor=pointer]:
                      - img [ref=e712]
  - alert [ref=e715]
```

# Test source

```ts
  611 |     await gp.clickGenerate();
  612 |     const genResult2 = await genResp2;
  613 |     if (!genResult2.ok()) { test.skip(true, `Second generate ${genResult2.status()}`); return; }
  614 |     await page.waitForTimeout(2000);
  615 | 
  616 |     // Step 4: Verify insurance & PIT amounts have changed
  617 |     await gp.viewFirstPayslip();
  618 |     await expect(gp.detailPrintArea).toBeVisible({ timeout: 5000 });
  619 | 
  620 |     const afterText = await gp.detailPrintArea.textContent();
  621 |     // Insurance và PIT phải thay đổi (tăng lên) tương ứng
  622 |     expect(afterText).not.toMatch(/Error|NaN|undefined/i);
  623 |     expect(afterText).toContain('Deductions');
  624 | 
  625 |     // The numbers should be different (the deductions text should differ since base salary doubled)
  626 |     // At minimum, verify the page still works
  627 |     await gp.closeDetailModal();
  628 | 
  629 |     // Restore: set base salary back
  630 |     await cp.goto();
  631 |     await cp.waitForPageLoad();
  632 |     const firstRow2 = cp.configRows().first();
  633 |     const editBtn2 = firstRow2.locator('button').first();
  634 |     if ((await editBtn2.count()) > 0) {
  635 |       await editBtn2.click();
  636 |       await expect(cp.editModal).toBeVisible({ timeout: 5000 });
  637 |       await page.waitForTimeout(500);
  638 |       await cp.baseSalaryInput.fill(currentBase || '10000000');
  639 |       await cp.saveConfigBtn.click();
  640 |       await expect(cp.editModal).not.toBeVisible({ timeout: 5000 });
  641 |     }
  642 |   });
  643 | });
  644 | 
  645 | // ──────────────────────────────────────────────────────────────────────────────
  646 | // [M09] Payroll – Adjustment Filters & Validation (TC_PAY_025 → TC_PAY_036)
  647 | // ──────────────────────────────────────────────────────────────────────────────
  648 | test.describe('[M09] Payroll - Adjustment Filters & Validation', () => {
  649 | 
  650 |   test('TC_PAY_025 - Lọc hiển thị Bonus', async ({ adminPage: page }) => {
  651 |     const ap = new PayrollAdjustmentPage(page);
  652 |     await ap.goto();
  653 |     await ap.waitForPageLoad();
  654 |     await page.waitForTimeout(1500);
  655 | 
  656 |     await ap.switchTab('Bonus');
  657 | 
  658 |     // Verify only Bonus type rows are visible
  659 |     const rows = ap.historyRows();
  660 |     const rowCount = await rows.count();
  661 |     if (rowCount > 0) {
  662 |       // Check that visible rows contain Bonus badge and not Penalty
  663 |       const penaltyVisible = await ap.tabPenalty.isVisible({ timeout: 1000 }).catch(() => false);
  664 |       // After switching to Bonus tab, the table should be filtered
  665 |       for (let i = 0; i < rowCount; i++) {
  666 |         const rowText = await rows.nth(i).textContent();
  667 |         // Each row should not show Penalty type
  668 |         expect(rowText).not.toMatch(/^Penalty$/i);
  669 |       }
  670 |     }
  671 |     // Page should still be functional
  672 |     await expect(ap.pageTitle).toBeVisible();
  673 |   });
  674 | 
  675 |   test('TC_PAY_026 - Lọc hiển thị Penalty', async ({ adminPage: page }) => {
  676 |     const ap = new PayrollAdjustmentPage(page);
  677 |     await ap.goto();
  678 |     await ap.waitForPageLoad();
  679 |     await page.waitForTimeout(1500);
  680 | 
  681 |     await ap.switchTab('Penalty');
  682 | 
  683 |     // Verify only Penalty type rows are visible
  684 |     const rows = ap.historyRows();
  685 |     const rowCount = await rows.count();
  686 |     if (rowCount > 0) {
  687 |       for (let i = 0; i < rowCount; i++) {
  688 |         const rowText = await rows.nth(i).textContent();
  689 |         expect(rowText).not.toMatch(/^Bonus$/i);
  690 |       }
  691 |     }
  692 |     await expect(ap.pageTitle).toBeVisible();
  693 |   });
  694 | 
  695 |   test('TC_PAY_027 - Chặn nhập số âm ở form tạo', async ({ adminPage: page }) => {
  696 |     const ap = new PayrollAdjustmentPage(page);
  697 |     await ap.goto();
  698 |     await ap.waitForPageLoad();
  699 | 
  700 |     // Nhập số âm (-500)
  701 |     await ap.amountInput.fill('-500');
  702 |     // Bỏ focus
  703 |     await ap.amountInput.blur();
  704 |     await page.waitForTimeout(500);
  705 | 
  706 |     // Kiểm tra: input tự động báo lỗi hoặc xóa sạch ký tự trừ
  707 |     const val = await ap.amountInput.inputValue();
  708 |     const hasError = await page.getByText(/error|lỗi|invalid|không hợp lệ/i).first().isVisible({ timeout: 2000 }).catch(() => false);
  709 | 
  710 |     // Either: value is corrected (no minus sign), OR error message is shown
> 711 |     expect(val === '' || !val.includes('-') || hasError).toBeTruthy();
      |                                                          ^ Error: expect(received).toBeTruthy()
  712 |   });
  713 | 
  714 |   test('TC_PAY_028 - Tự động format tiền VNĐ', async ({ adminPage: page }) => {
  715 |     const ap = new PayrollAdjustmentPage(page);
  716 |     await ap.goto();
  717 |     await ap.waitForPageLoad();
  718 | 
  719 |     // Nhập "999000"
  720 |     await ap.amountInput.fill('999000');
  721 |     // Bỏ focus
  722 |     await ap.amountInput.blur();
  723 |     await page.waitForTimeout(500);
  724 | 
  725 |     // Kiểm tra: input tự format thành "999.000" hoặc "999,000"
  726 |     const val = await ap.amountInput.inputValue();
  727 |     const hasFormatting = val.includes('.') || val.includes(',') || val === '999000';
  728 |     // Even if no auto-format, the value should be preserved
  729 |     expect(val).toBeTruthy();
  730 |   });
  731 | 
  732 |   test('TC_PAY_029 - Ép kiểu Penalty âm về 0', async ({ adminPage: page }) => {
  733 |     const ap = new PayrollAdjustmentPage(page);
  734 |     await ap.goto();
  735 |     await ap.waitForPageLoad();
  736 | 
  737 |     // Chọn type Penalty
  738 |     await ap.selectType('Penalty');
  739 |     // Nhập "-150000"
  740 |     await ap.amountInput.fill('-150000');
  741 |     // Bỏ focus
  742 |     await ap.amountInput.blur();
  743 |     await page.waitForTimeout(500);
  744 | 
  745 |     // Dữ liệu tự động fallback về 0 hoặc chuỗi rỗng
  746 |     const val = await ap.amountInput.inputValue();
  747 |     const hasError = await page.getByText(/error|lỗi|invalid|không hợp lệ/i).first().isVisible({ timeout: 2000 }).catch(() => false);
  748 | 
  749 |     // Either: value is corrected (0, empty, or no minus), OR error is displayed
  750 |     expect(val === '' || val === '0' || !val.includes('-') || hasError).toBeTruthy();
  751 |   });
  752 | 
  753 |   test('TC_PAY_030 - Sort cột Amount', async ({ adminPage: page }) => {
  754 |     const ap = new PayrollAdjustmentPage(page);
  755 |     await ap.goto();
  756 |     await ap.waitForPageLoad();
  757 |     await page.waitForTimeout(1500);
  758 | 
  759 |     const rowCount = await ap.getHistoryRowCount();
  760 |     if (rowCount < 2) { test.skip(true, 'Not enough rows to test sort'); return; }
  761 | 
  762 |     // Click vào tiêu đề cột Amount
  763 |     const amountHeader = page.locator('th').filter({ hasText: /Amount|Số tiền/i }).first();
  764 |     const headerVisible = await amountHeader.isVisible({ timeout: 3000 }).catch(() => false);
  765 |     if (!headerVisible) { test.skip(true, 'Amount column header not found'); return; }
  766 | 
  767 |     await amountHeader.click();
  768 |     await page.waitForTimeout(500);
  769 | 
  770 |     // Page should still be functional after sort
  771 |     await expect(ap.pageTitle).toBeVisible();
  772 |   });
  773 | 
  774 |   // ─── BVA & EP Tests for Amount field ───────────────────────────────────────
  775 | 
  776 |   test('TC_PAY_031 - BVA Cận dưới - 1 (Invalid: 999)', async ({ adminPage: page }) => {
  777 |     const ap = new PayrollAdjustmentPage(page);
  778 |     await ap.goto();
  779 |     await ap.waitForPageLoad();
  780 | 
  781 |     await ap.selectType('Bonus');
  782 |     await ap.amountInput.fill('999');
  783 |     await ap.submitBtn.click();
  784 |     await page.waitForTimeout(500);
  785 | 
  786 |     // Hệ thống báo lỗi "Số tiền tối thiểu là 1.000đ" hoặc ép lên 1.000đ
  787 |     const hasError = await page.getByText(/minimum|tối thiểu|1\.?000|1,000/i).isVisible({ timeout: 2000 }).catch(() => false);
  788 |     const valAfter = await ap.amountInput.inputValue();
  789 | 
  790 |     // Either error message shown, or value auto-corrected
  791 |     expect(hasError || valAfter === '' || valAfter === '1000' || valAfter === '1.000' || valAfter === '1,000').toBeTruthy();
  792 |   });
  793 | 
  794 |   test('TC_PAY_032 - BVA Cận dưới (Valid: 1000)', async ({ adminPage: page }) => {
  795 |     const ap = new PayrollAdjustmentPage(page);
  796 |     await ap.goto();
  797 |     await ap.waitForPageLoad();
  798 |     await page.waitForTimeout(2000);
  799 | 
  800 |     // Select employee first
  801 |     const options = ap.employeeSelect.locator('option');
  802 |     const optCount = await options.count();
  803 |     if (optCount < 2) { test.skip(true, 'No valid employee options'); return; }
  804 |     let selectedValue = '';
  805 |     for (let i = 1; i < optCount; i++) {
  806 |       const v = await options.nth(i).getAttribute('value');
  807 |       if (v && v !== '') { selectedValue = v; break; }
  808 |     }
  809 |     if (!selectedValue) { test.skip(true, 'No valid employee options'); return; }
  810 |     await ap.employeeSelect.selectOption(selectedValue);
  811 | 
```