// Cảnh 3D của bản phác thảo: văn phòng Bảy Gà (+ toàn cảnh thành phố khi ngủ đêm), trang trại Vi Cá (+ trong nhà khi ngủ).
// Nhân vật là mẫu CC0 của Quaternius (xem models/NGUON.md); ngồi/nằm do code tự bẻ khớp vì mẫu không có sẵn động tác này.
// Ngày/đêm: 1 ngày trong cảnh = 1 giờ thật; thời tiết chỉ áp cho trang trại (trang web xoay vòng, có thiên tai thì hiện thiên tai).
import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const PROPS = {}, CHARS = {}, VIEWS = {};
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const rand = (a, b) => a + Math.random() * (b - a);
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .85, ...extra });
function mesh(geo, color, x, y, z, parent, extra) {
  const m = new THREE.Mesh(geo, color instanceof THREE.Material ? color : mat(color, extra));
  m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
}
const box = (w, h, d, color, x, y, z, parent, extra) => mesh(new THREE.BoxGeometry(w, h, d), color, x, y, z, parent, extra);
const cyl = (rt, rb, h, color, x, y, z, parent, seg = 10, extra) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), color, x, y, z, parent, extra);
const ball = (r, color, x, y, z, parent, extra) => mesh(new THREE.IcosahedronGeometry(r, 0), color, x, y, z, parent, extra);
function prop(parent, props, id, visible = true) { const g = new THREE.Group(); g.visible = visible; parent.add(g); props[id] = g; return g; }
function canvasTex(w, h, draw) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.canvas = c; return t;
}

// ---------- Giờ và thời tiết ----------
const WORLD = { hour: null, weather: "clear" };
// Giờ trong cảnh: mỗi giờ thật chạy đủ 24 giờ. Tính theo đồng hồ chung nên mọi người xem cùng thấy một giờ.
const DAY_MS = 60 * 60 * 1000;
function gameHour(now = Date.now()) { return (now % DAY_MS) / DAY_MS * 24; }
// Số phút thật còn lại tới giờ `wake` trong cảnh.
function realMinutesUntil(wake) { return Math.max(1, Math.ceil(((wake - hourNow() + 24) % 24) / 24 * 60)); }
function hourNow() {
  if (WORLD.hour !== null) return WORLD.hour;
  return gameHour(); // 1 ngày trong cảnh = 1 giờ thật (chủ dự án quyết 27/10/2026)
}
// 0 = đêm, 1 = ban ngày. Chủ dự án dặn 28/10/2026: ban ngày khung phải sáng màu, chỉ buổi tối mới tối:
// sáng hẳn 6–18 giờ, chập tối 18–20 giờ, tối hẳn 20–5 giờ, rạng sáng 5–6 giờ.
function daylight(h) {
  if (h >= 6 && h <= 18) return 1;
  if (h > 5 && h < 6) return h - 5;
  if (h > 18 && h < 20) return (20 - h) / 2;
  return 0;
}
// Buổi trong ngày, hiện trên khung mỗi nhân vật.
function partOfDay(h) {
  return h >= 5 && h < 11 ? "Sáng" : h >= 11 && h < 13 ? "Trưa" : h >= 13 && h < 18 ? "Chiều" : h >= 18 && h < 22 ? "Tối" : "Đêm";
}
const C = (hex) => new THREE.Color(hex);
const SKY = { night: C(0x0b1230), dusk: C(0xf09a5b), day: C(0x8fd0ff), rain: C(0x707d8a), heat: C(0xf6d98a) };
const OFFICE_DAY = C(0xdcd8e6), OFFICE_NIGHT = C(0x221d33); // nền quanh văn phòng Bảy Gà
function skyColor(h, weather) {
  const d = daylight(h), dusk = d > 0 && d < 1 ? 1 - Math.abs(d - .5) * 2 : 0;
  const c = SKY.night.clone().lerp(SKY.day, d).lerp(SKY.dusk, dusk * .6);
  if (weather === "rain" || weather === "flood") c.lerp(SKY.rain, .65 * Math.max(.3, d));
  if (weather === "wind") c.lerp(SKY.rain, .3 * d);
  if (weather === "heat") c.lerp(SKY.heat, .55 * d);
  return c;
}

// ---------- Nhân vật ----------
const MODEL = { inv: "/static/models/ba-ga.glb", farm: "/static/models/vi-ca.glb" }, HEIGHT = 2.4, K = HEIGHT / 2;
const loader = new GLTFLoader();
function scarfTexture() { // khăn rằn: caro đen trắng
  const t = canvasTex(64, 64, (g) => { g.fillStyle = "#f2efe6"; g.fillRect(0, 0, 64, 64); g.fillStyle = "#1c1c1c"; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2 === 0) g.fillRect(i * 8, j * 8, 8, 8); });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, .6); return t;
}
function makeCharacter(kind) {
  const root = new THREE.Group(), top = new THREE.Object3D(); top.position.y = HEIGHT + .3; root.add(top); // điểm neo bong bóng
  const ch = { kind, root, top, model: null, mixer: null, actions: {}, cur: null, busy: 0, hold: false, bones: {}, pose: null, poseY: 0, hipY: 1 };
  loader.load(MODEL[kind], (gltf) => {
    const model = gltf.scene;
    model.traverse((o) => {
      if (o.isBone) ch.bones[o.name] = o;
      if (!o.isMesh) return;
      o.castShadow = true; o.receiveShadow = true;
      o.material.metalness = 0; o.material.roughness = .8; // mẫu gốc hơi kim loại nên tối khi không có ánh phản chiếu
      if (o.material.name === "Tie") o.material.color.set(0xd62f3a); // cà vạt đỏ
      if (o.material.name === "Suit") o.material.color.set(0x3d3a8c); // vest tím than
      if (o.name === "Farmer_Head_2" || o.name === "Farmer_Head_4") o.visible = false; // bỏ mũ cao bồi của mẫu gốc
    });
    // Đo theo xương đỉnh đầu (hộp bao của mẫu có xương đo không chuẩn), đưa về cao khoảng HEIGHT.
    model.updateMatrixWorld(true);
    model.scale.multiplyScalar((HEIGHT - .12) / model.getObjectByName("Head_end").getWorldPosition(new THREE.Vector3()).y);
    root.add(model); root.updateMatrixWorld(true);
    ch.model = model;
    ch.hipY = root.worldToLocal(ch.bones.Hips.getWorldPosition(new THREE.Vector3())).y;
    // Phụ kiện đặt theo tư thế gốc rồi gắn vào xương đầu (attach giữ nguyên vị trí) để đi theo đầu khi cúi, quay, nằm.
    const gear = new THREE.Group(); root.add(gear); root.updateMatrixWorld(true);
    const hb = root.worldToLocal(ch.bones.Head.getWorldPosition(new THREE.Vector3())); // gốc xương đầu (cổ)
    if (kind === "inv") { // kính gọng đen
      for (const s of [-1, 1]) { const r = mesh(new THREE.TorusGeometry(.04 * K, .008 * K, 6, 18), 0x111111, s * .05 * K, hb.y + .112 * K, hb.z + .175 * K, gear); r.castShadow = false; }
      box(.022 * K, .008 * K, .008 * K, 0x111111, 0, hb.y + .112 * K, hb.z + .175 * K, gear);
    } else { // khăn rằn quấn đầu kiểu nông dân miền Tây, nút thắt và đuôi khăn sau gáy
      const cloth = new THREE.MeshStandardMaterial({ map: scarfTexture(), roughness: .9 });
      const band = mesh(new THREE.TorusGeometry(.13 * K, .03 * K, 8, 24), cloth, 0, hb.y + .2 * K, hb.z + .01 * K, gear); band.rotation.x = Math.PI / 2;
      const cap = mesh(new THREE.SphereGeometry(.135 * K, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), cloth, 0, hb.y + .2 * K, hb.z + .005 * K, gear); cap.scale.y = .6;
      mesh(new THREE.SphereGeometry(.045 * K, 8, 6), cloth, .12 * K, hb.y + .21 * K, hb.z + .06 * K, gear); // nút thắt bên hông
      for (const s of [-1, 1]) { const tail = box(.05 * K, .13 * K, .012 * K, cloth, .145 * K, hb.y + .15 * K, hb.z + .06 * K + s * .03 * K, gear); tail.rotation.set(0, Math.PI / 2, s * .35); }
    }
    ch.bones.Head.attach(gear); ch.bones.Head.attach(top); // bong bóng bám theo đầu, kể cả lúc nằm
    ch.mixer = new THREE.AnimationMixer(model);
    for (const clip of gltf.animations) ch.actions[clip.name.split("|").pop()] = ch.mixer.clipAction(clip);
    play(ch, "Idle");
  }, undefined, (err) => console.error("Không nạp được mẫu nhân vật", MODEL[kind], err));
  return ch;
}
// Đổi động tác mượt: mờ dần động tác cũ, hiện dần động tác mới trong 0,25 giây.
function play(ch, name, once = false) {
  const next = ch.actions[name]; if (!next || (ch.cur === next && !once)) return 0;
  next.reset(); next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity); next.clampWhenFinished = once; next.timeScale = 1;
  next.fadeIn(.25).play(); if (ch.cur && ch.cur !== next) ch.cur.fadeOut(.25);
  ch.cur = next;
  return next.getClip().duration;
}
// Ngồi: bẻ đùi ra trước, gập gối xuống, hạ người xuống mặt ghế. Nằm: đặt cả người nằm ngửa trên giường/võng.
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qc = new THREE.Quaternion(), va = new THREE.Vector3();
function bend(ch, name, angle) {
  const b = ch.bones[name]; if (!b) return;
  b.parent.getWorldQuaternion(qa); ch.root.getWorldQuaternion(qb);
  va.set(1, 0, 0).applyQuaternion(qb).applyQuaternion(qa.invert()); // trục ngang của nhân vật, tính trong hệ của xương cha
  b.quaternion.premultiply(qc.setFromAxisAngle(va, angle)); b.updateMatrixWorld(true);
}
function applyPose(ch) {
  const m = ch.model; if (!m) return;
  m.rotation.set(0, 0, 0); m.position.set(0, 0, 0);
  if (ch.pose === "sit") {
    ch.root.updateMatrixWorld(true);
    for (const s of ["L", "R"]) { bend(ch, "UpperLeg." + s, -1.45); bend(ch, "LowerLeg." + s, 1.5); }
    m.position.set(0, ch.poseY - ch.hipY + .1 * K, 0);
  } else if (ch.pose === "lie") {
    m.rotation.x = -Math.PI / 2; m.position.set(0, ch.poseY + .16 * K, HEIGHT / 2 - .15);
  }
}

