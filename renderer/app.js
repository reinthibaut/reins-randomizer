const App = (function () {
  function showScreen(name) {
    document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
    document.getElementById('screen-' + name).classList.remove('hidden');
  }

  function goHome() {
    showScreen('home');
    HomeScreen.render();
  }

  async function init() {
    document.getElementById('nav-randomizer').onclick = () => {
      RandomizerScreen.render();
      showScreen('randomizer');
    };
    document.getElementById('nav-nameset').onclick = () => {
      NamesetManager.render();
      showScreen('nameset-manager');
    };
    document.getElementById('nav-groups').onclick = () => {
      Groups.render();
      showScreen('groups');
    };

    await HomeScreen.render();
    showScreen('home');
  }

  return { showScreen, goHome, init };
})();

window.addEventListener('DOMContentLoaded', () => App.init());
