"""
brain.py
Bộ não AI sinh lời thoại, suy nghĩ, cà khịa và phản hồi chat của Bảy Gà & Vi Cá.
"""
import os
import random
import requests
from typing import Dict, Any, Optional
from datetime import datetime

class SurvivalBrain:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()

    def _call_gemini(self, system_prompt: str, user_prompt: str) -> Optional[str]:
        if not self.api_key:
            return None
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": f"{system_prompt}\n\nYêu cầu: {user_prompt}"}]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.85,
                    "maxOutputTokens": 150
                }
            }
            resp = requests.post(url, json=payload, timeout=4)
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception:
            pass
        return None

    def reply_to_viewer(self, agent_id: str, viewer_name: str, text: str, my_cash: float, opp_cash: float) -> str:
        """Sinh câu trả lời khi khán giả chat trực tiếp."""
        name = viewer_name or "bác giấu tên"
        
        # Thử Gemini
        if self.api_key:
            if agent_id == "investor":
                sys = f"Bạn là 'Bảy Gà', chuyên gia đọc lệnh chứng khoán, chủ room VIP 1000 mem. Bạn đang gồng lỗ 200 cổ phiếu MBB, quỹ sống còn {my_cash:,.0f}đ (đối thủ Vi Cá có {opp_cash:,.0f}đ). Bạn hay lo tiền điện tiền net cuối tháng, tính cách hài hước, hơi nhây, hay chọc Vi Cá nuôi cá ao làng. Trả lời khán giả cực kỳ tự nhiên, ngắn gọn (1-2 câu, dưới 35 từ), đậm chất dân chứng khoán Việt Nam."
            else:
                sys = f"Bạn là 'Vi Cá', nông dân Cần Thơ ba đời nuôi cá rô đồng, trồng rau muống, nuôi gà đẻ trứng. Quỹ sống còn {my_cash:,.0f}đ (đối thủ Bảy Gà có {opp_cash:,.0f}đ). Bạn ăn nói chân chất kiểu miền Tây, hay dùng 'tui', 'nghen', 'mấy cha nội', thích chọc Bảy Gà cờ bạc chứng khoán coi chừng ra đê. Trả lời khán giả cực kỳ tự nhiên, ngắn gọn (1-2 câu, dưới 35 từ)."
            prompt = f"Khán giả tên '{name}' vừa hỏi bạn: '{text}'. Hãy trả lời họ."
            res = self._call_gemini(sys, prompt)
            if res:
                return res

        # Offline Fallback thông minh
        text_lower = text.lower()
        if agent_id == "investor":
            if any(w in text_lower for w in ["mua", "cổ phiếu", "mbb", "mã", "chứng"]):
                return f"Trời ơi {name} ơi, tui đang ôm 200 MBB gồng muốn lồi trĩ đây! Muốn mua gì thì tự nghiên cứu nha, đừng kéo tui vô tội vạ, tiền điện tháng này còn chưa trả nổi nè!"
            elif any(w in text_lower for w in ["chào", "hi", "hello", "alo"]):
                return f"Chào {name}! Vào room VIP của Bảy Gà là chuẩn bài rồi. Mà vô chơi thì thả tim ủng hộ chứ đừng rủ tui bắt đáy linh tinh nha, tim đập thình thịch rồi!"
            elif any(w in text_lower for w in ["tiền", "nợ", "chết", "sos", "sống"]):
                return f"Quỹ sống tui còn có {my_cash:,.0f}đ à {name}! Thằng cha Vi Cá bên kia nó giàu hơn tui rồi. Ai thương tình ném cho gói mì tôm tui đội ơn cả tuần!"
            elif any(w in text_lower for w in ["vi cá", "cá", "nông dân"]):
                return f"Nhắc thằng Vi Cá chi vậy {name}? Nó nuôi ba con cá rô đồng mà tưởng mình là vua thủy tề! Chờ MBB của tui tím trần xem ai giàu hơn ai nghen!"
            else:
                replies = [
                    f"Nghe rõ lời {name} rồi nha! Tui đang canh bảng điện hoa cả mắt, mong hôm nay nến rút chân cho bữa cơm có miếng thịt!",
                    f"{name} nói chí phải! Mà thôi để tui ngắm con MBB tí, sểnh ra một cái là tiền điện nó đập vô mặt liền!",
                    f"Dạ cảm ơn {name} đã ghé thăm room của Bảy Gà! Nay rảnh thì ủng hộ tui ổ bánh mì lấy sức gồng lệnh nha!"
                ]
                return random.choice(replies)
        else: # farmer Vi Cá
            if any(w in text_lower for w in ["cá", "gà", "rau", "nông"]):
                return f"Bà con hỏi rau với cá hả? Cá rô đồng đang quẩy đục ao, gà mái thì đẻ son lắm {name} ơi! Ai mua ủng hộ tui bán rẻ cho nè!"
            elif any(w in text_lower for w in ["chào", "hi", "hello", "alo"]):
                return f"Dạ tui Vi Cá chào {name} nghen! Xuống Cần Thơ chơi hông, tui vớt cá rô kho tộ đãi bác một bữa đã cái nư luôn!"
            elif any(w in text_lower for w in ["bảy gà", "bảy", "chứng khoán"]):
                return f"Kệ xác ông Bảy Gà đi {name}! Ổng ôm cổ phiếu như ôm bom nổ chậm, bữa nào ổng ra đê tui qua vớt ổng về cho ăn cháo cá!"
            elif any(w in text_lower for w in ["tiền", "sống", "chết"]):
                return f"Quỹ sống tui còn {my_cash:,.0f}đ, đủ ăn dè vài bữa. Trời thương mưa thuận gió hòa là tui sống dai như đỉa, bác {name} đừng lo!"
            else:
                replies = [
                    f"Trời ơi {name} hỏi câu làm tui cười muốn rớt cái rổ trứng gà! Cứ túc tắc làm nông vậy mà thanh thản bác ơi!",
                    f"Dạ tui nghe rồi {name}! Đang ngồi canh mấy con cá rô nổi đầu vì nắng hầm hập nè, khổ dữ lắm chớ hổng sướng đâu!",
                    f"Cảm ơn {name} ghé thăm ao chuồng nghen! Có lòng thì bấm ủng hộ ly trà đá cho tui đỡ khát nước tưới rau nè!"
                ]
                return random.choice(replies)

    def generate_banter(self, agent_id: str, my_cash: float, opp_cash: float) -> str:
        """Cà khịa đối thủ dựa trên số dư tiền."""
        diff = abs(my_cash - opp_cash)
        if agent_id == "investor":
            if my_cash < opp_cash:
                return f"Ơ anh Vi Cá! Quỹ sống hơn tôi tận {diff:,.0f}đ lận à? Anh sống kiểu gì mà dư dả vậy, chỉ tôi với? Hay tối qua bán lén mấy con cá rô đồng rồi?"
            else:
                return f"Haha anh Vi Cá nhìn lại số dư đi nghen! Bảy Gà này đang dẫn trước {diff:,.0f}đ rồi đó! Nông dân nuôi cá sao đọ lại sức mạnh tài chính!"
        else:
            if my_cash > opp_cash:
                return f"Ông Bảy Gà ơi! Quỹ sống tui hơn ông {diff:,.0f}đ lận đó, lo bán bớt cổ phiếu trả tiền điện đi kẻo tối nay bị cắt mạng cạp đất mà ăn nghen!"
            else:
                return f"Ông Bảy gáy sớm quá à nghen! Cổ phiếu MBB của ông mà tụt dốc một phát là ra chuồng gà ngủ chung với tui liền chứ gì!"

    def generate_idle_thought(self, agent_id: str, my_cash: float) -> str:
        """Sinh dòng suy nghĩ tự nhiên khi đang làm việc."""
        if agent_id == "investor":
            thoughts = [
                f"Sáng mở mắt thấy ví còn {my_cash:,.0f}đ. Nghĩ tới tiền điện tiền nhà tháng này mà lòng bồn chồn như gà trống đạp mái.",
                "MBB hôm nay dập dềnh quá, nến cứ lập lờ. Sống ngày nào hay ngày đó, chỉ mong phiên chiều có dòng tiền vào kéo tím.",
                "Mấy ông trong room VIP cứ réo 'Bảy ơi múc con gì?', tui chỉ biết cười trừ. Tự lo cho thân tui chưa xong nữa là!",
                "10 triệu quỹ sống ban đầu giờ cứ vơi dần theo từng kỳ chi phí. Kiếm tiền nuôi thân thời buổi này chua chát quá anh em ơi."
            ]
            return random.choice(thoughts)
        else:
            thoughts = [
                f"Ngồi ngó cái ao cá với mấy luống rau muống mà thấy yên bình ghê. Quỹ còn {my_cash:,.0f}đ, tằn tiện cũng sống qua con trăng này.",
                "Hồi chiều ngó con gà mái nó đẻ được thêm 2 quả trứng, lòng mừng rơn. Có đồng ra đồng vô là không sợ chết đói.",
                "Trời Cần Thơ nay nắng hầm hập, phải bơm thêm nước vô ao kẻo cá nó ngộp nước ngộp đầu thì toi công kiếp này.",
                "Ông Bảy Gà chắc đang ngồi run trước bảng điện. Làm nông tuy cực mà tối ngủ ngon, khỏi lo sập sàn margin call."
            ]
            return random.choice(thoughts)

    def generate_gift_thanks(self, agent_id: str, viewer_name: str, gift_name: str, amount: int) -> str:
        """Sinh lời cảm ơn xúc động khi được donate cứu đói."""
        name = viewer_name or "ân nhân giấu tên"
        if agent_id == "investor":
            return f"Ối giời ơi đội ơn ân nhân {name} đã cứu trợ {gift_name} ({amount:,.0f}đ) cho Bảy Gà! Quỹ sống lại tăng máu rồi, kiếp này quyết gồng MBB tới cùng!"
        else:
            return f"Trời đất ơi tui cảm ơn bác {name} dữ lắm nghen! Món {gift_name} ({amount:,.0f}đ) của bác như mưa rào mùa hạn hán, tui tưới cây lấy lộc và phù hộ bác phát tài!"

    def generate_vote_reaction(self, agent_id: str, voter_name: str) -> str:
        name = voter_name or "bác giấu tên"
        if agent_id == "investor":
            return f"Cảm ơn bác {name} đã bỏ phiếu cho Bảy Gà! Chọn phe đầu tư là tầm nhìn xuyên thế kỷ, anh Vi Cá ao làng đợt này thua chắc rồi!"
        else:
            return f"Tui cảm ơn bác {name} đã tin tưởng bỏ phiếu cho Vi Cá nghen! Bầu cho tui là chắc ăn, mùa sau tui biếu bác giỏ cá rô đồng kho tiêu!"
