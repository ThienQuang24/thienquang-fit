"""
tts.py
Module chuyển đổi văn bản thành giọng nói (Text-To-Speech)
Sử dụng Microsoft Edge TTS - hoàn toàn miễn phí, hỗ trợ tiếng Việt cực tự nhiên.
"""
import asyncio
import os
import io
import base64
import edge_tts

DEFAULT_VOICE = "vi-VN-HoaiMyNeural"  # Giọng nữ tiếng Việt chuẩn, tự nhiên
MALE_VOICE = "vi-VN-NamMinhNeural"    # Giọng nam tiếng Việt

async def text_to_speech_bytes(text: str, voice: str = DEFAULT_VOICE, rate: str = "+10%", pitch: str = "+0Hz") -> bytes:
    """
    Chuyển văn bản thành bytes MP3 trong bộ nhớ (không cần lưu file tạm nếu muốn stream).
    """
    communicate = edge_tts.Communicate(text, voice=voice, rate=rate, pitch=pitch)
    audio_stream = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_stream.write(chunk["data"])
    audio_stream.seek(0)
    return audio_stream.read()

async def text_to_speech_base64(text: str, voice: str = DEFAULT_VOICE) -> str:
    """
    Chuyển văn bản thành chuỗi Data URL base64 để trình duyệt phát trực tiếp qua thẻ <audio>.
    """
    data = await text_to_speech_bytes(text, voice=voice)
    b64 = base64.b64encode(data).decode('utf-8')
    return f"data:audio/mp3;base64,{b64}"

async def text_to_speech_file(text: str, output_path: str, voice: str = DEFAULT_VOICE) -> str:
    """
    Lưu âm thanh ra file mp3 trên đĩa cứng.
    """
    dirname = os.path.dirname(output_path)
    if dirname:
        os.makedirs(dirname, exist_ok=True)
    communicate = edge_tts.Communicate(text, voice=voice, rate="+10%")
    await communicate.save(output_path)
    return output_path

if __name__ == "__main__":
    # Test thử trực tiếp
    test_text = "Chào mừng cả nhà đã đến với quán bar online của em Miu Miu! Quẩy lên nào anh em ơi!"
    asyncio.run(text_to_speech_file(test_text, "test_speech.mp3"))
    print("Đã tạo file test_speech.mp3 thành công!")
