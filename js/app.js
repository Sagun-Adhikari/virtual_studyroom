
// StudyHub - Virtual Classroom JavaScript
// Multi-user support with WebSocket

// ============================================
// GLOBAL VARIABLES
// ============================================

let currentUser = {
    name: '',
    id: '',
    isHost: false,
    color: ''
};

let roomCode = '';
let roomName = '';
let currentMode = 'whiteboard';
let currentTool = 'pen';
let isDrawing = false;
let canvas, ctx;
let participants = [];
let chatMessages = [];
let files = [];
let tasks = [];
let timerInterval;
let timerSeconds = 1500; // 25 minutes
let timerRunning = false;
let drawingHistory = [];
let micEnabled = true;
let cameraEnabled = true;
let lastX = 0;
let lastY = 0;

// Settings
let settings = {
    camera: true,
    hd: false,
    vbg: false,
    mic: true,
    noise: true,
    sound: true,
    chatNotif: true,
    theme: 'light'
};

// WebSocket connection (simulated for demo)
let ws = null;
let isConnected = false;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('StudyHub initialized');
    loadSettings();
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateColor() {
    const colors = [
        '#6366f1', '#ec4899', '#14b8a6', '#f59e0b', 
        '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(type) {
    if (!type) return '<i class="fas fa-file"></i>';
    if (type.includes('pdf')) return '<i class="fas fa-file-pdf"></i>';
    if (type.includes('word') || type.includes('document')) return '<i class="fas fa-file-word"></i>';
    if (type.includes('powerpoint') || type.includes('presentation')) return '<i class="fas fa-file-powerpoint"></i>';
    if (type.includes('excel') || type.includes('sheet')) return '<i class="fas fa-file-excel"></i>';
    if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return '<i class="fas fa-file-image"></i>';
    if (type.includes('video')) return '<i class="fas fa-file-video"></i>';
    if (type.includes('audio')) return '<i class="fas fa-file-audio"></i>';
    if (type.includes('zip') || type.includes('rar')) return '<i class="fas fa-file-archive"></i>';
    if (type.includes('code') || type.includes('text')) return '<i class="fas fa-file-code"></i>';
    return '<i class="fas fa-file"></i>';
}

// ============================================
// FORM FUNCTIONS
// ============================================

function switchTab(tab) {
    const tabs = document.querySelectorAll('.form-tab');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.closest('.form-tab').classList.add('active');
    
    if (tab === 'create') {
        document.getElementById('createForm').style.display = 'block';
        document.getElementById('joinForm').style.display = 'none';
    } else {
        document.getElementById('createForm').style.display = 'none';
        document.getElementById('joinForm').style.display = 'block';
    }
}

function createRoom() {
    const name = document.getElementById('createName').value.trim();
    const rName = document.getElementById('roomName').value.trim();
    
    if (!name || !rName) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    currentUser.name = name;
    currentUser.id = generateId();
    currentUser.isHost = true;
    currentUser.color = generateColor();
    roomCode = generateRoomCode();
    roomName = rName;
    
    participants.push({...currentUser});
    
    enterClassroom();
    showNotification('Room created successfully! Share the code with others.', 'success');
    
    // Simulate WebSocket connection
    connectWebSocket();
}

function joinRoom() {
    const name = document.getElementById('joinName').value.trim();
    const code = document.getElementById('joinCode').value.trim().toUpperCase();
    
    if (!name || !code) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (code.length !== 6) {
        showNotification('Room code must be 6 characters', 'error');
        return;
    }
    
    currentUser.name = name;
    currentUser.id = generateId();
    currentUser.isHost = false;
    currentUser.color = generateColor();
    roomCode = code;
    roomName = 'Study Room';
    
    participants.push({...currentUser});
    
    enterClassroom();
    showNotification('Joined room successfully!', 'success');
    
    // Simulate WebSocket connection
    connectWebSocket();
}

function enterClassroom() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('classroomContainer').classList.add('active');
    document.getElementById('displayRoomCode').textContent = roomCode;
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userInitial').textContent = currentUser.name.charAt(0).toUpperCase();
    
    initCanvas();
    updateParticipantsList();
    loadNotes();
    
    // Add welcome message
    addSystemMessage(`Welcome to ${roomName}!`);
}

