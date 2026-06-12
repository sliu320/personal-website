/* ============================================================
   PROJECT TAB DATA — edit all project content here

   Each entry = one browser tab. Fields:
     id          — unique key, used for URL + deep-linking
     tab         — tab label shown in browser chrome
     title       — large heading inside the panel
     tags        — small tag pills shown under the title
     desc        — italic one-liner shown under the tags rule
     customContent — full HTML for the panel body

   Section structure (proj-sections grid):
     data-s="problem"   — full width, warm callout
     data-s="built"     — left column; opens with .proj-built-lead, then <ul> of MY contributions
     proj-rhs-stack     — right column wrapper (single shared left border)
       data-s="outcome"   — stat chips via .proj-stat-chips / .proj-stat-chip (.hi for highlights)
       data-s="learnings" — prose takeaway
============================================================ */

const PROJECTS_DATA = [
  {
    id: 'overview', tab: '🗂 All Projects',
    title: 'Projects',
    tags: [],
    desc: '',
    customContent: `
      <div class="proj-overview">
        <div class="proj-bucket">
          <div class="proj-bucket-label">Featured</div>
          <div class="proj-bucket-links">
            <a class="proj-bucket-link" data-goto="genai">
              <span class="proj-bucket-link-name">🤖 GenAI Lab</span>
              <span class="proj-bucket-link-sub">Automated a regulated water utility's engineering workflow — 30 min → 45 sec. Best Project, MIT GenAI Lab.</span>
            </a>
            <a class="proj-bucket-link" data-goto="dressingroom">
              <span class="proj-bucket-link-name">👗 DressingRoom</span>
              <span class="proj-bucket-link-sub">AI-powered visual e-commerce startup. MIT FUSE accelerator, IIA AI Summit. Sunset after 4 months — a lot learned.</span>
            </a>
            <a class="proj-bucket-link" data-goto="foodgroups">
              <span class="proj-bucket-link-name">🥗 FoodGroups</span>
              <span class="proj-bucket-link-sub">Personalized gut-health companion concept built in one week. Semi-finalist, Google PM Hackathon.</span>
            </a>
            <a class="proj-bucket-link" data-goto="bidding">
              <span class="proj-bucket-link-name">📚 BeaverBid</span>
              <span class="proj-bucket-link-sub">Course research and bidding tool for MIT Sloan students. Top 5, Hack for Sloan.</span>
            </a>
          </div>
        </div>
        <div class="proj-bucket">
          <div class="proj-bucket-label">What I'm working on now</div>
          <div class="proj-bucket-links">
            <a class="proj-bucket-link" data-goto="monitor">
              <span class="proj-bucket-link-name">🤝 Relationship OS</span>
              <span class="proj-bucket-link-sub">Fully automated personal CRM built on Notion. V1 live; V2 on the roadmap.</span>
            </a>
          </div>
        </div>
        <div class="proj-bucket">
          <div class="proj-bucket-label">Things I built for my community</div>
          <div class="proj-bucket-links">
            <a class="proj-bucket-link" data-goto="whereabout">
              <span class="proj-bucket-link-name">📍 WhereAbout</span>
              <span class="proj-bucket-link-sub">Social GeoGuessr app for the Atlantic Ocean cohort.</span>
            </a>
            <a class="proj-bucket-link" data-goto="friendsgiving">
              <span class="proj-bucket-link-name">🦃 Friendsgiving</span>
              <span class="proj-bucket-link-sub">Grattitude jar for the Atlantic Ocean Friendsgiving.</span>
            </a>
          </div>
        </div>
      </div>`,
  },

  // ── GenAI Lab ──────────────────────────────────────────────
  {
    id: 'genai', tab: '🤖 GenAI Lab',
    title: 'GenAI Lab Best Project',
    tags: ['LLM', 'Computer Vision', 'MIT Sloan', 'Best Project 🏆'],
    desc: 'Automated a high-stakes engineering workflow for a regulated water utility. 30 minutes → 45 seconds, with human oversight built in by design. Worked with two teammates with data and software engineering backgrounds.',
    customContent: `
      <div class="proj-sections">
        <div class="proj-section" data-s="problem">
          <div class="proj-section-label">Problem</div>
          <div class="proj-section-body">Client issues ~600 Statements of Available Pressure per year — technical packets developers need to plan water connections. Each took ~1 hour across two engineers: find the right hydrant in GIS, calculate pressure in Excel, generate a Word doc. 600+ hours of repetitive, low-judgment work annually, with no standardized QA, in a regulated environment where accuracy is non-negotiable.</div>
        </div>
        <div class="proj-section" data-s="built">
          <div class="proj-section-label">What I Built</div>
          <div class="proj-section-body"><span class="proj-built-lead">End-to-end automation pipeline: vision LLM reads site plans, scoring algorithm selects the right hydrant, deterministic hydraulic logic generates the output.</span>
          <ul>
            <li>Key contribution: Designed intuitive UI/UX with human-in-the-loop flagging and intermediate steps visible, incl. site plans and pressure calculation outputs. LLM QA justification report and top-5 options on every run keep the engineer in charge with no silent hallucinations</li>
            <li>Key contribution: Prepared presentation, talk track, and demo to tell a compelling story on pitch day</li>
            <li>Hydrant scoring scheme: 3-tier geocoding fallback + multi-factor scoring on distance, pipe diameter, and street alignment — replicating engineer judgment, not just proximity</li>
            <li>All hydraulic calculations kept outside the LLM so outputs stay fully auditable in a regulated context</li>

          </ul></div>
        </div>
        <div class="proj-rhs-stack">
          <div class="proj-section" data-s="outcome">
            <div class="proj-section-label">Outcome</div>
            <div class="proj-section-body"><div class="proj-stat-chips">
              <span class="proj-stat-chip hi">🏆 Best Project, MIT GenAI Lab</span>
              <span class="proj-stat-chip">30 min → 45 sec</span>
              <span class="proj-stat-chip">93.3% accuracy</span>
              <span class="proj-stat-chip">~$1.30/run</span>
              <span class="proj-stat-chip">~600 hrs/yr saved</span>
            </div></div>
          </div>
          <div class="proj-section" data-s="learnings">
            <div class="proj-section-label">Learnings</div>
            <div class="proj-section-body"><ul>
              <li>In regulated industries, the goal isn't to replace the engineer — it's to eliminate the parts that don't require judgment. Keeping logic deterministic made results trustworthy to the client.</li> 
              <li>Developing a product with vibecoding tools requires a lot of discipline when scoping and developing features to ensure the output is not a blackbox and legible for handover</li>
              <ul></div>
          </div>
        </div>
      </div>`,
  },

  // ── DressingRoom ───────────────────────────────────────────
  {
    id: 'dressingroom', tab: '👗 DressingRoom',
    title: 'DressingRoom',
    tags: ['Startup', 'Entrepreneurship', 'Consumer', 'MIT FUSE', 'Fashion Tech'],
    desc: 'An AI-powered visual ecommerce startup I co-founded with a fellow Sloan MBA. MIT FUSE accelerator, Imagination in Action AI Summit. Sunset after ~4 months — a lot learned along the way.',
    customContent: `
      <div class="proj-inner-tabs">
        <button class="proj-inner-tab active" data-inner="dr-content">📋 Overview</button>
        <button class="proj-inner-tab" data-inner="dr-video">🎬 Video</button>
        <button class="proj-inner-tab" data-inner="dr-pitch">📊 Pitch Deck</button>
        <button class="proj-inner-tab" data-inner="dr-story">📍 Journey</button>
      </div>
      <div class="proj-inner-panel active" id="inner-dr-content">
        <div class="proj-sections">
          <div class="proj-section" data-s="problem">
            <div class="proj-section-label">Problem</div>
            <div class="proj-section-body">Young professionals have disposable income but no time to shop intentionally. They struggle to articulate their style, can't translate it to specific products, and are overwhelmed by volume. GenAI and diffusion models enables a truly personalized shopping experience at scale that can translate visual langauge and close the gap between inspiration and purchase.</div>
          </div>
          <div class="proj-section" data-s="built">
            <div class="proj-section-label">What I Built</div>
            <div class="proj-section-body"><span class="proj-built-lead">Designed a product and co-built a prototype that decodes personal style from Instagram posts + follows and generates curated clothing collections with AI try-ons.</span>
            <ul>
              <li>Led 100+ customer discovery interviews through MIT FUSE; won <strong>Top Banana</strong> (most PMR in a cohort of 50+ teams)</li>
              <li>Conducted competitor analysis and articulated product differentiation--no high friction text chats or dead links, and no burden on user to describe their style</li>
              <li>Led pitch materials and pitched at IIA AI Summit</li>
            </ul></div>
          </div>
          <div class="proj-rhs-stack">
            <div class="proj-section" data-s="outcome">
              <div class="proj-section-label">Outcome</div>
              <div class="proj-section-body"><div class="proj-stat-chips">
                <span class="proj-stat-chip">100+ interviews</span>
                <span class="proj-stat-chip">MIT FUSE accelerator</span>
                <span class="proj-stat-chip">$1.5K MIT Sandbox grant</span>
                <span class="proj-stat-chip">IIA AI Summit</span>
                <span class="proj-stat-chip">Prototype developed</span>
                <span class="proj-stat-chip hi">Sunset after 4 months</span>
              </div></div>
            </div>
            <div class="proj-section" data-s="learnings">
              <div class="proj-section-label">Learnings</div>
              <div class="proj-section-body"><ul>
                <li>Passion is a prerequisite — after some pivots, we couldn't give the idea 100%, and we had to be honest about it</li>
                <li>GenAI levels the playing field on domain and technical knowledge to an extent, but two MBAs with overlapping skills still lacked a co-founder who would truly bring an unfair advantage</li>
                <li>Building for consumer is tough given CAC, but we were passionate about building for people, not businesses, and stuck with our starting point</li>
              </ul></div>
            </div>
          </div>
        </div>
      </div>
      <div class="proj-inner-panel" id="inner-dr-video">
        <div class="proj-embed-wrap" style="transform:rotate(-0.4deg)">
          <div style="position:relative;width:100%;height:0;padding-top:56.25%;overflow:hidden;">
            <iframe loading="lazy" style="position:absolute;width:100%;height:100%;top:0;left:0;border:none;border-radius:3px;"
              src="https://www.canva.com/design/DAHFeOG-ESU/xeE9q3Fw0cl7DxgtiatpeA/watch?embed"
              allowfullscreen allow="fullscreen"></iframe>
          </div>
        </div>
      </div>
      <div class="proj-inner-panel" id="inner-dr-pitch">
        <div class="proj-embed-wrap" style="transform:rotate(0.3deg)">
          <iframe src="https://1drv.ms/p/c/a0428aea2d954231/IQTpHhZS7_d2R6tzG1c2DC16AQfqdGu2enVS-8qigFJIWB4?em=2&wdAr=1.7777777777777777" height="440" frameborder="0" allowfullscreen title="DressingRoom Pitch Deck" style="width:100%;"></iframe>
        </div>
      </div>
      <div class="proj-inner-panel" id="inner-dr-story">
        <div class="dr-timeline">
          <div class="dr-step">
            <img src="assets/images/Projects/DressingRoom/me and kar shin.jpg" alt="Me and Kar Shin" class="dr-img">
            <div class="dr-step-text">
              <div class="dr-step-label">The Beginning</div>
              <p>A big goal during my MBA was to explore MIT's entrepreneurship ecosystem. I met my co-founder Kar Shin, a fellow MBA student who was just as eager to jump in. We explored several ideas before landing on DressingRoom.</p>
            </div>
          </div>
          <div class="dr-step">
            <img src="assets/images/Projects/DressingRoom/fuse.webp" alt="FUSE Accelerator" class="dr-img">
            <div class="dr-step-text">
              <div class="dr-step-label">MIT FUSE Accelerator</div>
              <p>Went through MIT's FUSE accelerator at the Martin Trust Center, focused on primary market research. Won Top Banana for most PMR interviews in a week.</p>
            </div>
          </div>
          <div class="dr-step">
            <img src="assets/images/Projects/DressingRoom/IIA pitch.jpg" alt="IIA Pitch" class="dr-img">
            <div class="dr-step-text">
              <div class="dr-step-label">Imagination in Action AI Summit</div>
              <p>Pitched to investors, founders, and technologists at IIA's AI summit.</p>
            </div>
          </div>
        </div>
      </div>`,
  },

  // ── FoodGroups ─────────────────────────────────────────────
  {
    id: 'foodgroups', tab: '🥗 FoodGroups',
    title: 'FoodGroups',
    tags: ['AI', 'Health', 'Product', 'Google PM Hackathon', 'Semi-finalist 🏅'],
    desc: 'A personalized gut-health companion — built with 3 classmates with engineering and product backgrounds in one week for the Google PM Hackathon. Semi-finalist among ~25 teams.',
    customContent: `
      <div class="proj-inner-tabs">
        <button class="proj-inner-tab active" data-inner="fg-content">📋 Overview</button>
        <button class="proj-inner-tab" data-inner="fg-prompt">📋 Prompt</button>
        <button class="proj-inner-tab" data-inner="fg-pitch">📊 Pitch Deck</button>
        <button class="proj-inner-tab" data-inner="fg-video">🎬 Video</button>
      </div>
      <div class="proj-inner-panel active" id="inner-fg-content">
        <div class="proj-sections">
          <div class="proj-section" data-s="problem">
            <div class="proj-section-label">Problem</div>
            <div class="proj-section-body">1 in 4 Americans has a functional GI disorder ($140B/yr — more than heart disease). GI practitioners prescribe dietary changes, but half never provide guidance on meal planning or shopping, and 56% find prescribed diets hard to follow. The gap isn't the diagnosis — it's everything between the doctor's note and the dinner plate.</div>
          </div>
          <div class="proj-section" data-s="built">
            <div class="proj-section-label">What I Built</div>
            <div class="proj-section-body"><span class="proj-built-lead">Product concept for AI-powered gut-health companion (Strava for gut health) combining personalized meal planning, photo-snap food logging, and social accountability.</span>
            <ul>
              <li>Led problem framing and market sizing</li>
              <li>Identified social accountability as the core differentiator — for chronic conditions, community is often the strongest adherence driver</li>
              <li>Led pitch deck and helped storyboard video and demo</li>
            </ul></div>
          </div>
          <div class="proj-rhs-stack">
            <div class="proj-section" data-s="outcome">
              <div class="proj-section-label">Outcome</div>
              <div class="proj-section-body"><div class="proj-stat-chips">
                <span class="proj-stat-chip hi">🏅 Semi-finalist, Google PM Hackathon</span>
              </div></div>
            </div>
            <div class="proj-section" data-s="learnings">
              <div class="proj-section-label">Learnings</div>
              <div class="proj-section-body">Most health apps treat community as a nice-to-have. Foodgroups was build with the understanding that community can be the primary adherence mechanism for chronic condition management. But social features can only exist if the app delivers quality one-player value prop first--and we could have been sharper on defining that.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="proj-inner-panel" id="inner-fg-prompt">
        <div class="proj-prompt-label">Hackathon prompt</div>
        <div class="proj-prompt-text"><strong>The Problem:</strong> Healthcare and personal wellness remain two of the most critical and complex areas of life. Traditional systems are often reactive, expensive, and follow a one-size-fits-all model that fails to address individual needs.<br><br><strong>The Challenge:</strong> Leveraging the power of AI, develop a product or service that provides personalized, proactive, and accessible support for an individual's well-being.</div>
      </div>
      <div class="proj-inner-panel" id="inner-fg-pitch">
        <div class="proj-embed-wrap" style="transform:rotate(0.3deg)">
          <iframe src="https://1drv.ms/p/c/a0428aea2d954231/IQT80LIy4v0UQKaiUQj3SPt2AQ8IA6aPsRXPRy5OI-cxqF8?em=2&wdAr=1.7777777777777777" height="480" frameborder="0" allowfullscreen title="FoodGroups Pitch Deck" style="width:100%;"></iframe>
        </div>
      </div>
      <div class="proj-inner-panel" id="inner-fg-video">
        <div class="proj-embed-wrap" style="transform:rotate(-0.4deg)">
          <iframe src="https://drive.google.com/file/d/1UvpVvsi709s7xxtChGDPO_jEjtcEpXaV/preview" height="500" allow="autoplay" title="FoodGroups Video" style="width:100%;"></iframe>
        </div>
      </div>`,
  },

  // ── BeaverBid ──────────────────────────────────────────────
  {
    id: 'bidding', tab: '📚 BeaverBid',
    title: 'BeaverBid',
    tags: ['GenAI', 'MIT Sloan', 'Education', 'Top 5 — Hack for Sloan 🏅'],
    desc: 'Course research and bidding tool for MIT Sloan students. Top 5 at Hack for Sloan, a Lovable-sponsored hackathon for builds that improve life at Sloan. Built with 3 classmates with diverse backgrounds in two hours.',
    customContent: `
      <div class="proj-inner-tabs">
        <button class="proj-inner-tab active" data-inner="bb-content">📋 Overview</button>
        <button class="proj-inner-tab" data-inner="bb-demo">🎬 Demo</button>
      </div>
      <div class="proj-inner-panel active" id="inner-bb-content">
        <div class="proj-sections">
          <div class="proj-section" data-s="problem">
            <div class="proj-section-label">Problem</div>
            <div class="proj-section-body">Sloan students bid on courses with points — but no one knows how much to bid, or what courses are truly excellent. Information to bid well is scattered across class catalogs, Sloan websites, student spreadsheets, and word-of-mouth from limited second-year experience. The result is hype-driven scrambles for classes students might pass on with better information.</div>
          </div>
          <div class="proj-section" data-s="built">
            <div class="proj-section-label">What I Built</div>
            <div class="proj-section-body"><span class="proj-built-lead">Vibecoded a course research tool that consolidates everything — class info, professor reputation, and historical bid data — into one place, with LLM advisor as primary browse and filter mechanism</span>
            <ul>
              <li>Identified student org bidding spreadsheets as first-class data — where real signal lives, not the official catalog</li>
              <li>Designed the unified course card: description + teaching awards + round-by-round bid history with point estimates and student intel inline</li>
            </ul></div>
          </div>
          <div class="proj-rhs-stack">
            <div class="proj-section" data-s="outcome">
              <div class="proj-section-label">Outcome</div>
              <div class="proj-section-body"><div class="proj-stat-chips">
                <span class="proj-stat-chip hi">🏅 Top 5, Hack for Sloan</span>
                <span class="proj-stat-chip">Lovable-sponsored</span>
                <span class="proj-stat-chip">Used personally</span>
              </div></div>
            </div>
            <div class="proj-section" data-s="learnings">
              <div class="proj-section-label">Learnings</div>
              <div class="proj-section-body">This tool may have to live outside of Sloan's official bidding platform, given informal student intel. On the other hand, improved information in this market may raise the bar for quality of courses offered.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="proj-inner-panel" id="inner-bb-demo">
        <div class="proj-section proj-section--demo" data-s="demo">
          <div class="proj-section-label">Demo &nbsp;<a href="https://beaver-bid.lovable.app/" target="_blank" rel="noopener" class="proj-demo-live-link">↗ beaver-bid.lovable.app</a></div>
          <div class="proj-demo-strip">
            <figure class="proj-demo-item">
              <p class="proj-demo-caption"><span class="proj-demo-num">1.</span> AI Advisor filters courses and surfaces recommended classes. Award-winning professors are tagged; student intel and bid history are shown inline.</p>
              <img src="assets/images/Projects/BeaverBid/beaver bid 1.webp" alt="AI Advisor filtering courses" class="proj-demo-img proj-demo-img--wide" loading="lazy">
            </figure>
            <figure class="proj-demo-item">
              <p class="proj-demo-caption"><span class="proj-demo-num">2.</span> Build a bidding scenario with pre-filled point recommendations based on fill rates and round history. Auto-balance allocates your full 1,000 pts; time conflicts are flagged automatically.</p>
              <img src="assets/images/Projects/BeaverBid/beaver bid 2.webp" alt="Bid Simulator" class="proj-demo-img proj-demo-img--tall" loading="lazy">
            </figure>
            <figure class="proj-demo-item">
              <p class="proj-demo-caption"><span class="proj-demo-num">3.</span> Upload your transcript to track graduation progress, including towards each Sloan certificate.</p>
              <img src="assets/images/Projects/BeaverBid/beaver bid 3.webp" alt="Degree and Certificate Progress" class="proj-demo-img proj-demo-img--wide" loading="lazy">
            </figure>
          </div>
        </div>
      </div>`,
  },

  // ── Relationship OS ────────────────────────────────────────
  {
    id: 'monitor', tab: '🤝 Relationship OS',
    title: 'Relationship OS',
    tags: ['Python', 'Notion API', 'LLM', 'Personal Tools', 'In Progress 🚧'],
    desc: 'A fully automated personal CRM built on Notion — still in progress. V1 is live; V2 is on the roadmap.',
    customContent: `
      <div class="proj-sections">
        <div class="proj-section" data-s="problem">
          <div class="proj-section-label">Problem</div>
          <div class="proj-section-body">MBA and startup networking is high-volume and almost entirely manual. My tools (Granola for notes, Gmail for outreach) generate rich relationship data, but none of it flowed together. The result: lost context, missed follow-ups, and relationships that decayed before they mattered.</div>
        </div>
        <div class="proj-section" data-s="built">
          <div class="proj-section-label">What I Built</div>
          <div class="proj-section-body"><span class="proj-built-lead">Fully automated personal CRM on Notion — meeting notes and emails sync automatically, zero manual entry. V1 live; V2 in progress.</span>
          <ul>
            <li>Built meeting ingestion script that parses Granola notes every 15 min, finds or creates People rows in Notion, links meetings, detects followups and adds to to do list automatically</li>
            <li>Built email scraping layer that runs periodically on my inbox, detects contact history and additional context to add to Notion CRM</li>
            <li>Designed relationship health automation based on frequency and quality of contact, with automated status decay over time</li>
            <li>LLM enrichment per meeting: Claude chron job extracts company, role, warmth, priority, and action items to populate CRM data automatically</li>
            <li><strong>V2 roadmap:</strong> pre-meeting briefs, network connector (intro suggestions), weekly digest, articles sharing and follow-up language suggestions, calendar integration</li>
          </ul></div>
        </div>
        <div class="proj-rhs-stack">
          <div class="proj-section" data-s="outcome">
            <div class="proj-section-label">Outcome</div>
            <div class="proj-section-body"><div class="proj-stat-chips">
              <span class="proj-stat-chip hi">V1 live 🚧</span>
              <span class="proj-stat-chip">Zero manual entry</span>
              <span class="proj-stat-chip">Active daily</span>
            </div></div>
          </div>
          <div class="proj-section" data-s="learnings">
            <div class="proj-section-label">Learnings</div>
            <div class="proj-section-body">I thought about creating a separate UI or app for this, but for it to be actually useful, this product must be embedded in my existing workflows.</div>
          </div>
        </div>
      </div>`,
  },

  // ── WhereAbout ─────────────────────────────────────────────
  {
    id: 'whereabout', tab: '📍 WhereAbout',
    title: 'WhereAbout',
    tags: ['Vibecoded', 'Community', 'Web App'],
    desc: 'A social GeoGuessr for my MBA cohort — built to keep us connected while scattered across the globe for the summer.',
    customContent: `
      <div class="proj-inner-tabs">
        <button class="proj-inner-tab active" data-inner="wa-content">📋 Overview</button>
        <button class="proj-inner-tab" data-inner="wa-demo">🎬 Demo</button>
      </div>
      <div class="proj-inner-panel active" id="inner-wa-content">
        <div class="proj-sections">
          <div class="proj-section" data-s="problem">
            <div class="proj-section-label">Problem</div>
            <div class="proj-section-body">During the summer, my cohort was scattered across the globe — different cities, time zones, internships. I wanted a way for us to stay in touch and share what our lives actually looked like, not just check-ins.</div>
          </div>
          <div class="proj-section" data-s="built">
            <div class="proj-section-label">What I Built</div>
            <div class="proj-section-body"><span class="proj-built-lead">A social GeoGuessr: post a photo of your day, your cohort guesses where in the world you are.</span>
            <ul>
              <li>Photo uploads with optional hints and captions; poster sets a guessing window (e.g. 24 hrs or after 30 guesses)</li>
              <li>Others drop a pin on a map and leave comments or reactions — guesses hidden until the reveal</li>
              <li>After the window closes, everyone sees all guesses on the map and who got closest</li>
              <li>Group stats page: a pin-drop heat map and a leaderboard ranked by proximity accuracy across all rounds</li>
            </ul></div>
          </div>
          <div class="proj-rhs-stack">
            <div class="proj-section" data-s="outcome">
              <div class="proj-section-label">Outcome</div>
              <div class="proj-section-body"><div class="proj-stat-chips">
                <span class="proj-stat-chip hi">Half the cohort participated day 1</span>
              </div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="proj-inner-panel" id="inner-wa-demo">
        <div class="proj-section proj-section--demo" data-s="demo">
          <div class="proj-section-label">Demo</div>
          <div class="proj-demo-strip">
            <figure class="proj-demo-item">
              <p class="proj-demo-caption"><span class="proj-demo-num">1.</span> Upload a photo, set a guessing window.</p>
              <img src="assets/images/Projects/WhereAbout/Wherabout 1.webp" alt="Upload a photo" class="proj-demo-img proj-demo-img--tall" loading="lazy">
            </figure>
            <figure class="proj-demo-item">
              <p class="proj-demo-caption"><span class="proj-demo-num">2.</span> Drop a pin, react — guesses hidden until reveal.</p>
              <img src="assets/images/Projects/WhereAbout/WhereAbout 2.webp" alt="Drop a pin and guess" class="proj-demo-img proj-demo-img--tall" loading="lazy">
            </figure>
            <figure class="proj-demo-item">
              <p class="proj-demo-caption"><span class="proj-demo-num">3.</span> Heat map and leaderboard by accuracy.</p>
              <img src="assets/images/Projects/WhereAbout/Wherabout 3.webp" alt="Group stats and leaderboard" class="proj-demo-img proj-demo-img--tall" loading="lazy">
            </figure>
          </div>
        </div>
      </div>`,
  },

  // ── Friendsgiving ──────────────────────────────────────────
  {
    id: 'friendsgiving', tab: '🦃 Friendsgiving',
    title: 'Friendsgiving',
    tags: ['Vibecoded', 'Community', 'Web App'],
    desc: 'A gratitude jar built for our 60+ person Friendsgiving — my very first vibecoding project.',
    customContent: `
      <div class="proj-inner-tabs">
        <button class="proj-inner-tab active" data-inner="fg-content">📋 Overview</button>
        <button class="proj-inner-tab" data-inner="fg-demo">🎬 Demo</button>
      </div>
      <div class="proj-inner-panel active" id="inner-fg-content">
        <div class="proj-sections">
          <div class="proj-section" data-s="problem">
            <div class="proj-section-label">Problem</div>
            <div class="proj-section-body">We were hosting a Friendsgiving for 60+ classmates — a great chance to bring the cohort together, but with a group that big it's easy for people to slip through without feeling truly appreciated.</div>
          </div>
          <div class="proj-section" data-s="built">
            <div class="proj-section-label">What I Built</div>
            <div class="proj-section-body"><span class="proj-built-lead">A gratitude jar: pick a classmate and leave them a private note of thanks.</span>
            <ul>
              <li>A Friendsgiving-themed directory of classmates to browse and pick from</li>
              <li>A simple form to write a gratitude note, with a history of notes you've sent</li>
              <li>A personal "jar" where everyone can read the notes others have left for them</li>
            </ul></div>
          </div>
          <div class="proj-rhs-stack">
            <div class="proj-section" data-s="outcome">
              <div class="proj-section-label">Outcome</div>
              <div class="proj-section-body"><div class="proj-stat-chips">
                <span class="proj-stat-chip hi">~50 notes sent</span>
                <span class="proj-stat-chip">Half the cohort participated</span>
                <span class="proj-stat-chip">My first vibecoding project</span>
              </div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="proj-inner-panel" id="inner-fg-demo">
        <div class="proj-section proj-section--demo" data-s="demo">
          <div class="proj-section-label">Demo &nbsp;<span style="font-style:italic; opacity:0.65; font-size:0.85em;">(shown with mock data)</span></div>
          <div class="proj-demo-strip">
            <figure class="proj-demo-item">
              <p class="proj-demo-caption"><span class="proj-demo-num">1.</span> A warm, Friendsgiving-themed grid of classmates' names and dish avatars — pick someone to send a private gratitude note to.</p>
              <img src="assets/images/Projects/Friendsgiving/Friendsgiving1.webp" alt="Classmate directory" class="proj-demo-img proj-demo-img--ultrawide" loading="lazy">
            </figure>
            <figure class="proj-demo-item">
              <p class="proj-demo-caption"><span class="proj-demo-num">2.</span> Write a heartfelt note of thanks, with a history of past notes you've sent them.</p>
              <img src="assets/images/Projects/Friendsgiving/Friendsgiving2.webp" alt="Send a gratitude note" class="proj-demo-img proj-demo-img--ultrawide" loading="lazy">
            </figure>
            <figure class="proj-demo-item">
              <p class="proj-demo-caption"><span class="proj-demo-num">3.</span> Your gratitude jar: all the appreciation notes classmates have sent you, as warm, readable cards.</p>
              <img src="assets/images/Projects/Friendsgiving/Friendsgiving3.webp" alt="My gratitude jar" class="proj-demo-img proj-demo-img--wide" loading="lazy">
            </figure>
          </div>
        </div>
      </div>`,
  },
];
