/* ============================================================
   RAINNS MANAGEMENT — App logic
   - Mobile nav / mega-menu accessibility
   - Multi-step self-quote calculator with real pricing
   - No dependencies. Vanilla ES6.
   ============================================================ */

/* ---------- Mobile nav toggle ---------- */
(function(){
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('mobileNav');
  if(!btn || !nav) return;

  let scrollY = 0;
  const openMenu = () => {
    scrollY = window.scrollY;
    nav.classList.add('open');
    nav.setAttribute('aria-hidden','false');
    btn.setAttribute('aria-expanded','true');
    document.body.classList.add('menu-open');
    document.body.style.top = -scrollY + 'px';
  };
  const closeMenu = () => {
    nav.classList.remove('open');
    nav.setAttribute('aria-hidden','true');
    btn.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
  };
  const toggleMenu = () => nav.classList.contains('open') ? closeMenu() : openMenu();

  btn.addEventListener('click', e => { e.preventDefault(); toggleMenu(); });

  // Close on link tap
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // Explicit close button inside the menu (if present)
  const closeBtn = nav.querySelector('.m-close');
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // ESC key
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu(); });

  // Close if user resizes past desktop breakpoint
  const mq = window.matchMedia('(min-width: 960px)');
  mq.addEventListener ? mq.addEventListener('change', e => { if (e.matches) closeMenu(); })
                      : mq.addListener(e => { if (e.matches) closeMenu(); });
})();

/* ---------- Desktop mega-menu (hover + click + keyboard, ESC closes) ---------- */
(function(){
  const items = document.querySelectorAll('.nav-item.has-mega');
  if (!items.length) return;
  const closeAll = ()=>items.forEach(i=>i.setAttribute('aria-expanded','false'));
  const openOnly = item => { closeAll(); item.setAttribute('aria-expanded','true'); };

  // Detect a touch-primary device (fine-tuned but not required for correctness).
  const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;

  items.forEach(item=>{
    const link = item.querySelector('.nav-link');

    // Click ALWAYS OPENS (never closes). Closing is handled by:
    //   • click outside .nav-item.has-mega
    //   • mouseleave (hover-capable devices)
    //   • ESC key
    // This avoids the classic "hover opened it, then my click closed it" bug on desktop.
    link.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const wasOpen = item.getAttribute('aria-expanded') === 'true';
      if (wasOpen && isTouch) {
        // On touch, a second tap on the same trigger should close it.
        closeAll();
      } else {
        openOnly(item);
      }
    });

    // Keyboard: Enter/Space toggle, ArrowDown opens and focuses first item
    link.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const wasOpen = item.getAttribute('aria-expanded') === 'true';
        if (wasOpen) closeAll(); else openOnly(item);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        openOnly(item);
        const first = item.querySelector('.mega a');
        if (first) first.focus();
      }
    });

    // Hover open/close on pointer:fine devices; harmless on touch
    item.addEventListener('mouseenter', () => openOnly(item));
    item.addEventListener('mouseleave', () => item.setAttribute('aria-expanded','false'));
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  document.addEventListener('click', e => { if (!e.target.closest('.nav-item.has-mega')) closeAll(); });
})();

/* ============================================================
   QUOTE CALCULATOR
   ============================================================ */
