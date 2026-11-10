// Data Lịch Trình ThienQuangFit - Chuẩn Xác 100% & Động Tác Minh Họa Thực Tế
const waterSchedule = [
  { time: "06:30", amount: "300ml", label: "Nước ấm chanh thức dậy" },
  { time: "08:30", amount: "300ml", label: "Nước cùng cữ cà phê" },
  { time: "10:00", amount: "300ml", label: "Giải lao cùng trái cây" },
  { time: "11:30", amount: "300ml", label: "30p trước bữa trưa" },
  { time: "14:00", amount: "300ml", label: "Tỉnh táo code đầu giờ chiều" },
  { time: "15:30", amount: "300ml", label: "Xế chiều đứng dậy đi lại" },
  { time: "17:00", amount: "300ml", label: "Trước khi đi gym" },
  { time: "18:00 - 19:15", amount: "500ml", label: "Nhấp từng ngụm trong tập" },
  { time: "20:00", amount: "250ml", label: "Sau bữa tối" },
  { time: "21:30", amount: "150ml", label: "Trước khi ngủ 1 tiếng" }
];

const morningCardio15m = [
  { id: 'cat_cow', min: "06:35 - 06:38", timing: "Tập 2p30s • Nghỉ 30s", workSec: 150, restSec: 30, name: "Xoay khớp & Mèo - Bò (Cat-Cow)", target: "Cột sống & Cổ vai gáy", machine: "Thảm tập - Quỳ 4 điểm", sets: "2p30s tập + 30s nghỉ", weight: "Bodyweight", img: "assets/exercises/cat_stretch/0.jpg", imgEnd: "assets/exercises/cat_stretch/1.jpg", detailId: "cat_cow", setupAngle: "Chống tay thẳng dưới vai, gối dưới hông", tip: "Đánh thức cột sống và cổ vai gáy sau đêm ngủ.", mistake: "Khóa cứng khớp cùi chỏ hoặc giật cục cổ." },
  { id: 'jumping_jacks', min: "06:38 - 06:41", timing: "Tập 2p30s • Nghỉ 30s", workSec: 150, restSec: 30, name: "Jumping Jacks / Bước nhịp", target: "Nhịp tim Zone 2 đốt mỡ", machine: "Bodyweight tại nhà", sets: "2p30s tập + 30s nghỉ", weight: "Mũi chân êm", img: "assets/exercises/jumping_jacks/0.jpg", imgEnd: "assets/exercises/jumping_jacks/1.jpg", detailId: "jumping_jacks", setupAngle: "Đứng thẳng, tiếp đất bằng mũi chân", tip: "Kích hoạt nhịp tim vào vùng đốt mỡ nhẹ.", mistake: "Tiếp đất bằng gót chân gây chấn động cột sống." },
  { id: 'high_knees', min: "06:41 - 06:44", timing: "Tập 2p30s • Nghỉ 30s", workSec: 150, restSec: 30, name: "High Knees & Shadow Boxing", target: "Cơ bụng dưới & Vai", machine: "Thế đứng đấm bốc", sets: "2p30s tập + 30s nghỉ", weight: "Thủ cằm", img: "assets/exercises/high_knees/0.jpg", imgEnd: "assets/exercises/high_knees/1.jpg", detailId: "high_knees", setupAngle: "Tay che cằm, nâng đùi ngang hông", tip: "Đấm gió nhịp nhàng kết hợp thở đều.", mistake: "Hạ tay phòng thủ hoặc ngửa người ra sau." },
  { id: 'mountain_climbers', min: "06:44 - 06:47", timing: "Tập 2p30s • Nghỉ 30s", workSec: 150, restSec: 30, name: "Slow Mountain Climbers", target: "Cơ lõi & Bụng dưới", machine: "Tư thế High Plank", sets: "2p30s tập + 30s nghỉ", weight: "Gồng bụng", img: "assets/exercises/mountain_climbers/0.jpg", imgEnd: "assets/exercises/mountain_climbers/1.jpg", detailId: "mountain_climbers", setupAngle: "Cổ tay dưới vai, lưng thẳng", tip: "Gồng chặt cơ bụng dưới, không võng lưng.", mistake: "Nhổm mông quá cao làm mất lực siết cơ bụng." },
  { id: 'glute_bridge', min: "06:47 - 06:50", timing: "Tập 2p30s • Nghỉ 30s", workSec: 150, restSec: 30, name: "Glute Bridge & Thở sâu", target: "Cơ mông & Đùi sau", machine: "Thảm tập nằm ngửa", sets: "2p30s tập + 30s hạ nhiệt", weight: "Gót chân", img: "assets/exercises/glute_bridge/0.jpg", imgEnd: "assets/exercises/glute_bridge/1.jpg", detailId: "glute_bridge", setupAngle: "Gối co 90°, chân rộng bằng vai", tip: "Siết mông ở đỉnh 1 giây, hít sâu thở chậm.", mistake: "Ưỡn cong thắt lưng thay vì dùng lực cơ mông." }
];

