import test from 'node:test';
import assert from 'node:assert/strict';

function parseCsv(text){const lines=text.trim().split(/\r?\n/).filter(Boolean);const h=lines[0].split(',').map(x=>x.trim().toLowerCase());return lines.slice(1).map(line=>{const c=line.split(',').map(x=>x.trim());const g=n=>c[h.indexOf(n)]??'';return {date:g('date'),sku:g('sku'),price:Number(g('price')),units:Number(g('units')),unit_cost:Number(g('unit_cost')),list_price:g('list_price')?Number(g('list_price')):undefined}}).filter(r=>r.date&&r.sku&&r.price>0&&r.units>=0&&r.unit_cost>=0)}
function summarize(rows){let revenue=0,units=0,grossProfit=0,discountLeakage=0;for(const r of rows){revenue+=r.price*r.units;units+=r.units;grossProfit+=(r.price-r.unit_cost)*r.units;if(r.list_price>r.price)discountLeakage+=(r.list_price-r.price)*r.units}return{revenue,units,grossProfit,discountLeakage}}
function estimateElasticity(rows,sku){const x=rows.filter(r=>r.sku===sku&&r.price>0&&r.units>0);if(x.length<4)return null;const lp=x.map(r=>Math.log(r.price)),lu=x.map(r=>Math.log(r.units));const mx=lp.reduce((a,b)=>a+b)/lp.length,my=lu.reduce((a,b)=>a+b)/lu.length;const cov=lp.reduce((s,v,i)=>s+(v-mx)*(lu[i]-my),0),vari=lp.reduce((s,v)=>s+(v-mx)**2,0);return cov/vari}
const csv='date,sku,price,units,unit_cost,list_price\n2026-01-01,A,100,100,60,110\n2026-02-01,A,110,90,60,110\n2026-03-01,A,120,80,60,120\n2026-04-01,A,90,120,60,110';
test('parses valid rows',()=>assert.equal(parseCsv(csv).length,4));
test('computes revenue and profit',()=>{const s=summarize(parseCsv(csv));assert.equal(s.revenue,100*100+110*90+120*80+90*120);assert.ok(s.grossProfit>0)});
test('computes discount leakage',()=>assert.equal(summarize(parseCsv(csv)).discountLeakage,10*100+20*120));
test('elasticity direction is negative for falling quantity as price rises',()=>assert.ok(estimateElasticity(parseCsv(csv),'A')<0));
test('requires enough observations for elasticity',()=>assert.equal(estimateElasticity(parseCsv(csv).slice(0,3),'A'),null));
