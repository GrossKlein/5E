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

  if (!isIndex) injectShareTools(null, []);

  fetch(prefix + 'manifest.json')
    .then(function (r) { return r.json(); })
    .then(function (m) { build(m); })
    .catch(function (e) { console.warn('[dossier.js]', e); });

  function build(m) {
    var flat = [];
    m.sections.forEach(function (s) { s.pages.forEach(function (p) { flat.push(p); }); });

    injectNav(m);
    injectSideMenu(m);
    if (!isIndex) injectRelatedLinks(flat);
    if (!isIndex) injectChapterNav(flat);
    injectFooter(m);
    if (!isIndex) injectShareTools(m, flat);

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
    enBtn.addEventListener('click', function () {
      try { localStorage.setItem('syncpilotLang', 'en'); } catch (err) {}
    });

    var sep = document.createElement('span'); sep.className = 'lang-sep'; sep.textContent = '\u00b7';

    var deBtn = document.createElement('a');
    deBtn.className = 'lang-btn' + (lang === 'de' ? ' active' : '');
    deBtn.href = isDE ? currentFile : 'de/' + currentFile;
    deBtn.setAttribute('aria-label', 'Deutsch');
    deBtn.innerHTML = FLAG_DE;
    deBtn.addEventListener('click', function () {
      try { localStorage.setItem('syncpilotLang', 'de'); } catch (err) {}
    });

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
  function injectRelatedLinks(flat) {
    var target = document.querySelector('article') || document.querySelector('main') || document.querySelector('.content-area');
    if (!target || target.querySelector('.related-links')) return;

    var related = getRelatedPages();
    if (!related.length) return;

    var flatById = {};
    flat.forEach(function (p) { flatById[p.id] = p; });

    var section = document.createElement('section');
    section.className = 'related-links';
    section.setAttribute('aria-labelledby', 'related-links-title');

    var title = document.createElement('h2');
    title.id = 'related-links-title';
    title.className = 'related-links-title';
    title.textContent = lang === 'de' ? 'Weiter im Dossier' : 'Continue the dossier';
    section.appendChild(title);

    var list = document.createElement('div');
    list.className = 'related-links-list';

    related.forEach(function (item) {
      var page = flatById[item.id];
      if (!page) return;
      var a = document.createElement('a');
      a.className = 'related-link-card';
      a.href = page.file;
      a.innerHTML = '<span class="related-link-kicker">' + esc(item.kicker) + '</span>' +
        '<span class="related-link-title">' + esc(item.title) + '</span>' +
        '<span class="related-link-desc">' + esc(item.desc) + '</span>';
      list.appendChild(a);
    });

    if (!list.children.length) return;
    section.appendChild(list);
    target.appendChild(section);
  }

  function getRelatedPages() {
    var en = {
      'syncpilot': [
        ['the-95-percent-discount', 'Investigation', 'The 95% Discount', 'How insiders bought SyncPilot shares at EUR 1 after an EUR 18.96 valuation.'],
        ['shareholders', 'Ownership', 'Shareholder structure', 'Trace the 31 beneficial owners and 26 holding entities.'],
        ['network', 'Map', 'Network analysis', 'See how the persons, holding companies, and legal entities connect.']
      ],
      'the-95-percent-discount': [
        ['the-goldfinger-connection', 'Context', 'The Goldfinger Connection', 'Why the Perseus buyers matter to the SyncPilot share pricing.'],
        ['syncpilot', 'Company profile', 'SyncPilot ownership and capital', 'The capital structure behind the discounted share transfers.'],
        ['shareholders', 'Ownership', 'Shareholder structure', 'View the ownership table behind the transactions.']
      ],
      'the-goldfinger-connection': [
        ['the-95-percent-discount', 'Pricing', 'The 95% Discount', 'The share-price sequence that brought the Goldfinger defendants in.'],
        ['the-lvs-trap', 'Investor dispute', 'The LVS Trap', 'The EUR 6.15M transaction that later became a court case.'],
        ['network', 'Map', 'Network analysis', 'Follow the people and entities around the Perseus purchase.']
      ],
      'the-lvs-trap': [
        ['the-verdict', 'Court ruling', 'The Verdict', 'Read what the Augsburg court ordered on 13 May 2026.'],
        ['the-evidence-room', 'Primary source', 'Evidence Room', 'Open the documents and court materials behind the case.'],
        ['vendor-risk', 'Risk analysis', 'Vendor Risk', 'Why the dispute matters to public-sector and enterprise customers.']
      ],
      'the-verdict': [
        ['the-enforcement', 'What happened next', 'The Enforcement', 'Eight asset-freeze orders went out the same day the court ruled.'],
        ['the-lvs-trap', 'Background', 'The LVS Trap', 'The transaction history behind the court order.'],
        ['the-evidence-room', 'Primary source', 'Evidence Room', 'Find the judgment and supporting source documents.']
      ],
      'the-enforcement': [
        ['the-verdict', 'Court ruling', 'The Verdict', 'The judgment the enforcement orders are built on.'],
        ['network', 'Map', 'Network analysis', 'See the entities the freeze orders reach across.'],
        ['the-evidence-room', 'Primary source', 'Evidence Room', 'Open the eight payment-prohibition orders and exhibits.']
      ],
      'the-pictet-pitch': [
        ['the-95-percent-discount', 'Pricing', 'The 95% Discount', 'Compare the EUR 1 share sale with later valuation claims.'],
        ['the-goldfinger-connection', 'Counterparty risk', 'The Goldfinger Connection', 'Review the buyer background behind the share transfers.'],
        ['the-evidence-room', 'Primary source', 'Evidence Room', 'Check the transaction coverage and supporting documents.']
      ],
      'the-evidence-room': [
        ['the-verdict', 'Court ruling', 'The Verdict', 'Read the court outcome in narrative form.'],
        ['shareholders', 'Ownership', 'Shareholder structure', 'Use the ownership visualisation alongside the source documents.'],
        ['network', 'Map', 'Network analysis', 'Explore the relationship graph for the documented entities.']
      ],
      'sap-syncpilot-vendor-risk': [
        ['vendor-risk', 'Procurement', 'Vendor Risk', 'Review the broader customer and procurement exposure.'],
        ['the-goldfinger-connection', 'Shareholder risk', 'The Goldfinger Connection', 'Understand the criminal-proceeding context.'],
        ['the-evidence-room', 'Evidence', 'Evidence Room', 'Check the public documents behind the SAP letter.']
      ],
      'vendor-risk': [
        ['sap-syncpilot-vendor-risk', 'SAP letter', 'Open Letter to SAP', 'Why partner status matters for procurement trust.'],
        ['the-verdict', 'Court ruling', 'The Verdict', 'The court decision behind the investor-risk signal.'],
        ['syncpilot', 'Company profile', 'SyncPilot profile', 'Review the company, ownership, and revenue concentration.']
      ],
      'shareholders': [
        ['syncpilot', 'Company profile', 'SyncPilot profile', 'Read the company context behind the ownership table.'],
        ['the-95-percent-discount', 'Pricing', 'The 95% Discount', 'See how selected shareholders entered at discounted pricing.'],
        ['network', 'Map', 'Network analysis', 'Move from ownership table to relationship graph.']
      ],
      'network': [
        ['shareholders', 'Ownership', 'Shareholder structure', 'Pair the graph with the shareholder table.'],
        ['the-goldfinger-connection', 'Context', 'The Goldfinger Connection', 'Review the people behind one key ownership path.'],
        ['the-evidence-room', 'Evidence', 'Evidence Room', 'Check the documents behind the mapped relationships.']
      ]
    };

    var de = {
      'syncpilot': [
        ['the-95-percent-discount', 'Untersuchung', 'Der 95%-Rabatt', 'Wie Insider SyncPilot-Aktien nach einer Bewertung von 18,96 EUR fuer 1 EUR kauften.'],
        ['shareholders', 'Eigentum', 'Gesellschafterstruktur', 'Die wirtschaftlichen Eigentuemer und Holdinggesellschaften nachverfolgen.'],
        ['network', 'Karte', 'Netzwerkanalyse', 'Personen, Holdinggesellschaften und Rechtstraeger im Zusammenhang sehen.']
      ],
      'the-95-percent-discount': [
        ['the-goldfinger-connection', 'Kontext', 'Die Goldfinger-Verbindung', 'Warum die Perseus-Kaeufer fuer die SyncPilot-Preisbildung wichtig sind.'],
        ['syncpilot', 'Unternehmensprofil', 'SyncPilot Eigentum und Kapital', 'Die Kapitalstruktur hinter den rabattierten Aktienuebertragungen.'],
        ['shareholders', 'Eigentum', 'Gesellschafterstruktur', 'Die Eigentumstabelle hinter den Transaktionen ansehen.']
      ],
      'the-goldfinger-connection': [
        ['the-95-percent-discount', 'Preisbildung', 'Der 95%-Rabatt', 'Die Aktienpreisfolge, durch die die Goldfinger-Angeklagten einstiegen.'],
        ['the-lvs-trap', 'Investorstreit', 'Die LVS-Falle', 'Die 6,15-Mio.-EUR-Transaktion, aus der ein Gerichtsfall wurde.'],
        ['network', 'Karte', 'Netzwerkanalyse', 'Personen und Gesellschaften rund um den Perseus-Kauf verfolgen.']
      ],
      'the-lvs-trap': [
        ['the-verdict', 'Urteil', 'Das Urteil', 'Was das Landgericht Augsburg am 13. Mai 2026 angeordnet hat.'],
        ['the-evidence-room', 'Quelle', 'Der Beweisraum', 'Dokumente und Gerichtsunterlagen zum Fall oeffnen.'],
        ['vendor-risk', 'Risikoanalyse', 'Lieferantenrisiko', 'Warum der Streit fuer oeffentliche und Enterprise-Kunden relevant ist.']
      ],
      'the-verdict': [
        ['the-enforcement', 'Was danach geschah', 'Die Vollstreckung', 'Acht Pfaendungsbescheide gingen am Tag des Urteils hinaus.'],
        ['the-lvs-trap', 'Hintergrund', 'Die LVS-Falle', 'Die Transaktionsgeschichte hinter dem Urteil.'],
        ['the-evidence-room', 'Quelle', 'Der Beweisraum', 'Urteil und unterstuetzende Quelldokumente finden.']
      ],
      'the-enforcement': [
        ['the-verdict', 'Urteil', 'Das Urteil', 'Das Urteil, auf dem die Vollstreckung aufbaut.'],
        ['network', 'Karte', 'Netzwerkanalyse', 'Die Rechtstraeger sehen, die die Pfaendungen erreichen.'],
        ['the-evidence-room', 'Quelle', 'Der Beweisraum', 'Die acht Zahlungsverbote und Anlagen oeffnen.']
      ],
      'the-pictet-pitch': [
        ['the-95-percent-discount', 'Preisbildung', 'Der 95%-Rabatt', 'Den 1-EUR-Aktienverkauf mit spaeteren Bewertungsangaben vergleichen.'],
        ['the-goldfinger-connection', 'Gegenparteirisiko', 'Die Goldfinger-Verbindung', 'Den Hintergrund der Kaeufer hinter den Aktienuebertragungen pruefen.'],
        ['the-evidence-room', 'Quelle', 'Der Beweisraum', 'Transaktionsberichte und unterstuetzende Dokumente pruefen.']
      ],
      'the-evidence-room': [
        ['the-verdict', 'Urteil', 'Das Urteil', 'Den Gerichtsausgang als Einordnung lesen.'],
        ['shareholders', 'Eigentum', 'Gesellschafterstruktur', 'Die Eigentumsvisualisierung neben den Quelldokumenten nutzen.'],
        ['network', 'Karte', 'Netzwerkanalyse', 'Den Beziehungsgraphen zu den dokumentierten Rechtstraegern erkunden.']
      ],
      'sap-syncpilot-vendor-risk': [
        ['vendor-risk', 'Beschaffung', 'Lieferantenrisiko', 'Die breitere Kunden- und Beschaffungsexposition pruefen.'],
        ['the-goldfinger-connection', 'Gesellschafterrisiko', 'Die Goldfinger-Verbindung', 'Den Kontext der Strafverfahren verstehen.'],
        ['the-evidence-room', 'Belege', 'Der Beweisraum', 'Die oeffentlichen Dokumente hinter dem SAP-Brief pruefen.']
      ],
      'vendor-risk': [
        ['sap-syncpilot-vendor-risk', 'SAP-Brief', 'Offener Brief an SAP', 'Warum Partnerstatus fuer Beschaffungsvertrauen relevant ist.'],
        ['the-verdict', 'Urteil', 'Das Urteil', 'Die Gerichtsentscheidung hinter dem Investorenrisiko.'],
        ['syncpilot', 'Unternehmensprofil', 'SyncPilot-Profil', 'Unternehmen, Eigentum und Umsatzkonzentration pruefen.']
      ],
      'shareholders': [
        ['syncpilot', 'Unternehmensprofil', 'SyncPilot-Profil', 'Den Unternehmenskontext hinter der Eigentumstabelle lesen.'],
        ['the-95-percent-discount', 'Preisbildung', 'Der 95%-Rabatt', 'Wie ausgewaehlte Gesellschafter zu Rabattpreisen einstiegen.'],
        ['network', 'Karte', 'Netzwerkanalyse', 'Von der Eigentumstabelle zum Beziehungsgraphen wechseln.']
      ],
      'network': [
        ['shareholders', 'Eigentum', 'Gesellschafterstruktur', 'Den Graphen mit der Gesellschaftertabelle abgleichen.'],
        ['the-goldfinger-connection', 'Kontext', 'Die Goldfinger-Verbindung', 'Die Personen hinter einem zentralen Eigentumspfad pruefen.'],
        ['the-evidence-room', 'Belege', 'Der Beweisraum', 'Die Dokumente hinter den dargestellten Beziehungen pruefen.']
      ]
    };

    var source = lang === 'de' ? de : en;
    return (source[pageId] || []).map(function (item) {
      return { id: item[0], kicker: item[1], title: item[2], desc: item[3] };
    });
  }

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

  /* Simple Icons brand glyphs (MIT, self-hosted inline SVG) + a mail icon. */
  var SHARE_ICONS = {
    LinkedIn: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    X: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
    WhatsApp: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
    Email: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>'
  };

  function injectShareTools(m, flat) {
    var target = document.querySelector('.site-footer .footer-inner') || document.querySelector('.site-footer');
    if (!target || document.querySelector('.social-share')) return;

    var pageTitle = getShareTitle(m, flat);
    var pageUrl = getShareUrl();
    var encodedUrl = encodeURIComponent(pageUrl);
    var encodedTitle = encodeURIComponent(pageTitle);
    var labels = lang === 'de'
      ? {
          title: 'Diese Seite teilen',
          native: 'Teilen',
          nativeAria: 'Diese Seite teilen',
          linkedin: 'Auf LinkedIn teilen',
          x: 'Auf X teilen',
          whatsapp: 'Auf WhatsApp teilen',
          email: 'Per E-Mail teilen',
          emailSubject: 'SyncPilot: ' + pageTitle,
          emailText: 'E-Mail'
        }
      : {
          title: 'Share this page',
          native: 'Share',
          nativeAria: 'Share this page',
          linkedin: 'Share on LinkedIn',
          x: 'Share on X',
          whatsapp: 'Share on WhatsApp',
          email: 'Share by email',
          emailSubject: 'SyncPilot: ' + pageTitle,
          emailText: 'Email'
        };

    var share = document.createElement('aside');
    share.className = 'social-share';
    share.setAttribute('aria-label', labels.title);

    var heading = document.createElement('div');
    heading.className = 'social-share-title';
    heading.textContent = labels.title;
    share.appendChild(heading);

    var actions = document.createElement('div');
    actions.className = 'social-share-actions';

    var nativeBtn = document.createElement('button');
    nativeBtn.type = 'button';
    nativeBtn.className = 'social-share-btn social-share-native';
    nativeBtn.setAttribute('aria-label', labels.nativeAria);
    nativeBtn.textContent = labels.native;
    nativeBtn.addEventListener('click', function () {
      if (navigator.share) {
        navigator.share({ title: pageTitle, text: pageTitle, url: pageUrl }).catch(function () {});
      }
    });
    actions.appendChild(nativeBtn);

    actions.appendChild(makeShareLink('LinkedIn', labels.linkedin, 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodedUrl));
    actions.appendChild(makeShareLink('X', labels.x, 'https://twitter.com/intent/tweet?url=' + encodedUrl + '&text=' + encodedTitle));
    actions.appendChild(makeShareLink('WhatsApp', labels.whatsapp, 'https://wa.me/?text=' + encodedUrl + '%20' + encodedTitle));
    actions.appendChild(makeShareLink('Email', labels.email, 'mailto:?subject=' + encodeURIComponent(labels.emailSubject) + '&body=' + encodedTitle + '%0A%0A' + encodedUrl));

    share.appendChild(actions);

    // Live in the footer (appended after the footer-meta column).
    target.appendChild(share);

    if (!navigator.share) nativeBtn.hidden = true;
  }

  function makeShareLink(brand, label, href) {
    var a = document.createElement('a');
    a.className = 'social-share-btn social-share-btn--' + brand.toLowerCase();
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', label);
    a.setAttribute('title', label);
    a.innerHTML = SHARE_ICONS[brand] || '';
    return a;
  }

  function getShareTitle(m, flat) {
    var lk = lang === 'de' ? 'de' : 'en';
    for (var i = 0; i < flat.length; i++) {
      if (flat[i].id === pageId) return flat[i].title[lk] || flat[i].title.en || document.title;
    }
    return document.title.replace(/\s+[—-]\s+SyncPilot.*$/, '');
  }

  function getShareUrl() {
    var canonical = document.querySelector('link[rel="canonical"]');
    return canonical && canonical.href ? canonical.href : window.location.href.split('#')[0];
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
})();
