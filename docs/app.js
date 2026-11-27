import { alphabet, games, lessons, readiness, stages } from './curriculum.js?v=3';
import { audioFiles } from './audio-files.js?v=3';

const icons = {
  book: '<path d="M12 7v14M3 4h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5v14h-5a4 4 0 0 0-4 3 4 4 0 0 0-4-3H3z"/>',
  puzzle: '<path d="M20 11V6h-5a3 3 0 1 0-6 0H4v5a3 3 0 1 1 0 6v4h5a3 3 0 1 1 6 0h5v-4a3 3 0 1 0 0-6Z"/>',
  parent: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-4M16 3a4 4 0 0 1 0 8"/><circle cx="9" cy="7" r="4"/>',
  star: '<path d="m12 2.5 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9z"/>',
  play: '<path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.8l-10-6.5a1 1 0 0 0-1.5.9Z" fill="currentColor" stroke="none"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  audio: '<path d="M3 9v6h4l5 4V5L7 9H3zm13 0a4 4 0 0 1 0 6m3-8a7 7 0 0 1 0 10"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2 6m2-10v4h-4"/>',
  pencil: '<path d="m4 16-1 5 5-1L20 8l-4-4L4 16Zm10-10 4 4"/>',
};

const main = document.querySelector('#main');
const announcement = document.querySelector('#announcement');
const storageKey = 'arabic-garden-v1';
const completed = new Set(lessons.map((lesson) => lesson.id));
const gameIds = new Set(games.map((game) => game.id));
const readinessIds = new Set(readiness.map((item) => item.id));
let storageAvailable = true;
let state = loadProgress();
let activity = null;
let activeAudio = null;
let audioRequest = 0;

