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

    var INTERVAL = 2400;
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
      docs: [
        { label: 'Identity Proof', text: 'Passport, Driving License, PAN Card, Aadhar Card' },
        { label: 'Proof of Residence or Address Proof', text: 'Passport, Driving License, PAN Card, Aadhar Card, Electricity Bill, Telephone Bill, Ration Card' },
        { label: 'Age Proof', text: 'Passport, Driving License, PAN Card, Aadhar Card' },
        { label: 'Income Proof', text: '1 year Bank statement, 3 months Salary Slips' },
        { label: 'Employment Proof', text: 'Employment Certificate, ID Card Office address proof' },
        { label: 'Photograph', text: 'Passport-size photographs' },
        { label: 'Income tax returns', text: 'Documents of the past 2 years to verify income and tax payment history' }]
    },
    business: {
      title: 'Business Loan',
      desc: 'Submit the following documents to begin with the loan process:',
      docs: ['PAN Card', 
        'Address Proof for Residence such as Passport, Aadhar Card, Electricity Bill', 
        'ITR for the past 2-3 years', 
        'Current Bank Account Statement for the last 12 months', 
        'Address proof for Business such as the Electricity Bill', 
        'Sanction letter and Repayment schedule of existing loan', 
        'GST registration certificate and GST returns of latest 2 years', 
        'Udyam Aadhar registration certificate', 
        'Business Continuity proof of 3 years (3 years old ITR/Company registration etc)', 
        'Company PAN Card, Certificate of Incorporation, MOA, AOA List of Directors and Shareholding pattern for Pvt Ltd companies', 
        'Partnership Deed, Company pan Card for Partnership Companies'],
    },
    home: {
      title: 'Home Loan',
      desc: 'Financing assistance for eligible home purchase, construction or related requirements.',
      docs: [
        { heading: '1. Salaried Individuals' },
        'PAN Card',
        'Aadhar card',
        'Form 16',
        'Employee Identity Card',
        '3 Months Salary Slip',
        '6 Month Bank Account Statement',

        { heading: '2. Self-Employed Individuals' },
        'PAN Card',
        'Aadhar Card',
        'Partnership Deed',
        'AOA',
        'MOA',
        'Financial Statement Audited by CA',
        'Profit & Loss Account Statement',
        'Balance Sheet',
        '6 Months Bank Account Statement',
        'Professional Practice License for Doctors',
        'Registration Certificate of Establishment for Shops, Factories, and Other Establishments',
        'Business Address Proof']
    },
    mortgage: {
      title: 'Mortgage Loan',
      desc: 'Explore eligible funding against property, subject to property and borrower assessment.',
      docs: ['Proof of identity/residence',
       'Proof of income',
        'Property-related documents',
       'Proof of Business (for self-employed)',
        'Account statement for the last 6 months']
    },
    car: {
      title: 'Car Loan',
      desc: 'Loan assistance for eligible pre-owned vehicle purchases, subject to lender and vehicle assessment.',
      docs: ['KYC documents',
        'Salary Slip (latest 3 months)',
        'Last 2 years\' ITR as proof of income',
        'Salary account statement(latest 6 months)']
    },
    doctor: {
      title: 'Doctor Loan',
      desc: 'Loan assistance for doctors and medical professionals, subject to qualification and lender policy.',
      docs: ['KYC Documents',
        'Address Proof for Residence such as Passport, Aadhar Card, Electricity Bill',
        'Degree Certificate',
        'Valid Registration Certificate',
        'ITR for the past 2 years',
        'Current Bank Account Statement for the last 12 months',
        'Address proof for Business such as the Prescription letter',
        'Udyam Aadhar registration certificate']
    }
  };

  function strongText(value) {
    var el = document.createElement('strong');
    el.textContent = value;
    return el;
  }

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
      loan.docs.forEach(function (doc, i) {
        var li = document.createElement('li');

        // Cascade every item, not just the first few. Capped so a long list
        // still finishes promptly rather than trickling in.
        li.style.animationDelay = (0.18 + Math.min(i, 24) * 0.045).toFixed(3) + 's';

        // An entry is a plain string, a { heading } that titles a group, or a
        // { label, text } pair whose label is emphasised. Built as DOM nodes
        // rather than innerHTML, so the copy is never parsed as markup.
        if (typeof doc === 'string') {
          li.textContent = doc;
        } else if (doc.heading) {
          li.className = 'modal__docs-heading';
          li.appendChild(strongText(doc.heading));
        } else {
          li.appendChild(strongText(doc.label));
          li.appendChild(document.createTextNode(' \u2014 ' + doc.text));
        }

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

      var next = formatter.format(emi);
      if (next !== valueEl.textContent && !prefersReducedMotion.matches) {
        // restart the flash even on consecutive changes
        valueEl.classList.remove('is-updated');
        void valueEl.offsetWidth;
        valueEl.classList.add('is-updated');
      }

      valueEl.textContent = next;
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
      ['count-customers', 5000, 0, '+'],
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
     SCROLL REVEAL — cards rise into view, staggered along each row

     Deliberately rect-based rather than IntersectionObserver. The failure
     mode matters here: these are the page's main content blocks, so a
     throttled or unavailable observer must never be able to leave them
     blank. Two guarantees below make that impossible:
       1. anything already on screen at load is never hidden at all;
       2. anything off screen is revealed by the next scroll tick.
     ====================================================================== */

  function initReveal() {
    if (prefersReducedMotion.matches) return;

    // Grouped so the stagger restarts per block rather than running away
    // across the whole page.
    // [selector, cycle] — the cycle is walked per item, so neighbours in a
    // grid arrive by different routes instead of marching in as one block.
    // '' means the default rise.
    var GROUPS = [
      ['.section-head > *',     ['']],
      ['.directors__head > *',  ['']],
      ['.loan-grid > *',        ['reveal--flip', 'reveal--scale', 'reveal--drop',
                                 'reveal--tilt', 'reveal--scale', 'reveal--flip']],
      ['.feature-grid > *',     ['reveal--left', 'reveal--drop', 'reveal--right']],
      ['.about-points > *',     ['reveal--scale', 'reveal--drop']],
      ['.why-item',             ['reveal--left']],
      ['.about-usp li',         ['reveal--left']],
      ['.director-grid > *',    ['reveal--left', 'reveal--right']],
      ['.testimonial-grid > *', ['reveal--tilt', 'reveal--scale', 'reveal--flip',
                                 'reveal--drop']],
      ['.lender-grid > *',      ['reveal--scale', 'reveal--flip', 'reveal--drop']]
    ];

    var items = [];
    GROUPS.forEach(function (group) {
      var selector = group[0], cycle = group[1];
      Array.prototype.slice.call(document.querySelectorAll(selector))
        .forEach(function (el, i) {
          el.dataset.revealIndex = String(i % 6);   // stagger restarts each row
          var variant = cycle[i % cycle.length];
          if (variant) el.dataset.revealVariant = variant;
          items.push(el);
        });
    });
    if (!items.length) return;

    function viewport() {
      return window.innerHeight || document.documentElement.clientHeight;
    }

    // Only hide what is genuinely below the fold.
    var pending = items.filter(function (el) {
      if (el.getBoundingClientRect().top < viewport() * 0.92) return false;
      el.classList.add('reveal');
      if (el.dataset.revealVariant) el.classList.add(el.dataset.revealVariant);
      return true;
    });
    if (!pending.length) return;

    function show(el) {
      el.style.transitionDelay = (Number(el.dataset.revealIndex) * 115) + 'ms';
      el.classList.add('is-revealed');
    }

    function sweep() {
      var limit = viewport() - 90;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top > limit) return true;
        show(el);
        return false;
      });
      if (!pending.length) teardown();
    }

    // Time-throttled rather than rAF-throttled: the work is a handful of rect
    // reads on a list that only shrinks, and this keeps the reveal working
    // even where animation frames are throttled or suspended.
    var last = 0;
    function onScroll() {
      var now = Date.now();
      if (now - last < 80) return;
      last = now;
      sweep();
    }

    function teardown() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('load', onScroll);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', onScroll);       // images can shift the layout
    window.addEventListener('hashchange', function () { last = 0; sweep(); });

    sweep();
    // Landing on a #fragment jumps the page without always firing a scroll
    // event, so re-check shortly after load rather than relying on one.
    [120, 400, 900].forEach(function (t) {
      window.setTimeout(function () { last = 0; sweep(); }, t);
    });
  }


  /* ======================================================================
     CHROME ON SCROLL — header shadow and the back-to-top control
     ====================================================================== */

  function initScrollChrome() {
    var header   = document.querySelector('.header');
    var toTop    = document.querySelector('.to-top');
    var progress = document.querySelector('.scroll-progress span');
    if (!header && !toTop && !progress) return;

    var last = 0;
    function update() {
      var doc = document.documentElement;
      var y   = window.scrollY || doc.scrollTop || 0;

      if (header) header.classList.toggle('is-scrolled', y > 40);
      if (toTop)  toTop.classList.toggle('is-visible', y > 600);

      if (progress) {
        var travel = doc.scrollHeight - window.innerHeight;
        var ratio  = travel > 0 ? Math.min(Math.max(y / travel, 0), 1) : 0;
        progress.style.setProperty('--progress', ratio.toFixed(4));
      }
    }

    function onScroll() {
      var now = Date.now();
      if (now - last < 40) return;
      last = now;
      update();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('load', onScroll);
    update();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
        });
      });
    }
  }


  /* ======================================================================
     POINTER EFFECTS — spotlight, 3D tilt, magnetic buttons, orb parallax

     All pointer-only and all vanilla: these are cheap enough that pulling in
     an animation library for them would cost more than it saves.
     ====================================================================== */

  function initPointerFX() {
    // No cursor to follow on touch, and reduced-motion users opted out.
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (prefersReducedMotion.matches) return;

    /* -- Spotlight + 3D tilt on cards ----------------------------------
       [selector, hover lift in px, has a spotlight layer]
       The lift has to match each card's own CSS hover offset, because the
       inline transform written below replaces it wholesale. ------------- */
    var TILT = 7;   // degrees at the far edge

    // [selector, hover lift in px, tilts as well as glows]
    var TILTABLE = [
      ['.loan-card',        6, true],
      ['.lender',           3, true],
      ['.feature',          4, true],
      ['.testimonial',      4, true],
      ['.about-points > *', 3, true],
      ['.why-item',         0, false],
      ['.apply-grid',       0, false]
    ];

    TILTABLE.forEach(function (entry) {
      var selector = entry[0], lift = entry[1], tilts = entry[2];

      document.querySelectorAll(selector).forEach(function (card) {
        card.addEventListener('pointermove', function (event) {
          var r  = card.getBoundingClientRect();
          var px = (event.clientX - r.left) / r.width;
          var py = (event.clientY - r.top)  / r.height;

          // Every entry gets the glow; only card-shaped ones also tilt.
          card.style.setProperty('--mx', (px * 100).toFixed(2) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(2) + '%');

          if (!tilts) return;

          // Written inline so it beats the reveal's `transform: none` without
          // needing an ever-escalating specificity fight in the stylesheet.
          card.style.transform =
            'perspective(900px) rotateX(' + ((0.5 - py) * TILT).toFixed(2) + 'deg)' +
            ' rotateY(' + ((px - 0.5) * TILT).toFixed(2) + 'deg)' +
            ' translateY(-' + lift + 'px)';
        });

        card.addEventListener('pointerleave', function () {
          card.style.removeProperty('--mx');
          card.style.removeProperty('--my');
          if (tilts) card.style.transform = '';   // hand control back to CSS
        });
      });
    });

    /* -- Magnetic buttons ---------------------------------------------- */
    document.querySelectorAll('.btn--primary, .to-top').forEach(function (btn) {
      btn.addEventListener('pointermove', function (event) {
        var r = btn.getBoundingClientRect();
        btn.style.transform =
          'translate(' + ((event.clientX - r.left - r.width  / 2) * 0.22).toFixed(1) + 'px,' +
                        ((event.clientY - r.top  - r.height / 2) * 0.22).toFixed(1) + 'px)';
      });

      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });

    /* -- Ambient orbs drift with the pointer ---------------------------- */
    var ambient = document.querySelectorAll('.ambient');
    if (!ambient.length) return;

    var last = 0;
    window.addEventListener('pointermove', function (event) {
      var now = Date.now();
      if (now - last < 60) return;
      last = now;

      var dx = (event.clientX / window.innerWidth  - 0.5) * 34;
      var dy = (event.clientY / window.innerHeight - 0.5) * 34;

      ambient.forEach(function (sec) {
        sec.style.setProperty('--px', dx.toFixed(1) + 'px');
        sec.style.setProperty('--py', dy.toFixed(1) + 'px');
      });
    }, { passive: true });
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
    initReveal();
    initScrollChrome();
    initPointerFX();
    initScrollSpy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
