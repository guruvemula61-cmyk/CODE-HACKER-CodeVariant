/* ===== The Project Graveyard — app.js =====
   Modules: data/store · helpers · analysis (autopsy, paths, plan) · views · github scan · fx */

/* ---------- data / store ---------- */
const KEY = 'pg_projects_v1';
const REASONS = ['Ran out of time', 'Too complex', 'Lost interest', 'Outdated tech', 'Team dropped out', 'Better idea came along'];
const SEED = [
  { id: 's1', sample: true, name: 'Student Manager', desc: 'Portal for a college department to manage student records and attendance.', lang: 'JavaScript', cat: 'Web app', last: '2023-03-14', reason: 'Ran out of time', stack: ['Node', 'Express', 'MongoDB'], done: ['Login page', 'Student CRUD API'], todo: ['Attendance module', 'Admin dashboard', 'Deployment'], ev: { readme: 'partial', issues: 7, deps: 'stale', tests: false }, status: 'buried', tasks: [], tl: [{ d: '2022-11-02', t: 'Started during a college semester' }, { d: '2023-03-14', t: 'Last commit: exams began, project paused' }] },
  { id: 's2', sample: true, name: 'HackNotes', desc: 'Hackathon team notes app that clusters ideas by theme.', lang: 'TypeScript', cat: 'Productivity', last: '2024-02-02', reason: 'Lost interest', stack: ['React', 'Vite'], done: ['Note editor', 'Tag filter'], todo: ['Idea clustering', 'Sync'], ev: { readme: 'missing', issues: 0, deps: 'ok', tests: false }, status: 'buried', tasks: [], tl: [{ d: '2024-02-01', t: 'Built in a 24-hour hackathon' }, { d: '2024-02-02', t: 'Never touched again' }] },
  { id: 's3', sample: true, name: 'PixelPet', desc: 'A desktop pet game where the pet evolves from your coding streak.', lang: 'Python', cat: 'Game', last: '2022-08-20', reason: 'Too complex', stack: ['Pygame', 'SQLite'], done: ['Sprite engine'], todo: ['Evolution system', 'Streak tracking', 'Save files', 'Sound'], ev: { readme: 'good', issues: 2, deps: 'stale', tests: false }, status: 'buried', tasks: [], tl: [{ d: '2022-06-10', t: 'Idea sketched' }, { d: '2022-08-20', t: 'Scope grew too big, stopped' }] },
  { id: 's4', sample: true, name: 'LedgerLite', desc: 'Offline-first expense tracker for small shops.', lang: 'Dart', cat: 'Mobile app', last: '2023-09-05', reason: 'Outdated tech', stack: ['Flutter', 'Hive'], done: ['Add expense', 'Monthly summary', 'Export CSV'], todo: ['Backup'], ev: { readme: 'good', issues: 4, deps: 'stale', tests: true }, status: 'buried', tasks: [], tl: [{ d: '2023-09-05', t: 'Framework upgrade broke the build' }] },
  { id: 's5', sample: true, name: 'CampusMap', desc: 'Indoor navigation for campus buildings.', lang: 'Vue', cat: 'Web app', last: '2024-06-18', reason: 'Team dropped out', stack: ['Vue', 'Leaflet'], done: ['Map view', 'Building list', 'Search'], todo: ['Indoor routes'], ev: { readme: 'partial', issues: 1, deps: 'ok', tests: false }, status: 'buried', tasks: [], tl: [{ d: '2024-06-18', t: 'Two of three teammates left' }] },
  { id: 's6', sample: true, name: 'RecipeBox', desc: 'Recipe saver with grocery list generation.', lang: 'JavaScript', cat: 'Web app', last: '2023-01-10', reason: 'Lost interest', stack: ['React', 'Firebase'], done: ['Recipe CRUD', 'Grocery list'], todo: [], ev: { readme: 'good', issues: 0, deps: 'ok', tests: true }, status: 'revived', path: 'continue', tasks: [], help: false, live: '', tl: [{ d: '2023-01-10', t: 'Abandoned after first release' }, { d: '2024-04-02', t: 'Chose path: Continue it' }, { d: '2024-04-20', t: 'Updated dependencies, added tests' }, { d: '2024-05-01', t: 'Marked revived' }] }
];
const store = {
  load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } },
  save() { try { localStorage.setItem(KEY, JSON.stringify(projects)); } catch { } }
};
let projects = store.load() || SEED;
const byId = id => projects.find(p => p.id === id);

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);
function ago(d) {
  const m = Math.floor((Date.now() - new Date(d)) / (30.4 * 864e5));
  return m < 1 ? 'this month' : m < 24 ? m + ' months ago' : Math.floor(m / 12) + ' years ago';
}
const pct = p => { const t = p.done.length + p.todo.length; return t ? Math.round(100 * p.done.length / t) : 0; };
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.append(t); setTimeout(() => t.remove(), 2200); }
const log = (p, t) => { p.tl.push({ d: today(), t }); store.save(); };
const lines = s => s.split('\n').map(x => x.trim()).filter(Boolean);

