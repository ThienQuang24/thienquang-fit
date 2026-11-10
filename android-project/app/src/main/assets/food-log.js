// Quản Lý Nhật Ký Ăn Thực Tế & Bữa Ăn Phát Sinh (Food Log & Damage Control)
const FoodLog = {
  storageKey: 'tqfit_food_log',

  presets: [
    { key: 'nhau', name: 'Đi nhậu họp bạn bè (Bia + Mồi)', calo: 950, isAlcohol: true, tip: 'Bia & mồi mặn gây tích nước. Uống 500ml nước trước khi ngủ để giải độc gan.' },
    { key: 'lau_nuong', name: 'Tiệc lẩu / Buffet nướng BBQ', calo: 850, isAlcohol: false, tip: 'Nhiều đạm và sốt ngọt. Ngày mai tăng rau xanh, giảm bớt 1/2 chén cơm.' },
    { key: 'tiec_cuoi', name: 'Tiệc cưới / Liên hoan công ty', calo: 900, isAlcohol: true, tip: 'Hạn chế nước ngọt có gas. Ngày mai đi bộ dốc thêm 15 phút để bù thâm hụt.' },
    { key: 'trasua', name: 'Trà sữa / Bánh ngọt / Ăn vặt', calo: 420, isAlcohol: false, tip: 'Đường hấp thu nhanh. Ngày mai cắt toàn bộ đồ ngọt để ổn định đường huyết.' },
    { key: 'an_ngoai', name: 'Cơm tấm / Bún phở nước béo', calo: 650, isAlcohol: false, tip: 'Quán ăn ngoài thường nhiều mỡ hành và mì chính. Nhớ uống đủ 3 lít nước.' },
    { key: 'custom', name: 'Tự nhập món ăn thực tế...', calo: 400, isAlcohol: false, tip: 'Ghi nhận trung thực giúp bạn làm chủ lượng calo nạp vào cơ thể.' }
  ],

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.storageKey) || '{}'); } catch (e) { return {}; }
  },

  getForDate(dateKey) {
    const all = this.getAll();
    return all[dateKey] || [];
  },

  saveForDate(dateKey, list) {
    const all = this.getAll();
    all[dateKey] = list;
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  },

  initDOM() {
    if (document.getElementById('food-log-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'food-log-modal';
    modal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-4 space-y-3 shadow-2xl">
        <div class="flex justify-between items-center pb-2 border-b border-slate-800">
          <h4 class="font-outfit font-black text-sm text-white flex items-center gap-1.5">
            <span>🍻</span> Ghi Nhận Bữa Ăn Thực Tế / Nhậu Nhẹt
          </h4>
          <button onclick="FoodLog.closeAddModal()" class="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] text-slate-400 font-bold block uppercase">Chọn nhanh tình huống:</label>
          <div class="grid grid-cols-2 gap-1.5">
            <button type="button" onclick="FoodLog.selectPreset('nhau')" class="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-[11px] font-bold text-slate-200 text-left active:scale-95">🍻 Đi nhậu bạn bè</button>
            <button type="button" onclick="FoodLog.selectPreset('lau_nuong')" class="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-[11px] font-bold text-slate-200 text-left active:scale-95">🍲 Lẩu / Nướng BBQ</button>
            <button type="button" onclick="FoodLog.selectPreset('tiec_cuoi')" class="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-[11px] font-bold text-slate-200 text-left active:scale-95">🎉 Liên hoan / Tiệc</button>
            <button type="button" onclick="FoodLog.selectPreset('trasua')" class="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-[11px] font-bold text-slate-200 text-left active:scale-95">🧋 Trà sữa / Ăn vặt</button>
            <button type="button" onclick="FoodLog.selectPreset('an_ngoai')" class="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-[11px] font-bold text-slate-200 text-left active:scale-95">🍜 Ăn quán xá ngoài</button>
            <button type="button" onclick="FoodLog.selectPreset('custom')" class="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-[11px] font-bold text-slate-200 text-left active:scale-95">✍️ Tự do ghi món...</button>
          </div>
        </div>
        <div class="space-y-2">
          <div>
            <label class="text-[10px] text-slate-400 font-bold block uppercase">Tên bữa ăn / Món đã dùng</label>
            <input id="food-log-name" type="text" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500">
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[10px] text-slate-400 font-bold block uppercase">Ước tính Calo (kcal)</label>
              <input id="food-log-calo" type="number" min="0" max="4000" step="50" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500">
            </div>
            <div class="flex items-center pt-4">
              <label class="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300 font-semibold select-none">
                <input id="food-log-alcohol" type="checkbox" class="w-4 h-4 accent-amber-500 rounded">
                <span>Có bia / rượu</span>
              </label>
            </div>
          </div>
          <p id="food-log-tip" class="text-[10px] text-slate-400 leading-tight italic"></p>
        </div>
        <div class="flex gap-2 pt-1">
          <button onclick="FoodLog.saveFoodItem()" class="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 active:scale-95">
            + Lưu Bữa Thực Tế
          </button>
          <button onclick="FoodLog.closeAddModal()" class="px-3 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">
            Hủy
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    if (window.lucide) lucide.createIcons();
  },

  openAddModal(dateKey) {
    this.initDOM();
    const modal = document.getElementById('food-log-modal');
    if (!modal) return;
    modal.dataset.date = dateKey;
    this.selectPreset('nhau');
    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  closeAddModal() {
    const modal = document.getElementById('food-log-modal');
    if (modal) modal.classList.add('hidden');
  },

  selectPreset(key) {
    const preset = this.presets.find(p => p.key === key) || this.presets[0];
    const nameInput = document.getElementById('food-log-name');
    const caloInput = document.getElementById('food-log-calo');
    const alcBox = document.getElementById('food-log-alcohol');
    const tipEl = document.getElementById('food-log-tip');

    if (nameInput) nameInput.value = preset.name;
    if (caloInput) caloInput.value = preset.calo;
    if (alcBox) alcBox.checked = !!preset.isAlcohol;
    if (tipEl) tipEl.innerText = preset.tip;
  },

  saveFoodItem() {
    const modal = document.getElementById('food-log-modal');
    if (!modal) return;
    const dateKey = modal.dataset.date || currentSelectedDate;
    const name = (document.getElementById('food-log-name').value || '').trim() || 'Bữa ăn ngoài';
    const calo = parseInt(document.getElementById('food-log-calo').value, 10) || 0;
    const isAlcohol = document.getElementById('food-log-alcohol').checked;

    const list = this.getForDate(dateKey);
    list.push({
      id: 'food_' + Date.now(),
      name,
      calo,
      isAlcohol,
      loggedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    });

    this.saveForDate(dateKey, list);
    this.closeAddModal();
    if (typeof playDing === 'function') playDing();
    if (typeof showToast === 'function') showToast(`✓ Đã lưu: ${name} (~${calo} kcal)`);
    if (typeof renderSchedule === 'function') renderSchedule();
  },

  deleteFoodItem(dateKey, id) {
    let list = this.getForDate(dateKey);
    list = list.filter(item => item.id !== id);
    this.saveForDate(dateKey, list);
    if (typeof renderSchedule === 'function') renderSchedule();
  },

  renderSection(dateKey) {
    const list = this.getForDate(dateKey);
    const hasItems = list.length > 0;
    const totalExtraCalo = list.reduce((sum, item) => sum + (item.calo || 0), 0);
    const hasAlcohol = list.some(item => item.isAlcohol);

    let tipText = '';
    if (hasAlcohol) {
      tipText = '💡 Đã có cồn: Uống ngay 500ml nước lọc trước khi ngủ để gan thải cồn và tránh tích nước. Sáng mai uống chanh ấm và đi bộ dốc thêm 15p là đốt sạch!';
    } else if (totalExtraCalo > 700) {
      tipText = `💡 Vượt ~${totalExtraCalo} kcal: Đừng lo lắng! Bữa trưa mai giảm 1/2 cơm, ăn nhiều ức gà/rau luộc để cân bằng thâm hụt tuần mà không lo tích mỡ bụng.`;
    } else if (totalExtraCalo > 0) {
      tipText = `💡 Nạp thêm ~${totalExtraCalo} kcal: Vẫn trong giới hạn an toàn nếu duy trì buổi tập gym và uống đủ nước ngày mai!`;
    }

    let itemsHtml = list.map(item => `
      <div class="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div class="min-w-0 pr-2">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-white truncate">${item.name}</span>
            ${item.isAlcohol ? '<span class="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[9px] font-bold">CỒN</span>' : ''}
          </div>
          <span class="text-[10px] text-slate-400">${item.loggedAt} • ~${item.calo} kcal</span>
        </div>
        <button onclick="FoodLog.deleteFoodItem('${dateKey}', '${item.id}')" class="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400" title="Xóa">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `).join('');

    return `
      <div class="p-3.5 rounded-2xl ${hasItems ? 'bg-gradient-to-r from-amber-950/40 to-slate-900 border-2 border-amber-500/60 ring-1 ring-amber-500/20' : 'bg-slate-900/80 border border-slate-800'} space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">🍻</span>
            <div>
              <h4 class="font-outfit font-black text-xs sm:text-sm text-white">Thực Tế Ăn Uống & Bữa Nhậu / Ngoại Lệ</h4>
              <span class="text-[10px] ${hasItems ? 'text-amber-400 font-bold' : 'text-slate-400'} block">
                ${hasItems ? `Đã phát sinh +${totalExtraCalo} kcal hôm nay` : 'Hôm nay chưa ghi nhận bữa ăn ngoài lệ'}
              </span>
            </div>
          </div>
          <button onclick="FoodLog.openAddModal('${dateKey}')" class="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm shadow-amber-500/30 active:scale-95">
            <span>+ Ghi Nhận</span>
          </button>
        </div>
        ${hasItems ? `
          <div class="space-y-1.5 pt-1">${itemsHtml}</div>
          <div class="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 leading-relaxed">
            ${tipText}
          </div>
        ` : ''}
      </div>
    `;
  }
};
