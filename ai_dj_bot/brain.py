"""
brain.py
Bộ não AI xử lý ngôn ngữ tự nhiên & phản hồi cho DJ Bot.
Hỗ trợ cả 2 chế độ:
1. Gemini API (khi có GEMINI_API_KEY)
2. Smart Offline Engine (tự động phân tích từ khóa, trả lời cực hài và nhạy khi chưa gắn API Key)
"""
import os
import json
import random
import requests
from typing import Dict, Any, Optional
from ai_dj_bot.config import BotConfig, Product
from ai_dj_bot.actions import BotAction

class AIBrain:
    def __init__(self, config: Optional[BotConfig] = None):
        self.config = config or BotConfig()
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()

    def _call_gemini(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Gọi Gemini API bằng REST endpoint trực tiếp để có độ trễ thấp và không phụ thuộc nặng thư viện."""
        if not self.api_key:
            return None
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": f"{self.config.system_prompt}\n\nYêu cầu: {prompt}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.8,
                    "maxOutputTokens": 150,
                    "responseMimeType": "application/json"
                }
            }
            resp = requests.post(url, json=payload, timeout=4)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
        except Exception as e:
            # Nếu lỗi mạng hoặc API key hết hạn, tự động fallback về Offline Engine
            pass
        return None

    def respond_to_comment(self, username: str, comment: str) -> Dict[str, Any]:
        """Xử lý comment của người xem."""
        # Thử gọi Gemini nếu có key
        if self.api_key:
            prompt = f'Khán giả "{username}" vừa bình luận: "{comment}". Hãy phản hồi ngắn gọn (dưới 20 từ) như một DJ bar online.'
            res = self._call_gemini(prompt)
            if res and "speech" in res:
                return {
                    "speech": res.get("speech", ""),
                    "action": res.get("action", BotAction.IDLE.value),
                    "mood": res.get("mood", "vui vẻ")
                }

        # Offline Engine: Phân tích ngữ cảnh thông minh
        text_lower = comment.lower()
        
        # Nhóm chào hỏi
        if any(w in text_lower for w in ["chào", "hi", "hello", "hế lô", "miu ơi"]):
            greetings = [
                f"Hế lô {username} đã ghé quầy bar của Miu nha! Quẩy lên nào!",
                f"Chào dân chơi {username}! Nay muốn nghe bài gì để Miu lên nhạc nào?",
                f"A chào bác {username}! Ghé quán là phải làm một ly nha!",
            ]
            return {
                "speech": random.choice(greetings),
                "action": BotAction.CHEERS.value,
                "mood": "hào hứng"
            }

        # Nhóm xin bài / yêu cầu nhạc
        elif any(w in text_lower for w in ["nhạc", "bài", "vinahouse", "remix", "bass", "căng"]):
            music_replies = [
                f"Bass này đủ căng chưa {username} ơi! Lên nóc nhà bắt con gà luôn!",
                f"Đã nhận yêu cầu của {username}! Cháy máy cùng em Miu nào quý dị!",
                f"Nhạc này mà không quẩy thì phí tuổi trẻ lắm {username} ơi!",
            ]
            return {
                "speech": random.choice(music_replies),
                "action": BotAction.DANCE_VINAHOUSE.value,
                "mood": "quẩy sung"
            }

        # Nhóm khen / tán tỉnh
        elif any(w in text_lower for w in ["xinh", "đẹp", "dễ thương", "iu", "yêu", "cute", "ngon"]):
            flirt_replies = [
                f"Cảm ơn {username} đã khen nha! Mũi Miu sắp nổ to bằng cái loa rồi nè!",
                f"Bác {username} dẻo miệng thế! Tặng em bông hồng là em nhận lời yêu luôn!",
                f"Ngại ghê cơ! Thả tim cho bác {username} một cái thật to nè!",
            ]
            return {
                "speech": random.choice(flirt_replies),
                "action": BotAction.HEART_HANDS.value,
                "mood": "ngại ngùng, vui sướng"
            }

        # Nhóm hỏi giỏ hàng / đồ đạc / giá
        elif any(w in text_lower for w in ["giỏ", "mua", "kính", "đèn", "shop", "bao nhiêu", "giá"]):
            prod = random.choice(self.config.products)
            return {
                "speech": f"Bác {username} nhìn góc trái giỏ hàng nha! Con {prod.name} đang giảm {prod.discount} hời lắm!",
                "action": BotAction.POINT_CART.value,
                "mood": "nhiệt tình bán hàng"
            }

        # Nhóm say xỉn / đi bar
        elif any(w in text_lower for w in ["say", "bia", "rượu", "uống", "nâng ly", "zô"]):
            drinks = [
                f"Ai say trước người đó trả tiền nha {username}! 1 2 3 zô nào!",
                f"Hôm nay không say không về nhé {username}! Ly này Miu mời bác!",
                f"Uống online nhưng tình cảm là thật nha dân chơi {username}!"
            ]
            return {
                "speech": random.choice(drinks),
                "action": BotAction.CHEERS.value,
                "mood": "say mê"
            }

        # Phản hồi mặc định phong cách DJ
        default_replies = [
            f"Nghe rõ lời nhắn của {username} rồi nha! Quẩy hết mình đêm nay nào!",
            f"Chuẩn luôn {username} ơi! Đêm còn dài, nhạc còn căng!",
            f"Dân chơi {username} nói chỉ có chuẩn! Cháy lên anh em ơi!"
        ]
        return {
            "speech": random.choice(default_replies),
            "action": BotAction.DJ_SCRATCH.value,
            "mood": "năng lượng"
        }

    def respond_to_gift(self, username: str, gift_type: str, count: int = 1) -> Dict[str, Any]:
        """Xử lý khi có người tặng quà."""
        reaction = self.config.gift_reactions.get(gift_type)
        if not reaction:
            reaction = {
                "name": gift_type,
                "action": BotAction.HEART_HANDS.value,
                "speech_templates": [
                    f"Cảm ơn đại gia {{user}} đã tặng {gift_type} cho Miu nha!",
                    f"Trời ơi yêu {{user}} quá, cảm ơn món quà xịn xò này nha!"
                ]
            }

        template = random.choice(reaction["speech_templates"])
        speech = template.format(user=username, count=count)
        
        return {
            "speech": speech,
            "action": reaction["action"],
            "gift_name": reaction["name"],
            "count": count,
            "mood": "cực kỳ phấn khích"
        }

    def get_idle_speech(self) -> Dict[str, Any]:
        """Tự động nói khi phòng live vắng hoặc lâu không có comment (hâm nóng không khí)."""
        idle_phrases = [
            "Các bác ơi nhạc đang lên căng quá, ai đang nghe cho Miu xin cánh tay nào!",
            "Anh em trong sàn đâu hết rồi? Thả tim cho màn hình đỡ nguội nào quý dị!",
            "Nhạc hay thế này mà ngồi im là có lỗi với bản thân lắm nha các dân chơi!",
            "Ai chưa follow thì bấm theo dõi Miu để mỗi tối vào quẩy bar online nha!",
            "Đêm nay ai thức cùng Miu giơ tay nào! Lên là lên là lên!"
        ]
        actions = [BotAction.DJ_SCRATCH.value, BotAction.DANCE_VINAHOUSE.value, BotAction.CHEERS.value]
        return {
            "speech": random.choice(idle_phrases),
            "action": random.choice(actions),
            "mood": "sôi nổi"
        }

    def get_shop_pitch(self) -> Dict[str, Any]:
        """Tự động nhắc khéo về sản phẩm trong giỏ hàng một cách tự nhiên."""
        product = random.choice(self.config.products)
        return {
            "speech": product.pitch_line,
            "action": BotAction.POINT_CART.value,
            "product_id": product.id,
            "product_name": product.name,
            "product_price": product.price,
            "mood": "giới thiệu vui vẻ"
        }
