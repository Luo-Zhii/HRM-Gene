const fs = require('fs');
const path = require('path');

const BASE = '/home/luozhi/Documents/HRM-Gene';
const BE_DIR = `${BASE}/backend/src/modules`;
const FE_DIR = `${BASE}/frontend/src`;

// Adverb keywords that indicate garbage AI-generated it() names
const ADVERBS = [
  'smoothly','natively','beautifully','optimally','logically','perfectly','flexibly',
  'transparently','correctly','creatively','properly','implicitly','inherently','flawlessly',
  'mathematically','systematically','dynamically','organically','conceptually','strategically',
  'structurally','identically','purely','magically','predictably','elegantly','smartly',
  'seamlessly','authentically','inherently','comprehensively','effortlessly','brilliantly',
  'realistically','securely','confidently','robustly','cleverly','universally','sequentially',
  'vertically','horizontally','atomically','consistently','independently','effectively',
  'appropriately','intuitively','accurately','reliably','functionally','automatically',
];

function isGarbage(itText) {
  if (!itText || itText.length < 40) return false;
  const words = itText.toLowerCase().split(/\s+/);
  const adverbCount = words.filter(w => ADVERBS.includes(w)).length;
  return adverbCount > 3 || (adverbCount > 1 && words.length > 15);
}

