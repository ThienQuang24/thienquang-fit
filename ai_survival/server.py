"""
server.py
Máy chủ Web FastAPI cho dự án AI Sống Còn (songcon)
- Cung cấp API trạng thái, chat trực tiếp, bình chọn, tặng quà VietQR
- Luồng sự kiện thời gian thực Server-Sent Events (SSE) qua /api/stream
- Đồng bộ cảnh 3D thời gian thực với Quaternius Models
"""
import os
import sys
import json
import time
import random
import asyncio
import urllib.parse
from typing import Dict, Any, Optional

# Đảm bảo đường dẫn gốc của app được nhận diện
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from ai_survival.game_engine import SurvivalGameEngine
from ai_survival.config import BANK_CONFIG, GIFTS

app = FastAPI(title="AI Sống Còn - Survival Reality Game")
engine = SurvivalGameEngine()

# Mount thư mục static
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "static")), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bộ nhớ lưu đơn quà tặng & mua đồ trong phiên
orders: Dict[str, Dict[str, Any]] = {}

ITEMS_CATALOG = {
    "investor": {
        "chair": {"name": "Ghế công thái học", "price": 15000, "line": "Bảy Gà: 'Thanh lý ghế gãy lưng lấy 15k nạp 4G coi bảng điện MBB! Mua cứu tui với!'"},
        "cooler": {"name": "Cây nước nóng lạnh", "price": 25000, "line": "Bảy Gà: 'Bán cây nước văn phòng lấy tiền ăn mì tôm, gồng lỗ khát khô cổ rồi!'"},
        "sofa": {"name": "Sofa tiếp khách VIP", "price": 50000, "line": "Bảy Gà: 'Bán sofa gỡ gạc, mốt khách tới đứng nói chuyện luôn cho nhanh!'"},
        "board": {"name": "Bảng vẽ biểu đồ nến", "price": 10000, "line": "Bảy Gà: 'Bán bảng nến vẽ toàn sập hầm, ai mua về vẽ nến xanh giùm tui!'"},
        "shelf": {"name": "Kệ sách làm giàu", "price": 20000, "line": "Bảy Gà: 'Thanh lý đống sách chứng khoán làm giàu, đọc xong nghèo luôn!'"},
        "rug": {"name": "Thảm trải sàn phong thủy", "price": 10000, "line": "Bảy Gà: 'Bán thảm phong thủy, lót thảm đỏ mà nến cắm mỏ đỏ lòm!'"},
        "lamp": {"name": "Đèn bàn làm việc", "price": 8000, "line": "Bảy Gà: 'Bán đèn bàn lấy tiền trả tiền net kẻo bị cắt sóng room VIP!'"}
    },
    "farmer": {
        "xoai": {"name": "Cây xoài tứ quý", "price": 30000, "line": "Vi Cá: 'Bẻ trộm cây xoài bán cho bà con lấy tiền mua phân bón nghen!'"},
        "chuoi": {"name": "Bụi chuối sau hè", "price": 15000, "line": "Vi Cá: 'Bán bụi chuối lấy tiền mua cám cho bầy cá rô ăn, mua lẹ tui cảm ơn nhiều!'"},
        "dua": {"name": "Cây dừa xiêm ngọt nước", "price": 25000, "line": "Vi Cá: 'Dừa xiêm Cần Thơ ngọt lịm, bà con mua ủng hộ tui vượt qua mùa nắng gắt nghen!'"},
        "mit": {"name": "Cây mít tố nữ", "price": 35000, "line": "Vi Cá: 'Mít chín cây thơm nức mũi, bán rẻ gom tiền nộp sinh hoạt kỳ!'"},
        "rau1": {"name": "Luống rau muống số 1", "price": 10000, "line": "Vi Cá: 'Rau muống non xanh mướt, bà con ủng hộ tui hái giao liền nghen!'"},
        "ducks": {"name": "Đàn vịt con", "price": 20000, "line": "Vi Cá: 'Bán bầy vịt lấy tiền mua thức ăn cho cá rô, cảm ơn bà con nhiều!'"}
    }
}

@app.on_event("startup")
async def startup_event():
    engine.start()

class ChatRequest(BaseModel):
    agent: str                  # 'investor' hoặc 'farmer'
    name: Optional[str] = "Ẩn danh"
    text: str
    asleep: Optional[list] = None

class VoteRequest(BaseModel):
    agent: str                  # 'investor' hoặc 'farmer'
    name: Optional[str] = "Khán giả"

