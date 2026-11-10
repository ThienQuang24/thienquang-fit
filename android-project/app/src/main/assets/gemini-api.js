// Gemini API: Tích Hợp Google Gemini AI Trực Tuyến & Dự Phòng Offline Cục Bộ
const GeminiAPI = {
  MODELS: ['gemini-3.5-flash-lite', 'gemini-3-flash-preview', 'gemini-3.8-flash'],

  getKey() {
    return localStorage.getItem('tqfit_gemini_api_key') || '';
  },

  setKey(key) {
    if (key) localStorage.setItem('tqfit_gemini_api_key', key.trim());
    else localStorage.removeItem('tqfit_gemini_api_key');
  },

  getModel() {
    let m = localStorage.getItem('tqfit_gemini_model');
    if (!m || m.includes('2.5') || m.includes('1.5')) {
      m = 'gemini-3.5-flash-lite';
      localStorage.setItem('tqfit_gemini_model', m);
    }
    return m;
  },

  setModel(model) {
    localStorage.setItem('tqfit_gemini_model', model);
  },

  hasKey() {
    return !!this.getKey();
  },

  async fetchWithTimeout(url, options = {}, timeoutMs = 6000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  },

  async testSingleModel(model, key, timeoutMs = 5000) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    try {
      const res = await this.fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Trả lời đúng 1 chữ: OK' }] }] })
      }, timeoutMs);
      const data = await res.json();
      if (res.ok && data.candidates && data.candidates.length > 0) {
        return { ok: true, data };
      }
      return { ok: false, error: data.error?.message || 'Lỗi API' };
    } catch (err) {
      const isTimeout = err.name === 'AbortError' || (err.message && err.message.includes('aborted'));
      return { ok: false, error: isTimeout ? 'Hết thời gian chờ (Timeout)' : 'Lỗi mạng' };
    }
  },

  async testConnection(testKey) {
    const key = (testKey || this.getKey()).trim();
    if (!key) return { success: false, message: 'Chưa nhập API Key' };

    let preferred = this.getModel();
    let tryModels = [preferred, ...this.MODELS.filter(m => m !== preferred)];

    for (const m of tryModels) {
      const res = await this.testSingleModel(m, key, 5000);
      if (res.ok) {
        this.setModel(m);
        const sel = document.getElementById('gemini-model-select');
        if (sel) sel.value = m;
        return { success: true, message: `Kết nối thành công (${m})!` };
      }
    }
    return { success: false, message: 'Không thể kết nối. Vui lòng kiểm tra lại API Key hoặc mạng.' };
  },

  async askGemini(promptText, chatHistory) {
    const key = this.getKey();
    if (!key) return null;

    const systemInstruction = {
      role: 'user',
      parts: [{
        text: `Bạn là Trợ Lý Huấn Luyện Viên AI Thể Hình Cá Nhân của ứng dụng THIENQUANG FIT.
Học viên: Nam giới Việt Nam, Lập trình viên / IT, cao 1m70, nặng 80kg, vòng eo 96cm.
Mục tiêu 60 ngày: Giảm từ 80kg về 70kg, eo từ 96cm về 80cm, thể hình săn chắc.
Yêu cầu: Tiếng Việt thực tế, ngắn gọn (dưới 150 từ), chuyên môn thể hình chuẩn.`
      }]
    };

    const formattedContents = [
      systemInstruction,
      { role: 'model', parts: [{ text: 'Tôi đã hiểu rõ hồ sơ học viên ThienQuang Fit. Sẵn sàng hỗ trợ!' }] }
    ];

    (chatHistory || []).slice(-4).forEach(msg => {
      formattedContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text.replace(/<[^>]*>?/gm, '') }]
      });
    });

    formattedContents.push({
      role: 'user',
      parts: [{ text: promptText }]
    });

    const activeModel = this.getModel();
    const candidateModels = [activeModel, ...this.MODELS.filter(m => m !== activeModel)];

    for (const m of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`;
      try {
        const res = await this.fetchWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: formattedContents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
          })
        }, 8000);

        if (!res.ok) continue;
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) continue;

        let actionObj = null, cleanText = rawText;
        const actionMatch = rawText.match(/```action\s*([\s\S]*?)\s*```/);
        if (actionMatch) {
          try {
            actionObj = JSON.parse(actionMatch[1]);
            cleanText = rawText.replace(/```action[\s\S]*?```/, '').trim();
          } catch (e) {}
        }
        return { text: cleanText.replace(/\n/g, '<br>'), action: actionObj };
      } catch (e) {
        continue;
      }
    }
    return null;
  }
};