// ============================================
// WEBSOCKET (SIMULATED)
// ============================================

function connectWebSocket() {
    // In a real implementation, connect to WebSocket server
    // ws = new WebSocket('ws://your-server.com');
    
    isConnected = true;
    console.log('WebSocket connected (simulated)');
    
    // Simulate receiving messages from other users
    simulateMultiUserActivity();
}

function sendWebSocketMessage(type, data) {
    if (!isConnected) return;
    
    const message = {
        type: type,
        roomCode: roomCode,
        userId: currentUser.id,
        userName: currentUser.name,
        data: data,
        timestamp: Date.now()
    };
    
    console.log('Sending:', message);
    // In real implementation: ws.send(JSON.stringify(message));
}

function simulateMultiUserActivity() {
    // Simulate another user joining after 5 seconds
    setTimeout(() => {
        const newUser = {
            name: 'Alex',
            id: generateId(),
            isHost: false,
            color: generateColor()
        };
        participants.push(newUser);
        updateParticipantsList();
        addSystemMessage(`${newUser.name} joined the room`);
    }, 5000);
}

// ============================================
// CANVAS FUNCTIONS
// ============================================

function initCanvas() {
    canvas = document.getElementById('whiteboard');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    
    // Set default style
    ctx.strokeStyle = document.getElementById('colorPicker').value;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Drawing events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
    
    console.log('Canvas initialized');
}

function resizeCanvas() {
    if (!canvas) return;
    
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

function startDrawing(e) {
    if (currentMode !== 'whiteboard') return;
    
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
}

function draw(e) {
    if (!isDrawing || currentMode !== 'whiteboard') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.strokeStyle = document.getElementById('colorPicker').value;
    ctx.lineWidth = currentTool === 'eraser' ? 20 : 3;
    
    if (currentTool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // Send drawing data to other users
        sendWebSocketMessage('draw', {
            tool: 'pen',
            from: {x: lastX, y: lastY},
            to: {x: x, y: y},
            color: ctx.strokeStyle,
            width: ctx.lineWidth
        });
        
    } else if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(x, y);
        ctx.stroke();
        
        sendWebSocketMessage('draw', {
            tool: 'eraser',
            from: {x: lastX, y: lastY},
            to: {x: x, y: y},
            width: ctx.lineWidth
        });
    }
    
    lastX = x;
    lastY = y;
}

