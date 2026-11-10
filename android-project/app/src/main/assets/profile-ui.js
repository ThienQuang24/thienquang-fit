// Giao Diện Lựa Chọn & Thiết Lập Mục Tiêu (Profile UI & Modals)
const ProfileUI = {
  initDOM() {
    if (document.getElementById('tqfit-profile-modals-root')) return;
    const root = document.createElement('div');
    root.id = 'tqfit-profile-modals-root';
    root.innerHTML = `
      <!-- ONBOARDING WELCOME MODAL (2 LỰA CHỌN) -->
      <div id="welcome-onboarding-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl text-center">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/25">
            🔥
          </div>
          <div>
            <h3 class="font-outfit font-black text-lg text-white">Chào Mừng Đến ThienQuangFit</h3>
            <p class="text-xs text-slate-400 mt-1">Chọn phương thức bắt đầu hành trình của bạn:</p>
          </div>
          <div class="space-y-2.5 text-left">
            <button onclick="ProfileUI.selectPresetOption()" class="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border-2 border-emerald-500 hover:border-emerald-400 text-left transition-all active:scale-95 group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Lựa chọn 1 • Gốc chuẩn</span>
                <span class="text-xs text-emerald-400 group-hover:translate-x-1 transition-transform">➔</span>
              </div>
              <h4 class="font-outfit font-black text-sm text-white mt-1">🏆 Mục tiêu có sẵn (Thiên Quang)</h4>
              <p class="text-[11px] text-slate-300 mt-1">Lộ trình 60 ngày vàng siết eo 96cm ➔ 80cm, giảm 10kg mỡ cho Dân Dev. Đã tối ưu chi tiết 100%.</p>
            </button>
            <button onclick="ProfileUI.selectNewOption()" class="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-700 hover:border-cyan-400 text-left transition-all active:scale-95 group">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Lựa chọn 2 • Cá nhân hoá</span>
                <span class="text-xs text-cyan-400 group-hover:translate-x-1 transition-transform">➔</span>
              </div>
              <h4 class="font-outfit font-black text-sm text-white mt-1">🎯 Thiết lập Mục tiêu mới</h4>
              <p class="text-[11px] text-slate-400 mt-1">Dành cho người khác hoặc mục tiêu mới. Nhập số đo, thể trạng, chấn thương để AI tạo lịch riêng.</p>
            </button>
          </div>
        </div>
      </div>

      <!-- PROFILE LIST MODAL -->
      <div id="profile-list-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-4 space-y-3 shadow-2xl">
          <div class="flex justify-between items-center pb-2 border-b border-slate-800">
            <h4 class="font-outfit font-bold text-sm text-white flex items-center gap-1.5">
              <i data-lucide="users" class="w-4 h-4 text-emerald-400"></i> Quản Lý Hồ Sơ & Mục Tiêu
            </h4>
            <button onclick="ProfileUI.closeModals()" class="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
          <div id="profile-list-items" class="space-y-2 max-h-64 overflow-y-auto pr-1"></div>
          <div class="pt-1 flex gap-2">
            <button onclick="ProfileUI.openWizardModal()" class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 active:scale-95">
              + Thiết Lập Mục Tiêu Mới
            </button>
            <button onclick="ProfileUI.closeModals()" class="px-3 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">
              Đóng
            </button>
          </div>
        </div>
      </div>

      <!-- INTAKE WIZARD MODAL -->
      <div id="profile-wizard-modal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-4 space-y-3 max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="flex justify-between items-center pb-2 border-b border-slate-800">
            <div>
              <h4 class="font-outfit font-black text-sm text-white flex items-center gap-1.5">
                <i data-lucide="sparkles" class="w-4 h-4 text-cyan-400"></i> Thiết Lập Mục Tiêu Cá Nhân
              </h4>
              <span class="text-[10px] text-slate-400">AI tự động tính toán BMR, TDEE & sinh lịch tập</span>
            </div>
            <button onclick="ProfileUI.closeModals()" class="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

          <div class="space-y-2.5 text-xs">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Họ và tên</label>
                <input id="wiz-name" type="text" placeholder="Vd: Minh Hoàng" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400">
              </div>
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Giới tính</label>
                <select id="wiz-gender" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400">
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Tuổi</label>
                <input id="wiz-age" type="number" value="25" min="15" max="80" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400">
              </div>
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Cao (cm)</label>
                <input id="wiz-height" type="number" value="170" min="130" max="220" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Lộ trình</label>
                <select id="wiz-duration" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400">
                  <option value="30">30 Ngày (1T)</option>
                  <option value="60" selected>60 Ngày (2T)</option>
                  <option value="90">90 Ngày (3T)</option>
                </select>
              </div>
              <div>
                <label class="text-[10px] font-bold text-emerald-400 uppercase">Ngày bắt đầu</label>
                <input id="wiz-start-date" type="date" value="${new Date().toISOString().slice(0, 10)}" class="w-full bg-slate-950 border border-emerald-500/60 rounded-xl px-2 py-1 text-xs text-emerald-300 font-bold focus:outline-none focus:border-cyan-400">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Cân nặng hiện tại (kg)</label>
                <input id="wiz-weight" type="number" value="75" min="35" max="180" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white">
              </div>
              <div>
                <label class="text-[10px] font-bold text-emerald-400 uppercase">Cân mục tiêu (kg)</label>
                <input id="wiz-target-weight" type="number" value="68" min="35" max="180" class="w-full bg-slate-900 border border-emerald-500/70 rounded-xl px-2.5 py-1.5 text-xs text-emerald-300 font-bold">
              </div>
              <div class="mt-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase">Vòng eo hiện tại (cm)</label>
                <input id="wiz-waist" type="number" value="88" min="50" max="160" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white">
              </div>
              <div class="mt-1">
                <label class="text-[10px] font-bold text-emerald-400 uppercase">Eo mục tiêu (cm)</label>
                <input id="wiz-target-waist" type="number" value="78" min="50" max="160" class="w-full bg-slate-900 border border-emerald-500/70 rounded-xl px-2.5 py-1.5 text-xs text-emerald-300 font-bold">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Lối sống / Công việc</label>
                <select id="wiz-lifestyle" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white">
                  <option value="desk">Dân Dev / Văn phòng ngồi nhiều</option>
                  <option value="active">Đứng / Đi lại nhiều</option>
                  <option value="labor">Lao động thể chất</option>
                </select>
              </div>
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Mục tiêu tập luyện</label>
                <select id="wiz-goal" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white">
                  <option value="fat_loss">Giảm mỡ & Siết eo V-Taper</option>
                  <option value="hypertrophy">Tăng cơ nạc dày người</option>
                  <option value="posture">Chống gù lưng & Mỏi cổ vai gáy</option>
                  <option value="endurance">Sức bền tim mạch</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Nơi tập & Dụng cụ</label>
                <select id="wiz-location" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white">
                  <option value="gym">Phòng Gym (Máy + Tạ)</option>
                  <option value="home">Tại nhà (Bodyweight / Thảm)</option>
                </select>
              </div>
              <div>
                <label class="text-[10px] font-bold text-slate-400 uppercase">Số buổi tập / tuần</label>
                <select id="wiz-frequency" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white">
                  <option value="4">4 buổi/tuần</option>
                  <option value="5" selected>5 buổi/tuần</option>
                  <option value="6">6 buổi/tuần</option>
                  <option value="3">3 buổi/tuần</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-[10px] font-bold text-amber-400 uppercase">Hạn chế thể lực / Chấn thương</label>
              <select id="wiz-injury" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white">
                <option value="none">Bình thường (Khỏe mạnh 100%)</option>
                <option value="wrist">Đau cổ tay (Tránh đòn tạ, ưu tiên máy)</option>
                <option value="knee">Đau khớp gối (Hạn chế squat nặng / nhảy)</option>
                <option value="back">Đau thắt lưng (Tránh cúi gập lưng nặng)</option>
              </select>
            </div>
          </div>

          <div class="pt-2 flex gap-2">
            <button onclick="ProfileManager.submitWizard()" class="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:opacity-95 text-slate-950 rounded-xl text-xs font-black shadow-lg shadow-cyan-500/20 active:scale-95">
              ✨ Tạo Lịch Trình Cá Nhân Hoá
            </button>
            <button onclick="ProfileUI.closeModals()" class="px-3.5 py-3 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold">
              Hủy
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    if (window.lucide) lucide.createIcons();
  },

  selectPresetOption() {
    ProfileManager.choosePreset();
  },

  selectNewOption() {
    ProfileManager.openWizardFromWelcome();
  },

  openProfileModal() {
    this.initDOM();
    ProfileManager.openProfileModal();
  },

  openWizardModal() {
    this.initDOM();
    ProfileManager.openWizardModal();
  },

  closeModals() {
    ProfileManager.closeModals();
  }
};
