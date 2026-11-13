# Hệ Thống Thi Trực Tuyến Môn Hóa Học (Bám sát Công văn 7991)

Hệ thống thi trắc nghiệm và tự luận trực tuyến chuyên biệt cho môn Hóa học THPT, thiết kế bám sát định dạng cấu trúc đề thi mới theo **Công văn 7991/BGDĐT** kết hợp hệ thống giám sát thi cử (Proctoring) nghiêm ngặt và danh pháp hóa học **IUPAC 2018** (tiếng Anh).

---

## 1. Tính Năng Nổi Bật

### 🔬 Định dạng Đề thi Chuẩn Công văn 7991 & Danh pháp IUPAC 2018
- **Phần I: 12 câu trắc nghiệm nhiều lựa chọn** (4 lựa chọn A, B, C, D - 3.0 điểm).
- **Phần II: 4 câu trắc nghiệm Đúng/Sai** (mỗi câu gồm 4 ý a, b, c, d với lựa chọn Đúng hoặc Sai - 4.0 điểm).
- **Phần III: 3 câu Tự luận / Trả lời ngắn** (Tính toán enthalpy $\Delta_r H^0_{298}$, cân bằng oxi hóa - khử thăng bằng electron, xác định công thức phân tử qua phổ MS & IR - 3.0 điểm).
- Hiển thị chuẩn xác công thức hóa học bằng thẻ `<sub>` và `<sup>` (ví dụ: `H<sub>2</sub>SO<sub>4</sub>`, `Fe<sup>3+</sup>`, `CuSO<sub>4</sub>`, `SO<sub>4</sub><sup>2-</sup>`).
- Danh pháp hóa học IUPAC 2018 bằng tiếng Anh: *sulfuric acid, copper(II) sulfate, potassium permanganate, ethanol, propan-1-ol, ethyl acetate...*

### 🛡️ Phân Hệ Học Sinh (Focus Mode & Anti-Cheating)
- **Single-page Focus Mode**: Không có navbar, không có footer gây xao nhãng.
- **URL Obfuscation**: Đăng nhập bằng Mã PIN 6 số và Số Báo Danh (SBD) / Tên thí sinh, không để lộ mã định danh đề trên URL.
- **Bắt buộc Toàn màn hình (Fullscreen API)**: Chỉ tính giờ khi học sinh bật toàn màn hình; tự động cảnh báo khi thoát.
- **Giám sát chuyển tab (Page Visibility API & Blur)**: Phát hiện mở tab khác, cửa sổ chat, ứng dụng thứ ba. Cảnh báo đỏ và **tự động KHÓA BÀI THI sau 3 lần vi phạm**.
- **Chặn gian lận giao diện**: Vô hiệu hóa `user-select: none`, chặn chuột phải (`contextmenu`), chặn các phím tắt copy/paste/inspect (`Ctrl+C`, `Ctrl+V`, `Ctrl+U`, `F12`, `Ctrl+Shift+I`).
- **Cơ chế Single Active Session**: Phát hiện và khóa tài khoản khi phát hiện đăng nhập đồng thời trên 2 trình duyệt/thiết bị khác nhau.
- **Auto-save & Offline-resilience**: Tự động lưu tức thì vào `localStorage` và đẩy đồng bộ lên Supabase/Realtime để chống rớt mạng.
- **Tự luận kép**: Học sinh có thể gõ văn bản/công thức trực tiếp và chụp/upload ảnh bài làm tay.

### 📡 Phân Hệ Giáo Viên (Minimalist Dashboard & Live Monitor)
- **Live Monitor dạng Lưới (Responsive Tailwind Grid)**:
  - Hiển thị toàn bộ học sinh trong phòng thi với mã màu trực quan:
    - 🟢 **Xanh lá (Active)**: Đang tập trung làm bài, Fullscreen.
    - 🟡 **Vàng (Warning)**: Đang chuyển tab (Lần 1 hoặc Lần 2).
    - 🔴 **Đỏ (Locked)**: Bị khóa bài do vi phạm 3 lần.
    - 🟣 **Tím (Submitted)**: Đã hoàn thành và nộp bài.
    - ⚪ **Xám (Offline)**: Chưa tham gia hoặc mất kết nối.
- **Live Essay Keystroke Viewer (như Google Docs)**: Click vào bất kỳ thẻ học sinh nào để mở Drawer xem tiến độ làm bài, từng phím bấm tự luận học sinh đang gõ theo thời gian thực.
- **Công cụ điều phối thi**: Giáo viên có quyền **Mở khóa bài thi (Unlock)** cho học sinh khi có lý do chính đáng hoặc **Cưỡng chế thu bài (Force Submit)**.
- **Quản lý Lớp & SheetJS**:
  - Tích hợp thư viện SheetJS (`xlsx`) kéo thả file Excel danh sách lớp (hỗ trợ file CSV/XLSX).
  - Tự động phân tích danh sách và sinh tài khoản ngẫu nhiên (Username + Password).
  - Xuất danh sách tài khoản sang file Excel chỉ bằng một cú click.

---

## 2. Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

Ứng dụng chạy trực tiếp trên trình duyệt hiện đại hoặc thông qua bất kỳ web server tĩnh nào (Python, Node.js HTTP-Server, Live Server, v.v.):

```bash
# Di chuyển vào thư mục dự án
cd C:\Users\admin\.gemini\antigravity\scratch\chem-exam-system

# Chạy nhanh với Python HTTP Server
python -m http.server 8080
```

Sau đó mở trình duyệt và truy cập:
👉 `http://localhost:8080`

### Mẹo Thử Nghiệm Real-time (Đồng bộ thời gian thực):
1. Mở **Tab 1**: Chọn chế độ **"Thí sinh (Focus Mode)"** (Mã PIN: `889966`, SBD: `10A301`). Bật Toàn màn hình và thử gõ một đoạn văn vào phần tự luận hoặc thử chuyển tab để xem cảnh báo.
2. Mở **Tab 2**: Chọn chế độ **"Giáo viên (Dashboard & Live Monitor)"**. Bạn sẽ thấy thẻ của học sinh `10A301` đổi màu đỏ ngay khi chuyển tab, và khi click vào thẻ sẽ thấy nội dung gõ phím được stream trực tiếp!

---

## 3. Cấu Hình Supabase (Auth, Database, Realtime)

Hệ thống đã có sẵn bộ giả lập Realtime qua `BroadcastChannel` và `localStorage`. Để kết nối với Supabase thật, bạn chỉ cần mở file `js/supabase-mock.js` và cập nhật thông tin:

```javascript
const SUPABASE_CONFIG = {
    url: "https://your-project.supabase.co",
    anonKey: "eyJhbGciOi...",
    channelName: "chem_exam_live_889966"
};
```
