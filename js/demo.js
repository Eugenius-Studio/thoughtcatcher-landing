// ========================================
// DEMO.JS - Interactive phone demo
// ========================================
const ACCENT = '#ff6847';

const heroData = {
    voice: 'Remind me to book Amelia\'s doctor appointment tomorrow morning and add grocery pickup for Friday.',
    tasks: [
        { title: "Book Amelia's doctor appointment", meta: 'Tomorrow morning', tag: 'Personal', priority: 'High', destination: 'Apple Calendar' },
        { title: 'Schedule grocery pickup', meta: 'Friday', tag: 'Errands', priority: 'Medium', destination: 'Google Tasks' }
    ]
};

const examples = [
    {
        label: 'Busy parent',
        transcript: 'Tomorrow call the pediatrician and ask for the head scan results, reply to Maddie tonight that we can schedule a viewing on Saturday, don\'t forget Soybean\'s swim class on Saturday at 11am.',
        syncTo: 'Apple Reminders',
        tasks: [
            { id: 't1', title: 'Call the pediatrician', category: 'Family', dateRef: 'tomorrow' },
            { id: 't2', title: 'Schedule Saturday viewing with Maddie', category: 'Work', dateRef: 'today' },
            { id: 't3', title: 'Attend Soybean\'s swim class', category: 'Personal', dateRef: 'saturday' }
        ]
    },
    {
        label: 'Work brain dump',
        transcript: 'Schedule roadmap review for Wednesday at 2 p.m., review the release notes asap, and follow up with design about the landing page colors on Friday.',
        syncTo: 'Notion',
        tasks: [
            { id: 't1', title: 'Schedule roadmap review', category: 'Work', dateRef: 'wednesday 2:00 PM' },
            { id: 't2', title: 'Review the release notes', category: 'Work', dateRef: 'today' },
            { id: 't3', title: 'Follow up with design about landing page colors', category: 'Work', dateRef: 'friday' }
        ]
    },
    {
        label: 'ADHD ramble',
        transcript: 'Tonight make a reservation at Edwards for this Saturday at 8pm, order the printer for work sometime this week, launch the website next Tuesday, and Stormy had diarrhea again, should I get puppy diapers for her?!',
        syncTo: 'Google Tasks',
        tasks: [
            { id: 't1', title: 'Make a reservation at Edwards for Saturday at 8pm', category: 'Personal', dateRef: 'today' },
            { id: 't2', title: 'Order the printer', category: 'Work', dateRef: null },
            { id: 't3', title: 'Launch the website', category: 'Work', dateRef: 'next tuesday' },
            { id: 't4', title: 'Think about puppy diapers', category: 'Personal', dateRef: null }
        ]
    }
];

// ========================================
// DATE RESOLUTION
// ========================================
const DAY_NAMES = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function resolveDate(dateRef) {
    if (!dateRef) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const ref = dateRef.toLowerCase().trim();

    if (ref === 'today' || ref === 'tonight') return today;
    if (ref === 'tomorrow') return new Date(today.getTime() + 86400000);

    // "next tuesday" etc — force next week's occurrence
    const isNext = ref.startsWith('next ');
    const cleanRef = isNext ? ref.slice(5) : ref;

    for (let i = 0; i < DAY_NAMES.length; i++) {
        if (cleanRef.startsWith(DAY_NAMES[i]) || cleanRef.startsWith(DAY_NAMES[i].slice(0, 3))) {
            let diff = i - today.getDay();
            if (diff <= 0) diff += 7;
            if (isNext && diff <= 7) diff += 7; // push to next week
            return new Date(today.getTime() + diff * 86400000);
        }
    }
    return null;
}

