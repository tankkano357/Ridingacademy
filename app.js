const categories = [
  { key: 'awareness', label: 'Awareness & Strategy', icon: '◉', drill: '360° scan habit', opportunity: 'Build earlier hazard detection.' },
  { key: 'readiness', label: 'Motorcycle Readiness', icon: '⚙', drill: 'Pre-ride inspection loop', opportunity: 'Catch problems before they become roadside theater.' },
  { key: 'slow', label: 'Low-Speed Control', icon: '⌁', drill: 'Full-lock U-turns', opportunity: 'Build confidence and smooth control skills.' },
  { key: 'emergency', label: 'Emergency Skills', icon: '⚠', drill: 'Threshold braking', opportunity: 'Brake and swerve when it matters.' },
  { key: 'cornering', label: 'Cornering & Control', icon: '〰', drill: 'Corner entry setup', opportunity: 'Choose the right speed, every time.' }
];

const questions = [
  { cat: 'awareness', text: 'Do you scan 12 seconds ahead instead of staring at the bumper in front of you like it owes you money?' },
  { cat: 'awareness', text: 'Do you actively track escape routes at stops, intersections, and traffic chokepoints?' },
  { cat: 'awareness', text: 'Can you predict the dumb thing a driver is about to do before they bless the road with it?' },
  { cat: 'readiness', text: 'Do you check tires, lights, controls, fluids, and leaks before a real ride?' },
  { cat: 'readiness', text: 'Do you know what normal sounds and feel are for your motorcycle?' },
  { cat: 'readiness', text: 'Can you catch loose controls, weak brakes, or bad tire pressure before leaving?' },
  { cat: 'slow', text: 'Can you confidently make a full-lock U-turn?' },
  { cat: 'slow', text: 'Can you ride a tight figure-eight without dragging your feet like outriggers?' },
  { cat: 'slow', text: 'Can you use clutch zone, throttle, and rear brake together smoothly?' },
  { cat: 'emergency', text: 'Can you stop hard without panic-grabbing the front brake?' },
  { cat: 'emergency', text: 'Have you practiced swerving around a sudden obstacle in the last 30 days?' },
  { cat: 'emergency', text: 'Can you separate braking first, then swerving, without turning it into a yard sale?' },
  { cat: 'cornering', text: 'Do you set entry speed before the corner instead of negotiating with physics mid-turn?' },
  { cat: 'cornering', text: 'Do you look through the turn and keep your body calm when the road tightens?' },
  { cat: 'cornering', text: 'Can you correct a line smoothly without chopping the throttle?' }
];

const answers = [
  { value: 3, icon: '✓', title: 'Yes', sub: "I've got it" },
  { value: 2, icon: '○', title: 'Usually', sub: 'Sometimes' },
  { value: 1, icon: '×', title: 'Not Yet', sub: 'Needs work' }
];

const state = {
  current: 0,
  answers: JSON.parse(localStorage.getItem('riderIqAnswers') || '{}')
};

const views = {
  intro: document.querySelector('#introView'),
  assessment: document.querySelector('#assessmentView'),
  results: document.querySelector('#resultsView'),
  roadmap: document.querySelector('#roadmapView'),
  lesson: document.querySelector('#lessonView'),
  about: document.querySelector('#aboutView'),
  contact: document.querySelector('#contactView')
};

const allViewButtons = [...document.querySelectorAll('[data-view]')];
const navButtons = [...document.querySelectorAll('.nav-item')];
const nextQuestionButton = document.querySelector('#nextQuestion');
const prevQuestionButton = document.querySelector('#prevQuestion');

function answeredCount() {
  return Object.keys(state.answers).length;
}

function updateNavCount() {
  const remaining = Math.max(0, questions.length - answeredCount());
  const badge = document.querySelector('#navCount');
  if (badge) badge.textContent = remaining;
}

