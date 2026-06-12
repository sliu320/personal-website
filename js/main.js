/* ============================================================
   ANALYTICS — thin wrapper around gtag so calls are safe even
   if Google Analytics hasn't loaded yet (ad blockers, etc.)
============================================================ */
function trackEvent(name, params) {
  if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
}

/* Per-hotspot click events — fired in addition to opening the modal */
const HOTSPOT_CLICK_EVENTS = {
  mirror:      'click_about',
  consulting:  'click_case_files',
  laptop:      'click_projects',
  trophy:      'click_awards',
  door:        'click_whats_next',
  contact:     'click_note',
  polaroids:   'click_community',
  hobbies:     'click_hobbies',
  stickynotes: 'click_stickies',
  piano:       'click_music',
  worldmap:    'click_world_map',
  wardrobe:    'click_wardrobe',
  speaker:     'click_now_playing',
  teapot:      'click_tea_time',
  'lamp-toggle': 'click_lamp',
};

/* Per-modal open/close events, keyed by the internal modal/overlay key.
   Close events include duration_sec so each "section" acts like a page
   with its own dwell time. */
const MODAL_EVENT_NAMES = {
  about:      ['about_open',      'about_close'],
  consulting: ['case_files_open', 'case_files_close'],
  monitor:    ['projects_open',   'projects_close'],
  trophy:     ['awards_open',     'awards_close'],
  door:       ['whats_next_open', 'whats_next_close'],
  note:       ['note_open',       'note_close'],
  community:  ['community_open',  'community_close'],
  hobbies:    ['hobbies_open',    'hobbies_close'],
  stickies:   ['stickies_open',   'stickies_close'],
  music:      ['music_open',      'music_close'],
  worldmap:   ['world_map_open',  'world_map_close'],
  wardrobe:   ['wardrobe_open',   'wardrobe_close'],
  speaker:    ['now_playing_open','now_playing_close'],
  tea:        ['tea_time_open',   'tea_time_close'],
  bookshelf:  ['bookshelf_open',  'bookshelf_close'],
};

/* Modal/zoom-overlay dwell time tracking */
const _modalOpenTimes = {};
function trackModalOpen(key) {
  if (!key) return;
  _modalOpenTimes[key] = Date.now();
  const names = MODAL_EVENT_NAMES[key];
  if (names) trackEvent(names[0]);
}
function trackModalClose(key) {
  if (!key || !(key in _modalOpenTimes)) return;
  const duration_ms = Date.now() - _modalOpenTimes[key];
  delete _modalOpenTimes[key];
  const names = MODAL_EVENT_NAMES[key];
  if (names) trackEvent(names[1], { duration_ms, duration_sec: Math.round(duration_ms / 1000) });
}

/* ============================================================
   RICH MODAL RENDERERS
   These inject custom HTML into modalBody for specific hotspots.
   Return true if handled, false to fall through to plain text.
============================================================ */
const RICH_MODAL_KEYS = new Set(['polaroids','stickynotes','worldmap']);

function renderRichModal(key) {
  switch(key) {
    case 'piano':       renderCoverflow(); return true;
    case 'polaroids':   renderPolaroids(); return true;
    case 'consulting':  renderManila();    return true;
    case 'stickynotes': renderStickies();  return true;
    case 'books':       renderBookshelf(); return true;
    case 'contact':     renderNotepad();   return true;
    case 'trophy':      renderTrophyCase();return true;
    case 'laptop':      renderBrowser();   return true;
    case 'hobbies':     renderHobbiesBag();return true;
    case 'worldmap':    renderWorldMap();  return true;
    default: return false;
  }
}

/* ---- iTunes Coverflow (music) ---- */
function renderCoverflow() {
  // Album list and bio text live in content-music.js — edit there
  const albums = MUSIC_DATA.albums;
  let cur = 0;

  function buildCF() {
    const n = albums.length;
    let html = `<div class="cf-scene"><div class="cf-stage" id="cf-stage">`;
    for (let i = 0; i < n; i++) {
      const a = albums[i];
      const offset = i - cur;
      html += `<div class="cf-card" data-ci="${i}" style="z-index:${10-Math.abs(offset)};">
        <div class="cf-art" style="background:${a.bg};">${a.art}</div>
      </div>`;
    }
    html += `</div>
    <div class="cf-info"><div class="cf-name">${albums[cur].name}</div><div class="cf-sub">${albums[cur].sub}</div></div>
    <div class="cf-arrows"><button class="cf-arrow" id="cf-prev">‹</button><button class="cf-arrow" id="cf-next">›</button></div>
    <div class="cf-dots">${albums.map((_,i)=>`<div class="cf-dot${i===cur?' active':''}"></div>`).join('')}</div>
    </div>
    <div class="cf-body-text">
      ${MUSIC_DATA.bioParas.map(p => `<p>${p}</p>`).join('\n      ')}
      ${MUSIC_DATA.videoLink ? `<p><a href="${MUSIC_DATA.videoLink}">→ watch a performance</a></p>` : ''}
    </div>`;
    modalBody.innerHTML = html;
    positionCards();
    document.getElementById('cf-prev').onclick = () => { cur = (cur - 1 + n) % n; positionCards(); refreshCFInfo(); };
    document.getElementById('cf-next').onclick = () => { cur = (cur + 1) % n; positionCards(); refreshCFInfo(); };
    document.querySelectorAll('.cf-card').forEach(c => {
      c.onclick = () => { const i = +c.dataset.ci; if(i!==cur){ cur=i; positionCards(); refreshCFInfo(); } };
    });
  }

  function positionCards() {
    const cards = document.querySelectorAll('.cf-card');
    cards.forEach(c => {
      const offset = +c.dataset.ci - cur;
      const n = albums.length, mid = Math.floor(n/2);
      // Wrap offset
      let o = offset;
      if (o > mid) o -= n;
      if (o < -mid) o += n;
      const absO = Math.abs(o);
      const tx = o * 120;
      const tz = -absO * 80;
      const ry = -o * 28;
      const sc = absO === 0 ? 1 : absO === 1 ? 0.82 : 0.65;
      const op = absO === 0 ? 1 : absO === 1 ? 0.7 : absO > 2 ? 0 : 0.45;
      c.style.transform = `translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) scale(${sc})`;
      c.style.opacity   = op;
      c.style.zIndex    = 10 - absO;
      c.style.display   = absO > 2 ? 'none' : '';
    });
    // Update dots
    document.querySelectorAll('.cf-dot').forEach((d,i) => d.classList.toggle('active', i===cur));
  }

  function refreshCFInfo() {
    positionCards();
    const info = modalBody.querySelector('.cf-info');
    if (info) {
      info.querySelector('.cf-name').textContent = albums[cur].name;
      info.querySelector('.cf-sub').textContent  = albums[cur].sub;
    }
  }

  buildCF();
}

/* ---- Polaroid Wall (community) ---- */
function renderPolaroids() {
  const pols = [
    { bg:'#c8e6c9', emoji:'🎸', caption:'rock band\nco-president', rot:'-2deg' },
    { bg:'#bbdefb', emoji:'🏐', caption:'volleyball IM\nteam captain', rot:'1.5deg' },
    { bg:'#ffe0b2', emoji:'🎓', caption:'MIT Sloan\nclass of \'25', rot:'-1deg' },
    { bg:'#f8bbd0', emoji:'🎵', caption:'Chicago\nmusic program', rot:'2deg' },
    { bg:'#e1bee7', emoji:'⚽', caption:'soccer IM\nbuilt a community', rot:'-1.5deg' },
    { bg:'#fff9c4', emoji:'🫖', caption:'gongfu tea\nslowly', rot:'1deg' },
    { bg:'#b2ebf2', emoji:'💃', caption:'dance crew\nchoreo & salsa', rot:'-0.5deg' },
    { bg:'#dcedc8', emoji:'🏓', caption:'ping pong\ntournament regular', rot:'1.8deg' },
    { bg:'#fce4ec', emoji:'✨', caption:'imagination\nin action', rot:'-2.2deg' },
  ];
  let html = `<div class="polaroid-wall">`;
  pols.forEach(p => {
    html += `<div class="polaroid" style="transform:rotate(${p.rot})">
      <div class="pol-photo" style="background:${p.bg};">${p.emoji}</div>
      <div class="pol-caption">${p.caption.replace(/\n/,'<br>')}</div>
    </div>`;
  });
  html += `</div>
  <p style="color:#7a6a52;font-size:0.78rem;margin-top:1rem;line-height:1.65;">Activities first, friendship second — that's the formula. Most of the communities I'm in started as a sport or practice and became something much more meaningful.</p>`;
  modalBody.innerHTML = html;
}

/* ---- Manila Folder (consulting) ---- */
function renderManila() {
  const html = `<div class="manila-wrap">
    <div class="manila-tab">📁 CASE FILES</div>
    <div class="manila-folder">
      <div class="manila-stamp">BCG Associate + Consultant</div>

      <div class="manila-group-label">Featured</div>

      <div class="manila-doc">
        <div class="manila-paperclip"></div>
        <div class="manila-case-title">GenAI Use Case Assessment</div>
        <span class="manila-client">Global biopharma company</span>
        <div class="manila-chips">
          <span class="manila-chip">Healthcare</span><span class="manila-chip">AI/Digital</span><span class="manila-chip">Strategy</span><span class="manila-chip">Value Creation</span>
        </div>
        <div class="manila-skills-line"><strong>Skills:</strong> Stakeholder alignment · Design thinking · Financial modeling · Executive communication · Cross-functional collaboration</div>
        <div class="manila-section-hdr">Executive Summary</div>
        <div class="manila-body">Assessed 100+ GenAI use cases across 11 business units, prioritizing 10 high-impact use cases projected to save $40M annually.</div>
        <div class="manila-section-hdr">Key Context</div>
        <div class="manila-body">IT department exploring AI/GenAI as part of a global Value Creation Initiative. Case team developed a comprehensive AI/GenAI strategy including tech and org readiness roadmap and set of inaugural use cases.</div>
        <div class="manila-section-hdr">Contribution</div>
        <ul class="manila-ul">
          <li>Designed value-feasibility-risk framework for use case assessment</li>
          <li>Conducted top-down industry evaluation of GenAI use cases across BCG</li>
          <li>Co-developed workshops with client design arm to prioritize use cases</li>
          <li>Modeled financial impact of top 10 use cases through meetings with BU leaders and BCG X data scientists</li>
          <li>Prepared exec presentation materials to align key stakeholders incl. CTO</li>
        </ul>
        <div class="manila-outcome-box">
          <div class="manila-section-hdr">Outcome</div>
          Client moved forward with phased plan; first 5 use cases projected to save $40M annually. Full buy-in from BUs, Finance, and IT.
        </div>
        <div class="manila-section-hdr">Learnings</div>
        <div class="manila-body">Early tech adoption at large companies prioritizes quick wins and safe bets. Pushback from BUs due to mistrust of centralized initiatives underscores the importance of aligned incentives.</div>
      </div>

      <div class="manila-doc">
        <div class="manila-case-title">Self-Service BI Tool Design</div>
        <span class="manila-client">Global biopharma company</span>
        <div class="manila-chips">
          <span class="manila-chip">Data/Digital</span><span class="manila-chip">Product</span><span class="manila-chip">UX</span>
        </div>
        <div class="manila-skills-line"><strong>Skills:</strong> UX and product design · Co-creation · Initiative · Operating under ambiguity</div>
        <div class="manila-section-hdr">Executive Summary</div>
        <div class="manila-body">Unstalled a two-month deadlock on a BI tool vision — designed product mockups from scratch that re-energized client engagement and got the workstream across the finish line.</div>
        <div class="manila-section-hdr">Key Context</div>
        <div class="manila-body">BI team needed a north star vision for a self-service analytics tool for non-technical audiences. The workstream had stalled for two months due to vague objectives and unproductive client sessions.</div>
        <div class="manila-section-hdr">Contribution</div>
        <ul class="manila-ul">
          <li>Took ownership of the stalled workstream without being asked — proactively drove the design direction</li>
          <li>Created product mockups from scratch, drawing on best practices across BCG and leading data tools: dashboards, AI-driven insights, social-media-inspired interface</li>
          <li>Facilitated sessions that re-energized client discussions and unblocked the team</li>
          <li>Enabled the workstream to finalize vision and strategy on time</li>
        </ul>
        <div class="manila-outcome-box">
          <div class="manila-section-hdr">Outcome</div>
          Workstream delivered on time. Manager specifically noted the result would not have been possible without my initiative.
        </div>
        <div class="manila-section-hdr">Learnings</div>
        <div class="manila-body">Sometimes a stalled workstream just needs someone to put something concrete on the table. A clear visual provocation moves discussions faster than another working session.</div>
      </div>

      <div class="manila-doc">
        <div class="manila-case-title">Sales Coverage Model Redesign</div>
        <span class="manila-client">Fortune 500 engineering software company</span>
        <div class="manila-chips">
          <span class="manila-chip">Tech</span><span class="manila-chip">GTM</span><span class="manila-chip">Sales</span><span class="manila-chip">People &amp; Org</span>
        </div>
        <div class="manila-skills-line"><strong>Skills:</strong> GTM motions · Role and org design · Stakeholder alignment · Financial modeling · Executive comms · Expert interviews</div>
        <div class="manila-section-hdr">Executive Summary</div>
        <div class="manila-body">Redesigned the global sales coverage model and projected costs, working closely with worldwide sales leaders to align with a new CRO targeting 35% revenue growth over three years.</div>
        <div class="manila-section-hdr">Contribution</div>
        <ul class="manila-ul">
          <li>Led GTM competitor analyses — RACI frameworks, GTM motions, customer segmentation, coverage ratios</li>
          <li>Co-created sales model coverage designs and org structure with worldwide sales leaders, focused on enterprise motion</li>
          <li>Modeled costs of proposed sales org and prepared CRO workshop materials</li>
        </ul>
        <div class="manila-outcome-box">
          <div class="manila-section-hdr">Outcome</div>
          CRO and worldwide sales leaders aligned on RACI, coverage model, and coverage ratios per customer segment. Case team extended for next phase of work.
        </div>
        <div class="manila-section-hdr">Learnings</div>
        <div class="manila-body">New CRO challenged the budget for the Sales org, dwarfed by Customer Success. It took an outside lens to shift from an incumbent "farming" mindset to a "hunter" mindset where Sales takes priority.</div>
      </div>

      <div class="manila-doc">
        <div class="manila-case-title">Investment Playbook &amp; Executive Workshop</div>
        <span class="manila-client">Environmental services family office</span>
        <div class="manila-chips">
          <span class="manila-chip">Climate &amp; Sustainability</span><span class="manila-chip">Industrial Goods</span><span class="manila-chip">Strategy</span>
        </div>
        <div class="manila-skills-line"><strong>Skills:</strong> Workshop design · Operating under ambiguity · Cross-functional coordination · Sprint execution</div>
        <div class="manila-section-hdr">Executive Summary</div>
        <div class="manila-body">Took a vague brief and a blank page — designed a 6-hour interactive workshop from scratch in a three-week sprint, turning years of organizational deadlock into a live, aligned decision-making process.</div>
        <div class="manila-section-hdr">Key Context</div>
        <div class="manila-body">The CEO had capital to deploy and nearly a decade of organizational deadlock on where to put it. BCG was brought in with high-level goals and no defined scope — both the problem definition and success criteria had to be built from the ground up.</div>
        <div class="manila-section-hdr">Contribution</div>
        <ul class="manila-ul">
          <li>Translated an ambiguous brief into concrete workshop design from scratch — agenda, facilitation materials, and simulation mechanics</li>
          <li>Partnered with a BCG advisor (ex-EPA) to develop a backgrounder grounding the executive team in chemicals cleanup as a live investment opportunity</li>
          <li>Coordinated across two parallel workstreams in a rapid three-week sprint</li>
          <li>Designed the workshop itself as the forcing function — structured so the executive team had to make real investment decisions in the room</li>
        </ul>
        <div class="manila-outcome-box">
          <div class="manila-section-hdr">Outcome</div>
          Workshop broke years of organizational deadlock and earned a direct client shout-out. The live simulation made the investment playbook feel real before it was finished.
        </div>
        <div class="manila-section-hdr">Learnings</div>
        <div class="manila-body">Starting without a defined problem is the hardest kind of work — and the most useful. Clarity emerged through the making, not before it.</div>
      </div>

      <div class="manila-group-label">Additional Casework</div>

      <div class="manila-doc">
        <div class="manila-case-title">Post M&amp;A GTM Strategy</div>
        <span class="manila-client">Americas division of global industrial goods company</span>
        <div class="manila-chips">
          <span class="manila-chip">Industrial Goods</span><span class="manila-chip">GTM</span><span class="manila-chip">M&amp;A</span><span class="manila-chip">Product</span>
        </div>
        <div class="manila-skills-line"><strong>Skills:</strong> GTM strategy · Regional strategy · Product portfolio rationalization · Quantitative analysis · Competitor analysis</div>
        <div class="manila-body" style="margin-top:0.4rem;">GTM strategy post-$8B acquisition. Delivered executive workshops on new product portfolio (cross-selling &amp; rebranding), shaped regional sales strategy through quantitative market analysis, and proposed channel incentive programs. Efforts enabled BCG to win the second implementation phase.</div>
      </div>

      <div class="manila-doc">
        <div class="manila-case-title">Non-Profit Alumni Engagement Program</div>
        <span class="manila-client">Regional branch of national non-profit</span>
        <div class="manila-chips">
          <span class="manila-chip">User Research</span><span class="manila-chip">Growth</span><span class="manila-chip">Program Design</span>
        </div>
        <div class="manila-skills-line"><strong>Skills:</strong> Data analysis · Persona development · Customer journey mapping · Program design</div>
        <div class="manila-body" style="margin-top:0.4rem;">Designed an alumni engagement program from scratch for a ~32K-alumni base with no existing engagement infrastructure. Led segmentation into nine demographic and psychographic personas, mapped the full user journey, designed targeted engagement approaches per persona, and built the implementation roadmap from objectives through channels and metrics.</div>
      </div>

      <div class="manila-doc">
        <div class="manila-case-title">Project Management for Healthcare Commission</div>
        <span class="manila-client">State Governor's healthcare commission</span>
        <div class="manila-chips">
          <span class="manila-chip">Public Sector</span><span class="manila-chip">Healthcare</span><span class="manila-chip">PMO</span>
        </div>
        <div class="manila-skills-line"><strong>Skills:</strong> Program management · Cross-functional coordination · Operating without formal authority</div>
        <div class="manila-body" style="margin-top:0.4rem;">Held together a 30-person cross-functional team across 3 concurrent workstreams with frequent stakeholder bottlenecks and no formal reporting authority. Served as de facto PMO lead — set priorities, built integrated tracking systems, kept momentum by escalating blockers and proactively resetting timelines. Report delivered on time.</div>
      </div>

      <div class="manila-doc">
        <div class="manila-case-title">GenAI Use Case Proposal</div>
        <span class="manila-client">Global biopharma company</span>
        <div class="manila-chips">
          <span class="manila-chip">Healthcare</span><span class="manila-chip">AI/Digital</span><span class="manila-chip">Sprint</span>
        </div>
        <div class="manila-skills-line"><strong>Skills:</strong> Sprint execution · Co-creation · Directing cross-functional team · Storytelling</div>
        <div class="manila-body" style="margin-top:0.4rem;">Two-week sprint to respond to a client RFP for the AI build phase. Directed a team of ~3 to build a microsite and CEO video message, co-developed proposal slides with external partners, and synthesized complex AI content into a cohesive narrative under tight time pressure. Format elevated to senior BCG partners as a new approach for AI proposals.</div>
      </div>

      <div class="manila-group-label">Social Impact &amp; IP Development</div>

      <div class="manila-doc">
        <div class="manila-case-title">State Housing &amp; Homelessness Strategy</div>
        <span class="manila-client">Rhode Island Housing Department</span>
        <div class="manila-chips">
          <span class="manila-chip">Public Sector</span><span class="manila-chip">Social Impact</span>
        </div>
        <div class="manila-skills-line"><strong>Skills:</strong> Process mapping · Stakeholder alignment · Expert interviews</div>
        <div class="manila-body" style="margin-top:0.4rem;">BCG engaged to develop a state-wide homelessness response after critical emergency shelters closed down. Authored the playbook for creating new shelter capacity (permitting, vendor selection) — directly influenced the purchase of a facility to house 41 families. Developed comparative case studies across states.</div>
      </div>

      <div class="manila-doc">
        <div class="manila-case-title">Talent &amp; Skills IP Development</div>
        <span class="manila-client">BCG Bruce Henderson Institute</span>
        <div class="manila-chips">
          <span class="manila-chip">Future of Work</span><span class="manila-chip">Thought Leadership</span>
        </div>
        <div class="manila-skills-line"><strong>Skills:</strong> Stakeholder &amp; community engagement · Content creation</div>
        <div class="manila-body" style="margin-top:0.4rem;">Advanced BCG's Talent &amp; Skills offering by crafting proposal materials, curating tools and resources across functions, facilitating internal engagement initiatives, and preparing thought leadership for external publication. Topics: internal mobility, skills-based hiring, on-demand talent, micro-engagements.</div>
      </div>

    </div>
  </div>
  <p style="color:#7a6a52;font-size:0.72rem;margin-top:0.8rem;font-style:italic;line-height:1.6;">Two years at BCG as Associate then Consultant — across healthcare, tech, industrials, public sector, and social impact. Client details kept general.</p>`;
  modalBody.innerHTML = html;
}

/* ---- Sticky Note Board (ideas) ---- */
function renderStickies() {
  let html = `<div class="sticky-board">`;
  STICKY_NOTES.forEach(n => {
    html += `<div class="sticky ${n.color}"><div class="sticky-hdr">${n.hdr}</div>${n.body}</div>`;
  });
  html += `</div>
  <p style="color:#7a6a52;font-size:0.78rem;margin-top:0.8rem;line-height:1.65;font-style:italic;">Living document — these are the questions I keep coming back to.</p>`;
  modalBody.innerHTML = html;
}

/* ---- Book Shelf (reading) ---- */
function renderBookshelf() {
  const rows = [
    [
      { t:'Zero to One', a:'Thiel', h:116, w:22, bg:'#1a3a5c', c:'#a8d4f5' },
      { t:'High Output Management', a:'Grove', h:108, w:20, bg:'#3a1a1a', c:'#f5a8a8' },
      { t:'Thinking Fast & Slow', a:'Kahneman', h:120, w:24, bg:'#2a3a1a', c:'#b8e8a0' },
      { t:'The Innovator\'s Dilemma', a:'Christensen', h:112, w:20, bg:'#3a2a10', c:'#f5d08a' },
      { t:'Poor Charlie\'s Almanack', a:'Munger', h:118, w:26, bg:'#1a2a3a', c:'#90c8e8' },
      { t:'Outliers', a:'Gladwell', h:100, w:18, bg:'#2a1a3a', c:'#d0a8e8' },
      { t:'Hard Thing About Hard Things', a:'Horowitz', h:114, w:22, bg:'#1a1a1a', c:'#e8e8e8' },
    ],
    [
      { t:'Sapiens', a:'Harari', h:110, w:22, bg:'#1a2a1a', c:'#a0d890' },
      { t:'Shoe Dog', a:'Knight', h:104, w:20, bg:'#3a1e10', c:'#f0b87a' },
      { t:'Never Split the Difference', a:'Voss', h:106, w:20, bg:'#1a1e38', c:'#90a8e8' },
      { t:'Atomic Habits', a:'Clear', h:98,  w:18, bg:'#1e1a10', c:'#e8d880' },
      { t:'The Mom Test', a:'Fitzpatrick', h:88, w:16, bg:'#2e1a10', c:'#f0a868' },
      { t:'Creativity Inc', a:'Catmull', h:108, w:22, bg:'#2a1818', c:'#f0b0a0' },
      { t:'Grit', a:'Duckworth', h:96,  w:18, bg:'#1a2818', c:'#98d898' },
      { t:'Range', a:'Epstein', h:102, w:20, bg:'#281a10', c:'#f0c888' },
    ],
  ];

  let html = `<div class="book-shelf-wrap">`;
  rows.forEach((row, ri) => {
    html += `<div class="shelf-row">`;
    row.forEach(b => {
      html += `<div class="book" style="width:${b.w}px;height:${b.h}px;background:${b.bg};color:${b.c};" title="${b.t} — ${b.a}">
        <div class="book-title">${b.t}</div>
        <div class="book-author">${b.a}</div>
      </div>`;
    });
    html += `</div>`;
    html += `<div class="shelf-caption">${ri===0?'strategy · management · psychology':'biography · habits · entrepreneurship'}</div>`;
  });

  html += `</div>
  <div class="shelf-bio">
    <p>These are the books that genuinely changed how I think — not just what I know. The shelf is a snapshot of the conversations I keep returning to.</p>
    <p>Currently reading: <em>The Art of Doing Science and Engineering</em> — Hamming.</p>
  </div>`;
  modalBody.innerHTML = html;
}

