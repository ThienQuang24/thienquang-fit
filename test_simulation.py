"""
test_simulation.py
Kịch bản mô phỏng chạy thử AI DJ Bot trên terminal.
Chạy: .venv/bin/python3 test_simulation.py
"""
import asyncio
from ai_dj_bot.bot import AIDJBot

async def main():
    print("=" * 60)
    print(" 🎧 KHỞI ĐỘNG MÔ HÌNH THỬ NGHIỆM AI DJ LIVE TIKTOK 🎧 ")
    print("=" * 60)
    
    bot = AIDJBot()
    print(f"[*] Tên DJ: {bot.config.bot_name}")
    print(f"[*] Phong cách: {bot.config.persona_title}")
    print(f"[*] Giọng nói: {bot.config.voice_name}")
    print("-" * 60)

    # 1. Thử phản hồi comment chào hỏi
    print("\n[TEST 1] Khán giả 'AnhBa_SaiGon' comment: 'Chào em Miu xinh đẹp nha!'")
    res1 = await bot.on_comment("AnhBa_SaiGon", "Chào em Miu xinh đẹp nha!", generate_voice=False)
    print(f" -> Lời nói DJ : \"{res1['speech']}\"")
    print(f" -> Động tác   : [{res1['action']}] - {res1['action_desc']}")
    print(f" -> Cảm xúc    : {res1['mood']}")

    # 2. Thử phản hồi yêu cầu nhạc sàn
    print("\n[TEST 2] Khán giả 'DanChoi_99' comment: 'Lên bài Vinahouse bass đập căng đét đi em!'")
    res2 = await bot.on_comment("DanChoi_99", "Lên bài Vinahouse bass đập căng đét đi em!", generate_voice=False)
    print(f" -> Lời nói DJ : \"{res2['speech']}\"")
    print(f" -> Động tác   : [{res2['action']}] - {res2['action_desc']}")

    # 3. Thử phản hồi tặng quà: Hoa hồng
    print("\n[TEST 3] Khán giả 'ThieuGia_PhoNui' tặng: 1x Bông Hoa Hồng 🌹")
    res3 = await bot.on_gift("ThieuGia_PhoNui", "Rose", count=1, generate_voice=False)
    print(f" -> Lời nói DJ : \"{res3['speech']}\"")
    print(f" -> Động tác   : [{res3['action']}] - {res3['action_desc']}")

    # 4. Thử phản hồi tặng quà khủng: Tên Lửa
    print("\n[TEST 4] Khán giả 'DaiGia_Bin' tặng: 1x Tên Lửa Siêu Cấp 🚀")
    res4 = await bot.on_gift("DaiGia_Bin", "Rocket", count=1, generate_voice=False)
    print(f" -> Lời nói DJ : \"{res4['speech']}\"")
    print(f" -> Động tác   : [{res4['action']}] - {res4['action_desc']}")

    # 5. Thử kịch bản nhắc giỏ hàng TikTok Shop
    print("\n[TEST 5] Tự động kích hoạt nhắc khéo Giỏ hàng TikTok Shop:")
    res5 = await bot.on_shop_pitch(generate_voice=False)
    print(f" -> Lời nói DJ : \"{res5['speech']}\"")
    print(f" -> Động tác   : [{res5['action']}] - {res5['action_desc']}")
    print(f" -> Sản phẩm   : {res5['product_name']} ({res5['product_price']})")

    # 6. Thử câu nói hâm nóng phòng live khi im ắng
    print("\n[TEST 6] Tự động hâm nóng phòng live khi vắng comment:")
    res6 = await bot.on_idle(generate_voice=False)
    print(f" -> Lời nói DJ : \"{res6['speech']}\"")
    print(f" -> Động tác   : [{res6['action']}] - {res6['action_desc']}")

    print("\n" + "=" * 60)
    print(" ✅ TẤT CẢ KỊCH BẢN ĐÃ TEST THÀNH CÔNG VÀ CHẠY MƯỢT MÀ! ")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