function icon(name) {
  return `<svg class="icon${name === 'star' ? ' star-fill' : ''}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function arabic(text, className = '') {
  return `<span lang="ar" dir="rtl" class="${className}">${escapeHtml(text)}</span>`;
}

function emoji(picture, className = 'picture') {
  return picture ? `<span class="${className}" aria-hidden="true">${escapeHtml(picture)}</span>` : '';
}

function audioButton(text, label = 'Listen', compact = false) {
  const classes = compact ? 'icon-button' : 'button soft';
  return `<button type="button" class="${classes}" data-say="${escapeHtml(text)}" ${compact ? `aria-label="${escapeHtml(label)}"` : ''}>${icon('audio')}${compact ? '' : escapeHtml(label)}</button>`;
}

function loadProgress() {
  const empty = { lessons: [], games: [], checks: [], drafts: {} };
  let raw;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {
    storageAvailable = false;
    return empty;
  }
  if (!raw) return empty;
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    return empty;
  }
  const validIds = (entries, allowed) => Array.isArray(entries) ? [...new Set(entries.filter((id) => allowed.has(id)))] : [];
  const drafts = {};
  for (const lesson of lessons) {
    const checkpoint = value?.drafts?.[lesson.id];
    if (Number.isInteger(checkpoint) && checkpoint > 0 && checkpoint < lesson.steps.length) drafts[lesson.id] = checkpoint;
  }
  return { lessons: validIds(value?.lessons, completed), games: validIds(value?.games, gameIds), checks: validIds(value?.checks, readinessIds), drafts };
}

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  updateStars();
}

function updateStars() {
  const stars = state.lessons.length + state.games.length;
  document.querySelector('#star-count').textContent = stars;
  document.querySelector('.star-bank').setAttribute('aria-label', `${stars} ${stars === 1 ? 'star' : 'stars'} earned`);
}

function live(message) {
  announcement.textContent = message;
}

function stopAudio() {
  audioRequest += 1;
  if (activeAudio) activeAudio.pause();
  activeAudio = null;
}

function speak(text) {
  stopAudio();
  const request = audioRequest;
  const status = main.querySelector('.voice-alert');
  if (status) status.textContent = '';
  const reportUnavailable = () => {
    if (request !== audioRequest) return;
    const message = 'The Arabic recording could not play. Tap to try again.';
    if (status) status.textContent = message;
    else live(message);
  };
  if (!Object.hasOwn(audioFiles, text)) {
    reportUnavailable();
    return;
  }
  activeAudio = new Audio(`audio/${audioFiles[text]}.wav?v=2`);
  activeAudio.addEventListener('error', reportUnavailable, { once: true });
  activeAudio.play().catch(reportUnavailable);
}

function stageCount(stage) {
  return stage.lessons.filter((lesson) => state.lessons.includes(lesson.id)).length;
}

function artwork(picture, tag = '') {
  return `<div class="stage-art" aria-hidden="true"><span class="art-ring"></span><span class="art-spark">✦</span><span class="art-spark small-spark">✧</span>${tag ? `<span class="tag">${tag}</span>` : ''}${emoji(picture, 'art-icon')}</div>`;
}

function renderHome() {
  const next = lessons.find((lesson) => !state.lessons.includes(lesson.id));
  const cta = next?.id === lessons[0].id && !state.drafts[next.id] ? 'Start lesson 1' : next ? 'Continue learning' : 'Practice again';
  main.innerHTML = `
    <section class="hero" aria-labelledby="hero-title">
      <img class="hero-art" src="images/fennec-garden.webp" alt="" fetchpriority="high">
      <div class="hero-content">
        <span class="hero-badge"><span aria-hidden="true">🌱</span> Beginner to KG2</span>
        <h1 id="hero-title">Little steps,<br><span>big Arabic!</span></h1>
        <p>Listen, play and grow your Arabic, one little lesson at a time.</p>
        <div class="hero-actions"><a class="button primary" href="#${next ? `lesson/${next.id}` : 'play'}">${icon('play')}${cta}</a><span class="hero-time">${icon('clock')} About 5 min per lesson</span></div>
      </div>
    </section>
    <section class="home-section" aria-labelledby="path-title">
      <div class="section-head"><div><h2 id="path-title">Your learning path</h2><p>Three levels to explore</p></div><span class="progress-chip">${state.lessons.length} / ${lessons.length} done</span></div>
      <div class="stage-grid">${stages.map((stage) => `
        <a class="stage-card ${stage.color}${stage === next?.stage ? ' active-stage' : ''}" href="#stage/${stage.id}">
          ${artwork(stage.picture, stage.level)}
          <div class="stage-body"><h3>${stage.title}</h3><p>${stage.description}</p>
            <div class="stage-footer"><span>${icon(stageCount(stage) === stage.lessons.length ? 'check' : 'book')}${stageCount(stage) === stage.lessons.length ? 'Finished' : 'Explore lessons'}</span><span class="lesson-count">${stageCount(stage)} of ${stage.lessons.length}</span></div>
          </div>
          <span class="sr-only">${stage.level}</span>
        </a>`).join('')}</div>
    </section>
    <aside class="practice-banner"><span class="spot" aria-hidden="true">🎲</span><div><h3>Ready to play?</h3><p>Practice with pictures, letters and counting bees.</p></div><a class="button soft small" href="#play">${icon('puzzle')}Play games</a></aside>`;
}

function renderStage(stage) {
  const count = stageCount(stage);
  main.innerHTML = `<div class="page">
    <a class="back-link" href="#learn">${icon('book')}Learning path</a>
    <section class="page-banner ${stage.color}">${emoji(stage.picture, 'big-emoji')}<div><span class="tag">${stage.level} · ${count} of ${stage.lessons.length} done</span><h1>${stage.title}</h1><p>${stage.description}</p></div></section>
    <ol class="lesson-list">${stage.lessons.map((lesson, index) => {
      const done = state.lessons.includes(lesson.id);
      const inProgress = state.drafts[lesson.id];
      const picture = alphabet.some((letter) => letter.ar === lesson.picture) ? arabic(lesson.picture) : emoji(lesson.picture);
      return `<li><a class="lesson-row ${stage.color}" href="#lesson/${lesson.id}">
        <span class="lesson-picture" aria-hidden="true">${picture}</span>
        <span>${index + 1}. ${escapeHtml(lesson.title)}<small>${escapeHtml(lesson.goal)}</small></span>
        <span class="row-action${done ? ' done' : ''}">${icon(done ? 'check' : 'play')}<span class="sr-only">${done ? 'Finished' : inProgress ? 'In progress' : 'Start'}</span></span>
      </a></li>`;
    }).join('')}</ol>
    ${stage.id === 'letters' ? `<p class="stage-note"><a class="button soft" href="#alphabet">${icon('pencil')}Open the alphabet garden</a></p>` : ''}
  </div>`;
}

function renderPlay() {
  main.innerHTML = `<div class="page">
    <section class="page-banner peach">${emoji('🎲', 'big-emoji')}<div><h1>Play in the garden</h1><p>Pick a game to practice what you know.</p></div></section>
    <div class="stage-grid">${games.map((game) => `<a class="stage-card game-card ${game.color}" href="#game/${game.id}">
      ${artwork(game.picture)}<div class="stage-body"><h3>${game.title}</h3><p>${game.description}</p><div class="stage-footer"><span>${icon('play')}Play</span>${state.games.includes(game.id) ? `<span>${icon('check')}Played</span>` : ''}</div></div></a>`).join('')}</div>
    <aside class="practice-banner play-school-note"><span class="spot" aria-hidden="true">✏️</span><div><h3>Alphabet garden</h3><p>Tap any letter to hear it and trace its shape.</p></div><a class="button soft small" href="#alphabet">${icon('pencil')}Choose a letter</a></aside>
  </div>`;
}

function renderAlphabet() {
  main.innerHTML = `<div class="page">
    <a class="back-link" href="#play">${icon('puzzle')}Play</a>
    <section class="page-banner peach">${emoji('✏️', 'big-emoji')}<div><h1>Alphabet garden</h1><p>Choose a letter to listen and trace.</p></div></section>
    <div class="alphabet-grid" dir="rtl">${alphabet.map((item, index) => `<a href="#letter/${index + 1}" class="letter-button">${arabic(item.ar)}<span dir="ltr">${escapeHtml(item.en)}</span></a>`).join('')}</div>
  </div>`;
}

function renderParents() {
  main.innerHTML = `<div class="page">
    <section class="page-banner lavender">${emoji('🌿', 'big-emoji')}<div><h1>Grown-up garden</h1><p>Help your child build the Arabic skills she’ll use in Grade 1.</p></div></section>
    <div class="parent-panels">
      <section class="parent-panel"><h2>Learning progress</h2><p>${state.lessons.length} of ${lessons.length} lessons finished · ${state.games.length} of ${games.length} games played</p>
      ${stages.map((stage) => `<div class="progress-line"><p><strong>${stage.title}</strong><span>${stageCount(stage)} of ${stage.lessons.length}</span></p><progress class="progress-track" max="${stage.lessons.length}" value="${stageCount(stage)}" aria-label="${stage.title} progress"></progress></div>`).join('')}
      <p class="parent-source">${storageAvailable ? 'Progress is stored in this browser on this device.' : 'This browser is blocking saved progress. Progress will last until you close or reload this page.'}</p></section>
      <section class="parent-panel"><h2>How to practice together</h2><ol>
        <li>Try one short lesson. Tap Listen, then pause so she can point or repeat.</li>
        <li>Find the words away from the screen. Try colors at snack time or greetings with a toy.</li>
        <li>Replay favorite lessons and trace letters again on paper, starting on the right.</li>
        <li>Use the checklist below over several days. Leave an item unchecked until you’ve seen her try it.</li>
      </ol></section>
    </div>
    <section class="parent-panel checklist" aria-labelledby="checklist-title"><div class="section-head"><div><h2 id="checklist-title">Grade 1 Arabic practice checklist</h2><p>Mark each skill after you’ve seen it during play.</p></div><span class="progress-chip" id="checks-count">${state.checks.length} of ${readiness.length} seen</span></div>
      <div class="checklist-list">${readiness.map((item) => `<div class="check-row">
        <input type="checkbox" id="check-${item.id}" data-check="${item.id}" ${state.checks.includes(item.id) ? 'checked' : ''}>
        <label for="check-${item.id}"><strong>${item.title}</strong><small>${item.category} · ${escapeHtml(item.detail)}</small></label>
        ${item.cue ? audioButton(item.cue.spoken, `Hear the example for ${item.title}`, true) : `<a class="button soft small" href="#lesson/${item.lesson}">Open lesson</a>`}
      </div>`).join('')}</div>
      <p class="voice-alert" role="status"></p>
      <p class="parent-source">Ask your daughter’s school which Arabic track she’ll join and what it expects at entry. This home checklist covers selected early Arabic skills. <a href="https://www.moe.gov.ae/en/guides/Documents/Mandatory%20subjects/Performance-Levels-for-Mandatory-Kindergarten-Subjects-in-Private-Schools-En.pdf" target="_blank" rel="noopener noreferrer">UAE Ministry of Education kindergarten outcomes</a></p>
      <p class="parent-source">Vowel practice uses native-speaker audio from Nawar Halabi’s <a href="https://en.arabicspeechcorpus.com/" target="_blank" rel="noopener noreferrer">Arabic Speech Corpus</a>, edited for timing and level under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>. Other clips use a <a href="https://huggingface.co/oddadmix/tiny-voca-arabic" target="_blank" rel="noopener noreferrer">Modern Standard Arabic synthetic voice</a>.</p>
    </section>
  </div>`;
}

function shuffled(options) {
  const copy = [...options];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function startActivity(content, type, back, { replay = false } = {}) {
  const index = type === 'lesson' && !replay ? (state.drafts[content.id] ?? 0) : 0;
  activity = {
    ...content, type, back,
    index,
    furthestIndex: index,
    steps: content.steps.map((step, stepIndex) => {
      if (step.kind === 'choose') return { ...step, options: shuffled(step.options), answered: stepIndex < index };
      if (step.kind === 'trace') return { ...step, strokes: [] };
      return step;
    }),
    finished: false,
    earned: false,
  };
  renderActivity(replay);
}

function renderFlashcard(step) {
  const item = step.item;
  const saying = step.kind === 'say';
  return `<h1>${saying ? escapeHtml(step.prompt) : 'Listen and say it'}</h1>
    <p class="activity-intro">Tap Listen, then try saying it out loud.</p>
    <div class="activity-mark">${emoji(item.picture)}${arabic(item.ar, 'arabic-xl')}</div>
    <p class="translation">${escapeHtml(item.en)}</p>
    ${audioButton(item.spoken)}
    ${item.example ? `<div class="letter-example">${emoji(item.example.picture)}${arabic(item.example.ar)}<span>${escapeHtml(item.example.en)}</span>${audioButton(item.example.spoken, `Hear ${item.example.en} in Arabic`, true)}</div>` : ''}`;
}

function renderChoice(step) {
  const { mode, item, options, prompt, answered } = step;
  const pictures = ['pictures', 'read', 'comprehension'].includes(mode);
  const listening = ['pictures', 'listen', 'sound', 'vowel'].includes(mode);
  const showText = ['read', 'reading'].includes(mode);
  const title = prompt?.label ?? {
    read: 'Read and find the picture', pictures: 'Listen and pick a picture', vowel: 'Which sound did you hear?',
  }[mode] ?? 'Listen and pick a letter';
  const promptText = prompt?.text ?? item.spoken;
  return `<h1>${escapeHtml(title)}</h1>
    ${mode === 'read' ? '<p class="activity-intro">Start on the right. Read the word, then tap its picture.</p>' : ''}
    ${showText ? `<div class="reading-prompt">${arabic(prompt?.text ?? item.ar, 'arabic-xl')}</div>` : ''}
    ${listening ? `<p class="activity-intro">Tap to hear the Arabic, then pick your answer.</p>${audioButton(promptText)}` : ''}
    ${mode === 'count' ? `<div class="bees" aria-label="${prompt.quantity} bees">${'<span aria-hidden="true">🐝</span>'.repeat(prompt.quantity)}</div>` : ''}
    <div class="choice-grid${options.length === 2 ? ' vowel-grid' : ''}">${options.map((option, index) => {
      let display;
      if (mode === 'count') display = arabic(option.picture);
      else if (pictures && !/^\p{Number}+$/u.test(option.picture)) display = emoji(option.picture, 'choice-picture');
      else display = arabic(pictures ? option.picture : option.ar);
      return `<button type="button" class="choice${answered && option === item ? ' correct' : ''}" data-choice="${index}"${answered ? ' disabled' : ''}${pictures || mode === 'count' ? ` aria-label="${escapeHtml(option.en)}"` : ''}>${display}${pictures && mode !== 'read' ? `<small>${escapeHtml(option.en)}</small>` : ''}</button>`;
    }).join('')}</div>
    ${mode !== 'count' ? `<button type="button" class="text-button" data-action="hint" aria-expanded="false" aria-controls="answer-hint">Show help</button>
      <p class="answer-hint" id="answer-hint" hidden>${arabic(mode === 'sound' ? `${promptText} · ${item.ar}` : item.ar)}${mode === 'sound' ? '' : ` · ${escapeHtml(item.en)}`}${(!listening && mode !== 'reading') ? ` ${audioButton(item.spoken, 'Hear the answer', true)}` : ''}</p>` : ''}`;
}

function renderComparison({ brief, held, spoken }) {
  return `<h1>Hear the difference</h1><p class="activity-intro">Say the short sound. Then hold the vowel a little longer.</p>
    <div class="vowel-grid vowel-pair">
      ${[[brief, 'Short'], [held, 'Long']].map(([item, label]) => `<button type="button" class="vowel-card" data-say="${escapeHtml(item.spoken)}" aria-label="Listen to the ${label.toLowerCase()} vowel">
        <span class="vowel-label">${label}</span>${arabic(item.ar, 'arabic-xl')}<span class="vowel-length" aria-hidden="true"></span>
        <span class="vowel-listen">${icon('audio')}Listen</span></button>`).join('')}
    </div>
    ${audioButton(spoken, 'Play both')}`;
}

function renderStory(step) {
  return `<h1>Listen to the story</h1><p class="activity-intro">Tap the speakers from top to bottom to hear what happens.</p><div class="story-lines">
    ${step.lines.map((line) => `<div class="story-line">${emoji(line.picture)}<div><p lang="ar" dir="rtl">${escapeHtml(line.ar)}</p><small>${escapeHtml(line.en)}</small></div>${audioButton(line.spoken, `Hear: ${line.en}`, true)}</div>`).join('')}
  </div>`;
}

function renderTrace(step) {
  return `<h1>Trace the shape</h1><p class="activity-intro">Follow the purple shape with your finger. Lift it to add any dots or marks.</p>
    <div class="trace-area"><div class="trace-model">${arabic(step.item.ar)}</div><canvas aria-label="Trace ${escapeHtml(step.item.en)}"></canvas></div>
    ${audioButton(step.item.spoken)} <button type="button" class="button secondary" data-action="clear">${icon('refresh')}Clear</button>`;
}

function backButton(disabled = false) {
  return `<button type="button" class="button secondary" data-action="back"${disabled ? ' disabled' : ''}>Back</button>`;
}

function renderActivity(focusHeading = false) {
  const { back, title, type, index, steps, finished } = activity;
  const step = steps[index];
  const stepContent = finished ? renderFinish() : {
    show: renderFlashcard, say: renderFlashcard, choose: renderChoice, compare: renderComparison, story: renderStory, trace: renderTrace,
  }[step.kind](step);
  const last = index + 1 === steps.length;
  main.innerHTML = `<div class="activity">
    <div class="activity-header"><a class="back-link" href="#${back}">${icon('close')}Exit ${type === 'lesson' ? 'lesson' : 'practice'}</a><span class="activity-title">${escapeHtml(title)}</span></div>
    <div class="activity-progress"><progress class="progress-track" max="${steps.length}" value="${finished ? steps.length : index}" aria-label="Activity progress"></progress><span>${finished ? 'All done' : `${index + 1} of ${steps.length}`}</span></div>
    <section class="activity-card${finished ? ' celebrate' : ''}">${stepContent}
      ${finished ? '' : `<p class="voice-alert" role="status"></p><div class="activity-footer"><div class="feedback${step.answered ? ' ok' : ''}" aria-live="polite">${step.answered ? 'Well done!' : ''}</div><div class="activity-controls">
        ${backButton(index === 0)}
        ${type === 'letter' && !last ? '<button type="button" class="button primary" data-action="next">Go to tracing</button>' : `<button type="button" class="button primary" data-action="next"${step.kind === 'choose' && !step.answered ? ' disabled' : ''}>${last ? 'Finish' : 'Next'}</button>`}
      </div></div>`}
    </section></div>`;
  if (!finished && step.kind === 'trace') setupCanvas(step.strokes);
  const heading = main.querySelector('h1');
  if (focusHeading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

function renderFinish() {
  const { type, id, back, earned } = activity;
  const next = type === 'lesson' ? lessons[lessons.findIndex((lesson) => lesson.id === id) + 1] : null;
  const title = type === 'letter' ? 'Lovely tracing!' : type === 'game' ? 'Great playing!' : 'You did it!';
  const description = type === 'letter' ? 'Your letter is ready to try on paper.' : earned ? 'You earned a star for your garden!' : 'Every practice helps your Arabic grow.';
  const mainAction = next ? `<a class="button primary" href="#lesson/${next.id}">${icon('play')}Next lesson</a>` : `<a class="button primary" href="#${back}">${type === 'letter' ? 'Choose a letter' : type === 'game' ? 'More games' : 'My learning path'}</a>`;
  return `<div class="celebration-icon" aria-hidden="true">${type === 'letter' ? '✏️' : '🌟'}</div><h1>${title}</h1><p>${description}</p>
    <div class="activity-controls">${backButton()}${mainAction}<button type="button" class="button secondary" data-action="replay">${icon('refresh')}Practice again</button></div>`;
}

function chooseAnswer(button) {
  const step = activity.steps[activity.index];
  const answer = step.options[Number(button.dataset.choice)];
  const next = main.querySelector('[data-action="next"]');
  const feedback = main.querySelector('.feedback');
  if (answer !== step.item) {
    button.classList.add('incorrect');
    feedback.className = 'feedback retry';
    feedback.textContent = 'Try another one.';
    return;
  }
  step.answered = true;
  button.classList.remove('incorrect');
  button.classList.add('correct');
  feedback.className = 'feedback ok';
  feedback.textContent = 'Well done!';
  main.querySelectorAll('[data-choice]').forEach((choiceButton) => { choiceButton.disabled = true; });
  next.disabled = false;
  next.focus({ preventScroll: true });
  speak(answer.spoken);
}

function advance() {
  stopAudio();
  const { id, type } = activity;
  if (activity.index + 1 < activity.steps.length) {
    activity.index += 1;
    if (activity.index > activity.furthestIndex) {
      activity.furthestIndex = activity.index;
      if (type === 'lesson') {
        state.drafts[id] = activity.index;
        saveProgress();
      }
    }
  } else {
    activity.finished = true;
    const history = type === 'lesson' ? state.lessons : type === 'game' ? state.games : null;
    if (history) {
      if (!history.includes(id)) {
        activity.earned = true;
        history.push(id);
      }
      delete state.drafts[id];
      saveProgress();
    }
  }
  renderActivity(true);
}

function goBack() {
  if (!activity.finished && activity.index === 0) return;
  stopAudio();
  if (activity.finished) activity.finished = false;
  else activity.index -= 1;
  renderActivity(true);
}

function setupCanvas(strokes) {
  const canvas = main.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  let currentStroke;
  let pointerId;
  function redraw() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.strokeStyle = '#6241bb';
    context.fillStyle = '#6241bb';
    context.lineWidth = 7;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    for (const stroke of strokes) {
      const [first, ...rest] = stroke;
      context.beginPath();
      if (rest.length === 0) {
        context.arc(first.x * width, first.y * height, 3.5, 0, 2 * Math.PI);
        context.fill();
      } else {
        context.moveTo(first.x * width, first.y * height);
        for (const point of rest) context.lineTo(point.x * width, point.y * height);
        context.stroke();
      }
    }
  }
  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height };
  }
  canvas.addEventListener('pointerdown', (event) => {
    if (currentStroke || event.button !== 0) return;
    pointerId = event.pointerId;
    currentStroke = [point(event)];
    strokes.push(currentStroke);
    canvas.setPointerCapture(pointerId);
    redraw();
  });
  canvas.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId || !currentStroke) return;
    currentStroke.push(point(event));
    redraw();
  });
  canvas.addEventListener('lostpointercapture', () => { currentStroke = null; });
  main.querySelector('[data-action="clear"]').addEventListener('click', () => {
    strokes.length = 0;
    currentStroke = null;
    redraw();
    live('Tracing cleared.');
  });
  redraw();
}

function renderRoute({ moveFocus = false } = {}) {
  stopAudio();
  activity = null;
  const [view, id] = location.hash.slice(1).split('/');
  const tab = ['play', 'game', 'alphabet', 'letter'].includes(view) ? 'play' : view === 'parents' ? 'parents' : 'learn';
  document.querySelectorAll('[data-tab]').forEach((link) => {
    if (link.dataset.tab === tab) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const stage = view === 'stage' ? stages.find((entry) => entry.id === id) : null;
  const lesson = view === 'lesson' ? lessons.find((entry) => entry.id === id) : null;
  const game = view === 'game' ? games.find((entry) => entry.id === id) : null;
  const letter = view === 'letter' && /^\d+$/.test(id) ? alphabet[Number(id) - 1] : null;
  if (stage) renderStage(stage);
  else if (lesson) startActivity(lesson, 'lesson', `stage/${lesson.stage.id}`);
  else if (game) startActivity(game, 'game', 'play');
  else if (letter) startActivity({ title: `Practice ${letter.en}`, steps: [{ kind: 'show', item: letter }, { kind: 'trace', item: letter }] }, 'letter', 'alphabet');
  else if (view === 'alphabet') renderAlphabet();
  else if (tab === 'play') renderPlay();
  else if (tab === 'parents') renderParents();
  else renderHome();
  if (moveFocus) {
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

document.querySelectorAll('[data-icon]').forEach((element) => { element.innerHTML = icon(element.dataset.icon); });
main.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.say) speak(button.dataset.say);
  else if (button.hasAttribute('data-choice')) chooseAnswer(button);
  else if (button.dataset.action === 'next') advance();
  else if (button.dataset.action === 'back') goBack();
  else if (button.dataset.action === 'hint') {
    const hint = main.querySelector('#answer-hint');
    hint.hidden = !hint.hidden;
    button.textContent = hint.hidden ? 'Show help' : 'Hide help';
    button.setAttribute('aria-expanded', String(!hint.hidden));
  } else if (button.dataset.action === 'replay') {
    startActivity(activity, activity.type, activity.back, { replay: true });
  }
});
main.addEventListener('change', (event) => {
  const id = event.target.dataset.check;
  if (!readinessIds.has(id)) return;
  if (event.target.checked && !state.checks.includes(id)) state.checks.push(id);
  if (!event.target.checked) state.checks = state.checks.filter((entry) => entry !== id);
  saveProgress();
  main.querySelector('#checks-count').textContent = `${state.checks.length} of ${readiness.length} seen`;
});
window.addEventListener('hashchange', () => renderRoute({ moveFocus: true }));
window.addEventListener('pagehide', stopAudio);
updateStars();
renderRoute();
