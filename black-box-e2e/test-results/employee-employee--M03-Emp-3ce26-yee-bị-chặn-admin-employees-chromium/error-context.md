# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: employee/employee.spec.ts >> [M03] Employee Management - Access Control >> TC_EMP_014 - Employee bị chặn /admin/employees
- Location: specs/employee/employee.spec.ts:127:7

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
        - generic [ref=e40]:
          - button "People" [ref=e41] [cursor=pointer]:
            - generic [ref=e42]:
              - img [ref=e44]
              - generic [ref=e48]: People
            - img [ref=e49]
          - generic [ref=e51]:
            - link "Employee Directory" [ref=e52] [cursor=pointer]:
              - /url: /admin/employees
              - img [ref=e53]
              - generic [ref=e57]: Employee Directory
            - link "Employment Contract" [ref=e58] [cursor=pointer]:
              - /url: /admin/contracts
              - img [ref=e59]
              - generic [ref=e63]: Employment Contract
            - link "Organizational Management" [ref=e64] [cursor=pointer]:
              - /url: /admin/organization
              - img [ref=e65]
              - generic [ref=e69]: Organizational Management
            - link "Discipline" [ref=e70] [cursor=pointer]:
              - /url: /admin/discipline
              - img [ref=e71]
              - generic [ref=e73]: Discipline
        - button "Attend & Leave" [ref=e75] [cursor=pointer]:
          - generic [ref=e76]:
            - img [ref=e78]
            - generic [ref=e80]: Attend & Leave
          - img [ref=e81]
        - button "Performance" [ref=e84] [cursor=pointer]:
          - generic [ref=e85]:
            - img [ref=e87]
            - generic [ref=e90]: Performance
          - img [ref=e91]
        - button "Communication" [ref=e94] [cursor=pointer]:
          - generic [ref=e95]:
            - img [ref=e97]
            - generic [ref=e103]: Communication
          - img [ref=e104]
        - button "Analytics" [ref=e107] [cursor=pointer]:
          - generic [ref=e108]:
            - img [ref=e110]
            - generic [ref=e113]: Analytics
          - img [ref=e114]
      - link "System Settings" [ref=e117] [cursor=pointer]:
        - /url: /admin/settings
        - img [ref=e118]
        - generic [ref=e129]: System Settings
    - generic [ref=e130]:
      - banner [ref=e131]:
        - generic [ref=e132]:
          - generic [ref=e134]:
            - img [ref=e135]
            - textbox "Search pages & features..." [ref=e138]
          - button "🇬🇧 EN" [ref=e139] [cursor=pointer]:
            - img [ref=e140]
            - generic [ref=e143]: 🇬🇧
            - generic [ref=e144]: EN
          - button "1" [ref=e146] [cursor=pointer]:
            - img [ref=e147]
            - generic [ref=e150]: "1"
          - button "Giang Staff G" [ref=e152] [cursor=pointer]:
            - generic [ref=e153]:
              - paragraph [ref=e154]: Giang
              - paragraph [ref=e155]: Staff
            - generic [ref=e157]: G
            - img [ref=e158]
      - main [ref=e160]:
        - generic [ref=e162]:
          - generic [ref=e163]:
            - generic [ref=e164]:
              - heading "Employee Directory" [level=1] [ref=e165]
              - paragraph [ref=e166]: Admin view — all fields visible
            - button "Export CSV" [ref=e168] [cursor=pointer]:
              - img [ref=e169]
              - text: Export CSV
          - generic [ref=e172]:
            - generic [ref=e173]:
              - generic [ref=e174]:
                - generic [ref=e175]:
                  - img [ref=e176]
                  - textbox "Search name, email, phone..." [ref=e179]
                - combobox [ref=e181] [cursor=pointer]:
                  - option "All Departments" [selected]
                  - option "Engineering"
                  - option "Finance"
                  - option "HR"
                  - option "Marketing"
                  - option "Sales"
              - generic [ref=e182]:
                - button "Table view" [ref=e183] [cursor=pointer]:
                  - img [ref=e184]
                - button "Grid view" [ref=e185] [cursor=pointer]:
                  - img [ref=e186]
            - table [ref=e192]:
              - rowgroup [ref=e193]:
                - row "Employee Email Department Position Phone Bank Name Bank Account Address Actions" [ref=e194]:
                  - columnheader "Employee" [ref=e195] [cursor=pointer]:
                    - generic [ref=e196]:
                      - text: Employee
                      - img [ref=e197]
                  - columnheader "Email" [ref=e200]
                  - columnheader "Department" [ref=e201] [cursor=pointer]:
                    - generic [ref=e202]:
                      - text: Department
                      - img [ref=e203]
                  - columnheader "Position" [ref=e206] [cursor=pointer]:
                    - generic [ref=e207]:
                      - text: Position
                      - img [ref=e208]
                  - columnheader "Phone" [ref=e211] [cursor=pointer]:
                    - generic [ref=e212]:
                      - img [ref=e213]
                      - text: Phone
                      - img [ref=e215]
                  - columnheader "Bank Name" [ref=e218]
                  - columnheader "Bank Account" [ref=e219]
                  - columnheader "Address" [ref=e220]
                  - columnheader "Actions" [ref=e221]
              - rowgroup [ref=e222]:
                - row "SA System Admin admin@example.com HR Director — Techcombank 9018538224 —" [ref=e223]:
                  - cell "SA System Admin" [ref=e224]:
                    - generic [ref=e225]:
                      - generic [ref=e226]: SA
                      - generic [ref=e229]: System Admin
                  - cell "admin@example.com" [ref=e230]
                  - cell "HR" [ref=e231]
                  - cell "Director" [ref=e232]
                  - cell "—" [ref=e233]
                  - cell "Techcombank" [ref=e234]
                  - cell "9018538224" [ref=e235]
                  - cell "—" [ref=e236]
                  - cell [ref=e237]:
                    - button "View" [ref=e238] [cursor=pointer]:
                      - img [ref=e239]
                - row "GT Giang Tran 1 user1@company.com Engineering Staff 0900000001 Vietcombank 7952782401 Street 1, HCMC" [ref=e243]:
                  - cell "GT Giang Tran 1" [ref=e244]:
                    - generic [ref=e245]:
                      - generic [ref=e246]: GT
                      - generic [ref=e249]: Giang Tran 1
                  - cell "user1@company.com" [ref=e250]
                  - cell "Engineering" [ref=e251]
                  - cell "Staff" [ref=e252]
                  - cell "0900000001" [ref=e253]
                  - cell "Vietcombank" [ref=e254]
                  - cell "7952782401" [ref=e255]
                  - cell "Street 1, HCMC" [ref=e256]
                  - cell [ref=e257]:
                    - button "View" [ref=e258] [cursor=pointer]:
                      - img [ref=e259]
                - row "DB Dung Bui 2 user2@company.com Engineering Staff 0900000002 Techcombank 4242663904 Street 2, HCMC" [ref=e263]:
                  - cell "DB Dung Bui 2" [ref=e264]:
                    - generic [ref=e265]:
                      - generic [ref=e266]: DB
                      - generic [ref=e269]: Dung Bui 2
                  - cell "user2@company.com" [ref=e270]
                  - cell "Engineering" [ref=e271]
                  - cell "Staff" [ref=e272]
                  - cell "0900000002" [ref=e273]
                  - cell "Techcombank" [ref=e274]
                  - cell "4242663904" [ref=e275]
                  - cell "Street 2, HCMC" [ref=e276]
                  - cell [ref=e277]:
                    - button "View" [ref=e278] [cursor=pointer]:
                      - img [ref=e279]
                - row "HH Hoa Hoang 3 user3@company.com Sales Intern 0900000003 MB Bank 9048688275 Street 3, HCMC" [ref=e283]:
                  - cell "HH Hoa Hoang 3" [ref=e284]:
                    - generic [ref=e285]:
                      - generic [ref=e286]: HH
                      - generic [ref=e289]: Hoa Hoang 3
                  - cell "user3@company.com" [ref=e290]
                  - cell "Sales" [ref=e291]
                  - cell "Intern" [ref=e292]
                  - cell "0900000003" [ref=e293]
                  - cell "MB Bank" [ref=e294]
                  - cell "9048688275" [ref=e295]
                  - cell "Street 3, HCMC" [ref=e296]
                  - cell [ref=e297]:
                    - button "View" [ref=e298] [cursor=pointer]:
                      - img [ref=e299]
                - row "GD Giang Do 4 user4@company.com Sales Manager 0900000004 BIDV 6917127208 Street 4, HCMC" [ref=e303]:
                  - cell "GD Giang Do 4" [ref=e304]:
                    - generic [ref=e305]:
                      - generic [ref=e306]: GD
                      - generic [ref=e309]: Giang Do 4
                  - cell "user4@company.com" [ref=e310]
                  - cell "Sales" [ref=e311]
                  - cell "Manager" [ref=e312]
                  - cell "0900000004" [ref=e313]
                  - cell "BIDV" [ref=e314]
                  - cell "6917127208" [ref=e315]
                  - cell "Street 4, HCMC" [ref=e316]
                  - cell [ref=e317]:
                    - button "View" [ref=e318] [cursor=pointer]:
                      - img [ref=e319]
                - row "LV Linh Vo 5 user5@company.com Sales Intern 0900000005 Vietcombank 2247079851 Street 5, HCMC" [ref=e323]:
                  - cell "LV Linh Vo 5" [ref=e324]:
                    - generic [ref=e325]:
                      - generic [ref=e326]: LV
                      - generic [ref=e329]: Linh Vo 5
                  - cell "user5@company.com" [ref=e330]
                  - cell "Sales" [ref=e331]
                  - cell "Intern" [ref=e332]
                  - cell "0900000005" [ref=e333]
                  - cell "Vietcombank" [ref=e334]
                  - cell "2247079851" [ref=e335]
                  - cell "Street 5, HCMC" [ref=e336]
                  - cell [ref=e337]:
                    - button "View" [ref=e338] [cursor=pointer]:
                      - img [ref=e339]
                - row "KP Khanh Pham 6 user6@company.com Marketing Director 0900000006 MB Bank 9855591567 Street 6, HCMC" [ref=e343]:
                  - cell "KP Khanh Pham 6" [ref=e344]:
                    - generic [ref=e345]:
                      - generic [ref=e346]: KP
                      - generic [ref=e349]: Khanh Pham 6
                  - cell "user6@company.com" [ref=e350]
                  - cell "Marketing" [ref=e351]
                  - cell "Director" [ref=e352]
                  - cell "0900000006" [ref=e353]
                  - cell "MB Bank" [ref=e354]
                  - cell "9855591567" [ref=e355]
                  - cell "Street 6, HCMC" [ref=e356]
                  - cell [ref=e357]:
                    - button "View" [ref=e358] [cursor=pointer]:
                      - img [ref=e359]
                - row "LV Linh Vo 7 user7@company.com Finance Staff 0900000007 Techcombank 4920248010 Street 7, HCMC" [ref=e363]:
                  - cell "LV Linh Vo 7" [ref=e364]:
                    - generic [ref=e365]:
                      - generic [ref=e366]: LV
                      - generic [ref=e369]: Linh Vo 7
                  - cell "user7@company.com" [ref=e370]
                  - cell "Finance" [ref=e371]
                  - cell "Staff" [ref=e372]
                  - cell "0900000007" [ref=e373]
                  - cell "Techcombank" [ref=e374]
                  - cell "4920248010" [ref=e375]
                  - cell "Street 7, HCMC" [ref=e376]
                  - cell [ref=e377]:
                    - button "View" [ref=e378] [cursor=pointer]:
                      - img [ref=e379]
                - row "MP Minh Pham 8 user8@company.com Sales Manager 0900000008 Vietcombank 3560077234 Street 8, HCMC" [ref=e383]:
                  - cell "MP Minh Pham 8" [ref=e384]:
                    - generic [ref=e385]:
                      - generic [ref=e386]: MP
                      - generic [ref=e389]: Minh Pham 8
                  - cell "user8@company.com" [ref=e390]
                  - cell "Sales" [ref=e391]
                  - cell "Manager" [ref=e392]
                  - cell "0900000008" [ref=e393]
                  - cell "Vietcombank" [ref=e394]
                  - cell "3560077234" [ref=e395]
                  - cell "Street 8, HCMC" [ref=e396]
                  - cell [ref=e397]:
                    - button "View" [ref=e398] [cursor=pointer]:
                      - img [ref=e399]
                - row "LL Linh Le 9 user9@company.com Marketing Manager 0900000009 ACB 8822049368 Street 9, HCMC" [ref=e403]:
                  - cell "LL Linh Le 9" [ref=e404]:
                    - generic [ref=e405]:
                      - generic [ref=e406]: LL
                      - generic [ref=e409]: Linh Le 9
                  - cell "user9@company.com" [ref=e410]
                  - cell "Marketing" [ref=e411]
                  - cell "Manager" [ref=e412]
                  - cell "0900000009" [ref=e413]
                  - cell "ACB" [ref=e414]
                  - cell "8822049368" [ref=e415]
                  - cell "Street 9, HCMC" [ref=e416]
                  - cell [ref=e417]:
                    - button "View" [ref=e418] [cursor=pointer]:
                      - img [ref=e419]
                - row "HN Hoa Nguyen 10 user10@company.com Marketing Manager 0900000010 VPBank 7894840754 Street 10, HCMC" [ref=e423]:
                  - cell "HN Hoa Nguyen 10" [ref=e424]:
                    - generic [ref=e425]:
                      - generic [ref=e426]: HN
                      - generic [ref=e429]: Hoa Nguyen 10
                  - cell "user10@company.com" [ref=e430]
                  - cell "Marketing" [ref=e431]
                  - cell "Manager" [ref=e432]
                  - cell "0900000010" [ref=e433]
                  - cell "VPBank" [ref=e434]
                  - cell "7894840754" [ref=e435]
                  - cell "Street 10, HCMC" [ref=e436]
                  - cell [ref=e437]:
                    - button "View" [ref=e438] [cursor=pointer]:
                      - img [ref=e439]
                - row "KB Khanh Bui 11 user11@company.com Engineering Director 0900000011 MB Bank 4719012338 Street 11, HCMC" [ref=e443]:
                  - cell "KB Khanh Bui 11" [ref=e444]:
                    - generic [ref=e445]:
                      - generic [ref=e446]: KB
                      - generic [ref=e449]: Khanh Bui 11
                  - cell "user11@company.com" [ref=e450]
                  - cell "Engineering" [ref=e451]
                  - cell "Director" [ref=e452]
                  - cell "0900000011" [ref=e453]
                  - cell "MB Bank" [ref=e454]
                  - cell "4719012338" [ref=e455]
                  - cell "Street 11, HCMC" [ref=e456]
                  - cell [ref=e457]:
                    - button "View" [ref=e458] [cursor=pointer]:
                      - img [ref=e459]
                - row "KT Khanh Tran 12 user12@company.com Sales Director 0900000012 BIDV 1593382518 Street 12, HCMC" [ref=e463]:
                  - cell "KT Khanh Tran 12" [ref=e464]:
                    - generic [ref=e465]:
                      - generic [ref=e466]: KT
                      - generic [ref=e469]: Khanh Tran 12
                  - cell "user12@company.com" [ref=e470]
                  - cell "Sales" [ref=e471]
                  - cell "Director" [ref=e472]
                  - cell "0900000012" [ref=e473]
                  - cell "BIDV" [ref=e474]
                  - cell "1593382518" [ref=e475]
                  - cell "Street 12, HCMC" [ref=e476]
                  - cell [ref=e477]:
                    - button "View" [ref=e478] [cursor=pointer]:
                      - img [ref=e479]
                - row "LH Linh Hoang 13 user13@company.com Finance Intern 0900000013 MB Bank 6492417470 Street 13, HCMC" [ref=e483]:
                  - cell "LH Linh Hoang 13" [ref=e484]:
                    - generic [ref=e485]:
                      - generic [ref=e486]: LH
                      - generic [ref=e489]: Linh Hoang 13
                  - cell "user13@company.com" [ref=e490]
                  - cell "Finance" [ref=e491]
                  - cell "Intern" [ref=e492]
                  - cell "0900000013" [ref=e493]
                  - cell "MB Bank" [ref=e494]
                  - cell "6492417470" [ref=e495]
                  - cell "Street 13, HCMC" [ref=e496]
                  - cell [ref=e497]:
                    - button "View" [ref=e498] [cursor=pointer]:
                      - img [ref=e499]
                - row "MD Minh Do 14 user14@company.com Sales Manager 0900000014 Vietcombank 5553471770 Street 14, HCMC" [ref=e503]:
                  - cell "MD Minh Do 14" [ref=e504]:
                    - generic [ref=e505]:
                      - generic [ref=e506]: MD
                      - generic [ref=e509]: Minh Do 14
                  - cell "user14@company.com" [ref=e510]
                  - cell "Sales" [ref=e511]
                  - cell "Manager" [ref=e512]
                  - cell "0900000014" [ref=e513]
                  - cell "Vietcombank" [ref=e514]
                  - cell "5553471770" [ref=e515]
                  - cell "Street 14, HCMC" [ref=e516]
                  - cell [ref=e517]:
                    - button "View" [ref=e518] [cursor=pointer]:
                      - img [ref=e519]
                - row "KH Khanh Hoang 15 user15@company.com HR Manager 0900000015 Sacombank 4744493804 Street 15, HCMC" [ref=e523]:
                  - cell "KH Khanh Hoang 15" [ref=e524]:
                    - generic [ref=e525]:
                      - generic [ref=e526]: KH
                      - generic [ref=e529]: Khanh Hoang 15
                  - cell "user15@company.com" [ref=e530]
                  - cell "HR" [ref=e531]
                  - cell "Manager" [ref=e532]
                  - cell "0900000015" [ref=e533]
                  - cell "Sacombank" [ref=e534]
                  - cell "4744493804" [ref=e535]
                  - cell "Street 15, HCMC" [ref=e536]
                  - cell [ref=e537]:
                    - button "View" [ref=e538] [cursor=pointer]:
                      - img [ref=e539]
                - row "MV Minh Vo 16 user16@company.com Engineering Director 0900000016 Techcombank 7029036215 Street 16, HCMC" [ref=e543]:
                  - cell "MV Minh Vo 16" [ref=e544]:
                    - generic [ref=e545]:
                      - generic [ref=e546]: MV
                      - generic [ref=e549]: Minh Vo 16
                  - cell "user16@company.com" [ref=e550]
                  - cell "Engineering" [ref=e551]
                  - cell "Director" [ref=e552]
                  - cell "0900000016" [ref=e553]
                  - cell "Techcombank" [ref=e554]
                  - cell "7029036215" [ref=e555]
                  - cell "Street 16, HCMC" [ref=e556]
                  - cell [ref=e557]:
                    - button "View" [ref=e558] [cursor=pointer]:
                      - img [ref=e559]
                - row "DD Dung Do 17 user17@company.com Engineering Manager 0900000017 Techcombank 8671706043 Street 17, HCMC" [ref=e563]:
                  - cell "DD Dung Do 17" [ref=e564]:
                    - generic [ref=e565]:
                      - generic [ref=e566]: DD
                      - generic [ref=e569]: Dung Do 17
                  - cell "user17@company.com" [ref=e570]
                  - cell "Engineering" [ref=e571]
                  - cell "Manager" [ref=e572]
                  - cell "0900000017" [ref=e573]
                  - cell "Techcombank" [ref=e574]
                  - cell "8671706043" [ref=e575]
                  - cell "Street 17, HCMC" [ref=e576]
                  - cell [ref=e577]:
                    - button "View" [ref=e578] [cursor=pointer]:
                      - img [ref=e579]
                - row "MP Minh Pham 18 user18@company.com Sales Intern 0900000018 MB Bank 1097851293 Street 18, HCMC" [ref=e583]:
                  - cell "MP Minh Pham 18" [ref=e584]:
                    - generic [ref=e585]:
                      - generic [ref=e586]: MP
                      - generic [ref=e589]: Minh Pham 18
                  - cell "user18@company.com" [ref=e590]
                  - cell "Sales" [ref=e591]
                  - cell "Intern" [ref=e592]
                  - cell "0900000018" [ref=e593]
                  - cell "MB Bank" [ref=e594]
                  - cell "1097851293" [ref=e595]
                  - cell "Street 18, HCMC" [ref=e596]
                  - cell [ref=e597]:
                    - button "View" [ref=e598] [cursor=pointer]:
                      - img [ref=e599]
                - row "LV Linh Vo 19 user19@company.com Sales Staff 0900000019 VPBank 4567473645 Street 19, HCMC" [ref=e603]:
                  - cell "LV Linh Vo 19" [ref=e604]:
                    - generic [ref=e605]:
                      - generic [ref=e606]: LV
                      - generic [ref=e609]: Linh Vo 19
                  - cell "user19@company.com" [ref=e610]
                  - cell "Sales" [ref=e611]
                  - cell "Staff" [ref=e612]
                  - cell "0900000019" [ref=e613]
                  - cell "VPBank" [ref=e614]
                  - cell "4567473645" [ref=e615]
                  - cell "Street 19, HCMC" [ref=e616]
                  - cell [ref=e617]:
                    - button "View" [ref=e618] [cursor=pointer]:
                      - img [ref=e619]
                - row "DT Dung Tran 20 user20@company.com Finance Staff 0900000020 Sacombank 7581579904 Street 20, HCMC" [ref=e623]:
                  - cell "DT Dung Tran 20" [ref=e624]:
                    - generic [ref=e625]:
                      - generic [ref=e626]: DT
                      - generic [ref=e629]: Dung Tran 20
                  - cell "user20@company.com" [ref=e630]
                  - cell "Finance" [ref=e631]
                  - cell "Staff" [ref=e632]
                  - cell "0900000020" [ref=e633]
                  - cell "Sacombank" [ref=e634]
                  - cell "7581579904" [ref=e635]
                  - cell "Street 20, HCMC" [ref=e636]
                  - cell [ref=e637]:
                    - button "View" [ref=e638] [cursor=pointer]:
                      - img [ref=e639]
                - row "GN Giang Nguyen 21 user21@company.com Engineering Intern 0900000021 Vietcombank 3970128532 Street 21, HCMC" [ref=e643]:
                  - cell "GN Giang Nguyen 21" [ref=e644]:
                    - generic [ref=e645]:
                      - generic [ref=e646]: GN
                      - generic [ref=e649]: Giang Nguyen 21
                  - cell "user21@company.com" [ref=e650]
                  - cell "Engineering" [ref=e651]
                  - cell "Intern" [ref=e652]
                  - cell "0900000021" [ref=e653]
                  - cell "Vietcombank" [ref=e654]
                  - cell "3970128532" [ref=e655]
                  - cell "Street 21, HCMC" [ref=e656]
                  - cell [ref=e657]:
                    - button "View" [ref=e658] [cursor=pointer]:
                      - img [ref=e659]
                - row "GH Giang Hoang 22 user22@company.com Sales Manager 0900000022 Sacombank 1343779767 Street 22, HCMC" [ref=e663]:
                  - cell "GH Giang Hoang 22" [ref=e664]:
                    - generic [ref=e665]:
                      - generic [ref=e666]: GH
                      - generic [ref=e669]: Giang Hoang 22
                  - cell "user22@company.com" [ref=e670]
                  - cell "Sales" [ref=e671]
                  - cell "Manager" [ref=e672]
                  - cell "0900000022" [ref=e673]
                  - cell "Sacombank" [ref=e674]
                  - cell "1343779767" [ref=e675]
                  - cell "Street 22, HCMC" [ref=e676]
                  - cell [ref=e677]:
                    - button "View" [ref=e678] [cursor=pointer]:
                      - img [ref=e679]
                - row "MN Minh Nguyen 23 user23@company.com Sales Intern 0900000023 ACB 1821727983 Street 23, HCMC" [ref=e683]:
                  - cell "MN Minh Nguyen 23" [ref=e684]:
                    - generic [ref=e685]:
                      - generic [ref=e686]: MN
                      - generic [ref=e689]: Minh Nguyen 23
                  - cell "user23@company.com" [ref=e690]
                  - cell "Sales" [ref=e691]
                  - cell "Intern" [ref=e692]
                  - cell "0900000023" [ref=e693]
                  - cell "ACB" [ref=e694]
                  - cell "1821727983" [ref=e695]
                  - cell "Street 23, HCMC" [ref=e696]
                  - cell [ref=e697]:
                    - button "View" [ref=e698] [cursor=pointer]:
                      - img [ref=e699]
                - row "GB Giang Bui 24 user24@company.com HR Manager 0900000024 Vietcombank 8497924845 Street 24, HCMC" [ref=e703]:
                  - cell "GB Giang Bui 24" [ref=e704]:
                    - generic [ref=e705]:
                      - generic [ref=e706]: GB
                      - generic [ref=e709]: Giang Bui 24
                  - cell "user24@company.com" [ref=e710]
                  - cell "HR" [ref=e711]
                  - cell "Manager" [ref=e712]
                  - cell "0900000024" [ref=e713]
                  - cell "Vietcombank" [ref=e714]
                  - cell "8497924845" [ref=e715]
                  - cell "Street 24, HCMC" [ref=e716]
                  - cell [ref=e717]:
                    - button "View" [ref=e718] [cursor=pointer]:
                      - img [ref=e719]
                - row "DN Dung Nguyen 25 user25@company.com Finance Intern 0900000025 ACB 4625241219 Street 25, HCMC" [ref=e723]:
                  - cell "DN Dung Nguyen 25" [ref=e724]:
                    - generic [ref=e725]:
                      - generic [ref=e726]: DN
                      - generic [ref=e729]: Dung Nguyen 25
                  - cell "user25@company.com" [ref=e730]
                  - cell "Finance" [ref=e731]
                  - cell "Intern" [ref=e732]
                  - cell "0900000025" [ref=e733]
                  - cell "ACB" [ref=e734]
                  - cell "4625241219" [ref=e735]
                  - cell "Street 25, HCMC" [ref=e736]
                  - cell [ref=e737]:
                    - button "View" [ref=e738] [cursor=pointer]:
                      - img [ref=e739]
                - row "DD Dung Dang 26 user26@company.com Marketing Manager 0900000026 ACB 9444589167 Street 26, HCMC" [ref=e743]:
                  - cell "DD Dung Dang 26" [ref=e744]:
                    - generic [ref=e745]:
                      - generic [ref=e746]: DD
                      - generic [ref=e749]: Dung Dang 26
                  - cell "user26@company.com" [ref=e750]
                  - cell "Marketing" [ref=e751]
                  - cell "Manager" [ref=e752]
                  - cell "0900000026" [ref=e753]
                  - cell "ACB" [ref=e754]
                  - cell "9444589167" [ref=e755]
                  - cell "Street 26, HCMC" [ref=e756]
                  - cell [ref=e757]:
                    - button "View" [ref=e758] [cursor=pointer]:
                      - img [ref=e759]
                - row "MT Minh Tran 27 user27@company.com Marketing Director 0900000027 Sacombank 6182338891 Street 27, HCMC" [ref=e763]:
                  - cell "MT Minh Tran 27" [ref=e764]:
                    - generic [ref=e765]:
                      - generic [ref=e766]: MT
                      - generic [ref=e769]: Minh Tran 27
                  - cell "user27@company.com" [ref=e770]
                  - cell "Marketing" [ref=e771]
                  - cell "Director" [ref=e772]
                  - cell "0900000027" [ref=e773]
                  - cell "Sacombank" [ref=e774]
                  - cell "6182338891" [ref=e775]
                  - cell "Street 27, HCMC" [ref=e776]
                  - cell [ref=e777]:
                    - button "View" [ref=e778] [cursor=pointer]:
                      - img [ref=e779]
                - row "KV Khanh Vu 28 user28@company.com Engineering Manager 0900000028 MB Bank 7867636771 Street 28, HCMC" [ref=e783]:
                  - cell "KV Khanh Vu 28" [ref=e784]:
                    - generic [ref=e785]:
                      - generic [ref=e786]: KV
                      - generic [ref=e789]: Khanh Vu 28
                  - cell "user28@company.com" [ref=e790]
                  - cell "Engineering" [ref=e791]
                  - cell "Manager" [ref=e792]
                  - cell "0900000028" [ref=e793]
                  - cell "MB Bank" [ref=e794]
                  - cell "7867636771" [ref=e795]
                  - cell "Street 28, HCMC" [ref=e796]
                  - cell [ref=e797]:
                    - button "View" [ref=e798] [cursor=pointer]:
                      - img [ref=e799]
                - row "ML Minh Le 29 user29@company.com Marketing Director 0900000029 Techcombank 5210359769 Street 29, HCMC" [ref=e803]:
                  - cell "ML Minh Le 29" [ref=e804]:
                    - generic [ref=e805]:
                      - generic [ref=e806]: ML
                      - generic [ref=e809]: Minh Le 29
                  - cell "user29@company.com" [ref=e810]
                  - cell "Marketing" [ref=e811]
                  - cell "Director" [ref=e812]
                  - cell "0900000029" [ref=e813]
                  - cell "Techcombank" [ref=e814]
                  - cell "5210359769" [ref=e815]
                  - cell "Street 29, HCMC" [ref=e816]
                  - cell [ref=e817]:
                    - button "View" [ref=e818] [cursor=pointer]:
                      - img [ref=e819]
                - row "KD Khanh Do 30 user30@company.com Marketing Intern 0900000030 VPBank 5066228417 Street 30, HCMC" [ref=e823]:
                  - cell "KD Khanh Do 30" [ref=e824]:
                    - generic [ref=e825]:
                      - generic [ref=e826]: KD
                      - generic [ref=e829]: Khanh Do 30
                  - cell "user30@company.com" [ref=e830]
                  - cell "Marketing" [ref=e831]
                  - cell "Intern" [ref=e832]
                  - cell "0900000030" [ref=e833]
                  - cell "VPBank" [ref=e834]
                  - cell "5066228417" [ref=e835]
                  - cell "Street 30, HCMC" [ref=e836]
                  - cell [ref=e837]:
                    - button "View" [ref=e838] [cursor=pointer]:
                      - img [ref=e839]
                - row "LT Linh Tran 31 user31@company.com Sales Staff 0900000031 Sacombank 4731717662 Street 31, HCMC" [ref=e843]:
                  - cell "LT Linh Tran 31" [ref=e844]:
                    - generic [ref=e845]:
                      - generic [ref=e846]: LT
                      - generic [ref=e849]: Linh Tran 31
                  - cell "user31@company.com" [ref=e850]
                  - cell "Sales" [ref=e851]
                  - cell "Staff" [ref=e852]
                  - cell "0900000031" [ref=e853]
                  - cell "Sacombank" [ref=e854]
                  - cell "4731717662" [ref=e855]
                  - cell "Street 31, HCMC" [ref=e856]
                  - cell [ref=e857]:
                    - button "View" [ref=e858] [cursor=pointer]:
                      - img [ref=e859]
                - row "LD Linh Dang 32 user32@company.com Sales Staff 0900000032 BIDV 5782615348 Street 32, HCMC" [ref=e863]:
                  - cell "LD Linh Dang 32" [ref=e864]:
                    - generic [ref=e865]:
                      - generic [ref=e866]: LD
                      - generic [ref=e869]: Linh Dang 32
                  - cell "user32@company.com" [ref=e870]
                  - cell "Sales" [ref=e871]
                  - cell "Staff" [ref=e872]
                  - cell "0900000032" [ref=e873]
                  - cell "BIDV" [ref=e874]
                  - cell "5782615348" [ref=e875]
                  - cell "Street 32, HCMC" [ref=e876]
                  - cell [ref=e877]:
                    - button "View" [ref=e878] [cursor=pointer]:
                      - img [ref=e879]
                - row "AP An Pham 33 user33@company.com Engineering Director 0900000033 Techcombank 9876887351 Street 33, HCMC" [ref=e883]:
                  - cell "AP An Pham 33" [ref=e884]:
                    - generic [ref=e885]:
                      - generic [ref=e886]: AP
                      - generic [ref=e889]: An Pham 33
                  - cell "user33@company.com" [ref=e890]
                  - cell "Engineering" [ref=e891]
                  - cell "Director" [ref=e892]
                  - cell "0900000033" [ref=e893]
                  - cell "Techcombank" [ref=e894]
                  - cell "9876887351" [ref=e895]
                  - cell "Street 33, HCMC" [ref=e896]
                  - cell [ref=e897]:
                    - button "View" [ref=e898] [cursor=pointer]:
                      - img [ref=e899]
                - row "CP Cuong Pham 34 user34@company.com Sales Staff 0900000034 ACB 2806488971 Street 34, HCMC" [ref=e903]:
                  - cell "CP Cuong Pham 34" [ref=e904]:
                    - generic [ref=e905]:
                      - generic [ref=e906]: CP
                      - generic [ref=e909]: Cuong Pham 34
                  - cell "user34@company.com" [ref=e910]
                  - cell "Sales" [ref=e911]
                  - cell "Staff" [ref=e912]
                  - cell "0900000034" [ref=e913]
                  - cell "ACB" [ref=e914]
                  - cell "2806488971" [ref=e915]
                  - cell "Street 34, HCMC" [ref=e916]
                  - cell [ref=e917]:
                    - button "View" [ref=e918] [cursor=pointer]:
                      - img [ref=e919]
                - row "HP Hoa Pham 35 user35@company.com HR Manager 0900000035 VPBank 9437229454 Street 35, HCMC" [ref=e923]:
                  - cell "HP Hoa Pham 35" [ref=e924]:
                    - generic [ref=e925]:
                      - generic [ref=e926]: HP
                      - generic [ref=e929]: Hoa Pham 35
                  - cell "user35@company.com" [ref=e930]
                  - cell "HR" [ref=e931]
                  - cell "Manager" [ref=e932]
                  - cell "0900000035" [ref=e933]
                  - cell "VPBank" [ref=e934]
                  - cell "9437229454" [ref=e935]
                  - cell "Street 35, HCMC" [ref=e936]
                  - cell [ref=e937]:
                    - button "View" [ref=e938] [cursor=pointer]:
                      - img [ref=e939]
                - row "GB Giang Bui 36 user36@company.com Sales Staff 0900000036 VPBank 1212773848 Street 36, HCMC" [ref=e943]:
                  - cell "GB Giang Bui 36" [ref=e944]:
                    - generic [ref=e945]:
                      - generic [ref=e946]: GB
                      - generic [ref=e949]: Giang Bui 36
                  - cell "user36@company.com" [ref=e950]
                  - cell "Sales" [ref=e951]
                  - cell "Staff" [ref=e952]
                  - cell "0900000036" [ref=e953]
                  - cell "VPBank" [ref=e954]
                  - cell "1212773848" [ref=e955]
                  - cell "Street 36, HCMC" [ref=e956]
                  - cell [ref=e957]:
                    - button "View" [ref=e958] [cursor=pointer]:
                      - img [ref=e959]
                - row "BP Binh Pham 37 user37@company.com Marketing Director 0900000037 BIDV 9007083081 Street 37, HCMC" [ref=e963]:
                  - cell "BP Binh Pham 37" [ref=e964]:
                    - generic [ref=e965]:
                      - generic [ref=e966]: BP
                      - generic [ref=e969]: Binh Pham 37
                  - cell "user37@company.com" [ref=e970]
                  - cell "Marketing" [ref=e971]
                  - cell "Director" [ref=e972]
                  - cell "0900000037" [ref=e973]
                  - cell "BIDV" [ref=e974]
                  - cell "9007083081" [ref=e975]
                  - cell "Street 37, HCMC" [ref=e976]
                  - cell [ref=e977]:
                    - button "View" [ref=e978] [cursor=pointer]:
                      - img [ref=e979]
                - row "MP Minh Pham 38 user38@company.com Finance Manager 0900000038 MB Bank 5607220781 Street 38, HCMC" [ref=e983]:
                  - cell "MP Minh Pham 38" [ref=e984]:
                    - generic [ref=e985]:
                      - generic [ref=e986]: MP
                      - generic [ref=e989]: Minh Pham 38
                  - cell "user38@company.com" [ref=e990]
                  - cell "Finance" [ref=e991]
                  - cell "Manager" [ref=e992]
                  - cell "0900000038" [ref=e993]
                  - cell "MB Bank" [ref=e994]
                  - cell "5607220781" [ref=e995]
                  - cell "Street 38, HCMC" [ref=e996]
                  - cell [ref=e997]:
                    - button "View" [ref=e998] [cursor=pointer]:
                      - img [ref=e999]
                - row "BD Binh Dang 39 user39@company.com Finance Manager 0900000039 Sacombank 7221449212 Street 39, HCMC" [ref=e1003]:
                  - cell "BD Binh Dang 39" [ref=e1004]:
                    - generic [ref=e1005]:
                      - generic [ref=e1006]: BD
                      - generic [ref=e1009]: Binh Dang 39
                  - cell "user39@company.com" [ref=e1010]
                  - cell "Finance" [ref=e1011]
                  - cell "Manager" [ref=e1012]
                  - cell "0900000039" [ref=e1013]
                  - cell "Sacombank" [ref=e1014]
                  - cell "7221449212" [ref=e1015]
                  - cell "Street 39, HCMC" [ref=e1016]
                  - cell [ref=e1017]:
                    - button "View" [ref=e1018] [cursor=pointer]:
                      - img [ref=e1019]
            - paragraph [ref=e1023]: 40 employees
  - alert [ref=e1024]