// Analyze describe path and body code to generate proper description
function deriveDescription(describePath, bodyCode) {
  const d = describePath.toLowerCase();
  const b = bodyCode.toLowerCase();

  // Notifications Service
  if (d.includes('notification')) {
    // Gateway tests
    if (b.includes('gateway') || d.includes('gateway')) {
      if ((b.includes('handleconnection') || d.includes('handleconnection')) && b.includes('handshake') && b.includes('disconnect') && !b.includes('verify'))
        return 'Gateway handleConnection: Từ chối client không có auth token';
      if ((b.includes('handleconnection') || d.includes('handleconnection')) && b.includes('verify') && b.includes('userid') && !b.includes('mockimplementation'))
        return 'Gateway handleConnection: Xác thực JWT token và gán userId vào client data';
      if ((b.includes('handleconnection') || d.includes('handleconnection')) && b.includes('throw new error') || b.includes('mockimplementation'))
        return 'Gateway handleConnection: Ngắt kết nối khi JWT token không hợp lệ';
      if (b.includes('handledisconnect') || d.includes('handledisconnect'))
        return 'Gateway handleDisconnect: Xóa socket khỏi userSockets map khi client ngắt kết nối';
      if (b.includes('sendnotificationtouser') || b.includes('server.emit'))
        return 'Gateway sendNotificationToUser: Emit event đến đúng socket của user';
      if (b.includes('afterinit') || b.includes('onmoduleinit'))
        return 'Gateway afterInit: Khởi tạo WebSocket server';
    }
    // Service tests
    if (b.includes('createnotification') || d.includes('createnotification')) {
      if (b.includes('push_notifications') && b.includes('false') && b.includes('.tobenull'))
        return 'createNotification: Không gửi khi user tắt push_notifications';
      if (b.includes('announcements') && b.includes('false') && b.includes('.tobenull'))
        return 'createNotification: Không gửi announcement khi user tắt announcements';
      if (b.includes('.save(') && b.includes('gateway'))
        return 'createNotification: Tạo và gửi notification qua WebSocket thành công';
    }
    if (b.includes('getusernotifications') && b.includes('markasread') && b.includes('deletenotification') && b.includes('send'))
      return 'Controller: Kiểm tra toàn bộ endpoint getUserNotifications, markAsRead, deleteNotification, createAnnouncement';
    if (b.includes('getusernotifications') && b.includes('.find(') && b.includes('[]'))
      return 'getUserNotifications: Trả về mảng rỗng khi user chưa có thông báo';
    if (b.includes('markasread') && b.includes('success'))
      return 'markAsRead: Đánh dấu thông báo đã đọc, trả về { success: true }';
    if (b.includes('deletenotification') && b.includes('affected: 0') || b.includes('deletenotification') && b.includes('notfoundexception'))
      return 'deleteNotification: Ném NotFoundException khi thông báo không tồn tại';
    if (b.includes('deletenotification') && b.includes('affected: 1'))
      return 'deleteNotification: Xóa thông báo thành công, trả về { success: true }';
    if (b.includes('sendannouncementtoall') || b.includes('createannouncement'))
      return 'sendAnnouncementToAll: Gửi announcement đến tất cả user bật nhận thông báo';
    return 'Kiểm tra chức năng notification';
  }

  // Reports
  if (d.includes('report')) {
    if (d.includes('payrollsummary') || b.includes('payrollsummary')) {
      if (b.includes('mockresolvedvalue({})') && b.includes('tohavebeencalledwith'))
        return 'payrollSummary controller: Gọi service với tham số đã parse (string → number)';
      if (b.includes('employees_processed') && b.includes('.tobe(0)'))
        return 'payrollSummary service: Xử lý dataset rỗng, trả về employees_processed = 0';
      if (b.includes('employees_processed') && b.includes('.tobe(1)'))
        return 'payrollSummary service: Tính toán tổng lương và lương theo phòng ban từ payslip';
      if (b.includes('mockresolvedvalue({})') && b.includes('await controllers'))
        return 'payrollSummary controller: Gọi API với month và year, trả về kết quả';
      if (b.includes('parseint') || b.includes('fallback'))
        return 'payrollSummary controller: Xử lý fallback khi month/year là chuỗi rỗng';
    }
    if (d.includes('dashboard') || b.includes('dashboard')) {
      if (b.includes('salary_trend') && b.includes('headcount_trend'))
        return 'getDashboardData service: Tổng hợp dữ liệu dashboard (salary trend, headcount, turnover, personnel by dept)';
      if (b.includes('mockresolvedvalue({})') && b.includes('await controller'))
        return 'getDashboard controller: Gọi service và trả về dữ liệu dashboard';
    }
    return 'Kiểm tra chức năng báo cáo (reports)';
  }

  // Resignations
  if (d.includes('resignation')) {
    if (b.includes('forbiddenexception') || b.includes('.tothrow'))
      return 'Từ chối truy cập khi user không có quyền (chưa đăng nhập hoặc role thường)';
    if (b.includes('create') && b.includes('findmyrequests'))
      return 'Tạo đơn thôi việc và lấy danh sách đơn của user đã đăng nhập';
    if (b.includes('findall') && b.includes('updatestatus'))
      return 'Lấy tất cả đơn thôi việc và cập nhật trạng thái (Admin/HR)';
    return 'Kiểm tra chức năng thôi việc (resignation)';
  }

  // Timekeeping
  if (d.includes('timekeeping') || d.includes('attendance')) {
    if (d.includes('attendance') || d.includes('admin')) {
      if (b.includes('tobe(1, 10') || b.includes('1, 10,'))
        return 'getAllForAdmin controller: Parse page/limit từ string sang number';
      if (b.includes('tobe(1, 50') || b.includes('default'))
        return 'getAllForAdmin controller: Sử dụng giá trị mặc định khi page/limit rỗng';
    }
    if (d.includes('dynamicqr') || b.includes('getDynamicQr')) {
      if (b.includes('forbiddenexception') || b.includes('.tothrow'))
        return 'getDynamicQr: Từ chối user không có thông tin (ForbiddenException)';
      if (b.includes('generatedynamicqr') && b.includes('mockresolvedvalue'))
        return 'getDynamicQr: Trả về QR code khi user hợp lệ';
    }
    if (d.includes('checkin')) {
      if (b.includes('forbiddenexception') || b.includes('.tothrow'))
        return 'checkIn: Từ chối chấm công khi user không hợp lệ (ForbiddenException)';
      if (b.includes('recordcheckin') && b.includes('mockresolvedvalue'))
        return 'checkIn: Chấm công thành công qua QR hoặc IP';
    }
    if (b.includes('checkin') && !b.includes('checkout'))
      return 'Chấm công check-in: Tạo bản ghi chấm công vào ca';
    if (b.includes('checkout'))
      return 'Chấm công check-out: Cập nhật giờ ra cho bản ghi hiện tại';
    if (b.includes('getdailyreport') || b.includes('getattendance'))
      return 'Lấy báo cáo chấm công theo ngày cho nhân viên';
    if (b.includes('getmonthlyreport'))
      return 'Lấy báo cáo chấm công theo tháng cho nhân viên';
    return 'Kiểm tra chức năng chấm công (timekeeping)';
  }

  // Contracts
  if (d.includes('contract')) {
    if (d.includes('salary history')) {
      if (b.includes('.find(') && b.includes('[]'))
        return 'Lấy lịch sử lương: Trả về mảng rỗng khi chưa có dữ liệu';
      if (b.includes('.find(') && b.includes('employee'))
        return 'Lấy lịch sử lương của nhân viên theo employee_id';
      return 'Kiểm tra lịch sử thay đổi lương';
    }
    if (b.includes('create') && b.includes('save'))
      return 'Tạo hợp đồng lao động mới cho nhân viên';
    if (b.includes('update') && b.includes('save'))
      return 'Cập nhật thông tin hợp đồng lao động';
    if (b.includes('terminate') || b.includes('end_date'))
      return 'Chấm dứt/chấm dứt hợp đồng lao động';
    if (b.includes('.find(') && b.includes('[]'))
      return 'Lấy danh sách hợp đồng: Trả về mảng rỗng';
    if (b.includes('.find('))
      return 'Lấy danh sách hợp đồng của nhân viên';
    return 'Kiểm tra chức năng hợp đồng (contract)';
  }

  // KPI
  if (d.includes('kpi')) {
    if (b.includes('notfoundexception') || (b.includes('not found') && b.includes('throw')))
      return 'Xử lý NotFoundException khi KPI hoặc employee không tồn tại';
    if (b.includes('create') || b.includes('save')) {
      if (b.includes('score') || b.includes('weight'))
        return 'Tạo bản ghi KPI với điểm số (score) và trọng số (weight)';
      return 'Thiết lập chỉ tiêu KPI cho nhân viên';
    }
    if (b.includes('evaluate') || b.includes('assessment'))
      return 'Đánh giá kết quả KPI của nhân viên';
    if (b.includes('calculate') || b.includes('bonus') || b.includes('aggregation'))
      return 'Tính toán thưởng/phạt dựa trên điểm KPI';
    if (b.includes('.find(') && b.includes('[]'))
      return 'Lấy danh sách KPI: Trả về mảng rỗng khi chưa có dữ liệu';
    if (b.includes('.find('))
      return 'Lấy danh sách KPI có filter theo employee_id';
    if (b.includes('controller') && b.includes('mock'))
      return 'Controller KPI: Proxy request đến service tương ứng';
    return 'Kiểm tra chức năng KPI';
  }

  // Violations
  if (d.includes('violation')) {
    if (d.includes('findall') || b.includes('findall')) {
      if (b.includes('manage:system') && b.includes('undefined'))
        return 'findAll: Admin với manage:system gọi service.findAll(undefined) - xem tất cả';
      if (b.includes('employee_id') && !b.includes('manage:system'))
        return 'findAll: Employee thường chỉ xem vi phạm của chính mình (filter theo employee_id)';
      if (b.includes('tobe(5)') || (b.includes('query') && b.includes('parseint')))
        return 'findAll: Parse query param employee_id từ string sang number';
    }
    if (d.includes('findone') || b.includes('findone')) {
      if (b.includes('employee_id: 3') && b.includes('10, 3'))
        return 'findOne: Employee thường bị giới hạn chỉ xem vi phạm của chính mình';
      if (b.includes('manage:employees') && b.includes('undefined'))
        return 'findOne: Admin HR xem vi phạm bất kỳ (không filter employee_id)';
    }
    if (b.includes('update') || d.includes('update'))
      return 'update: Cập nhật thông tin biên bản vi phạm';
    if (b.includes('remove') || b.includes('delete'))
      return 'remove: Xóa biên bản vi phạm khỏi hệ thống';
    if (b.includes('create') || b.includes('save'))
      return 'Tạo biên bản vi phạm mới cho nhân viên';
    if (b.includes('sync'))
      return 'syncAttendance: Đồng bộ dữ liệu chấm công để phát hiện vi phạm';
    if (b.includes('.find('))
      return 'Lấy danh sách biên bản vi phạm';
    return 'Kiểm tra chức năng vi phạm (violation)';
  }

  // Positions
  if (d.includes('position')) {
    if (b.includes('create') && b.includes('.save('))
      return 'Tạo chức vụ mới: Gọi create() và save() trên repository';
    if (b.includes('create') && b.includes('mockresolvedvalue'))
      return 'Controller create: Nhận DTO và gọi service.create()';
    if (b.includes('notfoundexception') && b.includes('remove'))
      return 'remove(): Ném NotFoundException khi chức vụ không tồn tại';
    if (b.includes('remove') || b.includes('delete'))
      return 'remove(): Xóa chức vụ thành công';
    if (b.includes('find') && b.includes('[]'))
      return 'findAll(): Lấy danh sách tất cả chức vụ';
    return 'Kiểm tra chức năng quản lý chức vụ (position)';
  }

  // Leave
  if (d.includes('leave')) {
    if (b.includes('create') && b.includes('save'))
      return 'Tạo đơn xin nghỉ phép mới';
    if (b.includes('approve') && b.includes('status'))
      return 'Phê duyệt đơn xin nghỉ phép';
    if (b.includes('reject') && b.includes('status'))
      return 'Từ chối đơn xin nghỉ phép';
    if (b.includes('cancel'))
      return 'Hủy đơn xin nghỉ phép';
    if (b.includes('balance'))
      return 'Kiểm tra số ngày phép còn lại';
    if (b.includes('.find('))
      return 'Lấy danh sách đơn nghỉ phép';
    return 'Kiểm tra chức năng nghỉ phép (leave)';
  }

  // Payroll (service layer with garbage)
  if (d.includes('payroll') || b.includes('payslip')) {
    if (b.includes('generate') || b.includes('create payslip'))
      return 'Tạo phiếu lương cho nhân viên';
    if (b.includes('calculate') && b.includes('salary'))
      return 'Tính toán bảng lương từ dữ liệu chấm công và hợp đồng';
    if (b.includes('getpayslip') || b.includes('.findone('))
      return 'Lấy chi tiết phiếu lương theo ID';
    if (b.includes('list') || b.includes('.find('))
      return 'Lấy danh sách phiếu lương';
    return 'Kiểm tra chức năng tính lương (payroll)';
  }

  // Departments (service layer with test that has adverbs in body)
  if (d.includes('department')) {
    if (b.includes('create') && b.includes('save'))
      return 'Tạo phòng ban mới và lưu vào database';
    if (b.includes('update'))
      return 'Cập nhật thông tin phòng ban';
    if (b.includes('.find(') || b.includes('getall'))
      return 'Lấy danh sách tất cả phòng ban';
    if (b.includes('delete') || b.includes('remove'))
      return 'Xóa phòng ban';
    return 'Kiểm tra chức năng quản lý phòng ban (department)';
  }

  // ===== FRONTEND =====

  // Auth hooks/context
  if (d.includes('useauth') || d.includes('authcontext')) {
    if (b.includes('employee_id') && b.includes('tobe(1)'))
      return 'useAuth: Trả về thông tin user (employee_id) từ AuthContext';
    if (b.includes('mockreturnvalue') || b.includes('spyon'))
      return 'useAuth: Mock AuthContext và kiểm tra giá trị trả về từ hook';
    return 'Kiểm tra hook useAuth';
  }

  // useCheckPermission
  if (d.includes('checkpermission') || d.includes('usecheckpermission')) {
    if (b.includes('director') || b.includes('admin@example'))
      return 'useCheckPermission: Director bypass tất cả permission check';
    if (b.includes('system admin') || b.includes('sysadmin'))
      return 'useCheckPermission: System Admin bypass permission';
    if (b.includes('exact') || b.includes('string permission'))
      return 'useCheckPermission: Khớp chính xác string permission';
    if (b.includes('lacks') || (b.includes('return false') && b.includes('delete')))
      return 'useCheckPermission: Từ chối khi user thiếu permission yêu cầu';
    if (b.includes('null user') || (b.includes('null') && b.includes('loading')))
      return 'useCheckPermission: Từ chối khi chưa đăng nhập (user = null)';
    if (b.includes('object-format') || b.includes('{method'))
      return 'useCheckPermission: Khớp permission dạng object {method, apiPath}';
    if (b.includes('lowercase') || b.includes('admin\''))
      return 'useCheckPermission: Nhận diện role "admin" (lowercase) bypass';
    if (b.includes('position_name'))
      return 'useCheckPermission: Phát hiện System Admin từ position_name khi role rỗng';
    return 'Kiểm tra hook useCheckPermission';
  }

  // i18n
  if (d.includes('i18n')) {
    return 'i18n: Xác minh cấu hình đa ngôn ngữ được khởi tạo (import thành công)';
  }

  // Admin/Employee Dashboard Widgets
  if (d.includes('dashboardwidget') || d.includes('admindashboardwidget') || d.includes('employeedashboardwidget')) {
    if (b.includes('fetch') || b.includes('global.fetch') || b.includes('mock'))
      return 'Dashboard Widget: Render và hiển thị dữ liệu từ API fetch';
    if (b.includes('loading') || b.includes('spinner'))
      return 'Dashboard Widget: Hiển thị trạng thái loading khi đang fetch';
    if (b.includes('error') || b.includes('reject'))
      return 'Dashboard Widget: Xử lý lỗi fetch và hiển thị fallback';
    return 'Dashboard Widget: Hiển thị widget tổng quan';
  }

  // Utils - cn function
  if (d.includes(' cn') || d.includes('classname')) {
    return 'cn(): Gộp class names với twMerge và clsx';
  }

  // Utils - API
  if (d.includes('api util') || d.includes('cleanparams')) {
    if (b.includes('cleanparams'))
      return 'cleanParams: Loại bỏ null/undefined/empty string khỏi object params';
    if (b.includes('toquerystring'))
      return 'toQueryString: Chuyển object thành query string URL hợp lệ';
    return 'Kiểm tra API utility functions';
  }

  // Types
  if (d.includes('type') || d.includes('timekeeping')) {
    return 'Timekeeping Types: Xác minh cấu trúc dữ liệu TypeScript';
  }

  // Generic fallback: extract what the test actually does
  if (b.includes('.mockresolvedvalue(')) return 'Mock dữ liệu và kiểm tra kết quả trả về từ service';
  if (b.includes('await') && b.includes('.tobe(')) return 'Gọi async API và kiểm tra giá trị trả về';
  if (b.includes('render(')) return 'Render component và kiểm tra UI';
  if (b.includes('expect(') && b.includes('.tobe(')) return 'Kiểm tra giá trị trả về từ hàm test';

  return 'Kiểm tra nghiệp vụ chức năng';
}

