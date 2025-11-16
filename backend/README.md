# HRM Backend - NestJS Application

A comprehensive Human Resource Management (HRM) system backend built with NestJS, TypeORM, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control (RBAC)
- **Time Keeping** - QR code scanning and IP-based check-in/check-out
- **Leave Management** - Employee leave requests with manager approvals and balance tracking
- **Payroll** - Payroll run automation with payslip generation
- **Reports** - Aggregated payroll reporting and analytics
- **Admin Controls** - System settings, organization management, and permission matrix configuration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **PostgreSQL** (v12 or higher)
- **Git**

## 🛠️ Installation & Setup

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the environment template and configure your database:

```bash
cp .env.example .env
```

Edit `.env` with your actual database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_password
DB_NAME=hrm

PORT=3001
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=7d

COMPANY_IP_WHITELIST=127.0.0.1,::1
NODE_ENV=development
```

### 4. Database Setup

Create a PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE hrm;"
```

The app will automatically synchronize the schema on first run (see TypeOrmModule in `src/app.module.ts` with `synchronize: true`).

## 🏃 Running the Application

### Development Mode (with auto-reload)

```bash
npm run start:dev
```

The server will start at `http://localhost:3001`

### Production Mode

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module with TypeORM config
├── entities/              # Database entities (TypeORM)
│   ├── employee.entity.ts
│   ├── department.entity.ts
│   ├── position.entity.ts
│   ├── permission.entity.ts
│   ├── position-permission.entity.ts
│   ├── leave-request.entity.ts
│   ├── leave-balance.entity.ts
│   ├── leave-type.entity.ts
│   ├── timekeeping.entity.ts
│   ├── payslip.entity.ts
│   ├── audit-log.entity.ts
│   ├── contract.entity.ts
│   ├── bank-info.entity.ts
│   └── company-settings.entity.ts
├── modules/               # Feature modules
│   ├── auth/             # Authentication & RBAC
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── permissions.decorator.ts
│   ├── timekeeping/      # Time check-in/out
│   │   ├── timekeeping.controller.ts
│   │   ├── timekeeping.service.ts
│   │   ├── timekeeping.module.ts
│   │   └── ip-whitelist.guard.ts
│   ├── leave/            # Leave requests & approvals
│   │   ├── leave.controller.ts
│   │   ├── leave.service.ts
│   │   └── leave.module.ts
│   ├── payroll/          # Payroll processing
│   │   ├── payroll.controller.ts
│   │   ├── payroll.service.ts
│   │   └── payroll.module.ts
│   ├── reports/          # Analytics & reporting
│   │   ├── reports.controller.ts
│   │   ├── reports.service.ts
│   │   └── reports.module.ts
│   └── admin/            # System administration
│       ├── admin.controller.ts
│       ├── admin.service.ts
│       └── admin.module.ts
└── common/               # Shared guards, utilities
    └── guards/
```

## 🔐 Authentication & Authorization

### JWT-Based Authentication

1. **Login:** `POST /api/auth/login` with credentials
2. **Response:** Returns JWT token (stored in httpOnly cookie + localStorage)
3. **Protected Endpoints:** Use `@UseGuards(JwtAuthGuard)` decorator

### Role-Based Access Control (RBAC)

Permissions are managed through a Position-Permission matrix:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Permissions("manage:leave")
@Get("pending-requests")
async getPendingRequests() { ... }
```

**Default Permissions:**

- `read:payslip` - View payslips
- `manage:leave` - Approve/reject leave requests
- `manage:payroll` - Run payroll
- `manage:system` - Admin console access

## 📚 API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout user

### Time Keeping

- `POST /api/timekeeping/check-in/ip` - Check-in by IP
- `POST /api/timekeeping/check-in/qr` - Check-in by QR code
- `GET /api/timekeeping/status` - Get check-in status

### Leave Management

