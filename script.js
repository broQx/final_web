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

const newsletterForm = document.querySelector(".newsletter-form");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletterForm.reset();
  });
}

const API_BASE = "http://localhost:3000";
const TOKEN_KEY = "oc_token";

const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");
const courseForm = document.querySelector("#course-form");
const courseList = document.querySelector("#course-list");

const catalogList = document.querySelector("#catalog-list");
const catalogSearch = document.querySelector("#catalog-search");
const catalogCategory = document.querySelector("#catalog-category");
const catalogLevel = document.querySelector("#catalog-level");
const catalogSort = document.querySelector("#catalog-sort");
const catalogApply = document.querySelector("#catalog-apply");
const catalogPrev = document.querySelector("#catalog-prev");
const catalogNext = document.querySelector("#catalog-next");
const catalogPageLabel = document.querySelector("#catalog-page");

const courseTitle = document.querySelector("#course-title");
const courseSummary = document.querySelector("#course-summary");
const courseImage = document.querySelector("#course-image");
const courseLevel = document.querySelector("#course-level");
const courseDuration = document.querySelector("#course-duration");
const coursePrice = document.querySelector("#course-price");

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

const loadCourses = async () => {
  if (!courseList) return;
  const token = getToken();
  if (!token) {
    courseList.textContent = "Log in to load your courses.";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      courseList.textContent = "Unable to load courses.";
      return;
    }
    const data = await response.json();
    if (!data.length) {
      courseList.textContent = "No courses yet. Create one above.";
      return;
    }
    courseList.innerHTML = data
      .map(
        (course) => `
        <div class="page-panel">
          <strong>${course.title}</strong>
          <p>${course.description}</p>
          <span class="helper-text">${course.category || "General"} - ${course.level} - ${course.durationWeeks} weeks - $${course.price || 0}</span>
        </div>
      `
      )
      .join("");
  } catch (err) {
    courseList.textContent = "Network error loading courses.";
  }
};

if (registerForm) {
  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }
      setToken(data.token);
      registerForm.reset();
      alert("Registration successful!");
      loadCourses();
    } catch (err) {
      alert("Network error during registration.");
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }
      setToken(data.token);
      loginForm.reset();
      alert("Login successful!");
      loadCourses();
    } catch (err) {
      alert("Network error during login.");
    }
  });
}

if (courseForm) {
  courseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const token = getToken();
    if (!token) {
      alert("Please log in first.");
      return;
    }

    const formData = new FormData(courseForm);
    const payload = Object.fromEntries(formData.entries());
    payload.durationWeeks = Number(payload.durationWeeks || 4);
    payload.price = Number(payload.price || 0);

    try {
      const response = await fetch(`${API_BASE}/api/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Failed to create course");
        return;
      }
      courseForm.reset();
      loadCourses();
    } catch (err) {
      alert("Network error creating course.");
    }
  });
}

let currentPage = 1;
let totalPages = 1;

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
      return `
      <a class="course-card" href="${courseLink}">
        <img src="${imageUrl}" alt="${course.title}" />
        <span class="tag">${course.category || "General"}</span>
        <h3>${course.title}</h3>
        <p>${course.description}</p>
        <div class="card-meta">Level: ${course.level} - ${course.durationWeeks} weeks - $${course.price || 0}</div>
      </a>
    `;
    })
    .join("");
};

const loadCatalog = async (page = 1) => {
  if (!catalogList) return;
  const params = new URLSearchParams();
  if (catalogSearch && catalogSearch.value.trim()) {
    params.set("q", catalogSearch.value.trim());
  }
  if (catalogCategory && catalogCategory.value !== "all") {
    params.set("category", catalogCategory.value);
  }
  if (catalogLevel && catalogLevel.value !== "all") {
    params.set("level", catalogLevel.value);
  }
  if (catalogSort) {
    params.set("sort", catalogSort.value);
  }
  params.set("page", page);
  params.set("limit", 9);

  try {
    const response = await fetch(
      `${API_BASE}/api/courses/public?${params.toString()}`
    );
    const payload = await response.json();
    if (!response.ok) {
      catalogList.innerHTML = "<p class=\"helper-text\">Unable to load catalog.</p>";
      return;
    }
    const list = Array.isArray(payload.data) ? payload.data : [];
    currentPage = payload.page || 1;
    totalPages = payload.totalPages || 1;
    if (catalogPageLabel) {
      catalogPageLabel.textContent = `Page ${currentPage} of ${totalPages}`;
    }
    renderCatalog(list);
  } catch (err) {
    catalogList.innerHTML = "<p class=\"helper-text\">Network error loading catalog.</p>";
  }
};

if (catalogApply) {
  catalogApply.addEventListener("click", () => loadCatalog(1));
}

if (catalogSearch) {
  catalogSearch.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadCatalog(1);
    }
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
  loadCatalog(1);
}

const loadCourseDetail = async () => {
  if (!courseTitle || !courseSummary) return;
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");
  if (!courseId) return;

  try {
    const response = await fetch(`${API_BASE}/api/courses/public/${courseId}`);
    const data = await response.json();
    if (!response.ok) {
      return;
    }
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
  } catch (err) {
    return;
  }
};

loadCourseDetail();

if (courseList) {
  loadCourses();
}

const sliderTrack = document.querySelector(".slider-track");
const sliderPrev = document.querySelector(".slider-prev");
const sliderNext = document.querySelector(".slider-next");

if (sliderTrack && sliderPrev && sliderNext) {
  sliderPrev.addEventListener("click", () => {
    sliderTrack.scrollBy({ left: -320, behavior: "smooth" });
  });
  sliderNext.addEventListener("click", () => {
    sliderTrack.scrollBy({ left: 320, behavior: "smooth" });
  });
}
