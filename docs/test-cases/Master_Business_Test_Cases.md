# HRM-DashStack: Master Business Test Cases

## 1. Summary
This document contains the business-readable test cases reverse-engineered from the technical unit tests across the entire HRM-DashStack system.

---

### Module: System Administration
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| System Administration | System Settings | Success | Admin | ADMIN_01 | The system retrieves all global system settings correctly | Function | API / Controller Integration |
| System Administration | System Settings | Success | Admin | ADMIN_02 | The system retrieves a specific system setting by its identifier | Function | API / Controller Integration |
| System Administration | System Settings | Success | Admin | ADMIN_03 | The system successfully updates a specific system setting | Function | API / Controller Integration |
| System Administration | System Settings | Failure | Admin | ADMIN_04 | The system gracefully handles requests for non-existent settings | Logic | Unit / Service Logic |
| System Administration | System Settings | Success | Admin | ADMIN_05 | The system creates a new setting if it does not exist during an update operation | Logic | Unit / Service Logic |
| System Administration | System Settings | Success | Admin | ADMIN_06 | The system updates an existing setting value accurately | Logic | Unit / Service Logic |
| System Administration | Organization | Success | Admin | ADMIN_07 | The system retrieves overall organization statistics successfully | Function | API / Controller Integration |
| System Administration | Organization | Success | Admin | ADMIN_08 | The system compiles and returns accurate organization statistics data | Logic | Unit / Service Logic |
| System Administration | Departments | Success | Admin | ADMIN_09 | The system retrieves a complete list of all departments | Function | API / Controller Integration |
| System Administration | Departments | Success | Admin | ADMIN_10 | The system successfully creates a new department record | Function | API / Controller Integration |
| System Administration | Departments | Success | Admin | ADMIN_11 | The system validates input data during department creation | Logic | Unit / Service Logic |
| System Administration | Departments | Success | Admin | ADMIN_12 | The system successfully updates an existing department | Function | API / Controller Integration |
| System Administration | Departments | Failure | Admin | ADMIN_13 | The system rejects update operations for non-existent departments | Logic | Unit / Service Logic |
| System Administration | Departments | Success | Admin | ADMIN_14 | The system successfully assigns a valid manager to a department | Logic | Unit / Service Logic |
| System Administration | Departments | Failure | Admin | ADMIN_15 | The system prevents deletion of a department that still has assigned employees | Logic | Unit / Service Logic |
| System Administration | Departments | Success | Admin | ADMIN_16 | The system successfully deletes an empty department | Logic | Unit / Service Logic |
| System Administration | Positions | Success | Admin | ADMIN_17 | The system retrieves all positions successfully | Function | API / Controller Integration |
| System Administration | Positions | Success | Admin | ADMIN_18 | The system successfully creates a new job position | Function | API / Controller Integration |
| System Administration | Permissions | Success | Admin | ADMIN_19 | The system generates a complete permission matrix | Function | API / Controller Integration |
| System Administration | Permissions | Success | Admin | ADMIN_20 | The system assigns a specific permission to a position | Function | API / Controller Integration |
| System Administration | Permissions | Failure | Admin | ADMIN_21 | The system handles assignment of an already existing permission gracefully | Logic | Unit / Service Logic |
| System Administration | Permissions | Success | Admin | ADMIN_22 | The system successfully revokes a permission from a position | Function | API / Controller Integration |
| System Administration | Permissions | Failure | Admin | ADMIN_23 | The system handles revocation of non-existent permissions gracefully | Logic | Unit / Service Logic |
| System Administration | Employee Operations | Success | Admin | ADMIN_24 | The system retrieves a comprehensive list of all employees for administrative view | Function | API / Controller Integration |
| System Administration | Employee Operations | Success | Admin | ADMIN_25 | The system retrieves basic employee information | Function | API / Controller Integration |
| System Administration | Employee Operations | Success | Admin | ADMIN_26 | The system successfully transfers an employee to a new department or position | Function | API / Controller Integration |
| System Administration | Employee Operations | Success | Admin | ADMIN_27 | The system correctly processes the employee transfer logic in the backend | Logic | Unit / Service Logic |
| System Administration | System Initialization | Success | Admin | ADMIN_28 | The system successfully seeds demo data without explicit arguments | Function | API / Controller Integration |
| System Administration | System Initialization | Success | Admin | ADMIN_29 | The system successfully seeds demo data with specific arguments | Function | API / Controller Integration |
| System Administration | System Initialization | Failure | Admin | ADMIN_30 | The system throws an error when attempting to seed without an employee context | Logic | Unit / Service Logic |
| System Administration | System Initialization | Success | Admin | ADMIN_31 | The system successfully executes seeding logic if an employee is found | Logic | Unit / Service Logic |

