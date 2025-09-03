// DOM elements
let openModal = null;
let previousFocus = null;
let focusableElements = [];
let focusTrapHandler = null;

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

// Modal management
function openModalDialog(modalSelector) {
  const modal = document.querySelector(modalSelector);
  if (!modal) return;

  // Track the element that opened the modal for focus restoration
  previousFocus = document.activeElement;
  openModal = modal;

  // Show modal
  modal.removeAttribute("hidden");
  modal.style.display = "flex";

  // Focus the modal heading
  const heading = modal.querySelector("h3");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  }

  // Set up focus trap
  setupFocusTrap(modal);

  // Add background inert if supported
  const mainContent = document.querySelector(".main-content");
  const hero = document.querySelector(".hero");
  const nav = document.querySelector(".nav");

  if (mainContent) mainContent.setAttribute("inert", "");
  if (hero) hero.setAttribute("inert", "");
  if (nav) nav.setAttribute("inert", "");

  // Prevent body scroll
  document.body.style.overflow = "hidden";

  // Emit analytics event
  const roleId = modal.id.replace("apply-modal-", "");
  emitAnalyticsEvent("careers:apply_opened", {
    role_id: `job-${
      roleId === "sse" ? "senior-security-engineer" : "senior-backend-engineer"
    }`,
  });
}

function closeModalDialog(modal = openModal) {
  if (!modal) return;

  // Hide modal
  modal.setAttribute("hidden", "");
  modal.style.display = "none";

  // Remove focus trap
  removeFocusTrap();

  // Remove background inert
  const mainContent = document.querySelector(".main-content");
  const hero = document.querySelector(".hero");
  const nav = document.querySelector(".nav");

  if (mainContent) mainContent.removeAttribute("inert");
  if (hero) hero.removeAttribute("inert");
  if (nav) nav.removeAttribute("inert");

  // Restore body scroll
  document.body.style.overflow = "auto";

  // Restore focus to the element that opened the modal
  if (previousFocus) {
    previousFocus.focus();
  }

  // Emit analytics event
  const roleId = modal.id.replace("apply-modal-", "");
  emitAnalyticsEvent("careers:apply_closed", {
    role_id: `job-${
      roleId === "sse" ? "senior-security-engineer" : "senior-backend-engineer"
    }`,
  });

  // Clear references
  openModal = null;
  previousFocus = null;
}

function setupFocusTrap(modal) {
  // Get all focusable elements within the modal
  focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  // Create the focus trap handler
  focusTrapHandler = function (e) {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  };

  // Add event listener for tab key
  modal.addEventListener("keydown", focusTrapHandler);
}

function removeFocusTrap() {
  if (openModal && focusTrapHandler) {
    openModal.removeEventListener("keydown", focusTrapHandler);
  }
  focusableElements = [];
  focusTrapHandler = null;
}

