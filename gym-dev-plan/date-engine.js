// Date Engine: Quản lý Ngày bắt đầu, Ngày kết thúc và Tính toán Thứ
const DateEngine = {
  formatLocalISO(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  getStoredDates() {
    const today = this.formatLocalISO(new Date());
    const saved = JSON.parse(localStorage.getItem('tqfit_dates') || '{}');
    const startDate = saved.startDate || today;
    let endDate = saved.endDate;
    if (!endDate) {
      const end = new Date(startDate + 'T00:00:00');
      end.setDate(end.getDate() + 60);
      endDate = this.formatLocalISO(end);
    }
    return { startDate, endDate };
  },

  setDates(startDate, endDate) {
    localStorage.setItem('tqfit_dates', JSON.stringify({ startDate, endDate }));
  },

  changeStartDate(newStartDateStr) {
    if (!newStartDateStr) return;
    const stats = this.getStats();
    const duration = stats.totalDays || 60;
    const start = new Date(newStartDateStr + 'T00:00:00');
    const end = new Date(start);
    end.setDate(start.getDate() + duration);
    const newEndStr = this.formatLocalISO(end);
    this.setDates(newStartDateStr, newEndStr);

    if (typeof ProfileManager !== 'undefined') {
      const active = ProfileManager.getActiveProfile();
      if (active) {
        active.startDate = newStartDateStr;
        active.endDate = newEndStr;
        let profiles = JSON.parse(localStorage.getItem('tqfit_profiles') || '[]');
        const idx = profiles.findIndex(p => p.id === active.id);
        if (idx > -1) { profiles[idx].startDate = newStartDateStr; profiles[idx].endDate = newEndStr; }
        localStorage.setItem('tqfit_profiles', JSON.stringify(profiles));
      }
    }
    if (typeof selectDate === 'function') selectDate(newStartDateStr);
    if (typeof showToast === 'function') showToast(`✓ Đã đổi ngày bắt đầu: ${newStartDateStr.split('-').reverse().join('/')}`);
  },

  getStats(selectedDateStr) {
    const { startDate, endDate } = this.getStoredDates();
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const current = new Date((selectedDateStr || this.formatLocalISO(new Date())) + 'T00:00:00');

    const diffTotalTime = end.getTime() - start.getTime();
    const totalDays = Math.max(1, Math.round(diffTotalTime / (1000 * 3600 * 24)));

    const diffCurrentTime = current.getTime() - start.getTime();
    const dayNumber = Math.max(1, Math.min(totalDays, Math.floor(diffCurrentTime / (1000 * 3600 * 24)) + 1));
    const daysLeft = Math.max(0, Math.round((end.getTime() - current.getTime()) / (1000 * 3600 * 24)));
    const percent = Math.min(100, Math.max(0, Math.round((dayNumber / totalDays) * 100)));
    const currentWeek = Math.min(12, Math.ceil(dayNumber / 7));

    return { totalDays, dayNumber, daysLeft, percent, currentWeek, startDate, endDate };
  },

  getDayInfo(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const map = {
      1: { key: 'mon', label: 'Thứ Hai', short: 'T2' },
      2: { key: 'tue', label: 'Thứ Ba', short: 'T3' },
      3: { key: 'wed', label: 'Thứ Tư', short: 'T4' },
      4: { key: 'thu', label: 'Thứ Năm', short: 'T5' },
      5: { key: 'fri', label: 'Thứ Sáu', short: 'T6' },
      6: { key: 'weekend', label: 'Thứ Bảy', short: 'T7' },
      0: { key: 'weekend', label: 'Chủ Nhật', short: 'CN' }
    };
    return map[date.getDay()] || map[1];
  },

  // Tạo danh sách các ngày trong lộ trình, TUYỆT ĐỐI KHÔNG CHỨA NGÀY TRƯỚC START_DATE
  getWeekStrip(baseDateStr) {
    const { startDate, endDate } = this.getStoredDates();
    const todayStr = this.formatLocalISO(new Date());
    const selected = (baseDateStr && baseDateStr >= startDate) ? baseDateStr : (todayStr >= startDate ? todayStr : startDate);

    const startObj = new Date(startDate + 'T00:00:00');
    const selectedObj = new Date(selected + 'T00:00:00');

    let winStart = new Date(selectedObj);
    winStart.setDate(selectedObj.getDate() - 1);
    if (winStart < startObj) winStart = new Date(startObj);

    const strip = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(winStart);
      d.setDate(winStart.getDate() + i);
      const iso = this.formatLocalISO(d);
      if (iso > endDate) break;
      if (iso < startDate) continue; // TUYỆT ĐỐI KHÔNG HIỆN NGÀY QUÁ KHỨ TRƯỚC START_DATE

      const info = this.getDayInfo(iso);
      const isStart = (iso === startDate);
      let shortLabel = info.short;
      if (iso === todayStr) shortLabel = 'Hôm nay';
      else if (isStart) shortLabel = 'Bắt đầu';

      strip.push({
        dateStr: iso,
        dayKey: info.key,
        dayLabel: info.label,
        shortLabel,
        displayDate: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        isToday: (iso === todayStr),
        isStart,
        isFuture: (iso > todayStr),
        isPast: (iso < todayStr)
      });
    }
    return strip;
  }
};