### Module: Reporting & Analytics
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Reporting & Analytics | Dashboard Data | Success | HR/Admin | ANALYTICS_01 | The system returns compiled dashboard data through the API endpoint | Function | API / Controller Integration |
| Reporting & Analytics | Dashboard Data | Success | System | ANALYTICS_02 | The system structures and formats dashboard analytics data correctly | Logic | Unit / Service Logic |
| Reporting & Analytics | Dashboard Data | Edge Case | System | ANALYTICS_03 | The system gracefully handles zero totals to prevent division by zero errors (NaN) | Logic | Edge Case Handling |

### Module: Internal Communications
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Internal Communications | Announcements | Success | HR/Admin | ANNOUNCE_01 | The system allows authorized users to create a new announcement | Function | API / Controller Integration |
| Internal Communications | Announcements | Success | HR/Admin | ANNOUNCE_02 | The system returns a full list of all announcements | Function | API / Controller Integration |
| Internal Communications | Announcements | Success | Employee | ANNOUNCE_03 | The system retrieves a personalized announcement feed for the current user | Function | API / Controller Integration |
| Internal Communications | Announcements | Success | HR/Admin | ANNOUNCE_04 | The system allows authorized users to delete an announcement | Function | API / Controller Integration |
| Internal Communications | Announcements | Success | System | ANNOUNCE_05 | The system creates an announcement without pushing notifications if delivery method is not 'in_app' | Logic | Unit / Service Logic |
| Internal Communications | Announcements | Success | System | ANNOUNCE_06 | The system successfully dispatches notifications to all employees if requested during creation | Integration | Unit / Service Logic |
| Internal Communications | Announcements | Success | System | ANNOUNCE_07 | The system accurately targets and dispatches notifications to a specific department | Integration | Unit / Service Logic |
| Internal Communications | Announcements | Success | System | ANNOUNCE_08 | The system sorts all retrieved announcements by creation date in descending order | Logic | Unit / Service Logic |
| Internal Communications | Announcements | Success | System | ANNOUNCE_09 | The system accurately filters the user's feed based on their target audience criteria | Logic | Unit / Service Logic |
| Internal Communications | Announcements | Fallback | System | ANNOUNCE_10 | The system defaults the target audience to 'NONE_DEPT' if the user lacks a department assignment | Logic | Unit / Service Logic |
| Internal Communications | Announcements | Success | System | ANNOUNCE_11 | The system successfully processes the deletion of an announcement by ID | Logic | Unit / Service Logic |

