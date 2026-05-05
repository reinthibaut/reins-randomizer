const TemplateEditor = (function () {
  let editingId = null;
  let vacations = [];

  const DAY_LABELS = ['', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  const BELGIAN_VACATIONS = [
    { name: 'Herfstvakantie',  from: '2025-10-27', to: '2025-11-02' },
    { name: 'Kerstvakantie',   from: '2025-12-22', to: '2026-01-04' },
    { name: 'Krokusvakantie',  from: '2026-02-16', to: '2026-02-22' },
    { name: 'Paasvakantie',    from: '2026-04-06', to: '2026-04-19' },
    { name: 'Zomervakantie',   from: '2026-07-01', to: '2026-08-31' },
  ];

  async function render(templateId) {
    editingId = templateId;
    const nameSets = await Data.loadNameSets();

    let t = { name: '', nameSetId: '', tasks: [], scheduleDays: [], schoolYearStart: '', schoolYearEnd: '', vacations: [], trackingMode: 'fair' };
    if (templateId) {
      const templates = await Data.loadTemplates();
      t = templates.find(x => x.id === templateId) || t;
    }
    vacations = [...(t.vacations || [])];

    const nsOptions = nameSets.map(ns =>
      `<option value="${ns.id}" ${ns.id === t.nameSetId ? 'selected' : ''}>${ns.name}</option>`
    ).join('');

    const tasksHtml = t.tasks.map((task, i) => `
      <div class="flex-row">
        <input type="text" id="task-${i}" value="${task}" />
        <button onclick="TemplateEditor.removeTask(${i})">x</button>
      </div>
    `).join('');

    const daysHtml = [1,2,3,4,5,6,7].map(d => `
      <label style="display:inline-flex;gap:4px;margin-right:10px;">
        <input type="checkbox" name="day" value="${d}" ${t.scheduleDays.includes(d) ? 'checked' : ''} />
        ${DAY_LABELS[d]}
      </label>
    `).join('');

    document.getElementById('screen-template-editor').innerHTML = `
      <h1>${templateId ? 'Template bewerken' : 'Nieuw template'}</h1>

      <div class="form-group">
        <label>Naam</label>
        <input type="text" id="t-name" value="${t.name}" />
      </div>

      <div class="form-group">
        <label>Naam set</label>
        <select id="t-nameset">${nsOptions}</select>
      </div>

      <div class="form-group">
        <label>Taken</label>
        <div id="tasks-list">${tasksHtml}</div>
        <button onclick="TemplateEditor.addTask()">+ Taak toevoegen</button>
      </div>

      <div class="form-group">
        <label>Dagen</label>
        <div>${daysHtml}</div>
      </div>

      <div class="form-group">
        <label>Start periode</label>
        <input type="date" id="t-start" value="${t.schoolYearStart}" />
      </div>

      <div class="form-group">
        <label>Einde periode</label>
        <input type="date" id="t-end" value="${t.schoolYearEnd}" />
      </div>

      <div class="form-group">
        <label>Vakantieperiodes</label>
        <div style="margin-bottom:8px">
          <strong style="font-size:0.9em">Bekende Belgische schoolvakanties 2025–2026:</strong><br/>
          ${BELGIAN_VACATIONS.map((bv, i) => `
            <label style="display:inline-flex;gap:4px;margin-right:14px;margin-top:6px;font-weight:normal;">
              <input type="checkbox" class="bv-check" data-index="${i}"
                ${vacations.some(v => v.from === bv.from && v.to === bv.to) ? 'checked' : ''}
                onchange="TemplateEditor.toggleBelgian(${i}, this.checked)" />
              ${bv.name} (${bv.from} – ${bv.to})
            </label>
          `).join('')}
        </div>
        <div id="vacations-list"></div>
        <button onclick="TemplateEditor.addVacation()">+ Eigen datum toevoegen</button>
      </div>

      <div class="form-group">
        <label>Tracking</label>
        <select id="t-tracking">
          <option value="fair" ${t.trackingMode === 'fair' ? 'selected' : ''}>Eerlijk (bijhouden)</option>
          <option value="random" ${t.trackingMode === 'random' ? 'selected' : ''}>Puur willekeurig</option>
        </select>
      </div>

      <div class="flex-row mt">
        <button class="primary" onclick="TemplateEditor.save()">Opslaan</button>
        <button onclick="App.goHome()">Annuleren</button>
      </div>
    `;

    renderVacations();
  }

  function renderVacations() {
    const list = document.getElementById('vacations-list');
    if (!list) return;
    list.innerHTML = vacations.map((v, i) => `
      <div class="flex-row">
        <input type="date" id="vac-from-${i}" value="${v.from}" style="width:auto" />
        <span>tot</span>
        <input type="date" id="vac-to-${i}" value="${v.to}" style="width:auto" />
        <button onclick="TemplateEditor.removeVacation(${i})">x</button>
      </div>
    `).join('');
  }

  function addTask() {
    const list = document.getElementById('tasks-list');
    const i = list.children.length;
    const div = document.createElement('div');
    div.className = 'flex-row';
    div.innerHTML = `<input type="text" id="task-${i}" value="" /><button onclick="TemplateEditor.removeTask(${i})">x</button>`;
    list.appendChild(div);
  }

  function removeTask(i) {
    const el = document.getElementById('task-' + i);
    if (el) el.closest('.flex-row').remove();
  }

  function addVacation() {
    vacations.push({ from: '', to: '' });
    renderVacations();
  }

  function removeVacation(i) {
    vacations.splice(i, 1);
    renderVacations();
  }

  async function save() {
    const name = document.getElementById('t-name').value.trim();
    if (!name) { alert('Geef het template een naam.'); return; }

    const nameSetId = document.getElementById('t-nameset').value;
    if (!nameSetId) { alert('Kies een naam set.'); return; }

    const taskInputs = document.querySelectorAll('#tasks-list input');
    const tasks = [...taskInputs].map(i => i.value.trim()).filter(v => v.length > 0);
    if (tasks.length === 0) { alert('Voeg minstens één taak toe.'); return; }

    const selectedDays = [...document.querySelectorAll('input[name="day"]:checked')].map(cb => Number(cb.value));
    if (selectedDays.length === 0) { alert('Kies minstens één dag.'); return; }

    const schoolYearStart = document.getElementById('t-start').value;
    const schoolYearEnd = document.getElementById('t-end').value;
    if (!schoolYearStart || !schoolYearEnd) { alert('Vul start- en einddatum in.'); return; }

    const savedVacations = vacations.map((_, i) => ({
      from: document.getElementById('vac-from-' + i)?.value || '',
      to:   document.getElementById('vac-to-' + i)?.value || '',
    })).filter(v => v.from && v.to);

    const trackingMode = document.getElementById('t-tracking').value;

    const template = { name, nameSetId, tasks, scheduleDays: selectedDays, schoolYearStart, schoolYearEnd, vacations: savedVacations, trackingMode };

    const templates = await Data.loadTemplates();

    if (editingId) {
      const index = templates.findIndex(t => t.id === editingId);
      templates[index] = { ...templates[index], ...template };
    } else {
      template.id = Utils.generateId();
      templates.push(template);
    }
    await Data.saveTemplates(templates);

    const nameSets = await Data.loadNameSets();
    const ns = nameSets.find(n => n.id === nameSetId);
    const entries = ns ? ns.entries : [];

    const id = editingId || template.id;
    const existing = await Data.getHistoryForTemplate(id);
    const completed = existing ? existing.schedule.filter(s => s.status === 'completed') : [];
    const { schedule, pickCounts } = Scheduler.generateSchedule(template, entries, completed);
    await Data.saveHistoryForTemplate(id, { schedule, pickCounts });

    App.goHome();
  }

  function toggleBelgian(index, checked) {
    const bv = BELGIAN_VACATIONS[index];
    if (checked) {
      if (!vacations.some(v => v.from === bv.from && v.to === bv.to)) {
        vacations.push({ from: bv.from, to: bv.to });
      }
    } else {
      const i = vacations.findIndex(v => v.from === bv.from && v.to === bv.to);
      if (i !== -1) vacations.splice(i, 1);
    }
    renderVacations();
  }

  return { render, addTask, removeTask, addVacation, removeVacation, save, toggleBelgian };
})();
