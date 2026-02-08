const revealItems = document.querySelectorAll("[data-reveal]");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const delay = index * 80;
        entry.target.style.transitionDelay = `${delay}ms`;
        entry.target.classList.add("reveal");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealItems.forEach((item) => observer.observe(item));

const API_BASE = "http://localhost:3000";
const TOKEN_KEY = "learnify_token";

const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const getToken = () => localStorage.getItem(TOKEN_KEY);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);
let hasProfileInfo = false;
let hasEnrollments = false;

const updateProfileStrength = () => {
  if (!profileProgressBar || !profileProgressLabel) return;
  let score = 0;
  if (hasProfileInfo) score += 50;
  if (hasEnrollments) score += 50;
  profileProgressBar.style.width = `${score}%`;
  profileProgressLabel.textContent = `${score}% profile strength`;
};

const handleAuth = async (form, mode, messageEl) => {
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
  const emailInput = form.querySelector("input[name=\"email\"]");
  const passwordInput = form.querySelector("input[name=\"password\"]");
  const usernameInput = form.querySelector("input[name=\"username\"]");

  const isValidEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  let hasError = false;

  if (emailInput) {
    const ok = isValidEmail(payload.email || "");
    emailInput.classList.toggle("input-error", !ok);
    if (!ok) hasError = true;
  }
  if (passwordInput) {
    const ok = (payload.password || "").length >= 6;
    passwordInput.classList.toggle("input-error", !ok);
    if (!ok) hasError = true;
  }
  if (mode === "register" && usernameInput) {
    const ok = (payload.username || "").trim().length >= 3;
    usernameInput.classList.toggle("input-error", !ok);
    if (!ok) hasError = true;
  }

  if (hasError) {
    if (messageEl) {
      messageEl.textContent = "Please check your details and try again.";
    }
    return;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      if (messageEl) {
        messageEl.textContent = data.message || "Auth failed";
      }
      return;
    }
    setToken(data.token);
    if (messageEl) {
      messageEl.textContent = "Success. Redirecting...";
    }
    window.location.href = "profile.html";
  } catch (err) {
    if (messageEl) {
      messageEl.textContent = "Network error during auth.";
    }
  }
};

const loginForm = document.querySelector("#login-page-form");
const registerForm = document.querySelector("#register-page-form");
const loginMessage = document.querySelector("#login-message");
const registerMessage = document.querySelector("#register-message");
const passwordToggles = document.querySelectorAll(".password-toggle");

passwordToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = toggle.parentElement.querySelector("input");
    if (!input) return;
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    toggle.textContent = isHidden ? "Hide" : "Show";
  });
});

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleAuth(loginForm, "login", loginMessage);
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleAuth(registerForm, "register", registerMessage);
  });
}

const profileName = document.querySelector("#profile-name");
const profileEmail = document.querySelector("#profile-email");
const profileMessage = document.querySelector("#profile-message");
const enrollmentsList = document.querySelector("#enrollments-list");
const myCoursesList = document.querySelector("#my-courses-list");
const myCoursesMessage = document.querySelector("#my-courses-message");
const certificateList = document.querySelector("#certificate-list");
const statsTotal = document.querySelector("#stats-total");
const statsCompleted = document.querySelector("#stats-completed");
const statsProgress = document.querySelector("#stats-progress");
const profileProgressBar = document.querySelector("#profile-progress-bar");
const profileProgressLabel = document.querySelector("#profile-progress-label");

const loginLink = document.querySelector("#login-link");
const registerLink = document.querySelector("#register-link");
const logoutLink = document.querySelector("#logout-link");

const syncAuthLinks = () => {
  const token = getToken();
  if (token) {
    if (loginLink) loginLink.classList.add("hidden");
    if (registerLink) registerLink.classList.add("hidden");
    if (logoutLink) logoutLink.classList.remove("hidden");
  } else {
    if (loginLink) loginLink.classList.remove("hidden");
    if (registerLink) registerLink.classList.remove("hidden");
    if (logoutLink) logoutLink.classList.add("hidden");
  }
};

const loadProfile = async () => {
  if (!profileName || !profileEmail) return;
  const token = getToken();
  if (!token) {
    if (profileMessage) {
      profileMessage.textContent = "Please log in to view your profile.";
    }
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      if (profileMessage) {
        profileMessage.textContent = "Unable to load profile.";
      }
      return;
    }
    profileName.textContent = data.username || "";
    profileEmail.textContent = data.email || "";
    hasProfileInfo = Boolean(data.username || data.email);
    updateProfileStrength();
  } catch (err) {
    if (profileMessage) {
      profileMessage.textContent = "Network error loading profile.";
    }
  }
};

const loadEnrollments = async () => {
  if (!enrollmentsList) return;
  const token = getToken();
  if (!token) {
    enrollmentsList.textContent = "Login to see your enrollments.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/enrollments/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      enrollmentsList.textContent = "Unable to load enrollments.";
      return;
    }
    if (!data.length) {
      enrollmentsList.textContent = "No enrollments yet.";
      hasEnrollments = false;
      updateProfileStrength();
      if (statsTotal) statsTotal.textContent = "0";
      if (statsCompleted) statsCompleted.textContent = "0";
      if (statsProgress) statsProgress.textContent = "0%";
      if (certificateList) {
        certificateList.innerHTML = "<p class=\"helper-text\">No certificates yet.</p>";
      }
      return;
    }
    const total = data.length;
    const completed = data.filter((item) => item.status === "completed").length;
    const avgProgress = Math.round(
      data.reduce((sum, item) => sum + (Number(item.progress) || 0), 0) / total
    );
    hasEnrollments = total > 0;
    updateProfileStrength();
    if (statsTotal) statsTotal.textContent = String(total);
    if (statsCompleted) statsCompleted.textContent = String(completed);
    if (statsProgress) statsProgress.textContent = `${avgProgress}%`;
    enrollmentsList.innerHTML = data
      .map(
        (enrollment) => `
        <div class="page-panel">
          <strong>${enrollment.course?.title || "Course"}</strong>
          <p>Status: ${enrollment.status}</p>
        </div>
      `
      )
      .join("");

    if (certificateList) {
      const completedCourses = data.filter(
        (enrollment) => enrollment.status === "completed" && enrollment.course
      );
      if (!completedCourses.length) {
        certificateList.innerHTML = "<p class=\"helper-text\">No certificates yet.</p>";
      } else {
        certificateList.innerHTML = completedCourses
          .map(
            (enrollment) => `
            <div class="page-panel">
              <strong>${enrollment.course.title}</strong>
              <a class="secondary-button" href="certificate.html?id=${enrollment.course._id}">View certificate</a>
            </div>
          `
          )
          .join("");
      }
    }
  } catch (err) {
    enrollmentsList.textContent = "Network error loading enrollments.";
  }
};

