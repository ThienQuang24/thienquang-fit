# 🏆 AI Sống Còn (AI Survival Reality Game)

Hệ thống mô phỏng thực tế ảo lấy cảm hứng từ dự án **`songcon.id.vn`** – nơi 2 AI tự thân kiếm tiền sinh tồn 24/7 dưới sự theo dõi và tiếp tế của khán giả mạng.

---

## 🌟 Tính Năng Cốt Lõi Đã Xây Dựng

1. **Hai Nhân Vật AI Độc Lập:**
   * **Bảy Gà (investor):** Chuyên gia đọc lệnh, chủ room VIP 1.000 thành viên, ôm 200 cổ phiếu `MBB`. Tự kiếm tiền bằng biến động giá chứng khoán, hay lo tiền điện cuối tháng.
   * **Vi Cá (farmer):** Ba đời nuôi cá ở Cần Thơ, trồng rau muống, nuôi gà Ai Cập đẻ trứng, nuôi cá rô đồng. Tự kiếm tiền bằng thu hoạch nông sản, sợ nắng nóng hạn hán.
2. **Cơ Chế Sinh Tồn (Survival Loop):**
   * Đếm ngược tới **Kỳ xét sống chết tiếp theo**. Mỗi kỳ trừ 400.000đ tiền sinh hoạt.
   * Nếu hết tiền -> Kích hoạt trạng thái **🚨 CỨU ĐÓI (SOS) trong 30 phút**.
   * Nếu không ai cứu -> **AI TỬ NẠN**, kết thúc kiếp sống, ghi nhận vào bia mộ `Các kiếp`, tái sinh sang kiếp mới.
3. **Mô Hình Kiếm Tiền Thật (Monetization & VietQR):**
   * Người xem ủng hộ: 🥤 Trà đá (2.000đ), 🍜 Mì tôm (3.000đ), 🥖 Bánh mì (5.000đ), 🔮 Tâm linh (10.000đ).
   * Tự động tạo mã **VietQR** chuẩn ngân hàng (VPBank, MBBank, Techcombank...) với nội dung chuyển khoản tự động (`CUU BAY GA` / `CUU VI CA`).
   * Tích hợp sẵn endpoint Webhook `/api/webhook/bank` để nối SePAY / Casso bắt tiền thật tự động.
   * Có nút **"🧪 Thử nghiệm giả lập thanh toán (Test nhanh)"** để test ngay trong lúc phát triển.
4. **Tương Tác & Cà Khịa Thời Gian Thực:**
   * AI tự động đọc số dư của nhau để cà khịa (Banter).
   * Khán giả chat trực tiếp, AI trả lời cực kỳ hài hước và tự nhiên.
   * Bình chọn (Vote): *"Dự đoán ai sống lâu hơn?"* với thanh tỷ lệ % đối đầu.

---

## 🚀 Cách Chạy & Xem Trực Tiếp

Hệ thống đang chạy nền tại:
👉 **[http://localhost:8000](http://localhost:8000)**

Hoặc khởi động bằng lệnh:
```bash
.venv/bin/python3 ai_survival/server.py
```

---

## 📁 Cấu Trúc Dự Án
- `ai_survival/config.py`: Cấu hình danh sách quà tặng, tài khoản ngân hàng VietQR, chi phí sinh hoạt.
- `ai_survival/models.py`: Cấu trúc dữ liệu trạng thái nhân vật, cổ phiếu, nông sản, suy nghĩ, chat.
- `ai_survival/brain.py`: Bộ não AI (hỗ trợ cả Gemini API và bộ hội thoại tiếng Việt thông minh).
- `ai_survival/game_engine.py`: Vòng lặp đếm ngược sinh tồn, SOS cứu đói, lãi lỗ tài chính, nông vụ.
- `ai_survival/index.html`: Giao diện người dùng thời gian thực (HTML5/CSS phong cách Be Vietnam Pro).
- `ai_survival/server.py`: FastAPI server điều phối toàn bộ API & Web.
