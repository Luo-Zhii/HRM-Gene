# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: leave/leave.spec.ts >> [M07] Leave - Chat & Communication >> TC_LEAVE_031 - Chat hai chiều: Employee ↔ Admin
- Location: specs/leave/leave.spec.ts:621:7

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
          - button "9" [ref=e165] [cursor=pointer]:
            - img [ref=e166]
            - generic [ref=e169]: "9"
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
                      - generic [ref=e376]:
                        - textbox "Type your reply..." [ref=e377]
                        - button [disabled] [ref=e378]:
                          - img [ref=e379]
                      - generic [ref=e382]:
                        - paragraph [ref=e383]: Two-Way Channel Active
                        - paragraph [ref=e384]: Shift + Enter for new line
              - generic [ref=e385]:
                - generic [ref=e386]:
                  - generic [ref=e387]:
                    - img [ref=e388]
                    - text: "Request ID:"
                  - text: "#24"
                - generic [ref=e391]:
                  - button "Reject" [ref=e392] [cursor=pointer]
                  - button "Approve Leave" [ref=e393] [cursor=pointer]
  - alert [ref=e394]
```

# Test source

```ts
  568 |     if (pendingIdx < 0) { test.skip(true, 'No pending request found'); return; }
  569 | 
  570 |     await lp.deleteRequestByIndex(pendingIdx);
  571 |     await lp.confirmDelete();
  572 | 
  573 |     await lp.reloadPage();
  574 |     const afterCount = await lp.getHistoryRowCount();
  575 |     expect(afterCount).toBeLessThanOrEqual(beforeCount);
  576 |   });
  577 | 
  578 |   test('TC_LEAVE_030 - Đặt lại lịch sau khi xóa không bị chặn lỗi trùng lặp', async ({ employeePage: page }) => {
  579 |     const lp = new LeaveDashboardPage(page);
  580 |     await lp.goto();
  581 |     await lp.waitForPageLoad();
  582 | 
  583 |     const start = daysFromNow(nextDateOffset());
  584 |     const end = new Date(start);
  585 | 
  586 |     // Create + delete
  587 |     await lp.fillLeaveForm('Annual Leave', start, end, 'TC_030 first');
  588 |     const resp030a = lp.waitForSubmitResponse();
  589 |     await lp.submitRequest();
  590 |     await resp030a;
  591 |     await lp.waitForSuccessToast().catch(() => {});
  592 |     await lp.reloadPage();
  593 | 
  594 |     const pendingIdx = await lp.findRowByStatus('pending');
  595 |     if (pendingIdx < 0) { test.skip(true, 'Pending not found'); return; }
  596 |     await lp.deleteRequestByIndex(pendingIdx);
  597 |     await lp.confirmDelete();
  598 |     await lp.waitForSuccessToast().catch(() => {});
  599 | 
  600 |     // Re-create with same dates
  601 |     await lp.fillLeaveForm('Annual Leave', start, end, 'TC_030 second');
  602 |     const resp = lp.waitForSubmitResponse();
  603 |     await lp.submitRequest();
  604 |     const result = await resp;
  605 |     // Must succeed — no overlap error since old was deleted
  606 |     if (!result.ok()) { test.skip(true, `Submit ${result.status()} — may overlap with approved`); return; }
  607 |     expect(result.ok()).toBeTruthy();
  608 | 
  609 |     // Clean up
  610 |     const idx2 = await lp.findRowByStatus('pending');
  611 |     if (idx2 >= 0) { await lp.deleteRequestByIndex(idx2); await lp.confirmDelete(); }
  612 |   });
  613 | });
  614 | 
  615 | 
  616 | // ──────────────────────────────────────────────────────────────────────────
  617 | // [M07] Leave – Chat & Communication (TC_LEAVE_031, TC_LEAVE_036, TC_LEAVE_037, TC_LEAVE_040)
  618 | // ──────────────────────────────────────────────────────────────────────────
  619 | test.describe('[M07] Leave - Chat & Communication', () => {
  620 | 
  621 |   test('TC_LEAVE_031 - Chat hai chiều: Employee ↔ Admin', async ({ employeePage, adminPage }) => {
  622 |     const lp = new LeaveDashboardPage(employeePage);
  623 |     const ap = new LeaveApprovalPage(adminPage);
  624 | 
  625 |     // Employee opens first request
  626 |     await lp.goto();
  627 |     await lp.waitForPageLoad();
  628 | 
  629 |     let count = await lp.getHistoryRowCount();
  630 |     if (count === 0) {
  631 |       const start = daysFromNow(nextDateOffset());
  632 |       const end = new Date(start);
  633 |       await lp.fillLeaveForm('Annual Leave', start, end, 'TC_031 chat');
  634 |       const resp031 = lp.waitForSubmitResponse();
  635 |       await lp.submitRequest();
  636 |       await resp031;
  637 |       await lp.reloadPage();
  638 |       count = await lp.getHistoryRowCount();
  639 |     }
  640 |     if (count === 0) { test.skip(true, 'No requests for chat'); return; }
  641 | 
  642 |     await lp.viewRequestByIndex(0);
  643 | 
  644 |     // Employee sends
  645 |     const empMsg = 'Admin oi duyet som giup em';
  646 |     await lp.sendChatMessage(empMsg);
  647 |     await expect(lp.chatBubble(empMsg)).toBeVisible({ timeout: 8000 });
  648 | 
  649 |     // Admin opens same request, sends reply
  650 |     await ap.goto();
  651 |     await ap.waitForPageLoad();
  652 |     if (await ap.isAccessDenied()) { test.skip(true, 'Admin denied'); return; }
  653 | 
  654 |     await ap.searchEmployee('user1');
  655 |     await adminPage.waitForTimeout(500);
  656 | 
  657 |     if ((await ap.getSplitListItemCount()) === 0) { test.skip(true, 'Not found'); return; }
  658 |     await ap.selectRequestByIndex(0);
  659 | 
  660 |     const adminReply = 'OK em, de anh duyet';
  661 |     await ap.sendChatMessage(adminReply);
  662 |     await expect(ap.chatBubble(adminReply)).toBeVisible({ timeout: 8000 });
  663 | 
  664 |     // Employee reopens modal — should see admin's reply
  665 |     await lp.closeDetailModal();
  666 |     await lp.viewRequestByIndex(0);
  667 |     const seesReply = await lp.hasChatMessageContaining(adminReply);
> 668 |     expect(seesReply).toBeTruthy();
      |                       ^ Error: expect(received).toBeTruthy()
  669 | 
  670 |     await lp.closeDetailModal();
  671 |   });
  672 | 
  673 |   test('TC_LEAVE_036 - Chat: Gửi tin nhắn rỗng bị chặn', async ({ employeePage: page }) => {
  674 |     const lp = new LeaveDashboardPage(page);
  675 |     await lp.goto();
  676 |     await lp.waitForPageLoad();
  677 | 
  678 |     let count = await lp.getHistoryRowCount();
  679 |     if (count === 0) {
  680 |       const start = daysFromNow(nextDateOffset());
  681 |       const end = new Date(start);
  682 |       await lp.fillLeaveForm('Annual Leave', start, end, 'TC_036');
  683 |       const resp036 = lp.waitForSubmitResponse();
  684 |       await lp.submitRequest();
  685 |       await resp036;
  686 |       await lp.reloadPage();
  687 |       count = await lp.getHistoryRowCount();
  688 |     }
  689 |     if (count === 0) { test.skip(true, 'No requests'); return; }
  690 | 
  691 |     await lp.viewRequestByIndex(0);
  692 |     await expect(lp.chatSendButton).toBeDisabled(); // empty input
  693 |     await lp.chatInput.fill('   '); // whitespace only
  694 |     await expect(lp.chatSendButton).toBeDisabled();
  695 |     await lp.closeDetailModal();
  696 |   });
  697 | 
  698 |   test('TC_LEAVE_037 - Chat: Gửi tin nhắn vượt giới hạn ký tự', async ({ employeePage: page }) => {
  699 |     const lp = new LeaveDashboardPage(page);
  700 |     await lp.goto();
  701 |     await lp.waitForPageLoad();
  702 | 
  703 |     let count = await lp.getHistoryRowCount();
  704 |     if (count === 0) {
  705 |       const start = daysFromNow(nextDateOffset());
  706 |       const end = new Date(start);
  707 |       await lp.fillLeaveForm('Annual Leave', start, end, 'TC_037');
  708 |       const resp037 = lp.waitForSubmitResponse();
  709 |       await lp.submitRequest();
  710 |       await resp037;
  711 |       await lp.reloadPage();
  712 |       count = await lp.getHistoryRowCount();
  713 |     }
  714 |     if (count === 0) { test.skip(true, 'No requests'); return; }
  715 | 
  716 |     await lp.viewRequestByIndex(0);
  717 |     const longMsg = 'A'.repeat(3000);
  718 |     await lp.chatInput.fill(longMsg);
  719 |     const value = await lp.chatInput.inputValue();
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
```