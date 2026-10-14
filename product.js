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
async function streamZip(res,sampleCsv){
  const xlsx=await workbook(),guide=await pdf();
  res.writeHead(200,{'Content-Type':'application/zip','Content-Disposition':'attachment; filename="DetailFlow_Product_Download.zip"','Cache-Control':'no-store'});
  const z=archiver('zip',{zlib:{level:9}});z.pipe(res);z.append(xlsx,{name:'DetailFlow_Mobile_Detailing_Business_Toolkit.xlsx'});z.append(guide,{name:'DetailFlow_Quickstart_Playbook.pdf'});z.append(sampleCsv,{name:'DetailFlow_Free_Sample.csv'});z.append('DetailFlow by Dos Culturas Wander LLC\nLicense: one business owner/operator. No resale or redistribution.\n',{name:'README.txt'});z.finalize();
}
module.exports={streamZip};