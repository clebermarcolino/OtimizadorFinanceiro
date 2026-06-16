const DEFAULTS = {
  mDesktop: 8000, mNotebook: 1000, mNetbook: 2000, mCusto: 150000,
  sDesktop: 2000, sNotebook: 1000, sNetbook: 7000, sCusto: 210000,
  dDesktop: 16000, dNotebook: 6000, dNetbook: 28000,
};

function getVal(id) {
  return parseFloat(document.getElementById(id).value) || 0;
}

function getParams() {
  return {
    manaus: {
      desktop:  getVal('mDesktop'),
      notebook: getVal('mNotebook'),
      netbook:  getVal('mNetbook'),
      custo:    getVal('mCusto'),
    },
    sul: {
      desktop:  getVal('sDesktop'),
      notebook: getVal('sNotebook'),
      netbook:  getVal('sNetbook'),
      custo:    getVal('sCusto'),
    },
    demanda: {
      desktop:  getVal('dDesktop'),
      notebook: getVal('dNotebook'),
      netbook:  getVal('dNetbook'),
    },
  };
}

function updateModel() {
  const p = getParams();
  const { manaus: m, sul: s, demanda: d } = p;

  document.getElementById('modelObj').innerHTML =
    `<span class="green">min Z</span> = ${fmt(m.custo)}<span class="hl">x</span> + ${fmt(s.custo)}<span class="gold">y</span>`;

  function simplify(a, b, rhs) {
    const g = gcd(gcd(Math.abs(a), Math.abs(b)), Math.abs(rhs));
    return { a: a/g, b: b/g, rhs: rhs/g };
  }

  const r1 = simplify(m.desktop,  s.desktop,  d.desktop);
  const r2 = simplify(m.notebook, s.notebook, d.notebook);
  const r3 = simplify(m.netbook,  s.netbook,  d.netbook);

  document.getElementById('modelRestr').innerHTML = `
    ${fmt(m.desktop)}<span class="hl">x</span> + ${fmt(s.desktop)}<span class="gold">y</span> ≥ ${fmt(d.desktop)} &nbsp;→&nbsp; ${fmtCoef(r1.a)}<span class="hl">x</span> + ${fmtCoef(r1.b)}<span class="gold">y</span> ≥ ${fmt(r1.rhs)} &nbsp;&nbsp;<span style="color:var(--muted)">// desktops</span><br>
    ${fmt(m.notebook)}<span class="hl">x</span> + ${fmt(s.notebook)}<span class="gold">y</span> ≥ ${fmt(d.notebook)} &nbsp;→&nbsp; ${fmtCoef(r2.a)}<span class="hl">x</span> + ${fmtCoef(r2.b)}<span class="gold">y</span> ≥ ${fmt(r2.rhs)} &nbsp;&nbsp;<span style="color:var(--muted)">// notebooks</span><br>
    ${fmt(m.netbook)}<span class="hl">x</span> + ${fmt(s.netbook)}<span class="gold">y</span> ≥ ${fmt(d.netbook)} &nbsp;→&nbsp; ${fmtCoef(r3.a)}<span class="hl">x</span> + ${fmtCoef(r3.b)}<span class="gold">y</span> ≥ ${fmt(r3.rhs)} &nbsp;&nbsp;<span style="color:var(--muted)">// netbooks</span><br>
    <span class="hl">x</span> ≥ 0 ,&nbsp; <span class="gold">y</span> ≥ 0
  `;
}

function fmt(n)  {
  if (Number.isInteger(n)) return n.toLocaleString('pt-BR');
  return n.toFixed(2);
}
function fmtCoef(n) { return n === 1 ? '' : fmt(n); }

function fmtR(n) { return 'R$ ' + Math.round(n).toLocaleString('pt-BR'); }

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function intersect(c1, c2) {
  const det = c1.a * c2.b - c2.a * c1.b;
  if (Math.abs(det) < 1e-10) return null;
  const x = (c1.rhs * c2.b - c2.rhs * c1.b) / det;
  const y = (c1.a * c2.rhs - c2.a * c1.rhs) / det;
  return { x, y };
}

