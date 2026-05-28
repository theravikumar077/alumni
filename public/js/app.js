// Global User Session Variable
let currentUser = null;

// DOM loaded event
document.addEventListener("DOMContentLoaded", () => {
  initScrollProgress();
  initTheme();
  checkAuthAndInitialize();
});

// Scroll progress bar indicator
function initScrollProgress() {
  const progressBar = document.createElement("div");
  progressBar.id = "scroll-progress";
  document.body.prepend(progressBar);

  window.addEventListener("scroll", () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    progressBar.style.width = scrolled + "%";
  });
}

// Dark Mode / Theme initialization
function initTheme() {
  const isDark = localStorage.getItem("theme") === "dark" || 
                 (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// Toggle Theme function
function toggleTheme() {
  if (document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    showToast("Switched to light theme", "info");
  } else {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    showToast("Switched to dark theme", "info");
  }
  
  // Re-draw dark mode icons if any page custom logic exists
  document.dispatchEvent(new CustomEvent("themeChanged"));
}

// Check session and load components
async function checkAuthAndInitialize() {
  try {
    const res = await fetch("/api/auth/me");
    const data = await res.json();

    if (data.success) {
      currentUser = data.user;
    }
  } catch (err) {
    console.error("Auth session retrieval error:", err);
  }

  // Handle route guards
  handleRouteGuards();

  // Inject common layout elements
  renderNavbar();
  renderFooter();
  
  // Custom page init callback
  if (typeof pageInit === "function") {
    pageInit();
  }
  
  // Update Notification Indicators
  if (currentUser) {
    updateNotificationCounts();
  }
}

// Route guards logic
function handleRouteGuards() {
  const path = window.location.pathname.toLowerCase();
  
  const protectedPages = [
    "/dashboard/user", "/dashboard/alumni", "/dashboard/mentor", "/dashboard/admin",
    "/dashboard-user.html", "/dashboard-alumni.html", "/dashboard-mentor.html", "/dashboard-admin.html",
    "/profile", "/profile.html",
    "/messages", "/messages.html",
    "/notifications", "/notifications.html",
    "/settings", "/settings.html"
  ];

  const guestOnlyPages = [
    "/login", "/login.html",
    "/signup", "/signup.html"
  ];

  // If user is guest and tries to access protected page
  const isProtected = protectedPages.some(page => path.includes(page));
  if (isProtected && !currentUser) {
    showToast("Please log in to access this page", "warning");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
    return;
  }

  // If user is logged in and tries to access guest-only login/signup page
  const isGuestOnly = guestOnlyPages.some(page => path.includes(page));
  if (isGuestOnly && currentUser) {
    // Redirect to correct dashboard based on role
    redirectToDashboard();
  }
}

// Redirect helper
function redirectToDashboard() {
  if (!currentUser) return;
  
  if (currentUser.role === "admin") {
    window.location.href = "/dashboard/admin";
  } else if (currentUser.role === "mentor") {
    window.location.href = "/dashboard/mentor";
  } else if (currentUser.role === "alumni") {
    window.location.href = "/dashboard/alumni";
  } else {
    window.location.href = "/dashboard/user";
  }
}

// Render dynamic sticky navbar
function renderNavbar() {
  const navContainer = document.getElementById("navbar-container");
  if (!navContainer) return;

  // Add navbar classes
  navContainer.className = "sticky top-0 z-50 transition-all duration-300 glass shadow-sm";

  const isLoggedIn = !!currentUser;
  
  // Define nav links
  const links = [
    { text: "Home", href: "/" },
    { text: "Alumni", href: "/alumni" },
    { text: "Mentors", href: "/mentors" },
    { text: "Events", href: "/events" },
    { text: "Jobs", href: "/jobs" },
    { text: "Community", href: "/community" },
    { text: "About", href: "/about" },
    { text: "Contact", href: "/contact" }
  ];

  const activePath = window.location.pathname;

  let linksHTML = links.map(link => {
    const isActive = activePath === link.href || (activePath === "/index.html" && link.href === "/");
    const activeClass = isActive 
      ? "text-indigo-600 dark:text-violet-400 font-semibold" 
      : "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-violet-400";
    return `
      <a href="${link.href}" class="${activeClass} text-sm transition-colors duration-200 py-2">
        ${link.text}
      </a>
    `;
  }).join("");

  let authSectionHTML = "";

  if (isLoggedIn) {
    authSectionHTML = `
      <div class="flex items-center gap-4">
        <!-- Messages -->
        <a href="/messages" class="relative text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-violet-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          <span id="unread-messages-dot" class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full hidden animate-pulse"></span>
        </a>

        <!-- Notifications -->
        <a href="/notifications" class="relative text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-violet-400 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span id="unread-notifications-dot" class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-500 rounded-full hidden animate-pulse"></span>
        </a>

        <!-- Profile Dropdown Button -->
        <div class="relative">
          <button id="profile-dropdown-btn" onclick="toggleProfileDropdown(event)" class="flex items-center gap-2 focus:outline-none">
            <img src="${currentUser.avatar || 'https://via.placeholder.com/40'}" alt="Avatar" class="w-8 h-8 rounded-full border-2 border-indigo-500 object-cover shadow-sm">
          </button>
          
          <!-- Dropdown Card -->
          <div id="profile-dropdown-menu" class="absolute right-0 mt-3 w-52 rounded-2xl glass shadow-xl border border-slate-200/50 dark:border-slate-800/80 p-2 hidden transform origin-top-right transition duration-200">
            <div class="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800/80 mb-1.5">
              <p class="text-xs font-semibold text-indigo-600 dark:text-violet-400 uppercase tracking-wider">${currentUser.role}</p>
              <p class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">${currentUser.name}</p>
            </div>
            
            <a href="javascript:void(0)" onclick="redirectToDashboard()" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-xl transition duration-150">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path></svg>
              Dashboard
            </a>
            <a href="/profile?id=${currentUser._id}" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-xl transition duration-150">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              My Profile
            </a>
            <a href="/settings" class="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-xl transition duration-150">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Settings
            </a>
            <hr class="border-slate-100 dark:border-slate-800/80 my-1.5">
            <button onclick="handleLogout()" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-xl text-left transition duration-150">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    `;
  } else {
    authSectionHTML = `
      <div class="flex items-center gap-3">
        <a href="/login" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-violet-400 transition">
          Log In
        </a>
        <a href="/signup" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-violet-600 hover:bg-indigo-700 dark:hover:bg-violet-700 rounded-xl transition shadow-md shadow-indigo-200 dark:shadow-none hover:shadow-lg">
          Sign Up
        </a>
      </div>
    `;
  }

  // Construct final header layout
  navContainer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <a href="/" class="flex items-center gap-2 text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
          <svg class="w-6 h-6 text-indigo-600 dark:text-violet-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path></svg>
          AlumniHub
        </a>

        <!-- Desktop Navigation Links -->
        <nav class="hidden md:flex items-center gap-6">
          ${linksHTML}
        </nav>

        <!-- Right Hand Actions -->
        <div class="flex items-center gap-3">
          <!-- Dark Mode Toggle Button -->
          <button onclick="toggleTheme()" class="text-slate-600 dark:text-slate-350 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-200" aria-label="Toggle dark mode">
            <!-- Sun Icon (visible in dark mode) -->
            <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m14.071-5.071l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path></svg>
            <!-- Moon Icon (visible in light mode) -->
            <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
          </button>

          <!-- Auth Section -->
          <div class="hidden md:block">
            ${authSectionHTML}
          </div>

          <!-- Mobile Burger menu button -->
          <button onclick="toggleMobileMenu()" class="md:hidden text-slate-600 dark:text-slate-350 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div id="mobile-menu" class="hidden md:hidden border-t border-slate-200/50 dark:border-slate-800/80 px-4 py-4 flex flex-col gap-3 glass">
      ${linksHTML.replace(/text-sm/g, "text-base py-1")}
      <hr class="border-slate-200 dark:border-slate-800/80 my-1">
      <div class="flex flex-col gap-2">
        ${isLoggedIn 
          ? `<a href="javascript:void(0)" onclick="redirectToDashboard()" class="text-base text-indigo-600 dark:text-violet-400 py-1 font-medium">Dashboard</a>
             <a href="/messages" class="text-base text-slate-600 dark:text-slate-350 py-1 font-medium">Messages</a>
             <a href="/notifications" class="text-base text-slate-600 dark:text-slate-350 py-1 font-medium">Notifications</a>
             <a href="/profile?id=${currentUser._id}" class="text-base text-slate-600 dark:text-slate-350 py-1 font-medium">Profile</a>
             <button onclick="handleLogout()" class="text-base text-rose-500 py-1 font-medium text-left">Logout</button>`
          : `<a href="/login" class="w-full text-center px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300">Log In</a>
             <a href="/signup" class="w-full text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-violet-600 rounded-xl">Sign Up</a>`
        }
      </div>
    </div>
  `;

  // Close dropdown on click outside
  document.addEventListener("click", (e) => {
    const dropdown = document.getElementById("profile-dropdown-menu");
    const btn = document.getElementById("profile-dropdown-btn");
    if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });
}

function toggleProfileDropdown(event) {
  event.stopPropagation();
  const menu = document.getElementById("profile-dropdown-menu");
  if (menu) {
    menu.classList.toggle("hidden");
  }
}

function toggleMobileMenu() {
  const menu = document.getElementById("mobile-menu");
  if (menu) {
    menu.classList.toggle("hidden");
  }
}

// Render dynamic footer
function renderFooter() {
  const footerContainer = document.getElementById("footer-container");
  if (!footerContainer) return;

  footerContainer.className = "border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 py-12";
  
  footerContainer.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="md:col-span-1 flex flex-col gap-4">
          <a href="/" class="flex items-center gap-2 text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
            <svg class="w-6 h-6 text-indigo-600 dark:text-violet-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"></path></svg>
            AlumniHub
          </a>
          <p class="text-sm text-slate-500 dark:text-slate-400">Connecting minds, nurturing careers, and strengthening professional networks across generations.</p>
        </div>
        
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Explore</h4>
          <ul class="flex flex-col gap-2.5">
            <li><a href="/alumni" class="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition">Alumni Directory</a></li>
            <li><a href="/mentors" class="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition">Mentors Directory</a></li>
            <li><a href="/jobs" class="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition">Careers & Jobs</a></li>
            <li><a href="/events" class="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition">Events Meetups</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Resources</h4>
          <ul class="flex flex-col gap-2.5">
            <li><a href="/community" class="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition">Discussions & Stories</a></li>
            <li><a href="/about" class="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition">About Portal</a></li>
            <li><a href="/contact" class="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition">Contact Support</a></li>
            <li><a href="/settings" class="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-violet-400 transition">Account Settings</a></li>
          </ul>
        </div>

        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Premium SaaS Ecosystem</h4>
          <p class="text-xs text-slate-400 leading-relaxed">Built for academic excellence. Experience custom dashboards, verification tools, direct chatting hubs, and networking boards.</p>
        </div>
      </div>

      <hr class="border-slate-100 dark:border-slate-800/80 my-8">

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-xs text-slate-400">&copy; ${new Date().getFullYear()} AlumniHub. All rights reserved.</p>
        <div class="flex gap-4">
          <a href="#" class="text-slate-400 hover:text-indigo-600 transition"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/></svg></a>
          <a href="#" class="text-slate-400 hover:text-indigo-600 transition"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"/></svg></a>
          <a href="#" class="text-slate-400 hover:text-indigo-600 transition"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
        </div>
      </div>
    </div>
  `;
}

// Unread counts updater
async function updateNotificationCounts() {
  try {
    const notifRes = await fetch("/api/notifications");
    const notifData = await notifRes.json();
    
    if (notifData.success) {
      const unreadNotifs = notifData.data.filter(n => !n.isRead);
      const dot = document.getElementById("unread-notifications-dot");
      if (dot) {
        if (unreadNotifs.length > 0) {
          dot.classList.remove("hidden");
        } else {
          dot.classList.add("hidden");
        }
      }
    }

    const chatRes = await fetch("/api/messages/chats");
    const chatData = await chatRes.json();
    if (chatData.success) {
      const hasUnread = chatData.data.some(chat => !chat.isRead);
      const dot = document.getElementById("unread-messages-dot");
      if (dot) {
        if (hasUnread) {
          dot.classList.remove("hidden");
        } else {
          dot.classList.add("hidden");
        }
      }
    }
  } catch (err) {
    console.error("Error updating unread badges:", err);
  }
}

// Log out handler
async function handleLogout() {
  try {
    const res = await fetch("/api/auth/logout");
    const data = await res.json();
    if (data.success) {
      currentUser = null;
      showToast("Logged out successfully", "success");
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    }
  } catch (err) {
    showToast("Error during logout", "error");
  }
}

// Toast Alert System
function showToast(message, type = "success") {
  // Check if toast-container exists
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none";
    document.body.appendChild(container);
  }

  // Create Toast
  const toast = document.createElement("div");
  toast.className = "toast-animate pointer-events-auto flex items-center gap-3 p-4 rounded-2xl glass shadow-2xl border border-slate-200/50 dark:border-slate-800/80 transition-all duration-300";

  let iconColor = "";
  let iconSVG = "";

  if (type === "success") {
    iconColor = "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
    iconSVG = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  } else if (type === "error") {
    iconColor = "text-rose-500 bg-rose-50 dark:bg-rose-950/30";
    iconSVG = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  } else if (type === "warning") {
    iconColor = "text-amber-500 bg-amber-50 dark:bg-amber-950/30";
    iconSVG = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;
  } else {
    iconColor = "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30";
    iconSVG = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
  }

  toast.innerHTML = `
    <div class="flex-shrink-0 p-1.5 rounded-xl ${iconColor}">
      ${iconSVG}
    </div>
    <div class="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
      ${message}
    </div>
    <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    </button>
  `;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(15px) scale(0.95)";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// Skeleton card generator helper
function createSkeleton(count = 1) {
  let cards = [];
  for (let i = 0; i < count; i++) {
    cards.push(`
      <div class="skeleton p-6 rounded-3xl h-64 border border-slate-200/50 dark:border-slate-800/80">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 rounded-full bg-slate-300 dark:bg-slate-700 skeleton"></div>
          <div class="flex-1">
            <div class="h-4 bg-slate-300 dark:bg-slate-700 w-1/3 rounded-md mb-2 skeleton"></div>
            <div class="h-3 bg-slate-300 dark:bg-slate-700 w-1/4 rounded-md skeleton"></div>
          </div>
        </div>
        <div class="h-3 bg-slate-300 dark:bg-slate-700 w-full rounded-md mb-2 skeleton"></div>
        <div class="h-3 bg-slate-300 dark:bg-slate-700 w-5/6 rounded-md mb-4 skeleton"></div>
        <div class="h-10 bg-slate-300 dark:bg-slate-700 w-1/2 rounded-xl skeleton"></div>
      </div>
    `);
  }
  return cards.join("");
}
