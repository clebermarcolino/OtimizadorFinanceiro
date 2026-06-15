const constraints = [
  { a:4, b:1, rhs:8,  label:'4x + y ≥ 8',   color:'#3b82f6', name:'Desktops' },
  { a:1, b:1, rhs:6,  label:'x + y ≥ 6',    color:'#f59e0b', name:'Notebooks' },
  { a:2, b:7, rhs:28, label:'2x + 7y ≥ 28', color:'#06b6d4', name:'Netbooks'  },
];

const costManaus = 150000;
const costSul    = 210000;

function lineIntersect(c1, c2) {
  const det = c1.a * c2.b - c2.a * c1.b;
  if (Math.abs(det) < 1e-10) return null;
  const x = (c1.rhs * c2.b - c2.rhs * c1.b) / det;
  const y = (c1.a * c2.rhs - c2.a * c1.rhs) / det;
  return { x, y };
}

function isFeasible(p) {
  for (const c of constraints) {
    if (c.a * p.x + c.b * p.y < c.rhs - 1e-9) return false;
  }
  return p.x >= -1e-9 && p.y >= -1e-9;
}

function getVertices() {
  const pts = [];
  const n = constraints.length;

  for (let i = 0; i < n; i++) {
    for (let j = i+1; j < n; j++) {
      const p = lineIntersect(constraints[i], constraints[j]);
      if (p && isFeasible(p)) pts.push({
        ...p,
        origin: `${constraints[i].name} ∩ ${constraints[j].name}`,
        originColors: [constraints[i].color, constraints[j].color]
      });
    }
  }

  for (const c of constraints) {
    if (c.b !== 0) {
      const p = {x:0, y:c.rhs/c.b};
      if (isFeasible(p)) pts.push({ ...p, origin: `${c.name} ∩ eixo y`, originColors: [c.color, '#64748b'] });
    }
    if (c.a !== 0) {
      const p = {x:c.rhs/c.a, y:0};
      if (isFeasible(p)) pts.push({ ...p, origin: `${c.name} ∩ eixo x`, originColors: [c.color, '#64748b'] });
    }
  }

  const unique = [];
  for (const p of pts) {
    if (!unique.some(u => Math.abs(u.x-p.x)<1e-9 && Math.abs(u.y-p.y)<1e-9))
      unique.push(p);
  }
  return unique;
}

const vertices = getVertices();

function fmt(n) {
  return Number.isInteger(n) ? n : n.toFixed(2);
}

function fmtR(n) {
  return 'R$ ' + Math.round(n).toLocaleString('pt-BR');
}

const tbody = document.querySelector('#vertexTable tbody');

