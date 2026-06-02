const fs = require('fs');
const path = require('path');

const BASE = '/home/luozhi/Documents/HRM-Gene';
const BE_DIR = `${BASE}/backend/src/modules`;
const FE_DIR = `${BASE}/frontend/src`;
const OUT_HTML = `${BASE}/test-reports/test-report.html`;

// =========== PARSE ===========
function parseFile(fp) {
  const content = fs.readFileSync(fp, 'utf-8');
  const lines = content.split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    let m = ln.match(/^(\s*)(?:f)?describe\s*\(\s*(['"`])(.+?)\2/);
    if (m) { blocks.push({ t:'d', n: m[3], l: i, ind: m[1].length }); continue; }
    m = ln.match(/^(\s*)(?:f)?it\s*\(\s*(['"`])(.+?)\2/);
    if (m) { blocks.push({ t:'i', n: m[3], l: i, ind: m[1].length }); continue; }
    m = ln.match(/^(\s*)(?:f)?test\s*\(\s*(['"`])(.+?)\2/);
    if (m) blocks.push({ t:'i', n: m[3], l: i, ind: m[1].length });
  }
  const dh = [];
  const cases = [];
  for (const b of blocks) {
    if (b.t === 'd') {
      while (dh.length && dh[dh.length-1].ind >= b.ind) dh.pop();
      dh.push(b);
    } else {
      cases.push({ describe: dh.map(d=>d.n).join(' > ')||'(root)', itText: b.n, lineIdx: b.l, indent: b.ind });
    }
  }
  return { lines, cases, content };
}

// =========== INJECT TEST IDs INTO FILES ===========
function injectTestIds() {
  console.log('🔧 Injecting Test IDs into spec files...\n');

  // --- Backend ---
  const beFiles = [];
  function walkBe(d) {
    for (const e of fs.readdirSync(d, {withFileTypes:true})) {
      const fp = path.join(d, e.name);
      if (e.isDirectory()) walkBe(fp);
      else if (e.isFile() && e.name.endsWith('.spec.ts')) beFiles.push(fp);
    }
  }
  walkBe(BE_DIR);
  beFiles.sort();

  let beCounter = 0;
  for (const fp of beFiles) {
    const rel = path.relative(BE_DIR, fp);
    const modName = rel.split(path.sep)[0];
    const short = modName.replace(/[^a-zA-Z0-9]/g,'').toUpperCase().substring(0, 6);
    const { lines, cases } = parseFile(fp);

    if (cases.length === 0) continue;

    // Need to insert from bottom to top to preserve line indices
    const inserts = [];
    for (const tc of cases) {
      beCounter++;
      const tid = `TC_BE_${short}_${String(beCounter).padStart(3,'0')}`;
      const indent = ' '.repeat(tc.indent);
      const comment = `${indent}// [${tid}]`;
      inserts.push({ line: tc.lineIdx, comment });
    }

    // Insert from bottom up
    inserts.sort((a,b) => b.line - a.line);
    for (const ins of inserts) {
      lines.splice(ins.line, 0, ins.comment);
    }

    fs.writeFileSync(fp, lines.join('\n'), 'utf-8');
    console.log(`   ✓ BE ${rel}: injected ${cases.length} IDs`);
  }

  // --- Frontend ---
  const feFiles = [];
  function walkFe(d) {
    for (const e of fs.readdirSync(d, {withFileTypes:true})) {
      const fp = path.join(d, e.name);
      if (e.isDirectory()) walkFe(fp);
      else if (e.isFile() && (e.name.endsWith('.test.ts') || e.name.endsWith('.test.tsx'))) feFiles.push(fp);
    }
  }
  walkFe(FE_DIR);
  feFiles.sort();

  let feCounter = 0;
  for (const fp of feFiles) {
    const rel = path.relative(FE_DIR, fp);
    let cat = 'OTHER';
    if (rel.startsWith('components/')) cat = 'COMPON';
    else if (rel.startsWith('hooks/')) cat = 'HOOK';
    else if (rel.startsWith('context/')) cat = 'CONTEXT';
    else if (rel.startsWith('lib/')) cat = 'LIB';
    else if (rel.startsWith('utils/')) cat = 'UTILS';
    else if (rel.startsWith('types/')) cat = 'TYPES';
    else if (rel.startsWith('i18n/')) cat = 'I18N';

    const { lines, cases } = parseFile(fp);

    if (cases.length === 0) continue;

    const inserts = [];
    for (const tc of cases) {
      feCounter++;
      const tid = `TC_FE_${cat}_${String(feCounter).padStart(3,'0')}`;
      const indent = ' '.repeat(tc.indent);
      const comment = `${indent}// [${tid}]`;
      inserts.push({ line: tc.lineIdx, comment });
    }

    inserts.sort((a,b) => b.line - a.line);
    for (const ins of inserts) {
      lines.splice(ins.line, 0, ins.comment);
    }

    fs.writeFileSync(fp, lines.join('\n'), 'utf-8');
    console.log(`   ✓ FE ${rel}: injected ${cases.length} IDs`);
  }

  console.log(`\n✅ Total: ${beCounter} BE + ${feCounter} FE = ${beCounter+feCounter} Test IDs injected\n`);
}

// =========== EXTRACT ALL TEST CASES (FOR HTML) ===========
function he(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function trunc(s,n) { return s.length>n ? s.substring(0,n)+'...' : s; }

function extractBody(lines, startIdx) {
  const body = [];
  let depth = 0, started = false;
  for (let i = startIdx; i < lines.length; i++) {
    const ln = lines[i];
    for (const ch of ln) { if (ch==='{') depth++; if (ch==='}') depth--; }
    if (!started) { if (ln.includes('{')) started = true; continue; }
    if (depth < 0) break;
    body.push(ln.trim());
    if (depth === 0 && started) break;
  }
  return body;
}

function extractExpects(bodyLines) {
  const out = [];
  for (const line of bodyLines) {
    let t = line.trim();
    const idx = t.indexOf('expect(');
    if (idx === -1) continue;
    if (idx > 0) t = t.substring(idx);
    if (!t.startsWith('expect(')) continue;

    t = t.replace(/;\s*$/,'').trim();

    let m;
    if ((m = t.match(/\.toBe\((.+?)\)\s*$/))) out.push(`Trả về <code>${he(m[1])}</code>`);
    else if ((m = t.match(/\.toEqual\((.+)\)\s*$/))) out.push(`Kết quả khớp <code>${he(trunc(m[1],50))}</code>`);
    else if (t.includes('.toHaveBeenCalledWith(')) { m=t.match(/\.toHaveBeenCalledWith\((.+)\)\s*$/); out.push(`Được gọi với: <code>${he(trunc(m?.[1]||'',50))}</code>`); }
    else if (t.includes('.toHaveBeenCalled()')) out.push('Hàm/Mock đã được gọi');
    else if ((m = t.match(/\.toHaveBeenCalledTimes\((\d+)\)/))) out.push(`Được gọi đúng <b>${m[1]}</b> lần`);
    else if ((m = t.match(/\.toContain\((.+?)\)\s*$/))) out.push(`Chứa giá trị: <code>${he(m[1])}</code>`);
    else if (t.includes('.toBeDefined()')) out.push('Đối tượng được định nghĩa (không null/undefined)');
    else if (t.includes('.toBeNull()')) out.push('Giá trị là <b>null</b>');
    else if (t.includes('.toBeTruthy()')) out.push('Giá trị là <b>truthy</b>');
    else if (t.includes('.toBeFalsy()')) out.push('Giá trị là <b>falsy</b>');
    else if ((m = t.match(/\.toThrow\(['"](.+?)['"]\)/))) out.push(`Ném lỗi: "${m[1]}"`);
    else if (t.includes('.toThrow()')) out.push('Ném ra exception');
    else if ((m = t.match(/\.toBeGreaterThan\((.+?)\)/))) out.push(`Giá trị <b>&gt;</b> ${m[1]}`);
    else if ((m = t.match(/\.toBeLessThan\((.+?)\)/))) out.push(`Giá trị <b>&lt;</b> ${m[1]}`);
    else if ((m = t.match(/\.toHaveLength\((.+?)\)/))) out.push(`Độ dài = <b>${m[1]}</b>`);
    else if ((m = t.match(/\.toHaveProperty\((.+?)\)/))) out.push(`Có thuộc tính: <code>${he(trunc(m[1],40))}</code>`);
    else if (t.includes('.toMatchObject(')) out.push('Khớp với object mẫu');
    else if (t.includes('.toBeInTheDocument()')) out.push('Phần tử tồn tại trong DOM');
    else if (t.includes('.toBeDisabled()')) out.push('Phần tử ở trạng thái <b>disabled</b>');
    else if (t.includes('.toBeEnabled()')) out.push('Phần tử ở trạng thái <b>enabled</b>');
    else if (t.includes('.toBeChecked()')) out.push('Checkbox/radio được chọn (checked)');
    else if (t.includes('.toHaveFocus()')) out.push('Phần tử đang được focus');
    else if (t.includes('.toBeVisible()')) out.push('Phần tử hiển thị trên UI');
    else if ((m = t.match(/\.toHaveTextContent\((.+?)\)/))) out.push(`UI hiển thị: ${he(m[1].replace(/['"]/g,''))}`);
    else if ((m = t.match(/\.toHaveClass\((.+?)\)/))) out.push(`Có CSS class: <code>${he(m[1])}</code>`);
    else if ((m = t.match(/\.toHaveAttribute\((.+?)\)/))) out.push(`Có attribute: <code>${he(trunc(m[1],40))}</code>`);
    else if (t.includes('.resolves.')) out.push('Promise <b>resolve</b> thành công');
    else if (t.includes('.rejects.')) out.push('Promise bị <b>reject</b>');
    else if (t.includes('.not.')) { const nm=t.match(/\.not\.(\w+)\((.+?)\)/); out.push(nm?`PHỦ ĐỊNH: không ${nm[1]}(${he(trunc(nm[2]||'',30))})`:'Điều kiện phủ định'); }
    else out.push(he(trunc(t,90)));
  }
  return out.length ? out : ['Hoàn thành kiểm tra không lỗi'];
}

function extractSteps(bodyLines, isFE) {
  const full = bodyLines.join('\n');
  const steps = []; let n = 1;
  if (full.includes('mockResolvedValue')||full.includes('mockReturnValue')) steps.push(`${n++}. Mock dữ liệu trả về cho dependency`);
  if (full.includes('jest.spyOn')||full.includes('jest.fn(')||full.includes('jest.mock(')) steps.push(`${n++}. Thiết lập spy/mock cho hàm phụ thuộc`);
  if (full.includes('mockRepo')||full.includes('mockRepository')) steps.push(`${n++}. Mock Repository database`);
  if (full.match(/new\s+\w+(Service|Controller|Gateway)\(/)) steps.push(`${n++}. Khởi tạo đối tượng cần test`);
  if (full.match(/(controller|service|gateway)\.\w+\(/)) steps.push(`${n++}. Gọi phương thức nghiệp vụ cần kiểm thử`);
  if (full.includes('.findOne(')||full.includes('.find(')||full.includes('.save(')||full.includes('.create(')||full.includes('.update(')||full.includes('.delete(')) steps.push(`${n++}. Thực hiện thao tác database`);
  if (full.includes('render(')&&!full.includes('renderHook(')) steps.push(`${n++}. Render component với mock context/props`);
  if (full.includes('renderHook(')) steps.push(`${n++}. Render hook với renderHook()`);
  if (full.includes('fireEvent.')||full.includes('userEvent.')) steps.push(`${n++}. Mô phỏng hành động người dùng`);
  if (full.includes('screen.getBy')||full.includes('screen.queryBy')||full.includes('screen.findBy')) steps.push(`${n++}. Truy vấn phần tử DOM`);
  if (full.includes('waitFor(')) steps.push(`${n++}. Chờ cập nhật bất đồng bộ (waitFor)`);
  if (full.includes('act(')) steps.push(`${n++}. Bọc trong act() để đồng bộ React state`);
  if (full.includes('global.fetch')||full.includes('fetchMock')||full.includes('msw')) steps.push(`${n++}. Mock API call (fetch)`);
  if (full.includes('.toThrow(')||full.includes('rejects.')||full.includes('catch')) steps.push(`${n++}. Kiểm tra xử lý ngoại lệ`);
  if (steps.length===0) { steps.push(`${n++}. ${isFE?'Render component/hook':'Mock dữ liệu đầu vào'}`); steps.push(`${n++}. Gọi hàm/phương thức cần test`); }
  steps.push(`${n}. Kiểm tra kết quả với expect()`);
  return steps;
}

function genDesc(descPath, itText, body) {
  // If itText is already a clean human-readable description (not English "should..."), use it directly
  const adverbs = ['smoothly','natively','beautifully','optimally','logically','perfectly','flexibly',
    'transparently','creatively','properly','implicitly','inherently','flawlessly','mathematically',
    'systematically','dynamically','organically','conceptually','strategically'];
  const advCount = adverbs.filter(a => itText.toLowerCase().includes(a)).length;
  if (advCount <= 1 && !/^should\b/i.test(itText.trim()) && itText.trim().length > 5) {
    return itText.trim();
  }

  const c = (descPath+' '+itText).toLowerCase();
  const b = body.toLowerCase();
  // Admin
  if (c.includes('getallsettings')) return 'Lấy danh sách tất cả thiết lập hệ thống';
  if (c.includes('getsetting')&&(c.includes('not exist')||c.includes('missing'))) return 'Lấy thiết lập không tồn tại: trả về null/undefined';
  if (c.includes('getsetting')) return 'Lấy một thiết lập hệ thống theo key';
  if (c.includes('updatesetting')&&c.includes('create')) return 'Cập nhật thiết lập chưa tồn tại: tự động tạo mới (upsert)';
  if (c.includes('updatesetting')) return 'Cập nhật giá trị thiết lập hệ thống';
  if (c.includes('getorganizationstats')) return 'Lấy thống kê tổ chức (phòng ban, nhân viên)';
  if (c.includes('getalldepartments')) return 'Lấy danh sách tất cả phòng ban';
  if (c.includes('createdepartment')&&c.includes('duplicate')) return 'Tạo phòng ban trùng tên: báo lỗi Conflict';
  if (c.includes('createdepartment')) return 'Tạo mới một phòng ban';
  if (c.includes('updatedepartment')&&c.includes('not found')) return 'Cập nhật phòng ban không tồn tại: báo lỗi 404';
  if (c.includes('updatedepartment')) return 'Cập nhật thông tin phòng ban';
  if (c.includes('getallpositions')) return 'Lấy danh sách tất cả chức vụ';
  if (c.includes('createposition')) return 'Tạo mới một chức vụ';
  if (c.includes('getpermissionmatrix')) return 'Lấy ma trận phân quyền (permission matrix)';
  if (c.includes('assignpermission')) return 'Gán quyền cho chức vụ';
  if (c.includes('revokepermission')) return 'Thu hồi quyền khỏi chức vụ';
  if (c.includes('getallemployees')&&c.includes('basic')) return 'Lấy danh sách nhân viên cơ bản (dữ liệu rút gọn)';
  if (c.includes('getallemployees')) return 'Lấy danh sách tất cả nhân viên';
  if (c.includes('transferemployee')&&c.includes('same')) return 'Chuyển nhân viên đến cùng vị trí: không thay đổi';
  if (c.includes('transferemployee')) return 'Chuyển nhân viên sang phòng ban/vị trí mới';
  if (c.includes('seddemodata')&&c.includes('without')) return 'Tạo dữ liệu mẫu không chỉ định nhân viên';
  if (c.includes('seddemodata')) return 'Tạo dữ liệu mẫu (seed demo data)';
  // Auth
  if (c.includes('login')&&c.includes('valid')) return 'Đăng nhập với thông tin hợp lệ, nhận JWT token';
  if (c.includes('login')&&(c.includes('invalid')||c.includes('wrong')||c.includes('fail'))) return 'Đăng nhập với sai thông tin: trả về lỗi Unauthorized';
  if (c.includes('login')&&c.includes('missing')) return 'Đăng nhập thiếu trường bắt buộc: trả về lỗi validation';
  if (c.includes('login')&&c.includes('locked')) return 'Đăng nhập vào tài khoản đã bị khóa: bị từ chối';
  if (c.includes('register')||c.includes('signup')) return 'Đăng ký tài khoản nhân viên mới thành công';
  if (c.includes('forgot password')) return 'Yêu cầu đặt lại mật khẩu qua email';
  if (c.includes('reset password')) return 'Đặt lại mật khẩu với token hợp lệ';
  if (c.includes('refresh token')) return 'Làm mới JWT token bằng refresh token';
  if (c.includes('logout')) return 'Đăng xuất và vô hiệu hóa token hiện tại';
  if (c.includes('validate token')) return 'Xác thực JWT token và trả về thông tin user';
  if (c.includes('change password')) return 'Thay đổi mật khẩu với xác thực mật khẩu cũ';
  if (c.includes('profile')||c.includes('get me')) return 'Lấy thông tin profile của người dùng đang đăng nhập';
  // Employees
  if (c.includes('create employee')&&c.includes('duplicate')) return 'Tạo nhân viên email/SĐT trùng: báo lỗi Conflict';
  if (c.includes('create employee')&&c.includes('invalid')) return 'Tạo nhân viên dữ liệu không hợp lệ: bị từ chối';
  if (c.includes('create employee')) return 'Tạo mới hồ sơ nhân viên với đầy đủ thông tin';
  if (c.includes('update employee')&&c.includes('not found')) return 'Cập nhật nhân viên không tồn tại: lỗi 404';
  if (c.includes('update employee')) return 'Cập nhật thông tin hồ sơ nhân viên';
  if (c.includes('delete employee')&&c.includes('not found')) return 'Xóa nhân viên không tồn tại: trả về lỗi';
  if (c.includes('delete employee')) return 'Xóa hồ sơ nhân viên khỏi hệ thống';
  if (c.includes('get employee')&&c.includes('not found')) return 'Lấy chi tiết nhân viên không tồn tại: 404';
  if (c.includes('get employee by id')) return 'Lấy chi tiết nhân viên theo ID';
  if (c.includes('search employee')) return 'Tìm kiếm nhân viên theo tiêu chí';
  if (c.includes('import employee')) return 'Import danh sách nhân viên từ file';
  // Contracts
  if (c.includes('create contract')&&c.includes('overlap')) return 'Tạo hợp đồng thời gian chồng lấn: bị từ chối';
  if (c.includes('create contract')) return 'Tạo mới hợp đồng lao động cho nhân viên';
  if (c.includes('update contract')) return 'Cập nhật thông tin hợp đồng lao động';
  if (c.includes('terminate contract')) return 'Chấm dứt hợp đồng lao động';
  if (c.includes('salary history')&&c.includes('not found')) return 'Xem lịch sử lương nhân viên không tồn tại';
  if (c.includes('salary history')) return 'Xem lịch sử thay đổi lương của nhân viên';
  // Timekeeping
  if (c.includes('check in')&&c.includes('already')) return 'Chấm công khi đã check-in: bị từ chối (trùng)';
  if (c.includes('check in')) return 'Chấm công vào ca làm việc (check-in)';
  if (c.includes('check out')&&c.includes('without')) return 'Check-out khi chưa check-in: báo lỗi';
  if (c.includes('check out')) return 'Chấm công ra về (check-out)';
  if (c.includes('attendance')) return 'Lấy báo cáo chấm công';
  if (c.includes('overtime')) return 'Tính toán giờ làm thêm';
  // Leave
  if (c.includes('create leave')&&c.includes('insufficient')) return 'Tạo đơn nghỉ vượt số ngày còn lại: bị từ chối';
  if (c.includes('create leave')&&c.includes('overlap')) return 'Tạo đơn nghỉ trùng ngày: bị từ chối';
  if (c.includes('create leave')) return 'Tạo đơn xin nghỉ phép mới';
  if (c.includes('approve leave')) return 'Phê duyệt đơn xin nghỉ phép';
  if (c.includes('reject leave')) return 'Từ chối đơn xin nghỉ phép';
  if (c.includes('cancel leave')) return 'Hủy đơn xin nghỉ phép';
  if (c.includes('leave balance')) return 'Kiểm tra số ngày phép còn lại';
  // Payroll
  if (c.includes('calculate payroll')&&c.includes('empty')) return 'Tính lương tháng không có dữ liệu: trả về rỗng';
  if (c.includes('calculate payroll')) return 'Tính toán bảng lương tháng cho toàn bộ nhân viên';
  if (c.includes('generate payslip')) return 'Tạo phiếu lương cho nhân viên';
  if (c.includes('num to words')&&c.includes('zero')) return 'Số 0 → chữ: "không đồng"';
  if (c.includes('num to words')&&c.includes('million')) return 'Chuyển số hàng triệu thành chữ tiếng Việt';
  if (c.includes('num to words')&&c.includes('billion')) return 'Chuyển số hàng tỷ thành chữ tiếng Việt';
  if (c.includes('num to words')&&c.includes('decimal')) return 'Chuyển số thập phân thành chữ tiếng Việt';
  if (c.includes('num to words')&&c.includes('negative')) return 'Chuyển số âm thành chữ ("âm...")';
  if (c.includes('num to words')) return 'Chuyển đổi số thành chữ tiếng Việt';
  // Violations
  if (c.includes('create violation')&&c.includes('duplicate')) return 'Tạo biên bản vi phạm trùng lặp: bị từ chối';
  if (c.includes('create violation')) return 'Tạo mới biên bản vi phạm cho nhân viên';
  if (c.includes('update violation')) return 'Cập nhật biên bản vi phạm';
  if (c.includes('delete violation')) return 'Xóa biên bản vi phạm';
  // Announcements
  if (c.includes('create announcement')) return 'Tạo thông báo mới trong hệ thống';
  if (c.includes('get announcement')) return 'Lấy danh sách thông báo';
  // Notifications
  if (c.includes('send notification')) return 'Gửi thông báo đến người dùng';
  if (c.includes('mark as read')&&!c.includes('all')) return 'Đánh dấu thông báo đã đọc';
  if (c.includes('mark all')) return 'Đánh dấu tất cả thông báo đã đọc';
  if (c.includes('unread')) return 'Lấy danh sách thông báo chưa đọc';
  if (c.includes('get notification')) return 'Lấy danh sách thông báo';
  if (c.includes('gateway')&&c.includes('connect')) return 'WebSocket: Thiết lập kết nối thành công';
  if (c.includes('gateway')&&c.includes('disconnect')) return 'WebSocket: Ngắt kết nối và dọn dẹp';
  if (c.includes('gateway')&&c.includes('message')) return 'WebSocket: Nhận và xử lý message';
  if (c.includes('gateway')) return 'WebSocket Gateway: Xử lý realtime';
  // Resignations
  if (c.includes('submit resignation')) return 'Nộp đơn xin thôi việc';
  if (c.includes('approve resignation')) return 'Phê duyệt đơn xin thôi việc';
  if (c.includes('reject resignation')) return 'Từ chối đơn xin thôi việc';
  // KPI
  if (c.includes('set kpi')) return 'Thiết lập chỉ tiêu KPI cho nhân viên';
  if (c.includes('evaluate kpi')) return 'Đánh giá kết quả KPI';
  if (c.includes('get kpi')) return 'Lấy danh sách KPI';
  // Dashboard
  if (c.includes('dashboard')&&c.includes('admin')) return 'Lấy dữ liệu tổng quan cho Admin Dashboard';
  if (c.includes('dashboard')&&c.includes('employee')) return 'Lấy dữ liệu tổng quan cho Employee Dashboard';
  // Reports
  if (c.includes('generate report')) return 'Tạo báo cáo tổng hợp';
  if (c.includes('export report')) return 'Xuất báo cáo ra file';
  // Comments
  if (c.includes('create comment')) return 'Thêm bình luận mới';
  if (c.includes('delete comment')) return 'Xóa bình luận';
  // Company Profile
  if (c.includes('company profile')&&c.includes('update')) return 'Cập nhật thông tin hồ sơ công ty';
  if (c.includes('company profile')&&c.includes('logo')) return 'Cập nhật logo công ty';
  if (c.includes('company profile')) return 'Lấy thông tin hồ sơ công ty';
  // Analytics
  if (c.includes('analytics')&&c.includes('turnover')) return 'Phân tích tỷ lệ nghỉ việc (turnover)';
  if (c.includes('analytics')) return 'Phân tích dữ liệu nhân sự';

  // ---- FRONTEND ----
  if (c.includes('contextualchat')&&c.includes('render')) return 'ContextualChat: Render giao diện chat';
  if (c.includes('contextualchat')&&c.includes('send')) return 'ContextualChat: Gửi tin nhắn và hiển thị';
  if (c.includes('contextualchat')&&c.includes('error')) return 'ContextualChat: Hiển thị lỗi gửi tin nhắn';
  if (c.includes('contextualchat')&&c.includes('empty')) return 'ContextualChat: Trạng thái không có tin nhắn';
  if (c.includes('contextualchat')&&c.includes('callback')) return 'ContextualChat: Gọi callback khi gửi tin';
  if (c.includes('contextualchat')) return 'ContextualChat: Tương tác khung chat';
  if (c.includes('admindashboardwidget')&&c.includes('loading')) return 'AdminDashboard: Hiển thị spinner khi tải';
  if (c.includes('admindashboardwidget')&&c.includes('error')) return 'AdminDashboard: Hiển thị lỗi API';
  if (c.includes('admindashboardwidget')&&c.includes('data')) return 'AdminDashboard: Hiển thị số liệu thống kê';
  if (c.includes('admindashboardwidget')) return 'AdminDashboardWidget: Widget tổng quan Admin';
  if (c.includes('employeedashboardwidget')&&c.includes('loading')) return 'EmployeeDashboard: Hiển thị spinner khi tải';
  if (c.includes('employeedashboardwidget')&&c.includes('error')) return 'EmployeeDashboard: Hiển thị lỗi API';
  if (c.includes('employeedashboardwidget')) return 'EmployeeDashboardWidget: Widget tổng quan NV';
  // Contexts
  if (c.includes('authcontext')&&c.includes('login')&&c.includes('success')) return 'AuthContext: Đăng nhập thành công, lưu token';
  if (c.includes('authcontext')&&c.includes('login')&&c.includes('fail')) return 'AuthContext: Đăng nhập thất bại, xóa thông tin';
  if (c.includes('authcontext')&&c.includes('logout')) return 'AuthContext: Đăng xuất, reset state';
  if (c.includes('authcontext')&&c.includes('loading')) return 'AuthContext: Hiển thị trạng thái loading';
  if (c.includes('authcontext')&&c.includes('expired')) return 'AuthContext: Xử lý token hết hạn';
  if (c.includes('authcontext')) return 'AuthContext: Quản lý trạng thái xác thực';
  if (c.includes('companycontext')&&c.includes('fetch')&&c.includes('fail')) return 'CompanyContext: API lỗi → settings = null';
  if (c.includes('companycontext')&&c.includes('fetch')) return 'CompanyContext: Lấy thông tin công ty từ API';
  if (c.includes('companycontext')&&c.includes('logo')) return 'CompanyContext: Cập nhật logo công ty';
  if (c.includes('companycontext')&&c.includes('refresh')) return 'CompanyContext: Làm mới thông tin';
  if (c.includes('companycontext')&&c.includes('without provider')) return 'CompanyContext: Lỗi khi dùng ngoài Provider';
  if (c.includes('companycontext')&&c.includes('null')&&c.includes('crash')) return 'CompanyContext: Không crash với settings=null';
  if (c.includes('companycontext')) return 'CompanyContext: Quản lý thông tin công ty';
  // Hooks
  if (c.includes('toast reducer')&&c.includes('add')) return 'useToast: Thêm toast mới (ADD_TOAST)';
  if (c.includes('toast reducer')&&c.includes('limit')) return 'useToast: Giới hạn số toast (TOAST_LIMIT)';
  if (c.includes('toast reducer')&&c.includes('update')) return 'useToast: Cập nhật toast (UPDATE_TOAST)';
  if (c.includes('toast reducer')&&c.includes('dismiss')) return 'useToast: Đóng toast (DISMISS_TOAST)';
  if (c.includes('toast reducer')&&c.includes('remove')&&c.includes('no toastid')) return 'useToast: Xóa tất cả toast';
  if (c.includes('toast reducer')&&c.includes('remove')) return 'useToast: Xóa toast cụ thể (REMOVE_TOAST)';
  if (c.includes('imperative')) return 'useToast: Gọi toast() trực tiếp, trả về control object';
  if (c.includes('useauth')) return 'useAuth: Trả về thông tin user từ context';
  if (c.includes('usecheckpermission')&&c.includes('director')) return 'useCheckPermission: Director bypass permission';
  if (c.includes('usecheckpermission')&&c.includes('system admin')) return 'useCheckPermission: System Admin bypass';
  if (c.includes('usecheckpermission')&&c.includes('exact')) return 'useCheckPermission: Khớp string permission';
  if (c.includes('usecheckpermission')&&c.includes('lacks')) return 'useCheckPermission: Từ chối khi thiếu permission';
  if (c.includes('usecheckpermission')&&c.includes('null user')) return 'useCheckPermission: Từ chối khi chưa đăng nhập';
  if (c.includes('usecheckpermission')&&c.includes('object')) return 'useCheckPermission: Khớp permission dạng object';
  if (c.includes('usecheckpermission')&&c.includes('lowercase')) return 'useCheckPermission: Nhận diện role "admin" (lowercase)';
  if (c.includes('usecheckpermission')&&c.includes('position')) return 'useCheckPermission: System Admin từ position_name';
  if (c.includes('usecheckpermission')&&c.includes('return false')) return 'useCheckPermission: Từ chối truy cập';
  if (c.includes('usecheckpermission')&&c.includes('return true')) return 'useCheckPermission: Cho phép truy cập';
  if (c.includes('usenotifications')&&c.includes('markasread')) return 'useNotifications: Đánh dấu đã đọc';
  if (c.includes('usenotifications')&&c.includes('remove')) return 'useNotifications: Xóa thông báo';
  if (c.includes('usenotifications')&&c.includes('markall')) return 'useNotifications: Đánh dấu tất cả đã đọc';
  if (c.includes('usenotifications')) return 'useNotifications: Lấy danh sách và số chưa đọc';
  if (c.includes('useshowstatus')||c.includes('use-status')) return 'useShowStatus: Kiểm tra trạng thái hiển thị';
  // i18n
  if (c.includes('i18n')) return 'i18n: Cấu hình đa ngôn ngữ khởi tạo đúng';
  // Lib
  if (c.includes('getpositionname')&&c.includes('fallback')) return 'getPositionName: Dùng role dự phòng';
  if (c.includes('getpositionname')&&c.includes('null')) return 'getPositionName: Trả về "" khi user=null';
  if (c.includes('getpositionname')) return 'getPositionName: Lấy tên chức vụ (lowercase)';
  if (c.includes('isadminbypassrole')&&c.includes('director')) return 'isAdminBypassRole: Director → true';
  if (c.includes('isadminbypassrole')&&c.includes('hr')) return 'isAdminBypassRole: HR Manager → true';
  if (c.includes('isadminbypassrole')&&c.includes('employee')) return 'isAdminBypassRole: Employee → false';
  if (c.includes('canmanagesystem')&&c.includes('director')) return 'canManageSystem: Director → true';
  if (c.includes('canmanagesystem')&&c.includes('manage:system')) return 'canManageSystem: Có permission → true';
  if (c.includes('canmanagesystem')&&c.includes('false')) return 'canManageSystem: User thường → false';
  if (c.includes('canmanagepayroll')&&c.includes('finance')) return 'canManagePayroll: Finance → true';
  if (c.includes('canmanagepayroll')&&c.includes('false')) return 'canManagePayroll: Non-finance → false';
  if (c.includes('canmanagepermissions')&&c.includes('director')) return 'canManagePermissions: Director → true';
  if (c.includes('canmanagepermissions')&&c.includes('false')) return 'canManagePermissions: User thường → false';
  if (c.includes('canmanageleave')&&c.includes('hr')) return 'canManageLeave: HR → true';
  if (c.includes('canmanageleave')&&c.includes('false')) return 'canManageLeave: Non-HR → false';
  if (c.includes('canmanageemployees')&&c.includes('director')) return 'canManageEmployees: Director → true';
  if (c.includes('canmanageemployees')&&c.includes('hr')) return 'canManageEmployees: HR → true';
  if (c.includes('canmanageemployees')&&c.includes('false')) return 'canManageEmployees: Non-HR → false';
  // Menu
  if (c.includes('menuvisibility')&&c.includes('director')) return 'checkMenuVisibility: Director bypass';
  if (c.includes('menuvisibility')&&c.includes('system admin')) return 'checkMenuVisibility: System Admin bypass';
  if (c.includes('menuvisibility')&&c.includes('department match')) return 'checkMenuVisibility: Khớp phòng ban → true';
  if (c.includes('menuvisibility')&&c.includes('hr')&&c.includes('finance')) return 'checkMenuVisibility: HR bị chặn menu Finance';
  if (c.includes('menuvisibility')&&c.includes('sales')) return 'checkMenuVisibility: Role-based fallback';
  if (c.includes('menuvisibility')&&c.includes('null')) return 'checkMenuVisibility: User null → false';
  // cn
  if (c.includes('merge')&&c.includes('string')) return 'cn(): Gộp class name';
  if (c.includes('conflict')||c.includes('tailwind')) return 'cn(): Giải quyết xung đột (twMerge)';
  if (c.includes('falsy')) return 'cn(): Bỏ qua falsy';
  if (c.includes('no argument')||c.includes('empty string')) return 'cn(): Không tham số → ""';
  if (c.includes('conditional')||c.includes('object')) return 'cn(): Xử lý object và mảng (clsx)';
  // Utils API
  if (c.includes('cleanparams')) return 'cleanParams: Loại bỏ null/undefined/empty';
  if (c.includes('toquerystring')) return 'toQueryString: Object → query string URL';
  // Types
  if (c.includes('timekeeping')&&c.includes('type')) return 'Timekeeping Types: Cấu trúc dữ liệu';

  // Generic
  if (c.includes('should return true')) return 'Kiểm tra: trả về <b>true</b>';
  if (c.includes('should return false')) return 'Kiểm tra: trả về <b>false</b>';
  if (c.includes('should add')) return 'Thêm mới thành công';
  if (c.includes('should update')) return 'Cập nhật thành công';
  if (c.includes('should delete')||c.includes('should remove')) return 'Xóa thành công';
  if (c.includes('should get')||c.includes('should fetch')) return 'Truy xuất dữ liệu thành công';
  if (c.includes('should handle')&&c.includes('error')) return 'Xử lý lỗi an toàn';
  if (c.includes('should throw')||c.includes('should reject')) return 'Ném exception phù hợp';
  if (c.includes('should return empty')) return 'Trả về rỗng khi không có dữ liệu';
  if (c.includes('should call')) return 'Gọi đúng callback với tham số';
  if (c.includes('should render')) return 'Render component thành công';
  if (c.includes('should display')||c.includes('should show')) return 'Hiển thị đúng nội dung';
  if (c.includes('should set')) return 'Thiết lập giá trị thành công';
  if (c.includes('should clear')) return 'Xóa sạch dữ liệu';
  if (c.includes('should match')) return 'So khớp chính xác';
  if (c.includes('should fire')||c.includes('should trigger')) return 'Kích hoạt sự kiện thành công';
  if (c.includes('should merge')) return 'Gộp dữ liệu thành công';
  if (c.includes('should ignore')) return 'Bỏ qua giá trị không hợp lệ';
  if (c.includes('should detect')) return 'Phát hiện chính xác điều kiện';
  if (c.includes('should refresh')) return 'Làm mới dữ liệu thành công';
  if (c.includes('should enforce')) return 'Thực thi giới hạn đúng quy định';
  if (c.includes('should process')) return 'Xử lý dữ liệu và trả kết quả đúng';
  if (c.includes('should not crash')) return 'Không crash với dữ liệu bất thường';
  if (c.includes('should fallback')) return 'Dùng giá trị dự phòng';
  if (c.includes('should load')) return 'Tải dữ liệu thành công';
  if (c.includes('should validate')) return 'Xác thực dữ liệu đúng';
  if (c.includes('should submit')) return 'Gửi form thành công';
  if (c.includes('should reset')) return 'Reset về giá trị ban đầu';
  if (c.includes('should toggle')) return 'Toggle trạng thái thành công';
  if (c.includes('should filter')) return 'Lọc dữ liệu chính xác';
  if (c.includes('should sort')) return 'Sắp xếp đúng thứ tự';
  if (c.includes('should format')) return 'Định dạng đúng chuẩn';
  if (c.includes('should convert')) return 'Chuyển đổi dữ liệu thành công';
  if (c.includes('should parse')) return 'Parse dữ liệu thành công';
  if (c.includes('should check')) return 'Kiểm tra và trả về boolean đúng';
  if (c.includes('should create')) return 'Tạo mới thành công';
  if (c.includes('should list')) return 'Liệt kê danh sách đầy đủ';
  if (c.includes('should not')) return 'Xác minh hành vi KHÔNG xảy ra';

  return itText.replace(/^should /,'').replace(/^should/,'').replace(/^\w/,c=>c.toUpperCase()).trim()||'Kiểm tra nghiệp vụ';
}

function getPriority(descPath, itText, body) {
  const c=(descPath+' '+itText+' '+body).toLowerCase();
  if (c.includes('login')||c.includes('authenticate')||c.includes('token')||c.includes('register')||
      c.includes('payroll')||c.includes('salary')||c.includes('check in')||c.includes('check out')||
      c.includes('attend')||c.includes('leave')&&c.includes('approve')||c.includes('leave')&&c.includes('reject')||
      c.includes('director')&&c.includes('bypass')||c.includes('system admin')||
      c.includes('permission')&&c.includes('check')||c.includes('create employee')) return 'P1';
  if (c.includes('null')||c.includes('undefined')||c.includes('empty')||c.includes('no argument')||
      c.includes('falsy')||c.includes('without arg')||c.includes('not crash')||c.includes('edge')) return 'P3';
  return 'P2';
}

function getCategory(descPath, itText, body) {
  const c=(descPath+' '+itText+' '+body).toLowerCase();
  if (c.includes('throw')||c.includes('error')||c.includes('fail')||c.includes('reject')||
      c.includes('invalid')||c.includes('exception')||c.includes('not found')||c.includes('not exist')||
      c.includes('missing')||c.includes('null')||c.includes('undefined')||c.includes('unauthorized')||
      c.includes('forbidden')||c.includes('should not')||c.includes('cannot')||c.includes('empty')||
      c.includes('duplicate')||c.includes('locked')||c.includes('insufficient')||c.includes('overlap')||
      c.includes('status:500')||c.includes('non-ok')||c.includes('without provider')||c.includes('without permission'))
    return 'Negative';
  return 'Positive';
}

// =========== LCOV LINK BUILDER ===========
function buildLcovHref(filePath, isFE) {
  const fname = path.basename(filePath);
  if (isFE) {
    // frontend/src/hooks/useAuth.test.ts  →  ../frontend/coverage/lcov-report/hooks/useAuth.ts.html
    const relDir = path.dirname(path.relative(FE_DIR, filePath));
    const srcFile = fname.replace(/\.test\.(ts|tsx)$/, '.$1');
    return `../frontend/coverage/lcov-report/${relDir}/${srcFile}.html`;
  } else {
    // backend/src/modules/auth/auth.controller.spec.ts  →  ../backend/coverage/lcov-report/modules/auth/auth.controller.ts.html
    const rel = path.relative(BE_DIR, filePath);
    const mod = rel.split(path.sep)[0];
    const srcFile = fname.replace(/\.spec\.ts$/, '.ts');
    return `../backend/coverage/lcov-report/modules/${mod}/${srcFile}.html`;
  }
}

// =========== BUILD HTML ===========
function buildHtml(beCases, feCases) {
  const tBE=beCases.length, tFE=feCases.length, tAll=tBE+tFE;

  const beMods={};
  for (const tc of beCases) {
    const rel=path.relative(BE_DIR,tc.file);
    const mod=rel.split(path.sep)[0];
    if(!beMods[mod])beMods[mod]=[];
    beMods[mod].push(tc);
  }
  const feCats={};
  for (const tc of feCases) {
    const rel=path.relative(FE_DIR,tc.file);
    let cat='Other';
    if(rel.startsWith('components/'))cat='Components';
    else if(rel.startsWith('hooks/'))cat='Hooks';
    else if(rel.startsWith('context/'))cat='Contexts';
    else if(rel.startsWith('lib/'))cat='Lib';
    else if(rel.startsWith('utils/'))cat='Utils';
    else if(rel.startsWith('types/'))cat='Types';
    else if(rel.startsWith('i18n/'))cat='i18n';
    if(!feCats[cat])feCats[cat]=[];
    feCats[cat].push(tc);
  }

  function accordion(id, groups, parentId) {
    let h='', counter=0;
    for (const [name, cases] of Object.entries(groups)) {
      const aid=`${id}-${name.replace(/[^a-z0-9]/gi,'-')}`;
      h+=`
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${aid}">
              ${name.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
              <span class="badge bg-secondary ms-2">${cases.length} tests</span>
            </button>
          </h2>
          <div id="${aid}" class="accordion-collapse collapse" data-bs-parent="#${parentId}">
            <div class="accordion-body p-0">
              <div class="table-responsive">
                <table class="table table-sm table-hover mb-0">
                  <thead class="table-light"><tr>
                    <th style="width:10%">Test ID</th><th style="width:6%">Priority</th><th style="width:8%">Category</th>
                    <th style="width:22%">Description</th><th style="width:30%">Steps</th><th style="width:24%">Expected Result</th>
                  </tr></thead><tbody>`;
      for (const tc of cases) {
        counter++;
        const prefix=id==='be'?'TC_BE':'TC_FE';
        const short=name.replace(/[^a-zA-Z0-9]/g,'').toUpperCase().substring(0,6);
        const tid=`${prefix}_${short}_${String(counter).padStart(3,'0')}`;
        const pc=`priority-${tc.priority}`;
        const cc=`cat-${tc.category}`;
        h+=`
                    <tr>
                      <td><a href="${tc.lcovHref}" target="_blank" class="lcov-link">${tid}</a></td>
                      <td><span class="badge ${tc.priority==='P1'?'bg-danger':tc.priority==='P2'?'bg-warning text-dark':'bg-secondary'}">${tc.priority}</span></td>
                      <td><span class="badge ${tc.category==='Positive'?'bg-success':tc.category==='Negative'?'bg-warning text-dark':'bg-danger'}">${tc.category}</span></td>
                      <td>${he(tc.description)}</td>
                      <td><ul class="list-unstyled mb-0 small">${tc.steps.map(s=>`<li class="mb-1">▸ ${he(s)}</li>`).join('')}</ul></td>
                      <td><ul class="list-unstyled mb-0 small">${tc.expects.map(e=>`<li class="mb-1 text-success">✓ ${e}</li>`).join('')}</ul></td>
                    </tr>`;
      }
      h+=`</tbody></table></div></div></div></div>`;
    }
    return h;
  }

  const allCases=[...beCases,...feCases];
  const p1=allCases.filter(tc=>tc.priority==='P1').length;
  const p2=allCases.filter(tc=>tc.priority==='P2').length;
  const p3=allCases.filter(tc=>tc.priority==='P3').length;

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Test Report – HRM Gene</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f6fa; color: #2c3e50; }
  .header { background: #1e3a5f; color: #fff; padding: 1.5rem 0; margin-bottom: 1.5rem; border-bottom: 3px solid #2980b9; }
  .header h1 { font-size: 1.5rem; font-weight: 600; margin: 0; letter-spacing: -.5px; }
  .header .meta { font-size: .8rem; opacity: .7; margin-top: .25rem; }
  .card-stat { background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 1.25rem; }
  .card-stat .value { font-size: 2rem; font-weight: 700; color: #1e3a5f; }
  .card-stat .label { font-size: .8rem; color: #7f8c8d; text-transform: uppercase; letter-spacing: .5px; }
  .nav-tabs { border-bottom: 2px solid #dee2e6; }
  .nav-tabs .nav-link { border: none; color: #7f8c8d; font-weight: 500; padding: .6rem 1.5rem; font-size: .9rem; }
  .nav-tabs .nav-link.active { color: #1e3a5f; border-bottom: 2px solid #2980b9; background: transparent; }
  .nav-tabs .nav-link:hover:not(.active) { color: #2c3e50; }
  .accordion-button { font-size: .9rem; font-weight: 600; padding: .6rem 1rem; color: #2c3e50; }
  .accordion-button:not(.collapsed) { background: #eaf0f6; color: #1e3a5f; }
  .accordion-button:focus { box-shadow: none; border-color: #dee2e6; }
  .table { font-size: .82rem; }
  .table th { font-weight: 600; font-size: .75rem; text-transform: uppercase; letter-spacing: .5px; background: #f8f9fa; color: #495057; }
  footer { background: #fff; border-top: 1px solid #dee2e6; padding: 1rem 0; margin-top: 2rem; font-size: .8rem; color: #7f8c8d; text-align: center; }
  .distribution { display: flex; gap: 1rem; align-items: center; }
  .distribution .item { display: flex; align-items: center; gap: .3rem; font-size: .85rem; }
  .distribution .dot { width: 8px; height: 8px; border-radius: 2px; }
  .lcov-link { font-family: 'SF Mono', Consolas, monospace; font-size: .8rem; font-weight: 600; color: #0d6efd; text-decoration: none; }
  .lcov-link:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="header">
  <div class="container">
    <h1>Báo cáo Kiểm thử – HRM Gene</h1>
    <div class="meta">Full-Stack Test Report · Chuẩn IEEE-829 · ${new Date().toLocaleDateString('vi-VN',{year:'numeric',month:'long',day:'numeric'})}</div>
  </div>
</div>

<div class="container">
  <div class="row g-3 mb-4">
    <div class="col-md-3"><div class="card-stat"><div class="value">${tAll}</div><div class="label">Tổng Test Case</div></div></div>
    <div class="col-md-3"><div class="card-stat"><div class="value">${tBE}</div><div class="label">Backend (NestJS)</div></div></div>
    <div class="col-md-3"><div class="card-stat"><div class="value">${tFE}</div><div class="label">Frontend (Next.js)</div></div></div>
    <div class="col-md-3"><div class="card-stat">
      <div class="label mb-2">Phân bố ưu tiên</div>
      <div class="distribution">
        <div class="item"><span class="dot" style="background:#e74c3c"></span> P1: ${p1}</div>
        <div class="item"><span class="dot" style="background:#f39c12"></span> P2: ${p2}</div>
        <div class="item"><span class="dot" style="background:#95a5a6"></span> P3: ${p3}</div>
      </div>
    </div></div>
  </div>

  <ul class="nav nav-tabs mb-0" role="tablist">
    <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#be-panel">Backend <span class="badge bg-primary ms-1">${tBE}</span></button></li>
    <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#fe-panel">Frontend <span class="badge bg-success ms-1">${tFE}</span></button></li>
  </ul>

  <div class="tab-content bg-white border border-top-0 p-3" style="border-radius:0 0 6px 6px">
    <div class="tab-pane fade show active" id="be-panel">
      <h6 class="mb-3 text-muted">Backend Test Cases · ${Object.keys(beMods).length} modules · ${tBE} cases</h6>
      <div class="accordion" id="beAccordion">${accordion('be',beMods,'beAccordion')}</div>
    </div>
    <div class="tab-pane fade" id="fe-panel">
      <h6 class="mb-3 text-muted">Frontend Test Cases · ${Object.keys(feCats).length} nhóm · ${tFE} cases</h6>
      <div class="accordion" id="feAccordion">${accordion('fe',feCats,'feAccordion')}</div>
    </div>
  </div>
</div>
<footer><div class="container">HRM Gene Test Suite · NestJS + Jest · Next.js + React Testing Library · ${new Date().toISOString()}</div></footer>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body></html>`;
}

// =========== MAIN ===========
function walk(dir, ext) {
  const out=[];
  (function go(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const fp=path.join(d,e.name);if(e.isDirectory())go(fp);else if(e.isFile()&&e.name.endsWith(ext))out.push(fp);}})(dir);
  return out.sort();
}

// 1. Inject IDs
injectTestIds();

// 2. Re-read files to get cases for HTML
function readCases(files, isFE) {
  const all=[];
  for (const f of files) {
    try {
      const {lines, cases}=parseFile(f);
      for (const tc of cases) {
        const body=extractBody(lines, tc.lineIdx+1);
        tc.body=body.join('\n');
        tc.description=genDesc(tc.describe,tc.itText,tc.body);
        tc.priority=getPriority(tc.describe,tc.itText,tc.body);
        tc.category=getCategory(tc.describe,tc.itText,tc.body);
        tc.steps=extractSteps(body,isFE);
        tc.expects=extractExpects(body);
        tc.file=f;
        tc.lcovHref=buildLcovHref(f, isFE);
      }
      all.push(...cases);
    } catch(e) { console.error(`✗ ${f}: ${e.message}`); }
  }
  return all;
}

console.log('\n📖 Re-reading files for HTML report...');
const beCases=readCases(walk(BE_DIR,'.spec.ts'),false);
const feCases=readCases([...walk(FE_DIR,'.test.ts'),...walk(FE_DIR,'.test.tsx')],true);

console.log(`📊 ${beCases.length} BE + ${feCases.length} FE = ${beCases.length+feCases.length} total`);
console.log('📝 Generating HTML...');
const html=buildHtml(beCases,feCases);
fs.writeFileSync(OUT_HTML,html,'utf-8');
console.log(`✅ HTML: ${OUT_HTML} (${(fs.statSync(OUT_HTML).size/1024).toFixed(1)} KB)`);
console.log('\n🏁 Done! Test IDs injected into spec files + HTML report generated.');
