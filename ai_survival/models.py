"""
models.py
Định nghĩa cấu trúc dữ liệu cho game AI Sống Còn
"""
import time
from datetime import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class StockPosition(BaseModel):
    symbol: str
    shares: int
    buy_price: float
    current_price: float
    status: str = "Đang giữ"

    @property
    def profit_loss(self) -> float:
        return (self.current_price - self.buy_price) * self.shares

    @property
    def return_pct(self) -> float:
        if self.buy_price == 0:
            return 0.0
        return ((self.current_price - self.buy_price) / self.buy_price) * 100

class FarmItem(BaseModel):
    kind: str                   # 'rau', 'ca', 'ga_mai'
    name: str                   # 'rau', 'cá', 'gà mái đẻ'
    variety: str                # 'rau muống', 'cá rô đồng', 'gà Ai Cập'
    status: str                 # 'đang trồng', 'đang nuôi', 'thu hoạch'
    cost: float
    expected_profit: float
    progress_pct: int = 10      # Tiến độ từ 0% đến 100%

class Thought(BaseModel):
    ts: str
    kind: str                   # 'idle', 'banter', 'trade', 'farm', 'vote', 'gift', 'rescue', 'diary'
    text: str

class PastLife(BaseModel):
    life_no: int
    days_alive: int
    end_reason: str
    final_cash: float

class RescueState(BaseModel):
    seconds_left: int
    need_left: float

class AgentState(BaseModel):
    agent_id: str               # 'investor' hoặc 'farmer'
    name: str                   # 'Bảy Gà' hoặc 'Vi Cá'
    alias: str                  # '(Chuyên gia đọc lệnh)' hoặc '(Ba đời nuôi cá)'
    desc: str
    place: str                  # 'Văn phòng giao dịch' hoặc 'Trang trại vườn – ao – chuồng'
    life_no: int = 1
    cash: float = 10_000_000.0
    self_earned: float = 0.0
    donated: float = 0.0
    period_cost: int = 400_000
    days_alive: int = 0
    doing: str = "Đang quan sát"
    at_risk: bool = False
    rescue: Optional[RescueState] = None
    last_thoughts: List[Thought] = Field(default_factory=list)
    diary: str = ""
    past_lives: List[PastLife] = Field(default_factory=list)
    scene: Dict[str, List[str]] = Field(default_factory=lambda: {"sold": [], "bought": []})
    shop: Dict[str, Any] = Field(default_factory=lambda: {"gone": [], "held": [], "rebought": {}})
    
    # Riêng cho Bảy Gà (investor)
    portfolio: List[StockPosition] = Field(default_factory=list)
    
    # Riêng cho Vi Cá (farmer)
    farm_items: List[FarmItem] = Field(default_factory=list)
    weather: str = "clear"      # 'clear', 'heat', 'rain', 'wind'

class ChatMessage(BaseModel):
    agent: str                  # 'investor' hoặc 'farmer'
    viewer_name: str
    text: str
    reply: str
    kind: str = "chat"          # 'chat', 'gift', 'vote', 'taunt', 'banter', 'sos'
    ts: str = Field(default_factory=lambda: datetime.now().isoformat())
