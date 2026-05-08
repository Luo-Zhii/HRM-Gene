# HRM-DashStack: Master Business Test Cases (Vietnamese)

## 1. Summary
Tài liệu này chứa các kịch bản kiểm thử nghiệp vụ (business-readable) được dịch ngược từ các bài kiểm thử đơn vị kỹ thuật (unit tests) trên toàn bộ hệ thống HRM-DashStack.

---

### Module: Quản trị Hệ thống (System Administration)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Quản trị Hệ thống | Cài đặt Hệ thống | Thành công | Admin | ADMIN_01 | Hệ thống truy xuất chính xác tất cả các cài đặt hệ thống chung | Function | API / Controller Integration |
| Quản trị Hệ thống | Cài đặt Hệ thống | Thành công | Admin | ADMIN_02 | Hệ thống truy xuất một cài đặt hệ thống cụ thể dựa trên định danh (identifier) | Function | API / Controller Integration |
| Quản trị Hệ thống | Cài đặt Hệ thống | Thành công | Admin | ADMIN_03 | Hệ thống cập nhật thành công một cài đặt hệ thống cụ thể | Function | API / Controller Integration |
| Quản trị Hệ thống | Cài đặt Hệ thống | Thất bại | Admin | ADMIN_04 | Hệ thống xử lý mượt mà các yêu cầu cho những cài đặt không tồn tại | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Cài đặt Hệ thống | Thành công | Admin | ADMIN_05 | Hệ thống tạo cài đặt mới nếu nó chưa tồn tại trong quá trình cập nhật | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Cài đặt Hệ thống | Thành công | Admin | ADMIN_06 | Hệ thống cập nhật giá trị cài đặt hiện có một cách chính xác | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Tổ chức | Thành công | Admin | ADMIN_07 | Hệ thống truy xuất thành công số liệu thống kê tổng thể của tổ chức | Function | API / Controller Integration |
| Quản trị Hệ thống | Tổ chức | Thành công | Admin | ADMIN_08 | Hệ thống biên dịch và trả về dữ liệu thống kê tổ chức chính xác | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Phòng ban | Thành công | Admin | ADMIN_09 | Hệ thống truy xuất danh sách đầy đủ tất cả các phòng ban | Function | API / Controller Integration |
| Quản trị Hệ thống | Phòng ban | Thành công | Admin | ADMIN_10 | Hệ thống tạo thành công một bản ghi phòng ban mới | Function | API / Controller Integration |
| Quản trị Hệ thống | Phòng ban | Thành công | Admin | ADMIN_11 | Hệ thống xác thực dữ liệu đầu vào trong quá trình tạo phòng ban | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Phòng ban | Thành công | Admin | ADMIN_12 | Hệ thống cập nhật thành công một phòng ban hiện có | Function | API / Controller Integration |
| Quản trị Hệ thống | Phòng ban | Thất bại | Admin | ADMIN_13 | Hệ thống từ chối các thao tác cập nhật cho các phòng ban không tồn tại | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Phòng ban | Thành công | Admin | ADMIN_14 | Hệ thống gán thành công một quản lý hợp lệ cho một phòng ban | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Phòng ban | Thất bại | Admin | ADMIN_15 | Hệ thống ngăn chặn việc xóa một phòng ban vẫn còn nhân viên được gán | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Phòng ban | Thành công | Admin | ADMIN_16 | Hệ thống xóa thành công một phòng ban trống | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Vị trí công việc | Thành công | Admin | ADMIN_17 | Hệ thống truy xuất thành công tất cả các vị trí công việc | Function | API / Controller Integration |
| Quản trị Hệ thống | Vị trí công việc | Thành công | Admin | ADMIN_18 | Hệ thống tạo thành công một vị trí công việc mới | Function | API / Controller Integration |
| Quản trị Hệ thống | Quyền hạn | Thành công | Admin | ADMIN_19 | Hệ thống tạo ra một ma trận quyền hạn đầy đủ | Function | API / Controller Integration |
| Quản trị Hệ thống | Quyền hạn | Thành công | Admin | ADMIN_20 | Hệ thống gán một quyền cụ thể cho một vị trí công việc | Function | API / Controller Integration |
| Quản trị Hệ thống | Quyền hạn | Thất bại | Admin | ADMIN_21 | Hệ thống xử lý mượt mà việc gán một quyền đã tồn tại | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Quyền hạn | Thành công | Admin | ADMIN_22 | Hệ thống thu hồi thành công một quyền khỏi một vị trí công việc | Function | API / Controller Integration |
| Quản trị Hệ thống | Quyền hạn | Thất bại | Admin | ADMIN_23 | Hệ thống xử lý mượt mà việc thu hồi các quyền không tồn tại | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Thao tác Nhân viên | Thành công | Admin | ADMIN_24 | Hệ thống truy xuất danh sách toàn diện tất cả nhân viên cho chế độ xem quản trị | Function | API / Controller Integration |
| Quản trị Hệ thống | Thao tác Nhân viên | Thành công | Admin | ADMIN_25 | Hệ thống truy xuất thông tin cơ bản của nhân viên | Function | API / Controller Integration |
| Quản trị Hệ thống | Thao tác Nhân viên | Thành công | Admin | ADMIN_26 | Hệ thống chuyển đổi thành công một nhân viên sang phòng ban hoặc vị trí mới | Function | API / Controller Integration |
| Quản trị Hệ thống | Thao tác Nhân viên | Thành công | Admin | ADMIN_27 | Hệ thống xử lý chính xác logic chuyển đổi nhân viên trong hệ thống backend | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Khởi tạo Hệ thống | Thành công | Admin | ADMIN_28 | Hệ thống tạo thành công dữ liệu mẫu (seed demo data) mà không cần đối số rõ ràng | Function | API / Controller Integration |
| Quản trị Hệ thống | Khởi tạo Hệ thống | Thành công | Admin | ADMIN_29 | Hệ thống tạo thành công dữ liệu mẫu (seed demo data) với các đối số cụ thể | Function | API / Controller Integration |
| Quản trị Hệ thống | Khởi tạo Hệ thống | Thất bại | Admin | ADMIN_30 | Hệ thống ném ra lỗi khi cố gắng tạo dữ liệu mà không có bối cảnh nhân viên | Logic | Unit / Service Logic |
| Quản trị Hệ thống | Khởi tạo Hệ thống | Thành công | Admin | ADMIN_31 | Hệ thống thực thi thành công logic tạo dữ liệu nếu tìm thấy nhân viên | Logic | Unit / Service Logic |

### Module: Báo cáo & Phân tích (Reporting & Analytics)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Báo cáo & Phân tích | Dữ liệu Dashboard | Thành công | HR/Admin | ANALYTICS_01 | Hệ thống trả về dữ liệu dashboard đã biên dịch thông qua API endpoint | Function | API / Controller Integration |
| Báo cáo & Phân tích | Dữ liệu Dashboard | Thành công | System | ANALYTICS_02 | Hệ thống cấu trúc và định dạng dữ liệu phân tích dashboard chính xác | Logic | Unit / Service Logic |
| Báo cáo & Phân tích | Dữ liệu Dashboard | Ngoại lệ | System | ANALYTICS_03 | Hệ thống xử lý mượt mà tổng số bằng 0 để tránh lỗi chia cho 0 (NaN) | Logic | Edge Case Handling |

