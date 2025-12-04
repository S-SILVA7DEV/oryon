// --- ESTADO GLOBAL (Dados) ---
let TASKS = JSON.parse(localStorage.getItem('oryon_tasks')) || [
    { id: 1, title: "Bem-vindo ao Oryon!", done: false, priority: "high" }
];
let SHOPPING = JSON.parse(localStorage.getItem('oryon_shopping')) || [];

// --- SOM DO ALARME ---
const alarmSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

// --- FUNÇÕES DE SALVAMENTO ---
function saveData() {
    localStorage.setItem('oryon_tasks', JSON.stringify(TASKS));
    localStorage.setItem('oryon_shopping', JSON.stringify(SHOPPING));
    renderAll();
}

// --- 1. MENU MOBILE (CORRIGIDO E BLINDADO) ---
window.toggleSidebar = function() {
    // Busca os elementos no momento do clique para garantir que existam
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    } else {
        console.error("Erro: Menu lateral ou Overlay não encontrados no HTML.");
    }
}

// --- 2. ROTEAMENTO (SPA) ---
window.router = function(viewId) {
    // Esconde todas as seções
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
    });
    // Remove classe ativa do menu
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    // Mostra a seção desejada
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
    }
    
    // Ativa o botão no menu
    const btn = document.querySelector(`.nav-item[data-target="${viewId}"]`);
    if (btn) btn.classList.add('active');
    
    // FECHA O MENU MOBILE AO NAVEGAR (Melhoria de UX)
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if(overlay) overlay.classList.remove('active');
    }

    // Se for a aba de calendário, renderiza ele
    if(viewId === 'calendar') renderCalendar();
}

// --- 3. SISTEMA DE TAREFAS ---
const dashList = document.getElementById("dash-tasks-list");
const fullList = document.getElementById("full-tasks-list");

function createTaskHTML(task) {
    return `
        <li class="task-item ${task.done ? 'done' : ''}">
            <div class="task-header">
                <input type="checkbox" ${task.done ? "checked" : ""} class="task-check" onchange="toggleTask(${task.id})">
                <h3>${task.title}</h3>
            </div>
            <div class="task-info">
                <span class="priority ${task.priority}">${formatPriority(task.priority)}</span>
                <button onclick="deleteTask(${task.id})" class="btn-icon-danger" title="Excluir"><i class="ri-delete-bin-line"></i></button>
            </div>
        </li>
    `;
}

function formatPriority(p) {
    return p === 'high' ? 'Alta' : p === 'med' ? 'Média' : 'Baixa';
}

window.toggleTask = function(id) {
    const task = TASKS.find(t => t.id === id);
    if (task) { task.done = !task.done; saveData(); }
}

window.deleteTask = function(id) {
    if(confirm("Tem certeza que deseja excluir esta tarefa?")) { 
        TASKS = TASKS.filter(t => t.id !== id); 
        saveData(); 
    }
}

// --- 4. MODAL NOVA TAREFA ---
const modal = document.getElementById('task-modal');
const titleInput = document.getElementById('modal-title');
const priorityInput = document.getElementById('modal-priority');

window.openModal = function() {
    if(modal) { 
        modal.classList.add('open'); 
        setTimeout(() => titleInput.focus(), 100); 
    }
}
window.closeModal = function() {
    if(modal) { 
        modal.classList.remove('open'); 
        titleInput.value = ''; 
    }
}
window.saveNewTask = function() {
    const title = titleInput.value.trim();
    if (!title) return alert("Digite um título para a tarefa!");
    
    TASKS.unshift({ 
        id: Date.now(), 
        title: title, 
        priority: priorityInput.value, 
        done: false 
    });
    saveData();
    closeModal();
}

// --- 5. LISTA DE COMPRAS ---
const shoppingListEl = document.getElementById('shopping-list');
const shoppingInput = document.getElementById('shopping-input');

window.addShoppingItem = function() {
    const text = shoppingInput.value.trim();
    if(!text) return;
    
    SHOPPING.push({ id: Date.now(), text: text, bought: false });
    shoppingInput.value = '';
    saveData();
    shoppingInput.focus();
}