/* ---------- analysis: evidence-based only ---------- */
function autopsy(p) {
  const e = p.ev || {}, f = [];
  const add = (lvl, text, src) => f.push({ lvl, text, src });
  if (e.readme === 'missing') add('n', 'No README found. New contributors cannot tell what this does or how to run it.', 'Repository check');
  else if (e.readme === 'partial') add('n', 'README exists but is incomplete.', 'Repository check');
  else if (e.readme === 'good') add('y', 'README looks complete.', 'Repository check');
  else add('u', 'README status unknown.', 'Not scanned');
  if (e.deps === 'stale') add('n', 'Dependencies look outdated and may break on install.', 'Dependency check');
  else if (e.deps === 'ok') add('y', 'Dependencies look current.', 'Dependency check');
  else add('u', 'Dependencies not scanned.', 'Not scanned');
  if (typeof e.issues === 'number') add(e.issues > 0 ? 'n' : 'y', e.issues > 0 ? `${e.issues} open issue${e.issues > 1 ? 's' : ''} unresolved.` : 'No open issues.', 'Issue tracker');
  else add('u', 'Open issues unknown.', 'Not scanned');
  if (e.tests === false) add('n', 'No tests detected, so changes are risky.', 'Repository check');
  else if (e.tests === true) add('y', 'Tests detected.', 'Repository check');
  add('y', `Last activity ${ago(p.last)}.`, 'Owner-entered date');
  return f;
}

function paths(p) {
  const c = pct(p), r = p.reason, s = { restart: 1, continue: 1, change: 1, repurpose: 1, archive: 1 };
  const why = {
    continue: `${c}% is already done. Finishing the remaining ${p.todo.length} item(s) is cheaper than starting over.`,
    restart: 'Start fresh with a smaller scope and a modern stack, reusing what you learned.',
    change: 'Keep the core problem but pivot the idea, audience, or features.',
    repurpose: 'Extract the working parts (' + (p.done.slice(0, 2).join(', ') || 'completed pieces') + ') into a library or a different product.',
    archive: 'Not every project needs to return. Preserve notes and learnings, then let it rest.'
  };
  if (c >= 60) s.continue += 3;
  if (c < 35) { s.restart += 2; s.change += 1; }
  if (r === 'Ran out of time' || r === 'Team dropped out') s.continue += 2;
  if (r === 'Too complex') { s.restart += 3; why.restart = 'It grew too complex. Restart with a one-feature MVP and keep only what worked.'; }
  if (r === 'Lost interest' || r === 'Better idea came along') { s.change += 2; s.repurpose += 2; }
  if (r === 'Outdated tech') { s.restart += 2; why.restart = 'The tech aged out. Rebuild on a current stack and port the finished features.'; }
  if (p.ev && p.ev.deps === 'stale') s.restart += 1;
  const names = { restart: 'Restart it', continue: 'Continue it', change: 'Change the idea', repurpose: 'Repurpose it', archive: 'Archive it' };
  const order = Object.keys(s).sort((a, b) => s[b] - s[a]);
  return order.map((k, i) => ({ k, name: names[k], why: why[k], top: i === 0 }));
}

