const RandomizerScreen = (function () {
  async function render() {
    const nameSets = await Data.loadNameSets();

    const nsOptions = nameSets.length === 0
      ? '<option value="">Geen naam sets — maak er eerst een aan</option>'
      : nameSets.map(ns => `<option value="${ns.id}">${ns.name} (${ns.entries.length} namen)</option>`).join('');

    document.getElementById('screen-randomizer').innerHTML = `
      <h1>Willekeurige keuze</h1>

      <div class="form-group">
        <label>Naam set</label>
        <select id="r-nameset">${nsOptions}</select>
      </div>

      <div class="form-group">
        <label>Aantal te kiezen</label>
        <input type="number" id="r-count" value="1" min="1" style="width:80px" />
      </div>

      <button class="primary" onclick="RandomizerScreen.pick()">Kies willekeurig</button>

      <div id="r-result" style="margin-top:20px;font-size:1.4em;font-weight:bold;"></div>
    `;
  }

  async function pick() {
    const nameSetId = document.getElementById('r-nameset').value;
    const count = parseInt(document.getElementById('r-count').value, 10);

    if (!nameSetId) { alert('Kies een naam set.'); return; }
    if (isNaN(count) || count < 1) { alert('Voer een geldig aantal in.'); return; }

    const nameSets = await Data.loadNameSets();
    const ns = nameSets.find(n => n.id === nameSetId);
    if (!ns || ns.entries.length === 0) { alert('Naam set is leeg.'); return; }

    const available = [...ns.entries];
    const n = Math.min(count, available.length);
    const picked = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * available.length);
      picked.push(available.splice(idx, 1)[0]);
    }

    document.getElementById('r-result').textContent = picked.join(', ');
  }

  return { render, pick };
})();
