/* ===== canvas.js — The Canvas Protocol =====
   Every primary action on this page is a drag-and-drop of a data card onto an Action Zone.
   There are no action buttons. Data, analysis and storage come from app.js. */
(() => {
  const NAMES = { restart: 'Restart it', continue: 'Continue it', change: 'Change the idea', repurpose: 'Repurpose it', archive: 'Archive it' };
  const board = $('#board'), tray = $('#tray');
  const say = m => { $('#status').textContent = m; toast(m); };
  let sel = new URLSearchParams(location.search).get('p');
  if (!byId(sel)) sel = projects[0] && projects[0].id;
  let scanned = null;
  const commit = () => { store.save(); draw(); };

  /* ---------- drawing ---------- */
  const taskCard = t => `<div class="tcard" data-drag="task" data-id="${t.id}"><b>${esc(t.title)}</b><small>${t.pr} · est. ${t.eff}</small></div>`;
  const zn = (zone, title, sub, extra = '') => `<div class="zone" data-zone="${zone}" data-accepts="project"><b>${title}</b><small>${sub}</small>${extra}</div>`;

  function draw() {
    tray.innerHTML = projects.map(q => `<div class="chip ${q.id === sel ? 'on' : ''}" data-pick="${q.id}" tabindex="0" role="button">${esc(q.name)}<small>${q.status}</small></div>`).join('') || '<p class="note">No projects yet. Bury one below.</p>';
    const p = byId(sel);
    if (!p) { board.innerHTML = '<p class="empty">The graveyard is empty. Fill the draft card below and drag it into the Bury zone.</p>'; return; }
    const ps = paths(p), tasks = p.tasks;
    const f = autopsy(p).filter(x => x.lvl !== 'u').slice(0, 4);
    const col = (key, title, hint, list) => `<div class="zone col" data-zone="${key}" data-accepts="task"><h4>${title}<span>${list.length}</span></h4>${list.map(taskCard).join('') || `<small>${hint}</small>`}</div>`;
    board.innerHTML = `<div class="top">
      <div class="pcard" data-drag="project" data-id="${p.id}">
        <div class="grip">⠿ Drag this card onto a zone</div>
        <h3>${esc(p.name)}${p.sample ? '<span class="sample">Sample</span>' : ''}</h3>
        <div class="meta">${esc(p.lang)} · ${esc(p.cat)} · <b>${p.status}</b></div>
        <div class="bar"><i style="width:${pct(p)}%"></i></div><div class="pct">${pct(p)}% built · stopped: ${esc(p.reason)}</div>
        <ul class="mini">${f.map(x => `<li class="${x.lvl}">${esc(x.text)}</li>`).join('')}</ul>
      </div>
      <div class="zones">
        <h4>1 · Choose a revival path</h4>
        <p class="note" style="margin-bottom:10px">Suggested: <b>${ps[0].name}</b>. ${esc(ps[0].why)}</p>
        <div class="zgrid paths5">${ps.map(x => `<div class="zone ${x.top ? 'sug' : ''} ${p.path === x.k ? 'cur' : ''}" data-zone="path" data-k="${x.k}" data-accepts="project" title="${esc(x.why)}"><b>${x.name}</b><small>${p.path === x.k ? 'Chosen' : x.top ? 'Suggested' : '&nbsp;'}</small></div>`).join('')}</div>
        <h4>2 · Other actions</h4>
        <div class="zgrid">
          ${zn('plan', 'Generate plan', 'Builds a prioritized task list from the autopsy')}
          ${zn('help', p.help ? 'Stop asking for help' : 'Ask for co-revivers', 'Toggles this project on the Co-revivers page')}
          ${zn('revived', 'Mark revived', 'Needs at least one finished task', `<input id="liveUrl" placeholder="Live URL (optional)" aria-label="Live URL" value="${esc(p.live || '')}">`)}
          ${zn('remove', 'Remove', 'Deletes this project')}
        </div>
      </div>
    </div>
    <h4 class="kh">3 · Work the plan: drag task cards between columns</h4>
    ${tasks.length ? '' : '<p class="note" style="margin-bottom:10px">No tasks yet. Drop the project card on “Generate plan”.</p>'}
    <div class="kanban">
      ${col('backlog', 'Backlog', 'Tasks wait here', tasks.filter(t => !t.accepted && !t.done))}
      ${col('accept', 'Accepted', 'Drop a task to accept it', tasks.filter(t => t.accepted && !t.done))}
      ${col('done', 'Done', 'Drop a finished task', tasks.filter(t => t.done))}
    </div>`;
  }

  const F = n => $('#draft [name="' + n + '"]');
  const v = n => F(n).value.trim();
  function drawDraft() {
    scanned = null;
    $('#draft').innerHTML = `<div class="pcard draft">
      <div class="grip" data-drag="draft">⠿ Drag this handle into a zone</div>
      <div class="dgrid">
        <label class="wide">GitHub repo (optional)<input name="repo" placeholder="owner/repo"></label>
        <label>Project name<input name="name"></label>
        <label>Main language<input name="lang" placeholder="JavaScript"></label>
        <label class="wide">What it was and what you wanted to build<textarea name="desc" rows="2"></textarea></label>
        <label>Category<input name="cat" placeholder="Web app"></label>
        <label>Last worked on<input type="date" name="last"></label>
        <label>Why you stopped<select name="reason">${REASONS.map(x => `<option>${x}</option>`).join('')}</select></label>
        <label>Tech stack (comma separated)<input name="stack"></label>
        <label>What you completed (one per line)<textarea name="done" rows="3"></textarea></label>
        <label>What is still unfinished (one per line)<textarea name="todo" rows="3"></textarea></label>
      </div></div>`;
  }

  /* ---------- zone actions ---------- */
  function onProject(p, z) {
    const k = z.dataset.zone;
    if (k === 'path') {
      const key = z.dataset.k; p.path = key;
      p.status = key === 'archive' ? 'archived' : (p.status === 'archived' ? 'buried' : p.status);
      log(p, 'Chose path: ' + NAMES[key]); say(`${p.name}: ${NAMES[key]}`);
    } else if (k === 'plan') {
      const old = new Map(p.tasks.map(t => [t.title, t]));
      p.tasks = makePlan(p).map(t => { const o = old.get(t.title); return o ? { ...t, accepted: o.accepted, done: o.done } : t; });
      log(p, 'Generated revival plan (' + p.tasks.length + ' tasks)'); say(`Plan ready: ${p.tasks.length} tasks in the backlog`);
    } else if (k === 'help') {
      p.help = !p.help; store.save(); say(p.help ? `${p.name} now appears on Co-revivers` : `${p.name} removed from Co-revivers`);
    } else if (k === 'revived') {
      if (!p.tasks.some(t => t.done)) { say('Drag at least one task to Done before reviving.'); return; }
      const u = ($('#liveUrl') || {}).value || ''; p.live = /^https?:\/\//.test(u) ? u : '';
      p.status = 'revived'; log(p, 'Marked revived'); say(`${p.name} is revived. See Resurrection stories.`);
    } else if (k === 'remove') {
      if (!confirm('Remove ' + p.name + '?')) return;
      projects = projects.filter(x => x.id !== p.id); sel = projects[0] && projects[0].id; say('Project removed');
    }
    commit();
  }
  function onTask(p, id, z) {
    const t = p.tasks.find(x => x.id === id), k = z.dataset.zone; if (!t) return;
    const cur = t.done ? 'done' : t.accepted ? 'accept' : 'backlog'; if (cur === k) return;
    t.accepted = k !== 'backlog'; t.done = k === 'done';
    if (k !== 'backlog' && p.status === 'buried') p.status = 'reviving';
    log(p, (k === 'done' ? 'Completed: ' : k === 'accept' ? 'Accepted task: ' : 'Moved back to backlog: ') + t.title);
    say(k === 'done' ? 'Task done' : k === 'accept' ? 'Task accepted' : 'Task moved to backlog');
    if (p.tasks.every(x => x.done)) say('All tasks done. Drag the project card onto “Mark revived”.');
    commit();
  }
  async function onDraft(z) {
    if (z.dataset.zone === 'scan') return scan();
    if (!v('name') || !v('desc') || !v('lang') || !v('cat') || !v('last')) { say('Fill in name, description, language, category and last-worked date, then drop again.'); return; }
    const p = {
      id: 'u' + Date.now(), name: v('name'), desc: v('desc'), lang: v('lang'), cat: v('cat'), last: v('last'), reason: F('reason').value,
      stack: v('stack').split(',').map(x => x.trim()).filter(Boolean), done: lines(F('done').value), todo: lines(F('todo').value),
      status: 'buried', tasks: [], ev: scanned ? scanned.ev : { readme: 'unknown', issues: null, deps: 'unknown', tests: null },
      repo: scanned ? scanned.repo : '', tl: [{ d: v('last'), t: 'Last worked on' }, { d: today(), t: 'Added to the graveyard' }]
    };
    projects.unshift(p); sel = p.id; drawDraft(); commit(); say(`${p.name} is buried. Now work on it above.`);
    board.scrollIntoView({ behavior: 'smooth' });
  }
  async function scan() {
    const msg = $('#scanMsg'), repo = v('repo').replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) { msg.textContent = 'Enter the repo as owner/repo, then drop on Scan again.'; return; }
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
      scanned = { repo, ev: { readme: rd ? (rd.size < 600 ? 'partial' : 'good') : 'missing', issues: d.open_issues_count, deps: 'unknown', tests: names.some(n => /test|spec/.test(n)) } };
      if (!F('name').value) F('name').value = d.name;
      if (!F('desc').value) F('desc').value = d.description || '';
      if (!F('lang').value) F('lang').value = d.language || '';
      F('last').value = (d.pushed_at || '').slice(0, 10);
      if (!F('stack').value) F('stack').value = [d.language, ...(d.topics || [])].filter(Boolean).join(', ');
      msg.textContent = 'Scan complete: README, open issues, test files and last push were read from GitHub. Dependencies were not scanned.';
      say('Scan complete. Check the fields, then drop on Bury.');
    } catch (err) { msg.textContent = err.message || 'Scan failed.'; }
  }

  /* ---------- pointer drag engine (mouse, pen and touch) ---------- */
  let d = null;
  const accepts = (z, kind) => (z.dataset.accepts || '').split(' ').includes(kind);
  function end() {
    if (!d) return;
    if (d.ghost) { d.ghost.remove(); d.src && d.src.classList.remove('lift'); }
    document.body.classList.remove('dragging');
    $$('[data-zone]').forEach(z => z.classList.remove('live', 'hot'));
    d = null;
  }
  document.addEventListener('pointerdown', e => {
    if (e.button) return;
    const h = e.target.closest('[data-drag]'); if (!h) return;
    d = { kind: h.dataset.drag, id: h.dataset.id, src: h.closest('.pcard, .tcard'), x: e.clientX, y: e.clientY, ghost: null };
  });
  document.addEventListener('pointermove', e => {
    if (!d) return;
    if (!d.ghost) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
      const p = byId(sel), g = document.createElement('div');
      g.className = 'ghost';
      g.textContent = d.kind === 'task' ? (p.tasks.find(t => t.id === d.id) || {}).title : d.kind === 'draft' ? 'New project draft' : byId(d.id).name;
      document.body.append(g); d.ghost = g; d.src.classList.add('lift');
      document.body.classList.add('dragging');
      $$('[data-zone]').forEach(z => z.classList.toggle('live', accepts(z, d.kind)));
    }
    d.ghost.style.left = e.clientX + 'px'; d.ghost.style.top = e.clientY + 'px';
    const hit = document.elementFromPoint(e.clientX, e.clientY), z = hit && hit.closest('[data-zone].live');
    $$('[data-zone]').forEach(x => x.classList.toggle('hot', x === z));
    if (e.clientY < 90) scrollBy(0, -16); else if (e.clientY > innerHeight - 90) scrollBy(0, 16);
  });
  document.addEventListener('pointerup', e => {
    if (!d) return;
    const had = d.ghost, kind = d.kind, id = d.id;
    const hit = had && document.elementFromPoint(e.clientX, e.clientY), z = hit && hit.closest('[data-zone]');
    const ok = z && accepts(z, kind);
    end();
    if (!ok) return;
    if (kind === 'project') onProject(byId(id), z);
    else if (kind === 'task') onTask(byId(sel), id, z);
    else onDraft(z);
  });
  document.addEventListener('pointercancel', end);

  /* selecting a project is navigation, not an action */
  document.addEventListener('click', e => { const c = e.target.closest('[data-pick]'); if (c) { sel = c.dataset.pick; draw(); } });
  document.addEventListener('keydown', e => { const c = e.target.closest && e.target.closest('[data-pick]'); if (c && e.key === 'Enter') { sel = c.dataset.pick; draw(); } });

  drawDraft(); draw();
})();