```

# Test source

```ts
  32  |     await page.waitForLoadState('domcontentloaded');
  33  |     const search = page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first();
  34  |     if (await search.isVisible()) {
  35  |       await search.fill('admin');
  36  |       await page.waitForTimeout(500);
  37  |     }
  38  |   });
  39  | 
  40  |   test('TC_EMP_006 - Search <2 ký tự → không thực thi', async ({ adminPage: page }) => {
  41  |     await page.goto('/admin/employees');
  42  |     await page.waitForLoadState('domcontentloaded');
  43  |     const search = page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first();
  44  |     if (await search.isVisible()) {
  45  |       await search.fill('a');
  46  |       await page.waitForTimeout(500);
  47  |     }
  48  |   });
  49  | 
  50  |   test('TC_EMP_007 - Clear search → reset danh sách', async ({ adminPage: page }) => {
  51  |     await page.goto('/admin/employees');
  52  |     await page.waitForLoadState('domcontentloaded');
  53  |     const search = page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first();
  54  |     if (await search.isVisible()) {
  55  |       await search.fill('admin');
  56  |       await search.clear();
  57  |       await page.waitForTimeout(500);
  58  |     }
  59  |   });
  60  | 
  61  |   test('TC_EMP_008 - Nút Edit → mở modal', async ({ adminPage: page }) => {
  62  |     await page.goto('/admin/employees');
  63  |     await page.waitForLoadState('domcontentloaded');
  64  |     const btn = page.locator('button').filter({ hasText: /Edit|Sửa/ }).first();
  65  |     if (await btn.isVisible()) {
  66  |       await btn.click();
  67  |       await expect(page.locator('[role="dialog"], .fixed').first()).toBeVisible({ timeout: 5000 });
  68  |     }
  69  |   });
  70  | 
  71  |   test('TC_EMP_009 - Modal Edit có thể đóng', async ({ adminPage: page }) => {
  72  |     await page.goto('/admin/employees');
  73  |     await page.waitForLoadState('domcontentloaded');
  74  |     const btn = page.locator('button').filter({ hasText: /Edit|Sửa/ }).first();
  75  |     if (await btn.isVisible()) {
  76  |       await btn.click();
  77  |       await page.waitForTimeout(500);
  78  |       const cancel = page.locator('button').filter({ hasText: /Cancel|Hủy|Close|Đóng/ }).first();
  79  |       if (await cancel.isVisible()) await cancel.click();
  80  |     }
  81  |   });
  82  | 
  83  |   test('TC_EMP_010 - Nút Offboard → mở modal', async ({ adminPage: page }) => {
  84  |     await page.goto('/admin/employees');
  85  |     await page.waitForLoadState('domcontentloaded');
  86  |     const btn = page.locator('button').filter({ hasText: /Offboard|Nghỉ việc/ }).first();
  87  |     if (await btn.isVisible()) {
  88  |       await btn.click();
  89  |       await expect(page.locator('[role="dialog"], .fixed').first()).toBeVisible({ timeout: 5000 });
  90  |     }
  91  |   });
  92  | 
  93  |   test('TC_EMP_011 - Modal Offboard yêu cầu date + reason', async ({ adminPage: page }) => {
  94  |     await page.goto('/admin/employees');
  95  |     await page.waitForLoadState('domcontentloaded');
  96  |     const btn = page.locator('button').filter({ hasText: /Offboard|Nghỉ việc/ }).first();
  97  |     if (await btn.isVisible()) {
  98  |       await btn.click();
  99  |       await page.waitForTimeout(500);
  100 |       await expect(page.locator('input[type="date"], select').first()).toBeVisible();
  101 |     }
  102 |   });
  103 | 
  104 |   test('TC_EMP_012 - Nút Delete → hiển thị cảnh báo', async ({ adminPage: page }) => {
  105 |     await page.goto('/admin/employees');
  106 |     await page.waitForLoadState('domcontentloaded');
  107 |     const btn = page.locator('button').filter({ hasText: /Delete|Xóa/ }).first();
  108 |     if (await btn.isVisible()) {
  109 |       await btn.click();
  110 |       await page.waitForTimeout(500);
  111 |     }
  112 |   });
  113 | 
  114 |   test('TC_EMP_013 - Nút Add → điều hướng /admin/register', async ({ adminPage: page }) => {
  115 |     await page.goto('/admin/employees');
  116 |     await page.waitForLoadState('domcontentloaded');
  117 |     const btn = page.locator('a, button').filter({ hasText: /Add|Thêm/ }).first();
  118 |     if (await btn.isVisible()) {
  119 |       await btn.click();
  120 |       await page.waitForTimeout(1000);
  121 |     }
  122 |   });
  123 | });
  124 | 
  125 | test.describe('[M03] Employee Management - Access Control', () => {
  126 | 
  127 |   test('TC_EMP_014 - Employee bị chặn /admin/employees', async ({ employeePage: page }) => {
  128 |     await page.goto('/admin/employees');
  129 |     await page.waitForTimeout(2000);
  130 |     const denied = await page.getByText(/Access Denied|Truy cập bị từ chối/i).isVisible().catch(() => false);
  131 |     const redirected = !page.url().includes('/admin/employees');
> 132 |     expect(denied || redirected).toBeTruthy();
      |                                  ^ Error: expect(received).toBeTruthy()
  133 |   });
  134 | 
  135 |   test('TC_EMP_015 - Employee xem được Staff Directory', async ({ employeePage: page }) => {
  136 |     await page.goto('/directory');
  137 |     await page.waitForLoadState('domcontentloaded');
  138 |     await expect(page.locator('h1, h2').first()).toBeVisible();
  139 |     await expect(page.locator('body')).not.toContainText('Access Denied');
  140 |   });
  141 | 
  142 |   test('TC_EMP_016 - Directory không hiển thị phone/address', async ({ employeePage: page }) => {
  143 |     await page.goto('/directory');
  144 |     await page.waitForLoadState('domcontentloaded');
  145 |     await expect(page.locator('body')).not.toContainText('phone');
  146 |   });
  147 | 
  148 |   test('TC_EMP_017 - Directory hiển thị tên nhân viên', async ({ employeePage: page }) => {
  149 |     await page.goto('/directory');
  150 |     await page.waitForLoadState('domcontentloaded');
  151 |     const rows = page.locator('table tbody tr, [role="row"]');
  152 |     expect(await rows.count()).toBeGreaterThanOrEqual(0);
  153 |   });
  154 | 
  155 |   test('TC_EMP_018 - Directory có search input', async ({ employeePage: page }) => {
  156 |     await page.goto('/directory');
  157 |     await page.waitForLoadState('domcontentloaded');
  158 |     await expect(page.locator('input[placeholder*="Search"], input[placeholder*="Tìm"]').first()).toBeVisible();
  159 |   });
  160 | 
  161 |   test('TC_EMP_019 - Click row → detail page', async ({ employeePage: page }) => {
  162 |     await page.goto('/directory');
  163 |     await page.waitForLoadState('domcontentloaded');
  164 |     const row = page.locator('table tbody tr, [role="row"]').first();
  165 |     if (await row.isVisible()) {
  166 |       await row.click();
  167 |       await page.waitForTimeout(1000);
  168 |     }
  169 |   });
  170 | 
  171 |   test('TC_EMP_020 - Form register có email + password', async ({ adminPage: page }) => {
  172 |     await page.goto('/admin/register');
  173 |     await page.waitForLoadState('domcontentloaded');
  174 |     // Register form may use #email or input[type="email"]
  175 |     const emailInput = page.locator('#email, input[type="email"]').first();
  176 |     const passwordInput = page.locator('#password, input[type="password"]').first();
  177 |     expect(await emailInput.count()).toBeGreaterThanOrEqual(0);
  178 |     expect(await passwordInput.count()).toBeGreaterThanOrEqual(0);
  179 |   });
  180 | });
  181 | 
```