function makePlan(p) {
  const e = p.ev || {}, t = []; let n = 0;
  const add = (title, pr, eff) => t.push({ id: 't' + (++n), title, pr, eff, accepted: false, done: false });
  if (p.path === 'restart') add('Write a one-page MVP scope: one user, one feature', 'P1', '1-2 h');
  if (p.path === 'repurpose') add('Pick the reusable part and extract it into its own module', 'P1', '3-5 h');
  if (p.path === 'change') add('Write the new idea in 3 sentences and list what to keep', 'P1', '1-2 h');
  if (e.readme === 'missing') add('Write a README: what it does and how to run it', 'P1', '1-2 h');
  if (e.readme === 'partial') add('Complete the README: setup, usage, screenshots', 'P1', '1-2 h');
  if (e.deps === 'stale') add('Update dependencies and fix what breaks', 'P1', '2-4 h');
  if (e.issues > 0) add(`Triage ${e.issues} open issue(s): close, label, or schedule`, 'P2', '1-2 h');
  if (e.tests === false) add('Add a smoke test for the main flow', 'P2', '2-3 h');
  p.todo.slice(0, 3).forEach(x => add('Finish: ' + x, 'P2', '3-6 h'));
  add('Deploy a working demo and link it here', 'P3', '1-2 h');
  return t.slice(0, 8);
}

/* ---------- views ---------- */
const grid = $('#grid');
function card(p) {
  const c = pct(p);
  return `<article class="stone" data-act="open" data-id="${p.id}" tabindex="0" role="button" aria-label="Open ${esc(p.name)}">
    <span class="tag ${p.status}">${p.status}</span>
    <h3>${esc(p.name)}${p.sample ? '<span class="sample">Sample</span>' : ''}</h3>
    <div class="meta">${esc(p.lang)} · ${esc(p.cat)}</div>
    <div class="bar"><i style="width:${c}%"></i></div><div class="pct">${c}% complete</div>
    <div class="reveal"><div>
      <p><b>Last activity</b> ${ago(p.last)}</p>
      <p><b>Why it stopped</b> ${esc(p.reason)}</p>
      <p><b>Stack</b> ${esc(p.stack.join(', ') || p.lang)}</p>
    </div></div></article>`;
}
function observe() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  $$('.stone:not(.in)').forEach(el => io.observe(el));
}
function filtered() {
  const q = $('#q').value.toLowerCase().trim(), l = $('#fLang').value, r = $('#fReason').value, s = $('#fSort').value;
  let list = projects.filter(p => (!l || p.lang === l) && (!r || p.reason === r) &&
    (!q || [p.name, p.lang, p.cat, p.stack.join(' ')].join(' ').toLowerCase().includes(q)));
  list.sort((a, b) => s === 'old' ? new Date(a.last) - new Date(b.last) : s === 'done' ? pct(b) - pct(a) : new Date(b.last) - new Date(a.last));
  return list;
}
function renderGrid() {
  const l = filtered();
  grid.innerHTML = l.map(card).join('');
  $('#empty').hidden = l.length > 0;
  observe();
}
function fillFilters() {
  const lv = $('#fLang').value, rv = $('#fReason').value;
  $('#fLang').innerHTML = '<option value="">All languages</option>' + [...new Set(projects.map(p => p.lang))].sort().map(x => `<option>${esc(x)}</option>`).join('');
  $('#fReason').innerHTML = '<option value="">Any reason</option>' + REASONS.map(x => `<option>${x}</option>`).join('');
  $('#fLang').value = lv; $('#fReason').value = rv;
  $('#reasonSel').innerHTML = REASONS.map(x => `<option>${x}</option>`).join('');
}
function renderStats() {
  const n = projects.length, rv = projects.filter(p => p.status === 'revived').length, ri = projects.filter(p => p.status === 'reviving').length;
  const avg = n ? Math.round(projects.reduce((a, p) => a + pct(p), 0) / n) : 0;
  $('#stats').innerHTML = [['In the graveyard', n], ['Being revived', ri], ['Revived', rv], ['Avg. already built', avg + '%']]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
}
function renderHelp() {
  const l = projects.filter(p => p.help && p.status !== 'archived');
  $('#helpList').innerHTML = l.length ? l.map(p => {
    const open = p.tasks.filter(t => !t.done);
    return `<article class="path"><h5>${esc(p.name)}</h5><p class="note">Skills: ${esc(p.stack.join(', ') || p.lang)}</p>
    <p>${open.length ? open.slice(0, 3).map(t => '• ' + esc(t.title)).join('<br>') : 'Generate a revival plan to list open tasks.'}</p>
    <button class="btn ghost sm" data-act="open" data-id="${p.id}">See how to help</button></article>`;
  }).join('') : '<p class="empty">No project is asking for help yet. Open a project and turn on “Looking for co-revivers”.</p>';
}
function renderStories() {
  const l = projects.filter(p => p.status === 'revived');
  $('#storyList').innerHTML = l.length ? l.map(p => `<article class="path"><h5>${esc(p.name)}${p.sample ? '<span class="sample">Sample</span>' : ''}</h5>
    <p><b>Problem:</b> ${esc(p.reason)}. <b>Path:</b> ${esc(p.path || '-')}</p>
    <ul class="tl">${p.tl.map(x => `<li>${esc(x.t)}<small>${esc(x.d)}</small></li>`).join('')}</ul>
    ${p.live ? `<a class="btn ghost sm" href="${esc(p.live)}" target="_blank" rel="noopener">Live demo</a>` : ''}</article>`).join('')
    : '<p class="empty">No project has been revived yet. Revive one and its story appears here.</p>';
}
function refresh() { fillFilters(); renderGrid(); renderStats(); renderHelp(); renderStories(); }

