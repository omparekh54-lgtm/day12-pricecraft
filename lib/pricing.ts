export type Row = { date: string; sku: string; price: number; units: number; unit_cost: number; list_price?: number; segment?: string };
export type Summary = { revenue: number; units: number; grossProfit: number; marginPct: number; avgPrice: number; discountLeakage: number; skuCount: number };

export function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(x => x.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const c = line.split(',').map(x => x.trim());
    const g = (n: string) => c[headers.indexOf(n)] ?? '';
    return { date: g('date'), sku: g('sku'), price: Number(g('price')), units: Number(g('units')), unit_cost: Number(g('unit_cost')), list_price: g('list_price') ? Number(g('list_price')) : undefined, segment: g('segment') || undefined };
  }).filter(r => r.date && r.sku && Number.isFinite(r.price) && r.price > 0 && Number.isFinite(r.units) && r.units >= 0 && Number.isFinite(r.unit_cost) && r.unit_cost >= 0);
}

export function summarize(rows: Row[]): Summary {
  let revenue = 0, units = 0, grossProfit = 0, discountLeakage = 0;
  const skus = new Set<string>();
  for (const r of rows) {
    const rev = r.price * r.units;
    revenue += rev; units += r.units; grossProfit += (r.price - r.unit_cost) * r.units; skus.add(r.sku);
    if (r.list_price && r.list_price > r.price) discountLeakage += (r.list_price - r.price) * r.units;
  }
  return { revenue, units, grossProfit, marginPct: revenue ? grossProfit / revenue : 0, avgPrice: units ? revenue / units : 0, discountLeakage, skuCount: skus.size };
}

export function estimateElasticity(rows: Row[], sku: string) {
  const x = rows.filter(r => r.sku === sku && r.price > 0 && r.units > 0);
  if (x.length < 4) return null;
  const lp = x.map(r => Math.log(r.price)), lu = x.map(r => Math.log(r.units));
  const mx = lp.reduce((a,b) => a+b,0)/lp.length, my = lu.reduce((a,b) => a+b,0)/lu.length;
  const cov = lp.reduce((s,v,i) => s+(v-mx)*(lu[i]-my),0), vari = lp.reduce((s,v) => s+(v-mx)**2,0);
  if (!vari) return null;
  const beta = cov/vari;
  const yhat = lp.map(v => my + beta*(v-mx));
  const ssr = lu.reduce((s,v,i) => s+(v-yhat[i])**2,0), sst = lu.reduce((s,v) => s+(v-my)**2,0);
  return { elasticity: beta, r2: sst ? 1-ssr/sst : 0, n: x.length };
}

export function simulate(rows: Row[], priceChangePct: number, elasticity: number) {
  const base = summarize(rows), factor = 1 + priceChangePct/100, qtyFactor = Math.max(0, Math.pow(factor, elasticity));
  let revenue = 0, grossProfit = 0, units = 0;
  for (const r of rows) { const u = r.units*qtyFactor, p = r.price*factor; units += u; revenue += p*u; grossProfit += (p-r.unit_cost)*u; }
  return { revenue, grossProfit, units, revenueDelta: revenue-base.revenue, profitDelta: grossProfit-base.grossProfit, qtyDelta: units-base.units };
}

export function skuInsights(rows: Row[]) {
  return [...new Set(rows.map(r=>r.sku))].map(sku => { const r = rows.filter(x=>x.sku===sku), s = summarize(r), e = estimateElasticity(rows,sku); return { sku, ...s, elasticity: e }; }).sort((a,b)=>b.grossProfit-a.grossProfit);
}
