/**
 * dossier.js — Shared persistent shell for SyncPilot Investigative Dossier
 * Detects /de/ subfolder for German version. Injects nav/menu/footer on every page.
 * Each page: <body data-page="profile"> + <script defer src="[../]data/dossier.js">
 * To add a page: edit manifest.json. To translate: mirror HTML into /de/.
 */
;(function () {
  'use strict';

  var FLAG_US = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" class="flag-icon"><rect width="60" height="30" fill="#fff"/><g fill="#B22234"><rect y="0" width="60" height="2.31"/><rect y="4.62" width="60" height="2.31"/><rect y="9.23" width="60" height="2.31"/><rect y="13.85" width="60" height="2.31"/><rect y="18.46" width="60" height="2.31"/><rect y="23.08" width="60" height="2.31"/><rect y="27.69" width="60" height="2.31"/></g><rect width="24" height="16.15" fill="#3C3B6E"/><g fill="#fff" font-size="2" font-family="sans-serif"><text x="2" y="3">\u2605 \u2605 \u2605 \u2605 \u2605 \u2605</text><text x="4" y="5.5">\u2605 \u2605 \u2605 \u2605 \u2605</text><text x="2" y="8">\u2605 \u2605 \u2605 \u2605 \u2605 \u2605</text><text x="4" y="10.5">\u2605 \u2605 \u2605 \u2605 \u2605</text><text x="2" y="13">\u2605 \u2605 \u2605 \u2605 \u2605 \u2605</text></g></svg>';
  var FLAG_DE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" class="flag-icon"><rect width="5" height="3" fill="#FFCE00"/><rect width="5" height="2" fill="#DD0000"/><rect width="5" height="1" fill="#000"/></svg>';

  // Detect language from path
  var isDE = /\/de\//.test(window.location.pathname);
  var lang = isDE ? 'de' : 'en';
  var prefix = isDE ? '../' : '';  // path prefix for shared assets
  var langPrefix = isDE ? '' : 'de/';  // prefix to reach the OTHER language
  var selfPrefix = isDE ? 'de/' : '';   // prefix for current language links from root

  var pageId = document.body.getAttribute('data-page') || '';
  var isIndex = pageId === 'index';

  fetch(prefix + 'manifest.json')
    .then(function (r) { return r.json(); })
    .then(function (m) { build(m); })
    .catch(function (e) { console.warn('[dossier.js]', e); });

  function build(m) {
    var flat = [];
    m.sections.forEach(function (s) { s.pages.forEach(function (p) { flat.push(p); }); });

    injectNav(m);
    injectSideMenu(m);
    if (!isIndex) injectChapterNav(flat);
    injectFooter(m);

    document.documentElement.lang = lang;
  }

  /* ═══════════════════════════════════════════════════════════
     NAV BAR
     ═══════════════════════════════════════════════════════════ */
  function injectNav(m) {
    var nav = document.createElement('nav');
    nav.className = 'site-nav';
    var left = document.createElement('div'); left.className = 'nav-left';

    var ham = document.createElement('button'); ham.className = 'hamburger'; ham.id = 'menuToggle';
    ham.setAttribute('aria-label', 'Menu'); ham.innerHTML = '<span></span><span></span><span></span>';
    left.appendChild(ham);

    var t = document.createElement('a'); t.className = 'nav-title';
    t.href = (isDE ? '' : '') + 'index.html';
    t.textContent = lang === 'de' ? m.site.title.de : m.site.title.en;
    left.appendChild(t);

    // Language toggle — links to the other language version of the CURRENT page
    var right = document.createElement('div'); right.className = 'nav-right';
    var tog = document.createElement('div'); tog.className = 'lang-toggle';

    var currentFile = pageId === 'index' ? 'index.html' : (pageId + '.html');

    var enBtn = document.createElement('a');
    enBtn.className = 'lang-btn' + (lang === 'en' ? ' active' : '');
    enBtn.href = isDE ? '../' + currentFile : currentFile;
    enBtn.setAttribute('aria-label', 'English');
    enBtn.innerHTML = FLAG_US;

    var sep = document.createElement('span'); sep.className = 'lang-sep'; sep.textContent = '\u00b7';

    var deBtn = document.createElement('a');
    deBtn.className = 'lang-btn' + (lang === 'de' ? ' active' : '');
    deBtn.href = isDE ? currentFile : 'de/' + currentFile;
    deBtn.setAttribute('aria-label', 'Deutsch');
    deBtn.innerHTML = FLAG_DE;

    tog.appendChild(enBtn); tog.appendChild(sep); tog.appendChild(deBtn);
    right.appendChild(tog);
    nav.appendChild(left); nav.appendChild(right);
    document.body.insertBefore(nav, document.body.firstChild);
  }

  /* ═══════════════════════════════════════════════════════════
     SIDE MENU
     ═══════════════════════════════════════════════════════════ */
  function injectSideMenu(m) {
    var lk = lang === 'de' ? 'de' : 'en';
    var aside = document.createElement('aside'); aside.className = 'side-menu'; aside.id = 'sideMenu';

    var home = document.createElement('a');
    home.href = 'index.html';
    home.className = 'menu-link' + (isIndex ? ' active' : '');
    home.textContent = lang === 'de' ? 'Dossier Startseite' : 'Dossier Home';
    aside.appendChild(home);

    m.sections.forEach(function (sec) {
      var lbl = document.createElement('div'); lbl.className = 'menu-group-label';
      lbl.textContent = sec.label[lk] || sec.label.en;
      aside.appendChild(lbl);
      sec.pages.forEach(function (p) {
        var a = document.createElement('a');
        a.href = p.file;
        a.className = 'menu-link' + (p.id === pageId ? ' active' : '');
        var title = p.title[lk] || p.title.en;
        a.textContent = title;
        aside.appendChild(a);
      });
    });

    document.body.insertBefore(aside, document.body.children[1] || null);
    var ov = document.createElement('div'); ov.className = 'side-menu-overlay'; ov.id = 'menuOverlay';
    document.body.insertBefore(ov, aside.nextSibling);

    var btn = document.getElementById('menuToggle');
    function toggle() { btn.classList.toggle('active'); aside.classList.toggle('open'); ov.classList.toggle('visible'); }
    btn.addEventListener('click', toggle); ov.addEventListener('click', toggle);
  }

  /* ═══════════════════════════════════════════════════════════
     CHAPTER NAV
     ═══════════════════════════════════════════════════════════ */
  function injectChapterNav(flat) {
    var lk = lang === 'de' ? 'de' : 'en';
    var idx = -1;
    for (var i = 0; i < flat.length; i++) { if (flat[i].id === pageId) { idx = i; break; } }
    if (idx === -1) return;
    var prev = idx > 0 ? flat[idx-1] : null, next = idx < flat.length-1 ? flat[idx+1] : null;

    var navEl = document.createElement('div'); navEl.className = 'chapter-nav';
    if (prev) {
      var pa = document.createElement('a'); pa.href = prev.file; pa.className = 'prev';
      pa.textContent = prev.title[lk]||prev.title.en;
      navEl.appendChild(pa);
    } else {
      var ha = document.createElement('a'); ha.href = 'index.html'; ha.className = 'prev';
      ha.textContent = lang === 'de' ? 'Dossier Startseite' : 'Dossier Home';
      navEl.appendChild(ha);
    }
    if (next) {
      var na = document.createElement('a'); na.href = next.file; na.className = 'next';
      na.textContent = next.title[lk]||next.title.en;
      navEl.appendChild(na);
    }
    var art = document.querySelector('article'); if (art) art.appendChild(navEl);

    // Fixed bottom bar
    var bar = document.createElement('div'); bar.className = 'fixed-chapter-bar';
    bar.setAttribute('aria-hidden','true');
    var bi = document.createElement('div'); bi.className = 'fixed-bar-inner';
    if (prev) { var bp = document.createElement('a'); bp.href = prev.file; bp.className = 'fixed-bar-prev'; bp.textContent = '\u2190 ' + (prev.title[lk]||prev.title.en); bi.appendChild(bp); }
    else { bi.appendChild(document.createElement('span')); }
    var bc = document.createElement('span'); bc.className = 'fixed-bar-center';
    var ofWord = lang === 'de' ? 'von' : 'of';
    bc.textContent = (idx + 1) + ' ' + ofWord + ' ' + flat.length;
    bi.appendChild(bc);
    if (next) { var bn = document.createElement('a'); bn.href = next.file; bn.className = 'fixed-bar-next'; bn.textContent = (next.title[lk]||next.title.en) + ' \u2192'; bi.appendChild(bn); }
    else { bi.appendChild(document.createElement('span')); }
    bar.appendChild(bi); document.body.appendChild(bar);

    var vis = false;
    window.addEventListener('scroll', function () {
      var s = (window.scrollY || window.pageYOffset) > 300;
      if (s !== vis) { vis = s; bar.classList.toggle('visible', s); }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════════════════════════ */
  function injectFooter(m) {
    var existing = document.querySelector('.site-footer'); if (existing) existing.remove();
    var disc = (m.footer && m.footer.disclaimer) || {};
    var discText = disc[lang] || disc.en || '';
    var updLabel = lang === 'de' ? 'Zuletzt aktualisiert' : 'Last updated';
    var cookieText = lang === 'de' ? 'Ohne Cookies \u00b7 Keine Datenerhebung' : 'Cookie-free \u00b7 No personal data collected';

    var contactTitle = lang === 'de' ? 'Sichere Kontaktaufnahme' : 'Secure Contact';
    var contactBody = lang === 'de'
      ? 'Wenn Sie Informationen \u00fcber SyncPilot, dessen Gesellschafter oder verbundene Unternehmen haben, m\u00f6chten wir von Ihnen h\u00f6ren. Wir sch\u00fctzen unsere Quellen.'
      : 'If you have information about SyncPilot, its shareholders, or related entities, we want to hear from you. We protect our sources.';
    var emailLabel = lang === 'de' ? 'Verschl\u00fcsselte E-Mail' : 'Encrypted email';
    var contactEmail = (m.footer && m.footer.contact_email) || 'syncpilot-dossier@proton.me';

    var f = document.createElement('footer'); f.className = 'site-footer';
    f.innerHTML = '<div class="footer-inner">' +
      '<div class="footer-contact">' +
        '<div class="footer-contact-title">' + contactTitle + '</div>' +
        '<p class="footer-contact-body">' + contactBody + '</p>' +
        '<p class="footer-contact-email">' + emailLabel + ': <a href="mailto:' + esc(contactEmail) + '">' + esc(contactEmail) + '</a></p>' +
      '</div>' +
      '<div class="footer-meta">' +
        '<span>' + updLabel + ': ' + esc(m.site.updated) + '</span>' +
        '<span style="color:rgba(255,241,229,0.55);">' + esc(discText) + '</span>' +
        '<span>' + cookieText + '</span>' +
      '</div></div>';
    document.body.appendChild(f);
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
})();