### Module: Authentication & Authorization
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Authentication | Login | Failure | Guest | AUTH_01 | The system rejects login and returns an error for invalid credentials | Security | API / Controller Integration |
| Authentication | Login | Success | Guest | AUTH_02 | The system successfully authenticates the user, returns a token, and sets a secure cookie | Security | API / Controller Integration |
| Authentication | Logout | Success | Employee | AUTH_03 | The system processes logout by clearing session cookies and returning a success response | Security | API / Controller Integration |
| Authentication | Profile Access | Failure | Guest | AUTH_04 | The system denies profile access and returns null if no valid user ID is provided | Security | API / Controller Integration |
| Authentication | Profile Access | Success | Employee | AUTH_05 | The system successfully retrieves the profile details of the authenticated user | Function | API / Controller Integration |
| Authentication | Profile Update | Success | Employee | AUTH_06 | The system successfully invokes the update workflow with the correct contact info payload | Function | API / Controller Integration |
| Authentication | Avatar Upload | Failure | Employee | AUTH_07 | The system rejects avatar upload with a Bad Request error if no file payload is provided | Function | API / Controller Integration |
| Authentication | Avatar Upload | Success | Employee | AUTH_08 | The system successfully updates the avatar URL and returns the uploaded result | Function | API / Controller Integration |
| Authorization | Navigation Menu | Failure | Guest | AUTH_09 | The system returns an empty navigation structure if the user is unauthenticated | Logic | API / Controller Integration |
| Authorization | Navigation Menu | Success | Employee | AUTH_10 | The system restricts navigation items to 'main' only and hides 'admin' menus for non-admin users | Security | API / Controller Integration |
| Authorization | Navigation Menu | Success | Admin | AUTH_11 | The system provides access to both 'main' and 'admin' navigation items for administrative users | Security | API / Controller Integration |
| Authentication | Admin Registration | Failure | Guest | AUTH_12 | The system rejects admin registration with a Bad Request error if mandatory fields are missing | Function | API / Controller Integration |
| Authentication | Admin Registration | Success | Guest | AUTH_13 | The system processes admin registration and invokes the correct creation service upon success | Function | API / Controller Integration |
| Authorization | Permission Fetching | Edge Case | System | AUTH_14 | The system returns an empty permission array if the user has no assigned position ID | Logic | Unit / Service Logic |
| Authorization | Permission Fetching | Edge Case | System | AUTH_15 | The system returns an empty array if no specific permissions are linked to the user's position | Logic | Unit / Service Logic |
| Authorization | Permission Fetching | Success | System | AUTH_16 | The system successfully compiles and returns the list of permission names for the user | Logic | Unit / Service Logic |
| Authentication | Contact Info Update | Failure | System | AUTH_17 | The system throws a Not Found exception if the target employee for update does not exist | Logic | Unit / Service Logic |
| Authentication | Contact Info Update | Success | System | AUTH_18 | The system successfully updates and persists the employee's basic information and settings | Logic | Unit / Service Logic |
| Authentication | Contact Info Update | Success | System | AUTH_19 | The system accurately updates bank information if an existing bank record is found | Logic | Unit / Service Logic |
| Authentication | Contact Info Update | Success | System | AUTH_20 | The system accurately creates new bank information if no previous bank record existed | Logic | Unit / Service Logic |
| Authentication | Avatar Update | Failure | System | AUTH_21 | The system throws a Not Found exception if the target employee for avatar update is missing | Logic | Unit / Service Logic |
| Authentication | Avatar Update | Success | System | AUTH_22 | The system successfully persists the new avatar URL for the employee | Logic | Unit / Service Logic |
| Authentication | User Validation | Failure | System | AUTH_23 | The system returns null during validation if the user account cannot be located | Security | Unit / Service Logic |
| Authentication | User Validation | Failure | System | AUTH_24 | The system returns null during validation if the provided password does not match the hash | Security | Unit / Service Logic |
| Authentication | User Validation | Failure | System | AUTH_25 | The system denies access and throws Unauthorized exception if the employee is terminated past resignation date | Security | Unit / Service Logic |
| Authentication | User Validation | Success | System | AUTH_26 | The system validates the user successfully, omits the password from the return object, and attaches permissions | Security | Unit / Service Logic |
| Authentication | Profile Retrieval | Failure | System | AUTH_27 | The system throws a Not Found exception when retrieving a profile for a non-existent user | Logic | Unit / Service Logic |
| Authentication | Profile Retrieval | Success | System | AUTH_28 | The system securely returns user profile details (omitting passwords) including aggregated permissions | Security | Unit / Service Logic |
| Authentication | Token Generation | Success | System | AUTH_29 | The system successfully encodes and returns the access token payload upon valid login | Security | Unit / Service Logic |
| Authentication | Admin Registration | Failure | System | AUTH_30 | The system throws an Unauthorized exception if an incorrect registration secret is provided | Security | Unit / Service Logic |
| Authentication | Admin Registration | Failure | System | AUTH_31 | The system rejects admin registration with a Bad Request error if the email is already in use | Logic | Unit / Service Logic |
| Authentication | Admin Registration | Failure | System | AUTH_32 | The system rejects admin registration if the specified position is invalid or not found | Logic | Unit / Service Logic |
| Authentication | Admin Registration | Failure | System | AUTH_33 | The system rejects admin registration if the specified department is invalid or not found | Logic | Unit / Service Logic |
| Authentication | Admin Registration | Success | System | AUTH_34 | The system successfully hashes the password, creates the account, and saves the new admin user | Security | Unit / Service Logic |

### Module: Comments & Collaboration
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Collaboration | Comments | Success | Employee | COMMENT_01 | The system successfully extracts the author ID from the security token and routes comment creation | Function | API / Controller Integration |
| Collaboration | Comments | Success | Employee | COMMENT_02 | The system retrieves all comments associated with a specific entity (e.g., Leave Request) | Function | API / Controller Integration |
| Collaboration | Comments | Success | System | COMMENT_03 | The system successfully posts an employee's comment on a Leave Request and pushes a notification to the admin | Integration | Unit / Service Logic |
| Collaboration | Comments | Success | System | COMMENT_04 | The system successfully posts an admin's comment on a Resignation and pushes a notification to the employee | Integration | Unit / Service Logic |
| Collaboration | Comments | Edge Case | System | COMMENT_05 | The system successfully creates the comment and handles notification failures silently without interrupting the flow | Logic | Unit / Service Logic |
| Collaboration | Comments | Success | System | COMMENT_06 | The system aggregates and arranges comments correctly by entity type and entity ID | Logic | Unit / Service Logic |
| Collaboration | Comments | Success | System | COMMENT_07 | The system retrieves a specific, isolated comment successfully if found | Logic | Unit / Service Logic |
| Collaboration | Comments | Failure | System | COMMENT_08 | The system throws a Not Found exception when queried for a non-existent comment | Logic | Unit / Service Logic |

