# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: leave/leave.spec.ts >> [M07] Leave - Admin Filters & Data Accuracy >> TC_LEAVE_034 - Dữ liệu đơn khớp chính xác giữa Employee & Admin
- Location: specs/leave/leave.spec.ts:789:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "TC_034 accuracy check"
Received string:    "TC_026 concurrency"
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
        - generic [ref=e51]:
          - button "Attend & Leave" [ref=e52] [cursor=pointer]:
            - generic [ref=e53]:
              - img [ref=e55]
              - generic [ref=e57]: Attend & Leave
            - img [ref=e58]
          - generic [ref=e60]:
            - link "Attendance History" [ref=e61] [cursor=pointer]:
              - /url: /admin/attendance
              - img [ref=e62]
              - generic [ref=e65]: Attendance History
            - link "QR Display (Tablet)" [ref=e66] [cursor=pointer]:
              - /url: /admin/qr-display
              - img [ref=e67]
              - generic [ref=e72]: QR Display (Tablet)
            - link "Leave Approvals" [ref=e73] [cursor=pointer]:
              - /url: /admin/leave-approvals
              - img [ref=e74]
              - generic [ref=e77]: Leave Approvals
            - link "Resignation Approvals" [ref=e78] [cursor=pointer]:
              - /url: /admin/resignations
              - img [ref=e79]
              - generic [ref=e82]: Resignation Approvals
            - link "Public Holidays" [ref=e83] [cursor=pointer]:
              - /url: /admin/holidays
              - img [ref=e84]
              - generic [ref=e86]: Public Holidays
        - button "Payroll" [ref=e88] [cursor=pointer]:
          - generic [ref=e89]:
            - img [ref=e91]
            - generic [ref=e94]: Payroll
          - img [ref=e95]
        - button "Performance" [ref=e98] [cursor=pointer]:
          - generic [ref=e99]:
            - img [ref=e101]
            - generic [ref=e104]: Performance
          - img [ref=e105]
        - button "Communication" [ref=e108] [cursor=pointer]:
          - generic [ref=e109]:
            - img [ref=e111]
            - generic [ref=e117]: Communication
          - img [ref=e118]
        - button "Analytics" [ref=e121] [cursor=pointer]:
          - generic [ref=e122]:
            - img [ref=e124]
            - generic [ref=e127]: Analytics
          - img [ref=e128]
      - generic [ref=e130]:
        - link "System Settings" [ref=e131] [cursor=pointer]:
          - /url: /admin/settings
          - img [ref=e132]
          - generic [ref=e143]: System Settings
        - link "Payroll Settings" [ref=e144] [cursor=pointer]:
          - /url: /admin/settings/payroll
          - img [ref=e145]
          - generic [ref=e148]: Payroll Settings
    - generic [ref=e149]:
      - banner [ref=e150]:
        - generic [ref=e151]:
          - generic [ref=e153]:
            - img [ref=e154]
            - textbox "Search pages & features..." [ref=e157]
          - button "🇬🇧 EN" [ref=e158] [cursor=pointer]:
            - img [ref=e159]
            - generic [ref=e162]: 🇬🇧
            - generic [ref=e163]: EN
          - button "9+" [ref=e165] [cursor=pointer]:
            - img [ref=e166]
            - generic [ref=e169]: 9+
          - button "System Director S" [ref=e171] [cursor=pointer]:
            - generic [ref=e172]:
              - paragraph [ref=e173]: System
              - paragraph [ref=e174]: Director
            - generic [ref=e176]: S
            - img [ref=e177]
      - main [ref=e179]:
        - generic [ref=e182]:
          - generic [ref=e184]:
            - heading "Leave Approvals" [level=1] [ref=e185]
            - paragraph [ref=e186]: Review and manage employee leave requests
          - generic [ref=e187]:
            - generic [ref=e188]:
              - generic [ref=e189]:
                - paragraph [ref=e190]: Total Requests
                - heading "12" [level=3] [ref=e191]
              - img [ref=e193]
            - generic [ref=e196]:
              - generic [ref=e197]:
                - paragraph [ref=e198]: Pending Approval
                - heading "4" [level=3] [ref=e199]
              - img [ref=e201]
            - generic [ref=e204]:
              - generic [ref=e205]:
                - paragraph [ref=e206]: Approved
                - heading "6" [level=3] [ref=e207]
              - img [ref=e209]
            - generic [ref=e212]:
              - generic [ref=e213]:
                - paragraph [ref=e214]: Rejected
                - heading "2" [level=3] [ref=e215]
              - img [ref=e217]
          - generic [ref=e221]:
            - generic [ref=e222]:
              - generic [ref=e223]: Search Employee
              - textbox "Search Employee" [ref=e224]:
                - /placeholder: Name or email...
                - text: user1
            - generic [ref=e225]:
              - generic [ref=e226]: From Date
              - textbox "From Date..." [ref=e229]
            - generic [ref=e230]:
              - generic [ref=e231]: To Date
              - textbox "To Date..." [ref=e234]
            - button "Clear Filters" [ref=e236] [cursor=pointer]
          - generic [ref=e238]:
            - button "Split View" [ref=e239] [cursor=pointer]:
              - img [ref=e240]
              - text: Split View
            - button "List View" [ref=e245] [cursor=pointer]:
              - img [ref=e246]
              - text: List View
          - generic [ref=e247]:
            - generic [ref=e248]:
              - generic [ref=e249]:
                - generic [ref=e250]:
                  - heading "Pending" [level=2] [ref=e251]
                  - generic [ref=e252]: "4"
                - generic [ref=e253]:
                  - button "Pending" [ref=e254] [cursor=pointer]
                  - button "Approved" [ref=e255] [cursor=pointer]
                  - button "Rejected" [ref=e256] [cursor=pointer]
              - generic [ref=e258]:
                - generic [ref=e259] [cursor=pointer]:
                  - generic [ref=e260]: G1
                  - generic [ref=e261]:
                    - generic [ref=e262]:
                      - heading "Giang Tran 1" [level=3] [ref=e263]
                      - generic [ref=e264]: Oct 18
                    - paragraph [ref=e265]: Annual Leave
                    - generic [ref=e266]: Pending
                - generic [ref=e267] [cursor=pointer]:
                  - generic [ref=e268]: G1
                  - generic [ref=e269]:
                    - generic [ref=e270]:
                      - heading "Giang Tran 1" [level=3] [ref=e271]
                      - generic [ref=e272]: Jul 8
                    - paragraph [ref=e273]: Sick Leave
                    - generic [ref=e274]: Pending
                - generic [ref=e275] [cursor=pointer]:
                  - generic [ref=e276]: G1
                  - generic [ref=e277]:
                    - generic [ref=e278]:
                      - heading "Giang Tran 1" [level=3] [ref=e279]
                      - generic [ref=e280]: Jun 13
                    - paragraph [ref=e281]: Annual Leave
                    - generic [ref=e282]: Pending
                - generic [ref=e283] [cursor=pointer]:
                  - generic [ref=e284]: H1
                  - generic [ref=e285]:
                    - generic [ref=e286]:
                      - heading "Hoa Nguyen 10" [level=3] [ref=e287]
                      - generic [ref=e288]: Dec 11
                    - paragraph [ref=e289]: Sick Leave
                    - generic [ref=e290]: Pending
            - generic [ref=e291]:
              - generic [ref=e293]:
                - heading "Request Details" [level=2] [ref=e294]
                - generic [ref=e295]: Pending
              - generic [ref=e296]:
                - generic [ref=e297]:
                  - heading "Employee Information" [level=3] [ref=e298]:
                    - img [ref=e299]
                    - text: Employee Information
                  - generic [ref=e302]:
                    - generic [ref=e303]: G1
                    - generic [ref=e304]:
                      - generic [ref=e305]:
                        - paragraph [ref=e306]: Full Name
                        - paragraph [ref=e307]: Giang Tran 1
                      - generic [ref=e308]:
                        - paragraph [ref=e309]:
                          - img [ref=e310]
                          - text: Email
                        - paragraph [ref=e313]: user1@company.com
                      - generic [ref=e314]:
                        - paragraph [ref=e315]:
                          - img [ref=e316]
                          - text: Department
                        - paragraph [ref=e320]: Engineering
                      - generic [ref=e321]:
                        - paragraph [ref=e322]:
                          - img [ref=e323]
                          - text: Position
                        - paragraph [ref=e326]: Staff
                - generic [ref=e327]:
                  - heading "Leave Information" [level=3] [ref=e328]:
                    - img [ref=e329]
                    - text: Leave Information
                  - generic [ref=e332]:
                    - generic [ref=e333]:
                      - generic [ref=e334]:
                        - paragraph [ref=e335]: Leave Type
                        - paragraph [ref=e336]: Annual Leave
                      - generic [ref=e337]:
                        - paragraph [ref=e338]: Remaining Balance
                        - paragraph [ref=e339]: "-3 days"
                      - generic [ref=e340]:
                        - paragraph [ref=e341]:
                          - img [ref=e342]
                          - text: From Date
                        - paragraph [ref=e344]: 10/18/2026
                      - generic [ref=e345]:
                        - paragraph [ref=e346]:
                          - img [ref=e347]
                          - text: To Date
                        - paragraph [ref=e349]: 10/18/2026
                      - generic [ref=e350]:
                        - paragraph [ref=e351]:
                          - img [ref=e352]
                          - text: Duration
                        - paragraph [ref=e355]: 1 day
                    - generic [ref=e356]:
                      - paragraph [ref=e357]: Reason for Leave
                      - generic [ref=e358]: TC_026 concurrency
                - generic [ref=e359]:
                  - heading "Discussion & Notes" [level=3] [ref=e360]:
                    - img [ref=e361]
                    - text: Discussion & Notes
                  - generic [ref=e363]:
                    - generic [ref=e364]:
                      - generic [ref=e365]:
                        - generic [ref=e367]: Giang Tran 1
                        - generic [ref=e368]:
                          - generic [ref=e369]: Admin oi duyet som giup em
                          - generic [ref=e370]: 08:27 PM
                      - generic [ref=e372]:
                        - generic [ref=e373]: OK em, de anh duyet
                        - generic [ref=e374]: 08:27 PM
                      - generic [ref=e375]:
                        - generic [ref=e377]: Giang Tran 1
                        - generic [ref=e378]:
                          - generic [ref=e379]: <script>alert("XSS")</script>
                          - generic [ref=e380]: 08:28 PM
                    - generic [ref=e381]:
                      - generic [ref=e382]:
                        - textbox "Type your reply..." [ref=e383]
                        - button [disabled] [ref=e384]:
                          - img [ref=e385]
                      - generic [ref=e388]:
                        - paragraph [ref=e389]: Two-Way Channel Active
                        - paragraph [ref=e390]: Shift + Enter for new line
              - generic [ref=e391]:
                - generic [ref=e392]:
                  - generic [ref=e393]:
                    - img [ref=e394]
                    - text: "Request ID:"
                  - text: "#24"
                - generic [ref=e397]:
                  - button "Reject" [ref=e398] [cursor=pointer]
                  - button "Approve Leave" [ref=e399] [cursor=pointer]
  - alert [ref=e400]
