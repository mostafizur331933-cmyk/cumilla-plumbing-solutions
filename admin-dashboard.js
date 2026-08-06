/**
 * এডমিন ড্যাশবোর্ড ইন্টারঅ্যাকশন
 */

// পেজ লোড হওয়ার সময় — Firebase Auth স্টেট চেক করেই সব শুরু হবে
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = 'admin-login.html';
        return;
    }
    initDashboard();
});

// ড্যাশবোর্ড চালু করুন (ক্লাউড থেকে সর্বশেষ ডেটা টেনে এনে)
async function initDashboard() {
    const statusEl = document.getElementById('cloudSyncStatus');
    if (statusEl) statusEl.textContent = 'ক্লাউড থেকে ডেটা লোড হচ্ছে...';

    await db.loadFromCloud();

    loadAllData();
    setupMenuListeners();
    updateClock();
    setInterval(updateClock, 1000);
}

// লগ আউট করুন
function logout() {
    if (confirm('আপনি কি সত্যিই লগ আউট করতে চান?')) {
        firebase.auth().signOut().then(() => {
            window.location.href = 'admin-login.html';
        });
    }
}

// সময় আপডেট করুন
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('bn-BD', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('bn-BD', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('currentTime').textContent = `${dateString} | ${timeString}`;
}

// মেনু লিসেনার সেটআপ করুন
function setupMenuListeners() {
    document.querySelectorAll('.menu-link').forEach(link => {
        link.addEventListener('click', () => {
            const section = link.getAttribute('data-section');
            switchSection(section, link);
        });
    });
}

// সেকশন সুইচ করুন
function switchSection(sectionId, element) {
    // সমস্ত সেকশন লুকান
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // সমস্ত মেনু আইটেম আনঅ্যাক্টিভ করুন
    document.querySelectorAll('.menu-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // নির্বাচিত সেকশন দেখান
    document.getElementById(sectionId).classList.add('active');
    if (element) element.classList.add('active');
    
    // পেজ শিরোনাম আপডেট করুন
    const titles = {
        'home': '📊 ড্যাশবোর্ড',
        'content': '📝 কন্টেন্ট এডিট',
        'gallery': '🎥 গ্যালারি',
        'services': '🛠️ সেবা',
        'contact': '📞 যোগাযোগ',
        'settings': '⚙️ সেটিংস'
    };
    document.getElementById('pageTitle').textContent = titles[sectionId] || 'পেজ';
    
    // ডেটা লোড করুন যখন প্রয়োজন
    if (sectionId === 'gallery') {
        loadVideos();
    } else if (sectionId === 'services') {
        loadServices();
    } else if (sectionId === 'contact') {
        loadContact();
    }
}

// সমস্ত ডেটা লোড করুন
function loadAllData() {
    // ড্যাশবোর্ড স্ট্যাটিসটিক্স লোড করুন
    const bookings = db.getBookings();
    const videos = db.getVideos().filter(v => v.url).length;
    const services = db.getServices().length;
    
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('totalVideos').textContent = videos;
    document.getElementById('totalServices').textContent = services;
    
    // হিরো কন্টেন্ট লোড করুন
    const hero = db.getHero();
    document.getElementById('heroTitle').value = hero.title || '';
    document.getElementById('heroDesc').value = hero.description || '';
    document.getElementById('heroBadge').value = hero.badge || '';
    
    // যোগাযোগ তথ্য লোড করুন
    const contact = db.getContact();
    document.getElementById('contactPhone').value = contact.phone || '';
    document.getElementById('contactWhatsapp').value = contact.whatsapp || '';
    document.getElementById('contactFacebook').value = contact.facebook || '';
    document.getElementById('contactEmail').value = contact.email || '';
}

// ====== কন্টেন্ট ম্যানেজমেন্ট ======

// কন্টেন্ট ট্যাব সুইচ করুন
function switchContentTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    
    event.target.classList.add('active');
    document.getElementById(tab + '-content').style.display = 'block';
}

// হিরো কন্টেন্ট সংরক্ষণ করুন
function saveHeroContent() {
    const heroData = {
        title: document.getElementById('heroTitle').value.trim(),
        description: document.getElementById('heroDesc').value.trim(),
        badge: document.getElementById('heroBadge').value.trim()
    };
    
    if (!heroData.title || !heroData.description) {
        showAlert('contentAlert', 'error', '❌ সমস্ত ফিল্ড পূরণ করুন!');
        return;
    }
    
    db.saveHero(heroData);
    showAlert('contentAlert', 'success', '✅ কন্টেন্ট সফলভাবে সংরক্ষিত হয়েছে!');
}

// ====== গ্যালারি ম্যানেজমেন্ট ======

// ভিডিও লোড করুন
function loadVideos() {
    const videos = db.getVideos();
    const videosList = document.getElementById('videosList');
    videosList.innerHTML = '';
    
    videos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'gallery-item';
        videoItem.innerHTML = `
            <div style="position: relative; background: #333; border-radius: 3px; height: 150px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <span style="color: white; font-size: 30px;">🎥</span>
            </div>
            
            <input type="text" value="${video.title}" id="title-${video.id}" placeholder="ভিডিও শিরোনাম">
            
            <input type="text" value="${video.url}" id="url-${video.id}" placeholder="ইউটিউব এম্বেড লিংক">
            
            <textarea id="desc-${video.id}" placeholder="বিবরণ" style="width: 100%; padding: 8px; margin-top: 8px; border: 1px solid #ddd; border-radius: 3px;">${video.description}</textarea>
            
            <div class="gallery-item-actions" style="margin-top: 10px;">
                <button class="btn btn-primary" onclick="updateVideo(${video.id})" style="flex: 1;">💾 আপডেট</button>
                <button class="btn btn-danger" onclick="deleteVideoItem(${video.id})" style="flex: 1;">🗑️ ডিলিট</button>
            </div>
        `;
        videosList.appendChild(videoItem);
    });
}

