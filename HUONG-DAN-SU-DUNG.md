# Hướng Dẫn Sử Dụng AutoContent Studio (AI Scriptwriter)

Ứng dụng Desktop chuyên nghiệp viết lại nội dung thành kịch bản YouTube / Shorts / TikTok đỉnh cao, hỗ trợ chuyển đổi linh hoạt đa nhà cung cấp AI theo chuẩn OpenAI Chat Completions (Vilao, DeepSeek, OpenRouter, OpenAI...).

---

## 🚀 Cách khởi động ứng dụng

Bạn có 2 cách cực kỳ nhanh chóng để mở ứng dụng:

### Cách 1: Chạy bằng 1 cú click (Khuyên dùng)
* Nhấp đúp chuột vào file: **`Chay-Ung-Dung.bat`** nằm ngay trong thư mục này. Ứng dụng sẽ tự động mở lên ngay lập tức!

### Cách 2: Mở qua Terminal / Command Prompt
* Mở terminal tại thư mục `d:\TOOL YOUTUBE\AUTOCONTENT` và gõ:
```bash
npm start
```

---

## 🛠️ Cấu hình & Quản lý API Model

1. **Thêm API mới**:
   * Nhấp vào nút **`Cấu hình API`** ở góc trên bên phải.
   * Bấm **`+ Thêm API Mới`** để tạo cấu hình (Vilao, DeepSeek, OpenRouter hoặc Custom).
   * Dán **API Key thật** của bạn vào ô `API key`.
   * Nhấp hộp **`Kiểm tra kết nối`** để kiểm tra xác thực trực tiếp với máy chủ AI (nếu chưa có key hoặc key sai, máy chủ sẽ báo lỗi rõ ràng).
   * Nhấp **`Apply`** để lưu.

2. **Lưu trữ độc lập vào file `saved_apis.json`**:
   * Mọi thông tin API do bạn cấu hình sẽ được lưu vào file `saved_apis.json`.
   * Khi khởi động lại ứng dụng, toàn bộ API của bạn vẫn được giữ nguyên vẹn.
   * Riêng phần nội dung làm việc (ô văn bản gốc, kịch bản tạo ra) sẽ được tự động làm mới (reset) để mỗi lần bật tool là một phiên làm việc mới sạch sẽ!

3. **Chuyển nhanh API & Model (Quick Switcher)**:
   * Nhấp trực tiếp vào thanh **Pill hiển thị Model** ở chính giữa header (ví dụ: `vilao / deepseek-v4.1-flash ▾`).
   * Menu xổ xuống cho phép bạn chuyển đổi ngay lập tức giữa các nhà cung cấp và model AI đã lưu chỉ với 1 cú click.

4. **Xóa API an toàn**:
   * Trong modal cài đặt, nút **`Xóa API`** được thiết kế dạng box bo tròn viền đỏ đẹp mắt.
   * Khi bấm xóa, hệ thống sẽ mở **hộp thoại xác nhận** (Confirm Modal) để tránh việc vô tình bấm nhầm.

---

## 📂 2 Cách nhập nội dung gốc (Input)

1. **Cách 1: Sao chép & Dán**:
   * Copy nội dung bất kỳ và bấm nút **`Dán`** (hoặc `Ctrl + V`) vào ô nhập liệu.
2. **Cách 2: Nhập trực tiếp tệp từ máy (📂 Nhập file)**:
   * Bấm nút **`📂 Nhập file`** ở thanh công cụ góc trên ô Input.
   * Hỗ trợ chọn tệp văn bản: **`.txt`**, **`.md`**, **`.docx`** (Word), **`.srt`** (Subtitles).
   * Nội dung trong tệp sẽ tự động được trích xuất và điền vào ô Input ngay lập tức.

---

## 🛡️ Cơ chế Khóa an toàn khi Chạy Kịch bản (Safety Lockdown)

Khi bạn bấm nút **`TẠO KỊCH BẢN TỰ ĐỘNG`**:
* Toàn bộ các nút chức năng cốt lõi sẽ tự động chuyển sang chế độ **Disable / Locked** (làm mờ, không thể bấm nhầm):
  * Thanh chuyển đổi API & Model (Pill & Dropdown).
  * Nút Cấu hình API.
  * Ô nhập nội dung gốc, các nút Dán, Mẫu thử, Xóa, Nhập file.
  * Các tùy chọn phong cách kịch bản, chuyển ngữ, định dạng.
* Nút chính sẽ đổi sang trạng thái **`DỪNG TẠO (STOP)`** với hiệu ứng phát sáng đỏ: bạn có thể bấm dừng quá trình bất cứ lúc nào nếu cần.
* Sau khi tạo kịch bản hoàn tất hoặc bấm dừng, toàn bộ các nút sẽ được mở khóa trở lại bình thường.

---

## 💡 Các tính năng kịch bản đầu ra (Pure Script)

* **Kịch bản dùng được ngay**: Không chèn các ký hiệu rườm rà, không mốc thời gian `00:00`, không thẻ cảnh `[Visual]`, tạo thành các đoạn văn tự nhiên để người đọc/thu âm đọc liền mạch.
* **Tự động đo thời lượng**: Ước tính số từ và thời lượng đọc kịch bản tính theo phút/giây.
* **Xuất bản 1 chạm**: Nút **`Sao chép toàn bộ`**, lưu thành file **`.TXT`** hoặc **`.MD`**.
