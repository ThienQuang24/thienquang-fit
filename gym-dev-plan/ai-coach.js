// AI Coach: Trợ Lý Trí Tuệ Nhân Tạo ThienQuang AI (Live Gemini API + Offline Fallback)
const AICoach = {
  chatHistory: JSON.parse(localStorage.getItem('tqfit_ai_chat') || '[]'),

  quickPrompts: [
    { title: "⚡ Thêm bài gập bụng cáp T2", query: "Thêm bài gập bụng cáp Cable Crunch vào lịch Thứ Hai giúp tôi." },
    { title: "🎯 Siết xong đổi tăng cơ V-Taper", query: "Tôi đã siết eo thành công về 80cm, tạo lịch mới tăng cơ xẻ rãnh V-Taper cho tôi." },
    { title: "🩹 Đau cổ tay đổi bài máy", query: "Hôm nay tôi mỏi cổ tay, đổi bài đẩy ngực tạ đơn sang máy ép ngực Pec Deck êm hơn." },
    { title: "🏠 Trời mưa tạo lịch tập tại nhà", query: "Hôm nay trời mưa không đến phòng gym được, tạo lịch tập tại nhà 30 phút cho tôi." },
    { title: "↺ Khôi phục lịch gốc 60 ngày", query: "Khôi phục lại lịch tập gốc 60 ngày ban đầu giúp tôi." }
  ],

  toggleModal() {
    const modal = document.getElementById('ai-coach-modal');
    modal.classList.toggle('hidden');
    this.updateStatusBadge();
    this.renderChat();
  },

  openSettings() {
    const modal = document.getElementById('ai-settings-modal');
    if (!modal) return;
    const keyInput = document.getElementById('gemini-api-key-input');
    const modelSelect = document.getElementById('gemini-model-select');
    if (keyInput) keyInput.value = GeminiAPI.getKey();
    if (modelSelect) modelSelect.value = GeminiAPI.getModel();
    modal.classList.remove('hidden');
  },

  closeSettings() {
    const modal = document.getElementById('ai-settings-modal');
    if (modal) modal.classList.add('hidden');
  },

  async testAndSaveKey() {
    const key = document.getElementById('gemini-api-key-input').value.trim();
    const model = document.getElementById('gemini-model-select').value;
    const statusEl = document.getElementById('api-key-status-msg');

    if (!key) {
      GeminiAPI.setKey('');
      showToast('Đã xóa API Key. Đang dùng AI Cục Bộ (Offline).');
      this.closeSettings();
      this.updateStatusBadge();
      return;
    }

    statusEl.innerHTML = '<span class="text-cyan-400">Đang kiểm tra kết nối Google Gemini...</span>';
    GeminiAPI.setModel(model);
    const result = await GeminiAPI.testConnection(key);

    if (result.success) {
      GeminiAPI.setKey(key);
      statusEl.innerHTML = `<span class="text-emerald-400 font-bold">✓ ${result.message}</span>`;
      setTimeout(() => {
        this.closeSettings();
        this.updateStatusBadge();
        showToast('✓ Đã kết nối Google Gemini AI thành công!');
      }, 700);
    } else {
      statusEl.innerHTML = `<span class="text-red-400 font-bold">✕ ${result.message}</span>`;
    }
  },

  updateStatusBadge() {
    const badge = document.getElementById('ai-status-badge');
    if (!badge) return;
    if (GeminiAPI.hasKey()) {
      badge.innerHTML = `<span class="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">● Gemini Live API</span>`;
    } else {
      badge.innerHTML = `<span class="text-[10px] text-slate-400 font-medium bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">○ AI Cục Bộ (Offline)</span>`;
    }
  },

  renderChat() {
    const chatContainer = document.getElementById('ai-chat-messages');
    if (!chatContainer) return;

    if (this.chatHistory.length === 0) {
      chatContainer.innerHTML = `
        <div class="text-center py-6 space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <i data-lucide="bot" class="w-6 h-6"></i>
          </div>
          <h4 class="font-outfit font-bold text-white text-base">Trợ Lý AI ThienQuang</h4>
          <p class="text-xs text-slate-400 max-w-xs mx-auto">Tự động thêm bài mới, đổi bài khi đau khớp, hoặc tạo toàn bộ lịch mới theo thể trạng của bạn!</p>
        </div>
      `;
    } else {
      chatContainer.innerHTML = this.chatHistory.map(msg => `
        <div class="flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
          ${msg.role === 'assistant' ? `
            <div class="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 text-xs font-black">AI</div>
          ` : ''}
          <div class="max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'}">
            <div>${msg.text}</div>
            ${msg.actionHtml ? `<div class="pt-1">${msg.actionHtml}</div>` : ''}
          </div>
        </div>
      `).join('');
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
    lucide.createIcons();
  },

  handlePromptClick(idx) {
    const prompt = this.quickPrompts[idx];
    if (prompt) this.sendMessage(prompt.query);
  },

  async sendMessage(customText) {
    const input = document.getElementById('ai-chat-input');
    const text = customText || (input ? input.value.trim() : '');
    if (!text) return;
    if (input) input.value = '';

    this.chatHistory.push({ role: 'user', text });
    this.renderChat();

    const thinkingMsg = { role: 'assistant', text: '<em>Đang suy nghĩ...</em>' };
    this.chatHistory.push(thinkingMsg);
    this.renderChat();

    let response = null;
    if (GeminiAPI.hasKey()) {
      const geminiRes = await GeminiAPI.askGemini(text, this.chatHistory.slice(0, -1));
      if (geminiRes) {
        response = { text: geminiRes.text };
        if (geminiRes.action) {
          response.actionHtml = this.formatActionHtml(geminiRes.action);
        }
      }
    }

    if (!response) {
      response = OfflineCoach.process(text);
    }

    this.chatHistory.pop(); // remove thinking
    this.chatHistory.push({
      role: 'assistant',
      text: response.text,
      actionHtml: response.actionHtml || null
    });
    localStorage.setItem('tqfit_ai_chat', JSON.stringify(this.chatHistory.slice(-25)));
    this.renderChat();
  },

  formatActionHtml(act) {
    if (act.type === 'ADD_EXERCISE') {
      const dayKey = act.day || 'mon';
      const safeObjStr = JSON.stringify({
        name: act.name || 'Bài tập tùy chỉnh',
        target: act.target || 'Nhóm cơ tùy biến',
        machine: act.machine || 'Dụng cụ thể hình',
        weight: act.weight || 'Theo cảm nhận',
        sets: act.sets || '3 hiệp x 12 reps',
        rest: '45s',
        img: 'assets/exercises/incline_dumbbell_press/0.jpg',
        imgEnd: 'assets/exercises/incline_dumbbell_press/1.jpg',
        tip: act.tip || 'Khóa khớp an toàn, thở đều khi phát lực.',
        setupAngle: act.setupAngle || 'Chuẩn form',
        mistake: act.mistake || 'Không lấy đà giật người.'
      }).replace(/"/g, '&quot;');

      return `
        <button onclick="AICoach.applyAddExercise('${dayKey}', ${safeObjStr})" class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all active:scale-95">
          <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i> ⚡ Áp Dụng Bài "${act.name}" Vào Lịch
        </button>
      `;
    }
    return '';
  },

  applyAddExercise(dayKey, exerciseObj) {
    const currentData = JSON.parse(JSON.stringify(getActiveWeeklyData()));
    if (!currentData[dayKey]) currentData[dayKey] = defaultWeeklyData[dayKey];
    currentData[dayKey].gym.push(exerciseObj);
    saveCustomWeeklyData(currentData);
    renderSchedule();
    playDing();
    showToast(`✓ Đã thêm bài "${exerciseObj.name}" vào lịch!`);
    this.toggleModal();
  },

  applySwapExercise(dayKey, exIdx, newExObj) {
    const currentData = JSON.parse(JSON.stringify(getActiveWeeklyData()));
    if (currentData[dayKey] && currentData[dayKey].gym) {
      currentData[dayKey].gym[exIdx] = newExObj;
      saveCustomWeeklyData(currentData);
      renderSchedule();
      playDing();
      showToast(`✓ Đã đổi sang bài "${newExObj.name}"!`);
      this.toggleModal();
    }
  },

  applyRoutineVersion(versionKey) {
    if (versionKey === 'v2') {
      saveCustomWeeklyData(v2HypertrophyWeeklyData);
      showToast("✓ Đã kích hoạt Phiên bản 2: Tăng Cơ V-Taper!");
    } else if (versionKey === 'v3') {
      saveCustomWeeklyData(v3HomeWeeklyData);
      showToast("✓ Đã kích hoạt Lịch Tập 30 Phút Tại Nhà!");
    }
    renderSchedule();
    playDing();
    this.toggleModal();
  },

  applyReset() {
    resetToDefaultWeeklyData();
    renderSchedule();
    playDing();
    showToast("✓ Đã khôi phục lại Lịch Tập Gốc 60 Ngày!");
    this.toggleModal();
  }
};
