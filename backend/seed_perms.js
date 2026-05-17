const { Client } = require('pg');
const c = new Client({ host:'localhost', user:'postgres', password:'postgres', database:'hrm' });

const missingPerms = [
  { name: 'View Admin Dashboard', module: 'ADMIN', method: 'GET', apiPath: '/api/admin/dashboard' },
  { name: 'Manage Announcements', module: 'ADMIN', method: 'POST', apiPath: '/api/announcements' },
  { name: 'Manage Departments', module: 'ADMIN', method: 'POST', apiPath: '/api/admin/departments' },
  { name: 'Manage System Settings', module: 'ADMIN', method: 'PATCH', apiPath: '/api/admin/settings' },
  { name: 'Manage Salaries', module: 'PAYROLL', method: 'PUT', apiPath: '/api/admin/salary' },
  { name: 'Manage Leave Rules', module: 'LEAVE', method: 'PUT', apiPath: '/api/admin/leave/rules' },
  { name: 'View Attendance History', module: 'ATTENDANCE', method: 'GET', apiPath: '/api/attendance/admin/all' },
  { name: 'Manage Adjustments', module: 'PAYROLL', method: 'POST', apiPath: '/api/payroll/adjustments' },
];

async function seed() {
  await c.connect();
  for (const p of missingPerms) {
    const check = await c.query('SELECT permission_id FROM permission WHERE permission_name = $1', [p.name]);
    if (check.rows.length === 0) {
      await c.query('INSERT INTO permission (permission_name, module_group, method, "apiPath") VALUES ($1, $2, $3, $4)', [p.name, p.module, p.method, p.apiPath]);
      console.log('Inserted:', p.name);
    }
  }
  await c.end();
}
seed().catch(console.error);