### Module: Truyền thông Nội bộ (Internal Communications)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Truyền thông Nội bộ | Thông báo | Thành công | HR/Admin | ANNOUNCE_01 | Hệ thống cho phép người dùng được ủy quyền tạo một thông báo mới | Function | API / Controller Integration |
| Truyền thông Nội bộ | Thông báo | Thành công | HR/Admin | ANNOUNCE_02 | Hệ thống trả về danh sách đầy đủ tất cả các thông báo | Function | API / Controller Integration |
| Truyền thông Nội bộ | Thông báo | Thành công | Employee | ANNOUNCE_03 | Hệ thống truy xuất bảng tin thông báo được cá nhân hóa cho người dùng hiện tại | Function | API / Controller Integration |
| Truyền thông Nội bộ | Thông báo | Thành công | HR/Admin | ANNOUNCE_04 | Hệ thống cho phép người dùng được ủy quyền xóa một thông báo | Function | API / Controller Integration |
| Truyền thông Nội bộ | Thông báo | Thành công | System | ANNOUNCE_05 | Hệ thống tạo thông báo mà không đẩy tin nhắn (push notification) nếu phương thức phân phối không phải là 'in_app' | Logic | Unit / Service Logic |
| Truyền thông Nội bộ | Thông báo | Thành công | System | ANNOUNCE_06 | Hệ thống phân phối thông báo thành công đến tất cả nhân viên nếu được yêu cầu trong quá trình tạo | Integration | Unit / Service Logic |
| Truyền thông Nội bộ | Thông báo | Thành công | System | ANNOUNCE_07 | Hệ thống nhắm mục tiêu và phân phối thông báo chính xác đến một phòng ban cụ thể | Integration | Unit / Service Logic |
| Truyền thông Nội bộ | Thông báo | Thành công | System | ANNOUNCE_08 | Hệ thống sắp xếp tất cả các thông báo được truy xuất theo ngày tạo theo thứ tự giảm dần | Logic | Unit / Service Logic |
| Truyền thông Nội bộ | Thông báo | Thành công | System | ANNOUNCE_09 | Hệ thống lọc chính xác bảng tin của người dùng dựa trên tiêu chí đối tượng mục tiêu của họ | Logic | Unit / Service Logic |
| Truyền thông Nội bộ | Thông báo | Dự phòng | System | ANNOUNCE_10 | Hệ thống mặc định đối tượng mục tiêu là 'NONE_DEPT' nếu người dùng không được gán phòng ban | Logic | Unit / Service Logic |
| Truyền thông Nội bộ | Thông báo | Thành công | System | ANNOUNCE_11 | Hệ thống xử lý thành công việc xóa một thông báo theo ID | Logic | Unit / Service Logic |

