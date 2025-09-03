// Navigation scroll functionality
let lastScrollTop = 0;
let navBar = document.querySelector(".nav");

function handleNavScroll() {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop && scrollTop > 100) {
    // Scrolling down - hide nav
    navBar.classList.add("hidden");
  } else {
    // Scrolling up - show nav
    navBar.classList.remove("hidden");
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

// Filter functionality
function initializeFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const insightCards = document.querySelectorAll(".insight-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      // Update active button
      filterButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      });

      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");

      // Filter cards
      filterCards(filter, insightCards);
    });
  });
}

function filterCards(filter, cards) {
  cards.forEach((card) => {
    const cardKind = card.getAttribute("data-kind");

    // Remove existing filter classes
    card.classList.remove("filtered-in", "filtered-out");

    if (filter === "all") {
      card.classList.add("filtered-in");
    } else if (filter === "briefs" && cardKind === "brief") {
      card.classList.add("filtered-in");
    } else if (filter === "memos" && cardKind === "memo") {
      card.classList.add("filtered-in");
    } else {
      card.classList.add("filtered-out");
    }
  });
}

// Expand/collapse functionality for insight cards
function handleInsightToggle(button) {
  const targetId = button.getAttribute("data-target");
  const targetContent = document.getElementById(targetId);
  const expandIcon = button.querySelector(".expand-icon");
  const buttonText = button.querySelector("span:first-child");

  if (!targetContent) return;

  if (targetContent.classList.contains("hidden")) {
    // Expand
    targetContent.classList.remove("hidden");
    button.classList.add("expanded");

    // Update button text based on content type
    const card = button.closest(".insight-card");
    const isBreif = card && card.getAttribute("data-kind") === "brief";
    buttonText.textContent = isBreif ? "Hide Brief" : "Hide Memo";
  } else {
    // Collapse
    targetContent.classList.add("hidden");
    button.classList.remove("expanded");

    // Update button text based on content type
    const card = button.closest(".insight-card");
    const isBreif = card && card.getAttribute("data-kind") === "brief";
    buttonText.textContent = isBreif ? "Read Brief" : "Read Memo";
  }
}

// Scroll animations
function checkScroll() {
  const elements = document.querySelectorAll(".fade-in");

  elements.forEach((element) => {
    const elementTop = element.offsetTop;
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;

    if (scrollTop + windowHeight > elementTop + 100) {
      element.classList.add("visible");
    }
  });
}

// Smooth scroll for navigation links
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Handle NDA link tracking (analytics)
function trackNDARequest(link) {
  const href = link.getAttribute("href");
  const urlParams = new URLSearchParams(href.split("?")[1]);
  const ref = urlParams.get("ref");

  // Analytics event
  console.log("NDA Request:", {
    ref: ref,
    timestamp: new Date().toISOString(),
    type: ref
      ? ref.includes("brief")
        ? "case_brief"
        : "technical_memo"
      : "general",
  });

  // Could integrate with analytics service here
  // Example: gtag('event', 'nda_request', { ref: ref });
}

// Initialize all functionality
function initializeInsights() {
  // Initialize filters
  initializeFilters();

  // Initialize expand/collapse buttons
  const expandButtons = document.querySelectorAll(".expand-btn");
  expandButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      handleInsightToggle(button);
    });
  });

  // Track NDA link clicks
  const ndaLinks = document.querySelectorAll(".nda-link, #insights-cta-link");
  ndaLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      // Don't prevent default - let the link work
      trackNDARequest(link);
    });
  });

  // Navigation functionality
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute("href").substring(1);
      scrollToSection(sectionId);
    });
  });

  // Initialize scroll animations
  checkScroll();

  // Set up scroll listeners
  window.addEventListener("scroll", function () {
    checkScroll();
    handleNavScroll();
  });
}

// Keyboard navigation support
function initializeKeyboardNavigation() {
  document.addEventListener("keydown", (e) => {
    // Allow keyboard navigation of filter buttons
    if (e.target.classList.contains("filter-btn")) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.target.click();
      }
    }

    // Allow keyboard navigation of expand buttons
    if (e.target.classList.contains("expand-btn")) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.target.click();
      }
    }
  });
}

// Search functionality (future enhancement)
function initializeSearch() {
  // Placeholder for future search functionality
  // Could add a search input that filters cards by title/content

  const searchInput = document.getElementById("insights-search");
  if (searchInput) {
    let searchTimeout;

    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase().trim();
        searchInsights(searchTerm);
      }, 300); // Debounce search
    });
  }
}

function searchInsights(searchTerm) {
  const cards = document.querySelectorAll(".insight-card");

  if (!searchTerm) {
    // Reset to current filter if no search term
    const activeFilter = document
      .querySelector(".filter-btn.active")
      .getAttribute("data-filter");
    filterCards(activeFilter, cards);
    return;
  }

  cards.forEach((card) => {
    const title = card.querySelector("h2").textContent.toLowerCase();
    const deck = card.querySelector(".insight-deck").textContent.toLowerCase();
    const type = card.querySelector(".insight-type").textContent.toLowerCase();

    const matches =
      title.includes(searchTerm) ||
      deck.includes(searchTerm) ||
      type.includes(searchTerm);

    card.classList.remove("filtered-in", "filtered-out");
    card.classList.add(matches ? "filtered-in" : "filtered-out");
  });
}

// Performance optimization - lazy load content
function initializeLazyLoading() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "50px",
    }
  );

  const lazyElements = document.querySelectorAll(".fade-in");
  lazyElements.forEach((element) => {
    observer.observe(element);
  });
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeInsights();
    initializeKeyboardNavigation();
    initializeSearch();
    initializeLazyLoading();
  });
} else {
  initializeInsights();
  initializeKeyboardNavigation();
  initializeSearch();
  initializeLazyLoading();
}

// Handle page load
window.addEventListener("load", checkScroll);
