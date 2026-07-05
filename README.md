# AdaptActif — GELÉ (absorbé par DiffActif)

> **Statut : développement gelé depuis juillet 2026.**
> Fonctions reprises par **DiffActif** (`projets/diffactif`,
> https://diffactif.vercel.app), l'app canonique PLAI de différenciation par
> Aménagements Universels. (Adaptateur AUs, première version de DiffActif,
> a été supprimé en juillet 2026.)

## Ce que faisait AdaptActif

Adaptation de supports de cours PDF par profils d'élèves :

- Import PDF découpé en diapositives (`usePdfParsing`)
- Sélection de profils d'adaptation (écran Profils)
- Adaptation IA du texte (`api/adapt-text.js`)
- Suppression d'arrière-plan d'images (`api/remove-bg.js`)
- Prévisualisation puis export

## À reprendre dans DiffActif (backlog de consolidation)

| Fonction | Intérêt | État dans DiffActif |
|---|---|---|
| Adaptation par profils d'élèves multiples | Différenciation en un passage | Couvert (cartographie de profils) |
| Suppression d'arrière-plan (`remove-bg`) | Nettoyage d'images de scans | Absent — à évaluer |
| Découpage PDF en diapositives | Traitement de présentations | Partiel (`api/extract`) |

## Raison du gel

Plusieurs apps couvraient « rendre un document accessible » (AdaptActif, AccessDoc,
Adaptateur AUs, Narration DYS). Pour un enseignant, quatre outils proches = aucun outil.
DiffActif — successeur direct d'Adaptateur AUs — est l'app canonique de la
différenciation par Aménagements Universels : c'est elle qui absorbe.
Narration DYS reste indépendante (fonction distincte : lecture audio).

Plan complet : `claude-workspace/memory/consolidation-accessibilite-plan.md`
