from pathlib import Path

root = Path('.')
changed = []


def edit_file(path, edits):
    p = root / path
    if not p.exists():
        print(f"MISSING: {path}")
        return
    s = p.read_text(encoding='utf-8')
    original = s
    for old, new in edits:
        if old in s:
            s = s.replace(old, new)
        else:
            print(f"NOT FOUND in {path}: {old[:120]!r}")
    if s != original:
        p.write_text(s, encoding='utf-8')
        changed.append(path)
        print(f"UPDATED: {path}")
    else:
        print(f"NO CHANGE: {path}")


# index.html — cleaner but still pointed landing lead; fill placeholders; tighten cards.
edit_file('index.html', [
    ('''<p class="hero-body">
      <strong>€6.15M</strong> lent by LVS Hotel &amp; Resorts S.A. — zero shares delivered. On <a href="the-verdict.html">13 May 2026 the Augsburg Regional Court ordered repayment</a>. The lawyer who drafted the contract acquired shares in the same firm at a <strong>95% discount</strong>. That same lawyer was a <a href="https://www.lto.de/recht/justiz/j/goldfinger-prozess-staatsanwaltschaft-augsburg-eingestellt-entschaedigung-strafanzeigen-kanzleidaten" target="_blank" rel="noopener">Goldfinger tax fraud defendant</a>. The sole managing director acquired personal property while loan funds flowed in. <strong>84% of revenue comes from German taxpayers.</strong> In late 2024, <a href="the-pictet-pitch.html">Pictet Asset Management</a> extended debt financing to the company — eighteen months after shares had traded at €1 and the CEO was pitching a <strong>€250M valuation</strong> on €12M revenue.
    </p>''', '''<p class="hero-body">
      SyncPilot sells consultation software to German public bodies and taxpayer-funded organisations. Its own records, court filings and capital-event history now raise a sharper question: how did a company serving public-sector clients move from a €100mn board-set valuation, to a €5.4mn insider share issue, and back above €100mn within months?
    </p>
    <p class="hero-body">
      LVS Hotel &amp; Resorts S.A. paid €6.15mn under a transaction linked to SyncPilot’s founder. No shares were delivered. On <a href="the-verdict.html">13 May 2026 the Augsburg Regional Court ordered Franz-Xaver Bleicher to repay the money</a>. The lawyer who drafted the LVS contract was connected to an entity that later acquired SyncPilot shares at €1 — a <strong>95% discount</strong> to the earlier board-set price.
    </p>'''),
    ('Discount on shares granted to an entity owned by two tax fraud defendants', 'Insider share issue to an entity owned by two Goldfinger defendants'),
    ('Paper valuation — set by the board, never by an independent appraiser', 'Board-set valuation, with no independent valuation disclosed'),
    ('Valuation pitched to Pictet — on €12M revenue, 37× multiple', '€250mn investor pitch on about €12mn revenue'),
    ('<p class="card-desc">...</p>\n        <span class="card-arrow">→</span>\n      </a>\n\n      <a href="shareholders.html"', '<p class="card-desc">Primary documents, capital events, payment records, ownership data and correspondence underlying the dossier.</p>\n        <span class="card-arrow">→</span>\n      </a>\n\n      <a href="shareholders.html"'),
    ('<p class="card-desc">...</p>\n        <span class="card-arrow">→</span>\n      </a>\n\n      <a href="network.html"', '<p class="card-desc">31 beneficial owners, 26 holding entities and the ownership chains behind SyncPilot SE.</p>\n        <span class="card-arrow">→</span>\n      </a>\n\n      <a href="network.html"'),
])

