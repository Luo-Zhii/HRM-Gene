// run-k6.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os'); // Dùng để lấy UID/GID của user hiện tại

const TARGET_URL = 'https://hrm.luo.io.vn';
const TEST_TYPES = ['smoke', 'load', 'stress', 'soak'];

// Dùng __dirname: Dù bồ gọi lệnh ở thư mục gốc hay thư mục con, nó luôn lấy đúng thư mục chứa file js này
const scriptDir = __dirname;
const uid = os.userInfo().uid;
const gid = os.userInfo().gid;

console.log('🚀 BẮT ĐẦU CHUỖI PERFORMANCE TEST...');

for (const type of TEST_TYPES) {
    console.log('\n==================================================');
    console.log(`🔥 ĐANG CHẠY TEST: ${type.toUpperCase()}`);
    console.log('==================================================\n');

    // Thêm --user ${uid}:${gid} để ép K6 ghi file bằng quyền của user 'luozhi', tránh lỗi EACCES
    const dockerCmd = `docker run --rm --user ${uid}:${gid} -w /scripts -v "${scriptDir}:/scripts" -e TARGET_URL=${TARGET_URL} -e TEST_TYPE=${type} grafana/k6 run /scripts/tests/main-test.js`;

    try {
        execSync(dockerCmd, { stdio: 'inherit' });
    } catch (error) {
        console.log(`⚠️ K6 báo Threshold chệch chuẩn ở test ${type}, nhưng vẫn tiếp tục...`);
    }

    // Đổi tên file báo cáo
    const oldPath = path.join(scriptDir, 'summary_perf.html');
    const newPath = path.join(scriptDir, `k6_report_${type}.html`);

    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ Đã lưu kết quả: k6_report_${type}.html`);
    } else {
        console.log(`❌ Không tìm thấy file báo cáo cho test ${type}.`);
    }
}

// ---------------------------------------------------------
// TẠO DASHBOARD TỔNG HỢP
// ---------------------------------------------------------
console.log('\n📦 Đang tạo Dashboard tổng hợp...');

const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset='UTF-8'>
  <title>K6 Performance Dashboard</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f7f6; padding: 40px; display: flex; justify-content: center; }
    .container { width: 100%; max-width: 600px; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center; }
    h2 { color: #2c3e50; margin-bottom: 20px; }
    .btn { display: block; padding: 15px; margin: 12px 0; border-radius: 8px; text-decoration: none; color: white; font-size: 16px; font-weight: bold; transition: 0.2s; }
    .smoke { background: #2e7d32; } .smoke:hover { background: #1b5e20; }
    .load { background: #1565c0; } .load:hover { background: #0d47a1; }
    .stress { background: #ef6c00; } .stress:hover { background: #e65100; }
    .soak { background: #c2185b; } .soak:hover { background: #880e4f; }
  </style>
</head>
<body>
  <div class='container'>
    <h2>📊 Báo Cáo Hiệu Năng HRM-Gene</h2>
    <p style="color: #666; margin-bottom: 20px;">Click vào từng mục để xem chi tiết báo cáo HTML được sinh ra từ K6.</p>
    <a class='btn smoke' href='k6_report_smoke.html' target='_blank'>🟢 1. Smoke Test (Kiểm tra cơ bản)</a>
    <a class='btn load' href='k6_report_load.html' target='_blank'>🔵 2. Load Test (Mô phỏng thực tế)</a>
    <a class='btn stress' href='k6_report_stress.html' target='_blank'>🟠 3. Stress Test (Ép tải đỉnh điểm)</a>
    <a class='btn soak' href='k6_report_soak.html' target='_blank'>🔴 4. Soak Test (Độ bền thời gian dài)</a>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(scriptDir, 'k6_dashboard.html'), htmlContent);

console.log('==================================================');
console.log('🎉 HOÀN TẤT TOÀN BỘ QUÁ TRÌNH!');
console.log('👉 Mở file k6_dashboard.html để xem kết quả.');