window.handleShoppingKey = function(e) { if(e.key === 'Enter') addShoppingItem(); }

window.toggleShopping = function(id) {
    const item = SHOPPING.find(i => i.id === id);
    if(item) { item.bought = !item.bought; saveData(); }
}

window.deleteShopping = function(id) {
    SHOPPING = SHOPPING.filter(i => i.id !== id);
    saveData();
}

function renderShopping() {
    if(!shoppingListEl) return;
    
    if(SHOPPING.length === 0) { 
        shoppingListEl.innerHTML = '<div style="padding:15px; text-align:center; color:gray;">Sua lista está vazia.</div>'; 
        return; 
    }
    
    shoppingListEl.innerHTML = SHOPPING.map(item => `
        <li class="shopping-item ${item.bought ? 'bought' : ''}">
            <div style="display:flex; align-items:center; gap:10px; flex:1;">
                <input type="checkbox" ${item.bought ? 'checked' : ''} onchange="toggleShopping(${item.id})">
                <span>${item.text}</span>
            </div>
            <button onclick="deleteShopping(${item.id})" class="btn-icon-danger"><i class="ri-close-line"></i></button>
        </li>
    `).join('');
}

// --- 6. RENDERIZAÇÃO GERAL ---
function renderAll() {
    // Renderiza lista completa
    if(fullList) {
        fullList.innerHTML = TASKS.map(t => createTaskHTML(t)).join('') || '<div style="padding:20px; text-align:center; color:gray;">Nenhuma tarefa cadastrada.</div>';
    }
    
    // Renderiza Dashboard (Resumo)
    if(dashList) {
        const pending = TASKS.filter(t => !t.done);
        dashList.innerHTML = pending.slice(0, 5).map(t => createTaskHTML(t)).join('') || '<div style="padding:10px; color:gray;">Tudo feito por hoje! 🎉</div>';
        const count = document.getElementById('dash-task-count');
        if(count) count.innerText = `• ${pending.length}`;
    }
    
    renderShopping();
}

// --- 7. POMODORO (Completo) ---
let timerInterval;
let mode = 'pomodoro'; 
let totalTime = 25 * 60;
let timeLeft = totalTime;

const timerDisplay = document.getElementById('timer-display');
const timerStatus = document.getElementById('timer-status');
const progressRing = document.getElementById('progress-ring');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');

// Ajustado para o SVG grande (Raio 180 -> 2 * PI * 180 ≈ 1130)
const CIRCUMFERENCE = 1130; 

if(progressRing) {
    progressRing.style.strokeDasharray = `${CIRCUMFERENCE} ${CIRCUMFERENCE}`;
    progressRing.style.strokeDashoffset = 0;
}

function setProgress(percent) {
    if(!progressRing) return;
    const offset = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;
    progressRing.style.strokeDashoffset = offset;
}

function formatTime(s) {
    const min = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}

function updateDisplay() {
    if(timerDisplay) timerDisplay.textContent = formatTime(timeLeft);
    document.title = `${formatTime(timeLeft)} - Oryon`;
    
    // Calcula % para o círculo
    const percent = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
    setProgress(percent);
}

window.switchMode = function(newMode) {
    clearInterval(timerInterval);
    mode = newMode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    
    const btns = document.querySelectorAll('.mode-btn');
    if(newMode === 'pomodoro' && btns[0]) btns[0].classList.add('active');
    if(newMode === 'short' && btns[1]) btns[1].classList.add('active');
    if(newMode === 'long' && btns[2]) btns[2].classList.add('active');

    if (mode === 'pomodoro') totalTime = 25 * 60;
    else if (mode === 'short') totalTime = 5 * 60;
    else if (mode === 'long') totalTime = 15 * 60;

    timeLeft = totalTime;
    
    if(startBtn) startBtn.style.display = 'inline-flex';
    if(pauseBtn) pauseBtn.style.display = 'none';
    if(timerStatus) timerStatus.textContent = mode === 'pomodoro' ? 'Pronto?' : 'Descansar';
    
    const wrapper = document.querySelector('.pomodoro-wrapper');
    if(wrapper) {
        wrapper.classList.remove('mode-short', 'mode-long');
        if(mode === 'short') wrapper.classList.add('mode-short');
        if(mode === 'long') wrapper.classList.add('mode-long');
    }
    updateDisplay();
}

