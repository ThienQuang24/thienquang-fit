"""
web_simulator.py
Ứng dụng Web mô phỏng phòng TikTok Live "Quán Bar Online" với AI DJ Miu Miu.
Chạy ứng dụng:
    .venv/bin/python3 web_simulator.py
Sau đó mở trình duyệt tại: http://localhost:8000
"""
import os
import asyncio
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from ai_dj_bot.bot import AIDJBot
from ai_dj_bot.config import BotConfig

app = FastAPI(title="TikTok Live AI DJ Simulator")
bot = AIDJBot()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommentRequest(BaseModel):
    username: str
    comment: str

class GiftRequest(BaseModel):
    username: str
    gift_type: str
    count: int = 1

@app.post("/api/comment")
async def handle_comment(req: CommentRequest):
    res = await bot.on_comment(req.username, req.comment, generate_voice=True)
    return JSONResponse(content=res)

@app.post("/api/gift")
async def handle_gift(req: GiftRequest):
    res = await bot.on_gift(req.username, req.gift_type, req.count, generate_voice=True)
    return JSONResponse(content=res)

@app.post("/api/idle")
async def handle_idle():
    res = await bot.on_idle(generate_voice=True)
    return JSONResponse(content=res)

@app.post("/api/shop")
async def handle_shop():
    res = await bot.on_shop_pitch(generate_voice=True)
    return JSONResponse(content=res)

@app.get("/api/products")
async def get_products():
    return JSONResponse(content=[p.__dict__ for p in bot.config.products])