// ভিডিও যোগ করুন
function addVideo() {
    const title = document.getElementById('newVideoTitle').value.trim();
    const url = document.getElementById('newVideoUrl').value.trim();
    const desc = document.getElementById('newVideoDesc').value.trim();
    
    if (!title || !url) {
        showAlert('galleryAlert', 'error', '❌ শিরোনাম এবং ইউটিউব লিংক প্রয়োজন!');
        return;
    }
    
    db.addVideo({
        title: title,
        url: url,
        description: desc
    });
    
    document.getElementById('newVideoTitle').value = '';
    document.getElementById('newVideoUrl').value = '';
    document.getElementById('newVideoDesc').value = '';
    
    loadVideos();
    showAlert('galleryAlert', 'success', '✅ ভিডিও সফলভাবে যোগ হয়েছে!');
}

// ভিডিও আপডেট করুন
function updateVideo(id) {
    const title = document.getElementById('title-' + id).value.trim();
    const url = document.getElementById('url-' + id).value.trim();
    const desc = document.getElementById('desc-' + id).value.trim();
    
    if (!title || !url) {
        showAlert('galleryAlert', 'error', '❌ শিরোনাম এবং ইউটিউব লিংক প্রয়োজন!');
        return;
    }
    
    db.updateVideo(id, {
        title: title,
        url: url,
        description: desc
    });
    
    loadVideos();
    showAlert('galleryAlert', 'success', '✅ ভিডিও সফলভাবে আপডেট হয়েছে!');
}

// ভিডিও ডিলিট করুন
function deleteVideoItem(id) {
    if (confirm('এই ভিডিওটি ডিলিট করতে চান?')) {
        db.deleteVideo(id);
        loadVideos();
        showAlert('galleryAlert', 'success', '✅ ভিডিও ডিলিট হয়েছে!');
    }
}

// ====== সেবা ম্যানেজমেন্ট ======

// সেবা লোড করুন
function loadServices() {
    const services = db.getServices();
    const servicesList = document.getElementById('servicesList');
    servicesList.innerHTML = '';
    
    services.forEach(service => {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'contact-card';
        serviceItem.innerHTML = `
            <div class="form-group">
                <label>আইকন</label>
                <input type="text" value="${service.icon}" id="icon-${service.id}" placeholder="যেমনঃ 🔧">
            </div>
            
            <div class="form-group">
                <label>সেবার নাম</label>
                <input type="text" value="${service.name}" id="name-${service.id}" placeholder="সেবার নাম">
            </div>
            
            <div class="form-group">
                <label>বিবরণ</label>
                <textarea id="desc-${service.id}" placeholder="সেবার বিবরণ">${service.description}</textarea>
            </div>
            
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="updateService(${service.id})" style="flex: 1;">💾 আপডেট</button>
                <button class="btn btn-danger" onclick="deleteServiceItem(${service.id})" style="flex: 1;">🗑️ ডিলিট</button>
            </div>
        `;
        servicesList.appendChild(serviceItem);
    });
}

// সেবা যোগ করুন
function addService() {
    const icon = document.getElementById('newServiceIcon').value.trim();
    const name = document.getElementById('newServiceName').value.trim();
    const desc = document.getElementById('newServiceDesc').value.trim();
    
    if (!name) {
        showAlert('servicesAlert', 'error', '❌ সেবার নাম প্রয়োজন!');
        return;
    }
    
    db.addService({
        icon: icon || '🔧',
        name: name,
        description: desc
    });
    
    document.getElementById('newServiceIcon').value = '';
    document.getElementById('newServiceName').value = '';
    document.getElementById('newServiceDesc').value = '';
    
    loadServices();
    showAlert('servicesAlert', 'success', '✅ সেবা সফলভাবে যোগ হয়েছে!');
}

