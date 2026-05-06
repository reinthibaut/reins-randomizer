const Groups = (function () {
  let allEntries = [];
  let absentNames = new Set();

  async function render() {
    const nameSets = await Data.loadNameSets();

    const nsOptions = nameSets.length === 0
      ? '<option value="">Geen naam sets — maak er eerst een aan</option>'
      : nameSets.map(ns =>
          `<option value="${ns.id}">${escapeHtml(ns.name)} (${ns.entries.length} namen)</option>`
        ).join('');

    document.getElementById('screen-groups').innerHTML = `
      <h1>Groepen</h1>

      <div class="form-group">
        <label>Naam set</label>
        <select id="g-nameset" onchange="Groups.onNameSetChange()">${nsOptions}</select>
      </div>

      <div class="form-group">
        <div onclick="Groups.toggleAbsent()" style="cursor:pointer;display:flex;align-items:center;gap:8px;padding:8px 0;user-select:none;">
          <span id="g-absent-arrow">▶</span>
          <strong>Afwezigheden</strong>
          <span id="g-absent-badge" style="font-size:0.85em;color:#666;font-weight:normal;"></span>
        </div>
        <div id="g-absent-list" style="display:none;padding:4px 0 4px 24px;"></div>
      </div>

      <div class="form-group">
        <label>Modus</label>
        <select id="g-mode" onchange="Groups.onModeChange()">
          <option value="count">Aantal groepen</option>
          <option value="pergroup">Personen per groep</option>
        </select>
      </div>

      <div class="form-group">
        <label id="g-value-label">Aantal groepen</label>
        <input type="number" id="g-value" value="2" min="1" style="width:80px" />
      </div>

      <div class="flex-row">
        <button class="primary" onclick="Groups.generate()">Maak groepen</button>
        <button id="g-reshuffle" style="display:none" onclick="Groups.generate()">Herschud</button>
      </div>

      <div id="g-result" style="margin-top:20px;"></div>
    `;

    await loadNameSet();
  }

  async function loadNameSet() {
    const select = document.getElementById('g-nameset');
    if (!select || !select.value) return;
    const nameSets = await Data.loadNameSets();
    const ns = nameSets.find(n => n.id === select.value);
    if (!ns) return;

    allEntries = [...ns.entries];
    absentNames = new Set();
    renderAbsentList();
    updateBadge();
  }

  function renderAbsentList() {
    const list = document.getElementById('g-absent-list');
    if (!list) return;
    list.innerHTML = allEntries.map((name, i) => `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
        <input type="checkbox" checked onchange="Groups.onAbsentToggle(${i}, this.checked)" />
        <span>${escapeHtml(name)}</span>
      </div>
    `).join('');
  }

  function onAbsentToggle(index, present) {
    const name = allEntries[index];
    if (present) {
      absentNames.delete(name);
    } else {
      absentNames.add(name);
    }
    updateBadge();
  }

  function updateBadge() {
    const badge = document.getElementById('g-absent-badge');
    if (!badge) return;
    badge.textContent = absentNames.size > 0 ? `(${absentNames.size} afwezig)` : '';
  }

  async function onNameSetChange() {
    await loadNameSet();
    document.getElementById('g-result').innerHTML = '';
    const reshuffle = document.getElementById('g-reshuffle');
    if (reshuffle) reshuffle.style.display = 'none';
  }

  function onModeChange() {
    const mode = document.getElementById('g-mode').value;
    const label = document.getElementById('g-value-label');
    if (label) label.textContent = mode === 'count' ? 'Aantal groepen' : 'Personen per groep';
  }

  function toggleAbsent() {
    const list = document.getElementById('g-absent-list');
    const arrow = document.getElementById('g-absent-arrow');
    if (!list) return;
    const isOpen = list.style.display !== 'none';
    list.style.display = isOpen ? 'none' : 'block';
    if (arrow) arrow.textContent = isOpen ? '▶' : '▼';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function splitIntoGroups(names, groupCount) {
    const shuffled = [...names];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const baseSize = Math.floor(shuffled.length / groupCount);
    const remainder = shuffled.length % groupCount;
    const groups = [];
    let idx = 0;
    for (let g = 0; g < groupCount; g++) {
      const size = baseSize + (g < remainder ? 1 : 0);
      groups.push(shuffled.slice(idx, idx + size));
      idx += size;
    }
    return groups;
  }

  function generate() {
    const activeNames = allEntries.filter(n => !absentNames.has(n));
    if (activeNames.length === 0) {
      document.getElementById('g-result').innerHTML =
        '<p style="color:#c0392b;">Selecteer minstens één persoon.</p>';
      return;
    }

    const mode = document.getElementById('g-mode').value;
    const value = Math.max(1, parseInt(document.getElementById('g-value').value, 10) || 1);

    const groupCount = mode === 'count'
      ? Math.min(value, activeNames.length)
      : Math.ceil(activeNames.length / value);

    const groups = splitIntoGroups(activeNames, groupCount);

    document.getElementById('g-result').innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:12px;">
        ${groups.map((group, i) => `
          <div class="card" style="min-width:140px;cursor:default;">
            <strong>Groep ${i + 1}</strong>
            ${group.map(name => `<div style="margin-top:4px;">${escapeHtml(name)}</div>`).join('')}
          </div>
        `).join('')}
      </div>
    `;

    const reshuffleBtn = document.getElementById('g-reshuffle');
    if (reshuffleBtn) reshuffleBtn.style.display = '';
  }

  return { render, onNameSetChange, onModeChange, toggleAbsent, onAbsentToggle, generate };
})();