// ---------- Hành vi: đi làm, ngồi nghỉ, ngủ theo giờ ----------
// Mỗi điểm: { x, z, face, job (động tác), pose ("sit"/"lie"), y (mặt ghế/giường), dur [giây], until (giữ tới khi hết giờ), enter (vào nhà) }
function makeBrain(ch, world, view) {
  let target = null, state = "go", timer = 0, speed = 0;
  const turn = (want, k) => { ch.root.rotation.y += Math.atan2(Math.sin(want - ch.root.rotation.y), Math.cos(want - ch.root.rotation.y)) * Math.min(1, k); };
  function choose() {
    const h = hourNow();
    if (world.sleepAt(h)) return world.sleep;
    if (world.napAt && world.napAt(h)) return world.nap;
    const rests = world.rests.filter((r) => !r.ok || r.ok());
    if (rests.length && Math.random() < .22) return pick(rests);
    return pick(world.spots.filter((s) => s !== target && (!s.ok || s.ok())));
  }
  function standUp() {
    if (ch.pose === "lie" && target && target.lieOut) ch.root.position.set(target.lieOut[0], 0, target.lieOut[1]);
    ch.pose = null;
    if (view.inside) view.exit();
  }
  const brain = {
    get asleep() { return state === "do" && !!target && (target === world.sleep || target === world.nap); },
    get napping() { return this.asleep && target === world.nap; },
    wake() { if (state === "do") standUp(); state = "go"; target = choose(); },
    update(dt) {
      if (!ch.model) return;
      if (!target) target = choose();
      ch.mixer.update(dt);
      if (ch.busy > 0 || ch.hold) { // động tác sự kiện (vẫy tay, ôm đầu, ngã): đứng dậy nếu đang ngồi/nằm, quay mặt ra người xem
        if (ch.pose && ch.hold) { standUp(); state = "go"; }
        ch.busy -= dt; speed = 0; if (!ch.pose) turn(world.camFace, dt * 4);
        if (ch.busy <= 0 && !ch.hold) play(ch, state === "do" ? (target.job || "Idle") : "Walk");
      } else if (state === "go") {
        const dx = target.x - ch.root.position.x, dz = target.z - ch.root.position.z, d = Math.hypot(dx, dz);
        if (d > .06) {
          speed = Math.min(1.5, speed + dt * 2.5, d * 1.6); // tăng tốc khi bắt đầu đi, giảm tốc khi gần tới
          ch.root.position.x += dx / d * dt * speed; ch.root.position.z += dz / d * dt * speed;
          turn(Math.atan2(dx, dz), dt * 8); play(ch, "Walk"); if (ch.cur) ch.cur.timeScale = Math.max(.5, speed / 1.5);
        } else { // tới nơi
          speed = 0; state = "do"; ch.root.position.set(target.x, 0, target.z); ch.root.rotation.y = target.face;
          timer = target.dur ? rand(...target.dur) : rand(4, 8);
          if (target.enter) view.enter(target);
          if (target.lieAt && !target.enter) { ch.root.position.set(target.lieAt[0], 0, target.lieAt[1]); ch.root.rotation.y = target.lieFace; }
          ch.pose = target.pose || null; ch.poseY = target.y || 0;
          play(ch, target.job || "Idle");
        }
      } else { // đang làm việc / ngồi / ngủ tại chỗ
        timer -= dt;
        const h = hourNow();
        const done = target.until ? !target.until(h) : timer < 0;
        if (done || (target.ok && !target.ok())) { standUp(); state = "go"; target = choose(); }
      }
      applyPose(ch);
    },
  };
  return brain;
}

