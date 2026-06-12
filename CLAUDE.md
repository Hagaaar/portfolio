# Portfolio Planning — CLAUDE.md

## Projet
Application web single-file (`index.html`) de suivi de la production d'un portfolio d'architecture en 3 volumes imprimés (Lulu 216×216 mm).

## Stack
- HTML/CSS/JS pur, zéro dépendance (hors Google Fonts)
- Persistance : localStorage (`portfolio_v7_state`) + sync Google Sheets (`GS_URL`)
- Fonts : Inter + JetBrains Mono (Google Fonts)

---

## ⚠️ JALON — Refonte v7 (juin 2026)

Commit : `b5425f5` — *"Redesign UI + volume progress lié aux tâches individuelles"*

### Ce qui a changé par rapport aux versions précédentes

**Design (avant : warm/brownish, après : cool/purple)**
- Palette tokens renommés : `--bg`, `--s1`, `--s2`, `--b1`, `--b2`, `--tx`, `--tx2`, `--tx3`, `--c1/c2/c3`
- Hero bar 64px remplace les deux barres fines (tâches + pages)
- Cercle SVG de progression sur chaque card semaine (remplace le simple `%` à droite)
- Badges en pill (`border-radius: 99px`) au lieu de badges carrés
- `done-all` : fond vert complet sur la card (effet satisfaction restauré)
- Pop animation (`@keyframes pop`) sur les step-num au cochage
- Onglet Volumes : accordéons riches avec `%` en 48px, sections détaillées, mini progress bars

**Logique volume (breaking change vs versions antérieures)**
- Avant : `calcVolDonePages` utilisait `isWeekDone` → all-or-nothing par semaine
- Après : progression proportionnelle tâche par tâche via `buildTaskVolMap()`

### Fonctionnement de buildTaskVolMap()
Appelé une fois à l'init, construit `taskVolMap : taskId → volId`.
- Semaine mono-volume → toutes les tâches rattachées à ce volume
- Semaine multi-volumes (seul cas : **S10** = Vol.1 + Vol.3) → matching par nom de projet dans `t.txt`, fallback sur `e.vol`

### Fonctionnement de calcVolDonePages(volId)
```
pour chaque semaine W contenant des projets du volume :
  pagesGagnées += (tâches_vol_cochées_dans_W / tâches_vol_total_dans_W) × pages_vol_dans_W
```
Résultat exact (pas de double comptage) quand la semaine est 100% cochée.

### Fonctions clés
| Fonction | Rôle |
|---|---|
| `buildTaskVolMap()` | Index taskId→volId, appelé au boot avant renderPlanning |
| `calcVolDonePages(volId)` | Pages réalisées pour un volume, proratisées par tâche |
| `updateGlobalProg()` | Hero bar + pLabel, utilise calcVolDonePages pour cohérence |
| `updateWeekUI(wid)` | Met à jour cercle SVG, pbar, prog-fill, count après toggle |
| `renderVolumes()` | Rendu lazy (seulement si onglet Volumes actif ou switch vers lui) |
| `isWeekDone(weekId)` | Still all-or-nothing — utilisé uniquement pour le ✓ projet dans Volumes |

---

## Données

### Planning (19 semaines + 2 congés)
`PLANNING[]` — chaque entrée semaine a : `id`, `week` (S01–S19), `dates`, `type` (setup/reformat/nouveau/finitions), `vol` (b-vol1/b-vol2/b-vol3/''), `volLbl`, `tasks[]`

### Volumes (3 volumes)
`VOLUMES[]` — `vol1` (218p), `vol2` (156p), `vol3` (183p). Chaque projet a `{n, p, s}` où `s` est le weekId (ex: `'S02'`).

### Clés critiques
- `LS_KEY = 'portfolio_v7_state'` — ne pas changer sans migration
- `GS_URL` — URL Google Apps Script de sync, ne pas modifier
- Semaine mixte **S10** : seul cas avec Vol.1 (De la Comédie au Lez, 24p) + Vol.3 (5 projets graphisme, 22p)
