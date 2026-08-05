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

document.addEventListener("DOMContentLoaded", () => {
  initBookingForm();
  setActiveNav();
});