/* ---- Notepad Contact Form ---- */
function renderNotepad() {
  const FORMSPREE_ID = 'mvznagda';

  // Override modal to remove default padding — the notepad IS the modal
  document.getElementById('modal').style.padding = '0';
  document.getElementById('modal').style.background = 'none';
  document.getElementById('modal').style.boxShadow = 'none';
  document.getElementById('modal').style.overflow = 'visible';

  modalBody.innerHTML = `
  <form id="nf-note-form" novalidate style="
    display:flex; flex-direction:column;
    width:clamp(280px,36vw,400px);
    border-radius:6px 6px 4px 4px;
    overflow:hidden;
    box-shadow:0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12);
    font-family:'Georgia',serif;
  ">

    <!-- Spiral top bar -->
    <div style="
      background:linear-gradient(to bottom,#f9d84a,#f5c832);
      padding:0.6rem 1rem 0;
      position:relative;
    ">
      <!-- Spiral holes -->
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:6px;">
        ${Array(9).fill('<div style="width:12px;height:12px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px #d4a800,inset 0 1px 2px rgba(0,0,0,0.2);"></div>').join('')}
      </div>
      <div style="text-align:center;font-size:1.05rem;font-weight:700;color:#5a3c00;letter-spacing:0.04em;padding-bottom:0.5rem;font-style:italic;">
        ✉ leave a note
      </div>
    </div>

    <!-- Lined paper body -->
    <div style="
      background:#fefdf8;
      background-image:
        linear-gradient(rgba(180,210,240,0.55) 1px, transparent 1px);
      background-size:100% 32px;
      padding:0.5rem 1rem 1rem 3.2rem;
      position:relative;
      flex:1;
    ">
      <!-- Red margin line -->
      <div style="position:absolute;left:2.4rem;top:0;bottom:0;width:1.5px;background:rgba(220,80,70,0.35);"></div>

      ${[
        ['name','text','your name'],
        ['subject','text','reason for reaching out'],
        ['email','email','your@email.com'],
        ['linkedin','text','linkedin.com/in/…'],
      ].map(([id,type,ph]) => `
        <div style="display:flex;align-items:baseline;border-bottom:1px solid rgba(180,210,240,0.55);min-height:32px;">
          <span style="font-size:0.52rem;letter-spacing:0.12em;text-transform:uppercase;color:#b0895a;width:52px;flex-shrink:0;line-height:32px;">${id}</span>
          <input id="nf-${id}" type="${type}" placeholder="${ph}" autocomplete="off"
            style="flex:1;background:transparent;border:none;outline:none;font-family:'Georgia',serif;font-size:0.82rem;color:#2a1a08;line-height:32px;padding:0;width:100%;"
            oninput="this.style.borderBottom='none'">
        </div>`).join('')}

      <div style="display:flex;align-items:flex-start;min-height:80px;padding-top:4px;">
        <span style="font-size:0.52rem;letter-spacing:0.12em;text-transform:uppercase;color:#b0895a;width:52px;flex-shrink:0;line-height:32px;">msg</span>
        <textarea id="nf-msg" placeholder="a quick hello, a role you're thinking of, or just something interesting…"
          style="flex:1;background:transparent;border:none;outline:none;font-family:'Georgia',serif;font-size:0.82rem;color:#2a1a08;line-height:32px;padding:0;resize:none;min-height:80px;width:100%;"></textarea>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#fefdf8;padding:0.5rem 1rem 0.75rem;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(180,210,240,0.4);">
      <div id="nf-status" style="font-size:0.65rem;font-style:italic;color:#8a6a3a;"></div>
      <button type="submit" id="nf-send" style="
        background:linear-gradient(135deg,#f5c832,#e0a800);
        border:none;border-radius:20px;padding:0.38rem 1.1rem;
        font-family:'Georgia',serif;font-size:0.76rem;font-weight:600;
        color:#3a2800;letter-spacing:0.06em;cursor:pointer;
        box-shadow:0 2px 8px rgba(0,0,0,0.15);
        transition:opacity 0.2s,transform 0.15s;
      " onmouseover="this.style.opacity='.85'" onmouseout="this.style.opacity='1'">send →</button>
    </div>
  </form>`;

  document.getElementById('nf-note-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('nf-name').value.trim();
    const subject  = document.getElementById('nf-subject').value.trim();
    const email    = document.getElementById('nf-email').value.trim();
    const linkedin = document.getElementById('nf-linkedin').value.trim();
    const msg      = document.getElementById('nf-msg').value.trim();
    const status   = document.getElementById('nf-status');

    const nameEl  = document.getElementById('nf-name');
    const emailEl = document.getElementById('nf-email');
    // Reset any prior invalid-field highlighting
    [nameEl, emailEl].forEach(el => { el.style.borderBottom = '1px solid rgba(180,210,240,0.55)'; });

    const missing = [];
    if (!name)  missing.push('name');
    if (!email) missing.push('email');
    if (!msg)   missing.push('message');

    if (missing.length) {
      missing.forEach(field => {
        const el = field === 'name' ? nameEl : field === 'email' ? emailEl : null;
        if (el) el.style.borderBottom = '1.5px solid #c05a2a';
      });
      status.style.color = '#c05a2a';
      status.textContent = `please fill in: ${missing.join(', ')}`;
      return;
    }
    // Basic email-shape check so "required" actually means something
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailEl.style.borderBottom = '1.5px solid #c05a2a';
      status.style.color = '#c05a2a';
      status.textContent = 'please enter a valid email address';
      return;
    }

    const btn = document.getElementById('nf-send');
    const originalBtnText = btn.textContent;
    btn.disabled = true; btn.style.opacity = '0.6'; btn.style.cursor = 'default';
    btn.textContent = 'sending…';
    status.style.color = '#8a6a3a';
    status.textContent = 'sending your note…';

    if (FORMSPREE_ID === 'YOUR_FORM_ID') {
      // Fallback: open email client
      const sub  = encodeURIComponent((subject || 'note') + ' — from ' + name);
      const body = encodeURIComponent(
        `${msg}\n\n— ${name}\n${email}${linkedin ? '\n' + linkedin : ''}`
      );
      window.open(`mailto:susy.liu320@gmail.com?subject=${sub}&body=${body}`);
      status.style.color = '#7a5c2e';
      status.textContent = '✓ opening your email client — thanks, ' + name + '!';
      btn.textContent = 'sent ✓';
      return;
    }

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, subject, email, linkedin, message: msg }),
      });
      if (res.ok) {
        status.style.color = '#3a7a3a';
        status.style.fontWeight = 'bold';
        status.textContent = '✓ sent! thanks for reaching out, ' + name + ' 🌿';
        btn.textContent = 'sent ✓';
        btn.style.background = 'linear-gradient(135deg,#8fd18f,#5fae5f)';
        btn.style.color = '#1a3a1a';
        document.getElementById('nf-note-form').reset();
      } else {
        throw new Error('server error');
      }
    } catch {
      status.style.color = '#c05a2a';
      status.style.fontWeight = 'bold';
      status.textContent = 'something went wrong — try emailing susy.liu320@gmail.com directly';
      btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';
      btn.textContent = originalBtnText;
    }
  });
}

/* ---- Trophy Case / Framed Certificates ---- */
function renderTrophyCase() {
  modalBody.innerHTML = `
  <div class="trophy-case">
    <!-- Trophy shelf -->
    <div class="trophy-shelf">
      <div class="trophy-glow"></div>
      <div class="trophy-item">
        <div class="trophy-icon big">🏆</div>
        <div class="trophy-name">Mens et Manus</div>
      </div>
      <div class="trophy-item">
        <div class="trophy-icon">🥇</div>
        <div class="trophy-name">GenAI Lab Best Project</div>
      </div>
      <div class="trophy-item">
        <div class="trophy-icon sml">🎖️</div>
        <div class="trophy-name">Dean's List</div>
      </div>
      <div class="trophy-item">
        <div class="trophy-icon sml">⭐</div>
        <div class="trophy-name">Imagination in Action</div>
      </div>
    </div>
    <!-- Framed certificates -->
    <div class="cert-row">
      <div class="cert-frame">
        <div class="cert-seal">🦅</div>
        <div class="cert-line"></div>
        <div class="cert-title">Mens et Manus Award</div>
        <div class="cert-line"></div>
        <div class="cert-org">MIT · Highest Student Honor</div>
      </div>
      <div class="cert-frame">
        <div class="cert-seal">🤖</div>
        <div class="cert-line"></div>
        <div class="cert-title">Best Project — GenAI Lab</div>
        <div class="cert-line"></div>
        <div class="cert-org">MIT Sloan · Spring 2025</div>
      </div>
      <div class="cert-frame">
        <div class="cert-seal">🎓</div>
        <div class="cert-line"></div>
        <div class="cert-title">Dean's List</div>
        <div class="cert-line"></div>
        <div class="cert-org">Univ. of Chicago</div>
      </div>
      <div class="cert-frame">
        <div class="cert-seal">💡</div>
        <div class="cert-line"></div>
        <div class="cert-title">Imagination in Action</div>
        <div class="cert-line"></div>
        <div class="cert-org">MIT · Pitch Competition</div>
      </div>
      <div class="cert-frame">
        <div class="cert-seal">🚀</div>
        <div class="cert-line"></div>
        <div class="cert-title">Fuse Fellow</div>
        <div class="cert-line"></div>
        <div class="cert-org">MIT Entrepreneurship</div>
      </div>
      <div class="cert-frame">
        <div class="cert-seal">🌟</div>
        <div class="cert-line"></div>
        <div class="cert-title">deltaV Volunteer</div>
        <div class="cert-line"></div>
        <div class="cert-org">MIT · Summer Accelerator</div>
      </div>
    </div>
  </div>`;
}

/* ---- Browser / Projects ---- */
function _browserProjectsData() {
  // Content lives in content-projects.js — edit project text there
  return PROJECTS_DATA;
}

/* ── Project video embeds (DressingRoom + FoodGroups) ────────
   These iframes auto-play; "stopping" them means removing the iframe
   from the DOM entirely (caching its markup so it can be recreated on
   return). Just blanking src='about:blank' wasn't reliable for every
   embed — e.g. DressingRoom's Canva player can pop itself into the
   page's fullscreen element or native Picture-in-Picture, and changing
   the src of an iframe in either of those states doesn't stop playback.
   Fully removing the iframe (which destroys its browsing context and
   forces fullscreen/PiP to close) does. ── */
const PROJECT_VIDEO_PANEL_IDS = ['inner-dr-video', 'inner-fg-video'];

let _videoPausedLofi = false; // did we pause lofi specifically because a project video started?
let _videoPausedSpotify = false; // did we pause the Spotify embed specifically because a project video started?

function _stopProjectVideo(panel) {
  if (!panel) return;
  const iframe = panel.querySelector('iframe');
  if (!iframe) return; // already removed/stopped
  if (document.fullscreenElement === iframe) {
    try { document.exitFullscreen(); } catch (e) {}
  }
  // Stash the live iframe + a placeholder marking where it goes, then
  // remove it from the DOM — this unconditionally kills playback.
  const marker = document.createComment('project-video-placeholder');
  iframe.parentNode.insertBefore(marker, iframe);
  iframe.remove();
  panel._videoMarker = marker;
  panel._videoIframe = iframe;
  _onProjectVideoStop();
}

function _restoreProjectVideo(panel) {
  if (!panel) return;
  if (panel.querySelector('iframe')) { _onProjectVideoPlay(); return; } // never stopped
  const marker = panel._videoMarker;
  const iframe = panel._videoIframe;
  if (marker && iframe) {
    marker.parentNode.insertBefore(iframe, marker);
    marker.remove();
    panel._videoMarker = null;
    panel._videoIframe = null;
  }
  _onProjectVideoPlay();
}

/* Stop any project video that's currently active anywhere within root */
function _stopAllProjectVideos(root) {
  if (!root) return;
  PROJECT_VIDEO_PANEL_IDS.forEach(id => {
    const panel = root.querySelector('#' + id);
    if (panel) _stopProjectVideo(panel);
  });
}

/* A project video started playing → duck whichever background music is
   currently audible (lofi OR the Spotify embed) so the two don't overlap.
   Remember which one *we* paused so we know what to bring back when the
   video stops. */
function _onProjectVideoPlay() {
  if (_lofiAudio && !_lofiAudio.paused) {
    _videoPausedLofi = true;
    _fadeLofi(0, () => {
      if (_lofiAudio) _lofiAudio.pause();
      _syncMusicNotes();
    });
  }
  if (_spotifyPlaying && _spotifyCtrl) {
    _videoPausedSpotify = true;
    try { _spotifyCtrl.pause(); } catch (e) {}
    // playback_update listener will flip _spotifyPlaying + sync notes
  }
}

/* A project video stopped/paused → bring back whichever music we ducked,
   unless the user has manually silenced lofi via the iPod button. */
function _onProjectVideoStop() {
  if (_videoPausedSpotify) {
    _videoPausedSpotify = false;
    if (_spotifyCtrl) { try { _spotifyCtrl.resume(); } catch (e) {} }
  }
  if (!_videoPausedLofi) return;
  _videoPausedLofi = false;
  if (_lofiManuallyStopped) return;
  if (_lofiAudio && _lofiAudio.paused) {
    _lofiAudio.volume = 0;
    _lofiAudio.play().then(() => { _fadeLofi(LOFI_VOL); _syncMusicNotes(); }).catch(() => {});
  }
}

function _buildBrowserHTML(projects) {
  let tabsHtml = '', panelsHtml = '';
  projects.forEach((p, i) => {
    const spaceIdx = p.tab.indexOf(' ');
    const tabIcon  = spaceIdx > -1 ? p.tab.slice(0, spaceIdx) : p.tab;
    const tabLabel = spaceIdx > -1 ? p.tab.slice(spaceIdx) : '';
    tabsHtml += `<div class="browser-tab${i===0?' active':''}" data-tab="${p.id}"><span class="tab-icon">${tabIcon}</span><span class="tab-text">${tabLabel}</span></div>`;
    const tagsHtml = p.tags.length ? `<div class="project-tags">${p.tags.map(t=>`<span class="project-tag">${t}</span>`).join('')}</div>` : '';
    const backLink = p.id !== 'overview' ? `<a class="proj-back-link" href="javascript:void(0)">↩ all projects</a>` : '';
    const rule = p.id !== 'overview' ? `<div class="project-title-rule"></div>` : '';
    if (p.customContent) {
      panelsHtml += `<div class="project-panel${i===0?' active':''}" id="proj-${p.id}">
        ${backLink}
        <div class="project-title">${p.title}</div>
        ${tagsHtml}
        ${rule}
        ${p.desc ? `<div class="project-desc">${p.desc}</div>` : ''}
        ${p.customContent}
      </div>`;
    } else {
      panelsHtml += `<div class="project-panel${i===0?' active':''}" id="proj-${p.id}">
        ${backLink}
        <div class="project-title">${p.title}</div>
        ${tagsHtml}
        ${rule}
        <div class="project-desc">${p.desc}</div>
        <div class="project-demo">${p.demo}<div class="project-demo-label">${p.demoLabel}</div></div>
        ${p.link !== '#' ? `<a class="project-link" href="${p.link}" target="_blank">→ view project</a>` : ''}
      </div>`;
    }
  });
  return { tabsHtml, panelsHtml, firstId: projects[0].id };
}

function _wireBrowserTabs(root, projects) {
  // ── Tab history for back/forward ──
  let history = [projects[0].id];
  let histIdx  = 0;
  let skipHistory = false; // flag so navigating via back/fwd doesn't double-push

  function _switchTo(id, pushToHistory) {
    // Stop any project video playing in the panel we're leaving
    const leaving = root.querySelector('.project-panel.active');
    if (leaving && leaving.id !== 'proj-'+id) _stopAllProjectVideos(leaving);
    root.querySelectorAll('.browser-tab').forEach(t => t.classList.toggle('active', t.dataset.tab===id));
    root.querySelectorAll('.project-panel').forEach(p => p.classList.toggle('active', p.id==='proj-'+id));
    // Restore video in the panel we're entering, if its video tab is active
    const entering = root.querySelector('#proj-'+id);
    if (entering) {
      PROJECT_VIDEO_PANEL_IDS.forEach(vid => {
        const panel = entering.querySelector('#'+vid+'.active');
        if (panel) _restoreProjectVideo(panel);
      });
    }
    const urlEl = root.querySelector('#browser-url');
    if (urlEl) urlEl.textContent = `susyliu.com/projects/${id}`;
    const stEl = root.querySelector('#browser-status');
    if (stEl) stEl.textContent = `● susyliu.com/projects/${id} — secure connection`;
    if (pushToHistory) {
      history = history.slice(0, histIdx + 1); // clear forward stack
      history.push(id);
      histIdx = history.length - 1;
    }
    _updateNavBtns();
    // reset scroll to top on tab change
    const content = root.querySelector('#browser-content');
    if (content) content.scrollTop = 0;
  }

  function _updateNavBtns() {
    const btnBack    = root.querySelector('.browser-nav-back');
    const btnForward = root.querySelector('.browser-nav-fwd');
    if (btnBack)    btnBack.disabled    = histIdx <= 0;
    if (btnForward) btnForward.disabled = histIdx >= history.length - 1;
  }

  root.querySelectorAll('.browser-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      trackEvent(`project_tab_${tab.dataset.tab}`);
      _switchTo(tab.dataset.tab, true);
    });
  });

  // Nav buttons
  const btnBack    = root.querySelector('.browser-nav-back');
  const btnForward = root.querySelector('.browser-nav-fwd');
  const btnHome    = root.querySelector('.browser-nav-home');

  if (btnBack) btnBack.addEventListener('click', () => {
    if (histIdx > 0) { histIdx--; _switchTo(history[histIdx], false); }
  });
  if (btnForward) btnForward.addEventListener('click', () => {
    if (histIdx < history.length - 1) { histIdx++; _switchTo(history[histIdx], false); }
  });
  if (btnHome) btnHome.addEventListener('click', () => _switchTo('overview', true));

  _updateNavBtns();

  // Wire overview bucket links → switch to target tab
  root.querySelectorAll('.proj-bucket-link[data-goto]').forEach(link => {
    link.addEventListener('click', () => {
      const id = link.dataset.goto;
      trackEvent('project_overview_jump', { target: id });
      _switchTo(id, true);
    });
  });
  // Wire per-project back-to-overview links
  root.querySelectorAll('.proj-back-link').forEach(link => {
    link.addEventListener('click', () => _switchTo('overview', true));
  });
  // Wire inner sub-tabs (e.g. FoodGroups pitch/video/prompt)
  root.querySelectorAll('.proj-inner-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.inner;
      const panel = tab.closest('.project-panel');
      // Stop any video panel that's about to become inactive
      panel.querySelectorAll('.proj-inner-panel.active').forEach(p => {
        if (PROJECT_VIDEO_PANEL_IDS.includes(p.id)) _stopProjectVideo(p);
      });
      panel.querySelectorAll('.proj-inner-tab').forEach(t => t.classList.toggle('active', t.dataset.inner===id));
      panel.querySelectorAll('.proj-inner-panel').forEach(p => p.classList.toggle('active', p.id==='inner-'+id));
      // Restore video if we just switched into a video tab
      const newPanel = panel.querySelector('#inner-'+id);
      if (newPanel && PROJECT_VIDEO_PANEL_IDS.includes(newPanel.id)) _restoreProjectVideo(newPanel);
    });
  });
}

function _wireCustomScrollbar(root) {
  const content  = root.querySelector('#browser-content');
  const thumb    = root.querySelector('.bs-thumb');
  const track    = root.querySelector('.bs-track');
  const btnUp    = root.querySelector('.bs-btn-up');
  const btnDown  = root.querySelector('.bs-btn-down');
  if (!content || !thumb || !track) return;

  function updateThumb() {
    const { scrollTop, scrollHeight, clientHeight } = content;
    const trackH  = track.clientHeight;
    const ratio   = clientHeight / scrollHeight;
    const thumbH  = Math.max(24, trackH * ratio);
    const maxScroll = scrollHeight - clientHeight;
    const pos = maxScroll > 0 ? (scrollTop / maxScroll) * (trackH - thumbH) : 0;
    thumb.style.height = thumbH + 'px';
    thumb.style.top    = pos + 'px';
    // hide thumb when no overflow
    thumb.style.display = scrollHeight <= clientHeight ? 'none' : 'block';
  }

  content.addEventListener('scroll', updateThumb);
  // Update on tab switch (content changes height)
  root.querySelectorAll('.browser-tab').forEach(t =>
    t.addEventListener('click', () => setTimeout(updateThumb, 50))
  );
  // Initial
  setTimeout(updateThumb, 50);

  // Drag thumb
  let dragging = false, dragStartY = 0, dragStartScroll = 0;
  thumb.addEventListener('mousedown', e => {
    dragging = true;
    dragStartY = e.clientY;
    dragStartScroll = content.scrollTop;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const trackH   = track.clientHeight;
    const thumbH   = thumb.offsetHeight;
    const maxThumb = trackH - thumbH;
    const maxScroll = content.scrollHeight - content.clientHeight;
    const dy   = e.clientY - dragStartY;
    const ratio = maxThumb > 0 ? dy / maxThumb : 0;
    content.scrollTop = dragStartScroll + ratio * maxScroll;
  });
  document.addEventListener('mouseup', () => { dragging = false; });

  // Click track to page-scroll
  track.addEventListener('click', e => {
    if (e.target === thumb) return;
    const rect = track.getBoundingClientRect();
    const clickPos = (e.clientY - rect.top) / rect.height;
    content.scrollTop = clickPos * (content.scrollHeight - content.clientHeight);
  });

  // Arrow buttons
  btnUp.addEventListener('click',   () => { content.scrollTop -= 40; });
  btnDown.addEventListener('click', () => { content.scrollTop += 40; });
}

function renderBrowserInMonitor() {
  const projects = _browserProjectsData();
  const { tabsHtml, panelsHtml, firstId } = _buildBrowserHTML(projects);
  const screen = document.getElementById('monitor-screen-content');
  screen.innerHTML = `
    <div class="browser-chrome">
      <div class="browser-bar">
        <div class="browser-nav-btns">
          <button class="browser-nav-btn browser-nav-back"    title="Back"    disabled>&#x25C4;</button>
          <button class="browser-nav-btn browser-nav-fwd"     title="Forward" disabled>&#x25BA;</button>
          <button class="browser-nav-btn browser-nav-home"    title="Home">&#x2302;</button>
        </div>
        <div class="browser-url-wrap">
          <div class="browser-url" id="browser-url">susyliu.com/projects/${firstId}</div>
        </div>
        <div class="browser-win-btns">
          <button class="browser-win-btn" title="Minimise">&#x2013;</button>
          <button class="browser-win-btn" title="Maximise">&#x25A1;</button>
          <button class="browser-win-btn browser-win-btn-close" title="Close">&#x2715;</button>
        </div>
      </div>
      <div class="browser-tabs">${tabsHtml}</div>
    </div>
    <div class="browser-scroll-row">
      <div class="browser-content" id="browser-content">${panelsHtml}</div>
      <div class="browser-scrollbar">
        <button class="bs-btn bs-btn-up" aria-label="scroll up">▲</button>
        <div class="bs-track"><div class="bs-thumb"></div></div>
        <button class="bs-btn bs-btn-down" aria-label="scroll down">▼</button>
      </div>
    </div>
    <div class="browser-status" id="browser-status">● susyliu.com — secure connection</div>`;
  _wireBrowserTabs(screen, projects);
  _wireCustomScrollbar(screen);
  const closeBtn = screen.querySelector('.browser-win-btn-close');
  if (closeBtn) closeBtn.addEventListener('click', () => closeMonitorZoom());
}

function renderBrowser() {
  // Falls back to modal if someone calls it directly
  const projects = _browserProjectsData();
  const { tabsHtml, panelsHtml, firstId } = _buildBrowserHTML(projects);
  modalBody.innerHTML = `
  <div class="browser-chrome">
    <div class="browser-bar">
      <div class="browser-dots">
        <div class="browser-dot red"></div><div class="browser-dot yellow"></div><div class="browser-dot green"></div>
      </div>
      <div class="browser-url" id="browser-url">susyliu.com/projects/${firstId}</div>
    </div>
    <div class="browser-tabs">${tabsHtml}</div>
  </div>
  <div class="browser-content" id="browser-content">${panelsHtml}</div>
  <div class="browser-status" id="browser-status">● susyliu.com — secure connection</div>`;
  _wireBrowserTabs(modalBody, projects);
}

/* ---- Hobbies Sports Bag ---- */
function renderHobbiesBag() {
  const items = [
    { icon:'🏐', name:'volleyball', desc:'IM team · two seasons · built a whole community' },
    { icon:'⚽', name:'soccer', desc:'midfielder · IM co-captain' },
    { icon:'🏓', name:'ping pong', desc:'regular at the tables · it gets competitive' },
    { icon:'👟', name:'dance shoes', desc:'salsa · bachata · hip hop · Chinese classical' },
    { icon:'🏃', name:'running', desc:'clears my head · usually solo' },
  ];

  modalBody.innerHTML = `
  <div class="bag-scene">
    <div class="sports-bag">
      <div class="bag-handle"></div>
      <div class="bag-label">susy's kit bag</div>
    </div>
    <div class="bag-items">
      ${items.map(item => `
      <div class="bag-item">
        <div class="bag-item-icon">${item.icon}</div>
        <div class="bag-item-name">${item.name}</div>
        <div class="bag-item-desc">${item.desc}</div>
      </div>`).join('')}
    </div>
    <p class="hobbies-note">Movement is how I connect with people.<br>Activities first, friendship second — that's always been the formula.</p>
  </div>`;
}

/* ============================================================
   TIME OF DAY
============================================================ */
// imgFilter  → applied to #room-image  (saturation / brightness / warmth)
// ambient    → full-room color cast overlay
// window     → glow FROM the window — cool at night (moonlight), warm by day
// cubeOpacity / cubeBg → lamp light
const TIME_CONFIGS = [
  {
    hours:[0,1,2,3,4], label:'late night',
    imgFilter:  'saturate(1.1) brightness(0.52) hue-rotate(185deg)',  // shift warm→deep blue
    ambient:    'rgba(15,8,95,0.72)',                    // saturated indigo blanket
    ambient2:   'rgba(80,20,140,0.22)',                  // purple screen layer
    window:     'rgba(255,110,200,0.42)',                // pink/magenta moonlight glow
    moonlight:  true,
    sky:        'night',
    cubeOpacity:0.60, cubeBg:'radial-gradient(circle,rgba(255,200,80,0.48) 0%,transparent 70%)',
  },
  {
    hours:[5,6], label:'pre-dawn',
    imgFilter:  'saturate(0.95) brightness(0.62) hue-rotate(160deg)',
    ambient:    'rgba(55,15,100,0.55)',                  // violet pre-dawn
    ambient2:   'rgba(20,30,120,0.20)',
    window:     'rgba(210,140,255,0.28)',                // soft lavender sky waking
    moonlight:  true,
    sky:        'cloudy',
    cubeOpacity:0.30, cubeBg:'radial-gradient(circle,rgba(255,195,75,0.28) 0%,transparent 70%)',
  },
  {
    hours:[7,8,9], label:'morning',
    imgFilter:  'saturate(0.90) brightness(0.96)',
    ambient:    'rgba(220,185,140,0.07)',                // faint warm cream wash
    ambient2:   null,
    window:     'rgba(255,235,200,0.26)',                // soft warm morning light
    moonlight:  false,
    sky:        'clear',
    cubeOpacity:0, cubeBg:'',
  },
  {
    hours:[10,11,12,13,14], label:'afternoon',
    imgFilter:  'saturate(1.0) brightness(1.0)',         // reference — no filter
    ambient:    'rgba(0,0,0,0)',
    ambient2:   null,
    window:     'rgba(255,255,240,0.08)',                // subtle bright daylight
    moonlight:  false,
    sky:        'clear',
    cubeOpacity:0, cubeBg:'',
  },
  {
    hours:[15,16], label:'late afternoon',
    imgFilter:  'saturate(1.05) brightness(1.01)',
    ambient:    'rgba(230,155,55,0.06)',                 // faint warm amber tint
    ambient2:   null,
    window:     'rgba(255,210,130,0.20)',
    moonlight:  false,
    sky:        'clear',
    cubeOpacity:0, cubeBg:'',
  },
  {
    hours:[17,18], label:'golden hour',
    imgFilter:  'saturate(1.18) brightness(1.03)',       // punchy warm saturation
    ambient:    'rgba(210,100,18,0.18)',                 // amber-orange wash
    ambient2:   null,
    window:     'rgba(255,145,35,0.40)',                 // deep golden beam
    moonlight:  false,
    sky:        'sunset',
    cubeOpacity:0.05, cubeBg:'radial-gradient(circle,rgba(255,190,70,0.10) 0%,transparent 70%)',
  },
  {
    hours:[19,20], label:'dusk',
    imgFilter:  'saturate(1.05) brightness(0.72) hue-rotate(140deg)',
    ambient:    'rgba(70,20,120,0.50)',                  // rich purple dusk
    ambient2:   'rgba(20,8,80,0.20)',
    window:     'rgba(220,90,255,0.38)',                 // violet/pink twilight
    moonlight:  false,
    sky:        'overcast',
    cubeOpacity:0.32, cubeBg:'radial-gradient(circle,rgba(255,190,70,0.26) 0%,transparent 70%)',
  },
  {
    hours:[21,22,23], label:'night',
    imgFilter:  'saturate(1.15) brightness(0.55) hue-rotate(190deg)', // warm→cobalt blue
    ambient:    'rgba(12,6,90,0.75)',                    // deep cobalt night
    ambient2:   'rgba(90,20,150,0.20)',                  // purple screen lift
    window:     'rgba(255,100,195,0.45)',                // pink/magenta moon glow
    moonlight:  true,
    sky:        'night',
    cubeOpacity:0.55, cubeBg:'radial-gradient(circle,rgba(255,200,80,0.45) 0%,transparent 70%)',
  },
];
/* ---- World Map (Leaflet) ---- */
let _wmMap = null;

