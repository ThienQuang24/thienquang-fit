// Workout Timer: Bộ Đếm Giờ Tập & Thời Gian Nghỉ Thông Minh (Gym & Cardio)
const WorkoutTimer = {
  active: null,
  timerInterval: null,
  cardioLogs: JSON.parse(localStorage.getItem('tqfit_cardio_items') || '{}'),

  playTone(freq, dur, type = 'sine') {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch (e) {}
  },

  playChime() {
    this.playTone(523.25, 0.15);
    setTimeout(() => this.playTone(659.25, 0.15), 120);
    setTimeout(() => this.playTone(783.99, 0.35), 240);
  },

  playTick() { this.playTone(880, 0.08, 'triangle'); },

  formatTime(s) {
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  },

  startGym(exId, name, restStr) {
    const match = (restStr || '').match(/(\d+)/);
    const restSec = match ? parseInt(match[1], 10) : 45;
    this.stop();
    this.active = { type: 'gym', id: exId, name: name, elapsed: 0, restSec: restSec, isPaused: false };
    this.playTone(440, 0.2);
    this.timerInterval = setInterval(() => {
      if (!this.active || this.active.isPaused) return;
      this.active.elapsed++;
      this.updateHud();
    }, 1000);
    this.renderHud();
    if (typeof renderSchedule === 'function') renderSchedule();
  },

  finishGym(exId) {
    if (!this.active || this.active.id !== exId) return;
    const exName = this.active.name;
    if (typeof exerciseLogs !== 'undefined') {
      exerciseLogs[exId] = true;
      localStorage.setItem('tqfit_ex', JSON.stringify(exerciseLogs));
    }
    this.stop();
    this.playChime();
    showToast(`✓ Đã hoàn thành: ${exName}!`);
    if (typeof pushSystemNotification === 'function') pushSystemNotification('🏋️ ThienQuangFit', `Đã hoàn thành: ${exName}!`);
    if (typeof renderSchedule === 'function') renderSchedule();
  },

  startCardio(dateKey, cIdx, name, workSec = 150, restSec = 30) {
    const totalSec = typeof workSec === 'number' ? workSec : (parseInt(workSec, 10) || 150);
    this.stop();
    this.active = { type: 'cardio', dateKey, cIdx, name, remaining: totalSec, total: totalSec, restSec: restSec || 30, isPaused: false };
    this.playTone(440, 0.2);
    this.timerInterval = setInterval(() => {
      if (!this.active || this.active.isPaused) return;
      this.active.remaining--;
      if (this.active.remaining <= 3 && this.active.remaining > 0) this.playTick();
      if (this.active.remaining <= 0) {
        this.finishCardio(this.active.dateKey, this.active.cIdx);
      } else {
        this.updateHud();
      }
    }, 1000);
    this.renderHud();
    if (typeof renderSchedule === 'function') renderSchedule();
  },

  finishCardio(dateKey, cIdx) {
    if (!this.active) return;
    const cKey = `${dateKey}_cardio_${cIdx}`;
    this.cardioLogs[cKey] = true;
    localStorage.setItem('tqfit_cardio_items', JSON.stringify(this.cardioLogs));
    const exName = this.active.name, restTime = this.active.restSec || 30;
    this.stop();
    this.playChime();
    showToast(`✓ Hoàn thành bài: ${exName}!`);
    if (typeof pushSystemNotification === 'function') pushSystemNotification('🔥 ThienQuangFit', `Hoàn thành bài: ${exName}! Nghỉ ${restTime}s.`);
    if (typeof renderSchedule === 'function') renderSchedule();
    this.startRest(restTime, `⏳ Thời Gian Nghỉ: 30 Giây (Uống ngụm nước, thả lỏng)`);
  },

  toggleCardio(cKey) {
    this.cardioLogs[cKey] = !this.cardioLogs[cKey];
    localStorage.setItem('tqfit_cardio_items', JSON.stringify(this.cardioLogs));
    if (typeof renderSchedule === 'function') renderSchedule();
  },

  startRest(seconds, title) {
    this.stop();
    this.active = { type: 'rest', title: title || 'Thời Gian Nghỉ Hồi Sức', remaining: seconds, total: seconds, isPaused: false };
    this.timerInterval = setInterval(() => {
      if (!this.active || this.active.isPaused) return;
      this.active.remaining--;
      if (this.active.remaining <= 3 && this.active.remaining > 0) this.playTick();
      if (this.active.remaining <= 0) {
        this.stop();
        this.playChime();
        showToast('⏰ Hết giờ nghỉ! Sẵn sàng tập bài tiếp theo!');
        if (typeof pushSystemNotification === 'function') pushSystemNotification('⏰ ThienQuangFit', 'Hết giờ nghỉ! Sẵn sàng tập bài tiếp theo nào.');
        this.renderHud();
      } else {
        this.updateHud();
      }
    }, 1000);
    this.renderHud();
  },

  addRest(sec = 15) {
    if (this.active && this.active.type === 'rest') {
      this.active.remaining += sec;
      this.active.total += sec;
      this.updateHud();
    }
  },

  skipRest() {
    this.stop();
    this.playTone(660, 0.15);
    this.renderHud();
  },

  togglePause() {
    if (!this.active) return;
    this.active.isPaused = !this.active.isPaused;
    this.renderHud();
  },

  stop() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = null;
    this.active = null;
    this.renderHud();
  },

  renderHud() {
    let hud = document.getElementById('workout-timer-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'workout-timer-hud';
      document.body.appendChild(hud);
    }
    if (!this.active) {
      hud.innerHTML = '';
      hud.className = 'hidden';
      return;
    }

    hud.className = 'fixed bottom-3 left-1/2 -translate-x-1/2 w-[94%] max-w-md z-50 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-3 text-white transition-all';
    const isGym = this.active.type === 'gym', isCardio = this.active.type === 'cardio', isRest = this.active.type === 'rest';
    const timeStr = isGym ? this.formatTime(this.active.elapsed) : this.formatTime(this.active.remaining);
    const progress = isGym ? 100 : Math.max(0, Math.min(100, (this.active.remaining / this.active.total) * 100));
    const headerBadge = isGym ? '🏋️ ĐANG TẬP GYM' : (isCardio ? '🔥 CARDIO 3P' : '⏳ NGHỈ HỒI SỨC');
    const title = isRest ? this.active.title : this.active.name;
    const badgeColor = isRest ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : (isCardio ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40');

    hud.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${badgeColor} shrink-0">${headerBadge}</span>
          <h5 class="text-xs font-bold text-white truncate">${title}</h5>
        </div>
        <button onclick="WorkoutTimer.stop()" class="text-slate-400 hover:text-white p-1 shrink-0">✕</button>
      </div>
      <div class="flex items-center justify-between gap-3 my-1.5">
        <div class="font-outfit font-black text-2xl tracking-wider text-emerald-400 font-mono">${timeStr}</div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button onclick="WorkoutTimer.togglePause()" class="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold active:scale-95">
            ${this.active.isPaused ? '▶ Tiếp' : '⏸ Dừng'}
          </button>
          ${isGym ? `<button onclick="WorkoutTimer.finishGym('${this.active.id}')" class="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95">⏹ Kết Thúc</button>` : ''}
          ${isCardio ? `<button onclick="WorkoutTimer.finishCardio('${this.active.dateKey}', ${this.active.cIdx})" class="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 active:scale-95">⏹ Kết Thúc</button>` : ''}
          ${isRest ? `<button onclick="WorkoutTimer.addRest(15)" class="px-2 py-1.5 rounded-xl bg-slate-800 text-amber-300 text-xs font-bold active:scale-95">+15s</button><button onclick="WorkoutTimer.skipRest()" class="px-2.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs active:scale-95">Bỏ Qua ⏭</button>` : ''}
        </div>
      </div>
      <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
        <div class="h-full rounded-full transition-all duration-300 ${isRest ? 'bg-amber-400' : 'bg-emerald-400'}" style="width: ${progress}%"></div>
      </div>
    `;
  },

  updateHud() {
    const hud = document.getElementById('workout-timer-hud');
    if (!hud || !this.active) return;
    const timeEl = hud.querySelector('.font-mono');
    const progressEl = hud.querySelector('.h-full.rounded-full');
    if (timeEl) timeEl.innerText = this.active.type === 'gym' ? this.formatTime(this.active.elapsed) : this.formatTime(this.active.remaining);
    if (progressEl && this.active.total) {
      const p = Math.max(0, Math.min(100, (this.active.remaining / this.active.total) * 100));
      progressEl.style.width = `${p}%`;
    }
  }
};