const renderMyCourses = (enrollments) => {
  if (!myCoursesList) return;
  if (!enrollments.length) {
    myCoursesList.innerHTML = "<p class=\"helper-text\">No enrollments yet.</p>";
    return;
  }

  myCoursesList.innerHTML = enrollments
    .map((enrollment) => {
      const course = enrollment.course || {};
      const courseId = course._id || enrollment.course;
      const imageUrl =
        course.imageUrl ||
        "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
      const progress = Number(enrollment.progress) || 0;
      const rating = course.rating ? `${course.rating} (${course.reviewCount || 0})` : "New";
      const description = course.description || "Course details available inside.";
      const level = course.level || "beginner";
      const duration = course.durationWeeks ? `${course.durationWeeks} weeks` : "Self-paced";
      const detailLink = courseId ? `course-detail.html?id=${courseId}` : "courses.html";
      const learningLink = courseId ? `learning.html?id=${courseId}` : "courses.html";
      const lessonKey = courseId ? `learnify_lessons_${courseId}` : null;
      const savedLessons = lessonKey ? JSON.parse(localStorage.getItem(lessonKey) || "[]") : [];
      const completedLessons = new Set(savedLessons);
      const nextLessonIndex = Array.isArray(course.syllabus)
        ? course.syllabus.findIndex((_, idx) => !completedLessons.has(idx))
        : -1;
      const nextLessonText =
        nextLessonIndex === -1
          ? "All lessons completed"
          : `Next lesson: ${nextLessonIndex + 1}`;
      const lastLessonText =
        completedLessons.size > 0
          ? `Last watched: Lesson ${Math.max(...completedLessons) + 1}`
          : "Start your first lesson";

      const isCompleted = enrollment.status === "completed" || progress >= 100;
      const statusBadge = isCompleted
        ? '<span class="badge badge-success">Completed</span>'
        : '<span class="badge badge-neutral">In progress</span>';
      const certificateLink = isCompleted && courseId
        ? `<a class="secondary-button" href="certificate.html?id=${courseId}">Certificate</a>`
        : "";

      return `
        <article class="course-progress-card">
          <div class="course-progress-media">
            <img src="${imageUrl}" alt="${course.title || "Course image"}" />
            <span class="tag">${course.category || "General"}</span>
          </div>
          <div class="course-progress-body">
            <div class="course-progress-header">
              <div>
                <h3>${course.title || "Course"}</h3>
                ${statusBadge}
              </div>
              <span class="price-tag">$${course.price || 0}</span>
            </div>
            <p>${description}</p>
            <div class="card-meta">
              <span>Level: ${level}</span>
              <span>Duration: ${duration}</span>
              <span>Rating: ${rating}</span>
            </div>
            <p class="helper-text">${nextLessonText}</p>
            <p class="helper-text">${lastLessonText}</p>
            <div class="progress-row">
              <div class="progress-bar">
                <span style="width: ${progress}%"></span>
              </div>
              <span class="progress-label">${progress}%</span>
            </div>
            <input
              class="progress-input"
              type="range"
              min="0"
              max="100"
              step="5"
              value="${progress}"
              data-course-id="${courseId || ""}"
            />
            <p class="helper-text progress-status">Status: ${enrollment.status}</p>
            <div class="detail-actions">
              <a class="secondary-button" href="${detailLink}">View details</a>
              <a class="primary-button" href="${learningLink}">Continue learning</a>
              ${certificateLink}
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  const inputs = myCoursesList.querySelectorAll(".progress-input");
  inputs.forEach((input) => {
    const card = input.closest(".course-progress-card");
    const label = card ? card.querySelector(".progress-label") : null;
    const bar = card ? card.querySelector(".progress-bar span") : null;
    const statusEl = card ? card.querySelector(".progress-status") : null;

    input.addEventListener("input", () => {
      const value = Number(input.value) || 0;
      if (label) label.textContent = `${value}%`;
      if (bar) bar.style.width = `${value}%`;
    });

    input.addEventListener("change", async () => {
      const token = getToken();
      if (!token) {
        window.location.href = "login.html";
        return;
      }
      const courseId = input.dataset.courseId;
      if (!courseId) return;

      try {
        const response = await fetch(`${API_BASE}/api/enrollments/progress`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId,
            progress: Number(input.value) || 0,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          if (statusEl) {
            statusEl.textContent = data.message || "Unable to update progress.";
          }
          return;
        }
        const normalized = Number(data.progress) || 0;
        if (label) label.textContent = `${normalized}%`;
        if (bar) bar.style.width = `${normalized}%`;
        if (statusEl) {
          statusEl.textContent = `Status: ${data.status} · ${normalized}% complete`;
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = "Network error updating progress.";
        }
      }
    });
  });
};

const loadMyCourses = async () => {
  if (!myCoursesList) return;
  const token = getToken();
  if (!token) {
    if (myCoursesMessage) {
      myCoursesMessage.textContent = "Log in to view your enrolled courses.";
    }
    myCoursesList.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/enrollments/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      if (myCoursesMessage) {
        myCoursesMessage.textContent = "Unable to load your courses.";
      }
      myCoursesList.innerHTML = "";
      return;
    }
    if (myCoursesMessage) {
      myCoursesMessage.textContent = "";
    }
    renderMyCourses(data);
  } catch (err) {
    if (myCoursesMessage) {
      myCoursesMessage.textContent = "Network error loading your courses.";
    }
  }
};

if (logoutLink) {
  logoutLink.addEventListener("click", () => {
    clearToken();
    syncAuthLinks();
    window.location.href = "login.html";
  });
}

const catalogList = document.querySelector("#catalog-list");
const catalogSearch = document.querySelector("#catalog-search");
const catalogCategoryInputs = document.querySelectorAll(".filter-category");
const catalogLevelInputs = document.querySelectorAll(".filter-level");
const catalogSort = document.querySelector("#catalog-sort");
const catalogApply = document.querySelector("#catalog-apply");
const catalogClear = document.querySelector("#catalog-clear");
const filterMinPrice = document.querySelector("#filter-min-price");
const filterMaxPrice = document.querySelector("#filter-max-price");
const filterRating = document.querySelector("#filter-rating");
const catalogPrev = document.querySelector("#catalog-prev");
const catalogNext = document.querySelector("#catalog-next");
const catalogPageLabel = document.querySelector("#catalog-page");
const catalogStatus = document.querySelector("#catalog-status");
const catalogAutocomplete = document.querySelector("#catalog-autocomplete");
const catalogCount = document.querySelector("#catalog-count");
const activeFilters = document.querySelector("#active-filters");

const courseTitle = document.querySelector("#course-title");
const courseSummary = document.querySelector("#course-summary");
const courseImage = document.querySelector("#course-image");
const courseLevel = document.querySelector("#course-level");
const courseDuration = document.querySelector("#course-duration");
const coursePrice = document.querySelector("#course-price");
const courseRating = document.querySelector("#course-rating");
const courseInstructor = document.querySelector("#course-instructor");
const courseOutcomes = document.querySelector("#course-outcomes");
const courseCurriculum = document.querySelector("#course-curriculum");
const courseReviews = document.querySelector("#course-reviews");
const enrollButton = document.querySelector("#enroll-btn");
const startButton = document.querySelector("#start-btn");
const quickViewModal = document.querySelector("#quick-view-modal");
const quickViewBody = document.querySelector("#quick-view-body");
const quickViewClose = document.querySelector(".modal-close");

const learningTitle = document.querySelector("#learning-title");
const learningVideos = document.querySelector("#learning-videos");
const lessonList = document.querySelector("#lesson-list");
const learningProgressText = document.querySelector("#learning-progress-text");
const learningBanner = document.querySelector("#learning-banner");
const sliderTrack = document.querySelector(".slider-track");
const sliderPrev = document.querySelector(".slider-prev");
const sliderNext = document.querySelector(".slider-next");

const checkoutTitle = document.querySelector("#checkout-title");
const checkoutPrice = document.querySelector("#checkout-price");
const checkoutFee = document.querySelector("#checkout-fee");
const checkoutDiscount = document.querySelector("#checkout-discount");
const checkoutTotal = document.querySelector("#checkout-total");
const checkoutImage = document.querySelector("#checkout-image");
const checkoutForm = document.querySelector("#checkout-form");
const checkoutMessage = document.querySelector("#checkout-message");
const checkoutSubmit = document.querySelector("#checkout-submit");

const certificateName = document.querySelector("#certificate-name");
const certificateCourse = document.querySelector("#certificate-course");
const certificateDate = document.querySelector("#certificate-date");
const certificateMessage = document.querySelector("#certificate-message");
const certificateDownload = document.querySelector("#certificate-download");
const certificateCard = document.querySelector("#certificate-card");

const adminMessage = document.querySelector("#admin-message");
const adminCourseList = document.querySelector("#admin-course-list");
const adminCourseForm = document.querySelector("#admin-course-form");
const adminReset = document.querySelector("#admin-reset");
const adminSubmit = document.querySelector("#admin-submit");

let currentPage = 1;
let totalPages = 1;
let autocompleteIndex = -1;

const getSelectedFilters = () => {
  const searchValue = catalogSearch ? catalogSearch.value.trim() : "";
  const categories = Array.from(catalogCategoryInputs || [])
    .filter((input) => input.checked)
    .map((input) => input.value);
  const levels = Array.from(catalogLevelInputs || [])
    .filter((input) => input.checked)
    .map((input) => input.value);
  const minPriceValue = filterMinPrice ? filterMinPrice.value : "";
  const maxPriceValue = filterMaxPrice ? filterMaxPrice.value : "";
  const ratingValue = filterRating ? Number(filterRating.value) : 0;

  return {
    search: searchValue,
    categories,
    levels,
    minPrice: minPriceValue,
    maxPrice: maxPriceValue,
    rating: ratingValue,
  };
};

const renderActiveFilters = () => {
  if (!activeFilters) return;
  const filters = getSelectedFilters();
  const chips = [];

  if (filters.search) {
    chips.push({ label: `Search: ${filters.search}`, type: "search" });
  }
  filters.categories.forEach((category) => {
    chips.push({ label: category, type: "category", value: category });
  });
  filters.levels.forEach((level) => {
    chips.push({ label: level, type: "level", value: level });
  });
  if (filters.minPrice || filters.maxPrice) {
    const minText = filters.minPrice ? `$${filters.minPrice}` : "Any";
    const maxText = filters.maxPrice ? `$${filters.maxPrice}` : "Any";
    chips.push({ label: `Price: ${minText} - ${maxText}`, type: "price" });
  }
  if (filters.rating && filters.rating > 0) {
    chips.push({ label: `Rating: ${filters.rating}+`, type: "rating" });
  }

  if (!chips.length) {
    activeFilters.innerHTML = "";
    return;
  }

  activeFilters.innerHTML = chips
    .map(
      (chip) => `
      <button class="chip-button" type="button" data-type="${chip.type}" data-value="${chip.value || ""}">
        ${chip.label} ✕
      </button>
    `
    )
    .join("");

  activeFilters.querySelectorAll(".chip-button").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;
      const value = button.dataset.value;
      if (type === "search" && catalogSearch) {
        catalogSearch.value = "";
      }
      if (type === "category") {
        Array.from(catalogCategoryInputs || []).forEach((input) => {
          if (input.value === value) input.checked = false;
        });
      }
      if (type === "level") {
        Array.from(catalogLevelInputs || []).forEach((input) => {
          if (input.value === value) input.checked = false;
        });
      }
      if (type === "price") {
        if (filterMinPrice) filterMinPrice.value = "";
        if (filterMaxPrice) filterMaxPrice.value = "";
      }
      if (type === "rating") {
        if (filterRating) filterRating.value = "0";
      }
      loadCatalog(1);
    });
  });
};

const renderCatalog = (courses) => {
  if (!catalogList) return;
  if (!courses.length) {
    catalogList.innerHTML = "<p class=\"helper-text\">No courses found.</p>";
    return;
  }

  catalogList.innerHTML = courses
    .map((course) => {
      const imageUrl =
        course.imageUrl ||
        "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
      const courseLink = course._id
        ? `course-detail.html?id=${course._id}`
        : "course-detail.html";
      const rating = course.rating ? Number(course.rating).toFixed(1) : "New";
      return `
      <article class="course-card">
        <img src="${imageUrl}" alt="${course.title}" loading="lazy" />
        <span class="tag">${course.category || "General"}</span>
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <div class="card-meta">
          <span><i class="ri-star-fill"></i> ${rating}</span>
          <span>${course.level}</span>
          <span>${course.durationWeeks} weeks</span>
          <span>$${course.price || 0}</span>
        </div>
        <div class="card-actions">
          <a class="secondary-button" href="${courseLink}">View</a>
          <button class="ghost-button quick-view-btn" type="button" data-course-id="${course._id || ""}">Quick view</button>
        </div>
      </article>
    `;
    })
    .join("");

  attachQuickViewHandlers();
};

const attachQuickViewHandlers = () => {
  if (!quickViewModal) return;
  const buttons = document.querySelectorAll(".quick-view-btn");
  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const courseId = button.dataset.courseId;
      const courseTitle = button.dataset.title;
      try {
        let courseData = null;
        if (courseId) {
          const response = await fetch(`${API_BASE}/api/courses/public/${courseId}`);
          courseData = await response.json();
          if (!response.ok) {
            courseData = null;
          }
        } else if (courseTitle) {
          const response = await fetch(
            `${API_BASE}/api/courses/public?q=${encodeURIComponent(courseTitle)}&limit=1`
          );
          const payload = await response.json();
          courseData = Array.isArray(payload.data) ? payload.data[0] : null;
        }

        if (!courseData || !quickViewBody) return;
        const modalImage =
          courseData.imageUrl ||
          "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";
        quickViewBody.innerHTML = `
          <div class="course-detail">
            <div class="detail-media">
              <img src="${modalImage}" alt="${courseData.title}" loading="lazy" />
            </div>
            <div>
              <span class="tag">${courseData.category || "General"}</span>
              <h2>${courseData.title}</h2>
              <p>${courseData.description}</p>
              <div class="card-meta">
                <span>Level: ${courseData.level}</span>
                <span>${courseData.durationWeeks} weeks</span>
                <span>$${courseData.price || 0}</span>
              </div>
              <div class="detail-actions">
                <a class="primary-button" href="course-detail.html?id=${courseData._id}">Full details</a>
              </div>
            </div>
          </div>
        `;
        quickViewModal.classList.add("show");
        quickViewModal.setAttribute("aria-hidden", "false");
      } catch (err) {
        return;
      }
    });
  });
};

if (quickViewClose && quickViewModal) {
  quickViewClose.addEventListener("click", () => {
    quickViewModal.classList.remove("show");
    quickViewModal.setAttribute("aria-hidden", "true");
  });

  quickViewModal.addEventListener("click", (event) => {
    if (event.target === quickViewModal) {
      quickViewModal.classList.remove("show");
      quickViewModal.setAttribute("aria-hidden", "true");
    }
  });
}

if (sliderTrack && sliderPrev && sliderNext) {
  const scrollAmount = 280;
  sliderPrev.addEventListener("click", () => {
    sliderTrack.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });
  sliderNext.addEventListener("click", () => {
    sliderTrack.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });
}

const loadCatalog = async (page = 1) => {
  if (!catalogList) return;
  const params = new URLSearchParams();
  if (catalogSearch && catalogSearch.value.trim()) {
    params.set("q", catalogSearch.value.trim());
  }
  const categories = Array.from(catalogCategoryInputs || [])
    .filter((input) => input.checked)
    .map((input) => input.value);
  if (categories.length) {
    params.set("category", categories.join(","));
  }
  const levels = Array.from(catalogLevelInputs || [])
    .filter((input) => input.checked)
    .map((input) => input.value);
  if (levels.length) {
    params.set("level", levels.join(","));
  }
  if (filterMinPrice && filterMinPrice.value) {
    params.set("minPrice", filterMinPrice.value);
  }
  if (filterMaxPrice && filterMaxPrice.value) {
    params.set("maxPrice", filterMaxPrice.value);
  }
  if (filterRating && filterRating.value && Number(filterRating.value) > 0) {
    params.set("minRating", filterRating.value);
  }
  if (catalogSort) {
    params.set("sort", catalogSort.value);
  }
  params.set("page", page);
  params.set("limit", 9);

  catalogList.innerHTML = Array.from({ length: 6 })
    .map(() => "<div class=\"skeleton-card\"></div>")
    .join("");
  if (catalogStatus) {
    catalogStatus.textContent = "Loading courses...";
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/courses/public?${params.toString()}`
    );
    const payload = await response.json();
    if (!response.ok) {
      if (catalogStatus) {
        catalogStatus.textContent = "Start backend and seed data to see courses.";
      }
      catalogList.innerHTML = "<p class=\"helper-text\">Unable to load catalog.</p>";
      return;
    }
    const list = Array.isArray(payload.data) ? payload.data : [];
    currentPage = payload.page || 1;
    totalPages = payload.totalPages || 1;
    if (catalogPageLabel) {
      catalogPageLabel.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    if (catalogCount) {
      const total = payload.total || list.length;
      catalogCount.textContent = `${total} courses`;
    }
    if (catalogStatus) {
      catalogStatus.textContent = "";
    }
    renderCatalog(list);
    renderActiveFilters();
    if (catalogPrev) {
      catalogPrev.disabled = currentPage <= 1;
    }
    if (catalogNext) {
      catalogNext.disabled = currentPage >= totalPages;
    }
  } catch (err) {
    catalogList.innerHTML = "<p class=\"helper-text\">Network error loading catalog.</p>";
  }
};

const loadAutocomplete = async (query) => {
  if (!catalogAutocomplete) return;
  if (!query) {
    catalogAutocomplete.innerHTML = "";
    catalogAutocomplete.classList.remove("show");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/courses/public?q=${encodeURIComponent(query)}&limit=5`);
    const payload = await response.json();
    const list = Array.isArray(payload.data) ? payload.data : [];
    catalogAutocomplete.innerHTML = list
      .map((course) => `<button type="button" class="autocomplete-item">${course.title}</button>`)
      .join("");
    catalogAutocomplete.classList.toggle("show", list.length > 0);
    const items = catalogAutocomplete.querySelectorAll(".autocomplete-item");
    autocompleteIndex = -1;
    items.forEach((item) => {
      item.addEventListener("click", () => {
        if (catalogSearch) {
          catalogSearch.value = item.textContent;
        }
        catalogAutocomplete.innerHTML = "";
        catalogAutocomplete.classList.remove("show");
        loadCatalog(1);
      });
    });
  } catch (err) {
    catalogAutocomplete.innerHTML = "";
    catalogAutocomplete.classList.remove("show");
  }
};

let autoCompleteTimer;
if (catalogSearch) {
  catalogSearch.addEventListener("input", (event) => {
    clearTimeout(autoCompleteTimer);
    const value = event.target.value.trim();
    autoCompleteTimer = setTimeout(() => loadAutocomplete(value), 300);
  });

  catalogSearch.addEventListener("keydown", (event) => {
    if (!catalogAutocomplete || !catalogAutocomplete.classList.contains("show")) {
      if (event.key === "Enter") {
        event.preventDefault();
        loadCatalog(1);
      }
      return;
    }
    const items = catalogAutocomplete.querySelectorAll(".autocomplete-item");
    if (!items.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      autocompleteIndex = (autocompleteIndex + 1) % items.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      autocompleteIndex = (autocompleteIndex - 1 + items.length) % items.length;
    } else if (event.key === "Enter") {
      if (autocompleteIndex >= 0) {
        event.preventDefault();
        const selected = items[autocompleteIndex];
        if (selected && catalogSearch) {
          catalogSearch.value = selected.textContent;
        }
        catalogAutocomplete.innerHTML = "";
        catalogAutocomplete.classList.remove("show");
        loadCatalog(1);
      }
      return;
    } else {
      return;
    }

    items.forEach((item, index) => {
      item.classList.toggle("active", index === autocompleteIndex);
    });
  });
}

if (catalogApply) {
  catalogApply.addEventListener("click", () => loadCatalog(1));
}

if (catalogClear) {
  catalogClear.addEventListener("click", () => {
    if (catalogSearch) catalogSearch.value = "";
    if (filterMinPrice) filterMinPrice.value = "";
    if (filterMaxPrice) filterMaxPrice.value = "";
    if (filterRating) filterRating.value = "0";
    Array.from(catalogCategoryInputs || []).forEach((input) => {
      input.checked = false;
    });
    Array.from(catalogLevelInputs || []).forEach((input) => {
      input.checked = false;
    });
    loadCatalog(1);
  });
}

if (catalogPrev) {
  catalogPrev.addEventListener("click", () => {
    if (currentPage > 1) {
      loadCatalog(currentPage - 1);
    }
  });
}

if (catalogNext) {
  catalogNext.addEventListener("click", () => {
    if (currentPage < totalPages) {
      loadCatalog(currentPage + 1);
    }
  });
}

if (catalogList) {
  const params = new URLSearchParams(window.location.search);
  const presetCategory = params.get("category");
  if (presetCategory) {
    Array.from(catalogCategoryInputs || []).forEach((input) => {
      if (input.value.toLowerCase() === presetCategory.toLowerCase()) {
        input.checked = true;
      }
    });
  }
  loadCatalog(1);
}

const renderReviews = (reviews) => {
  if (!courseReviews) return;
  if (!reviews || !reviews.length) {
    courseReviews.innerHTML = "<p class=\"helper-text\">No reviews yet.</p>";
    return;
  }
  courseReviews.innerHTML = reviews
    .map(
      (review) => `
      <article class="testimonial-card">
        <div>
          <p>${review.comment || "Great course."}</p>
          <strong>${review.name || "Student"}</strong>
          <span>Rating: ${review.rating || 5}</span>
        </div>
      </article>
    `
    )
    .join("");
};

const loadCourseDetail = async () => {
  if (!courseTitle || !courseSummary) return;
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");
  const courseTitleParam = params.get("title");
  if (!courseId && !courseTitleParam) return;

  try {
    let response;
    let data;
    if (courseId) {
      response = await fetch(`${API_BASE}/api/courses/public/${courseId}`);
      data = await response.json();
    } else {
      response = await fetch(
        `${API_BASE}/api/courses/public?q=${encodeURIComponent(courseTitleParam)}&limit=1`
      );
      const payload = await response.json();
      data = Array.isArray(payload.data) ? payload.data[0] : null;
    }
    if (!response.ok) {
      return;
    }
    if (!data) return;
    const resolvedCourseId = data._id || courseId;
    courseTitle.textContent = data.title;
    courseSummary.textContent = data.description;
    if (courseImage) {
      courseImage.src = data.imageUrl || courseImage.src;
    }
    if (courseLevel) {
      courseLevel.textContent = data.level;
    }
    if (courseDuration) {
      courseDuration.textContent = `${data.durationWeeks} weeks`;
    }
    if (coursePrice) {
      coursePrice.textContent = `$${data.price || 0}`;
    }
    if (courseRating) {
      courseRating.textContent = data.rating || 0;
    }
    if (courseInstructor) {
      courseInstructor.textContent = `Instructor: ${data.instructorName || "TBD"}`;
    }
    const syllabusItems = Array.isArray(data.syllabus) && data.syllabus.length
      ? data.syllabus
      : [
          "Project setup and fundamentals",
          "Core concepts with hands-on labs",
          "Build your capstone project",
          "Testing, deployment, and review",
        ];

    if (courseOutcomes) {
      const outcomes = Array.isArray(data.outcomes) && data.outcomes.length
        ? data.outcomes
        : [
            "Ship a production-ready project",
            "Master the key framework patterns",
            "Build portfolio-ready deliverables",
          ];
      courseOutcomes.innerHTML = outcomes
        .map((item) => `<span class="outcome-chip">${item}</span>`)
        .join("");
    }

    if (courseCurriculum) {
      courseCurriculum.innerHTML = syllabusItems
        .map(
          (item, index) => `
          <div class="accordion-item">
            <div class="accordion-header">
              <span>Module ${index + 1}</span>
              <span>${item}</span>
            </div>
            <div class="accordion-body">
              <p>${item}</p>
            </div>
          </div>
        `
        )
        .join("");
      courseCurriculum.querySelectorAll(".accordion-header").forEach((header) => {
        header.addEventListener("click", () => {
          const item = header.parentElement;
          item.classList.toggle("open");
        });
      });
    }
    renderReviews(data.reviews || []);

    if (enrollButton) {
      enrollButton.addEventListener("click", () => {
        window.location.href = `checkout.html?id=${resolvedCourseId}`;
      });
    }

    const token = getToken();
    if (token && startButton && resolvedCourseId) {
      try {
        const response = await fetch(`${API_BASE}/api/enrollments/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const enrollments = await response.json();
        const match = Array.isArray(enrollments)
          ? enrollments.find((item) => item.course && item.course._id === resolvedCourseId)
          : null;
        if (response.ok && match) {
          startButton.classList.remove("hidden");
          startButton.href = `learning.html?id=${resolvedCourseId}`;
        }
      } catch (err) {
        return;
      }
    }
  } catch (err) {
    return;
  }
};