### Module: Xác thực & Phân quyền (Authentication & Authorization)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Xác thực | Đăng nhập | Thất bại | Guest | AUTH_01 | Hệ thống từ chối đăng nhập và trả về lỗi cho thông tin xác thực không hợp lệ | Security | API / Controller Integration |
| Xác thực | Đăng nhập | Thành công | Guest | AUTH_02 | Hệ thống xác thực người dùng thành công, trả về token và thiết lập cookie bảo mật | Security | API / Controller Integration |
| Xác thực | Đăng xuất | Thành công | Employee | AUTH_03 | Hệ thống xử lý đăng xuất bằng cách xóa cookie phiên và trả về phản hồi thành công | Security | API / Controller Integration |
| Xác thực | Truy cập Hồ sơ | Thất bại | Guest | AUTH_04 | Hệ thống từ chối truy cập hồ sơ và trả về null nếu không cung cấp ID người dùng hợp lệ | Security | API / Controller Integration |
| Xác thực | Truy cập Hồ sơ | Thành công | Employee | AUTH_05 | Hệ thống truy xuất thành công chi tiết hồ sơ của người dùng đã xác thực | Function | API / Controller Integration |
| Xác thực | Cập nhật Hồ sơ | Thành công | Employee | AUTH_06 | Hệ thống gọi luồng cập nhật thành công với dữ liệu thông tin liên hệ chính xác | Function | API / Controller Integration |
| Xác thực | Tải lên Avatar | Thất bại | Employee | AUTH_07 | Hệ thống từ chối tải lên ảnh đại diện với lỗi Bad Request nếu không có file dữ liệu được cung cấp | Function | API / Controller Integration |
| Xác thực | Tải lên Avatar | Thành công | Employee | AUTH_08 | Hệ thống cập nhật thành công URL ảnh đại diện và trả về kết quả đã tải lên | Function | API / Controller Integration |
| Phân quyền | Menu Điều hướng | Thất bại | Guest | AUTH_09 | Hệ thống trả về cấu trúc điều hướng trống nếu người dùng chưa được xác thực | Logic | API / Controller Integration |
| Phân quyền | Menu Điều hướng | Thành công | Employee | AUTH_10 | Hệ thống hạn chế các mục điều hướng chỉ ở 'main' và ẩn menu 'admin' đối với người dùng không phải quản trị viên | Security | API / Controller Integration |
| Phân quyền | Menu Điều hướng | Thành công | Admin | AUTH_11 | Hệ thống cấp quyền truy cập vào cả mục điều hướng 'main' và 'admin' cho quản trị viên | Security | API / Controller Integration |
| Xác thực | Đăng ký Admin | Thất bại | Guest | AUTH_12 | Hệ thống từ chối đăng ký quản trị viên với lỗi Bad Request nếu thiếu các trường bắt buộc | Function | API / Controller Integration |
| Xác thực | Đăng ký Admin | Thành công | Guest | AUTH_13 | Hệ thống xử lý đăng ký quản trị viên và gọi dịch vụ tạo chính xác khi thành công | Function | API / Controller Integration |
| Phân quyền | Lấy Quyền hạn | Ngoại lệ | System | AUTH_14 | Hệ thống trả về mảng quyền trống nếu người dùng không có ID vị trí được chỉ định | Logic | Unit / Service Logic |
| Phân quyền | Lấy Quyền hạn | Ngoại lệ | System | AUTH_15 | Hệ thống trả về mảng trống nếu không có quyền hạn cụ thể nào được liên kết với vị trí của người dùng | Logic | Unit / Service Logic |
| Phân quyền | Lấy Quyền hạn | Thành công | System | AUTH_16 | Hệ thống biên dịch và trả về danh sách tên quyền thành công cho người dùng | Logic | Unit / Service Logic |
| Xác thực | Cập nhật Liên hệ | Thất bại | System | AUTH_17 | Hệ thống ném ra ngoại lệ Not Found nếu nhân viên mục tiêu để cập nhật không tồn tại | Logic | Unit / Service Logic |
| Xác thực | Cập nhật Liên hệ | Thành công | System | AUTH_18 | Hệ thống cập nhật và lưu trữ thành công thông tin cơ bản và cài đặt của nhân viên | Logic | Unit / Service Logic |
| Xác thực | Cập nhật Liên hệ | Thành công | System | AUTH_19 | Hệ thống cập nhật thông tin ngân hàng chính xác nếu đã tìm thấy bản ghi ngân hàng hiện có | Logic | Unit / Service Logic |
| Xác thực | Cập nhật Liên hệ | Thành công | System | AUTH_20 | Hệ thống tạo thông tin ngân hàng mới chính xác nếu chưa có bản ghi ngân hàng nào tồn tại trước đó | Logic | Unit / Service Logic |
| Xác thực | Cập nhật Avatar | Thất bại | System | AUTH_21 | Hệ thống ném ra ngoại lệ Not Found nếu thiếu nhân viên mục tiêu để cập nhật ảnh đại diện | Logic | Unit / Service Logic |
| Xác thực | Cập nhật Avatar | Thành công | System | AUTH_22 | Hệ thống lưu trữ thành công URL ảnh đại diện mới cho nhân viên | Logic | Unit / Service Logic |
| Xác thực | Xác thực Người dùng | Thất bại | System | AUTH_23 | Hệ thống trả về null trong quá trình xác thực nếu tài khoản người dùng không thể được định vị | Security | Unit / Service Logic |
| Xác thực | Xác thực Người dùng | Thất bại | System | AUTH_24 | Hệ thống trả về null trong quá trình xác thực nếu mật khẩu cung cấp không khớp với mã băm (hash) | Security | Unit / Service Logic |
| Xác thực | Xác thực Người dùng | Thất bại | System | AUTH_25 | Hệ thống từ chối truy cập và ném ngoại lệ Unauthorized nếu nhân viên bị chấm dứt hợp đồng quá ngày nghỉ việc | Security | Unit / Service Logic |
| Xác thực | Xác thực Người dùng | Thành công | System | AUTH_26 | Hệ thống xác thực người dùng thành công, bỏ qua mật khẩu từ đối tượng trả về và đính kèm các quyền | Security | Unit / Service Logic |
| Xác thực | Truy xuất Hồ sơ | Thất bại | System | AUTH_27 | Hệ thống ném ra ngoại lệ Not Found khi truy xuất hồ sơ cho người dùng không tồn tại | Logic | Unit / Service Logic |
| Xác thực | Truy xuất Hồ sơ | Thành công | System | AUTH_28 | Hệ thống trả về chi tiết hồ sơ người dùng một cách an toàn (bỏ qua mật khẩu) bao gồm các quyền tổng hợp | Security | Unit / Service Logic |
| Xác thực | Tạo Token | Thành công | System | AUTH_29 | Hệ thống mã hóa và trả về payload token truy cập thành công khi đăng nhập hợp lệ | Security | Unit / Service Logic |
| Xác thực | Đăng ký Admin | Thất bại | System | AUTH_30 | Hệ thống ném ra ngoại lệ Unauthorized nếu bí mật đăng ký không chính xác được cung cấp | Security | Unit / Service Logic |
| Xác thực | Đăng ký Admin | Thất bại | System | AUTH_31 | Hệ thống từ chối đăng ký quản trị viên với lỗi Bad Request nếu email đã được sử dụng | Logic | Unit / Service Logic |
| Xác thực | Đăng ký Admin | Thất bại | System | AUTH_32 | Hệ thống từ chối đăng ký quản trị viên nếu vị trí được chỉ định không hợp lệ hoặc không tìm thấy | Logic | Unit / Service Logic |
| Xác thực | Đăng ký Admin | Thất bại | System | AUTH_33 | Hệ thống từ chối đăng ký quản trị viên nếu phòng ban được chỉ định không hợp lệ hoặc không tìm thấy | Logic | Unit / Service Logic |
| Xác thực | Đăng ký Admin | Thành công | System | AUTH_34 | Hệ thống băm mật khẩu, tạo tài khoản và lưu người dùng quản trị viên mới thành công | Security | Unit / Service Logic |

### Module: Bình luận & Cộng tác (Comments & Collaboration)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Cộng tác | Bình luận | Thành công | Employee | COMMENT_01 | Hệ thống trích xuất thành công ID tác giả từ token bảo mật và định tuyến tạo bình luận | Function | API / Controller Integration |
| Cộng tác | Bình luận | Thành công | Employee | COMMENT_02 | Hệ thống truy xuất tất cả bình luận liên kết với một thực thể cụ thể (VD: Yêu cầu Nghỉ phép) | Function | API / Controller Integration |
| Cộng tác | Bình luận | Thành công | System | COMMENT_03 | Hệ thống đăng thành công bình luận của nhân viên trên Yêu cầu Nghỉ phép và đẩy thông báo cho admin | Integration | Unit / Service Logic |
| Cộng tác | Bình luận | Thành công | System | COMMENT_04 | Hệ thống đăng thành công bình luận của admin trên Đơn xin thôi việc và đẩy thông báo cho nhân viên | Integration | Unit / Service Logic |
| Cộng tác | Bình luận | Ngoại lệ | System | COMMENT_05 | Hệ thống tạo bình luận thành công và xử lý các lỗi thông báo một cách âm thầm mà không làm gián đoạn luồng | Logic | Unit / Service Logic |
| Cộng tác | Bình luận | Thành công | System | COMMENT_06 | Hệ thống tổng hợp và sắp xếp bình luận chính xác theo loại thực thể và ID thực thể | Logic | Unit / Service Logic |
| Cộng tác | Bình luận | Thành công | System | COMMENT_07 | Hệ thống truy xuất thành công một bình luận biệt lập nếu tìm thấy | Logic | Unit / Service Logic |
| Cộng tác | Bình luận | Thất bại | System | COMMENT_08 | Hệ thống ném ra ngoại lệ Not Found khi truy vấn một bình luận không tồn tại | Logic | Unit / Service Logic |

### Module: Hồ sơ Công ty (Company Profile)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Core HR | Hồ sơ Công ty | Thành công | Admin | COMP_01 | Hệ thống trả về thành công hồ sơ công ty đang hoạt động | Function | API / Controller Integration |
| Core HR | Hồ sơ Công ty | Thành công | Admin | COMP_02 | Hệ thống tải chính xác hồ sơ công ty hiện tại và xử lý dữ liệu cập nhật | Function | API / Controller Integration |
| Core HR | Hồ sơ Công ty | Thất bại | Admin | COMP_03 | Hệ thống ném ra ngoại lệ Bad Request nếu tệp logo bị thiếu trong quá trình tải lên | Function | API / Controller Integration |
| Core HR | Hồ sơ Công ty | Thành công | Admin | COMP_04 | Hệ thống nhận thành công tệp và cập nhật URL logo của hồ sơ | Function | API / Controller Integration |
| Core HR | Hồ sơ Công ty | Thành công | System | COMP_05 | Hệ thống truy xuất dữ liệu hồ sơ công ty hiện có trực tiếp | Logic | Unit / Service Logic |
| Core HR | Hồ sơ Công ty | Dự phòng | System | COMP_06 | Hệ thống tạo và trả về schema hồ sơ mặc định nếu không có cấu hình nào tồn tại khi truy xuất | Logic | Unit / Service Logic |
| Core HR | Hồ sơ Công ty | Thành công | System | COMP_07 | Hệ thống ghi nhận các bản cập nhật hồ sơ thành công và tìm nạp lại hồ sơ đang hoạt động để xác nhận | Logic | Unit / Service Logic |
| Core HR | Hồ sơ Công ty | Thành công | System | COMP_08 | Hệ thống giới hạn việc cập nhật rõ ràng ở URL logo khi xử lý các thay đổi logo và trả về hồ sơ đã sửa đổi | Logic | Unit / Service Logic |

