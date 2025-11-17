// ===== Global Variables =====
let tasks = [];
let editingTaskId = null;
let currentFilter = 'all';

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    init3DBackground();
});

// ===== Initialize Application =====
function initializeApp() {
    loadTasksFromStorage();
    renderTasks();
    updateStats();
    
    // Check for shared data in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('data')) {
        try {
            const sharedData = JSON.parse(atob(urlParams.get('data')));
            tasks = sharedData;
            saveTasksToStorage();
            renderTasks();
            updateStats();
        } catch (e) {
            console.error('Error loading shared data:', e);
        }
    }
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Add Task Button
    document.getElementById('addTaskBtn').addEventListener('click', openAddTaskModal);
    
    // Modal Controls
    document.getElementById('closeModal').addEventListener('click', closeTaskModal);
    document.getElementById('cancelBtn').addEventListener('click', closeTaskModal);
    
    // Task Form Submit
    document.getElementById('taskForm').addEventListener('submit', handleTaskSubmit);
    
    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Share Button
    document.getElementById('shareBtn').addEventListener('click', openShareModal);
    document.getElementById('closeShareModal').addEventListener('click', closeShareModal);
    document.getElementById('copyLinkBtn').addEventListener('click', copyShareLink);
    
    // Export Button
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
    // Search Input
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => handleFilter(e.target.dataset.filter));
    });
    
    // Share Options
    document.querySelectorAll('.share-option').forEach(btn => {
        btn.addEventListener('click', (e) => shareToSocial(e.target.dataset.platform));
    });
    
    // Close modal on outside click
    document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskModal') closeTaskModal();
    });
    
    document.getElementById('shareModal').addEventListener('click', (e) => {
        if (e.target.id === 'shareModal') closeShareModal();
    });
}

// ===== Task Management =====
function openAddTaskModal() {
    editingTaskId = null;
    document.getElementById('modalTitle').textContent = 'Add New Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskModal').classList.add('show');
}

function openEditTaskModal(taskId) {
    editingTaskId = taskId;
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskHeading').value = task.heading;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskModal').classList.add('show');
    }
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('show');
    document.getElementById('taskForm').reset();
    editingTaskId = null;
}

function handleTaskSubmit(e) {
    e.preventDefault();
    
    const heading = document.getElementById('taskHeading').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const category = document.getElementById('taskCategory').value;
    
    if (!heading || !description) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (editingTaskId) {
        // Update existing task
        const taskIndex = tasks.findIndex(t => t.id === editingTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                heading,
                description,
                category,
                updatedAt: new Date().toISOString()
            };
        }
    } else {
        // Create new task
        const newTask = {
            id: generateId(),
            heading,
            description,
            category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        tasks.unshift(newTask);
    }
    
    saveTasksToStorage();
    renderTasks();
    updateStats();
    closeTaskModal();
    
    // Show success message
    showNotification(editingTaskId ? 'Task updated successfully!' : 'Task added successfully!');
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasksToStorage();
        renderTasks();
        updateStats();
        showNotification('Task deleted successfully!');
    }
}

// ===== Render Functions =====
function renderTasks() {
    const tasksGrid = document.getElementById('tasksGrid');
    const emptyState = document.getElementById('emptyState');
    
    let filteredTasks = filterTasks();
    
    if (filteredTasks.length === 0) {
        tasksGrid.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    tasksGrid.innerHTML = filteredTasks.map(task => `
        <div class="task-card" data-id="${task.id}">
            <div class="task-header">
                <span class="task-category" style="background: ${getCategoryColor(task.category)}">
                    ${getCategoryIcon(task.category)} ${task.category}
                </span>
                <div class="task-actions">
                    <button class="task-action-btn" onclick="openEditTaskModal('${task.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="task-action-btn" onclick="deleteTask('${task.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            <h3 class="task-heading">${escapeHtml(task.heading)}</h3>
            <p class="task-description">${escapeHtml(task.description)}</p>
            <div class="task-footer">
                <span class="task-date">📅 ${formatDate(task.createdAt)}</span>
            </div>
        </div>
    `).join('');
}

function filterTasks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    let filtered = tasks.filter(task => {
        const matchesSearch = task.heading.toLowerCase().includes(searchTerm) ||
                            task.description.toLowerCase().includes(searchTerm);
        
        if (currentFilter === 'all') return matchesSearch;
        
        const taskDate = new Date(task.createdAt);
        const now = new Date();
        
        if (currentFilter === 'today') {
            return matchesSearch && isToday(taskDate);
        }
        
        if (currentFilter === 'week') {
            return matchesSearch && isThisWeek(taskDate);
        }
        
        return matchesSearch;
    });
    
    return filtered;
}

