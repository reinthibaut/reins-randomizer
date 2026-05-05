const HomeScreen = (function () {
  async function render() {
    document.getElementById('screen-home').innerHTML = '<h1>Home</h1><p>Laden...</p>';
  }
  return { render };
})();
