"""
actions.py
Định nghĩa các động tác và trạng thái của DJ Bot.
Các action này tương ứng với animation/phím tắt gửi sang VTube Studio, OBS, hoặc Web Canvas.
"""
from enum import Enum

class BotAction(str, Enum):
    IDLE = "idle"                        # Đứng nhún nhảy theo nhạc
    DANCE_VINAHOUSE = "dance_vinahouse"  # Quẩy nhạc sàn Vinahouse tay giơ cao
    DANCE_ROBOT = "dance_robot"          # Nhảy robot giật giật
    DANCE_HIPHOP = "dance_hiphop"        # Nhảy hiphop lắc lư
    DJ_SCRATCH = "dj_scratch"            # Động tác đeo tai nghe chà đĩa DJ
    CHEERS = "cheers"                    # Nâng ly bia/rượu chúc mừng
    HEART_HANDS = "heart_hands"          # Bắn tim, làm dáng dễ thương
    SHOCK_EXCITED = "shock_excited"      # Choáng ngợp, nhảy tưng bừng khi nhận quà to
    POINT_CART = "point_cart"            # Chỉ tay về phía góc trái màn hình (giỏ hàng)

ACTION_DESCRIPTIONS = {
    BotAction.IDLE: "Đang nhún nhảy theo điệu beat nhẹ",
    BotAction.DANCE_VINAHOUSE: "Quẩy Vinahouse cực căng, hai tay đưa lên!",
    BotAction.DANCE_ROBOT: "Chuyển sang điệu nhảy Robot giật cục",
    BotAction.DANCE_HIPHOP: "Lắc lư Hiphop swag",
    BotAction.DJ_SCRATCH: "Đeo tai nghe, chà đĩa DJ scratch điêu luyện",
    BotAction.CHEERS: "Nâng ly lên: 1, 2, 3 zô!",
    BotAction.HEART_HANDS: "Hai tay tạo hình trái tim ngọt ngào",
    BotAction.SHOCK_EXCITED: "Tột đỉnh sung sướng, nhảy tung sàn!",
    BotAction.POINT_CART: "Chỉ tay góc trái: Xem giỏ hàng kìa các bác!"
}
