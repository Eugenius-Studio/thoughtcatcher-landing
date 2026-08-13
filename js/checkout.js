// ========================================
// CHECKOUT.JS - Pricing toggle + RevenueCat Web Billing (Web SDK)
// ========================================

// Public Web Billing SDK key (safe to expose in the browser).
const RC_WEB_BILLING_KEY = 'rcb_BJhSdvfYkgXqosJSLsOhlIKaXnsz';
const RC_ENTITLEMENT = 'pro';

// Standard RevenueCat package identifiers for each plan.
const PACKAGE_IDS = {
    monthly: '$rc_monthly',
    yearly: '$rc_annual',
    lifetime: '$rc_lifetime',
};

let selectedPlan = 'lifetime';

const pricingData = {
    monthly: { pro: '$9.99', proLabel: 'per month', proCTA: 'Upgrade to Pro' },
    yearly: { pro: '$89', proLabel: 'per year', proCTA: 'Upgrade to Pro' },
    lifetime: { pro: '$99', proLabel: 'one-time launch offer', proCTA: 'Claim lifetime access' }
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
// RevenueCat Web SDK
// ========================================
let _purchases = null;   // configured SDK instance
let _offering = null;    // current offering
let _rcReady = null;     // init promise (deduped)

// Stable anonymous id per browser so a returning visitor stays one customer.
function getAnonAppUserId() {
    let id = localStorage.getItem('rc_app_user_id');
    if (!id) {
        id = (window.crypto && crypto.randomUUID)
            ? crypto.randomUUID()
            : 'web_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        localStorage.setItem('rc_app_user_id', id);
    }
    return id;
}

async function initRevenueCat() {
    if (_rcReady) return _rcReady;
    _rcReady = (async () => {
        // Loaded from a CDN so no build step is needed on the static site.
        const { Purchases } = await import('https://esm.sh/@revenuecat/purchases-js');
        _purchases = Purchases.configure(RC_WEB_BILLING_KEY, getAnonAppUserId());
        const offerings = await _purchases.getOfferings();
        _offering = offerings.current;
    })();
    return _rcReady;
}

function packageFor(plan) {
    if (!_offering) return null;
    const id = PACKAGE_IDS[plan];
    return _offering.availablePackages.find(p => p.identifier === id) || null;
}

// ========================================
// CHECKOUT — opens RevenueCat's hosted purchase form (modal)
// RevenueCat handles payment (Stripe), grants the `pro` entitlement, and
// notifies the backend via the RevenueCat webhook. Buyer email is collected in
// the form and reconciled to the user server-side.
// ========================================
async function openCheckout(button) {
    const originalText = button ? button.textContent : '';
    if (button) { button.textContent = 'Loading...'; button.style.pointerEvents = 'none'; }

    if (typeof gtag !== 'undefined') {
        const val = selectedPlan === 'monthly' ? 9.99 : selectedPlan === 'yearly' ? 89 : 99;
        gtag('event', 'begin_checkout', {
            event_category: 'Ecommerce',
            event_label: `Pro ${selectedPlan}`,
            value: val,
        });
    }

    try {
        await initRevenueCat();
        const pkg = packageFor(selectedPlan);
        if (!pkg) throw new Error(`No package for ${selectedPlan}`);

        const { customerInfo } = await _purchases.purchase({ rcPackage: pkg });
        if (customerInfo.entitlements.active[RC_ENTITLEMENT]) {
            window.location.href = 'payment-success.html';
            return;
        }
    } catch (error) {
        // User cancelled the modal, or something failed — no hard error UI on cancel.
        console.error('Checkout error:', error);
    }

    if (button) { button.textContent = originalText; button.style.pointerEvents = ''; }
}

function initProCheckout() {
    document.querySelectorAll('[data-checkout="pro"]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openCheckout(button);
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
    initProCheckout();

    // Warm up the SDK/offering so the first click is instant.
    initRevenueCat().catch((e) => console.error('RevenueCat init failed:', e));
});