### Module: Quản lý Nhân sự / Hợp đồng Nhân viên (Employee Contracts)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Quản lý Nhân sự | Tạo Hợp đồng | Thành công | HR/Admin | CONT_01 | Hệ thống xử lý dữ liệu đầu vào và định tuyến chúng một cách chính xác để tạo hợp đồng mới | Function | API / Controller Integration |
| Quản lý Nhân sự | Xem Hợp đồng | Thành công | HR/Admin | CONT_02 | Hệ thống cấp cho quản trị viên toàn quyền truy cập để xem tất cả hợp đồng và áp dụng các bộ lọc mục tiêu cụ thể | Security | API / Controller Integration |
| Quản lý Nhân sự | Xem Hợp đồng | Thành công | Employee | CONT_03 | Hệ thống hạn chế nghiêm ngặt người dùng không có đặc quyền chỉ được xem dữ liệu hợp đồng cá nhân của họ | Security | API / Controller Integration |
| Quản lý Nhân sự | Xem Hợp đồng | Thất bại | Employee | CONT_04 | Hệ thống ném ngoại lệ và chặn nỗ lực trái phép của người dùng tiêu chuẩn để xem hợp đồng của người khác | Security | API / Controller Integration |
| Quản lý Nhân sự | Xem Hợp đồng | Thành công | Employee | CONT_05 | Hệ thống cho phép nhân viên xem thành công dữ liệu hợp đồng liên quan của chính họ | Security | API / Controller Integration |
| Quản lý Nhân sự | Xem Hợp đồng | Thành công | Admin | CONT_06 | Hệ thống cấp đặc quyền tối đa cho nhân sự HR/Admin để lấy mảng dữ liệu hợp đồng của nhân viên khác | Security | API / Controller Integration |
| Quản lý Nhân sự | Lấy Hợp đồng | Thành công | Employee | CONT_07 | Hệ thống giới hạn rõ ràng việc tìm nạp một hợp đồng duy nhất để đảm bảo nó khớp với ID biệt lập của người dùng | Security | API / Controller Integration |
| Quản lý Nhân sự | Cập nhật Hợp đồng | Thành công | HR/Admin | CONT_08 | Hệ thống ánh xạ thành công các bản cập nhật một phần đồng nhất xuống dịch vụ thực thi | Function | API / Controller Integration |
| Quản lý Nhân sự | Cập nhật Hợp đồng | Thành công | HR/Admin | CONT_09 | Hệ thống đảm bảo các thao tác PUT chia sẻ và thực thi hiệu quả cùng một hành vi cập nhật cốt lõi | Function | API / Controller Integration |
| Quản lý Nhân sự | Xóa Hợp đồng | Thành công | HR/Admin | CONT_10 | Hệ thống xử lý thành công các yêu cầu xóa hợp đồng đến ranh giới kho lưu trữ | Function | API / Controller Integration |
| Quản lý Nhân sự | Xử lý Hợp đồng | Thất bại | System | CONT_11 | Hệ thống ném ngoại lệ Not Found rõ ràng nếu cố gắng liên kết hợp đồng với một nhân viên bị thiếu | Logic | Unit / Service Logic |
| Quản lý Nhân sự | Xử lý Hợp đồng | Thất bại | System | CONT_12 | Hệ thống ném ngoại lệ Bad Request nếu phát hiện sự chồng chéo chuỗi hợp đồng được nhắm mục tiêu | Logic | Unit / Service Logic |
| Quản lý Nhân sự | Xử lý Hợp đồng | Thành công | System | CONT_13 | Hệ thống tạo hợp đồng, tự động hủy kích hoạt các trạng thái chồng chéo và ghi lại các thay đổi lương sau đó | Integration | Unit / Service Logic |
| Quản lý Nhân sự | Lấy Hợp đồng | Thành công | System | CONT_14 | Hệ thống cấu hình phân trang một cách động kết hợp với các giới hạn truy vấn có điều kiện cho danh sách hợp đồng | Logic | Unit / Service Logic |
| Quản lý Nhân sự | Lấy Hợp đồng | Thành công | System | CONT_15 | Hệ thống cách ly, xác định vị trí và sắp xếp nghiêm ngặt danh sách hợp đồng gắn liền với một cá nhân nhân viên | Logic | Unit / Service Logic |
| Quản lý Nhân sự | Lấy Hợp đồng | Thất bại | System | CONT_16 | Hệ thống bắt lỗi từ chối nội bộ và các lỗi khác khi không tìm thấy bản ghi hợp đồng khớp | Logic | Unit / Service Logic |
| Quản lý Nhân sự | Lấy Hợp đồng | Thành công | System | CONT_17 | Hệ thống trả về chính xác một hợp đồng duy nhất tuân thủ nghiêm ngặt các ràng buộc truy vấn | Logic | Unit / Service Logic |
| Quản lý Nhân sự | Cập nhật Hợp đồng | Thành công | System | CONT_18 | Hệ thống cập nhật thông số, tự động hết hạn các cấu hình lỗi thời và ngầm tính toán chênh lệch lương | Logic | Unit / Service Logic |
| Quản lý Nhân sự | Xóa Hợp đồng | Thành công | System | CONT_19 | Hệ thống nối các giới hạn xóa chính xác để đảm bảo loại bỏ sạch sẽ mà không vô tình giữ lại dữ liệu | Logic | Unit / Service Logic |

### Module: Đãi ngộ & Lịch sử Lương (Compensation & Salary History)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Đãi ngộ | Xem Lịch sử Lương | Thành công | HR/Admin | SALHIS_01 | Hệ thống cho phép quản trị viên đánh giá tất cả các bộ lọc mục tiêu khi lấy lịch sử lương toàn cầu | Security | API / Controller Integration |
| Đãi ngộ | Xem Lịch sử Lương | Thành công | Employee | SALHIS_02 | Hệ thống cách ly nghiêm ngặt người dùng tiêu chuẩn, hạn chế các truy vấn lịch sử lương độc quyền cho phân đoạn thuộc sở hữu của họ | Security | API / Controller Integration |
| Đãi ngộ | Lấy Lịch sử Lương | Thành công | System | SALHIS_03 | Hệ thống thực thi ẩn truy vấn chính xác, trả về các giới hạn hoạt động khớp hoàn hảo cho các tra cứu riêng lẻ | Logic | API / Controller Integration |
| Đãi ngộ | Lấy Lịch sử Lương | Thất bại | System | SALHIS_04 | Hệ thống chuyển tiếp các ngoại lệ động khi một bản ghi lịch sử lương được truy vấn không thể ánh xạ | Logic | API / Controller Integration |