### Module: Company Profile
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Core HR | Company Profile | Success | Admin | COMP_01 | The system successfully returns the active company profile | Function | API / Controller Integration |
| Core HR | Company Profile | Success | Admin | COMP_02 | The system correctly loads the current company profile and processes an update payload | Function | API / Controller Integration |
| Core HR | Company Profile | Failure | Admin | COMP_03 | The system throws a Bad Request exception if the logo file payload is missing during upload | Function | API / Controller Integration |
| Core HR | Company Profile | Success | Admin | COMP_04 | The system successfully receives the file and updates the profile's logo URL | Function | API / Controller Integration |
| Core HR | Company Profile | Success | System | COMP_05 | The system retrieves the existing company profile data directly | Logic | Unit / Service Logic |
| Core HR | Company Profile | Fallback | System | COMP_06 | The system generates and returns a default profile schema if no configuration exists during retrieval | Logic | Unit / Service Logic |
| Core HR | Company Profile | Success | System | COMP_07 | The system successfully commits profile updates and re-fetches the active profile for confirmation | Logic | Unit / Service Logic |
| Core HR | Company Profile | Success | System | COMP_08 | The system explicitly limits updates to the logo URL when processing logo changes and returns the modified profile | Logic | Unit / Service Logic |

### Module: Employee Contracts
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Employee Management | Contract Creation | Success | HR/Admin | CONT_01 | The system processes input payloads and accurately routes them to create a new contract | Function | API / Controller Integration |
| Employee Management | Contract Viewing | Success | HR/Admin | CONT_02 | The system grants administrators full access to view all contracts and apply specific targeting filters | Security | API / Controller Integration |
| Employee Management | Contract Viewing | Success | Employee | CONT_03 | The system strictly limits non-privileged users to viewing only their personal contract data | Security | API / Controller Integration |
| Employee Management | Contract Viewing | Failure | Employee | CONT_04 | The system throws an exception and blocks unauthorized attempts by standard users to view others' contracts | Security | API / Controller Integration |
| Employee Management | Contract Viewing | Success | Employee | CONT_05 | The system allows an employee to successfully view their own relational contract data | Security | API / Controller Integration |
| Employee Management | Contract Viewing | Success | Admin | CONT_06 | The system grants HR/Admin personnel full clearance to fetch arrays of other employees' contract data | Security | API / Controller Integration |
| Employee Management | Contract Fetching | Success | Employee | CONT_07 | The system explicitly limits the fetching of a single contract to ensure it matches the user's isolated ID | Security | API / Controller Integration |
| Employee Management | Contract Update | Success | HR/Admin | CONT_08 | The system successfully maps partial payload updates uniformly down to the execution service | Function | API / Controller Integration |
| Employee Management | Contract Update | Success | HR/Admin | CONT_09 | The system ensures PUT operations effectively share and execute the same core update behavior | Function | API / Controller Integration |
| Employee Management | Contract Deletion | Success | HR/Admin | CONT_10 | The system successfully processes contract deletion requests straight to the repository boundary | Function | API / Controller Integration |
| Employee Management | Contract Processing | Failure | System | CONT_11 | The system explicitly throws a Not Found exception if attempting to bind a contract to a missing employee | Logic | Unit / Service Logic |
| Employee Management | Contract Processing | Failure | System | CONT_12 | The system throws a Bad Request exception if a targeted contract sequence overlap is detected | Logic | Unit / Service Logic |
| Employee Management | Contract Processing | Success | System | CONT_13 | The system generates a contract, automatically deactivates overlapping states, and logs subsequent salary changes | Integration | Unit / Service Logic |
| Employee Management | Contract Fetching | Success | System | CONT_14 | The system dynamically configures pagination combined with conditional builder constraints for contract lists | Logic | Unit / Service Logic |
| Employee Management | Contract Fetching | Success | System | CONT_15 | The system isolates, locates, and sorts contract listings strictly tied to an individual employee | Logic | Unit / Service Logic |
| Employee Management | Contract Fetching | Failure | System | CONT_16 | The system natively catches internal rejections and errors when failing to locate a matched contract record | Logic | Unit / Service Logic |
| Employee Management | Contract Fetching | Success | System | CONT_17 | The system accurately returns a single contract strictly adhering to query constraints | Logic | Unit / Service Logic |
| Employee Management | Contract Update | Success | System | CONT_18 | The system updates parameters, auto-expires outdated configurations, and implicitly calculates salary deltas | Logic | Unit / Service Logic |
| Employee Management | Contract Deletion | Success | System | CONT_19 | The system bridges deletion constraints correctly ensuring clean removal without accidental data retention | Logic | Unit / Service Logic |