const defaultWeeklyData = {
  mon: {
    dayName: "Thứ Hai",
    focus: "Push (Ngực Trên - Vai Trước - Tay Sau) + Cardio Dốc",
    meals: {
      bf: "1 ổ bánh mì ốp la (không bơ, không pate, nhiều dưa ngò). ~320 kcal",
      coffee: "Americano đá / Cà phê đen phin + đường ăn kiêng. ~2 kcal",
      fruit10h: "1 quả ổi vừa (giàu vitamin C, no lâu) hoặc 3 múi bưởi. ~60 kcal",
      lunch: "Cơm sườn nướng (1/2 cơm, sườn nạc, KHÔNG mỡ hành, bỏ trứng chiên). ~550 kcal",
      snack15h: "1 cốc nước dừa tươi hoặc 1 quả táo xanh. ~50 kcal",
      pre: "1 quả chuối tiêu vừa + 250ml nước. ~95 kcal",
      dinner: "Cơm gà xé nạc bỏ da (1/2 cơm) hoặc hủ tiếu nạc nước trong. ~450 kcal"
    },
    gym: [
      { name: "Incline Dumbbell Press", target: "Ngực trên & Vai trước", machine: "Ghế dốc 30° - Tạ đơn", weight: "8kg - 10kg/bên", sets: "4 hiệp x 12-15 reps", rest: "45s", img: "assets/exercises/incline_dumbbell_press/0.jpg", imgEnd: "assets/exercises/incline_dumbbell_press/1.jpg", detailId: "incline_dumbbell_press", tip: "Nằm ghế dốc 30°, khóa bả vai, cùi chỏ mở 60°, hạ ngang ngực trên rồi đẩy siết 1s.", setupAngle: "Ghế dốc 30° chuẩn ngực trên", mistake: "Không banh cùi chỏ 90° tránh kẹt khớp vai." },
      { name: "Pec Deck Fly (Ép ngực máy)", target: "Rãnh ngực & Ngực trong", machine: "Máy ép bướm cố định", weight: "25kg - 30kg", sets: "3 hiệp x 15 reps", rest: "45s", img: "assets/exercises/pec_deck_fly/0.jpg", imgEnd: "assets/exercises/pec_deck_fly/1.jpg", detailId: "pec_deck_fly", tip: "Cùi chỏ hơi cong, ưỡn ngực ép 2 tay vào giữa giữ 1s tạo rãnh sâu.", setupAngle: "Tay nắm ngang ngực giữa", mistake: "Không co vai hay nhô người về trước." },
      { name: "Seated Dumbbell Shoulder Press", target: "Cơ vai trước & Vai giữa", machine: "Ghế tựa 80-85° - Tạ đơn", weight: "6kg - 8kg/bên", sets: "3 hiệp x 12-15 reps", rest: "60s", img: "assets/exercises/seated_dumbbell_shoulder_press/0.jpg", imgEnd: "assets/exercises/seated_dumbbell_shoulder_press/1.jpg", detailId: "seated_dumbbell_shoulder_press", tip: "Hạ tạ ngang tai, đẩy qua đầu tạo form vai vuông tôn eo nhỏ.", setupAngle: "Ghế dựng 85° thẳng lưng", mistake: "Không ưỡn ngực võng lưng dưới." },
      { name: "Tricep Rope Pushdown", target: "Bắp tay sau cắt nét", machine: "Máy kéo cáp - Dây thừng", weight: "15kg - 20kg", sets: "3 hiệp x 15 reps", rest: "45s", img: "assets/exercises/tricep_rope_pushdown/0.jpg", imgEnd: "assets/exercises/tricep_rope_pushdown/1.jpg", detailId: "tricep_rope_pushdown", tip: "Khóa chặt cùi chỏ sát sườn, kéo xuống tách 2 đầu dây ở đáy.", setupAngle: "Dây thừng cao ngang trán", mistake: "Không vung cùi chỏ ra trước khi kéo." },
      { name: "Incline Treadmill Fat Burner", target: "Mỡ nội tạng & Toàn thân", machine: "Máy chạy bộ leo dốc", weight: "Dốc: 10% | Tốc độ: 5.0 km/h", sets: "20 phút liên tục", rest: "Uống ngụm nước", img: "assets/exercises/incline_treadmill/0.jpg", imgEnd: "assets/exercises/incline_treadmill/1.jpg", detailId: "incline_treadmill", tip: "Không vịn tay vào máy! Đánh tay tự nhiên để ép mỡ bụng tiêu biến.", setupAngle: "Độ dốc 10-12%", mistake: "Cấm bám tay vào thanh vịn của máy." }
    ]
  },
  tue: {
    dayName: "Thứ Ba",
    focus: "Pull (Lưng Xô V-Taper - Tay trước) + Siết Bụng",
    meals: {
      bf: "1 tô bún riêu (1/2 bún, nhiều rau muống trụng, không húp hết nước lèo). ~380 kcal",
      coffee: "Cà phê đen mộc đá hoặc pha hòa tan + đường ăn kiêng. ~2 kcal",
      fruit10h: "1 quả táo xanh giòn. ~75 kcal",
      lunch: "Cơm chay: Đậu hũ sốt cà ít dầu + nấm kho + canh rong biển (1/2 cơm). ~480 kcal",
      snack15h: "1 nắm hạt hạnh nhân (10 hạt) hoặc 2 múi bưởi. ~70 kcal",
      pre: "1 quả chuối tiêu + nước lọc. ~95 kcal",
      dinner: "Cá nướng/hấp cuốn bánh tráng rau sống dưa leo. ~460 kcal"
    },
    gym: [
      { name: "Lat Pulldown Wide Grip", target: "Lưng xô tạo lưng chữ V", machine: "Máy kéo xô thẳng đứng", weight: "30kg - 35kg", sets: "4 hiệp x 12-15 reps", rest: "60s", img: "assets/exercises/lat_pulldown/0.jpg", imgEnd: "assets/exercises/lat_pulldown/1.jpg", detailId: "lat_pulldown", tip: "Ngực ưỡn nhẹ, kéo thanh đòn về chạm quai xanh mở rộng xô chữ V.", setupAngle: "Cầm rộng hơn vai 1.5 gang tay", mistake: "Không ngửa người quá 15° ra sau." },
      { name: "Seated Cable Row", target: "Lưng giữa & Chống gù dev", machine: "Máy cáp ngang V-Bar", weight: "25kg - 30kg", sets: "3 hiệp x 12 reps", rest: "60s", img: "assets/exercises/seated_cable_row/0.jpg", imgEnd: "assets/exercises/seated_cable_row/1.jpg", detailId: "seated_cable_row", tip: "Lưng thẳng tắp, kéo sát bụng dưới chống tật gù lưng do ngồi code.", setupAngle: "Tay nắm chữ V kéo về rốn", mistake: "Không gù lưng hoặc giật lưng." },
      { name: "Dumbbell Bicep Curl", target: "Chuột bắp tay trước", machine: "2 Quả tạ đơn", weight: "6kg - 8kg/bên", sets: "3 hiệp x 12-15 reps", rest: "45s", img: "assets/exercises/dumbbell_bicep_curl/0.jpg", imgEnd: "assets/exercises/dumbbell_bicep_curl/1.jpg", tip: "Cuộn tạ xoay ngửa cổ tay ở đỉnh, hạ chậm 2 giây.", setupAngle: "Đứng thẳng cố định cùi chỏ", mistake: "Không đung đưa người lấy đà." },
      { name: "Face Pulls", target: "Vai sau & Cổ vai gáy", machine: "Cáp dây thừng ngang mặt", weight: "15kg - 20kg", sets: "3 hiệp x 15 reps", rest: "45s", img: "assets/exercises/face_pull/0.jpg", imgEnd: "assets/exercises/face_pull/1.jpg", tip: "Kéo ngang tầm mắt, tách chỏ sang 2 bên trị tật cổ rùa.", setupAngle: "Ròng rọc ngang tầm mắt", mistake: "Không kéo cùi chỏ hạ thấp xuống bụng." },
      { name: "Hanging Knee Raise + Plank", target: "Cơ bụng dưới & Cơ lõi", machine: "Xà đơn & Thảm tập", weight: "Bodyweight", sets: "3 vòng: Co gối 15 cái ➔ Plank 45s", rest: "60s", img: "assets/exercises/hanging_knee_raise/0.jpg", imgEnd: "assets/exercises/hanging_knee_raise/1.jpg", tip: "Treo người cuộn tròn hông lên cao để ép tan mỡ bụng dưới.", setupAngle: "Treo xà thẳng tay", mistake: "Không đung đưa người như quả lắc." }
    ]
  },
  wed: {
    dayName: "Thứ Tư",
    focus: "Legs (Chân Đùi Mông) + Cardio Dốc Cao",
    meals: {
      bf: "2 quả trứng luộc + 1 củ khoai lang nhỏ. ~340 kcal",
      coffee: "Cà phê đen đá mộc + 50ml sữa tươi không đường. ~30 kcal",
      fruit10h: "1 quả ổi vừa hoặc 1/2 quả bưởi. ~60 kcal",
      lunch: "Cơm gà xào sả hoặc thịt nạc kho trứng (1/2 cơm, nhiều rau). ~520 kcal",
      snack15h: "1 hộp sữa chua không đường. ~60 kcal",
      pre: "1 quả chuối tiêu + nước lọc. ~95 kcal",
      dinner: "1 tô phở bò tái nạc (nước trong, 1/2 bánh phở, nhiều giá). ~480 kcal"
    },
    gym: [
      { name: "Goblet Squat", target: "Đùi trước & Mông săn", machine: "Tạ đơn ôm trước ngực", weight: "12kg - 16kg", sets: "4 hiệp x 12-15 reps", rest: "60s", img: "assets/exercises/goblet_squat/0.jpg", imgEnd: "assets/exercises/goblet_squat/1.jpg", detailId: "goblet_squat", tip: "Ôm tạ sát ngực, hạ mông ngang gối, lưng thẳng tự nhiên.", setupAngle: "Chân rộng hơn vai mũi chân mở 30°", mistake: "Không sụp khớp gối vào trong." },
      { name: "Leg Press 45°", target: "Toàn bộ cơ đùi & Cơ mông", machine: "Máy đạp đùi nghiêng 45°", weight: "40kg - 50kg", sets: "3 hiệp x 15 reps", rest: "60s", img: "assets/exercises/leg_press/0.jpg", imgEnd: "assets/exercises/leg_press/1.jpg", detailId: "leg_press", tip: "Hạ sâu 90 độ, khi đạp lên KHÔNG khóa khớp gối.", setupAngle: "Chân đặt giữa bàn đạp", mistake: "Không duỗi thẳng khóa chết khớp gối." },
      { name: "Dumbbell Romanian Deadlift", target: "Đùi sau & Nâng mông", machine: "2 Quả tạ đơn", weight: "10kg - 12kg/bên", sets: "3 hiệp x 12 reps", rest: "60s", img: "assets/exercises/romanian_deadlift/0.jpg", imgEnd: "assets/exercises/romanian_deadlift/1.jpg", detailId: "romanian_deadlift", tip: "Đẩy hông ra sau, tạ lướt sát ống đồng căng đùi sau.", setupAngle: "Gối hơi chùng nhẹ cố định", mistake: "Không cong lưng khi cúi người." },
      { name: "Standing Calf Raise", target: "Bắp chân thon gọn", machine: "Bục nhón bắp chân", weight: "10kg mỗi bên", sets: "3 hiệp x 15-20 reps", rest: "45s", img: "assets/exercises/standing_calf_raise/0.jpg", imgEnd: "assets/exercises/standing_calf_raise/1.jpg", tip: "Nhón hết biên độ, giữ 1s ở đỉnh siết căng bắp chân.", setupAngle: "Mũi chân đặt 1/3 mép bục", mistake: "Không nhún nhảy mất kiểm soát." },
      { name: "Incline Treadmill Steep Hike", target: "Đốt calo & Mỡ nội tạng", machine: "Máy chạy bộ leo dốc", weight: "Dốc: 11-12% | Tốc độ: 4.8 km/h", sets: "20 phút liên tục", rest: "Uống nước", img: "assets/exercises/incline_treadmill/0.jpg", imgEnd: "assets/exercises/incline_treadmill/1.jpg", detailId: "incline_treadmill", tip: "Đốt mỡ nội tạng mạnh nhất tuần mà bảo vệ khớp gối.", setupAngle: "Độ dốc cao 11-12%", mistake: "Không vịn tay vào máy chạy." }
    ]
  },
  thu: {
    dayName: "Thứ Năm",
    focus: "Upper Body (Thân Trên) + Siết 6 Múi Bụng",
    meals: {
      bf: "40g yến mạch ngâm sữa chua + 1/2 quả chuối + hạt hạnh nhân. ~330 kcal",
      coffee: "Americano đá + đường ăn kiêng. ~2 kcal",
      fruit10h: "1 quả ổi hoặc 3 múi bưởi. ~60 kcal",
      lunch: "Cơm chay: Đậu hũ luộc chấm tương + nấm kho + canh chua (1/2 cơm). ~470 kcal",
      snack15h: "1 quả táo xanh giòn. ~75 kcal",
      pre: "1 quả chuối tiêu + nước lọc. ~95 kcal",
      dinner: "Cơm bò xào cải thìa (nhiều thịt bò nạc và rau, 1/2 cơm). ~490 kcal"
    },
    gym: [
      { name: "Push-ups (Hít đất)", target: "Ngực & Tay sau & Cơ lõi", machine: "Bodyweight", weight: "Trọng lượng cơ thể", sets: "4 hiệp x 15-20 cái", rest: "45s", img: "assets/exercises/pushups/0.jpg", imgEnd: "assets/exercises/pushups/1.jpg", tip: "Gồng cứng thân như tấm ván, đẩy ngực căng dứt khoát.", setupAngle: "Tay rộng hơn vai 1 gang tay", mistake: "Không võng thắt lưng xuống sàn." },
      { name: "Dumbbell Lateral Raise", target: "Cơ vai giữa tạo vai vuông", machine: "Tạ đơn nhỏ", weight: "4kg - 6kg/bên", sets: "4 hiệp x 15 reps", rest: "45s", img: "assets/exercises/dumbbell_lateral_raise/0.jpg", imgEnd: "assets/exercises/dumbbell_lateral_raise/1.jpg", tip: "Nâng ngang vai, cùi chỏ hơi cong tạo bờ vai vuông.", setupAngle: "Cùi chỏ dẫn hướng nâng ngang vai", mistake: "Không nhún người lấy đà." },
      { name: "Single-Arm Dumbbell Row", target: "Cơ lưng xô từng bên", machine: "Ghế & Tạ đơn", weight: "12kg - 14kg", sets: "3 hiệp x 12 reps/bên", rest: "45s", img: "assets/exercises/single_arm_dumbbell_row/0.jpg", imgEnd: "assets/exercises/single_arm_dumbbell_row/1.jpg", tip: "Kéo tạ về phía hông, siết cơ lưng xô ở đỉnh.", setupAngle: "Lưng song song mặt đất", mistake: "Không xoay vặn thân người khi kéo." },
      { name: "Cable Kneeling Crunch", target: "Múi bụng trên & giữa", machine: "Máy cáp quỳ gối dây thừng", weight: "20kg - 25kg", sets: "4 hiệp x 15 reps", rest: "45s", img: "assets/exercises/cable_kneeling_crunch/0.jpg", imgEnd: "assets/exercises/cable_kneeling_crunch/1.jpg", detailId: "cable_kneeling_crunch", tip: "Cuộn lưng đưa chỏ chạm đùi, thở hết hơi siết múi bụng.", setupAngle: "Cố định hông chỉ cuộn cột sống", mistake: "Không ngồi sụp mông xuống gót chân." },
      { name: "Bicycle Crunch + Side Plank", target: "Cơ liên sườn (V-Cut thắt eo)", machine: "Thảm tập", weight: "Bodyweight", sets: "3 vòng: Đạp xe 20 cái ➔ Plank 30s/bên", rest: "45s", img: "assets/exercises/bicycle_crunch/0.jpg", imgEnd: "assets/exercises/bicycle_crunch/1.jpg", tip: "Siết thắt eo hông, đánh tan mỡ liên sườn eo 80cm.", setupAngle: "Xoay cùi chỏ chạm chéo đầu gối", mistake: "Không giật cổ bằng tay." }
    ]
  },
  fri: {
    dayName: "Thứ Sáu",
    focus: "Full Body Circuit (Xả Calo Toàn Thân)",
    meals: {
      bf: "1 tô bún bò Huế (bắp bò nạc, không giò mỡ, 1/2 bún, nhiều rau). ~400 kcal",
      coffee: "Cà phê đen phin đá mộc + đường ăn kiêng. ~2 kcal",
      fruit10h: "1/2 quả bưởi da xanh hoặc 1 quả ổi. ~60 kcal",
      lunch: "Cơm sườn nướng (sườn nạc, 1/2 cơm, không mỡ hành, bỏ trứng chiên). ~520 kcal",
      snack15h: "1 quả táo xanh giòn. ~75 kcal",
      pre: "1 quả chuối tiêu + nước lọc. ~95 kcal",
      dinner: "Gỏi cuốn tôm thịt (4 cuốn chấm ít tương) hoặc salad ức gà nướng. ~430 kcal"
    },
    gym: [
      { name: "Dumbbell Thrusters", target: "Toàn thân & Tim mạch", machine: "2 Quả tạ đơn", weight: "6kg - 8kg/bên", sets: "4 hiệp x 12-15 reps", rest: "60s", img: "assets/exercises/dumbbell_thrusters/0.jpg", imgEnd: "assets/exercises/dumbbell_thrusters/1.jpg", tip: "Squat sâu rồi mượn lực đùi đẩy tạ qua đầu dứt khoát.", setupAngle: "Tạ đặt ngang vai khi squat", mistake: "Không cong lưng khi ngồi xổm." },
      { name: "Kettlebell Swing", target: "Mông đùi sau & Đốt mỡ thừa", machine: "Tạ chuông", weight: "12kg - 16kg", sets: "4 hiệp x 20 cái", rest: "45s", img: "assets/exercises/kettlebell_swing/0.jpg", imgEnd: "assets/exercises/kettlebell_swing/1.jpg", tip: "Dùng lực giật của hông vung tạ lên ngang ngực.", setupAngle: "Hinge hông ra sau không squat gối", mistake: "Không dùng cơ tay trước kéo tạ lên." },
      { name: "Mountain Climbers", target: "Cơ bụng dưới & Tim phổi", machine: "Thảm tập", weight: "Bodyweight", sets: "4 hiệp x 30 giây", rest: "30s", img: "assets/exercises/mountain_climbers/0.jpg", imgEnd: "assets/exercises/mountain_climbers/1.jpg", tip: "Kéo gối nhanh liên tục, giữ hông thấp, siết cơ bụng.", setupAngle: "Tay chống thẳng dưới vai", mistake: "Không nhổm mông quá cao." },
      { name: "Burpees", target: "Đốt calo toàn thân", machine: "Bodyweight", weight: "Bodyweight", sets: "3 hiệp x 10-12 cái", rest: "60s", img: "assets/exercises/burpees/0.jpg", imgEnd: "assets/exercises/burpees/1.jpg", tip: "Bật nhảy dứt khoát, đốt mỡ âm ỉ suốt 24h sau tập.", setupAngle: "Nhảy bật cao vỗ tay qua đầu", mistake: "Không tiếp đất bằng gót chân." },
      { name: "Treadmill Interval", target: "Hệ thống tim mạch xả calo", machine: "Máy chạy bộ", weight: "2p dốc 10% + 1p chạy bằng", sets: "20 phút (6-7 chu kỳ)", rest: "Hạ nhiệt", img: "assets/exercises/incline_treadmill/0.jpg", imgEnd: "assets/exercises/incline_treadmill/1.jpg", detailId: "incline_treadmill", tip: "Xả sạch toàn bộ calo tích tụ trong tuần.", setupAngle: "Xen kẽ dốc và bằng", mistake: "Không nhảy khỏi băng chuyền đột ngột." }
    ]
  },
  weekend: {
    dayName: "Thứ 7 & CN",
    focus: "Phục Hồi Sạch (Active Recovery) & Giảm Cortisol",
    meals: {
      bf: "Phở gà nạc (bỏ da, nước trong, nhiều rau thơm) hoặc bánh mì ốp la sạch. ~380 kcal",
      coffee: "1 ly cà phê đen mộc pha phin thư giãn cuối tuần. ~5 kcal",
      fruit10h: "1 đĩa dưa hấu hoặc ổi tươi. ~80 kcal",
      lunch: "Cơm gia đình: Cá hấp cuốn bánh tráng rau sống, canh cua rau đay. ~550 kcal",
      snack15h: "Uống đủ nước lọc + nghỉ ngơi thư giãn. ~0 kcal",
      pre: "Đi dạo bộ công viên 30-45 phút thả lỏng tinh thần.",
      dinner: "Lẩu gà lá é hoặc lẩu bò nạc (ăn thịt nạc và rau nấm, không ăn mì chiên). ~500 kcal"
    },
    gym: [
      { name: "Đi dạo công viên / Thư giãn ngoài trời", target: "Phục hồi & Hạ hormone stress", machine: "Ngoài trời", weight: "Tốc độ thong thả", sets: "30 - 45 phút", rest: "Uống nước", img: "assets/exercises/outdoor_walk/0.jpg", imgEnd: "assets/exercises/outdoor_walk/1.jpg", tip: "Hạ hormone Cortisol gây tích mỡ bụng do stress deadline.", setupAngle: "Hít thở sâu nhịp nhàng", mistake: "Không xem điện thoại khi đi dạo." },
      { name: "Giãn cơ toàn thân (Full Body Stretch)", target: "Cột sống & Khớp linh hoạt", machine: "Thảm tại nhà", weight: "Bodyweight", sets: "15 - 20 phút", rest: "Thở sâu", img: "assets/exercises/cat_stretch/0.jpg", imgEnd: "assets/exercises/cat_stretch/1.jpg", tip: "Kéo giãn cột sống, hông và cổ vai gáy giải tỏa cơ cứng.", setupAngle: "Giữ mỗi động tác 30 giây", mistake: "Không kéo giật ép cơ quá mức." },
      { name: "Giấc ngủ phục hồi 8 tiếng", target: "Tái tạo cơ & Sản sinh GH đốt mỡ", machine: "Phòng ngủ tối, mát", weight: "Ngủ trước 23h30", sets: "7.5 - 8 tiếng", rest: "Không xem đt", img: "assets/exercises/deep_sleep/0.jpg", imgEnd: "assets/exercises/deep_sleep/1.jpg", tip: "Sản sinh hormone tăng trưởng GH để đốt mỡ ban đêm.", setupAngle: "Nhiệt độ phòng 24-25°C", mistake: "Không dùng màn hình trước ngủ 30p." }
    ]
  }
};