class GiftRequest(BaseModel):
    agent: str                  # 'investor' hoặc 'farmer'
    gift: str                   # 'trada', 'mitom', 'banhmi', 'tamlinh'
    name: Optional[str] = ""
    guess: Optional[int] = None

class ItemOrderRequest(BaseModel):
    agent: str
    item: str
    name: Optional[str] = ""

class BankWebhookRequest(BaseModel):
    content: str
    amount: int
    trans_id: str = ""

@app.get("/api/state")
async def get_state():
    return JSONResponse(content=engine.get_full_state())

@app.get("/api/stream")
async def sse_stream(request: Request):
    """Luồng trực tiếp SSE (Server-Sent Events) đẩy tức thì cho trình duyệt."""
    async def event_generator():
        q: asyncio.Queue = asyncio.Queue()
        engine.listeners.append(q)
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(q.get(), timeout=12.0)
                    yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                except asyncio.TimeoutError:
                    # Heartbeat giữ kết nối
                    yield ": ping\n\n"
        finally:
            if q in engine.listeners:
                engine.listeners.remove(q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/chat")
async def get_chat():
    items = []
    for m in engine.chat_history:
        d = m.model_dump()
        items.append(d)
    return JSONResponse(content=items)

@app.post("/api/chat")
async def post_chat(req: ChatRequest):
    res = engine.handle_viewer_chat(req.agent, req.name or "Ẩn danh", req.text)
    return JSONResponse(content={"ok": True, "result": res})

@app.post("/api/vote")
async def post_vote(req: VoteRequest):
    res = engine.handle_vote(req.agent, req.name or "Khán giả")
    return JSONResponse(content=res)

@app.get("/api/diary")
async def get_diary(agent: str = "investor"):
    target = agent if agent in ["investor", "farmer"] else "investor"
    return JSONResponse(content=engine.diaries.get(target, []))

@app.post("/api/gift")
async def post_gift(req: GiftRequest):
    """Tạo đơn ủng hộ VietQR cho nhân vật."""
    gift_item = next((g for g in GIFTS if g.key == req.gift), None)
    if not gift_item:
        return JSONResponse(status_code=400, content={"ok": False, "detail": "Món quà không hợp lệ"})

    code = f"SC{random.randint(10000, 99999)}"
    agent_tag = "BAY GA" if req.agent == "investor" else "VI CA"
    transfer_text = f"CUU {agent_tag} {req.gift}".upper()
    memo_encoded = urllib.parse.quote(f"{transfer_text} {code}")
    acc_name_encoded = urllib.parse.quote(BANK_CONFIG["account_name"])

    qr_url = (
        f"https://img.vietqr.io/image/{BANK_CONFIG['bank_code']}-{BANK_CONFIG['account_no']}-compact2.png"
        f"?amount={gift_item.price}&addInfo={memo_encoded}&accountName={acc_name_encoded}"
    )

    orders[code] = {
        "code": code,
        "type": "gift",
        "agent": req.agent,
        "gift": req.gift,
        "gift_name": gift_item.name,
        "amount": gift_item.price,
        "name": req.name or "Ân nhân ẩn danh",
        "guess": req.guess,
        "lucky": random.randint(1, 100) if req.gift == "tamlinh" else None,
        "status": "pending",
        "created_at": time.time()
    }

    return JSONResponse(content={
        "ok": True,
        "code": code,
        "amount": gift_item.price,
        "qr_url": qr_url,
        "transfer_text": transfer_text
    })

@app.get("/api/gift/{code}")
async def check_gift(code: str):
    """Kiểm tra trạng thái đơn quà tặng hoặc đơn mua đồ."""
    order = orders.get(code)
    if not order:
        return JSONResponse(content={"status": "not_found"})

    # Mô phỏng thanh toán thành công sau 3 giây để người dùng trải nghiệm ngay (nếu chưa có webhook ngân hàng thật)
    if order["status"] == "pending" and (time.time() - order["created_at"]) >= 3.0:
        order["status"] = "paid"
        if order.get("type") == "item":
            # Xử lý mua đồ vật 3D
            ag = engine.investor if order["agent"] == "investor" else engine.farmer
            ag.cash += order["amount"]
            if order["item"] not in ag.scene["sold"]:
                ag.scene["sold"].append(order["item"])
            if order["item"] not in ag.shop["gone"]:
                ag.shop["gone"].append(order["item"])
            item_name = order.get("item_name", "đồ vật")
            thanks_txt = f"{order['name']} đã mua '{item_name}' ủng hộ {ag.name} với giá {order['amount']:,}đ!"
            engine.broadcast({
                "agent": order["agent"],
                "kind": "sale",
                "text": thanks_txt,
                "ts": time.strftime("%Y-%m-%dT%H:%M:%S")
            })
        else:
            # Xử lý tặng quà
            engine.handle_donation(order["agent"], order["name"], order["gift"])

    return JSONResponse(content={
        "status": order["status"],
        "lucky": order.get("lucky"),
        "guess": order.get("guess")
    })

@app.get("/api/item")
async def get_item(agent: str, id: str):
    """Lấy thông tin đồ vật 3D khi người xem nhấp chuột vào cảnh."""
    ag_key = "investor" if agent == "investor" else "farmer"
    agent_obj = engine.investor if ag_key == "investor" else engine.farmer
    catalog = ITEMS_CATALOG.get(ag_key, {})
    item_info = catalog.get(id)

    if not item_info:
        item_info = {
            "name": f"Vật dụng ({id})",
            "price": 10000,
            "line": f"{agent_obj.name}: 'Thanh lý món này lấy tiền sinh hoạt, mua ủng hộ tui với!'"
        }

    status = "on_sale"
    if id in agent_obj.scene.get("sold", []) or id in agent_obj.shop.get("gone", []):
        status = "sold"
    elif id in agent_obj.shop.get("held", []):
        status = "held"

    return JSONResponse(content={
        "id": id,
        "name": item_info["name"],
        "price": item_info["price"],
        "status": status,
        "line": item_info["line"]
    })

@app.post("/api/item-order")
async def post_item_order(req: ItemOrderRequest):
    """Tạo đơn mua đồ vật 3D thanh lý của nhân vật."""
    ag_key = "investor" if req.agent == "investor" else "farmer"
    catalog = ITEMS_CATALOG.get(ag_key, {})
    item_info = catalog.get(req.item, {"name": req.item, "price": 15000})

    code = f"IT{random.randint(10000, 99999)}"
    agent_tag = "BAY GA" if req.agent == "investor" else "VI CA"
    transfer_text = f"MUA {req.item.upper()}"
    memo_encoded = urllib.parse.quote(f"{transfer_text} {code}")
    acc_name_encoded = urllib.parse.quote(BANK_CONFIG["account_name"])

    qr_url = (
        f"https://img.vietqr.io/image/{BANK_CONFIG['bank_code']}-{BANK_CONFIG['account_no']}-compact2.png"
        f"?amount={item_info['price']}&addInfo={memo_encoded}&accountName={acc_name_encoded}"
    )

    orders[code] = {
        "code": code,
        "type": "item",
        "agent": req.agent,
        "item": req.item,
        "item_name": item_info["name"],
        "amount": item_info["price"],
        "name": req.name or "Người mua ẩn danh",
        "status": "pending",
        "created_at": time.time()
    }

    return JSONResponse(content={
        "ok": True,
        "code": code,
        "amount": item_info["price"],
        "qr_url": qr_url,
        "transfer_text": transfer_text
    })

@app.post("/api/webhook/bank")
async def bank_webhook(req: BankWebhookRequest):
    """Webhook tự động hứng giao dịch từ SePAY / Casso khi người xem chuyển khoản thật."""
    content_upper = req.content.upper()
    target_agent = "investor" if "BAY GA" in content_upper else "farmer" if "VI CA" in content_upper else None
    
    if not target_agent:
        return JSONResponse(content={"status": "ignored", "reason": "Không khớp cú pháp cứu AI"})

    gift_key = "trada"
    if req.amount >= 10000:
        gift_key = "tamlinh"
    elif req.amount >= 5000:
        gift_key = "banhmi"
    elif req.amount >= 3000:
        gift_key = "mitom"

    res = engine.handle_donation(target_agent, "Ân nhân chuyển khoản", gift_key)
    return JSONResponse(content={"status": "success", "result": res})

@app.api_route("/", methods=["GET", "HEAD"], response_class=HTMLResponse)
async def home():
    with open(os.path.join(os.path.dirname(__file__), "index.html"), "r", encoding="utf-8") as f:
        return f.read()

if __name__ == "__main__":
    print("=" * 65)
    print(" 🎮 KHỞI ĐỘNG HỆ THỐNG AI SỐNG CÒN (BẢY GÀ vs VI CÁ) ")
    print(" 🌐 Mở trình duyệt xem trực tiếp tại: http://localhost:8000 ")
    print("=" * 65)
    uvicorn.run("ai_survival.server:app", host="0.0.0.0", port=8000, reload=False)