### Module: Compensation & Salary History
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Compensation | Salary History View | Success | HR/Admin | SALHIS_01 | The system permits administrators to evaluate all targeting filters when fetching global salary history | Security | API / Controller Integration |
| Compensation | Salary History View | Success | Employee | SALHIS_02 | The system strictly isolates standard users, restricting salary history queries exclusively to their owned segments | Security | API / Controller Integration |
| Compensation | Salary History Fetch | Success | System | SALHIS_03 | The system enforces precise query masking, returning active constraints matched cleanly for individual lookups | Logic | API / Controller Integration |
| Compensation | Salary History Fetch | Failure | System | SALHIS_04 | The system relays dynamic exceptions when a queried salary history record inherently fails to map | Logic | API / Controller Integration |

### Module: Time & Attendance / Leave Management
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Time & Attendance | Leave Types | Success | All | LEAVE_01 | The system logically retrieves and returns the generic collection of available leave types | Function | API / Controller Integration |
| Time & Attendance | Leave Balances | Success | Employee | LEAVE_02 | The system consistently routes authorization boundaries, dynamically mapping identities for balance checks | Security | API / Controller Integration |
| Time & Attendance | Leave Requests | Success | Employee | LEAVE_03 | The system explicitly limits the request payload execution, ensuring employees only see their own requests | Security | API / Controller Integration |
| Time & Attendance | Request Submission | Success | Employee | LEAVE_04 | The system maps submission requests, bridging internal bindings and efficiently isolating context | Function | API / Controller Integration |
| Time & Attendance | Pending Requests | Success | Manager | LEAVE_05 | The system processes fetching sequences correctly, accurately verifying manager privileges to view pending requests | Security | API / Controller Integration |
| Time & Attendance | Leave Approval | Success | Admin/Manager | LEAVE_06 | The system securely orchestrates leave approvals, applying conditional structural updates for admin interventions | Function | API / Controller Integration |
| Time & Attendance | Leave Processing | Success | System | LEAVE_07 | The system reduces duplicate leave types, guaranteeing a globally unique configured set is returned | Logic | Unit / Service Logic |
| Time & Attendance | Leave Balances | Success | System | LEAVE_08 | The system accurately aggregates nested user balances while cleanly stripping operational overlaps | Logic | Unit / Service Logic |
| Time & Attendance | Leave Requests | Success | System | LEAVE_09 | The system correctly parses manager/admin remarks within requests and ensures proper response configurations | Logic | Unit / Service Logic |
| Time & Attendance | Request Submission | Failure | System | LEAVE_10 | The system deliberately forces a failure to preserve database integrity if the targeted configuration is unlocatable | Logic | Unit / Service Logic |
| Time & Attendance | Request Submission | Success | System | LEAVE_11 | The system dynamically computes relationships, logging request bindings, and triggering push notifications automatically | Integration | Unit / Service Logic |
| Time & Attendance | Leave Approval | Security | System | LEAVE_12 | The system statically locks constraint updates to robustly protect approval actions from unauthorized alterations | Security | Unit / Service Logic |
| Time & Attendance | Leave Approval | Success | System | LEAVE_13 | The system actively deducts consumed allowances from the balance, permanently binding manager actions to history | Logic | Unit / Service Logic |
| Time & Attendance | Leave Approval | Edge Case | System | LEAVE_14 | The system actively intercepts mathematical overflow when processing limits, securely resetting constraints appropriately | Logic | Unit / Service Logic |

### Module: Notifications
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Notifications | Notification Retrieval | Success | Employee | NOTIF_01 | The system successfully retrieves a paginated list of the user's notifications | Function | API / Controller Integration |
| Notifications | Mark as Read | Success | Employee | NOTIF_02 | The system successfully processes requests to mark specific notifications as read | Function | API / Controller Integration |
| Notifications | Real-time Connection | Success | Employee | NOTIF_03 | The system securely establishes a WebSocket connection and registers the user session | Logic | WebSocket / Gateway |
| Notifications | Real-time Connection | Edge Case | Employee | NOTIF_04 | The system smoothly handles multiple connection instances for the same user | Logic | WebSocket / Gateway |
| Notifications | Real-time Disconnection | Success | Employee | NOTIF_05 | The system cleans up the WebSocket session upon user disconnection accurately | Logic | WebSocket / Gateway |
| Notifications | Push Delivery | Success | System | NOTIF_06 | The system reliably pushes real-time notification events to the connected user | Integration | WebSocket / Gateway |
| Notifications | Create Notification | Success | System | NOTIF_07 | The system formats and correctly inserts a new notification record into the database | Logic | Unit / Service Logic |
| Notifications | Create Notification | Edge Case | System | NOTIF_08 | The system successfully queues or retries delivery if the primary notification fails | Logic | Unit / Service Logic |
| Notifications | Broadcast | Success | Admin | NOTIF_09 | The system successfully broadcasts announcements to all targeted employees seamlessly | Integration | Unit / Service Logic |
| Notifications | Delete Notification | Success | Employee | NOTIF_10 | The system correctly removes a notification from the user's inbox | Logic | Unit / Service Logic |