# the-lvs-trap.html — high-risk labels converted to sharper document-led labels.
edit_file('the-lvs-trap.html', [
    ('<!-- SECTION: THE BLATANT FRAUD -->', '<!-- SECTION: THE FRAUD QUESTION -->'),
    ('<h2 id="roles">The Blatant Fraud</h2>', '<h2 id="roles">The Fraud Question</h2>'),
    ('<p>Martin Hunstein occupied three roles simultaneously in this transaction:</p>', '<p>The LVS transaction raises the fraud question because Martin Hunstein appears on both sides of the wider SyncPilot story: as the lawyer who drafted the LVS agreement, and as a principal of the entity that later acquired SyncPilot shares at a 95% discount.</p>'),
    ('<div class="conflict-alert">⚠ Three concurrent roles — one transaction — one beneficiary</div>', '<div class="conflict-alert">Three concurrent roles — one transaction — one unresolved conflict</div>'),
    ('<p>The conflict: the lawyer who facilitated the €6.15 million transfer through a contract he drafted is the same person whose company acquired shares at one-twentieth of market price — in the same company, twenty-two months later.</p>', '<p>The conflict is direct: the lawyer who facilitated the €6.15 million transfer through a contract he drafted is the same person whose company acquired shares at one-twentieth of the earlier board-set price — in the same company, twenty-two months later.</p>'),
    ('<p>Under German law, a managing director who diverts corporate funds to personal use commits <a href="https://www.gesetze-im-internet.de/stgb/__266.html" target="_blank" rel="noopener"><em>Untreue</em> (breach of fiduciary duty, §266 StGB)</a> — punishable by up to five years\' imprisonment. If the funds were solicited under false representations, this additionally constitutes <a href="https://www.gesetze-im-internet.de/stgb/__263.html" target="_blank" rel="noopener"><em>Betrug</em> (fraud, §263 StGB)</a>.</p>', '<p>Under German law, diversion of company or investor funds to personal use can raise issues under <a href="https://www.gesetze-im-internet.de/stgb/__266.html" target="_blank" rel="noopener"><em>§266 StGB — Untreue</em> (breach of fiduciary duty)</a>. If funds were solicited on false representations, <a href="https://www.gesetze-im-internet.de/stgb/__263.html" target="_blank" rel="noopener"><em>§263 StGB — Betrug</em> (fraud)</a> may also become relevant. The documents reviewed here do not establish those offences. They establish the payment sequence, the absence of delivered shares, the court-ordered repayment, and the overlap between the contract lawyer’s role and his entity’s later discounted share acquisition.</p>'),
    ('<span>Bleicher property acquired during period</span>\n        <span>Under investigation</span>', '<span>Bleicher property acquired during period</span>\n        <span>Unreconciled</span>'),
    ('<span>Bleicher partner buyout during period</span>\n        <span>Under investigation</span>', '<span>Bleicher partner buyout during period</span>\n        <span>Unreconciled</span>'),
    ('''<div class="question-block">
      A lender paid €6.15&nbsp;million. No shares were ever delivered. The managing director acquired personal assets during the same period. The lawyer who drafted the contract — his company bought shares in the same company at a 95% discount. These are documented facts. The Augsburg Regional Court has now ordered repayment. A forensic audit of SyncPilot's accounts during April–August 2021 remains the open question.
    </div>''', '''<div class="question-block">
      A lender paid €6.15mn. No shares were delivered. A court has ordered repayment. During the same period, the founder acquired personal assets. The lawyer who drafted the LVS contract was linked to the entity that later bought SyncPilot shares at a 95% discount. These facts do not answer the fraud question. They make it unavoidable.
    </div>'''),
])

# the-evidence-room.html — harder but more defensible label.
edit_file('the-evidence-room.html', [
    ('<div class="er-stat-num">&euro;6.15M</div><div class="er-stat-label">Unaccounted Funds</div>', '<div class="er-stat-num">&euro;6.15M</div><div class="er-stat-label">Unreconciled LVS Funds</div>'),
])

