// Logic Điều Phối Ứng Dụng ThienQuangFit (Mobile-First)
let currentSelectedDate = (typeof DateEngine !== 'undefined') ? DateEngine.formatLocalISO(new Date()) : new Date().toISOString().slice(0, 10);
let currentDay = DateEngine.getDayInfo(currentSelectedDate).key;
let waterLogs = JSON.parse(localStorage.getItem('tqfit_water') || '{}');
let exerciseLogs = JSON.parse(localStorage.getItem('tqfit_ex') || '{}');
let timelineLogs = JSON.parse(localStorage.getItem('tqfit_timeline') || '{}');
const getTodayKey = () => (typeof DateEngine !== 'undefined') ? DateEngine.formatLocalISO(new Date()) : new Date().toISOString().slice(0, 10);

function isPastTime(timeStr) {
  const now = new Date(), currentMins = now.getHours() * 60 + now.getMinutes();
  const m = timeStr.match(/(\d{1,2}):(\d{2})/);
  return m ? currentMins >= parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : false;
}

function isMilestoneOverdue(dateStr, timeStr, isDone) {
  if (isDone) return false;
  const today = getTodayKey();
  return dateStr > today ? false : (dateStr === today ? isPastTime(timeStr) : true);
}

function selectDate(dateStr) {
  const { startDate, endDate } = DateEngine.getStoredDates();
  if (dateStr < startDate) dateStr = startDate;
  if (dateStr > endDate) dateStr = endDate;
  currentSelectedDate = dateStr;
  currentDay = DateEngine.getDayInfo(dateStr).key;
  renderCalendarCard();
  renderWaterTracker();
  renderSchedule();
}

function updateAppProfileUI() {
  if (typeof ProfileManager === 'undefined') return;
  const p = ProfileManager.getActiveProfile();
  const n = document.getElementById('header-profile-name'), s = document.getElementById('header-profile-sub'), b = document.getElementById('header-profile-badge');
  if (n) n.innerText = p.name;
  if (s) s.innerText = `${p.weight}kg ➔ ${p.targetWeight}kg | Eo: ${p.waist}cm ➔ ${p.targetWaist}cm`;
  if (b) b.innerText = `${p.durationDays}N`;
}

function renderCalendarCard() {
  const container = document.getElementById('calendar-countdown-container');
  const stats = DateEngine.getStats(currentSelectedDate), weekStrip = DateEngine.getWeekStrip(currentSelectedDate);
  const startFmt = stats.startDate.split('-').reverse().join('/'), endFmt = stats.endDate.split('-').reverse().join('/');
  const stripHtml = weekStrip.map(item => {
    const isSel = (item.dateStr === currentSelectedDate);
    return `<button onclick="selectDate('${item.dateStr}')" class="px-2.5 py-1.5 rounded-xl text-center transition-all shrink-0 active:scale-95 ${isSel ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}"><span class="text-[10px] block ${isSel ? 'text-slate-900 font-bold' : (item.isToday ? 'text-emerald-400 font-bold' : 'text-slate-500')}">${item.isToday ? 'Hôm nay' : item.shortLabel}</span><span class="text-xs block font-outfit font-extrabold mt-0.5">${item.displayDate}</span></button>`;
  }).join('');

  container.innerHTML = `<div class="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/70 border border-slate-800 space-y-3">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Hành Trình ${stats.totalDays} Ngày</span>
        <h3 class="font-outfit text-sm font-black text-white mt-0.5 cursor-pointer hover:text-emerald-400 flex items-center gap-1" onclick="const d = prompt('Đổi ngày bắt đầu (YYYY-MM-DD):', '${stats.startDate}'); if(d) DateEngine.changeStartDate(d);">${startFmt} ➔ ${endFmt} <span class="text-[10px] text-emerald-400 font-normal">✎</span></h3>
      </div>
      <div class="text-right">
        <span class="font-outfit font-black text-sm text-emerald-400">Ngày ${stats.dayNumber}/${stats.totalDays}</span>
        <span class="text-[10px] block text-slate-400 font-semibold">Tuần ${stats.currentWeek} • Còn ${stats.daysLeft} ngày</span>
      </div>
    </div>
    <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800"><div class="bg-gradient-to-r from-cyan-500 via-emerald-400 to-teal-400 h-2 rounded-full transition-all duration-300" style="width: ${stats.percent}%"></div></div>
    <div class="pt-1 flex gap-1.5 overflow-x-auto no-scrollbar">${stripHtml}</div>
  </div>`;
  lucide.createIcons();
}