### Module: Compensation / Payroll
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Compensation | Payroll Generation | Success | HR/Admin | PAYROLL_01 | The system successfully executes batch payroll generation across the designated period | Function | API / Controller Integration |
| Compensation | Payroll Generation | Failure | HR/Admin | PAYROLL_02 | The system correctly blocks payroll generation if the specified period constraints are missing | Function | API / Controller Integration |
| Compensation | Single Payslip | Success | HR/Admin | PAYROLL_03 | The system successfully generates a single isolated payslip for a specified employee | Function | API / Controller Integration |
| Compensation | View Payslips | Success | Employee | PAYROLL_04 | The system authenticates the user and successfully lists their historical payslips | Security | API / Controller Integration |
| Compensation | Salary Configuration | Edge Case | Admin | PAYROLL_05 | The system validates and rejects negative constraints or illogical configurations cleanly | Function | API / Controller Integration |
| Compensation | Salary Configuration | Failure | Admin | PAYROLL_06 | The system enforces strict input validation, blocking requests with empty or null salary parameters | Function | API / Controller Integration |
| Compensation | Adjustments | Success | HR/Admin | PAYROLL_07 | The system accurately maps structural adjustments (bonuses, deductions) to the target payslip | Function | API / Controller Integration |
| Compensation | Single Payslip | Failure | System | PAYROLL_08 | The system structurally isolates and correctly reports generation exceptions during single payslip processing | Logic | Unit / Service Logic |
| Compensation | Payslip Approval | Success | Admin | PAYROLL_09 | The system sequentially approves payslips and seamlessly generates payment notifications | Integration | Unit / Service Logic |
| Compensation | Batch Approval | Failure | Admin | PAYROLL_10 | The system automatically rolls back batch approvals if structural dependencies are unmet | Logic | Unit / Service Logic |
| Compensation | Salary Processing | Success | System | PAYROLL_11 | The system implicitly applies logical structural adjustments accurately when finalizing payslips | Logic | Unit / Service Logic |
| Utilities | Number to Words | Success | System | PAYROLL_12 | The system mathematically and accurately translates final salary figures into Vietnamese text representations | Logic | Unit / Service Logic |

### Module: Organization Management / Positions
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Organization | View Positions | Success | Admin | POS_01 | The system accurately lists all job positions including relational hierarchy data | Function | API / Controller Integration |
| Organization | Create Position | Success | Admin | POS_02 | The system validates constraints and seamlessly saves the new position | Logic | Unit / Service Logic |
| Organization | Update Position | Success | Admin | POS_03 | The system flawlessly merges updates into an existing position without corrupting relational links | Logic | Unit / Service Logic |
| Organization | Delete Position | Failure | Admin | POS_04 | The system intelligently blocks the deletion of a position if employees are currently assigned to it | Security | Unit / Service Logic |
| Organization | Delete Position | Success | Admin | POS_05 | The system securely removes a position once all dependencies are cleanly resolved | Logic | Unit / Service Logic |

### Module: Reporting & Analytics (Reports)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Reporting | Payroll Summary | Success | Admin | REP_01 | The system successfully processes parameters and generates an aggregated payroll summary report | Function | API / Controller Integration |
| Reporting | Payroll Summary | Edge Case | Admin | REP_02 | The system deploys accurate fallback defaults when querying incomplete reporting parameters | Function | API / Controller Integration |
| Reporting | Overall Dashboard | Success | Admin | REP_03 | The system seamlessly aggregates transparent cross-module data for executive dashboards | Function | API / Controller Integration |
| Reporting | Payroll Summary | Edge Case | System | REP_04 | The system intelligently yields zeroed sets if payroll aggregates evaluate to null to maintain structural integrity | Logic | Unit / Service Logic |
| Reporting | Data Aggregation | Success | System | REP_05 | The system reliably processes raw reporting queries into structured, actionable business metrics | Logic | Unit / Service Logic |

### Module: Core HR / Offboarding (Resignations)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Offboarding | Submit Resignation | Failure | Employee | RESIGN_01 | The system dynamically intercepts and correctly denies duplicate resignation submissions | Security | API / Controller Integration |
| Offboarding | Submit Resignation | Success | Employee | RESIGN_02 | The system properly captures the resignation submission and generates pending workflow items | Function | API / Controller Integration |
| Offboarding | View Requests | Success | Admin | RESIGN_03 | The system safely fetches comprehensive resignation lists for administrative review | Function | API / Controller Integration |
| Offboarding | Update Status | Success | Admin | RESIGN_04 | The system securely processes approval or rejection updates for pending resignation requests | Function | API / Controller Integration |
| Offboarding | Request Logic | Success | System | RESIGN_05 | The system sequentially triggers notifications to HR and Managers upon resignation creation | Integration | Unit / Service Logic |
| Offboarding | Isolation Logic | Success | System | RESIGN_06 | The system cleanly queries and isolates an employee's personal requests from global bounds | Logic | Unit / Service Logic |
| Offboarding | Validation Bounds | Edge Case | System | RESIGN_07 | The system enforces strict validation limits natively ensuring resignation statuses transition logically | Logic | Unit / Service Logic |
| Offboarding | Offboarding Automation | Success | System | RESIGN_08 | The system flawlessly executes background offboarding scripts (access removal) when resignation is finalized | Integration | Unit / Service Logic |