# the-pictet-pitch.html — credit-file pressure retained.
edit_file('the-pictet-pitch.html', [
    ('<h2 id="non-disclosure">Three Categories of Non-Disclosure</h2>', '<h2 id="non-disclosure">Three Non-Disclosure Risks</h2>'),
    ('''<p>Three categories of information — if withheld from Pictet's credit committee — would each constitute material non-disclosure under German law.</p>''', '''<p>Three categories of information would have created material non-disclosure risk if they were absent from Pictet’s credit file: the Perseus share-price anomaly, the LVS exposure, and SyncPilot’s concentrated control structure.</p>'''),
    ('''<div class="question-block">
      That file exists. The answers are in it.
    </div>''', '''<div class="question-block">
      The credit file exists. It should show whether Pictet saw the anomaly, priced it, or missed it.
    </div>'''),
    ('The applicable German framework is not ambiguous.', 'The applicable German framework is sharp.'),
])

# sap-syncpilot-vendor-risk.html — retain open-letter aggression, reduce avoidable campaign phrasing.
edit_file('sap-syncpilot-vendor-risk.html', [
    ('The SAP badge is not a decoration — it is a commercial weapon. It converts government procurement officers into paying clients.', 'The SAP badge is not a decoration. It is a procurement credibility lever in a market where public-sector buyers rely on vendor credentials.'),
    ('The question is whether SAP knows what it is endorsing.', 'The question is whether SAP’s partner oversight identified what the public records now show.'),
    ('<div class="sap-questions-title">We expect answers</div>', '<div class="sap-questions-title">Questions SAP should answer</div>'),
    ('<p><strong>1. Suspend SyncPilot\'s Silver partnership</strong> pending a compliance review by SAP\'s Office of Ethics &amp; Compliance.</p>', '<p><strong>1. Suspend or review SyncPilot\'s Silver partnership</strong> pending compliance checks by SAP\'s Office of Ethics &amp; Compliance.</p>'),
    ('Until SAP acts, every public-sector contract SyncPilot wins under the SAP badge is a contract won under a credibility endorsement that SAP has not verified. That makes SAP part of the story.', 'Until SAP acts, every public-sector contract SyncPilot wins under the SAP badge is a contract won under a credibility endorsement whose factual basis has not been publicly explained. That places SAP’s partner oversight inside the governance question.'),
    ('An investor paid <a href="the-lvs-trap.html">€6.15 million to SyncPilot and received zero shares</a>. That lawyer is Martin Hunstein. The investor is suing.', 'An investor paid <a href="the-lvs-trap.html">€6.15 million to SyncPilot and received zero shares</a>. That lawyer is Martin Hunstein. The Augsburg Regional Court has ordered repayment.'),
])

# the-goldfinger-connection.html — retain Goldfinger frame; replace market-price language.
edit_file('the-goldfinger-connection.html', [
    ('''Two Munich lawyers. <a href="https://www.juve.de/verfahren/modell-goldfinger-muenchner-anwaelte-und-steuerberater-nach-razzia-in-untersuchungshaft/" target="_blank" rel="noopener" style="color:inherit;">Arrested. Jailed.</a> Defendants in a <a href="https://www.handelsblatt.com/finanzen/steuern-recht/steuern/steuerbetrug-goldfinger-methode-kostet-den-staat-milliarden/20953008.html" target="_blank" rel="noopener" style="color:inherit;">€1&nbsp;billion tax fraud investigation</a>.<br>
      Then they bought shares in SyncPilot at a <em>95% discount</em>.''', '''Two Munich lawyers. <a href="https://www.juve.de/verfahren/modell-goldfinger-muenchner-anwaelte-und-steuerberater-nach-razzia-in-untersuchungshaft/" target="_blank" rel="noopener" style="color:inherit;">Arrested and held in pre-trial detention</a> in the Goldfinger tax-fraud investigation.<br>
      Later, through H.G. Perseus, they acquired SyncPilot shares at €1 — a <em>95% discount</em> to the previous board-set price.'''),
    ('Everyone else paid €18–21 per share. They paid €1.00. The board approved it.', 'Other capital events were priced at €18–21 per share. They paid €1.00. The board approved it.'),
    ('Market price ✓', 'Board-set price'),
    ('market price again', 'board-set price again'),
    ('market price. Then they received', 'the higher board-set price. Then they received'),
    ('the market price had recovered', 'the board-set price had moved back up'),
    ('one-time departure from every other price', 'one-time departure from the surrounding board-set prices'),
])