const PRICING = {
  // Residential — Standard (Whole Home) [one-time, weekly/biweekly, monthly]
  standard:{
    studio:[185,149,155],
    br1   :[235,189,199],
    br2   :[285,229,239],
    br3   :[365,289,305],
    br4   :[445,359,375],
    br5   :null,
  },
  // Deep Clean [standard, as first visit on a plan]
  deep:{
    studio:[315,249],
    br1:[385,309],
    br2:[465,375],
    br3:[565,455],
    br4:[685,549],
    br5:null,
  },
  // Move-in/out [standard, 4+/yr volume]
  move:{
    studio:[305,275],
    br1:[365,329],
    br2:[445,399],
    br3:[545,489],
    br4:[665,599],
    br5:null,
  },
  // Airbnb turnover [single, host plan]
  airbnb:{
    studio:[135,115],
    br1:[165,129],
    br2:[215,169],
    br3:[285,229],
    br4:[355,289],
    br5:null,
  },
  // Commercial [one-time, weekly contract, 2-5x weekly contract]
  commercial:{
    sqft1000:[225,179,159],
    sqft2500:[385,309,279],
    sqft5000:[595,479,429],
    sqft10k :null,
    sqft10kp:null,
  },
  // Add-ons — Kitchen [standard, on-a-plan]
  addons:{
    fridge      :{label:'Inside refrigerator', std:65, plan:49},
    oven        :{label:'Inside oven', std:70, plan:55},
    freezer     :{label:'Inside freezer', std:45, plan:35},
    cabFront    :{label:'Cabinet fronts', std:65, plan:49},
    cabInt      :{label:'Cabinet interiors (emptied)', std:85, plan:69},
    hood        :{label:'Range hood & filter degrease', std:55, plan:45},
    dishes      :{label:'Dishwashing / put-away', std:35, plan:29},
    baseboards  :{label:'Baseboards (whole home)', std:60, plan:49},
    doors       :{label:'Interior doors & frames', std:45, plan:35},
    walls       :{label:'Wall spot-washing', std:50, plan:40},
    vents       :{label:'Vents & registers', std:40, plan:32},
    laundry     :{label:'Laundry (wash/dry/fold, per load)', std:45, plan:35},
    petHair     :{label:'Pet hair removal treatment', std:75, plan:59},
    petOdor     :{label:'Pet odor treatment', std:85, plan:69},
    sanitize    :{label:'High-touch sanitization', std:95, plan:75},
  },
  // Per-unit add-ons (quantity)
  qtyAddons:{
    windows     :{label:'Interior windows', std:12, plan:10, unit:'window'},
    fans        :{label:'Ceiling fans', std:18, plan:15, unit:'fan'},
    blinds      :{label:'Blinds', std:15, plan:12, unit:'set'},
  },
  // Airbnb host add-ons (fixed price, plan discount doesn't apply)
  airbnbAddons:{
    laundryOn  :{label:'Laundry — on-site', price:45},
    laundryOff :{label:'Laundry — off-site pickup', price:65},
    restock    :{label:'Consumables restocking', price:35},
    hottub     :{label:'Hot tub visual inspection', price:20},
    walkthrough:{label:'Property walkthrough (owner check)', price:30},
  },
  // Commercial add-ons
  commAddons:{
    windows:{label:'Interior window cleaning', price:10, unit:'window'},
    restroom:{label:'Restroom deep sanitization', price:95, unit:'restroom'},
    breakroom:{label:'Break room / kitchenette detail', price:75},
  },
  // Frequency discount labels
  freqCol:{once:0, weekly:1, biweekly:1, monthly:2},
  freqLabel:{once:'One-time', weekly:'Weekly recurring', biweekly:'Biweekly recurring', monthly:'Monthly recurring'},
  bedroomLabel:{studio:'Studio / 1 Bath',br1:'1 Bedroom',br2:'2 Bedroom',br3:'3 Bedroom',br4:'4 Bedroom',br5:'5+ Bedroom / Estate'},
  sqftLabel:{sqft1000:'Under 1,000 sq ft',sqft2500:'1,000 – 2,500 sq ft',sqft5000:'2,500 – 5,000 sq ft',sqft10k:'5,000 – 10,000 sq ft',sqft10kp:'Over 10,000 sq ft'},
};

const fmt = n => (typeof n === 'number') ? '$'+n.toLocaleString('en-US',{maximumFractionDigits:0}) : n;

/* ---- State ---- */
const state = {
  step:0,
  service:'',      // residential | airbnb | commercial
  type:'standard', // standard | deep | move | (airbnb/commercial fixed)
  bedrooms:'',     // studio | br1..br5
  size:'',         // sqft1000..sqft10kp
  frequency:'once',// once | weekly | biweekly | monthly
  addons:new Set(),
  qty:{windows:0,fans:0,blinds:0},
  airbnbAddons:new Set(),
  commAddons:new Set(),
  commQty:{windows:0,restroom:0},
  emergency:false, // airbnb same-day +25%
  hostPlan:false,  // airbnb host plan pricing
  contract:false,  // commercial contract vs one-time
  contractFreq:'weekly', // weekly | multi
  contact:{name:'',email:'',phone:'',address:'',date:'',notes:''},
};

/* ---- Panel definitions ---- */
const stepTitles = ['Service','Property','Frequency','Add-ons','Contact'];

/* ---- Helpers ---- */
const $ = (s,c=document)=>c.querySelector(s);
const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

function renderSteps(){
  const wrap = $('#qsteps'); if(!wrap) return;
  wrap.innerHTML = stepTitles.map((t,i)=>{
    let cls = 'qstep';
    if(i===state.step) cls+=' active';
    else if(i<state.step) cls+=' done';
    return `<div class="${cls}">${i+1}. ${t}</div>`;
  }).join('');
}

