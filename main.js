// State management
let projects = [];
let currentProjectId = null;
let saveTimeout = null;

// Configuration - set via environment variables at build time
const CONFIG = {
    apiPath: import.meta.env.VITE_API_PATH || '/api/projects',
    title: import.meta.env.VITE_APP_TITLE || 'Idea Garden',
    heading: import.meta.env.VITE_APP_HEADING || '🌱 Idea Garden',
    addButton: import.meta.env.VITE_ADD_BUTTON || 'Add Idea',
    placeholder: import.meta.env.VITE_PLACEHOLDER || 'Plant a new idea...',
    emptyMessage: import.meta.env.VITE_EMPTY_MESSAGE || 'No ideas planted yet. Plant your first idea above!'
};

// Apply configuration to UI
function applyConfig() {
    document.title = CONFIG.title;
    document.querySelector('h1').textContent = CONFIG.heading;
    document.querySelector('#projectInput').placeholder = CONFIG.placeholder;
    document.querySelector('button[onclick="addProject()"]').textContent = CONFIG.addButton;
}

// API functions
async function loadProjects() {
    try {
        const response = await fetch(CONFIG.apiPath);
        if (response.ok) {
            projects = await response.json();
            renderProjects();
        }
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

async function saveProjects() {
    try {
        const response = await fetch(CONFIG.apiPath, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projects)
        });
        if (!response.ok) {
            console.error('Failed to save projects');
        }
    } catch (error) {
        console.error('Failed to save projects:', error);
    }
}

// Rendering functions
function renderProjects() {
    const list = document.getElementById('projectList');

    if (projects.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <p>${CONFIG.emptyMessage}</p>
            </div>
        `;
        return;
    }

    list.innerHTML = projects.map((project, index) => {
        const preview = getProjectPreview(project.details);
        const created = formatDate(project.created || Date.now());
        const charCount = project.details ? project.details.length : 0;

        return `
            <li class="project-item" draggable="true" data-index="${index}" data-id="${project.id}">
                <div class="project-content" onclick="showDetails(${project.id})">
                    <div class="project-title">${escapeHtml(project.title)}</div>
                    ${preview ? `<div class="project-preview">${escapeHtml(preview)}</div>` : ''}
                    <div class="project-meta">
                        <span>Created ${created}</span>
                        <span>${charCount} chars</span>
                    </div>
                </div>
            </li>
        `;
    }).join('');

    // Add drag and drop event listeners
    addDragAndDropListeners();
}

function getProjectPreview(details) {
    if (!details || details.trim() === '') return '';
    // Remove markdown-style bullets and clean up
    const cleaned = details.replace(/^[\s\-\*]*/, '').replace(/\n[\s\-\*]*/g, ' ');
    return cleaned.length > 80 ? cleaned.substring(0, 80) + '...' : cleaned;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
}

// Project management functions
window.addProject = function() {
    const input = document.getElementById('projectInput');
    const title = input.value.trim();

    if (!title) return;

    const project = {
        id: Date.now(),
        title: title,
        details: '',
        created: Date.now()
    };

    projects.push(project);
    saveProjects();
    renderProjects();
    input.value = '';
}

window.deleteProject = function() {
    if (currentProjectId === null) return;
    if (confirm('Are you sure you want to delete this idea?')) {
        projects = projects.filter(p => p.id !== currentProjectId);
        saveProjects();
        renderProjects();
        showMainView();
    }
}

window.showDetails = function(id) {
    currentProjectId = id;
    const project = projects.find(p => p.id === id);

    if (!project) return;

    document.getElementById('detailsTitle').textContent = project.title;
    document.getElementById('detailsTextarea').value = project.details || '';
    document.getElementById('mainView').style.display = 'none';
    document.getElementById('detailsView').style.display = 'block';
    document.getElementById('saveStatus').textContent = '';
}

window.editTitle = function() {
    const titleElement = document.getElementById('detailsTitle');
    const currentTitle = titleElement.textContent;

    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.className = 'details-title-input';
    input.id = 'detailsTitleInput';

    // Replace title with input
    titleElement.style.display = 'none';
    titleElement.parentNode.insertBefore(input, titleElement.nextSibling);

    // Focus and select text
    input.focus();
    input.select();

    // Save on Enter or blur
    function saveTitle() {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== currentTitle) {
            const project = projects.find(p => p.id === currentProjectId);
            if (project) {
                project.title = newTitle;
                saveProjects();
                renderProjects(); // Update the main view
            }
        }

        // Restore title display
        titleElement.textContent = newTitle || currentTitle;
        titleElement.style.display = 'block';
        input.remove();
    }

    function cancelEdit() {
        titleElement.style.display = 'block';
        input.remove();
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveTitle();
        } else if (e.key === 'Escape') {
            cancelEdit();
        }
    });

    input.addEventListener('blur', saveTitle);
}

window.showMainView = function() {
    document.getElementById('mainView').style.display = 'block';
    document.getElementById('detailsView').style.display = 'none';
    currentProjectId = null;
}

function saveProjectDetails() {
    if (currentProjectId === null) return;

    const project = projects.find(p => p.id === currentProjectId);
    if (!project) return;

    const details = document.getElementById('detailsTextarea').value;
    project.details = details;
    saveProjects();

    // Show save confirmation
    const status = document.getElementById('saveStatus');
    status.textContent = 'Saved ✓';
    setTimeout(() => {
        status.textContent = '';
    }, 2000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Drag and drop functionality
let draggedElement = null;
let draggedIndex = null;

function addDragAndDropListeners() {
    const items = document.querySelectorAll('.project-item');

    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedElement = this;
    draggedIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.project-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';

    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== this) {
        const dropIndex = parseInt(this.dataset.index);

        // Reorder the projects array
        const [removed] = projects.splice(draggedIndex, 1);
        projects.splice(dropIndex, 0, removed);

        saveProjects();
        renderProjects();
    }

    return false;
}

// Event listeners
document.getElementById('detailsTextarea').addEventListener('input', () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveProjectDetails, 500);
});

document.getElementById('projectInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        window.addProject();
    }
});

// Initialize app
applyConfig();
loadProjects();
