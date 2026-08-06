/**
 * Website Sync Script (Firebase সংস্করণ)
 * ----------------------------------------------------
 * এই স্ক্রিপ্টটি পাবলিক ওয়েবসাইটের প্রতিটি পেজে যুক্ত থাকে।
 * এটি Firestore থেকে সরাসরি ডেটা পড়ে (localStorage নয়) —
 * তাই এডমিন প্যানেলে করা যেকোনো পরিবর্তন এখন সব ভিজিটরের
 * ব্রাউজারেই দেখা যাবে, শুধু আপনার নিজের ব্রাউজারে না।
 *
 * onSnapshot ব্যবহার করার কারণে, এডমিন কিছু আপডেট করলে
 * পেজ রিফ্রেশ ছাড়াই কয়েক সেকেন্ডের মধ্যে পরিবর্তন দেখা যাবে।
 */

class WebsiteSync {
    constructor() {
        this.docRef = firebase.firestore().collection('site').doc('data');
    }

    // হিরো সেকশন আপডেট করুন
    updateHeroSection(data) {
        const hero = data.hero;
        if (!hero) return;

        const h1 = document.querySelector('main section.hero h1');
        if (h1) h1.textContent = hero.title || '';

        const subHeading = document.querySelector('main section.hero .hero-sub');
        if (subHeading) subHeading.textContent = hero.description || '';

        const badge = document.querySelector('main section.hero .hero-badge');
        if (badge) badge.textContent = hero.badge || '';
    }

    // যোগাযোগ তথ্য আপডেট করুন
    updateContactInfo(data) {
        const contact = data.contact;
        if (!contact) return;

        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.href = `tel:${contact.phone}`;
            if (!link.textContent.includes('wa.me')) {
                // ফোন নম্বর টেক্সট থাকলেই কেবল পরিবর্তন করুন (আইকন-শুধু বাটন বাদ)
                if (/^[\d\s+]+$/.test(link.textContent.trim())) {
                    link.textContent = contact.phone;
                }
            }
        });

        document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
            link.href = `https://wa.me/${contact.whatsapp}`;
        });

        document.querySelectorAll('a[href*="facebook.com"]').forEach(link => {
            link.href = contact.facebook;
        });
    }

    // গ্যালারি আপডেট করুন
    updateGallery(data) {
        const videos = data.videos || [];
        const videoCards = document.querySelectorAll('.video-card');

        videos.forEach((video, index) => {
            if (videoCards[index]) {
                const card = videoCards[index];
                const h3 = card.querySelector('h3');
                const p = card.querySelector('p');

                if (h3) h3.textContent = video.title || '';
                if (p) p.textContent = video.description || '';

                if (video.url) {
                    card.href = video.url;
                    card.target = '_blank';
                    card.rel = 'noreferrer';
                }
            }
        });
    }

    // সেবা সেকশন যুক্ত করুন (যদি না থাকে)
    updateServices(data) {
        const services = data.services || [];

        let servicesSection = document.getElementById('services-section');
        if (!servicesSection) {
            const mainElement = document.querySelector('main');
            if (mainElement) {
                servicesSection = document.createElement('section');
                servicesSection.className = 'section';
                servicesSection.id = 'services-section';
                servicesSection.innerHTML = '<h2 class="section-title">আমাদের সেবা</h2><div class="cards" id="services-cards"></div>';
                mainElement.appendChild(servicesSection);
            }
        }

        const cardsContainer = document.getElementById('services-cards');
        if (cardsContainer) {
            cardsContainer.innerHTML = '';
            services.forEach(service => {
                const card = document.createElement('div');
                card.className = 'card glass';
                card.innerHTML = `
                    <h3>${service.icon} ${service.name}</h3>
                    <p>${service.description}</p>
                `;
                cardsContainer.appendChild(card);
            });
        }
    }

    // সব কিছু আপডেট করুন
    updateAll(data) {
        this.updateHeroSection(data);
        this.updateContactInfo(data);
        this.updateGallery(data);
        this.updateServices(data);
    }

    // Firestore-এর সাথে রিয়েল-টাইম কানেকশন চালু করুন
    listen() {
        this.docRef.onSnapshot(
            (snap) => {
                if (snap.exists) {
                    this.updateAll(snap.data());
                }
            },
            (err) => {
                console.error('Firestore থেকে ডেটা পড়তে সমস্যা হয়েছে:', err);
            }
        );
    }
}

// যখন DOM প্রস্তুত হয় তখন সিঙ্ক শুরু করুন
document.addEventListener('DOMContentLoaded', () => {
    const sync = new WebsiteSync();
    sync.listen();
});