function stopDrawing() {
    if (isDrawing && currentMode === 'whiteboard') {
        isDrawing = false;
        saveDrawingState();
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function saveDrawingState() {
    if (canvas) {
        drawingHistory.push(canvas.toDataURL());
        if (drawingHistory.length > 20) {
            drawingHistory.shift();
        }
    }
}

function selectTool(tool) {
    currentTool = tool;
    
    document.querySelectorAll('#drawingTools .tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.closest('.tool-btn').classList.add('active');
    
    console.log('Tool selected:', tool);
}

function clearCanvas() {
    if (!ctx || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawingHistory = [];
    showNotification('Canvas cleared', 'success');
    
    sendWebSocketMessage('clear', {});
}

function undoCanvas() {
    if (drawingHistory.length > 0) {
        drawingHistory.pop();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (drawingHistory.length > 0) {
            const img = new Image();
            img.src = drawingHistory[drawingHistory.length - 1];
            img.onload = () => ctx.drawImage(img, 0, 0);
        }
        
        showNotification('Undo successful', 'success');
    }
}

function saveCanvas() {
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `whiteboard-${roomCode}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showNotification('Whiteboard saved!', 'success');
}

// ============================================
// MODE SWITCHING
// ============================================

function switchMode(mode) {
    currentMode = mode;
    
    // Update toolbar buttons
    document.querySelectorAll('.toolbar > .tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Hide all content areas
    document.getElementById('canvasContainer').style.display = 'none';
    document.getElementById('videoGrid').style.display = 'none';
    document.getElementById('documentViewer').style.display = 'none';
    document.getElementById('codeEditor').style.display = 'none';
    
    // Hide/show drawing tools
    const drawingTools = document.getElementById('drawingTools');
    
    // Show selected content
    if (mode === 'whiteboard') {
        document.getElementById('canvasContainer').style.display = 'block';
        drawingTools.style.display = 'flex';
        if (!canvas) initCanvas();
    } else if (mode === 'video') {
        document.getElementById('videoGrid').style.display = 'grid';
        drawingTools.style.display = 'none';
    } else if (mode === 'document') {
        document.getElementById('documentViewer').style.display = 'block';
        drawingTools.style.display = 'none';
    } else if (mode === 'code') {
        document.getElementById('codeEditor').style.display = 'block';
        drawingTools.style.display = 'none';
    }
    
    console.log('Mode switched to:', mode);
}

// ============================================
// SIDEBAR FUNCTIONS
// ============================================

function switchSidebarTab(tab) {
    document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.sidebar-content .tab-content').forEach(t => {
        t.style.display = 'none';
    });
    
    document.getElementById(tab + 'Tab').style.display = 'block';
}

// ============================================
// PARTICIPANTS
// ============================================

function updateParticipantsList() {
    const list = document.getElementById('participantsList');
    if (!list) return;
    
    list.innerHTML = '';
    
    participants.forEach(p => {
        const item = document.createElement('div');
        item.className = 'participant-item';
        item.style.background = `linear-gradient(135deg, ${p.color}15, transparent)`;
        
        item.innerHTML = `
            <div class="participant-avatar" style="background: ${p.color}">
                ${p.name.charAt(0).toUpperCase()}
            </div>
            <div class="participant-info">
                <div class="participant-name">${p.name}</div>
                <div class="participant-status ${p.isHost ? 'host' : ''}">
                    ${p.isHost ? 'Host' : 'Participant'}
                </div>
            </div>
        `;
        
        list.appendChild(item);
    });
    
    document.getElementById('participantCount').textContent = participants.length;
}

// ============================================
// CHAT FUNCTIONS
// ============================================

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatMsg = {
        id: generateId(),
        userId: currentUser.id,
        userName: currentUser.name,
        text: message,
        timestamp: new Date(),
        own: true
    };
    
    chatMessages.push(chatMsg);
    displayChatMessage(chatMsg);
    input.value = '';
    
    // Send to other users
    sendWebSocketMessage('chat', chatMsg);
    
    // Play notification sound if enabled
    if (settings.chatNotif) {
        playNotificationSound();
    }
}

function displayChatMessage(msg) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${msg.own ? 'own' : ''}`;
    
    const time = new Date(msg.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    msgDiv.innerHTML = `
        <div class="chat-message-header">${msg.userName} • ${time}</div>
        <div class="chat-message-content">${escapeHtml(msg.text)}</div>
    `;
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function addSystemMessage(text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message';
    msgDiv.style.textAlign = 'center';
    
    msgDiv.innerHTML = `
        <div class="chat-message-content" style="background: #e0e7ff; color: #4f46e5; font-size: 0.9rem;">
            <i class="fas fa-info-circle"></i> ${text}
        </div>
    `;
    
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

function handleChatKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// FILE FUNCTIONS
// ============================================

function handleFileUpload(e) {
    const uploadedFiles = Array.from(e.target.files);
    
    if (uploadedFiles.length === 0) return;
    
    uploadedFiles.forEach(file => {
        const fileObj = {
            id: generateId(),
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
            uploadedBy: currentUser.name,
            uploadedAt: new Date()
        };
        
        files.push(fileObj);
        displayFile(fileObj);
        
        // Send to other users
        sendWebSocketMessage('file', fileObj);
    });
    
    showNotification(`${uploadedFiles.length} file(s) uploaded successfully!`, 'success');
    
    // Clear input
    e.target.value = '';
}

function displayFile(file) {
    const list = document.getElementById('filesList');
    if (!list) return;
    
    const fileDiv = document.createElement('div');
    fileDiv.className = 'file-item';
    
    const icon = getFileIcon(file.type);
    
    fileDiv.innerHTML = `
        <div class="file-icon">${icon}</div>
        <div class="file-info">
            <div class="file-name">${escapeHtml(file.name)}</div>
            <div class="file-size">${file.size} • ${escapeHtml(file.uploadedBy)}</div>
        </div>
        <button class="icon-btn" onclick="downloadFile('${file.id}')" title="Download">
            <i class="fas fa-download"></i>
        </button>
    `;
    
    list.appendChild(fileDiv);
}

function downloadFile(id) {
    showNotification('File download started', 'success');
    console.log('Downloading file:', id);
}

// ============================================
// PANEL FUNCTIONS
// ============================================

function switchPanelTab(tab) {
    document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.panel-content .tab-content').forEach(t => {
        t.style.display = 'none';
    });
    
    document.getElementById(tab + 'Tab').style.display = 'block';
}

// ============================================
// TIMER FUNCTIONS
// ============================================

function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    
    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
        } else {
            pauseTimer();
            showNotification('Timer completed! Time for a break! 🎉', 'success');
            playNotificationSound();
        }
    }, 1000);
    
    sendWebSocketMessage('timer', { action: 'start', seconds: timerSeconds });
}

function pauseTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    
    sendWebSocketMessage('timer', { action: 'pause' });
}