// সেবা আপডেট করুন
function updateService(id) {
    const icon = document.getElementById('icon-' + id).value.trim();
    const name = document.getElementById('name-' + id).value.trim();
    const desc = document.getElementById('desc-' + id).value.trim();
    
    if (!name) {
        showAlert('servicesAlert', 'error', '❌ সেবার নাম প্রয়োজন!');
        return;
    }
    
    db.updateService(id, {
        icon: icon || '🔧',
        name: name,
        description: desc
    });
    
    loadServices();
    showAlert('servicesAlert', 'success', '✅ সেবা সফলভাবে আপডেট হয়েছে!');
}

// সেবা ডিলিট করুন
function deleteServiceItem(id) {
    if (confirm('এই সেবাটি ডিলিট করতে চান?')) {
        db.deleteService(id);
        loadServices();
        showAlert('servicesAlert', 'success', '✅ সেবা ডিলিট হয়েছে!');
    }
}

// ====== যোগাযোগ ম্যানেজমেন্ট ======

// যোগাযোগ লোড করুন
function loadContact() {
    const contact = db.getContact();
    document.getElementById('contactPhone').value = contact.phone || '';
    document.getElementById('contactWhatsapp').value = contact.whatsapp || '';
    document.getElementById('contactFacebook').value = contact.facebook || '';
    document.getElementById('contactEmail').value = contact.email || '';
}

// যোগাযোগ সংরক্ষণ করুন
function saveContact() {
    const contactData = {
        phone: document.getElementById('contactPhone').value.trim(),
        whatsapp: document.getElementById('contactWhatsapp').value.trim(),
        facebook: document.getElementById('contactFacebook').value.trim(),
        email: document.getElementById('contactEmail').value.trim()
    };
    
    if (!contactData.phone || !contactData.whatsapp) {
        showAlert('contactAlert', 'error', '❌ ফোন এবং হোয়াটসঅ্যাপ নম্বর প্রয়োজন!');
        return;
    }
    
    db.saveContact(contactData);
    showAlert('contactAlert', 'success', '✅ যোগাযোগ তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
}

// ====== সেটিংস ম্যানেজমেন্ট ======

// ডেটা ব্যাকআপ করুন
async function backupData() {
    const link = document.createElement('a');
    const data = db.getAllData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    link.href = URL.createObjectURL(dataBlob);
    link.download = `cumilla-plumbing-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('settingsAlert', 'success', '✅ ব্যাকআপ ডাউনলোড হয়েছে!');
}

// সব ডেটা রিসেট করুন
function resetAllData() {
    if (confirm('⚠️ সতর্কতা: এটি সমস্ত ডেটা মুছে ফেলবে! আপনি কি নিশ্চিত?')) {
        if (confirm('সত্যিই সব ডেটা রিসেট করতে চান? এটি পূর্ববত করা যাবে না!')) {
            db.reset();
            loadAllData();
            showAlert('settingsAlert', 'success', '✅ সমস্ত ডেটা রিসেট হয়েছে!');
        }
    }
}

// পাসওয়ার্ড পরিবর্তন করুন
async function changePassword() {
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    
    if (!newPass || !confirmPass) {
        showAlert('settingsAlert', 'error', '❌ উভয় পাসওয়ার্ড ফিল্ড পূরণ করুন!');
        return;
    }
    
    if (newPass !== confirmPass) {
        showAlert('settingsAlert', 'error', '❌ পাসওয়ার্ড মেলে না!');
        return;
    }
    
    if (newPass.length < 6) {
        showAlert('settingsAlert', 'error', '❌ পাসওয়ার্ড কমপক্ষে ৬ অক্ষর দীর্ঘ হতে হবে!');
        return;
    }
    
    try {
        const user = firebase.auth().currentUser;
        if (!user) throw new Error('no-user');

        await user.updatePassword(newPass);

        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        showAlert('settingsAlert', 'success', '✅ পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!');
    } catch (error) {
        // Firebase নিরাপত্তার কারণে অনেক সময় পুরনো লগইন সেশনে পাসওয়ার্ড
        // পরিবর্তন করতে দেয় না — এই ক্ষেত্রে একবার লগ আউট করে আবার
        // লগইন করে তারপর চেষ্টা করুন।
        if (error.code === 'auth/requires-recent-login') {
            showAlert('settingsAlert', 'error', '❌ নিরাপত্তার জন্য আগে লগ আউট করে আবার লগইন করুন, তারপর পাসওয়ার্ড পরিবর্তন করুন।');
        } else {
            showAlert('settingsAlert', 'error', '❌ পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে!');
        }
    }
}

// পাসওয়ার্ড হ্যাশ করুন (আর ব্যবহার হয় না — পুরোনো কোডের সাথে সামঞ্জস্যের জন্য রাখা হয়েছে)
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ====== হেলপার ফাংশন ======

// সতর্কতা দেখান
function showAlert(elementId, type, message) {
    const alert = document.getElementById(elementId);
    alert.textContent = message;
    alert.className = `alert ${type}`;
    alert.style.display = 'block';
    
    // ৫ সেকেন্ড পর লুকান
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}
