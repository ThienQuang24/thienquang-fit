"""
bot.py
Trọng tâm điều phối AI DJ Bot:
Kết hợp Trí não (Brain) + Giọng nói (TTS) + Động tác (Actions) + Giỏ hàng (Shop)
"""
import asyncio
from typing import Dict, Any, Optional
from ai_dj_bot.config import BotConfig
from ai_dj_bot.actions import BotAction, ACTION_DESCRIPTIONS
from ai_dj_bot.brain import AIBrain
from ai_dj_bot.tts import text_to_speech_base64

class AIDJBot:
    def __init__(self, config: Optional[BotConfig] = None):
        self.config = config or BotConfig()
        self.brain = AIBrain(self.config)
        self.current_action = BotAction.IDLE.value

    async def on_comment(self, username: str, comment_text: str, generate_voice: bool = True) -> Dict[str, Any]:
        """Xử lý khi có khán giả comment trong phòng Live."""
        result = self.brain.respond_to_comment(username, comment_text)
        action = result.get("action", BotAction.IDLE.value)
        self.current_action = action
        
        audio_url = None
        if generate_voice and result.get("speech"):
            try:
                audio_url = await text_to_speech_base64(result["speech"], voice=self.config.voice_name)
            except Exception as e:
                print(f"[TTS Error]: {e}")

        return {
            "type": "comment_reply",
            "user": username,
            "comment": comment_text,
            "speech": result["speech"],
            "action": action,
            "action_desc": ACTION_DESCRIPTIONS.get(BotAction(action), action),
            "mood": result.get("mood", "vui vẻ"),
            "audio_url": audio_url
        }

    async def on_gift(self, username: str, gift_type: str, count: int = 1, generate_voice: bool = True) -> Dict[str, Any]:
        """Xử lý khi có khán giả tặng quà (Donate quà TikTok)."""
        result = self.brain.respond_to_gift(username, gift_type, count)
        action = result.get("action", BotAction.HEART_HANDS.value)
        self.current_action = action

        audio_url = None
        if generate_voice and result.get("speech"):
            try:
                audio_url = await text_to_speech_base64(result["speech"], voice=self.config.voice_name)
            except Exception as e:
                print(f"[TTS Error]: {e}")

        return {
            "type": "gift_reply",
            "user": username,
            "gift_type": gift_type,
            "gift_name": result.get("gift_name", gift_type),
            "count": count,
            "speech": result["speech"],
            "action": action,
            "action_desc": ACTION_DESCRIPTIONS.get(BotAction(action), action),
            "mood": result.get("mood", "phấn khích"),
            "audio_url": audio_url
        }

    async def on_idle(self, generate_voice: bool = True) -> Dict[str, Any]:
        """Hâm nóng không khí khi phòng live im ắng."""
        result = self.brain.get_idle_speech()
        action = result.get("action", BotAction.DJ_SCRATCH.value)
        self.current_action = action

        audio_url = None
        if generate_voice and result.get("speech"):
            try:
                audio_url = await text_to_speech_base64(result["speech"], voice=self.config.voice_name)
            except Exception as e:
                print(f"[TTS Error]: {e}")

        return {
            "type": "idle_chatter",
            "speech": result["speech"],
            "action": action,
            "action_desc": ACTION_DESCRIPTIONS.get(BotAction(action), action),
            "mood": result.get("mood", "sôi nổi"),
            "audio_url": audio_url
        }

    async def on_shop_pitch(self, generate_voice: bool = True) -> Dict[str, Any]:
        """Nhắc khéo người xem bấm vào giỏ hàng mua đồ."""
        result = self.brain.get_shop_pitch()
        action = BotAction.POINT_CART.value
        self.current_action = action

        audio_url = None
        if generate_voice and result.get("speech"):
            try:
                audio_url = await text_to_speech_base64(result["speech"], voice=self.config.voice_name)
            except Exception as e:
                print(f"[TTS Error]: {e}")

        return {
            "type": "shop_pitch",
            "speech": result["speech"],
            "action": action,
            "action_desc": ACTION_DESCRIPTIONS.get(BotAction(action), action),
            "product_id": result["product_id"],
            "product_name": result["product_name"],
            "product_price": result["product_price"],
            "mood": result.get("mood", "bán hàng vui vẻ"),
            "audio_url": audio_url
        }