function formatDate(date) {
    if (!date) return null;
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${m}/${d}/${date.getFullYear()}`;
}

function formatDateShort(date) {
    if (!date) return null;
    return `${DAY_SHORT[date.getDay()]}, ${MON_SHORT[date.getMonth()]} ${date.getDate()}`;
}

function getTimeline(date) {
    if (!date) return 'No Date';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.floor((date - today) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    // This week: within 7 days from today (but not today/tomorrow)
    const todayDay = today.getDay();
    const daysUntilSunday = todayDay === 0 ? 0 : 7 - todayDay;
    if (diff <= daysUntilSunday) return 'This Week';
    if (diff <= daysUntilSunday + 7) return 'Next Week';
    return 'Later';
}

function resolveTaskDate(task) {
    const date = resolveDate(task.dateRef);
    return { ...task, resolvedDate: date, displayDate: formatDateShort(date), fullDate: formatDate(date) };
}

// ========================================
// STATE
// ========================================
let phase = 'static';
let activeDemo = null;
let seconds = 4;
let audioLevel = -34.3;
let selectedIds = [];
let timerInterval = null;

const $ = (id) => document.getElementById(id);

function tagHtml(text, type) {
    const cls = type === 'cat' ? 'cat' : type === 'date' ? 'dest' : 'pri';
    return `<span class="task-tag ${cls}">${text}</span>`;
}

// ========================================
// RENDER PHASES
// ========================================
function renderStatic() {
    $('floatVoice').style.display = '';
    $('floatSync').style.display = '';
    $('phoneControls').style.display = 'none';
    $('phoneScreen').innerHTML = `
        <div class="phone-header"><div class="app-name"><span>&#127908;</span> Blurts</div><p class="app-sub">For brains that won't slow down</p></div>
        <div class="phone-body">
            <div class="phone-transcript-box"><div class="phone-transcript-label">Original transcription</div><p class="phone-transcript-text">${heroData.voice}</p></div>
            <div class="phone-extracted"><div class="phone-extracted-left"><span class="check" style="color:${ACCENT};">&#10003;</span> ${heroData.tasks.length} Tasks Extracted</div><span class="review">Review</span></div>
            ${heroData.tasks.map(t => `<div class="phone-task"><div class="phone-task-header"><div class="phone-task-check">&#10003;</div><div><div class="phone-task-title">${t.title}</div><div class="phone-task-meta">${t.meta}</div></div></div><div class="phone-task-tags">${tagHtml(t.tag,'cat')}${tagHtml(t.priority,'pri')}${tagHtml(t.destination,'dest')}</div></div>`).join('')}
            <div style="margin-top:16px;border-radius:16px;background:#fff7ed;padding:12px;text-align:center;font-size:13px;font-weight:700;color:var(--slate-500);">Choose an example on the left to see the live app flow.</div>
        </div>`;
}

function renderRecord() {
    $('floatVoice').style.display = 'none';
    $('floatSync').style.display = 'none';
    $('phoneControls').style.display = 'flex';
    $('btnSimStop').style.display = '';
    $('phoneScreen').innerHTML = `
        <div class="ps-record">
            <div class="ps-header"><span>&#9776;</span><span style="font-size:20px;font-weight:800;color:${ACCENT};">Blurts</span><span>&#9881;</span></div>
            <p class="ps-sub">For brains that won't slow down</p>
            <div class="ps-pro">&#127941; Pro: Unlimited</div>
            <div class="ps-timer" id="psTimer">00:${String(seconds).padStart(2,'0')}</div>
            <div class="ps-audio">Audio Level: <span id="psAudio">${audioLevel.toFixed(1)}</span> dB</div>
            <div class="ps-audio-ok">&#10003; Good</div>
            <button class="ps-stop-btn" id="btnStop"><div class="ps-stop-inner"></div></button>
            <p class="ps-stop-label">Tap or release to stop</p>
            <div class="ps-bottom-tabs"><button class="ps-tab ps-tab-active">&#127908; Record</button><button class="ps-tab">&#10003; Tasks</button></div>
        </div>`;
    $('btnStop').onclick = stopRecording;
    startTimer();
}

function renderTranscribing() {
    $('btnSimStop').style.display = 'none';
    $('phoneScreen').innerHTML = `
        <div class="ps-transcribing demo-fade-in">
            <div class="ps-header"><span>&#9776;</span><span style="font-size:20px;font-weight:800;color:${ACCENT};">Blurts</span><span>&#9881;</span></div>
            <div class="ps-trans-center">
                <div class="ps-dots-ring"><span class="ps-dot"></span><span class="ps-dot"></span><span class="ps-dot"></span></div>
                <div class="ps-trans-title">Transcribing...</div>
                <p class="ps-trans-sub">Blurts is turning your voice memo into structured tasks.</p>
            </div>
            <div class="ps-bottom-tabs"><button class="ps-tab ps-tab-active">&#127908; Record</button><button class="ps-tab">&#10003; Tasks</button></div>
        </div>`;
    setTimeout(() => { phase = 'review'; render(); }, 1100);
}

function renderReview() {
    const demo = examples[activeDemo];
    const resolved = demo.tasks.map(resolveTaskDate);
    $('phoneScreen').innerHTML = `
        <div class="ps-review demo-fade-in">
            <div class="ps-review-header"><button id="btnBack" class="ps-back">&#8249;</button><span>Confirm Tasks</span><span></span></div>
            <div class="ps-review-body">
                <div class="ps-review-transcript"><div class="phone-transcript-label">Original Transcription</div><p class="phone-transcript-text">${demo.transcript}</p></div>
                <div class="phone-extracted"><div class="phone-extracted-left"><span class="check" style="color:${ACCENT};">&#10003;</span> ${demo.tasks.length} Tasks Extracted</div><span class="review">${selectedIds.length} selected</span></div>
                <div style="font-size:13px;color:var(--slate-500);margin-bottom:12px;">&#8599; Will sync to ${demo.syncTo}</div>
                ${resolved.map(t => {
                    const sel = selectedIds.includes(t.id);
                    const dateTag = t.displayDate ? tagHtml(t.displayDate, 'date') : '';
                    return `<div class="ps-review-task" style="border-color:${sel ? ACCENT : '#e5e7eb'};">
                        <div class="phone-task-header"><button class="ps-check-btn" data-id="${t.id}" style="background:${sel ? ACCENT : 'white'};color:${sel ? 'white' : '#94a3b8'};border-color:${sel ? ACCENT : '#cbd5e1'};">&#10003;</button><div style="font-size:13px;font-weight:600;color:var(--slate-800);flex:1;min-width:0;">${t.title}</div><div class="ps-task-actions"><button>&#9998;</button><button>&#9003;</button></div></div>
                        <div class="phone-task-tags" style="margin:6px 0 0 36px;">${tagHtml(t.category,'cat')}${dateTag}</div>
                    </div>`;
                }).join('')}
                <button class="ps-sync-btn" id="btnSync">Sync selected tasks</button>
            </div>
        </div>`;
    $('btnBack').onclick = resetToDefault;
    $('btnSync').onclick = () => { phase = 'tasks'; render(); };
    $('phoneScreen').querySelectorAll('.ps-check-btn').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            if (selectedIds.includes(id)) selectedIds = selectedIds.filter(x => x !== id);
            else selectedIds.push(id);
            render();
        };
    });
}

function renderTasks() {
    const demo = examples[activeDemo];
    const selected = demo.tasks.filter(t => selectedIds.includes(t.id)).map(resolveTaskDate);

    // Group by timeline
    const buckets = {};
    const order = ['Today', 'Tomorrow', 'This Week', 'Next Week', 'Later', 'No Date'];
    for (const t of selected) {
        const tl = getTimeline(t.resolvedDate);
        if (!buckets[tl]) buckets[tl] = [];
        buckets[tl].push(t);
    }

    // Sort tasks within each bucket by date
    for (const key of Object.keys(buckets)) {
        buckets[key].sort((a, b) => (a.resolvedDate || Infinity) - (b.resolvedDate || Infinity));
    }

    let tasksHtml = '';
    for (const tl of order) {
        const tasks = buckets[tl];
        if (!tasks || tasks.length === 0) continue;
        tasksHtml += `<div style="display:flex;justify-content:space-between;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;color:var(--slate-400);margin:16px 0 8px;"><span>${tl}</span><span>0 of ${tasks.length}</span></div>`;
        for (const t of tasks) {
            const dateStr = t.fullDate ? `<div style="font-size:11px;color:var(--slate-400);margin:2px 0 0 32px;">${t.displayDate} &middot; ${t.fullDate}</div>` : '';
            tasksHtml += `<div style="background:white;border-radius:16px;padding:14px;margin-bottom:10px;box-shadow:0 1px 4px rgba(0,0,0,0.03);"><div style="display:flex;gap:10px;align-items:flex-start;"><div style="width:22px;height:22px;border-radius:50%;border:2px solid var(--slate-300);flex-shrink:0;margin-top:2px;"></div><div style="font-weight:600;color:var(--slate-800);font-size:14px;">${t.title}</div></div>${dateStr}<div class="phone-task-tags" style="margin:6px 0 0 32px;">${tagHtml(t.category,'cat')}</div></div>`;
        }
    }

    $('phoneScreen').innerHTML = `
        <div class="ps-tasks demo-fade-in">
            <div style="border-bottom:1px solid var(--slate-100);background:white;padding:16px 20px;text-align:center;"><div style="font-size:22px;font-weight:800;color:${ACCENT};">Tasks</div></div>
            <div style="padding:12px 16px;">${tasksHtml}</div>
            <div class="ps-bottom-tabs"><button class="ps-tab">&#127908; Record</button><button class="ps-tab ps-tab-active">&#10003; Tasks</button></div>
        </div>`;
}

// ========================================
// LIFECYCLE
// ========================================
function render() {
    if (phase === 'static') renderStatic();
    else if (phase === 'record') renderRecord();
    else if (phase === 'transcribing') renderTranscribing();
    else if (phase === 'review') renderReview();
    else if (phase === 'tasks') renderTasks();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds = seconds >= 59 ? 4 : seconds + 1;
        audioLevel = -32 - Math.random() * 7;
        const timer = $('psTimer');
        const audio = $('psAudio');
        if (timer) timer.textContent = '00:' + String(seconds).padStart(2, '0');
        if (audio) audio.textContent = audioLevel.toFixed(1);
    }, 1000);
}

function stopRecording() { clearInterval(timerInterval); phase = 'transcribing'; render(); }

function startDemo(index) {
    activeDemo = index;
    selectedIds = examples[index].tasks.map(t => t.id);
    seconds = 4;
    phase = 'record';
    render();
    document.querySelectorAll('#demoTabs .demo-tab').forEach((btn, i) => btn.classList.toggle('active', i === index));
    if (typeof gtag !== 'undefined') gtag('event', 'click', { event_category: 'Demo', event_label: 'Tab - ' + examples[index].label });
}

function resetToDefault() {
    clearInterval(timerInterval);
    activeDemo = null; phase = 'static'; selectedIds = [];
    render();
    document.querySelectorAll('#demoTabs .demo-tab').forEach(btn => btn.classList.remove('active'));
}

document.addEventListener('DOMContentLoaded', () => {
    render();
    document.querySelectorAll('#demoTabs .demo-tab').forEach((btn, i) => {
        btn.addEventListener('click', () => startDemo(i));
    });
    $('btnBackDefault').addEventListener('click', resetToDefault);
    $('btnSimStop').addEventListener('click', stopRecording);
});
