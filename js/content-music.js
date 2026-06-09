/* ============================================================
   MUSIC MODAL CONTENT — edit albums and bio text here

   albums     — coverflow cards; each has art (emoji), bg (CSS gradient),
                name (title line), sub (subtitle line)
   bioParas   — array of HTML paragraph strings shown below the coverflow
                (each becomes a <p> tag)
   videoLink  — href for the "watch a performance" link (or null to hide)
============================================================ */

const MUSIC_DATA = {
  albums: [
    { art: '🎹', bg: 'linear-gradient(135deg,#1a1a2e,#16213e)', name: 'Classical Piano',        sub: 'Chopin · Rachmaninoff · Debussy' },
    { art: '🎸', bg: 'linear-gradient(135deg,#2d1b1b,#4a1010)', name: 'Rock Band',               sub: 'co-president · ~900 person shows' },
    { art: '🎸', bg: 'linear-gradient(135deg,#0d1f0d,#1a3a1a)', name: 'Bass',                    sub: 'picked up this year' },
    { art: '🎵', bg: 'linear-gradient(135deg,#1a1420,#2d1f3d)', name: 'Teaching Music',          sub: 'free K–12 program · South Side Chicago' },
    { art: '🎤', bg: 'linear-gradient(135deg,#1e1a0e,#3a320a)', name: 'Vocals & Choreography',  sub: 'for friends, when the moment calls for it' },
  ],

  bioParas: [
    `I co-president a rock band of 25 people that plays to ~900-person audiences — which is basically running a small organization.`,
    `Classically trained pianist (Chopin, Rachmaninoff). Picked up bass this year. I sing and choreograph for friends.`,
    `In college I ran a free music program for K–12 students on the South Side of Chicago.`,
  ],

  videoLink: 'javascript:void(0)', // set to null to hide the "watch a performance" link
};
