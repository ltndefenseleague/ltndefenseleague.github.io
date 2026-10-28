// Shared behaviour for every page. Each block checks that its elements exist first.

(function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.navtoggle');
  var nav = document.querySelector('nav.main');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  // Wire ticker: duplicate contents so the crawl loops seamlessly
  document.querySelectorAll('.ticker-inner').forEach(function (t) {
    t.innerHTML += t.innerHTML;
  });

  // LEAGUECON: the League's alert level, set by the visitor's local hour
  var LEVELS = [
    { max: 5,  lvl: 1, title: 'Group chat active after midnight', desc: 'Thread length has exceeded 40 messages. Someone has typed "okay but hear me out." Nobody is going to bed.' },
    { max: 8,  lvl: 4, title: 'Analysts asleep (officially "monitoring")', desc: 'Global affairs are proceeding without supervision. We will be reviewing everything that happened, critically, at around 10.' },
    { max: 11, lvl: 3, title: 'Morning headline review underway', desc: 'Coffee has been consumed. Headlines are being skimmed with visibly growing disapproval.' },
    { max: 13, lvl: 4, title: 'Lunch', desc: 'All assessments are suspended. The League does not do geopolitics on an empty stomach.' },
    { max: 17, lvl: 2, title: 'A major outlet has published an opinion', desc: 'A rebuttal is being drafted. It is already longer than the original article.' },
    { max: 20, lvl: 3, title: 'Dinner-table strategic dialogue', desc: 'Great power competition is being discussed at a volume inappropriate for the restaurant.' },
    { max: 23, lvl: 2, title: 'Evening deep dive', desc: 'There are 14 map tabs open. One of them is the same map, open twice.' }
  ];
  var CON_COLORS = { 1: '#7c2f2f', 2: '#9c3b3b', 3: '#b8952f', 4: '#5b6779', 5: '#3d6b45' };
  function currentLevel() {
    var h = new Date().getHours();
    for (var i = 0; i < LEVELS.length; i++) if (h <= LEVELS[i].max) return LEVELS[i];
    return LEVELS[LEVELS.length - 1];
  }
  var con = currentLevel();
  document.querySelectorAll('[data-con-level]').forEach(function (el) { el.textContent = con.lvl; });
  document.querySelectorAll('[data-con-title]').forEach(function (el) { el.textContent = con.title; });
  document.querySelectorAll('[data-con-desc]').forEach(function (el) { el.textContent = con.desc; });
  document.querySelectorAll('.con-scale div').forEach(function (el) {
    if (Number(el.dataset.lvl) === con.lvl) {
      el.classList.add('on');
      el.style.background = CON_COLORS[con.lvl];
    }
  });

  // Live counters, all measured from the League's founding
  var FOUNDED = new Date(2026, 0, 1);
  function fmt(n) { return Math.floor(n).toLocaleString('en-US'); }
  function pad(n) { return String(n).padStart(2, '0'); }
  function tickCounters() {
    var ms = Date.now() - FOUNDED.getTime();
    var s = Math.floor(ms / 1000);
    var hours = ms / 3600000;
    var el;
    if ((el = document.getElementById('no-contract'))) {
      var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
      el.textContent = d + 'd ' + pad(h) + 'h ' + pad(m) + 'm ' + pad(s % 60) + 's';
    }
    if ((el = document.getElementById('opinions'))) el.textContent = fmt(hours * 2.7);
    if ((el = document.getElementById('sources'))) el.textContent = fmt(ms / 540000);
    if ((el = document.getElementById('yieldcurve'))) el.textContent = fmt(hours * 0.8);
    if ((el = document.getElementById('days-home'))) el.textContent = fmt(ms / 86400000);
  }
  tickCounters();
  setInterval(tickCounters, 1000);

  // Analyst status, by local hour
  var STATUS = {
    jk: [
      [5,  'Asleep. Dreaming in topographic contour lines.', 'Off duty'],
      [8,  'Asleep. Phone face-down on a printed map.', 'Off duty'],
      [11, 'Cross-referencing three primary sources against a fourth, slightly more primary source.', 'In the field'],
      [13, 'Explaining a front line to someone who asked about the weather.', 'Briefing'],
      [17, 'Drawing arrows on a map. So many arrows.', 'Deep work'],
      [20, 'Correcting a stranger\'s map in the comments.', 'Engaged'],
      [23, 'Reading a 90-page report "just for the footnotes."', 'Deep work']
    ],
    st: [
      [5,  'Awake. Staring at the 10-year Treasury yield in the dark.', 'Vigilant'],
      [8,  'Asleep. Murmuring about basis points.', 'Off duty'],
      [11, 'Reading the Fed minutes recreationally.', 'In the field'],
      [13, 'Building a DCF model of lunch options.', 'Modeling'],
      [17, 'Announcing that "the yield curve is basically screaming at us."', 'Briefing'],
      [20, 'Pricing sanctions risk into the dinner bill.', 'Modeling'],
      [23, 'Reorganizing CFA Level II flashcards for the fourth time.', 'Studying (claims)']
    ]
  };
  function statusFor(list) {
    var h = new Date().getHours();
    for (var i = 0; i < list.length; i++) if (h <= list[i][0]) return list[i];
    return list[list.length - 1];
  }
  ['jk', 'st'].forEach(function (k) {
    var row = document.querySelector('[data-analyst="' + k + '"]');
    if (!row) return;
    var s = statusFor(STATUS[k]);
    row.querySelector('.doing').textContent = s[1];
    row.querySelector('.badge').textContent = s[2];
  });

  // Yield curve emotional state: a random walk, drawn as a sparkline
  var spark = document.getElementById('spark');
  if (spark) {
    var moodVal = 55, history = [];
    for (var i = 0; i < 60; i++) { moodVal = step(moodVal); history.push(moodVal); }
    var MOODS = [
      [20, 'Calm (suspiciously)'],
      [40, 'Mildly concerned'],
      [60, 'Audibly sighing'],
      [80, 'Raising its voice'],
      [101, 'Screaming at us']
    ];
    function step(v) { return Math.max(3, Math.min(97, v + (Math.random() - 0.48) * 9)); }
    function draw() {
      var dpr = window.devicePixelRatio || 1;
      var w = spark.clientWidth, h = spark.clientHeight;
      spark.width = w * dpr; spark.height = h * dpr;
      var c = spark.getContext('2d');
      c.scale(dpr, dpr);
      c.clearRect(0, 0, w, h);
      c.strokeStyle = 'rgba(22,35,58,0.12)';
      c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
      c.strokeStyle = '#7c2f2f'; c.lineWidth = 2; c.beginPath();
      history.forEach(function (v, i) {
        var x = i / (history.length - 1) * w, y = h - v / 100 * h;
        i ? c.lineTo(x, y) : c.moveTo(x, y);
      });
      c.stroke();
      var last = history[history.length - 1];
      c.fillStyle = '#7c2f2f';
      c.beginPath(); c.arc(w - 3, h - last / 100 * h, 3.5, 0, Math.PI * 2); c.fill();
      document.getElementById('mood-fill').style.width = last + '%';
      var label = MOODS.find(function (m) { return last < m[0]; })[1];
      document.getElementById('mood-label').textContent = label;
      document.getElementById('mood-num').textContent = Math.round(last);
    }
    draw();
    setInterval(function () {
      history.push(step(history[history.length - 1]));
      history.shift();
      draw();
    }, 2500);
    window.addEventListener('resize', draw);
  }

  // Situation log: new entries arrive every few seconds
  var log = document.getElementById('log');
  if (log) {
    var POOL = [
      'Karas has opened a fifth map. Analysts confirm it is "a different kind of map."',
      'Teuscher reports the yield curve "did something." Declines to elaborate.',
      'Group chat consensus reached in 3 min 41 s. A new League record.',
      'A news anchor mispronounced a region. Karas has been notified.',
      'Rebuttal to a major outlet now at 2,400 words. The original article was 600.',
      'Board of directors meeting held. Both members attended.',
      'Media inquiry received. False alarm: it was a dentist appointment reminder.',
      'Teuscher has updated his LinkedIn headline to "Strategist." Again.',
      'Karas cites a primary source. Teuscher cites a vibe. Both assessments accepted.',
      'Endowment review complete. Endowment remains hypothetical.',
      'Someone said "Thucydides Trap" at a party. The League claims partial credit.',
      'Internal peer review finished. Paper approved by its own author.',
      'Coffee supply at HQ (a kitchen) has fallen below strategic reserve levels.',
      'Brookings has still not called back. Situation being monitored.',
      'An analyst said "it\'s more complicated than that." Unclear who started it.',
      'New publication drafted. Title is longer than the abstract.',
      'Teuscher reorganizes his flashcards. Studying is technically underway.',
      'Karas finds a footnote inside a footnote. Morale is high.'
    ];
    var used = [];
    function pick() {
      if (used.length === POOL.length) used = [];
      var i;
      do { i = Math.floor(Math.random() * POOL.length); } while (used.indexOf(i) !== -1);
      used.push(i);
      return POOL[i];
    }
    function stamp(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
    function add(date, text) {
      var li = document.createElement('li');
      li.innerHTML = '<time></time><span></span>';
      li.querySelector('time').textContent = stamp(date);
      li.querySelector('span').textContent = text;
      log.prepend(li);
      while (log.children.length > 7) log.removeChild(log.lastChild);
    }
    var now = Date.now();
    for (var j = 5; j >= 1; j--) add(new Date(now - j * 47000), pick());
    setInterval(function () { add(new Date(), pick()); }, 7000);
  }

  // Research archive filters
  var filters = document.querySelectorAll('.filter');
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filters.forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        var f = btn.dataset.filter;
        document.querySelectorAll('.pub[data-prog]').forEach(function (p) {
          p.style.display = (f === 'all' || p.dataset.prog === f) ? '' : 'none';
        });
      });
    });
  }

  // Fellowship eligibility quiz (nothing is sent anywhere)
  var quiz = document.getElementById('quiz');
  if (quiz) {
    quiz.addEventListener('submit', function (e) {
      e.preventDefault();
      var answers = quiz.querySelectorAll('input:checked');
      var out = document.getElementById('verdict');
      if (answers.length < 4) {
        out.querySelector('h3').textContent = 'Incomplete submission';
        out.querySelector('p').textContent = 'Please answer every question. The League may be unserious, but its forms are not.';
        out.classList.add('show');
        return;
      }
      var score = 0;
      answers.forEach(function (a) { score += Number(a.value); });
      var v;
      if (score >= 10) v = ['Provisionally accepted as Senior Non-Resident Fellow', 'You show the confidence-to-credentials ratio we look for. Your title is unpaid, unofficial, and yours to put on LinkedIn immediately.'];
      else if (score >= 7) v = ['Waitlisted (strong candidate)', 'Promising, but you hedged at least once. Come back when you can say "it\'s actually very simple" about something that is not.'];
      else if (score >= 4) v = ['Referred to our Visiting Intern-in-Spirit track', 'You may be too reasonable for full membership. We mean this as a compliment, mostly.'];
      else v = ['Over-qualified', 'You appear to have real expertise and a healthy relationship with nuance. Brookings may be a better fit. Tell them we said hi.'];
      out.querySelector('h3').textContent = v[0];
      out.querySelector('p').textContent = v[1];
      out.classList.add('show');
      out.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
})();
