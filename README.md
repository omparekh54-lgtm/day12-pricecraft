# PriceCraft — Day 12

A privacy-first pricing decision lab for businesses that have sales history in spreadsheets but do not have a pricing science team.

## Why this is not just another pricing dashboard

PriceCraft separates **observed economics**, **statistical association**, and **scenario assumptions**. It helps a user find margin leakage and explore price decisions, but it refuses to claim causal price elasticity from ordinary sales history.

## Core workflow
1. Upload CSV locally in the browser.
2. Validate required columns (`date, sku, price, units, unit_cost`).
3. Review observed revenue, margin, and discount leakage.
4. Inspect per-SKU price sensitivity estimates with fit diagnostics.
5. Stress-test a price move using a user-controlled elasticity assumption.
6. Export the scenario for review.

## Input contract
Required: `date, sku, price, units, unit_cost`. Optional: `list_price, segment`.

## Methodology
- Gross profit = `(price - unit_cost) × units`.
- Discount leakage = `(list_price - actual price) × units`, only where list price exists.
- Elasticity estimate = OLS slope from `log(units) ~ log(price)` per SKU. This is observational association, not causal elasticity.
- Scenario lab applies `Q1/Q0 = (P1/P0)^elasticity` using the user's assumed elasticity.

## Confidence & honesty layer
- **Known:** observed sales, price, cost, margin, list-price leakage.
- **Statistical estimate:** simple SKU elasticity association and R².
- **Simulation:** hypothetical price-change outcomes under an assumed elasticity.
- **Insufficient evidence:** causal revenue/profit lift from changing price.

## Limitations
The elasticity model does not control for promotions, seasonality, channel mix, stockouts, competitor prices, endogeneity, or customer selection. CSV parsing targets clean comma-separated exports. This is decision support, not autonomous pricing.

## Privacy
The current app processes uploaded CSV data entirely in the browser and does not persist it to an application database.

## Tests
`npm test`

## Build
`npm run build`
