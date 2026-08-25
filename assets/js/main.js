/*!
 * ProsVelop India Pvt Ltd — site behaviour
 * Modules: mobile nav, hero slider, loan modal, EMI calculator,
 *          quick-apply form, trust counters, scroll spy.
 */
(function () {
  'use strict';

  var WHATSAPP = '919665205255';
  var PHONE    = '+919665205255';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /** Build a wa.me deep link with a pre-filled message. */
  function whatsappLink(message) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(message);
  }

  /** Lock/unlock body scroll — reference counted so nav + modal cannot fight. */
  var scrollLocks = 0;
  function lockScroll(on) {
    scrollLocks = Math.max(0, scrollLocks + (on ? 1 : -1));
    document.body.classList.toggle('is-locked', scrollLocks > 0);
  }


  /* ======================================================================
     MOBILE NAVIGATION
     ====================================================================== */

  function initNav() {
    var toggle = document.querySelector('.menu-toggle');
    var nav    = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    var mobileQuery = window.matchMedia('(max-width: 819px)');  // must match the CSS drawer breakpoint

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      lockScroll(open && mobileQuery.matches);
    }

    function close() {
      if (nav.classList.contains('is-open')) setOpen(false);
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) close();
    });

    // Leaving the mobile range must never strand a locked body.
    function onBreakpoint() {
      if (!mobileQuery.matches) close();
    }
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', onBreakpoint);
    else if (mobileQuery.addListener) mobileQuery.addListener(onBreakpoint);
  }


  /* ======================================================================
     HERO SLIDER
     ====================================================================== */

  function initSlider() {
    var slider = document.querySelector('.slider');
    if (!slider) return;

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
    var dots   = Array.prototype.slice.call(slider.querySelectorAll('.slider__dot'));
    if (slides.length < 2) return;

    var INTERVAL = 3200;
    var index    = 0;
    var timer    = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        // Off-screen slides must not be reachable by keyboard.
        slide.querySelectorAll('a, button').forEach(function (el) {
          if (active) el.removeAttribute('tabindex');
          else el.setAttribute('tabindex', '-1');
        });
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-selected', String(i === index));
      });
    }

    function start() {
      if (timer || prefersReducedMotion.matches) return;
      timer = window.setInterval(function () { show(index + 1); }, INTERVAL);
    }

    function stop() {
      window.clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        stop();
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    // Pause while the tab is hidden so the deck does not race ahead.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    // Touch swipe
    var touchX = null;
    slider.addEventListener('touchstart', function (event) {
      touchX = event.changedTouches[0].clientX;
      stop();
    }, { passive: true });

    slider.addEventListener('touchend', function (event) {
      if (touchX === null) return;
      var delta = event.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 45) show(index + (delta < 0 ? 1 : -1));
      touchX = null;
      start();
    }, { passive: true });

    // Keyboard
    slider.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { show(index + 1); stop(); start(); }
      if (event.key === 'ArrowLeft')  { show(index - 1); stop(); start(); }
    });

    show(0);
    start();
  }


  /* ======================================================================
     LOAN MODAL
     ====================================================================== */

  var LOANS = {
    personal: {
      title: 'Personal Loan',
      desc: 'A simple route to explore financing for eligible personal requirements.',
      docs: ['PAN Card', 'Aadhaar / valid KYC ID', 'Recent salary slips or income proof',
             'Recent bank statement', 'Address proof, if required']
    },
    business: {
      title: 'Business Loan',
      desc: 'Loan assistance for eligible business working-capital or expansion requirements.',
      docs: ['PAN Card & KYC', 'Business registration / proof', 'Bank statements',
             'ITR / financial statements, as applicable', 'Business address proof']
    },
    home: {
      title: 'Home Loan',
      desc: 'Financing assistance for eligible home purchase, construction or related requirements.',
      docs: ['PAN Card & KYC', 'Income proof / salary slips', 'Bank statements',
             'Property documents, as applicable', 'Address proof']
    },
    mortgage: {
      title: 'Mortgage Loan',
      desc: 'Explore eligible funding against property, subject to property and borrower assessment.',
      docs: ['PAN Card & KYC', 'Income proof', 'Bank statements',
             'Property ownership / title documents', 'Property-related papers as requested by lender']
    },
    car: {
      title: 'Auto Loan',
      desc: 'Loan assistance for eligible pre-owned vehicle purchases, subject to lender and vehicle assessment.',
      docs: ['PAN Card & KYC', 'Income proof', 'Bank statements',
             'Vehicle RC / seller documents, as applicable', 'Insurance / valuation documents, if required']
    },
    doctor: {
      title: 'Doctor Loan',
      desc: 'Loan assistance for doctors and medical professionals, subject to qualification and lender policy.',
      docs: ['PAN Card & KYC', 'Medical degree / registration certificate',
             'Practice or employment proof', 'Bank statements',
             'ITR / income proof, as applicable']
    }
  };

  function initModal() {
    var modal = document.getElementById('loan-modal');
    if (!modal) return;

    var titleEl = document.getElementById('modal-title');
    var descEl  = document.getElementById('modal-description');
    var docsEl  = document.getElementById('modal-docs');
    var waEl    = document.getElementById('modal-whatsapp');
    var closeEl = modal.querySelector('.modal__close');
    var lastFocused = null;

    function open(key) {
      var loan = LOANS[key];
      if (!loan) return;

      lastFocused = document.activeElement;
      titleEl.textContent = loan.title;
      descEl.textContent  = loan.desc;

      docsEl.textContent = '';
      loan.docs.forEach(function (doc) {
        var li = document.createElement('li');
        li.textContent = doc;
        docsEl.appendChild(li);
      });

      waEl.href = whatsappLink(
        'Hello ProsVelop, I want to apply/enquire for a ' + loan.title + '. Please contact me.'
      );

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      lockScroll(true);
      closeEl.focus();
    }

    function close() {
      if (!modal.classList.contains('is-open')) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      lockScroll(false);
      if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('[data-loan]').forEach(function (card) {
      card.addEventListener('click', function () { open(card.dataset.loan); });
    });

    closeEl.addEventListener('click', close);
    modal.querySelector('.modal__backdrop').addEventListener('click', close);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab' || !modal.classList.contains('is-open')) return;

      // Keep Tab inside the dialog while it is open.
      var focusable = modal.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      var first = focusable[0];
      var last  = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }


  /* ======================================================================
     EMI CALCULATOR
     ====================================================================== */

  function initCalculator() {
    var amountEl = document.getElementById('emi-amount');
    var rateEl   = document.getElementById('emi-rate');
    var yearsEl  = document.getElementById('emi-years');
    var valueEl  = document.getElementById('emi-value');
    var metaEl   = document.getElementById('emi-meta');
    var buttonEl = document.getElementById('emi-calculate');

    if (!amountEl || !rateEl || !yearsEl || !valueEl || !metaEl) return;

    var formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });

    function calculate() {
      var principal = Number(amountEl.value) || 0;
      var annual    = Number(rateEl.value)   || 0;
      var years     = Number(yearsEl.value)  || 0;

      var monthlyRate = annual / 12 / 100;
      var months      = years * 12;
      var emi         = 0;

      if (principal > 0 && months > 0) {
        emi = monthlyRate === 0
          ? principal / months
          : principal * monthlyRate * Math.pow(1 + monthlyRate, months) /
            (Math.pow(1 + monthlyRate, months) - 1);
      }

      valueEl.textContent = formatter.format(emi);
      metaEl.textContent  = 'For ' + formatter.format(principal) + ' · ' +
                            annual + '% · ' + years + ' years';
    }

    if (buttonEl) buttonEl.addEventListener('click', calculate);
    [amountEl, rateEl, yearsEl].forEach(function (el) {
      el.addEventListener('input', calculate);
    });

    calculate();
  }


  /* ======================================================================
     QUICK APPLY FORM
     ====================================================================== */

  function initQuickApply() {
    var form = document.getElementById('quick-apply-form');
    if (!form) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var data = new FormData(form);
      var lines = [
        'Hello ProsVelop, I want to apply for a loan.',
        'Name: '          + (data.get('name')       || '-'),
        'Mobile: '        + (data.get('mobile')     || '-'),
        'Occupation: '    + (data.get('occupation') || '-'),
        'Loan Type: '     + (data.get('loanType')   || '-'),
        'Loan Amount: '   + (data.get('amount')     || '-'),
        'Annual Income: ' + (data.get('income')     || '-')
      ];

      window.open(whatsappLink(lines.join('\n')), '_blank', 'noopener');
    });
  }


  /* ======================================================================
     TRUST COUNTERS
     ====================================================================== */

  function initCounters() {
    var section = document.getElementById('trust');
    if (!section) return;

    // id -> [final value, decimal places, suffix]
    var COUNTERS = [
      ['count-customers', 1000, 0, '+'],
      ['count-reviews',    4.9, 1, '/5'],
      ['count-lenders',     40, 0, '+'],
      ['count-types',        6, 0, '']
    ];

    var targets = COUNTERS
      .map(function (c) {
        var el = document.getElementById(c[0]);
        return el ? { el: el, value: c[1], decimals: c[2], suffix: c[3] } : null;
      })
      .filter(Boolean);

    if (!targets.length) return;

    function render(t, value) {
      t.el.textContent = value.toFixed(t.decimals) + t.suffix;
    }

    function settle() {
      targets.forEach(function (t) { render(t, t.value); });
    }

    if (prefersReducedMotion.matches) { settle(); return; }

    var started = false;
    function animate() {
      if (started) return;
      started = true;

      targets.forEach(function (t) { render(t, 0); });

      var duration = 1800;
      var start    = performance.now();

      function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased    = 1 - Math.pow(1 - progress, 3);

        targets.forEach(function (t) { render(t, t.value * eased); });

        if (progress < 1) requestAnimationFrame(tick);
        else settle();
      }

      requestAnimationFrame(tick);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animate();
          observer.disconnect();
        });
      }, { threshold: 0.25 }).observe(section);
    } else {
      animate();
    }
  }


  /* ======================================================================
     SCROLL SPY — marks the nav link for the section in view
     ====================================================================== */

  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;

    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
    var map   = {};

    links.forEach(function (link) {
      var id = (link.getAttribute('href') || '').replace('#', '');
      var section = id && document.getElementById(id);
      if (section) map[id] = link;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) { link.removeAttribute('aria-current'); });
        var link = map[entry.target.id];
        if (link) link.setAttribute('aria-current', 'page');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(map).forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }


  /* ======================================================================
     BOOTSTRAP
     ====================================================================== */

  function init() {
    initNav();
    initSlider();
    initModal();
    initCalculator();
    initQuickApply();
    initCounters();
    initScrollSpy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