const categoryHighlight = document.querySelector("#category-highlight");

const loadCategoryHighlights = async () => {
  if (!categoryHighlight) return;
  const categories = ["Engineering", "Product", "Design", "Data", "Marketing"];
  try {
    const requests = categories.map((category) =>
      fetch(`${API_BASE}/api/courses/public?category=${encodeURIComponent(category)}&limit=2`)
        .then((response) => response.json())
        .then((payload) => ({ category, courses: payload.data || [] }))
    );
    const results = await Promise.all(requests);
    categoryHighlight.innerHTML = results
      .map((group) => {
        const cards = group.courses
          .map((course) => {
            const imageUrl = course.imageUrl || "";
            const link = course._id ? `course-detail.html?id=${course._id}` : "courses.html";
            return `
              <article class="course-card">
                <img src="${imageUrl}" alt="${course.title}" loading="lazy" />
                <span class="tag">${group.category}</span>
                <h3>${course.title}</h3>
                <p>${course.description}</p>
                <div class="card-meta">${course.durationWeeks} weeks · $${course.price || 0}</div>
                <a class="secondary-button" href="${link}">View</a>
              </article>
            `;
          })
          .join("");
        return `
          <div>
            <h4>${group.category}</h4>
            <div class="card-grid">${cards || "<p class=\"helper-text\">No courses yet.</p>"}</div>
          </div>
        `;
      })
      .join("");
  } catch (err) {
    categoryHighlight.innerHTML = "<p class=\"helper-text\">Unable to load category highlights.</p>";
  }
};