```

# Test source

```ts
  720 |     expect(value.length).toBeLessThanOrEqual(3000); // either truncated or accepted
  721 |     await lp.closeDetailModal();
  722 |   });
  723 | 
  724 |   test('TC_LEAVE_040 - Chat: Gửi mã độc HTML (XSS) được escape', async ({ employeePage: page }) => {
  725 |     const lp = new LeaveDashboardPage(page);
  726 |     await lp.goto();
  727 |     await lp.waitForPageLoad();
  728 | 
  729 |     let count = await lp.getHistoryRowCount();
  730 |     if (count === 0) {
  731 |       const start = daysFromNow(nextDateOffset());
  732 |       const end = new Date(start);
  733 |       await lp.fillLeaveForm('Annual Leave', start, end, 'TC_040');
  734 |       const resp040 = lp.waitForSubmitResponse();
  735 |       await lp.submitRequest();
  736 |       await resp040;
  737 |       await lp.reloadPage();
  738 |       count = await lp.getHistoryRowCount();
  739 |     }
  740 |     if (count === 0) { test.skip(true, 'No requests'); return; }
  741 | 
  742 |     await lp.viewRequestByIndex(0);
  743 |     await lp.sendChatMessage('<script>alert("XSS")</script>');
  744 |     await page.waitForTimeout(1000);
  745 | 
  746 |     // No alert fired — page still functional
  747 |     await expect(lp.chatInput).toBeVisible();
  748 |     await lp.closeDetailModal();
  749 |   });
  750 | });
  751 | 
  752 | 
  753 | // ──────────────────────────────────────────────────────────────────────────
  754 | // [M07] Leave – Admin Filters & Data Accuracy (TC_LEAVE_032 → TC_LEAVE_035, TC_LEAVE_038 → TC_LEAVE_039)
  755 | // ──────────────────────────────────────────────────────────────────────────
  756 | test.describe('[M07] Leave - Admin Filters & Data Accuracy', () => {
  757 | 
  758 |   test('TC_LEAVE_032 - Lọc danh sách theo Tên nhân viên', async ({ adminPage: page }) => {
  759 |     const ap = new LeaveApprovalPage(page);
  760 |     await ap.goto();
  761 |     await ap.waitForPageLoad();
  762 |     if (await ap.isAccessDenied()) { test.skip(true, 'Access denied'); return; }
  763 | 
  764 |     await ap.switchToSplitView();
  765 |     const before = await ap.getSplitListItemCount();
  766 | 
  767 |     await ap.searchEmployee('user1');
  768 |     await page.waitForTimeout(500);
  769 |     const after = await ap.getSplitListItemCount();
  770 |     expect(after).toBeLessThanOrEqual(before);
  771 |     await ap.clearFilters();
  772 |   });
  773 | 
  774 |   test('TC_LEAVE_033 - Lọc danh sách theo khoảng thời gian', async ({ adminPage: page }) => {
  775 |     const ap = new LeaveApprovalPage(page);
  776 |     await ap.goto();
  777 |     await ap.waitForPageLoad();
  778 |     if (await ap.isAccessDenied()) { test.skip(true, 'Access denied'); return; }
  779 | 
  780 |     await ap.switchToSplitView();
  781 |     await ap.setFilterFromDate('01/01/2025');
  782 |     await ap.setFilterToDate('31/12/2027');
  783 |     await page.waitForTimeout(500);
  784 |     const after = await ap.getSplitListItemCount();
  785 |     expect(after).toBeGreaterThanOrEqual(0);
  786 |     await ap.clearFilters();
  787 |   });
  788 | 
  789 |   test('TC_LEAVE_034 - Dữ liệu đơn khớp chính xác giữa Employee & Admin', async ({ employeePage, adminPage }) => {
  790 |     const lp = new LeaveDashboardPage(employeePage);
  791 |     const ap = new LeaveApprovalPage(adminPage);
  792 | 
  793 |     await lp.goto();
  794 |     await lp.waitForPageLoad();
  795 | 
  796 |     const start = daysFromNow(nextDateOffset());
  797 |     const end = daysFromNow(nextDateOffset());
  798 |     const reasonText = 'TC_034 accuracy check';
  799 | 
  800 |     await lp.fillLeaveForm('Annual Leave', start, end, reasonText);
  801 |     const resp034 = lp.waitForSubmitResponse();
  802 |     await lp.submitRequest();
  803 |     await resp034;
  804 |     await lp.waitForSuccessToast().catch(() => {});
  805 | 
  806 |     await ap.goto();
  807 |     await ap.waitForPageLoad();
  808 |     if (await ap.isAccessDenied()) { test.skip(true, 'Access denied'); return; }
  809 | 
  810 |     await ap.searchEmployee('user1');
  811 |     await adminPage.waitForTimeout(500);
  812 | 
  813 |     if ((await ap.getSplitListItemCount()) === 0) { test.skip(true, 'Not found'); return; }
  814 |     await ap.selectRequestByIndex(0);
  815 | 
  816 |     const type = await ap.getDetailLeaveType();
  817 |     expect(type.toLowerCase()).toContain('annual');
  818 | 
  819 |     const reason = await ap.getDetailReason();
> 820 |     expect(reason).toContain(reasonText);
      |                    ^ Error: expect(received).toContain(expected) // indexOf
  821 | 
  822 |     // Clean up
  823 |     await lp.reloadPage();
  824 |     const idx = await lp.findRowByStatus('pending');
  825 |     if (idx >= 0) { await lp.deleteRequestByIndex(idx); await lp.confirmDelete(); }
  826 |   });
  827 | 
  828 |   test('TC_LEAVE_035 - Revoke Approved → Rejected → Hoàn trả ngày phép', async ({ employeePage, adminPage }) => {
  829 |     const lp = new LeaveDashboardPage(employeePage);
  830 |     const ap = new LeaveApprovalPage(adminPage);
  831 | 
  832 |     await lp.goto();
  833 |     await lp.waitForPageLoad();
  834 |     const balanceBefore = await lp.getBalanceForType('Annual Leave');
  835 |     if (balanceBefore === null || balanceBefore < 1) { test.skip(true, 'Not enough balance'); return; }
  836 | 
  837 |     const start = daysFromNow(nextDateOffset());
  838 |     const end = new Date(start);
  839 | 
  840 |     await lp.fillLeaveForm('Annual Leave', start, end, 'TC_035 revoke');
  841 |     const resp035 = lp.waitForSubmitResponse();
  842 |     await lp.submitRequest();
  843 |     await resp035;
  844 | 
  845 |     // Admin approves
  846 |     await ap.goto();
  847 |     await ap.waitForPageLoad();
  848 |     if (await ap.isAccessDenied()) { test.skip(true, 'Access denied'); return; }
  849 |     await ap.searchEmployee('user1');
  850 |     await adminPage.waitForTimeout(500);
  851 | 
  852 |     if ((await ap.getSplitListItemCount()) === 0) { test.skip(true, 'Not found'); return; }
  853 |     await ap.selectRequestByIndex(0);
  854 | 
  855 |     const approveBtn = ap.detailPanel.locator('button').filter({ hasText: /Approve Leave/i });
  856 |     if ((await approveBtn.count()) > 0) {
  857 |       let r = ap.waitForApprovalResponse();
  858 |       await approveBtn.click();
  859 |       await expect(ap.confirmModal).toBeVisible({ timeout: 5000 });
  860 |       await ap.confirmModalConfirmButton.click();
  861 |       await r;
  862 |     }
  863 | 
  864 |     // Admin revokes (Approved tab)
  865 |     await ap.goto();
  866 |     await ap.waitForPageLoad();
  867 |     await ap.switchToTab('Approved');
  868 |     await ap.searchEmployee('user1');
  869 |     await adminPage.waitForTimeout(500);
  870 | 
  871 |     if ((await ap.getSplitListItemCount()) === 0) { test.skip(true, 'Approved not found'); return; }
  872 |     await ap.selectRequestByIndex(0);
  873 | 
  874 |     const revokeBtn = ap.detailPanel.locator('button').filter({ hasText: /Revoke|Reject/i });
  875 |     if ((await revokeBtn.count()) > 0) {
  876 |       let r = ap.waitForApprovalResponse();
  877 |       await revokeBtn.click();
  878 |       await expect(ap.confirmModal).toBeVisible({ timeout: 5000 });
  879 |       await ap.confirmModalConfirmButton.click();
  880 |       await r;
  881 |     }
  882 | 
  883 |     // Balance restored
  884 |     await lp.reloadPage();
  885 |     const balanceAfter = await lp.getBalanceForType('Annual Leave');
  886 |     if (balanceBefore !== null && balanceAfter !== null) {
  887 |       expect(balanceAfter).toBe(balanceBefore);
  888 |     }
  889 |     const rejectedIdx = await lp.findRowByStatus('rejected');
  890 |     expect(rejectedIdx).toBeGreaterThanOrEqual(0);
  891 |   });
  892 | 
  893 |   test('TC_LEAVE_038 - Bộ lọc: From Date = To Date (cùng ngày)', async ({ adminPage: page }) => {
  894 |     const ap = new LeaveApprovalPage(page);
  895 |     await ap.goto();
  896 |     await ap.waitForPageLoad();
  897 |     if (await ap.isAccessDenied()) { test.skip(true, 'Access denied'); return; }
  898 | 
  899 |     await ap.switchToSplitView();
  900 |     await ap.setFilterFromDate('15/06/2026');
  901 |     await ap.setFilterToDate('15/06/2026');
  902 |     await page.waitForTimeout(500);
  903 |     expect(await ap.getSplitListItemCount()).toBeGreaterThanOrEqual(0);
  904 |     await ap.clearFilters();
  905 |   });
  906 | 
  907 |   test('TC_LEAVE_039 - Bộ lọc lệch 1 ngày: request bắt đầu 15/06 không xuất hiện khi lọc từ 16/06', async ({ adminPage: page }) => {
  908 |     const ap = new LeaveApprovalPage(page);
  909 |     await ap.goto();
  910 |     await ap.waitForPageLoad();
  911 |     if (await ap.isAccessDenied()) { test.skip(true, 'Access denied'); return; }
  912 | 
  913 |     await ap.switchToSplitView();
  914 |     await ap.setFilterFromDate('16/06/2026');
  915 |     await ap.setFilterToDate('20/06/2026');
  916 |     await page.waitForTimeout(500);
  917 |     // Any request with start_date before 16/06 must NOT appear
  918 |     const count = await ap.getSplitListItemCount();
  919 |     if (count > 0) {
  920 |       await ap.selectRequestByIndex(0);
```