- `GET /api/leave/types` - Get all leave types
- `GET /api/leave/balance` - Get employee leave balance
- `GET /api/leave/my-requests` - Get my leave requests
- `POST /api/leave/request` - Submit leave request
- `GET /api/leave/pending-requests` - Get pending requests (manager)
- `PATCH /api/leave/request/:id/approve` - Approve/reject (manager)

### Payroll

- `POST /api/payroll/run` - Run monthly payroll
- `GET /api/payroll/payslips` - Get payslips

### Reports

- `GET /api/reports/payroll-summary` - Payroll aggregation

### Admin

- `GET /api/admin/settings` - Get all settings
- `PATCH /api/admin/settings` - Update setting
- `GET /api/admin/departments` - Get departments
- `POST /api/admin/departments` - Create department
- `GET /api/admin/positions` - Get positions
- `POST /api/admin/positions` - Create position
- `GET /api/admin/permissions/matrix` - Get permission matrix
- `POST /api/admin/permissions/assign` - Assign permission
- `POST /api/admin/permissions/revoke` - Revoke permission

## 🗄️ Database Schema

### Key Tables

**employees** - Employee master data

- employee_id (PK)
- email (unique)
- first_name, last_name
- department_id (FK)
- position_id (FK)
- contract_id (FK)

**leave_requests** - Leave request tracking

- leave_request_id (PK)
- employee_id (FK)
- leave_type_id (FK)
- start_date, end_date
- status (Pending, Approved, Rejected)

**leave_balance** - Employee leave balance

- balance_id (PK)
- employee_id (FK)
- leave_type_id (FK)
- remaining_days

**payslips** - Payroll records

- payslip_id (PK)
- employee_id (FK)
- pay_period
- base_salary, bonus, deductions, net_salary

**position_permission** - RBAC Matrix

- position_id (FK, PK)
- permission_id (FK, PK)

For complete schema details, see the entity files in `src/entities/`

## 🔄 Database Migrations

The application uses TypeORM with `synchronize: true`, which automatically creates tables on startup.

To manage schema changes:

1. Modify the entity files in `src/entities/`
2. The schema will auto-sync on next application restart
3. For production, use TypeORM migrations (configure in app.module.ts)

## 🧪 Testing

Run linter:

```bash
npm run lint
```

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "BadRequest"
}
```

Common status codes:

- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid JWT)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 📝 Environment Variables Reference

| Variable               | Default               | Description                          |
| ---------------------- | --------------------- | ------------------------------------ |
| `DB_HOST`              | localhost             | PostgreSQL host                      |
| `DB_PORT`              | 5432                  | PostgreSQL port                      |
| `DB_USER`              | postgres              | Database user                        |
| `DB_PASS`              | postgres              | Database password                    |
| `DB_NAME`              | hrm                   | Database name                        |
| `PORT`                 | 3001                  | Server port                          |
| `FRONTEND_URL`         | http://localhost:3000 | Frontend URL for CORS                |
| `JWT_SECRET`           | (required)            | JWT signing secret                   |
| `JWT_EXPIRATION`       | 7d                    | JWT token expiration                 |
| `COMPANY_IP_WHITELIST` | 127.0.0.1,::1         | Allowed IPs for check-in             |
| `NODE_ENV`             | development           | Environment (development/production) |

## 🐛 Troubleshooting

### "Could not find TypeScript configuration file"

- Ensure `tsconfig.json` exists in the backend root directory
- Run `npm install` to install TypeScript

### "Database connection failed"

- Verify PostgreSQL is running: `psql -U postgres -l`
- Check `.env` database credentials
- Ensure database exists: `psql -U postgres -c "CREATE DATABASE hrm;"`

### "Port 3001 already in use"

- Change PORT in `.env` or use: `PORT=3002 npm run start:dev`
- Or kill existing process: `lsof -ti:3001 | xargs kill -9`

### "JWT token invalid"

- Ensure JWT_SECRET is set in `.env`
- Check that token hasn't expired (default: 7 days)
- Clear browser cookies and login again

## 🔗 Related Documentation

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## 📄 License

This project is private and confidential.

## 👥 Support

For issues or questions, contact the development team.

---

**Happy coding! 🚀**