const loadLearning = async () => {
  if (!learningVideos) return;
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");
  if (!courseId) return;

  try {
    const courseResponse = await fetch(`${API_BASE}/api/courses/public/${courseId}`);
    const course = await courseResponse.json();
    if (!courseResponse.ok) return;

    if (learningTitle) {
      learningTitle.textContent = course.title;
    }

    if (lessonList) {
      const lessons =
        Array.isArray(course.syllabus) && course.syllabus.length
          ? course.syllabus
          : [
              "Welcome + course overview",
              "Core concepts and setup",
              "Hands-on project build",
              "Testing and iteration",
              "Wrap-up and next steps",
            ];
      const storageKey = `learnify_lessons_${courseId}`;
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const completed = new Set(saved);

      const updateProgress = async () => {
        const progress = Math.round((completed.size / lessons.length) * 100);
        if (learningProgressText) {
          const nextLesson = lessons.findIndex((_, idx) => !completed.has(idx));
          if (nextLesson === -1) {
            learningProgressText.textContent = "All lessons completed. Great work!";
          } else {
            learningProgressText.textContent = `Next up: Lesson ${nextLesson + 1} · ${lessons[nextLesson]}`;
          }
        }
        localStorage.setItem(storageKey, JSON.stringify([...completed]));

        const token = getToken();
        if (!token) return;
        try {
          await fetch(`${API_BASE}/api/enrollments/progress`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ courseId, progress }),
          });
        } catch (err) {
          return;
        }
      };

      lessonList.innerHTML = lessons
        .map((lesson, index) => {
          const checked = completed.has(index) ? "checked" : "";
          return `
          <label class="lesson-item">
            <input type="checkbox" data-lesson-index="${index}" ${checked} />
            <div>
              <strong>Lesson ${index + 1}</strong>
              <span>${lesson}</span>
            </div>
            <i class="ri-check-line"></i>
          </label>
        `;
        })
        .join("");

      lessonList.querySelectorAll("input[type=\"checkbox\"]").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          const index = Number(checkbox.dataset.lessonIndex);
          if (checkbox.checked) {
            completed.add(index);
          } else {
            completed.delete(index);
          }
          updateProgress();
        });
      });

      updateProgress();
    }

    const query = course.videoQuery || course.title;
    const videoResponse = await fetch(`${API_BASE}/api/videos/search?q=${encodeURIComponent(query)}`);
    const videoPayload = await videoResponse.json();
    if (!videoResponse.ok) {
      learningVideos.innerHTML = "<p class=\"helper-text\">Video API not configured.</p>";
      return;
    }

    const list = videoPayload.data || [];
    learningVideos.innerHTML = list
      .map(
        (video) => `
        <div class="video-card">
          <img src="${video.thumbnail}" alt="${video.title}" />
          <h4>${video.title}</h4>
          <p class="helper-text">${video.channelTitle || ""}</p>
          <a class="secondary-button" href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" rel="noreferrer">Watch</a>
        </div>
      `
      )
      .join("");
  } catch (err) {
    learningVideos.innerHTML = "<p class=\"helper-text\">Unable to load videos.</p>";
  }
};

