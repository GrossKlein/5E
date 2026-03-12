/**
 * dossier.js — Shared persistent shell for SyncPilot Investigative Dossier
 * Reads manifest.json, injects nav/menu/footer on EVERY page.
 * Each page: <body data-page="profile"> + <script defer src="data/dossier.js">
 * To add a page: edit manifest.json. Zero other files change.
 */
;(function () {
  'use strict';

  var FLAG_US = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" class="flag-icon"><rect width="60" height="30" fill="#fff"/><g fill="#B22234"><rect y="0" width="60" height="2.31"/><rect y="4.62" width="60" height="2.31"/><rect y="9.23" width="60" height="2.31"/><rect y="13.85" width="60" height="2.31"/><rect y="18.46" width="60" height="2.31"/><rect y="23.08" width="60" height="2.31"/><rect y="27.69" width="60" height="2.31"/></g><rect width="24" height="16.15" fill="#3C3B6E"/><g fill="#fff" font-size="2" font-family="sans-serif"><text x="2" y="3">\u2605 \u2605 \u2605 \u2605 \u2605 \u2605</text><text x="4" y="5.5">\u2605 \u2605 \u2605 \u2605 \u2605</text><text x="2" y="8">\u2605 \u2605 \u2605 \u2605 \u2605 \u2605</text><text x="4" y="10.5">\u2605 \u2605 \u2605 \u2605 \u2605</text><text x="2" y="13">\u2605 \u2605 \u2605 \u2605 \u2605 \u2605</text></g></svg>';
  var FLAG_DE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" class="flag-icon"><rect width="5" height="3" fill="#FFCE00"/><rect width="5" height="2" fill="#DD0000"/><rect width="5" height="1" fill="#000"/></svg>';

  var pageId = document.body.getAttribute('data-page') || '';
  var isIndex = pageId === 'index';

  fetch('manifest.json')
    .then(function (r) { return r.json(); })
    .then(function (m) { build(m); })
    .catch(function (e) { console.warn('[dossier.js]', e); });

  function build(m) {
    var flat = [];
    m.sections.forEach(function (s) { s.pages.forEach(function (p) { flat.push(p); }); });
    var lang = (function () { try { return localStorage.getItem('dossier-lang') || 'en'; } catch (e) { return 'en'; } })();

    injectNav(m);
    injectSideMenu(m);
    if (!isIndex) injectChapterNav(flat);
    injectFooter(m);
    applyLang(lang);
  }

  function applyLang(lang) {
    document.body.classList.toggle('lang-de', lang === 'de');
    document.documentElement.lang = lang;
    var en = document.getElementById('langEN'), de = document.getElementById('langDE');
    if (en) en.classList.toggle('active', lang === 'en');
    if (de) de.classList.toggle('active', lang === 'de');
  }
  function setLang(l) { try { localStorage.setItem('dossier-lang', l); } catch (e) {} applyLang(l); }

  function injectNav(m) {
    var nav = document.createElement('nav');
    nav.className = 'site-nav';
    var left = document.createElement('div'); left.className = 'nav-left';
    var ham = document.createElement('button'); ham.className = 'hamburger'; ham.id = 'menuToggle';
    ham.setAttribute('aria-label', 'Menu'); ham.innerHTML = '<span></span><span></span><span></span>';
    left.appendChild(ham);
    var t = document.createElement('a'); t.className = 'nav-title'; t.href = 'index.html';
    t.textContent = m.site.title.en; left.appendChild(t);

    var right = document.createElement('div'); right.className = 'nav-right';
    var tog = document.createElement('div'); tog.className = 'lang-toggle';
    var enB = document.createElement('button'); enB.id = 'langEN'; enB.className = 'lang-btn';
    enB.setAttribute('aria-label','English'); enB.innerHTML = FLAG_US;
    enB.addEventListener('click', function () { setLang('en'); });
    var sep = document.createElement('span'); sep.className = 'lang-sep'; sep.textContent = '\u00b7';
    var deB = document.createElement('button'); deB.id = 'langDE'; deB.className = 'lang-btn';
    deB.setAttribute('aria-label','Deutsch'); deB.innerHTML = FLAG_DE;
    deB.addEventListener('click', function () { setLang('de'); });
    tog.appendChild(enB); tog.appendChild(sep); tog.appendChild(deB);
    right.appendChild(tog);
    nav.appendChild(left); nav.appendChild(right);
    document.body.insertBefore(nav, document.body.firstChild);
  }

  function injectSideMenu(m) {
    var aside = document.createElement('aside'); aside.className = 'side-menu'; aside.id = 'sideMenu';
    var home = document.createElement('a'); home.href = 'index.html';
    home.className = 'menu-link' + (isIndex ? ' active' : '');
    home.textContent = 'Dossier Home'; aside.appendChild(home);

    m.sections.forEach(function (sec) {
      var lbl = document.createElement('div'); lbl.className = 'menu-group-label';
      lbl.textContent = sec.label.en; aside.appendChild(lbl);
      sec.pages.forEach(function (p) {
        var a = document.createElement('a'); a.href = p.file;
        a.className = 'menu-link' + (p.id === pageId ? ' active' : '');
        a.innerHTML = '<span class="ch-num">' + esc(p.short.en) + '</span>' + esc(p.title.en);
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

  function injectChapterNav(flat) {
    var idx = -1;
    for (var i = 0; i < flat.length; i++) { if (flat[i].id === pageId) { idx = i; break; } }
    if (idx === -1) return;
    var prev = idx > 0 ? flat[idx-1] : null, next = idx < flat.length-1 ? flat[idx+1] : null;

    var navEl = document.createElement('div'); navEl.className = 'chapter-nav';
    if (prev) {
      var pa = document.createElement('a'); pa.href = prev.file; pa.className = 'prev';
      pa.textContent = prev.short.en + ': ' + prev.title.en; navEl.appendChild(pa);
    } else {
      var ha = document.createElement('a'); ha.href = 'index.html'; ha.className = 'prev';
      ha.textContent = 'Dossier Home'; navEl.appendChild(ha);
    }
    if (next) {
      var na = document.createElement('a'); na.href = next.file; na.className = 'next';
      na.textContent = next.short.en + ': ' + next.title.en; navEl.appendChild(na);
    }
    var art = document.querySelector('article'); if (art) art.appendChild(navEl);

    // Fixed bottom bar
    var bar = document.createElement('div'); bar.className = 'fixed-chapter-bar';
    bar.setAttribute('aria-hidden','true');
    var bi = document.createElement('div'); bi.className = 'fixed-bar-inner';
    if (prev) { var bp = document.createElement('a'); bp.href = prev.file; bp.className = 'fixed-bar-prev'; bp.textContent = '\u2190 ' + prev.short.en; bi.appendChild(bp); }
    else { bi.appendChild(document.createElement('span')); }
    var bc = document.createElement('span'); bc.className = 'fixed-bar-center';
    bc.textContent = flat[idx].short.en + ' of ' + flat.length; bi.appendChild(bc);
    if (next) { var bn = document.createElement('a'); bn.href = next.file; bn.className = 'fixed-bar-next'; bn.textContent = next.short.en + ' \u2192'; bi.appendChild(bn); }
    else { bi.appendChild(document.createElement('span')); }
    bar.appendChild(bi); document.body.appendChild(bar);

    var vis = false;
    window.addEventListener('scroll', function () {
      var s = (window.scrollY || window.pageYOffset) > 300;
      if (s !== vis) { vis = s; bar.classList.toggle('visible', s); }
    }, { passive: true });
  }

  function injectFooter(m) {
    var existing = document.querySelector('.site-footer'); if (existing) existing.remove();
    var d = (m.footer && m.footer.disclaimer) ? m.footer.disclaimer.en : '';
    var f = document.createElement('footer'); f.className = 'site-footer';
    f.innerHTML = '<div class="footer-inner"><div class="footer-meta">' +
      '<span>Last updated: ' + esc(m.site.updated) + '</span>' +
      '<span style="color:rgba(255,241,229,0.55);">' + esc(d) + '</span>' +
      '<span>Cookie-free \u00b7 No personal data collected</span>' +
      '</div></div>';
    document.body.appendChild(f);
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
})();