function resetTimer() {
    pauseTimer();
    timerSeconds = 1500; // 25 minutes
    updateTimerDisplay();
    
    sendWebSocketMessage('timer', { action: 'reset' });
}

function setTimer(minutes) {
    pauseTimer();
    timerSeconds = minutes * 60;
    updateTimerDisplay();
    
    showNotification(`Timer set to ${minutes} minutes`, 'success');
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    if (!display) return;
    
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    
    display.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// TASK FUNCTIONS
// ============================================

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const task = {
        id: generateId(),
        text: text,
        completed: false,
        createdBy: currentUser.name,
        createdAt: new Date()
    };
    
    tasks.push(task);
    displayTask(task);
    input.value = '';
    
    // Send to other users
    sendWebSocketMessage('task', { action: 'add', task: task });
}

function displayTask(task) {
    const list = document.getElementById('tasksList');
    if (!list) return;
    
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    taskDiv.dataset.id = task.id;
    
    taskDiv.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask('${task.id}')">
            ${task.completed ? '<i class="fas fa-check"></i>' : ''}
        </div>
        <div class="task-text ${task.completed ? 'completed' : ''}">${escapeHtml(task.text)}</div>
        <button class="task-delete" onclick="deleteTask('${task.id}')" title="Delete">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    list.appendChild(taskDiv);
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        refreshTasks();
        
        sendWebSocketMessage('task', { action: 'toggle', taskId: id });
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    refreshTasks();
    
    sendWebSocketMessage('task', { action: 'delete', taskId: id });
}

function refreshTasks() {
    const list = document.getElementById('tasksList');
    if (!list) return;
    
    list.innerHTML = '';
    tasks.forEach(task => displayTask(task));
}

function handleTaskKeyPress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
    }
}

// ============================================
// NOTES FUNCTIONS
// ============================================

function saveNotes() {
    const notes = document.getElementById('noteEditor').value;
    localStorage.setItem(`notes-${roomCode}`, notes);
    showNotification('Notes saved locally!', 'success');
    
    // Send to server for multi-user sync
    sendWebSocketMessage('notes', { content: notes });
}

function loadNotes() {
    const savedNotes = localStorage.getItem(`notes-${roomCode}`);
    const editor = document.getElementById('noteEditor');
    
    if (savedNotes && editor) {
        editor.value = savedNotes;
    }
}

// Auto-save notes every 30 seconds
setInterval(() => {
    const editor = document.getElementById('noteEditor');
    if (editor && editor.value) {
        localStorage.setItem(`notes-${roomCode}`, editor.value);
    }
}, 30000);

