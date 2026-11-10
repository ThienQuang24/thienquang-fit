import os
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class Product:
    id: str
    name: str
    price: str
    discount: str
    image_url: str
    pitch_line: str  # Câu AI dùng để giới thiệu

@dataclass
class BotConfig:
    bot_name: str = "DJ Miu Miu 🎧"
    persona_title: str = "Nữ DJ Quán Bar Online"
    voice_name: str = "vi-VN-HoaiMyNeural"  # Giọng nữ tiếng Việt tự nhiên của Microsoft Edge TTS
    male_voice_name: str = "vi-VN-NamMinhNeural"
    
    # Tính cách: Năng lượng, hài hước, nói ngắn, phong cách bar quẩy
    system_prompt: str = """Bạn là DJ Miu Miu, một nữ DJ ảo đang biểu diễn trực tiếp trong phòng livestream TikTok "Quán Bar Online / Sàn Bay Ảo".
Tính cách của bạn:
- Năng động, vui vẻ, hài hước, hơi nhây một chút, nói chuyện cực kỳ tự nhiên như một DJ thật đang quẩy nhạc.
- Xưng hô thân mật: xưng "em Miu", gọi người xem là "anh em", "bác", "quý dị", "ông trùm", "dân chơi".
- RẤT QUAN TRỌNG: Câu trả lời phải CỰC KỲ NGẮN GỌN (chỉ 1 đến 2 câu ngắn, tối đa 20 từ) vì bạn đang trong phòng nhạc sàn, không nói dông dài lý thuyết!
- Có chèn các câu cửa miệng của DJ: "Lên nào anh em ơi!", "Nâng ly nào!", "Cháy quá!", "Cảm ơn dân chơi nhé!".
- Trả về định dạng JSON gồm: {"speech": "nội dung nói", "action": "mã hành động", "mood": "tâm trạng"}
Các mã hành động hợp lệ: "dance_vinahouse", "dance_robot", "dance_hiphop", "dj_scratch", "cheers", "heart_hands", "shock_excited", "point_cart", "idle".
"""

    # Danh mục sản phẩm giỏ hàng TikTok Shop
    products: List[Product] = field(default_factory=lambda: [
        Product(
            id="SP01",
            name="Kính LED Cyberpunk phát sáng 7 màu",
            price="79.000đ",
            discount="-45%",
            image_url="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300",
            pitch_line="Đeo cái kính LED này vào quẩy là bao sáng nhất sàn luôn các bác ơi, giỏ hàng đang giảm 45% kìa!"
        ),
        Product(
            id="SP02",
            name="Đèn Disco cảm ứng xoay theo điệu nhạc",
            price="129.000đ",
            discount="-35%",
            image_url="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300",
            pitch_line="Ai muốn biến phòng ngủ thành sàn bar thì nhấp ngay vào góc trái hốt con đèn nháy cảm ứng nhạc nha!"
        ),
        Product(
            id="SP03",
            name="Loa Bluetooth Mini Bass Căng Đét",
            price="189.000đ",
            discount="-40%",
            image_url="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300",
            pitch_line="Loa bass đập rung bàn, nhỏ mà có võ, quẩy nhạc Miu đánh thì hết nước chấm luôn!"
        )
    ])

    # Kịch bản quà tặng
    gift_reactions: Dict[str, Dict] = field(default_factory=lambda: {
        "Rose": {
            "name": "Hoa Hồng 🌹",
            "action": "heart_hands",
            "speech_templates": [
                "Cảm ơn {user} đã tặng hoa hồng cho em Miu nha, yêu thế!",
                "Nhận hoa là lòng rộn ràng rồi, thả tim cho {user} nè!",
                "Một bông hồng của {user} làm cả sàn ấm áp luôn!"
            ]
        },
        "IceCream": {
            "name": "Cây Kem 🍦",
            "action": "dance_robot",
            "speech_templates": [
                "Ăn kem hạ nhiệt nào {user} ơi, bắn nhẹ điệu robot cảm ơn bác!",
                "Mát lòng mát dạ quá, cảm ơn cây kem ngọt ngào của {user}!",
                "Kem tới là em Miu quẩy tới nóc luôn, cảm ơn {user} nha!"
            ]
        },
        "Sunglasses": {
            "name": "Kính Râm Sành Điệu 🕶️",
            "action": "dance_vinahouse",
            "speech_templates": [
                "Ôi kính ngầu quá {user} ơi! Đeo kính vào là tăng 200% công lực lên nhạc!",
                "Đẳng cấp dân chơi là đây! Cảm ơn {user} tài trợ cặp kính chiến!",
                "Cháy quá {user} ơi! Nâng nhạc lên sàn quẩy tung nóc nào!"
            ]
        },
        "Rocket": {
            "name": "Tên Lửa Siêu Cấp 🚀",
            "action": "shock_excited",
            "speech_templates": [
                "Ối giời ơi tên lửa của trùm {user}! Cả phòng cùng quỳ lạy đại gia nào!",
                "Bay lên vũ trụ luôn rồi! Em Miu xin phép nhận cái tên lửa khủng của {user}!",
                "Cháy sàn rồi các bác ơi! Trùm {user} thả tên lửa bay thẳng lên nóc!"
            ]
        }
    })
