// ========================================
// MODALS.JS - Waitlist + Early Access modals
// ========================================

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxUBD3kk0gPPdkITCGc-qSUbKkmRhujg_aoGsqTyWzdILfBbU0iNua8QACQhgehB_6gtw/exec';

// ========================================
// EARLY ACCESS MODAL
// ========================================
function initEarlyAccessModal() {
    const modal = document.getElementById('earlyAccessModal');
    const closeBtn = modal.querySelector('.modal-close');
    const form = document.getElementById('earlyAccessForm');
    const formView = document.getElementById('earlyAccessFormView');
    const successView = document.getElementById('earlyAccessSuccessView');
    const tierSelect = document.getElementById('ea-tier');

    function openModal(tier) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (tier && tierSelect) tierSelect.value = tier;
    }

    function closeModal() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'dismiss', { event_category: 'Modal', event_label: 'Early Access Modal Closed' });
        }
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        setTimeout(() => {
            formView.style.display = 'block';
            successView.classList.remove('active');
            form.reset();
        }, 300);
    }

    // Open buttons
    document.querySelectorAll('.open-early-access').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tier = btn.getAttribute('data-tier');
            if (tier === 'pro') return; // Pro goes to checkout
            e.preventDefault();
            openModal(tier);
        });
    });

    // Close button
    closeBtn.addEventListener('click', closeModal);

    // Click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            tier: formData.get('tier'),
            useCase: formData.get('useCase') || 'Not provided',
            betaAccess: formData.get('betaAccess') === 'on',
            timestamp: new Date().toISOString(),
            source: 'early_access_modal'
        };

        if (typeof gtag !== 'undefined') {
            gtag('event', 'submit', { event_category: 'Form', event_label: 'Early Access Signup' });
        }

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(() => {
            document.getElementById('earlyAccessConfirmedEmail').textContent = data.email;
            formView.style.display = 'none';
            successView.classList.add('active');
        }).catch(error => {
            console.error('Network error:', error);
            alert('Network error. Please check your connection and try again.');
        });
    });

    // Expose for cross-modal use
    window.openEarlyAccessModal = openModal;
    window.closeEarlyAccessModal = closeModal;
}

// ========================================
// WAITLIST MODAL (Teams/B2B)
// ========================================
function initWaitlistModal() {
    const modal = document.getElementById('waitlistModal');
    const closeBtn = modal.querySelector('.modal-close');
    const form = document.getElementById('waitlistForm');
    const formView = document.getElementById('formView');
    const successView = document.getElementById('successView');
    const interestSelect = document.getElementById('interest');

    function openModal(tier) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (tier && interestSelect) interestSelect.value = tier;
    }

    function closeModal() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'dismiss', { event_category: 'Modal', event_label: 'Waitlist Modal Closed' });
        }
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        setTimeout(() => {
            formView.style.display = 'block';
            successView.classList.remove('active');
            form.reset();
        }, 300);
    }

    // Open buttons
    document.querySelectorAll('.open-waitlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(btn.getAttribute('data-tier'));
        });
    });

    // Close button
    closeBtn.addEventListener('click', closeModal);

    // Click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // "Start Free Trial" button inside waitlist success
    document.querySelectorAll('.close-and-open-early-access').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tier = btn.getAttribute('data-tier');
            if (tier === 'pro') return;
            e.preventDefault();
            closeModal();
            setTimeout(() => {
                if (window.openEarlyAccessModal) window.openEarlyAccessModal(tier);
            }, 350);
        });
    });

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            company: formData.get('company') || 'Not provided',
            teamSize: formData.get('teamSize') || 'Not provided',
            interest: formData.get('interest'),
            earlyAccess: formData.get('earlyAccess') === 'on',
            timestamp: new Date().toISOString()
        };

        if (typeof gtag !== 'undefined') {
            gtag('event', 'submit', { event_category: 'Form', event_label: 'Team Waitlist Signup' });
        }

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(() => {
            document.getElementById('confirmedEmail').textContent = data.email;
            formView.style.display = 'none';
            successView.classList.add('active');
        }).catch(error => {
            console.error('Network error:', error);
            alert('Network error. Please check your connection and try again.');
        });
    });

    window.closeWaitlistModal = closeModal;
}

// ========================================
// ESCAPE KEY HANDLER
// ========================================
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const ea = document.getElementById('earlyAccessModal');
    const wl = document.getElementById('waitlistModal');
    if (ea && ea.classList.contains('active') && window.closeEarlyAccessModal) {
        window.closeEarlyAccessModal();
    } else if (wl && wl.classList.contains('active') && window.closeWaitlistModal) {
        window.closeWaitlistModal();
    }
});

// ========================================
// ANDROID WAITLIST FORM
// ========================================
function initAndroidWaitlist() {
    const form = document.getElementById('androidWaitlistForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('android-email').value;
        const btn = form.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = 'Joining...';
        btn.disabled = true;

        if (typeof gtag !== 'undefined') {
            gtag('event', 'submit', { event_category: 'Form', event_label: 'Android Waitlist' });
        }

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, source: 'android_waitlist', timestamp: new Date().toISOString() })
        }).then(() => {
            btn.textContent = 'You\'re on the list!';
            btn.style.background = 'var(--mint)';
            document.getElementById('android-email').value = '';
        }).catch(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            alert('Network error. Please try again.');
        });
    });
}

// ========================================
// INIT
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initEarlyAccessModal();
    initWaitlistModal();
    initAndroidWaitlist();
});
