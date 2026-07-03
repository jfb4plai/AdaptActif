# AdaptActif — GELÉ (absorbé par Adaptateur AUs)

> **Statut : développement gelé depuis juillet 2026.**
> Fonctions reprises par **Adaptateur AUs** (`projets/au-convertisseur`,
> https://adaptateur-aus.vercel.app), l'app canonique PLAI d'accessibilité documentaire.

## Ce que faisait AdaptActif

Adaptation de supports de cours PDF par profils d'élèves :

- Import PDF découpé en diapositives (`usePdfParsing`)
- Sélection de profils d'adaptation (écran Profils)
- Adaptation IA du texte (`api/adapt-text.js`)
- Suppression d'arrière-plan d'images (`api/remove-bg.js`)
- Prévisualisation puis export

## À reprendre dans Adaptateur AUs (backlog de consolidation)

| Fonction | Intérêt | État dans Adaptateur AUs |
|---|---|---|
| Adaptation par profils d'élèves multiples | Différenciation en un passage | Absent — à porter |
| Suppression d'arrière-plan (`remove-bg`) | Nettoyage d'images de scans | Absent — à évaluer |
| Découpage PDF en diapositives | Traitement de présentations | Partiel (`pdf-vision`) |

## Raison du gel

Quatre apps couvraient « rendre un document accessible » (AdaptActif, AccessDoc,
Adaptateur AUs, Narration DYS). Pour un enseignant, quatre outils proches = aucun outil.
Adaptateur AUs est la plus aboutie (56 commits, 7 fonctions API, score d'accessibilité
déterministe, alignée sur le cadre AU FWB/PLAI) — c'est elle qui absorbe.
Narration DYS reste indépendante (fonction distincte : lecture audio).

Plan complet : `claude-workspace/memory/consolidation-accessibilite-plan.md`