### Module: Chấm công & Quản lý Nghỉ phép (Time & Attendance / Leave Management)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Chấm công | Loại Nghỉ phép | Thành công | All | LEAVE_01 | Hệ thống truy xuất và trả về bộ sưu tập chung của các loại nghỉ phép có sẵn một cách logic | Function | API / Controller Integration |
| Chấm công | Số dư Nghỉ phép | Thành công | Employee | LEAVE_02 | Hệ thống định tuyến nhất quán các ranh giới ủy quyền, ánh xạ động các danh tính để kiểm tra số dư | Security | API / Controller Integration |
| Chấm công | Yêu cầu Nghỉ phép | Thành công | Employee | LEAVE_03 | Hệ thống giới hạn rõ ràng việc thực thi dữ liệu yêu cầu, đảm bảo nhân viên chỉ xem các yêu cầu của riêng họ | Security | API / Controller Integration |
| Chấm công | Gửi Yêu cầu | Thành công | Employee | LEAVE_04 | Hệ thống ánh xạ các yêu cầu gửi, kết nối các ràng buộc bên trong và cô lập bối cảnh một cách hiệu quả | Function | API / Controller Integration |
| Chấm công | Yêu cầu Đang chờ | Thành công | Manager | LEAVE_05 | Hệ thống xử lý các chuỗi tìm nạp một cách chính xác, xác minh chính xác đặc quyền của quản lý để xem các yêu cầu đang chờ xử lý | Security | API / Controller Integration |
| Chấm công | Duyệt Nghỉ phép | Thành công | Admin/Manager | LEAVE_06 | Hệ thống điều phối an toàn các phê duyệt nghỉ phép, áp dụng các cập nhật cấu trúc có điều kiện cho các can thiệp của admin | Function | API / Controller Integration |
| Chấm công | Xử lý Nghỉ phép | Thành công | System | LEAVE_07 | Hệ thống giảm các loại nghỉ phép trùng lặp, đảm bảo một tập hợp cấu hình duy nhất toàn cầu được trả về | Logic | Unit / Service Logic |
| Chấm công | Số dư Nghỉ phép | Thành công | System | LEAVE_08 | Hệ thống tổng hợp chính xác số dư người dùng lồng nhau đồng thời loại bỏ sạch sẽ các trùng lặp hoạt động | Logic | Unit / Service Logic |
| Chấm công | Yêu cầu Nghỉ phép | Thành công | System | LEAVE_09 | Hệ thống phân tích cú pháp chính xác các nhận xét của quản lý/admin trong các yêu cầu và đảm bảo cấu hình phản hồi phù hợp | Logic | Unit / Service Logic |
| Chấm công | Gửi Yêu cầu | Thất bại | System | LEAVE_10 | Hệ thống cố tình buộc xảy ra lỗi để bảo vệ tính toàn vẹn của cơ sở dữ liệu nếu không thể tìm thấy cấu hình được nhắm mục tiêu | Logic | Unit / Service Logic |
| Chấm công | Gửi Yêu cầu | Thành công | System | LEAVE_11 | Hệ thống tính toán động các mối quan hệ, ghi lại các ràng buộc yêu cầu và kích hoạt thông báo đẩy tự động | Integration | Unit / Service Logic |
| Chấm công | Duyệt Nghỉ phép | Security | System | LEAVE_12 | Hệ thống khóa tĩnh các cập nhật giới hạn để bảo vệ mạnh mẽ các hành động phê duyệt khỏi những thay đổi trái phép | Security | Unit / Service Logic |
| Chấm công | Duyệt Nghỉ phép | Thành công | System | LEAVE_13 | Hệ thống chủ động khấu trừ hạn mức đã tiêu thụ khỏi số dư, liên kết vĩnh viễn các hành động của quản lý vào lịch sử | Logic | Unit / Service Logic |
| Chấm công | Duyệt Nghỉ phép | Ngoại lệ | System | LEAVE_14 | Hệ thống chủ động chặn tràn toán học khi xử lý các giới hạn, thiết lập lại các giới hạn một cách an toàn cho phù hợp | Logic | Unit / Service Logic |


### Module: Thông báo (Notifications)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Thông báo | Truy xuất Thông báo | Thành công | Employee | NOTIF_01 | Hệ thống truy xuất thành công danh sách thông báo phân trang của người dùng | Function | API / Controller Integration |
| Thông báo | Đánh dấu đã đọc | Thành công | Employee | NOTIF_02 | Hệ thống xử lý thành công các yêu cầu đánh dấu các thông báo cụ thể là đã đọc | Function | API / Controller Integration |
| Thông báo | Kết nối Thời gian thực | Thành công | Employee | NOTIF_03 | Hệ thống thiết lập an toàn kết nối WebSocket và đăng ký phiên người dùng | Logic | WebSocket / Gateway |
| Thông báo | Kết nối Thời gian thực | Ngoại lệ | Employee | NOTIF_04 | Hệ thống xử lý mượt mà nhiều phiên bản kết nối cho cùng một người dùng | Logic | WebSocket / Gateway |
| Thông báo | Ngắt kết nối Thời gian thực | Thành công | Employee | NOTIF_05 | Hệ thống dọn dẹp chính xác phiên WebSocket khi người dùng ngắt kết nối | Logic | WebSocket / Gateway |
| Thông báo | Phân phối Đẩy | Thành công | System | NOTIF_06 | Hệ thống đẩy đáng tin cậy các sự kiện thông báo theo thời gian thực đến người dùng đang kết nối | Integration | WebSocket / Gateway |
| Thông báo | Tạo Thông báo | Thành công | System | NOTIF_07 | Hệ thống định dạng và chèn chính xác một bản ghi thông báo mới vào cơ sở dữ liệu | Logic | Unit / Service Logic |
| Thông báo | Tạo Thông báo | Ngoại lệ | System | NOTIF_08 | Hệ thống xếp hàng thành công hoặc thử gửi lại nếu thông báo chính thất bại | Logic | Unit / Service Logic |
| Thông báo | Phát sóng | Thành công | Admin | NOTIF_09 | Hệ thống phát sóng thành công các thông báo đến tất cả các nhân viên được nhắm mục tiêu một cách liền mạch | Integration | Unit / Service Logic |
| Thông báo | Xóa Thông báo | Thành công | Employee | NOTIF_10 | Hệ thống xóa chính xác một thông báo khỏi hộp thư đến của người dùng | Logic | Unit / Service Logic |

