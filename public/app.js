/**
 * TSC Manager Frontend Application
 */

// Configuration
const API_BASE = window.location.origin;
const API_KEY = new URLSearchParams(window.location.search).get('apiKey') || 'default-api-key';
const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

// State
let ws = null;
let tasks = [];
let approvals = [];
let platforms = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeWebSocket();
    setupEventListeners();
    loadInitialData();
    checkEmbeddedMode();
});

// Check if running in embedded mode
function checkEmbeddedMode() {
    if (window.self !== window.top) {
        document.body.classList.add('embedded');
    }
}

// WebSocket connection
function initializeWebSocket() {
    try {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('WebSocket connected');
            updateConnectionStatus(true);
            ws.send(JSON.stringify({ type: 'subscribe' }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWebSocketMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            updateConnectionStatus(false);
            // Attempt to reconnect after 5 seconds
            setTimeout(initializeWebSocket, 5000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            updateConnectionStatus(false);
        };
    } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        updateConnectionStatus(false);
    }
}

function handleWebSocketMessage(data) {
    console.log('WebSocket message:', data);
    
    switch (data.type) {
        case 'tasks_created':
            showToast('New tasks created!', 'success');
            loadTasks();
            loadApprovals();
            break;
        case 'task_approved':
        case 'task_rejected':
            loadTasks();
            loadApprovals();
            break;
        default:
            console.log('Unknown message type:', data.type);
    }
}

function updateConnectionStatus(connected) {
    const indicator = document.getElementById('status-indicator');
    const text = document.getElementById('status-text');
    
    if (connected) {
        indicator.classList.remove('disconnected');
        indicator.classList.add('connected');
        text.textContent = 'Connected';
    } else {
        indicator.classList.remove('connected');
        indicator.classList.add('disconnected');
        text.textContent = 'Disconnected';
    }
}

// Event listeners
function setupEventListeners() {
    // Instruction form
    document.getElementById('instruction-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitInstruction();
    });

    // Filters
    document.getElementById('status-filter').addEventListener('change', filterTasks);
    document.getElementById('platform-filter').addEventListener('change', filterTasks);

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => {
        loadInitialData();
        showToast('Data refreshed', 'success');
    });

    // Event delegation for approval buttons
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // Approve button
        if (target.classList.contains('approve-btn')) {
            const approvalId = target.getAttribute('data-approval-id');
            if (approvalId) {
                approveTask(approvalId);
            }
        }
        
        // Reject button
        if (target.classList.contains('reject-btn')) {
            const approvalId = target.getAttribute('data-approval-id');
            if (approvalId) {
                rejectTask(approvalId);
            }
        }
    });
}

// Load initial data
async function loadInitialData() {
    await Promise.all([
        loadTasks(),
        loadApprovals(),
        loadPlatforms()
    ]);
}

// API calls
async function apiCall(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || 'Request failed');
    }

    return response.json();
}

// Submit instruction
async function submitInstruction() {
    const instruction = document.getElementById('instruction-input').value.trim();
    const userId = document.getElementById('user-id').value.trim();

    if (!instruction) {
        showToast('Please enter an instruction', 'error');
        return;
    }

    try {
        const data = await apiCall('/api/instructions', {
            method: 'POST',
            body: JSON.stringify({ instruction, userId: userId || undefined })
        });

        showToast(data.message || 'Instruction submitted successfully!', 'success');
        document.getElementById('instruction-form').reset();
        await loadTasks();
        await loadApprovals();
    } catch (error) {
        showToast(error.message || 'Failed to submit instruction', 'error');
        console.error('Error submitting instruction:', error);
    }
}

// Load tasks
async function loadTasks() {
    try {
        const data = await apiCall('/api/tasks');
        tasks = data.tasks || [];
        updateStatistics();
        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Failed to load tasks', 'error');
    }
}

// Load approvals
async function loadApprovals() {
    try {
        const data = await apiCall('/api/approvals');
        approvals = data.approvals || [];
        renderApprovals();
    } catch (error) {
        console.error('Error loading approvals:', error);
    }
}