function renderWaterTracker() {
  const container = document.getElementById('water-tracker-container'), dateKey = currentSelectedDate;
  if (!waterLogs[dateKey]) waterLogs[dateKey] = [];
  const schedule = getActiveWaterSchedule(), totalGoal = getActiveWaterGoal();
  const count = waterLogs[dateKey].length, portion = Math.round(totalGoal / schedule.length);
  const currentMl = count * portion, percent = Math.min(100, Math.round((count / schedule.length) * 100));

  const itemsHtml = schedule.map((w, idx) => {
    const isDone = waterLogs[dateKey].includes(idx), isOverdue = isMilestoneOverdue(dateKey, w.time, isDone);
    const cardStyle = isDone ? 'bg-emerald-950/40 border-2 border-emerald-500 ring-1 ring-emerald-500/30' : (isOverdue ? 'bg-red-950/30 border-2 border-red-500/70 ring-1 ring-red-500/30' : 'bg-slate-900/80 border border-slate-800');
    const btnStyle = isDone ? 'bg-emerald-500 text-slate-950 font-black shadow-sm shadow-emerald-500/30' : (isOverdue ? 'bg-red-600 text-white font-black shadow-md shadow-red-500/30 animate-pulse' : 'bg-slate-800 text-slate-300 border border-slate-700');
    const btnText = isDone ? '✓ ĐÃ UỐNG (' + w.amount + ')' : (isOverdue ? '⚠ CHƯA UỐNG (' + w.amount + ')' : '+ ' + w.amount);
    return `<div class="flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 ${cardStyle}"><div class="flex items-center gap-2"><span class="text-xs font-bold ${isDone ? 'text-emerald-400' : (isOverdue ? 'text-red-400' : 'text-slate-400')}">${w.time}</span><span class="text-xs text-slate-200 font-medium">${w.label}</span></div><button onclick="toggleWater(${idx})" class="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${btnStyle}">${btnText}</button></div>`;
  }).join('');

  container.innerHTML = `<div class="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2"><i data-lucide="droplet" class="w-5 h-5 text-cyan-400"></i><span class="font-outfit font-bold text-white text-sm">Lịch Uống Nước (${currentSelectedDate.split('-').reverse().join('/')})</span></div>
      <span class="text-xs font-bold ${percent === 100 ? 'text-emerald-400' : 'text-cyan-400'}">${currentMl.toLocaleString()}ml / ${totalGoal.toLocaleString()}ml (${percent}%)</span>
    </div>
    <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800"><div class="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2 rounded-full transition-all duration-300" style="width: ${percent}%"></div></div>
    <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">${itemsHtml}</div>
  </div>`;
  lucide.createIcons();
}

function toggleWater(idx) {
  const dateKey = currentSelectedDate;
  if (!waterLogs[dateKey]) waterLogs[dateKey] = [];
  const pos = waterLogs[dateKey].indexOf(idx);
  if (pos > -1) waterLogs[dateKey].splice(pos, 1);
  else { waterLogs[dateKey].push(idx); playDing(); }
  localStorage.setItem('tqfit_water', JSON.stringify(waterLogs));
  renderWaterTracker();
}

function renderSchedule() {
  const allWeeklyData = getActiveWeeklyData();
  const data = allWeeklyData[currentDay] || allWeeklyData.mon;
  const container = document.getElementById('daily-timeline-content');
  const dateKey = currentSelectedDate, todayStr = getTodayKey();
  const isViewingToday = (dateKey === todayStr), isFuture = (dateKey > todayStr);

  if (!timelineLogs[dateKey]) timelineLogs[dateKey] = {};
  const milestones = WorkoutUI.getDayMilestones(data);
  const completedCount = milestones.filter(m => !!timelineLogs[dateKey][`${currentDay}_${m.id}`]).length;
  const totalCount = milestones.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  let milestonesHtml = WorkoutUI.renderMilestoneItems(milestones, dateKey, currentDay, isFuture);
  const foodLogHtml = typeof FoodLog !== 'undefined' ? FoodLog.renderSection(dateKey) : '';

  container.innerHTML = `
    <div class="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/60 border border-slate-800 space-y-2.5">
      <div class="flex items-center justify-between">
        <div>
          <span class="text-[10px] font-bold ${isViewingToday ? 'text-emerald-400' : 'text-cyan-400'} uppercase tracking-wider">
            ${isViewingToday ? '● HÔM NAY (' + dateKey.split('-').reverse().join('/') + ')' : (isFuture ? '○ NGÀY SẮP TỚI (' + dateKey.split('-').reverse().join('/') + ')' : '○ NGÀY ĐÃ QUA (' + dateKey.split('-').reverse().join('/') + ')')}
          </span>
          <h3 class="font-outfit text-base font-black text-white">${data.dayName} • ${data.focus}</h3>
        </div>
        <div class="text-right">
          <span class="font-outfit font-black text-sm ${percent === 100 ? 'text-emerald-400' : 'text-amber-400'}">${completedCount}/${totalCount}</span>
          <span class="text-[10px] block text-slate-400 font-semibold">${percent}% Xong</span>
        </div>
      </div>
      <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-300" style="width: ${percent}%"></div>
      </div>
    </div>
    ${foodLogHtml}
    <div class="space-y-3">${milestonesHtml}</div>`;
  lucide.createIcons();
}