function setView(view) {
  if (!views[view]) view = 'intro';
  Object.entries(views).forEach(([key, el]) => {
    if (el) el.classList.toggle('active', key === view);
  });
  navButtons.forEach(item => item.classList.toggle('active', item.dataset.view === view));
  updateNavCount();
  if (view === 'assessment') renderQuestion();
  if (view === 'results') renderResults();
  if (view === 'roadmap') renderRoadmap();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

allViewButtons.forEach(item => item.addEventListener('click', () => setView(item.dataset.view)));

if (prevQuestionButton) {
  prevQuestionButton.addEventListener('click', () => {
    state.current = Math.max(0, state.current - 1);
    renderQuestion();
  });
}

if (nextQuestionButton) {
  nextQuestionButton.addEventListener('click', () => {
    if (!state.answers[state.current]) return;
    const done = answeredCount();
    if (state.current < questions.length - 1) {
      state.current += 1;
      renderQuestion();
    } else if (done === questions.length) {
      setView('results');
    } else {
      const firstMissing = questions.findIndex((_, index) => !state.answers[index]);
      state.current = firstMissing >= 0 ? firstMissing : state.current;
      renderQuestion();
    }
  });
}

function updateQuestionControls() {
  if (!nextQuestionButton || !prevQuestionButton) return;
  const answered = Boolean(state.answers[state.current]);
  const lastQuestion = state.current === questions.length - 1;
  const allAnswered = answeredCount() === questions.length;

  prevQuestionButton.disabled = state.current === 0;
  nextQuestionButton.disabled = !answered;
  nextQuestionButton.textContent = lastQuestion && allAnswered ? 'See My Score →' : answered ? 'Continue →' : 'Choose An Answer';
}

function renderQuestion() {
  const q = questions[state.current];
  const cat = categories.find(c => c.key === q.cat);
  document.querySelector('#levelLabel').textContent = `Level ${categories.findIndex(c => c.key === q.cat) + 1} of 5`;
  document.querySelector('#progressLabel').textContent = `${state.current + 1} of ${questions.length}`;
  document.querySelector('#categoryLabel').textContent = cat.label;
  document.querySelector('#questionText').textContent = q.text;

  const blocks = document.querySelector('#progressBlocks');
  blocks.innerHTML = questions.map((_, index) => {
    const className = state.answers[index] ? 'answered' : index === state.current ? 'current' : '';
    return `<span class="${className}"></span>`;
  }).join('');

  const selected = state.answers[state.current];
  document.querySelector('#answerGrid').innerHTML = answers.map(answer => `
    <button class="answer-card ${selected === answer.value ? 'selected' : ''}" data-value="${answer.value}" aria-pressed="${selected === answer.value}">
      <span>${answer.icon}</span>
      <strong>${answer.title}</strong>
      <small>${answer.sub}</small>
    </button>
  `).join('');

  document.querySelectorAll('.answer-card').forEach(card => {
    card.addEventListener('click', () => {
      state.answers[state.current] = Number(card.dataset.value);
      localStorage.setItem('riderIqAnswers', JSON.stringify(state.answers));
      renderQuestion();
      renderLive();
    });
  });

  updateNavCount();
  renderLive();
  updateQuestionControls();
}

function computeScores() {
  const scores = {};
  categories.forEach(cat => {
    const related = questions.map((q, index) => ({ ...q, index })).filter(q => q.cat === cat.key);
    const answered = related.map(q => state.answers[q.index]).filter(Boolean);
    const maxAnswered = answered.length * 3;
    const raw = answered.reduce((sum, val) => sum + val, 0);
    const percent = answered.length ? Math.round((raw / maxAnswered) * 100) : 0;
    scores[cat.key] = { ...cat, percent, answered: answered.length, total: related.length };
  });
  const answeredValues = Object.values(state.answers);
  const overall = answeredValues.length ? Math.round((answeredValues.reduce((sum, val) => sum + val, 0) / (answeredValues.length * 3)) * 100) : 0;
  return { scores, overall, answered: answeredValues.length };
}

function profileFor(score, answered) {
  if (!answered) return { title: 'Start Rider IQ', description: 'Take the diagnostic first. Otherwise this scorecard is just decorative machinery, which is how dashboards become useless furniture.' };
  if (score >= 86) return { title: 'Road Sharp', description: 'You are dialed in. Keep practicing the ugly stuff so the pretty rides stay boring in the best possible way.' };
  if (score >= 70) return { title: 'Precision Rider', description: 'You have a solid foundation and strong awareness. Dial in control and emergency skills to become harder to surprise.' };
  if (score >= 50) return { title: 'Capable Builder', description: 'You have real riding ability, but a few categories need deliberate work before they bite you.' };
  return { title: 'Reset Required', description: 'The basics need attention. That is not an insult. It is a maintenance light for your skill set.' };
}

function meterColor(percent) {
  if (percent >= 76) return 'var(--green)';
  if (percent >= 56) return 'var(--yellow)';
  return 'var(--red)';
}

function skillRows(compact = false) {
  const { scores } = computeScores();
  return categories.map(cat => {
    const score = scores[cat.key];
    const label = score.answered ? `${score.percent}%` : '—';
    return `
      <div class="skill-row ${score.answered ? '' : 'empty'}">
        <span class="icon">${cat.icon}</span>
        <strong>${cat.label}</strong>
        <span class="skill-meter"><b style="--w:${score.answered ? score.percent : 0}%; background:${meterColor(score.percent)}"></b></span>
        <small>${label}</small>
      </div>
    `;
  }).join('');
}

function renderLive() {
  const { overall, answered } = computeScores();
  const profile = profileFor(overall, answered);
  document.querySelector('#liveProfile').textContent = profile.title;
  document.querySelector('#liveText').textContent = answered ? `${overall}% current Rider IQ based on ${answered} answered question${answered === 1 ? '' : 's'}.` : 'Answer a few questions and the app will start building your rider profile.';
  document.querySelector('#liveBars').innerHTML = skillRows(true);
}

function rankedOpportunities(scores) {
  const attempted = Object.values(scores).filter(item => item.answered > 0);
  const ranked = (attempted.length ? attempted : [scores.slow, scores.emergency, scores.cornering])
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3);
  while (ranked.length < 3) {
    const fallback = [scores.slow, scores.emergency, scores.cornering].find(item => !ranked.some(existing => existing.key === item.key));
    if (!fallback) break;
    ranked.push(fallback);
  }
  return ranked;
}

