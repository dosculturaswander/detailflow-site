const http = require("http");
const { URL } = require("url");

const PORT = process.env.PORT || 10000;
const CHECKOUT_URL = process.env.CHECKOUT_URL || "https://buy.stripe.com/test_cNi6ozavS3lma7ielfgjC00";
const DOWNLOAD_TOKEN = process.env.DOWNLOAD_TOKEN || "";
const PRODUCT_B64 = [
  process.env.PRODUCT_ZIP_B64_1 || "",
  process.env.PRODUCT_ZIP_B64_2 || "",
  process.env.PRODUCT_ZIP_B64_3 || "",
  process.env.PRODUCT_ZIP_B64_4 || "",
  process.env.PRODUCT_ZIP_B64_5 || "",
  process.env.PRODUCT_ZIP_B64_6 || ""
].join("");

const sampleCsv = "Format,Hook,What to Show,CTA\nReel,\"This is why a quick wash isn't the same as a detail.\",50/50 before and after panel,DM for a quote\nReel,\"The part of your car most people forget to clean.\",Door jamb before and after,Save this for later\nPhoto,\"What $[PRICE] actually gets you.\",Final walkaround,Book this week\nCarousel,\"3 signs your interior needs more than a vacuum.\",Seat cupholder and floor mat close-ups,Send your vehicle for pricing\nReel,\"Pet hair isn't impossible - it just needs the right process.\",Pet hair removal,Ask about maintenance details\nReel,\"The difference is in the edges.\",Trim and crevice close-up,Follow for more transformations\nPhoto,\"A clean car feels different before you even drive it.\",Finished interior,Book this week\nStory,\"This is what months of buildup looks like up close.\",Dirty console close-up,DM for a quote\nReel,\"One small upgrade that changes the whole finish.\",Tire dressing or sealant reveal,Send your vehicle for pricing\nCarousel,\"Before you sell your car, do this first.\",Before after exterior and interior,Save this for later\n";

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}