function toggleMilestone(itemKey) {
  const dateKey = currentSelectedDate;
  if (!timelineLogs[dateKey]) timelineLogs[dateKey] = {};
  timelineLogs[dateKey][itemKey] = !timelineLogs[dateKey][itemKey];
  if (timelineLogs[dateKey][itemKey]) playDing();
  localStorage.setItem('tqfit_timeline', JSON.stringify(timelineLogs));
  renderSchedule();
}

function toggleExercise(exId) {
  exerciseLogs[exId] = !exerciseLogs[exId];
  if (exerciseLogs[exId]) playDing();
  localStorage.setItem('tqfit_ex', JSON.stringify(exerciseLogs));
  renderSchedule();
}

function showToast(msg) {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;
  toast.innerText = msg;
  toast.classList.remove('hidden', 'opacity-0');
  toast.classList.add('opacity-100');
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2500);
}

function pushSystemNotification(title, message) {
  if (window.AndroidBridge && typeof window.AndroidBridge.showNotification === 'function') {
    window.AndroidBridge.showNotification(title, message);
    return true;
  }
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body: message, icon: "assets/exercises/goblet_squat/0.jpg" });
      return true;
    } catch (e) {}
  }
  return false;
}

function enableNotifications() {
  if (window.AndroidBridge && typeof window.AndroidBridge.showNotification === 'function') {
    if (typeof window.AndroidBridge.requestPermission === 'function') {
      window.AndroidBridge.requestPermission();
    }
    window.AndroidBridge.showNotification("THIENQUANG FIT", "Đã kết nối thanh thông báo Android thành công!");
    playDing();
    const st = document.getElementById('notif-status');
    if (st) st.innerText = "✓ Đã Bật";
    document.getElementById('notif-btn')?.classList.add('bg-emerald-600', 'text-white');
    showToast("✓ Đã bật thông báo trên điện thoại!");
    return;
  }
  if (!("Notification" in window)) { showToast("Trình duyệt không hỗ trợ Web Notification."); return; }
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      pushSystemNotification("THIENQUANG FIT", "Đã bật chuông nhắc nhở uống nước và tập gym!");
      playDing();
      const st = document.getElementById('notif-status');
      if (st) st.innerText = "✓ Đã Bật";
      document.getElementById('notif-btn')?.classList.add('bg-emerald-600', 'text-white');
      showToast("✓ Đã bật thông báo thành công!");
    }
  });
}

function playDing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof ProfileManager !== 'undefined') ProfileManager.checkInitialOnboarding();
  const { startDate } = DateEngine.getStoredDates();
  if (currentSelectedDate < startDate) {
    currentSelectedDate = startDate;
    currentDay = DateEngine.getDayInfo(startDate).key;
  }
  updateAppProfileUI();
  renderCalendarCard();
  renderWaterTracker();
  renderSchedule();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=20261110_v31').then(r => r.update()).catch(() => {});
  }
  const isAndroid = !!window.AndroidBridge;
  const isWebGranted = (window.Notification && Notification.permission === "granted");
  if (isAndroid || isWebGranted) {
    const st = document.getElementById('notif-status');
    if (st) st.innerText = "✓ Đã Bật";
    if (isAndroid) document.getElementById('notif-btn')?.classList.add('bg-emerald-600', 'text-white');
  }
});