function isFeasible(x, y, constraints) {
  for (const c of constraints) {
    if (c.a * x + c.b * y < c.rhs - 1e-9) return false;
  }
  return x >= -1e-9 && y >= -1e-9;
}

function getVertices(constraints) {
  const pts = [];
  const n = constraints.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const p = intersect(constraints[i], constraints[j]);
      if (p && isFeasible(p.x, p.y, constraints)) pts.push(p);
    }
  }

  for (const c of constraints) {
    if (c.b !== 0) { const p = { x: 0, y: c.rhs / c.b }; if (isFeasible(p.x, p.y, constraints)) pts.push(p); }
    if (c.a !== 0) { const p = { x: c.rhs / c.a, y: 0 }; if (isFeasible(p.x, p.y, constraints)) pts.push(p); }
  }

  const unique = [];

  for (const p of pts) {
    if (!unique.some(u => Math.abs(u.x - p.x) < 1e-9 && Math.abs(u.y - p.y) < 1e-9))
      unique.push(p);
  }
  return unique;
}

function solve() {
  const p = getParams();

  const { manaus: m, sul: s, demanda: d } = p;

  const constraints = [
    { a: m.desktop,  b: s.desktop,  rhs: d.desktop,  name: 'Desktops',  label: `${fmt(m.desktop)}x + ${fmt(s.desktop)}y ≥ ${fmt(d.desktop)}` },
    { a: m.notebook, b: s.notebook, rhs: d.notebook, name: 'Notebooks', label: `${fmt(m.notebook)}x + ${fmt(s.notebook)}y ≥ ${fmt(d.notebook)}` },
    { a: m.netbook,  b: s.netbook,  rhs: d.netbook,  name: 'Netbooks',  label: `${fmt(m.netbook)}x + ${fmt(s.netbook)}y ≥ ${fmt(d.netbook)}` },
  ];

  const alertBox = document.getElementById('alertBox');

  alertBox.style.display = 'none';

  const vertices = getVertices(constraints);

  if (vertices.length === 0) {
    alertBox.textContent = 'Nenhuma solução viável encontrada. Verifique os parâmetros informados.';
    alertBox.style.display = 'block';
    document.getElementById('result').style.display = 'none';
    return;
  }

  let best = null;

  for (const v of vertices) {
    const Z = m.custo * v.x + s.custo * v.y;

    if (!best || Z < best.Z) best = { ...v, Z };
  }

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

  const calc = `
    <div class="step-title">Como foi calculado</div>
    <p class="hl">Z = ${fmt(m.custo)} × ${fmt(best.x)} + ${fmt(s.custo)} × ${fmt(best.y)}</p>
    <p class="hl">Z = ${fmtR(m.custo * best.x)} + ${fmtR(s.custo * best.y)}</p>
    <p class="ok">Z = ${fmtR(best.Z)} ← custo mínimo</p>
  `;

  const checks = constraints.map(c => {
    const val = c.a * best.x + c.b * best.y;

    const ok  = val >= c.rhs - 1e-9;

    return `<p class="${ok ? 'ok' : 'warn'}">${ok ? '✓' : '✗'} ${c.name}: ${c.label} → ${fmt(val)} ≥ ${fmt(c.rhs)} ${ok ? '(atendido)' : '(não atendido)'}</p>`;

  }).join('');

  document.getElementById('stepsBox').innerHTML = `${calc}<br><div class="step-title">Verificação das restrições</div>${checks}`;

  document.getElementById('result').style.display = 'block';

  document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function restore() {
  for (const [id, val] of Object.entries(DEFAULTS)) {
    document.getElementById(id).value = val;
  }
  document.getElementById('result').style.display = 'none';
  document.getElementById('alertBox').style.display = 'none';
  updateModel();
}

document.getElementById('solverBtn').addEventListener('click', solve);

document.getElementById('btnRestore').addEventListener('click', restore);

document.querySelectorAll('input[type="number"]').forEach(input => {
  input.addEventListener('input', updateModel);
});

updateModel();