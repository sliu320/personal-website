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
              <span class="proj-bucket-link-sub">AI-powered visual commerce startup. MIT FUSE accelerator, IIA AI Summit. Sunset after 4 months — a lot learned.</span>
            </a>
            <a class="proj-bucket-link" data-goto="foodgroups">
              <span class="proj-bucket-link-name">🥗 FoodGroups</span>
              <span class="proj-bucket-link-sub">Personalized gut-health companion built in one week. Semi-finalist, Google PM Hackathon.</span>
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
              <span class="proj-bucket-link-sub">Location-sharing app for the Atlantic Ocean cohort.</span>
            </a>
            <a class="proj-bucket-link" data-goto="friendsgiving">
              <span class="proj-bucket-link-name">🦃 Friendsgiving</span>
              <span class="proj-bucket-link-sub">Event site for the Atlantic Ocean Friendsgiving.</span>
            </a>
          </div>
        </div>
      </div>`,
  },

  // ── GenAI Lab ──────────────────────────────────────────────
  {
    id: 'genai', tab: '🤖 GenAI Lab',
    title: 'GenAI Lab — Hunter Water × SAP',
    tags: ['LLM', 'Computer Vision', 'FastAPI', 'React', 'MIT Sloan', 'Best Project 🏆'],
    desc: 'Automated a high-stakes engineering workflow for a regulated Australian water utility. 30 minutes → 45 seconds, with human oversight built in by design.',
    customContent: `
      <div class="proj-sections">
        <div class="proj-section" data-s="problem">
          <div class="proj-section-label">Problem</div>
          <div class="proj-section-body">Hunter Water (NSW, Australia) issues ~600 Statements of Available Pressure per year — technical packets developers need to plan water connections. Each took ~1 hour across two engineers: find the right hydrant in GIS, calculate pressure in Excel, generate a Word doc. 600+ hours of repetitive, low-judgment work annually, with no standardized QA, in a regulated environment where accuracy is non-negotiable.</div>
        </div>
        <div class="proj-section" data-s="built">
          <div class="proj-section-label">What I Built</div>
          <div class="proj-section-body"><span class="proj-built-lead">End-to-end automation pipeline: vision LLM reads site plans, scoring algorithm selects the right hydrant, deterministic hydraulic logic generates the output.</span>
          <ul>
            <li>Benchmarked Gemini Flash vs. Pro — no accuracy gain; Flash's native multimodal eliminated a separate OCR step entirely</li>
            <li>Built hydrant scoring: 3-tier geocoding fallback + multi-factor scoring on distance, pipe diameter, and street alignment — replicating engineer judgment, not just proximity</li>
            <li>Kept all hydraulic calculations outside the LLM so outputs stay fully auditable in a regulated context</li>
            <li>Designed human-in-the-loop flagging: low-confidence cases surface top-5 options with one-click override — no silent hallucinations</li>
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
            <div class="proj-section-body">In regulated industries, the goal isn't to replace the engineer — it's to eliminate the parts that don't require judgment. Keeping logic deterministic made results trustworthy to the client.</div>
          </div>
        </div>
      </div>`,
  },

  // ── DressingRoom ───────────────────────────────────────────
  {
    id: 'dressingroom', tab: '👗 DressingRoom',
    title: 'DressingRoom',
    tags: ['Startup', 'Entrepreneurship', 'Consumer', 'MIT FUSE', 'Fashion Tech'],
    desc: 'An AI-powered visual commerce startup I co-founded with a fellow Sloan MBA. MIT FUSE accelerator, Imagination in Action AI Summit. Sunset after ~4 months — a lot learned along the way.',
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
            <div class="proj-section-body">Young professionals have disposable income but no time to shop intentionally. They struggle to articulate their style, can't translate it to specific products, and are overwhelmed by volume. Virtual try-on existed but produced uncanny results and was prohibitively expensive — until diffusion models changed the economics.</div>
          </div>
          <div class="proj-section" data-s="built">
            <div class="proj-section-label">What I Built</div>
            <div class="proj-section-body"><span class="proj-built-lead">Co-built a product that decodes personal style from Instagram and generates AI try-ons linked to live inventory — no manual quiz, no dead links.</span>
            <ul>
              <li>Led 100+ customer discovery interviews through MIT FUSE; won <strong>Top Banana</strong> (most PMR in a cohort of 50+ teams)</li>
              <li>Designed the Style DNA engine concept: infer aesthetic + body profile from Instagram follows — passive input, zero friction</li>
              <li>Framed affiliate close-loop as core differentiation from Pinterest: every try-on links to live inventory, not dead product pages</li>
              <li>Led pitch materials and investor presentation at IIA AI Summit; secured MIT Sandbox grant</li>
            </ul></div>
          </div>
          <div class="proj-rhs-stack">
            <div class="proj-section" data-s="outcome">
              <div class="proj-section-label">Outcome</div>
              <div class="proj-section-body"><div class="proj-stat-chips">
                <span class="proj-stat-chip">100+ interviews</span>
                <span class="proj-stat-chip">MIT FUSE accelerator</span>
                <span class="proj-stat-chip">$1.5K Sandbox grant</span>
                <span class="proj-stat-chip">IIA AI Summit</span>
                <span class="proj-stat-chip hi">Sunset after 4 months</span>
              </div></div>
            </div>
            <div class="proj-section" data-s="learnings">
              <div class="proj-section-label">Learnings</div>
              <div class="proj-section-body"><ul>
                <li>Passion is a prerequisite — we couldn't give product experiments 100%, and that's a bad foundation</li>
                <li>GenAI levels the playing field on domain knowledge, but two MBAs with overlapping skills still lacked a technical co-founder</li>
                <li>Consumer CAC compounds fast — B2B pressure from advisors was real, even if we were right to push back</li>
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
    desc: 'A personalized gut-health companion — built with 3 classmates in one week for the Google PM Hackathon. Semi-finalist among ~25 teams.',
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
            <div class="proj-section-body">1 in 4 Americans has a functional GI disorder ($140B/yr — more than heart disease). GI practitioners prescribe dietary changes, but half never provide guidance on meal planning or shopping. 56% find prescribed diets hard to follow. The gap isn't the diagnosis — it's everything between the doctor's note and the dinner plate.</div>
          </div>
          <div class="proj-section" data-s="built">
            <div class="proj-section-label">What I Built</div>
            <div class="proj-section-body"><span class="proj-built-lead">AI-powered gut-health companion combining personalized meal planning, photo-snap food logging, and a social accountability layer — built in one week with three classmates.</span>
            <ul>
              <li>Led problem framing and market sizing</li>
              <li>Identified social accountability as the core differentiator — for chronic conditions, community is often the strongest adherence driver</li>
              <li>Led pitch deck and final presentation to judges</li>
            </ul></div>
          </div>
          <div class="proj-rhs-stack">
            <div class="proj-section" data-s="outcome">
              <div class="proj-section-label">Outcome</div>
              <div class="proj-section-body"><div class="proj-stat-chips">
                <span class="proj-stat-chip hi">🏅 Semi-finalist, Google PM Hackathon</span>
                <span class="proj-stat-chip">~25 teams</span>
              </div></div>
            </div>
            <div class="proj-section" data-s="learnings">
              <div class="proj-section-label">Learnings</div>
              <div class="proj-section-body">Most health apps treat community as a nice-to-have. For chronic condition management, it's often the primary adherence mechanism — that insight shaped the entire product architecture.</div>
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
    tags: ['Vibecoded', 'LLM', 'MIT Sloan', 'Education', 'Top 5 — Hack for Sloan 🏅'],
    desc: 'Course research and bidding tool for MIT Sloan students. Top 5 at Hack for Sloan, a Lovable-sponsored hackathon for builds that improve life at Sloan.',
    customContent: `
      <div class="proj-sections">
        <div class="proj-section" data-s="problem">
          <div class="proj-section-label">Problem</div>
          <div class="proj-section-body">Sloan students bid on courses with points — but the information needed to bid well is scattered across class catalogs, student org spreadsheets, and second-year word-of-mouth. No one knows how much to bid. The result is hype-driven scrambles for classes students might pass on with better information.</div>
        </div>
        <div class="proj-section" data-s="built">
          <div class="proj-section-label">What I Built</div>
          <div class="proj-section-body"><span class="proj-built-lead">Vibecoded a course research tool that consolidates everything — class info, professor reputation, and historical bid data — into one place.</span>
          <ul>
            <li>Identified student org bidding spreadsheets as first-class data — where real signal lives, not the official catalog</li>
            <li>Designed the unified course card: description + teaching awards + round-by-round bid history with point estimates</li>
            <li>Built and iterated on an LLM chat trained on all course content — turned out to be the sleeper feature, used more than browse/filter once discovered</li>
          </ul></div>
        </div>
        <div class="proj-rhs-stack">
          <div class="proj-section" data-s="outcome">
            <div class="proj-section-label">Outcome</div>
            <div class="proj-section-body"><div class="proj-stat-chips">
              <span class="proj-stat-chip hi">🏅 Top 5, Hack for Sloan</span>
              <span class="proj-stat-chip">Lovable-sponsored</span>
              <span class="proj-stat-chip">Used personally + shared</span>
            </div></div>
          </div>
          <div class="proj-section" data-s="learnings">
            <div class="proj-section-label">Learnings</div>
            <div class="proj-section-body">The LLM chat was the sleeper feature — people reached for it more than anything once they discovered it. Data sourcing was the hardest part: peer bidding history lives in unstructured Google Sheets, not any official system.</div>
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
          <div class="proj-section-body">MBA networking is high-volume and almost entirely manual — meeting 5–10 new people a week. My tools (Granola for notes, Gmail for outreach, Obsidian for reading) generated rich relationship data, but none of it flowed together. The result: lost context, missed follow-ups, and relationships that decayed before they mattered.</div>
        </div>
        <div class="proj-section" data-s="built">
          <div class="proj-section-label">What I Built</div>
          <div class="proj-section-body"><span class="proj-built-lead">Fully automated personal CRM on Notion — meeting notes and emails sync automatically, zero manual entry. V1 live; V2 in progress.</span>
          <ul>
            <li>Built <code>auto_linker.py</code>: parses Granola notes every 15 min, finds or creates People rows in Notion, links meetings automatically</li>
            <li>Built <code>email_linker.py</code>: runs every 30 min on Gmail, detects contact direction, logs history</li>
            <li>Designed relationship health automation: Active → Warm (30d) → Dormant (90d) — no manual tagging ever</li>
            <li>LLM enrichment per meeting: single Claude call extracts company, role, warmth, priority, and action items</li>
            <li><strong>V2 roadmap:</strong> pre-meeting briefs, network connector (intro suggestions), weekly digest, article matching, calendar integration</li>
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
            <div class="proj-section-body">Idempotency is everything in an always-on pipeline — every script must be safe to re-run without creating duplicates. The relationship health automation (Active → Warm → Dormant) turned out to be the most immediately useful feature: it surfaces neglected relationships without any prompting.</div>
          </div>
        </div>
      </div>`,
  },

  // ── WhereAbout ─────────────────────────────────────────────
  {
    id: 'whereabout', tab: '📍 WhereAbout',
    title: 'WhereAbout',
    tags: ['Vibecoding', 'Community', 'Web App'],
    desc: `A vibecoding project built for the Atlantic Ocean cohort. Coming soon.`,
    customContent: `
      <div style="display:flex;align-items:center;justify-content:center;height:200px;color:rgba(100,70,30,0.5);font-family:Georgia,serif;font-style:italic;font-size:1rem;">
        🚧 Coming soon
      </div>`,
  },

  // ── Friendsgiving ──────────────────────────────────────────
  {
    id: 'friendsgiving', tab: '🦃 Friendsgiving',
    title: 'Friendsgiving',
    tags: ['Vibecoding', 'Community', 'Web App'],
    desc: `A vibecoding project built for the Atlantic Ocean Friendsgiving event. Coming soon.`,
    customContent: `
      <div style="display:flex;align-items:center;justify-content:center;height:200px;color:rgba(100,70,30,0.5);font-family:Georgia,serif;font-style:italic;font-size:1rem;">
        🚧 Coming soon
      </div>`,
  },
];