// ===== MAIN =====
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match only it() lines, not test() or describe()
    const m = line.match(/^(\s*)it\s*\(\s*(['"`])(.+?)\2/);
    if (!m) continue;

    const indent = m[1];
    const itText = m[3];

    if (!isGarbage(itText)) continue;

    // Extract the body of this it() block
    const bodyLines = [];
    let depth = 0, started = false;
    for (let j = i; j < lines.length; j++) {
      const ln = lines[j];
      for (const ch of ln) { if (ch === '{') depth++; if (ch === '}') depth--; }
      if (!started) { if (ln.includes('{')) started = true; continue; }
      if (depth < 0) break;
      bodyLines.push(ln.trim());
      if (depth === 0 && started) break;
    }

    // Find the nearest describe block above this line
    let describePath = '';
    let descDepth = 999;
    for (let j = i - 1; j >= 0; j--) {
      const dMatch = lines[j].match(/^(\s*)describe\s*\(\s*(['"`])(.+?)\2/);
      if (dMatch) {
        const dIndent = dMatch[1].length;
        if (dIndent < descDepth) {
          describePath = dMatch[3] + (describePath ? ' > ' + describePath : '');
          descDepth = dIndent;
        }
      }
    }

    const bodyCode = bodyLines.join('\n');
    const newDesc = deriveDescription(describePath, bodyCode);
    const newLine = `${indent}it('${newDesc}',`;

    console.log(`  ✎ ${path.basename(filePath)}:${i+1}`);
    console.log(`    OLD: ${itText.substring(0, 80)}...`);
    console.log(`    NEW: ${newDesc}`);
    lines[i] = newLine;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    return true;
  }
  return false;
}

// Walk all test files
function walk(dir, ext) {
  const out = [];
  function go(d) {
    for (const e of fs.readdirSync(d, {withFileTypes:true})) {
      const fp = path.join(d, e.name);
      if (e.isDirectory()) go(fp);
      else if (e.isFile() && e.name.endsWith(ext)) out.push(fp);
    }
  }
  go(dir);
  return out.sort();
}

console.log('🧹 Cleaning garbage it() descriptions...\n');

// Process backward first to remove previously injected IDs (will be re-injected by full generator)
const beFiles = walk(BE_DIR, '.spec.ts');
const feFiles = [...walk(FE_DIR, '.test.ts'), ...walk(FE_DIR, '.test.tsx')];

let cleaned = 0;
for (const f of [...beFiles, ...feFiles]) {
  const rel = path.relative(BASE, f);
  if (processFile(f)) {
    cleaned++;
    console.log(`  ✓ ${rel}`);
  }
}

console.log(`\n✅ Cleaned ${cleaned} files with garbage it() names.`);
console.log('Run generate-report.js to regenerate Test IDs and HTML report.\n');
