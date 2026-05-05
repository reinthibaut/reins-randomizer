const NamesetManager = (function () {
  let editingId = null;
  let vacations = [];

  async function render() {
    const nameSets = await Data.loadNameSets();
    const templates = await Data.loadTemplates();

    const listHtml = nameSets.map(ns => {
      const usedBy = templates.filter(t => t.nameSetId === ns.id).map(t => t.name);
      return `
        <div class="card">
          <strong>${ns.name}</strong>
          <span class="tag">${ns.entries.length} namen</span>
          ${usedBy.length > 0 ? `<span class="tag">Gebruikt door: ${usedBy.join(', ')}</span>` : ''}
          <div class="flex-row mt">
            <button onclick="NamesetManager.startEdit('${ns.id}')">Bewerken</button>
            <button class="danger" onclick="NamesetManager.deleteSet('${ns.id}')">Verwijderen</button>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('screen-nameset-manager').innerHTML = `
      <h1>Naam sets</h1>
      ${listHtml}
      <div class="mt">
        <button class="primary" onclick="NamesetManager.startCreate()">+ Nieuwe naam set</button>
      </div>
      <div id="nameset-form" class="hidden"></div>
    `;
  }

  function startCreate() {
    editingId = null;
    showForm({ id: null, name: '', entries: [] });
  }

  async function startEdit(id) {
    const nameSets = await Data.loadNameSets();
    const ns = nameSets.find(n => n.id === id);
    if (!ns) return;
    editingId = id;
    showForm(ns);
  }

  function showForm(ns) {
    const entriesHtml = ns.entries.map((e, i) => `
      <div class="flex-row">
        <input type="text" id="entry-${i}" value="${e}" />
        <button onclick="NamesetManager.removeEntry(${i})">x</button>
      </div>
    `).join('');

    document.getElementById('nameset-form').innerHTML = `
      <h2>${ns.id ? 'Bewerken' : 'Nieuwe naam set'}</h2>
      <div class="form-group">
        <label>Naam van de set</label>
        <input type="text" id="ns-name" value="${ns.name}" />
      </div>
      <div class="form-group">
        <label>Namen</label>
        <div id="entries-list">${entriesHtml}</div>
        <button onclick="NamesetManager.addEntry()">+ Naam toevoegen</button>
      </div>
      <div class="flex-row mt">
        <button class="primary" onclick="NamesetManager.save()">Opslaan</button>
        <button onclick="NamesetManager.render()">Annuleren</button>
      </div>
    `;
    document.getElementById('nameset-form').classList.remove('hidden');
  }

  function addEntry() {
    const list = document.getElementById('entries-list');
    const i = list.children.length;
    const div = document.createElement('div');
    div.className = 'flex-row';
    div.innerHTML = `
      <input type="text" id="entry-${i}" value="" />
      <button onclick="NamesetManager.removeEntry(${i})">x</button>
    `;
    list.appendChild(div);
  }

  function removeEntry(i) {
    const input = document.getElementById('entry-' + i);
    if (input) input.closest('.flex-row').remove();
  }

  async function save() {
    const name = document.getElementById('ns-name').value.trim();
    if (!name) { alert('Geef de naam set een naam.'); return; }

    const inputs = document.querySelectorAll('#entries-list input');
    const entries = [...inputs].map(i => i.value.trim()).filter(v => v.length > 0);
    if (entries.length === 0) { alert('Voeg minstens één naam toe.'); return; }

    const nameSets = await Data.loadNameSets();

    if (editingId) {
      const index = nameSets.findIndex(ns => ns.id === editingId);
      nameSets[index] = { ...nameSets[index], name, entries };
      await Data.saveNameSets(nameSets);
      await regenerateForNameSet(editingId, entries);
    } else {
      nameSets.push({ id: Utils.generateId(), name, entries });
      await Data.saveNameSets(nameSets);
    }

    await render();
  }

  async function regenerateForNameSet(nameSetId, entries) {
    const templates = await Data.loadTemplates();
    const affected = templates.filter(t => t.nameSetId === nameSetId);
    for (const template of affected) {
      const existing = await Data.getHistoryForTemplate(template.id);
      const completed = existing ? existing.schedule.filter(s => s.status === 'completed') : [];
      const { schedule, pickCounts } = Scheduler.generateSchedule(template, entries, completed);
      await Data.saveHistoryForTemplate(template.id, { schedule, pickCounts });
    }
  }

  async function deleteSet(id) {
    const templates = await Data.loadTemplates();
    const usedBy = templates.filter(t => t.nameSetId === id).map(t => t.name);
    if (usedBy.length > 0) {
      alert(`Kan niet verwijderen. Deze naam set wordt gebruikt door: ${usedBy.join(', ')}`);
      return;
    }
    if (!confirm('Naam set verwijderen?')) return;
    const nameSets = await Data.loadNameSets();
    await Data.saveNameSets(nameSets.filter(ns => ns.id !== id));
    await render();
  }

  return { render, startCreate, startEdit, addEntry, removeEntry, save, deleteSet };
})();