// ============================================
// MEDIA CONTROLS
// ============================================

function toggleMic() {
    micEnabled = !micEnabled;
    const btn = document.getElementById('micBtn');
    
    if (micEnabled) {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
        showNotification('Microphone enabled', 'success');
    } else {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        showNotification('Microphone muted', 'warning');
    }
    
    sendWebSocketMessage('media', { type: 'mic', enabled: micEnabled });
}

function toggleCamera() {
    cameraEnabled = !cameraEnabled;
    const btn = document.getElementById('cameraBtn');
    
    if (cameraEnabled) {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-video"></i>';
        showNotification('Camera enabled', 'success');
    } else {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-video-slash"></i>';
        showNotification('Camera disabled', 'warning');
    }
    
    sendWebSocketMessage('media', { type: 'camera', enabled: cameraEnabled });
}

function shareScreen() {
    showNotification('Screen sharing started', 'success');
    sendWebSocketMessage('media', { type: 'screen', sharing: true });
}

// ============================================
// SETTINGS
// ============================================

function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
    saveSettings();
}

function toggleSetting(element, setting) {
    element.classList.toggle('active');
    
    if (setting) {
        settings[setting] = element.classList.contains('active');
        saveSettings();
    }
}

function changeTheme(theme) {
    settings.theme = theme;
    
    document.querySelectorAll('.setting-group .tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Apply theme (simplified)
    if (theme === 'dark') {
        showNotification('Dark theme coming soon!', 'info');
    }
    
    saveSettings();
}

function saveSettings() {
    localStorage.setItem('studyhub-settings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('studyhub-settings');
    if (saved) {
        settings = JSON.parse(saved);
    }
}

// ============================================
// QUIZ FUNCTIONS
// ============================================

let selectedQuizOption = -1;

function selectQuizOption(element, index) {
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    selectedQuizOption = index;
}

function submitQuiz() {
    if (selectedQuizOption === -1) {
        showNotification('Please select an answer', 'warning');
        return;
    }
    
    // Correct answer is Paris (index 1)
    if (selectedQuizOption === 1) {
        showNotification('Correct! 🎉', 'success');
    } else {
        showNotification('Incorrect. The answer is Paris.', 'error');
    }
    
    closeQuiz();
}

function closeQuiz() {
    document.getElementById('quizModal').classList.remove('active');
    selectedQuizOption = -1;
}

// ============================================
// ROOM CONTROLS
// ============================================

function copyRoomCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
        showNotification('Room code copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy code', 'error');
    });
}

function leaveRoom() {
    if (!confirm('Are you sure you want to leave the room?')) {
        return;
    }
    
    // Cleanup
    if (timerInterval) clearInterval(timerInterval);
    if (ws) ws.close();
    
    // Reset state
    participants = [];
    chatMessages = [];
    files = [];
    tasks = [];
    drawingHistory = [];
    
    // Return to landing page
    document.getElementById('classroomContainer').classList.remove('active');
    document.getElementById('landingPage').style.display = 'flex';
    
    // Clear forms
    document.getElementById('createName').value = '';
    document.getElementById('roomName').value = '';
    document.getElementById('joinName').value = '';
    document.getElementById('joinCode').value = '';
    
    showNotification('You left the room', 'warning');
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    const icon = icons[type] || 'info-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
    
    // Play sound if enabled
    if (settings.sound && type === 'success') {
        playNotificationSound();
    }
}

function playNotificationSound() {
    // Create a simple beep sound
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ============================================
// WINDOW EVENTS
// ============================================

window.addEventListener('resize', () => {
    resizeCanvas();
});

window.addEventListener('beforeunload', (e) => {
    if (participants.length > 0) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    }
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Focus chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('chatInput')?.focus();
    }
    
    // Ctrl/Cmd + Z: Undo canvas
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && currentMode === 'whiteboard') {
        e.preventDefault();
        undoCanvas();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

console.log('StudyHub JavaScript loaded successfully!');