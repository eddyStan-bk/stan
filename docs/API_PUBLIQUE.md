# API publique du portail (`api/public/*.php`)

Endpoints PHP en lecture seule lus par le portail Astro **au moment du build** (`frontend/src/lib/data.ts`). Le contrat TypeScript de référence est `frontend/src/lib/types.ts` : toute évolution se fait des deux côtés.

Les endpoints ne sont **pas encore écrits** : le schéma complet des tables (`maternal_deaths`, `child_deaths`, `case_statuses`, `health_zones`…) n'est pas versionné. Fournir un export de structure (sans données) avant de les implémenter.

## Règles communes

- `GET` uniquement (sinon `405`), réponse `application/json; charset=utf-8`, `Cache-Control: public, max-age=300`.
- Aucune session requise, aucune donnée individuelle : ni nom, ni date de naissance, ni combinaison « structure + date ».
- Seuls les dossiers **validés** sont comptés (`case_status_is_valid()` / statut validé).
- **Petits effectifs** : toute cellule « zone de santé × mois » comprise entre 1 et 4 est renvoyée à `null`. Le portail affiche alors « < 5 » et applique la même règle par sécurité (`formatCell()`), mais la protection doit d'abord être faite côté serveur.
- Requêtes préparées uniquement ; en cas d'erreur, `error_log('[OSME][api-public] …')` et réponse `500` `{"error":"indisponible"}` sans détail.
- Ne pas placer ces fichiers sous une règle `.htaccess` qui exige une session.

## `GET /api/public/indicators.php`

Agrégats des 12 derniers mois complets.

```json
{
  "generated_at": "2026-10-01T06:00:00Z",
  "source": "OSME, dossiers validés",
  "scope": "province du Sud-Kivu",
  "period": { "start": "2025-10-01", "end": "2026-09-30" },
  "kpis": {
    "maternal_deaths":       { "value": 118,  "previous": 134 },
    "perinatal_deaths":      { "value": 851,  "previous": 902 },
    "maternal_reviewed_pct": { "value": 71.2, "previous": 63.4 },
    "reporting_zones":       { "value": 8,    "previous": 7 }
  },
  "monthly": [
    { "month": "2025-10", "maternal": 11, "maternal_previous": 12, "stillbirths": 44, "early_neonatal": 33 }
  ],
  "maternal_causes": [
    { "label": "Hémorragies", "count": 41 },
    { "label": "Autres causes", "count": 17 }
  ],
  "by_zone": [
    { "zone": "Zone de santé de …", "maternal": 30, "perinatal": 210 },
    { "zone": "Zone de santé de …", "maternal": null, "perinatal": 15 }
  ]
}
```

| Champ | Contenu |
| --- | --- |
| `kpis.*.previous` | Même indicateur sur les 12 mois précédents (`null` si inconnu). |
| `maternal_reviewed_pct` | Part (0 à 100) des décès maternels de la période ayant fait l'objet d'une revue. |
| `reporting_zones` | Zones de santé ayant transmis au moins un dossier sur la période. |
| `monthly` | 12 lignes, une par mois, dans l'ordre chronologique. `maternal_previous` : même mois un an plus tôt. |
| `maternal_causes` | Causes établies par la revue ; au-delà de 5 causes, regrouper le reste en « Autres causes ». |
| `by_zone` | Une ligne par zone ayant notifié au moins un décès. `null` = cellule masquée. |

Totaux mensuels « toutes zones confondues » : ils ne sont pas masqués, sauf si une seule zone participe ce mois-là (masquer alors comme une cellule de zone).

## `GET /api/public/publications.php`

Publications marquées « publiées » dans l'administration des contenus (`pages/admin/content_admin_helpers.php`).

```json
[
  {
    "slug": "bulletin-trimestriel-2026-t2",
    "title": "Bulletin trimestriel, 2e trimestre 2026",
    "summary": "…",
    "published_at": "2026-07-15",
    "category": "Bulletin",
    "body_html": "<p>…</p>"
  }
]
```

- `slug` : minuscules, chiffres et tirets ; unique. Un slug identique à une publication Markdown du dépôt est ignoré.
- `body_html` est inséré tel quel dans la page : il **doit** être assaini côté PHP (liste blanche : `p, h2, h3, ul, ol, li, strong, em, a[href], blockquote, table, thead, tbody, tr, th, td`), sans attribut `style` ni `on*`, liens `http(s)` ou relatifs uniquement.
