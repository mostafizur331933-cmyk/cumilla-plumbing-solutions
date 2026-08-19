// ===== কুমিল্লা প্লাম্বিং সলিউশনস — Static Website Scripts =====
const CONTACT = {
  phone: "01714700075",
  whatsapp: "8801714700075",
  facebook: "https://www.facebook.com/share/1Bb2MhEzRe/",
  youtube: "#",
};

function initBookingForm() {
  const form = document.getElementById("booking-form");
  if (!form) return;

  const locBtn = document.getElementById("share-location");
  const locMsgEl = document.getElementById("location-msg");
  const sentEl = document.getElementById("sent-msg");
  let locationLink = "";

  locBtn.addEventListener("click", () => {
    if (!("geolocation" in navigator)) {
      showLocMsg("err", "দুঃখিত, আপনার ব্রাউজারে লোকেশন সুবিধা নেই।");
      return;
    }
    showLocMsg("ok", "লোকেশন খোঁজা হচ্ছে...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locationLink = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        showLocMsg("ok", "✅ আপনার লোকেশন যুক্ত হয়েছে।");
      },
      () => {
        showLocMsg("err", "❌ লোকেশন পাওয়া যায়নি। অনুমতি দিন অথবা ঠিকানা লিখে দিন।");
      },
    );
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const problem = document.getElementById("problem").value.trim();

    if (!name || !phone || !problem) return;

    const lines = [
      "🔧 নতুন বুকিং — কুমিল্লা প্লাম্বিং সলিউশনস",
      `নাম: ${name}`,
      `মোবাইল: ${phone}`,
      `সমস্যা: ${problem}`,
    ];
    if (locationLink) lines.push(`লোকেশন: ${locationLink}`);

    window.open(
      `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
    );

    if (sentEl) sentEl.classList.remove("hidden");
  });

  function showLocMsg(type, text) {
    locMsgEl.className = type === "ok" ? "msg-ok" : "msg-err";
    locMsgEl.textContent = text;
  }
}

function setActiveNav() {
  const path = window.location.pathname.split("/").pop();
  const currentPage = path === "" ? "index.html" : path;
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// ===== অ্যাপ ইনস্টল ব্যানার =====
function initInstallBanner() {
  const DISMISS_KEY = "cps_install_dismissed_at";
  const DISMISS_DAYS = 7;

  // ইতিমধ্যে অ্যাপ হিসেবে ইনস্টল করা থাকলে ব্যানার দেখানো হবে না
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  if (isStandalone) return;

  // সম্প্রতি বন্ধ করা থাকলে কিছুদিন আর দেখানো হবে না
  const dismissedAt = localStorage.getItem(DISMISS_KEY);
  if (dismissedAt) {
    const days = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
    if (days < DISMISS_DAYS) return;
  }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  let deferredPrompt = null;

  function buildBanner() {
    const banner = document.createElement("div");
    banner.id = "install-banner";
    banner.innerHTML = `
      <img src="logo.png" alt="অ্যাপ আইকন" class="ib-icon">
      <div class="ib-text">
        <div class="ib-title">অ্যাপটি ইনস্টল করুন</div>
        <div class="ib-sub">দ্রুত বুকিং করতে হোম স্ক্রিনে যুক্ত করুন</div>
      </div>
      <div class="ib-actions">
        <button class="ib-install" type="button">${isIOS ? "কিভাবে?" : "ইনস্টল করুন"}</button>
        <button class="ib-close" type="button" aria-label="বন্ধ করুন">✕</button>
      </div>
    `;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add("show"));

    banner.querySelector(".ib-close").addEventListener("click", () => {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
      banner.classList.remove("show");
      setTimeout(() => banner.remove(), 350);
    });

    banner.querySelector(".ib-install").addEventListener("click", async () => {
      if (isIOS) {
        alert(
          "আইফোনে অ্যাপ হিসেবে যুক্ত করতে:\n\n১. নিচের শেয়ার (Share) বাটনে চাপুন 📤\n২. \"Add to Home Screen\" এ চাপুন\n৩. \"Add\" চাপুন — ব্যাস, অ্যাপ রেডি!",
        );
        return;
      }
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (outcome === "accepted" || outcome === "dismissed") {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
          banner.classList.remove("show");
          setTimeout(() => banner.remove(), 350);
        }
      }
    });
  }

  if (isIOS) {
    // iOS-এ beforeinstallprompt সাপোর্ট করে না, তাই সরাসরি ব্যানার দেখানো হবে
    buildBanner();
    return;
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    buildBanner();
  });

  window.addEventListener("appinstalled", () => {
    const banner = document.getElementById("install-banner");
    if (banner) banner.remove();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initBookingForm();
  setActiveNav();
  initInstallBanner();
});