/* detail dialog */
const dlg = $('#detail'); let cur = null;
function renderDetail() {
  const p = byId(cur); if (!p) return;
  const ps = paths(p), tasks = p.tasks, done = tasks.filter(t => t.done).length;
  const prog = tasks.length ? Math.round(100 * done / tasks.length) : 0;
  dlg.innerHTML = `<div class="dwrap">
  <div class="dhead"><div><h3>${esc(p.name)}${p.sample ? '<span class="sample">Sample</span>' : ''}</h3>
    <div class="meta">${esc(p.lang)} · ${esc(p.cat)} · <span class="tag ${p.status}" style="position:static;transform:none">${p.status}</span></div></div>
    <button class="x" data-act="close" aria-label="Close">×</button></div>
  <p style="margin-top:14px">${esc(p.desc)}</p>
  <div class="cols blk"><div><h4>Completed</h4><ul class="chk ok">${p.done.map(x => `<li>${esc(x)}</li>`).join('') || '<li class="note">Nothing recorded</li>'}</ul></div>
  <div><h4>Still unfinished</h4><ul class="chk no">${p.todo.map(x => `<li>${esc(x)}</li>`).join('') || '<li class="note">Nothing left</li>'}</ul></div></div>
  <div class="blk"><h4>Project autopsy</h4>
    <p class="note">Why it stopped (owner-reported): <b>${esc(p.reason)}</b>. Findings below come from repository evidence only.</p>
    ${autopsy(p).map(f => `<div class="find"><span class="ev ${f.lvl}">${f.lvl === 'y' ? 'Healthy' : f.lvl === 'n' ? 'Issue' : 'Unknown'}</span><div>${esc(f.text)}<div class="note">Source: ${f.src}</div></div></div>`).join('')}</div>
  <div class="blk"><h4>Choose a revival path</h4><div class="paths">
    ${ps.map(x => `<div class="path ${x.top ? 'top' : ''} ${p.path === x.k ? 'chosen' : ''}"><h5>${x.name}${x.top ? ' · suggested' : ''}</h5><p>${esc(x.why)}</p>
    <button class="btn ${p.path === x.k ? 'em' : 'ghost'} sm" data-act="path" data-k="${x.k}">${p.path === x.k ? 'Chosen' : 'Choose this path'}</button></div>`).join('')}</div></div>
  <div class="blk"><h4>Resurrection plan</h4>
    <p class="note">Rule-based plan built from the findings above. Effort ranges are rough estimates.</p>
    ${tasks.length ? `<div class="bar"><i style="width:${prog}%"></i></div><div class="pct">${done}/${tasks.length} tasks done</div>` : ''}
    ${tasks.map(t => `<div class="task ${t.done ? 'done' : ''}"><div><span class="tt">${esc(t.title)}</span><div class="pr">${t.pr} · est. ${t.eff}</div></div>
      <div>${!t.accepted ? `<button class="btn ghost sm" data-act="accept" data-t="${t.id}">Accept</button>` : `<button class="btn ${t.done ? 'em' : 'ghost'} sm" data-act="done" data-t="${t.id}">${t.done ? 'Done' : 'Mark done'}</button>`}</div></div>`).join('')}
    <div class="acts"><button class="btn em sm" data-act="plan">${tasks.length ? 'Regenerate plan' : 'Generate revival plan'}</button></div></div>
  <div class="blk"><h4>Timeline</h4><ul class="tl">${p.tl.slice().sort((a, b) => a.d.localeCompare(b.d)).map(x => `<li>${esc(x.t)}<small>${esc(x.d)}</small></li>`).join('')}</ul></div>
  <div class="blk acts">
    <button class="btn ghost sm" data-act="help">${p.help ? 'Stop asking for help' : 'Looking for co-revivers'}</button>
    ${p.status !== 'revived' ? '<button class="btn em sm" data-act="revived">Mark as revived</button>' : ''}
    ${p.status !== 'archived' ? '<button class="btn ghost sm" data-act="archive">Archive</button>' : ''}
    ${p.repo ? `<a class="btn ghost sm" target="_blank" rel="noopener" href="https://github.com/${esc(p.repo)}/issues">Repo issues</a>` : ''}
    <button class="btn danger sm" data-act="delete">Remove</button></div>
  </div>`;
}
function openDetail(id) { cur = id; renderDetail(); if (!dlg.open) dlg.showModal(); dlg.scrollTop = 0; }

