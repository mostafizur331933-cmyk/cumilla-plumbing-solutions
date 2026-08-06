/**
 * Admin Database Management
 * ----------------------------------------------------
 * সমস্ত এডমিন ডেটা এখন দুই জায়গায় থাকে:
 *  ১) LocalStorage — তাৎক্ষণিক (instant) UI আপডেটের জন্য একটি লোকাল ক্যাশ
 *  ২) Firebase Firestore ("cloud") — আসল উৎস, যা থেকে সব ভিজিটরের
 *     ব্রাউজার একই ডেটা পড়ে। এটাই মূল পরিবর্তন যা পাবলিক ওয়েবসাইটে
 *     সবার জন্য একসাথে আপডেট আনবে।
 *
 * এই ফাইলের সব মেথডের নাম আগের মতোই আছে, তাই admin-dashboard.js-এ
 * কোনো পরিবর্তন লাগেনি — শুধু save() এখন ক্লাউডেও পাঠায়।
 */

class AdminDB {
    constructor() {
        this.dbKey = 'cumilla_plumbing_admin_data';
        this.docRef = firebase.firestore().collection('site').doc('data');
        this.initDefaultData();
    }

    // ডিফল্ট ডেটা শুরু করুন (শুধু লোকাল ক্যাশে, প্রথমবার)
    initDefaultData() {
        if (!localStorage.getItem(this.dbKey)) {
            const defaultData = {
                hero: {
                    title: 'কুমিল্লা প্লাম্বিং সলিউশনস',
                    description: 'দক্ষ ও অভিজ্ঞ প্লাম্বার — কুমিল্লা শহর ও আশেপাশের এলাকায় ২৪ ঘণ্টা সেবা।',
                    badge: 'আগে কাজ করে দিব, তারপর টাকা দিবেন'
                },
                videos: [
                    { id: 1, title: 'ভিডিও ১: বাথরুম ফিটিং কাজ', url: '', description: 'শীঘ্রই আসছে' },
                    { id: 2, title: 'ভিডিও ২: পাইপ লিকেজ মেরামত', url: '', description: 'শীঘ্রই আসছে' },
                    { id: 3, title: 'ভিডিও ৩: পানির ট্যাংক পরিষ্কার', url: '', description: 'শীঘ্রই আসছে' },
                    { id: 4, title: 'ভিডিও ৪: বেসিন ইনস্টলেশন', url: '', description: 'শীঘ্রই আসছে' },
                    { id: 5, title: 'ভিডিও ৫: মোটর সেটআপ', url: '', description: 'শীঘ্রই আসছে' },
                    { id: 6, title: 'ভিডিও ৬: নতুন বাসার প্লাম্বিং', url: '', description: 'শীঘ্রই আসছে' }
                ],
                services: [
                    { id: 1, icon: '🔧', name: 'পাইপ ইনস্টলেশন', description: 'আবাসিক এবং বাণিজ্যিক পাইপ ইনস্টলেশন সেবা' },
                    { id: 2, icon: '💧', name: 'লিকেজ মেরামত', description: 'দ্রুত এবং কার্যকর লিকেজ মেরামত' },
                    { id: 3, icon: '🚿', name: 'বাথরুম ফিটিং', description: 'আধুনিক বাথরুম ফিটিং ইনস্টলেশন' },
                    { id: 4, icon: '🚰', name: 'ট্যাংক পরিষ্কার', description: 'পানির ট্যাংক পরিষ্কার এবং রক্ষণাবেক্ষণ' }
                ],
                contact: {
                    phone: '01714700075',
                    whatsapp: '8801714700075',
                    facebook: 'https://www.facebook.com/share/1Bb2MhEzRe/',
                    email: ''
                },
                bookings: []
            };
            localStorage.setItem(this.dbKey, JSON.stringify(defaultData));
        }
    }

    /**
     * ক্লাউড (Firestore) থেকে সর্বশেষ ডেটা টেনে এনে লোকাল ক্যাশ আপডেট করুন।
     * এডমিন ড্যাশবোর্ড খোলার সময় এটি অবশ্যই await করে কল করতে হবে,
     * যাতে অন্য কোনো ডিভাইস থেকে করা পরিবর্তনও এখানে দেখা যায়।
     */
    async loadFromCloud() {
        try {
            const snap = await this.docRef.get();
            if (snap.exists) {
                localStorage.setItem(this.dbKey, JSON.stringify(snap.data()));
            } else {
                // প্রথমবার ব্যবহার — লোকাল ডিফল্ট ডেটা ক্লাউডে পাঠিয়ে দিন
                await this.docRef.set(this.getAllData());
            }
            this._notifySync(true, 'ক্লাউড থেকে সর্বশেষ ডেটা লোড হয়েছে');
        } catch (err) {
            console.error('ক্লাউড থেকে ডেটা লোড করতে সমস্যা হয়েছে:', err);
            this._notifySync(false, 'ক্লাউড থেকে ডেটা লোড ব্যর্থ — ইন্টারনেট/Firebase কনফিগ চেক করুন');
        }
    }

