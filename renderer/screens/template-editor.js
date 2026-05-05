const TemplateEditor = (function () {
  async function render(templateId) {
    document.getElementById('screen-template-editor').innerHTML = '<h1>Template editor</h1>';
  }
  return { render };
})();
