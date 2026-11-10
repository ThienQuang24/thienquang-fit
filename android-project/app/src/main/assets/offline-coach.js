// Offline Coach: Bộ Não Quy Tắc Thể Hình Cục Bộ Hoạt Động 100% Không Cần Mạng
const OfflineCoach = {
  process(query) {
    const q = query.toLowerCase();

    if (q.includes('khôi phục') || q.includes('reset') || q.includes('lịch gốc')) {
      return {
        text: `Đã sẵn sàng đưa ứng dụng về <strong>Lịch Tập Gốc 60 Ngày (Siết Mỡ 80kg ➔ 70kg)</strong>:`,
        actionHtml: `
          <button onclick="AICoach.applyReset()" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95">
            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> ↺ Khôi Phục Lịch Gốc 60 Ngày
          </button>
        `
      };
    }

    if (q.includes('siết') || q.includes('tăng cơ') || q.includes('v-taper') || q.includes('phiên bản mới')) {
      return {
        text: `🎉 <strong>Chúc mừng bạn đã siết eo về 80cm!</strong> Kích hoạt <strong>Phiên bản 2: V-Taper Hypertrophy</strong> (Tạ nặng 8-10 reps, 2.100 kcal, xẻ rãnh cơ xô lưng chữ V):`,
        actionHtml: `
          <button onclick="AICoach.applyRoutineVersion('v2')" class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all active:scale-95">
            <i data-lucide="zap" class="w-3.5 h-3.5"></i> ⚡ Kích Hoạt Lịch Tăng Cơ V-Taper Ngay
          </button>
        `
      };
    }

    if (q.includes('cổ tay') || q.includes('đổi bài ngực') || q.includes('đau')) {
      return {
        text: `🩹 Đổi bài sang <strong>Pec Deck Fly (Máy ép bướm cố định)</strong> để bảo vệ cổ tay:`,
        actionHtml: `
          <button onclick="AICoach.applySwapExercise('mon', 0, {
            name: 'Pec Deck Machine Fly (Bảo vệ cổ tay)',
            target: 'Rãnh ngực trong (0 áp lực cổ tay)',
            machine: 'Máy ép bướm đệm cùi chỏ',
            weight: '25kg - 30kg',
            sets: '4 hiệp x 15 reps',
            rest: '45s',
            img: 'assets/exercises/pec_deck_fly/0.jpg',
            imgEnd: 'assets/exercises/pec_deck_fly/1.jpg',
            detailId: 'pec_deck_fly',
            tip: 'Tỳ cẳng tay vào đệm mềm, dùng lực cơ ngực ép vào nhau, cổ tay thả lỏng hoàn toàn.',
            setupAngle: 'Ghế cao ngang ngực',
            mistake: 'Không gồng cứng cổ tay.'
          })" class="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> ⚡ Đổi Bài An Toàn Cổ Tay Vào Thứ Hai
          </button>
        `
      };
    }

    if (q.includes('tại nhà') || q.includes('mưa') || q.includes('không đến')) {
      return {
        text: `🏠 Đã tạo <strong>Lịch Tập 30 Phút Tại Nhà (Bodyweight & Thảm)</strong> tiêu hao ~280 kcal:`,
        actionHtml: `
          <button onclick="AICoach.applyRoutineVersion('v3')" class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all active:scale-95">
            <i data-lucide="home" class="w-3.5 h-3.5"></i> ⚡ Áp Dụng Lịch Tập Tại Nhà Hôm Nay
          </button>
        `
      };
    }

    return {
      text: `Tôi đã thiết kế bài bổ sung: <strong>Cable Kneeling Crunch (Gập bụng cáp)</strong> • 4 hiệp x 15 reps (20kg):`,
      actionHtml: `
        <button onclick="AICoach.applyAddExercise('mon', {
          name: 'Cable Kneeling Crunch (Gập bụng cáp)',
          target: 'Cơ múi bụng trên & giữa',
          machine: 'Máy cáp quỳ gối dây thừng',
          weight: '15kg - 20kg',
          sets: '4 hiệp x 15 reps',
          rest: '45s',
          img: 'assets/exercises/cable_kneeling_crunch/0.jpg',
          imgEnd: 'assets/exercises/cable_kneeling_crunch/1.jpg',
          detailId: 'cable_kneeling_crunch',
          tip: 'Khóa chặt hông, cuộn cột sống đưa chỏ chạm đùi, thở hết hơi siết cơ bụng.',
          setupAngle: 'Quỳ gối cách cáp 1m',
          mistake: 'Không ngồi sụp mông xuống gót chân.'
        })" class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all active:scale-95">
          <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i> ⚡ Thêm Bài Gập Bụng Cáp Vào Thứ Hai
        </button>
      `
    };
  }
};