function handleSearch() {
    renderTasks();
}

function handleFilter(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    renderTasks();
}

// ===== Stats Functions =====
function updateStats() {
    const totalTasks = tasks.length;
    const todayTasks = tasks.filter(t => isToday(new Date(t.createdAt))).length;
    const streakDays = calculateStreak();
    
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('todayTasks').textContent = todayTasks;
    document.getElementById('streakDays').textContent = streakDays;
}

function calculateStreak() {
    if (tasks.length === 0) return 0;
    
    const sortedDates = tasks
        .map(t => new Date(t.createdAt).toDateString())
        .filter((date, index, self) => self.indexOf(date) === index)
        .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    let currentDate = new Date();
    
    for (let dateStr of sortedDates) {
        const date = new Date(dateStr);
        const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

// ===== Share Functions =====
function openShareModal() {
    const shareLink = generateShareLink();
    document.getElementById('shareLink').value = shareLink;
    document.getElementById('shareModal').classList.add('show');
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('show');
}

function generateShareLink() {
    const data = btoa(JSON.stringify(tasks));
    return `${window.location.origin}${window.location.pathname}?data=${data}`;
}

function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    showNotification('Link copied to clipboard!');
}

function shareToSocial(platform) {
    const shareLink = generateShareLink();
    const text = 'Check out my daily work log!';
    
    let url = '';
    
    switch(platform) {
        case 'twitter':
            url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
            break;
        case 'linkedin':
            url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`;
            break;
        case 'email':
            url = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(shareLink)}`;
            break;
    }
    
    if (url) {
        window.open(url, '_blank');
    }
}

// ===== Export/Import Functions =====
function exportData() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-work-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!');
}

// ===== Theme Functions =====
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = newTheme === 'light' ? '☀️' : '🌙';
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
document.querySelector('.theme-icon').textContent = savedTheme === 'light' ? '☀️' : '🌙';

// ===== Storage Functions =====
function saveTasksToStorage() {
    localStorage.setItem('dailyWorkTasks', JSON.stringify(tasks));
}

function loadTasksFromStorage() {
    const stored = localStorage.getItem('dailyWorkTasks');
    if (stored) {
        try {
            tasks = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading tasks:', e);
            tasks = [];
        }
    }
}

// ===== Utility Functions =====
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isThisWeek(date) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo && date <= now;
}

function getCategoryColor(category) {
    const colors = {
        work: '#3b82f6',
        personal: '#8b5cf6',
        learning: '#10b981',
        meeting: '#f59e0b',
        other: '#6b7280'
    };
    return colors[category] || colors.other;
}

function getCategoryIcon(category) {
    const icons = {
        work: '💼',
        personal: '👤',
        learning: '📚',
        meeting: '🤝',
        other: '📌'
    };
    return icons[category] || icons.other;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== 3D Background Animation =====
function init3DBackground() {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 5;
    
    // Create particles
    const geometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0x6366f1,
        size: 0.02,
        transparent: true,
        opacity: 0.6
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    // Animation
    function animate() {
        requestAnimationFrame(animate);
        
        particles.rotation.x += 0.0005;
        particles.rotation.y += 0.0005;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);