    // সমস্ত ডেটা পান (লোকাল ক্যাশ থেকে — তাৎক্ষণিক)
    getAllData() {
        const data = localStorage.getItem(this.dbKey);
        return data ? JSON.parse(data) : {};
    }

    // ডেটা সংরক্ষণ করুন — লোকাল ক্যাশ সাথে সাথে, ক্লাউডে ব্যাকগ্রাউন্ডে
    save(data) {
        localStorage.setItem(this.dbKey, JSON.stringify(data));
        this.docRef.set(data)
            .then(() => this._notifySync(true, 'ক্লাউডে সংরক্ষিত হয়েছে ✅ (সবাই এখন এই পরিবর্তন দেখবে)'))
            .catch(err => {
                console.error('ক্লাউডে সংরক্ষণ ব্যর্থ:', err);
                this._notifySync(false, 'ক্লাউডে সংরক্ষণ ব্যর্থ হয়েছে — ইন্টারনেট চেক করুন');
            });
        return true;
    }

    // ড্যাশবোর্ডে থাকলে সিঙ্ক-স্ট্যাটাস দেখান (id="cloudSyncStatus" থাকলে)
    _notifySync(success, message) {
        const el = document.getElementById('cloudSyncStatus');
        if (el) {
            el.textContent = message;
            el.style.color = success ? '#27ae60' : '#e74c3c';
        }
        console.log(message);
    }

    // হিরো কন্টেন্ট পান
    getHero() {
        return this.getAllData().hero || {};
    }

    // হিরো কন্টেন্ট সংরক্ষণ করুন
    saveHero(data) {
        const allData = this.getAllData();
        allData.hero = data;
        this.save(allData);
    }

    // সমস্ত ভিডিও পান
    getVideos() {
        return this.getAllData().videos || [];
    }

    // একটি ভিডিও যোগ করুন
    addVideo(video) {
        const allData = this.getAllData();
        const videos = allData.videos || [];
        video.id = Math.max(...videos.map(v => v.id), 0) + 1;
        videos.push(video);
        allData.videos = videos;
        this.save(allData);
        return video;
    }

    // ভিডিও আপডেট করুন
    updateVideo(id, video) {
        const allData = this.getAllData();
        const index = allData.videos.findIndex(v => v.id === id);
        if (index !== -1) {
            allData.videos[index] = { ...allData.videos[index], ...video };
            this.save(allData);
            return true;
        }
        return false;
    }

    // ভিডিও ডিলিট করুন
    deleteVideo(id) {
        const allData = this.getAllData();
        allData.videos = allData.videos.filter(v => v.id !== id);
        this.save(allData);
    }

    // সমস্ত সেবা পান
    getServices() {
        return this.getAllData().services || [];
    }

    // একটি সেবা যোগ করুন
    addService(service) {
        const allData = this.getAllData();
        const services = allData.services || [];
        service.id = Math.max(...services.map(s => s.id), 0) + 1;
        services.push(service);
        allData.services = services;
        this.save(allData);
        return service;
    }

    // সেবা আপডেট করুন
    updateService(id, service) {
        const allData = this.getAllData();
        const index = allData.services.findIndex(s => s.id === id);
        if (index !== -1) {
            allData.services[index] = { ...allData.services[index], ...service };
            this.save(allData);
            return true;
        }
        return false;
    }

    // সেবা ডিলিট করুন
    deleteService(id) {
        const allData = this.getAllData();
        allData.services = allData.services.filter(s => s.id !== id);
        this.save(allData);
    }

    // যোগাযোগ তথ্য পান
    getContact() {
        return this.getAllData().contact || {};
    }

    // যোগাযোগ তথ্য সংরক্ষণ করুন
    saveContact(data) {
        const allData = this.getAllData();
        allData.contact = data;
        this.save(allData);
    }

    // বুকিং যোগ করুন
    addBooking(booking) {
        const allData = this.getAllData();
        const bookings = allData.bookings || [];
        booking.id = Date.now();
        booking.date = new Date().toLocaleString('bn-BD');
        bookings.unshift(booking);
        allData.bookings = bookings;
        this.save(allData);
        return booking;
    }

    // সমস্ত বুকিং পান
    getBookings() {
        return this.getAllData().bookings || [];
    }

    // বুকিং ডিলিট করুন
    deleteBooking(id) {
        const allData = this.getAllData();
        allData.bookings = allData.bookings.filter(b => b.id !== id);
        this.save(allData);
    }

    // পুরো ডেটা রিসেট করুন (লোকাল ও ক্লাউড — দুই জায়গাতেই)
    reset() {
        localStorage.removeItem(this.dbKey);
        this.initDefaultData();
        this.save(this.getAllData());
    }

    // ডেটা এক্সপোর্ট করুন (JSON)
    export() {
        const data = this.getAllData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        return URL.createObjectURL(dataBlob);
    }
}

// গ্লোবাল ইনস্টেন্স তৈরি করুন
const db = new AdminDB();