// Load platforms
async function loadPlatforms() {
    try {
        const data = await apiCall('/api/platforms');
        platforms = data.platforms || [];
        renderPlatforms();
    } catch (error) {
        console.error('Error loading platforms:', error);
    }
}

// Approve task
async function approveTask(approvalId) {
    try {
        await apiCall(`/api/approvals/${approvalId}/approve`, { method: 'POST' });
        showToast('Task approved', 'success');
        await loadTasks();
        await loadApprovals();
    } catch (error) {
        showToast('Failed to approve task', 'error');
        console.error('Error approving task:', error);
    }
}

// Reject task
async function rejectTask(approvalId) {
    try {
        await apiCall(`/api/approvals/${approvalId}/reject`, { method: 'POST' });
        showToast('Task rejected', 'warning');
        await loadTasks();
        await loadApprovals();
    } catch (error) {
        showToast('Failed to reject task', 'error');
        console.error('Error rejecting task:', error);
    }
}

// Update statistics
function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const pending = tasks.filter(t => t.status === 'PENDING').length;

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('inprogress-tasks').textContent = inProgress;
    document.getElementById('pending-tasks').textContent = pending;
}

// Render tasks
function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    const statusFilter = document.getElementById('status-filter').value;
    const platformFilter = document.getElementById('platform-filter').value;

    let filteredTasks = tasks;

    if (statusFilter) {
        filteredTasks = filteredTasks.filter(t => t.status === statusFilter);
    }

    if (platformFilter) {
        filteredTasks = filteredTasks.filter(t => t.platform === platformFilter);
    }

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '<div class="empty-state"><p>No tasks found</p></div>';
        return;
    }

    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item">
            <div class="task-header">
                <div class="task-title">${escapeHtml(task.description)}</div>
                <div class="task-meta">
                    <span class="badge status-${task.status.toLowerCase()}">${task.status}</span>
                    <span class="badge platform">${task.platform}</span>
                </div>
            </div>
            <div class="task-description">
                ${escapeHtml(task.instructions)}
            </div>
            <div class="task-footer">
                <div>
                    <strong>Priority:</strong> ${task.priority}
                    ${task.assignedAgent ? ` | <strong>Agent:</strong> ${task.assignedAgent}` : ''}
                </div>
                <div>
                    ${formatDate(task.createdAt)}
                </div>
            </div>
        </div>
    `).join('');
}

// Render approvals
function renderApprovals() {
    const approvalsSection = document.getElementById('approvals-section');
    const approvalsList = document.getElementById('approvals-list');

    if (approvals.length === 0) {
        approvalsSection.style.display = 'none';
        return;
    }

    approvalsSection.style.display = 'block';
    approvalsList.innerHTML = approvals.map(approval => {
        const task = tasks.find(t => t.id === approval.taskId);
        return `
            <div class="approval-item">
                <div><strong>Task:</strong> ${task ? escapeHtml(task.description) : 'Unknown'}</div>
                <div><strong>Reason:</strong> ${escapeHtml(approval.reason)}</div>
                <div><strong>Requested:</strong> ${formatDate(approval.requestedAt)}</div>
                <div class="approval-actions">
                    <button class="btn btn-success btn-sm approve-btn" data-approval-id="${approval.id}">
                        ✓ Approve
                    </button>
                    <button class="btn btn-danger btn-sm reject-btn" data-approval-id="${approval.id}">
                        ✗ Reject
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Render platforms
function renderPlatforms() {
    const platformsList = document.getElementById('platforms-list');

    if (platforms.length === 0) {
        platformsList.innerHTML = '<div class="empty-state"><p>Loading platforms...</p></div>';
        return;
    }

    const platformIcons = {
        'WIX': '🌐',
        'SLACK': '💬',
        'GITHUB': '⚙️',
        'BING_COPILOT': '🔍',
        'GEMINI': '🤖',
        'CLAUDE': '💡'
    };

    platformsList.innerHTML = platforms.map(platform => `
        <div class="platform-item">
            <div class="platform-icon">${platformIcons[platform.getPlatformType()] || '📦'}</div>
            <div class="platform-name">${platform.getPlatformType() || 'Unknown'}</div>
        </div>
    `).join('');
}

// Filter tasks
function filterTasks() {
    renderTasks();
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