function getActiveWeeklyData() {
  const custom = localStorage.getItem('tqfit_custom_schedule');
  if (custom) {
    try { return JSON.parse(custom); } catch (e) {}
  }
  if (typeof ProfileManager !== 'undefined') {
    const active = ProfileManager.getActiveProfile();
    if (active && active.schedule) return active.schedule;
  }
  return defaultWeeklyData;
}

function getActiveWaterSchedule() {
  if (typeof ProfileManager !== 'undefined') {
    const active = ProfileManager.getActiveProfile();
    if (active && active.waterSchedule && active.waterSchedule.length) {
      return active.waterSchedule;
    }
  }
  return waterSchedule;
}

function getActiveWaterGoal() {
  if (typeof ProfileManager !== 'undefined') {
    const active = ProfileManager.getActiveProfile();
    if (active && active.metrics && active.metrics.waterGoal) {
      return active.metrics.waterGoal;
    }
  }
  return 3000;
}

function saveCustomWeeklyData(data) {
  localStorage.setItem('tqfit_custom_schedule', JSON.stringify(data));
}

function resetToDefaultWeeklyData() {
  localStorage.removeItem('tqfit_custom_schedule');
}

function getDayMilestones(data) {
  return [
    { id: 'wake', time: '06:30', title: 'Khởi Động Ngày Mới', badge: '300ml chanh ấm', desc: 'Uống 1 cốc nước ấm thanh lọc tiêu hóa.' },
    { id: 'cardio', time: '06:35 - 06:50', title: '15 Phút Cardio Tại Nhà', badge: 'Đốt 100 kcal', desc: '5 động tác đánh thức cơ thể khi bụng rỗng:', isCardio: true },
    { id: 'bf', time: '07:00', title: 'Bữa Sáng Sạch', badge: 'Đạm nạc', desc: data.meals.bf },
    { id: 'coffee', time: '08:30', title: 'Cà Phê Dev 0 Calo', badge: '+300ml nước', desc: data.meals.coffee },
    { id: 'fruit', time: '10:00', title: 'Trái Cây Giải Lao', badge: '+300ml nước', desc: data.meals.fruit10h },
    { id: 'lunch', time: '12:00', title: 'Bữa Trưa Văn Phòng', badge: '1/2 cơm', desc: data.meals.lunch },
    { id: 'snack', time: '15:30', title: 'Xế Chiều Đi Lại', badge: '+300ml nước', desc: data.meals.snack15h },
    { id: 'pre', time: '17:15', title: 'Nạp Trước Tập', badge: 'Chuối + Nước', desc: data.meals.pre },
    { id: 'gym', time: '18:00 - 19:15', title: 'Buổi Tập Gym Chi Tiết', badge: '+500ml nước', desc: 'Tạ trước 45p ➔ Đi bộ dốc 20p.', isGym: true },
    { id: 'dinner', time: '19:45', title: 'Bữa Tối Sau Tập', badge: '+250ml nước', desc: data.meals.dinner },
    { id: 'sleep', time: '23:00', title: 'Đi Ngủ Sâu Đốt Mỡ', badge: 'Hạ Cortisol', desc: 'Ngủ 7-8 tiếng phục hồi cơ thể.' }
  ];
}