function renderWorldMap() {
  const PINS = [
    { lat:39.9,  lon:116.4,  label:'Beijing',    desc:'<strong>Beijing</strong><br>Gap year startup — my first taste of 0-to-1 building in edtech.' },
    { lat:42.36, lon:-71.06, label:'Boston',      desc:'<strong>Boston</strong><br>Where I\'m based now. MIT Sloan, startups, community building.' },
    { lat:42.2,  lon:-72.6,  label:'W. Mass',     desc:'<strong>Western Mass</strong><br>Where I grew up. The roots.' },
    { lat:41.85, lon:-87.63, label:'Chicago',     desc:'<strong>Chicago</strong><br>UChicago undergrad. South Side. Fell in love with community-building here.' },
    { lat:26.1,  lon:119.3,  label:'Fujian',      desc:'<strong>Fujian</strong><br>My dad\'s hometown. Where I learned Gongfu tea and felt most connected to my roots.' },
    { lat:48.85, lon:2.35,   label:'Paris',        desc:'<strong>Paris</strong><br>Part of my gap year traveling through Europe. First time navigating the world independently.' },
    { lat:40.71, lon:-74.01, label:'New York',     desc:'<strong>New York City</strong><br>Semester away program in high school, and a city I kept coming back to for work. Always energizing.' },
    { lat:-13.5, lon:-71.98, label:'Peru',         desc:'<strong>Andes Mountains, Peru</strong><br>3-day hike through the mountains. Beautiful, challenging, and one of those trips that puts life in perspective.' },
    { lat:64.96, lon:-19.02, label:'Iceland',      desc:'<strong>Iceland</strong><br>One of my favorite places I\'ve ever visited. The landscape is unlike anywhere else in the world.' },
    { lat:44.47, lon:-70.85, label:'Maine',        desc:'<strong>Sunday River, Maine</strong><br>Yearly Christmas ski trips with family friends. One of those traditions that grounds you.' },
    { lat:37.77, lon:-122.42, label:'San Francisco', desc:'<strong>San Francisco</strong><br>Spending the summer here — soaking it all in.' },
  ];

  modalBody.innerHTML = `
    <div class="wm-wrap">
      <div class="wm-title">✦ places that shaped me</div>
      <div id="wm-leaflet"></div>
      <p class="wm-footnote">hover a pin to learn more</p>
    </div>`;

  // Destroy previous instance if modal was reopened
  if (_wmMap) { _wmMap.remove(); _wmMap = null; }

  // Init map after DOM is painted
  requestAnimationFrame(() => {
    const isMob = window.innerWidth <= 600;
    _wmMap = L.map('wm-leaflet', {
      center: isMob ? [20, 0] : [30, 10],
      zoom: isMob ? 1 : 2,
      zoomControl: true,
      attributionControl: false,
      scrollWheelZoom: true,
    });
    _wmMap.zoomControl.setPosition('bottomright');

    // CartoDB Positron — clean, muted, no API key needed
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(_wmMap);

    // Custom terracotta pin icon
    const pinIcon = L.divIcon({
      className: '',
      html: '<div class="wm-marker-pin"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
      popupAnchor: [0, -10],
    });

    PINS.forEach(p => {
      const marker = L.marker([p.lat, p.lon], { icon: pinIcon })
        .addTo(_wmMap)
        .bindPopup(p.desc, { maxWidth: 220, closeButton: false, autoPan: true, autoPanPadding: [40, 40] });
      marker.on('mouseover', function() { this.openPopup(); });
      marker.on('mouseout',  function() { this.closePopup(); });
    });
    // After CSS has settled (especially on mobile where height may change),
    // force Leaflet to recalculate its container size
    setTimeout(() => { if (_wmMap) _wmMap.invalidateSize(); }, 120);
  });
}

// Test overrides — var so they hoist and are visible inside getTimeCfg/applyLighting
var _testOverrideHours = null; // set by test panel; null = real clock
var _testSkyOverride   = null; // set by test panel; null = auto from time config
var _syncedSky         = null; // set by real-weather sync; lower priority than test panel

// Geolocation + a weather API round-trip is slow (often 1-3s) — long enough
// that the landing page sits on a neutral placeholder noticeably before the
// real sky appears. Cache the last resolved sky/weather in localStorage and
// reuse it instantly on the next load (weather rarely flips dramatically
// minute-to-minute), then silently re-sync in the background to correct it
// if it has actually changed. This makes "recognition" feel near-instant on
// repeat visits while staying accurate.
function _loadCachedSky() {
  try {
    const c = JSON.parse(localStorage.getItem('landing-sky-cache') || 'null');
    if (!c || !c.sky) return null;
    if ((Date.now() - c.t) >= 30 * 60 * 1000) return null; // 30 min max freshness
    // Discard immediately if the time phase has changed since the cache was written
    // (e.g. cached during golden hour, now it's night — don't show sunset sky at 9pm)
    const currentPhase = TIME_CONFIGS.find(cfg => cfg.hours.includes(new Date().getHours()));
    if (currentPhase && c.phase && c.phase !== currentPhase.label) return null;
    return c;
  } catch(e) {}
  return null;
}
function _saveCachedSky(sky, label) {
  const phase = TIME_CONFIGS.find(cfg => cfg.hours.includes(new Date().getHours()));
  try { localStorage.setItem('landing-sky-cache', JSON.stringify({ sky, label, phase: phase ? phase.label : null, t: Date.now() })); } catch(e) {}
}
// Note: only primes _syncedSky here (declared above). _syncedWeatherLabel is
// declared with `let` further down (TIME BADGE section) — assigning it before
// that declaration executes would throw (temporal dead zone), so the cached
// weather *label* is applied separately, later, right where that var exists
// (see _syncedWeatherLabel priming near its declaration).
var _cachedSkyEntry = _loadCachedSky();
if (_cachedSkyEntry) { _syncedSky = _cachedSkyEntry.sky; }
function getTimeCfg() {
  const h = (_testOverrideHours !== null) ? _testOverrideHours : new Date().getHours();
  return TIME_CONFIGS.find(c=>c.hours.includes(h)) || TIME_CONFIGS[3];
}
function applyLighting() {
  const cfg = getTimeCfg();

  // Room image filter — controls saturation, brightness, warmth
  document.getElementById('room-image').style.filter = cfg.imgFilter || '';

  // Full-room ambient color cast
  document.getElementById('ov-ambient').style.background = cfg.ambient;

  // Secondary cool blue/purple layer for night depth
  const amb2 = document.getElementById('ov-ambient2');
  amb2.style.background = cfg.ambient2 || 'rgba(0,0,0,0)';
  amb2.style.opacity     = cfg.ambient2 ? '1' : '0';

  // Window glow — moonlight is a cool lighter spill; daylight is warm beam from top
  const winEl = document.getElementById('ov-window');
  if (cfg.moonlight) {
    winEl.style.background = `radial-gradient(ellipse at 48% 20%, ${cfg.window} 0%, rgba(140,175,255,0.06) 55%, transparent 85%)`;
    winEl.style.mixBlendMode = 'screen';
  } else {
    winEl.style.background = `radial-gradient(ellipse at 50% 0%, ${cfg.window} 0%, transparent 80%)`;
    winEl.style.mixBlendMode = 'normal';
  }

  // Sky: test panel > real-weather sync > time-of-day default
  if (_testSkyOverride === null && _testOverrideHours === null) {
    const skyToUse = _syncedSky || cfg.sky;
    applySky(skyToUse);
    updateSkyAnims(skyToUse);
  }

  // Tree image tint reacts to time-of-day lighting
  const treeImg = document.getElementById('tree-img');
  if (treeImg) {
    if (cfg.moonlight) {
      treeImg.style.filter = 'saturate(0.35) brightness(0.5) hue-rotate(20deg)';
    } else if (cfg.label === 'golden hour') {
      treeImg.style.filter = 'saturate(1.25) brightness(0.92) sepia(0.28)';
    } else if (cfg.label === 'dusk') {
      treeImg.style.filter = 'saturate(0.65) brightness(0.72) hue-rotate(12deg)';
    } else if (cfg.label === 'morning') {
      treeImg.style.filter = 'saturate(0.85) brightness(0.92)';
    } else {
      treeImg.style.filter = 'saturate(1.0) brightness(1.0)';
    }
  }

  // Lamp overlays — only update if lamp toggle is off (don't override manual state)
  if (!lampOn) { setLampOverlays(false); }

  _updateTimeBadge(cfg.label);

}

// Extract sky image swap into its own function so test panel can call it independently
function applySky(skyName) {
  const skyImg = document.getElementById('sky-img');
  if (!skyImg || !skyName) return;

  const cfg = getTimeCfg();
  const isDaytime = !cfg.moonlight && cfg.label !== 'dusk';
  const isOvercast = (skyName === 'overcast' || skyName === 'cloudy');

  // Brighten the dark overcast/cloudy image so it reads as daytime
  if (isOvercast && isDaytime) {
    skyImg.style.filter = skyName === 'overcast'
      ? 'brightness(2.4) saturate(0.55)'
      : 'brightness(1.5) saturate(0.75)';
  } else {
    skyImg.style.filter = '';
  }

  // Toggle body class so room overlays flatten highlights/shadows
  document.body.classList.toggle('sky-overcast-day', isOvercast && isDaytime);

  // Pan the sky image for cloudy/overcast so clouds visibly drift
  skyImg.classList.toggle('sky-drifting', isOvercast);

  const nextSrc = `assets/images/sky/${skyName}.webp`;
  const curSrc  = skyImg.getAttribute('src') || '';
  if (!curSrc.endsWith(`${skyName}.webp`)) {
    skyImg.style.opacity = '0';
    setTimeout(() => {
      skyImg.src = nextSrc;
      skyImg.onload  = () => { skyImg.style.opacity = '1'; };
      skyImg.onerror = () => { skyImg.style.opacity = '0'; };
    }, curSrc ? 350 : 0);
  } else if (parseFloat(skyImg.style.opacity) < 1) {
    skyImg.style.opacity = '1';
  }
}

/* ============================================================
   SKY ANIMATIONS — clouds (clear/sunset/overcast) + stars (night)
============================================================ */
let _currentSkyAnim = null;

function updateSkyAnims(skyName) {
  const hasPrecip = (currentWeather === 'rain' || currentWeather === 'snow' || currentWeather === 'storm');
  const effectiveSky = (skyName === 'night' && hasPrecip) ? 'overcast' : skyName;

  if (_currentSkyAnim === effectiveSky) return;
  _currentSkyAnim = effectiveSky;

  // Stars go in #sky-anim (behind trees, z-index 0) — only animation layer we still need
  const skyEl = document.getElementById('sky-anim');
  if (skyEl) skyEl.innerHTML = '';
  if (effectiveSky === 'night') _spawnStars(skyEl);
  // Cloud visuals are handled entirely by the sky image + sky-img drift animation
}

// Lazily builds or returns the #window-weather element,
// ensuring ov-rain/fog/wind/snow exist inside it.
function _getWeatherLayer() {
  let wx = document.getElementById('window-weather');
  if (!wx) return document.createElement('div'); // fallback
  // Inject weather overlay divs on first use
  if (!document.getElementById('ov-rain')) {
    const rain = document.createElement('div');
    rain.id = 'ov-rain'; rain.className = 'overlay';
    wx.appendChild(rain);
    const fog  = document.createElement('div'); fog.id  = 'ov-fog';  wx.appendChild(fog);
    const wind = document.createElement('div'); wind.id = 'ov-wind'; wx.appendChild(wind);
    const snow = document.createElement('div'); snow.id = 'ov-snow'; wx.appendChild(snow);
  }
  return wx;
}

function _spawnStars(container) {
  for (let i = 0; i < 38; i++) {
    const s  = document.createElement('div');
    s.className = 'sky-star';
    const sz     = 1 + Math.random() * 2.2;
    const dim    = 0.04 + Math.random() * 0.14;
    const bright = 0.45 + Math.random() * 0.55;
    const dur    = 1.8 + Math.random() * 5.5;
    s.style.cssText = `
      width:${sz}px; height:${sz}px;
      left:${Math.random() * 100}%;
      top:${Math.random() * 82}%;
      --sd:${dim.toFixed(2)}; --sb:${bright.toFixed(2)};
      animation-duration:${dur.toFixed(1)}s;
      animation-delay:-${(Math.random() * dur).toFixed(1)}s;
    `;
    container.appendChild(s);
  }
}

/* ============================================================
   LEAF RUSTLE — periodic burst from tree, every ~60 seconds
============================================================ */
let _rustleTimer = null;

function _scheduleRustle() {
  clearTimeout(_rustleTimer);
  _rustleTimer = setTimeout(_doRustle, 45000 + Math.random() * 30000); // 45–75s
}

function _doRustle() {
  // Gentle branch sway — pure rotation from base, no translateX, no opacity change
  const treeImg = document.getElementById('tree-img');
  if (treeImg) {
    treeImg.animate([
      { transform:'rotate(0deg)'     },
      { transform:'rotate(0.22deg)'  },
      { transform:'rotate(-0.28deg)' },
      { transform:'rotate(0.18deg)'  },
      { transform:'rotate(-0.14deg)' },
      { transform:'rotate(0.08deg)'  },
      { transform:'rotate(0deg)'     },
    ], { duration:2800, easing:'ease-in-out', fill:'none' });
  }
  _scheduleRustle();
}

/* ============================================================
   WEATHER SYSTEM
============================================================ */
const WEATHERS = ['clear','rain','fog','wind','snow','storm'];
let currentWeather = 'clear';
// Bootstrap: inject overlay divs into #window-weather immediately
window.addEventListener('DOMContentLoaded', () => _getWeatherLayer(), { once: true });

function setWeather(name) {
  currentWeather = name;
  WEATHERS.forEach(w => document.body.classList.remove('weather-' + w));
  if (name !== 'clear') document.body.classList.add('weather-' + name);

  // Ensure weather overlay divs exist inside #window-weather
  _getWeatherLayer();

  // Re-evaluate sky animations (precipitation may hide stars)
  _currentSkyAnim = null;
  updateSkyAnims(_testSkyOverride || getTimeCfg().sky);

  // Rain — canvas drops
  const rainEl = document.getElementById('ov-rain');
  if (rainEl) {
    const isRain = (name === 'rain' || name === 'storm');
    rainEl.style.opacity = isRain ? '1' : '0';
    if (isRain && !_rainRaf) startRainCanvas(rainEl);
    else if (!isRain) stopRainCanvas();
  }

  // Fog
  const fogEl = document.getElementById('ov-fog');
  if (fogEl) fogEl.style.opacity = name === 'fog' ? '1' : '0';

  // Wind — canvas curly-q lines
  const windEl = document.getElementById('ov-wind');
  if (windEl) {
    const isWind = (name === 'wind' || name === 'storm');
    windEl.style.opacity = isWind ? '1' : '0';
    if (isWind && !_windRaf) startWindCanvas(windEl);
    else if (!isWind) stopWindCanvas();
  }

  // Snow — canvas flakes
  const snowEl = document.getElementById('ov-snow');
  if (snowEl) {
    const isSnow = (name === 'snow');
    snowEl.style.opacity = isSnow ? '1' : '0';
    if (isSnow && !snowEl.querySelector('canvas')) spawnSnow(snowEl);
    else if (!isSnow && snowEl._stopSnow) { snowEl._stopSnow(); snowEl._stopSnow = null; }
  }

  // Curtain flutter reacts to wind
  const curtain = document.getElementById('curtain-flutter');
  if (curtain) curtain.style.animationDuration = (name === 'wind' || name === 'storm') ? '2.5s' : '7s';
}