### Module: Time & Attendance
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Time & Attendance | Global Attendance | Success | Admin | TIME_01 | The system effectively retrieves transparent organizational attendance data spanning multiple bounds | Function | API / Controller Integration |
| Time & Attendance | Generate QR | Success | Admin | TIME_02 | The system cleanly generates dynamic, time-sensitive QR codes for check-in | Function | API / Controller Integration |
| Time & Attendance | IP Check-In | Edge Case | Employee | TIME_03 | The system seamlessly validates IP range restrictions before accepting the check-in | Security | API / Controller Integration |
| Time & Attendance | QR Check-In | Failure | Employee | TIME_04 | The system intelligently rejects expired or invalid QR check-in attempts | Security | API / Controller Integration |
| Time & Attendance | QR Check-In | Success | Employee | TIME_05 | The system accurately captures and records successful QR check-ins against the employee record | Function | API / Controller Integration |
| Time & Attendance | Attendance Logic | Success | System | TIME_06 | The system mathematically processes timestamps effectively assigning "late" or "on-time" statuses correctly | Logic | Unit / Service Logic |
| Time & Attendance | Security Logic | Success | System | TIME_07 | The system prevents concurrent or rapidly duplicated check-in entries efficiently | Logic | Unit / Service Logic |

### Module: Disciplinary Management
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Disciplinary | Create Violation | Success | Admin/Manager | VIOLATION_01 | The system successfully captures inputs and registers a disciplinary violation for an employee | Function | API / Controller Integration |
| Disciplinary | Sync Attendance | Success | System | VIOLATION_02 | The system executes secondary sync integrations perfectly to flag repeated tardiness as violations | Integration | API / Controller Integration |
| Disciplinary | View Violations | Success | Admin | VIOLATION_03 | The system safely retrieves all violations across the organization for administrative oversight | Security | API / Controller Integration |
| Disciplinary | View Personal | Success | Employee | VIOLATION_04 | The system explicitly limits the view to the employee's own recorded violations securely | Security | API / Controller Integration |
| Disciplinary | Update Violation | Success | Admin | VIOLATION_05 | The system inherently allows administrators to effectively update violation status (e.g., Appealed, Resolved) | Function | API / Controller Integration |
| Disciplinary | Delete Violation | Success | Admin | VIOLATION_06 | The system cleanly cascades the deletion of a violation resolving historical dependencies | Function | API / Controller Integration |
| Disciplinary | Sync Logic | Success | System | VIOLATION_07 | The system accurately iterates attendance data natively to persist automated violations consistently | Logic | Unit / Service Logic |

### Module: Contextual Chat (Frontend)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| AI Assistant | Contextual Chat | Success | Employee | CHAT_01 | The system UI accurately renders the chat widget component flawlessly without blocking main execution | GUI | UI Integration |
| AI Assistant | Message Handling | Success | Employee | CHAT_02 | The system dynamically processes user queries and optimally streams AI responses visually | GUI | Logic / Integration |

### Module: Dashboard Widgets (Frontend)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Dashboard | Admin Widget | Success | Admin | FRONT_DASH_01 | The UI efficiently structures and renders high-level administrative KPI metrics smoothly | GUI | Logic / Integration |
| Dashboard | Employee Widget | Success | Employee | FRONT_DASH_02 | The UI correctly natively renders personalized employee statistics (Leave balance, next holiday) neatly | GUI | Logic / Integration |

### Module: Authentication & Profile Configs (Frontend)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Authentication | Auth Context | Success | System | FRONT_AUTH_01 | The client intelligently renders a loading state initially and proceeds to fetch the profile smoothly | GUI | Logic / Integration |
| Authentication | Auth Context | Failure | System | FRONT_AUTH_02 | The client accurately handles profile fetch failures (e.g., 401 Unauthorized) gracefully | Logic | Edge Case Handling |
| Authentication | Navigation Guards | Success | System | FRONT_AUTH_03 | The client properly triggers a redirect to the login screen if unauthenticated on protected routes | Security | Logic / Integration |
| Authentication | Interceptors | Success | System | FRONT_AUTH_04 | The client seamlessly implements interceptors catching 401 errors globally across all API calls | Security | Logic / Integration |
| Core HR | Company Context | Success | System | FRONT_COMP_01 | The client securely provisions active company settings dynamically mapping them into the global UI state | GUI | Logic / Integration |
| System Admin | i18n Config | Success | System | FRONT_I18N_01 | The client flawlessly swaps translation dictionaries intuitively and correctly maps regional formats | GUI | Logic / Integration |
| Utility | API Utils | Success | System | FRONT_UTIL_01 | The client cleanly trims query parameters optimally preventing empty strings from executing on payloads | Logic | Unit |

