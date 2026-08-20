/* ==========================================================================
   ALUPRO — Aluminium Solutions
   Vanilla JavaScript. No frameworks, no dependencies.

   Contents
   --------
   1.  Helpers & motion preference
   2.  Header state on scroll + scroll progress bar
   3.  Mobile menu
   4.  Smooth scrolling for in-page links
   5.  Scroll reveal (IntersectionObserver)
   6.  Active nav link (scrollspy)
   7.  Project filtering
   8.  Process timeline progress
   9.  Hero parallax
   10. Contact form validation
   11. Footer year + back to top
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. HELPERS & MOTION PREFERENCE
     ------------------------------------------------------------------ */

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  // Respect the visitor's OS-level "reduce motion" setting.
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = motionQuery.matches;
  motionQuery.addEventListener('change', function (e) { reduceMotion = e.matches; });

  // Runs a callback at most once per animation frame — keeps scroll handlers cheap.
  function onFrame(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        fn();
      });
    };
  }

  /* ------------------------------------------------------------------
     2. HEADER STATE + SCROLL PROGRESS
     The header starts translucent over the hero and becomes a solid
     white bar with a hairline border once the page is scrolled.
     ------------------------------------------------------------------ */

  var header = $('#header');
  var brand = $('#brand');
  var progress = $('#scrollProgress');

  function updateHeader() {
    var y = window.scrollY || document.documentElement.scrollTop;

    if (header) {
      if (y > 40) {
        header.classList.add('bg-white', 'shadow-[0_1px_0_0_rgba(5,5,5,0.08)]');
        header.classList.remove('bg-white/80');
      } else {
        header.classList.remove('bg-white', 'shadow-[0_1px_0_0_rgba(5,5,5,0.08)]');
        header.classList.add('bg-white/80');
      }
    }

    // Logo shrinks very slightly once scrolled — subtle, not distracting.
    if (brand) {
      if (y > 40) brand.classList.add('py-3', 'scale-[0.94]', 'origin-left');
      else brand.classList.remove('py-3', 'scale-[0.94]', 'origin-left');
    }

    // Thin red progress bar across the top of the viewport.
    if (progress) {
      var doc = document.documentElement;
      var max = (doc.scrollHeight - window.innerHeight) || 1;
      var pct = Math.min(100, Math.max(0, (y / max) * 100));
      progress.style.width = pct + '%';
    }
  }

  /* ------------------------------------------------------------------
     3. MOBILE MENU
     Full-screen panel. Locks background scroll, closes on Escape,
     on link click, and when the viewport grows to desktop width.
     ------------------------------------------------------------------ */

  var menuToggle = $('#menuToggle');
  var mobileMenu = $('#mobileMenu');
  var menuBars = $$('.menu-bar');
  var menuOpen = false;
  var scrollLockY = 0;

  function setMenu(open) {
    if (!mobileMenu || !menuToggle) return;
    menuOpen = open;

    mobileMenu.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    $('.sr-only', menuToggle).textContent = open ? 'Close menu' : 'Open menu';

    // `inert` keeps the closed panel out of the tab order and off the a11y tree.
    if (open) mobileMenu.removeAttribute('inert');
    else mobileMenu.setAttribute('inert', '');

    // Animate the three bars into a cross.
    if (menuBars.length === 3) {
      menuBars[0].classList.toggle('translate-y-[7px]', open);
      menuBars[0].classList.toggle('rotate-45', open);
      menuBars[1].classList.toggle('opacity-0', open);
      menuBars[2].classList.toggle('-translate-y-[7px]', open);
      menuBars[2].classList.toggle('-rotate-45', open);
      // The header bar stays on top of the panel, so the icon stays dark.
      menuBars.forEach(function (bar) { bar.classList.add('w-6', 'bg-ink'); });
      // The middle bar is shorter when closed, full width when open.
      menuBars[1].classList.toggle('w-4', !open);
    }

    // Solid white header while the menu is open — a translucent bar over the
    // black panel would read as muddy gray.
    if (header) {
      header.classList.toggle('bg-white', open);
      header.classList.toggle('bg-white/80', !open);
    }

    // Lock background scrolling without losing the reading position.
    if (open) {
      scrollLockY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollLockY + 'px';
      document.body.style.width = '100%';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollLockY);
      // Re-apply the correct scrolled/unscrolled header style straight away.
      updateHeader();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () { setMenu(!menuOpen); });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  // Close the menu if the window is resized up to the desktop breakpoint.
  window.addEventListener('resize', onFrame(function () {
    if (menuOpen && window.innerWidth >= 1024) setMenu(false);
  }));

  /* ------------------------------------------------------------------
     4. SMOOTH SCROLLING FOR IN-PAGE LINKS
     CSS handles smooth scrolling; this exists so that tapping a link
     inside the mobile menu closes the panel first, then scrolls to the
     right place (the scroll lock has to be released before we move).
     ------------------------------------------------------------------ */

  var HEADER_OFFSET = 78;

  function scrollToTarget(target) {
    var top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  }

  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      if (menuOpen) {
        setMenu(false);
        // Wait for the scroll lock to be released before moving.
        window.setTimeout(function () { scrollToTarget(target); }, 60);
      } else {
        scrollToTarget(target);
      }

      // Keep the URL shareable without triggering a second jump.
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* ------------------------------------------------------------------
     5. SCROLL REVEAL
     Every [data-reveal] element fades and rises once, the first time
     it enters the viewport. Siblings within a grid are staggered.
     ------------------------------------------------------------------ */

  var revealItems = $$('[data-reveal]');

  if (!('IntersectionObserver' in window) || reduceMotion) {
    // No observer support (or motion is reduced): show everything immediately.
    revealItems.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        // Stagger elements that share a parent, capped so nothing lags.
        var siblings = Array.prototype.filter.call(
          el.parentElement ? el.parentElement.children : [],
          function (n) { return n.hasAttribute && n.hasAttribute('data-reveal'); }
        );
        var index = siblings.indexOf(el);
        var delay = Math.min(index < 0 ? 0 : index, 5) * 90;

        window.setTimeout(function () { el.classList.add('is-visible'); }, delay);
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ------------------------------------------------------------------
     6. ACTIVE NAV LINK (SCROLLSPY)
     Highlights the nav item for whichever section is currently in view.
     ------------------------------------------------------------------ */

  var navLinks = $$('.nav-link');

  // Sorted by position in the DOCUMENT, not by nav order — the loop below
  // takes the last section that starts above the reading line, so the list
  // has to run top-to-bottom. (Nav order differs: "About" is listed after
  // "Solutions" but sits earlier on the page.)
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean)
    .sort(function (a, b) { return a.offsetTop - b.offsetTop; });

  function updateActiveNav() {
    var pos = window.scrollY + HEADER_OFFSET + 40;
    var currentId = null;

    sections.forEach(function (section) {
      if (section.offsetTop <= pos) currentId = '#' + section.id;
    });

    // At the very bottom, force the last section to win.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      var last = sections[sections.length - 1];
      if (last) currentId = '#' + last.id;
    }

    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.getAttribute('href') === currentId);
    });
  }

  /* ------------------------------------------------------------------
     7. PROJECT FILTERING
     Filters the project grid by the data-category attribute.
     ------------------------------------------------------------------ */

  var filterButtons = $$('.filter-btn');
  var projectCards = $$('.proj-card');
  var noProjects = $('#noProjects');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');

      filterButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });

      var visible = 0;
      projectCards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !match);
        if (match) visible++;
      });

      if (noProjects) noProjects.classList.toggle('hidden', visible > 0);
    });
  });

  /* ------------------------------------------------------------------
     8. PROCESS TIMELINE PROGRESS
     Fills the vertical rail in red as the section scrolls past.
     ------------------------------------------------------------------ */

  var timeline = $('#timeline');
  var timelineFill = $('#timelineFill');

  function updateTimeline() {
    if (!timeline || !timelineFill) return;

    var rect = timeline.getBoundingClientRect();
    var viewH = window.innerHeight;

    // 0 when the section top reaches the middle of the screen,
    // 1 once the section bottom has passed it.
    var start = viewH * 0.75;
    var travelled = start - rect.top;
    var pct = travelled / (rect.height || 1);

    timelineFill.style.height = Math.min(100, Math.max(0, pct * 100)) + '%';
  }

  /* ------------------------------------------------------------------
     9. HERO PARALLAX
     The hero artwork drifts slightly slower than the page. The image is
     rendered 112% tall so there is room to move without exposing edges.
     ------------------------------------------------------------------ */

  var heroImg = $('#heroImg');

  function updateParallax() {
    if (!heroImg || reduceMotion) return;
    if (window.innerWidth < 768) {           // skip on small screens
      heroImg.style.transform = '';
      return;
    }
    var y = window.scrollY;
    if (y > window.innerHeight) return;      // stop once the hero is offscreen
    heroImg.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(2) + 'px,0)';
  }

  /* ------------------------------------------------------------------
     10. CONTACT FORM VALIDATION
     Front-end validation only.
     NOTE: the form is not connected to a backend or email service yet,
     so nothing is actually sent. To make it live, post `data` below to
     your own endpoint (or a form service) and handle the response.
     ------------------------------------------------------------------ */

  var form = $('#contactForm');
  var formStatus = $('#formStatus');

  var RULES = [
    { id: 'name',        message: 'Please enter your name.',            test: function (v) { return v.trim().length >= 2; } },
    { id: 'email',       message: 'Please enter a valid email address.', test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); } },
    { id: 'phone',       message: 'Please enter a valid phone number.',  test: function (v) { return v.trim() === '' || /^[0-9+()\-.\s]{6,20}$/.test(v.trim()); } },
    { id: 'projectType', message: 'Please choose a project type.',       test: function (v) { return v !== ''; } },
    { id: 'message',     message: 'Please tell us a little about the project.', test: function (v) { return v.trim().length >= 10; } }
  ];

  function showError(rule, show) {
    var field = document.getElementById(rule.id);
    var error = document.getElementById('err-' + rule.id);
    if (!field || !error) return;

    field.setAttribute('aria-invalid', show ? 'true' : 'false');
    error.textContent = show ? rule.message : '';
    error.classList.toggle('hidden', !show);
  }

  if (form) {
    // Clear an error as soon as the visitor fixes the field.
    RULES.forEach(function (rule) {
      var field = document.getElementById(rule.id);
      if (!field) return;
      var revalidate = function () {
        if (field.getAttribute('aria-invalid') === 'true' && rule.test(field.value)) {
          showError(rule, false);
        }
      };
      field.addEventListener('input', revalidate);
      field.addEventListener('change', revalidate);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstInvalid = null;
      var data = {};

      RULES.forEach(function (rule) {
        var field = document.getElementById(rule.id);
        if (!field) return;
        var ok = rule.test(field.value);
        showError(rule, !ok);
        if (!ok && !firstInvalid) firstInvalid = field;
        data[rule.id] = field.value.trim();
      });

      if (firstInvalid) {
        if (formStatus) formStatus.classList.add('hidden');
        firstInvalid.focus();
        return;
      }

      // Validation passed. Be honest: nothing is transmitted yet.
      if (formStatus) {
        formStatus.textContent =
          'All fields look good. This form is not connected to a server yet, ' +
          'so the message has not been sent — add your form endpoint in script.js to go live.';
        formStatus.classList.remove('hidden');
      }

      // The collected values, ready to be posted to an endpoint later.
      console.log('ALUPRO enquiry (not sent):', data);
    });
  }

  /* ------------------------------------------------------------------
     11. FOOTER YEAR + BACK TO TOP
     ------------------------------------------------------------------ */

  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  var toTop = $('#toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     SCROLL / RESIZE LOOP
     One throttled handler drives every scroll-dependent feature.
     ------------------------------------------------------------------ */

  var onScroll = onFrame(function () {
    updateHeader();
    updateActiveNav();
    updateTimeline();
    updateParallax();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);

  // Initial paint.
  updateHeader();
  updateActiveNav();
  updateTimeline();
})();
