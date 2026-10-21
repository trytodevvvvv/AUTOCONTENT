# 📜 AUTOCONTENT STUDIO - PROJECT RULES & DEVELOPER GUIDELINES

Tài liệu này là **Hiến pháp dự án** dành cho tất cả các lập trình viên và Trợ lý AI (Antigravity, Cursor, Copilot...) khi tham gia phát triển mã nguồn của ứng dụng **AutoContent Studio**. Mọi thay đổi trong mã nguồn đều phải tuân thủ nghiêm ngặt 5 bộ quy tắc dưới đây.

---

## 🛡️ LUẬT 1: BẢO MẬT DỮ LIỆU & CẤM ĐẨY API LÊN GITHUB (ZERO-LEAKAGE POLICY)

1. **Tuyệt đối không commit dữ liệu cá nhân**:
   * Nghiêm cấm đẩy file `saved_apis.json`, `.env`, `.env.local` hoặc bất kỳ file cấu hình chứa API Key thật lên GitHub.
   * Cấm lưu cứng (hardcode) bất kỳ chuỗi API Key (`sk-...`), token, hay endpoint bảo mật riêng tư nào trong mã nguồn (`main.js`, `app.js`, `index.html`,...).
2. **Quản lý file cấu hình**:
   * File `saved_apis.json` trên máy phát triển chỉ dùng cho môi trường nội bộ và **bắt buộc phải luôn nằm trong `.gitignore`**.
   * Chỉ duy trì và cập nhật file mẫu `saved_apis.example.json` với danh sách nhà cung cấp rỗng (`providers: []`).
3. **Kiểm tra an toàn trước khi commit**:
   * Trước mỗi lần `git add` và `git commit`, bắt buộc chạy lệnh kiểm tra:
     ```bash
     git status
     git diff --cached
     ```
   * Đảm bảo không có bất kỳ thông tin nhạy cảm nào lọt vào staging area.

---

## 📦 LUẬT 2: CHUẨN "ỨNG DỤNG MỚI XUẤT XƯỞNG" TRÊN GITHUB (CLEAN STATE RELEASE)

1. **Trạng thái xuất xưởng mặc định**:
   * Bản code đẩy lên nhánh `main` trên GitHub luôn phải ở trạng thái của một ứng dụng hoàn toàn mới:
     * Header hiển thị: **"Chưa chọn API / Chưa có model"** (chấm đèn màu xám/offline).
     * Modal Cài đặt: Tiêu đề mặc định là **"Cấu hình API"**, các trường nhập liệu trống sẵn sàng cho người dùng dán key của họ.
     * Ô nhập liệu kịch bản gốc và khung hiển thị đầu ra hoàn toàn trống.
2. **Không lưu trữ rác**:
   * Không lưu bản nháp văn bản của người dùng, không lưu log tạo kịch bản cá nhân vào repository.

---

## 🎙️ LUẬT 3: CHUẨN ĐỊNH DẠNG KỊCH BẢN YOUTUBE (PURE VOICEOVER STANDARD)

1. **Định dạng mặc định: Thuần lời đọc (Pure Voiceover)**:
   * Kịch bản tạo ra phải dùng được ngay 100% cho MC, người thu âm hoặc các công cụ chuyển văn bản thành giọng nói (AI Voiceover / TTS).
   * **NGHIÊM CẤM TUYỆT ĐỐI**:
     * Cấm chèn mốc thời gian / timeline (Ví dụ: `00:00 - 00:30`).
     * Cấm chèn mô tả phân cảnh visual hoặc âm thanh (Ví dụ: `[Cảnh quay: ...]`, `[Nhạc nền kịch tính]`, `(Visual cue: ...)`).
     * Cấm bảng biểu chia cột kịch bản (Visual / Audio).
2. **Quy chuẩn dãn dòng kịch bản**:
   * Mặc định là chế độ **Sát dòng (Tight Spacing)**: Các đoạn văn nối tiếp nhau tự nhiên, không chèn dòng trống vô nghĩa làm loãng kịch bản đọc.
   * Người dùng có thể tùy chỉnh chuyển đổi sang "Dãn đoạn tiêu chuẩn" trong phần Cài đặt chung.
3. **Phong cách kịch bản**:
   * Đảm bảo hệ thống prompt hỗ trợ đầy đủ các phong cách chuyên sâu (Địa chính trị, Phân tích chuyên sâu, Kể chuyện giật gân, Triết lý sâu sắc, Hài hước châm biếm, Tài chính thực chiến,...).
   * Tuân thủ nguyên tắc bảo toàn ngôn ngữ gốc nếu không bật tính năng dịch thuật.

