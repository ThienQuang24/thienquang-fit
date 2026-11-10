// Các Phiên Bản Tập Nâng Cao Dành Cho AI Tự Động Kích Hoạt - Ảnh Thực Tế Chuẩn Xác
const v2HypertrophyWeeklyData = {
  mon: {
    dayName: "Thứ Hai",
    focus: "Hypertrophy Push (Dày Khối Ngực Trên & Vai Vuông)",
    meals: {
      bf: "2 quả trứng ốp la + 2 lát bánh mì đen ngũ cốc + 1 ly sữa đậu nành. ~420 kcal",
      coffee: "Americano đá + 1 gói đường ăn kiêng. ~2 kcal",
      fruit10h: "1 quả chuối + 15 hạt hạnh nhân. ~150 kcal",
      lunch: "Cơm bò xào cải thìa (1 chén cơm đầy, 150g thịt bò nạc, nhiều rau). ~620 kcal",
      snack15h: "1 hộp sữa chua Hy Lạp + 1 quả ổi. ~130 kcal",
      pre: "1 củ khoai lang nhỏ luộc + 1 quả trứng luộc. ~180 kcal",
      dinner: "Cá hồi áp chảo hoặc ức gà áp chảo sốt tiêu + khoai tây nghiền. ~580 kcal"
    },
    gym: [
      { name: "Heavy Incline Dumbbell Press", target: "Dày khối ngực trên", machine: "Ghế nghiêng 30° - Tạ đơn nặng", weight: "12kg - 14kg/bên", sets: "4 hiệp x 8-10 reps", rest: "75s", img: "assets/exercises/incline_dumbbell_press/0.jpg", imgEnd: "assets/exercises/incline_dumbbell_press/1.jpg", tip: "Mức tạ nặng kích hoạt sợi cơ dày, hạ chậm 3 giây siết đỉnh 1 giây.", setupAngle: "Ghế nghiêng 30°", mistake: "Không để tạ rơi tự do khi hạ." },
      { name: "Barbell Flat Bench Press", target: "Toàn bộ cơ ngực", machine: "Đòn tạ Olympic & Ghế phẳng", weight: "40kg - 45kg", sets: "4 hiệp x 8-10 reps", rest: "90s", img: "assets/exercises/barbell_bench_press/0.jpg", imgEnd: "assets/exercises/barbell_bench_press/1.jpg", tip: "Hạ đòn chạm xương ức, khóa vai ép chân xuống sàn đẩy bùng nổ.", setupAngle: "Ghế phẳng 180°", mistake: "Không nhấc mông khỏi ghế." },
      { name: "Dumbbell Arnold Press", target: "Toàn bộ 3 đầu cơ vai", machine: "Ghế tựa 85° - Tạ đơn", weight: "8kg - 10kg/bên", sets: "3 hiệp x 10 reps", rest: "60s", img: "assets/exercises/seated_dumbbell_shoulder_press/0.jpg", imgEnd: "assets/exercises/seated_dumbbell_shoulder_press/1.jpg", tip: "Xoay cổ tay từ ngực lên đỉnh đầu, mở rộng biên độ vai vuông vức.", setupAngle: "Ghế tựa 85°", mistake: "Không giật tạ bằng lưng." },
      { name: "Weighted Dips (Xà kép)", target: "Ngực dưới & Tay sau dày", machine: "Khung xà kép", weight: "Bodyweight + Đai tạ 5kg", sets: "3 hiệp x 8-10 cái", rest: "60s", img: "assets/exercises/weighted_dips/0.jpg", imgEnd: "assets/exercises/weighted_dips/1.jpg", tip: "Nghiêng người về trước 15° để ăn ngực, hạ cùi chỏ 90 độ.", setupAngle: "Thân người hơi đổ trước", mistake: "Không hạ quá sâu gây chấn thương vai." },
      { name: "Cardio Dốc Nhẹ Giữ Nét", target: "Duy trì tim mạch", machine: "Máy chạy bộ", weight: "Dốc: 6% | Tốc độ: 5.0 km/h", sets: "12 phút", rest: "Hạ nhiệt", img: "assets/exercises/incline_treadmill/0.jpg", imgEnd: "assets/exercises/incline_treadmill/1.jpg", tip: "Giữ 12 phút nhẹ nhàng để không dị hóa (tiêu) cơ bắp.", setupAngle: "Dốc nhẹ 6%", mistake: "Không chạy gắng sức quá 15 phút." }
    ]
  },
  tue: {
    dayName: "Thứ Ba",
    focus: "Hypertrophy Pull (Lưng Xô V-Taper Khối Dày)",
    meals: {
      bf: "1 tô phở bò tái bắp (nhiều thịt, 1 chén bánh phở, giá trụng). ~480 kcal",
      coffee: "Cà phê đen mộc + đường ăn kiêng. ~2 kcal",
      fruit10h: "1 quả táo đỏ + 1 hộp sữa tươi ít béo. ~160 kcal",
      lunch: "Cơm gà nướng sốt mật ong (1 chén cơm, 180g gà nạc, salad dưa leo). ~640 kcal",
      snack15h: "1 quả chuối tiêu + hạt điều. ~140 kcal",
      pre: "1 lát bánh mì phết bơ đậu phộng. ~160 kcal",
      dinner: "Tôm hấp sả + canh rong biển thịt băm + 1 củ khoai lang. ~520 kcal"
    },
    gym: [
      { name: "Lat Pulldown Wide Grip", target: "Lưng xô V-Taper vĩ đại", machine: "Máy kéo xô thẳng đứng", weight: "35kg - 40kg", sets: "4 hiệp x 8-10 reps", rest: "90s", img: "assets/exercises/lat_pulldown/0.jpg", imgEnd: "assets/exercises/lat_pulldown/1.jpg", tip: "Kéo thanh đòn về chạm quai xanh, ép 2 bả vai mở rộng xô chữ V.", setupAngle: "Cầm rộng hơn vai 1 gang tay", mistake: "Không đung đưa người lấy đà." },
      { name: "Seated Cable Row", target: "Dày bản lưng giữa", machine: "Máy cáp ngang V-Bar", weight: "30kg - 35kg", sets: "4 hiệp x 8-10 reps", rest: "75s", img: "assets/exercises/seated_cable_row/0.jpg", imgEnd: "assets/exercises/seated_cable_row/1.jpg", tip: "Kéo đòn chạm bụng dưới siết lưng dày cộm chống gù lưng.", setupAngle: "Tay nắm chữ V kéo về rốn", mistake: "Cấm cong gù thắt lưng." },
      { name: "Dumbbell Bicep Curl", target: "Đỉnh chóp bắp tay trước", machine: "2 Quả tạ đơn", weight: "8kg - 10kg/bên", sets: "3 hiệp x 10 reps", rest: "60s", img: "assets/exercises/dumbbell_bicep_curl/0.jpg", imgEnd: "assets/exercises/dumbbell_bicep_curl/1.jpg", tip: "Cuộn tạ xoay ngửa cổ tay ở đỉnh, hạ chậm 3 giây cảm nhận xé cơ.", setupAngle: "Đứng thẳng cố định cùi chỏ", mistake: "Không vung giật người lấy đà." },
      { name: "Face Pulls", target: "Cầu vai & Vai sau dày khỏe", machine: "Máy cáp ngang mặt", weight: "18kg - 22kg", sets: "3 hiệp x 12 reps", rest: "45s", img: "assets/exercises/face_pull/0.jpg", imgEnd: "assets/exercises/face_pull/1.jpg", tip: "Kéo ngang tầm mắt, tách chỏ sang 2 bên trị dứt điểm cổ rùa.", setupAngle: "Ròng rọc ngang tầm mắt", mistake: "Không kéo chỏ thấp xuống bụng." },
      { name: "Hanging Leg Raise (Duỗi thẳng chân)", target: "Cơ bụng 6 múi cắt nét", machine: "Xà đơn", weight: "Bodyweight", sets: "3 hiệp x 12-15 cái", rest: "60s", img: "assets/exercises/hanging_knee_raise/0.jpg", imgEnd: "assets/exercises/hanging_knee_raise/1.jpg", tip: "Nâng thẳng 2 chân tạo góc 90° siết cuộn cơ bụng dưới.", setupAngle: "Treo người thẳng", mistake: "Không lấy đà nhún người." }
    ]
  },
  wed: defaultWeeklyData.wed,
  thu: defaultWeeklyData.thu,
  fri: defaultWeeklyData.fri,
  weekend: defaultWeeklyData.weekend
};

