// All functions are async because window.api uses IPC (async under the hood).
const Data = (function () {
  async function loadNameSets() {
    return window.api.readNameSets();
  }
  async function saveNameSets(data) {
    return window.api.writeNameSets(data);
  }

  async function loadTemplates() {
    return window.api.readTemplates();
  }
  async function saveTemplates(data) {
    return window.api.writeTemplates(data);
  }

  async function loadHistory() {
    return window.api.readHistory();
  }
  async function saveHistory(data) {
    return window.api.writeHistory(data);
  }

  // Returns the history entry for a given templateId, or null.
  async function getHistoryForTemplate(templateId) {
    const history = await loadHistory();
    return history.find(h => h.templateId === templateId) || null;
  }

  // Upserts the history entry for a template (replaces if exists, adds if not).
  async function saveHistoryForTemplate(templateId, entry) {
    const history = await loadHistory();
    const index = history.findIndex(h => h.templateId === templateId);
    if (index === -1) {
      history.push({ templateId, ...entry });
    } else {
      history[index] = { templateId, ...entry };
    }
    await saveHistory(history);
  }

  return {
    loadNameSets, saveNameSets,
    loadTemplates, saveTemplates,
    loadHistory, saveHistory,
    getHistoryForTemplate, saveHistoryForTemplate,
  };
})();