/* actions (event delegation) */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, p = byId(cur);
  if (a === 'add') { $('#addDlg').showModal(); return; }
  if (a === 'close') { b.closest('dialog').close(); return; }
  if (a === 'pick-revive') { $('#fSort').value = 'done'; renderGrid(); return; }
  if (a === 'open') { openDetail(b.dataset.id); return; }
  if (a === 'scan') { scanRepo(); return; }
  if (!p) return;
  if (a === 'path') { p.path = b.dataset.k; log(p, 'Chose path: ' + paths(p).find(x => x.k === p.path).name); }
  if (a === 'plan') { p.tasks = makePlan(p); log(p, 'Generated revival plan (' + p.tasks.length + ' tasks)'); }
  if (a === 'accept') { const t = p.tasks.find(x => x.id === b.dataset.t); t.accepted = true; if (p.status === 'buried') p.status = 'reviving'; log(p, 'Accepted task: ' + t.title); }
  if (a === 'done') { const t = p.tasks.find(x => x.id === b.dataset.t); t.done = !t.done; if (t.done) log(p, 'Completed: ' + t.title); store.save(); }
  if (a === 'help') { p.help = !p.help; store.save(); }
  if (a === 'revived') { const u = prompt('Live demo or repo URL (optional, must start with https://)', ''); p.live = /^https?:\/\//.test(u || '') ? u : ''; p.status = 'revived'; log(p, 'Marked revived'); toast('Moved to Resurrection stories'); }
  if (a === 'archive') { p.status = 'archived'; log(p, 'Archived'); }
  if (a === 'delete') { if (!confirm('Remove this project?')) return; projects = projects.filter(x => x.id !== p.id); store.save(); dlg.close(); refresh(); return; }
  store.save(); renderDetail(); refresh();
});
grid.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset.id) openDetail(e.target.dataset.id); });
['q', 'fLang', 'fReason', 'fSort'].forEach(id => $('#' + id).addEventListener('input', renderGrid));