### Module: Đãi ngộ / Lương thưởng (Compensation / Payroll)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Đãi ngộ | Tạo Lương | Thành công | HR/Admin | PAYROLL_01 | Hệ thống thực thi thành công việc tạo lương hàng loạt cho kỳ được chỉ định | Function | API / Controller Integration |
| Đãi ngộ | Tạo Lương | Thất bại | HR/Admin | PAYROLL_02 | Hệ thống chặn việc tạo lương một cách chính xác nếu thiếu các giới hạn kỳ được chỉ định | Function | API / Controller Integration |
| Đãi ngộ | Phiếu lương Đơn lẻ | Thành công | HR/Admin | PAYROLL_03 | Hệ thống tạo thành công một phiếu lương riêng biệt cho một nhân viên được chỉ định | Function | API / Controller Integration |
| Đãi ngộ | Xem Phiếu lương | Thành công | Employee | PAYROLL_04 | Hệ thống xác thực người dùng và liệt kê thành công các phiếu lương lịch sử của họ | Security | API / Controller Integration |
| Đãi ngộ | Cấu hình Lương | Ngoại lệ | Admin | PAYROLL_05 | Hệ thống xác thực và từ chối rõ ràng các giới hạn âm hoặc cấu hình phi logic | Function | API / Controller Integration |
| Đãi ngộ | Cấu hình Lương | Thất bại | Admin | PAYROLL_06 | Hệ thống thực thi xác thực đầu vào nghiêm ngặt, chặn các yêu cầu có thông số lương trống hoặc rỗng | Function | API / Controller Integration |
| Đãi ngộ | Điều chỉnh | Thành công | HR/Admin | PAYROLL_07 | Hệ thống ánh xạ chính xác các điều chỉnh cấu trúc (thưởng, phạt) vào phiếu lương mục tiêu | Function | API / Controller Integration |
| Đãi ngộ | Phiếu lương Đơn lẻ | Thất bại | System | PAYROLL_08 | Hệ thống cô lập cấu trúc và báo cáo chính xác các ngoại lệ khi tạo phiếu lương đơn lẻ | Logic | Unit / Service Logic |
| Đãi ngộ | Phê duyệt Phiếu lương | Thành công | Admin | PAYROLL_09 | Hệ thống tuần tự phê duyệt phiếu lương và tạo thông báo thanh toán một cách liền mạch | Integration | Unit / Service Logic |
| Đãi ngộ | Phê duyệt Hàng loạt | Thất bại | Admin | PAYROLL_10 | Hệ thống tự động hoàn tác các phê duyệt hàng loạt nếu các phụ thuộc cấu trúc không được đáp ứng | Logic | Unit / Service Logic |
| Đãi ngộ | Xử lý Lương | Thành công | System | PAYROLL_11 | Hệ thống ngầm áp dụng các điều chỉnh cấu trúc logic một cách chính xác khi hoàn tất phiếu lương | Logic | Unit / Service Logic |
| Tiện ích | Số sang Chữ | Thành công | System | PAYROLL_12 | Hệ thống dịch toán học và chính xác các con số lương cuối cùng thành dạng văn bản tiếng Việt | Logic | Unit / Service Logic |

### Module: Quản lý Tổ chức / Vị trí (Organization Management / Positions)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Tổ chức | Xem Vị trí | Thành công | Admin | POS_01 | Hệ thống liệt kê chính xác tất cả các vị trí công việc bao gồm dữ liệu phân cấp quan hệ | Function | API / Controller Integration |
| Tổ chức | Tạo Vị trí | Thành công | Admin | POS_02 | Hệ thống xác thực các giới hạn và lưu vị trí mới một cách liền mạch | Logic | Unit / Service Logic |
| Tổ chức | Cập nhật Vị trí | Thành công | Admin | POS_03 | Hệ thống hợp nhất hoàn hảo các bản cập nhật vào một vị trí hiện có mà không làm hỏng các liên kết quan hệ | Logic | Unit / Service Logic |
| Tổ chức | Xóa Vị trí | Thất bại | Admin | POS_04 | Hệ thống ngăn chặn thông minh việc xóa một vị trí nếu nhân viên hiện đang được phân công vào đó | Security | Unit / Service Logic |
| Tổ chức | Xóa Vị trí | Thành công | Admin | POS_05 | Hệ thống xóa an toàn một vị trí sau khi tất cả các phụ thuộc được giải quyết rõ ràng | Logic | Unit / Service Logic |

### Module: Báo cáo & Phân tích (Reporting & Analytics)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Báo cáo | Tổng hợp Lương | Thành công | Admin | REP_01 | Hệ thống xử lý thành công các thông số và tạo báo cáo tổng hợp lương | Function | API / Controller Integration |
| Báo cáo | Tổng hợp Lương | Ngoại lệ | Admin | REP_02 | Hệ thống triển khai các giá trị mặc định chính xác khi truy vấn các thông số báo cáo không đầy đủ | Function | API / Controller Integration |
| Báo cáo | Bảng điều khiển Tổng quan | Thành công | Admin | REP_03 | Hệ thống tổng hợp liền mạch dữ liệu minh bạch trên nhiều module cho bảng điều khiển điều hành | Function | API / Controller Integration |
| Báo cáo | Tổng hợp Lương | Ngoại lệ | System | REP_04 | Hệ thống mang lại một tập hợp giá trị 0 một cách thông minh nếu tổng lương trả về là null để duy trì tính toàn vẹn cấu trúc | Logic | Unit / Service Logic |
| Báo cáo | Tổng hợp Dữ liệu | Thành công | System | REP_05 | Hệ thống xử lý đáng tin cậy các truy vấn báo cáo thô thành các số liệu kinh doanh có cấu trúc | Logic | Unit / Service Logic |

### Module: Quản lý Nhân sự / Offboarding (Resignations)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Offboarding | Gửi Đơn xin thôi việc | Thất bại | Employee | RESIGN_01 | Hệ thống tự động chặn và từ chối chính xác các đơn xin thôi việc bị trùng lặp | Security | API / Controller Integration |
| Offboarding | Gửi Đơn xin thôi việc | Thành công | Employee | RESIGN_02 | Hệ thống ghi nhận đúng đơn xin thôi việc và tạo các mục quy trình làm việc đang chờ xử lý | Function | API / Controller Integration |
| Offboarding | Xem Yêu cầu | Thành công | Admin | RESIGN_03 | Hệ thống lấy danh sách đơn xin thôi việc toàn diện để ban quản trị xem xét một cách an toàn | Function | API / Controller Integration |
| Offboarding | Cập nhật Trạng thái | Thành công | Admin | RESIGN_04 | Hệ thống xử lý an toàn các cập nhật phê duyệt hoặc từ chối cho các yêu cầu xin thôi việc đang chờ xử lý | Function | API / Controller Integration |
| Offboarding | Logic Yêu cầu | Thành công | System | RESIGN_05 | Hệ thống lần lượt kích hoạt thông báo cho HR và Quản lý khi đơn xin thôi việc được tạo | Integration | Unit / Service Logic |
| Offboarding | Logic Cô lập | Thành công | System | RESIGN_06 | Hệ thống truy vấn và cô lập rõ ràng các yêu cầu cá nhân của nhân viên khỏi ranh giới toàn cầu | Logic | Unit / Service Logic |
| Offboarding | Giới hạn Xác thực | Ngoại lệ | System | RESIGN_07 | Hệ thống thực thi các giới hạn xác thực nghiêm ngặt để đảm bảo các trạng thái thôi việc chuyển đổi logic | Logic | Unit / Service Logic |
| Offboarding | Tự động hóa Offboarding | Thành công | System | RESIGN_08 | Hệ thống thực thi hoàn hảo các tập lệnh offboarding nền (xóa quyền truy cập) khi quá trình thôi việc hoàn tất | Integration | Unit / Service Logic |

