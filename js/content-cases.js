/* CONSULTING CASE FILES — edit BCG case write-ups here */
const CF_CASES = [
  /* 0 – TOC */
  { type:'toc' },

  /* 1 – GenAI Assessment (featured, unchanged) */
  { type:'featured',
    title:'GENAI USE CASE ASSESSMENT',
    client:'Global biopharma company',
    tags:['Healthcare','AI/Digital','Strategy','Value Creation'],
    skills:'Stakeholder alignment · Design thinking · Financial modeling · Executive communication · Cross-functional collaboration',
    summary:'Assessed 100+ GenAI use cases across 11 business units, prioritizing 10 high-impact use cases projected to save $40M annually.',
    context:'IT department exploring AI/GenAI as part of a global Value Creation Initiative. Case team developed a comprehensive AI/GenAI strategy including tech and org readiness roadmap and set of inaugural use cases.',
    contribution:['Designed value-feasibility-risk framework for use case assessment','Conducted top-down industry evaluation of GenAI use cases across BCG','Co-developed workshops with client design arm to prioritize use cases','Modeled financial impact of top 10 use cases through meetings with BU leaders and BCG X data scientists','Prepared exec presentation materials to align key stakeholders incl. CTO'],
    outcome:'Client moved forward with phased plan; first 5 use cases projected to save $40M annually. Full buy-in from BUs, Finance, and IT.',
    learnings:'Early tech adoption at large companies prioritizes quick wins and safe bets. Pushback from BUs due to mistrust of centralized initiatives underscores the importance of aligned incentives.',
  },

  /* 2 – Self-Service BI Tool (promoted to featured) */
  { type:'featured',
    title:'SELF-SERVICE BI TOOL DESIGN',
    client:'Global biopharma company',
    tags:['Data/Digital','Product','UX'],
    skills:'UX and product design · Co-creation · Initiative · Operating under ambiguity',
    summary:'Unstalled a two-month deadlock on a BI tool vision — designed product mockups from scratch that re-energized client engagement and got the workstream across the finish line.',
    context:'BI team needed a north star vision for a self-service analytics tool for non-technical audiences. The workstream had stalled for two months due to vague objectives and unproductive client sessions.',
    contribution:['Took ownership of the stalled workstream without being asked — proactively drove the design direction','Created product mockups from scratch, drawing on best practices across BCG and leading data tools: dashboards, AI-driven insights, social-media-inspired interface','Facilitated sessions that re-energized client discussions and unblocked the team','Enabled the workstream to finalize vision and strategy on time'],
    outcome:'Workstream delivered on time. Manager specifically noted the result would not have been possible without my initiative.',
    learnings:'Sometimes a stalled workstream just needs someone to put something concrete on the table. A clear visual provocation moves discussions faster than another working session.',
  },

  /* 3 – Sales Coverage (featured, unchanged) */
  { type:'featured',
    title:'SALES COVERAGE MODEL REDESIGN',
    client:'Fortune 500 engineering software company',
    tags:['Tech','GTM','Sales','People & Org'],
    skills:'GTM motions · Role and org design · Stakeholder alignment · Financial modeling · Executive comms · Expert interviews',
    summary:'Redesigned the global sales coverage model and projected costs, working with worldwide sales leaders to align with a new CRO targeting 35% revenue growth over three years.',
    context:'Client brought on a major investor targeting 35% revenue growth. BCG enlisted to redesign the sales coverage model and org for each GTM motion hand-in-hand with the new CRO.',
    contribution:['Led GTM competitor analyses — RACI frameworks, GTM motions, customer segmentation, coverage ratios','Co-created sales model coverage designs and org structure with worldwide sales leaders, focused on enterprise motion','Modeled costs of proposed sales org','Prepared executive presentations and workshop materials for the CRO'],
    outcome:'CRO and worldwide sales leaders aligned on RACI, coverage model, and ratios per customer segment. Case team extended for next phase.',
    learnings:'New CRO challenged the Sales org budget, dwarfed by Customer Success. Outside perspective shifted the org from an incumbent "farming" mindset to a "hunter" mindset where Sales takes priority.',
  },

  /* 4 – Investment Playbook (featured, reframed) */
  { type:'featured',
    title:'INVESTMENT PLAYBOOK & EXECUTIVE WORKSHOP',
    client:'Environmental services family office',
    tags:['Climate & Sustainability','Industrial Goods','Strategy'],
    skills:'Workshop design · Operating under ambiguity · Cross-functional coordination · Stakeholder alignment · Sprint execution',
    summary:'Took a vague brief and a blank page — designed a 6-hour interactive workshop from scratch in a three-week sprint, turning years of organizational deadlock into a live, aligned decision-making process.',
    context:'The CEO had capital to deploy and nearly a decade of organizational deadlock on where to put it. BCG was brought in with high-level goals and no defined scope — both the problem definition and success criteria had to be built from the ground up.',
    contribution:['Translated an ambiguous brief into concrete workshop design from scratch — agenda, facilitation materials, and simulation mechanics','Partnered with a BCG advisor (ex-EPA) to develop a backgrounder grounding the executive team in chemicals cleanup as a live investment opportunity','Coordinated across two parallel workstreams in a rapid three-week sprint','Designed the workshop itself as the forcing function — structured so the executive team had to make real investment decisions in the room'],
    outcome:'Workshop broke years of organizational deadlock and earned a direct client shout-out. The live simulation made the investment playbook feel real before it was finished.',
    learnings:'Starting without a defined problem is the hardest kind of work — and the most useful. Clarity emerged through the making, not before it.',
  },

  /* 5 – Post M&A GTM + Alumni Engagement (compact pair) */
  { type:'compact', cases:[
    { title:'POST M&A GTM STRATEGY',
      client:'Americas division of global industrial goods company',
      tags:['Industrial Goods','GTM','M&A','Product'],
      skills:'GTM strategy · Regional strategy · Product portfolio rationalization · Quantitative analysis · Competitor analysis',
      context:"Client hired BCG to develop GTM strategy after an $8B acquisition of a competitor. Team worked with both companies to understand synergies across product, branding, geographic coverage, and manufacturing.",
      contribution:['Delivered executive workshops enabling key decisions around new product portfolio, incl. cross-selling & rebranding','Shaped regional sales strategy through quantitative and qualitative market analyses','Proposed channel incentive programs given market best practices'],
      outcome:'Efforts enabled BCG to win the second phase of implementation work.',
    },
    { title:'NON-PROFIT ALUMNI ENGAGEMENT PROGRAM',
      client:'Regional branch of national non-profit',
      tags:['User Research','Growth','Program Design'],
      skills:'Data analysis · Persona development · Customer journey mapping · Program design · Co-creation',
      context:'Non-profit needed an alumni engagement program to drive fundraising and recruiting — with a heterogeneous ~32K alumni base, no existing engagement infrastructure, and no clear picture of who the alumni were or what they wanted.',
      contribution:['Led analysis and segmentation of ~32K alumni into nine demographic and psychographic personas','Mapped the full user journey and designed targeted engagement approaches per persona','Built the implementation roadmap from objectives through channels and metrics'],
      outcome:'Program design delivered from scratch — nine personas, full journey map, and implementation roadmap ready for execution.',
    },
  ]},

  /* 6 – Healthcare PMO + GenAI Proposal (compact pair, demoted + reframed) */
  { type:'compact', cases:[
    { title:'PROJECT MANAGEMENT FOR HEALTHCARE COMMISSION',
      client:"State Governor's healthcare commission",
      tags:['Public Sector','Healthcare','PMO'],
      skills:'Program management · Cross-functional coordination · Operating without formal authority',
      context:'Held together a 30-person cross-functional team — BCG and client — across 3 concurrent workstreams with frequent stakeholder bottlenecks and no formal reporting authority.',
      contribution:['Served as de facto PMO lead across 3 case teams — set priorities, defined frameworks, built integrated tracking systems','Kept momentum despite recurring bottlenecks: escalated blockers, reset expectations, restructured timelines proactively','Developed materials to socialize recommendations up to the Governor'],
      outcome:'Report completed and recommendations socialized across state government and health system leaders.',
    },
    { title:'GENAI USE CASE PROPOSAL',
      client:'Global biopharma company',
      tags:['Healthcare','AI/Digital','Sprint'],
      skills:'Sprint execution · Co-creation · Directing cross-functional team · Storytelling',
      context:'Two-week sprint to respond to a client RFP for the build phase of a prior AI/GenAI assessment. The challenge: build compelling, differentiated materials fast — in close collaboration with external partners.',
      contribution:['Directed a team of ~3 to build a microsite showcasing BCG case studies and a CEO video message','Co-developed proposal slides with external partners, integrating BCG X expertise and North America AI node','Synthesized complex AI implementation content into a cohesive narrative under tight time pressure'],
      outcome:'Client selected another firm on price. Microsite and CEO video format elevated to senior BCG partners as a new approach for AI proposals.',
    },
  ]},

  /* 7 – Due Diligence (hidden — preserved, not rendered) */
  { hidden:true,
    type:'compact', cases:[
    { title:'DUE DILIGENCE — SPECIALTY PHARMA',
      client:'Global biopharma company',
      tags:['Healthcare','Due Diligence'],
      skills:'Financial modeling · Competitor analysis · Mentorship · Upwards management',
      context:'Client engaged BCG for due diligence on a rare disease pharma acquisition target. BCG partners were pulled to a complex adjacent workstream, leaving me and a junior teammate to run our modules independently.',
      contribution:['Modeled target company operating costs for 10 years, proactively engaging the senior team to deliver output requiring minimal client iteration','Mentored junior teammate to produce detailed competitor analyses'],
      outcome:'Module delivered on time — senior team noted the quality of the financial model and competitor analyses.',
    },
  ]},

  /* 8 – Insourcing to GCC (hidden — preserved, not rendered) */
  { hidden:true,
    type:'compact', cases:[
    { title:'INSOURCING TO GLOBAL CAPABILITIES CENTER',
      client:'Global biopharma company',
      tags:['Data/Digital','People & Org','Talent & Skills'],
      skills:'Org and role design · Stakeholder alignment · Execution planning',
      context:'Analytics team standing up a Global Capabilities Center (GCC) in India — hired BCG to identify 400 contractor roles to move, phase the transition, and design new role definitions and org.',
      contribution:['Designed GCC org structure through meetings with global analytics leaders and contractors','Defined job family/skill hierarchies and role transition phasing considering business risk and interim operating model','Created hiring timeline and job descriptions for key senior roles'],
      outcome:'Org design and role framework delivered on time, enabling the team to begin hiring against the new structure.',
    },
  ]},

  /* 9 – Social Impact (Housing + Talent & Skills; Alumni moved to compact above) */
  { type:'social', cases:[
    { title:'HOUSING & HOMELESSNESS STRATEGY',
      client:'Rhode Island Housing Department',
      tags:['Public Sector','Social Impact'],
      skills:'Process mapping · Stakeholder alignment · Expert interviews',
      summary:'BCG engaged to develop a state-wide homelessness response after critical emergency shelters closed — read the full report <a href="https://www.bostonglobe.com/2023/04/24/metro/something-is-going-break-8-things-know-about-startling-new-report-detailing-housing-crisis-rhode-island/" target="_blank" rel="noopener">here</a>. Authored playbook for creating new shelter capacity — permitting and vendor selection — directly influencing the <a href="https://turnto10.com/news/local/department-of-housing-approved-purchase-charlesgate-facility-house-homeless-families-shelter-winter-amos-house-rhode-island-service-nursing-center-providence-october-31-2023" target="_blank" rel="noopener">purchase of a facility</a> to house 41 families. Developed comparative case studies across states.',
    },
    { title:'TALENT & SKILLS IP DEVELOPMENT',
      client:'BCG Bruce Henderson Institute',
      tags:['Future of Work','Thought Leadership'],
      skills:'Stakeholder & community engagement · Content creation',
      summary:"Advanced BCG's Talent & Skills offering by crafting proposal materials, curating tools and resources across functions, facilitating internal engagement initiatives, and preparing thought leadership for external publication. Topics: internal mobility, skills-based hiring, on-demand talent, micro-engagements.",
    },
  ]},
];