// ---------- Trang trại Vi Cá ----------
function farmWorld(scene) {
  const props = {}, sway = [], drops = [];
  scene.fog = new THREE.Fog(0x8fd0ff, 30, 70);
  // Đất, ruộng lúa và hàng cây phía xa để cảnh kín khung hình
  box(140, .2, 140, 0x6aa84f, 0, -.1, 0, scene);
  for (let i = 0; i < 6; i++) box(9, .05, 7, i % 2 ? 0x8cc152 : 0x7cb342, -12 + (i % 3) * 9.5, .01, -14 - Math.floor(i / 3) * 7.5, scene);
  for (let i = 0; i < 4; i++) box(7, .05, 9, i % 2 ? 0x9ccc65 : 0x7cb342, -16 - Math.floor(i / 2) * 7.5, .01, -2 + (i % 2) * 9.5, scene);
  const far = new THREE.InstancedMesh(new THREE.ConeGeometry(.9, 3, 6), mat(0x2f6b33), 60);
  const mx = new THREE.Matrix4();
  for (let i = 0; i < 60; i++) { const a = i < 30 ? [-30 + i * 2.2, rand(-27, -24)] : [rand(-31, -28), -24 + (i - 30) * 2]; mx.makeTranslation(a[0], 1.4, a[1]); far.setMatrixAt(i, mx); }
  scene.add(far);
  // Con kênh phía trước, xuồng ba lá và cầu khỉ
  const water = mat(0x4f9cc4, { roughness: .25, transparent: true, opacity: .9 });
  box(140, .1, 2.6, water, 0, -.02, 7.6, scene); box(140, .25, .3, 0x7a5a36, 0, .02, 6.2, scene);
  const boat = new THREE.Group(); scene.add(boat); boat.position.set(2.5, .08, 7.7);
  box(2.4, .22, .5, 0x6b4423, 0, 0, 0, boat); for (const s of [-1, 1]) { const tip = box(.6, .22, .36, 0x6b4423, s * 1.35, .05, 0, boat); tip.rotation.z = s * -.35; }
  const bridge = new THREE.Group(); scene.add(bridge); bridge.position.set(-6, 0, 7.6);
  const pole = cyl(.05, .05, 3.6, 0x9b7a45, 0, .9, 0, bridge, 6); pole.rotation.x = Math.PI / 2;
  const rail = cyl(.03, .03, 3.6, 0x9b7a45, .25, 1.8, 0, bridge, 6); rail.rotation.x = Math.PI / 2;
  for (const z of [-1.2, 0, 1.2]) for (const s of [-1, 1]) { const leg = cyl(.04, .04, 1.4, 0x8a6a3a, 0, .55, z, bridge, 6); leg.rotation.x = s * .4; }
  // Vườn rau: 4 luống, mỗi luống một loại rau, có hàng rào tre
  const beds = [[0x4caf50, "ball"], [0x9ccc65, "big"], [0x388e3c, "chili"], [0x7cb342, "cone"]];
  beds.forEach(([c, kind], i) => { // mỗi luống là một món người xem mua được (rau1..rau4)
    const z = .8 + i * .9, row = prop(scene, props, "rau" + (i + 1)); box(3.6, .2, .6, 0x6b4a2b, 3.6, .1, z, row);
    for (let j = 0; j < 7; j++) {
      const x = 2.1 + j * .5;
      if (kind === "ball") ball(.16, c, x, .32, z, row);
      else if (kind === "big") { ball(.22, c, x, .34, z, row); ball(.12, 0xdcedc8, x, .48, z, row); }
      else if (kind === "chili") { ball(.14, c, x, .32, z, row); ball(.04, 0xd62f2f, x + .08, .38, z + .05, row); ball(.04, 0xd62f2f, x - .06, .4, z - .04, row); }
      else mesh(new THREE.ConeGeometry(.06, .45, 5), c, x, .42, z, row);
    }
  });
  for (let i = 0; i <= 9; i++) { cyl(.04, .04, .8, 0xb08d57, 1.5 + i * .47, .4, .2, scene, 5); cyl(.04, .04, .8, 0xb08d57, 1.5 + i * .47, .4, 4.1, scene, 5); }
  for (const z of [.2, 4.1]) { const r = cyl(.025, .025, 4.3, 0xb08d57, 3.6, .6, z, scene, 5); r.rotation.z = Math.PI / 2; }
  // Ao cá: bờ đất, bông súng, cá quẫy
  const pond = cyl(2.2, 2.2, .06, water, 3.6, .03, -3, scene, 36); pond.receiveShadow = true;
  const bank = mesh(new THREE.TorusGeometry(2.25, .12, 6, 36), 0x7a5a36, 3.6, .05, -3, scene); bank.rotation.x = Math.PI / 2;
  for (const [x, z] of [[2.6, -3.6], [4.3, -2.2], [4.6, -3.8], [3, -2.1]]) {
    cyl(.28, .28, .02, 0x3f8f3f, x, .08, z, scene, 10);
    if (Math.random() < .6) mesh(new THREE.ConeGeometry(.09, .18, 6), 0xf06fa4, x + .05, .17, z, scene);
  }
  const fish = mesh(new THREE.ConeGeometry(.12, .4, 6), 0xf5a442, 3.6, .12, -3, scene); fish.rotation.z = Math.PI / 2;
  props.ca = fish;
  // Nhà lá: vách tre, mái lá, cửa, cửa sổ, hiên có ghế đẩu
  const house = new THREE.Group(); scene.add(house); house.position.set(-4.2, 0, -3.6);
  box(3.6, .25, 2.8, 0x8d6e47, 0, .12, 0, house);
  const wall = mat(0xc8a26a);
  box(3.4, 2, .12, wall, 0, 1.25, -1.3, house); box(.12, 2, 2.6, wall, -1.7, 1.25, 0, house); box(.12, 2, 2.6, wall, 1.7, 1.25, 0, house);
  box(1.1, 2, .12, wall, -1.15, 1.25, 1.3, house); box(1.1, 2, .12, wall, 1.15, 1.25, 1.3, house); box(1.2, .55, .12, wall, 0, 1.98, 1.3, house);
  const doorway = box(1.2, 1.5, .05, 0x2a1d10, 0, .98, 1.33, house);
  const winMat = mat(0x3a2a16, { emissive: 0xffb347, emissiveIntensity: 0 });
  box(.7, .5, .05, winMat, -1.15, 1.5, 1.37, house);
  for (const s of [-1, 1]) { const r = box(4.2, .1, 1.9, 0x9c7b3c, 0, 2.62, s * .82, house); r.rotation.x = s * .55; }
  box(4.3, .12, .14, 0x7a5c2a, 0, 3.12, 0, house);
  const porch = box(3.6, .06, 1.2, 0xa88655, 0, .28, 1.95, house); porch.rotation.x = 0;
  const awning = box(3.8, .08, 1.4, 0x9c7b3c, 0, 2.15, 2.05, house); awning.rotation.x = -.18;
  for (const x of [-1.7, 1.7]) cyl(.06, .06, 1.9, 0x7a5c2a, x, 1.2, 2.6, house, 6);
  props.ghe = cyl(.25, .22, .45, 0x8a5a2b, 1.0, .5, 2.1, house, 8); // ghế đẩu
  // Cây quanh nhà: xoài, mít, dừa, chuối (bán được khi cứu đói), thêm vài cây dừa không bán
  function coconut(parent, x, z, hgt = 4.2) {
    const g = new THREE.Group(); parent.add(g); g.position.set(x, 0, z);
    for (let i = 0; i < 6; i++) cyl(.13, .15, hgt / 6 + .02, 0x8b6b45, i * .06, hgt / 12 + i * hgt / 6, 0, g, 6);
    const crown = new THREE.Group(); crown.position.set(.36, hgt, 0); g.add(crown); sway.push(crown);
    for (let i = 0; i < 7; i++) { const leaf = box(1.6, .03, .35, 0x3d8b37, .7, 0, 0, crown); leaf.geometry.translate(0, 0, 0); const p = new THREE.Group(); p.rotation.set(0, i / 7 * Math.PI * 2, -.45); crown.add(p); p.add(leaf); }
    ball(.12, 0x6b4a2b, .3, hgt - .1, .1, g); ball(.12, 0x6b4a2b, .42, hgt - .12, -.1, g);
    return g;
  }
  function roundTree(parent, x, z, color, fruit) {
    const g = new THREE.Group(); parent.add(g); g.position.set(x, 0, z);
    cyl(.18, .24, 1.6, 0x6b4a2b, 0, .8, 0, g, 7);
    const crown = new THREE.Group(); crown.position.y = 2.1; g.add(crown); sway.push(crown);
    ball(1.05, color, 0, 0, 0, crown); ball(.7, color, .6, -.2, .3, crown); ball(.65, color, -.55, -.15, -.25, crown);
    if (fruit) for (let i = 0; i < 5; i++) mesh(new THREE.SphereGeometry(.13, 6, 5), fruit, rand(-.8, .8), rand(-.9, -.4), rand(.3, .9), crown);
    return g;
  }
  function banana(parent, x, z) {
    const g = new THREE.Group(); parent.add(g); g.position.set(x, 0, z);
    cyl(.14, .18, 1.8, 0x7fa650, 0, .9, 0, g, 7);
    const crown = new THREE.Group(); crown.position.y = 1.8; g.add(crown); sway.push(crown);
    for (let i = 0; i < 6; i++) { const p = new THREE.Group(); p.rotation.set(0, i / 6 * Math.PI * 2, -.6); crown.add(p); box(1.3, .02, .45, 0x5fb246, .6, 0, 0, p); }
    return g;
  }
  roundTree(prop(scene, props, "xoai"), -7.2, -4.2, 0x2f7d3a, 0xc7d64a);
  roundTree(prop(scene, props, "mit"), -6.8, 4.3, 0x3b8a3e, 0x9fbf3b);
  coconut(prop(scene, props, "dua"), 7.4, -4.6);
  banana(prop(scene, props, "chuoi"), .4, 5.2);
  roundTree(scene, -3.4, 4.3, 0x357a3a); // cây bạch đàn để mắc võng
  coconut(scene, 8.3, -.8, 4.6); coconut(scene, 8.6, 1.8, 3.9); coconut(scene, -8.6, .6, 4.4);
  // Võng mắc giữa cây mít và cây bạch đàn
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-6.6, 1.5, 4.3), new THREE.Vector3(-5.1, .3, 4.3), new THREE.Vector3(-3.6, 1.5, 4.3));
  const hammock = mesh(new THREE.TubeGeometry(curve, 20, .2, 6), 0xd94f4f, 0, 0, 0, scene); hammock.scale.z = 1;
  props.vong = hammock;
  // Chuồng gà và gà
  const coop = new THREE.Group(); scene.add(coop); coop.position.set(-1.6, 0, 3.8);
  box(1.4, .9, 1, 0xa0522d, 0, .55, 0, coop); const cr = box(1.6, .08, 1.2, 0x7a2e1f, 0, 1.1, 0, coop); cr.rotation.x = .2;
  const chickens = [];
  for (let i = 0; i < 4; i++) {
    const c = new THREE.Group();
    ball(.17, 0xfafafa, 0, .2, 0, c); box(.05, .08, .1, 0xe03131, 0, .38, .06, c);
    c.position.set(rand(-2.8, -.4), 0, rand(1.8, 3)); scene.add(c); props["ga" + (i + 1)] = c;
    chickens.push({ g: c, tx: c.position.x, tz: c.position.z, wait: Math.random() * 2 });
  }
  // Đồ sắm khi có lời
  const lantern = prop(house, props, "lantern", false); box(.18, .3, .18, 0xffc94d, -.9, 1.75, 2.5, lantern, { emissive: 0xff9a1f, emissiveIntensity: .8 });
  const radio = prop(house, props, "radio", false); box(.5, .3, .2, 0x8b2f2f, 1.0, .88, 2.1, radio); box(.3, .03, .02, 0xdddddd, 1.0, 1.06, 2.1, radio);
  const ducks = prop(scene, props, "ducks", false);
  for (const [x, z] of [[2.4, -2.6], [2.75, -2.35]]) { ball(.16, 0x3b3b3b, x, .18, z, ducks); ball(.08, 0x2e7d32, x, .34, z + .1, ducks); }
  // Đèn, đom đóm, mưa, lũ
  const lamp = new THREE.PointLight(0xffb45a, 0, 9); lamp.position.set(-4.2, 2.2, -1.4); scene.add(lamp);
  const flies = new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 30 }, () => new THREE.Vector3(rand(-8, 8), rand(.5, 2.5), rand(-5, 6)))), new THREE.PointsMaterial({ color: 0xd8ff6a, size: .12, transparent: true }));
  scene.add(flies);
  const rainGeo = new THREE.BufferGeometry(), N = 700, pos = new Float32Array(N * 6);
  for (let i = 0; i < N; i++) { const x = rand(-12, 12), y = rand(0, 12), z = rand(-8, 10); pos.set([x, y, z, x, y - .45, z], i * 6); drops.push(i); }
  rainGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xcfe3f5, transparent: true, opacity: .55 })); scene.add(rain);
  const flood = box(140, .1, 140, mat(0x7b8a74, { roughness: .3, transparent: true, opacity: .85 }), 0, -.4, 0, scene);
  let floodY = -.4;
  return {
    props, camFace: .66,
    // Điểm làm việc: luống rau, ao, chuồng gà, bờ kênh
    spots: [
      { x: 1, z: 1.9, face: Math.PI / 2, job: "Interact" }, { x: 6.1, z: 2.6, face: -Math.PI / 2, job: "Interact" },
      { x: 1, z: -2.4, face: 1.75, job: "Interact" }, { x: -1.6, z: 2.5, face: 0, job: "Interact" }, { x: .8, z: 5.6, face: 0, job: "Idle" },
    ],
    rests: [{ x: -3.2, z: -1.5, face: .3, pose: "sit", y: .73, dur: [10, 16] }],
    nap: { x: -5.1, z: 3.4, face: 0, pose: "lie", y: .32, until: (h) => h >= 12 && h < 13, lieAt: [-5.1, 4.3], lieFace: -Math.PI / 2, lieOut: [-5.1, 3.4] },
    sleep: { x: -4.2, z: -1.4, face: Math.PI, enter: true, pose: "lie", y: .6, until: (h) => h >= 21 || h < 5, lieAt: [0, -.2], lieFace: Math.PI / 2, lieOut: [-4.2, -1.4] },
    sleepAt: (h) => h >= 21 || h < 5, napAt: (h) => h >= 12 && h < 13,
    tick(t, dt) {
      const h = hourNow(), w = WORLD.weather, day = daylight(h), sky = skyColor(h, w);
      scene.background = sky; scene.fog.color.copy(sky);
      VIEWS.farm.sun.intensity = (.15 + 1.6 * day) * (w === "rain" || w === "flood" ? .45 : w === "heat" ? 1.3 : 1);
      VIEWS.farm.hemi.intensity = .35 + .8 * day;
      const night = day < .3; lamp.intensity = night ? 2.2 : 0; winMat.emissiveIntensity = night ? .9 : 0;
      flies.visible = night && w !== "rain"; flies.material.opacity = .5 + .5 * Math.sin(t * 6);
      const windy = w === "wind" ? 1 : w === "rain" || w === "flood" ? .45 : .12;
      sway.forEach((c, i) => { c.rotation.z = Math.sin(t * (1.4 + windy * 2) + i) * .06 * (1 + windy * 3); c.rotation.x = Math.cos(t * 1.1 + i) * .03 * (1 + windy * 2); });
      rain.visible = w === "rain" || w === "flood";
      if (rain.visible) {
        const p = rainGeo.attributes.position.array, slant = windy > .5 ? .25 : .05;
        for (let i = 0; i < N; i++) { const k = i * 6; p[k + 1] -= dt * 14; p[k + 4] -= dt * 14; p[k] += slant * dt * 10; p[k + 3] += slant * dt * 10;
          if (p[k + 1] < 0) { const x = rand(-12, 12), z = rand(-8, 10); p.set([x, 12, z, x - slant, 11.55, z], k); } }
        rainGeo.attributes.position.needsUpdate = true;
      }
      floodY += ((w === "flood" ? .32 : -.4) - floodY) * Math.min(1, dt * .6); flood.position.y = floodY; flood.visible = floodY > -.35;
      fish.position.set(3.6 + Math.cos(t * .8) * 1.3, .12 + Math.max(0, Math.sin(t * 3)) * (Math.sin(t * .37) > .9 ? .5 : 0), -3 + Math.sin(t * .8) * 1.3); fish.rotation.y = -t * .8;
      boat.position.y = .08 + Math.sin(t * 1.6) * .04; boat.rotation.z = Math.sin(t * 1.2) * .03;
      for (const c of chickens) {
        const dx = c.tx - c.g.position.x, dz = c.tz - c.g.position.z, d = Math.hypot(dx, dz);
        if (d < .05) { c.wait -= dt; if (c.wait < 0) { c.tx = rand(-2.8, -.4); c.tz = rand(1.8, 3); c.wait = 1 + Math.random() * 2; } }
        else { c.g.position.x += dx / d * dt * .6; c.g.position.z += dz / d * dt * .6; c.g.rotation.y = Math.atan2(dx, dz); c.g.position.y = Math.abs(Math.sin(t * 14)) * .05; }
      }
    },
  };
}
// Trong nhà Vi Cá: giường tre có mùng, đèn dầu, lu nước, bàn thờ, cửa sổ nhìn ra trời theo giờ và thời tiết
function houseWorld(scene) {
  box(8, .2, 7, 0x8d6e47, 0, -.1, 0, scene);
  for (let i = 0; i < 9; i++) box(.03, .01, 7, 0x6d5233, -3.6 + i * .9, .01, 0, scene);
  const weave = canvasTex(64, 64, (g) => { g.fillStyle = "#c8a26a"; g.fillRect(0, 0, 64, 64); g.strokeStyle = "#a9844f"; g.lineWidth = 3; for (let i = 0; i < 64; i += 8) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 32, 64); g.stroke(); g.beginPath(); g.moveTo(i + 32, 0); g.lineTo(i, 64); g.stroke(); } });
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping; weave.repeat.set(6, 3);
  const wallMat = new THREE.MeshStandardMaterial({ map: weave, roughness: .9 });
  box(8, 4, .15, wallMat, 0, 2, -3.5, scene); box(.15, 4, 7, wallMat, -4, 2, 0, scene);
  const winMat = new THREE.MeshBasicMaterial({ color: 0x8fd0ff });
  const win = mesh(new THREE.PlaneGeometry(1.8, 1.2), winMat, 1.6, 2.3, -3.41, scene);
  box(1.95, .08, .1, 0x5a4022, 1.6, 2.92, -3.38, scene); box(1.95, .08, .1, 0x5a4022, 1.6, 1.68, -3.38, scene); box(.08, 1.3, .1, 0x5a4022, 1.6, 2.3, -3.38, scene);
  const streaks = canvasTex(64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.strokeStyle = "rgba(220,235,250,.8)"; for (let i = 0; i < 26; i++) { const x = Math.random() * 64, y = Math.random() * 64; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 12); g.stroke(); } });
  streaks.wrapS = streaks.wrapT = THREE.RepeatWrapping;
  const rainWin = mesh(new THREE.PlaneGeometry(1.8, 1.2), new THREE.MeshBasicMaterial({ map: streaks, transparent: true }), 1.6, 2.3, -3.4, scene);
  // Giường tre + mùng
  const bed = new THREE.Group(); scene.add(bed); bed.position.set(0, 0, -.2);
  box(3, .12, 1.6, 0xb08d57, 0, .55, 0, bed); for (const [x, z] of [[-1.4, -.7], [1.4, -.7], [-1.4, .7], [1.4, .7]]) cyl(.05, .05, .55, 0x8b6b45, x, .27, z, bed, 6);
  box(.6, .12, .9, 0xf2efe6, -1.1, .66, 0, bed); // gối
  box(3.1, 1.6, 1.7, mat(0xffffff, { transparent: true, opacity: .16, depthWrite: false }), 0, 1.4, 0, bed); // mùng
  // Bàn nhỏ, đèn dầu, lu nước, bàn thờ
  box(.9, .08, .6, 0x7a5c2a, 2.6, .8, -1.2, scene); for (const [x, z] of [[2.25, -1.4], [2.95, -1.4], [2.25, -1], [2.95, -1]]) cyl(.03, .03, .8, 0x6b4a2b, x, .4, z, scene, 5);
  cyl(.1, .13, .28, mat(0xffd36b, { emissive: 0xffa53a, emissiveIntensity: .8 }), 2.6, .98, -1.2, scene, 8);
  const lamp = new THREE.PointLight(0xffb45a, 0, 10); lamp.position.set(2.6, 1.6, -1.2); scene.add(lamp);
  mesh(new THREE.SphereGeometry(.45, 12, 10), 0x8a5a2b, -3.2, .45, 2.3, scene);
  box(1.2, .08, .45, 0x7a2e1f, -3.7, 2.4, -1.6, scene); for (const z of [-1.75, -1.45]) cyl(.03, .03, .2, mat(0xd62f3a, { emissive: 0xff4b4b, emissiveIntensity: .6 }), -3.7, 2.54, z, scene, 6);
  const flood = box(8, .05, 7, mat(0x7b8a74, { transparent: true, opacity: .8 }), 0, -.2, 0, scene);
  return {
    camFace: .66, props: {},
    tick(t) {
      const h = hourNow(), w = WORLD.weather, day = daylight(h);
      winMat.color.copy(skyColor(h, w));
      scene.background = new THREE.Color(0x1d140c);
      lamp.intensity = day < .5 ? 3 : .6; VIEWS.farm.houseHemi.intensity = .25 + .55 * day;
      rainWin.visible = w === "rain" || w === "flood"; streaks.offset.y = (t * 1.5) % 1;
      flood.position.y = w === "flood" ? .12 : -.2;
    },
  };
}

