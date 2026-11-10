// Extra Workout: Quản Lý Bài Tập Bổ Sung / Tự Tập Thêm (Đấm bao cát, Nhảy dây, v.v.)
const ExtraWorkout = {
  storageKey: 'tqfit_extra_workouts',

  presets: [
    { key: 'boxing', name: 'Đấm bao cát (Heavy Bag)', icon: '🥊', duration: 15, unit: 'phút', rate: 9.5, tip: 'Đấm liên tục thẳng - móc - né, xả stress và siết cơ vai cơ bụng.' },
    { key: 'jumprope', name: 'Nhảy dây tốc độ', icon: '🪢', duration: 10, unit: 'phút', rate: 11.0, tip: 'Bật mũi chân nhịp nhàng, kích hoạt bắp chuối và xả nước tích tụ.' },
    { key: 'bike', name: 'Đạp xe máy thả lỏng', icon: '🚴', duration: 15, unit: 'phút', rate: 7.5, tip: 'Kháng lực nhẹ 80 rpm, xả sạch axit lactic khỏi cơ đùi.' },
    { key: 'plank', name: 'Plank siết cơ lõi thêm', icon: '⏱️', duration: 3, unit: 'hiệp (mỗi hiệp 45s)', rate: 5.0, tip: 'Gồng chặt bụng và mông, giữ lưng thẳng đốt mỡ bụng dưới.' },
    { key: 'pullup', name: 'Kéo xà đơn / Xà kép thêm', icon: '🏋️', duration: 3, unit: 'hiệp x 8-10 reps', rate: 6.0, tip: 'Mở rộng xô lưng chữ V hoặc nhấn sâu xẻ rãnh ngực dưới.' },
    { key: 'custom', name: 'Tự do tập thêm...', icon: '⚡', duration: 10, unit: 'phút', rate: 7.0, tip: 'Tự do rèn luyện thể lực theo cảm nhận hôm nay.' }
  ],

  getAll() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
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

  openAddModal(dateKey) {
    const modal = document.getElementById('extra-workout-modal');
    if (!modal) return;
    modal.dataset.date = dateKey;
    this.selectPreset('boxing');
    modal.classList.remove('hidden');
    lucide.createIcons();
  },

  closeAddModal() {
    const modal = document.getElementById('extra-workout-modal');
    if (modal) modal.classList.add('hidden');
  },

  selectPreset(key) {
    const preset = this.presets.find(p => p.key === key) || this.presets[0];
    const nameInput = document.getElementById('extra-ex-name');
    const durInput = document.getElementById('extra-ex-duration');
    const unitEl = document.getElementById('extra-ex-unit');
    const tipEl = document.getElementById('extra-ex-tip');

    if (nameInput) nameInput.value = preset.name;
    if (durInput) durInput.value = preset.duration;
    if (unitEl) unitEl.innerText = preset.unit;
    if (tipEl) tipEl.innerText = preset.tip;

    this.currentRate = preset.rate;
    this.updateCaloPreview();
  },

  updateCaloPreview() {
    const durInput = document.getElementById('extra-ex-duration');
    const incCaloBox = document.getElementById('extra-ex-include-calo');
    const caloPreview = document.getElementById('extra-ex-calo-preview');
    if (!durInput || !incCaloBox || !caloPreview) return;

    if (!incCaloBox.checked) {
      caloPreview.innerHTML = '<span class="text-slate-400">Không tính vào calo tiêu hao (Chỉ ghi nhận tập tự do).</span>';
      return;
    }

    const dur = parseFloat(durInput.value) || 0;
    const rate = this.currentRate || 7.5;
    const est = Math.round(dur * rate);
    caloPreview.innerHTML = `<span class="text-amber-400 font-bold">🔥 Ước tính đốt thêm: ~${est} kcal</span> <span class="text-[10px] text-slate-400">(dựa trên thể trạng 80kg)</span>`;
  },

  saveExercise() {
    const modal = document.getElementById('extra-workout-modal');
    const dateKey = modal ? modal.dataset.date : currentSelectedDate;
    const name = document.getElementById('extra-ex-name').value.trim();
    const dur = document.getElementById('extra-ex-duration').value.trim();
    const incCalo = document.getElementById('extra-ex-include-calo').checked;

    if (!name) {
      alert('Vui lòng nhập tên bài tập hoặc hoạt động!');
      return;
    }

    const rate = this.currentRate || 7.5;
    const calories = incCalo ? Math.round((parseFloat(dur) || 10) * rate) : 0;

    const newItem = {
      id: 'ext_' + Date.now(),
      name: name,
      duration: dur ? `${dur} phút` : 'Tự do',
      includeCalo: incCalo,
      calories: calories,
      isDone: false,
      createdAt: new Date().toISOString()
    };

    const list = this.getForDate(dateKey);
    list.push(newItem);
    this.saveForDate(dateKey, list);

    this.closeAddModal();
    if (typeof playDing === 'function') playDing();
    showToast(`✓ Đã thêm bài tập bổ sung: ${name}`);
    if (typeof renderSchedule === 'function') renderSchedule();
  },

  toggleDone(dateKey, id) {
    const list = this.getForDate(dateKey);
    const item = list.find(x => x.id === id);
    if (item) {
      item.isDone = !item.isDone;
      this.saveForDate(dateKey, list);
      if (item.isDone && typeof playDing === 'function') playDing();
      if (typeof renderSchedule === 'function') renderSchedule();
    }
  },

  deleteExercise(dateKey, id) {
    const list = this.getForDate(dateKey).filter(x => x.id !== id);
    this.saveForDate(dateKey, list);
    showToast('Đã xóa bài tập bổ sung.');
    if (typeof renderSchedule === 'function') renderSchedule();
  },

  renderSection(dateKey) {
    const list = this.getForDate(dateKey);

    const itemsHtml = list.length === 0 ? `
      <div class="p-2.5 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-[11px] text-slate-400">
        Chưa có bài tập thêm hôm nay. Bạn có thể đấm bao cát, nhảy dây hoặc xả cơ tùy thích!
      </div>
    ` : list.map(item => `
      <div class="p-2.5 rounded-xl border transition-all ${item.isDone ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30' : 'bg-slate-950/80 border-slate-800'} flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <button onclick="ExtraWorkout.toggleDone('${dateKey}', '${item.id}')" class="shrink-0 text-xs px-2 py-1 rounded-lg font-black transition-all active:scale-95 ${item.isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'}">
            ${item.isDone ? '✓ XONG' : '○ CHƯA'}
          </button>
          <div class="min-w-0">
            <h6 class="font-outfit font-bold text-white text-xs truncate ${item.isDone ? 'line-through text-slate-400' : ''}">${item.name}</h6>
            <div class="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
              <span>⏱️ ${item.duration}</span>
              ${item.includeCalo && item.calories > 0 ? `<span class="text-amber-400 font-bold">• 🔥 +${item.calories} kcal</span>` : '<span class="text-slate-500">• Tập tự do</span>'}
            </div>
          </div>
        </div>
        <button onclick="ExtraWorkout.deleteExercise('${dateKey}', '${item.id}')" class="p-1 text-slate-500 hover:text-red-400 shrink-0" title="Xóa bài này">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `).join('');

    return `
      <div class="mt-3 pt-3 border-t border-slate-800 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-black text-amber-400 uppercase tracking-wide flex items-center gap-1">
              🥊 TỰ TẬP THÊM / BỔ SUNG
            </span>
            <span class="text-[10px] text-slate-500 font-semibold">(${list.length} bài)</span>
          </div>
          <button onclick="ExtraWorkout.openAddModal('${dateKey}')" class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold hover:bg-amber-500/30 active:scale-95 transition-all">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>+ Thêm Bài</span>
          </button>
        </div>
        <div class="space-y-1.5">${itemsHtml}</div>
      </div>
    `;
  }
};