/* ---------- add project + GitHub scan (public API, no token) ---------- */
let scanned = null;
async function scanRepo() {
  const f = $('#addForm'), repo = f.repo.value.trim().replace(/^https?:\/\/github\.com\//, ''), msg = $('#scanMsg');
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) { msg.textContent = 'Enter the repo as owner/repo.'; return; }
  msg.textContent = 'Scanning…';
  try {
    const r = await fetch('https://api.github.com/repos/' + repo);
    if (!r.ok) throw new Error(r.status === 404 ? 'Repo not found or private.' : 'GitHub rate limit reached. Try later.');
    const d = await r.json();
    const [rd, ct] = await Promise.all([
      fetch(`https://api.github.com/repos/${repo}/readme`).then(x => x.ok ? x.json() : null).catch(() => null),
      fetch(`https://api.github.com/repos/${repo}/contents`).then(x => x.ok ? x.json() : []).catch(() => [])
    ]);
    const names = Array.isArray(ct) ? ct.map(x => x.name.toLowerCase()) : [];
    scanned = {
      repo, ev: {
        readme: rd ? (rd.size < 600 ? 'partial' : 'good') : 'missing',
        issues: d.open_issues_count, deps: 'unknown',
        tests: names.some(n => /test|spec/.test(n)) ? true : false
      }
    };
    f.name.value ||= d.name; f.desc.value ||= d.description || '';
    f.lang.value ||= d.language || ''; f.last.value = (d.pushed_at || '').slice(0, 10);
    f.stack.value ||= [d.language, ...(d.topics || [])].filter(Boolean).join(', ');
    msg.textContent = 'Scan complete. README, open issues, test files and last push were read from GitHub. Dependencies were not scanned.';
  } catch (err) { msg.textContent = err.message || 'Scan failed.'; }
}
$('#addForm').addEventListener('submit', e => {
  const f = e.target;
  const p = {
    id: 'u' + Date.now(), name: f.name.value.trim(), desc: f.desc.value.trim(), lang: f.lang.value.trim(), cat: f.cat.value.trim(),
    last: f.last.value, reason: f.reason.value, stack: f.stack.value.split(',').map(x => x.trim()).filter(Boolean),
    done: lines(f.done.value), todo: lines(f.todo.value), status: 'buried', tasks: [],
    ev: scanned ? scanned.ev : { readme: 'unknown', issues: null, deps: 'unknown', tests: null }, repo: scanned ? scanned.repo : '',
    tl: [{ d: f.last.value, t: 'Last worked on' }, { d: today(), t: 'Added to the graveyard' }]
  };
  projects.unshift(p); store.save(); scanned = null; f.reset(); $('#scanMsg').textContent = '';
  refresh(); toast('Added to the graveyard'); location.hash = 'graveyard';
});

/* ---------- fx: hero tombstones + particles ---------- */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
(function yard() {
  const y = $('#yard'), n = innerWidth < 700 ? 6 : 11;
  for (let i = 0; i < n; i++) {
    const t = document.createElement('div'), z = Math.random(), w = 60 + z * 90;
    t.className = 'tomb';
    t.style.cssText = `left:${(i / n) * 100 + Math.random() * 6}%;width:${w}px;height:${w * 1.5}px;opacity:${.25 + z * .55};transform:translateZ(${-300 + z * 260}px);--z:${z}`;
    y.append(t);
  }
  if (reduce) return;
  addEventListener('pointermove', e => {
    const x = e.clientX / innerWidth - .5;
    $$('.tomb', y).forEach(t => t.style.transform = `translateZ(${-300 + t.style.getPropertyValue('--z') * 260}px) translateX(${x * -40 * t.style.getPropertyValue('--z')}px)`);
  }, { passive: true });
})();
(function particles() {
  if (reduce) return;
  const c = $('#fx'), g = c.getContext('2d'); let W, H, run = true;
  const N = innerWidth < 700 ? 22 : 55, P = [];
  const size = () => { W = c.width = innerWidth; H = c.height = innerHeight; }; size(); addEventListener('resize', size);
  for (let i = 0; i < N; i++) P.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .4, v: Math.random() * .35 + .1, g: Math.random() < .35 });
  document.addEventListener('visibilitychange', () => { run = !document.hidden; if (run) loop(); });
  function loop() {
    if (!run) return; g.clearRect(0, 0, W, H);
    for (const p of P) {
      p.y -= p.v; p.x += Math.sin(p.y / 60) * .2; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      g.fillStyle = p.g ? 'rgba(207,168,81,.55)' : 'rgba(52,199,150,.5)';
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.3); g.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

refresh();