// ---------- Văn phòng Bảy Gà ----------
function chartCanvas() { // màn hình nến chạy liên tục
  const state = { p: 80, bars: [] };
  for (let i = 0; i < 18; i++) step();
  function step() { const o = state.p, c = Math.max(20, Math.min(140, o + (Math.random() - .47) * 24)); state.p = c; state.bars.push([o, c]); if (state.bars.length > 18) state.bars.shift(); }
  const tex = canvasTex(256, 160, draw);
  function draw(g) {
    g.fillStyle = "#0d1020"; g.fillRect(0, 0, 256, 160);
    state.bars.forEach(([o, c], i) => { g.fillStyle = c < o ? "#22c55e" : "#f2474b"; g.fillRect(10 + i * 13, Math.min(o, c), 8, Math.max(3, Math.abs(c - o))); g.fillRect(13 + i * 13, Math.min(o, c) - 8, 2, Math.abs(c - o) + 16); });
  }
  return { tex, tick() { step(); draw(tex.userData.canvas.getContext("2d")); tex.needsUpdate = true; } };
}
function skylineTex() { // cảnh phố nhìn qua cửa sổ, vẽ lại khi chuyển ngày/đêm
  const shapes = Array.from({ length: 14 }, (_, i) => [i * 38 - 10, rand(40, 190), rand(26, 40)]);
  const tex = canvasTex(512, 256, () => {});
  tex.draw = (night, sky) => {
    const g = tex.userData.canvas.getContext("2d");
    g.fillStyle = "#" + sky.getHexString(); g.fillRect(0, 0, 512, 256);
    for (const [x, h, w] of shapes) {
      g.fillStyle = night ? "#141a33" : "#7d8ca8"; g.fillRect(x, 256 - h, w, h);
      for (let yy = 256 - h + 8; yy < 250; yy += 14) for (let xx = x + 5; xx < x + w - 6; xx += 9) {
        g.fillStyle = night ? (Math.random() < .45 ? "#ffd27a" : "#1d2442") : "#b8c7de"; g.fillRect(xx, yy, 5, 7);
      }
    }
    tex.needsUpdate = true;
  };
  return tex;
}
function tickerTex() { // bảng điện tử chạy chữ
  const items = [["VNINDEX 1.284,5", 1], ["FPT 56.000", 1], ["HPG 25.100", -1], ["VNM 57.600", 1], ["VPL 92.400", 1], ["SSI 31.250", -1], ["MWG 61.800", 1], ["VCB 88.900", -1]];
  const tex = canvasTex(1024, 64, (g) => {
    g.fillStyle = "#07090f"; g.fillRect(0, 0, 1024, 64); g.font = "bold 30px monospace"; let x = 10;
    for (const [s, d] of items) { g.fillStyle = d > 0 ? "#22c55e" : "#f2474b"; const txt = s + (d > 0 ? " ▲  " : " ▼  "); g.fillText(txt, x, 43); x += g.measureText(txt).width; }
  });
  tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(.5, 1); return tex;
}
function officeWorld(scene) {
  const props = {};
  // Sàn và tường kéo dài ra ngoài khung để phòng chiếm trọn khung hình
  // Màu nhạt để ban ngày phòng sáng sủa; tối thì đèn yếu đi nên tự tối lại (chủ dự án dặn 28/10/2026).
  box(40, .2, 40, 0x7a7092, 4, -.1, 4, scene);
  for (let i = 0; i < 10; i++) box(.02, .01, 9, 0x6b6283, -5.4 + i * 1.2, .01, 0, scene);
  const wallMat = mat(0xbdb4d4);
  box(26, 5, .2, wallMat, 7, 2.5, -4.5, scene); box(.2, 5, 26, mat(0xaea4c8), -6, 2.5, 8.5, scene);
  // Cửa sổ lớn nhìn ra phố
  const sky = skylineTex();
  mesh(new THREE.PlaneGeometry(4.2, 2.4), new THREE.MeshBasicMaterial({ map: sky }), -3, 2.6, -4.38, scene);
  for (const x of [-5.1, -3, -.9]) box(.1, 2.5, .1, 0x2a2540, x, 2.6, -4.35, scene);
  box(4.4, .1, .12, 0x2a2540, -3, 3.85, -4.35, scene); box(4.4, .14, .3, 0x2a2540, -3, 1.36, -4.3, scene);
  // Bàn làm việc, 3 màn hình nến chạy, bàn phím, ly cà phê bốc khói
  box(3, .1, 1.2, 0x8a6a4a, 2.2, 1, -3.5, scene);
  for (const [x, z] of [[.8, -4], [3.6, -4], [.8, -3], [3.6, -3]]) box(.08, 1, .08, 0x5d4632, x, .5, z, scene);
  const charts = [chartCanvas(), chartCanvas(), chartCanvas()];
  charts.forEach((c, i) => {
    const x = 1.2 + i * 1, y = 1.55; box(.92, .6, .06, 0x111111, x, y, -3.95, scene); box(.06, .3, .06, 0x111111, x, 1.18, -3.95, scene);
    mesh(new THREE.PlaneGeometry(.86, .54), new THREE.MeshBasicMaterial({ map: c.tex }), x, y, -3.91, scene).rotation.y = (1 - i) * .25;
  });
  box(1.1, .04, .35, 0x222222, 2.2, 1.07, -3.2, scene);
  cyl(.09, .08, .2, 0xf2efe6, 3.3, 1.15, -3.15, scene, 10);
  const steam = [0, 1, 2].map((i) => mesh(new THREE.SphereGeometry(.05, 6, 5), mat(0xffffff, { transparent: true, opacity: .5 }), 3.3, 1.3, -3.15, scene));
  // Ghế xoay (bán được), sofa, giường gấp ban đêm
  const chair = prop(scene, props, "chair");
  box(.75, .1, .75, 0x2b2b35, 2.2, .72, -2.55, chair); box(.75, .9, .1, 0x2b2b35, 2.2, 1.2, -2.15, chair); cyl(.05, .05, .65, 0x555555, 2.2, .35, -2.55, chair, 6);
  const sofa = prop(scene, props, "sofa");
  box(2.4, .5, 1, 0x7a3b5a, -3.4, .45, 2.9, sofa); box(2.4, .9, .3, 0x6a2f4f, -3.4, .9, 3.35, sofa); for (const s of [-1, 1]) box(.3, .7, 1, 0x6a2f4f, -3.4 + s * 1.3, .55, 2.9, sofa);
  const bed = new THREE.Group(); scene.add(bed); bed.position.set(-3, 0, -1.2); props.bed = bed;
  box(3, .12, 1.3, 0x5b6b80, 0, .62, 0, bed); box(2.9, .1, 1.2, 0xe8eef5, 0, .72, 0, bed); box(.55, .12, .9, 0xffffff, -1.1, .82, 0, bed);
  for (const [x, z] of [[-1.4, -.6], [1.4, -.6], [-1.4, .6], [1.4, .6]]) cyl(.04, .04, .62, 0x999999, x, .31, z, bed, 6);
  // Kệ sách, quạt cây, bảng điện tử chạy chữ
  const shelf = prop(scene, props, "shelf"); box(.5, 2.6, 1.6, 0x5d4632, -5.65, 1.3, -1.6, shelf);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) box(.3, .45, .18, pick([0xd62f3a, 0x2f7dd6, 0xf5c542, 0x22c55e, 0xeeeeee]), -5.55, .5 + r * .62, -2.2 + i * .24, shelf);
  const fan = new THREE.Group(); scene.add(fan); fan.position.set(-5, 0, 1.2); props.fan = fan;
  cyl(.05, .05, 1.5, 0x333333, 0, .75, 0, fan, 6); cyl(.3, .35, .06, 0x333333, 0, .03, 0, fan, 12);
  const blades = new THREE.Group(); blades.position.set(0, 1.6, .15); fan.add(blades); fan.rotation.y = .9;
  for (let i = 0; i < 3; i++) { const b = box(.12, .45, .02, 0x9fd3ff, 0, .22, 0, new THREE.Group()); const p = new THREE.Group(); p.rotation.z = i * Math.PI * 2 / 3; p.add(b); blades.add(p); }
  const ticker = tickerTex();
  box(4.4, .5, .1, 0x111111, 3.4, 3.4, -4.35, scene);
  mesh(new THREE.PlaneGeometry(4.2, .38), new THREE.MeshBasicMaterial({ map: ticker }), 3.4, 3.4, -4.29, scene);
  // Đồ bán được khi cứu đói
  const board = prop(scene, props, "board"); box(.1, 1.4, 2.2, 0xf4f4f8, -5.88, 2, 4.8, board);
  board.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([0, .3, -.1, .5, .2, .7].map((y, i) => new THREE.Vector3(-5.82, 1.6 + y, 3.9 + i * .38))), new THREE.LineBasicMaterial({ color: 0x22c55e })));
  for (const [id, x, z, leaf, on] of [["plant", -5.2, -3.9, 0x3f9a4f, true], ["kimtien", 5.2, -3.9, 0x5fd16b, false]]) {
    const g = prop(scene, props, id, on);
    cyl(.3, .24, .5, on ? 0xb5653a : 0xd8b04a, x, .25, z, g, 12); ball(.55, leaf, x, .95, z, g);
  }
  const cooler = prop(scene, props, "cooler"); box(.5, 1.2, .5, 0xdfe7f2, 5.3, .6, 3.6, cooler); box(.42, .5, .42, 0x7fc4ff, 5.3, 1.45, 3.6, cooler);
  const rug = mesh(new THREE.CircleGeometry(1.5, 32), 0x6a2f4f, 0, .015, 1.2, prop(scene, props, "rug")); rug.rotation.x = -Math.PI / 2;
  // Đồ sắm khi có lời
  const lampG = prop(scene, props, "lamp", false); box(.06, .45, .06, 0x333333, .9, 1.28, -3.3, lampG);
  mesh(new THREE.ConeGeometry(.2, .22, 12), 0xffd36b, .9, 1.55, -3.3, lampG, { emissive: 0xffb020, emissiveIntensity: .8 });
  const clock = prop(scene, props, "clock", false);
  mesh(new THREE.CircleGeometry(.38, 24), 0xffffff, -.3, 3.3, -4.38, clock);
  const hourHand = box(.04, .2, .02, 0x111111, -.3, 3.3, -4.36, clock), minHand = box(.025, .3, .02, 0x111111, -.3, 3.3, -4.35, clock);
  for (const hd of [hourHand, minHand]) hd.geometry.translate(0, hd.geometry.parameters.height / 2, 0);
  const ceiling = new THREE.PointLight(0xffe2b0, 0, 16); ceiling.position.set(0, 4.2, 0); scene.add(ceiling);
  let chartT = 0, skyNight = null;
  const officeBg = new THREE.Color(); scene.background = officeBg;
  return {
    props, camFace: .66,
    // Điểm làm việc: bàn (ngồi ghế nếu còn ghế), bảng trắng, bình nước, cửa sổ, kệ sách
    spots: [
      { x: 2.2, z: -2.55, face: Math.PI, job: "Interact", pose: "sit", y: .77, dur: [9, 15], ok: () => props.chair.visible },
      { x: 2.2, z: -2.6, face: Math.PI, job: "Interact", ok: () => !props.chair.visible },
      { x: -5, z: 4.8, face: -Math.PI / 2, job: "Interact", ok: () => props.board.visible }, { x: 4.6, z: 3.2, face: .9, job: "Interact" },
      { x: -3, z: -3.5, face: Math.PI, job: "Idle" }, { x: -4.9, z: -1.6, face: -Math.PI / 2, job: "Interact" }, { x: 0, z: 1.2, face: .66, job: "Idle" },
    ],
    rests: [{ x: -3.4, z: 2.55, face: 0, pose: "sit", y: .7, dur: [10, 16] }],
    sleep: { x: -3, z: -.1, face: Math.PI, pose: "lie", y: .75, until: (h) => h >= 23 || h < 6, lieAt: [-3, -1.2], lieFace: Math.PI / 2, lieOut: [-3, -.1] },
    sleepAt: (h) => h >= 23 || h < 6,
    tick(t, dt) {
      const h = hourNow(), day = daylight(h), night = day < .3, skyC = skyColor(h, "clear");
      officeBg.copy(OFFICE_NIGHT).lerp(OFFICE_DAY, day); // ban ngày nền sáng, tối mới tím sẫm
      bed.visible = !bed.userData.off && (h >= 22 || h < 6.5); // giường gấp chỉ dựng ra ban đêm, đã bán thì thôi
      if (skyNight !== night) { skyNight = night; sky.draw(night, skyC); }
      VIEWS.inv.sun.intensity = .3 + 1.3 * day; VIEWS.inv.hemi.intensity = .45 + .6 * day; ceiling.intensity = night ? 9 : 2;
      chartT += dt; if (chartT > 1.4) { chartT = 0; charts.forEach((c) => c.tick()); }
      ticker.offset.x = (ticker.offset.x + dt * .06) % 1;
      blades.rotation.z -= dt * 12;
      steam.forEach((s, i) => { const k = (t * .5 + i / 3) % 1; s.position.y = 1.3 + k * .6; s.material.opacity = .45 * (1 - k); s.position.x = 3.3 + Math.sin(t * 2 + i) * .05; });
      const hh = hourNow(); hourHand.rotation.z = -(hh % 12) / 12 * Math.PI * 2; minHand.rotation.z = -(hh % 1) * Math.PI * 2;
    },
  };
}
// Toàn cảnh thành phố về đêm khi Bảy Gà ngủ: nhiều tòa cao tầng sáng đèn, tòa của Bảy Gà có ô cửa sáng
function cityWorld(scene) {
  scene.background = new THREE.Color(0x070b1d); scene.fog = new THREE.Fog(0x070b1d, 40, 110);
  box(200, .2, 200, 0x0d1222, 0, -.1, 0, scene);
  const winTex = (seed) => canvasTex(64, 128, (g) => { g.fillStyle = "#0c1226"; g.fillRect(0, 0, 64, 128); for (let y = 4; y < 124; y += 8) for (let x = 4; x < 60; x += 8) { g.fillStyle = Math.random() < .3 + seed * .1 ? "#ffd27a" : "#141c3a"; g.fillRect(x, y, 5, 5); } });
  const mats = [0, 1, 2, 3].map((s) => new THREE.MeshStandardMaterial({ color: 0x1a2140, emissive: 0xffffff, emissiveMap: winTex(s), emissiveIntensity: .9, roughness: .9 }));
  for (let gx = -6; gx <= 6; gx++) for (let gz = -6; gz <= 2; gz++) {
    if (gx === 0 && gz === 0) continue;
    if (Math.random() < .25) continue;
    const hgt = rand(4, 22) * (1 - Math.abs(gx) * .05), w = rand(2, 3.4);
    box(w, hgt, w, pick(mats), gx * 5 + rand(-.6, .6), hgt / 2, gz * 5 + rand(-.6, .6), scene);
  }
  // Tòa nhà của Bảy Gà: cao, viền tím, đèn đỏ nhấp nháy trên nóc, một ô cửa sáng ở tầng ngủ
  const tower = new THREE.Group(); scene.add(tower);
  box(3.6, 30, 3.6, new THREE.MeshStandardMaterial({ color: 0x2a2470, emissive: 0xffffff, emissiveMap: winTex(-2), emissiveIntensity: .5 }), 0, 15, 0, tower);
  for (const s of [-1, 1]) box(.12, 30, .12, mat(0x8b7cff, { emissive: 0x8b7cff, emissiveIntensity: .9 }), s * 1.8, 15, 1.8, tower);
  const beacon = mesh(new THREE.SphereGeometry(.25, 8, 6), mat(0xff2b2b, { emissive: 0xff2b2b, emissiveIntensity: 1 }), 0, 30.4, 0, tower);
  mesh(new THREE.PlaneGeometry(.7, .5), new THREE.MeshBasicMaterial({ color: 0xffe08a }), .6, 21, 1.81, tower);
  const anchor = new THREE.Object3D(); anchor.position.set(.6, 21.6, 1.9); tower.add(anchor);
  // Đường phố có xe chạy, trăng và sao
  const cars = [];
  for (let i = 0; i < 26; i++) { const c = box(.5, .2, .25, mat(i % 2 ? 0xffe9a8 : 0xff5a4a, { emissive: i % 2 ? 0xffe9a8 : 0xff5a4a, emissiveIntensity: 1 }), rand(-35, 35), .15, (Math.floor(rand(-6, 3)) * 5) + 2.5, scene); c.castShadow = false; cars.push([c, rand(4, 9) * (i % 2 ? 1 : -1)]); }
  mesh(new THREE.SphereGeometry(2.2, 16, 12), new THREE.MeshBasicMaterial({ color: 0xf6f1d5 }), -30, 38, -60, scene);
  scene.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 300 }, () => new THREE.Vector3(rand(-120, 120), rand(25, 70), rand(-90, -60)))), new THREE.PointsMaterial({ color: 0xffffff, size: .5 })));
  scene.add(new THREE.HemisphereLight(0x6f7cff, 0x0b0f1f, .7));
  return {
    anchor,
    tick(t, dt) {
      beacon.material.emissiveIntensity = Math.sin(t * 3) > 0 ? 1.4 : .2;
      for (const [c, v] of cars) { c.position.x += v * dt; if (c.position.x > 36) c.position.x = -36; if (c.position.x < -36) c.position.x = 36; }
    },
  };
}

