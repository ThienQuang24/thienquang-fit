// Quản Lý Hồ Sơ Người Dùng & Mục Tiêu (Profile Manager)
const ProfileManager = {
  getPresetProfile() {
    const dates = (typeof DateEngine !== 'undefined') ? DateEngine.getStoredDates() : { startDate: new Date().toISOString().slice(0, 10), endDate: '2027-01-08' };
    return {
      id: 'thien_quang',
      name: 'Thiên Quang',
      fullName: 'Mục Tiêu Của Thiên Quang (Gốc Chuẩn)',
      gender: 'male',
      age: 26,
      height: 172,
      weight: 80,
      targetWeight: 70,
      waist: 96,
      targetWaist: 80,
      durationDays: 60,
      startDate: dates.startDate,
      endDate: dates.endDate,
      lifestyle: 'desk',
      goal: 'fat_loss',
      location: 'gym',
      frequency: 5,
      injury: 'none',
      metrics: { bmi: '27.0', bmr: 1750, tdee: 2360, targetCalo: 1850, waterGoal: 3000 },
      isDefault: true
    };
  },

  getAllProfiles() {
    try {
      const saved = JSON.parse(localStorage.getItem('tqfit_profiles') || '[]');
      const preset = this.getPresetProfile();
      const filtered = saved.filter(p => p.id !== 'thien_quang');
      return [preset, ...filtered];
    } catch (e) {
      return [this.getPresetProfile()];
    }
  },

  getActiveProfileId() {
    return localStorage.getItem('tqfit_active_profile_id') || 'thien_quang';
  },

  getActiveProfile() {
    const id = this.getActiveProfileId();
    const profiles = this.getAllProfiles();
    return profiles.find(p => p.id === id) || profiles[0];
  },

  setActiveProfile(id) {
    const profiles = this.getAllProfiles();
    const target = profiles.find(p => p.id === id) || profiles[0];
    localStorage.setItem('tqfit_active_profile_id', target.id);
    localStorage.setItem('tqfit_onboarding_chosen', 'true');
    DateEngine.setDates(target.startDate, target.endDate);
    this.closeModals();
    if (typeof updateAppProfileUI === 'function') updateAppProfileUI();
    if (typeof renderCalendarCard === 'function') renderCalendarCard();
    if (typeof renderWaterTracker === 'function') renderWaterTracker();
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof showToast === 'function') showToast(`✓ Đã kích hoạt mục tiêu: ${target.name}`);
    if (typeof playDing === 'function') playDing();
  },

  deleteProfile(id) {
    if (id === 'thien_quang') {
      alert("Hồ sơ Thiên Quang là mục tiêu chuẩn mặc định, không thể xóa!");
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn xóa mục tiêu này?")) return;
    let profiles = JSON.parse(localStorage.getItem('tqfit_profiles') || '[]');
    profiles = profiles.filter(p => p.id !== id);
    localStorage.setItem('tqfit_profiles', JSON.stringify(profiles));
    if (this.getActiveProfileId() === id) this.setActiveProfile('thien_quang');
    else this.renderProfileListModal();
  },

  checkInitialOnboarding() {
    if (typeof ProfileUI !== 'undefined') ProfileUI.initDOM();
    const chosen = localStorage.getItem('tqfit_onboarding_chosen');
    if (!chosen) {
      this.openWelcomeModal();
    } else {
      const active = this.getActiveProfile();
      DateEngine.setDates(active.startDate, active.endDate);
    }
  },

  openWelcomeModal() {
    if (typeof ProfileUI !== 'undefined') ProfileUI.initDOM();
    const modal = document.getElementById('welcome-onboarding-modal');
    if (modal) modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  choosePreset() {
    this.setActiveProfile('thien_quang');
    const modal = document.getElementById('welcome-onboarding-modal');
    if (modal) modal.classList.add('hidden');
  },

  openWizardFromWelcome() {
    const welcome = document.getElementById('welcome-onboarding-modal');
    if (welcome) welcome.classList.add('hidden');
    this.openWizardModal();
  },

  openProfileModal() {
    if (typeof ProfileUI !== 'undefined') ProfileUI.initDOM();
    this.renderProfileListModal();
    const modal = document.getElementById('profile-list-modal');
    if (modal) modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  renderProfileListModal() {
    const container = document.getElementById('profile-list-items');
    if (!container) return;
    const profiles = this.getAllProfiles();
    const activeId = this.getActiveProfileId();

    container.innerHTML = profiles.map(p => {
      const isActive = p.id === activeId;
      return `
        <div class="p-3 rounded-2xl border transition-all ${isActive ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/30' : 'bg-slate-900 border-slate-800'}">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="font-outfit font-black text-sm text-white">${p.name}</h4>
                ${p.isDefault ? '<span class="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">GỐC</span>' : ''}
                ${isActive ? '<span class="px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[9px] font-bold">● ĐANG DÙNG</span>' : ''}
              </div>
              <p class="text-[11px] text-slate-300 mt-0.5">${p.weight}kg ➔ ${p.targetWeight}kg • Eo: ${p.waist}cm ➔ ${p.targetWaist}cm</p>
              <p class="text-[10px] text-slate-400">Lộ trình: ${p.durationDays} ngày • Nước: ${(p.metrics && p.metrics.waterGoal) || 3000}ml/ngày</p>
            </div>
            <div class="flex items-center gap-1">
              ${!isActive ? `<button onclick="ProfileManager.setActiveProfile('${p.id}')" class="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold active:scale-95">Chọn</button>` : ''}
              ${!p.isDefault ? `<button onclick="ProfileManager.deleteProfile('${p.id}')" class="p-1.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300" title="Xóa"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
    if (window.lucide) lucide.createIcons();
  },

  openWizardModal() {
    this.closeModals();
    const modal = document.getElementById('profile-wizard-modal');
    if (modal) modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  },

  closeModals() {
    ['welcome-onboarding-modal', 'profile-list-modal', 'profile-wizard-modal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  },

  submitWizard() {
    const name = document.getElementById('wiz-name').value.trim() || 'Người Tập';
    const gender = document.getElementById('wiz-gender').value;
    const age = parseInt(document.getElementById('wiz-age').value, 10) || 25;
    const height = parseFloat(document.getElementById('wiz-height').value) || 170;
    const weight = parseFloat(document.getElementById('wiz-weight').value) || 70;
    const targetWeight = parseFloat(document.getElementById('wiz-target-weight').value) || 65;
    const waist = parseFloat(document.getElementById('wiz-waist').value) || 85;
    const targetWaist = parseFloat(document.getElementById('wiz-target-waist').value) || 78;
    const duration = parseInt(document.getElementById('wiz-duration').value, 10) || 60;
    const startDate = (document.getElementById('wiz-start-date') && document.getElementById('wiz-start-date').value) || new Date().toISOString().slice(0, 10);
    const lifestyle = document.getElementById('wiz-lifestyle').value;
    const goal = document.getElementById('wiz-goal').value;
    const location = document.getElementById('wiz-location').value;
    const frequency = parseInt(document.getElementById('wiz-frequency').value, 10) || 5;
    const injury = document.getElementById('wiz-injury').value;

    const newProfile = ProfileGenerator.createProfile({
      name, gender, age, height, weight, targetWeight, waist, targetWaist,
      duration, startDate, lifestyle, goal, location, frequency, injury
    });

    const saved = JSON.parse(localStorage.getItem('tqfit_profiles') || '[]');
    saved.push(newProfile);
    localStorage.setItem('tqfit_profiles', JSON.stringify(saved));
    this.setActiveProfile(newProfile.id);
    this.closeModals();

    const m = newProfile.metrics;
    alert(`🎉 Đã thiết lập thành công mục tiêu cho ${newProfile.name}!\n\n` +
          `• BMR: ${m.bmr} kcal | TDEE: ${m.tdee} kcal\n` +
          `• Calo mục tiêu: ${m.targetCalo} kcal/ngày\n` +
          `• Uống nước: ${m.waterGoal}ml/ngày\n` +
          `• Lộ trình: ${newProfile.durationDays} ngày (${newProfile.startDate} ➔ ${newProfile.endDate})\n\n` +
          `AI đã tự động tối ưu 7 ngày tập luyện & thực đơn chuẩn khoa học!`);
  }
};