---

## ⚙️ LUẬT 4: KIẾN TRÚC MÃ NGUỒN & TÍNH TOÀN VẸN HỆ THỐNG (CODE INTEGRITY)

1. **Phân tách trách nhiệm rõ ràng (Electron Architecture)**:
   * `main.js`: Quản lý vòng đời Electron BrowserWindow, IPC handlers, hộp thoại file hệ thống và đọc ghi file.
   * `preload.js`: Cầu nối ngữ cảnh an toàn (`contextBridge`), chỉ expose các API cần thiết ra `window.api`.
   * `renderer/app.js`: Xử lý toàn bộ logic giao diện, luồng gọi API, quản lý state, streaming hiển thị và bộ đếm thống kê.
   * `renderer/styles.css`: Hệ thống thiết kế chuẩn UI hiện đại, giao diện thẻ bo góc tinh tế, hỗ trợ responsive.
2. **Bảo toàn các tính năng cốt lõi**:
   * **Xác thực API thật**: Luôn kiểm tra kết nối (`performTestConnection`) với máy chủ AI trước khi lưu cấu hình. Tuyệt đối không cho phép lưu cấu hình nếu API Key sai hoặc mất kết nối.
   * **Khóa an toàn khi sinh nội dung (Safety Lockdown)**: Khi `state.isGenerating = true`, toàn bộ các nút điều khiển, đổi model, nhập liệu phải bị vô hiệu hóa để tránh người dùng thao tác nhầm.
   * **Đồng bộ trạng thái đèn báo (Status Dots)**: Đồng bộ màu sắc đèn trạng thái (Online xanh lá / Offline đỏ hoặc xám) tức thì trên Quick Switcher, Header Pill và Tabs.
3. **Kiểm tra cú pháp bắt buộc**:
   * Trước khi hoàn thành chỉnh sửa code, luôn chạy kiểm tra cú pháp bằng Node.js:
     ```bash
     node -c main.js; node -c preload.js; node -c renderer/app.js
     ```

---

## 🚀 LUẬT 5: QUY TRÌNH NÂNG CẤP & ĐỒNG BỘ GITHUB (RELEASE WORKFLOW)

1. **Quản lý phiên bản**:
   * Khi cập nhật hoặc thêm tính năng mới, nâng version tương ứng trong `package.json` theo chuẩn Semantic Versioning (`1.0.0` -> `1.0.1` -> `1.1.0`).
2. **Quy trình đẩy code**:
   * Bước 1: Kiểm tra trạng thái file bằng `git status`.
   * Bước 2: Thêm file thay đổi: `git add .` (đảm bảo `.gitignore` chặn toàn bộ file dữ liệu người dùng).
   * Bước 3: Tạo commit với thông điệp rõ ràng, chuyên nghiệp.
   * Bước 4: Đẩy lên nhánh chính: `git push origin main`.

---

## 🛑 LUẬT 6: KIỂM SOÁT PHÁT HÀNH & CẤM TỰ ĐỘNG GIT PUSH (NO AUTO-PUSH & RELEASE GATING)

1. **Nghiêm cấm AI tự ý commit hoặc git push**:
   * Sau khi chỉnh sửa code hoặc thêm tính năng, AI **chỉ được phép lưu file cục bộ** trên máy của lập trình viên để người dùng tự do kiểm tra và thử nghiệm.
   * **Tuyệt đối cấm** việc tự ý chạy `git commit` hay `git push` nếu người dùng chưa ra lệnh bằng câu từ rõ ràng, chủ động (Ví dụ: *"Hãy đẩy code lên GitHub cho tôi"* hoặc *"Xác nhận phát hành bản mới"*).
2. **Cơ chế chặn thông báo cập nhật rác sang máy người dùng (Update Spam Protection)**:
   * Trong quá trình lập trình thử nghiệm, sửa lỗi nhỏ, chỉnh giao diện: **Bắt buộc giữ nguyên số phiên bản (`version`)** trong `package.json`. Ứng dụng ở các máy người dùng khác sẽ **hoàn toàn không bị làm phiền** hay hiện thông báo cập nhật.
   * **Chỉ nâng version khi phát hành bản lớn**: Chỉ khi nào một cụm tính năng hoàn chỉnh đã được người dùng nghiệm thu và có lệnh phát hành chính thức, lúc đó mới được nâng version trong `package.json` (ví dụ: `1.0.0` -> `1.1.0`) để kích hoạt cơ chế thông báo cập nhật sang máy người dùng.

