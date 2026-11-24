// Common JavaScript for Anton Mykhailov developer portal & TDscript subpages

function setLang(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'btn-' + lang);
  });
  document.querySelectorAll('.lang-view').forEach(view => {
    view.classList.toggle('active', view.id === 'view-' + lang);
  });
  document.documentElement.lang = lang;
  try {
    localStorage.setItem('tdroid_site_lang', lang);
  } catch(e) {}
}

// Auto-detect or restore preferred language
(function() {
  try {
    var saved = localStorage.getItem('tdroid_site_lang');
    if (saved && ['ru', 'en', 'de', 'uk'].indexOf(saved) !== -1) {
      setLang(saved);
      return;
    }
  } catch(e) {}
  var nav = (navigator.language || navigator.userLanguage || 'ru').toLowerCase();
  if (nav.indexOf('uk') === 0) setLang('uk');
  else if (nav.indexOf('de') === 0) setLang('de');
  else if (nav.indexOf('en') === 0) setLang('en');
  else setLang('ru');
})();

// Switch tabs for version comparison (e.g. v1.4.0 vs v1.0.1)
function switchTab(containerId, tabName) {
  var container = document.getElementById(containerId);
  if (!container) return;
  
  var buttons = container.querySelectorAll('.tab-btn');
  buttons.forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
  });
  
  var panes = container.querySelectorAll('.tab-pane');
  panes.forEach(function(pane) {
    pane.classList.toggle('active', pane.getAttribute('data-tab') === tabName);
  });
}
