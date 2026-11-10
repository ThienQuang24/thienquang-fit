# 🏋️‍♂️ THIENQUANG FIT - Ứng Dụng Thể Hình Cá Nhân Hóa & Native Android APK

> **Dự án đã được lưu trữ và đồng bộ an toàn 100% trên GitHub:**
> 🔗 **Kho mã nguồn:** [https://github.com/ThienQuang24/thienquang-fit](https://github.com/ThienQuang24/thienquang-fit)
> 📱 **Tải trực tiếp file cài đặt APK v1.0.2:** [ThienQuangFit.apk (GitHub Release)](https://github.com/ThienQuang24/thienquang-fit/releases/download/v1.0.2/ThienQuangFit.apk)

---

## 🌟 Tổng Quan Dự Án

**THIENQUANG FIT** là ứng dụng thể hình cá nhân hóa toàn diện dành cho lập trình viên/dân văn phòng:
* **Hành trình 60 ngày:** Giảm từ 80kg về 70kg, vòng eo từ 96cm về 80cm, thể hình săn chắc chuẩn V-Taper / V-Cut.
* **Đa nền tảng:** Chạy mượt mà trên cả trình duyệt Web PWA và ứng dụng Native Android (`.apk`).
* **Trợ lý HLV Gemini AI:** Kết nối trực tiếp Google Gemini API (`gemini-3.5-flash-lite`, `gemini-3-flash-preview`) với cơ chế tự động chuyển đổi thông minh và bộ xử lý offline dự phòng.
* **Native Android Notifications:** Cầu nối Native Android Bridge đẩy thông báo trực tiếp lên thanh trạng thái điện thoại, hỗ trợ rung chuông khi hoàn thành hiệp tập, hết giờ nghỉ và nhắc uống nước.
* **Đếm giờ tập luyện & nghỉ thông minh:** Timer cho từng bài Gym và Cardio, HUD nổi trực quan.
* **Nhật ký ăn uống & Xử lý tiệc tùng (Damage Control):** Bù calo và điều chỉnh bài tập khi có tiệc nhậu, đồ ngọt, buffet.
* **Hệ thống Đa Hồ Sơ (Multi-Profile):** Lưu sẵn "Mục tiêu của Thiên Quang" và hỗ trợ tạo giáo án cá nhân hóa mới cho người khác.

---

## 🚀 Hướng Dẫn Tải & Khôi Phục Mã Nguồn

Khi cần tải lại toàn bộ dự án về máy, bạn chỉ cần mở Terminal và chạy:

```bash
# 1. Clone toàn bộ mã nguồn từ GitHub
git clone https://github.com/ThienQuang24/thienquang-fit.git

# 2. Di chuyển vào thư mục dự án
cd thienquang-fit

# 3. Khởi động Web Server cục bộ
python3 -m http.server 3333 --directory gym-dev-plan

# 4. Mở trên trình duyệt
# http://localhost:3333
```

Để build lại file APK Android:
```bash
cd thienquang-fit/android-project
gradle assembleDebug
```

---

## 📂 Cấu Trúc Mã Nguồn Trên GitHub

```text
thienquang-fit/
├── gym-dev-plan/            # Toàn bộ mã nguồn Web App (PWA, Tailwind, JS Clean Code <= 250 dòng)
│   ├── index.html           # Giao diện chính Mobile-First
│   ├── app.js               # Điều phối lịch trình, thanh thông báo Android Bridge
│   ├── ai-coach.js          # Giao diện & logic Trợ lý Huấn Luyện Viên AI
│   ├── gemini-api.js        # Kết nối Gemini API, Timeout & Smart Fallback
│   ├── workout-timer.js     # Bộ đếm giờ tập Gym, Cardio & thời gian nghỉ
│   ├── food-log.js          # Nhật ký ăn uống & xử lý tiệc tùng
│   ├── profile-manager.js   # Quản lý đa hồ sơ học viên
│   └── assets/              # Hình ảnh minh họa động tác tập luyện
└── android-project/         # Dự án Android Native (Gradle, Java WebView, Notifications)
    └── app/src/main/
        ├── AndroidManifest.xml
        └── java/com/thienquangfit/app/MainActivity.java  # Native Notification Channel & Bridge
```

---
*Dự án hoàn tất bởi Antigravity Pair Programmer - Lưu trữ an toàn tại `ThienQuang24/thienquang-fit`.*