/* ============================================================
   SNOW CANVAS — dense small flakes
============================================================ */
function spawnSnow(container) {
  // canvas-based snow for density + no DOM bloat
  let cv = container.querySelector('canvas');
  if (!cv) { cv = document.createElement('canvas'); container.appendChild(cv); }
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  window.addEventListener('resize', () => { cv.width = window.innerWidth; cv.height = window.innerHeight; });
  const ctx = cv.getContext('2d');

  const flakes = Array.from({length: 130}, () => mkFlake(cv, true));
  function mkFlake(cv, rand) {
    return {
      x:    Math.random() * cv.width,
      y:    rand ? Math.random() * cv.height : -8,
      r:    1.5 + Math.random() * 4,        // 1.5–5.5px — visible but not huge
      vy:   1.2 + Math.random() * 2.2,
      vx:   (Math.random() - 0.5) * 0.6,
      alpha:0.55 + Math.random() * 0.45,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
    };
  }

  let snowRaf;
  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    flakes.forEach(f => {
      f.wobble += f.wobbleSpeed;
      f.x += f.vx + Math.sin(f.wobble) * 0.4;
      f.y += f.vy;
      if (f.y > cv.height + 8) Object.assign(f, mkFlake(cv, false));

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,242,255,${f.alpha})`;
      ctx.fill();
    });
    snowRaf = requestAnimationFrame(draw);
  }
  draw();
  container._stopSnow = () => { cancelAnimationFrame(snowRaf); cv.remove(); };
}

/* ============================================================
   RAIN CANVAS — randomised drizzle/shower drops
============================================================ */
let _rainRaf = null;
function startRainCanvas(container) {
  let cv = container.querySelector('canvas');
  if (!cv) { cv = document.createElement('canvas'); container.appendChild(cv); }
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  window.addEventListener('resize', () => { cv.width = window.innerWidth; cv.height = window.innerHeight; });
  const ctx = cv.getContext('2d');

  const drops = Array.from({length: 200}, () => mkDrop(cv, true));
  function mkDrop(cv, rand) {
    const speed = 7 + Math.random() * 9;
    return {
      x:     Math.random() * cv.width,
      y:     rand ? Math.random() * cv.height : -35,
      len:   14 + Math.random() * 22,    // heavier drops
      vy:    speed,
      vx:    speed * (0.09 + Math.random() * 0.13),
      alpha: 0.45 + Math.random() * 0.45,
      width: 1.2 + Math.random() * 1.6,  // thicker strokes
    };
  }

  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    drops.forEach(d => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.vx * (d.len / d.vy), d.y + d.len);
      ctx.strokeStyle = `rgba(190,220,255,${d.alpha})`;
      ctx.lineWidth = d.width;
      ctx.lineCap  = 'round';
      ctx.stroke();
      d.x += d.vx; d.y += d.vy;
      if (d.y > cv.height + d.len) Object.assign(d, mkDrop(cv, false));
    });
    _rainRaf = requestAnimationFrame(draw);
  }
  draw();
}
function stopRainCanvas() { cancelAnimationFrame(_rainRaf); _rainRaf = null; }

/* ============================================================
   WIND CANVAS — calligraphic S-curve gusts drawn left→right
============================================================ */
let _windRaf = null;
function startWindCanvas(container) {
  let cv = container.querySelector('canvas');
  if (!cv) { cv = document.createElement('canvas'); container.appendChild(cv); }
  cv.width = window.innerWidth; cv.height = window.innerHeight;
  window.addEventListener('resize', () => { cv.width = window.innerWidth; cv.height = window.innerHeight; });
  const ctx = cv.getContext('2d');

  // Pre-sample a cubic bezier into N points
  function sampleBezier(p0, p1, p2, p3, n) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, mt = 1 - t;
      pts.push({
        x: mt*mt*mt*p0.x + 3*mt*mt*t*p1.x + 3*mt*t*t*p2.x + t*t*t*p3.x,
        y: mt*mt*mt*p0.y + 3*mt*mt*t*p1.y + 3*mt*t*t*p2.y + t*t*t*p3.y,
      });
    }
    return pts;
  }

  function mkGust(cv) {
    const y0   = cv.height * (0.1 + Math.random() * 0.8);
    const span = cv.width  * (0.35 + Math.random() * 0.55); // how wide the gust is
    const amp  = 30 + Math.random() * 80;   // S-curve amplitude
    const flip = Math.random() < 0.5 ? 1 : -1; // mirror S

    // S-curve: starts left, dips, rises, ends with curl upward
    const p0 = { x: -span * 0.08,  y: y0 };
    const p1 = { x: span * 0.30,   y: y0 + flip * amp };
    const p2 = { x: span * 0.68,   y: y0 - flip * amp * 0.65 };
    const p3 = { x: span,           y: y0 - flip * amp * 0.35 };

    const SEGS = 60;
    const pts = sampleBezier(p0, p1, p2, p3, SEGS);

    // Compute cumulative arc length
    const lens = [0];
    for (let i = 1; i <= SEGS; i++) {
      const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
      lens.push(lens[i-1] + Math.sqrt(dx*dx + dy*dy));
    }
    const total = lens[SEGS];

    return {
      pts, lens, total, SEGS,
      ox: -(span * 0.08 + 20),   // starting x offset on screen
      drawProgress: 0,            // 0→1: how much of the stroke is drawn
      screenX: -(span * 0.2 + Math.random() * cv.width * 0.3), // starts off-left
      y0,
      speed:      1.8 + Math.random() * 2.8,    // how fast the whole gust moves right
      drawSpeed:  0.022 + Math.random() * 0.025, // how fast the stroke is revealed
      maxWidth:   1.8 + Math.random() * 2.8,
      alpha:      0.22 + Math.random() * 0.28,
      span,
    };
  }

  const gusts = Array.from({length: 6}, () => {
    const g = mkGust(cv);
    g.screenX = Math.random() * cv.width; // scatter initial positions
    g.drawProgress = Math.random();
    return g;
  });

  function drawGust(g) {
    const drawLen = g.total * g.drawProgress; // arc length to reveal
    // Find how many segments to draw
    let endSeg = 0;
    while (endSeg < g.SEGS && g.lens[endSeg + 1] <= drawLen) endSeg++;
    if (endSeg < 1) return;

    // Draw segment by segment with variable width (taper at ends)
    for (let i = 0; i < endSeg; i++) {
      const tNorm = i / g.SEGS; // 0→1 along curve
      // Bell-curve width: thin at start and end, thick ~30–60%
      const bell = Math.sin(tNorm * Math.PI) * Math.sin(tNorm * Math.PI);
      const lw = 0.4 + bell * g.maxWidth;
      const alpha = g.alpha * (0.3 + bell * 0.7);

      ctx.beginPath();
      ctx.moveTo(g.screenX + g.pts[i].x,   g.y0 + (g.pts[i].y - g.y0));
      ctx.lineTo(g.screenX + g.pts[i+1].x, g.y0 + (g.pts[i+1].y - g.y0));
      ctx.strokeStyle = `rgba(200,220,255,${alpha})`;
      ctx.lineWidth   = lw;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.stroke();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    gusts.forEach((g, idx) => {
      // Advance drawing progress and screen position together
      g.drawProgress = Math.min(1, g.drawProgress + g.drawSpeed);
      g.screenX += g.speed;

      drawGust(g);

      // Reset when fully off-screen to the right
      if (g.screenX > cv.width + g.span * 0.2) {
        gusts[idx] = mkGust(cv);
      }
    });
    _windRaf = requestAnimationFrame(draw);
  }
  draw();
}
function stopWindCanvas() { cancelAnimationFrame(_windRaf); _windRaf = null; }

/* ============================================================
   LANDING LIGHTING  — applies TIME_CONFIGS to landing-specific elements
============================================================ */

function applyLandingLighting() {
  const cfg = getTimeCfg();
  const isDaytime = !cfg.moonlight && cfg.label !== 'dusk';
  // Match the room's sky resolution: test override > real-weather sync > time-of-day default
  const sky = _testSkyOverride || _syncedSky || cfg.sky;

  const entryEl = document.getElementById('entry');

  // Until the real-weather sync resolves, we don't actually know which sky
  // image is correct — loading the time-of-day default first (often
  // "overcast") just means showing the wrong one and then jarringly swapping
  // it a moment later. Instead, hold on a calm, neutral placeholder with no
  // sky image at all, and only commit to a sky image once we know which one
  // is real. (applyLandingLighting() re-runs once sync completes.)
  const stillResolving = (_testSkyOverride === null && _syncedSky === null);

  // Always keep the entry background on the medium-weight blue placeholder
  // defined in CSS (#3d6e96) — it reads naturally whether the scene resolves
  // to a day or night sky, so we no longer swap in per-time-of-day solid
  // colours here (golden hour's orange/dusk's purple etc. used to flash
  // before the sky image faded in). The sky image + ambient overlays carry
  // the actual time-of-day colour once they load.
  if (entryEl) entryEl.style.background = '';

  // Sky image (same brightness/filter logic as room's applySky)
  const skyImg = document.getElementById('land-sky');
  if (skyImg) {
    if (stillResolving) {
      skyImg.style.opacity = '0';
    } else {
      const isOvercast = sky === 'overcast' || sky === 'cloudy';
      skyImg.style.filter = (isOvercast && isDaytime)
        ? (sky === 'overcast' ? 'brightness(2.4) saturate(0.55)' : 'brightness(1.5) saturate(0.75)')
        : '';
      skyImg.classList.toggle('sky-drifting', isOvercast);
      const nextSrc = `assets/images/landing/${sky}.webp`;
      if (!skyImg.src.endsWith(`${sky}.webp`)) {
        skyImg.style.opacity = '0';
        setTimeout(() => {
          skyImg.src = nextSrc;
          skyImg.onload = () => { skyImg.style.opacity = '1'; };
        }, skyImg.src ? 350 : 0);
      } else { skyImg.style.opacity = '1'; }
    }
  }

  // Tree lighting — same per-period filter as room
  const treeImg = document.getElementById('land-trees');
  if (treeImg) {
    if (cfg.moonlight)            treeImg.style.filter = 'saturate(0.35) brightness(0.5) hue-rotate(20deg)';
    else if (cfg.label==='golden hour') treeImg.style.filter = 'saturate(1.25) brightness(0.92) sepia(0.28)';
    else if (cfg.label==='dusk')  treeImg.style.filter = 'saturate(0.65) brightness(0.72) hue-rotate(12deg)';
    else if (cfg.label==='morning') treeImg.style.filter = 'saturate(0.85) brightness(0.92)';
    else                          treeImg.style.filter = '';
  }

  // Ambient overlays
  const ov1 = document.getElementById('land-ov-ambient');
  const ov2 = document.getElementById('land-ov-ambient2');
  if (ov1) ov1.style.background = cfg.ambient;
  if (ov2) {
    ov2.style.background = cfg.ambient2 || 'rgba(0,0,0,0)';
    ov2.style.opacity = cfg.ambient2 ? '1' : '0';
  }

  // Portal tint — matches ambient so gif feels lit by time-of-day
  const pt = document.getElementById('portal-tint');
  if (pt) pt.style.background = cfg.ambient;

  // Door ambient kiss — same colour as the scene-wide wash, applied at low
  // strength directly to #door-area (see #door-area::after) so the door
  // feels lit by the same time-of-day mood instead of pasted on top of it.
  document.documentElement.style.setProperty('--door-ambient', cfg.ambient);

  // Visible warm glow halo (see #door-area::before) — intensity/warmth
  // shifts with time of day so it always reads, even when cfg.ambient
  // itself is too faint to notice on its own.
  if (cfg.moonlight) {
    document.documentElement.style.setProperty('--door-glow', 'rgba(255,200,130,0.32)');
  } else if (cfg.label === 'dusk') {
    document.documentElement.style.setProperty('--door-glow', 'rgba(255,150,110,0.30)');
  } else if (cfg.label === 'golden hour') {
    document.documentElement.style.setProperty('--door-glow', 'rgba(255,195,130,0.32)');
  } else {
    document.documentElement.style.setProperty('--door-glow', 'rgba(255,235,205,0.22)');
  }

  // Text colour — light text at night/dusk, dark text in daytime
  const lightText = cfg.moonlight || cfg.label === 'dusk';
  const root = document.documentElement;
  if (lightText) {
    root.style.setProperty('--text-primary',   'rgba(245,240,232,0.95)');
    root.style.setProperty('--text-secondary',  'rgba(245,240,232,0.72)');
    root.style.setProperty('--text-body',       'rgba(245,240,232,0.88)');
    root.style.setProperty('--text-rule',       'rgba(245,240,232,0.30)');
    root.style.setProperty('--hint-color',      'rgba(255,255,255,0.82)');
    root.style.setProperty('--frame-color',     'rgba(245,240,232,0.92)');
  } else {
    root.style.setProperty('--text-primary',   '#1a1208');
    root.style.setProperty('--text-secondary',  'rgba(26,18,8,0.72)');
    root.style.setProperty('--text-body',       '#3d2e1c');
    root.style.setProperty('--text-rule',       'rgba(26,18,8,0.32)');
    root.style.setProperty('--hint-color',      'rgba(30,18,6,0.72)');
    root.style.setProperty('--frame-color',     '#1a1208');
  }
}

// Run immediately so sky/trees are visible before room loads
applyLandingLighting();

/* ============================================================
   ENTRY DOOR
============================================================ */

// ── "Punch a hole in the landing overlay" reveal mechanism ──────────────
// Instead of compositing a separate static room snapshot (which inevitably
// drifts out of sync with the room's actual current lighting/time-of-day),
// we cut an expanding rectangular HOLE directly into #entry's own
// clip-path. Through that hole you see exactly what's underneath: the
// REAL, live room DOM (#room-image/#sky-img/etc, already rendered with
// today's current lighting) — always correct, by construction, because
// it's not a copy of anything. #door-area (and its frame/leaf) is
// `position:fixed`, so it escapes #entry's clipping and stays visible
// & crisp regardless of the hole shape (see #door-area CSS comment).
//
// The hole is expressed as an SVG path with the `evenodd` fill rule:
// an outer rectangle (the full viewport — "paint everything") minus an
// inner rectangle (the hole — "...except this region, which becomes
// transparent, revealing what's beneath"). Growing the inner rectangle
// toward the viewport's edges is the entire "walking through the
// doorway" effect — no separate image layer required.
function _entryHolePath(l, t, r, b) {
  const VW = window.innerWidth, VH = window.innerHeight;
  return `path(evenodd, "M0 0H${VW}V${VH}H0Z M${l} ${t}H${r}V${b}H${l}Z")`;
}
function _doorHoleRect() {
  const doorArea = document.getElementById('door-area');
  if (!doorArea) return null;
  const r = doorArea.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  const padX = r.width * 0.045, padY = r.height * 0.0257;
  return {
    left:   r.left + padX,
    top:    r.top + padY,
    right:  r.right - padX,
    bottom: r.bottom - padY,
  };
}
// Keep #entry's hole "windowed" down to the doorway's on-screen rect — so
// before the reveal, the live room is already visible through the door at
// its true scale (not a snapshot/peek of something else).
function syncEntryHole() {
  const entry = document.getElementById('entry');
  if (!entry) return;
  if (entry.classList.contains('zoom-through')) return; // mid-reveal — leave it animating
  const hr = _doorHoleRect();
  if (!hr) return;
  entry.style.clipPath = _entryHolePath(hr.left, hr.top, hr.right, hr.bottom);
}
window.addEventListener('resize', syncEntryHole);
// The door area flies/fades into place via the `door-in` keyframe animation —
// syncing the hole before it settles produces a misplaced, late-popping
// "peek". Wait for that entrance animation to finish, then measure the
// door's final rect and snap the hole to it.
const _doorAreaEl = document.getElementById('door-area');
if (_doorAreaEl) {
  // RACE CONDITION: this script sits near the bottom of a long document — by
  // the time it parses & runs, the `door-in` entrance animation (1.25s+0.1s)
  // has very likely ALREADY finished & fired its `animationend`, before this
  // listener could ever catch it. Check whether it's already done and settle
  // immediately in that case; only attach the listener if still running.
  const alreadyDone = parseFloat(getComputedStyle(_doorAreaEl).opacity || '0') > 0.98;
  if (alreadyDone) {
    syncEntryHole();
  } else {
    _doorAreaEl.addEventListener('animationend', function onDoorIn(e) {
      if (e.animationName !== 'door-slide-in') return;
      _doorAreaEl.removeEventListener('animationend', onDoorIn);
      syncEntryHole();
    });
  }
}
// Fallback in case neither path fires (e.g. reduced-motion skips the animation)
setTimeout(syncEntryHole, 1600);

// Shared eased progress drives BOTH the frame's scale-up and the portal's
// clip-path reveal from one number each frame — they literally cannot drift
// apart, unlike two independent CSS transitions on differently-shaped
// properties (multiplicative scale vs. linear-in-px clip-path).
function _easeInOutCubic(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

function animateDoorReveal(durationMs, frameTargetScale, onDone) {
  const entry    = document.getElementById('entry');
  const doorArea = document.getElementById('door-area');
  const frameSvg = document.getElementById('frame-svg');
  if (!entry || !doorArea) return;

  const VW = window.innerWidth, VH = window.innerHeight;
  const start = _doorHoleRect();
  if (!start) return;

  // Kill any CSS transitions/positioning on the properties we're about to
  // drive manually — otherwise the browser fights our per-frame inline
  // writes (and stale `inset:0` rules would override our explicit box).
  // The frame is switched from CSS layout (inset:0 within #door-area) to
  // `position:fixed` with an explicit pixel box — so it can be resized to
  // EXACTLY the hole's rectangle every frame (see below).
  entry.style.transition = 'none';
  if (frameSvg) {
    // Don't track/scale the frame's box at all — that's what produced the
    // "white rectangle expanding outward" (its light-coloured outline,
    // var(--frame-color), growing toward viewport size before the room
    // caught up). The original design simply faded the frame out in place
    // as the reveal began (see #entry.zoom-through #frame-svg in the
    // pre-rewrite version) — replicate that: quick opacity fade, no motion.
    frameSvg.style.transition = 'opacity 0.32s ease';
    frameSvg.style.opacity = '0';
  }
  void entry.offsetHeight; // commit

  const t0 = performance.now();
  function step(now) {
    const p = Math.min(1, (now - t0) / durationMs);
    const e = _easeInOutCubic(p);

    // The hole's four edges interpolate from the doorway's rect toward the
    // viewport's edges — at e=1 the hole IS the viewport, i.e. #entry is
    // entirely "punched away" and the live room underneath is fully revealed.
    const l = start.left   * (1 - e) + 0  * e;
    const t = start.top    * (1 - e) + 0  * e;
    const r = start.right  * (1 - e) + VW * e;
    const b = start.bottom * (1 - e) + VH * e;
    entry.style.clipPath = _entryHolePath(l, t, r, b);
    // Force the browser to commit/repaint THIS frame's clip immediately —
    // without this, large position:fixed layers can have their clip-path
    // repaints batched/deferred (especially while another element is mid
    // heavy-transform), so the visible window appears "stuck" at its
    // starting size and only catches up in one jump at the very end.
    void entry.offsetHeight;

    // The frame's box is set to the EXACT SAME l/t/r/b numbers as the hole —
    // not an independently-scaled copy. It is, by construction, a border
    // drawn directly on the edge of the transparent region: same coordinates
    // in, same coordinates out, every frame. They cannot drift apart because
    // they ARE the same rectangle. This replaces the old transform:scale()
    // approach, whose multiplicative growth curve subtly raced ahead of the
    // clip-path's linear-in-px interpolation even under identical easing.
    if (p < 1) {
      requestAnimationFrame(step);
    } else {
      entry.style.clipPath = _entryHolePath(0, 0, VW, VH); // guarantee full punch-through
      if (onDone) onDone();
    }
  }
  requestAnimationFrame(step);
}

document.getElementById('entry-door').addEventListener('click', function() {
  const entry = document.getElementById('entry');
  if (entry.classList.contains('opening')) return; // prevent double-click
  entry.classList.add('opening');
  const _da = document.getElementById('door-area');
  if (_da) _da.classList.add('opening'); // #door-leaf swing-open selector now lives on #door-area (sibling of #entry)

  // Snap the doorway "hole" to the door's current rect RIGHT NOW (in case the
  // entrance-animation-driven sync hasn't run yet) — guarantees the live room
  // is correctly windowed before any expansion begins.
  syncEntryHole();

  // Door leaf slides away immediately; brief pause so the room is glimpsed
  // through the doorway, then we "walk through" — the doorway "window"
  // (clip-path on the fixed, full-scale portal image) expands outward until
  // it swallows the whole screen. No scaling/zooming of the image itself —
  // it's always rendered at true scale, so we land in the room at the right
  // size with no jarring zoom-back-out.
  const REVEAL_MS = 1350;
  setTimeout(() => {
    entry.classList.add('zoom-through'); // triggers the opacity-fade rules (text/sky/etc.)
    if (_da) _da.classList.add('zoom-through'); // door-hint/subhint/portal-tint live in #door-area now
    // Frame scale-up and portal clip-reveal are driven together, frame-by-frame,
    // from one shared progress value — guaranteed in lockstep (see comment above
    // animateDoorReveal). frameTargetScale=11 grows the doorway frame until its
    // borders push past the viewport edges at the same instant the room finishes
    // filling the screen.
    animateDoorReveal(REVEAL_MS, 11);
  }, 550);

  // Wait for the reveal to FULLY complete (550ms delay + 1350ms reveal = 1900ms)
  // before cross-fading to the real room — starting the fade earlier would
  // composite the still-expanding portal against the already-visible real room,
  // which is exactly what made the reveal look like it "stalled" before filling
  // the screen. Now there's a clean hand-off: portal fills screen → THEN fade.
  setTimeout(() => {
    entry.classList.add('fade-out');
    document.body.classList.add('room-entered');
    applyLighting();
    if (getTimeCfg().moonlight && !lampOn) {
      lampOn = true;
      setLampOverlays(true);
    }
  }, 1950);

  // Remove entry (and the now-sibling door-area, which would otherwise sit
  // on top of the room forever at z-index:201) from DOM after fade completes
  setTimeout(() => {
    entry.style.display = 'none';
    const da = document.getElementById('door-area');
    if (da) da.style.display = 'none';
  }, 2750);

  // Pre-load Spotify while user is entering
  initSpotifyAPI();

  // Start lofi music (door click = user interaction, satisfies autoplay policy)
  startLofi();
  startMusicNotes();

  // Show onboarding after room settles
  setTimeout(() => {
    const ob = document.getElementById('onboarding');
    ob.classList.add('visible');
  }, 2500);
});

/* ============================================================
   ONBOARDING
============================================================ */
function dismissOnboarding() {
  const ob = document.getElementById('onboarding');
  ob.classList.add('fade-ob');
  setTimeout(() => ob.remove(), 700);
}
document.getElementById('ob-explore').addEventListener('click', dismissOnboarding);

/* ============================================================
   GUIDED TOUR
============================================================ */
const TOUR_STEPS = [
  { key: 'mirror',     label: 'About' },
  { key: 'consulting', label: 'Consulting' },
  { key: 'laptop',     label: 'Projects' },
  { key: 'trophy',     label: 'Awards' },
  { key: 'door',       label: "What's Next" },
  { key: 'contact',    label: 'Leave a Note' },
];

let _tourMode = false;
// _tourActive stays true for the whole guided tour, including the brief
// windows where _tourMode is toggled off (e.g. _tourAdvance's zoom-out
// step). Used to gate room-interaction blocking — _tourMode alone leaves a
// ~300ms gap during step transitions where clicks/drags weren't blocked.
let _tourActive = false;
let _tourIdx  = -1;

function _tourPulseHotspot(key, cb) {
  const hs = document.querySelector(`.hotspot[data-key="${key}"]`);
  if (hs) {
    hs.classList.add('hs-tour-active');
    _tourActiveHs = hs; // cleared in _openZoomUI once overlay fully lands
    setTimeout(() => cb && cb(), 200); // open modal shortly after highlight appears
  } else {
    if (cb) cb();
  }
}

function startTour() {
  trackEvent('start_tour');
  dismissOnboarding();
  _tourMode = true;
  _tourActive = true;
  _tourIdx  = 0;
  document.body.classList.add('tour-mode');
  _updateTourBar();
  document.getElementById('tour-bar').classList.add('visible');
  _tourPulseHotspot(TOUR_STEPS[0].key, () => openModal(TOUR_STEPS[0].key));
}

function _exitTour() {
  _tourMode = false;
  _tourActive = false;
  _tourIdx  = -1;
  _tourNavLock = false;
  document.body.classList.remove('tour-mode');
  document.getElementById('tour-bar').classList.remove('visible');
  _origCloseActiveZoom();
}

// Guards against repeated taps on "Next" while the room is panning/zooming
// between steps — without this, taps during the (sometimes multi-second)
// transition each call _tourAdvance again, silently skipping steps.
let _tourNavLock = false;

function _tourAdvance() {
  if (_tourNavLock) return;
  _tourNavLock = true;
  _tourIdx++;
  const atEnd = _tourIdx >= TOUR_STEPS.length;

  // Temporarily leave tour mode so close runs normally
  _tourMode = false;
  _origCloseActiveZoom();

  if (atEnd) {
    _tourActive = false;
    _tourNavLock = false;
    document.body.classList.remove('tour-mode');
    document.getElementById('tour-bar').classList.remove('visible');
    setTimeout(() => document.getElementById('tour-end').classList.add('visible'), 500);
    return;
  }

  _tourMode = true;
  _updateTourBar();
  // Wait for _zoomOut's transition to fully settle (150ms delay + 650ms
  // transition = 800ms) before starting the next zoom-in. Starting it
  // earlier interrupts the in-progress transform/transform-origin
  // transition — on mobile Safari this forces an expensive repaint of the
  // scaled scene that can stall for several seconds, especially coming
  // from About's larger 3.0 scale.
  setTimeout(() => {
    _tourPulseHotspot(TOUR_STEPS[_tourIdx].key, () => openModal(TOUR_STEPS[_tourIdx].key));
  }, 820);
}

function _updateTourBar() {
  const next = TOUR_STEPS[_tourIdx + 1];
  document.getElementById('tour-step-indicator').textContent =
    `${_tourIdx + 1} / ${TOUR_STEPS.length}`;
  document.getElementById('tour-next-btn').textContent =
    next ? `Next: ${next.label} →` : 'Finish tour';
}

// Capture-phase listeners on all zoom-back buttons:
// in tour mode intercept before the original close handler fires → exit tour
document.querySelectorAll('[id$="-zoom-back"]').forEach(btn => {
  btn.addEventListener('click', e => {
    if (!_tourActive) return;
    e.stopImmediatePropagation();
    _exitTour();
  }, true);
});

document.getElementById('ob-tour').addEventListener('click', startTour);
document.getElementById('tour-exit-btn').addEventListener('click', _exitTour);
document.getElementById('tour-next-btn').addEventListener('click', _tourAdvance);
document.getElementById('tour-end-close').addEventListener('click', () => {
  document.getElementById('tour-end').classList.remove('visible');
});

// During the guided tour, the room pans/zooms between steps with no modal
// open yet. Clicking a hotspot (or anything else in the room) mid-pan during
// that window starts a second zoom/modal on top of the in-progress one and
// the tour gets stuck. While in tour mode and no modal/overlay is currently
// open, swallow clicks on everything except the tour bar itself.
// During the guided tour, the room pans/zooms between steps with no modal
// open yet. Any interaction with the room during that window — clicking a
// hotspot, or even just pressing/dragging to pan — starts a second
// zoom/pan or kills the in-progress transition (drag clears the transform
// transition), and the tour gets stuck. While in tour mode and no
// modal/overlay is currently open, swallow these interactions everywhere
// except the tour bar itself.
function _tourBlocksInteraction(e) {
  if (!_tourActive) return false;
  if (e.target.closest('#tour-bar')) return false;
  const modalOpen = modalBg.classList.contains('open');
  const overlayOpen = document.querySelectorAll('.world-zoom-overlay.visible').length > 0;
  return !(modalOpen || overlayOpen);
}

['click', 'mousedown', 'touchstart', 'pointerdown'].forEach(type => {
  document.addEventListener(type, e => {
    if (!_tourBlocksInteraction(e)) return;
    e.stopPropagation();
    e.preventDefault();
  }, { capture: true, passive: false });
});

/* ============================================================
   PANORAMA
============================================================ */
const container = document.getElementById('room-container');
const wrapper   = document.getElementById('room-wrapper');
const img       = document.getElementById('room-image');

let imgW=0, curX=0, dragging=false, startX=0, lastX=0, lastT=0, vel=0, rafId=null;

function maxScroll() { return -(imgW-window.innerWidth); }
function clamp(x)    { return Math.max(maxScroll(),Math.min(0,x)); }
function moveTo(x)   { curX=clamp(x); wrapper.style.transform=`translateX(${curX}px)`; }

function initRoom() {
  // offsetWidth can be 0 on first paint on mobile (layout not flushed yet).
  // Retry on the next frame instead of guessing a width from naturalWidth,
  // since CSS height:100vh can differ from window.innerHeight on mobile
  // browsers and produce a wrapper width that doesn't match the rendered image.
  const w = img.offsetWidth;
  if (!w) {
    initRoom._tries = (initRoom._tries || 0) + 1;
    if (initRoom._tries < 30) { requestAnimationFrame(initRoom); return; }
  }
  imgW = w || img.naturalWidth || 3000;
  wrapper.style.width = imgW+'px';
  moveTo(maxScroll()*0.32);
  loadPositions();
  buildPosPanel();
}
img.addEventListener('load', initRoom);
// Fallback: run initRoom even if image fails/is cached
window.addEventListener('load', () => { if(imgW===0) initRoom(); });
if(img.complete) requestAnimationFrame(initRoom);

container.addEventListener('mousedown', e => {
  if(editMode || e.target.closest('.hotspot')) return;
  dragging=true; startX=e.clientX-curX; lastX=e.clientX; lastT=Date.now(); vel=0;
  container.classList.add('dragging'); cancelAnimationFrame(rafId);
});
window.addEventListener('mousemove', e => {
  if(dragging) {
    const now=Date.now(), dt=now-lastT;
    if(dt>0) vel=((e.clientX-lastX)/dt)*16;
    lastX=e.clientX; lastT=now; moveTo(e.clientX-startX);
    dismissOnboarding();
  }
  if(draggingHs) {
    const wRect=wrapper.getBoundingClientRect();
    const pctX=Math.max(0,Math.min(100,((e.clientX-wRect.left-hsOffX)/imgW)*100));
    const pctY=Math.max(0,Math.min(100,((e.clientY-wRect.top-hsOffY)/window.innerHeight)*100));
    draggingHs.style.left=pctX.toFixed(2)+'%';
    draggingHs.style.top=pctY.toFixed(2)+'%';
    buildPosPanel();
  }
});
window.addEventListener('mouseup', () => {
  if(dragging) { dragging=false; container.classList.remove('dragging'); momentum(); }
  if(draggingHs) { draggingHs.classList.remove('dragging-hs'); draggingHs=null; savePositions(); }
});
container.addEventListener('touchstart', e => {
  if(editMode) return;
  dragging=true; startX=e.touches[0].clientX-curX; lastX=e.touches[0].clientX; lastT=Date.now(); vel=0;
  cancelAnimationFrame(rafId);
},{passive:true});
container.addEventListener('touchmove', e => {
  if(!dragging||editMode) return;
  e.preventDefault();
  const now=Date.now(),dt=now-lastT;
  if(dt>0) vel=((e.touches[0].clientX-lastX)/dt)*16;
  lastX=e.touches[0].clientX; lastT=now; moveTo(e.touches[0].clientX-startX);
  dismissOnboarding();
},{passive:false});
container.addEventListener('touchend', () => { dragging=false; momentum(); });

function momentum() {
  cancelAnimationFrame(rafId);
  (function tick() { if(Math.abs(vel)<0.4) return; vel*=0.91; moveTo(curX+vel); rafId=requestAnimationFrame(tick); })();
}
window.addEventListener('resize', () => { imgW=img.offsetWidth||imgW; moveTo(curX); });

/* ============================================================
   EDIT MODE
============================================================ */
let editMode=false, draggingHs=null, hsOffX=0, hsOffY=0;
const lockedSet=new Set();

function enterEditMode() { editMode=true; document.body.classList.add('edit-mode'); container.classList.add('edit-active'); }
function exitEditMode()  { editMode=false; document.body.classList.remove('edit-mode'); container.classList.remove('edit-active'); savePositions(); }

document.getElementById('edit-toggle').addEventListener('click', () => editMode ? exitEditMode() : enterEditMode());
document.getElementById('btn-done').addEventListener('click', exitEditMode);

document.querySelectorAll('.hotspot').forEach(hs => {
  hs.addEventListener('mousedown', e => {
    if(!editMode||lockedSet.has(hs.dataset.key)) return;
    e.stopPropagation(); e.preventDefault();
    draggingHs=hs; hs.classList.add('dragging-hs');
    const r=hs.getBoundingClientRect();
    hsOffX=e.clientX-(r.left+r.width/2); hsOffY=e.clientY-(r.top+r.height/2);
  });
  hs.addEventListener('dblclick', e => {
    if(!editMode) return; e.stopPropagation();
    const key=hs.dataset.key;
    lockedSet.has(key) ? (lockedSet.delete(key), hs.classList.remove('hs-locked')) : (lockedSet.add(key), hs.classList.add('hs-locked'));
    savePositions(); buildPosPanel();
  });
});

// Panel collapse toggle
const posPanel = document.getElementById('pos-panel');
document.getElementById('pp-collapse-btn').addEventListener('click', () => {
  const collapsed = posPanel.classList.toggle('collapsed');
  document.getElementById('pp-collapse-btn').textContent = collapsed ? '▶ show panel' : '◀ hide panel';
});

document.getElementById('btn-lock-all').addEventListener('click', () => { document.querySelectorAll('.hotspot').forEach(hs => { lockedSet.add(hs.dataset.key); hs.classList.add('hs-locked'); }); savePositions(); buildPosPanel(); });
document.getElementById('btn-unlock-all').addEventListener('click', () => { lockedSet.clear(); document.querySelectorAll('.hotspot').forEach(hs => hs.classList.remove('hs-locked')); savePositions(); buildPosPanel(); });

const DEFAULTS={};
document.querySelectorAll('.hotspot').forEach(hs => { DEFAULTS[hs.dataset.key]={left:hs.style.left, top:hs.style.top}; });
document.getElementById('btn-reset').addEventListener('click', () => {
  if(!confirm('Reset all hotspots?')) return;
  lockedSet.clear();
  document.querySelectorAll('.hotspot').forEach(hs => { const d=DEFAULTS[hs.dataset.key]; hs.style.left=d.left; hs.style.top=d.top; hs.classList.remove('hs-locked'); });
  savePositions(); buildPosPanel();
});

function wireHotspot(hs) {
  hs.addEventListener('mousedown', e => {
    if(!editMode||lockedSet.has(hs.dataset.key)) return;
    e.stopPropagation(); e.preventDefault();
    draggingHs=hs; hs.classList.add('dragging-hs');
    const r=hs.getBoundingClientRect();
    hsOffX=e.clientX-(r.left+r.width/2); hsOffY=e.clientY-(r.top+r.height/2);
  });
  hs.addEventListener('dblclick', e => {
    if(!editMode) return; e.stopPropagation();
    const key=hs.dataset.key;
    lockedSet.has(key)?(lockedSet.delete(key),hs.classList.remove('hs-locked')):(lockedSet.add(key),hs.classList.add('hs-locked'));
    savePositions(); buildPosPanel();
  });
  hs.addEventListener('click', e => {
    if(editMode) return; e.stopPropagation(); openModal(hs.dataset.key);
  });
}

function buildPosPanel() {
  const rows = document.getElementById('pp-rows');
  rows.innerHTML = '';
  document.querySelectorAll('.hotspot').forEach(hs => {
    const key    = hs.dataset.key;
    const locked = lockedSet.has(key);

    // Determine current ring color for the swatch
    const isEgg     = hs.classList.contains('egg');
    const ringColor = hs.dataset.color || '#ffffff';

    // Main row
    const row = document.createElement('div');
    row.className = 'pp-row' + (locked ? ' is-locked' : '');
    row.innerHTML = `
      <span class="pp-name" style="${isEgg ? 'color:rgba(255,200,80,0.55);' : ''}">${hs.dataset.label || key}</span>
      <span class="pp-coords">${parseFloat(hs.style.left).toFixed(1)}% ${parseFloat(hs.style.top).toFixed(1)}%</span>
      <span class="pp-row-actions">
        <span class="pp-color-btn" title="ring color" style="background:${ringColor};">
          <input type="color" value="${ringColor}" data-ckey="${key}" />
        </span>
        <button class="pp-vis-btn ${isEgg ? 'is-egg' : ''}" title="${isEgg ? 'visible ring' : 'make invisible'}" data-vkey="${key}">${isEgg ? '👻' : '◯'}</button>
        <button class="pp-rename-btn" title="rename" data-rkey="${key}">✎</button>
        <button class="pp-del-btn"    title="delete"  data-dkey="${key}">✕</button>
        <span class="pp-lock-icon">${locked ? '✓' : ''}</span>
      </span>`;
    rows.appendChild(row);

    // Inline rename field (hidden by default)
    const inlineEdit = document.createElement('div');
    inlineEdit.className = 'pp-inline-edit';
    inlineEdit.id = 'pp-inline-' + key;
    inlineEdit.innerHTML = `<input class="pp-inline-input" placeholder="new label…" value="${hs.dataset.label || key}" data-rkey="${key}"/>`;
    rows.appendChild(inlineEdit);

    // Wire color picker
    row.querySelector('input[type="color"]').addEventListener('input', e => {
      applyHotspotColor(hs, e.target.value);
      // Update swatch background live
      e.target.closest('.pp-color-btn').style.background = e.target.value;
      savePositions();
    });

    // Wire visibility toggle (egg mode)
    row.querySelector('.pp-vis-btn').addEventListener('click', e => {
      e.stopPropagation();
      const nowEgg = !hs.classList.contains('egg');
      setHotspotEgg(hs, nowEgg);
      savePositions(); buildPosPanel();
    });

    // Wire rename button
    row.querySelector('.pp-rename-btn').addEventListener('click', e => {
      e.stopPropagation();
      const field = document.getElementById('pp-inline-' + key);
      const open = field.classList.toggle('open');
      if (open) field.querySelector('input').focus();
    });

    // Apply rename on Enter or blur
    inlineEdit.querySelector('input').addEventListener('keydown', e => {
      if (e.key === 'Enter') { applyRename(hs, e.target.value); e.target.blur(); }
    });
    inlineEdit.querySelector('input').addEventListener('blur', e => {
      applyRename(hs, e.target.value);
    });

    // Wire delete button
    row.querySelector('.pp-del-btn').addEventListener('click', e => {
      e.stopPropagation();
      if (!confirm('Remove "' + (hs.dataset.label || key) + '" ring?')) return;
      lockedSet.delete(key);
      hs.remove();
      savePositions(); buildPosPanel();
    });
  });
}

function applyRename(hs, newLabel) {
  const trimmed = newLabel.trim();
  if (!trimmed || trimmed === (hs.dataset.label || hs.dataset.key)) return;
  hs.dataset.label = trimmed;
  const labelEl = hs.querySelector('.hs-label');
  if (labelEl) labelEl.textContent = trimmed;
  // Update CONTENT entry title if it exists
  if (CONTENT[hs.dataset.key]) CONTENT[hs.dataset.key].title = trimmed;
  savePositions(); buildPosPanel();
}

/* ============================================================
   ADD NEW RING
============================================================ */
document.getElementById('pp-add-btn').addEventListener('click', () => {
  const labelInput = document.getElementById('pp-new-label');
  const keyInput   = document.getElementById('pp-new-key');
  const label = labelInput.value.trim();
  if (!label) { labelInput.focus(); labelInput.style.borderColor='rgba(255,80,80,0.7)'; setTimeout(()=>labelInput.style.borderColor='',1200); return; }

  // Auto-generate key from label if blank
  let key = keyInput.value.trim().replace(/\s+/g,'-').toLowerCase() ||
            label.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  // Ensure key is unique
  if (document.querySelector(`.hotspot[data-key="${key}"]`)) {
    key = key + '-' + Date.now().toString(36).slice(-4);
  }

  // Create hotspot element
  const hs = document.createElement('div');
  hs.className = 'hotspot';
  hs.dataset.key   = key;
  hs.dataset.label = label;
  // Place near center of current viewport
  const viewCenterX = Math.max(0, Math.min(100, ((-curX + window.innerWidth * 0.5) / imgW) * 100));
  hs.style.left = viewCenterX.toFixed(1) + '%';
  hs.style.top  = '50%';
  hs.innerHTML  = `<div class="hs-ring"></div><div class="hs-label">${label}</div>`;

  // Add placeholder CONTENT entry
  CONTENT[key] = { title: label, body: `<p><em>Click ✎ edit to add content for "${label}".</em></p>` };

  // Insert into DOM and wire up
  document.getElementById('room-wrapper').appendChild(hs);
  wireHotspot(hs);
  DEFAULTS[key] = { left: hs.style.left, top: hs.style.top };

  // Clear inputs and save
  labelInput.value = '';
  keyInput.value   = '';
  savePositions(); buildPosPanel();
});
document.getElementById('btn-copy-pos').addEventListener('click', () => {
  let out=''; document.querySelectorAll('.hotspot').forEach(hs => { out+=`${hs.dataset.key}: left:${parseFloat(hs.style.left).toFixed(2)}%; top:${parseFloat(hs.style.top).toFixed(2)}%\n`; });
  const box=document.getElementById('pp-output'); box.textContent=out; box.classList.add('visible');
  navigator.clipboard.writeText(out).catch(()=>{});
});
/* ============================================================
   HOTSPOT COLOR + VISIBILITY
============================================================ */
function applyHotspotColor(hs, hex) {
  if (!hex || hex === '#ffffff') {
    hs.style.removeProperty('--hs-r');
    hs.style.removeProperty('--hs-g');
    hs.style.removeProperty('--hs-b');
    delete hs.dataset.color;
  } else {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    hs.style.setProperty('--hs-r', r);
    hs.style.setProperty('--hs-g', g);
    hs.style.setProperty('--hs-b', b);
    hs.dataset.color = hex;
  }
}

function setHotspotEgg(hs, isEgg) {
  if (isEgg) { hs.classList.add('egg'); hs.dataset.egg = '1'; }
  else        { hs.classList.remove('egg'); delete hs.dataset.egg; }
}

const HS_POS_VERSION = '2';

function savePositions() {
  const data={ _v: HS_POS_VERSION };
  document.querySelectorAll('.hotspot').forEach(hs => {
    data[hs.dataset.key] = {
      left:   hs.style.left,
      top:    hs.style.top,
      locked: lockedSet.has(hs.dataset.key),
      color:  hs.dataset.color || null,
      egg:    hs.classList.contains('egg') || false,
    };
  });
  try { localStorage.setItem('hs-pos',JSON.stringify(data)); } catch(e) {}
}

function loadPositions() {
  try {
    const saved = JSON.parse(localStorage.getItem('hs-pos')||'null');
    if (!saved || saved._v !== HS_POS_VERSION) return;
    document.querySelectorAll('.hotspot').forEach(hs => {
      const d = saved[hs.dataset.key];
      if (!d) return;
      hs.style.left = d.left;
      hs.style.top  = d.top;
      if (d.locked) { lockedSet.add(hs.dataset.key); hs.classList.add('hs-locked'); }
      if (d.color)  { applyHotspotColor(hs, d.color); }
      if (d.egg)    { setHotspotEgg(hs, true); }
    });
  } catch(e) {}
}

/* ============================================================
   WINDOW CALIBRATION TOOL
============================================================ */
(function() {
  const winAnim  = document.getElementById('window-anim');
  const calibBox = document.getElementById('win-calib-box');
  const calibLabel = calibBox.querySelector('.wcb-label');

  // Default position matching initial CSS
  let wp = { left:14, top:0, width:28, height:54 };

  function loadWinPos() {
    try { const s=JSON.parse(localStorage.getItem('win-anim-pos')); if(s) wp=s; } catch(e) {}
  }
  function saveWinPos() {
    try { localStorage.setItem('win-anim-pos', JSON.stringify(wp)); } catch(e) {}
  }
  function applyWinPos() {
    const w = imgW || 3000;
    winAnim.style.left   = wp.left   + '%';
    winAnim.style.top    = wp.top    + '%';
    winAnim.style.width  = wp.width  + '%';
    winAnim.style.height = wp.height + '%';
    calibBox.style.left   = wp.left   + '%';
    calibBox.style.top    = wp.top    + '%';
    calibBox.style.width  = wp.width  + '%';
    calibBox.style.height = wp.height + '%';
    calibLabel.textContent =
      `⊹ window · L:${wp.left.toFixed(1)}% T:${wp.top.toFixed(1)}% W:${wp.width.toFixed(1)}% H:${wp.height.toFixed(1)}%`;
  }

  // Also add a calibration section to the pos-panel edit toolbar
  function buildCalibRow() {
    const existing = document.getElementById('calib-toolbar-section');
    if (existing) existing.remove();
    const s = document.createElement('span');
    s.id = 'calib-toolbar-section';
    s.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-left:1rem;';
    s.innerHTML = `<span style="color:rgba(0,220,220,0.8);font-size:0.72rem;letter-spacing:0.1em;">⊹ WIN ANIM:</span>
      <span style="color:rgba(0,220,220,0.65);font-size:0.68rem;">L:<b id="ci-l">${wp.left.toFixed(1)}</b>%
      T:<b id="ci-t">${wp.top.toFixed(1)}</b>%
      W:<b id="ci-w">${wp.width.toFixed(1)}</b>%
      H:<b id="ci-h">${wp.height.toFixed(1)}</b>%</span>
      <span style="color:rgba(0,220,220,0.45);font-size:0.66rem;">← drag teal box</span>`;
    document.getElementById('edit-toolbar').appendChild(s);
  }

  function updateToolbarCalib() {
    const l=document.getElementById('ci-l'), t=document.getElementById('ci-t'),
          w=document.getElementById('ci-w'), h=document.getElementById('ci-h');
    if (l) { l.textContent=wp.left.toFixed(1); t.textContent=wp.top.toFixed(1);
              w.textContent=wp.width.toFixed(1); h.textContent=wp.height.toFixed(1); }
  }

  // Drag state
  let cdrag=false, cresize=false, cedge='';
  let csx=0, csy=0, cswp=null;

  calibBox.addEventListener('mousedown', e => {
    if (!editMode) return;
    const t = e.target;
    if (t.classList.contains('wcb-handle')) {
      cresize=true; cedge=t.dataset.edge;
    } else {
      cdrag=true;
    }
    csx=e.clientX; csy=e.clientY;
    cswp={...wp};
    e.stopPropagation(); e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!cdrag && !cresize) return;
    const totalW = imgW || 3000;
    const viewH  = window.innerHeight;
    const dx = (e.clientX - csx) / totalW * 100;
    const dy = (e.clientY - csy) / viewH  * 100;
    if (cdrag) {
      wp.left = Math.max(0, Math.min(95, cswp.left + dx));
      wp.top  = Math.max(0, Math.min(95, cswp.top  + dy));
    } else {
      if (cedge.includes('e'))  wp.width  = Math.max(3, cswp.width  + dx);
      if (cedge.includes('s'))  wp.height = Math.max(3, cswp.height + dy);
      if (cedge.includes('w'))  { wp.left = cswp.left + dx; wp.width = Math.max(3, cswp.width - dx); }
      if (cedge.includes('n'))  { wp.top  = cswp.top  + dy; wp.height = Math.max(3, cswp.height - dy); }
    }
    applyWinPos(); updateToolbarCalib();
  });

  window.addEventListener('mouseup', () => {
    if (cdrag || cresize) { saveWinPos(); }
    cdrag=false; cresize=false;
  });

  // Init on room load
  const origInit = window.__roomInitDone;
  function onRoomReady() {
    loadWinPos(); applyWinPos();
  }
  img.addEventListener('load', onRoomReady);
  window.addEventListener('load', () => { if (imgW > 0) { loadWinPos(); applyWinPos(); } });
  if (img.complete) setTimeout(onRoomReady, 80);

  // Build toolbar section when entering edit mode
  document.getElementById('edit-toggle').addEventListener('click', () => {
    if (!editMode) return; // just turned on
    setTimeout(buildCalibRow, 50);
  });
  document.getElementById('btn-done').addEventListener('click', () => {
    const s=document.getElementById('calib-toolbar-section'); if(s) s.remove();
  });
})();

/* ============================================================
   LAMP TOGGLE
============================================================ */
let lampOn = false;
let _lampFlickerTimer = null;

function setLampOverlays(on) {
  const cube    = document.getElementById('ov-lamp-cube');
  const pool    = document.getElementById('ov-lamp-pool');
  const flicker = document.getElementById('ov-lamp-flicker');
  const reveal  = document.getElementById('lamp-reveal');

  document.body.classList.toggle('lamp-on', on);

  if (on) {
    cube.style.background = 'radial-gradient(circle,rgba(255,215,95,0.60) 0%,rgba(255,175,45,0.22) 52%,transparent 80%)';
    cube.style.opacity    = '1';
    pool.style.opacity    = '1';
    pool.style.background = '';
    flicker.style.opacity = '0.80';
    reveal.style.opacity  = '1';
    _scheduleLampFlicker();
  } else {
    clearTimeout(_lampFlickerTimer);
    const cfg = getTimeCfg();
    const isNight = cfg.moonlight; // night / late-night / pre-dawn
    // When lamp is off at night: no warm reveal — let the blue/purple ambient own the scene
    cube.style.background = cfg.cubeBg || '';
    cube.style.opacity    = isNight ? '0' : String(cfg.cubeOpacity);
    pool.style.opacity    = isNight ? '0' : String((cfg.cubeOpacity * 0.90).toFixed(2));
    pool.style.background = '';
    flicker.style.opacity = '0';
    reveal.style.opacity  = isNight ? '0' : (cfg.cubeOpacity > 0.25 ? Math.min(0.95, cfg.cubeOpacity * 0.90).toFixed(2) : '0');
  }
}

function _scheduleLampFlicker() {
  clearTimeout(_lampFlickerTimer);
  if (!lampOn) return;
  // Fire every 40–55 seconds
  _lampFlickerTimer = setTimeout(_doLampFlicker, 40000 + Math.random() * 15000);
}

function _doLampFlicker() {
  if (!lampOn) return;
  const flicker = document.getElementById('ov-lamp-flicker');
  const cube    = document.getElementById('ov-lamp-cube');
  const pool    = document.getElementById('ov-lamp-pool');
  const reveal  = document.getElementById('lamp-reveal');

  // Kill slow CSS transitions on all elements for duration of flicker
  [flicker, cube, pool, reveal].forEach(el => { if(el) el.style.transition = 'none'; });

  const steps = [
    { t:0,   fo:0.18, co:0.40, po:0.45, ro:0.50 },
    { t:80,  fo:0.60, co:0.80, po:0.82, ro:0.80 },
    { t:160, fo:0.28, co:0.55, po:0.58, ro:0.62 },
    { t:240, fo:0.80, co:1.00, po:1.00, ro:1.00 },
  ];
  steps.forEach(s => setTimeout(() => {
    if (!lampOn) return;
    if(flicker) flicker.style.opacity = s.fo.toFixed(2);
    if(cube)    cube.style.opacity    = s.co.toFixed(2);
    if(pool)    pool.style.opacity    = s.po.toFixed(2);
    if(reveal)  reveal.style.opacity  = s.ro.toFixed(2);
  }, s.t));

  // Restore transitions after all steps complete
  setTimeout(() => {
    [flicker, cube, pool, reveal].forEach(el => { if(el) el.style.transition = ''; });
  }, 350);

  _scheduleLampFlicker();
}
document.getElementById('hs-lamp-toggle').addEventListener('click', e => {
  if (editMode) return; e.stopPropagation();
  trackEvent('click_lamp');
  lampOn = !lampOn;
  setLampOverlays(lampOn);
});

/* ============================================================
   CLOCK HANDS — animated with real time
============================================================ */
(function() {
  const hourHand   = document.getElementById('ck-hour');
  const minuteHand = document.getElementById('ck-minute');
  if (!hourHand || !minuteHand) return;

  function tickClock() {
    const now = new Date();
    const h   = now.getHours() % 12;
    const m   = now.getMinutes();
    const s   = now.getSeconds();
    const hourDeg   = h * 30 + m * 0.5 + s * (0.5 / 60);
    const minuteDeg = m * 6  + s * 0.1;
    hourHand.setAttribute('transform',   `rotate(${hourDeg.toFixed(2)})`);
    minuteHand.setAttribute('transform', `rotate(${minuteDeg.toFixed(2)})`);
  }
  tickClock();
  setInterval(tickClock, 1000);

  // Suppress modal on display-only widgets
  document.getElementById('hs-clock').addEventListener('click', e => e.stopPropagation());
  document.getElementById('hs-monitor-led').addEventListener('click', e => e.stopPropagation());
  document.getElementById('hs-music-notes').addEventListener('click', e => e.stopPropagation());

  // iPod center button — toggle lofi on/off, or switch back to lofi from Spotify
  document.getElementById('ipod-center-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    if (_spotifyPlaying) {
      // Spotify is playing → switch back to lofi
      _resumeLofi();
    } else if (_lofiAudio && !_lofiAudio.paused) {
      // Lofi is playing → stop it for people who don't want music
      _stopLofi();
    } else {
      // Nothing playing → resume lofi
      _resumeLofi();
    }
    // Update now-playing strip to show lofi info
    _updateIpodScreen();
  });

  // Monitor LED blink cycle — starts on room entry, 20s blink / 40s solid per minute
  document.getElementById('entry-door').addEventListener('click', function startLedCycle() {
    const dot = document.getElementById('monitor-dot-blink');
    if (!dot) return;
    function cycle() {
      dot.classList.add('blinking');
      setTimeout(() => dot.classList.remove('blinking'), 20000);
    }
    setTimeout(() => { cycle(); setInterval(cycle, 60000); }, 1500);
  }, { once: true });
})();

/* ============================================================
   MODAL
============================================================ */
const modalBg    = document.getElementById('modal-bg');
const modalTitle = document.getElementById('modal-title');
const modalBody  = document.getElementById('modal-body');
const modalEditBtn  = document.getElementById('modal-edit-btn');
const modalResetBtn = document.getElementById('modal-reset-btn');
let currentModalKey = null, isModalEditing = false;

function openModal(key) {
  if (editMode) return;
  if (key === 'contact')    { openNoteZoom();       return; }
  if (key === 'laptop')     { openMonitorZoom();    return; }
  if (key === 'trophy')     { openTrophyZoom();     return; }
  if (key === 'books')      { openBookshelfZoom();  return; }
  if (key === 'worldmap')   { openWorldMapZoom();   return; }
  if (key === 'consulting') { openConsultingZoom(); return; }
  if (key === 'mirror')     { openAboutZoom();      return; }
  if (key === 'piano')      { openMusicZoom();      return; }
  if (key === 'door')       { openDoorZoom();       return; }
  if (key === 'hobbies')    { openHobbiesZoom();    return; }
  if (key === 'teapot')     { openTeaZoom();        return; }
  if (key === 'stickynotes'){ openStickiesZoom();   return; }
  if (key === 'polaroids')  { openCommunityZoom();  return; }
  if (key === 'wardrobe')   { openWardrobeZoom();   return; }
  const data = CONTENT[key]; if (!data) return;
  currentModalKey = key;
  isModalEditing  = false;

  modalTitle.textContent = data.title;

  if (key === 'speaker') { openSpeakerZoom(); return; }

  // Rich modal UIs for specific keys
  if (RICH_MODAL_KEYS.has(key)) {
    modalEditBtn.style.display = 'none';   // no edit mode for rich modals
    modalResetBtn.classList.remove('visible');
    modalBody.contentEditable = 'false';
    if (key === 'worldmap') { modalBg.classList.add('wm-mode'); document.getElementById('wm-zoom-back').style.display = 'block'; }
    renderRichModal(key);
    modalBg.classList.add('open');
    trackModalOpen(key);
    return;
  }

  const saved = (() => { try { return localStorage.getItem('modal-'+key); } catch(e) { return null; } })();
  modalBody.innerHTML = saved || data.body;
  modalBody.contentEditable = 'false';

  modalEditBtn.textContent = '✎ edit';
  modalEditBtn.classList.remove('editing');
  modalResetBtn.classList.toggle('visible', !!saved);
  modalBg.classList.add('open');
  trackModalOpen(key);
}
function closeModal() {
  trackModalClose(currentModalKey);
  if (isModalEditing) { isModalEditing=false; modalBody.contentEditable='false'; }
  if (currentModalKey === 'speaker') {
    _parkSpotify();
  }
  _stopAllProjectVideos(modalBody);
  // Destroy Leaflet map before clearing innerHTML
  if (_wmMap) { _wmMap.remove(); _wmMap = null; }
  modalEditBtn.textContent = '✎ edit';
  modalEditBtn.classList.remove('editing');
  const wasWmMode = modalBg.classList.contains('wm-mode');
  const wasZoomMode = modalBg.classList.contains('zoom-mode');
  modalBg.classList.remove('wm-mode');
  modalBg.classList.remove('zoom-mode');
  modalBody.innerHTML = '';
  modalTitle.textContent = '';
  if (wasWmMode) {
    const modalEl = document.getElementById('modal');
    modalEl.style.visibility = 'hidden';
    modalBg.classList.remove('open');
    setTimeout(() => { modalEl.style.visibility = ''; }, 500);
    _zoomOut();
  } else if (wasZoomMode) {
    modalBg.classList.remove('open');
    _zoomOut();
  } else {
    modalBg.classList.remove('open');
  }
  document.getElementById('wm-zoom-back').style.display = '';
  currentModalKey = null;
}

// Project links inside regular modals → close modal, open monitor at correct tab
modalBody.addEventListener('click', e => {
  const link = e.target.closest('.modal-proj-link');
  if (!link) return;
  e.preventDefault();
  const projId = link.dataset.proj;
  closeModal();
  setTimeout(() => {
    openMonitorZoom();
    setTimeout(() => {
      const tab = document.querySelector(`.browser-tab[data-tab="${projId}"]`);
      if (tab) tab.click();
    }, 600);
  }, 300);
});

// Edit button toggle
modalEditBtn.addEventListener('click', () => {
  isModalEditing = !isModalEditing;
  modalBody.contentEditable = isModalEditing ? 'true' : 'false';
  modalEditBtn.textContent = isModalEditing ? '✓ done' : '✎ edit';
  modalEditBtn.classList.toggle('editing', isModalEditing);
  if (isModalEditing) { modalBody.focus(); }
});

// Auto-save on every keystroke
modalBody.addEventListener('input', () => {
  if (!currentModalKey || !isModalEditing) return;
  try { localStorage.setItem('modal-'+currentModalKey, modalBody.innerHTML); } catch(e) {}
  modalResetBtn.classList.add('visible');
});

// Reset to default
modalResetBtn.addEventListener('click', () => {
  if (!currentModalKey) return;
  if (!confirm('Reset "' + currentModalKey + '" to default content?')) return;
  try { localStorage.removeItem('modal-'+currentModalKey); } catch(e) {}
  modalBody.innerHTML = (CONTENT[currentModalKey] || {}).body || '';
  modalResetBtn.classList.remove('visible');
});

document.querySelectorAll('.hotspot:not(#hs-lamp-toggle):not(#hs-clock):not(#hs-music-notes):not(#hs-monitor-led)').forEach(hs => {
  hs.addEventListener('click', e => {
    if(editMode) return;
    e.stopPropagation();
    const clickEvt = HOTSPOT_CLICK_EVENTS[hs.dataset.key];
    if (clickEvt) trackEvent(clickEvt);
    openModal(hs.dataset.key);
  });
  // Keyboard accessibility: make hotspots focusable and activatable via Enter/Space
  if (!hs.hasAttribute('tabindex')) hs.setAttribute('tabindex', '0');
  hs.setAttribute('role', 'button');
  if (!hs.hasAttribute('aria-label')) hs.setAttribute('aria-label', hs.dataset.label || hs.dataset.key);
  hs.addEventListener('keydown', e => {
    if (editMode) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault(); e.stopPropagation();
      hs.click();
    }
  });
});
document.getElementById('modal-close').addEventListener('click', closeModal);
modalBg.addEventListener('click', e => { if(e.target===modalBg || e.target===modalBg.firstElementChild?.parentElement) closeModal(); });
// Also close when clicking the padding area outside #modal
document.getElementById('modal-bg').addEventListener('mousedown', e => {
  if (e.target === document.getElementById('modal-bg')) closeModal();
});
document.addEventListener('keydown', e => { if(e.key==='Escape') { closeModal(); if(editMode) exitEditMode(); } });

/* ============================================================
   NAV MENU
============================================================ */
const NAV_TARGETS={piano:{pct:0.09},trophy:{pct:0.27},consulting:{pct:0.49},laptop:{pct:0.46},contact:{pct:0.52},stickynotes:{pct:0.51},polaroids:{pct:0.66},books:{pct:0.67},hobbies:{pct:0.69},shelf:{pct:0.44},mirror:{pct:0.90},door:{pct:0.80}};
const navBtn=document.getElementById('nav-btn'), navMenu=document.getElementById('nav-menu');
navBtn.addEventListener('click', e => { e.stopPropagation(); navMenu.classList.toggle('open'); });
document.addEventListener('click', () => navMenu.classList.remove('open'));
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    navMenu.classList.remove('open');
    const t=NAV_TARGETS[item.dataset.nav]; if(!t) return;
    animateTo(clamp(-(imgW*t.pct-window.innerWidth*0.5)), () => openModal(item.dataset.nav));
  });
});
/* ============================================================
   NOTE ZOOM — pan + scale into the notepad, no modal
============================================================ */
let _noteZoomed = false;

/* Shared helper: pan to hotspot then zoom centred on it */
/* Pan to a hotspot then zoom centred on its exact screen position.
   X: calculated from hotspot left% + pan offset = pixel-accurate.
   Y: defaults to 44% (comfortable vertical centre); pass originY to override. */
function _zoomToHotspot(key, scale, onOpen, originY) {
  const hs  = document.querySelector(`[data-key="${key}"]`);
  const pct = hs ? parseFloat(hs.style.left) / 100 : 0.5;
  const yOrigin = originY || '44%';
  const destX = clamp(-(imgW * pct - window.innerWidth * 0.5));
  animateTo(destX, () => {
    const hsScreenX = Math.round(imgW * pct + destX);
    if (_tourMode) {
      // Softer zoom for tour — less motion, gentler easing
      // Mobile gets extra time since the snap from short pan distance feels abrupt
      const isMobile = window.innerWidth <= 768;
      const tourDur  = isMobile ? 900 : 500;
      const tourDelay = isMobile ? 780 : 420;
      container.style.transition      = `transform ${tourDur}ms ease-in-out`;
      container.style.transformOrigin = `${hsScreenX}px ${yOrigin}`;
      container.style.transform       = `scale(${(scale || 2.2) * 0.65})`;
      container.style.cursor          = 'default';
      setTimeout(onOpen, tourDelay);
    } else {
      // Original zoom for regular exploration
      container.style.transition      = 'transform 0.75s cubic-bezier(0.35,0,0.1,1)';
      container.style.transformOrigin = `${hsScreenX}px ${yOrigin}`;
      container.style.transform       = `scale(${scale || 2.2})`;
      container.style.cursor          = 'default';
      setTimeout(onOpen, 650);
    }
  });
}

function openNoteZoom() {
  if (_noteZoomed) return;
  _noteZoomed = true;
  navMenu.classList.remove('open');
  _zoomToHotspot('contact', 2.2, () => _openZoomUI('note-zoom-overlay', 'note-zoom-back'));
}

function closeNoteZoom() {
  if (!_noteZoomed) return;
  _noteZoomed = false;
  _closeZoomUI('note-zoom-overlay', 'note-zoom-back');
}
document.getElementById('note-zoom-back').addEventListener('click', closeNoteZoom);

/* ============================================================
   ZOOM SHARED HELPERS
============================================================ */
function _zoomOut() {
  setTimeout(() => {
    container.style.transition = 'transform 0.65s cubic-bezier(0.4,0,0.2,1)';
    container.style.transform = '';
    setTimeout(() => { container.style.transition = ''; container.style.cursor = ''; }, 650);
  }, 150);
}

/* Build a CSS filter + backdrop color that matches current time/weather */
function _getZoomMood() {
  const cfg = getTimeCfg();
  const isWet  = ['rain','storm','fog','snow'].includes(currentWeather);
  const isOver = document.body.classList.contains('sky-overcast-day');

  let filter = '', bg = 'rgba(0,0,0,0.48)';

  if (cfg.moonlight) {
    filter = 'brightness(0.68) saturate(0.80) hue-rotate(12deg)';
    bg     = 'rgba(8,4,35,0.72)';
  } else if (cfg.label === 'dusk') {
    filter = 'brightness(0.84) saturate(0.92) hue-rotate(6deg)';
    bg     = 'rgba(25,10,45,0.60)';
  } else if (cfg.label === 'golden hour') {
    filter = 'brightness(0.96) saturate(1.04)';
    bg     = 'rgba(30,10,0,0.42)';
  } else if (isWet || isOver) {
    filter = 'brightness(0.88) saturate(0.76)';
    bg     = 'rgba(10,18,30,0.55)';
  }
  return { filter, bg };
}

// Holds the hotspot DOM element highlighted during a tour step — cleared when overlay lands
let _tourActiveHs = null;

function _openZoomUI(overlayId, backBtnId) {
  const { filter, bg } = _getZoomMood();
  const bd = document.getElementById('zoom-backdrop');
  bd.style.background = bg;
  bd.classList.add('active');
  const ov = document.getElementById(overlayId);
  ov.style.filter = filter;
  ov.classList.add('visible');
  document.getElementById(backBtnId).style.display = 'block';
  // Clear tour hotspot highlight after the overlay has fully faded in (450ms transition)
  if (_tourActiveHs) {
    const hs = _tourActiveHs; _tourActiveHs = null;
    setTimeout(() => hs.classList.remove('hs-tour-active'), 450);
  }
  _tourNavLock = false;
  trackModalOpen(overlayId.replace(/-zoom-overlay$/, ''));
}

function _closeZoomUI(overlayId, backBtnId) {
  document.getElementById(overlayId).classList.remove('visible');
  document.getElementById(backBtnId).style.display = 'none';
  // Hide backdrop only if no other zoom is open
  const anyOpen = document.querySelectorAll('.world-zoom-overlay.visible').length > 0;
  if (!anyOpen) document.getElementById('zoom-backdrop').classList.remove('active');
  _zoomOut();
  trackModalClose(overlayId.replace(/-zoom-overlay$/, ''));
}

/* Close whichever zoom is currently open */
function closeActiveZoom() {
  if (_noteZoomed)        closeNoteZoom();
  else if (_monitorZoomed)    closeMonitorZoom();
  else if (_trophyZoomed)     closeTrophyZoom();
  else if (_bookshelfZoomed)  closeBookshelfZoom();
  else if (_cfZoomed)         closeConsultingZoom();
  else if (_aboutZoomed)      closeAboutZoom();
  else if (_speakerZoomed)    closeSpeakerZoom();
  else if (_musicZoomed)      closeMusicZoom();
  else if (_doorZoomed)       closeDoorZoom();
  else if (_hobbiesZoomed)    closeHobbiesZoom();
  else if (_communityZoomed)  closeCommunityZoom();
  else if (_stickiesZoomed)   closeStickiesZoom();
  else if (_teaZoomed)        closeTeaZoom();
}

// Preserve reference for tour system to call directly (bypasses tour interception)
const _origCloseActiveZoom = closeActiveZoom;
// In tour mode: clicking outside a zoom card advances the tour instead of closing
closeActiveZoom = function() {
  if (_tourMode) { _tourAdvance(); return; }
  _origCloseActiveZoom();
};

/* Click on backdrop (outside card) → close */
document.querySelectorAll('.world-zoom-overlay').forEach(ov => {
  ov.addEventListener('click', e => {
    // For overlays whose wrap fills the full screen (scrollable),
    // check against the actual visible content, not the full-screen wrap
    if (ov.id === 'hobbies-zoom-overlay') {
      const bag   = ov.querySelector('.hobbies-bag-img-wrap');
      const blurb = ov.querySelector('#hobbies-blurb-panel');
      if (!(bag && bag.contains(e.target)) && !(blurb && blurb.contains(e.target))) closeActiveZoom();
      return;
    }
    if (ov.id === 'trophy-zoom-overlay') {
      const trophyCard = ov.querySelector('.trophy-zoom-card');
      const trophyBlurb = ov.querySelector('#award-blurb-panel');
      if (!(trophyCard && trophyCard.contains(e.target)) && !(trophyBlurb && trophyBlurb.contains(e.target))) closeActiveZoom();
      return;
    }
    // All other overlays: find the primary card child
    // For case files, treat both the card and the mobile nav as safe zones
    if (ov.id === 'consulting-zoom-overlay') {
      const cfCard = ov.querySelector('.casefiles-zoom-card');
      const cfNav  = ov.querySelector('.cf-mobile-nav');
      // Use composedPath() — captured before any DOM mutations (e.g. cfJumpTo rebuilding the page)
      const path = e.composedPath ? e.composedPath() : [];
      const inCard = cfCard && (cfCard.contains(e.target) || path.includes(cfCard));
      const inNav  = cfNav  && (cfNav.contains(e.target)  || path.includes(cfNav));
      if (!inCard && !inNav) closeActiveZoom();
      return;
    }
    const card = ov.querySelector(
      '.about-zoom-card, .door-zoom-card, .tea-zoom-card, .monitor-zoom-card, ' +
      '.speaker-zoom-wrap, .music-zoom-wrap, ' +
      '.sticky-scatter, .community-scatter, .note-zoom-card, .bookshelf-zoom-card'
    );
    if (card && !card.contains(e.target)) closeActiveZoom();
    else if (!card && e.target === ov) closeActiveZoom();
  });
});

/* Pinch-to-zoom-out gesture → close */
(function() {
  let _pinchDist = null;
  document.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      _pinchDist = Math.sqrt(dx*dx + dy*dy);
    }
  }, { passive:true });
  document.addEventListener('touchmove', e => {
    if (e.touches.length !== 2 || _pinchDist === null) return;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    if (Math.sqrt(dx*dx + dy*dy) < _pinchDist * 0.72) {
      _pinchDist = null;
      closeActiveZoom();
    }
  }, { passive:true });
  document.addEventListener('touchend', () => { _pinchDist = null; }, { passive:true });
})();

/* ============================================================
   TIME BADGE — shows time-of-day + live weather label
============================================================ */
let _syncedWeatherLabel = (_cachedSkyEntry && _cachedSkyEntry.label) || null; // e.g. "clear · 22°C" — set after sync; primed from cache for instant display

function _updateTimeBadge(timeLabel) {
  const badge = document.getElementById('time-badge');
  if (!badge) return;
  if (_syncedWeatherLabel) {
    badge.innerHTML =
      timeLabel +
      `<span class="tb-sep">·</span>` +
      `<span class="tb-weather">${_syncedWeatherLabel}</span>`;
  } else {
    badge.textContent = timeLabel;
  }
}

/* ============================================================
   REAL-WEATHER SYNC — Open-Meteo (free, no API key)
   Priority: test panel > weather sync > time-of-day default
============================================================ */

function _wmoToScene(code, windKph, hour) {
  // Sky image — night always wins, then weather condition
  let sky;
  if (hour >= 21 || hour < 5)       sky = 'night';
  else if (hour >= 19 && code <= 1) sky = 'sunset';  // clear dusk
  else if (code === 0 || code === 1) sky = 'clear';
  else if (code === 2)               sky = 'cloudy';
  else                               sky = 'overcast'; // 3, fog, rain, snow, storm

  // Weather overlay
  let weather;
  if      (code >= 95)                          weather = 'storm';
  else if ((code >= 71 && code <= 77) || code === 85 || code === 86) weather = 'snow';
  else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) weather = 'rain';
  else if (code === 45 || code === 48)          weather = 'fog';
  else if (windKph > 28)                        weather = 'wind';
  else                                          weather = 'clear';

  return { sky, weather };
}

// When geolocation is unavailable/denied/times out, _syncedSky would
// otherwise stay null forever, leaving applyLandingLighting() stuck in
// "stillResolving" — sky image never shows, just the blue placeholder.
// Fall back to the time-of-day default so the landing page resolves.
function _fallbackToDefaultSky() {
  if (_syncedSky !== null) return;
  _syncedSky = getTimeCfg().sky;
  _currentSkyAnim = null;
  applySky(_syncedSky);
  updateSkyAnims(_syncedSky);
  if (typeof applyLandingLighting === 'function') applyLandingLighting();
}

async function syncRealWeather() {
  if (!navigator.geolocation) { _fallbackToDefaultSky(); return; }
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { timeout:8000, maximumAge:300000 })
    );
    const { latitude: lat, longitude: lon } = pos.coords;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,weather_code,wind_speed_10m,precipitation&timezone=auto&forecast_days=1`;
    const data = await fetch(url).then(r => r.json());
    const c = data.current;

    const hour = new Date().getHours();
    const { sky, weather } = _wmoToScene(c.weather_code, c.wind_speed_10m, hour);

    // Build human-readable weather label for the time badge
    const conditionMap = {
      0:'clear', 1:'mainly clear', 2:'partly cloudy', 3:'overcast',
      45:'fog', 48:'fog', 51:'drizzle', 53:'drizzle', 55:'drizzle',
      61:'light rain', 63:'rain', 65:'heavy rain',
      71:'light snow', 73:'snow', 75:'heavy snow', 77:'snow',
      80:'showers', 81:'showers', 82:'heavy showers',
      85:'snow showers', 86:'snow showers',
      95:'thunderstorm', 96:'thunderstorm', 99:'thunderstorm',
    };
    const condLabel = conditionMap[c.weather_code] || 'clear';
    const tempC     = Math.round(c.temperature_2m);
    const tempF     = Math.round(tempC * 9/5 + 32);
    _syncedWeatherLabel = `${condLabel} · ${tempC}°C / ${tempF}°F`;
    _saveCachedSky(sky, _syncedWeatherLabel); // cache for instant recognition next load

    // Apply — updates persist across applyLighting calls via _syncedSky
    _syncedSky = sky;
    _currentSkyAnim = null;
    applySky(sky);
    updateSkyAnims(sky);
    setWeather(weather);
    // Landing page resolved its sky before this async sync finished (using the
    // time-of-day default) — re-resolve now so it matches the room's real sky.
    if (typeof applyLandingLighting === 'function') applyLandingLighting();
    _updateTimeBadge(getTimeCfg().label); // refresh badge immediately

    console.log(`🌤 Weather synced: code=${c.weather_code}, wind=${c.wind_speed_10m}kph, ${c.temperature_2m}°C → sky:${sky}, weather:${weather}`);
  } catch (e) {
    console.log('Weather sync skipped:', e.message);
    _fallbackToDefaultSky();
  }
}