vertices.forEach((v, i) => {
  const Z = costManaus * v.x + costSul * v.y;
  const dots = v.originColors.map(c =>
    `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c};margin-right:3px;vertical-align:middle"></span>`
  ).join('');

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="font-family:var(--mono);font-weight:600">P${i+1}</td>
    <td>${fmt(v.x)}</td>
    <td>${fmt(v.y)}</td>
    <td style="font-size:12px;color:var(--muted)">${dots}${v.origin}</td>
    <td style="font-family:var(--mono)">${fmtR(Z)}</td>
  `;
  tbody.appendChild(tr);
});

const canvas = document.getElementById('plCanvas');
const ctx = canvas.getContext('2d');

const XMAX = 10, YMAX = 10;

function toCanvas(x, y) {
  const pad = 40;
  const W = canvas.width  - pad * 2;
  const H = canvas.height - pad * 2;
  return [ pad + (x / XMAX) * W, pad + H - (y / YMAX) * H ];
}

function resizeCanvas() {
  const w = canvas.parentElement.clientWidth;
  canvas.width  = w;
  canvas.height = w;
  drawChart();
}

function drawChart() {
  const W = canvas.width, H = canvas.height, pad = 40;
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = '#141929';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#253050';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= XMAX; i++) {
    const [cx]    = toCanvas(i, 0);
    const [, cy0] = toCanvas(i, 0);
    const [, cy1] = toCanvas(i, YMAX);
    ctx.beginPath(); ctx.moveTo(cx, cy0); ctx.lineTo(cx, cy1); ctx.stroke();
  }
  for (let j = 0; j <= YMAX; j++) {
    const [cx0, cy] = toCanvas(0, j);
    const [cx1]     = toCanvas(XMAX, j);
    ctx.beginPath(); ctx.moveTo(cx0, cy); ctx.lineTo(cx1, cy); ctx.stroke();
  }

  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.5;
  const [ax0, ay0] = toCanvas(0, 0);
  const [ax1]      = toCanvas(XMAX, 0);
  const [, ay1]    = toCanvas(0, YMAX);
  ctx.beginPath(); ctx.moveTo(ax0, ay0); ctx.lineTo(ax1, ay0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ax0, ay0); ctx.lineTo(ax0, ay1); ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = `11px 'JetBrains Mono', monospace`;
  ctx.textAlign = 'center';
  for (let i = 0; i <= XMAX; i += 2) {
    const [cx, cy] = toCanvas(i, 0);
    ctx.fillText(i, cx, cy + 16);
  }
  ctx.textAlign = 'right';
  for (let j = 0; j <= YMAX; j += 2) {
    const [cx, cy] = toCanvas(0, j);
    ctx.fillText(j, cx - 6, cy + 4);
  }
  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold 12px 'Space Grotesk', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('x (dias Manaus)', W / 2, H - 4);
  ctx.save();
  ctx.translate(14, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('y (dias Sul)', 0, 0);
  ctx.restore();

  if (vertices.length > 0) {
    const cx_ = vertices.reduce((s, v) => s + v.x, 0) / vertices.length;
    const cy_ = vertices.reduce((s, v) => s + v.y, 0) / vertices.length;
    const sorted = [...vertices].sort((a, b) =>
      Math.atan2(a.y - cy_, a.x - cx_) - Math.atan2(b.y - cy_, b.x - cx_)
    );
    ctx.beginPath();
    sorted.forEach((v, i) => {
      const [px, py] = toCanvas(v.x, v.y);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(16,185,129,0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(16,185,129,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  constraints.forEach(c => {
    const pts2 = [];
    if (c.b !== 0) { const y0 = c.rhs / c.b;             if (y0 >= 0 && y0 <= YMAX) pts2.push([0, y0]); }
    if (c.a !== 0) { const x0 = c.rhs / c.a;             if (x0 >= 0 && x0 <= XMAX) pts2.push([x0, 0]); }
    if (c.b !== 0) { const y1 = (c.rhs - c.a*XMAX)/c.b;  if (y1 >= 0 && y1 <= YMAX) pts2.push([XMAX, y1]); }
    if (c.a !== 0) { const x1 = (c.rhs - c.b*YMAX)/c.a;  if (x1 >= 0 && x1 <= XMAX) pts2.push([x1, YMAX]); }
    if (pts2.length < 2) return;

    const [p1x, p1y] = toCanvas(pts2[0][0], pts2[0][1]);
    const [p2x, p2y] = toCanvas(pts2[1][0], pts2[1][1]);
    ctx.beginPath(); ctx.moveTo(p1x, p1y); ctx.lineTo(p2x, p2y);
    ctx.strokeStyle = c.color; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.stroke(); ctx.setLineDash([]);
  });

  vertices.forEach((v, i) => {
    const [px, py] = toCanvas(v.x, v.y);
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#f43f5e'; ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.font = `bold 11px 'JetBrains Mono'`;
    ctx.textAlign = 'left';
    ctx.fillText(`P${i+1}(${fmt(v.x)},${fmt(v.y)})`, px + 8, py - 6);
  });
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function solve() {
  let best = null;
  vertices.forEach((v, i) => {
    const Z = costManaus * v.x + costSul * v.y;
    if (!best || Z < best.Z) best = { ...v, Z, idx: i };
  });

  drawChart();
  const [px, py] = toCanvas(best.x, best.y);
  ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2);
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3; ctx.stroke();

  document.getElementById('resultCards').innerHTML = `
    <div class="result-card">
      <div class="rval">${fmt(best.x)}</div>
      <div class="rlabel">Dias — Manaus (x)</div>
    </div>
    <div class="result-card">
      <div class="rval">${fmt(best.y)}</div>
      <div class="rlabel">Dias — Sul (y)</div>
    </div>
    <div class="result-card gold-card">
      <div class="rval">${fmtR(best.Z)}</div>
      <div class="rlabel">Custo Mínimo (Z)</div>
    </div>
  `;

  const rows = vertices.map((v, i) => {
    const Z = costManaus * v.x + costSul * v.y;
    const isBest = (i === best.idx);
    return `<p class="${isBest ? 'best' : 'highlight'}">P${i+1}(${fmt(v.x)}, ${fmt(v.y)}) <span style="color:var(--muted);font-size:11px">[${v.origin}]</span> → Z = 150.000×${fmt(v.x)} + 210.000×${fmt(v.y)} = ${fmtR(Z)} ${isBest ? '← MÍNIMO ✓' : ''}</p>`;
  }).join('');

  const checks = constraints.map(c => {
    const val = c.a * best.x + c.b * best.y;
    return `<p class="ok">✓ ${c.label} → ${fmt(val)} ≥ ${c.rhs}</p>`;
  }).join('');

  document.getElementById('stepsBox').innerHTML = `
    <div class="step-title">Avaliação dos vértices da região viável</div>
    ${rows}
    <br>
    <div class="step-title">Verificação das restrições no ponto ótimo</div>
    ${checks}
  `;

  document.getElementById('result').style.display = 'block';
  document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('solverBtn').addEventListener('click', solve);