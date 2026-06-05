#!/bin/bash

# Thiết lập URL mặc định nếu chưa truyền vào
URL=${1:-"https://hrm.luo.io.vn"}

echo "🚀 BẮT ĐẦU CHIẾN DỊCH PERFORMANCE TESTING VÀO: $URL"
echo "------------------------------------------------------"

echo "1. Chạy Smoke Test..."
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6_report_smoke.html k6 run -e TEST_TYPE=smoke -e TARGET_URL=$URL tests/main-test.js
echo "⏳ Đang Cooldown 10 giây..."
sleep 10

echo "2. Chạy Load Test..."
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6_report_load.html k6 run -e TEST_TYPE=load -e TARGET_URL=$URL tests/main-test.js
echo "⏳ Đang Cooldown 30 giây để RAM xả rác..."
sleep 30

echo "3. Chạy Stress Test..."
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6_report_stress.html k6 run -e TEST_TYPE=stress -e TARGET_URL=$URL tests/main-test.js
echo "⏳ Đang Cooldown 30 giây để Database phục hồi Connection..."
sleep 30

echo "4. Chạy Soak Test..."
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=k6_report_soak.html k6 run -e TEST_TYPE=soak -e TARGET_URL=$URL tests/main-test.js

echo "✅ HOÀN TẤT CHIẾN DỊCH! (Đã tự động xuất 4 file báo cáo HTML)"