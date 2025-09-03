// Navigation scroll functionality
function scrollTo(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Hide/show navigation on scroll
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

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
}

// clientele expansion - Modified to change text with proper timing
function toggleclientele(item) {
  const isExpanded = item.classList.contains("expanded");
  const expandElement = item.querySelector(".clientele-expand");

  // Close all other clientele with proper timing
  document.querySelectorAll(".clientele-item").forEach((cap) => {
    if (cap !== item && cap.classList.contains("expanded")) {
      cap.classList.remove("expanded");
      const otherExpandElement = cap.querySelector(".clientele-expand");
      // Delay the text change to let the closing animation start
      setTimeout(() => {
        otherExpandElement.textContent = "Expand Details";
      }, 50);
    }
  });

  // Toggle current clientele
  if (!isExpanded) {
    // Opening
    item.classList.add("expanded");
    expandElement.textContent = "Close Details";
  } else {
    // Closing
    item.classList.remove("expanded");
    setTimeout(() => {
      expandElement.textContent = "Expand Details";
    }, 50);
  }
}

// Modal
function openModal() {
  document.getElementById("contactModal").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("contactModal").style.display = "none";
  document.body.style.overflow = "auto";
}

function submitForm(event) {
  event.preventDefault();
  alert("Thank you for your interest. We will be in touch within 24 hours.");
  closeModal();
  document.getElementById("consultationForm").reset();
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById("contactModal");
  if (event.target === modal) {
    closeModal();
  }
};

// Scroll animations
function checkScroll() {
  const elements = document.querySelectorAll(".fade-in");

  elements.forEach((element) => {
    const elementTop = element.offsetTop;
    const elementHeight = element.offsetHeight;
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;

    if (scrollTop + windowHeight > elementTop + 100) {
      element.classList.add("visible");
    }
  });
}

// Initialize and event listeners
window.addEventListener("scroll", function () {
  checkScroll();
  handleNavScroll();
});

window.addEventListener("load", checkScroll);

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});