@app.get("/", response_class=HTMLResponse)
async def index():
    html_content = """<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mô Phỏng TikTok Live - AI Quán Bar Online</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-dark: #0a0b10;
            --card-bg: #13151f;
            --tiktok-red: #fe2c55;
            --tiktok-cyan: #25f4ee;
            --neon-pink: #ff2a85;
            --neon-blue: #00e5ff;
            --neon-yellow: #ffea00;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body {
            background: var(--bg-dark);
            color: #fff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow-x: hidden;
        }

        .container {
            display: flex;
            gap: 25px;
            max-width: 1200px;
            width: 100%;
            height: 90vh;
        }

        /* KHUNG ĐIỆN THOẠI TIKTOK LIVE */
        .phone-frame {
            width: 420px;
            flex-shrink: 0;
            background: #000;
            border-radius: 40px;
            border: 4px solid #2a2e42;
            box-shadow: 0 0 40px rgba(0, 229, 255, 0.15), 0 20px 40px rgba(0,0,0,0.8);
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        /* NỀN QUÁN BAR VÀ HIỆU ỨNG ÁNH SÁNG */
        .live-stage {
            position: absolute;
            inset: 0;
            background: radial-gradient(circle at 50% 30%, #34123f 0%, #0d0b1a 60%, #05040a 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        /* LASER VÀ DISCO LIGHTS */
        .laser-beam {
            position: absolute;
            top: 0;
            width: 2px;
            height: 100%;
            background: linear-gradient(to bottom, var(--neon-pink), transparent);
            filter: drop-shadow(0 0 8px var(--neon-pink));
            opacity: 0.6;
            animation: sweep 4s infinite alternate ease-in-out;
        }
        .laser-beam:nth-child(2) {
            background: linear-gradient(to bottom, var(--neon-blue), transparent);
            filter: drop-shadow(0 0 8px var(--neon-blue));
            animation: sweep-alt 3s infinite alternate ease-in-out;
        }

        @keyframes sweep {
            0% { transform: rotate(-35deg) scaleY(1.3); }
            100% { transform: rotate(35deg) scaleY(1.3); }
        }
        @keyframes sweep-alt {
            0% { transform: rotate(40deg) scaleY(1.3); }
            100% { transform: rotate(-40deg) scaleY(1.3); }
        }

        /* HEADER TIKTOK */
        .live-header {
            position: relative;
            z-index: 20;
            padding: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
        }
        .host-badge {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(8px);
            padding: 5px 12px 5px 6px;
            border-radius: 30px;
            border: 1px solid rgba(255,255,255,0.1);
        }
        .host-avatar {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: linear-gradient(45deg, var(--tiktok-red), var(--tiktok-cyan));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 0 10px var(--tiktok-red);
        }
        .host-name { font-size: 13px; font-weight: 700; }
        .host-stats { font-size: 11px; color: #aaa; }
        .btn-follow {
            background: var(--tiktok-red);
            color: white;
            border: none;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
        }
        .live-tag {
            background: rgba(0,0,0,0.6);
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            color: #25f4ee;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .live-tag::before {
            content: '';
            width: 7px;
            height: 7px;
            background: #fe2c55;
            border-radius: 50%;
            box-shadow: 0 0 8px #fe2c55;
            animation: pulse 1s infinite;
        }

        /* KHU VỰC DJ VÀ AVATAR */
        .dj-stage {
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 40px;
        }

        /* AVATAR NHÂN VẬT ẢO */
        .avatar-container {
            width: 170px;
            height: 220px;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: all 0.3s ease;
        }

        .avatar-character {
            width: 140px;
            height: 140px;
            background: radial-gradient(circle at 35% 35%, #ff80bf, #99004d);
            border-radius: 50%;
            position: relative;
            box-shadow: 0 0 30px rgba(255, 42, 133, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 75px;
            animation: bob 0.6s infinite alternate ease-in-out;
        }

        .headphones {
            position: absolute;
            top: -10px;
            font-size: 95px;
            filter: drop-shadow(0 0 10px #00e5ff);
        }

        /* BÀN DJ BOOTH */
        .dj-booth {
            width: 240px;
            height: 75px;
            background: linear-gradient(180deg, #1f2333 0%, #111420 100%);
            border-radius: 16px;
            border: 2px solid #00e5ff;
            box-shadow: 0 0 25px rgba(0, 229, 255, 0.4);
            margin-top: -15px;
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding: 10px;
            position: relative;
            z-index: 15;
        }
        .vinyl {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: repeating-radial-gradient(#111, #111 4px, #2a2a2a 5px, #111 6px);
            border: 2px solid #555;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: spin 1.5s linear infinite;
        }
        .vinyl-center {
            width: 14px;
            height: 14px;
            background: var(--neon-pink);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--neon-pink);
        }

        /* EQUALIZER BARS */
        .equalizer {
            display: flex;
            gap: 4px;
            align-items: flex-end;
            height: 35px;
        }
        .eq-bar {
            width: 5px;
            background: linear-gradient(to top, #00e5ff, #ff2a85);
            border-radius: 3px;
            animation: eq-bounce 0.4s infinite alternate ease-in-out;
        }
        .eq-bar:nth-child(1) { height: 60%; animation-delay: 0.1s; }
        .eq-bar:nth-child(2) { height: 90%; animation-delay: 0.25s; }
        .eq-bar:nth-child(3) { height: 40%; animation-delay: 0.05s; }
        .eq-bar:nth-child(4) { height: 80%; animation-delay: 0.3s; }
        .eq-bar:nth-child(5) { height: 50%; animation-delay: 0.15s; }

        @keyframes eq-bounce {
            0% { transform: scaleY(0.3); }
            100% { transform: scaleY(1); }
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes bob {
            0% { transform: translateY(0px) rotate(-2deg); }
            100% { transform: translateY(-12px) rotate(2deg); }
        }

        /* CÁC ANIMATION NHẢY THEO ACTION CỦA AI */
        .anim-dance_vinahouse {
            animation: vinahouse 0.35s infinite alternate ease-in-out !important;
        }
        .anim-dance_robot {
            animation: robot 0.5s infinite steps(2) !important;
        }
        .anim-dj_scratch {
            animation: scratch 0.3s infinite alternate !important;
        }
        .anim-cheers {
            animation: cheers 0.6s infinite alternate ease-in-out !important;
        }
        .anim-heart_hands {
            animation: heart 0.5s infinite alternate ease-in-out !important;
        }
        .anim-shock_excited {
            animation: shock 0.25s infinite alternate !important;
        }

        @keyframes vinahouse {
            0% { transform: translateY(0) scale(1) rotate(-8deg); }
            100% { transform: translateY(-22px) scale(1.08) rotate(8deg); }
        }
        @keyframes robot {
            0% { transform: translateX(-15px) rotate(0deg); }
            50% { transform: translateX(15px) rotate(10deg); }
            100% { transform: translateX(-15px) rotate(-10deg); }
        }
        @keyframes scratch {
            0% { transform: rotate(-15deg) translateY(5px); }
            100% { transform: rotate(15deg) translateY(-5px); }
        }
        @keyframes cheers {
            0% { transform: scale(1) rotate(0deg); }
            100% { transform: scale(1.15) rotate(12deg) translateY(-10px); }
        }
        @keyframes heart {
            0% { transform: scale(0.95); }
            100% { transform: scale(1.15); filter: drop-shadow(0 0 20px #ff2a85); }
        }
        @keyframes shock {
            0% { transform: scale(1) translateY(0); }
            100% { transform: scale(1.25) translateY(-30px); }
        }

        /* SPEECH BUBBLE CỦA AI */
        .speech-bubble {
            position: absolute;
            top: -55px;
            background: rgba(19, 21, 31, 0.95);
            border: 2px solid var(--neon-blue);
            box-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
            padding: 8px 14px;
            border-radius: 18px;
            font-size: 13px;
            font-weight: 700;
            color: #fff;
            max-width: 280px;
            text-align: center;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 30;
            pointer-events: none;
        }
        .speech-bubble.active {
            opacity: 1;
            transform: translateY(0);
        }

        /* TIKTOK SHOP POPUP VÀ GIỎ HÀNG */
        .shop-floating-cart {
            position: absolute;
            bottom: 85px;
            left: 15px;
            z-index: 30;
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(254, 44, 85, 0.9);
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(254, 44, 85, 0.6);
            animation: bounce-cart 2s infinite;
        }
        @keyframes bounce-cart {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
        }

        .shop-popup-card {
            position: absolute;
            bottom: 135px;
            left: 15px;
            width: 250px;
            background: rgba(20, 24, 38, 0.95);
            border: 1px solid var(--neon-yellow);
            border-radius: 16px;
            padding: 10px;
            z-index: 40;
            display: none;
            box-shadow: 0 0 20px rgba(255, 234, 0, 0.4);
            animation: slideUp 0.3s ease;
        }
        .shop-popup-card.show { display: block; }
        .product-img {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 10px;
            margin-bottom: 6px;
        }
        .product-name { font-size: 12px; font-weight: 700; margin-bottom: 4px; }
        .product-price { font-size: 14px; font-weight: 800; color: var(--neon-yellow); }
        .btn-buy {
            width: 100%;
            background: var(--tiktok-red);
            border: none;
            padding: 6px;
            border-radius: 10px;
            color: white;
            font-size: 11px;
            font-weight: 700;
            margin-top: 6px;
            cursor: pointer;
        }

        /* KHU VỰC STREAM COMMENT */
        .comments-stream {
            position: absolute;
            bottom: 20px;
            left: 15px;
            right: 80px;
            height: 180px;
            z-index: 25;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            gap: 8px;
            mask-image: linear-gradient(to top, black 80%, transparent 100%);
            overflow: hidden;
        }
        .comment-item {
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(4px);
            padding: 6px 12px;
            border-radius: 14px;
            font-size: 12px;
            line-height: 1.4;
            max-width: 90%;
            animation: fadeIn 0.25s ease;
        }
        .comment-user {
            font-weight: 700;
            color: rgba(255, 255, 255, 0.7);
            margin-right: 6px;
        }
        .comment-gift {
            background: linear-gradient(90deg, rgba(255,42,133,0.3), rgba(0,229,255,0.3));
            border-left: 3px solid var(--neon-pink);
            font-weight: 700;
            color: #ffea00;
        }

        /* THANH ĐIỀU KHIỂN BÊN PHẢI (SIMULATOR DASHBOARD) */
        .control-panel {
            flex: 1;
            background: var(--card-bg);
            border-radius: 30px;
            border: 1px solid rgba(255,255,255,0.08);
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 18px;
            overflow-y: auto;
        }
        .panel-title {
            font-size: 20px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--neon-blue);
        }
        .section-box {
            background: rgba(0,0,0,0.3);
            border-radius: 16px;
            padding: 16px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .section-title {
            font-size: 13px;
            font-weight: 700;
            color: #8e95ad;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }
        .gift-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        .btn-gift {
            background: #1c2033;
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            padding: 10px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-gift:hover {
            background: var(--neon-pink);
            border-color: var(--neon-pink);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255,42,133,0.4);
        }

        .chat-input-row {
            display: flex;
            gap: 8px;
        }
        .input-text {
            flex: 1;
            background: #1c2033;
            border: 1px solid rgba(255,255,255,0.15);
            padding: 12px 16px;
            border-radius: 12px;
            color: white;
            font-size: 13px;
            outline: none;
        }
        .input-text:focus {
            border-color: var(--neon-blue);
        }
        .btn-send {
            background: var(--tiktok-cyan);
            color: #000;
            border: none;
            padding: 0 20px;
            border-radius: 12px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-send:hover {
            background: #fff;
            transform: translateY(-2px);
        }

        .action-triggers {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .btn-action {
            background: #232840;
            color: #e1e4ed;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 8px 14px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: 0.2s;
        }
        .btn-action:hover {
            background: #32395a;
            color: #fff;
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            background: rgba(0, 229, 255, 0.1);
            color: var(--neon-blue);
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
        }
        .status-badge::before {
            content: '';
            width: 6px;
            height: 6px;
            background: var(--neon-blue);
            border-radius: 50%;
        }

        .auto-toggle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px;
            background: #1c2033;
            border-radius: 12px;
            margin-top: 10px;
        }
        .switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
        }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: #333; transition: .3s; border-radius: 24px;
        }
        .slider:before {
            position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px;
            background-color: white; transition: .3s; border-radius: 50%;
        }
        input:checked + .slider { background-color: var(--tiktok-cyan); }
        input:checked + .slider:before { transform: translateX(20px); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>

<div class="container">
    <!-- KHUNG ĐIỆN THOẠI TIKTOK LIVE -->
    <div class="phone-frame">
        <div class="live-stage">
            <div class="laser-beam"></div>
            <div class="laser-beam"></div>

            <!-- HEADER -->
            <div class="live-header" style="width: 100%;">
                <div class="host-badge">
                    <div class="host-avatar">🎧</div>
                    <div>
                        <div class="host-name">DJ Miu Miu</div>
                        <div class="host-stats">❤️ 24.8K tim</div>
                    </div>
                    <button class="btn-follow">+ Follow</button>
                </div>
                <div class="live-tag">1,420</div>
            </div>

            <!-- STAGE VÀ DJ AVATAR -->
            <div class="dj-stage">
                <!-- SPEECH BUBBLE -->
                <div id="speechBubble" class="speech-bubble">
                    Chào mừng các dân chơi đã ghé quầy bar của em Miu!
                </div>

                <!-- AVATAR -->
                <div id="avatarContainer" class="avatar-container">
                    <div id="avatarChar" class="avatar-character anim-dance_vinahouse">
                        😎
                        <div class="headphones">🎧</div>
                    </div>
                </div>

                <!-- BÀN DJ -->
                <div class="dj-booth">
                    <div class="vinyl"><div class="vinyl-center"></div></div>
                    <div class="equalizer">
                        <div class="eq-bar"></div>
                        <div class="eq-bar"></div>
                        <div class="eq-bar"></div>
                        <div class="eq-bar"></div>
                        <div class="eq-bar"></div>
                    </div>
                    <div class="vinyl"><div class="vinyl-center"></div></div>
                </div>
            </div>

            <!-- POPUP GIỎ HÀNG THẦN THÁNH -->
            <div id="shopPopup" class="shop-popup-card">
                <img id="shopImg" class="product-img" src="" alt="Sản phẩm">
                <div id="shopName" class="product-name">Kính LED Cyberpunk 7 Màu</div>
                <div id="shopPrice" class="product-price">79.000đ</div>
                <button class="btn-buy" onclick="alert('Đã thêm vào giỏ hàng thành công!')">MUA NGAY (FREESHIP)</button>
            </div>

            <!-- NÚT GIỎ HÀNG GÓC TRÁI -->
            <div class="shop-floating-cart" onclick="toggleShopPopupManual()">
                🛒 Giỏ hàng (3)
            </div>

            <!-- STREAM COMMENT -->
            <div id="commentsStream" class="comments-stream">
                <div class="comment-item">
                    <span class="comment-user">Hệ thống:</span> Chào mừng bạn đến với Quán Bar Online!
                </div>
                <div class="comment-item">
                    <span class="comment-user">Dân_Chơi_99:</span> Nhạc căng quá em ơi!
                </div>
            </div>
        </div>
    </div>

    <!-- BẢNG ĐIỀU KHIỂN GIẢ LẬP (SIMULATOR DASHBOARD) -->
    <div class="control-panel">
        <div class="panel-title">
            🎛️ Bảng Điều Khiển Phòng Live TikTok (AI Simulator)
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
            <div class="status-badge" id="botStatus">Đang biểu diễn trực tiếp</div>
            <div style="font-size: 12px; color: #8e95ad;" id="actionDesc">Hành động: Quẩy Vinahouse</div>
        </div>

        <!-- PHẦN 1: TẶNG QUÀ TIKTOK -->
        <div class="section-box">
            <div class="section-title">🎁 Thử nghiệm gửi quà tặng (Kích hoạt điệu nhảy)</div>
            <div class="gift-grid">
                <button class="btn-gift" onclick="sendGift('Rose')">🌹 Tặng Hoa Hồng (Lắc Hông)</button>
                <button class="btn-gift" onclick="sendGift('IceCream')">🍦 Tặng Cây Kem (Nhảy Robot)</button>
                <button class="btn-gift" onclick="sendGift('Sunglasses')">🕶️ Kính Râm (Quẩy Sàn)</button>
                <button class="btn-gift" onclick="sendGift('Rocket')">🚀 Tên Lửa (Bắn Pháo Hoa)</button>
            </div>
        </div>

        <!-- PHẦN 2: GỬI BÌNH LUẬN GIẢ LẬP -->
        <div class="section-box">
            <div class="section-title">💬 Gõ bình luận tương tác với AI DJ</div>
            <div class="chat-input-row">
                <input id="customComment" type="text" class="input-text" placeholder="Nhập comment (VD: Chào Miu, lên bài Vinahouse, say quá...)" onkeydown="if(event.key==='Enter') sendCustomComment()">
                <button class="btn-send" onclick="sendCustomComment()">Gửi</button>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap;">
                <button class="btn-action" onclick="quickComment('Chào em Miu xinh đẹp nha!')">👋 "Chào Miu"</button>
                <button class="btn-action" onclick="quickComment('Lên bài Vinahouse căng đét đi em!')">🔥 "Lên nhạc căng"</button>
                <button class="btn-action" onclick="quickComment('Uống say quá rồi anh em ơi!')">🍻 "Say xỉn"</button>
                <button class="btn-action" onclick="quickComment('Kính LED bao nhiêu tiền thế em?')">🛒 "Hỏi giá kính"</button>
            </div>
        </div>

        <!-- PHẦN 3: KỊCH BẢN TỰ ĐỘNG & SHOP -->
        <div class="section-box">
            <div class="section-title">⚡ Kích hoạt kịch bản tự động</div>
            <div class="action-triggers">
                <button class="btn-action" onclick="triggerShop()">🛒 AI Nhắc Giỏ Hàng TikTok Shop</button>
                <button class="btn-action" onclick="triggerIdle()">📢 Hâm Nóng Sàn (Idle Chatter)</button>
            </div>

            <div class="auto-toggle">
                <div>
                    <div style="font-size: 13px; font-weight: 700;">Chế độ khách ảo tự động</div>
                    <div style="font-size: 11px; color: #8e95ad;">Tự động phát sinh người xem comment và tặng quà ngẫu nhiên</div>
                </div>
                <label class="switch">
                    <input type="checkbox" id="autoSimToggle" onchange="toggleAutoSim(this.checked)">
                    <span class="slider"></span>
                </label>
            </div>

            <div class="auto-toggle" style="margin-top: 8px;">
                <div>
                    <div style="font-size: 13px; font-weight: 700;">Âm thanh giọng nói AI (TTS)</div>
                    <div style="font-size: 11px; color: #8e95ad;">Phát tiếng nói trực tiếp từ loa trình duyệt</div>
                </div>
                <label class="switch">
                    <input type="checkbox" id="audioToggle" checked>
                    <span class="slider"></span>
                </label>
            </div>
        </div>
    </div>
</div>

<!-- THẺ AUDIO PHÁT GIỌNG NÓI CỦA AI -->
<audio id="ttsAudioPlayer" style="display: none;"></audio>

<script>
    let products = [];
    let autoSimInterval = null;

    // Load danh sách sản phẩm
    fetch('/api/products').then(r => r.json()).then(data => {
        products = data;
    });

    function setDJAction(actionName, actionDesc) {
        const char = document.getElementById('avatarChar');
        // Xóa các class animation cũ
        char.className = 'avatar-character';
        char.classList.add('anim-' + actionName);
        document.getElementById('actionDesc').innerText = 'Hành động: ' + actionDesc;
    }

    function showSpeech(text, audioUrl) {
        const bubble = document.getElementById('speechBubble');
        bubble.innerText = text;
        bubble.classList.add('active');
        
        // Phát giọng nói
        const audioEnabled = document.getElementById('audioToggle').checked;
        if (audioEnabled && audioUrl) {
            const player = document.getElementById('ttsAudioPlayer');
            player.src = audioUrl;
            player.play().catch(e => console.log('Autoplay audio blocked:', e));
        }

        setTimeout(() => {
            bubble.classList.remove('active');
        }, 5000);
    }

    function addCommentToStream(user, text, isGift = false) {
        const stream = document.getElementById('commentsStream');
        const item = document.createElement('div');
        item.className = 'comment-item' + (isGift ? ' comment-gift' : '');
        item.innerHTML = `<span class="comment-user">${user}:</span> ${text}`;
        stream.appendChild(item);
        stream.scrollTop = stream.scrollHeight;
    }

    async function sendGift(giftType) {
        const randomUsers = ['Thiếu_Gia_99', 'Đại_Gia_Bin', 'Trùm_Bar', 'Boy_Pho_Co', 'Tuấn_Lexus'];
        const user = randomUsers[Math.floor(Math.random() * randomUsers.length)];
        
        const res = await fetch('/api/gift', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, gift_type: giftType, count: 1 })
        }).then(r => r.json());

        addCommentToStream(user, `Đã tặng 1x ${res.gift_name}!`, true);
        setDJAction(res.action, res.action_desc);
        showSpeech(res.speech, res.audio_url);
    }

    async function sendCustomComment() {
        const input = document.getElementById('customComment');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        quickComment(text);
    }

    async function quickComment(text) {
        const user = 'Bạn';
        addCommentToStream(user, text);
        
        const res = await fetch('/api/comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, comment: text })
        }).then(r => r.json());

        setDJAction(res.action, res.action_desc);
        showSpeech(res.speech, res.audio_url);

        if (res.action === 'point_cart') {
            showShopPopup();
        }
    }

    async function triggerShop() {
        const res = await fetch('/api/shop', { method: 'POST' }).then(r => r.json());
        setDJAction(res.action, res.action_desc);
        showSpeech(res.speech, res.audio_url);
        showShopPopup(res.product_name, res.product_price);
    }

    async function triggerIdle() {
        const res = await fetch('/api/idle', { method: 'POST' }).then(r => r.json());
        setDJAction(res.action, res.action_desc);
        showSpeech(res.speech, res.audio_url);
    }

    function showShopPopup(name, price) {
        const popup = document.getElementById('shopPopup');
        if (name && price) {
            document.getElementById('shopName').innerText = name;
            document.getElementById('shopPrice').innerText = price;
        } else if (products.length > 0) {
            const p = products[Math.floor(Math.random() * products.length)];
            document.getElementById('shopName').innerText = p.name;
            document.getElementById('shopPrice').innerText = p.price;
            document.getElementById('shopImg').src = p.image_url;
        }
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 7000);
    }

    function toggleShopPopupManual() {
        showShopPopup();
    }

    function toggleAutoSim(enabled) {
        if (enabled) {
            autoSimInterval = setInterval(() => {
                const sampleComments = [
                    "Chào cả nhà quẩy nhiệt tình nha!",
                    "Em Miu nay quẩy sung quá!",
                    "Kính râm kia mua ở đâu đấy?",
                    "Say quắc cần câu rồi!",
                    "Lên bài remix căng hơn đi em!"
                ];
                const sampleGifts = ['Rose', 'IceCream', 'Sunglasses'];
                const isGift = Math.random() < 0.35;
                if (isGift) {
                    sendGift(sampleGifts[Math.floor(Math.random() * sampleGifts.length)]);
                } else {
                    const txt = sampleComments[Math.floor(Math.random() * sampleComments.length)];
                    quickComment(txt);
                }
            }, 6000);
        } else {
            clearInterval(autoSimInterval);
        }
    }
</script>

</body>
</html>
"""
    return html_content

if __name__ == "__main__":
    print("=" * 65)
    print(" 🚀 KHỞI ĐỘNG MÁY CHỦ MÔ PHỎNG TIKTOK LIVE AI DJ BAR ONLINE ")
    print(" 🌐 Mở trình duyệt tại: http://localhost:8000 ")
    print("=" * 65)
    uvicorn.run("web_simulator:app", host="0.0.0.0", port=8000, reload=False)
