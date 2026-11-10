// Workout UI: Quản Lý Hiển Thị Bài Tập, Hình Ảnh, Chuẩn Form & Milestones
const WorkoutUI = {
  renderGymList(gymList, dateKey, dayKey) {
    if (!gymList || gymList.length === 0) {
      return `<div class="p-3 text-center text-xs text-slate-500">Chưa có bài tập cho ngày này.</div>`;
    }

    return gymList.map((g, idx) => {
      const exId = `${dateKey}_ex_${idx}`;
      const isExDone = !!exerciseLogs[exId];
      const isExActive = (typeof WorkoutTimer !== 'undefined' && WorkoutTimer.active && WorkoutTimer.active.id === exId);

      let btnAction = `toggleExercise('${exId}')`;
      let btnLabel = isExDone ? '✓ ĐÃ TẬP' : '▶ BẮT ĐẦU';
      let btnClass = isExDone ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-200 border border-slate-700 hover:border-emerald-500';

      if (isExActive) {
        btnAction = `WorkoutTimer.finishGym('${exId}')`;
        btnLabel = '⏹ KẾT THÚC';
        btnClass = 'bg-amber-500 text-slate-950 font-black animate-pulse shadow-md shadow-amber-500/30';
      } else if (!isExDone) {
        btnAction = `WorkoutTimer.startGym('${exId}', '${g.name.replace(/'/g, "\\'")}', '${g.rest}')`;
      }

      return `
        <div class="rounded-2xl transition-all duration-200 border ${isExDone ? 'border-emerald-500 ring-1 ring-emerald-500/40 bg-emerald-950/20' : (isExActive ? 'border-amber-500 ring-1 ring-amber-500/40 bg-amber-950/20' : 'border-slate-800 bg-slate-900/95')} p-3 space-y-2.5">
          <div class="flex gap-3">
            <div class="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer group" onclick="WorkoutUI.openDetail('${dayKey}', ${idx})">
              <img src="${g.img}" alt="${g.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy">
              <span class="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-[9px] text-cyan-300 font-bold px-1 rounded">2 Ảnh</span>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1">
                <span class="text-[10px] font-extrabold ${isExActive ? 'text-amber-400' : 'text-emerald-400'} uppercase tracking-wider">BÀI #${idx + 1}</span>
                <button onclick="${btnAction}" class="text-xs px-2.5 py-1 rounded-lg font-black transition-all active:scale-95 ${btnClass}">
                  ${btnLabel}
                </button>
              </div>

              <h5 class="font-outfit font-extrabold text-white text-xs truncate mt-0.5">${g.name}</h5>
              <div class="flex items-center gap-1.5 flex-wrap mt-0.5"><span class="text-[10px] text-cyan-400 font-semibold truncate bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">${g.machine}</span></div>
              <div class="text-[10px] text-amber-300 font-bold mt-1 flex items-center gap-1.5 flex-wrap">
                <span>⚡ ${g.sets}</span><span>• ${g.weight}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 text-[11px] text-slate-300">
            <div class="truncate mr-2">
              <span class="text-emerald-400 font-bold">Mẹo:</span> ${g.tip}
            </div>
            <button onclick="WorkoutUI.openDetail('${dayKey}', ${idx})" class="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 shrink-0 whitespace-nowrap px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/40">
              📐 Chuẩn Form
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  openDetail(dayKey, idx, isCardio = false) {
    let ex;
    if (isCardio) {
      ex = morningCardio15m[idx];
    } else {
      const data = getActiveWeeklyData();
      const day = data[dayKey] || data.mon;
      ex = day.gym[idx];
    }
    if (!ex) return;

    const modal = document.getElementById('exercise-detail-modal');
    const content = document.getElementById('exercise-detail-content');
    if (!modal || !content) return;

    const detailKey = ex.detailId || ex.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const detail = (typeof ExerciseDetails !== 'undefined' && ExerciseDetails[detailKey]) || null;

    let stepsHtml = (detail && detail.steps) ? detail.steps.map((st, i) => `
      <div class="flex items-start gap-2 text-xs bg-slate-950/70 p-2 rounded-lg border border-slate-800/60">
        <span class="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-[10px] mt-0.5">${i + 1}</span>
        <span class="text-slate-200 leading-relaxed text-[11px]">${st}</span>
      </div>
    `).join('') : `<div class="p-2 rounded-lg bg-slate-950/70 text-slate-200 text-[11px]">${ex.tip}</div>`;

    content.innerHTML = `
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-outfit">${isCardio ? 'Cardio Sáng #' + (idx + 1) : 'Bài #' + (idx + 1)}</span>
          <span class="text-xs text-emerald-400 font-bold">${ex.target}</span>
        </div>
        <h3 class="font-outfit font-black text-white text-base">${ex.name}</h3>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="relative h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
          <img src="${ex.img}" alt="Tư thế bắt đầu" class="w-full h-full object-cover">
          <span class="absolute bottom-1.5 left-1.5 bg-black/85 backdrop-blur-sm text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">1. Bắt Đầu (Start)</span>
        </div>
        <div class="relative h-44 rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
          <img src="${ex.imgEnd || ex.img}" alt="Điểm siết đỉnh" class="w-full h-full object-cover">
          <span class="absolute bottom-1.5 left-1.5 bg-black/85 backdrop-blur-sm text-[10px] text-cyan-400 font-bold px-2 py-0.5 rounded border border-cyan-500/30">2. Siết Đỉnh (Peak)</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span class="text-[10px] text-slate-500 block font-semibold">Cài Đặt / Góc Độ</span>
          <span class="font-bold text-cyan-300 mt-0.5 block">${ex.setupAngle || ex.machine}</span>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
          <span class="text-[10px] text-slate-500 block font-semibold">Khối Lượng & Hiệp</span>
          <span class="font-bold text-amber-300 mt-0.5 block">${ex.sets} (${ex.weight})</span>
        </div>
      </div>

      <!-- Step-by-Step Instructions -->
      <div class="space-y-1.5">
        <span class="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
          <i data-lucide="list-ordered" class="w-3.5 h-3.5"></i> Các Bước Thực Hiện Chi Tiết:
        </span>
        <div class="space-y-1.5">${stepsHtml}</div>
      </div>

      ${detail && detail.goldenRule ? `
        <div class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-[11px] text-amber-200 space-y-1">
          <span class="font-black text-amber-400 flex items-center gap-1">
            <i data-lucide="shield-alert" class="w-3.5 h-3.5"></i> QUY TẮC VÀNG (BẮT BUỘC):
          </span>
          <p class="leading-relaxed">${detail.goldenRule}</p>
        </div>
      ` : ''}

      <div class="p-2.5 rounded-xl bg-red-950/25 border border-red-500/30 text-[11px] space-y-1">
        <span class="font-bold text-red-400 flex items-center gap-1">
          <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i> Lỗi Phổ Biến Cần Tránh:
        </span>
        <p class="text-slate-300 leading-relaxed">${ex.mistake || "Không đung đưa thân người lấy đà làm mất kích hoạt cơ đích."}</p>
      </div>
    `;

    modal.classList.remove('hidden');
    lucide.createIcons();
  },

  closeDetail() { const m = document.getElementById('exercise-detail-modal'); if (m) m.classList.add('hidden'); },
  getDayMilestones(data) { return typeof getDayMilestones === 'function' ? getDayMilestones(data) : []; },

  renderMilestoneItems(milestones, dateKey, dayKey, isFuture) {
    let cardioHtml = morningCardio15m.map((c, cIdx) => {
      const cKey = `${dateKey}_cardio_${cIdx}`;
      const isCDone = (typeof WorkoutTimer !== 'undefined' && !!WorkoutTimer.cardioLogs[cKey]);
      const isCActive = (typeof WorkoutTimer !== 'undefined' && WorkoutTimer.active && WorkoutTimer.active.type === 'cardio' && WorkoutTimer.active.cIdx === cIdx);

      let cBtn = `WorkoutTimer.startCardio('${dateKey}', ${cIdx}, '${c.name.replace(/'/g, "\\'")}', ${c.workSec || 150}, ${c.restSec || 30})`;
      let cLbl = '▶ BẮT ĐẦU', cCls = 'bg-slate-800 text-slate-200 border border-slate-700 hover:border-emerald-500';

      if (isCDone) {
        cBtn = `WorkoutTimer.toggleCardio('${cKey}')`;
        cLbl = '✓ XONG'; cCls = 'bg-emerald-500 text-slate-950 font-black';
      } else if (isCActive) {
        cBtn = `WorkoutTimer.finishCardio('${dateKey}', ${cIdx})`;
        cLbl = '⏹ KẾT THÚC'; cCls = 'bg-amber-500 text-slate-950 font-black animate-pulse shadow-md shadow-amber-500/30';
      }

      const restDiv = (cIdx < morningCardio15m.length - 1) ? `
        <div class="flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg bg-amber-950/25 border border-amber-500/30 text-[10px] text-amber-300 font-bold">
          <span>⏳ Nghỉ Thả Lỏng & Uống Nước: 30 Giây</span>
        </div>` : '';

      return `
        <div class="p-2.5 rounded-xl border transition-all ${isCDone ? 'bg-emerald-950/20 border-emerald-500/50' : (isCActive ? 'bg-amber-950/20 border-amber-500/50' : 'bg-slate-950/80 border-slate-800')} space-y-2">
          <div class="flex items-center justify-between gap-1 border-b border-slate-800/60 pb-1.5">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-[10px] font-bold text-amber-400 shrink-0">${c.min}</span>
              <span class="text-[9px] text-emerald-400 font-bold bg-emerald-950/40 px-1 rounded border border-emerald-500/20 truncate">${c.timing}</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button onclick="${cBtn}" class="text-[10px] font-bold px-2 py-0.5 rounded-lg active:scale-95 transition-all ${cCls}">${cLbl}</button>
              <button onclick="WorkoutUI.openDetail('${dayKey}', ${cIdx}, true)" class="text-[9px] font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50 hover:bg-cyan-900/60">📐 Form</button>
            </div>
          </div>
          <div class="flex gap-2.5 items-center">
            <div class="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer" onclick="WorkoutUI.openDetail('${dayKey}', ${cIdx}, true)">
              <img src="${c.img}" alt="${c.name}" class="w-full h-full object-cover" loading="lazy">
              <span class="absolute bottom-0.5 right-0.5 bg-black/80 text-[8px] text-cyan-300 font-bold px-0.5 rounded">2 Ảnh</span>
            </div>
            <div class="flex-1 min-w-0">
              <h6 class="text-xs font-bold text-white truncate">${c.name}</h6>
              <p class="text-[10px] text-slate-400 truncate mt-0.5">${c.tip}</p>
            </div>
          </div>
        </div>
        ${restDiv}
      `;
    }).join('');

    const data = (getActiveWeeklyData()[dayKey] || defaultWeeklyData[dayKey] || defaultWeeklyData.mon);
    let gymHtml = this.renderGymList(data.gym, dateKey, dayKey);
    if (typeof ExtraWorkout !== 'undefined') {
      gymHtml += ExtraWorkout.renderSection(dateKey);
    }

    return milestones.map(m => {
      const itemKey = `${dayKey}_${m.id}`;
      const isDone = !!(timelineLogs[dateKey] && timelineLogs[dateKey][itemKey]);
      const isOverdue = isMilestoneOverdue(dateKey, m.time, isDone);

      let cardStyle = 'bg-slate-900/90 border border-slate-800';
      let btnStyle = 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700';
      let btnText = isFuture ? '○ Sắp tới' : '○ Chưa đến giờ';

      if (isDone) {
        cardStyle = 'bg-emerald-950/30 border-2 border-emerald-500 ring-1 ring-emerald-500/30';
        btnStyle = 'bg-emerald-500 text-slate-950 font-black shadow-sm shadow-emerald-500/30';
        btnText = '✓ ĐÃ HOÀN THÀNH';
      } else if (isOverdue) {
        cardStyle = 'bg-red-950/35 border-2 border-red-500/80 ring-1 ring-red-500/30';
        btnStyle = 'bg-red-600 text-white font-black shadow-md shadow-red-500/30 animate-pulse';
        btnText = '⚠ CHƯA LÀM (QUÁ GIỜ)';
      }

      return `
        <div class="p-3.5 rounded-2xl transition-all duration-200 ${cardStyle} space-y-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold ${isDone ? 'text-emerald-400' : (isOverdue ? 'text-red-400' : 'text-slate-300')}">${m.time} • ${m.title}</span>
            <button onclick="toggleMilestone('${itemKey}')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all active:scale-95 ${btnStyle}">
              ${btnText}
            </button>
          </div>
          <div class="flex items-center justify-between">
            <p class="text-xs text-slate-200 leading-relaxed">${m.desc}</p>
            <span class="text-[10px] shrink-0 ml-2 ${isDone ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30' : (isOverdue ? 'bg-red-900/60 text-red-300 border border-red-500/30' : 'bg-slate-800 text-cyan-300')} px-2 py-0.5 rounded font-medium">${m.badge}</span>
          </div>
          ${m.isCardio ? `<div class="space-y-1.5 pt-1.5">${cardioHtml}</div>` : ''}
          ${m.isGym ? `<div class="space-y-2.5 pt-2">${gymHtml}</div>` : ''}
          ${m.id === 'dinner' && typeof FoodLog !== 'undefined' ? `<div class="pt-2">${FoodLog.renderSection(dateKey)}</div>` : ''}
        </div>
      `;
    }).join('');
  }
};
