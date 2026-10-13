// Application State
let activeScenario = null;
let currentDocIndex = 0;
let isStale = false;
let outputApproved = false;

// DOM Elements
const views = {
    inbox: document.getElementById('view-inbox'),
    workspace: document.getElementById('view-workspace')
};

const elements = {
    inboxBody: document.getElementById('inbox-body'),
    wsCaseId: document.getElementById('ws-case-id'),
    wsStatus: document.getElementById('ws-status'),
    issuesBanner: document.getElementById('issues-banner'),
    issuesList: document.getElementById('issues-list'),
    docTabs: document.getElementById('doc-tabs'),
    docViewer: document.getElementById('doc-viewer'),
    outputsForm: document.getElementById('outputs-form'),
    btnRevalidate: document.getElementById('btn-revalidate'),
    rulesContainer: document.getElementById('rules-container'),
    actionPreview: document.getElementById('action-preview'),
    
    // Action Buttons
    btnSaveDraft: document.getElementById('btn-save-draft'),
    btnRequestInfo: document.getElementById('btn-request-info'),
    btnEscalate: document.getElementById('btn-escalate'),
    btnReject: document.getElementById('btn-reject'),
    btnApprove: document.getElementById('btn-approve'),
    btnAuthorize: document.getElementById('btn-authorize'),

    // Modal
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title'),
    modalContent: document.getElementById('modal-content'),
    btnModalCancel: document.getElementById('btn-modal-cancel'),
    btnModalConfirm: document.getElementById('btn-modal-confirm')
};

// Initialize Application
function init() {
    renderInbox();
    setupNavigation();
    setupWorkspaceActions();
    setupModalActions();
}

function renderInbox() {
    elements.inboxBody.innerHTML = '';
    mockScenarios.forEach(scen => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${scen.id}</td>
            <td>${scen.title}</td>
            <td>${scen.triggerReason}</td>
            <td><span class="badge ${scen.status === 'Urgent' ? 'danger' : 'neutral'}">${scen.status}</span></td>
            <td><button class="btn primary small" onclick="openWorkspace('${scen.id}')">Claim Task</button></td>
        `;
        elements.inboxBody.appendChild(tr);
    });
}

function openWorkspace(scenarioId) {
    activeScenario = JSON.parse(JSON.stringify(mockScenarios.find(s => s.id === scenarioId))); // Deep copy for editing
    currentDocIndex = 0;
    isStale = false;
    outputApproved = false;

    // Switch View
    views.inbox.classList.remove('active');
    views.workspace.classList.add('active');
    document.getElementById('view-title').innerText = `Workspace: ${activeScenario.title}`;

    // Populate Header
    elements.wsCaseId.innerText = activeScenario.id;
    elements.wsStatus.innerText = "In Review";

    // Populate Issues
    if (activeScenario.issues.length > 0) {
        elements.issuesBanner.style.display = 'block';
        elements.issuesList.innerHTML = activeScenario.issues.map(i => `<li>${i}</li>`).join('');
    } else {
        elements.issuesBanner.style.display = 'none';
    }

    renderDocuments();
    renderOutputs();
    renderRules();
    renderActionPreview();
    updateButtonStates();
}

function renderDocuments() {
    elements.docTabs.innerHTML = '';
    activeScenario.documents.forEach((doc, idx) => {
        const tab = document.createElement('div');
        tab.className = `tab ${idx === currentDocIndex ? 'active' : ''}`;
        tab.innerText = doc.title;
        tab.onclick = () => {
            currentDocIndex = idx;
            renderDocuments();
        };
        elements.docTabs.appendChild(tab);
    });

    const activeDoc = activeScenario.documents[currentDocIndex];
    elements.docViewer.innerHTML = `
        <div class="doc-watermark">Synthetic prototype data</div>
        ${activeDoc.content}
    `;
}

function renderOutputs() {
    elements.outputsForm.innerHTML = '';
    activeScenario.outputs.forEach(out => {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label>${out.label}</label>
            <input type="text" value="${out.value}" data-key="${out.key}" class="${out.isStale ? 'stale' : ''}" oninput="handleInputChange()">
        `;
        elements.outputsForm.appendChild(div);
    });
}

function handleInputChange() {
    isStale = true;
    outputApproved = false;
    elements.btnRevalidate.style.display = 'inline-block';
    
    // Mark rules and action as stale
    activeScenario.rules.forEach(r => r.status = 'stale');
    renderRules();
    updateButtonStates();
}

