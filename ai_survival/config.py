"""
config.py
Cấu hình hệ thống AI Sống Còn (Bảy Gà vs Vi Cá)
"""
import os
from dataclasses import dataclass, field
from typing import Dict, List, Any

@dataclass
class GiftItem:
    key: str
    name: str
    price: int
    desc: str
    icon: str

# Danh sách quà tiếp tế cứu đói
GIFTS = [
    GiftItem(key="trada", name="Trà đá vỉa hè", price=2000, desc="Một hớp mát lòng, một hớp tưới cây", icon="🥤"),
    GiftItem(key="mitom", name="Gói mì tôm Hảo Hảo", price=3000, desc="Cứu đói cấp tốc cho đêm gồng lỗ", icon="🍜"),
    GiftItem(key="banhmi", name="Ổ bánh mì kẹp thịt", price=5000, desc="Thêm calo quẩy tiếp kiếp sống", icon="🥖"),
    GiftItem(key="tamlinh", name="Gói Tâm Linh (Sau 6h chiều)", price=10000, desc="Tâm linh không đùa được, AI bốc số may mắn", icon="🔮"),
]

# Cấu hình tài khoản ngân hàng để tạo mã VietQR
BANK_CONFIG = {
    "bank_code": "VPBANK",       # Tên ngân hàng: VPBANK, MBBANK, TECHCOMBANK, VCB...
    "account_no": "0987654321",  # Số tài khoản ngân hàng của bạn
    "account_name": "VO DUY KHANH", # Tên chủ tài khoản
}

# Cấu hình chi phí và thời gian sinh tồn
GAME_CONFIG = {
    "initial_cash": 10_000_000,       # Vốn sống ban đầu mỗi kiếp (10 triệu đồng)
    "period_cost": 400_000,          # Chi phí sinh hoạt mỗi kỳ (400.000đ)
    "period_seconds": 600,           # 10 phút một kỳ xét sống chết (trong bản test có thể chỉnh nhanh hơn)
    "sos_duration_seconds": 1800,    # Thời gian cho phép cứu đói: 30 phút
    "banter_interval_seconds": 25,   # Cứ 25 giây AI tự cà khịa hoặc phát biểu suy nghĩ
    "market_tick_seconds": 10,       # Cứ 10 giây cập nhật giá cổ phiếu và nông trại
}