// Sync as soon as the landing page loads (not gated behind the door click) —
// otherwise the landing page always shows the time-of-day default sky and
// never matches the real-weather-synced sky the room ends up using, since by
// the time you're inside the sync has finished but the landing already rendered
// with the wrong default. Re-applies landing lighting once resolved (see
// applyLandingLighting() call inside syncRealWeather), then refreshes every 30 min.
setTimeout(syncRealWeather, 200); // start the geolocation+fetch round-trip ASAP — it's the slow part
setInterval(syncRealWeather, 30 * 60 * 1000);

/* ============================================================
   MUSIC NOTE PARTICLES — float up from JBL speaker while music plays
============================================================ */
const _noteChars = ['♪','♫','♩','♬'];
let _noteTimer = null;

function startMusicNotes() {
  if (_noteTimer) return;
  _scheduleNote();
}

function stopMusicNotes() {
  clearTimeout(_noteTimer);
  _noteTimer = null;
}

/* Is any music (lofi or Spotify) currently audible?
   Note: don't gate on _lofiAudio.volume > 0 — _fadeLofi() ramps the
   volume up gradually via setInterval, so right after starting playback
   (volume still 0) this would read as "not playing" and immediately
   stop the notes that were just started. Whether lofi is "playing" is
   about play state, not the current point in its fade. */