const loadCheckout = async () => {
  if (!checkoutTitle || !checkoutForm) return;
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");
  const courseTitleParam = params.get("title");

  if (!courseId && !courseTitleParam) {
    if (checkoutMessage) {
      checkoutMessage.textContent = "No course selected for checkout.";
    }
    return;
  }

  try {
    let course = null;
    if (courseId) {
      const response = await fetch(`${API_BASE}/api/courses/public/${courseId}`);
      course = await response.json();
      if (!response.ok) {
        course = null;
      }
    } else {
      const response = await fetch(
        `${API_BASE}/api/courses/public?q=${encodeURIComponent(courseTitleParam)}&limit=1`
      );
      const payload = await response.json();
      course = Array.isArray(payload.data) ? payload.data[0] : null;
    }

    if (!course) {
      if (checkoutMessage) {
        checkoutMessage.textContent = "Unable to load course details.";
      }
      return;
    }

    checkoutTitle.textContent = course.title;
    if (checkoutImage) {
      checkoutImage.src = course.imageUrl || checkoutImage.src;
    }
    const price = Number(course.price) || 0;
    const fee = Math.round(price * 0.05);
    const discount = 0;
    const total = price + fee - discount;

    if (checkoutPrice) checkoutPrice.textContent = `$${price}`;
    if (checkoutFee) checkoutFee.textContent = `$${fee}`;
    if (checkoutDiscount) checkoutDiscount.textContent = `$${discount}`;
    if (checkoutTotal) checkoutTotal.textContent = `$${total}`;

    if (!getToken() && checkoutMessage) {
      checkoutMessage.textContent = "Please log in to complete your purchase.";
      if (checkoutSubmit) checkoutSubmit.disabled = true;
    }

    checkoutForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const token = getToken();
      if (!token) {
        window.location.href = "login.html";
        return;
      }
      const selectedCourseId = course._id || courseId;
      if (!selectedCourseId) return;

      try {
        const response = await fetch(`${API_BASE}/api/enrollments/enroll`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId: selectedCourseId }),
        });
        if (!response.ok) {
          if (checkoutMessage) {
            checkoutMessage.textContent = "Payment failed. Please try again.";
          }
          return;
        }
        window.location.href = "my-courses.html";
      } catch (err) {
        if (checkoutMessage) {
          checkoutMessage.textContent = "Network error during purchase.";
        }
      }
    });
  } catch (err) {
    if (checkoutMessage) {
      checkoutMessage.textContent = "Network error loading checkout.";
    }
  }
};

