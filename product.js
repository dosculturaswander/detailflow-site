const ExcelJS=require('exceljs');
const PDFDocument=require('pdfkit');
const archiver=require('archiver');

const hooks=[
'This is why a quick wash is not the same as a detail.',
'The part of your car most people forget to clean.',
'What $[PRICE] actually gets you.',
'3 signs your interior needs more than a vacuum.',
'Pet hair is not impossible - it just needs the right process.',
'The difference is in the edges.',
'A clean car feels different before you even drive it.',
'This is what months of buildup looks like up close.',
'One small upgrade that changes the whole finish.',
'Before you sell your car, do this first.'
];
const formats=['Reel','Reel','Photo','Carousel','Reel','Reel','Photo','Story','Reel','Carousel'];
const shots=['Before/after panel','Door jamb close-up','Final walkaround','Seat, cupholder and mat close-ups','Pet hair removal','Trim and crevice close-up','Finished interior','Dirty console close-up','Tire dressing or sealant reveal','Exterior and interior before/after'];
const ctas=['DM for a quote','Save this for later','Book this week','Send your vehicle for pricing','Ask about maintenance details','Follow for more transformations'];

function style(ws,widths){
  ws.views=[{state:'frozen',ySplit:1}];
  ws.getRow(1).font={bold:true,color:{argb:'FFFFFFFF'}};
  ws.getRow(1).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF1F2937'}};
  ws.columns.forEach((c,i)=>c.width=widths[i]||18);
  ws.eachRow((r,n)=>{r.alignment={vertical:'top',wrapText:true};if(n>1&&n%2===0)r.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF8FAFC'}};});
}
async function workbook(){
  const wb=new ExcelJS.Workbook(); wb.creator='DetailFlow by Dos Culturas Wander LLC';
  const s=wb.addWorksheet('Start Here');
  s.addRows([
    ['DetailFlow','Mobile Detailing Business Toolkit'],
    ['1. Pricing','Replace sample assumptions with your real labor, supply, travel and overhead costs.'],
    ['2. Quotes','Use Quote Builder for estimates, deposits and balance due.'],
    ['3. Jobs','Track every inquiry and booking in Booking Tracker.'],
    ['4. Customers','Use CRM for repeat customers and follow-up dates.'],
    ['5. Review','Use Dashboard to watch revenue, completed jobs and average ticket.'],
    ['6. Content','Use the 90-Day Content sheet as your posting prompt bank.'],
    ['Important','Organizational/planning tool only. Not legal, tax, accounting or financial advice.']
  ]);style(s,[28,82]);

  const p=wb.addWorksheet('Pricing Calculator');
  p.addRows([
    ['Input','Value','Notes'],['Labor hours',3,'Estimated hands-on time'],['Target hourly pay',45,'Your target hourly compensation'],
    ['Supplies cost',18,'Chemicals, towels, disposables'],['Travel cost',10,'Fuel/tolls per job'],['Overhead allocation',20,'Insurance, software, equipment allocation'],
    ['Target profit margin',0.35,'0.35 = 35%'],['Labor cost',{formula:'B2*B3'},'Hours x hourly pay'],['Total job cost',{formula:'SUM(B4:B6)+B8'},'All direct + allocated costs'],
    ['Recommended price',{formula:'IF(B7>=1,B9,B9/(1-B7))'},'Price for target gross margin'],['Expected gross profit',{formula:'B10-B9'},'Price - cost'],['Gross margin',{formula:'IF(B10=0,0,B11/B10)'},'Profit / price']
  ]);style(p,[28,18,50]);p.getColumn(2).numFmt='$#,##0.00';p.getCell('B7').numFmt='0%';p.getCell('B12').numFmt='0%';

  const q=wb.addWorksheet('Quote Builder');
  q.addRows([['Field','Value'],['Customer name','Sample Customer'],['Vehicle','2022 SUV'],['Core service price',180],['Add-ons',40],['Discount',0],['Tax rate',0],['Subtotal',{formula:'B4+B5-B6'}],['Tax',{formula:'B8*B7'}],['Total quote',{formula:'B8+B9'}],['Deposit %',0.25],['Deposit due',{formula:'B10*B11'}],['Balance after deposit',{formula:'B10-B12'}]]);
  style(q,[30,34]);['B4','B5','B6','B8','B9','B10','B12','B13'].forEach(c=>q.getCell(c).numFmt='$#,##0.00');['B7','B11'].forEach(c=>q.getCell(c).numFmt='0%');

  const b=wb.addWorksheet('Booking Tracker');b.addRow(['Job #','Date','Customer','Vehicle','Service','Status','Quoted','Paid','Lead Source','Review','Notes']);
  for(let i=1;i<=40;i++)b.addRow([`DF-${String(i).padStart(3,'0')}`,'','','','','Lead','','','','','']);
  style(b,[12,13,22,20,22,14,14,14,18,12,35]);b.getColumn(7).numFmt='$#,##0.00';b.getColumn(8).numFmt='$#,##0.00';
  for(let r=2;r<=41;r++)b.getCell(`F${r}`).dataValidation={type:'list',allowBlank:true,formulae:['"Lead,Quoted,Booked,Completed,Cancelled"']};

  const c=wb.addWorksheet('CRM');c.addRow(['Customer','Phone','Email','Vehicle','First Contact','Last Service','Lifetime Revenue','Next Follow-up','Source','Notes']);
  for(let i=0;i<35;i++)c.addRow(['','','','','','','','','','']);style(c,[22,18,28,20,15,15,18,17,17,34]);c.getColumn(7).numFmt='$#,##0.00';

  const d=wb.addWorksheet('Dashboard');
  d.addRows([['Metric','Value'],['Paid revenue',{formula:"SUM('Booking Tracker'!H2:H41)"}],['Completed jobs',{formula:"COUNTIF('Booking Tracker'!F2:F41,\"Completed\")"}],['Average paid ticket',{formula:'IF(B3=0,0,B2/B3)'}],['Open leads',{formula:"COUNTIF('Booking Tracker'!F2:F41,\"Lead\")"}],['Booked jobs',{formula:"COUNTIF('Booking Tracker'!F2:F41,\"Booked\")"}],['Quotes outstanding',{formula:"COUNTIF('Booking Tracker'!F2:F41,\"Quoted\")"}]]);
  style(d,[28,22]);d.getCell('B2').numFmt='$#,##0.00';d.getCell('B4').numFmt='$#,##0.00';

  const sc=wb.addWorksheet('Scripts');sc.addRows([
    ['Use Case','Ready-to-send message'],
    ['New lead','Thanks for reaching out. Send me your vehicle year/model, location, and a few photos if possible. I can then recommend the right service and price.'],
    ['Quote follow-up','Hey [Name], just checking whether you had any questions about the quote. I still have [day/time] available if you want me to hold it.'],
    ['Booking reminder','Quick reminder for your detail tomorrow at [time]. Please make sure I can access the vehicle and personal items are removed.'],
    ['Review request','Thanks again for trusting me with your vehicle. If you were happy with the result, a quick review would help my small business a lot: [link]'],
    ['Referral','If you know someone whose car needs the same reset, send them my way. I really appreciate referrals.'],
    ['Reactivation','Hey [Name], it has been a little while since your last detail. Want me to send you the next available maintenance slots?']
  ]);style(sc,[24,95]);

  const ct=wb.addWorksheet('90-Day Content');ct.addRow(['Day','Format','Hook','What to Show','CTA']);
  for(let i=1;i<=90;i++)ct.addRow([i,formats[(i-1)%formats.length],hooks[(i-1)%hooks.length],shots[(i-1)%shots.length],ctas[(i-1)%ctas.length]]);
  style(ct,[8,13,55,42,30]);
  return Buffer.from(await wb.xlsx.writeBuffer());
}
function pdf(){
  return new Promise(resolve=>{
    const doc=new PDFDocument({size:'A4',margin:52}),parts=[];doc.on('data',d=>parts.push(d));doc.on('end',()=>resolve(Buffer.concat(parts)));
    doc.fontSize(24).text('DetailFlow Quickstart Playbook').moveDown(.4).fontSize(11).fillColor('#555').text('Mobile Detailing Business Toolkit by Dos Culturas Wander LLC');
    doc.moveDown().fillColor('#111').fontSize(15).text('Start here');
    ['Replace the sample pricing assumptions with your actual costs.','Use Quote Builder for estimates, deposit and balance due.','Log every inquiry in Booking Tracker and keep its status current.','Add repeat customers and follow-up dates to CRM.','Review your Dashboard weekly.','Use the Scripts and 90-Day Content sheets instead of starting from zero.'].forEach((x,i)=>doc.fontSize(10.5).text(`${i+1}. ${x}`,{lineGap:4}).moveDown(.25));
    doc.moveDown().fontSize(15).text('Pricing rule of thumb').fontSize(10.5).text('Your selling price should cover labor, supplies, travel and overhead before profit. DetailFlow calculates a recommended price from your target gross margin.',{lineGap:4});
    doc.moveDown().fontSize(15).text('Weekly rhythm').fontSize(10.5).text('Monday: review leads and quotes.\nDaily: update bookings and payments.\nAfter each job: request a review.\nFriday: review revenue and average ticket.\nWeekend: queue next week\'s content.',{lineGap:4});
    doc.moveDown().fontSize(15).text('License and disclaimer').fontSize(9.5).fillColor('#444').text('Licensed for one business owner/operator. No resale, redistribution, white-labeling or repackaging for sale. Not legal, tax, accounting or financial advice.',{lineGap:4});doc.end();
  });
}
async function starterWorkbook(){
  const wb=new ExcelJS.Workbook(); wb.creator='DetailFlow by Dos Culturas Wander LLC';
  const s=wb.addWorksheet('Start Here');
  s.addRows([
    ['DetailFlow Starter Pack','Pricing + Quote System for Solo Mobile Detailers'],
    ['1. Pricing','Replace sample values with your labor, supply, travel and overhead assumptions.'],
    ['2. Quote','Use the Quote Builder to calculate a customer-ready total and deposit.'],
    ['3. Follow Up','Copy the scripts and personalize the bracketed fields before sending.'],
    ['4. Content','Use the 30-Day Content sheet to stay visible while you build bookings.'],
    ['Upgrade','When you need bookings, CRM and a revenue dashboard, move to the full DetailFlow Toolkit.'],
    ['Important','Organizational/planning tool only. Not legal, tax, accounting or financial advice.']
  ]); style(s,[30,82]);

  const p=wb.addWorksheet('Pricing Calculator');
  p.addRows([
    ['Input','Value','Notes'],['Labor hours',3,'Estimated hands-on time'],['Target hourly pay',45,'Your target hourly compensation'],
    ['Supplies cost',18,'Chemicals, towels, disposables'],['Travel cost',10,'Fuel/tolls per job'],['Overhead allocation',20,'Insurance, software, equipment allocation'],
    ['Target profit margin',0.35,'0.35 = 35%'],['Labor cost',{formula:'B2*B3'},'Hours x hourly pay'],['Total job cost',{formula:'SUM(B4:B6)+B8'},'All direct + allocated costs'],
    ['Recommended price',{formula:'IF(B7>=1,B9,B9/(1-B7))'},'Price for target gross margin'],['Expected gross profit',{formula:'B10-B9'},'Price - cost']
  ]); style(p,[28,18,50]); p.getColumn(2).numFmt='$#,##0.00'; p.getCell('B7').numFmt='0%';

  const q=wb.addWorksheet('Quote Builder');
  q.addRows([['Field','Value'],['Customer name','Sample Customer'],['Vehicle','2022 SUV'],['Core service price',180],['Add-ons',40],['Discount',0],['Tax rate',0],['Subtotal',{formula:'B4+B5-B6'}],['Tax',{formula:'B8*B7'}],['Total quote',{formula:'B8+B9'}],['Deposit %',0.25],['Deposit due',{formula:'B10*B11'}],['Balance after deposit',{formula:'B10-B12'}]]);
  style(q,[30,34]); ['B4','B5','B6','B8','B9','B10','B12','B13'].forEach(x=>q.getCell(x).numFmt='$#,##0.00'); ['B7','B11'].forEach(x=>q.getCell(x).numFmt='0%');

  const sc=wb.addWorksheet('Follow-Up Scripts');
  sc.addRows([
    ['Use Case','Ready-to-send message'],
    ['New lead','Thanks for reaching out. Send me your vehicle year/model, location, and a few photos if possible. I can then recommend the right service and price.'],
    ['Quote follow-up','Hey [Name], just checking whether you had any questions about the quote. I still have [day/time] available if you want me to hold it.'],
    ['Booking reminder','Quick reminder for your detail tomorrow at [time]. Please make sure I can access the vehicle and personal items are removed.'],
    ['Review request','Thanks again for trusting me with your vehicle. If you were happy with the result, a quick review would help my small business a lot: [link]'],
    ['Reactivation','Hey [Name], it has been a little while since your last detail. Want me to send you the next available maintenance slots?']
  ]); style(sc,[24,95]);

  const ct=wb.addWorksheet('30-Day Content'); ct.addRow(['Day','Format','Hook','What to Show','CTA']);
  for(let i=1;i<=30;i++) ct.addRow([i,formats[(i-1)%formats.length],hooks[(i-1)%hooks.length],shots[(i-1)%shots.length],ctas[(i-1)%ctas.length]]);
  style(ct,[8,13,55,42,30]);
  return Buffer.from(await wb.xlsx.writeBuffer());
}

async function streamStarterZip(res){
  const xlsx=await starterWorkbook();
  res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="DetailFlow_Starter_Pack.zip"','Cache-Control':'no-store'});
  const z=archiver('zip',{zlib:{level:9}}); z.pipe(res);
  z.append(xlsx,{name:'DetailFlow_Starter_Pack.xlsx'});
  z.append('DETAILFLOW STARTER PACK\n\nUse Pricing Calculator first, then Quote Builder. Personalize Follow-Up Scripts before sending. Use the 30-Day Content sheet as a prompt bank.\n\nLicense: one business owner/operator. No resale or redistribution.\n',{name:'START_HERE.txt'});
  z.finalize();
}


async function contentWorkbook(){
  const wb=new ExcelJS.Workbook(); wb.creator='DetailFlow by Dos Culturas Wander LLC';
  const s=wb.addWorksheet('Start Here');
  s.addRows([
    ['DetailFlow Content Engine','Marketing Content Pack for Mobile Detailers'],
    ['What is inside','100 hooks, 60 captions, 30 promotional post ideas, review/referral scripts, and seasonal campaign prompts.'],
    ['How to use','Pick one hook, pair it with a matching caption, film the suggested proof/process, and end with one CTA.'],
    ['Important','Customize pricing, location, service names, and availability before posting.'],
    ['License','For one business owner/operator. No resale, redistribution, white-labeling, or repackaging for sale.']
  ]); style(s,[28,92]);

  const subjects=[
    ['interior detail','interior reset','seats, mats, cupholders and trim'],
    ['exterior detail','exterior reset','paint, wheels, tires and glass'],
    ['pet hair removal','pet-hair cleanup','pet hair before and after'],
    ['maintenance detail','maintenance clean','a well-kept vehicle getting refreshed'],
    ['deep clean','deep-clean transformation','the dirtiest areas before and after']
  ];
  const angles=[
    'Why this takes longer than people think',
    'The part most people skip',
    'What you are really paying for',
    'A small detail that changes the whole result',
    'Before you book the cheapest option, look at this',
    'This is what months of buildup looks like',
    'The difference between cleaned and detailed',
    'One reason your car still feels dirty after a wash',
    'What I check before I start',
    'The most satisfying part of the process',
    'If you have been putting this off, watch this',
    'The area that tells me how neglected a car is',
    'What I would fix first on this vehicle',
    'The fastest way to make a car feel newer',
    'This is why prep matters',
    'The result you do not notice until it is missing',
    'What a proper process looks like up close',
    'The mistake that makes detailing take twice as long',
    'What I would never rush on a customer car',
    'The transformation that gets overlooked'
  ];
  const h=wb.addWorksheet('100 Hooks'); h.addRow(['#','Service Theme','Hook']);
  let n=1;
  for(const a of angles){for(const sub of subjects){h.addRow([n++,sub[0],a+' — '+sub[0]+'.']);}}
  style(h,[8,24,72]);

  const captionTemplates=[
    ['Problem -> solution','A lot of people notice the mess but not what caused it. This {subject} was built up over time, so the goal was not to rush it. We worked through {proof} and brought it back to a condition that feels clean again.'],
    ['Process','Good results are usually boring up close: prep, patience, the right products, and repeating the small steps until the finish is right. Here is part of today\'s {subject}: {proof}.'],
    ['Value','Detailing is not only about making a car look better for a photo. A proper {subject} makes the vehicle easier to maintain and much better to live with every day.'],
    ['Before/after','The before photo shows the problem. The after photo shows the result. The part you do not see is the time spent on {proof}. That is where most of the difference comes from.'],
    ['Education','Quick tip: if {proof} keeps getting ignored, the rest of the car can still feel dirty even after a wash. A complete {subject} handles the details that change the overall result.'],
    ['Owner story','This is the kind of job I like because the progress is obvious. We started with {proof}, worked section by section, and finished with a much cleaner {subject}.'],
    ['Soft sell','If your car is starting to feel overdue, you do not have to wait until it is extreme. A maintenance visit is usually easier and cheaper than letting everything build up.'],
    ['Booking CTA','Another {subject} finished. If you want pricing for your vehicle, send the year/model, your location, and a few photos. I will tell you which service makes the most sense.'],
    ['Trust','I would rather explain exactly what a service includes than promise a miracle. This {subject} focused on {proof}, with realistic expectations from the start.'],
    ['Detail focus','The overall result matters, but it is usually the small areas that make a detail feel complete. Today that meant spending extra time on {proof}.'],
    ['Maintenance','The easiest car to keep clean is the one that never gets too far gone. This {subject} is a good example of what regular maintenance can do.'],
    ['Transformation','No dramatic filter needed. Just a proper {subject}, careful work on {proof}, and a result that speaks for itself.']
  ];
  const cp=wb.addWorksheet('60 Captions'); cp.addRow(['#','Style','Service Theme','Caption']);
  n=1;
  for(const t of captionTemplates){for(const sub of subjects){cp.addRow([n++,t[0],sub[0],t[1].replaceAll('{subject}',sub[1]).replaceAll('{proof}',sub[2])]);}}
  style(cp,[8,20,24,96]);

  const promoThemes=[
    ['Slow-week openings','I have a few openings left this week for mobile detailing. Send your vehicle year/model + location for a quote.'],
    ['First-time customer','First time booking? Send a few photos and I will recommend the service that fits your vehicle instead of automatically upselling you.'],
    ['Maintenance push','If your last detail was a few months ago, this is a good time to get back on a maintenance schedule before the buildup gets heavier.'],
    ['Interior focus','This week I am opening a few interior-detail slots for vehicles that need a proper reset. Message me with photos for pricing.'],
    ['Exterior focus','A few exterior-detail slots are open this week. Great time to clean up the paint, wheels, tires, and glass before the next stretch of weather.'],
    ['Pet owner','Pet owners: if the hair has officially won, send me a few interior photos. I will quote the cleanup based on the actual condition.'],
    ['Work vehicle','Your work vehicle does not need to look like a work vehicle inside. I have a few mobile-detail slots available for trucks, vans, and daily drivers.'],
    ['Weekend slot','One weekend slot just opened. If you have been waiting to book, send your vehicle details and location.'],
    ['Weather window','Good weather window coming up. I am filling a few mobile-detail slots now so we can take advantage of it.'],
    ['Referral','If I have detailed your car before and you know someone who needs the same reset, send them my way. Referrals help a small business more than people realize.']
  ];
  const pr=wb.addWorksheet('30 Promo Posts'); pr.addRow(['#','Campaign','Post Copy','Suggested Visual']);
  n=1;
  const visuals=['Before/after','Short process reel','Finished walkaround'];
  for(const p of promoThemes){for(const v of visuals){pr.addRow([n++,p[0],p[1],v]);}}
  style(pr,[8,24,86,24]);

  const sc=wb.addWorksheet('Review & Referral Scripts');
  sc.addRows([
    ['Use Case','Script'],
    ['Review request','Thanks again for trusting me with your vehicle. If you were happy with the result, would you mind leaving a quick review? It makes a real difference for a small detailing business: [review link]'],
    ['Review reminder','Hey [Name], quick follow-up in case the review link got buried. No pressure at all, but if you have a minute, I would really appreciate it: [review link]'],
    ['Referral ask','If you know a friend, coworker, or family member whose car needs the same kind of reset, feel free to send them my page or number. I really appreciate referrals.'],
    ['Past customer reactivation','Hey [Name], it has been a little while since your last detail. Want me to send you the next available maintenance slots?'],
    ['Quote follow-up','Hey [Name], just checking whether you had any questions about the quote. If you want, I can also tell you which parts of the service are essential and which are optional.'],
    ['No-response follow-up','Just closing the loop on your quote. If now is not the right time, no problem at all. If you want to book later, send me a message and I can update availability.']
  ]); style(sc,[28,100]);

  const seasons=[
    ['January','New-year reset','Start the year with a clean slate. Promote full interior resets and organization-focused before/afters.'],
    ['February','Date-night clean','Position a clean car as part of getting ready for a night out or weekend plans.'],
    ['March','Spring reset','Focus on buildup, dust, mats, vents, and seasonal deep cleaning.'],
    ['April','Rain prep','Highlight glass, exterior protection, wheels, and keeping interiors from turning muddy.'],
    ['May','Road-trip prep','Promote family vehicles, SUVs, cupholders, cargo areas, and pre-trip resets.'],
    ['June','Summer interior','Talk about heat, odors, food spills, sunscreen residue, and high-use interiors.'],
    ['July','Mid-year reset','Use a before/after campaign around vehicles that have not been detailed since the start of the year.'],
    ['August','Back-to-school','Target family vehicles with snack crumbs, sports gear, mats, and rear-seat mess.'],
    ['September','Maintenance month','Push recurring maintenance packages before heavy seasonal buildup.'],
    ['October','Fall cleanup','Focus on leaves, debris, rain, mats, and exterior contamination.'],
    ['November','Holiday-ready','Promote getting the car clean before guests, road trips, and holiday travel.'],
    ['December','Gift + year-end','Offer giftable details and year-end vehicle resets before the new year.']
  ];
  const se=wb.addWorksheet('Seasonal Campaigns'); se.addRow(['Month','Campaign','Angle']);
  seasons.forEach(x=>se.addRow(x)); style(se,[14,26,92]);

  return Buffer.from(await wb.xlsx.writeBuffer());
}

async function streamContentZip(res){
  const xlsx=await contentWorkbook();
  res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="DetailFlow_Content_Engine.zip"','Cache-Control':'no-store'});
  const z=archiver('zip',{zlib:{level:9}}); z.pipe(res);
  z.append(xlsx,{name:'DetailFlow_Content_Engine.xlsx'});
  z.append('DETAILFLOW CONTENT ENGINE\n\nUse one hook + one caption + one visual idea + one CTA. Customize service names, pricing, location, and availability before posting.\n\nLicense: one business owner/operator. No resale or redistribution.\n',{name:'START_HERE.txt'});
  z.finalize();
}

async function streamZip(res,sampleCsv){
  const xlsx=await workbook(),guide=await pdf();
  res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="DetailFlow_Product_Download.zip"','Cache-Control':'no-store'});
  const z=archiver('zip',{zlib:{level:9}});z.pipe(res);z.append(xlsx,{name:'DetailFlow_Mobile_Detailing_Business_Toolkit.xlsx'});z.append(guide,{name:'DetailFlow_Quickstart_Playbook.pdf'});z.append(sampleCsv,{name:'DetailFlow_Free_Sample.csv'});z.append('DetailFlow by Dos Culturas Wander LLC\nLicense: one business owner/operator. No resale or redistribution.\n',{name:'README.txt'});z.finalize();
}
module.exports={streamZip,streamStarterZip,streamContentZip};