### Module: Chấm công (Time & Attendance)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Chấm công | Chấm công Toàn cầu | Thành công | Admin | TIME_01 | Hệ thống truy xuất hiệu quả dữ liệu chấm công tổ chức minh bạch trải dài trên nhiều ranh giới | Function | API / Controller Integration |
| Chấm công | Tạo mã QR | Thành công | Admin | TIME_02 | Hệ thống tạo rõ ràng các mã QR động, nhạy cảm với thời gian để điểm danh | Function | API / Controller Integration |
| Chấm công | Check-In qua IP | Ngoại lệ | Employee | TIME_03 | Hệ thống xác thực liền mạch các giới hạn phạm vi IP trước khi chấp nhận Check-in | Security | API / Controller Integration |
| Chấm công | Check-In qua QR | Thất bại | Employee | TIME_04 | Hệ thống từ chối một cách thông minh các lần Check-in bằng mã QR đã hết hạn hoặc không hợp lệ | Security | API / Controller Integration |
| Chấm công | Check-In qua QR | Thành công | Employee | TIME_05 | Hệ thống nắm bắt và ghi lại chính xác các lần Check-in bằng QR thành công vào bản ghi của nhân viên | Function | API / Controller Integration |
| Chấm công | Logic Chấm công | Thành công | System | TIME_06 | Hệ thống xử lý toán học các dấu thời gian để phân bổ chính xác các trạng thái "đi trễ" hoặc "đúng giờ" | Logic | Unit / Service Logic |
| Chấm công | Logic Bảo mật | Thành công | System | TIME_07 | Hệ thống ngăn chặn các mục Check-in đồng thời hoặc trùng lặp nhanh một cách hiệu quả | Logic | Unit / Service Logic |

### Module: Quản lý Kỷ luật (Disciplinary Management)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Kỷ luật | Tạo Vi phạm | Thành công | Admin/Manager | VIOLATION_01 | Hệ thống nhận dữ liệu đầu vào và đăng ký thành công một vi phạm kỷ luật cho một nhân viên | Function | API / Controller Integration |
| Kỷ luật | Đồng bộ Chấm công | Thành công | System | VIOLATION_02 | Hệ thống thực thi tích hợp đồng bộ thứ cấp một cách hoàn hảo để gắn cờ sự chậm trễ lặp đi lặp lại thành các vi phạm | Integration | API / Controller Integration |
| Kỷ luật | Xem Vi phạm | Thành công | Admin | VIOLATION_03 | Hệ thống truy xuất an toàn tất cả các vi phạm trên toàn tổ chức để giám sát quản trị | Security | API / Controller Integration |
| Kỷ luật | Xem Cá nhân | Thành công | Employee | VIOLATION_04 | Hệ thống giới hạn rõ ràng quyền xem chỉ đối với các vi phạm được ghi lại của chính nhân viên đó một cách an toàn | Security | API / Controller Integration |
| Kỷ luật | Cập nhật Vi phạm | Thành công | Admin | VIOLATION_05 | Hệ thống ngầm cho phép quản trị viên cập nhật hiệu quả trạng thái vi phạm (VD: Đã khiếu nại, Đã giải quyết) | Function | API / Controller Integration |
| Kỷ luật | Xóa Vi phạm | Thành công | Admin | VIOLATION_06 | Hệ thống xóa một vi phạm một cách sạch sẽ để giải quyết các phụ thuộc lịch sử | Function | API / Controller Integration |
| Kỷ luật | Logic Đồng bộ | Thành công | System | VIOLATION_07 | Hệ thống lặp qua dữ liệu chấm công một cách tự nhiên để nhất quán lưu các vi phạm được tự động hóa | Logic | Unit / Service Logic |

### Module: Trợ lý AI (Contextual Chat)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Trợ lý AI | Contextual Chat | Thành công | Employee | CHAT_01 | Giao diện hệ thống hiển thị chính xác widget trò chuyện một cách hoàn hảo mà không làm gián đoạn việc thực thi luồng chính | GUI | UI Integration |
| Trợ lý AI | Xử lý Tin nhắn | Thành công | Employee | CHAT_02 | Hệ thống xử lý linh hoạt các truy vấn của người dùng và truyền phát tối ưu các phản hồi của AI một cách trực quan | GUI | Logic / Integration |

### Module: Tiện ích Bảng điều khiển (Dashboard Widgets)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Bảng điều khiển | Tiện ích Admin | Thành công | Admin | FRONT_DASH_01 | Giao diện cấu trúc và hiển thị trôi chảy các số liệu KPI quản trị cấp cao một cách hiệu quả | GUI | Logic / Integration |
| Bảng điều khiển | Tiện ích Nhân viên | Thành công | Employee | FRONT_DASH_02 | Giao diện hiển thị chính xác và tự nhiên các thống kê cá nhân hóa của nhân viên (Số dư phép, ngày lễ tiếp theo) một cách gọn gàng | GUI | Logic / Integration |


### Module: Cấu hình Xác thực & Hồ sơ (Authentication & Profile Configs)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Xác thực | Context Xác thực | Thành công | System | FRONT_AUTH_01 | Client hiển thị trạng thái tải ban đầu một cách thông minh và tiến hành lấy hồ sơ một cách trơn tru | GUI | Logic / Integration |
| Xác thực | Context Xác thực | Thất bại | System | FRONT_AUTH_02 | Client xử lý chính xác và mượt mà các lỗi khi lấy hồ sơ (VD: 401 Unauthorized) | Logic | Edge Case Handling |
| Xác thực | Bảo vệ Điều hướng | Thành công | System | FRONT_AUTH_03 | Client kích hoạt chuyển hướng đúng cách đến màn hình đăng nhập nếu chưa được xác thực trên các route được bảo vệ | Security | Logic / Integration |
| Xác thực | Interceptors | Thành công | System | FRONT_AUTH_04 | Client triển khai liền mạch các interceptors để bắt lỗi 401 trên toàn cầu cho tất cả các lệnh gọi API | Security | Logic / Integration |
| Core HR | Context Công ty | Thành công | System | FRONT_COMP_01 | Client cung cấp an toàn các cài đặt công ty đang hoạt động, ánh xạ động chúng vào trạng thái UI toàn cầu | GUI | Logic / Integration |
| Quản trị Hệ thống | Cấu hình i18n | Thành công | System | FRONT_I18N_01 | Client hoán đổi liền mạch các từ điển dịch thuật một cách trực quan và ánh xạ chính xác các định dạng khu vực | GUI | Logic / Integration |
| Tiện ích | API Utils | Thành công | System | FRONT_UTIL_01 | Client cắt bớt (trim) các thông số truy vấn một cách tối ưu, ngăn chặn việc thực thi các chuỗi rỗng trên payload | Logic | Unit |