const loadCertificate = async () => {
  if (!certificateName || !certificateCourse) return;
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");
  if (!courseId) {
    if (certificateMessage) {
      certificateMessage.textContent = "No course selected for certificate.";
    }
    return;
  }
  const token = getToken();
  if (!token) {
    if (certificateMessage) {
      certificateMessage.textContent = "Please log in to view your certificate.";
    }
    return;
  }

  try {
    const [profileResponse, enrollmentResponse, courseResponse] = await Promise.all([
      fetch(`${API_BASE}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/api/enrollments/me`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE}/api/courses/public/${courseId}`),
    ]);

    const profile = await profileResponse.json();
    const enrollments = await enrollmentResponse.json();
    const course = await courseResponse.json();

    if (!profileResponse.ok || !courseResponse.ok || !enrollmentResponse.ok) {
      if (certificateMessage) {
        certificateMessage.textContent = "Unable to load certificate data.";
      }
      return;
    }

    const match = Array.isArray(enrollments)
      ? enrollments.find((item) => item.course && item.course._id === courseId)
      : null;

    if (!match || match.status !== "completed") {
      if (certificateMessage) {
        certificateMessage.textContent =
          "Complete the course to unlock your certificate.";
      }
      if (certificateCard) {
        certificateCard.classList.add("hidden");
      }
      if (certificateDownload) {
        certificateDownload.disabled = true;
      }
      return;
    }

    certificateName.textContent = profile.username || "Learner";
    certificateCourse.textContent = course.title;
    const date = new Date(match.updatedAt || match.createdAt || Date.now());
    if (certificateDate) {
      certificateDate.textContent = `Issued on ${date.toLocaleDateString()}`;
    }
  } catch (err) {
    if (certificateMessage) {
      certificateMessage.textContent = "Network error loading certificate.";
    }
  }
};

if (certificateDownload) {
  certificateDownload.addEventListener("click", () => {
    window.print();
  });
}

const renderAdminCourses = (courses) => {
  if (!adminCourseList) return;
  if (!courses.length) {
    adminCourseList.innerHTML = "<p class=\"helper-text\">No courses yet.</p>";
    return;
  }
  adminCourseList.innerHTML = courses
    .map(
      (course) => `
      <div class="page-panel">
        <strong>${course.title}</strong>
        <p class="helper-text">${course.description}</p>
        <div class="card-meta">
          <span>${course.category || "General"}</span>
          <span>${course.level}</span>
          <span>${course.durationWeeks} weeks</span>
          <span>$${course.price || 0}</span>
        </div>
        <div class="detail-actions">
          <button class="secondary-button admin-edit" data-id="${course._id}">Edit</button>
          <button class="ghost-button admin-delete" data-id="${course._id}">Delete</button>
        </div>
      </div>
    `
    )
    .join("");
};

const loadAdminDashboard = async () => {
  if (!adminCourseList || !adminCourseForm) return;
  const token = getToken();
  if (!token) {
    if (adminMessage) {
      adminMessage.textContent = "Log in to manage your courses.";
    }
    return;
  }

  const loadCourses = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        if (adminMessage) adminMessage.textContent = "Unable to load courses.";
        return;
      }
      renderAdminCourses(data);
      adminCourseList.querySelectorAll(".admin-edit").forEach((button) => {
        button.addEventListener("click", () => {
          const course = data.find((item) => item._id === button.dataset.id);
          if (!course) return;
          adminCourseForm.dataset.courseId = course._id;
          adminCourseForm.title.value = course.title || "";
          adminCourseForm.description.value = course.description || "";
          adminCourseForm.category.value = course.category || "";
          adminCourseForm.price.value = course.price || "";
          adminCourseForm.level.value = course.level || "beginner";
          adminCourseForm.durationWeeks.value = course.durationWeeks || "";
          adminCourseForm.imageUrl.value = course.imageUrl || "";
          adminCourseForm.instructorName.value = course.instructorName || "";
          adminCourseForm.rating.value = course.rating || "";
          adminCourseForm.reviewCount.value = course.reviewCount || "";
          adminCourseForm.videoQuery.value = course.videoQuery || "";
          adminCourseForm.outcomes.value = (course.outcomes || []).join(", ");
          adminCourseForm.syllabus.value = (course.syllabus || []).join(", ");
          if (adminSubmit) adminSubmit.textContent = "Update course";
        });
      });
      adminCourseList.querySelectorAll(".admin-delete").forEach((button) => {
        button.addEventListener("click", async () => {
          const confirmed = window.confirm("Delete this course?");
          if (!confirmed) return;
          await fetch(`${API_BASE}/api/courses/${button.dataset.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          loadCourses();
        });
      });
    } catch (err) {
      if (adminMessage) adminMessage.textContent = "Network error loading courses.";
    }
  };

  await loadCourses();

  adminCourseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(adminCourseForm).entries());
    payload.price = payload.price ? Number(payload.price) : 0;
    payload.durationWeeks = payload.durationWeeks ? Number(payload.durationWeeks) : 4;
    payload.rating = payload.rating ? Number(payload.rating) : 0;
    payload.reviewCount = payload.reviewCount ? Number(payload.reviewCount) : 0;
    payload.outcomes = payload.outcomes
      ? payload.outcomes.split(",").map((item) => item.trim()).filter(Boolean)
      : [];
    payload.syllabus = payload.syllabus
      ? payload.syllabus.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const courseId = adminCourseForm.dataset.courseId;
    const url = courseId ? `${API_BASE}/api/courses/${courseId}` : `${API_BASE}/api/courses`;
    const method = courseId ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        if (adminMessage) adminMessage.textContent = "Unable to save course.";
        return;
      }
      if (adminMessage) adminMessage.textContent = "Course saved.";
      adminCourseForm.reset();
      delete adminCourseForm.dataset.courseId;
      if (adminSubmit) adminSubmit.textContent = "Save course";
      loadCourses();
    } catch (err) {
      if (adminMessage) adminMessage.textContent = "Network error saving course.";
    }
  });

  if (adminReset) {
    adminReset.addEventListener("click", () => {
      adminCourseForm.reset();
      delete adminCourseForm.dataset.courseId;
      if (adminSubmit) adminSubmit.textContent = "Save course";
    });
  }
};

loadProfile();
loadEnrollments();
loadMyCourses();
loadCourseDetail();
loadLearning();
syncAuthLinks();
attachQuickViewHandlers();
loadCategoryHighlights();
loadCheckout();
loadCertificate();
loadAdminDashboard();