function _isMusicPlaying() {
  const lofiPlaying = !!(_lofiAudio && !_lofiAudio.paused && !_lofiManuallyStopped);
  return lofiPlaying || _spotifyPlaying;
}

/* Show/hide the floating music notes based on whether anything is playing */
function _syncMusicNotes() {
  if (!document.body.classList.contains('room-entered')) return;
  if (_isMusicPlaying()) {
    startMusicNotes();
  } else {
    stopMusicNotes();
  }
}

function _scheduleNote() {
  // Higher density: one note every 350–650ms
  _noteTimer = setTimeout(() => {
    _spawnNote();
    _scheduleNote();
  }, 350 + Math.random() * 300);
}

function _spawnNote() {
  const origin = document.getElementById('hs-music-notes');
  if (!origin || !document.body.classList.contains('room-entered')) return;

  const note = document.createElement('span');
  note.className = 'music-note';
  note.textContent = _noteChars[Math.floor(Math.random() * _noteChars.length)];

  const dur = 1.8 + Math.random() * 0.8;
  const sz  = 0.75 + Math.random() * 0.45;

  // Exponential rightward curve: x = k * t^2, y = -h * t (upward)
  // At t = 0.25, 0.5, 0.75, 1.0 fractions
  const k  = 18 + Math.random() * 22;  // horizontal acceleration factor
  const h  = 55 + Math.random() * 25;  // total height
  const sign = Math.random() < 0.2 ? -1 : 1; // mostly right, occasionally left

  const x = (t) => `${(sign * k * t * t).toFixed(1)}px`;
  const y = (t) => `${(-h * t).toFixed(1)}px`;

  note.style.cssText = `
    --x25:${x(0.25)}; --y25:${y(0.25)};
    --x50:${x(0.50)}; --y50:${y(0.50)};
    --x75:${x(0.75)}; --y75:${y(0.75)};
    --x100:${x(1.0)}; --y100:${y(1.0)};
    font-size:${sz}rem;
    opacity:0;
    animation-duration:${dur}s;
    animation-delay:${(Math.random() * 0.15).toFixed(2)}s;
  `;
  origin.appendChild(note);
  setTimeout(() => note.remove(), (dur + 0.35) * 1000);
}

/* ── Lamp hover flicker ───────────────────────────────────── */
document.getElementById('hs-lamp-toggle').addEventListener('mouseenter', () => {
  if (lampOn) _doLampFlicker();
});

/* ── Tree hover rustle ────────────────────────────────────── */
document.getElementById('tree-hover-zone').addEventListener('mouseenter', _doRustle);

/* ── Trophy zoom ─────────────────────────────────────────── */
// TROPHY_DATA is defined in js/content-trophy.js (loaded before this file)
let _trophyZoomed = false, _activeTrophy = null;

function openTrophyZoom() {
  if (_trophyZoomed) return;
  _trophyZoomed = true;
  navMenu.classList.remove('open');
  _zoomToHotspot('trophy', 2.2, () => _openZoomUI('trophy-zoom-overlay', 'trophy-zoom-back'));
  // keep original animateTo result for the reset block below via a dummy:
  void(() => {
  });
}

function closeTrophyZoom() {
  if (!_trophyZoomed) return;
  _trophyZoomed = false;
  document.getElementById('award-blurb-panel').classList.remove('open');
  document.querySelectorAll('.trophy-btn').forEach(b => b.classList.remove('active'));
  _activeTrophy = null;
  _closeZoomUI('trophy-zoom-overlay', 'trophy-zoom-back');
}
document.getElementById('trophy-zoom-back').addEventListener('click', closeTrophyZoom);

// On iOS, a layout shift inside a -webkit-overflow-scrolling:touch container
// while momentum scrolling is active leaves the scroll "stuck" mid-momentum
// for several seconds. Briefly toggling overflow off/on resets it.
function _resetOverlayScroll(ov) {
  if (!ov) return;
  // Use !important so this wins over #trophy-zoom-overlay's
  // `overflow-y: auto !important` mobile rule — a non-important inline
  // style is silently ignored against an !important stylesheet rule.
  ov.style.setProperty('overflow-y', 'hidden', 'important');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { ov.style.removeProperty('overflow-y'); });
  });
}

