const TemplateView = (function () {
  let currentTemplateId = null;

  const TODAY = new Date().toISOString().slice(0, 10);

  async function render(templateId) {
    currentTemplateId = templateId;

    const templates = await Data.loadTemplates();
    const nameSets = await Data.loadNameSets();
    const t = templates.find(x => x.id === templateId);
    if (!t) { document.getElementById('screen-template-view').innerHTML = '<p>Template niet gevonden.</p>'; return; }

    const ns = nameSets.find(n => n.id === t.nameSetId);
    const history = await Data.getHistoryForTemplate(templateId);
    const schedule = history ? history.schedule : [];

    const todayEntry = schedule.find(s => s.date === TODAY);
    const upcomingEntries = schedule.filter(s => s.status === 'upcoming' && s.date > TODAY).slice(0, 3);

    const todayHtml = todayEntry
      ? `<div class="today-box">
          <h2>Vandaag (${TODAY})</h2>
          ${Object.entries(todayEntry.assignments).map(([task, student]) =>
            `<div class="assignment-row"><strong>${task}:</strong> ${student}</div>`
          ).join('')}
          ${todayEntry.status === 'upcoming'
            ? `<button class="primary mt" onclick="TemplateView.markDone('${templateId}', '${TODAY}')">Markeer als gedaan</button>`
            : `<span class="tag">Klaar</span>`}
        </div>`
      : `<p>Geen orde vandaag.</p>`;

    const nextHtml = upcomingEntries.length > 0
      ? `<h2>Volgende keer</h2>` + upcomingEntries.map(e =>
          `<div class="card">
            <strong>${e.date}</strong>
            ${Object.entries(e.assignments).map(([task, student]) =>
              `<div class="assignment-row"><strong>${task}:</strong> ${student}</div>`
            ).join('')}
          </div>`
        ).join('')
      : `<p>Geen toekomstige momenten.</p>`;

    const scheduleHtml = schedule.map(e =>
      `<div class="schedule-row ${e.status}">
        <span style="min-width:100px">${e.date}</span>
        <span class="tag">${e.status}</span>
        ${Object.entries(e.assignments || {}).map(([task, student]) =>
          `<span><strong>${task}:</strong> ${student}</span>`
        ).join(' | ')}
      </div>`
    ).join('');

    const pickCounts = {};
    schedule.forEach(e => {
      if (e.assignments) {
        Object.values(e.assignments).forEach(nameStr => {
          nameStr.split(', ').forEach(name => {
            pickCounts[name] = (pickCounts[name] || 0) + 1;
          });
        });
      }
    });
    const countsHtml = Object.entries(pickCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => `<div class="assignment-row"><strong>${name}:</strong> ${count}x ingepland</div>`)
      .join('');

    document.getElementById('screen-template-view').innerHTML = `
      <div class="flex-row">
        <h1>${t.name}</h1>
        <button onclick="TemplateEditor.render('${t.id}'); App.showScreen('template-editor')">Bewerken</button>
        <button onclick="TemplateView.exportTxt('${t.id}')">Exporteren</button>
        <button class="danger" onclick="TemplateView.deleteTemplate('${t.id}')">Verwijderen</button>
        <button onclick="App.goHome()">Terug</button>
      </div>
      <p>Naam set: <strong>${ns ? ns.name : '?'}</strong></p>

      ${todayHtml}
      ${nextHtml}

      <h2 style="margin-top:20px">Volledig schema</h2>
      <div>${scheduleHtml}</div>

      <h2 style="margin-top:20px">Telling</h2>
      <div class="card">${countsHtml || '<em>Nog niemand ingepland.</em>'}</div>
    `;
  }

  async function markDone(templateId, date) {
    const history = await Data.getHistoryForTemplate(templateId);
    const entry = history.schedule.find(s => s.date === date);
    if (entry) entry.status = 'completed';
    await Data.saveHistoryForTemplate(templateId, history);
    await render(templateId);
  }

  async function exportTxt(templateId) {
    const templates = await Data.loadTemplates();
    const nameSets = await Data.loadNameSets();
    const t = templates.find(x => x.id === templateId);
    if (!t) return;
    const ns = nameSets.find(n => n.id === t.nameSetId);
    const history = await Data.getHistoryForTemplate(templateId);
    const schedule = history ? history.schedule : [];

    const today = new Date().toISOString().slice(0, 10);
    const SEP = '='.repeat(44);
    const lines = [];

    lines.push(`Rein's Randomizer — ${t.name}`);
    lines.push(`Naam set: ${ns ? ns.name : '?'}`);
    lines.push(`Exportdatum: ${today}`);
    lines.push(`Periode: ${t.schoolYearStart} tot ${t.schoolYearEnd}`);
    lines.push(SEP);
    lines.push('');
    lines.push('VOLLEDIG SCHEMA');
    lines.push('-'.repeat(44));

    schedule.forEach(e => {
      const label = e.status === 'completed' ? 'gedaan' : 'gepland';
      lines.push(`${e.date}  [${label}]`);
      if (e.assignments) {
        Object.entries(e.assignments).forEach(([task, student]) => {
          lines.push(`  ${task}: ${student}`);
        });
      }
      lines.push('');
    });

    if (t.vacations && t.vacations.length > 0) {
      lines.push(SEP);
      lines.push('');
      lines.push('OVERGESLAGEN PERIODES');
      lines.push('-'.repeat(44));
      t.vacations.forEach(v => lines.push(`${v.from}  tot  ${v.to}`));
      lines.push('');
    }

    const pickCounts = {};
    schedule.forEach(e => {
      if (e.assignments) {
        Object.values(e.assignments).forEach(nameStr => {
          nameStr.split(', ').forEach(name => {
            pickCounts[name] = (pickCounts[name] || 0) + 1;
          });
        });
      }
    });

    lines.push(SEP);
    lines.push('');
    lines.push('TELLING — hoe vaak ingepland');
    lines.push('-'.repeat(44));
    Object.entries(pickCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => lines.push(`${name}: ${count}x`));

    const defaultName = `${t.name.replace(/[^a-zA-Z0-9]/g, '_')}_schema.txt`;
    await window.api.saveTextFile(lines.join('\n'), defaultName);
  }

  async function deleteTemplate(templateId) {
    if (!confirm('Template verwijderen? Dit kan niet ongedaan worden gemaakt.')) return;
    const templates = await Data.loadTemplates();
    await Data.saveTemplates(templates.filter(t => t.id !== templateId));
    const history = await Data.loadHistory();
    await Data.saveHistory(history.filter(h => h.templateId !== templateId));
    App.goHome();
  }

  return { render, markDone, deleteTemplate, exportTxt };
})();