function renderRules() {
    elements.rulesContainer.innerHTML = '';
    activeScenario.rules.forEach(rule => {
        const div = document.createElement('div');
        div.className = `rule-card ${rule.status}`;
        
        let badgeColor = 'neutral';
        if(rule.status === 'pass') badgeColor = 'success';
        if(rule.status === 'fail') badgeColor = 'danger';
        if(rule.status === 'stale') badgeColor = 'warning';

        div.innerHTML = `
            <div>
                <strong>${rule.name}</strong>
                <div style="font-size: 0.875rem; color: #64748b; margin-top: 4px;">${rule.detail}</div>
            </div>
            <span class="badge ${badgeColor}">${rule.status.toUpperCase()}</span>
        `;
        elements.rulesContainer.appendChild(div);
    });
}

function renderActionPreview() {
    elements.actionPreview.innerHTML = `
        <strong>Destination:</strong> ${activeScenario.action.destination}<br>
        <strong>Payload:</strong><br>
        <pre style="margin-top:0.5rem; color: #3b82f6;">${JSON.stringify(activeScenario.action.payload, null, 2)}</pre>
    `;
}

function updateButtonStates() {
    // Approve is disabled if stale, or already approved
    elements.btnApprove.disabled = isStale || outputApproved;
    
    if (outputApproved) {
        elements.btnApprove.style.display = 'none';
        elements.btnAuthorize.style.display = 'inline-block';
    } else {
        elements.btnApprove.style.display = 'inline-block';
        elements.btnAuthorize.style.display = 'none';
    }
}

function setupWorkspaceActions() {
    elements.btnRevalidate.onclick = () => {
        isStale = false;
        elements.btnRevalidate.style.display = 'none';
        
        // Mock revalidation logic based on scenario
        if (activeScenario.id === 'IC-01') {
            const rentalInput = document.querySelector('input[data-key="rentalDays"]');
            if (rentalInput && parseInt(rentalInput.value) <= 10) {
                activeScenario.rules[0].status = 'pass';
                activeScenario.rules[0].detail = "Rental days within limit.";
            } else {
                activeScenario.rules[0].status = 'fail';
            }
        } else {
            // Generic fallback pass
            activeScenario.rules.forEach(r => r.status = 'pass');
        }
        
        // Remove stale class from inputs
        document.querySelectorAll('.form-group input').forEach(input => input.classList.remove('stale'));
        renderRules();
        updateButtonStates();
    };

    elements.btnApprove.onclick = () => {
        openModal("Approve Reviewed Output", "Are you sure you want to approve this output version? This does not execute external actions.", () => {
            outputApproved = true;
            elements.wsStatus.innerText = "Output Approved";
            updateButtonStates();
            closeModal();
        });
    };

    elements.btnAuthorize.onclick = () => {
        openModal("Authorize Exact Action", `Execute payload to ${activeScenario.action.destination}? <br><br><b>Execution is final and writes to downstream systems.</b>`, () => {
            elements.wsStatus.innerText = "Execution Succeeded";
            elements.btnAuthorize.disabled = true;
            elements.btnAuthorize.innerText = "Executed";
            closeModal();
        });
    };
    
    elements.btnReject.onclick = () => {
         openModal("Reject Agent Proposal", "Reject the automated proposal? This returns the workflow but does NOT deny the customer claim.", () => {
            elements.wsStatus.innerText = "Proposal Rejected";
            updateButtonStates();
            closeModal();
        });
    };
}

// Modal Logic
let modalConfirmCallback = null;

function openModal(title, content, onConfirm) {
    elements.modalTitle.innerText = title;
    elements.modalContent.innerHTML = content;
    modalConfirmCallback = onConfirm;
    elements.modalOverlay.style.display = 'flex';
}

function closeModal() {
    elements.modalOverlay.style.display = 'none';
    modalConfirmCallback = null;
}

function setupModalActions() {
    elements.btnModalCancel.onclick = closeModal;
    elements.btnModalConfirm.onclick = () => {
        if (modalConfirmCallback) modalConfirmCallback();
    };
}

// Navigation
function setupNavigation() {
    document.getElementById('nav-inbox').onclick = () => {
        views.workspace.classList.remove('active');
        views.inbox.classList.add('active');
        document.getElementById('view-title').innerText = "My Tasks";
    };
}

// Boot
window.onload = init;
