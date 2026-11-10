// Bộ Sinh Lộ Trình & Dinh Dưỡng Khoa Học Cá Nhân Hoá (ThienQuangFit Smart Generator)
const ProfileGenerator = {
  calculateMetrics(data) {
    const h = parseFloat(data.height) || 170;
    const w = parseFloat(data.weight) || 70;
    const age = parseInt(data.age, 10) || 25;
    const isFemale = data.gender === 'female';

    const bmi = (w / ((h / 100) * (h / 100))).toFixed(1);
    const bmr = isFemale
      ? Math.round(10 * w + 6.25 * h - 5 * age - 161)
      : Math.round(10 * w + 6.25 * h - 5 * age + 5);

    const multMap = { desk: 1.35, active: 1.55, labor: 1.75 };
    const tdee = Math.round(bmr * (multMap[data.lifestyle] || 1.35));

    let targetCalo = tdee - 500;
    if (data.goal === 'hypertrophy') targetCalo = tdee + 300;
    else if (data.goal === 'endurance') targetCalo = tdee - 200;
    else if (data.goal === 'posture') targetCalo = tdee - 350;
    targetCalo = Math.max(isFemale ? 1300 : 1550, targetCalo);

    const waterGoal = Math.max(2000, Math.min(4000, Math.round((w * 40) / 100) * 100));
    return { bmi, bmr, tdee, targetCalo, waterGoal };
  },

  generateWaterSchedule(totalMl) {
    const slots = [
      { time: "06:30", label: "Nước ấm chanh thức dậy" },
      { time: "08:30", label: "Nước cùng cữ cà phê" },
      { time: "10:00", label: "Giải lao cùng trái cây" },
      { time: "11:30", label: "30p trước bữa trưa" },
      { time: "14:00", label: "Tỉnh táo làm việc đầu giờ chiều" },
      { time: "15:30", label: "Xế chiều đứng dậy đi lại" },
      { time: "17:00", label: "Trước khi tập luyện" },
      { time: "18:00 - 19:15", label: "Nhấp từng ngụm trong tập" },
      { time: "20:00", label: "Sau bữa tối" },
      { time: "21:30", label: "Trước khi ngủ 1 tiếng" }
    ];
    const portion = Math.round(totalMl / slots.length / 50) * 50;
    return slots.map((s, idx) => ({
      time: s.time,
      amount: (idx === 7 ? (portion + 150) : portion) + "ml",
      label: s.label
    }));
  },

  buildExercisePool(loc, injury, goal) {
    const exDB = {
      pushups: { name: "Push-ups (Hít đất)", target: "Ngực & Tay sau & Cơ lõi", machine: "Bodyweight", weight: "Trọng lượng cơ thể", sets: "4 hiệp x 15 cái", rest: "45s", img: "assets/exercises/pushups/0.jpg", imgEnd: "assets/exercises/pushups/1.jpg", tip: "Gồng cứng thân như tấm ván, đẩy dứt khoát.", setupAngle: "Tay rộng hơn vai", mistake: "Không võng thắt lưng." },
      pec_fly: { name: "Pec Deck Fly (Ép ngực máy)", target: "Rãnh ngực & Bảo vệ cổ tay", machine: "Máy ép bướm cố định", weight: "20kg - 30kg", sets: "3 hiệp x 15 reps", rest: "45s", img: "assets/exercises/pec_deck_fly/0.jpg", imgEnd: "assets/exercises/pec_deck_fly/1.jpg", detailId: "pec_deck_fly", tip: "Cùi chỏ hơi cong, ưỡn ngực ép 2 tay vào giữa tạo rãnh sâu.", setupAngle: "Tay ngang ngực", mistake: "Không co vai." },
      incline_db: { name: "Incline Dumbbell Press", target: "Ngực trên & Vai trước", machine: "Ghế dốc 30° - Tạ đơn", weight: "8kg - 10kg/bên", sets: "4 hiệp x 12 reps", rest: "45s", img: "assets/exercises/incline_dumbbell_press/0.jpg", imgEnd: "assets/exercises/incline_dumbbell_press/1.jpg", detailId: "incline_dumbbell_press", tip: "Nằm ghế dốc 30°, khóa bả vai, cùi chỏ mở 60° đẩy ngực trên.", setupAngle: "Ghế dốc 30°", mistake: "Không banh chỏ 90°." },
      shoulder_press: { name: "Seated Dumbbell Shoulder Press", target: "Cơ vai trước & Vai giữa", machine: "Ghế tựa 80-85° - Tạ đơn", weight: "6kg - 8kg/bên", sets: "3 hiệp x 12 reps", rest: "60s", img: "assets/exercises/seated_dumbbell_shoulder_press/0.jpg", imgEnd: "assets/exercises/seated_dumbbell_shoulder_press/1.jpg", detailId: "seated_dumbbell_shoulder_press", tip: "Đẩy qua đầu tạo vai vuông tôn eo nhỏ.", setupAngle: "Ghế dựng 85°", mistake: "Không ưỡn ngực võng lưng." },
      lat_raise: { name: "Dumbbell Lateral Raise", target: "Cơ vai giữa tôn eo nhỏ", machine: "Tạ đơn nhỏ", weight: "4kg - 6kg/bên", sets: "4 hiệp x 15 reps", rest: "45s", img: "assets/exercises/dumbbell_lateral_raise/0.jpg", imgEnd: "assets/exercises/dumbbell_lateral_raise/1.jpg", tip: "Nâng ngang vai, cùi chỏ hơi cong tạo bờ vai vuông.", setupAngle: "Cùi chỏ dẫn hướng", mistake: "Không nhún người lấy đà." },
      tricep_rope: { name: "Tricep Rope Pushdown", target: "Bắp tay sau cắt nét", machine: "Máy kéo cáp - Dây thừng", weight: "15kg - 20kg", sets: "3 hiệp x 15 reps", rest: "45s", img: "assets/exercises/tricep_rope_pushdown/0.jpg", imgEnd: "assets/exercises/tricep_rope_pushdown/1.jpg", detailId: "tricep_rope_pushdown", tip: "Khóa chặt cùi chỏ sát sườn, kéo xuống tách 2 đầu dây.", setupAngle: "Dây cao ngang trán", mistake: "Không vung cùi chỏ." },
      lat_pull: { name: "Lat Pulldown Wide Grip", target: "Lưng xô chữ V & Chống gù", machine: "Máy kéo xô thẳng đứng", weight: "30kg - 35kg", sets: "4 hiệp x 12 reps", rest: "60s", img: "assets/exercises/lat_pulldown/0.jpg", imgEnd: "assets/exercises/lat_pulldown/1.jpg", detailId: "lat_pulldown", tip: "Ưỡn nhẹ ngực, kéo thanh đòn về quai xanh mở rộng xô chữ V.", setupAngle: "Cầm rộng hơn vai 1 gang", mistake: "Không ngửa người quá 15°." },
      cable_row: { name: "Seated Cable Row", target: "Lưng giữa & Chống gù dev", machine: "Máy cáp ngang V-Bar", weight: "25kg - 30kg", sets: "3 hiệp x 12 reps", rest: "60s", img: "assets/exercises/seated_cable_row/0.jpg", imgEnd: "assets/exercises/seated_cable_row/1.jpg", detailId: "seated_cable_row", tip: "Lưng thẳng tắp, kéo sát rốn chống tật gù lưng do ngồi nhiều.", setupAngle: "Tay nắm chữ V kéo về rốn", mistake: "Không gù lưng." },
      face_pull: { name: "Face Pulls", target: "Vai sau & Cổ vai gáy", machine: "Cáp dây thừng ngang mặt", weight: "15kg - 18kg", sets: "3 hiệp x 15 reps", rest: "45s", img: "assets/exercises/face_pull/0.jpg", imgEnd: "assets/exercises/face_pull/1.jpg", tip: "Kéo ngang tầm mắt, tách chỏ sang 2 bên trị tật cổ rùa.", setupAngle: "Ròng rọc ngang mắt", mistake: "Không kéo chỏ xuống bụng." },
      bicep_curl: { name: "Dumbbell Bicep Curl", target: "Chuột bắp tay trước", machine: "2 Quả tạ đơn", weight: "6kg - 8kg/bên", sets: "3 hiệp x 12 reps", rest: "45s", img: "assets/exercises/dumbbell_bicep_curl/0.jpg", imgEnd: "assets/exercises/dumbbell_bicep_curl/1.jpg", tip: "Cuộn tạ xoay ngửa cổ tay ở đỉnh, hạ chậm 2 giây.", setupAngle: "Đứng thẳng cố định chỏ", mistake: "Không đung đưa người." },
      single_row: { name: "Single-Arm Dumbbell Row", target: "Lưng xô từng bên", machine: "Ghế & Tạ đơn", weight: "10kg - 14kg", sets: "3 hiệp x 12 reps/bên", rest: "45s", img: "assets/exercises/single_arm_dumbbell_row/0.jpg", imgEnd: "assets/exercises/single_arm_dumbbell_row/1.jpg", tip: "Kéo tạ về phía hông, siết cơ xô ở đỉnh.", setupAngle: "Lưng song song sàn", mistake: "Không xoay vặn thân." },
      goblet_squat: { name: "Goblet Squat", target: "Đùi trước & Mông săn chắc", machine: "Tạ đơn ôm trước ngực", weight: "10kg - 14kg", sets: "4 hiệp x 12 reps", rest: "60s", img: "assets/exercises/goblet_squat/0.jpg", imgEnd: "assets/exercises/goblet_squat/1.jpg", detailId: "goblet_squat", tip: "Ôm tạ sát ngực, hạ mông ngang gối, lưng thẳng tự nhiên.", setupAngle: "Chân rộng hơn vai mở 30°", mistake: "Không sụp gối vào trong." },
      leg_press: { name: "Leg Press 45°", target: "Cơ đùi & Mông bảo vệ gối", machine: "Máy đạp đùi 45°", weight: "40kg - 50kg", sets: "3 hiệp x 15 reps", rest: "60s", img: "assets/exercises/leg_press/0.jpg", imgEnd: "assets/exercises/leg_press/1.jpg", detailId: "leg_press", tip: "Hạ sâu 90°, khi đạp lên KHÔNG khóa khớp gối.", setupAngle: "Bàn chân giữa bàn đạp", mistake: "Không duỗi thẳng khóa chết gối." },
      rdl: { name: "Dumbbell Romanian Deadlift", target: "Đùi sau & Nâng cơ mông", machine: "2 Quả tạ đơn", weight: "10kg - 12kg/bên", sets: "3 hiệp x 12 reps", rest: "60s", img: "assets/exercises/romanian_deadlift/0.jpg", imgEnd: "assets/exercises/romanian_deadlift/1.jpg", detailId: "romanian_deadlift", tip: "Đẩy hông ra sau, tạ lướt sát ống đồng căng đùi sau.", setupAngle: "Gối chùng nhẹ cố định", mistake: "Không cong lưng khi cúi." },
      glute_bridge: { name: "Glute Bridge & Siết mông", target: "Mông & Đùi sau an toàn cho gối", machine: "Thảm tập nằm ngửa", weight: "Bodyweight", sets: "4 hiệp x 20 cái", rest: "45s", img: "assets/exercises/glute_bridge/0.jpg", imgEnd: "assets/exercises/glute_bridge/1.jpg", detailId: "glute_bridge", tip: "Siết chặt cơ mông ở đỉnh 2 giây, hạ chậm.", setupAngle: "Gối co 90°", mistake: "Không ưỡn thắt lưng." },
      treadmill: { name: "Incline Treadmill Fat Burner", target: "Mỡ nội tạng & Toàn thân", machine: "Máy chạy bộ leo dốc", weight: "Dốc: 10% | Tốc độ: 5.0 km/h", sets: "20 phút liên tục", rest: "Uống ngụm nước", img: "assets/exercises/incline_treadmill/0.jpg", imgEnd: "assets/exercises/incline_treadmill/1.jpg", detailId: "incline_treadmill", tip: "Không vịn tay vào máy! Đánh tay tự nhiên để ép mỡ bụng.", setupAngle: "Độ dốc 10%", mistake: "Cấm bám tay vào thanh vịn." },
      bike_crunch: { name: "Bicycle Crunch + Plank", target: "Cơ liên sườn (V-Cut thắt eo)", machine: "Thảm tập", weight: "Bodyweight", sets: "3 vòng: 20 cái ➔ Plank 45s", rest: "45s", img: "assets/exercises/bicycle_crunch/0.jpg", imgEnd: "assets/exercises/bicycle_crunch/1.jpg", tip: "Siết thắt eo hông, đánh tan mỡ liên sườn eo thon.", setupAngle: "Xoay cùi chỏ chạm gối", mistake: "Không giật cổ." },
      mountain: { name: "Mountain Climbers", target: "Cơ bụng dưới & Tim phổi", machine: "Thảm tập", weight: "Bodyweight", sets: "4 hiệp x 30 giây", rest: "30s", img: "assets/exercises/mountain_climbers/0.jpg", imgEnd: "assets/exercises/mountain_climbers/1.jpg", tip: "Kéo gối nhanh liên tục, giữ hông thấp siết cơ bụng.", setupAngle: "Tay chống thẳng vai", mistake: "Không nhổm mông quá cao." },
      walk: { name: "Đi dạo bộ công viên thư giãn", target: "Phục hồi & Hạ hormone stress", machine: "Ngoài trời", weight: "Tốc độ thong thả", sets: "30 - 40 phút", rest: "Uống nước", img: "assets/exercises/outdoor_walk/0.jpg", imgEnd: "assets/exercises/outdoor_walk/1.jpg", tip: "Hạ hormone Cortisol gây tích mỡ bụng do stress deadline.", setupAngle: "Hít thở sâu", mistake: "Không xem điện thoại khi đi dạo." },
      stretch: { name: "Giãn cơ toàn thân (Full Body Stretch)", target: "Cột sống & Khớp linh hoạt", machine: "Thảm tại nhà", weight: "Bodyweight", sets: "15 - 20 phút", rest: "Thở sâu", img: "assets/exercises/cat_stretch/0.jpg", imgEnd: "assets/exercises/cat_stretch/1.jpg", tip: "Kéo giãn cột sống, hông và cổ vai gáy giải tỏa căng cứng.", setupAngle: "Giữ mỗi thế 30s", mistake: "Không kéo giật ép cơ." }
    };

    // Lọc theo chấn thương
    if (injury === 'wrist') {
      exDB.pushups = exDB.pec_fly;
    }
    if (injury === 'knee') {
      exDB.goblet_squat = exDB.glute_bridge;
      exDB.leg_press = exDB.glute_bridge;
    }
    if (injury === 'back') {
      exDB.rdl = exDB.glute_bridge;
      exDB.single_row = exDB.cable_row;
    }
    return exDB;
  },

  generateCustomSchedule(profile) {
    const P = this.buildExercisePool(profile.location, profile.injury, profile.goal);
    const cal = profile.metrics.targetCalo;

    const mealsBase = {
      bf: `1 ổ bánh mì ốp la (không bơ, không sốt béo, nhiều dưa ngò). ~${Math.round(cal * 0.22)} kcal`,
      coffee: "Americano đá / Cà phê đen phin + đường ăn kiêng. ~2 kcal",
      fruit10h: "1 quả ổi vừa (giàu vitamin C, no lâu) hoặc 3 múi bưởi. ~60 kcal",
      lunch: `Cơm gà xé nạc hoặc cá hấp (1/2 chén cơm, nhiều rau luộc). ~${Math.round(cal * 0.35)} kcal`,
      snack15h: "1 cốc nước dừa tươi hoặc 1 quả táo xanh. ~60 kcal",
      pre: "1 quả chuối tiêu vừa + 250ml nước lọc. ~95 kcal",
      dinner: `Canh rong biển thịt nạc băm + rau xào tỏi ít dầu. ~${Math.round(cal * 0.28)} kcal`
    };

    const isHome = profile.location === 'home';
    const pushList = isHome ? [P.pushups, P.lat_raise, P.single_row, P.mountain, P.bike_crunch] : [P.incline_db, P.pec_fly, P.shoulder_press, P.tricep_rope, P.treadmill];
    const pullList = isHome ? [P.single_row, P.lat_raise, P.bicep_curl, P.mountain, P.bike_crunch] : [P.lat_pull, P.cable_row, P.face_pull, P.bicep_curl, P.bike_crunch];
    const legList = isHome ? [P.goblet_squat, P.glute_bridge, P.mountain, P.bike_crunch, P.stretch] : [P.goblet_squat, P.leg_press, P.rdl, P.glute_bridge, P.treadmill];
    const upperList = [P.pushups, P.lat_raise, P.single_row, P.face_pull, P.bike_crunch];
    const restList = [P.walk, P.stretch];

    return {
      mon: { dayName: "Thứ Hai", focus: `${profile.goal === 'hypertrophy' ? 'Tăng Khối Cơ' : 'Siết Nét'} Thân Trên (Push)`, meals: mealsBase, gym: pushList },
      tue: { dayName: "Thứ Ba", focus: "Kéo Lưng Xô (Pull) & Chống Gù Cổ Vai Gáy", meals: mealsBase, gym: pullList },
      wed: { dayName: "Thứ Tư", focus: "Thân Dưới (Chân Đùi Mông) & Đốt Mỡ", meals: mealsBase, gym: legList },
      thu: { dayName: "Thứ Năm", focus: "Thân Trên Phối Hợp & Siết Cơ Lõi Bụng", meals: mealsBase, gym: upperList },
      fri: { dayName: "Thứ Sáu", focus: "Xả Năng Lượng Toàn Thân (Full Body Circuit)", meals: mealsBase, gym: [P.pushups, P.goblet_squat, P.mountain, P.bike_crunch, P.treadmill] },
      weekend: { dayName: "Thứ 7 & CN", focus: "Phục Hồi Cơ Thể Sạch & Hạ Hormone Stress", meals: mealsBase, gym: restList }
    };
  },

  createProfile(formData) {
    const metrics = this.calculateMetrics(formData);
    const duration = parseInt(formData.duration, 10) || 60;
    const startDate = formData.startDate || new Date().toISOString().slice(0, 10);
    const end = new Date(startDate);
    end.setDate(end.getDate() + duration);
    const endDate = end.toISOString().slice(0, 10);

    const profile = {
      id: 'profile_' + Date.now(),
      name: formData.name || 'Người Tập Mới',
      gender: formData.gender || 'male',
      age: parseInt(formData.age, 10) || 25,
      height: parseFloat(formData.height) || 170,
      weight: parseFloat(formData.weight) || 70,
      targetWeight: parseFloat(formData.targetWeight) || (parseFloat(formData.weight) - 5),
      waist: parseFloat(formData.waist) || 85,
      targetWaist: parseFloat(formData.targetWaist) || 78,
      durationDays: duration,
      startDate,
      endDate,
      lifestyle: formData.lifestyle || 'desk',
      goal: formData.goal || 'fat_loss',
      location: formData.location || 'gym',
      frequency: parseInt(formData.frequency, 10) || 5,
      injury: formData.injury || 'none',
      metrics,
      waterSchedule: this.generateWaterSchedule(metrics.waterGoal),
      isDefault: false
    };

    profile.schedule = this.generateCustomSchedule(profile);
    return profile;
  }
};
