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
  if (panes.length === 0 && container.parentElement) {
    panes = container.parentElement.querySelectorAll('.tab-pane');
  }
  panes.forEach(function(pane) {
    pane.classList.toggle('active', pane.getAttribute('data-tab') === tabName);
  });
}

// Switch code tabs (e.g. TDscript vs Python vs C++ in ai-language.html)
function openCodeTab(evt, tabId) {
  var e = evt || window.event;
  var currentBtn = e ? (e.currentTarget || e.target) : null;
  var container = currentBtn ? currentBtn.closest('.code-tabs') : null;
  var root = container || document;

  var buttons = root.querySelectorAll('.tab-btn');
  buttons.forEach(function(btn) {
    btn.classList.remove('active');
  });

  var panes = root.querySelectorAll('.code-tab-content, .tab-pane');
  panes.forEach(function(pane) {
    pane.classList.remove('active');
  });

  if (currentBtn) {
    currentBtn.classList.add('active');
  }

  var target = document.getElementById(tabId);
  if (target) {
    target.classList.add('active');
  }
}