# the-95-percent-discount.html — keep discount frame; qualify absence-based claims.
edit_file('the-95-percent-discount.html', [
    ('Same buyer, same company: 95% price collapse in 95 days', 'Same buyer, same company: 95% board-set price collapse in 95 days'),
    ('<p>No restructuring took place between December and March. No clients were lost. No bankruptcy was filed. Revenue did not change. The product did not change. The only variable was the price the board chose to set — and who was buying.</p>', '<p>The records reviewed show no restructuring, client loss, insolvency filing, revenue shock or product change between December and March. The visible change was the price the board chose to set — and the identity of the buyer.</p>'),
])

# syncpilot.html — sharpen control language and reconcile stake language.
edit_file('syncpilot.html', [
    ('One man controls it all: founder and Managing Director Franz-Xaver Bleicher.', 'Control is concentrated around one man: founder and Managing Director Franz-Xaver Bleicher.'),
    ('''<p>Bleicher founded SyncPilot and has served as its sole Managing Director since formation. He held 50.9% of the company at incorporation in September 2020. By August 2025, his effective stake had dropped to 23.5% — yet he remains the single largest beneficial owner and the only person with operational control of the company.</p>''', '''<p>Bleicher founded SyncPilot and has served as its sole Managing Director since formation. He held 50.9% at incorporation in September 2020. The current beneficial-ownership analysis used for this dossier records him at 16.48%, still the largest identified UBO. Court-referenced and company records show different figures at different points in the ownership history. The control issue is separate from the percentage: Bleicher remains the sole managing director and the central decision-maker in the records reviewed.</p>'''),
    ('''<p>Every share price in SyncPilot's history was set by the board Bleicher controls. No independent valuation has ever been commissioned. No share has ever traded on a public exchange. The company's €128&nbsp;million paper valuation exists only because Bleicher's board says it does.</p>''', '''<p>Every share price in SyncPilot's history was set by the board Bleicher controls. No independent valuation has been disclosed in the records reviewed. No share has ever traded on a public exchange. The company’s €128mn paper valuation rests on board-set prices.</p>'''),
    ('The March 2023 transaction is analysed in <a href="the-95-percent-discount.html"><strong>The Perseus Affair</strong></a>.', 'The March 2023 transaction is analysed in <a href="the-95-percent-discount.html"><strong>The 95% Discount</strong></a>.'),
])

# vendor-risk.html — update post-judgment status; keep procurement pressure.
edit_file('vendor-risk.html', [
    ('Are you aware that the founders <a href="the-lvs-trap.html">collected €6.15M from an investor and delivered zero shares</a>? The investor is suing.', 'Are you aware that the founders <a href="the-lvs-trap.html">collected €6.15M from an investor and delivered zero shares</a>? The Augsburg Regional Court has ordered repayment.'),
    ('If your organisation contracts with SyncPilot, this dossier concerns you.', 'If your organisation contracts with SyncPilot, this is now a procurement-risk issue.'),
])

# shareholders.html and network.html — terminology cleanup.
for page in ['shareholders.html', 'network.html']:
    edit_file(page, [
        ('exposed', 'mapped'),
        ('reveals', 'shows'),
        ('The forensic litigation database maps', 'The forensic ownership database maps'),
        ('Source: forensic litigation database', 'Source: forensic ownership database'),
    ])

print('Changed files:')
for path in changed:
    print(f' - {path}')