### Module: Dashboard
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Dashboard | Employee Dashboard | Success | Employee | DASH_01 | The system fetches and returns accurate employee dashboard data based on user ID | Function | API / Controller Integration |
| Dashboard | Employee Dashboard | Edge Case | Employee | DASH_02 | The system gracefully handles missing PTO balances by defaulting to zero | Logic | Unit / Service Logic |
| Dashboard | Admin Dashboard | Success | Admin | DASH_03 | The system computes and returns accurate administrative statistics for the dashboard | Function | API / Controller Integration |
| Dashboard | Holidays Widget | Success | All | DASH_04 | The system retrieves the compiled and sorted list of upcoming holidays | Function | API / Controller Integration |
| Dashboard | Next Holiday | Success | All | DASH_05 | The system correctly calculates and identifies the next upcoming holiday | Logic | Unit / Service Logic |

### Module: Employee Management (Employees & Departments)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Employee Management | Create Employee | Failure | HR/Admin | EMP_01 | The system blocks creation and throws an error if the submitted email already exists | Logic | Unit / Service Logic |
| Employee Management | Create Employee | Success | HR/Admin | EMP_02 | The system correctly hashes the password and persists the new employee record | Function | API / Controller Integration |
| Employee Management | View Employees | Success | HR/Admin | EMP_03 | The system securely returns all employee records including base salary data if permitted | Security | API / Controller Integration |
| Employee Management | View Employees | Fallback | Employee | EMP_04 | The system triggers a secure fallback to hide sensitive salary data if authorization checks fail | Security | Unit / Service Logic |
| Employee Management | Search Employees | Edge Case | Employee | EMP_05 | The system optimally blocks search execution and returns an empty array if the query is under 2 characters | Function | API / Controller Integration |
| Employee Management | Search Employees | Success | Employee | EMP_06 | The system successfully executes a mapping search against names and emails | Function | API / Controller Integration |
| Employee Management | Update Employee | Success | HR/Admin | EMP_07 | The system accurately updates employee details, correctly resolving department and position assignments | Function | API / Controller Integration |
| Employee Management | Update Employee | Edge Case | HR/Admin | EMP_08 | The system detects an employment termination update and logically auto-terminates associated active contracts | Logic | Unit / Service Logic |
| Employee Management | Delete Employee | Success | Admin | EMP_09 | The system systematically removes manager roles from any associated department before completing employee deletion | Logic | Unit / Service Logic |
| Employee Management | Public Directory | Success | Employee | EMP_10 | The system strictly filters payload properties to retain only safe fields when generating the public directory | Security | API / Controller Integration |

### Module: Performance Management (KPI)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Performance | Create KPI Library | Success | Admin/Manager | KPI_01 | The system implicitly extracts the manager's identity from the token and assigns KPI creation | Function | API / Controller Integration |
| Performance | KPI Periods | Success | Admin/Manager | KPI_02 | The system executes strict period configurations, securely validating global boundary limits | Function | API / Controller Integration |
| Performance | Assign KPIs | Success | Manager | KPI_03 | The system coordinates comprehensive transaction mapping, successfully dispatching batch KPI assignments | Function | API / Controller Integration |
| Performance | Assign KPIs | Failure | Manager | KPI_04 | The system structurally blocks invalid parameters and rolls back KPI assignments when boundary failures occur | Logic | Unit / Service Logic |
| Performance | Update Actuals | Success | Manager | KPI_05 | The system independently isolates Manager bounds ensuring only permitted reviewers can update actuals | Security | API / Controller Integration |
| Performance | Update Actuals | Edge Case | System | KPI_06 | The system cleanly filters invalid data types and intelligently maps fallback override mechanisms | Logic | Unit / Service Logic |
| Performance | Calculate Score | Success | System | KPI_07 | The system dynamically isolates contextual parameters to compile cumulative KPI score calculations | Integration | API / Controller Integration |
| Performance | Calculate Score | Edge Case | System | KPI_08 | The system computes valid score aggregations, intelligently restricting overflow outputs beyond bounds | Logic | Unit / Service Logic |
| Performance | View My Performance | Success | Employee | KPI_09 | The system independently binds the correct relational identity context, successfully retrieving individual performance scores | Security | API / Controller Integration |