### Module: Bảng điều khiển (Dashboard)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Bảng điều khiển | Bảng điều khiển Nhân viên | Thành công | Employee | DASH_01 | Hệ thống lấy và trả về dữ liệu bảng điều khiển nhân viên chính xác dựa trên ID người dùng | Function | API / Controller Integration |
| Bảng điều khiển | Bảng điều khiển Nhân viên | Ngoại lệ | Employee | DASH_02 | Hệ thống xử lý mượt mà số dư PTO bị thiếu bằng cách mặc định về 0 | Logic | Unit / Service Logic |
| Bảng điều khiển | Bảng điều khiển Admin | Thành công | Admin | DASH_03 | Hệ thống tính toán và trả về chính xác các thống kê quản trị cho bảng điều khiển | Function | API / Controller Integration |
| Bảng điều khiển | Tiện ích Ngày lễ | Thành công | All | DASH_04 | Hệ thống truy xuất danh sách các ngày lễ sắp tới đã được biên dịch và sắp xếp | Function | API / Controller Integration |
| Bảng điều khiển | Ngày lễ Tiếp theo | Thành công | All | DASH_05 | Hệ thống tính toán và xác định chính xác ngày lễ sắp tới tiếp theo | Logic | Unit / Service Logic |

### Module: Quản lý Nhân sự (Employees & Departments)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Quản lý Nhân sự | Tạo Nhân viên | Thất bại | HR/Admin | EMP_01 | Hệ thống chặn việc tạo và ném ra lỗi nếu email đã gửi đã tồn tại | Logic | Unit / Service Logic |
| Quản lý Nhân sự | Tạo Nhân viên | Thành công | HR/Admin | EMP_02 | Hệ thống băm chính xác mật khẩu và lưu trữ bản ghi nhân viên mới | Function | API / Controller Integration |
| Quản lý Nhân sự | Xem Nhân viên | Thành công | HR/Admin | EMP_03 | Hệ thống trả về an toàn tất cả hồ sơ nhân viên bao gồm dữ liệu lương cơ bản nếu được phép | Security | API / Controller Integration |
| Quản lý Nhân sự | Xem Nhân viên | Dự phòng | Employee | EMP_04 | Hệ thống kích hoạt dự phòng an toàn để ẩn dữ liệu lương nhạy cảm nếu kiểm tra quyền thất bại | Security | Unit / Service Logic |
| Quản lý Nhân sự | Tìm kiếm Nhân viên | Ngoại lệ | Employee | EMP_05 | Hệ thống chặn thực thi tìm kiếm tối ưu và trả về một mảng trống nếu truy vấn dưới 2 ký tự | Function | API / Controller Integration |
| Quản lý Nhân sự | Tìm kiếm Nhân viên | Thành công | Employee | EMP_06 | Hệ thống thực thi thành công tìm kiếm ánh xạ với tên và email | Function | API / Controller Integration |
| Quản lý Nhân sự | Cập nhật Nhân viên | Thành công | HR/Admin | EMP_07 | Hệ thống cập nhật chính xác chi tiết nhân viên, giải quyết đúng việc phân công phòng ban và vị trí | Function | API / Controller Integration |
| Quản lý Nhân sự | Cập nhật Nhân viên | Ngoại lệ | HR/Admin | EMP_08 | Hệ thống phát hiện cập nhật chấm dứt hợp đồng lao động và tự động hủy kích hoạt các hợp đồng liên quan một cách logic | Logic | Unit / Service Logic |
| Quản lý Nhân sự | Xóa Nhân viên | Thành công | Admin | EMP_09 | Hệ thống loại bỏ có hệ thống vai trò quản lý khỏi mọi phòng ban liên quan trước khi hoàn tất việc xóa nhân viên | Logic | Unit / Service Logic |
| Quản lý Nhân sự | Danh bạ Công khai | Thành công | Employee | EMP_10 | Hệ thống lọc nghiêm ngặt các thuộc tính payload để chỉ giữ lại các trường an toàn khi tạo danh bạ công khai | Security | API / Controller Integration |

### Module: Quản lý Hiệu suất (KPI)
| Requirement Level 1 | Requirement Level 2 | Requirement Level 3 | Actor | TC_ID | Test Case Description | Test Type | Note |
|---|---|---|---|---|---|---|---|
| Hiệu suất | Tạo Thư viện KPI | Thành công | Admin/Manager | KPI_01 | Hệ thống ngầm trích xuất danh tính của quản lý từ token và chỉ định việc tạo KPI | Function | API / Controller Integration |
| Hiệu suất | Kỳ KPI | Thành công | Admin/Manager | KPI_02 | Hệ thống thực thi cấu hình kỳ nghiêm ngặt, xác thực an toàn các giới hạn ranh giới toàn cầu | Function | API / Controller Integration |
| Hiệu suất | Phân bổ KPI | Thành công | Manager | KPI_03 | Hệ thống điều phối ánh xạ giao dịch toàn diện, gửi phân bổ KPI hàng loạt thành công | Function | API / Controller Integration |
| Hiệu suất | Phân bổ KPI | Thất bại | Manager | KPI_04 | Hệ thống chặn các thông số không hợp lệ về mặt cấu trúc và hoàn tác phân bổ KPI khi xảy ra lỗi giới hạn | Logic | Unit / Service Logic |
| Hiệu suất | Cập nhật Kết quả Thực tế | Thành công | Manager | KPI_05 | Hệ thống cô lập độc lập ranh giới của Quản lý đảm bảo chỉ người đánh giá được phép mới có thể cập nhật kết quả | Security | API / Controller Integration |
| Hiệu suất | Cập nhật Kết quả Thực tế | Ngoại lệ | System | KPI_06 | Hệ thống lọc sạch các loại dữ liệu không hợp lệ và ánh xạ thông minh các cơ chế dự phòng ghi đè | Logic | Unit / Service Logic |
| Hiệu suất | Tính Điểm | Thành công | System | KPI_07 | Hệ thống cô lập động các thông số theo ngữ cảnh để tổng hợp các tính toán điểm KPI lũy kế | Integration | API / Controller Integration |
| Hiệu suất | Tính Điểm | Ngoại lệ | System | KPI_08 | Hệ thống tính toán các tổng hợp điểm hợp lệ, thông minh hạn chế các kết quả tràn vượt quá giới hạn | Logic | Unit / Service Logic |
| Hiệu suất | Xem Hiệu suất Cá nhân | Thành công | Employee | KPI_09 | Hệ thống tự động liên kết đúng ngữ cảnh danh tính quan hệ, truy xuất thành công điểm hiệu suất của cá nhân | Security | API / Controller Integration |
