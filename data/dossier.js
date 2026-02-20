/**
 * dossier.js — Shared persistent shell for SyncPilot Investigative Dossier
 * ─────────────────────────────────────────────────────────────────────────
 * Reads manifest.json once, then injects:
 *   • Top navigation bar (with hamburger + "Contents" label on index only)
 *   • 🇺🇸/🇩🇪 language toggle (inline SVGs, localStorage-persisted)
 *   • Side menu (index page only)
 *   • Prev / Next chapter navigation (all pages except index)
 *   • Compliance footer (legal, GDPR, V.i.S.d.P., DMCA, © line)
 *
 * Each page declares its identity with: <body data-page="profile">
 * and includes: <script src="dossier.js"></script> before page-specific JS.
 *
 * To add a page: edit manifest.json. Zero other files change.
 */
;(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     INLINE SVG FLAGS — US (4×3) & DE (3×2)
     Source: lipis/flag-icons (MIT). Simplified to minimal paths.
     ═══════════════════════════════════════════════════════════ */
  var FLAG_US = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" class="flag-icon">' +
    '<rect width="60" height="30" fill="#fff"/>' +
    '<g fill="#B22234">' +
    '<rect y="0" width="60" height="2.31"/>' +
    '<rect y="4.62" width="60" height="2.31"/>' +
    '<rect y="9.23" width="60" height="2.31"/>' +
    '<rect y="13.85" width="60" height="2.31"/>' +
    '<rect y="18.46" width="60" height="2.31"/>' +
    '<rect y="23.08" width="60" height="2.31"/>' +
    '<rect y="27.69" width="60" height="2.31"/>' +
    '</g>' +
    '<rect width="24" height="16.15" fill="#3C3B6E"/>' +
    '<g fill="#fff" font-size="2" font-family="sans-serif">' +
    '<text x="2" y="3">★ ★ ★ ★ ★ ★</text>' +
    '<text x="4" y="5.5">★ ★ ★ ★ ★</text>' +
    '<text x="2" y="8">★ ★ ★ ★ ★ ★</text>' +
    '<text x="4" y="10.5">★ ★ ★ ★ ★</text>' +
    '<text x="2" y="13">★ ★ ★ ★ ★ ★</text>' +
    '</g></svg>';

  var FLAG_DE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" class="flag-icon">' +
    '<rect width="5" height="3" fill="#FFCE00"/>' +
    '<rect width="5" height="2" fill="#DD0000"/>' +
    '<rect width="5" height="1" fill="#000"/>' +
    '</svg>';


  /* ═══════════════════════════════════════════════════════════
     BOOT
     ═══════════════════════════════════════════════════════════ */
  var pageId = document.body.getAttribute('data-page') || '';
  var isIndex = pageId === 'index';

  fetch('manifest.json')
    .then(function (r) { return r.json(); })
    .then(function (manifest) { build(manifest); })
    .catch(function (err) {
      console.warn('[dossier.js] Could not load manifest.json:', err);
    });


  /* ═══════════════════════════════════════════════════════════
     BUILD — master orchestrator
     ═══════════════════════════════════════════════════════════ */
  function build(m) {
    var flat = flatPages(m);         // ordered array of all pages
    var lang = restoreLang();        // 'en' or 'de'

    injectNav(m, lang);
    if (isIndex) injectSideMenu(m, lang);
    if (!isIndex) injectChapterNav(flat, lang);
    injectFooter(m, lang);

    applyLang(lang);
  }


  /* ═══════════════════════════════════════════════════════════
     FLAT PAGE LIST — ordered, for prev/next
     ═══════════════════════════════════════════════════════════ */
  function flatPages(m) {
    var list = [];
    m.sections.forEach(function (sec) {
      sec.pages.forEach(function (p) { list.push(p); });
    });
    return list;
  }


  /* ═══════════════════════════════════════════════════════════
     LANGUAGE
     ═══════════════════════════════════════════════════════════ */
  function restoreLang() {
    try { return localStorage.getItem('dossier-lang') || 'en'; }
    catch (e) { return 'en'; }
  }

  function saveLang(lang) {
    try { localStorage.setItem('dossier-lang', lang); } catch (e) { /* noop */ }
  }

  function applyLang(lang) {
    document.body.classList.toggle('lang-de', lang === 'de');
    document.documentElement.lang = lang;

    // Update toggle active states
    var enBtn = document.getElementById('langEN');
    var deBtn = document.getElementById('langDE');
    if (enBtn) enBtn.classList.toggle('active', lang === 'en');
    if (deBtn) deBtn.classList.toggle('active', lang === 'de');
  }

  function toggleLang(newLang) {
    saveLang(newLang);
    applyLang(newLang);
  }


  /* ═══════════════════════════════════════════════════════════
     NAV BAR
     ═══════════════════════════════════════════════════════════ */
  function injectNav(m, lang) {
    var nav = document.createElement('nav');
    nav.className = 'site-nav';

    // Left side
    var left = document.createElement('div');
    left.className = 'nav-left';

    // Hamburger + label — INDEX ONLY
    if (isIndex) {
      var hamBtn = document.createElement('button');
      hamBtn.className = 'hamburger';
      hamBtn.id = 'menuToggle';
      hamBtn.setAttribute('aria-label', 'Menu');
      hamBtn.innerHTML = '<span></span><span></span><span></span>';
      left.appendChild(hamBtn);

      var hamLabel = document.createElement('span');
      hamLabel.className = 'hamburger-label';
      hamLabel.innerHTML =
        '<span data-lang-en>Contents</span>' +
        '<span data-lang-de>Inhalt</span>';
      left.appendChild(hamLabel);
    }

    var title = document.createElement('a');
    title.className = 'nav-title';
    title.href = 'index.html';
    title.innerHTML =
      '<span data-lang-en>' + esc(m.site.title.en) + '</span>' +
      '<span data-lang-de>' + esc(m.site.title.de) + '</span>';
    left.appendChild(title);

    // Right side — language toggle
    var right = document.createElement('div');
    right.className = 'nav-right';

    var toggle = document.createElement('div');
    toggle.className = 'lang-toggle';

    var enBtn = document.createElement('button');
    enBtn.id = 'langEN';
    enBtn.className = 'lang-btn';
    enBtn.setAttribute('aria-label', 'English');
    enBtn.innerHTML = FLAG_US;
    enBtn.addEventListener('click', function () { toggleLang('en'); });

    var sep = document.createElement('span');
    sep.className = 'lang-sep';
    sep.textContent = '·';

    var deBtn = document.createElement('button');
    deBtn.id = 'langDE';
    deBtn.className = 'lang-btn';
    deBtn.setAttribute('aria-label', 'Deutsch');
    deBtn.innerHTML = FLAG_DE;
    deBtn.addEventListener('click', function () { toggleLang('de'); });

    toggle.appendChild(enBtn);
    toggle.appendChild(sep);
    toggle.appendChild(deBtn);
    right.appendChild(toggle);

    nav.appendChild(left);
    nav.appendChild(right);

    document.body.insertBefore(nav, document.body.firstChild);
  }


  /* ═══════════════════════════════════════════════════════════
     SIDE MENU (index only)
     ═══════════════════════════════════════════════════════════ */
  function injectSideMenu(m, lang) {
    var aside = document.createElement('aside');
    aside.className = 'side-menu';
    aside.id = 'sideMenu';

    // Home link
    var home = document.createElement('a');
    home.href = 'index.html';
    home.className = 'menu-link active';
    home.innerHTML =
      '<span data-lang-en>Dossier Home</span>' +
      '<span data-lang-de>Dossier Startseite</span>';
    aside.appendChild(home);

    // Sections
    m.sections.forEach(function (sec) {
      var label = document.createElement('div');
      label.className = 'menu-group-label';
      label.innerHTML =
        '<span data-lang-en>' + esc(sec.label.en) + '</span>' +
        '<span data-lang-de>' + esc(sec.label.de) + '</span>';
      aside.appendChild(label);

      sec.pages.forEach(function (p) {
        var a = document.createElement('a');
        a.href = p.file;
        a.className = 'menu-link';
        a.innerHTML =
          '<span class="ch-num">' + esc(p.short.en.replace('Ch. ', '').replace('Viz', '⬡').replace('Ref', '◈')) + '.</span>' +
          '<span data-lang-en>' + esc(p.title.en) + '</span>' +
          '<span data-lang-de>' + esc(p.title.de) + '</span>';
        aside.appendChild(a);
      });
    });

    // Overlay
    var overlay = document.createElement('div');
    overlay.className = 'side-menu-overlay';
    overlay.id = 'menuOverlay';

    // Insert after nav
    var nav = document.querySelector('.site-nav');
    nav.after(aside);
    aside.after(overlay);

    // Wire toggle
    var btn = document.getElementById('menuToggle');
    function toggle() {
      btn.classList.toggle('active');
      aside.classList.toggle('open');
      overlay.classList.toggle('visible');
    }
    btn.addEventListener('click', toggle);
    overlay.addEventListener('click', toggle);
  }


  /* ═══════════════════════════════════════════════════════════
     CHAPTER NAV (prev/next) — all pages except index
     ═══════════════════════════════════════════════════════════ */
  function injectChapterNav(flat, lang) {
    var idx = -1;
    for (var i = 0; i < flat.length; i++) {
      if (flat[i].id === pageId) { idx = i; break; }
    }
    if (idx === -1) return; // page not in manifest

    var prev = idx > 0 ? flat[idx - 1] : null;
    var next = idx < flat.length - 1 ? flat[idx + 1] : null;

    // Remove any existing hardcoded chapter-nav
    var existing = document.querySelector('.chapter-nav');
    if (existing) existing.remove();

    // Build inline chapter nav (bottom of article)
    var navEl = document.createElement('div');
    navEl.className = 'chapter-nav';

    if (prev) {
      var prevA = document.createElement('a');
      prevA.href = prev.file;
      prevA.className = 'prev';
      prevA.innerHTML =
        '<span data-lang-en>' + esc(prev.short.en) + ': ' + esc(prev.title.en) + '</span>' +
        '<span data-lang-de>' + esc(prev.short.de) + ': ' + esc(prev.title.de) + '</span>';
      navEl.appendChild(prevA);
    } else {
      // Link back to index if this is the first page
      var homeA = document.createElement('a');
      homeA.href = 'index.html';
      homeA.className = 'prev';
      homeA.innerHTML =
        '<span data-lang-en>Dossier Home</span>' +
        '<span data-lang-de>Dossier Startseite</span>';
      navEl.appendChild(homeA);
    }

    if (next) {
      var nextA = document.createElement('a');
      nextA.href = next.file;
      nextA.className = 'next';
      nextA.innerHTML =
        '<span data-lang-en>' + esc(next.short.en) + ': ' + esc(next.title.en) + '</span>' +
        '<span data-lang-de>' + esc(next.short.de) + ': ' + esc(next.title.de) + '</span>';
      navEl.appendChild(nextA);
    }

    // Insert inside the article, at the end
    var article = document.querySelector('article');
    if (article) {
      article.appendChild(navEl);
    }

    // ── Fixed bottom bar (appears on scroll) ──
    var bar = document.createElement('div');
    bar.className = 'fixed-chapter-bar';
    bar.setAttribute('aria-hidden', 'true');

    var barInner = document.createElement('div');
    barInner.className = 'fixed-bar-inner';

    if (prev) {
      var bPrev = document.createElement('a');
      bPrev.href = prev.file;
      bPrev.className = 'fixed-bar-prev';
      bPrev.innerHTML =
        '<span data-lang-en>← ' + esc(prev.short.en) + '</span>' +
        '<span data-lang-de>← ' + esc(prev.short.de) + '</span>';
      barInner.appendChild(bPrev);
    } else {
      barInner.appendChild(document.createElement('span')); // spacer
    }

    var bCenter = document.createElement('span');
    bCenter.className = 'fixed-bar-center';
    var current = flat[idx];
    bCenter.innerHTML =
      '<span data-lang-en>' + esc(current.short.en) + ' of ' + flat.length + '</span>' +
      '<span data-lang-de>' + esc(current.short.de) + ' von ' + flat.length + '</span>';
    barInner.appendChild(bCenter);

    if (next) {
      var bNext = document.createElement('a');
      bNext.href = next.file;
      bNext.className = 'fixed-bar-next';
      bNext.innerHTML =
        '<span data-lang-en>' + esc(next.short.en) + ' →</span>' +
        '<span data-lang-de>' + esc(next.short.de) + ' →</span>';
      barInner.appendChild(bNext);
    } else {
      barInner.appendChild(document.createElement('span')); // spacer
    }

    bar.appendChild(barInner);
    document.body.appendChild(bar);

    // Show/hide on scroll
    var scrollThreshold = 300;
    var barVisible = false;
    window.addEventListener('scroll', function () {
      var y = window.scrollY || window.pageYOffset;
      var shouldShow = y > scrollThreshold;
      if (shouldShow !== barVisible) {
        barVisible = shouldShow;
        bar.classList.toggle('visible', shouldShow);
      }
    }, { passive: true });
  }


  /* ═══════════════════════════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════════════════════════ */
  function injectFooter(m, lang) {
    // Remove any existing footer
    var existing = document.querySelector('.site-footer');
    if (existing) existing.remove();

    var name = m.footer.visdp_name;
    var email = m.footer.visdp_email;
    var dmca = m.footer.dmca_email;

    var footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML =
      '<div class="footer-inner">' +

        /* ── Legal notice ── */
        '<div class="footer-section">' +
          '<div class="footer-section-label">' +
            '<span data-lang-en>Legal Notice</span>' +
            '<span data-lang-de>Rechtlicher Hinweis</span>' +
          '</div>' +
          '<p data-lang-en>' +
            'This dossier presents investigative analysis based on public filings and primary documents. ' +
            'It does not constitute legal advice or legal determinations of wrongdoing. All individuals ' +
            'are presumed innocent unless proven otherwise in a court of law. The authors assume no ' +
            'liability for decisions made based on this material.' +
          '</p>' +
          '<p data-lang-de>' +
            'Dieses Dossier präsentiert investigative Analysen auf Grundlage öffentlicher Einreichungen ' +
            'und Primärdokumente. Es stellt keine Rechtsberatung und keine rechtlichen Feststellungen von ' +
            'Fehlverhalten dar. Alle genannten Personen gelten als unschuldig, bis ihre Schuld ' +
            'rechtskräftig festgestellt wird. Die Autoren übernehmen keine Haftung für Entscheidungen, ' +
            'die auf diesem Material basieren.' +
          '</p>' +
        '</div>' +

        /* ── Data protection ── */
        '<div class="footer-section">' +
          '<div class="footer-section-label">' +
            '<span data-lang-en>Data Protection</span>' +
            '<span data-lang-de>Datenschutz</span>' +
          '</div>' +
          '<p data-lang-en>' +
            'This website does not collect, process, or store personal data. No cookies are set. ' +
            'No analytics or tracking tools are used. No server-side logs are retained beyond standard ' +
            'GitHub Pages CDN operation, which is governed by ' +
            '<a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" ' +
            'target="_blank" rel="noopener">GitHub\'s privacy policy</a>. ' +
            'No personal data is transmitted to third parties.' +
          '</p>' +
          '<p data-lang-de>' +
            'Diese Website erhebt, verarbeitet und speichert keine personenbezogenen Daten. Es werden ' +
            'keine Cookies gesetzt. Es werden keine Analyse- oder Tracking-Tools verwendet. Serverseitige ' +
            'Protokolle werden nur im Rahmen des standardmäßigen GitHub-Pages-CDN-Betriebs vorgehalten, ' +
            'der der ' +
            '<a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" ' +
            'target="_blank" rel="noopener">Datenschutzerklärung von GitHub</a> unterliegt. ' +
            'Personenbezogene Daten werden nicht an Dritte weitergegeben.' +
          '</p>' +
        '</div>' +

        /* ── V.i.S.d.P. ── */
        '<div class="footer-section">' +
          '<div class="footer-section-label">V.i.S.d.P. (§ 18 Abs. 2 MStV)</div>' +
          '<p data-lang-en>' +
            esc(name) + ' — <a href="mailto:' + esc(email) + '">' + esc(email) + '</a><br>' +
            '<span class="footer-aside">Responsible editor for journalistic-editorial content under German media law.</span>' +
          '</p>' +
          '<p data-lang-de>' +
            esc(name) + ' — <a href="mailto:' + esc(email) + '">' + esc(email) + '</a><br>' +
            '<span class="footer-aside">Verantwortlich für journalistisch-redaktionelle Inhalte gemäß deutschem Medienrecht.</span>' +
          '</p>' +
        '</div>' +

        /* ── DMCA ── */
        '<div class="footer-section">' +
          '<div class="footer-section-label">' +
            '<span data-lang-en>Content Notice (DMCA)</span>' +
            '<span data-lang-de>Inhaltshinweis (DMCA)</span>' +
          '</div>' +
          '<p data-lang-en>' +
            'If you believe content on this site infringes your rights, contact ' +
            '<a href="mailto:' + esc(dmca) + '">' + esc(dmca) + '</a> ' +
            'with a description of the material and the basis for your claim.' +
          '</p>' +
          '<p data-lang-de>' +
            'Wenn Sie der Meinung sind, dass Inhalte auf dieser Seite Ihre Rechte verletzen, kontaktieren ' +
            'Sie bitte <a href="mailto:' + esc(dmca) + '">' + esc(dmca) + '</a> ' +
            'mit einer Beschreibung des betreffenden Materials und der Grundlage Ihres Anspruchs.' +
          '</p>' +
        '</div>' +

        /* ── Bottom meta line ── */
        '<div class="footer-meta">' +
          '<span>' +
            '<span data-lang-en>Last updated: ' + esc(m.site.updated) + '</span>' +
            '<span data-lang-de>Zuletzt aktualisiert: ' + esc(m.site.updated) + '</span>' +
          '</span>' +
          '<span>© 2026</span>' +
          '<span>' +
            '<span data-lang-en>Cookie-free · No personal data collected</span>' +
            '<span data-lang-de>Ohne Cookies · Keine Datenerhebung</span>' +
          '</span>' +
        '</div>' +

      '</div>';

    document.body.appendChild(footer);
  }


  /* ═══════════════════════════════════════════════════════════
     UTIL
     ═══════════════════════════════════════════════════════════ */
  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

})();