// ---------- Ghép cảnh, máy quay, chuyển cảnh ----------
function lights(scene, warm) {
  const hemi = new THREE.HemisphereLight(0xffffff, warm ? 0x335533 : 0x3a3366, 1.1); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff3dc, 1.6);
  sun.position.set(8, 14, 9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, far: 50 }); scene.add(sun);
  return { hemi, sun };
}
function makeScene(el, kind) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 2)); renderer.shadowMap.enabled = true;
  el.prepend(renderer.domElement);
  const fade = document.createElement("div"); fade.className = "fade"; el.append(fade);
  const place = el.querySelector(".place"), placeText = place.textContent;
  const bubble = document.getElementById("thought-" + kind);
  const main = new THREE.Scene(), alt = new THREE.Scene(); // alt: trong nhà (Vi Cá) hoặc thành phố (Bảy Gà)
  const v = VIEWS[kind] = { inside: false, ...lights(main, kind === "farm") };
  const world = kind === "inv" ? officeWorld(main) : farmWorld(main);
  PROPS[kind] = world.props;
  let altWorld;
  if (kind === "farm") { v.houseHemi = new THREE.HemisphereLight(0xfff1d6, 0x3a2a16, .8); alt.add(v.houseHemi); altWorld = houseWorld(alt); }
  else altWorld = cityWorld(alt);
  const ch = makeCharacter(kind); main.add(ch.root); CHARS[kind] = ch;
  ch.root.position.set(world.spots[0].x, 0, world.spots[0].z + 1);
  // Máy quay: cảnh chính, trong nhà, thành phố
  const camMain = new THREE.PerspectiveCamera(kind === "farm" ? 36 : 40, 1, .1, 200), camAlt = new THREE.PerspectiveCamera(42, 1, .1, 300);
  let view = "main"; // main | inside (Vi Cá ngủ trong nhà) | city (Bảy Gà ngủ)
  function swap(next, place2, during) { // chuyển cảnh mờ dần sang đen rồi hiện lại
    fade.classList.add("on");
    setTimeout(() => { view = next; during && during(); place.textContent = place2; fade.classList.remove("on"); }, 450);
  }
  v.enter = (target) => { // Vi Cá vào nhà ngủ
    v.inside = true;
    swap("inside", "Trong nhà Vi Cá", () => { alt.add(ch.root); ch.root.position.set(target.lieAt[0], 0, target.lieAt[1]); ch.root.rotation.y = target.lieFace; });
  };
  v.exit = () => {
    v.inside = false;
    swap("main", placeText, () => { main.add(ch.root); ch.root.position.set(world.sleep.lieOut[0], 0, world.sleep.lieOut[1]); });
  };
  const brain = makeBrain(ch, world, v); v.brain = brain;
  function resize() {
    const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h, false);
    for (const c of [camMain, camAlt]) { c.aspect = w / h; c.updateProjectionMatrix(); }
    const k = Math.max(1, 1.5 / camMain.aspect); // khung hẹp (điện thoại) thì lùi máy quay ra
    if (kind === "farm") { camMain.position.set(9 * k, 8.5 * k, 12.5 * k); camMain.lookAt(-.3, .4, .2); camAlt.position.set(4.6, 4.6, 5.6); camAlt.lookAt(-.2, .8, -.8); }
    else { camMain.position.set(7 * k, 6.6 * k, 9 * k); camMain.lookAt(-.6, 1.7, -.8); camAlt.position.set(16, 18, 30); camAlt.lookAt(0, 16, 0); }
  }
  new ResizeObserver(resize).observe(el); resize();
  // Người xem bấm vào đồ vật (chủ dự án duyệt 28/10/2026): báo cho trang món nào bị bấm (sự kiện "pick").
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const shown = (o) => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
  function pickAt(e) {
    if (view !== "main") return null;
    const r = renderer.domElement.getBoundingClientRect();
    ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ptr, camMain);
    let best = null;
    for (const [id, g] of Object.entries(world.props)) {
      if (!shown(g)) continue;
      const hit = ray.intersectObject(g, true)[0];
      if (hit && (!best || hit.distance < best.d)) best = { id, d: hit.distance };
    }
    return best && best.id;
  }
  renderer.domElement.addEventListener("click", (e) => {
    const id = pickAt(e);
    if (id) { e.stopPropagation(); el.dispatchEvent(new CustomEvent("pick", { detail: { kind, id } })); }
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse") renderer.domElement.style.cursor = pickAt(e) ? "pointer" : "";
  });
  let visible = true; new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(el); // khuất màn hình thì thôi vẽ
  const p = new THREE.Vector3();
  function placeBubble(cam, anchor) { // chiếu điểm neo ra màn hình, đặt bong bóng ngay trên đó
    anchor.getWorldPosition(p); p.project(cam);
    const w = el.clientWidth, h = el.clientHeight, bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    const hx = (p.x + 1) / 2 * w, hy = (1 - p.y) / 2 * h;
    const x = Math.min(w - bw - 8, Math.max(8, hx - 28)), y = Math.max(8, hy - bh - 12);
    bubble.style.setProperty("--x", x + "px"); bubble.style.setProperty("--y", y + "px");
    bubble.style.setProperty("--tail", Math.min(bw - 22, Math.max(10, hx - x - 7)) + "px");
  }
  return (t, dt) => {
    brain.update(dt);
    // Bảy Gà đang ngủ trên giường gấp thì lùi ra toàn cảnh thành phố, thức dậy thì quay vào văn phòng
    if (kind === "inv") {
      const want = brain.asleep && ch.pose === "lie" ? "city" : "main";
      if (want !== view && !fade.classList.contains("on")) swap(want, want === "city" ? "Toàn cảnh thành phố về đêm" : placeText);
    }
    if (!visible && !still) return;
    world.tick(t, dt); altWorld.tick(t, dt);
    const scene = view === "main" ? main : alt, cam = view === "main" ? camMain : camAlt;
    renderer.render(scene, cam);
    placeBubble(cam, view === "city" ? altWorld.anchor : ch.top);
  };
}
window.scene3d = {
  toggle(kind, id, on) { const g = PROPS[kind] && PROPS[kind][id]; if (g) { g.visible = on; g.userData.off = !on; } if (still) requestAnimationFrame(loop); },
  tint(kind, id, n) { // đồ AI mua lại ở chợ đồ cũ: đổi màu theo số lần mua lại cho biết là món khác (0 = màu gốc)
    const g = PROPS[kind] && PROPS[kind][id]; if (!g || (g.userData.tint || 0) === n) return;
    g.userData.tint = n;
    g.traverse((o) => {
      if (!o.isMesh || !o.material.color) return;
      if (!o.userData.base) { o.material = o.material.clone(); o.userData.base = o.material.color.clone(); }
      o.material.color.copy(o.userData.base).offsetHSL(n * .13, 0, n ? .05 : 0);
    });
  },
  // Động tác theo sự kiện: Wave (cảm ơn), HitRecieve (gặp nạn), Death (mode "hold": nằm luôn, bỏ qua động tác khác tới khi "revive").
  // Đang ngủ thì bỏ qua động tác thường (không đánh thức), trừ khi đi đầu thai.
  act(kind, name, mode) {
    const ch = CHARS[kind], v = VIEWS[kind]; if (!ch || !ch.mixer || (ch.hold && mode !== "revive")) return;
    if (v.brain.asleep && mode !== "hold" && mode !== "revive") return;
    if (ch.pose) v.brain.wake();
    ch.hold = mode === "hold"; ch.busy = play(ch, name, true);
  },
  asleep: (kind) => !!(VIEWS[kind] && VIEWS[kind].brain.asleep),
  clock() { const h = hourNow(); return `${partOfDay(h)} · ${String(Math.floor(h)).padStart(2, "0")}:${String(Math.floor(h % 1 * 60)).padStart(2, "0")}`; },
  sleepNote(kind) { // nhãn hiện trên ô nhân vật khi đang ngủ
    if (kind === "inv") return `Bảy Gà đang ngủ trên giường gấp · dậy sau ${realMinutesUntil(6)} phút`;
    return VIEWS.farm.brain.napping ? `Vi Cá ngủ trưa trên võng · dậy sau ${realMinutesUntil(13)} phút`
      : `Vi Cá đang ngủ trong nhà · dậy sau ${realMinutesUntil(5)} phút`;
  },
  setHour(h) { WORLD.hour = h; Object.values(VIEWS).forEach((v) => v.brain && !v.brain.asleep && v.brain.wake()); },
  setWeather(w) { WORLD.weather = w; },
  get weather() { return WORLD.weather; },
};
const frames = [makeScene(document.getElementById("scene-inv"), "inv"), makeScene(document.getElementById("scene-farm"), "farm")];
let last = performance.now();
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  frames.forEach((f) => f(now / 1000, dt));
  if (!still) requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
