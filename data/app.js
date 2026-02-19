/*
  SyncPilot SE — shareholder visualisations
  - Cytoscape.js network graph
  - vis-timeline direct shareholder timeline

  Data: ./data/graph.min.json (folder-derived).
*/

(() => {
  const DATA_URL = './data/graph.min.json';
  const TARGET_COMPANY_ID = 'n_b22ab9437528'; // SyncPilot SE

  // FT Origami colours (O3 palette) — https://origami.ft.com/foundations/colours/
  const COLORS = Object.freeze({
    paper: '#fff1e5',
    wheat: '#f2dfce',
    sky: '#cce6ff',
    teal: '#0d7680',
    oxford: '#0f5499',
    claret: '#990f3d',
    slate: '#262a33',
    body: '#33302e',
    muted: '#807973',
    black20: '#ccc1b7',
    black30: '#b3a9a0',
    white: '#ffffff',
    mandarin: '#ff8833',
  });

  /** @type {any} */
  let dataset = null;
  /** @type {any} */
  let cy = null;
  /** @type {any} */
  let timeline = null;
  /** @type {any} */
  let timelineItems = null;
  /** @type {any} */
  let timelineGroups = null;

  /** @type {Map<string, any>} */
  let nodesById = new Map();

  /** Current view mode: 'direct' | 'full' */
  let viewMode = 'direct';

  function $(id) {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing element #${id}`);
    return el;
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function toTitleCase(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  function parseYearRangeStart(periodRaw) {
    // Examples: "2022-23 - today", "2022-23 - 2024"
    if (!periodRaw) return null;
    const startPart = String(periodRaw).split(' - ')[0].trim();
    const m = startPart.match(/^(\d{4})-(\d{2})$/);
    if (!m) return null;
    const y1 = Number(m[1]);
    if (!Number.isFinite(y1)) return null;
    // Render using earliest possible date (Jan 1 of first year in the range)
    return {
      startISO: `${y1}-01-01`,
      startRaw: startPart,
    };
  }

  function buildNodeIndex(data) {
    nodesById = new Map();
    for (const n of data.nodes) nodesById.set(n.id, n);
  }

  function getNodeLabel(id) {
    return nodesById.get(id)?.label ?? id;
  }

  function getNodeKind(id) {
    return nodesById.get(id)?.kind ?? 'unknown';
  }

  function isDirectShareholder(nodeId, links) {
    return links.some(l => l.direct_syncpilot === true && l.source === nodeId && l.target === TARGET_COMPANY_ID);
  }

  function datasetCountsText(meta) {
    const c = meta?.counts;
    if (!c) return '—';
    const ds = c.direct_shareholders_breakdown;
    const directPart = ds
      ? `Direct: ${c.direct_shareholders_syncpilot_se} (current ${ds.current}, former ${ds.former})`
      : `Direct: ${c.direct_shareholders_syncpilot_se}`;
    return `Nodes: ${c.unique_entities_nodes} • Links: ${c.ownership_links_edges} • ${directPart}`;
  }

  function updateHeader(meta) {
    $('asOf').textContent = `As of: ${meta?.as_of_date ?? '—'}`;
    $('counts').textContent = datasetCountsText(meta);
  }

  function getLinksForView(mode) {
    if (!dataset) return [];
    const links = dataset.links ?? [];
    if (mode === 'direct') return links.filter(l => l.direct_syncpilot === true);
    return links;
  }

  function getNodesForView(mode, links) {
    if (!dataset) return [];
    if (mode === 'full') return dataset.nodes;

    // direct view: SyncPilot SE + its direct shareholder sources
    const keep = new Set([TARGET_COMPANY_ID]);
    for (const l of links) {
      keep.add(l.source);
      keep.add(l.target);
    }
    return dataset.nodes.filter(n => keep.has(n.id));
  }

  function cytoscapeElements(mode) {
    const links = getLinksForView(mode);
    const nodes = getNodesForView(mode, links);

    const nodeEls = nodes.map(n => ({
      data: {
        id: n.id,
        label: n.label,
        kind: n.kind,
        isTarget: n.id === TARGET_COMPANY_ID,
      }
    }));

    const edgeEls = links.map(l => ({
      data: {
        id: l.id,
        source: l.source,
        target: l.target,
        status: l.status ?? 'unknown',
        period_raw: l.period_raw ?? null,
        start: l.start ?? null,
        end: l.end ?? null,
        direct_syncpilot: !!l.direct_syncpilot,
      }
    }));

    return { nodeEls, edgeEls, nodeCount: nodeEls.length, edgeCount: edgeEls.length };
  }

  function cyStylesheet() {
    return [
      {
        selector: 'node',
        style: {
          'label': 'data(label)',
          'font-size': 10,
          'font-weight': 500,
          'text-wrap': 'wrap',
          'text-max-width': 120,
          'text-valign': 'center',
          'text-halign': 'center',
          'color': COLORS.body,
          'background-color': COLORS.white,
          'border-width': 2,
          'border-color': COLORS.black20,
          'shape': 'round-rectangle',
          'padding': '8px',
          'width': 'label',
          'height': 'label',
        }
      },
      {
        selector: 'node[kind = "org"]',
        style: {
          'background-color': COLORS.wheat,
          'border-color': COLORS.teal,
          'shape': 'round-rectangle',
        }
      },
      {
        selector: 'node[kind = "person"]',
        style: {
          'background-color': COLORS.sky,
          'border-color': COLORS.oxford,
          'shape': 'ellipse',
        }
      },
      {
        selector: `node[id = "${TARGET_COMPANY_ID}"]`,
        style: {
          'background-color': COLORS.white,
          'border-color': COLORS.claret,
          'border-width': 4,
          'shape': 'hexagon',
          'font-weight': 700,
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          'arrow-scale': 0.9,
          'line-color': COLORS.black30,
          'target-arrow-color': COLORS.black30,
          'width': 2,
        }
      },
      {
        selector: 'edge[status = "current"]',
        style: {
          'line-color': COLORS.teal,
          'target-arrow-color': COLORS.teal,
          'width': 2.5,
        }
      },
      {
        selector: 'edge[status = "former"]',
        style: {
          'line-color': COLORS.muted,
          'target-arrow-color': COLORS.muted,
          'line-style': 'dashed',
        }
      },
      {
        selector: 'edge[status = "unknown"]',
        style: {
          'line-color': COLORS.black30,
          'target-arrow-color': COLORS.black30,
          'line-style': 'dotted',
        }
      },
      {
        selector: 'edge[status = "future"]',
        style: {
          'line-color': COLORS.mandarin,
          'target-arrow-color': COLORS.mandarin,
        }
      },
      {
        selector: 'edge[direct_syncpilot]',
        style: {
          'width': 3,
        }
      },
      {
        selector: '.searchMatch',
        style: {
          'border-color': COLORS.mandarin,
          'border-width': 4,
        }
      },
      {
        selector: ':selected',
        style: {
          'border-color': COLORS.mandarin,
          'border-width': 5,
          'line-color': COLORS.mandarin,
          'target-arrow-color': COLORS.mandarin,
        }
      },
    ];
  }

  function cyLayout(mode) {
    if (mode === 'direct') {
      return {
        name: 'concentric',
        padding: 20,
        animate: false,
        fit: true,
        levelWidth: () => 1,
        concentric: (n) => (n.id() === TARGET_COMPANY_ID ? 999 : 1),
      };
    }

    // Force layout for full graph; pinning this avoids needing extra plugins.
    return {
      name: 'cose',
      padding: 20,
      animate: false,
      fit: true,
      nodeRepulsion: 6000,
      idealEdgeLength: 140,
      edgeElasticity: 0.2,
      gravity: 1.2,
    };
  }

  function renderCytoscape(mode) {
    const { nodeEls, edgeEls, nodeCount, edgeCount } = cytoscapeElements(mode);

    if (cy) {
      cy.destroy();
      cy = null;
    }

    cy = cytoscape({
      container: $('cy'),
      elements: {
        nodes: nodeEls,
        edges: edgeEls,
      },
      style: cyStylesheet(),
      layout: cyLayout(mode),
      // Tweak selection behavior: keep it simple.
      selectionType: 'single',
    });

    // Update dataset-derived display counts in the header subline (non-invasive).
    const metaCounts = dataset?.meta?.counts;
    if (metaCounts) {
      $('counts').textContent = `${datasetCountsText(dataset.meta)} • Displaying: ${nodeCount} nodes, ${edgeCount} links`;
    }

    wireCyEvents();
  }

  function buildTimelineData() {
    const directLinks = getLinksForView('direct');

    // Groups: natural vs legal person
    timelineGroups = new vis.DataSet([
      { id: 'person', content: 'Natural persons' },
      { id: 'org', content: 'Legal persons' },
      { id: 'unknown', content: 'Other / unknown' },
    ]);

    const items = [];
    let hasUncertain = false;

    for (const l of directLinks) {
      const kind = getNodeKind(l.source);
      const group = (kind === 'person' || kind === 'org') ? kind : 'unknown';
      const label = getNodeLabel(l.source);

      let startISO = l.start;
      let uncertainStart = false;
      let startRaw = null;

      if (!startISO) {
        const yr = parseYearRangeStart(l.period_raw);
        if (yr) {
          startISO = yr.startISO;
          startRaw = yr.startRaw;
          uncertainStart = true;
          hasUncertain = true;
        }
      }

      const endISO = l.end;

      const status = l.status ?? 'unknown';
      const className = [
        status === 'current' ? 'tl-current' : (status === 'former' ? 'tl-former' : 'tl-unknown'),
        uncertainStart ? 'tl-uncertain' : null,
      ].filter(Boolean).join(' ');

      const titleParts = [
        `Shareholder: ${label}`,
        `Status: ${toTitleCase(status)}`,
        l.period_raw ? `Period: ${l.period_raw}` : null,
        uncertainStart && startRaw ? `Start raw: ${startRaw} (rendered from ${startISO})` : null,
      ].filter(Boolean);

      // If we still don't have a usable start, render as point at end (avoids guessing)
      if (!startISO && endISO) {
        items.push({
          id: l.id,
          group,
          content: escapeHtml(label),
          start: endISO,
          type: 'point',
          className,
          title: escapeHtml(titleParts.join('\n')),
          edgeId: l.id,
          shareholderId: l.source,
          targetId: l.target,
        });
        continue;
      }

      // Normal range item
      items.push({
        id: l.id,
        group,
        content: escapeHtml(label) + (uncertainStart ? ' (≈)' : ''),
        start: startISO,
        end: endISO,
        type: 'range',
        className,
        title: escapeHtml(titleParts.join('\n')),
        edgeId: l.id,
        shareholderId: l.source,
        targetId: l.target,
        uncertainStart,
      });
    }

    timelineItems = new vis.DataSet(items);

    // Note in UI about uncertain starts
    $('timelineNote').textContent = hasUncertain
      ? 'Some start dates are stored as year ranges (e.g., “2022-23”). These items are shown with a dashed border and rendered from the earliest possible date.'
      : '';
  }

  function renderTimeline() {
    buildTimelineData();

    const options = {
      stack: true,
      horizontalScroll: true,
      verticalScroll: true,
      zoomKey: 'ctrlKey',
      maxHeight: '100%',
      margin: { item: 10 },
      showCurrentTime: false,
    };

    if (timeline) {
      timeline.destroy();
      timeline = null;
    }

    timeline = new vis.Timeline($('tl'), timelineItems, timelineGroups, options);

    timeline.on('select', (props) => {
      const id = props.items?.[0];
      if (!id || !cy) return;
      const e = cy.getElementById(id);
      if (e && e.length) {
        cy.elements().unselect();
        e.select();
        cy.animate({
          center: { eles: e },
          duration: 250,
        });
        renderEdgeDetails(e);
      }
    });
  }

  function wireCyEvents() {
    if (!cy) return;

    cy.on('tap', 'node', (evt) => {
      const n = evt.target;
      renderNodeDetails(n);

      // If this node is a direct shareholder, select its timeline item.
      if (timeline) {
        const direct = getLinksForView('direct');
        const link = direct.find(l => l.source === n.id() && l.target === TARGET_COMPANY_ID);
        if (link) {
          timeline.setSelection([link.id], { focus: true });
        } else if (n.id() === TARGET_COMPANY_ID) {
          timeline.setSelection([]);
        }
      }
    });

    cy.on('tap', 'edge', (evt) => {
      const e = evt.target;
      renderEdgeDetails(e);

      if (timeline && e.data('direct_syncpilot') === true) {
        timeline.setSelection([e.id()], { focus: true });
      }
    });

    // Clicking on background clears selection.
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        $('details').innerHTML = '<div class="hint">Click a node or edge to see details.</div>';
        if (timeline) timeline.setSelection([]);
      }
    });
  }

  function renderNodeDetails(nodeEle) {
    const nodeId = nodeEle.id();
    const label = nodeEle.data('label');
    const kind = nodeEle.data('kind');

    const links = getLinksForView(viewMode);

    const outgoing = links.filter(l => l.source === nodeId);
    const incoming = links.filter(l => l.target === nodeId);

    const direct = links.find(l => l.direct_syncpilot === true && l.source === nodeId && l.target === TARGET_COMPANY_ID);

    const kindText = kind === 'person' ? 'Natural person' : (kind === 'org' ? 'Legal person' : 'Unknown');

    const parts = [];
    parts.push(`<h3>${escapeHtml(label)}</h3>`);

    parts.push('<div class="kv">');
    parts.push(`<div class="k">Type</div><div>${escapeHtml(kindText)}</div>`);
    parts.push(`<div class="k">Node ID</div><div><code>${escapeHtml(nodeId)}</code></div>`);

    if (nodeId === TARGET_COMPANY_ID) {
      parts.push(`<div class="k">Role</div><div>Target company</div>`);
    } else if (direct) {
      parts.push(`<div class="k">Direct shareholder</div><div>${escapeHtml(toTitleCase(direct.status))}</div>`);
      parts.push(`<div class="k">Period</div><div>${escapeHtml(direct.period_raw ?? '—')}</div>`);
    } else {
      parts.push(`<div class="k">Direct shareholder</div><div>No</div>`);
    }

    parts.push('</div>');

    // Relationships
    parts.push(`<div class="k" style="margin-top: 10px; color: ${COLORS.muted};">Visible relationships in this view</div>`);

    parts.push('<ul class="list">');

    if (outgoing.length === 0 && incoming.length === 0) {
      parts.push('<li><span style="color: var(--ft-muted);">No links in the current view.</span></li>');
    } else {
      for (const l of outgoing.slice(0, 25)) {
        parts.push('<li>');
        parts.push(`<div><strong>Owns</strong> ${escapeHtml(getNodeLabel(l.target))}</div>`);
        parts.push(`<div style="color: var(--ft-muted);">Status: ${escapeHtml(toTitleCase(l.status ?? 'unknown'))}${l.period_raw ? ` • ${escapeHtml(l.period_raw)}` : ''}</div>`);
        parts.push(`<div style="color: var(--ft-muted);">Edge: <code>${escapeHtml(l.id)}</code></div>`);
        parts.push('</li>');
      }
      for (const l of incoming.slice(0, 25)) {
        parts.push('<li>');
        parts.push(`<div><strong>Owned by</strong> ${escapeHtml(getNodeLabel(l.source))}</div>`);
        parts.push(`<div style="color: var(--ft-muted);">Status: ${escapeHtml(toTitleCase(l.status ?? 'unknown'))}${l.period_raw ? ` • ${escapeHtml(l.period_raw)}` : ''}</div>`);
        parts.push(`<div style="color: var(--ft-muted);">Edge: <code>${escapeHtml(l.id)}</code></div>`);
        parts.push('</li>');
      }
    }

    parts.push('</ul>');

    $('details').innerHTML = parts.join('');
  }

  function renderEdgeDetails(edgeEle) {
    const d = edgeEle.data();
    const sourceLabel = getNodeLabel(d.source);
    const targetLabel = getNodeLabel(d.target);

    const parts = [];
    parts.push(`<h3>Ownership link</h3>`);

    parts.push('<div class="kv">');
    parts.push(`<div class="k">From</div><div>${escapeHtml(sourceLabel)}</div>`);
    parts.push(`<div class="k">To</div><div>${escapeHtml(targetLabel)}</div>`);
    parts.push(`<div class="k">Status</div><div>${escapeHtml(toTitleCase(d.status ?? 'unknown'))}</div>`);
    parts.push(`<div class="k">Period</div><div>${escapeHtml(d.period_raw ?? '—')}</div>`);
    parts.push(`<div class="k">Edge ID</div><div><code>${escapeHtml(d.id)}</code></div>`);
    parts.push(`<div class="k">Direct to SyncPilot</div><div>${d.direct_syncpilot ? 'Yes' : 'No'}</div>`);
    parts.push('</div>');

    $('details').innerHTML = parts.join('');
  }

  function applySearch(query) {
    if (!cy) return;
    const q = String(query || '').trim().toLowerCase();

    cy.nodes().removeClass('searchMatch');

    if (!q) return;

    const matches = cy.nodes().filter(n => String(n.data('label') || '').toLowerCase().includes(q));
    matches.addClass('searchMatch');

    if (matches.length) {
      cy.animate({
        fit: { eles: matches, padding: 60 },
        duration: 200,
      });
    }
  }

  function resetUI() {
    $('searchInput').value = '';
    applySearch('');

    if (cy) {
      cy.elements().unselect();
      cy.layout(cyLayout(viewMode)).run();
    }

    if (timeline) {
      timeline.setSelection([]);
      // show whole range
      timeline.fit();
    }

    $('details').innerHTML = '<div class="hint">Click a node or edge to see details.</div>';
  }

  function wireUI() {
    $('viewMode').addEventListener('change', (e) => {
      const v = String(e.target.value);
      viewMode = (v === 'full') ? 'full' : 'direct';
      renderCytoscape(viewMode);
      resetUI();
    });

    $('searchInput').addEventListener('input', (e) => {
      applySearch(e.target.value);
    });

    $('resetBtn').addEventListener('click', () => {
      resetUI();
    });
  }

  async function main() {
    const res = await fetch(DATA_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to fetch ${DATA_URL}: ${res.status}`);

    dataset = await res.json();
    buildNodeIndex(dataset);

    updateHeader(dataset.meta);
    renderTimeline();

    // default view
    renderCytoscape(viewMode);

    wireUI();

    // Expose internals for page-level extensions (UBO hover, etc.)
    window._shareviz = {
      getCy:       function() { return cy; },
      getDataset:  function() { return dataset; },
      getNodesById: function() { return nodesById; },
      getLinksForView: getLinksForView,
    };
  }

  // Run
  main().catch((err) => {
    console.error(err);
    $('details').innerHTML = `<div class="hint">Failed to load data. Check console. Error: ${escapeHtml(err.message || String(err))}</div>`;
  });
})();
