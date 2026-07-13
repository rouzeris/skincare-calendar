# Cosmetic catalog seeding

Seed autocomplete from the daily Open Beauty Facts bulk export. Keep every row
with a barcode, brand, and product name. Popularity and completeness rank results;
they do not exclude the long tail.

## License

Open Beauty Facts data is available under ODbL 1.0. The catalog must retain
attribution, identify modifications, and make the adapted catalog available
under ODbL. Product images use a separate CC BY-SA license and are not imported.

- Source: <https://world.openbeautyfacts.org/>
- Terms: <https://world.openbeautyfacts.org/terms-of-use>
- Database license: <https://opendatacommons.org/licenses/odbl/1-0/>

## Build

```sh
curl -L https://static.openbeautyfacts.org/data/en.openbeautyfacts.org.products.csv.gz \
  -o /tmp/openbeautyfacts-products.csv.gz
bun run catalog:build /tmp/openbeautyfacts-products.csv.gz /tmp/catalog-products.jsonl
```

Inspect counts and samples before importing. Import into a development deployment
first. Production replacement requires an approved PR and database backup.

```sh
bunx convex import --table catalogProducts --replace /tmp/catalog-products.jsonl
# Only after review:
bunx convex import --prod --table catalogProducts --replace /tmp/catalog-products.jsonl
```

User-submitted brands and products remain separate. Reconciliation can match
GTIN first, then normalized brand and product name. This avoids mixing submission
ownership/moderation state into the ODbL source table.
