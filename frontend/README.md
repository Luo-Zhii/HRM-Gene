# HRM Frontend - Next.js Application

A modern, responsive Human Resource Management (HRM) system frontend built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Next.js 14 App Router** - Modern React framework with file-based routing
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **Authentication** - JWT-based login with secure token storage
- **Dashboard** - Comprehensive employee dashboard with multiple modules
- **Time Keeping** - QR code scanning and IP-based check-in interface
- **Leave Management** - Self-service leave request portal
- **Payroll Dashboard** - Visual payroll analytics with charts (Recharts)
- **Admin Console** - System settings, organization, and permission management
- **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher): [Download](https://nodejs.org/)
- **npm** (v8 or higher): Comes with Node.js
- **Git**: [Download](https://git-scm.com/)

Verify installations:

```bash
node --version    # Should be v16 or higher
npm --version     # Should be v8 or higher
```

## 🛠️ Installation & Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your settings:

```env
# Backend API URL (adjust if your backend runs on different port)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Environment
NODE_ENV=development
```

## 🏃 Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

The application will start at `http://localhost:3000`

Open your browser and navigate to: **http://localhost:3000**

### Production Build

```bash
npm run build
npm start
```

The application will start at `http://localhost:3000`

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
frontend/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout
│   ├── login/
│   │   └── page.tsx               # Login page
│   └── (dashboard)/               # Protected dashboard group
│       ├── layout.tsx             # Dashboard layout with header
│       ├── page.tsx               # Dashboard home (redirects)
│       ├── timekeeping/
│       │   └── page.tsx           # Check-in/check-out interface
│       ├── accounting/
│       │   └── page.tsx           # Payroll dashboard with charts
│       ├── leave/
│       │   └── page.tsx           # Leave request portal (3 sections)
│       └── admin/
│           ├── leave-approvals/
│           │   └── page.tsx       # Manager leave approval interface
│           ├── settings/
│           │   └── page.tsx       # System settings configuration
│           ├── organization/
│           │   └── page.tsx       # Department/Position management
│           └── permissions/
│               └── page.tsx       # Permission matrix for roles
│
├── src/
│   ├── context/
│   │   └── AuthContext.tsx        # Global auth state management
│   └── hooks/
│       └── useAuth.ts             # useAuth custom hook
│
├── public/                        # Static assets
├── tsconfig.json                  # TypeScript configuration
├── next.config.js                 # Next.js configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── package.json
├── .env.example                   # Environment template
├── .env.local                     # Local environment (not committed)
└── README.md
```

## 🔐 Authentication

### Login Flow

1. User navigates to `/login`
2. Enters email and password
3. Frontend sends credentials to `/api/auth/login`
4. Backend returns JWT token
5. Token is stored in:
   - **httpOnly cookie** (secure, sent with every request)
   - **localStorage** (accessible to JavaScript)
6. User is redirected to `/` (dashboard)

### Protected Routes

The dashboard (`(dashboard)/` group) is protected by middleware that:

- Checks if a valid JWT token exists
- Redirects to login if not authenticated
- Allows access if authenticated

### useAuth Hook

Use the custom `useAuth()` hook to access authentication state in components:

```typescript
import { useAuth } from "@/hooks/useAuth";

export default function Component() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>Not authenticated</p>;

  return (
    <div>
      <p>Welcome, {user.first_name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**useAuth() returns:**

- `user` - User object with email, first_name, permissions, etc.
- `loading` - Boolean indicating auth state is being checked
- `logout()` - Function to clear auth and redirect to login
- `refresh()` - Function to manually refresh user data

## 📚 Page Descriptions

### Login Page (`/login`)

- Email and password input fields
- Submit button calls `/api/auth/login`
- Auto-redirects to dashboard on success
- Error messages for failed login
- Clean, minimal design

### Dashboard Layout

- Global header with user info and logout button
- Navigation (implicit via page routing)
- All dashboard pages are wrapped in this layout

### Timekeeping Page (`/timekeeping`)

- **IP Check-in:** Click button to check-in using device IP
- **QR Scanner:** Camera-based QR code scanning (react-qr-scanner)
- **Fallback:** Manual paste input if camera unavailable
- **Status Messages:** Real-time feedback (success/error)
- **Camera Detection:** Gracefully handles devices without camera access

### Accounting Dashboard (`/accounting`)

- **Payroll Summary:** Aggregated payroll data
- **KPI Cards:** Total payroll, base salary, employees, average salary
- **Charts:**
  - BarChart: Payroll by department
  - PieChart: Salary component breakdown
- **Filters:** Month/year selector to view different periods
- **Run Payroll:** Button to trigger payroll run (visible if permitted)

### Leave Request Page (`/leave`)

**Section 1 - My Leave Balance:**

- Grid of cards showing remaining days per leave type
- Color-coded badges
- Real-time balance display

**Section 2 - Submit New Request:**

- Leave type dropdown (populated from API)
- Start and end date pickers
- Optional reason textarea
- Clear and Submit buttons
- Form validation

**Section 3 - My Request History:**

- Table showing all employee's leave requests
- Columns: Leave Type, Dates, Reason, Status
- Color-coded status badges (green/approved, red/rejected, yellow/pending)
- Sortable and readable layout

### Leave Approvals Page (`/admin/leave-approvals`)

- **Permission Required:** `manage:leave`
- **Pending Requests Table:**
  - Employee info, leave type, dates, reason
  - Status display
  - Approve and Reject buttons
- **Real-time Updates:** Table refreshes after each action
- **Status Feedback:** User-friendly messages on action completion

### Admin Pages (Protected with `manage:system` permission)

#### System Settings (`/admin/settings`)

- Display all company settings as cards
- Edit mode with textarea for each setting
- Save and Cancel buttons
- Auto-refresh on successful save

#### Organization (`/admin/organization`)

- **Departments Section:**
  - Table of all departments
  - Create form to add new department
  - Real-time table updates
- **Positions Section:**
  - Table of all positions
  - Create form to add new position
  - Real-time table updates

#### Permission Matrix (`/admin/permissions`)

- **Complex Checkbox Matrix:**
  - Rows: All positions
  - Columns: All permissions
  - Sticky headers for easy navigation
- **Interactive Checkboxes:**
  - Checking box calls assign endpoint
  - Unchecking box calls revoke endpoint
  - Real-time feedback and error handling
- **Auto-Refresh:** Matrix updates after permission changes

## 🎨 Design System

### Tailwind CSS Utilities

The application uses Tailwind CSS utility classes for:

- **Colors:** Blue (primary), green (success), red (error), gray (neutral)
- **Spacing:** Consistent padding and margins
- **Typography:** Responsive font sizes
- **Shadows:** Depth and elevation
- **Borders:** Rounded corners and dividers

### Common Component Patterns

**Status Messages:**

```typescript
const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

// Show success
setStatusMessage({ type: "success", text: "Action completed!" });

// Auto-dismiss after 4 seconds
useEffect(() => {
  if (statusMessage) {
    const timer = setTimeout(() => setStatusMessage(null), 4000);
    return () => clearTimeout(timer);
  }
}, [statusMessage]);
```

**Tables:**

- Responsive with horizontal scroll on mobile
- Hover effects on rows
- Professional borders and spacing
- Action buttons right-aligned

**Forms:**

- Clear labels
- Input validation
- Submit and Cancel buttons
- Status feedback after submission

## 🔗 API Integration

All API calls use the backend base URL from `NEXT_PUBLIC_API_URL`:

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/endpoint`, {
  method: "GET", // or POST, PATCH, DELETE
  credentials: "include", // Include JWT cookie
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data), // For POST/PATCH
});
```

**Important:** Always include `credentials: 'include'` to send JWT cookies with requests.

## 📝 Environment Variables Reference

| Variable              | Default                   | Description                          |
| --------------------- | ------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL` | http://localhost:3001/api | Backend API base URL                 |
| `NODE_ENV`            | development               | Environment (development/production) |

## 🚨 Error Handling

The application provides user-friendly error handling:

- **Network Errors:** "Failed to connect to server"
- **Auth Errors:** "Unauthorized - please login again"
- **Validation Errors:** Field-specific error messages
- **Permission Errors:** "You do not have permission to access this"
- **Server Errors:** "Something went wrong - please try again"

## 🧪 Testing

Run linter:

```bash
npm run lint
```

## 🐛 Troubleshooting

### "Cannot find module '@/hooks/useAuth'"

**Solution:** Check that `tsconfig.json` has path aliases configured:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### "npm run dev fails to start"

**Solution 1:** Verify `next.config.js` exists in frontend root:

```bash
ls -la next.config.js
```

**Solution 2:** Clear cache and reinstall:

```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Frontend can't connect to backend

**Solution 1:** Check backend is running on port 3001:

```bash
curl http://localhost:3001
```

**Solution 2:** Verify `NEXT_PUBLIC_API_URL` in `.env.local`:

```bash
cat .env.local | grep NEXT_PUBLIC_API_URL
```

**Solution 3:** Check CORS settings in backend `.env`:

```bash
grep FRONTEND_URL backend/.env
```

### Login fails with "Invalid credentials"

**Solution:**

1. Verify backend is running
2. Check that database has seed data or test user
3. Verify backend and frontend are on same network (if remote)

### "Port 3000 already in use"

**Solution 1:** Kill the process:

```bash
lsof -ti:3000 | xargs kill -9
```

**Solution 2:** Use a different port:

```bash
PORT=3001 npm run dev
```

### Page shows "Access Denied"

**Solution:** Check user permissions in the database. Only users with the required permission can access admin pages:

- `/admin/settings` requires `manage:system`
- `/admin/organization` requires `manage:system`
- `/admin/permissions` requires `manage:system`
- `/admin/leave-approvals` requires `manage:leave`

## 📚 Technologies Used

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Data visualization library
- **react-qr-scanner** - QR code scanning
- **Next/Image** - Image optimization
- **Next/Navigation** - Routing

## 🔗 Related Documentation

- **Backend Docs:** `backend/README.md`
- **Setup Guide:** `SETUP.md`
- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Recharts Docs:** https://recharts.org

## 📄 License

This project is private and confidential.

## 👥 Support

For issues or questions, contact the development team.

---

**Ready to develop? Run:**

```bash
npm run dev
```

**Happy coding! 🚀**
