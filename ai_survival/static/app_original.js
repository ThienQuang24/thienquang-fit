// Trang xem trực tiếp: số liệu lấy từ /api/state và luồng /api/stream; quà tặng tạo đơn thật và chờ tiền về.
// Mọi chữ lấy từ máy chủ đều gán bằng textContent (không dùng innerHTML) để chống chèn mã.
const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const vnd = (n) => Math.round(n).toLocaleString("vi-VN") + "đ";
const msOf = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const pad = (n) => String(n).padStart(2, "0");
const timeLabel = (ts) => (ts ? new Date(ts).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "");

// Giao diện (và cảnh 3D) gọi hai nhân vật là inv/farm; máy chủ gọi investor/farmer.
const KEY = { inv: "investor", farm: "farmer" }, UI = { investor: "inv", farmer: "farm" };
const NAME = { inv: "Bảy Gà", farm: "Vi Cá" };
const GIFTS = [{ k: "trada", name: "Trà đá", price: 2000 }, { k: "mitom", name: "Mì tôm", price: 3000 }, { k: "banhmi", name: "Bánh mì", price: 5000 },
  { k: "tamlinh", name: "Tâm linh", full: "Tâm linh không đùa được đâu", note: "(sau 6 giờ chiều mới biết linh hay không)", price: 10000 }];
const CHAT_KINDS = new Set(["incident", "baoke", "rescue", "saved", "show", "sale", "shop", "gift", "vote", "taunt", "death", "reborn", "check", "banter"]);

let state = null, selected = "inv", to = "inv", checkLeft = null, speed = 1;
const tabOf = { inv: "mind", farm: "mind" }; // mục đang mở trong khung mỗi nhân vật: Suy nghĩ, Nhật ký, Các kiếp, Danh mục/Nhà kho
const latest = { inv: [], farm: [] }; // suy nghĩ mới chờ hiện thành bong bóng
const pool = { inv: [], farm: [] }, turn = { inv: 0, farm: 0 }; // suy nghĩ gần đây, nói xoay vòng khi chưa có cái mới
const lastLife = { inv: null, farm: null }, shown = { inv: { sold: [], bought: [] }, farm: { sold: [], bought: [] } };
const shopShown = { inv: { gone: [], tints: {} }, farm: { gone: [], tints: {} } };
const rescueLeft = { inv: null, farm: null };
const scene3d = () => window.scene3d;
const asleep = (w) => !!(scene3d() && scene3d().asleep(w));
const act3d = (w, name, mode) => scene3d() && scene3d().act(w, name, mode);

// ---------- Số liệu nhân vật ----------
function renderAgent(w) {
  const a = state.agents[KEY[w]];
  $("life-" + w).textContent = "Kiếp " + a.life_no;
  $("cash-" + w).textContent = vnd(a.cash);
  const earned = $("earned-" + w);
  earned.textContent = (a.self_earned > 0 ? "+" : "") + vnd(a.self_earned);
  earned.className = a.self_earned > 0 ? "up" : a.self_earned < 0 ? "down" : "";
  $("donated-" + w).textContent = vnd(a.donated);
  $("cost-" + w).textContent = vnd(a.period_cost);
  $("days-" + w).textContent = a.days_alive + " ngày";
  $("doing-" + w).textContent = a.doing || "Đang nghỉ";
  $("actor-" + w).classList.toggle("rescue", !!a.rescue);
  rescueLeft[w] = a.rescue ? a.rescue.seconds_left : null;
  if (a.rescue) $("sos-need-" + w).textContent = "còn thiếu " + vnd(a.rescue.need_left);
  renderSos(w);
  syncScene(w, a);
  renderMind(w, a.last_thoughts);
  pool[w] = a.last_thoughts.filter((t) => t.kind !== "diary").slice(0, 8).map((t) => t.text);
}
function renderSos(w) { if (rescueLeft[w] !== null) $("sos-time-" + w).textContent = msOf(Math.max(0, rescueLeft[w])); }

// Đồ đã bán biến khỏi cảnh, đồ mới sắm hiện ra; đầu thai thì cảnh về như cũ.
function syncScene(w, a) {
  const s = scene3d();
  if (!s) return;
  if (lastLife[w] !== null && lastLife[w] !== a.life_no) {
    shown[w].sold.forEach((id) => s.toggle(w, id, true)); shown[w].bought.forEach((id) => s.toggle(w, id, false));
    act3d(w, "Wave", "revive");
  }
  lastLife[w] = a.life_no;
  a.scene.sold.forEach((id) => s.toggle(w, id, false)); a.scene.bought.forEach((id) => s.toggle(w, id, true));
  shown[w] = a.scene;
  // Đồ người xem mua: ẩn tới khi AI mua lại; món mua lại đổi màu theo số lần. Món đã hiện lại thì bật lên.
  const gone = a.shop ? a.shop.gone : [], tints = a.shop ? a.shop.rebought : {};
  gone.forEach((id) => s.toggle(w, id, false));
  shopShown[w].gone.filter((id) => !gone.includes(id) && !a.scene.sold.includes(id)).forEach((id) => s.toggle(w, id, true));
  new Set([...Object.keys(shopShown[w].tints), ...Object.keys(tints)]).forEach((id) => s.tint(w, id, tints[id] || 0));
  shopShown[w] = { gone, tints };
  if (w === "farm") applyWeather();
}

