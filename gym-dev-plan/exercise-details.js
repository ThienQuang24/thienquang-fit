// Exercise Details: Bách Khoa Toàn Thư Chuẩn Form & Hướng Dẫn Từng Bước Chi Tiết
const ExerciseDetails = {
  incline_treadmill: {
    steps: [
      "Cài đặt máy: Khởi động 2p dốc 2% làm ấm gối. Sau đó tăng Incline lên 10-12%, Speed 4.8 - 5.2 km/h.",
      "Tư thế sải bước: Lưng thẳng, mắt nhìn ngang tầm mắt, tiếp đất bằng giữa bàn chân (mid-foot), đánh tay nhịp nhàng 90°.",
      "Vùng nhịp tim Zone 2: Duy trì nhịp tim 125-138 bpm để cơ thể đốt 85% năng lượng từ mỡ nội tạng và mỡ bụng.",
      "Nhịp thở: Hít sâu bằng mũi 2 nhịp bước, thở đều ra bằng miệng 2 nhịp bước để cung cấp đủ oxy oxy-hóa mỡ."
    ],
    goldenRule: "TUYỆT ĐỐI KHÔNG VỊN TAY VÀO MÁY! Vịn tay làm cơ thể ngả sau, giảm 40-50% calo tiêu hao và triệt tiêu áp lực cơ bụng.",
    caloriesBurn: "~180 - 220 kcal trong 20 phút (hiệu quả gấp đôi đi bộ bằng phẳng)."
  },
  incline_dumbbell_press: {
    steps: [
      "Setup ghế: Điều chỉnh ghế nghiêng 30° (quá 30° sẽ ăn vào khớp vai thay vì ngực trên).",
      "Vào tạ: Đặt tạ lên đùi, ngả lưng xuống mượn lực gối hất tạ lên ngực, ép 2 bả vai chặt vào mặt đệm ghế.",
      "Hạ tạ (Hít vào): Cùi chỏ mở góc 60° so với thân người (không banh 90°), hạ tạ chạm mép ngực trên trong 2-3 giây.",
      "Đẩy lên (Thở ra): Dùng cơ ngực trên đẩy tạ lên cao theo đường vòng cung nhẹ, không chạm tạ vào nhau, siết cơ 1 giây."
    ],
    goldenRule: "Khóa chặt bả vai và gồng cơ bụng suốt động tác. Không nhấc mông khỏi mặt ghế.",
    caloriesBurn: "Kích hoạt nở dày cơ ngực trên giáp quai xanh, tạo form ngực vuông nam tính."
  },
  pec_deck_fly: {
    steps: [
      "Setup ghế: Chỉnh độ cao ghế sao cho tay nắm / đệm tỳ ngang tầm giữa ngực.",
      "Tư thế: Ngực ưỡn, vai ép chặt ra sau tựa vào đệm, cùi chỏ hơi cong nhẹ và cố định góc này suốt bài.",
      "Ép tạ (Thở ra): Dùng cơ ngực kéo 2 cánh tay về giữa, chạm 2 tay lại và siết chặt rãnh ngực trong 1 giây.",
      "Mở tạ (Hít vào): Mở rộng tay có kiểm soát trong 2-3 giây cho đến khi cơ ngực căng hết biên độ."
    ],
    goldenRule: "Không bao giờ để tạ kéo giật cùi chỏ ra sau quá sâu gây chấn thương khớp vai.",
    caloriesBurn: "Khắc họa rãnh ngực xẻ sâu và phát triển độ dày toàn bộ khoang ngực."
  },
  seated_dumbbell_shoulder_press: {
    steps: [
      "Setup ghế: Dựng ghế tựa góc 80° - 85° (hơi nghiêng nhẹ để bảo vệ khớp vai).",
      "Vào tạ: Hất tạ lên ngang tầm tai, lòng bàn tay hướng nhẹ về trước (góc 45°).",
      "Đẩy lên (Thở ra): Đẩy tạ qua đầu theo quỹ đạo tự nhiên, không khóa cứng khớp cùi chỏ ở đỉnh.",
      "Hạ chậm (Hít vào): Hạ tạ có kiểm soát trong 2 giây về ngang mang tai."
    ],
    goldenRule: "Gồng chặt cơ lõi (Core), giữ lưng áp sát mặt tựa, không ưỡn ngực võng thắt lưng.",
    caloriesBurn: "Xây bờ vai vuông rộng (bắp vai trái táo), giúp thắt eo trông nhỏ hơn rõ rệt."
  },
  tricep_rope_pushdown: {
    steps: [
      "Setup cáp: Ròng rọc đặt ở nấc cao nhất, gắn phụ kiện dây thừng (Rope).",
      "Tư thế: Hơi gập người về trước 10°, khóa cứng 2 cùi chỏ ép sát vào 2 bên sườn.",
      "Phát lực (Thở ra): Kéo dây xuống thẳng đứng, ở đáy mở tách 2 đầu dây sang 2 bên để khóa đỉnh bắp tay sau.",
      "Hạ về (Hít vào): Đưa tay lên đến góc cùi chỏ 90° rồi dừng lại, không để cùi chỏ bị giật lên cao."
    ],
    goldenRule: "Cùi chỏ phải đứng yên như đóng đinh vào sườn, chỉ có cẳng tay chuyển động.",
    caloriesBurn: "Cắt nét cơ bắp tay sau (chiếm 60% kích thước bắp tay), loại bỏ mỡ lỏng bắp tay."
  },
  lat_pulldown: {
    steps: [
      "Cầm đòn: Nắm thanh đòn rộng hơn vai 1.5 gang tay, lòng bàn tay hướng về phía trước.",
      "Tư thế ngồi: Đầu gối khóa chặt dưới đệm tỳ, người hơi ngả nhẹ ra sau khoảng 10° - 15°.",
      "Kéo xô (Thở ra): Dùng lực cơ lưng xô kéo thanh đòn về chạm xương quai xanh, ép 2 bả vai vào nhau.",
      "Nhả tạ (Hít vào): Nhả tạ chậm 3 giây, cảm nhận toàn bộ cơ lưng xô giãn căng hết biên độ."
    ],
    goldenRule: "Không dùng quán tính giật người ngả ra sau quá 20°. Kéo bằng cùi chỏ, không kéo bằng cổ tay.",
    caloriesBurn: "Mở rộng đôi cánh lưng xô hình chữ V (V-Taper) tôn thắt vòng eo thon gọn."
  },
  seated_cable_row: {
    steps: [
      "Tư thế ngồi: Đặt chân lên bàn đạp, gối hơi chùng nhẹ, lưng thẳng tắp vuông góc với sàn.",
      "Kéo cáp (Thở ra): Kéo tay cầm chữ V sát vào bụng dưới, ép chặt 2 bả vai ra sau giữ 1 giây.",
      "Nhả cáp (Hít vào): Duỗi tay về trước có kiểm soát, giữ cột sống thẳng, không gù lưng."
    ],
    goldenRule: "Khắc phục triệt để tật gù lưng và mỏi cổ vai gáy do ngồi code nhiều giờ.",
    caloriesBurn: "Tăng độ dày bản lưng giữa, cải thiện dáng đứng chuẩn thẳng tự tin."
  },
  goblet_squat: {
    steps: [
      "Cầm tạ: Hai tay ôm chắc 1 quả tạ đơn dựng đứng sát trước ngực.",
      "Độ rộng chân: Chân rộng hơn vai một chút, mũi chân xoay mở ra ngoài 30°.",
      "Hạ người (Hít vào): Đẩy hông ra sau rồi hạ mông xuống dưới mức song song sàn, gối hướng theo mũi chân.",
      "Đứng lên (Thở ra): Đạp mạnh gót chân xuống sàn đẩy thẳng người lên, siết mông ở đỉnh."
    ],
    goldenRule: "Giữ ngực luôn mở và ngẩng đầu. Tuyệt đối không để đầu gối sụp vào trong khi đứng lên.",
    caloriesBurn: "Kích hoạt nhóm cơ đùi trước và cơ mông lớn nhất cơ thể, đốt calo tối đa."
  },
  leg_press: {
    steps: [
      "Đặt chân: Đặt 2 bàn chân ở giữa bàn đạp, rộng bằng vai, mũi chân mở nhẹ 15°.",
      "Hạ sàn (Hít vào): Tháo chốt an toàn, hạ bàn đạp xuống chậm cho đến khi đùi tạo góc 90° với cẳng chân.",
      "Đạp lên (Thở ra): Dùng toàn bộ cơ đùi và gót chân đạp sàn lên, dừng lại khi gối vẫn còn chùng nhẹ."
    ],
    goldenRule: "CẤM KHÓA CHẾT KHỚP GỐI (Lockout gối) khi đạp lên cao để tránh chấn thương khớp gối.",
    caloriesBurn: "Tăng sức mạnh chân đùi toàn diện mà không gây áp lực lên cột sống thắt lưng."
  },
  romanian_deadlift: {
    steps: [
      "Tư thế bắt đầu: Đứng thẳng, 2 tạ đơn cầm sát đùi trước, chân rộng bằng hông.",
      "Bản lề hông (Hít vào): Đẩy mông ra sau tối đa, tạ lướt sát ống đồng, đầu gối chỉ chùng nhẹ cố định.",
      "Điểm căng: Hạ đến dưới gối khi cảm nhận cơ đùi sau và mông căng xé, lưng thẳng tắp.",
      "Kéo lên (Thở ra): Đẩy hông về trước đưa người đứng thẳng dậy, siết chặt cơ mông 1 giây."
    ],
    goldenRule: "Chuyển động bằng hông (Hip Hinge), KHÔNG cong lưng cúi người như nhặt đồ.",
    caloriesBurn: "Đốt mỡ đùi sau, nâng cao cơ mông, khắc phục chứng võng lưng do ngồi nhiều."
  },
  cable_kneeling_crunch: {
    steps: [
      "Tư thế quỳ: Quỳ gối cách máy cáp 1 mét, cầm dây thừng đặt 2 bên tai ngang thái dương.",
      "Cuộn bụng (Thở ra): Cố định hông, cuộn cong cột sống đưa cùi chỏ chạm về phía đùi.",
      "Siết đỉnh: Thở hết toàn bộ không khí ra khỏi phổi, siết nghẹt cơ bụng 1.5 giây.",
      "Trở về (Hít vào): Nhả lưng lên chậm có kiểm soát, cảm nhận cơ bụng căng giãn."
    ],
    goldenRule: "Chỉ cuộn cột sống bằng cơ bụng, KHÔNG ngồi thụt mông xuống gót chân lấy đà.",
    caloriesBurn: "Tạo các rãnh múi bụng trên và giữa dày nét, siết nhỏ vòng eo 80cm."
  },
  cat_cow: {
    steps: [
      "Tư thế chuẩn bị: Quỳ 4 điểm trên thảm, hai bàn tay ngay dưới vai, hai đầu gối ngay dưới hông, lưng song song sàn.",
      "Tư thế Bò (Hít vào): Từ từ võng lưng xuống, nâng ngực và cằm ngửa lên trần nhà, mở rộng lồng ngực đón oxy.",
      "Tư thế Mèo (Thở ra): Siết chặt cơ bụng, cuộn cong tròn toàn bộ cột sống lên cao, cúi đầu nhìn về phía rốn.",
      "Lặp lại: Thực hiện nhịp nhàng liên tục theo hơi thở sâu trong 3 phút để bôi trơn các khớp đốt sống sau đêm ngủ."
    ],
    goldenRule: "Chuyển động nhẹ nhàng tuần tự từ xương cụt lên cổ, KHÔNG giật cục cổ đột ngột.",
    caloriesBurn: "Đánh thức cột sống, giải phóng chèn ép rễ thần kinh cổ vai gáy do ngồi code nhiều."
  },
  jumping_jacks: {
    steps: [
      "Tư thế bắt đầu: Đứng thẳng lưng, hai chân khép sát, hai tay buông tự nhiên hai bên đùi.",
      "Bật nhảy (Thở ra): Bật nhẹ chân sang hai bên rộng hơn vai, đồng thời vung hai tay qua đầu vỗ nhẹ hoặc chạm ngón tay.",
      "Thu về (Hít vào): Bật nhảy thu hai chân về vị trí ban đầu đồng thời hạ hai tay về sát đùi.",
      "Duy trì nhịp: Nhảy liên tục theo nhịp thở đều 1-2, 1-2, giữ cơ bụng hơi gồng nhẹ để bảo vệ lưng."
    ],
    goldenRule: "TIẾP ĐẤT BẰNG NỬA TRƯỚC BÀN CHÂN (MŨI CHÂN)! Khớp gối luôn chùng nhẹ, không tiếp đất bằng gót chân.",
    caloriesBurn: "Đốt ~25-30 kcal trong 3 phút, kích hoạt hệ tuần hoàn đưa nhịp tim vào vùng đốt mỡ Zone 2."
  },
  high_knees: {
    steps: [
      "Thế đứng Boxing: Hai chân rộng bằng vai, hai tay co lại thủ cùi chỏ sát sườn, nắm đấm che ngang cằm.",
      "Nâng đùi & Ra đòn: Nâng đùi phải lên ngang hông kết hợp đấm thẳng tay trái dứt khoát về phía trước (Jab).",
      "Đổi bên nhịp nhàng: Hạ chân phải xuống mũi chân, lập tức nâng đùi trái lên và phóng đấm tay phải tới (Cross).",
      "Xoay hông: Mỗi cú đấm xoay nhẹ hông theo chiều đòn đánh để ép vặn rãnh bụng liên sườn."
    ],
    goldenRule: "THỞ PHÙ MẠNH RA BẰNG MIỆNG THEO TỪNG CÚ ĐẤM! Luôn thu tay về che cằm ngay sau khi đấm.",
    caloriesBurn: "Đốt ~30 kcal trong 3 phút, săn chắc bờ vai và siết rãnh múi bụng hai bên sườn."
  },
  mountain_climbers: {
    steps: [
      "Tư thế Plank cao: Hai tay chống thẳng dưới vai, lưng và chân tạo thành một đường thẳng tắp, mắt nhìn xuống thảm.",
      "Gập gối siết bụng: Gồng cứng bụng dưới, từ từ kéo một đầu gối về phía ngực, dừng 1 giây ở điểm gần nhất.",
      "Đổi chân chậm rãi: Đưa chân về vị trí cũ và đổi sang chân kia với tốc độ chậm, cảm nhận từng thớ cơ bụng co bóp.",
      "Kiểm soát hơi thở: Thở ra khi co gối vào ngực, hít vào khi duỗi chân trở lại tư thế Plank."
    ],
    goldenRule: "TUYỆT ĐỐI KHÔNG NHỔM CAO MÔNG HOẶC VÕNG LƯNG! Giữ hông thấp ngang vai suốt 3 phút.",
    caloriesBurn: "Đốt mỡ nội tạng bụng dưới mạnh mẽ và tăng cường độ bền nhóm cơ lõi (Core)."
  },
  glute_bridge: {
    steps: [
      "Tư thế nằm: Nằm ngửa trên thảm, co hai đầu gối 90°, bàn chân đặt phẳng trên thảm rộng bằng vai.",
      "Hai tay xuôi: Hai cánh tay đặt dọc thân người úp lòng bàn tay xuống sàn làm điểm tựa.",
      "Đẩy hông (Thở ra): Dồn lực qua gót chân đẩy hông lên cao cho đến khi đầu gối, hông và ngực thành đường thẳng.",
      "Siết đỉnh (1-2s): Siết chặt cơ mông ở vị trí cao nhất, sau đó hít vào từ từ hạ hông xuống cách thảm 2cm rồi đẩy tiếp."
    ],
    goldenRule: "DÙNG LỰC CƠ MÔNG VÀ GÓT CHÂN ĐẨY LÊN! Không ưỡn cột sống thắt lưng để tránh đau lưng dưới.",
    caloriesBurn: "Kích hoạt cơ mông lớn đốt mỡ thụ động, cân chỉnh xương chậu chống tật võng lưng do ngồi nhiều."
  }
};
