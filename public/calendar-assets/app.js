/* Tanpura House Phase 1 — static prototype only. No authentication or server storage. */
(()=>{'use strict';
const KEY='tanpura-website-calendar-demo-v1', icons={overview:'⌂',students:'♙',calendar:'▦',fees:'₹',reports:'▥'},names={overview:'Overview',students:'Students',calendar:'Calendar',fees:'Fees & Plans',reports:'Reports'};
const iso=(y,m,d)=>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const demo=()=>{const now=new Date(),y=now.getFullYear(),m=now.getMonth(),month=`${y}-${String(m+1).padStart(2,'0')}`;return {students:[{id:'TH001',name:'Aarav Sharma',level:'Foundational',mode:'Online',plan:'package',rate:5000,credits:10,phone:'',frequency:'fixed',monthlyCount:8,weeklyDays:[2,5]},{id:'TH002',name:'Meera Joshi',level:'Intermediate',mode:'Online',plan:'monthly',rate:4000,credits:0,phone:'',frequency:'fixed',monthlyCount:8,weeklyDays:[2,5]},{id:'TH003',name:'Riya Kapoor',level:'Advanced',mode:'Offline',plan:'monthly',rate:6000,credits:0,phone:'',frequency:'weekly',monthlyCount:8,weeklyDays:[1,4]}],sessions:[3,6,10,13,17,20,24,27].map((d,i)=>({id:`S${i+1}`,studentId:'TH001',date:iso(y,m,Math.min(d,new Date(y,m+1,0).getDate())),time:'10:00',status:i<5?'completed':'scheduled',chargeable:i<5,history:[]})).concat([8,15,22,29].map((d,i)=>({id:`M${i+1}`,studentId:'TH002',date:iso(y,m,Math.min(d,new Date(y,m+1,0).getDate())),time:'12:30',status:i<2?'completed':'scheduled',chargeable:i<2,history:[]}))),payments:[{id:'P1',studentId:'TH001',amount:5000,date:iso(y,m,1),for:'package',period:'',method:'UPI'},{id:'P2',studentId:'TH002',amount:4000,date:iso(y,m,2),for:'monthly',period:month,method:'Bank'}],decisions:[],billingOverrides:[],notes:[]}};
let state;try{state=JSON.parse(localStorage.getItem(KEY))||demo()}catch{state=demo()}let page='overview',viewMonth=new Date(),selectedDate=new Date().toISOString().slice(0,10),studentSelected=null;
let demoRole='teacher',demoStudentId=null;
function readDemoRoute(){const m=location.hash.match(/^#\/student(?:-demo)?\/([^/?]+)/);if(m){demoRole='student';try{demoStudentId=decodeURIComponent(m[1]);}catch{demoStudentId=null;}}else{demoRole='teacher';demoStudentId=null;}}
readDemoRoute();
const save=()=>localStorage.setItem(KEY,JSON.stringify(state)),id=()=>`ID${Date.now()}${Math.floor(Math.random()*10000)}`,money=n=>'₹'+Number(n||0).toLocaleString('en-IN'),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),stud=k=>state.students.find(s=>s.id===k),monthKey=d=>d.slice(0,7),monthLabel=m=>new Date(m+'-01T12:00:00').toLocaleDateString('en-IN',{month:'long',year:'numeric'}),currentMonth=()=>`${viewMonth.getFullYear()}-${String(viewMonth.getMonth()+1).padStart(2,'0')}`,entries=sid=>state.sessions.filter(s=>s.studentId===sid),consumed=(sid,period=null)=>entries(sid).filter(s=>s.chargeable&&(!period||monthKey(s.date)===period)).length,paid=(sid,period,kind)=>state.payments.filter(p=>p.studentId===sid&&p.for===kind&&(kind!=='monthly'||p.period===period)).reduce((a,p)=>a+Number(p.amount),0),override=(sid,period)=>state.billingOverrides.find(o=>o.studentId===sid&&o.period===period),monthlyDue=(s,period)=>override(s.id,period)?.amount??s.rate,feeStatus=(s,period)=>s.plan==='monthly'?(paid(s.id,period,'monthly')>=monthlyDue(s,period)?'paid':paid(s.id,period,'monthly')>0?'partial':'pending'):(paid(s.id,'','package')>=s.rate?'paid':'pending');
const decisionTotals=(sid,period)=>state.decisions.filter(d=>d.studentId===sid&&d.period===period).reduce((a,d)=>({carry:a.carry+d.carry,expire:a.expire+d.expire}),{carry:0,expire:0});
const monthlyEntitlement=(s,period)=>{if(s.frequency==='fixed')return Number(s.monthlyCount);const [y,m]=period.split('-').map(Number);let count=0;for(let d=1;d<=new Date(y,m,0).getDate();d++)if((s.weeklyDays||[]).includes(new Date(y,m-1,d).getDay()))count++;return count};
const monthlyUsed=(sid,period)=>state.sessions.filter(s=>s.studentId===sid&&s.chargeable&&s.entitlementPeriod===period).length + state.sessions.filter(s=>s.studentId===sid&&s.chargeable&&!s.entitlementPeriod&&monthKey(s.date)===period).length;
const availableMonthly=(s,period)=>{const a=monthlyEntitlement(s,period),used=monthlyUsed(s.id,period),dec=decisionTotals(s.id,period);return Math.max(0,a-used-dec.carry-dec.expire)};
const remainingPackage=s=>s.credits-consumed(s.id);
const warn=s=>s.plan==='package'&&remainingPackage(s)<=0?'Package balance exhausted':s.plan==='monthly'&&feeStatus(s,currentMonth())!=='paid'?'Monthly fees pending':null;
const pill=(status)=>`<span class="pill ${esc(status)}">${esc(status)}</span>`;
const button=(action,label,cls='secondary',extra='')=>`<button class="btn ${cls}" data-action="${action}" ${extra}>${label}</button>`;
// Existing sessions inherit a mode once; later student profile edits do not change appointments.
state.sessions.forEach(session=>{if(!session.mode)session.mode=stud(session.studentId)?.mode||'Offline';});
function zoomUrl(value){
 try{const u=new URL(String(value).trim());return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&(u.hostname==='zoom.us'||u.hostname.endsWith('.zoom.us'))&&/^\/j\/\d{9,11}\/?$/.test(u.pathname)?u.href:null;}catch{return null;}
}
const lessonToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).reduce((a,p)=>({...a,[p.type]:p.value}),{});
const meetingProviders=['No meeting link'];
const providerFor=()=>meetingProviders[0];
function googleUrl(value,host){
 try{const url=new URL(value);return url.protocol==='https:'&&(url.hostname===host||(host==='calendar.google.com'&&url.hostname==='www.google.com'&&url.pathname.startsWith('/calendar/')))&&!url.port&&!url.username&&!url.password?url.href:null;}catch{return null;}
}
function joinSession(session){
 return session.mode==='Online'&&session.status!=='scheduled'?'<small class="meeting-note">Online session closed</small>':'';
}
const itemSession=s=>`<div class="item"><div class="item-main"><strong>${esc(stud(s.studentId)?.name||'Unknown')}</strong><small>${esc(humanDate(s.date))} · ${esc(s.time)} · ${esc(s.mode)}</small>${joinSession(s)}</div>${pill(s.status)}${button('edit-session','Manage','secondary small',`data-id="${esc(s.id)}"`)}</div>`;
function nav(){for(const target of ['sideNav','bottomNav'])document.getElementById(target).innerHTML=Object.keys(names).map(k=>`<button class="nav-btn ${page===k?'active':''}" data-page="${k}"><span class="symbol">${icons[k]}</span>${names[k]}</button>`).join('')}
function overview(){const today=new Date().toISOString().slice(0,10),todayS=state.sessions.filter(s=>s.date===today),pending=state.students.filter(s=>feeStatus(s,currentMonth())!=='paid');return `<div class="cards"><div class="card"><small>Active students</small><span class="metric">${state.students.length}</span></div><div class="card"><small>Today's classes</small><span class="metric">${todayS.length}</span></div><div class="card"><small>Completed sessions</small><span class="metric">${state.sessions.filter(s=>s.status==='completed').length}</span></div><div class="card"><small>Fee alerts</small><span class="metric">${pending.length}</span></div></div><div class="two-col section"><section class="panel"><div class="section-head"><h2>Today's schedule</h2>${button('new-session','+ Class','small')}</div>${todayS.length?todayS.map(itemSession).join(''):'<div class="empty">No classes today. Add one from the calendar.</div>'}</section><section class="panel"><h2>Needs attention</h2>${pending.map(s=>`<div class="item"><div class="item-main"><strong>${esc(s.name)}</strong><small>${esc(warn(s)||'Payment pending')}</small></div>${pill('pending')}</div>`).join('')||'<div class="empty">No current fee alerts</div>'}<div class="warning">Monthly unused classes require a teacher decision; nothing expires automatically.</div></section></div>`}
function students(){return `<section class="panel"><div class="section-head"><h2>Students</h2>${button('new-student','+ Add student','small')}</div>${state.students.map(s=>`<div class="item"><div class="item-main"><strong>${esc(s.name)}</strong><small>${esc(s.level)} · ${esc(s.mode)} · ${s.plan==='monthly'?'Monthly':'Session package'}</small></div>${pill(feeStatus(s,currentMonth()))}${button('student-detail','View','secondary small',`data-id="${esc(s.id)}"`)}</div>`).join('')}</section>`}
function studentDetail(s){const use=consumed(s.id),bal=remainingPackage(s),p=currentMonth();return `<section class="panel"><div class="section-head"><h2>${esc(s.name)}</h2>${button('students-back','← Back','secondary small')}</div><p class="muted-sm">${esc(s.id)} · ${esc(s.level)} · ${esc(s.mode)}</p><div class="cards"><div class="card"><small>Billing</small><strong>${s.plan==='monthly'?'Monthly':'Package'}</strong></div><div class="card"><small>Fee</small><strong>${money(s.rate)}</strong></div><div class="card"><small>Classes completed</small><strong>${entries(s.id).filter(x=>x.status==='completed').length}</strong></div><div class="card"><small>${s.plan==='monthly'?'Unused this month':'Credits remaining'}</small><strong>${s.plan==='monthly'?availableMonthly(s,p):bal}</strong></div></div>${warn(s)?`<div class="warning">${esc(warn(s))}. Scheduling remains allowed with warning.</div>`:''}<div class="actions">${button('edit-student','Edit plan','secondary',`data-id="${esc(s.id)}"`)}${button('new-session','Schedule class','secondary',`data-student="${esc(s.id)}"`)}${button('generate-sessions','Generate month’s classes','secondary',`data-student="${esc(s.id)}"`)}${button('new-payment','Record payment','secondary',`data-student="${esc(s.id)}"`)}${button('preview-student','Student view','secondary',`data-id="${esc(s.id)}"`)}</div></section><section class="panel section"><h2>Class history</h2>${entries(s.id).sort((a,b)=>b.date.localeCompare(a.date)).map(itemSession).join('')||'<div class="empty">No classes yet</div>'}</section>`}
function calendar(){const y=viewMonth.getFullYear(),m=viewMonth.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate(),month=currentMonth(),selected=state.sessions.filter(s=>s.date===selectedDate).sort((a,b)=>a.time.localeCompare(b.time));let cells=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>`<div class="day-head">${x}</div>`).join('');for(let i=0;i<first;i++)cells+='<div></div>';for(let d=1;d<=days;d++){const date=iso(y,m,d),n=state.sessions.filter(s=>s.date===date).length;cells+=`<button class="day ${n?'has':''} ${selectedDate===date?'selected':''}" data-action="select-day" data-date="${date}">${d}${n?`<span class="dots">● ${n} class${n===1?'':'es'}</span>`:''}</button>`}return `<section class="panel"><div class="calendar-head">${button('prev-month','‹','secondary small')}<h2>${monthLabel(month)}</h2>${button('next-month','›','secondary small')}</div><div class="calendar">${cells}</div></section><section class="panel section"><div class="section-head"><h2>${esc(humanDate(selectedDate))} classes</h2>${button('new-session','+ Schedule','small')}${button('generate-sessions','Generate month','secondary small')}</div>${selected.map(itemSession).join('')||'<div class="empty">No classes on this date</div>'}</section>`}
function fees(){const p=currentMonth();return `<div class="section-head"><h2>Fees & entitlements</h2>${button('new-payment','+ Record payment','small')}</div><div class="panel table-wrap"><table><thead><tr><th>Student</th><th>Plan</th><th>Payment</th><th>Available</th><th>Action</th></tr></thead><tbody>${state.students.map(s=>`<tr><td>${esc(s.name)}</td><td>${s.plan==='monthly'?`Monthly · ${monthLabel(p)}`:'Package'}</td><td>${pill(feeStatus(s,p))}</td><td>${s.plan==='monthly'?availableMonthly(s,p):remainingPackage(s)}</td><td>${button('fee-detail','Review','secondary small',`data-id="${esc(s.id)}"`)}</td></tr>`).join('')}</tbody></table></div><div class="panel section"><h2>Business rule</h2><p class="muted-sm">Unpaid students can be scheduled with a warning. Unused monthly classes never expire without a teacher decision. Invoices are unavailable.</p></div>`}
function feeDetail(s){const p=currentMonth(),monthly=s.plan==='monthly',dec=decisionTotals(s.id,p);return `<section class="panel"><div class="section-head"><h2>${esc(s.name)} · Billing</h2>${button('fees-back','← Back','secondary small')}</div><div class="cards"><div class="card"><small>Fee</small><strong>${money(s.rate)}</strong></div><div class="card"><small>Received</small><strong>${money(paid(s.id,p,monthly?'monthly':'package'))}</strong></div><div class="card"><small>${monthly?'Monthly entitlement':'Purchased credits'}</small><strong>${monthly?monthlyEntitlement(s,p):s.credits}</strong></div><div class="card"><small>Available</small><strong>${monthly?availableMonthly(s,p):remainingPackage(s)}</strong></div></div><div class="actions">${button('new-payment','Record payment','secondary',`data-student="${esc(s.id)}"`)}${button('preview-student','Student view','secondary',`data-id="${esc(s.id)}"`)}${monthly?button('month-decision','Month-end decision','secondary',`data-id="${esc(s.id)}"`):''}</div>${monthly?`<p class="muted-sm">For ${monthLabel(p)}: ${monthlyUsed(s.id,p)} consumed · ${dec.carry} carried · ${dec.expire} expired. Pending unused: ${availableMonthly(s,p)}.</p>`:''}</section><section class="panel section"><h2>Payment history</h2>${state.payments.filter(x=>x.studentId===s.id).map(x=>`<div class="item"><div class="item-main"><strong>${money(x.amount)}</strong><small>${esc(x.date)} · ${esc(x.method)} · ${esc(x.for)} ${esc(x.period||'')}</small></div></div>`).join('')||'<div class="empty">No payments recorded</div>'}</section>`}
function reports(){const total=state.payments.reduce((n,p)=>n+Number(p.amount),0);return `<div class="cards"><div class="card"><small>Recorded payments</small><span class="metric">${money(total)}</span></div><div class="card"><small>Classes completed</small><span class="metric">${state.sessions.filter(s=>s.status==='completed').length}</span></div><div class="card"><small>Rescheduled classes</small><span class="metric">${state.sessions.filter(s=>s.history?.length).length}</span></div><div class="card"><small>Carry-forward decisions</small><span class="metric">${state.decisions.length}</span></div></div><section class="panel section"><h2>About these reports</h2><p class="muted-sm">Figures are calculated from the records saved in this browser.</p>${button('export-data','Export records','secondary')}${button('reset-demo','Restore sample records','secondary')}</section>`}
function show(html){document.getElementById('view').innerHTML=html}
function render(){document.querySelector('.eyebrow').textContent='TEACHER WORKSPACE';if(demoRole==='student'){renderStudentDemo();return;}document.body.classList.remove('student-role');document.getElementById('roleControls').innerHTML=`<button class="btn secondary small" data-action="switch-student-demo">Preview student view</button>`;nav();document.getElementById('pageTitle').textContent=names[page];if(page==='overview')show(overview());if(page==='students')show(studentSelected?studentDetail(stud(studentSelected)):students());if(page==='calendar')show(calendar());if(page==='fees')show(studentSelected?feeDetail(stud(studentSelected)):fees());if(page==='reports')show(reports())}
function studentFee(s,period){
 const status=feeStatus(s,period);
 if(s.plan==='monthly'){
   const due=monthlyDue(s,period),received=paid(s.id,period,'monthly');
   return {status,detail:status==='paid'?`${monthLabel(period)} fees received`:status==='partial'?`${money(Math.max(0,due-received))} remaining for ${monthLabel(period)}`:`${money(due)} pending for ${monthLabel(period)}`};
 }
 const remaining=remainingPackage(s);
 return {status:remaining<=0?'pending':status,detail:remaining<=0?'No prepaid classes remaining. Please contact your teacher.':`${remaining} prepaid class${remaining===1?'':'es'} remaining · Payment ${status}`};
}
function renderStudentDemo(){
 document.body.classList.add('student-role');
 document.getElementById('roleControls').replaceChildren();
 document.getElementById('sideNav').innerHTML='';document.getElementById('bottomNav').innerHTML='';
 const s=stud(demoStudentId);
 document.querySelector('.eyebrow').textContent='STUDENT CALENDAR';
 document.getElementById('pageTitle').textContent=s?s.name:'Student not found';
 if(!s){show('<section class="panel"><h2>Student unavailable</h2><p>This student is unavailable in this browser. Open the calendar from the teacher workspace.</p></section>');return;}
 const period=currentMonth(),f=studentFee(s,period),y=viewMonth.getFullYear(),m=viewMonth.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate();
 const own=entries(s.id).filter(x=>x.status!=='cancelled'),today=iso(new Date().getFullYear(),new Date().getMonth(),new Date().getDate());
 const next=own.filter(x=>x.date>=today&&x.status==='scheduled').sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))[0];
 let cells=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(x=>`<div class="day-head">${x}</div>`).join('');
 for(let i=0;i<first;i++)cells+='<div></div>';
 for(let d=1;d<=days;d++){const date=iso(y,m,d),mine=own.filter(x=>x.date===date);cells+=`<button class="day ${mine.length?'has':''} ${selectedDate===date?'selected':''}" data-action="select-day" data-date="${date}" aria-label="${esc(humanDate(date))}: ${mine.length} classes">${d}${mine.length?'<span class="dots">●</span>':''}</button>`;}
 const dayClasses=own.filter(x=>x.date===selectedDate).sort((a,b)=>a.time.localeCompare(b.time));
 show(`<div class="student-dashboard"><section class="panel student-welcome"><p class="muted-sm">Welcome to your class calendar</p><h2>${esc(s.name)}</h2><p class="muted-sm">${esc(s.level)} · ${esc(s.mode)}</p></section>
 <section class="panel section"><div class="section-head"><h2>Fee status</h2>${pill(f.status)}</div><p>${esc(f.detail)}</p><small class="muted-sm">Based on teacher-recorded payments. Contact your teacher if this looks incorrect.</small></section>
 <section class="panel section"><h2>Next class</h2>${next?`<strong>${esc(humanDate(next.date))} at ${esc(next.time)}</strong>${joinSession(next,true)}`:'<p class="muted-sm">No upcoming class scheduled.</p>'}</section>
 <section class="panel section"><div class="calendar-head"><button class="btn secondary small" data-action="prev-month" aria-label="Previous month">‹</button><h2>${monthLabel(period)}</h2><button class="btn secondary small" data-action="next-month" aria-label="Next month">›</button></div><div class="calendar">${cells}</div></section>
 <section class="panel section"><h2>${esc(humanDate(selectedDate))}</h2>${dayClasses.length?dayClasses.map(x=>`<div class="item"><div class="item-main"><strong>${esc(x.time)} · ${esc(x.mode)} class</strong><small>${esc(s.level)}</small>${joinSession(x,true)}</div>${pill(x.status)}</div>`).join(''):'<p class="muted-sm">No classes scheduled for this date.</p>'}</section>
 <div class="student-storage-note">This calendar shows records saved in this browser.</div></div>`);
}
function demoLink(s){return `${location.href.split('#')[0]}#/student/${encodeURIComponent(s.id)}`;}
function form(title,fields,submit,extra=''){show(`<section class="panel"><div class="section-head"><h2>${title}</h2>${button('go-back','← Back','secondary small')}</div><form id="editor"><div class="form-grid">${fields}</div>${extra}<div class="actions"><button class="btn" type="submit">${submit}</button></div></form></section>`)}
const field=(key,label,type='text',val='',options=null,required=true)=>`<div class="field"><label for="${key}">${label}</label>${options?`<select id="${key}" name="${key}">${options.map(o=>`<option value="${esc(o)}" ${o===val?'selected':''}>${esc(o)}</option>`).join('')}</select>`:`<input id="${key}" name="${key}" type="${type}" value="${esc(val)}" ${type==='number'?'min="0" step="any"':''}${required?' required':''}>`}</div>`;
const weekdayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const studentPicker=(selected)=>`<div class="field"><label for="studentId">Student name</label><select id="studentId" name="studentId" required>${[...state.students].sort((a,b)=>a.name.localeCompare(b.name)).map(st=>`<option value="${esc(st.id)}" ${st.id===selected?'selected':''}>${esc(st.name)} — ${esc(st.level)}</option>`).join('')}</select><small class="field-help">Select by name. Student IDs are stored internally only.</small></div>`;
const humanDate=d=>new Date(d+'T12:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
function studentForm(s){
 const isEdit=!!s, plan=s?.plan||'monthly', freq=s?.frequency||'fixed';
 const planField=`<div class="field"><label for="plan">How does this student pay?</label><select id="plan" name="plan"><option value="monthly" ${plan==='monthly'?'selected':''}>Monthly fee</option><option value="package" ${plan==='package'?'selected':''}>Prepaid number of classes</option></select><small class="field-help">Monthly = fees for a month. Prepaid = buy a set number of classes (e.g., 10).</small></div>`;
 const freqField=`<div class="field"><label for="frequency">How are monthly classes counted?</label><select id="frequency" name="frequency"><option value="fixed" ${freq==='fixed'?'selected':''}>Set number of classes per month</option><option value="weekly" ${freq==='weekly'?'selected':''}>Based on days each week</option></select><small class="field-help">Choose a fixed total (such as 8 classes), or calculate the total from recurring weekdays.</small></div>`;
 const dayField=`<div class="field"><label>Which weekdays does the student usually attend?</label><div class="weekday-options">${weekdayNames.map((day,i)=>`<label class="weekday-choice"><input type="checkbox" name="weekday" value="${i}" ${(s?.weeklyDays||[2,5]).includes(i)?'checked':''}><span>${day}</span></label>`).join('')}</div><small class="field-help">These are preferred recurring class days. After saving, use “Generate month’s classes” to preview and add calendar entries.</small></div>`;
 const fields=field('name','Student name','text',s?.name||'')+field('level','Training level','text',s?.level||'Foundational',['Foundational','Intermediate','Advanced'])+field('mode','Class format','text',s?.mode||'Online',['Online','Offline','Residency'])+planField+field('rate','Agreed fee amount (₹)','number',s?.rate??4000)+`<div id="packageFields" class="conditional-fields">${field('credits','Number of prepaid classes','number',s?.credits??10)}<p class="field-help">Example: If a student buys 10 sessions, enter 10 here. These are class credits, not money.</p></div>`+`<div id="monthlyFields" class="conditional-fields">${freqField}<div id="fixedFields">${field('monthlyCount','Classes included each month','number',s?.monthlyCount??8)}</div><div id="weeklyFields">${dayField}</div></div>`;
 form(isEdit?'Edit student':'Add student',fields,isEdit?'Save student':'Create student');
 const sync=()=>{const isMonthly=document.getElementById('plan').value==='monthly';document.getElementById('packageFields').hidden=isMonthly;document.getElementById('monthlyFields').hidden=!isMonthly;document.getElementById('fixedFields').hidden=!isMonthly||document.getElementById('frequency').value!=='fixed';document.getElementById('weeklyFields').hidden=!isMonthly||document.getElementById('frequency').value!=='weekly';};
 document.getElementById('plan').addEventListener('change',sync);document.getElementById('frequency').addEventListener('change',sync);sync();
 document.getElementById('editor').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),weeklyDays=f.getAll('weekday').map(Number),newPlan=f.get('plan'),newFrequency=f.get('frequency');if(newPlan==='monthly'&&newFrequency==='weekly'&&!weeklyDays.length)return notice('Please select at least one weekday');const data={id:s?.id||id(),name:String(f.get('name')).trim(),level:f.get('level'),mode:f.get('mode'),plan:newPlan,rate:Number(f.get('rate')),credits:Number(f.get('credits')),frequency:newFrequency,monthlyCount:Number(f.get('monthlyCount')),weeklyDays};if(!data.name)return notice('Please enter a student name');if(newPlan==='package'&&data.credits<1)return notice('Enter at least one prepaid class');if(newPlan==='monthly'&&newFrequency==='fixed'&&data.monthlyCount<1)return notice('Enter at least one monthly class');if(s)Object.assign(s,data);else state.students.push(data);save();page='students';studentSelected=data.id;render();notice('Student saved')};
}
function sessionForm(s,preset){
 if(!state.students.length)return notice('Add a student first.');
 const initial=stud(s?.studentId||preset)||state.students[0];
 form(s?'Manage class':'Schedule class',studentPicker(initial.id)+field('date','Class date','date',s?.date||selectedDate)+field('time','Time','time',s?.time||'10:00')+field('mode','Class mode','text',s?.mode||initial.mode,['Online','Offline','Residency'])+`<div id="zoomFields" class="conditional-fields">${field('meetingProvider','Meeting provider','text',providerFor(s),meetingProviders)}${field('duration','Class duration (minutes)','number',s?.duration||60)}<p class="field-help">Online classes are scheduled without a meeting link.</p></div>`+(s?field('status','Attendance status','text',s.status,['scheduled','completed','missed','cancelled'])+field('chargeable','Consumes entitlement?','text',s.chargeable?'yes':'no',['yes','no'])+field('entitlementPeriod','Entitlement month (optional, defaults to class month)','month',s.entitlementPeriod||'',null,false):''),s?'Save class':'Schedule class','<div class="warning">Classes can be scheduled while fees are pending.</div>');
 const editor=document.getElementById('editor');
 function syncMode(){const online=editor.elements.mode.value==='Online';document.getElementById('zoomFields').hidden=!online;editor.elements.meetingProvider.disabled=!online;editor.elements.duration.disabled=!online;}
 editor.elements.mode.addEventListener('change',syncMode);
 if(!s)editor.elements.studentId.addEventListener('change',()=>{editor.elements.mode.value=stud(editor.elements.studentId.value)?.mode||'Offline';syncMode();});
 syncMode();
 editor.onsubmit=async e=>{
 e.preventDefault();const f=new FormData(editor),sid=f.get('studentId'),student=stud(sid),date=String(f.get('date')),time=String(f.get('time')),mode=f.get('mode');
 if(!student||!['Online','Offline','Residency'].includes(mode)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T12:00:00'))||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))return notice('Select a valid student, mode, date and time.');
 const entitlementPeriod=f.get('entitlementPeriod');
 if(entitlementPeriod&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(entitlementPeriod))return notice('Choose a valid entitlement month.');
 const provider=mode==='Online'?f.get('meetingProvider'):'No meeting link';
 if(!meetingProviders.includes(provider))return notice('Meeting links are unavailable.');
 const duration=mode==='Online'?Number(f.get('duration')):60;
 if(!Number.isInteger(duration)||duration<1||duration>480)return notice('Enter a duration of 1 to 480 minutes.');
 if(state.sessions.some(x=>x.id!==s?.id&&x.date===date&&x.time===time))return notice('Time conflict: another class already occupies this slot');
 const sameProvider=provider===providerFor(s)&&mode==='Online';
 const data={studentId:sid,date,time,mode,duration,meetingProvider:provider,zoomEnabled:false,
   zoomUrl:sameProvider?s?.zoomUrl||'':'',meetUrl:sameProvider?s?.meetUrl||'':'',
   calendarUrl:sameProvider?s?.calendarUrl||'':'',zoomPending:false};
 if(s){if(s.date!==date||s.time!==time){s.history=s.history||[];s.history.push({from:s.date+' '+s.time,to:date+' '+time,at:new Date().toISOString(),reason:'Teacher reschedule'});}Object.assign(s,data,{status:f.get('status'),chargeable:f.get('chargeable')==='yes',entitlementPeriod:entitlementPeriod||undefined});}
 else {s={id:id(),...data,status:'scheduled',chargeable:false,history:[]};state.sessions.push(s);}
 save();
page='calendar';studentSelected=null;selectedDate=date;viewMonth=new Date(date+'T12:00:00');render();notice(warn(student)?`Saved. Warning: ${warn(student)}`:'Class saved');
 };
}
// Recurring calendar generation is a preview-and-confirm demo, never a silent bulk edit.
function generationCandidates(st,period,time,weekdays){
 const [y,m]=period.split('-').map(Number), days=new Date(y,m,0).getDate();
 const existing=state.sessions.filter(x=>x.studentId===st.id&&monthKey(x.date)===period&&x.status!=='cancelled');
 const usedDates=new Set(existing.map(x=>x.date));
 const matches=[];
 for(let d=1;d<=days;d++){
   const date=iso(y,m-1,d),dow=new Date(y,m-1,d).getDay();
   if(weekdays.includes(dow)&&!usedDates.has(date))matches.push(date);
 }
 let wanted;
 if(st.plan==='monthly'&&st.frequency==='fixed'){
   wanted=Math.max(0,Number(st.monthlyCount||0)-existing.length);
 }else if(st.plan==='monthly'){
   wanted=matches.length;
 }else{
   // For prepaid plans the teacher chooses a target number separately.
   wanted=Number(document.getElementById('generateCount')?.value||0);
 }
 const chosen=[];const blocked=[];
 // Spread fixed-count classes across matching weekdays rather than filling the start of the month.
 const ordered=(st.plan==='monthly'&&st.frequency==='fixed'&&wanted<matches.length)?Array.from({length:wanted},(_,i)=>matches[Math.min(matches.length-1,Math.floor((i+.5)*matches.length/wanted))]):matches;
 for(const date of [...new Set(ordered)]){
   if(chosen.length>=wanted)break;
   if(state.sessions.some(x=>x.date===date&&x.time===time&&x.status!=='cancelled')){blocked.push(date);continue}
   chosen.push(date);
 }
 return {chosen,blocked,existing:existing.length,wanted,available:matches.length};
}
function generateForm(preset){
 if(!state.students.length)return notice('Add a student first.');
 const initial=stud(preset)||state.students[0], period=currentMonth();
 const fields=studentPicker(initial.id)+field('generateMonth','Month to schedule','month',period)+field('generateTime','Class start time','time','10:00')+'<div id="batchProvider">'+field('meetingProvider','Meeting provider for these classes','text',meetingProviders[0],meetingProviders)+'</div>'+`<div class="field"><label>Preferred class days</label><div id="generateWeekdays" class="weekday-options"></div><small class="field-help">Choose the days the student usually attends. For fixed monthly plans, classes are spread across these days. You can edit individual dates afterward.</small></div><div id="generateCountWrap" class="field" hidden><label for="generateCount">How many prepaid classes to schedule?</label><input id="generateCount" name="generateCount" type="number" min="1" max="100" value="4"><small class="field-help">Scheduling does not purchase or consume prepaid credits. Credits are consumed only when attendance is marked chargeable.</small></div>`;
 form('Generate monthly classes',fields,'Preview dates','<div class="warning">Preview the dates before confirming. Existing classes for this student are preserved; exact time conflicts are skipped. Scheduling with unpaid fees is allowed with a warning.</div><div id="generationPreview" aria-live="polite"></div>');
 const formEl=document.getElementById('editor'),btn=formEl.querySelector('[type=submit]');let confirmed=null;
 const daysEl=document.getElementById('generateWeekdays');
 function refreshDays(){
   const st=stud(formEl.elements.studentId.value);if(!st)return;
   const preferred=st.weeklyDays?.length?st.weeklyDays:[2,5];
   daysEl.innerHTML=weekdayNames.map((day,i)=>`<label class="weekday-choice"><input type="checkbox" name="generateWeekday" value="${i}" ${preferred.includes(i)?'checked':''}><span>${day}</span></label>`).join('');
   document.getElementById('generateCountWrap').hidden=st.plan!=='package';
   if(st.plan==='package')document.getElementById('generateCount').value=Math.max(1,Math.min(8,remainingPackage(st)>0?remainingPackage(st):4));
   document.getElementById('batchProvider').hidden=st.mode!=='Online';
   formEl.elements.meetingProvider.disabled=st.mode!=='Online';
   confirmed=null;btn.textContent='Preview dates';document.getElementById('generationPreview').innerHTML='';
 }
 formEl.elements.studentId.addEventListener('change',refreshDays);
 formEl.addEventListener('change',e=>{if(e.target.name!=='studentId'){confirmed=null;btn.textContent='Preview dates';document.getElementById('generationPreview').innerHTML='';}});
 refreshDays();
 formEl.onsubmit=async e=>{
   e.preventDefault();const f=new FormData(formEl),st=stud(f.get('studentId')),period=String(f.get('generateMonth')),time=String(f.get('generateTime')),weekdays=f.getAll('generateWeekday').map(Number);
   if(!st||!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))return notice('Select a valid student, month and time.');
   if(!weekdays.length)return notice('Choose at least one weekday.');
   if(st.plan==='package'&&!(Number.isInteger(Number(f.get('generateCount')))&&Number(f.get('generateCount'))>0&&Number(f.get('generateCount'))<=100))return notice('Enter a valid number of classes (1–100).');
   const provider=st.mode==='Online'?f.get('meetingProvider'):'No meeting link';
   if(!meetingProviders.includes(provider))return notice('Meeting links are unavailable.');
   const result=generationCandidates(st,period,time,weekdays);
   const fingerprint=JSON.stringify({studentId:st.id,period,time,weekdays,provider,chosen:result.chosen});
   if(confirmed!==fingerprint){
     confirmed=fingerprint;btn.textContent=`Confirm ${result.chosen.length} classes`;
     const warnings=[];
     if(warn(st))warnings.push(warn(st));
     if(result.blocked.length)warnings.push(`${result.blocked.length} conflicting date(s) skipped`);
     if(result.chosen.length<result.wanted)warnings.push(`Only ${result.chosen.length} of ${result.wanted} requested classes could be placed on the selected weekdays at this time`);
     document.getElementById('generationPreview').innerHTML=`<div class="preview-box"><h3>Review ${result.chosen.length} proposed classes for ${esc(st.name)}</h3><p class="muted-sm">${result.existing} existing classes in ${esc(monthLabel(period))} will not be duplicated or changed.</p>${warnings.map(w=>`<div class="warning">${esc(w)}</div>`).join('')}<ul class="preview-dates">${result.chosen.map(d=>`<li>${esc(humanDate(d))} · ${esc(time)}</li>`).join('')||'<li>No available dates. Change the weekdays or time.</li>'}</ul><p class="muted-sm">Click Confirm to add these scheduled classes. No credits will be deducted yet.</p></div>`;
     return;
   }
   if(!result.chosen.length)return notice('No new classes to create. Adjust your selection.');
   // Recheck against the latest state just before committing the batch.
   const fresh=generationCandidates(st,period,time,weekdays);
   if(JSON.stringify(fresh.chosen)!==JSON.stringify(result.chosen)){confirmed=null;return notice('Schedule changed. Preview again before confirming.');}
   const batch=fresh.chosen.map(date=>({id:id(),studentId:st.id,date,time,status:'scheduled',chargeable:false,history:[],mode:st.mode,duration:60,meetingProvider:provider,zoomEnabled:false,zoomPending:provider!=='No meeting link',zoomUrl:'',generated:true}));state.sessions.push(...batch);
   save();page='calendar';studentSelected=null;viewMonth=new Date(period+'-01T12:00:00');selectedDate=fresh.chosen[0];render();notice(`${fresh.chosen.length} classes scheduled for ${st.name}. ${warn(st)?'Warning: '+warn(st):''}`);
 };
}
function paymentForm(preset){const ids=state.students.map(s=>s.id);form('Record payment',studentPicker(preset||ids[0])+field('amount','Amount (₹)','number',1000)+field('date','Payment date','date',new Date().toISOString().slice(0,10))+field('for','Payment type','text','monthly',['monthly','package'])+field('period','Billing month (YYYY-MM, monthly only)','month',currentMonth())+field('method','Payment method','text','UPI',['UPI','Bank','Cash','Other']),'Record payment','<div class="warning">Recording a payment does not transfer money.</div>');document.getElementById('editor').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),amount=Number(f.get('amount'));if(!(amount>0))return notice('Enter a positive payment amount');state.payments.push({id:id(),studentId:f.get('studentId'),amount,date:f.get('date'),for:f.get('for'),period:f.get('for')==='monthly'?f.get('period'):'',method:f.get('method')});save();page='fees';studentSelected=null;render();notice('Payment recorded')};}
function decisionForm(s){const p=currentMonth(),avail=availableMonthly(s,p);form(`Month-end decision · ${s.name}`,field('period','Billing month','month',p)+field('carry','Classes to carry forward','number',avail)+field('expiry','Carry-forward expiry date','date',iso(viewMonth.getFullYear(),viewMonth.getMonth()+1,Math.min(28,new Date(viewMonth.getFullYear(),viewMonth.getMonth()+2,0).getDate())))+field('reason','Teacher decision reason','text','Student and teacher agreed to reschedule'), 'Record decision',`<div class="warning">Up to ${avail} classes remain undecided for ${monthLabel(p)}. Any unused portion of this decision is expired. Carry-forward credits are tracked separately and never pay the following month's fee.</div>`);document.getElementById('editor').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),period=f.get('period'),available=availableMonthly(s,period),carry=Number(f.get('carry')),expire=available-carry,expiry=f.get('expiry');if(!Number.isInteger(carry)||carry<0||carry>available)return notice('Carry-forward count must be within available classes');if(carry>0&&expiry<=period+'-01')return notice('Choose a future expiry date');state.decisions.push({id:id(),studentId:s.id,period,carry,expire,expiry,reason:f.get('reason'),at:new Date().toISOString(),approvedBy:'Teacher'});save();page='fees';studentSelected=s.id;render();notice('Teacher decision recorded')};}
function notice(t){const n=document.getElementById('notice');n.textContent=t;window.scrollTo({top:0,behavior:'smooth'})}
document.addEventListener('click',e=>{const n=e.target.closest('[data-page],[data-action]');if(!n)return;if(n.dataset.page){if(demoRole==='student')return;page=n.dataset.page;studentSelected=null;render();return}const a=n.dataset.action;if(demoRole==='student'&&!['select-day','prev-month','next-month'].includes(a))return;if(a==='switch-student-demo'||a==='preview-student'){const student=a==='switch-student-demo'?state.students[0]:stud(n.dataset.id);if(!student)return notice('No student available to preview');window.open(demoLink(student),'_blank','noopener');return;}if(a==='new-student')studentForm();else if(a==='edit-student')studentForm(stud(n.dataset.id));else if(a==='student-detail'){studentSelected=n.dataset.id;render()}else if(a==='students-back'||a==='fees-back'){studentSelected=null;render()}else if(a==='new-session')sessionForm(null,n.dataset.student);else if(a==='generate-sessions')generateForm(n.dataset.student);else if(a==='edit-session')sessionForm(state.sessions.find(s=>s.id===n.dataset.id));else if(a==='new-payment')paymentForm(n.dataset.student);else if(a==='fee-detail'){studentSelected=n.dataset.id;render()}else if(a==='month-decision')decisionForm(stud(n.dataset.id));else if(a==='select-day'){selectedDate=n.dataset.date;render()}else if(a==='prev-month'||a==='next-month'){viewMonth=new Date(viewMonth.getFullYear(),viewMonth.getMonth()+(a==='prev-month'?-1:1),1);selectedDate=iso(viewMonth.getFullYear(),viewMonth.getMonth(),1);render()}else if(a==='go-back')render();else if(a==='reset-demo'){if(confirm('Replace all records saved in this browser with sample records?')){state=demo();save();render();notice('Sample records restored')}}else if(a==='export-data'){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='tanpura-calendar-records.json';a.click();URL.revokeObjectURL(url)}});window.addEventListener('hashchange',()=>{readDemoRoute();render();});render();
})();