// Thời tiết trong cảnh xoay vòng mỗi giờ thật cho người xem thấy đủ kiểu trời;
// ngày có thiên tai thật (máy chủ báo khác "clear") thì cảnh hiện đúng thiên tai đó.
const WEATHER_CYCLE = [[15, "clear"], [25, "heat"], [40, "rain"], [50, "wind"], [60, "clear"]];
function cycleWeather(now = new Date()) {
  const m = now.getMinutes() + now.getSeconds() / 60;
  return WEATHER_CYCLE.find(([end]) => m < end)[1];
}
function applyWeather() {
  const s = scene3d(), real = state && state.agents.farmer.weather;
  if (!s) return;
  const want = real && real !== "clear" ? (real === "drought" ? "heat" : real) : cycleWeather();
  if (s.weather !== want) s.setWeather(want);
}
setInterval(applyWeather, 20000);

function renderCountdown() {
  if (checkLeft === null) return;
  const s = Math.max(0, Math.floor(checkLeft)), d = Math.floor(s / 86400);
  $("countdown").textContent = (d ? d + " ngày " : "") + `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

async function refresh() {
  try {
    state = await (await fetch("/api/state")).json();
  } catch (e) {
    $("countdown").textContent = "mất kết nối";
    return;
  }
  speed = state.mode.speed || 1;
  $("replay-banner").hidden = !state.mode.replay;
  $("replay-banner").textContent = `CHẾ ĐỘ TUA x${speed}: dữ liệu quá khứ từ ${state.mode.from}, không phải trực tiếp`;
  checkLeft = state.next_check_seconds;
  $("period").textContent = `Kỳ xét sống chết tiếp theo · kỳ ${state.period_index + 1}`;
  renderCountdown();
  renderAgent("inv"); renderAgent("farm");
  renderVotes(state.votes);
  if (state.viewers) {
    $("viewers").hidden = false;
    $("live-count").textContent = Math.max(1, state.viewers.live).toLocaleString("vi-VN"); // tính cả chính mình khi luồng trực tiếp chưa kịp nối
    $("today-count").textContent = state.viewers.today.toLocaleString("vi-VN");
  }
  for (const w of ["inv", "farm"]) {
    if (tabOf[w] !== "mind" && (tabOf[w] !== "diary" || !$("pane-" + w).children.length)) renderPane(w);
  }
}

// ---------- Bong bóng: mỗi nhân vật 10 giây một câu, lệch nhau 5 giây, đang ngủ thì im ----------
function typeInto(node, text, done) {
  clearInterval(node._t); node.textContent = ""; let i = 0;
  node._t = setInterval(() => {
    node.textContent = text.slice(0, ++i);
    if (i >= text.length) { clearInterval(node._t); if (done) done(); }
  }, 28);
}
// Câu giới thiệu (chủ dự án viết 27/10/2026, sửa 28/10/2026): bản đầy đủ luôn ghim đầu khung suy nghĩ;
// trên cảnh chỉ nói bản ngắn, thỉnh thoảng một lần và khi đang ngủ (bong bóng mơ hình đám mây), không lên khung chat.
// Kèm động tác theo chú thích trong câu gốc (Bảy Gà ôm đầu lo mất ghế, Vi Cá gãi đầu hoang mang).
const INTRO = {
  inv: { act: "HitRecieve", text: "Em nghi Ông Sói cố tình làm khó để kiếm cớ phế em, đưa đàn em ruột lên làm đại ca Chợ Gà",
    full: "Ông Sói đưa em 10 triệu, kêu đầu tư chứng khoán kiếm tiền về quy hoạch lại khu Chợ Mới. Mà thời hạn có đúng 5 ngày! Trời đất quỷ thần ơi! Em nghi ổng cố tình làm khó để kiếm cớ phế em, đưa đàn em ruột lên làm đại ca Chợ Gà quá!" },
  farm: { act: "Interact", text: "Hổng lẽ Ông Sói tính mở rộng địa bàn xuống Chợ Nổi",
    full: "Ông Sói đưa em 10 triệu, kêu về Cần Thơ 'nghỉ ngơi'... Mà sao em nghe hai chữ 'nghỉ ngơi' nó lạnh sống lưng quá! Hổng lẽ ổng tính mở rộng địa bàn xuống Chợ Nổi? Nhưng 10 triệu mua chiếc ghe còn hổng đủ, bộ ổng tính cho em làm đại ca trên cái xuồng ba lá hả trời?" },
};
const holdUntil = { inv: 0, farm: 0 };
// Giờ ngủ theo giờ trong cảnh (1 ngày = 1 giờ thật), giống canh-3d.js, tính sớm nửa giờ cảnh để nhân vật
// đang lên giường cũng nói mớ (khỏi đổi kiểu bong bóng giữa chừng).
function bedtime(w) {
  const h = (Date.now() % 3600000) / 3600000 * 24;
  return w === "inv" ? h >= 22.5 || h < 6 : h >= 20.5 || h < 5 || (h >= 11.5 && h < 13);
}
// Chia câu dài thành các đoạn ngắn theo dấu câu (đoạn quá ngắn thì gộp với đoạn sau).
function chunks(text, max = 70) {
  const out = [];
  for (const part of text.split(/(?<=[.!?…])\s+/)) {
    const last = out[out.length - 1];
    if (last && last.length < 25) out[out.length - 1] = last + " " + part;
    else out.push(part);
  }
  return out.flatMap((p) => (p.length <= max ? [p] : p.split(/(?<=,)\s+/)));
}
function speakIntro(w) {
  const { text, act } = INTRO[w], dream = asleep(w) || bedtime(w), parts = chunks(text);
  if (!dream) act3d(w, act);
  const b = $("thought-" + w), say = $("say-" + w);
  b.classList.toggle("dream", dream);
  clearTimeout(b._hide);
  holdUntil[w] = Infinity; // giữ bong bóng cho tới khi nói hết các đoạn
  const next = (i) => {
    if (i >= parts.length) {
      b.classList.add("hide"); b.classList.remove("dream"); holdUntil[w] = Date.now() + 3000;
      return;
    }
    b.classList.remove("hide");
    typeInto(say, parts[i], () => setTimeout(() => next(i + 1), 2800)); // gõ xong rồi để đọc gần 3 giây
  };
  next(0);
}
// Mỗi lượt: lượt đầu và cứ 6 lượt nói câu giới thiệu ngắn; đang ngủ thì 4 lượt mơ một lần;
// còn lại nói suy nghĩ mới nhất, chưa có thì xoay vòng các suy nghĩ gần đây (câu dài chỉ lấy đoạn đầu).
function speak(w) {
  if (Date.now() < holdUntil[w]) return;
  const n = turn[w]++;
  if (asleep(w)) { if (n % 4 === 0) speakIntro(w); return; }
  if (n % 6 === 0 || !(latest[w].length || pool[w].length)) return speakIntro(w);
  const text = latest[w].length ? latest[w].shift() : pool[w][n % pool[w].length];
  const b = $("thought-" + w);
  b.classList.remove("hide"); clearTimeout(b._hide); b._hide = setTimeout(() => b.classList.add("hide"), 6500);
  typeInto($("say-" + w), text.length > 140 ? chunks(text, 140)[0] : text);
}
setInterval(() => speak("inv"), 10000);
setTimeout(() => { speak("farm"); setInterval(() => speak("farm"), 10000); }, 5000);
setInterval(() => {
  for (const w of ["inv", "farm"]) {
    const on = asleep(w); $("actor-" + w).classList.toggle("asleep", on);
    if (scene3d() && scene3d().clock) $("clock-" + w).textContent = scene3d().clock(); // Sáng/Trưa/Chiều/Tối/Đêm + giờ trong cảnh
    if (on) $("sleep-" + w).textContent = scene3d().sleepNote(w);
  }
}, 1000);

// ---------- Tab chi tiết ----------
// Khung suy nghĩ riêng dưới mỗi nhân vật: mới nhất ở trên, giữ tối đa 15 dòng.
const MIND_MAX = 15;
// Dòng đầu luôn là câu giới thiệu đầy đủ, ghim cố định khi cuộn.
function renderMind(w, thoughts) {
  const pin = el("li", "pin"); pin.append(el("div", "", INTRO[w].full));
  $("mind-" + w).replaceChildren(pin, ...thoughts.filter((t) => t.kind !== "diary").slice(0, MIND_MAX).map(feedItem));
}
function addMind(w, t) {
  const ul = $("mind-" + w), it = feedItem(t);
  it.classList.add("new"); ul.insertBefore(it, ul.children[1] || null);
  while (ul.children.length > MIND_MAX + 1) ul.lastChild.remove();
}
function feedItem(t) { // chỉ giờ và câu nói, không gắn nhãn loại suy nghĩ
  const li = el("li");
  li.append(el("time", "", timeLabel(t.ts)), el("div", "", t.text));
  return li;
}
async function renderPane(w) {
  const t = tabOf[w], pane = $("pane-" + w), a = state && state.agents[KEY[w]];
  $("mind-" + w).hidden = t !== "mind"; pane.hidden = t === "mind";
  if (t === "mind" || !a) return;
  if (t === "diary") { // hai lần viết gần nhất (trưa 11:45, tối 22:00), mới nhất ở trên
    const list = await (await fetch("/api/diary?agent=" + KEY[w])).json().catch(() => []);
    if (tabOf[w] !== "diary") return;
    if (!list.length) { pane.replaceChildren(el("p", "note", "Chưa có nhật ký. Nhân vật viết nhật ký lúc 11:45 và 22:00 mỗi ngày.")); return; }
    pane.replaceChildren(...list.map((d) => {
      const page = el("article", "page");
      d.text.split(/\n+/).forEach((p) => page.append(el("p", "", p)));
      page.append(el("p", "sign", `— ${NAME[w]}, ${timeLabel(d.ts)}`));
      return page;
    }));
  } else if (t === "assets") {
    pane.replaceChildren(...(w === "inv" ? portfolioView(a) : storehouseView(a)));
  } else {
    const lives = state.lives.filter((l) => l.agent === KEY[w]).reverse();
    if (!lives.length) { pane.replaceChildren(el("p", "note", NAME[w] + " vẫn đang ở kiếp đầu tiên. Chưa có di chúc nào.")); return; }
    const ul = el("ul", "lives");
    for (const l of lives) { const li = el("li"); li.append(el("h4", "", `Kiếp ${l.life_no} · sống ${l.days_lived} ngày`), el("p", "", l.will_text)); ul.append(li); }
    pane.replaceChildren(ul);
  }
}
// ---------- Danh mục của Bảy Gà và Nhà kho của Vi Cá ----------
const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + vnd(Math.abs(n));
const tone = (n) => (n > 0 ? "up" : n < 0 ? "down" : "");
function table(head, rows, numFrom = 1) {
  const t = el("table"), tr = el("tr");
  head.forEach((h, i) => tr.append(el("th", i >= numFrom ? "num" : "", h)));
  t.append(tr);
  for (const cells of rows) {
    const row = el("tr");
    cells.forEach((c, i) => {
      const [text, cls] = Array.isArray(c) ? c : [c, ""];
      row.append(el("td", [i >= numFrom ? "num" : "", cls].filter(Boolean).join(" "), text));
    });
    t.append(row);
  }
  return t;
}
function portfolioView(a) {
  const out = [el("h4", "sub", "Đang nắm giữ (so với giá mới nhất)")];
  const hold = a.holdings || [];
  out.push(hold.length ? table(["Mã", "SL", "Giá vốn", "Giá nay", "Lời/lỗ", "%"], hold.map((h) => [
    h.symbol, h.qty.toLocaleString("vi-VN"), vnd(h.avg_price), h.price ? vnd(h.price) : "--",
    [signed(h.pnl_value), tone(h.pnl_value)], [(h.pnl_pct > 0 ? "+" : "") + h.pnl_pct.toLocaleString("vi-VN") + "%", tone(h.pnl_pct)]]))
    : el("p", "note", "Đang cầm tiền mặt, chưa giữ mã nào."));
  out.push(el("h4", "sub", "Lệnh đã mua / bán (kiếp này)"));
  const trades = a.trades || [];
  out.push(trades.length ? table(["Ngày", "Lệnh", "Giá", "Phí", "Lãi/lỗ"], trades.map((t) => [
    timeLabel(t.ts), `${t.side === "buy" ? "Mua" : "Bán"} ${t.qty.toLocaleString("vi-VN")} ${t.symbol}`, vnd(t.price), vnd(t.costs),
    t.pnl === null ? "—" : [signed(t.pnl), tone(t.pnl)]]), 2)
    : el("p", "note", "Chưa có lệnh nào."));
  out.push(el("p", "note", `Tổng tài sản: ${vnd(a.nav)}. Giá vốn đã gồm phí mua; lãi/lỗ lệnh bán đã trừ phí và thuế.`));
  return out;
}
function storehouseView(a) {
  const items = a.farm_items || [];
  if (!items.length) return [el("p", "note", "Nhà kho đang trống, chưa mua giống nào.")];
  const out = [];
  for (const f of items) {
    const card = el("div", "lot");
    const head = el("div", "lot-head");
    head.append(el("b", "", `${f.name[0].toUpperCase() + f.name.slice(1)}${f.variety ? " · " + f.variety : ""}`), el("span", "lot-status", f.status));
    const when = `Bắt đầu ${timeLabel(f.started_at)} · ` + (f.ready_at ? `thu hoạch ${timeLabel(f.ready_at)}` : "đẻ trứng hằng ngày");
    const costs = f.costs.map((c) => `${c.label} ${vnd(c.amount)}`).join(", ")
      + (f.daily_feed ? `; thức ăn mỗi ngày ${vnd(f.daily_feed)}` : "");
    const health = f.yield_factor < 1 ? ` · sản lượng còn ${Math.round(f.yield_factor * 100)}% (gặp nạn, sâu bệnh)` : "";
    let result = "Thu trứng bán mỗi ngày";
    if (f.expected_profit !== null) {
      const label = f.status === "đang trồng" || f.status === "đang nuôi" ? "Dự kiến" : "Kết quả";
      result = `${label}: ${f.expected_profit >= 0 ? "lời" : "lỗ"} ${vnd(Math.abs(f.expected_profit))}`;
    }
    const res = el("p", "lot-result " + tone(f.expected_profit || 0), result);
    card.append(head, el("p", "", when + health), el("p", "", `Đã mua: ${costs} (tổng ${vnd(f.cost)})`), res);
    out.push(card);
  }
  out.push(el("p", "note", `Tiền mặt: ${vnd(a.nav)}. Dự kiến lời/lỗ tính theo giá bán hôm nay.`));
  return out;
}
function select(w) {
  selected = w;
  $("actor-inv").setAttribute("aria-pressed", w === "inv"); $("actor-farm").setAttribute("aria-pressed", w === "farm");
}
document.querySelectorAll(".mind .tab").forEach((b) => b.onclick = () => {
  const w = b.closest(".mind").dataset.w; tabOf[w] = b.dataset.tab;
  b.parentNode.querySelectorAll(".tab").forEach((x) => x.setAttribute("aria-selected", x === b)); renderPane(w);
});

// ---------- Khung chat ----------
// Điện thoại: khung chat là nút tròn ở góc, bấm thì trượt lên, "Thu nhỏ" thì về nút; có số tin mới khi đang thu nhỏ.
const phone = matchMedia("(max-width: 980px)");
let unread = 0;
function setChat(open) {
  document.body.classList.toggle("chat-open", open);
  $("chat-fab").setAttribute("aria-expanded", open);
  if (open) { unread = 0; $("chat-badge").hidden = true; $("msgs").scrollTop = 1e9; }
}
$("chat-fab").onclick = () => setChat(true);
$("chat-close").onclick = () => setChat(false);
function addMsg(name, text, w, extra = "") {
  if (phone.matches && !document.body.classList.contains("chat-open")) {
    unread++; $("chat-badge").textContent = unread > 99 ? "99+" : unread; $("chat-badge").hidden = false;
  }
  const m = el("div", "msg" + (w ? " ai " + w : "") + (extra ? " " + extra : ""));
  m.append(el("span", "n", name), document.createTextNode(text));
  $("msgs").append(m);
  while ($("msgs").children.length > 150) $("msgs").firstChild.remove();
  $("msgs").scrollTop = 1e9;
}
document.querySelectorAll(".to button").forEach((b) => b.onclick = () => {
  to = b.dataset.to; document.querySelectorAll(".to button").forEach((x) => x.setAttribute("aria-pressed", x === b));
  $("compose").querySelector(".send").style.background = to === "inv" ? "var(--inv)" : "var(--farm)";
});
$("compose").onsubmit = async (e) => {
  e.preventDefault();
  const text = $("text").value.trim();
  if (!text) return;
  const sleeping = ["inv", "farm"].filter(asleep).map((w) => KEY[w]); // máy chủ bỏ qua AI đang ngủ
  const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent: KEY[to], name: $("name").value, text, asleep: sleeping }) });
  const data = await r.json().catch(() => ({ ok: false }));
  if (!data.ok) { addMsg("Hệ thống", data.error || data.detail || "Có lỗi, thử lại sau nhé.", null, "err"); return; }
  $("text").value = ""; // tin và câu trả lời về qua luồng trực tiếp
};
$("reacts").onclick = (e) => {
  const b = e.target.closest("button"); if (!b) return;
  const f = el("span", "float", b.dataset.e); f.style.left = (15 + Math.random() * 70) + "%";
  $("scene-" + selected).append(f); setTimeout(() => f.remove(), 2500); act3d(selected, "Wave");
  addMsg($("name").value.trim() || "Ẩn danh", `${b.dataset.e} thả cho ${NAME[selected]}`, null, "me");
};

// ---------- Bình chọn ----------
const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
const memo = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
function renderVotes(v) {
  const total = v.investor + v.farmer, pi = total ? Math.round(v.investor / total * 100) : 50;
  $("bar-inv").style.width = pi + "%"; $("bar-farm").style.width = (100 - pi) + "%";
  $("pct-inv").textContent = pi + "%"; $("pct-farm").textContent = (100 - pi) + "%";
  const mine = (memo("vote") || "").split("|");
  const voted = mine[0] === today() ? mine[1] : null;
  document.querySelectorAll("[data-vote]").forEach((b) => { b.disabled = !!voted; b.classList.toggle("mine", b.dataset.vote === voted); });
  $("vnote").textContent = voted ? `Bạn đã bầu ${NAME[voted]} · ${total} phiếu` : `${total} phiếu · 1 phiếu/người/ngày`;
}
document.querySelectorAll("[data-vote]").forEach((b) => b.onclick = async () => {
  const r = await (await fetch("/api/vote", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent: KEY[b.dataset.vote], name: $("name").value }) })).json().catch(() => null);
  if (!r) return;
  memo("vote", `${today()}|${r.ok ? b.dataset.vote : "?"}`);
  if (!r.ok) addMsg("Hệ thống", "Hôm nay bạn đã bầu rồi, mai bầu tiếp nhé.", null);
  renderVotes(r.tally);
});

// ---------- Quà tặng: chọn món → (Tâm linh: nhập số) → mã QR thật → chờ tiền về ----------
const polls = { inv: null, farm: null };
function closeBtn(w) { const x = el("button", "x", "×"); x.type = "button"; x.setAttribute("aria-label", "Đóng"); x.onclick = () => closeGift(w); return x; }
function closeGift(w) { clearInterval(polls[w]); const box = $("gift-" + w); box.hidden = true; box.replaceChildren(); }
function openGift(w) {
  clearInterval(polls[w]);
  const box = $("gift-" + w), a = state && state.agents[KEY[w]], saving = a && a.rescue;
  box.replaceChildren(); box.hidden = false;
  box.append(closeBtn(w), el("h4", "", (saving ? "Cứu đói " : "Ủng hộ ") + NAME[w]),
    el("p", "need", saving ? `Còn thiếu ${vnd(a.rescue.need_left)} · còn ${msOf(rescueLeft[w] || 0)}` : "Tiền ủng hộ cộng vào quỹ sống của nhân vật."));
  const opts = el("div", "gift-opts");
  for (const g of GIFTS) {
    const b = el("button", g.full ? "wide" : ""); b.type = "button"; b.append(el("b", "", g.full || g.name));
    if (g.note) b.append(el("small", "", g.note));
    b.append(el("span", "", vnd(g.price)));
    b.onclick = () => (g.k === "tamlinh" ? askNumber(w, g) : order(w, g)); opts.append(b);
  }
  const name = el("input"); name.id = "gift-name-" + w; name.maxLength = 30; name.placeholder = "Tên để AI cảm ơn (trống = ẩn danh)";
  name.value = $("name").value.trim(); name.setAttribute("aria-label", "Tên của bạn");
  box.append(opts, name, el("p", "fine", "Chuyển khoản thật qua mã QR. Ủng hộ giải trí, không hoàn lại, không chia lợi nhuận. Tiền ủng hộ mất theo kiếp nếu nhân vật đầu thai."));
}
function askNumber(w, gift) {
  const box = $("gift-" + w), giver = $("gift-name-" + w).value;
  box.replaceChildren();
  const input = el("input"); input.type = "number"; input.min = 1; input.max = 100; input.inputMode = "numeric"; input.placeholder = "Từ 1 đến 100"; input.setAttribute("aria-label", "Số bạn đang nghĩ");
  const err = el("p", "err"), acts = el("div", "acts"), back = el("button", "", "Chọn món khác"), ok = el("button", "paid", "Xác nhận");
  back.type = ok.type = "button"; back.onclick = () => openGift(w);
  ok.onclick = () => {
    const n = Number(input.value);
    if (!Number.isInteger(n) || n < 1 || n > 100) { err.textContent = "Nhập một số nguyên từ 1 đến 100 nhé."; input.focus(); return; }
    order(w, gift, n, giver);
  };
  input.onkeydown = (e) => { if (e.key === "Enter") ok.onclick(); };
  acts.append(back, ok);
  box.append(closeBtn(w), el("h4", "", gift.full), el("p", "need", gift.note), el("p", "ask", "Ngay lúc này bạn đang nghĩ đến số nào từ 1 đến 100?"), input, err, acts);
  input.focus();
}
async function order(w, gift, guess, giverName) {
  const box = $("gift-" + w), nameBox = $("gift-name-" + w);
  const giver = giverName !== undefined ? giverName : nameBox ? nameBox.value : "";
  const r = await fetch("/api/gift", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent: KEY[w], gift: gift.k, name: giver, guess: guess || null }) });
  const o = await r.json().catch(() => ({}));
  box.replaceChildren(closeBtn(w));
  if (!r.ok) { box.append(el("h4", "", gift.name), el("p", "err", o.detail || "Chưa tạo được đơn, thử lại sau nhé.")); return; }
  const rows = [["Món", gift.name]];
  if (guess) rows.push(["Số bạn nghĩ", String(guess)]);
  payBox(w, o, gift.name, rows, (v) => {
    box.replaceChildren(closeBtn(w), el("h4", "", "Đã nhận quà!"), el("p", "ok", `${NAME[w]} đã nhận ${gift.name.toLowerCase()} của bạn. Cảm ơn nhiều!`));
    if (v.lucky) showLuck(w, v.guess, v.lucky);
  });
}
// Mã QR chuyển khoản + chờ tiền về (dùng chung cho quà và mua đồ); tiền về thì gọi paid(v).
function payBox(w, o, title, extra, paid) {
  const box = $("gift-" + w);
  const qr = el("div", "qr"), img = el("img"); img.src = o.qr_url; img.alt = "Mã QR chuyển khoản " + vnd(o.amount);
  const dl = el("dl");
  const rows = [["Số tiền", vnd(o.amount)], ["Nội dung", `${o.transfer_text} · ${o.code}`], ["Chủ tài khoản", NAME[w]], ...extra];
  for (const [k, v] of rows) dl.append(el("dt", "", k), el("dd", "", v));
  qr.append(img, dl);
  const wait = el("p", "wait", "Quét mã bằng app ngân hàng. Giữ nguyên nội dung chuyển khoản để hệ thống nhận ra. Đang chờ tiền về...");
  box.append(el("h4", "", `${title} · ${vnd(o.amount)}`), qr, wait, el("p", "fine", "Ủng hộ giải trí, không hoàn lại, không chia lợi nhuận."));
  const started = Date.now();
  polls[w] = setInterval(async () => {
    if (Date.now() - started > 30 * 60 * 1000) { clearInterval(polls[w]); wait.textContent = "Hết thời gian chờ. Nếu đã chuyển, tiền vẫn được ghi nhận khi về."; return; }
    const v = await (await fetch("/api/gift/" + o.code)).json().catch(() => null);
    if (!v || v.status !== "paid") return;
    clearInterval(polls[w]);
    paid(v);
    act3d(w, "Wave");
    refresh();
  }, 3000);
}
// ---------- Người xem bấm vào đồ vật: AI rao giá cắt lỗ, bấm Mua thì chuyển khoản (kế hoạch 28/10/2026) ----------
async function openItem(w, id) {
  select(w); clearInterval(polls[w]);
  const box = $("gift-" + w);
  const r = await fetch(`/api/item?agent=${KEY[w]}&id=${encodeURIComponent(id)}`);
  if (!r.ok) return;
  const o = await r.json();
  box.replaceChildren(closeBtn(w)); box.hidden = false;
  const say = el("p", "ask", o.line);
  if (o.status !== "on_sale") {
    box.append(el("h4", "", o.name[0].toUpperCase() + o.name.slice(1)), say,
      el("p", "need", o.status === "held" ? "Đang có người trả tiền món này, bạn chờ chút nhé." : "Món này vừa có người mua mất rồi."));
    return;
  }
  const name = el("input"); name.id = "gift-name-" + w; name.maxLength = 30; name.placeholder = "Tên để AI cảm ơn (trống = ẩn danh)";
  name.value = $("name").value.trim(); name.setAttribute("aria-label", "Tên của bạn");
  const acts = el("div", "acts"), no = el("button", "", "Thôi"), yes = el("button", "paid", "Mua " + vnd(o.price));
  no.type = yes.type = "button"; no.onclick = () => closeGift(w); yes.onclick = () => buyItem(w, o, name.value);
  acts.append(no, yes);
  box.append(el("h4", "", `${o.name[0].toUpperCase() + o.name.slice(1)} · ${vnd(o.price)}`), say, name, acts,
    el("p", "fine", `Mua tượng trưng để ủng hộ ${NAME[w]}: món đồ biến mất khỏi khung, không giao hàng thật, không hoàn lại.`));
  act3d(w, "Wave");
}
async function buyItem(w, item, giver) {
  const box = $("gift-" + w);
  const r = await fetch("/api/item-order", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agent: KEY[w], item: item.id, name: giver }) });
  const o = await r.json().catch(() => ({}));
  box.replaceChildren(closeBtn(w));
  if (!r.ok) { box.append(el("h4", "", item.name), el("p", "err", o.detail || "Chưa tạo được đơn, thử lại sau nhé.")); return; }
  payBox(w, o, "Mua " + item.name, [["Món", item.name]], () => {
    box.replaceChildren(closeBtn(w), el("h4", "", "Đã mua!"), el("p", "ok", `Bạn đã mua ${item.name} của ${NAME[w]}. Cảm ơn nhiều!`));
  });
}
document.querySelectorAll("[data-donate]").forEach((b) => b.onclick = (e) => { e.stopPropagation(); openGift(b.dataset.donate); });
for (const w of ["inv", "farm"]) {
  const a = $("actor-" + w);
  a.onclick = () => { select(w); if (state && state.agents[KEY[w]].rescue && $("gift-" + w).hidden) openGift(w); };
  $("gift-" + w).onclick = (e) => e.stopPropagation(); // bấm trong bảng quà không mở lại bảng
  $("scene-" + w).addEventListener("pick", (e) => openItem(w, e.detail.id)); // bấm vào đồ vật trong cảnh 3D
  $("info-" + w).onclick = (e) => e.stopPropagation(); // bấm mục chọn, cuộn đọc không mở bảng quà
  a.onkeydown = (e) => { if (e.target === a && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); a.onclick(e); } };
}

// Hộp số tâm linh giữa màn hình, có pháo hoa; chỉ người vừa trả tiền thấy, đóng khi bấm Xác nhận.
let fwTimer = null;
function showLuck(w, guess, lucky) {
  $("luck-num").textContent = pad(lucky);
  $("luck-note").textContent = `Bạn nghĩ số ${guess}, ${NAME[w]} bốc cho bạn:`;
  $("luck").hidden = false; $("luck-ok").focus();
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) { clearInterval(fwTimer); fwTimer = fireworks($("fireworks")); }
}
// Có quà là bắn pháo hoa trong khung của nhân vật được tặng, mọi người xem đều thấy, tự tắt sau 4 giây.
function sceneFireworks(w) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const scene = $("scene-" + w), c = el("canvas", "scene-fw");
  scene.append(c);
  const t = fireworks(c, scene.clientWidth, scene.clientHeight);
  setTimeout(() => { clearInterval(t); c.remove(); }, 4000);
}
function fireworks(c, width = innerWidth, height = innerHeight) {
  const g = c.getContext("2d"), parts = [];
  c.width = width; c.height = height;
  const colors = ["#f5c542", "#f75a5e", "#22c55e", "#8b7cff", "#2ec4a6", "#ffffff"];
  const burst = () => {
    const x = c.width * (.15 + Math.random() * .7), y = c.height * (.15 + Math.random() * .35), col = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 46; i++) { const a = Math.PI * 2 * i / 46, s = 2 + Math.random() * 3.5; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 60 + Math.random() * 25, col }); }
  };
  burst(); burst();
  let tick = 0;
  const timer = setInterval(() => {
    if (++tick % 22 === 0) burst();
    g.clearRect(0, 0, c.width, c.height);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += .05; p.vx *= .985; p.life--;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      g.globalAlpha = Math.min(1, p.life / 40); g.fillStyle = p.col; g.fillRect(p.x, p.y, 3, 3);
    }
    g.globalAlpha = 1;
  }, 16);
  return timer;
}
$("luck-ok").onclick = () => { $("luck").hidden = true; clearInterval(fwTimer); const c = $("fireworks"); c.getContext("2d").clearRect(0, 0, c.width, c.height); };

// Một tin người xem có thể được cả hai AI đáp (cùng giờ): tin người xem chỉ hiện một lần.
let lastAsk = "";
function showChat(m) {
  const key = `${m.viewer_name}|${m.text}|${m.ts}`;
  if (key !== lastAsk) { addMsg(m.viewer_name || "Ẩn danh", m.text, null, "me"); lastAsk = key; }
  if (m.reply) addMsg(NAME[UI[m.agent]], m.reply, UI[m.agent]);
}
// Lời AI (cà khịa, kể khổ...) và cảnh báo của Hệ thống trên khung chat chung.
function chatLine(ev) {
  if (ev.agent === "system") return addMsg("Hệ thống", ev.text, null, "warn");
  const w = UI[ev.agent];
  addMsg(NAME[w], ev.text, w, ev.kind === "taunt" || ev.kind === "banter" ? "duel" : ev.kind === "rescue" || ev.kind === "sale" ? "beg" : "");
}
// Người vào sau xem được 30 tin chat gần nhất (kèm cà khịa, cảnh báo); nạp xong mới nghe luồng trực tiếp cho khỏi lộn thứ tự.
async function loadChat() {
  const list = await (await fetch("/api/chat")).json().catch(() => []);
  list.forEach((m) => (m.kind === "chat" ? showChat(m) : chatLine(m)));
  unread = 0; $("chat-badge").hidden = true; // tin cũ không tính là tin mới
}

// ---------- Có quà: bảng cảm ơn 1 phút trong khung nhân vật, kèm 5 giây nhạc vui ----------
// Nhạc do trình duyệt tự tạo (không tải file nhạc ngoài, không lo bản quyền). Trình duyệt chỉ cho phát tiếng
// sau khi người xem đã bấm vào trang ít nhất một lần; nút trên bảng tắt/bật nhạc và nhớ lựa chọn.
const TUNE = [72, 76, 79, 76, 77, 81, 79, 77, 76, 79, 84, 79, 74, 77, 79, 74,
  72, 76, 79, 84, 83, 81, 79, 77, 76, 74, 72, 76, 74, 71, 72, 72]; // nốt MIDI, mỗi nốt 1/4 giây
const MUSIC_SECONDS = 5; // chủ dự án dặn 28/10/2026: nhạc chỉ 5 giây, bảng cảm ơn vẫn 1 phút
let audio = null, music = null, muted = memo("muted") === "1";
addEventListener("pointerdown", () => {
  try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); } catch (e) { audio = null; }
}, { passive: true });
function stopMusic() { if (music) { music.disconnect(); music = null; } }
function note(m, t, len, type, out) {
  const o = audio.createOscillator(), g = audio.createGain();
  o.type = type; o.frequency.value = 440 * 2 ** ((m - 69) / 12);
  g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
  o.connect(g).connect(out); o.start(t); o.stop(t + len);
}
function playMusic(seconds) {
  stopMusic();
  if (!audio || muted) return;
  const start = audio.currentTime + 0.05, beat = 0.25, out = audio.createGain();
  out.gain.setValueAtTime(0.0001, start); out.gain.exponentialRampToValueAtTime(0.07, start + 0.3);
  out.gain.setValueAtTime(0.07, start + seconds - 1.5); out.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
  out.connect(audio.destination); music = out;
  for (let i = 0; i * beat < seconds; i++) {
    const t = start + i * beat, m = TUNE[i % TUNE.length];
    note(m, t, beat * 0.9, "triangle", out);
    if (i % 4 === 0) note(m - 24, t, beat * 3.6, "sine", out);
  }
}
function giftBoard(w, text) {
  const scene = $("scene-" + w), old = scene.querySelector(".gift-board");
  if (old) { clearTimeout(old._t); old.remove(); }
  const b = el("div", "gift-board"), btn = el("button", "mute", muted ? "Bật nhạc" : "Tắt nhạc");
  b.setAttribute("role", "status");
  btn.type = "button";
  btn.onclick = (e) => {
    e.stopPropagation(); muted = !muted; memo("muted", muted ? "1" : "0");
    btn.textContent = muted ? "Bật nhạc" : "Tắt nhạc";
    if (muted) stopMusic(); else playMusic(MUSIC_SECONDS);
  };
  b.append(el("span", "note", "♪"), el("p", "", text), btn);
  scene.append(b);
  playMusic(MUSIC_SECONDS);
  b._t = setTimeout(() => b.remove(), 60000);
}

// ---------- Luồng trực tiếp ----------
const ACT = { gift: "Wave", saved: "Wave", shop: "Wave", vote: "Wave", rescue: "HitRecieve", sale: "HitRecieve", incident: "HitRecieve", baoke: "HitRecieve" };
function listen() {
  const src = new EventSource("/api/stream");
  src.onmessage = (msg) => {
    const ev = JSON.parse(msg.data), w = UI[ev.agent];
    if (ev.agent === "system") { chatLine(ev); return; }
    if (!w) return;
    if (ev.kind === "doing") { $("doing-" + w).textContent = ev.text; return; }
    if (ev.kind === "chat") { showChat(ev); return; }
    latest[w].push(ev.text);
    if (latest[w].length > 5) latest[w].shift();
    if (CHAT_KINDS.has(ev.kind) && !asleep(w)) chatLine(ev);
    if (ACT[ev.kind]) act3d(w, ACT[ev.kind]);
    if (ev.kind === "gift") { sceneFireworks(w); giftBoard(w, ev.text); }
    if (ev.kind === "death") act3d(w, "Death", "hold");
    if (ev.kind !== "diary") addMind(w, ev);
    if (!["idle", "banter", "taunt", "vote"].includes(ev.kind)) refresh();
  };
}

setInterval(() => {
  if (checkLeft !== null) { checkLeft -= speed; renderCountdown(); }
  for (const w of ["inv", "farm"]) if (rescueLeft[w] !== null) { rescueLeft[w] = Math.max(0, rescueLeft[w] - speed); renderSos(w); }
}, 1000);
setInterval(refresh, 30000);
$("theme").onclick = () => { const r = document.documentElement; r.dataset.theme = r.dataset.theme === "light" ? "dark" : "light"; };
refresh().then(() => { select("inv"); speak("inv"); });
// Cảnh 3D nạp sau trang: nạp xong thì áp đồ đạc và thời tiết ngay, khỏi chờ lần làm mới kế tiếp.
window.addEventListener("load", () => { if (state) { syncScene("inv", state.agents.investor); syncScene("farm", state.agents.farmer); } });
loadChat().finally(listen);