const v3HomeWeeklyData = {
  mon: {
    dayName: "Thứ Hai",
    focus: "Home Full Body Circuit (30 Phút Tại Nhà)",
    meals: defaultWeeklyData.mon.meals,
    gym: [
      { name: "Push-ups (Hít đất)", target: "Ngực & Tay sau", machine: "Tại nhà / Thảm tập", weight: "Bodyweight", sets: "4 hiệp x 15 cái", rest: "45s", img: "assets/exercises/pushups/0.jpg", imgEnd: "assets/exercises/pushups/1.jpg", tip: "Siết cứng thân như tấm ván, hạ sâu đẩy căng.", setupAngle: "Thân thẳng tắp", mistake: "Không chùng mông hay cong lưng." },
      { name: "Dumbbell Lateral Raise", target: "Cơ vai giữa", machine: "2 Tạ đơn nhỏ", weight: "4kg - 6kg/bên", sets: "4 hiệp x 15 reps", rest: "45s", img: "assets/exercises/dumbbell_lateral_raise/0.jpg", imgEnd: "assets/exercises/dumbbell_lateral_raise/1.jpg", tip: "Nâng ngang vai, cùi chỏ hơi cong tạo bờ vai vuông.", setupAngle: "Cùi chỏ dẫn hướng", mistake: "Không nhún người lấy đà." },
      { name: "Single-Arm Dumbbell Row", target: "Lưng xô chống gù", machine: "Ghế & Tạ đơn", weight: "10kg - 12kg", sets: "4 hiệp x 12 cái/bên", rest: "45s", img: "assets/exercises/single_arm_dumbbell_row/0.jpg", imgEnd: "assets/exercises/single_arm_dumbbell_row/1.jpg", tip: "Kéo tạ sát hông, siết cơ xô ở đỉnh.", setupAngle: "Lưng song song sàn", mistake: "Không xoay vặn thân." },
      { name: "Mountain Climbers", target: "Cơ bụng dưới & Tim phổi", machine: "Thảm tập", weight: "Bodyweight", sets: "4 hiệp x 30 giây", rest: "30s", img: "assets/exercises/mountain_climbers/0.jpg", imgEnd: "assets/exercises/mountain_climbers/1.jpg", tip: "Kéo gối nhanh liên tục, giữ hông thấp siết bụng.", setupAngle: "Tay chống thẳng vai", mistake: "Không nhổm mông quá cao." },
      { name: "Bicycle Crunch", target: "Cơ liên sườn múi bụng", machine: "Thảm tập", weight: "Bodyweight", sets: "3 hiệp x 20 cái", rest: "45s", img: "assets/exercises/bicycle_crunch/0.jpg", imgEnd: "assets/exercises/bicycle_crunch/1.jpg", tip: "Xoay cùi chỏ chạm chéo đầu gối ép tan mỡ liên sườn.", setupAngle: "Nằm thảm", mistake: "Không kéo giật cổ." }
    ]
  },
  tue: defaultWeeklyData.tue,
  wed: defaultWeeklyData.wed,
  thu: defaultWeeklyData.thu,
  fri: defaultWeeklyData.fri,
  weekend: defaultWeeklyData.weekend
};