window.editTimer = function() {
    pauseTimer();
    const currentMinutes = Math.floor(totalTime / 60);
    const input = prompt("Defina o tempo em minutos:", currentMinutes);
    if (input && !isNaN(input) && input > 0) {
        const newMinutes = parseInt(input);
        totalTime = newMinutes * 60;
        timeLeft = totalTime;
        updateDisplay();
        if(timerStatus) timerStatus.textContent = "Personalizado";
    }
}

function startTimer() {
    if(startBtn) startBtn.style.display = 'none';
    if(pauseBtn) pauseBtn.style.display = 'inline-flex';
    if(timerStatus) timerStatus.textContent = "Focando...";
    
    alarmSound.play().then(() => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    }).catch(e => {}); 

    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alarmSound.play(); 
            alert("Tempo esgotado!");
            resetTimer();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    if(startBtn) startBtn.style.display = 'inline-flex';
    if(pauseBtn) pauseBtn.style.display = 'none';
    if(timerStatus) timerStatus.textContent = "Pausado";
}

function resetTimer() {
    pauseTimer();
    timeLeft = totalTime;
    updateDisplay();
    if(timerStatus) timerStatus.textContent = "Pronto?";
}

if(startBtn) startBtn.addEventListener('click', startTimer);
if(pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
if(resetBtn) resetBtn.addEventListener('click', resetTimer);

// --- 8. FUNÇÕES EXTRAS (Tela Cheia, Wallpaper, Calendário) ---

window.toggleFullscreen = function() {
    const elem = document.getElementById('fullscreen-target');
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => { alert(`Erro: ${err.message}`); });
    } else { document.exitFullscreen(); }
}

window.changeWallpaper = function() {
    const url = prompt("Cole o link da imagem de fundo (ex: Unsplash):", "");
    if(url) {
        document.documentElement.style.setProperty('--pomo-bg', `url('${url}')`);
        localStorage.setItem('oryon_bg', url);
    }
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

window.changeMonth = function(dir) {
    currentMonth += dir;
    if(currentMonth < 0) { currentMonth = 11; currentYear--; }
    else if(currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const header = document.getElementById('month-year');
    if(!grid || !header) return;

    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    header.innerText = `${months[currentMonth]} ${currentYear}`;

    grid.innerHTML = "";
    
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    daysOfWeek.forEach(day => {
        grid.innerHTML += `<div class="day-name">${day}</div>`;
    });

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div class="calendar-day empty"></div>`;
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const isToday = i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        grid.innerHTML += `<div class="calendar-day ${isToday ? 'today' : ''}">${i}</div>`;
    }
}

// --- 9. SISTEMA DE NOTAS ---
const notesArea = document.getElementById('notes-area');
const saveStatus = document.getElementById('save-status');
const dashNotePreview = document.getElementById('dash-note-preview');

function updateDashNote(text) {
    if (dashNotePreview) {
        dashNotePreview.textContent = text.trim() ? text : "Nenhuma nota salva.";
    }
}

const savedNotes = localStorage.getItem('oryon_notes') || "";
if (notesArea) notesArea.value = savedNotes;
updateDashNote(savedNotes);

if (notesArea) {
    notesArea.addEventListener('input', () => {
        const text = notesArea.value;
        localStorage.setItem('oryon_notes', text);
        updateDashNote(text);
        if (saveStatus) {
            saveStatus.textContent = "Salvando...";
            setTimeout(() => { saveStatus.textContent = "Salvo"; }, 1000);
        }
    });
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    router('dashboard');
    const savedBg = localStorage.getItem('oryon_bg');
    if(savedBg) document.documentElement.style.setProperty('--pomo-bg', `url('${savedBg}')`);
    updateDisplay();
});