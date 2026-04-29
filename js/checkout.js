// ========================================
// CHECKOUT.JS - Pricing toggle, checkout handlers
// ========================================

const API_BASE_URL = 'https://taskvoice-backend-qnjgdkzioq-uc.a.run.app';
const API_ENDPOINTS = {
    founderDeal: `${API_BASE_URL}/api/founder-deal/checkout`,
    proSubscribe: `${API_BASE_URL}/api/pro/subscribe`
};

let selectedPlan = 'monthly';

const pricingData = {
    monthly: { pro: '$9.99', proLabel: 'per month', proCTA: 'Upgrade to Pro' },
    yearly: { pro: '$89', proLabel: 'per year', proCTA: 'Upgrade to Pro' },
    lifetime: { pro: '$149', proLabel: 'one-time launch offer', proCTA: 'Claim lifetime access' }
};

function updatePricingDisplay(plan) {
    selectedPlan = plan;
    const data = pricingData[plan];

    document.querySelectorAll('.pricing-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.plan === plan);
    });

    const proPrice = document.getElementById('proPrice');
    const proPeriod = document.getElementById('proPeriod');
    const proCTA = document.getElementById('proCTA');
    if (proPrice) proPrice.textContent = data.pro;
    if (proPeriod) proPeriod.textContent = data.proLabel;
    if (proCTA) proCTA.textContent = data.proCTA;
}

// ========================================
// FOUNDER DEAL COUNTER
// ========================================
function updateFounderCounter() {
    const el = document.getElementById('founderRemainingCount');
    if (el) el.textContent = '92';
}

// ========================================
// FOUNDER DEAL CHECKOUT
// ========================================
function initFounderCheckout() {
    const btn = document.getElementById('founderCTA');
    if (!btn) return;

    btn.addEventListener('click', async (e) => {
        e.preventDefault();

        const remaining = parseInt(document.getElementById('founderRemainingCount').textContent);
        if (remaining <= 0) {
            alert('Sorry, all Founder spots have been claimed!');
            return;
        }

        const originalText = btn.textContent;
        btn.textContent = 'Loading...';
        btn.style.pointerEvents = 'none';

        try {
            const response = await fetch(API_ENDPOINTS.founderDeal, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!response.ok) throw new Error('Failed to create checkout session');
            const data = await response.json();

            if (typeof gtag !== 'undefined') {
                gtag('event', 'begin_checkout', { event_category: 'Ecommerce', event_label: 'Founder Deal', value: 149 });
            }

            window.open(data.checkoutUrl, '_blank');
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong. Please try again or contact support@blurts.app');
            btn.textContent = originalText;
            btn.style.pointerEvents = '';
        }
    });
}

// ========================================
// PRO CHECKOUT
// ========================================
function initProCheckout() {
    document.querySelectorAll('[data-checkout="pro"]').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const originalText = button.textContent;
            button.textContent = 'Loading...';
            button.style.pointerEvents = 'none';

            try {
                const endpoint = selectedPlan === 'lifetime' ? API_ENDPOINTS.founderDeal : API_ENDPOINTS.proSubscribe;
                const body = selectedPlan === 'lifetime' ? {} : { plan: selectedPlan };

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!response.ok) throw new Error('Failed to create checkout session');
                const data = await response.json();

                if (typeof gtag !== 'undefined') {
                    const val = selectedPlan === 'monthly' ? 9.99 : selectedPlan === 'yearly' ? 89 : 149;
                    gtag('event', 'begin_checkout', { event_category: 'Ecommerce', event_label: `Pro ${selectedPlan}`, value: val });
                }

                window.open(data.checkoutUrl, '_blank');
            } catch (error) {
                console.error('Checkout error:', error);
                alert('Something went wrong. Please try again or contact support@blurts.app');
                button.textContent = originalText;
                button.style.pointerEvents = '';
            }
        });
    });
}

// ========================================
// INIT
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.pricing-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => updatePricingDisplay(btn.dataset.plan));
    });

    updatePricingDisplay('lifetime');
    updateFounderCounter();
    initFounderCheckout();
    initProCheckout();
});