// Form validation
function validateForm(form) {
  const errors = [];
  const formData = new FormData(form);

  // Check required fields
  const requiredFields = form.querySelectorAll("[required]");
  requiredFields.forEach((field) => {
    if (field.type === "checkbox") {
      if (!field.checked) {
        errors.push(`${getFieldLabel(field)} is required`);
      }
    } else {
      const value = formData.get(field.name);
      if (!value || value.trim() === "") {
        errors.push(`${getFieldLabel(field)} is required`);
      }
    }
  });

  // Validate email format
  const emailFields = form.querySelectorAll('input[type="email"]');
  emailFields.forEach((field) => {
    const value = formData.get(field.name);
    if (value && !isValidEmail(value)) {
      errors.push(`${getFieldLabel(field)} must be a valid email address`);
    }
  });

  // Validate URL format
  const urlFields = form.querySelectorAll('input[type="url"]');
  urlFields.forEach((field) => {
    const value = formData.get(field.name);
    if (value && !isValidUrl(value)) {
      errors.push(`${getFieldLabel(field)} must be a valid URL`);
    }
  });

  // Validate file types
  const fileFields = form.querySelectorAll('input[type="file"]');
  fileFields.forEach((field) => {
    if (field.files.length > 0) {
      const file = field.files[0];
      const acceptedTypes = field.accept.split(",").map((type) => type.trim());
      const isValidType = acceptedTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        } else {
          return file.type.includes(type.replace("*", ""));
        }
      });

      if (!isValidType) {
        errors.push(`${getFieldLabel(field)} must be a PDF or DOC file`);
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${getFieldLabel(field)} must be less than 5MB`);
      }
    }
  });

  return errors;
}

function getFieldLabel(field) {
  const label = document.querySelector(`label[for="${field.id}"]`);
  if (label) {
    return label.textContent.replace("*", "").trim();
  }
  return field.name;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Show validation errors
function showErrors(errors) {
  const errorAlert = document.getElementById("error-alert");
  if (errors.length > 0) {
    errorAlert.textContent = errors[0]; // Show first error
    errorAlert.removeAttribute("hidden");

    // Hide after 5 seconds
    setTimeout(() => {
      errorAlert.setAttribute("hidden", "");
    }, 5000);
  } else {
    errorAlert.setAttribute("hidden", "");
  }
}

// Handle form submission
function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const errors = validateForm(form);

  if (errors.length > 0) {
    showErrors(errors);
    return;
  }

  // Get form data (excluding file object for analytics)
  const formData = new FormData(form);
  const data = {};
  for (let [key, value] of formData.entries()) {
    if (key !== "resume") {
      // Exclude file
      data[key] = value;
    }
  }

  // Emit custom event
  const applicationEvent = new CustomEvent("application:submitted", {
    detail: {
      ...data,
      timestamp: new Date().toISOString(),
    },
  });
  document.dispatchEvent(applicationEvent);

  // Emit analytics event
  emitAnalyticsEvent("application:submitted", {
    role_id: data.role_id,
    timestamp: new Date().toISOString(),
  });

  // Show success state
  showSuccessState(form.closest(".modal"));
}

// Show success state
function showSuccessState(modal) {
  const modalContent = modal.querySelector(".modal-content");
  const originalContent = modalContent.innerHTML;

  modalContent.innerHTML = `
        <button class="close" data-close-modal aria-label="Close">&times;</button>
        <div class="success-state">
            <h4>Application received</h4>
            <p>Thank you. We'll review your application and respond if there's a fit. If you prefer encrypted email, our PGP key is listed on the Security page.</p>
            <button type="button" data-close-modal>Close</button>
        </div>
    `;

  // Re-attach close event listeners
  const closeButtons = modalContent.querySelectorAll("[data-close-modal]");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Restore original content for next time
      modalContent.innerHTML = originalContent;
      attachFormListeners();
      closeModalDialog(modal);
    });
  });
}

// Handle job details expand/collapse
function handleJobDetailsToggle(button) {
  const targetId = button.getAttribute("data-target");
  const targetContent = document.getElementById(targetId);
  const expandIcon = button.querySelector(".expand-icon");
  const buttonText = button.querySelector("span:first-child");

  if (targetContent.classList.contains("hidden")) {
    // Expand
    targetContent.classList.remove("hidden");
    button.classList.add("expanded");
    buttonText.textContent = "Hide Details";
  } else {
    // Collapse
    targetContent.classList.add("hidden");
    button.classList.remove("expanded");
    buttonText.textContent = "View Details";
  }
}
function emitAnalyticsEvent(eventName, data) {
  // This would typically send to your analytics service
  console.log(`Analytics Event: ${eventName}`, data);

  // Example: Send to Google Analytics, Mixpanel, etc.
  // if (window.gtag) {
  //     window.gtag('event', eventName, data);
  // }
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

// Attach event listeners to forms
function attachFormListeners() {
  const forms = document.querySelectorAll('form[id^="form-apply"]');
  forms.forEach((form) => {
    form.addEventListener("submit", handleFormSubmit);
  });
}

// Initialize event listeners
function initializeEventListeners() {
  // Modal open buttons
  const openButtons = document.querySelectorAll("[data-open-modal]");
  openButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const modalSelector = button.getAttribute("data-open-modal");
      openModalDialog(modalSelector);
    });
  });

  // Modal close buttons
  const closeButtons = document.querySelectorAll("[data-close-modal]");
  closeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      closeModalDialog();
    });
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openModal) {
      closeModalDialog();
    }
  });

  // Close modal when clicking outside
  document.addEventListener("click", (e) => {
    if (openModal && e.target === openModal) {
      closeModalDialog();
    }
  });

  // Job details expand/collapse buttons
  const expandButtons = document.querySelectorAll(".job-expand-btn");
  expandButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      handleJobDetailsToggle(button);
    });
  });

  // Attach form listeners
  attachFormListeners();

  // Scroll event listeners
  window.addEventListener("scroll", function () {
    checkScroll();
    handleNavScroll();
  });

  // Navigation links
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
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeEventListeners);
} else {
  initializeEventListeners();
}

// Handle page load
window.addEventListener("load", checkScroll);