// Trophy click → blurb
document.querySelectorAll('.trophy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.trophy;
    const data = TROPHY_DATA[key];
    if (!data) return;
    const panel = document.getElementById('award-blurb-panel');
    const inner = document.getElementById('award-blurb-inner');
    const overlay = document.getElementById('trophy-zoom-overlay');

      if (_activeTrophy === key) {
      panel.classList.remove('open');
      btn.classList.remove('active');
      _activeTrophy = null;
      _resetOverlayScroll(overlay);
      return;
    }
    _activeTrophy = key;
    document.querySelectorAll('.trophy-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    inner.innerHTML = `
      <div class="award-blurb-text">
        <h3>${data.name}</h3>
        <p><strong>Issued by:</strong> ${data.issuedBy}</p>
        <p><strong>Scope:</strong> ${data.scope}</p>
        <p><strong>Description:</strong> ${data.desc}</p>
        <p><strong>Selection criteria:</strong> ${data.criteria}</p>
      </div>
      <div class="award-blurb-img"><img src="${data.img}" alt="${data.name}"></div>`;
    panel.classList.add('open');
    _resetOverlayScroll(overlay);
  });
});

/* ── Consulting / Case Files zoom ────────────────────────── */
/* Pages map: CF_CASES[0]=TOC(right, initial), [1]=GenAI Assess(left p1), [2]=GenAI Prop(right p1),
   [3]=Sales(left p2), [4]=Healthcare(right p2), [5]=Investment(left p3),
   [6]=PostM&A+DD(right p3), [7]=BI+Insourcing(left p4), [8]=Social(right p4) */
let _cfZoomed = false, _cfPhysPage = 0, _cfFlipping = false;

function _cfIsMobile() { return window.innerWidth <= 700; }
// Desktop shows two content pages per spread (right = p*2, left = p*2−1).
// An even content count needs an extra spread so the last page (left slot of
// a spread whose right slot is empty) is reachable.
function _cfNumPages() { return _cfIsMobile() ? _CF_PAGES.length : Math.ceil((_CF_PAGES.length + 1) / 2); }
function _cfFrontIdx(p) { return p * 2; }
function _cfBackIdx(p)  { return p * 2 + 1; }

/* Wardrobe is a plain CONTENT modal, but (unlike every other hotspot) it
   used to open with no pan/zoom at all. Reuse the same "zoom into the
   hotspot, then open the modal over it, zoom back out on close" pattern
   as the world map. */
function openWardrobeZoom() {
  _zoomToHotspot('wardrobe', 2.2, () => {
    const key = 'wardrobe';
    const data = CONTENT[key]; if (!data) return;
    currentModalKey = key;
    isModalEditing  = false;
    modalTitle.textContent = data.title;
    modalEditBtn.style.display = '';
    const saved = (() => { try { return localStorage.getItem('modal-'+key); } catch(e) { return null; } })();
    modalBody.innerHTML = saved || data.body;
    modalBody.contentEditable = 'false';
    modalEditBtn.textContent = '✎ edit';
    modalEditBtn.classList.remove('editing');
    modalResetBtn.classList.toggle('visible', !!saved);
    modalBg.classList.add('zoom-mode');
    modalBg.classList.add('open');
    trackModalOpen(key);
  }, '40%');
}

function openWorldMapZoom() {
  _zoomToHotspot('worldmap', 2.2, () => {
    currentModalKey = 'worldmap';
    modalBg.classList.add('wm-mode');
    document.getElementById('wm-zoom-back').style.display = 'block';
    modalEditBtn.style.display = 'none';
    modalResetBtn.classList.remove('visible');
    modalBody.contentEditable = 'false';
    renderWorldMap();
    modalBg.classList.add('open');
    trackModalOpen('worldmap');
  }, '35%');
}

function openConsultingZoom() {
  if (_cfZoomed) return;
  _cfZoomed = true;
  navMenu.classList.remove('open');
  const cfBg = document.querySelector('.casefiles-bg');
  if (cfBg) {
    cfBg.src = window.innerWidth <= 480
      ? 'assets/images/case-files mobile.webp'
      : 'assets/images/case-files.webp';
  }
  _cfPhysPage = 0;
  _cfBuildScene();
  _zoomToHotspot('consulting', 2.2, () => _openZoomUI('consulting-zoom-overlay', 'consulting-zoom-back'));
}

function closeConsultingZoom() {
  if (!_cfZoomed) return;
  _cfZoomed = false;
  // Restore desktop image
  const cfBg = document.querySelector('.casefiles-bg');
  if (cfBg) cfBg.src = 'assets/images/case-files.webp';
  _closeZoomUI('consulting-zoom-overlay', 'consulting-zoom-back');
}
document.getElementById('consulting-zoom-back').addEventListener('click', closeConsultingZoom);

/* ── Page renderers ──────────────────────────────────────── */
function _cfTocHTML() {
  // cfJumpTo(desktopSpread, mobileContentIdx)
  // Desktop spreads: 0=TOC, 1=GenAI+BI, 2=Sales+Investment, 3=PostMA+HCPMO, 4=Social
  // Mobile content indices match _CF_PAGES order (0-based)
  const item = (label, tags, pg, dp, mi) =>
    `<div class="cf-toc-item">
      <div class="cf-toc-item-main">
        <button class="cf-toc-link" onclick="cfJumpTo(${dp},${mi})">${label}</button>
        <div class="cf-toc-tags">${tags}</div>
      </div>
      <span class="cf-toc-pg">${pg}</span>
    </div>`;
  return `<div class="cf-toc-page">
    <div class="cf-toc-vert">Table of Contents</div>
    <div class="cf-toc-right">
      <div class="cf-toc-section">
        <div class="cf-toc-hdr">Featured</div>
        ${item('GenAI use case assessment','Healthcare · AI/Digital · Strategy','2',1,1)}
        ${item('Self-service BI tool design','Data/Digital · Product · UX','3',1,2)}
        ${item('Sales coverage model redesign','Tech · GTM · Sales · People &amp; Org','4',2,3)}
        ${item('Investment playbook &amp; executive workshop','Climate · Industrial Goods · Strategy','5',2,4)}
      </div>
      <div class="cf-toc-section">
        <div class="cf-toc-hdr">Additional Casework</div>
        ${item('Post M&amp;A GTM strategy','Industrial Goods · GTM · M&amp;A','6',3,5)}
        ${item('Non-profit alumni engagement program','User Research · Growth · Program Design','6',3,5)}
        ${item('Healthcare commission PMO','Public Sector · Healthcare · PMO','7',3,6)}
        ${item('GenAI use case proposal','Healthcare · AI/Digital · Sprint','7',3,6)}
      </div>
      <div class="cf-toc-section">
        <div class="cf-toc-hdr">Social Impact &amp; IP Development</div>
        ${item('State housing &amp; homelessness strategy','Public Sector · Social Impact','8',4,7)}
        ${item('Talent &amp; skills IP development','Future of Work · Thought Leadership','8',4,7)}
      </div>
    </div>
  </div>`;
}

function _cfFeaturedHTML(c) {
  const tagStrip = c.tags.join(' · ');
  const bullets = c.contribution.map(b=>`<li>${b}</li>`).join('');
  return `
    <div style="height:100%;display:flex;flex-direction:column;gap:0.22rem;overflow:hidden;font-size:0.82em;">
      <div style="flex-shrink:0;">
        <div class="cf-tag-strip" style="margin-bottom:0.1rem;">${tagStrip}</div>
        <div class="cf-feat-title">${c.title}</div>
        <div class="cf-metaline" style="margin-bottom:0.04rem;"><strong>Client:</strong> ${c.client}</div>
        <div class="cf-metaline" style="margin-bottom:0;"><strong>Skills:</strong> ${c.skills}</div>
      </div>
      <div style="flex-shrink:0;">
        <div class="cf-hdr">Executive Summary</div>
        <div class="cf-body">${c.summary}</div>
      </div>
      <div style="flex-shrink:0;">
        <div class="cf-hdr">Key Context</div>
        <div class="cf-body">${c.context}</div>
      </div>
      <div style="flex:1;min-height:0;overflow:hidden;">
        <div class="cf-hdr">Contribution</div>
        <ul class="cf-ul">${bullets}</ul>
      </div>
      <div class="cf-outcome-box" style="flex-shrink:0;padding:0.3rem 0.5rem;">
        <div class="cf-hdr">Outcome</div>
        <div class="cf-body">${c.outcome}</div>
        <hr class="cf-divider" style="margin:0.12rem 0;">
        <div class="cf-hdr">Learnings</div>
        <div class="cf-body">${c.learnings}</div>
      </div>
    </div>`;
}

function _cfCompactHTML(cases) {
  /* Two cases separated by a visible divider rule. Each has title divider + context/contribution/outcome. */
  const caseParts = cases.map(c => {
    const tagStrip2 = c.tags.join(' · ');
    const bullets2 = c.contribution.map(b=>`<li>${b}</li>`).join('');
    return `<div style="display:flex;flex-direction:column;overflow:hidden;min-height:0;gap:0.15rem;">
      <div style="flex-shrink:0;">
        <div class="cf-tag-strip" style="margin-bottom:0.06rem;">${tagStrip2}</div>
        <div class="cf-cmp-title">${c.title}</div>
        <div class="cf-metaline" style="margin-bottom:0;font-size:0.68rem;"><strong>Client:</strong> ${c.client} &nbsp;·&nbsp; <strong>Skills:</strong> ${c.skills}</div>
      </div>
      <div class="cf-cmp-row" style="flex:1;min-height:0;overflow:hidden;">
        <div style="overflow:hidden;"><div class="cf-hdr">Context</div><div class="cf-body">${c.context}</div></div>
        <div style="overflow:hidden;"><div class="cf-hdr">Contribution</div><ul class="cf-ul">${bullets2}</ul></div>
      </div>
      <div class="cf-outcome-box" style="padding:0.22rem 0.5rem;flex-shrink:0;"><div class="cf-hdr">Outcome</div><div class="cf-body">${c.outcome}</div></div>
    </div>`;
  });
  const joined = caseParts.join('<hr class="cf-case-sep">');
  return `<div style="height:100%;display:flex;flex-direction:column;gap:0;font-size:0.73em;justify-content:space-around;">${joined}</div>`;
}

// Filtered page list — hidden entries are preserved in CF_CASES but never rendered
const _CF_PAGES = CF_CASES.filter(c => !c.hidden);

function _cfPageHTML(idx) {
  if (idx === undefined || idx < 0 || idx >= _CF_PAGES.length) return '';
  const c = _CF_PAGES[idx];
  let inner = '';
  if (c.type === 'toc')      inner = _cfTocHTML();
  else if (c.type === 'featured') inner = _cfFeaturedHTML(c);
  else if (c.type === 'compact')  inner = _cfCompactHTML(c.cases);
  else return '';

  // TOC (idx 0): no page number. All other pages: number in bottom outer corner.
  // Even idx = right-hand page → number bottom-right; odd = left-hand → bottom-left.
  if (idx === 0) return inner;
  const pgNum = idx + 1;
  // Even idx = right-hand page (front) → number bottom-right
  // Odd idx  = left-hand page  (back)  → number bottom-left
  const side = idx % 2 === 0 ? 'right' : 'left';
  return `${inner}<span class="cf-pg-num cf-pg-num-${side}">${pgNum}</span>`;
}

/* Human-readable label for a case-files page, used for analytics */
/* Page 0 is the TOC (no event); pages 1-7 fire case_files_page_2 .. case_files_page_8 */
function _cfTrackPageView(idx) {
  if (idx >= 1) trackEvent(`case_files_page_${idx + 1}`, { page: _cfPageLabel(idx) });
}

function _cfPageLabel(idx) {
  const c = _CF_PAGES[idx];
  if (!c) return `page ${idx + 1}`;
  if (c.type === 'toc')      return 'TOC';
  if (c.type === 'featured') return c.title;
  if (c.type === 'compact')  return c.cases.map(x => x.title).join(' | ');
  return `page ${idx + 1}`;
}

/* Build/rebuild the scene at the current _cfPhysPage */
function _cfBuildScene() {
  const wrap = document.getElementById('cf-pages');
  wrap.innerHTML = '';
  if (!_cfIsMobile()) {
    const lp = document.createElement('div');
    lp.id = 'cf-left-page'; lp.className = 'cf-left-page';
    if (_cfPhysPage > 0) lp.innerHTML = _cfPageHTML(_cfBackIdx(_cfPhysPage - 1));
    wrap.appendChild(lp);
  }
  const rp = document.createElement('div');
  rp.id = 'cf-right-page'; rp.className = 'cf-right-page';
  const frontIdx = _cfIsMobile() ? _cfPhysPage : _cfFrontIdx(_cfPhysPage);
  rp.innerHTML = _cfPageHTML(frontIdx);
  wrap.appendChild(rp);
  _updateCfNav();
  _cfTrackPageView(frontIdx);
}

/* Jump directly to a page — desktopPhys for book spread, mobileIdx for single-page */
function cfJumpTo(desktopPhys, mobileIdx) {
  if (_cfFlipping) return;
  const target = _cfIsMobile() ? (mobileIdx ?? desktopPhys) : desktopPhys;
  _cfPhysPage = Math.max(0, Math.min(target, _cfNumPages() - 1));
  const frontIdx = _cfIsMobile() ? _cfPhysPage : _cfFrontIdx(_cfPhysPage);
  trackEvent('case_files_toc_jump', { page: _cfPageLabel(frontIdx), page_index: frontIdx + 1 });
  _cfBuildScene();
}

function _updateCfNav() {
  const total = _cfNumPages();
  const pg = `${_cfPhysPage + 1} / ${total}`;
  document.getElementById('cf-pagenum').textContent = pg;
  document.getElementById('cf-prev-arrow').disabled = _cfPhysPage === 0;
  document.getElementById('cf-next-arrow').disabled = _cfPhysPage === total - 1;
  document.getElementById('cf-toc-jump').classList.toggle('cf-toc-jump-hidden', _cfPhysPage === 0);
  // Mobile nav bar
  const mobPg  = document.getElementById('cf-mob-pagenum');
  const mobPrev = document.getElementById('cf-mob-prev');
  const mobNext = document.getElementById('cf-mob-next');
  if (mobPg)   mobPg.textContent = pg;
  if (mobPrev) mobPrev.disabled  = _cfPhysPage === 0;
  if (mobNext) mobNext.disabled  = _cfPhysPage === total - 1;
}

function _cfFlipMobile(dir) {
  const target = _cfPhysPage + dir;
  if (target < 0 || target >= _CF_PAGES.length) return;
  _cfPhysPage = target;
  const rp = document.getElementById('cf-right-page');
  rp.innerHTML = _cfPageHTML(_cfPhysPage);
  rp.scrollTop = 0;
  _updateCfNav();
  _cfTrackPageView(_cfPhysPage);
}

function _cfFlip(dir) {
  if (_cfFlipping) return;
  if (_cfIsMobile()) { _cfFlipMobile(dir); return; }

  const targetPhys = _cfPhysPage + dir;
  if (targetPhys < 0 || targetPhys >= _cfNumPages()) return;
  _cfFlipping = true;

  const wrap = document.getElementById('cf-pages');
  const lp   = document.getElementById('cf-left-page');
  const rp   = document.getElementById('cf-right-page');

  if (dir > 0) {
    // ── Forward flip ─────────────────────────────────────────
    rp.innerHTML = _cfPageHTML(_cfFrontIdx(targetPhys));

    const turner = document.createElement('div');
    turner.className = 'cf-turner';
    turner.innerHTML = `
      <div class="cf-turner-face">${_cfPageHTML(_cfFrontIdx(_cfPhysPage))}</div>
      <div class="cf-turner-back">${_cfPageHTML(_cfBackIdx(_cfPhysPage))}</div>`;
    wrap.appendChild(turner);

    requestAnimationFrame(() => requestAnimationFrame(() => turner.classList.add('flip-fwd')));

    setTimeout(() => {
      _cfPhysPage = targetPhys;
      lp.innerHTML = _cfPageHTML(_cfBackIdx(_cfPhysPage - 1));
      _updateCfNav();
      turner.remove();
      _cfFlipping = false;
      _cfTrackPageView(_cfFrontIdx(_cfPhysPage));
    }, 510);

  } else {
    // ── Back flip: reverse of forward ─────────────────────────
    // Turner starts at -180° (visually on the LEFT side, back face = old left page
    // content), then sweeps rightward to 0° where its FACE (destination right page)
    // lands on the right. rp is NOT updated until the turner reaches 0° and covers
    // it — updating rp at the start would cause the right page to snap to new content
    // before the animation begins (the turner can't cover rp from the left).
    lp.innerHTML = targetPhys > 0 ? _cfPageHTML(_cfBackIdx(targetPhys - 1)) : '';
    // rp intentionally left showing current content until the turner covers it

    const turner = document.createElement('div');
    turner.className = 'cf-turner cf-turner-rev';
    turner.innerHTML = `
      <div class="cf-turner-face">${_cfPageHTML(_cfFrontIdx(targetPhys))}</div>
      <div class="cf-turner-back">${_cfPageHTML(_cfBackIdx(targetPhys))}</div>`;
    wrap.appendChild(turner);

    requestAnimationFrame(() => requestAnimationFrame(() => turner.classList.add('flip-rev')));

    setTimeout(() => {
      _cfPhysPage = targetPhys;
      // Swap rp under the cover of the turner face (now at 0°, same content) — invisible to user
      rp.innerHTML = _cfPageHTML(_cfFrontIdx(targetPhys));
      _updateCfNav();
      turner.remove();
      _cfFlipping = false;
      _cfTrackPageView(_cfFrontIdx(_cfPhysPage));
    }, 510);
  }
}

let _cfNavLock = false;
function _cfSafe(fn) {
  return () => {
    if (_cfNavLock) return;
    _cfNavLock = true;
    fn();
    setTimeout(() => { _cfNavLock = false; }, 350);
  };
}

document.getElementById('cf-prev-arrow').addEventListener('click', _cfSafe(() => _cfFlip(-1)));
document.getElementById('cf-next-arrow').addEventListener('click', _cfSafe(() => _cfFlip(1)));
document.getElementById('cf-mob-prev').addEventListener('click', _cfSafe(() => _cfFlipMobile(-1)));
document.getElementById('cf-mob-next').addEventListener('click', _cfSafe(() => _cfFlipMobile(1)));
document.getElementById('cf-mob-toc').addEventListener('click', _cfSafe(() => cfJumpTo(0, 0)));
document.getElementById('cf-toc-jump').addEventListener('click', _cfSafe(() => cfJumpTo(0, 0)));

/* ── Mobile: swipe left/right on the page to flip ────────── */
(function() {
  const cfCard = document.querySelector('.casefiles-zoom-card');
  let startX = 0, startY = 0, tracking = false;
  cfCard.addEventListener('touchstart', e => {
    if (!_cfIsMobile() || e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });
  cfCard.addEventListener('touchend', e => {
    if (!tracking) return;
    tracking = false;
    if (!_cfIsMobile()) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    // Require a clearly horizontal swipe so vertical text scrolling isn't hijacked
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      _cfSafe(() => _cfFlipMobile(dx < 0 ? 1 : -1))();
    }
  }, { passive: true });
})();

/* ── Speaker / iPod zoom ─────────────────────────────────── */
const LOFI_CREDITS = {
  morning:   { name:'Morning Routine', artist:'Ghostrifter Official', license:'CC BY-SA 3.0 · chosic.com' },
  afternoon: { name:'Butterfly',       artist:'Purrple Cat',          license:'CC BY-SA 3.0 · chosic.com' },
  golden:    { name:'Golden Hour',     artist:'Purrple Cat',          license:'CC BY-SA 3.0 · chosic.com' },
  night:     { name:'Purple Dream',    artist:'Ghostrifter Official', license:'CC BY-ND 3.0 · chosic.com' },
  late:      { name:'Sonder',          artist:'Purrple Cat',          license:'CC BY-SA 3.0 · chosic.com' },
  weather:   { name:'Green Tea',       artist:'Purrple Cat',          license:'CC BY-SA 3.0 · chosic.com' },
};

function _updateIpodScreen() {
  const key = _lofiKey || 'afternoon';
  const info = LOFI_CREDITS[key] || {};
  const nameEl    = document.getElementById('ipod-track-name');
  const artistEl  = document.getElementById('ipod-track-artist');
  const licenseEl = document.getElementById('ipod-track-license');
  if (nameEl)    nameEl.textContent    = info.name    || '—';
  if (artistEl)  artistEl.textContent  = info.artist  || '—';
  if (licenseEl) licenseEl.textContent = info.license || '';
}

let _speakerZoomed = false;

/* Wire Spotify playback events → only pause lofi when Spotify plays.
   Lofi resumes explicitly via the iPod center button — not automatically
   (Spotify keeps running in bg after modal close, so auto-resume would fight it). */
function _wireSpotifyLofi(ctrl) {
  let _resumeTimer = null;
  ctrl.addListener('playback_update', (e) => {
    clearTimeout(_resumeTimer);
    _spotifyPlaying = !e.data.isPaused;
    if (!e.data.isPaused) {
      // Spotify starts playing → cut lofi instantly (zero overlap)
      if (_lofiAudio && !_lofiAudio.paused) {
        _lofiAudio.volume = 0;
        _lofiAudio.pause();
      }
      _syncMusicNotes();
    } else {
      // Spotify paused → resume lofi after 400ms (audio hw fully stops first),
      // unless the user manually silenced the music via the iPod button.
      _resumeTimer = setTimeout(() => {
        if (_lofiAudio && _lofiAudio.paused && !_lofiManuallyStopped) {
          _lofiAudio.volume = 0;
          _lofiAudio.play().then(() => { _fadeLofi(LOFI_VOL); _syncMusicNotes(); }).catch(() => {});
        } else {
          _syncMusicNotes();
        }
      }, 400);
    }
  });
}

/* Switch back to lofi explicitly (iPod center button) */
function _resumeLofi() {
  _lofiManuallyStopped = false;
  if (_spotifyCtrl) { try { _spotifyCtrl.pause(); } catch(e) {} }
  // Small delay to let Spotify fully stop before lofi starts
  setTimeout(() => {
    if (_lofiAudio) {
      _lofiAudio.volume = 0;
      _lofiAudio.play().then(() => { _fadeLofi(LOFI_VOL); _syncMusicNotes(); }).catch(() => {});
    }
  }, 300);
}

/* Pause lofi entirely — for users who don't want background music */
function _stopLofi() {
  _lofiManuallyStopped = true;
  if (!_lofiAudio || _lofiAudio.paused) { _syncMusicNotes(); return; }
  _fadeLofi(0, () => {
    if (_lofiAudio) _lofiAudio.pause();
    _syncMusicNotes();
  });
}

function openSpeakerZoom() {
  if (_speakerZoomed) return;
  _speakerZoomed = true;
  navMenu.classList.remove('open');

  _updateIpodScreen();

  // Ensure the embed host exists (created once, never reparented)
  _ensureSpotifyEl();

  // Init Spotify embed (don't auto-play — user starts playback from inside the embed)
  if (_spotifyCtrl) {
    // already initialized; just leave it as-is
  } else if (_spotifyAPI) {
    _spotifyAPI.createController(_spotifyEl, {
      width:'100%', height:'352',
      uri:'spotify:playlist:37i9dQZEVXdgEheV90pQ48',
    }, (ctrl) => {
      _spotifyCtrl = ctrl;
      _wireSpotifyLofi(ctrl);
    });
  } else {
    initSpotifyAPI();
  }

  // Visually move the (already-mounted) embed over the iPod screen slot —
  // no DOM reparenting, so the iframe never reloads. Wait until the zoom
  // overlay has actually faded in (0.45s, see .world-zoom-overlay.visible)
  // before placing/revealing it — placing it any earlier made the embed
  // flash into view in the wrong spot ahead of the modal itself.
  _zoomToHotspot('speaker', 2.2, () => {
    _openZoomUI('speaker-zoom-overlay', 'speaker-zoom-back');
    setTimeout(_placeSpotifyOverSlot, 460);
  }, '14%');
}

function closeSpeakerZoom() {
  if (!_speakerZoomed) return;
  _speakerZoomed = false;
  // Park embed off-screen (keep playing — bug fix)
  _parkSpotify();
  _closeZoomUI('speaker-zoom-overlay', 'speaker-zoom-back');
}
document.getElementById('speaker-zoom-back').addEventListener('click', closeSpeakerZoom);

/* ── Music / Record coverflow zoom ──────────────────────── */
const RECORD_TITLES = ['Rolling Sloans', 'South Side Free Music Program', 'Classical Origins'];
const N_RECORDS = 3;
let _musicZoomed = false;
let _musicCenter = 0; // Rolling Sloans starts in focus

/* Circular position: maps each slot's idx to -1, 0, or +1 relative to center.
   Uses modular arithmetic so the carousel wraps infinitely. */
function _setCoverflowPositions() {
  document.querySelectorAll('.record-slot').forEach(slot => {
    const idx = parseInt(slot.dataset.idx);
    // Raw distance: 0, 1, or 2. Map 2 → -1 (wrap around left)
    const raw = ((idx - _musicCenter) % N_RECORDS + N_RECORDS) % N_RECORDS;
    slot.dataset.pos = raw === 2 ? '-1' : String(raw);
  });
  document.getElementById('music-record-title').textContent = RECORD_TITLES[_musicCenter];
  // Never disable arrows — infinite circular carousel
  document.getElementById('music-prev').disabled = false;
  document.getElementById('music-next').disabled = false;
}

function openMusicZoom() {
  if (_musicZoomed) return;
  _musicZoomed = true;
  navMenu.classList.remove('open');
  _musicCenter = 0; // Rolling Sloans always first
  document.querySelectorAll('.record-card').forEach(c => c.classList.remove('flipped'));
  _setCoverflowPositions();
  _zoomToHotspot('piano', 2.2, () => _openZoomUI('music-zoom-overlay', 'music-zoom-back'), '56%');
}

function closeMusicZoom() {
  if (!_musicZoomed) return;
  _musicZoomed = false;
  _closeZoomUI('music-zoom-overlay', 'music-zoom-back');
}
document.getElementById('music-zoom-back').addEventListener('click', closeMusicZoom);

// Circular navigation — wraps infinitely
let _musicNavLock = false;
function _musicSafe(fn) {
  return () => {
    if (_musicNavLock) return;
    _musicNavLock = true;
    fn();
    setTimeout(() => { _musicNavLock = false; }, 350);
  };
}
document.getElementById('music-prev').addEventListener('click', _musicSafe(() => {
  _musicCenter = (_musicCenter - 1 + N_RECORDS) % N_RECORDS;
  document.querySelectorAll('.record-card').forEach(c => c.classList.remove('flipped'));
  _setCoverflowPositions();
}));
document.getElementById('music-next').addEventListener('click', _musicSafe(() => {
  _musicCenter = (_musicCenter + 1) % N_RECORDS;
  document.querySelectorAll('.record-card').forEach(c => c.classList.remove('flipped'));
  _setCoverflowPositions();
}));

// Click center record → flip front/back
document.querySelectorAll('.record-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    if (slot.dataset.pos !== '0') {
      // Clicking side record → bring it to center
      const idx = parseInt(slot.dataset.idx);
      _musicCenter = idx;
      document.querySelectorAll('.record-card').forEach(c => c.classList.remove('flipped'));
      _setCoverflowPositions();
    } else {
      // Clicking center record → flip
      const card = slot.querySelector('.record-card');
      card.classList.toggle('flipped');
    }
  });
});

/* ── About / Mirror zoom ─────────────────────────────────── */
let _aboutZoomed = false;

function openAboutZoom() {
  if (_aboutZoomed) return;
  _aboutZoomed = true;
  navMenu.classList.remove('open');
  _zoomToHotspot('mirror', 3.0, () => _openZoomUI('about-zoom-overlay', 'about-zoom-back'), '40%');
}

function closeAboutZoom() {
  if (!_aboutZoomed) return;
  _aboutZoomed = false;
  _closeZoomUI('about-zoom-overlay', 'about-zoom-back');
}
document.getElementById('about-zoom-back').addEventListener('click', closeAboutZoom);

/* ── Bookshelf zoom ──────────────────────────────────────── */
let _bookshelfZoomed = false;

function openBookshelfZoom() {
  if (_bookshelfZoomed) return;
  _bookshelfZoomed = true;
  navMenu.classList.remove('open');
  const hs = document.querySelector('[data-key="books"]');
  _zoomToHotspot('books', 2.2, () => _openZoomUI('bookshelf-zoom-overlay', 'bookshelf-zoom-back'));
}

function closeBookshelfZoom() {
  if (!_bookshelfZoomed) return;
  _bookshelfZoomed = false;
  _closeZoomUI('bookshelf-zoom-overlay', 'bookshelf-zoom-back');
}
document.getElementById('bookshelf-zoom-back').addEventListener('click', closeBookshelfZoom);

/* ── What's Next — 3 Doors ─────────────────────────────────── */
let _doorZoomed = false;

let _activeDoor = null;
function _buildDoorInfoHTML(data) {
  const lf = data.lookingFor.map(t=>`<li>${t}</li>`).join('');
  const db = data.dosBest.map(t=>`<li>${t}</li>`).join('');
  return `<div class="door-info-excited">${data.excited}</div>
    <div class="door-info-cols">
      <div class="door-info-col">
        <div class="door-info-hdr" style="color:${data.color}">Looking for</div>
        <ul class="door-info-list">${lf}</ul>
      </div>
      <div class="door-info-col">
        <div class="door-info-hdr" style="color:${data.color}">What I do best</div>
        <ul class="door-info-list">${db}</ul>
      </div>
    </div>`;
}

let _doorNavLock = false;
document.querySelectorAll('.door-col').forEach(col => {
  col.addEventListener('click', () => {
    if (_doorNavLock) return;
    _doorNavLock = true;
    setTimeout(() => { _doorNavLock = false; }, 350);

    const num = parseInt(col.dataset.door);
    const data = DOOR_DATA[num];
    const isMobile = window.innerWidth <= 480;

    if (isMobile) {
      // On mobile: use inline panel inside the clicked door col
      const inlinePanel = document.getElementById('door-inline-' + num);
      const inlineInner = inlinePanel.querySelector('.door-info-panel-inner');

      // Close all inline panels and door-open states
      document.querySelectorAll('.door-col').forEach(c => {
        c.classList.remove('door-open');
        const ip = document.getElementById('door-inline-' + c.dataset.door);
        if (ip) ip.classList.remove('open');
      });

      if (_activeDoor === num) {
        _activeDoor = null;
        return;
      }

      col.classList.add('door-open');
      _activeDoor = num;
      inlineInner.innerHTML = _buildDoorInfoHTML(data);
      inlineInner.style.borderTopColor = data.color;
      inlinePanel.classList.add('open');
    } else {
      // Desktop: shared panel below all doors
      const panel = document.getElementById('door-info-panel');
      const inner = document.getElementById('door-info-inner');

      if (_activeDoor === num) {
        col.classList.remove('door-open');
        panel.classList.remove('open');
        _activeDoor = null;
        return;
      }

      document.querySelectorAll('.door-col').forEach(c => c.classList.remove('door-open'));
      col.classList.add('door-open');
      _activeDoor = num;

      inner.innerHTML = _buildDoorInfoHTML(data);
      inner.style.borderTopColor = data.color;
      panel.classList.add('open');
    }
  });
});

function openDoorZoom() {
  if (_doorZoomed) return;
  _doorZoomed = true;
  navMenu.classList.remove('open');
  // Reset any open door on re-open
  _activeDoor = null;
  document.querySelectorAll('.door-col').forEach(c => c.classList.remove('door-open'));
  document.getElementById('door-info-panel').classList.remove('open');
  document.querySelectorAll('.door-inline-panel').forEach(p => p.classList.remove('open'));
  _zoomToHotspot('door', 2.2, () => _openZoomUI('door-zoom-overlay', 'door-zoom-back'), '50%');
}

function closeDoorZoom() {
  if (!_doorZoomed) return;
  _doorZoomed = false;
  _closeZoomUI('door-zoom-overlay', 'door-zoom-back');
}
document.getElementById('door-zoom-back').addEventListener('click', closeDoorZoom);

/* ── Tea zoom ──────────────────────────────────────────────── */
let _teaZoomed = false, _teaCarIdx = 0;

function _teaCarGoTo(idx) {
  const track = document.getElementById('tea-car-track');
  const dots = document.querySelectorAll('.tea-car-dot');
  if (!track) return;
  const slides = track.querySelectorAll('.tea-car-slide');
  if (idx < 0 || idx >= slides.length) return;
  _teaCarIdx = idx;
  track.style.transform = `translateX(-${idx * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === idx));
}

function openTeaZoom() {
  if (_teaZoomed) return;
  _teaZoomed = true;
  navMenu.classList.remove('open');
  _teaCarGoTo(0);
  _zoomToHotspot('teapot', 2.4, () => _openZoomUI('tea-zoom-overlay', 'tea-zoom-back'), '50%');
}
function closeTeaZoom() {
  if (!_teaZoomed) return;
  _teaZoomed = false;
  _closeZoomUI('tea-zoom-overlay', 'tea-zoom-back');
}
document.getElementById('tea-zoom-back').addEventListener('click', closeTeaZoom);
document.querySelector('.tea-car-prev').addEventListener('click', () => _teaCarGoTo(_teaCarIdx - 1));
document.querySelector('.tea-car-next').addEventListener('click', () => _teaCarGoTo(_teaCarIdx + 1));
document.querySelectorAll('.tea-car-dot').forEach(d => {
  d.addEventListener('click', () => _teaCarGoTo(parseInt(d.dataset.idx)));
});

/* ── Hobbies — kit bag zoom ──────────────────────────────── */
let _hobbiesZoomed = false;
let _activeHobby = null;

function openHobbiesZoom() {
  if (_hobbiesZoomed) return;
  _hobbiesZoomed = true;
  navMenu.classList.remove('open');
  _activeHobby = null;
  document.querySelectorAll('.hobby-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('hobbies-blurb-panel').classList.remove('open');
  _zoomToHotspot('hobbies', 2.2, () => _openZoomUI('hobbies-zoom-overlay', 'hobbies-zoom-back'), '60%');
}

function closeHobbiesZoom() {
  if (!_hobbiesZoomed) return;
  _hobbiesZoomed = false;
  _closeZoomUI('hobbies-zoom-overlay', 'hobbies-zoom-back');
}
document.getElementById('hobbies-zoom-back').addEventListener('click', closeHobbiesZoom);

/* ── Sticky Notes scatter zoom ──────────────────────────────── */
let _stickiesZoomed = false;
/* ── Community Polaroid Scatter ─────────────────────────────── */
let _communityZoomed = false;

function openCommunityZoom() {
  if (_communityZoomed) return;
  _communityZoomed = true;
  navMenu.classList.remove('open');
  _zoomToHotspot('polaroids', 1.8, () => {
    _openZoomUI('community-zoom-overlay', 'community-zoom-back');
    // Always start scrolled to top so CBC (Community Building Chair) card is first visible
    const overlay = document.getElementById('community-zoom-overlay');
    overlay.scrollTop = 0;
    requestAnimationFrame(() => { overlay.scrollTop = 0; });
  }, '50%');
}
function closeCommunityZoom() {
  if (!_communityZoomed) return;
  _communityZoomed = false;
  const panel = document.getElementById('community-blurb-panel');
  panel.classList.remove('open');
  document.querySelectorAll('.cpol').forEach(p => p.classList.remove('active'));
  _activeCpol = null;
  // Ensure panel is back in body (in case it was moved for mobile)
  if (!document.body.contains(panel) || panel.parentElement !== document.body) {
    document.body.appendChild(panel);
  }
  _closeZoomUI('community-zoom-overlay', 'community-zoom-back');
}
document.getElementById('community-zoom-back').addEventListener('click', closeCommunityZoom);

// Vibecoding project links inside community blurb → close community, open monitor at correct tab
document.getElementById('community-blurb-panel').addEventListener('click', e => {
  const link = e.target.closest('.com-proj-link');
  if (!link) {
    // On touch/mobile: tapping the panel itself (not a link) closes it
    if (window.innerWidth <= 1024) {
      e.stopPropagation();
      const panel = document.getElementById('community-blurb-panel');
      const pol = _activeCpol ? document.querySelector(`.cpol[data-key="${_activeCpol}"]`) : null;
      if (pol) pol.classList.remove('active');
      panel.classList.remove('open');
      _activeCpol = null;
      document.body.appendChild(panel);
    }
    return;
  }
  e.preventDefault();
  const projId = link.dataset.proj;
  // Close community overlay first
  closeCommunityZoom();
  // Open monitor/projects, then switch to the right tab
  setTimeout(() => {
    openMonitorZoom();
    setTimeout(() => {
      const tab = document.querySelector(`.browser-tab[data-tab="${projId}"]`);
      if (tab) tab.click();
    }, 600);
  }, 400);
});

// ── Photo navigation per polaroid ──
(function() {
  document.querySelectorAll('.cpol-photos').forEach(photos => {
    const imgs = Array.from(photos.querySelectorAll('.cpol-img'));
    if (imgs.length <= 1) {
      photos.querySelector('.cpol-prev').remove();
      photos.querySelector('.cpol-next').remove();
      const dotsEl = photos.querySelector('.cpol-dots');
      if (dotsEl) dotsEl.remove();
      return;
    }
    let cur = 0;
    let _lastTouchNav = 0; // timestamp of last touchend nav, to suppress synthetic click

    // Build dots
    const dotsEl = photos.querySelector('.cpol-dots');
    imgs.forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'cpol-dot' + (i === 0 ? ' active' : '');
      dotsEl.appendChild(d);
    });

    function goTo(n) {
      imgs[cur].classList.remove('active');
      dotsEl.children[cur].classList.remove('active');
      cur = (n + imgs.length) % imgs.length;
      imgs[cur].classList.add('active');
      dotsEl.children[cur].classList.add('active');
    }

    let _navLock = false;
    function safeGoTo(n) {
      if (_navLock) return;
      _navLock = true;
      goTo(n);
      setTimeout(() => { _navLock = false; }, 350);
    }

    function wireArrow(btn, dir) {
      // touchend: handle immediately + preventDefault kills the synthetic click
      btn.addEventListener('touchend', e => {
        e.stopPropagation();
        e.preventDefault();
        _lastTouchNav = Date.now();
        safeGoTo(cur + dir);
      });
      // click: desktop fallback — skip if a touchend just fired this within 600ms
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (Date.now() - _lastTouchNav < 600) return;
        safeGoTo(cur + dir);
      });
    }

    wireArrow(photos.querySelector('.cpol-prev'), -1);
    wireArrow(photos.querySelector('.cpol-next'),  1);
  });
})();

// ── Click polaroid → blurb (toggle like awards/hobbies) ──
let _activeCpol = null;

document.querySelectorAll('.cpol').forEach(pol => {
  pol.addEventListener('click', e => {
    const key  = pol.dataset.key;
    const data = COMMUNITY_DATA[key];
    if (!data) return;
    const panel = document.getElementById('community-blurb-panel');
    const isMobile = window.innerWidth <= 1024;

    // Clicking the already-active polaroid → deselect
    if (_activeCpol === key) {
      pol.classList.remove('active');
      panel.classList.remove('open');
      _activeCpol = null;
      // On mobile restore panel to original parent
      if (isMobile) {
        document.body.appendChild(panel);
      }
      return;
    }

    // Deselect any previously active polaroid
    document.querySelectorAll('.cpol').forEach(p => p.classList.remove('active'));
    pol.classList.add('active');
    _activeCpol = key;

    document.getElementById('com-blurb-title').textContent = data.title;
    document.getElementById('com-blurb-body').innerHTML  = data.body;

    // On mobile: move panel into scatter flow right after the clicked polaroid
    if (isMobile) {
      panel.classList.remove('open');
      pol.after(panel);
    }

    requestAnimationFrame(() => panel.classList.add('open'));
  });
});

function openStickiesZoom() {
  if (_stickiesZoomed) return;
  _stickiesZoomed = true;
  navMenu.classList.remove('open');
  _zoomToHotspot('stickynotes', 1.8, () => {
    _openZoomUI('stickies-zoom-overlay', 'stickies-zoom-back');
    // Always start scrolled to the top so the first sticky notes are visible
    const overlay = document.getElementById('stickies-zoom-overlay');
    overlay.scrollTop = 0;
    requestAnimationFrame(() => { overlay.scrollTop = 0; });
  }, '50%');
}
function closeStickiesZoom() {
  if (!_stickiesZoomed) return;
  _stickiesZoomed = false;
  _closeZoomUI('stickies-zoom-overlay', 'stickies-zoom-back');
}
document.getElementById('stickies-zoom-back').addEventListener('click', closeStickiesZoom);
document.getElementById('wm-zoom-back').addEventListener('click', closeModal);

document.querySelectorAll('.hobby-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.hobby;
    const data = HOBBY_DATA[key];
    if (!data) return;
    const panel = document.getElementById('hobbies-blurb-panel');
    const inner = document.getElementById('hobbies-blurb-inner');

    if (_activeHobby === key) {
      btn.classList.remove('active');
      panel.classList.remove('open');
      _activeHobby = null;
      return;
    }

    document.querySelectorAll('.hobby-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _activeHobby = key;

    inner.innerHTML = `
      <div class="hobbies-blurb-text">
        <h3>${data.name}</h3>
        ${data.desc}
      </div>
      <div class="hobbies-blurb-img"><img src="${data.img}" alt="${data.name}" style="object-position:${data.imgPos||'center center'};${data.imgRot ? `transform:rotate(${data.imgRot});` : ''}"></div>`;
    panel.classList.add('open');
  });
});

/* ── Monitor zoom ─────────────────────────────────────────── */
let _monitorZoomed = false;

function openMonitorZoom() {
  if (_monitorZoomed) return;
  _monitorZoomed = true;
  navMenu.classList.remove('open');

  const hs  = document.querySelector('[data-key="laptop"]');
  const pct = hs ? parseFloat(hs.style.left) / 100 : 0.46;
  const destX = clamp(-(imgW * pct - window.innerWidth * 0.5));

  // Render browser content into the monitor screen first
  renderBrowserInMonitor();
  _zoomToHotspot('laptop', 2.2, () => _openZoomUI('monitor-zoom-overlay', 'monitor-zoom-back'));
}

function closeMonitorZoom() {
  if (!_monitorZoomed) return;
  _monitorZoomed = false;
  _stopAllProjectVideos(document.getElementById('monitor-screen-content'));
  _closeZoomUI('monitor-zoom-overlay', 'monitor-zoom-back');
}
document.getElementById('monitor-zoom-back').addEventListener('click', closeMonitorZoom);

