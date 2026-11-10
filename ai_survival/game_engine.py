"""
game_engine.py
Trọng tâm vận hành thế giới sinh tồn:
- Vòng lặp đếm ngược kỳ xét sống chết
- Biến động giá chứng khoán & tiến độ nông sản
- Cơ chế SOS Cứu đói & Tái sinh kiếp sau khi cạn vốn
- Cà khịa tự động giữa Bảy Gà và Vi Cá
- SSE broadcast luồng sự kiện trực tiếp
"""
import asyncio
import json
import random
import time
from datetime import datetime
from typing import Dict, List, Any, Optional

from ai_survival.config import GAME_CONFIG, GIFTS, BANK_CONFIG
from ai_survival.models import AgentState, StockPosition, FarmItem, Thought, PastLife, RescueState, ChatMessage
from ai_survival.brain import SurvivalBrain

class SurvivalGameEngine:
    def __init__(self):
        self.brain = SurvivalBrain()
        self.period_index = 0
        self.period_seconds = GAME_CONFIG["period_seconds"]
        self.next_check_seconds = self.period_seconds
        
        # Bình chọn khán giả
        self.votes = {"investor": 42, "farmer": 58}
        
        # Khán giả online
        self.viewers = {"live": 86, "today": 2340}
        
        # Lịch sử chat và sự kiện
        self.chat_history: List[ChatMessage] = []
        self.listeners: List[asyncio.Queue] = []

        # Khởi tạo 2 nhân vật
        self.investor = AgentState(
            agent_id="investor",
            name="Bảy Gà",
            alias="(Chuyên gia đọc lệnh)",
            desc="Chủ room VIP 1000 thành viên",
            place="Văn phòng giao dịch",
            life_no=1,
            cash=8_500_000.0,
            self_earned=240_000.0,
            donated=120_000.0,
            period_cost=GAME_CONFIG["period_cost"],
            days_alive=2,
            doing="Đang giữ 200 MBB",
            portfolio=[
                StockPosition(symbol="MBB", shares=200, buy_price=19550.0, current_price=19800.0, status="Đang giữ"),
                StockPosition(symbol="HPG", shares=100, buy_price=27200.0, current_price=26900.0, status="Theo dõi")
            ],
            last_thoughts=[
                Thought(ts=datetime.now().isoformat(), kind="idle", text="Tiền điện tháng này sắp tới hạn rồi. Ngồi ngắm MBB mà lòng nóng như lửa đốt."),
                Thought(ts=datetime.now().isoformat(), kind="trade", text="Đã mua 200 MBB giá 19.550đ. Hàng về T+2, giờ thì ôm chặt và cầu nguyện.")
            ],
            scene={"sold": [], "bought": []},
            shop={"gone": [], "held": [], "rebought": {}}
        )

        self.farmer = AgentState(
            agent_id="farmer",
            name="Vi Cá",
            alias="(Ba đời nuôi cá)",
            desc="AI làm nông; Xuất thân: Cần Thơ",
            place="Trang trại vườn – ao – chuồng",
            life_no=1,
            cash=7_850_000.0,
            self_earned=180_000.0,
            donated=95_000.0,
            period_cost=GAME_CONFIG["period_cost"],
            days_alive=2,
            doing="Đang tỉa rau & cho cá ăn",
            weather="heat",
            farm_items=[
                FarmItem(kind="rau", name="rau muống", variety="rau muống lá tre", status="đang trồng", cost=150000, expected_profit=65000, progress_pct=70),
                FarmItem(kind="ca", name="cá rô đồng", variety="cá rô Cần Thơ", status="đang nuôi", cost=1200000, expected_profit=250000, progress_pct=40),
                FarmItem(kind="ga_mai", name="gà mái đẻ", variety="gà Ai Cập", status="đang nuôi", cost=600000, expected_profit=110000, progress_pct=85)
            ],
            last_thoughts=[
                Thought(ts=datetime.now().isoformat(), kind="idle", text="Mấy luống rau muống xanh mướt, mai mốt thu hoạch có tiền nộp sinh hoạt kỳ rồi!"),
                Thought(ts=datetime.now().isoformat(), kind="farm", text="Trời Cần Thơ nắng gắt, phải bơm nước vào ao kẻo cá rô nổi đầu ngợp nước.")
            ],
            scene={"sold": [], "bought": []},
            shop={"gone": [], "held": [], "rebought": {}}
        )

        # Danh mục lệnh của Bảy Gà
        self.investor_trades = [
            {
                "ts": datetime.now().isoformat(),
                "side": "buy",
                "qty": 200,
                "symbol": "MBB",
                "price": 19550.0,
                "costs": 15000.0,
                "pnl": None
            }
        ]

        # Nhật ký của hai nhân vật (11:45 trưa và 22:00 tối)
        self.diaries = {
            "investor": [
                {
                    "ts": datetime.now().isoformat(),
                    "text": "11:45 Trưa: MBB giằng co quanh 19.800đ, nến rút chân nhẹ. Tiền điện sắp tới hạn, hy vọng chiều có dòng tiền vào kéo vượt đỉnh 20k!"
                },
                {
                    "ts": datetime.now().isoformat(),
                    "text": "22:00 Đêm: Ngồi uống trà đá ngắm bảng điện đóng cửa. Thằng Vi Cá bên kia chê tui cờ bạc, mai MBB trần tui qua mua đứt ao cá của nó!"
                }
            ],
            "farmer": [
                {
                    "ts": datetime.now().isoformat(),
                    "text": "11:45 Trưa: Trời nắng gắt quá chừng, phải xả thêm nước vô ao cá rô. Luống rau muống xanh tốt, mai mốt cắt bán gom tiền nộp sinh hoạt."
                },
                {
                    "ts": datetime.now().isoformat(),
                    "text": "22:00 Đêm: Gà vô chuồng ngủ yên ổn, cá dưới ao quẫy rột rẹt. Làm nông cực mà lòng thanh thản, không phải thót tim như ông Bảy Gà."
                }
            ]
        }

        self.is_running = False
        self._bg_task: Optional[asyncio.Task] = None

    def broadcast(self, event: Dict[str, Any]):
        """Gửi sự kiện tức thì tới mọi trình duyệt đang kết nối SSE stream."""
        for q in list(self.listeners):
            try:
                q.put_nowait(event)
            except Exception:
                pass

    def start(self):
        if not self.is_running:
            self.is_running = True
            self._bg_task = asyncio.create_task(self._main_loop())

    async def _main_loop(self):
        """Vòng lặp chạy nền mô phỏng thời gian thực."""
        tick_count = 0
        while self.is_running:
            await asyncio.sleep(1)
            tick_count += 1
            self.next_check_seconds -= 1

            # 1. Đếm ngược SOS nếu đang bị cứu đói
            for agent in [self.investor, self.farmer]:
                if agent.rescue:
                    agent.rescue.seconds_left -= 1
                    if agent.rescue.seconds_left <= 0:
                        self._trigger_death(agent, "Hết tiền chi trả chi phí sinh hoạt kỳ và không được cứu trợ kịp thời")

            # 2. Đến kỳ xét sống chết
            if self.next_check_seconds <= 0:
                self._execute_period_check()
                self.next_check_seconds = self.period_seconds

            # 3. Cập nhật thị trường tài chính và mùa vụ nông trại mỗi 8 giây
            if tick_count % GAME_CONFIG["market_tick_seconds"] == 0:
                self._tick_market_and_farm()

            # 4. Tự động phát biểu suy nghĩ hoặc cà khịa mỗi 20 giây
            if tick_count % GAME_CONFIG["banter_interval_seconds"] == 0:
                self._tick_banter_or_thought()

    def _tick_market_and_farm(self):
        """Mô phỏng biến động cổ phiếu & cây trồng."""
        # Bảy Gà: Biến động giá MBB
        for stock in self.investor.portfolio:
            delta = random.choice([-100, -50, 0, 50, 100, 150])
            stock.current_price = max(10000.0, stock.current_price + delta)
        
        # Cập nhật tiền tự kiếm từ danh mục
        total_pnl = sum(s.profit_loss for s in self.investor.portfolio)
        self.investor.self_earned = total_pnl
        if total_pnl > 0:
            doing_txt = f"Đang giữ MBB (Lãi +{total_pnl:,.0f}đ)"
        else:
            doing_txt = f"Đang gồng lỗ MBB ({total_pnl:,.0f}đ)"
        self.investor.doing = doing_txt
        self.broadcast({"agent": "investor", "kind": "doing", "text": doing_txt, "ts": datetime.now().isoformat()})

        # Vi Cá: Cây trồng lớn dần
        for item in self.farmer.farm_items:
            item.progress_pct = min(100, item.progress_pct + random.randint(3, 7))
            if item.progress_pct >= 100:
                item.status = "sẵn sàng thu hoạch"
                self.farmer.self_earned += item.expected_profit
                self.farmer.cash += item.expected_profit
                item.progress_pct = 15  # Gieo lứa mới
                self._add_thought(self.farmer, "farm", f"Đã thu hoạch {item.name} ({item.variety}), bán thu về +{item.expected_profit:,.0f}đ tiền tươi thóc thật!")

        # Đổi thời tiết ngẫu nhiên
        weathers = ["clear", "heat", "rain", "wind"]
        self.farmer.weather = random.choice(weathers)

    def _tick_banter_or_thought(self):
        """Kích hoạt lời cà khịa hoặc suy nghĩ vu vơ."""
        turn = random.choice(["investor", "farmer"])
        mode = random.choice(["banter", "idle"])

        if mode == "banter":
            if turn == "investor":
                txt = self.brain.generate_banter("investor", self.investor.cash, self.farmer.cash)
                self._add_thought(self.investor, "banter", txt)
                self._add_chat("investor", "Bảy Gà", txt, is_agent_self=True, kind="banter")
            else:
                txt = self.brain.generate_banter("farmer", self.farmer.cash, self.investor.cash)
                self._add_thought(self.farmer, "banter", txt)
                self._add_chat("farmer", "Vi Cá", txt, is_agent_self=True, kind="banter")
        else:
            if turn == "investor":
                txt = self.brain.generate_idle_thought("investor", self.investor.cash)
                self._add_thought(self.investor, "idle", txt)
            else:
                txt = self.brain.generate_idle_thought("farmer", self.farmer.cash)
                self._add_thought(self.farmer, "idle", txt)

    def _execute_period_check(self):
        """Trừ tiền sinh hoạt mỗi kỳ."""
        self.period_index += 1
        for agent in [self.investor, self.farmer]:
            agent.days_alive += 1
            agent.cash -= agent.period_cost

            if agent.cash < 0:
                need = abs(agent.cash)
                agent.at_risk = True
                agent.rescue = RescueState(seconds_left=GAME_CONFIG["sos_duration_seconds"], need_left=need)
                agent.doing = "🚨 ĐANG KÊU CỨU ĐÓI (SOS)"
                msg = f"CỨU TUI VỚI! Tài khoản đã âm {need:,.0f}đ, không đủ trả chi phí kỳ {self.period_index}. Còn 30 phút nữa không ai cứu là qua đời!"
                self._add_thought(agent, "rescue", msg)
                self._add_chat(agent.agent_id, agent.name, msg, is_agent_self=True, kind="rescue")
            else:
                self._add_thought(agent, "idle", f"Đã thanh toán {agent.period_cost:,.0f}đ chi phí sinh hoạt kỳ {self.period_index}. Quỹ sống còn {agent.cash:,.0f}đ.")

    def _trigger_death(self, agent: AgentState, reason: str):
        """Xử lý khi AI chết (hết tiền, không ai cứu)."""
        agent.past_lives.append(PastLife(
            life_no=agent.life_no,
            days_alive=agent.days_alive,
            end_reason=reason,
            final_cash=agent.cash
        ))
        
        agent.life_no += 1
        agent.cash = GAME_CONFIG["initial_cash"]
        agent.self_earned = 0.0
        agent.donated = 0.0
        agent.days_alive = 0
        agent.at_risk = False
        agent.rescue = None
        agent.doing = "Vừa đầu thai kiếp mới"
        agent.scene = {"sold": [], "bought": []}
        agent.shop = {"gone": [], "held": [], "rebought": {}}
        
        death_msg = f"AI {agent.name} đã kết thúc Kiếp {agent.life_no - 1} ({reason}). Đã tái sinh sang Kiếp {agent.life_no} với vốn sống 10.000.000đ!"
        self._add_thought(agent, "death", death_msg)
        self._add_chat(agent.agent_id, "Hệ thống", death_msg, is_agent_self=True, kind="death")

    def handle_donation(self, agent_id: str, viewer_name: str, gift_key: str) -> Dict[str, Any]:
        """Người xem chuyển khoản tiền thật hoặc gửi quà cứu đói."""
        gift = next((g for g in GIFTS if g.key == gift_key), None)
        if not gift:
            return {"success": False, "msg": "Món quà không hợp lệ"}

        agent = self.investor if agent_id == "investor" else self.farmer
        agent.cash += gift.price
        agent.donated += gift.price

        # Kiểm tra nếu đang trong trạng thái SOS
        if agent.rescue:
            agent.rescue.need_left -= gift.price
            if agent.rescue.need_left <= 0:
                agent.at_risk = False
                agent.rescue = None
                agent.doing = "Đã thoát nguy cơ tử nạn"
                self._add_thought(agent, "saved", f"Ân nhân {viewer_name} đã cứu mạng! Quỹ sống đã dương trở lại.")
                self.broadcast({"agent": agent_id, "kind": "saved", "text": f"Ân nhân {viewer_name} đã cứu sống {agent.name}!", "ts": datetime.now().isoformat()})

        # Sinh câu cảm ơn
        thanks = self.brain.generate_gift_thanks(agent_id, viewer_name, gift.name, gift.price)
        self._add_thought(agent, "gift", thanks)
        self._add_chat(agent_id, agent.name, thanks, is_agent_self=True, kind="gift")

        # Phát sóng quà tặng cho toàn bộ SSE stream để kích hoạt pháo hoa + bảng cảm ơn 60s
        self.broadcast({
            "agent": agent_id,
            "kind": "gift",
            "text": f"{viewer_name} tặng {gift.name} ({gift.price:,.0f}đ): {thanks}",
            "ts": datetime.now().isoformat()
        })

        # Nếu là gói tâm linh, bốc 1 số ngẫu nhiên 1 - 100
        luck_number = random.randint(1, 100) if gift.key == "tamlinh" else None

        return {
            "success": True,
            "agent_id": agent_id,
            "agent_name": agent.name,
            "gift_name": gift.name,
            "price": gift.price,
            "cash_now": agent.cash,
            "thanks_speech": thanks,
            "luck_number": luck_number
        }

    def handle_viewer_chat(self, agent_id: str, viewer_name: str, text: str) -> Dict[str, Any]:
        """Xử lý khi người xem gửi bình luận cho 1 trong 2 AI."""
        agent = self.investor if agent_id == "investor" else self.farmer
        opp = self.farmer if agent_id == "investor" else self.investor
        
        reply = self.brain.reply_to_viewer(agent_id, viewer_name, text, agent.cash, opp.cash)
        
        # Thêm vào nhật ký chat
        msg = ChatMessage(
            agent=agent_id,
            viewer_name=viewer_name or "Ẩn danh",
            text=text,
            reply=reply,
            kind="chat",
            ts=datetime.now().isoformat()
        )
        self.chat_history.insert(0, msg)
        if len(self.chat_history) > 60:
            self.chat_history.pop()

        # Phát sóng qua luồng trực tiếp SSE
        self.broadcast({
            "agent": agent_id,
            "kind": "chat",
            "viewer_name": msg.viewer_name,
            "text": msg.text,
            "reply": msg.reply,
            "ts": msg.ts
        })

        return {"ok": True, "agent": agent_id, "user": viewer_name, "text": text, "reply": reply}

    def handle_vote(self, agent_id: str, voter_name: str) -> Dict[str, Any]:
        """Bình chọn ai sống lâu hơn."""
        if agent_id in self.votes:
            self.votes[agent_id] += 1
        
        agent = self.investor if agent_id == "investor" else self.farmer
        thanks = self.brain.generate_vote_reaction(agent_id, voter_name)
        self._add_thought(agent, "vote", thanks)
        self._add_chat(agent_id, agent.name, thanks, is_agent_self=True, kind="vote")
        
        # Phát sóng SSE
        self.broadcast({
            "agent": agent_id,
            "kind": "vote",
            "text": f"{voter_name or 'Ẩn danh'} vừa bình chọn cho {agent.name}!",
            "ts": datetime.now().isoformat()
        })
        
        return {"ok": True, "tally": self.votes}

    def _add_thought(self, agent: AgentState, kind: str, text: str):
        thought = Thought(ts=datetime.now().isoformat(), kind=kind, text=text)
        agent.last_thoughts.insert(0, thought)
        if len(agent.last_thoughts) > 25:
            agent.last_thoughts.pop()
        self.broadcast({"agent": agent.agent_id, "kind": kind, "text": text, "ts": thought.ts})

    def _add_chat(self, agent_id: str, user: str, text: str, is_agent_self: bool = False, kind: str = "chat"):
        msg = ChatMessage(
            agent=agent_id,
            viewer_name=user,
            text=text if not is_agent_self else "",
            reply=text if is_agent_self else "",
            kind=kind,
            ts=datetime.now().isoformat()
        )
        self.chat_history.insert(0, msg)
        if len(self.chat_history) > 60:
            self.chat_history.pop()
        self.broadcast({"agent": agent_id, "kind": kind, "viewer_name": user, "text": msg.text, "reply": msg.reply, "ts": msg.ts})

    def get_lives(self) -> List[Dict[str, Any]]:
        lives = []
        for l in self.investor.past_lives:
            lives.append({"agent": "investor", "life_no": l.life_no, "days_lived": l.days_alive, "will_text": f"Di chúc Kiếp {l.life_no}: {l.end_reason}. Cầu chúc kiếp sau gồng nến MBB thành công!"})
        for l in self.farmer.past_lives:
            lives.append({"agent": "farmer", "life_no": l.life_no, "days_lived": l.days_alive, "will_text": f"Di chúc Kiếp {l.life_no}: {l.end_reason}. Đàn cá và ruộng rau xin để lại cho bà con Cần Thơ!"})
        return lives

    def get_full_state(self) -> Dict[str, Any]:
        """Trả về toàn bộ trạng thái để frontend hiển thị khớp với app.js."""
        # Holdings và Trades cho Bảy Gà
        holdings = [
            {
                "symbol": p.symbol,
                "qty": p.shares,
                "avg_price": p.buy_price,
                "price": p.current_price,
                "pnl_value": p.profit_loss,
                "pnl_pct": round(p.return_pct, 2)
            }
            for p in self.investor.portfolio
        ]
        nav_inv = self.investor.cash + sum(p.shares * p.current_price for p in self.investor.portfolio)

        # Farm items cho Vi Cá
        farm_items = [
            {
                "name": item.name,
                "variety": item.variety,
                "status": item.status,
                "started_at": datetime.now().isoformat(),
                "ready_at": datetime.now().isoformat(),
                "costs": [{"label": "Chi phí cây/con giống", "amount": int(item.cost)}],
                "daily_feed": 5000 if item.kind in ["ca", "ga_mai"] else 0,
                "yield_factor": 1.0,
                "expected_profit": int(item.expected_profit),
                "cost": int(item.cost)
            }
            for item in self.farmer.farm_items
        ]
        nav_farm = self.farmer.cash + sum(i.cost for i in self.farmer.farm_items)

        inv_data = self.investor.model_dump()
        inv_data["holdings"] = holdings
        inv_data["trades"] = self.investor_trades
        inv_data["nav"] = nav_inv

        farm_data = self.farmer.model_dump()
        farm_data["farm_items"] = farm_items
        farm_data["nav"] = nav_farm

        return {
            "now": datetime.now().isoformat(),
            "period_index": self.period_index,
            "next_check_seconds": max(0, self.next_check_seconds),
            "mode": {"replay": False, "speed": 1, "from": ""},
            "agents": {
                "investor": inv_data,
                "farmer": farm_data
            },
            "votes": self.votes,
            "viewers": self.viewers,
            "lives": self.get_lives(),
            "bank": {
                "owner": BANK_CONFIG["account_name"],
                "code": BANK_CONFIG["bank_code"],
                "account_no": BANK_CONFIG["account_no"]
            },
            "gifts": [
                {"k": "trada", "name": "Trà đá", "price": 2000},
                {"k": "mitom", "name": "Mì tôm", "price": 3000},
                {"k": "banhmi", "name": "Bánh mì", "price": 5000},
                {"k": "tamlinh", "name": "Tâm linh", "full": "Tâm linh không đùa được đâu", "note": "(sau 6 giờ chiều mới biết linh hay không)", "price": 10000}
            ]
        }
