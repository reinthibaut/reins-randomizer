const HomeScreen = (function () {
  async function render() {
    const templates = await Data.loadTemplates();
    const nameSets = await Data.loadNameSets();
    const nameSetMap = Object.fromEntries(nameSets.map(ns => [ns.id, ns.name]));

    const cardsHtml = templates.length === 0
      ? '<p>Geen templates. Maak er een aan via de knop hieronder.</p>'
      : templates.map(t => `
          <div class="card" onclick="TemplateView.render('${t.id}'); App.showScreen('template-view')">
            <strong>${t.name}</strong>
            <span class="tag">${nameSetMap[t.nameSetId] || 'Geen naam set'}</span>
            <span class="tag">${t.tasks.length} taken</span>
          </div>
        `).join('');

    document.getElementById('screen-home').innerHTML = `
      <h1>Classroom Randomizer</h1>
      ${cardsHtml}
      <div class="flex-row mt">
        <button class="primary" onclick="TemplateEditor.render(null); App.showScreen('template-editor')">
          + Nieuw template
        </button>
      </div>
    `;
  }

  return { render };
})();