function renderResults() {
  const { scores, overall, answered } = computeScores();
  const finalScore = answered ? overall : 0;
  const profile = profileFor(finalScore, answered);
  document.querySelector('#resultScore').textContent = finalScore;
  document.querySelector('#resultRing').style.setProperty('--score', finalScore);
  document.querySelector('#profileTitle').textContent = profile.title;
  document.querySelector('#profileDescription').textContent = profile.description;
  document.querySelector('#resultBars').innerHTML = skillRows();

  const opportunities = rankedOpportunities(scores);
  document.querySelector('#opportunityList').innerHTML = opportunities.map((item, index) => `
    <div class="opportunity-card">
      <b>${index + 1}</b>
      <div><strong>${item.label}</strong><p>${item.opportunity}</p></div>
    </div>
  `).join('');
  const next = opportunities[0] || scores.slow;
  document.querySelector('#nextLessonTitle').textContent = next.key === 'emergency' ? 'Emergency Braking Without Drama' : next.key === 'cornering' ? 'Clean Corner Entry' : next.key === 'awareness' ? 'Scan Like You Mean It' : next.key === 'readiness' ? 'Pre-Ride Check That Works' : 'Master Full-Lock Turns';
}

function renderRoadmap() {
  const { scores } = computeScores();
  const focus = rankedOpportunities(scores);
  const phases = [
    {
      title: 'Days 1–10',
      label: 'Foundation',
      items: [`Primary focus: ${focus[0].drill}.`, 'Do three 10-minute parking-lot sessions.', 'Record confidence from 1 to 5 after each practice.']
    },
    {
      title: 'Days 11–20',
      label: 'Pressure',
      items: [`Secondary focus: ${focus[1].drill}.`, 'Add mild pressure: smaller space, smoother inputs, cleaner stops.', 'Repeat until boring. Boring is skill wearing work boots.']
    },
    {
      title: 'Days 21–30',
      label: 'Integration',
      items: [`Third focus: ${focus[2].drill}.`, 'Blend scanning, speed control, braking, and turn setup.', 'Retake Rider IQ and compare your score.']
    }
  ];
  document.querySelector('#roadmapGrid').innerHTML = phases.map(phase => `
    <article class="phase-card panel-card">
      <p class="red-label">${phase.label}</p>
      <h3>${phase.title}</h3>
      <ul>${phase.items.map(item => `<li>${item}</li>`).join('')}</ul>
    </article>
  `).join('');
}

function resetDiagnostic() {
  state.answers = {};
  localStorage.removeItem('riderIqAnswers');
  state.current = 0;
  renderQuestion();
  renderResults();
  renderRoadmap();
  updateNavCount();
  setView('assessment');
}

const resetButtons = document.querySelectorAll('#resetDiagLesson, #resetDiagResults');
resetButtons.forEach(btn => btn.addEventListener('click', resetDiagnostic));

const trackerFields = ['leftTurns', 'rightTurns', 'footDowns', 'confidenceScore', 'biggestMistake', 'nextFix'];
function loadPracticeTracker() {
  trackerFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = localStorage.getItem(`practiceTracker_${id}`) || '';
    el.addEventListener('input', () => localStorage.setItem(`practiceTracker_${id}`, el.value));
  });
}
function clearPracticeTracker() {
  trackerFields.forEach(id => {
    localStorage.removeItem(`practiceTracker_${id}`);
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}
const clearTrackerButton = document.querySelector('#clearPracticeTracker');
if (clearTrackerButton) clearTrackerButton.addEventListener('click', clearPracticeTracker);

renderQuestion();
renderResults();
renderRoadmap();
loadPracticeTracker();