function salesPage() {
  const checkout = esc(CHECKOUT_URL);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DetailFlow — Mobile Detailing Business Toolkit</title>
<meta name="description" content="A practical operating toolkit for mobile detailers: pricing, quotes, bookings, CRM, revenue tracking, follow-up scripts, and 90 days of content ideas.">
<style>
:root{--bg:#090d18;--panel:#101827;--line:#263247;--muted:#9ba8bb;--text:#f8fafc;--green:#86efac;--btn:#f8fafc;--btntext:#0f172a}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:linear-gradient(180deg,#080c16 0%,#111827 52%,#090d18 100%);color:var(--text)}
a{color:inherit}.wrap{max-width:1120px;margin:auto;padding:26px}.nav{display:flex;justify-content:space-between;gap:16px;align-items:center}.brand{font-weight:950;letter-spacing:.1em}.tag{font-size:13px;color:var(--muted)}
.hero{padding:76px 0 46px;display:grid;grid-template-columns:1.14fr .86fr;gap:44px;align-items:center}.eyebrow{font-weight:800;color:var(--green);text-transform:uppercase;letter-spacing:.12em;font-size:12px}.hero h1{font-size:58px;line-height:1.01;letter-spacing:-.035em;margin:12px 0 18px;max-width:760px}.hero p{font-size:19px;line-height:1.65;color:#d4d9e2;max-width:720px}.actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.cta,.ghost{display:inline-block;padding:15px 21px;border-radius:12px;text-decoration:none;font-weight:850;margin-top:15px}.cta{background:var(--btn);color:var(--btntext)}.ghost{border:1px solid #42506a;color:#e5e7eb}.small{color:var(--muted);font-size:13px;margin-top:10px}
.card{background:rgba(16,24,39,.94);border:1px solid var(--line);border-radius:20px;padding:28px;box-shadow:0 24px 70px rgba(0,0,0,.25)}.price{font-size:48px;font-weight:950}.price span{font-size:14px;color:var(--muted);font-weight:550}.check{padding:9px 0;border-bottom:1px solid #273244}.check:last-child{border-bottom:0}.badge{display:inline-flex;gap:7px;align-items:center;font-size:12px;color:#cbd5e1;border:1px solid #334155;border-radius:999px;padding:7px 10px;margin-bottom:14px}
.section{padding:46px 0}.section h2{font-size:36px;letter-spacing:-.02em;margin:0 0 22px}.section-intro{color:#cbd5e1;line-height:1.65;max-width:760px;margin:-10px 0 24px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.feature{padding:22px;border:1px solid var(--line);border-radius:16px;background:#0f172a}.feature h3{margin:0 0 9px}.feature p{margin:0;color:#cbd5e1;line-height:1.55}.preview{display:grid;grid-template-columns:.82fr 1.18fr;gap:28px;align-items:center}.kicker{font-size:13px;color:#a7f3d0;font-weight:800}.mock{border:1px solid #334155;border-radius:18px;background:#0c1424;padding:18px;box-shadow:0 20px 50px rgba(0,0,0,.28)}.mocktop{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.mocktitle{font-weight:900}.pill{font-size:11px;border:1px solid #334155;border-radius:999px;padding:5px 8px;color:#cbd5e1}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.stat{background:#111827;border:1px solid #273244;border-radius:12px;padding:12px}.stat b{display:block;font-size:20px}.stat span{font-size:11px;color:#94a3b8}.bars{margin-top:14px;display:grid;gap:9px}.barrow{display:grid;grid-template-columns:72px 1fr 42px;gap:8px;align-items:center;font-size:11px;color:#cbd5e1}.track{height:9px;background:#172033;border-radius:999px;overflow:hidden}.fill{height:100%;background:#86efac;border-radius:999px}.faq{display:grid;gap:12px}.faq details{border:1px solid var(--line);background:#0f172a;border-radius:14px;padding:16px 18px}.faq summary{font-weight:800;cursor:pointer}.faq p{color:#cbd5e1;line-height:1.6;margin:12px 0 2px}.footer{padding:50px 0 70px;color:var(--muted);font-size:13px;line-height:1.6}
@media(max-width:840px){.hero,.preview{grid-template-columns:1fr}.hero{padding-top:52px}.hero h1{font-size:43px}.grid{grid-template-columns:1fr}.wrap{padding:20px}.tag{display:none}.stats{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<div class="wrap">
<div class="nav"><div class="brand">DETAILFLOW</div><div class="tag">Built for mobile detailers</div></div>
<section class="hero">
<div>
<div class="eyebrow">Run the business, not the chaos</div>
<h1>The operating toolkit for mobile detailers.</h1>
<p>Price jobs properly, quote faster, track bookings and customers, understand what you actually earn, follow up consistently, and never wonder what to post next.</p>
<div class="actions"><a class="cta" href="${checkout}">Get DetailFlow for $29</a><a class="ghost" href="/free-sample.csv">Download a free sample</a></div>
<div class="small">One-time purchase • Instant digital download • No subscription</div>
</div>
<div class="card">
<div class="badge">One toolkit • built for owner-operators</div>
<div class="price">$29 <span>one time</span></div>
<div class="check">✓ Pricing calculator</div><div class="check">✓ Quote builder</div><div class="check">✓ Booking tracker</div><div class="check">✓ Customer CRM</div><div class="check">✓ Revenue dashboard</div><div class="check">✓ Follow-up scripts</div><div class="check">✓ 90-day content calendar</div><div class="check">✓ Quickstart PDF</div>
</div>
</section>
<section class="section">
<h2>Everything you keep rebuilding, already built.</h2>
<div class="grid">
<div class="feature"><h3>Know your real price</h3><p>Estimate labor and supply cost, then calculate a recommended selling price from your target margin.</p></div>
<div class="feature"><h3>Quote in minutes</h3><p>Build a clean quote with core services, add-ons, tax, deposit, and total due.</p></div>
<div class="feature"><h3>Track the whole pipeline</h3><p>Keep leads, quotes, bookings, completed jobs, payments, reviews, and lead sources in one place.</p></div>
<div class="feature"><h3>See the numbers</h3><p>A dashboard shows paid revenue, completed jobs, average ticket, monthly revenue, and lead sources.</p></div>
<div class="feature"><h3>Follow up consistently</h3><p>Use ready-to-send messages for new leads, quote follow-up, reminders, reviews, referrals, and reactivation.</p></div>
<div class="feature"><h3>Post without guessing</h3><p>90 days of detailing-specific hooks, shot ideas, formats, and calls to action.</p></div>
</div>
</section>
<section class="section preview">
<div>
<div class="kicker">SEE WHAT YOU'RE BUYING</div>
<h2>A business dashboard you can actually use.</h2>
<p class="section-intro">DetailFlow is a working Excel toolkit, not a generic PDF full of advice. Replace the sample data with your own numbers and start operating from one place.</p>
<a class="cta" href="${checkout}">Buy DetailFlow — $29</a>
</div>
<div class="mock">
<div class="mocktop"><div class="mocktitle">DetailFlow Dashboard</div><div class="pill">Sample data</div></div>
<div class="stats"><div class="stat"><b>$4,820</b><span>Paid revenue</span></div><div class="stat"><b>27</b><span>Completed jobs</span></div><div class="stat"><b>$178</b><span>Average ticket</span></div></div>
<div class="bars"><div class="barrow"><span>Referral</span><div class="track"><div class="fill" style="width:82%"></div></div><b>41%</b></div><div class="barrow"><span>Instagram</span><div class="track"><div class="fill" style="width:58%"></div></div><b>29%</b></div><div class="barrow"><span>Google</span><div class="track"><div class="fill" style="width:34%"></div></div><b>17%</b></div><div class="barrow"><span>Other</span><div class="track"><div class="fill" style="width:26%"></div></div><b>13%</b></div></div>
</div>
</section>
<section class="section card"><div class="eyebrow">Simple by design</div><h2>No subscription. No bloated CRM.</h2><p class="section-intro">DetailFlow is for detailers who want a professional operating system without committing to another monthly app. Open the workbook, replace the sample numbers, and use it immediately.</p><a class="cta" href="${checkout}">Get DetailFlow for $29</a></section>
<section class="section"><h2>Questions before you buy</h2><div class="faq">
<details><summary>What do I receive?</summary><p>The full Excel business toolkit plus the DetailFlow Quickstart Playbook. The workbook includes pricing, quotes, bookings, CRM, revenue tracking, follow-up scripts, and a 90-day content system.</p></details>
<details><summary>Is this a subscription?</summary><p>No. DetailFlow is a one-time digital purchase.</p></details>
<details><summary>Do I need special software?</summary><p>The main toolkit is an .xlsx workbook designed for Microsoft Excel and compatible spreadsheet software. Some formulas or formatting may vary outside Excel.</p></details>
<details><summary>Can I resell it?</summary><p>No. Your purchase is licensed for use by one business owner/operator and may not be resold, redistributed, or repackaged for sale.</p></details>
<details><summary>Is this accounting or tax advice?</summary><p>No. DetailFlow is an organizational and planning toolkit. It is not legal, tax, accounting, or financial advice.</p></details>
</div></section>
<div class="footer">DetailFlow by Dos Culturas Wander LLC. Digital product for one business owner/operator. Not for resale or redistribution. Digital purchases are non-returnable once delivered except where required by applicable law or if the files are defective.</div>
</div></body></html>`;
}

function downloadPage(token) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>DetailFlow Download</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0b1020;color:#f9fafb;margin:0}.wrap{max-width:720px;margin:10vh auto;padding:28px}.card{background:#111827;border:1px solid #263247;border-radius:20px;padding:34px}h1{font-size:38px;margin:0 0 14px}p{color:#cbd5e1;line-height:1.6}.btn{display:inline-block;background:#f9fafb;color:#111827;text-decoration:none;font-weight:800;padding:14px 20px;border-radius:12px;margin-top:12px}.small{font-size:13px;color:#9ca3af;margin-top:18px}</style></head><body><div class="wrap"><div class="card"><h1>Your DetailFlow files are ready.</h1><p>Thanks for your purchase. Download the complete toolkit below and save a backup copy before editing the workbook.</p><a class="btn" href="/product.zip?token=${encodeURIComponent(token)}">Download DetailFlow</a><div class="small">Includes the XLSX business toolkit, PDF quickstart playbook, and license/readme. Please do not share this private download page.</div></div></div></body></html>`;
}

function send(res, status, type, body, extra={}) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store",
    "X-Content-Type-Options":"nosniff",
    "X-Frame-Options":"DENY",
    "Referrer-Policy":"no-referrer",
    ...extra
  });
  res.end(body);
}

const server = http.createServer((req,res)=>{
  if (req.method !== "GET") return send(res,405,"text/plain; charset=utf-8","Method not allowed");
  const u = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (u.pathname === "/" || u.pathname === "/index.html") return send(res,200,"text/html; charset=utf-8",salesPage(),{"Cache-Control":"public, max-age=300"});
  if (u.pathname === "/free-sample.csv") return send(res,200,"text/csv; charset=utf-8",sampleCsv,{"Content-Disposition":'attachment; filename="DetailFlow_Free_Sample.csv"',"Cache-Control":"public, max-age=3600"});
  if (u.pathname === "/healthz") return send(res,200,"text/plain; charset=utf-8","ok",{"Cache-Control":"no-store"});
  if (u.pathname === "/robots.txt") return send(res,200,"text/plain; charset=utf-8","User-agent: *\nDisallow: /download\nDisallow: /product.zip\n");
  if (u.pathname === "/download") {
    const t = u.searchParams.get("token") || "";
    if (!DOWNLOAD_TOKEN || t !== DOWNLOAD_TOKEN) return send(res,404,"text/plain; charset=utf-8","Not found");
    return send(res,200,"text/html; charset=utf-8",downloadPage(t));
  }
  if (u.pathname === "/product.zip") {
    const t = u.searchParams.get("token") || "";
    if (!DOWNLOAD_TOKEN || t !== DOWNLOAD_TOKEN || !PRODUCT_B64) return send(res,404,"text/plain; charset=utf-8","Not found");
    const buf = Buffer.from(PRODUCT_B64,"base64");
    res.writeHead(200,{
      "Content-Type":"application/zip",
      "Content-Length":buf.length,
      "Content-Disposition":'attachment; filename="DetailFlow_Product_Download.zip"',
      "Cache-Control":"no-store",
      "X-Content-Type-Options":"nosniff",
      "Referrer-Policy":"no-referrer"
    });
    return res.end(buf);
  }
  return send(res,404,"text/plain; charset=utf-8","Not found");
});

server.listen(PORT,()=>console.log(`DetailFlow listening on ${PORT}`));