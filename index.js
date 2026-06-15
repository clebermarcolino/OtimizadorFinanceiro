
const constraints = [
  { a:4, b:1, rhs:8,  label:'4x + y ≥ 8',   name:'Desktops'  },
  { a:1, b:1, rhs:6,  label:'x + y ≥ 6',    name:'Notebooks' },
  { a:2, b:7, rhs:28, label:'2x + 7y ≥ 28', name:'Netbooks'  },
];

const costManaus = 150000;
const costSul    = 210000;

function fmt(n)  {
   return Number.isInteger(n) ? n : n.toFixed(2);
}

function fmtR(n) {
   return 'R$ ' + Math.round(n).toLocaleString('pt-BR');
}

function isFeasible(x, y) {
  for (const c of constraints) {
    if (c.a * x + c.b * y < c.rhs - 1e-9) return false;
  }
  return x >= -1e-9 && y >= -1e-9;
}


function intersect(c1, c2) {
  const det = c1.a * c2.b - c2.a * c1.b;
  if (Math.abs(det) < 1e-10) return null;
  const x = (c1.rhs * c2.b - c2.rhs * c1.b) / det;
  const y = (c1.a * c2.rhs - c2.a * c1.rhs) / det;
  return { x, y };
}

function getVertices() {
  const pts = [];
  const n = constraints.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const p = intersect(constraints[i], constraints[j]);
      if (p && isFeasible(p.x, p.y)) pts.push(p);
    }
  }

  for (const c of constraints) {
    if (c.b !== 0) { const p = { x: 0, y: c.rhs / c.b }; if (isFeasible(p.x, p.y)) pts.push(p); }
    if (c.a !== 0) { const p = { x: c.rhs / c.a, y: 0 }; if (isFeasible(p.x, p.y)) pts.push(p); }
  }

  const unique = [];

  for (const p of pts) {
    if (!unique.some(u => Math.abs(u.x - p.x) < 1e-9 && Math.abs(u.y - p.y) < 1e-9))
      unique.push(p);
  }
  return unique;
}

function solve() {
  const vertices = getVertices();

  let best = null;

  for (const v of vertices) {
    const Z = costManaus * v.x + costSul * v.y;
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
    <p class="hl">Z = 150.000 × ${fmt(best.x)} + 210.000 × ${fmt(best.y)}</p>
    <p class="hl">Z = ${fmtR(costManaus * best.x)} + ${fmtR(costSul * best.y)}</p>
    <p class="ok">Z = ${fmtR(best.Z)} ← custo mínimo</p>
  `;

  const checks = constraints.map(c => {
    const val = c.a * best.x + c.b * best.y;
    const ok  = val >= c.rhs - 1e-9;
    return `<p class="${ok ? 'ok' : 'warn'}">${ok ? '✓' : '✗'} ${c.name}: ${c.label} → ${fmt(val)} ≥ ${c.rhs} ${ok ? '(atendido)' : '(não atendido)'}</p>`;
  }).join('');

  document.getElementById('stepsBox').innerHTML = `
    ${calc}
    <br>
    <div class="step-title">Verificação das restrições</div>
    ${checks}
  `;

  document.getElementById('result').style.display = 'block';
  document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.getElementById('solverBtn').addEventListener('click', solve);