// ── Easter egg counter ─────────────────────────────────────────────────────
(function() {
  const EGGS = ['speaker','wardrobe','teapot','lamp','worldmap'];
  const found = new Set();

  function confettiBurst() {
    const colors = ['#ffd24d','#ff6b6b','#6bffb8','#6bc8ff','#e06bff','#ff9f40'];
    const origin = document.getElementById('egg-counter').getBoundingClientRect();
    const cx = origin.left + origin.width / 2;
    const cy = origin.top  + origin.height / 2;
    for (let i = 0; i < 36; i++) {
      const el = document.createElement('div');
      el.className = 'egg-confetti';
      const angle = (i / 36) * 360 + Math.random() * 10;
      const dist  = 80 + Math.random() * 120;
      const rad   = angle * Math.PI / 180;
      el.style.cssText = `
        left:${cx}px; top:${cy}px;
        background:${colors[i % colors.length]};
        --cx:${Math.cos(rad)*dist}px;
        --cy:${Math.sin(rad)*dist}px;
        --cr:${Math.random()*540-270}deg;
        animation-duration:${0.9+Math.random()*0.5}s;
        animation-delay:${Math.random()*0.15}s;
      `;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }

  function markEgg(key) {
    if (found.has(key)) return;
    found.add(key);
    document.getElementById('egg-count').textContent = found.size;

    const counter = document.getElementById('egg-counter');

    // Flash the counter above everything (including modals)
    counter.classList.add('egg-found');
    const allDone = found.size === EGGS.length;
    if (allDone) counter.classList.add('all-found');

    if (allDone) {
      setTimeout(confettiBurst, 150);
      setTimeout(confettiBurst, 600);
    }

    // After 2s return to normal z-index and color
    setTimeout(() => {
      counter.classList.remove('egg-found');
      if (allDone) counter.classList.remove('all-found');
    }, 2200);
  }

  // Hook into each trigger point
  // Speaker
  const origOpenSpeaker = window.openSpeakerZoom;
  window.openSpeakerZoom = function() { markEgg('speaker'); origOpenSpeaker && origOpenSpeaker.apply(this, arguments); };

  // Tea time
  const origOpenTea = window.openTeaZoom;
  window.openTeaZoom = function() { markEgg('teapot'); origOpenTea && origOpenTea.apply(this, arguments); };

  // Wardrobe & worldmap — hook into openModal
  const origOpenModal = window.openModal;
  window.openModal = function(key) {
    if (key === 'wardrobe') markEgg('wardrobe');
    if (key === 'worldmap') markEgg('worldmap');
    origOpenModal && origOpenModal.apply(this, arguments);
  };

  // Lamp toggle
  document.getElementById('hs-lamp-toggle').addEventListener('click', () => markEgg('lamp'), { capture: true });
})();

// Wire up Formspree submission
(function() {
  const FORMSPREE_ID = 'mvznagda';
  const form = document.getElementById('note-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('nf-name').value.trim();
    const subject  = document.getElementById('nf-subject').value.trim();
    const email    = document.getElementById('nf-email').value.trim();
    const linkedin = document.getElementById('nf-linkedin').value.trim();
    const msg      = document.getElementById('nf-msg').value.trim();
    const status   = document.getElementById('nf-status');
    const nameEl   = document.getElementById('nf-name');
    const emailEl  = document.getElementById('nf-email');
    const msgEl    = document.getElementById('nf-msg');

    // Reset any prior invalid-field highlighting
    [nameEl, emailEl, msgEl].forEach(el => { el.classList.remove('np-invalid'); });

    const missing = [];
    if (!name)  missing.push('name');
    if (!email) missing.push('email');
    if (!msg)   missing.push('message');

    if (missing.length) {
      const map = { name: nameEl, email: emailEl, message: msgEl };
      missing.forEach(field => map[field] && map[field].classList.add('np-invalid'));
      status.style.color = '#c05a2a';
      status.textContent = 'please fill in: ' + missing.join(', ');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailEl.classList.add('np-invalid');
      status.style.color = '#c05a2a';
      status.textContent = 'please enter a valid email address';
      return;
    }

    // Button class is `.np-send` (not `.note-send`) — the previous selector
    // mismatch made `btn` null, threw a silent TypeError on `btn.disabled`,
    // and killed this whole handler before anything could send or show
    // feedback. That's why "nothing happened" on click.
    const btn = form.querySelector('.np-send');
    if (!btn) return;
    const originalText = btn.textContent;
    btn.disabled = true; btn.style.opacity = '0.6'; btn.style.cursor = 'default';
    btn.textContent = 'sending…';
    status.style.color = '#8a6a3a';
    status.style.fontWeight = 'normal';
    status.textContent = 'sending your note…';

    if (FORMSPREE_ID === 'YOUR_FORM_ID') {
      const sub  = encodeURIComponent((subject||'note') + ' — from ' + name);
      const body = encodeURIComponent(`${msg}\n\n— ${name}\n${email}${linkedin?'\n'+linkedin:''}`);
      window.open(`mailto:susy.liu320@gmail.com?subject=${sub}&body=${body}`);
      status.style.color = '#7a5c2e'; status.textContent = '✓ opening email client — thanks, ' + name + '!';
      btn.textContent = 'sent ✓';
      return;
    }
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method:'POST', headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify({name,subject,email,linkedin,message:msg})
      });
      if (res.ok) {
        status.style.color = '#3a7a3a';
        status.style.fontWeight = 'bold';
        status.textContent = '✓ sent! thanks for reaching out, ' + name + ' 🌿';
        btn.textContent = 'sent ✓';
        btn.style.background = 'linear-gradient(135deg,#8fd18f,#5fae5f)';
        btn.style.color = '#1a3a1a';
        form.reset();
      } else throw new Error();
    } catch {
      status.style.color = '#c05a2a';
      status.style.fontWeight = 'bold';
      status.textContent = 'something went wrong — try susy.liu320@gmail.com directly';
      btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer';
      btn.textContent = originalText;
    }
  });
})();

function animateTo(destX,cb) {
  cancelAnimationFrame(rafId);
  const from=curX,dist=destX-from,dur=750,t0=performance.now();
  (function tick(now) {
    const p=Math.min((now-t0)/dur,1),e=p<0.5?2*p*p:-1+(4-2*p)*p;
    moveTo(from+dist*e);
    if(p<1){ rafId=requestAnimationFrame(tick); } else if(cb) cb();
  })(performance.now());
}

// Keep room + landing page in sync every minute
setInterval(() => { applyLighting(); applyLandingLighting(); }, 60000);

/* ============================================================
   LOFI MUSIC — time-of-day + weather-aware background tracks
============================================================ */
const LOFI_TRACKS = {
  morning:   'assets/audio/Morning-Routine-Lofi-Study-Music%28chosic.com%29.mp3',
  afternoon: 'assets/audio/Butterfly-chosic.com_.mp3',
  golden:    'assets/audio/Golden-Hour-chosic.com_.mp3',
  night:     'assets/audio/Ghostrifter-Official-Purple-Dream%28chosic.com%29.mp3',
  late:      'assets/audio/Sonder%28chosic.com%29.mp3',
  weather:   'assets/audio/purrple-cat-green-tea%28chosic.com%29.mp3',
};

let _lofiAudio = null;
let _lofiSrc   = null;
let _lofiKey   = null;  // current track key (for iPod display)
let _lofiManuallyStopped = false; // user pressed iPod center button to silence music
const LOFI_VOL = 0.32;

function _getLofiKey() {
  if (['rain','snow','fog','storm'].includes(currentWeather)) return 'weather';
  const lbl = getTimeCfg().label;
  if (lbl === 'morning')                           return 'morning';
  if (lbl === 'afternoon' || lbl === 'late afternoon') return 'afternoon';
  if (lbl === 'golden hour')                       return 'golden';
  if (lbl === 'dusk' || lbl === 'night')           return 'night';
  return 'late';
}

function _getLofiSrc() {
  if (['rain','snow','fog','storm'].includes(currentWeather)) return LOFI_TRACKS.weather;
  const lbl = getTimeCfg().label;
  if (lbl === 'morning')                      return LOFI_TRACKS.morning;
  if (lbl === 'afternoon' || lbl === 'late afternoon') return LOFI_TRACKS.afternoon;
  if (lbl === 'golden hour')                  return LOFI_TRACKS.golden;
  if (lbl === 'dusk' || lbl === 'night')      return LOFI_TRACKS.night;
  if (lbl === 'late night' || lbl === 'pre-dawn') return LOFI_TRACKS.late;
  return LOFI_TRACKS.afternoon;
}

function _fadeLofi(targetVol, onDone) {
  if (!_lofiAudio) return onDone && onDone();
  const step = targetVol > _lofiAudio.volume ? 0.015 : -0.015;
  const iv = setInterval(() => {
    const next = _lofiAudio.volume + step;
    if ((step > 0 && next >= targetVol) || (step < 0 && next <= targetVol)) {
      _lofiAudio.volume = Math.max(0, Math.min(1, targetVol));
      clearInterval(iv); if (onDone) onDone();
    } else {
      _lofiAudio.volume = Math.max(0, Math.min(1, next));
    }
  }, 40);
}

// Warm the audio cache for the track we'll most likely open with — kicked
// off as soon as the page loads (landing screen) so by the time the user
// clicks through the door, playback can start instantly instead of waiting
// on a multi-MB download. Best-effort: if the predicted track turns out to
// be wrong (e.g. weather sync changes the pick), startLofi() just falls
// back to a fresh fetch as before.
let _lofiPreload = null, _lofiPreloadSrc = null;
function _preloadLofi() {
  _lofiPreloadSrc = _getLofiSrc();
  _lofiPreload = new Audio();
  _lofiPreload.preload = 'auto';
  _lofiPreload.src = _lofiPreloadSrc;
  _lofiPreload.load();
}
setTimeout(_preloadLofi, 300);

function startLofi() {
  if (_lofiAudio) return;
  _lofiKey = _getLofiKey();
  _lofiSrc = LOFI_TRACKS[_lofiKey];
  if (_lofiPreload && _lofiPreloadSrc === _lofiSrc) {
    _lofiAudio = _lofiPreload;
  } else {
    _lofiAudio = new Audio();
    _lofiAudio.src = _lofiSrc;
  }
  _lofiAudio.loop = true;
  _lofiAudio.volume = 0;
  _lofiAudio.play().then(() => { _fadeLofi(LOFI_VOL); _syncMusicNotes(); }).catch(() => { _syncMusicNotes(); });
  _updateIpodScreen();
}

function switchLofi() {
  if (!_lofiAudio) return;
  const nextKey = _getLofiKey();
  const nextSrc = LOFI_TRACKS[nextKey];
  if (nextSrc === _lofiSrc) return;
  // If the user manually silenced the music, just remember the new track —
  // don't start playback back up behind their back.
  if (_lofiManuallyStopped) {
    _lofiKey = nextKey;
    _lofiSrc = nextSrc;
    _lofiAudio.src = nextSrc;
    _updateIpodScreen();
    return;
  }
  _fadeLofi(0, () => {
    _lofiKey = nextKey;
    _lofiSrc = nextSrc;
    _lofiAudio.src = nextSrc;
    _lofiAudio.play().then(() => { _fadeLofi(LOFI_VOL); _syncMusicNotes(); }).catch(() => {});
    _updateIpodScreen();
  });
}

// Hook switchLofi into weather and lighting changes
const _origSetWeather = setWeather;
setWeather = function(name) { _origSetWeather(name); switchLofi(); };
const _origApplyLighting = applyLighting;
applyLighting = function() { _origApplyLighting(); switchLofi(); };

/* ============================================================
   TEST MODE
============================================================ */
let testMode = false;
// _testOverrideHours and _testSkyOverride are declared with `var` near getTimeCfg above

document.getElementById('test-toggle').addEventListener('click', () => {
  testMode = !testMode;
  document.body.classList.toggle('test-mode', testMode);
});
document.getElementById('test-close').addEventListener('click', () => {
  testMode = false;
  document.body.classList.remove('test-mode');
});

document.querySelectorAll('.tp-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const group = btn.closest('.tp-group');
    const t = btn.dataset.test;

    // Reset all
    if (t === 'reset') {
      _testOverrideHours = null;
      _testSkyOverride   = null;
      _currentSkyAnim    = null;
      setWeather('clear');
      applyLighting();
      applyLandingLighting();
      // Re-apply real sky
      const realSky = getTimeCfg().sky;
      applySky(realSky);
      updateSkyAnims(realSky);
      document.querySelectorAll('.tp-item').forEach(b => b.classList.remove('active'));
      return;
    }

    // One-shot: flash button, fire animation, return
    if (btn.classList.contains('tp-oneshot')) {
      btn.classList.add('flash');
      setTimeout(() => btn.classList.remove('flash'), 600);
      if (t === 'tree-rustle') { _doRustle(); }
      if (t === 'lamp-flicker') {
        if (!lampOn) { lampOn = true; setLampOverlays(true); setTimeout(_doLampFlicker, 400); }
        else _doLampFlicker();
      }
      return;
    }

    // Grouped radio: toggle off if already active
    if (group) {
      const wasActive = btn.classList.contains('active');
      group.querySelectorAll('.tp-item').forEach(b => b.classList.remove('active'));
      if (!wasActive) btn.classList.add('active');

      // Time of day → overlays only, never touches sky
      if (btn.dataset.hours !== undefined) {
        _testOverrideHours = wasActive ? null : parseInt(btn.dataset.hours);
        applyLighting();        // updates room overlays
        applyLandingLighting(); // keeps landing page in sync
      }

      // Sky state → image + animations only, never touches time overlays
      if (btn.dataset.sky !== undefined) {
        _testSkyOverride = wasActive ? null : btn.dataset.sky;
        _currentSkyAnim  = null;
        const skyToUse = _testSkyOverride || getTimeCfg().sky;
        applySky(skyToUse);
        updateSkyAnims(skyToUse);
      }

      // Precipitation
      if (btn.dataset.wx !== undefined) {
        setWeather(wasActive ? 'clear' : btn.dataset.wx);
      }
    }
  });
});

/* ============================================================
   SPOTIFY  —  official iFrame API
   https://developer.spotify.com/documentation/embeds/references/iframe-api
   We pre-load the API script on room entry, keep a single embed element
   alive in #spotify-bg between opens, and call ctrl.play() via the API.
============================================================ */
let _spotifyAPI  = null;   // IFrameAPI object once script loads
let _spotifyCtrl = null;   // EmbedController, created once
let _spotifyEl   = null;   // the div Spotify renders its iframe into
let _spotifyPlaying = false; // is Spotify currently audible?

function initSpotifyAPI() {
  if (document.getElementById('spotify-api-script')) return;
  // Set up callback BEFORE adding script so it fires reliably
  window.onSpotifyIframeApiReady = (IFrameAPI) => { _spotifyAPI = IFrameAPI; };
  const s = document.createElement('script');
  s.id  = 'spotify-api-script';
  s.src = 'https://open.spotify.com/embed/iframe-api/v1';
  s.async = true;
  document.head.appendChild(s);
}

/* Create the embed host div once, permanently inside #spotify-bg.
   It is NEVER reparented again — moving an <iframe> via appendChild
   forces the browser to reload it, which is what caused the
   "wrong track plays" / "stops after closing" bugs. Instead we
   visually relocate #spotify-bg itself with fixed positioning. */
function _ensureSpotifyEl() {
  if (!_spotifyEl) {
    _spotifyEl = document.createElement('div');
    document.getElementById('spotify-bg').appendChild(_spotifyEl);
  }
}

/* Move (visually, via CSS) the Spotify embed to sit on top of the
   iPod screen slot. No DOM reparenting — the iframe never reloads. */
function _placeSpotifyOverSlot() {
  const bg   = document.getElementById('spotify-bg');
  const slot = document.getElementById('ipod-spotify-slot');
  if (!bg || !slot) return;
  const r = slot.getBoundingClientRect();
  bg.style.top    = r.top + 'px';
  bg.style.left   = r.left + 'px';
  bg.style.bottom = 'auto';
  bg.style.width  = r.width + 'px';
  bg.style.height = r.height + 'px';
  bg.style.opacity = '1';
  bg.style.pointerEvents = 'auto';
  bg.style.zIndex = '192';
  bg.style.borderRadius = '0 0 10px 10px';
}

/* Park the embed off-screen again (still mounted + still playing). */
function _parkSpotify() {
  const bg = document.getElementById('spotify-bg');
  if (!bg) return;
  bg.style.top    = 'auto';
  bg.style.left   = '0';
  bg.style.bottom = '0';
  bg.style.width  = '320px';
  bg.style.height = '380px';
  bg.style.opacity = '0.001';
  bg.style.pointerEvents = 'none';
  bg.style.zIndex = '-1';
  bg.style.borderRadius = '0';
}

// Keep the embed aligned with the iPod slot if the window resizes while open
window.addEventListener('resize', () => { if (_speakerZoomed) _placeSpotifyOverSlot(); });

/* ============================================================
   SCROLL TO PAN
   Mouse wheel and trackpad two-finger scroll both pan the room.
   deltaX = horizontal swipe (trackpad), deltaY = wheel or vertical swipe.
   We use whichever axis has more magnitude.
============================================================ */
container.addEventListener('wheel', e => {
  e.preventDefault();
  cancelAnimationFrame(rafId);
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  moveTo(curX - delta * 0.85);
  vel = -delta * 0.22; // hand off to momentum
  momentum();
}, { passive: false });

/* ============================================================
   AMBIENT ANIMATIONS
============================================================ */

// --- Weather-aware animation state ---
// Slows/pauses animations based on current conditions.
// Call updateAmbientWeather('rain'|'clear'|'cloudy'|'night') to change.
let ambientState = 'clear';
let leavesEnabled = true;
function updateAmbientWeather(state) {
  ambientState = state;
  const clouds = document.querySelectorAll('.cloud');
  const rain   = document.getElementById('ov-rain');

  if (state === 'rain') {
    clouds.forEach(c => { c.style.opacity = '0.75'; c.style.animationPlayState = 'running'; });
    rain.style.opacity = '0.9';
    leavesEnabled = false; // no leaves in rain
  } else if (state === 'night') {
    clouds.forEach(c => { c.style.opacity = '0.12'; c.style.animationDuration = (parseFloat(getComputedStyle(c).animationDuration)*1.8)+'s'; });
    leavesEnabled = false;
  } else if (state === 'cloudy') {
    clouds.forEach(c => { c.style.opacity = String(Math.min(0.9, parseFloat(c.style.opacity || '0.4') * 1.5)); });
    leavesEnabled = true;
  } else {
    rain.style.opacity = '0';
    leavesEnabled = true;
  }
}

/* ============================================================
   FALLING LEAVES
============================================================ */
const LEAF_COLORS = [
  'rgba(110,158,55,0.75)', 'rgba(88,142,42,0.70)', 'rgba(138,175,62,0.68)',
  'rgba(168,158,55,0.65)', 'rgba(98,148,48,0.72)', 'rgba(152,172,68,0.60)',
];
function spawnLeaf() {
  if (!leavesEnabled || ambientState === 'night' || ambientState === 'rain') {
    scheduleLeaf(); return;
  }
  const anim = document.getElementById('window-anim');
  if (!anim) { scheduleLeaf(); return; }

  const leaf = document.createElement('div');
  leaf.className = 'leaf';
  const h    = anim.offsetHeight || 300;
  const size = 6 + Math.random() * 9;
  const sway = (Math.random() - 0.45) * 90;
  const spin = 100 + Math.random() * 280;
  const dur  = 3200 + Math.random() * 4200;
  leaf.style.cssText = `
    left:${4 + Math.random() * 90}%;
    top:-14px;
    width:${size}px;
    height:${size * 1.55}px;
    background:${LEAF_COLORS[Math.floor(Math.random()*LEAF_COLORS.length)]};
    --lfy:${h + 20}px;
    --lfx:${sway}px;
    --lfr:${spin}deg;
    animation-duration:${dur}ms;
  `;
  anim.appendChild(leaf);
  setTimeout(() => leaf.remove(), dur + 200);
  scheduleLeaf();
}
function scheduleLeaf() {
  setTimeout(spawnLeaf, 900 + Math.random() * 2200);
}
// Kick off after entering room (leaf fall removed)
setTimeout(() => {
  if (document.body.classList.contains('room-entered')) {
    _scheduleRustle();
  } else {
    document.getElementById('entry-door').addEventListener('click', () => {
      setTimeout(_scheduleRustle, 5000 + Math.random() * 20000);
    }, { once:true });
  }
}, 3000);

// Sync with time-of-day
function syncAmbientToTime() {
  const h = new Date().getHours();
  const goldenCfg = TIME_CONFIGS.find(c=>c.label==='golden hour');
  const duskCfg   = TIME_CONFIGS.find(c=>c.label==='dusk');
  const nightCfg  = TIME_CONFIGS.find(c=>c.label==='night');
  const goldenStart = goldenCfg ? Math.min(...goldenCfg.hours) : 17;
  const duskStart   = duskCfg   ? Math.min(...duskCfg.hours)   : 19;
  // Cap nightStart at 22 — never later than 10pm regardless of sunset time
  const nightStart  = Math.min(nightCfg  ? Math.min(...nightCfg.hours)  : 21, 22);
  if      (h >= nightStart || h < 5) updateAmbientWeather('night');
  else if (h >= duskStart)           updateAmbientWeather('clear');
  else if (h >= goldenStart)         updateAmbientWeather('clear');
  else if (h >= 10)                  updateAmbientWeather('clear');
  else                               updateAmbientWeather('cloudy');
}

// --- Sunrise/sunset sync ---
// Fetches real sunrise/sunset for user's location and adjusts TIME_CONFIGS
// so golden hour & dusk align to actual astronomical times.
function _applySunTimes(sunriseHour, sunsetHour) {
  // Golden hour: 1.5h before sunset (hour before it starts getting golden)
  const goldenStart = Math.round(sunsetHour - 1.5);
  const goldenEnd   = Math.round(sunsetHour - 0.5);
  // Dusk: at sunset and 1h after
  const duskStart   = Math.round(sunsetHour);
  const duskEnd     = Math.round(sunsetHour + 1);
  // Night: 1.5h after sunset, but never later than 10pm
  const nightStart  = Math.min(Math.round(sunsetHour + 1.5), 22);

  const goldenCfg = TIME_CONFIGS.find(c=>c.label==='golden hour');
  const duskCfg   = TIME_CONFIGS.find(c=>c.label==='dusk');
  const nightCfg  = TIME_CONFIGS.find(c=>c.label==='night');

  function rangeHours(from, to) {
    const h=[]; for(let i=from;i<=to;i++) h.push(i); return h;
  }

  if (goldenCfg) goldenCfg.hours = rangeHours(goldenStart, goldenEnd);
  if (duskCfg)   duskCfg.hours   = rangeHours(duskStart,   duskEnd);
  if (nightCfg)  nightCfg.hours  = rangeHours(nightStart, Math.min(nightStart+3, 23));

  // Re-apply lighting in case the current hour now maps to a different config
  applyLighting();
  syncAmbientToTime();
}

function _fetchSunTimes() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`)
      .then(r => r.json())
      .then(data => {
        if (data.status !== 'OK') return;
        const sunrise = new Date(data.results.sunrise);
        const sunset  = new Date(data.results.sunset);
        // Convert UTC to local hour (fractional)
        const sunriseHour = sunrise.getHours() + sunrise.getMinutes()/60;
        const sunsetHour  = sunset.getHours()  + sunset.getMinutes()/60;
        _applySunTimes(sunriseHour, sunsetHour);
      })
      .catch(() => {}); // silently fail — use default hours
  }, () => {}); // if geolocation denied, use defaults
}

// Call after room is entered
setTimeout(syncAmbientToTime, 2500);
setTimeout(_fetchSunTimes, 3000);

// --- Birds ---
let birdsEnabled = false; // birds disabled

function spawnBird() {
  if (!birdsEnabled || ambientState === 'rain' || ambientState === 'night') {
    scheduleBird(); return;
  }
  const anim = document.getElementById('window-anim');
  if (!anim) return;

  const goRight = Math.random() > 0.35;
  const bird = document.createElement('div');
  bird.className = 'bird';
  bird.innerHTML = `<div class="bird-body"><div class="bird-wing-l"></div><div class="bird-wing-r"></div></div>`;

  const topPct = 5 + Math.random() * 38;
  const scaleX = goRight ? 1 : -1;
  const winW = anim.offsetWidth + 80;

  bird.style.cssText = `top:${topPct}%; left:${goRight ? '-30px' : 'calc(100% + 10px)'}; transform:scaleX(${scaleX});`;
  anim.appendChild(bird);

  const dur = 2800 + Math.random() * 2200;
  bird.animate(
    [{ transform:`scaleX(${scaleX}) translateX(0)` },
     { transform:`scaleX(${scaleX}) translateX(${goRight ? winW : -winW}px)` }],
    { duration: dur, easing: 'linear', fill: 'forwards' }
  );

  // Shadow sweeps across the room floor
  const shadow = document.getElementById('bird-shadow');
  if (shadow) {
    const fromPct = goRight ? '12%' : '82%';
    const toPct   = goRight ? '82%' : '12%';
    shadow.animate(
      [{ left: fromPct, opacity: 0.7 }, { left: toPct, opacity: 0 }],
      { duration: dur * 0.65, delay: dur * 0.12, easing: 'ease-in', fill: 'forwards' }
    );
  }

  setTimeout(() => bird.remove(), dur + 150);
  scheduleBird();
}

function scheduleBird() {
  const delay = 28000 + Math.random() * 55000; // every 28–83 seconds
  setTimeout(spawnBird, delay);
}
// First bird 10s after entering
setTimeout(() => { if (document.body.classList.contains('room-entered')) spawnBird(); else setTimeout(spawnBird, 10000); }, 10000);

// --- Dust motes in light beam ---
// Spawned once; each mote loops indefinitely with random delay
function spawnDustMotes() {
  const wrap = document.getElementById('room-wrapper');
  if (!wrap) return;
  for (let i = 0; i < 10; i++) {
    const m = document.createElement('div');
    m.className = 'room-mote';
    // Position in the window light spill area
    const lx = 14 + Math.random() * 24; // % of image width
    const ty = 36 + Math.random() * 28; // % of viewport
    m.style.cssText = `
      left: ${lx}%;
      top: ${ty}%;
      --mdx: ${(Math.random() - 0.5) * 38}px;
      animation-duration: ${5 + Math.random() * 9}s;
      animation-delay: -${Math.random() * 12}s;
      opacity: 0;
    `;
    wrap.appendChild(m);
  }
}
// Spawn after room image has loaded
img.addEventListener('load', spawnDustMotes);

/* ============================================================
   PREFETCH — warm the browser cache for assets that aren't
   needed for the very first paint, in priority order:
     1. Tour assets (Awards + Projects) — seen by every tour-taker
     2. Other visible hotspots (Community, Hobbies, About, Bookshelf)
     3. Easter eggs (Tea) — found by curious users only, lowest priority
============================================================ */
const PREFETCH_TIERS = [
  // Tier 1 — tour assets
  [
    'assets/images/trophies/mens-et-manus-detail.webp',
    'assets/images/trophies/genai-lab-detail.webp',
    'assets/images/trophies/deans-list-detail.webp',
    'assets/images/Projects/DressingRoom/me and kar shin.jpg',
    'assets/images/Projects/DressingRoom/fuse.webp',
    'assets/images/Projects/DressingRoom/IIA pitch.jpg',
    'assets/images/Projects/BeaverBid/beaver bid 1.webp',
    'assets/images/Projects/BeaverBid/beaver bid 2.webp',
    'assets/images/Projects/BeaverBid/beaver bid 3.webp',
    'assets/images/Projects/WhereAbout/Wherabout 1.webp',
    'assets/images/Projects/WhereAbout/WhereAbout 2.webp',
    'assets/images/Projects/WhereAbout/Wherabout 3.webp',
    'assets/images/Projects/Friendsgiving/Friendsgiving1.webp',
    'assets/images/Projects/Friendsgiving/Friendsgiving2.webp',
    'assets/images/Projects/Friendsgiving/Friendsgiving3.webp',
  ],
  // Tier 2 — other visible hotspots (community, hobbies, about, bookshelf)
  [
    'assets/images/about.jpg',
    'assets/images/bookshelf.webp',
    'assets/images/kit bag.webp',
    'assets/images/community/Atlantic/atlantic mixer.webp',
    'assets/images/community/Atlantic/atlantic holiday party.webp',
    'assets/images/community/Atlantic/snowball.webp',
    'assets/images/community/Atlantic/bodaborg.webp',
    'assets/images/community/Atlantic/friendsgiving.webp',
    'assets/images/community/Pre-fx director/pre-fx.webp',
    'assets/images/community/bcg lucky strike.jpg',
    'assets/images/community/Sloan trips/acadia1.webp',
    'assets/images/community/Sloan trips/NOLA.webp',
    'assets/images/community/Sloan trips/atlantic retreat.webp',
    'assets/images/hobbies/run.webp',
    'assets/images/hobbies/Music.webp',
    'assets/images/hobbies/DSCF2330-2.webp',
    'assets/images/hobbies/dance.webp',
    'assets/images/hobbies/soccer.webp',
    'assets/images/hobbies/ping pong.webp',
    'assets/images/hobbies/volleyball.webp',
  ],
  // Tier 3 — easter eggs (tea time)
  [
    'assets/images/tea/cny.webp',
    'assets/images/tea/tea china.webp',
  ],
];

function prefetchAssets() {
  const tiers = PREFETCH_TIERS.flat();
  let i = 0;
  function loadNext(deadline) {
    while (i < tiers.length && (!deadline || deadline.timeRemaining() > 0)) {
      const im = new Image();
      im.fetchPriority = 'low';
      im.src = tiers[i++];
    }
    if (i < tiers.length) scheduleIdle(loadNext);
  }
  const scheduleIdle = window.requestIdleCallback
    ? cb => requestIdleCallback(cb, { timeout: 2000 })
    : cb => setTimeout(() => cb(null), 200);
  scheduleIdle(loadNext);
}
// Wait until the room has finished loading so this never competes
// with the assets the user sees first.
window.addEventListener('load', () => setTimeout(prefetchAssets, 1500));
if (img.complete) setTimeout(spawnDustMotes, 100);
