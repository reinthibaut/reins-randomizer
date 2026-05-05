const TemplateView = (function () {
  async function render(templateId) {
    document.getElementById('screen-template-view').innerHTML = '<h1>Template</h1>';
  }
  return { render };
})();
