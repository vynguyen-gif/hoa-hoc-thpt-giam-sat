# Hệ Thống Giám Sát Trực Tiếp Làm Bài Hóa Học THPT & Chống Gian Lận - Thầy Nguyễn Vỹ

Trang web ứng dụng giám sát làm bài và chống gian lận trực tuyến môn **Hóa Học THPT (SGK Kết Nối Tri Thức)** dành cho **Thầy Nguyễn Vỹ**.
Được xây dựng với giao diện, cấu trúc và tính năng mô phỏng chuẩn xác 100% hệ thống giám sát live môn Tin học.

## 🚀 Tính năng nổi bật

### 1. Trang Web Giáo Viên (`teacher.html`)
- **Bảng Giám Sát Live 36 học sinh lớp 12C1:**
  - Hiển thị thẻ học sinh bo cong với trạng thái Online/Offline.
  - Cảnh báo rời tab nhấp nháy đỏ rực rỡ và phát tín hiệu báo động khi học sinh rời màn hình.
  - Bộ đếm số lần vi phạm và cập nhật chỉ số liêm chính (%) theo thời gian thực.
  - Soi live từng ký tự học sinh đang gõ phương trình hóa học.
  - Đọc cảnh báo bằng giọng nói tiếng Việt (Web Speech API).
  - Bắn thông báo nhắc nhở trực tiếp sang màn hình học sinh.
- **Quản lý bài gửi & đánh giá:**
  - Bộ lọc thông minh theo trạng thái (Đã nộp, Chưa nộp, Đã chấm, Rời tab...).
  - Chấm tự động phần trắc nghiệm và tự luận.
  - Xuất bảng điểm chi tiết ra file Excel (.csv UTF-8 BOM chuẩn tiếng Việt).

### 2. Trang Web Học Sinh (`student.html`)
- Đăng nhập bằng mã ID 4 số (2101, 2102,...).
- Đề kiểm tra Hóa học 12 (Điều chế & Thử tính chất Este - Xà phòng hóa):
  - Trắc nghiệm 4 lựa chọn (MCQ).
  - Trắc nghiệm Đúng/Sai 4 ý chuẩn cấu trúc 2025 của Bộ GD&ĐT.
  - Tự luận viết PTHH có bàn phím ký hiệu hóa học ảo.
- **Hệ thống cảm biến chống gian lận (Anti-Cheat Engine):**
  - Tự động phát hiện học sinh chuyển tab, mở AI/Google, nhấn Alt+Tab hoặc thu nhỏ trình duyệt.
  - Báo động đỏ và gửi dữ liệu vi phạm sang máy Thầy Nguyễn Vỹ tức thì (< 30ms).

## 🛠️ Cấu trúc thư mục
- `index.html`: Cổng điều hướng chính cho phép truy cập cả 2 giao diện.
- `teacher.html`: Giao diện dành cho Thầy Nguyễn Vỹ.
- `student.html`: Giao diện dành cho học sinh làm bài thi.
- `css/styles.css`: Giao diện chuẩn pixel-perfect, hỗ trợ responsive & Dark/Light mode.
- `js/data.js`: Dữ liệu 36 học sinh lớp 12C1 và ngân hàng câu hỏi Hóa 12 KNTT.
- `js/channel.js`: Trục giao tiếp thời gian thực 2 chiều (BroadcastChannel & LocalStorage fallback).
- `js/teacher.js`: Nghiệp vụ điều khiển, chấm điểm, soi live của giáo viên.
- `js/student.js`: Cảm biến chống gian lận và làm bài của học sinh.
