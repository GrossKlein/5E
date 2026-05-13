# Branch & Backup Instructions

## Pre-flight: Back up `main`

Before merging, create an immutable tag at the current `main` HEAD so you have a permanent restoration point.

```bash
# 1. Ensure you are on main and up to date
git checkout main
git pull origin main

# 2. Create an annotated backup tag at the current HEAD
git tag -a backup/pre-verdict-2026-05-13 -m "Snapshot of main before integrating LG Augsburg verdict of 13 May 2026"

# 3. Push the tag to the remote
git push origin backup/pre-verdict-2026-05-13
```

## Commit the verdict PDF

```bash
git checkout feature/verdict-2026-05-13
git pull origin feature/verdict-2026-05-13

# Copy the PDF into the working tree
cp /path/to/Vorbehaltsurteil-LG-Augsburg-vom-13.05.2026_en-US.pdf \
   docs/Vorbehaltsurteil-LG-Augsburg-2026-05-13.pdf

git add docs/Vorbehaltsurteil-LG-Augsburg-2026-05-13.pdf
git commit -m "docs: commit LG Augsburg verdict PDF (Case 112 O 2848/25)"
git push
```

## Rollback (if needed)

```bash
# Restore main to its pre-verdict state
git checkout main
git reset --hard backup/pre-verdict-2026-05-13
git push --force-with-lease origin main
```

## Verification checklist before merging to main

- [ ] PDF resolves at `/docs/Vorbehaltsurteil-LG-Augsburg-2026-05-13.pdf`
- [ ] All cross-references between pages resolve (no 404s)
- [ ] Before/After diagrams render on both `shareholders.html` and `network.html` (Chunk 4 — pending)
- [ ] Closing-ledger interest figure is current (recompute if branch is merged later than 13 May 2026)
- [ ] `styles-patch.css` content has been appended to `styles.css` (Chunk 4 — pending)