function showPanel(n){
  state.step = n;
  renderSteps();
  $$('.qpanel').forEach((p,i)=>p.classList.toggle('active', i===n));
  updateSummary();
  // Scroll into view on mobile
  const q = $('#quoteWrap');
  if(q && window.innerWidth < 960) q.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ============================================================
   PRICING ENGINE
   ============================================================ */
function calcBase(){
  const s = state.service;
  if(!s) return {base:0, label:''};

  if(s==='residential'){
    const table = PRICING[state.type];
    if(!table || !state.bedrooms) return {base:0,label:''};
    const row = table[state.bedrooms];
    if(!row){ return {base:null, label:`${PRICING.bedroomLabel[state.bedrooms]} — Custom quote by phone`}; }
    if(state.type==='standard'){
      const idx = PRICING.freqCol[state.frequency];
      return {base:row[idx], label:`Standard clean · ${PRICING.bedroomLabel[state.bedrooms]}`};
    }
    if(state.type==='deep'){
      const idx = (state.frequency==='once') ? 0 : 1; // discount when starting a plan
      return {base:row[idx], label:`Deep clean · ${PRICING.bedroomLabel[state.bedrooms]}`};
    }
    if(state.type==='move'){
      const idx = state.frequency==='monthly' || state.frequency==='weekly' || state.frequency==='biweekly' ? 1 : 0;
      // If landlord flag set via frequency? Simpler: base price = single unless "recurring" chosen → volume rate
      return {base:row[idx], label:`Move-in/out · ${PRICING.bedroomLabel[state.bedrooms]}`};
    }
  }

  if(s==='airbnb'){
    const row = PRICING.airbnb[state.bedrooms];
    if(!state.bedrooms) return {base:0,label:''};
    if(!row) return {base:null, label:`${PRICING.bedroomLabel[state.bedrooms]} — Custom quote by phone`};
    const base = state.hostPlan ? row[1] : row[0];
    let out = {base, label:`Airbnb turnover · ${PRICING.bedroomLabel[state.bedrooms]}${state.hostPlan?' (Host Plan)':''}`};
    if(state.emergency) out.base = Math.round(out.base * 1.25);
    return out;
  }

  if(s==='commercial'){
    if(!state.size) return {base:0,label:''};
    const row = PRICING.commercial[state.size];
    if(!row) return {base:null, label:`${PRICING.sqftLabel[state.size]} — Free walkthrough required`};
    let idx = 0;
    if(state.contract && state.contractFreq==='weekly') idx = 1;
    if(state.contract && state.contractFreq==='multi')  idx = 2;
    return {base:row[idx], label:`Commercial · ${PRICING.sqftLabel[state.size]}${state.contract?' (contract)':''}`};
  }
  return {base:0,label:''};
}

function calcAddons(){
  const lines = [];
  const onPlan = state.frequency !== 'once' || state.hostPlan || state.contract;

  if(state.service==='residential'){
    state.addons.forEach(k=>{
      const a = PRICING.addons[k]; if(!a) return;
      const p = onPlan ? a.plan : a.std;
      lines.push({label:a.label, price:p});
    });
    Object.entries(state.qty).forEach(([k,q])=>{
      if(!q) return;
      const a = PRICING.qtyAddons[k]; if(!a) return;
      const each = onPlan ? a.plan : a.std;
      lines.push({label:`${a.label} × ${q}`, price:each*q});
    });
  }
  if(state.service==='airbnb'){
    state.airbnbAddons.forEach(k=>{
      const a = PRICING.airbnbAddons[k]; if(!a) return;
      lines.push({label:a.label, price:a.price});
    });
  }
  if(state.service==='commercial'){
    state.commAddons.forEach(k=>{
      const a = PRICING.commAddons[k]; if(!a) return;
      if(a.unit) return; // handled by qty
      lines.push({label:a.label, price:a.price});
    });
    Object.entries(state.commQty).forEach(([k,q])=>{
      if(!q) return;
      const a = PRICING.commAddons[k]; if(!a) return;
      lines.push({label:`${a.label} × ${q}`, price:a.price*q});
    });
  }
  return lines;
}

function updateSummary(){
  const {base,label} = calcBase();
  const addonLines = calcAddons();
  const sum = $('#summaryBody'); if(!sum) return;

  let html = '';

  // Frequency badge
  const freqBadge = state.service==='residential' ? PRICING.freqLabel[state.frequency]
    : state.service==='airbnb' ? (state.hostPlan?'Host Plan turnover':'Single turnover')
    : state.service==='commercial' ? (state.contract ? (state.contractFreq==='multi'?'2–5× weekly contract':'Weekly contract') : 'One-time visit')
    : null;
  if(freqBadge) html += `<div class="frequency-badge"><span>◆</span> ${freqBadge}</div>`;

  if(!state.service){
    html += '<div class="empty">Choose a service to see live pricing.</div>';
  } else if(base===null){
    html += `<div class="line"><span class="l">${label}</span><span class="v">Quote</span></div>`;
    html += '<div class="empty">Call <a href="tel:+15704684396">570.468.4396</a> for a free walkthrough & written quote.</div>';
  } else {
    if(base>0) html += `<div class="line"><span class="l">${label}</span><span class="v">${fmt(base)}</span></div>`;
    addonLines.forEach(l=> html += `<div class="line"><span class="l">${l.label}</span><span class="v">${fmt(l.price)}</span></div>`);
  }

  sum.innerHTML = html;

  // Total
  const total = (base||0) + addonLines.reduce((a,b)=>a+b.price,0);
  const tv = $('#totalValue');
  const tl = $('#totalLabel');
  if(tv && tl){
    if(base===null){
      tv.innerHTML = '<span style="font-size:1.4rem">Custom</span>';
      tl.textContent = 'Free walkthrough';
    } else if(total===0){
      tv.textContent = '$0';
      tl.textContent = 'Est. total';
    } else {
      const isRecur = state.frequency!=='once' && state.service==='residential';
      tv.innerHTML = fmt(total) + (isRecur?'<small>/visit</small>':'');
      tl.textContent = isRecur ? 'Est. per-visit rate' : 'Estimated total';
    }
  }

  // Savings note
  const disc = $('#discNote');
  if(disc){
    disc.textContent = '';
    if(state.service==='residential' && state.frequency!=='once' && base){
      const onceTable = PRICING.standard[state.bedrooms];
      if(onceTable && state.type==='standard'){
        const oncePrice = onceTable[0];
        const save = oncePrice - base;
        if(save>0) disc.textContent = `You save ${fmt(save)} per visit vs. one-time.`;
      }
    }
    if(state.service==='airbnb' && state.hostPlan && base){
      const row = PRICING.airbnb[state.bedrooms];
      if(row){ const save = row[0]-row[1]; if(save>0) disc.textContent = `Host Plan saves ${fmt(save)} per turnover.`; }
    }
  }
}

/* ============================================================
   Event wiring
   ============================================================ */
function initQuote(){
  const root = $('#quoteWrap'); if(!root) return;

  renderSteps();
  showPanel(0);

  // Step 1: Service
  $$('input[name="service"]').forEach(r=>{
    r.addEventListener('change', ()=>{
      state.service = r.value;
      // reset type per service
      if(state.service==='residential') state.type = 'standard';
      // Show/hide relevant sub-controls
      $$('.svc-only').forEach(el=>{
        const need = el.dataset.for.split(',');
        el.style.display = need.includes(state.service) ? '' : 'none';
      });
      updateSummary();
    });
  });

  // Residential type radios
  $$('input[name="restype"]').forEach(r=>{
    r.addEventListener('change',()=>{ state.type=r.value; updateSummary(); });
  });

  // Bedrooms
  $$('input[name="bedrooms"]').forEach(r=>{
    r.addEventListener('change',()=>{ state.bedrooms=r.value; updateSummary(); });
  });

  // Sqft
  $$('input[name="size"]').forEach(r=>{
    r.addEventListener('change',()=>{ state.size=r.value; updateSummary(); });
  });

  // Frequency
  $$('input[name="frequency"]').forEach(r=>{
    r.addEventListener('change',()=>{ state.frequency=r.value; updateSummary(); });
  });

  // Airbnb host plan
  const hp = $('#hostPlan');
  if(hp) hp.addEventListener('change',()=>{ state.hostPlan=hp.checked; updateSummary(); });
  const em = $('#emergency');
  if(em) em.addEventListener('change',()=>{ state.emergency=em.checked; updateSummary(); });

  // Commercial contract
  const co = $('#contract');
  if(co) co.addEventListener('change',()=>{
    state.contract=co.checked;
    $('#contractFreqWrap').style.display = state.contract ? '' : 'none';
    updateSummary();
  });
  $$('input[name="contractFreq"]').forEach(r=>{
    r.addEventListener('change',()=>{ state.contractFreq=r.value; updateSummary(); });
  });

  // Add-ons (residential)
  $$('.addon-check').forEach(c=>{
    c.addEventListener('change',()=>{
      if(c.checked) state.addons.add(c.value); else state.addons.delete(c.value);
      updateSummary();
    });
  });

  // Quantity add-ons
  $$('.qty').forEach(w=>{
    const key = w.dataset.key;
    const input = w.querySelector('input');
    const minus = w.querySelector('.q-minus');
    const plus  = w.querySelector('.q-plus');
    const set = v => {
      v = Math.max(0, Math.min(99, parseInt(v)||0));
      input.value = v;
      if(w.dataset.group==='comm') state.commQty[key]=v; else state.qty[key]=v;
      updateSummary();
    };
    minus.addEventListener('click',()=>set(parseInt(input.value)-1));
    plus.addEventListener('click',()=>set(parseInt(input.value)+1));
    input.addEventListener('change',()=>set(input.value));
  });

  // Airbnb add-ons
  $$('.abnb-check').forEach(c=>{
    c.addEventListener('change',()=>{
      if(c.checked) state.airbnbAddons.add(c.value); else state.airbnbAddons.delete(c.value);
      updateSummary();
    });
  });
  // Commercial add-ons
  $$('.comm-check').forEach(c=>{
    c.addEventListener('change',()=>{
      if(c.checked) state.commAddons.add(c.value); else state.commAddons.delete(c.value);
      updateSummary();
    });
  });

  // Contact fields
  ['name','email','phone','address','date','notes'].forEach(k=>{
    const el = $('#f_'+k); if(!el) return;
    el.addEventListener('input',()=>{ state.contact[k]=el.value; });
  });

  // Navigation
  $$('.qnext').forEach(b=>b.addEventListener('click',()=>{
    const target = state.step+1;
    if(target>=stepTitles.length) return;
    // Basic per-step validation
    if(state.step===0 && !state.service){ alert('Please choose a service.'); return; }
    if(state.step===1){
      if(state.service==='residential' && !state.bedrooms){ alert('Please choose home size.'); return; }
      if(state.service==='airbnb' && !state.bedrooms){ alert('Please choose property size.'); return; }
      if(state.service==='commercial' && !state.size){ alert('Please choose facility size.'); return; }
    }
    showPanel(target);
  }));
  $$('.qback').forEach(b=>b.addEventListener('click',()=>{ if(state.step>0) showPanel(state.step-1); }));

  // Submit
  const form = $('#quoteForm');
  if(form) form.addEventListener('submit', e=>{
    e.preventDefault();
    const c = state.contact;
    if(!c.name || !c.email || !c.phone){
      alert('Please fill in name, email, and phone so we can send your quote.'); return;
    }
    const {base,label} = calcBase();
    const addons = calcAddons();
    const total = (base||0) + addons.reduce((a,b)=>a+b.price,0);
    // Build a mailto body
    const summary = [
      'Hi Rainns Management — I would like to request the following service:',
      '',
      `Service: ${state.service}${label?' ('+label+')':''}`,
      `Frequency: ${PRICING.freqLabel[state.frequency]||''}`,
      addons.length ? 'Add-ons: '+addons.map(a=>a.label+' — '+fmt(a.price)).join(', ') : '',
      base===null ? 'Base: Requires a walkthrough / custom quote.' : `Base price: ${fmt(base)}`,
      total ? `Estimated total: ${fmt(total)}` : '',
      '',
      `Name: ${c.name}`,
      `Phone: ${c.phone}`,
      `Email: ${c.email}`,
      c.address ? `Address: ${c.address}` : '',
      c.date ? `Preferred date: ${c.date}` : '',
      c.notes ? `Notes: ${c.notes}` : '',
    ].filter(Boolean).join('\n');
    const subject = encodeURIComponent(`Cleaning quote request — ${c.name}`);
    const body = encodeURIComponent(summary);
    window.location.href = `mailto:aresivan15@icloud.com?subject=${subject}&body=${body}`;

    // Also show confirmation
    $('#quoteDone').classList.remove('hidden');
    $('#quoteDone').scrollIntoView({behavior:'smooth',block:'center'});
  });

  updateSummary();
}

document.addEventListener('DOMContentLoaded', initQuote);

/* Current year in footer */
document.addEventListener('DOMContentLoaded',()=>{
  const y = document.getElementById('yr'); if(y) y.textContent = new Date().getFullYear();
});
