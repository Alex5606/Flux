import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase, ref, push, set, get, update, remove, onValue, off, onDisconnect, serverTimestamp, query, limitToLast, orderByChild, equalTo } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// ==================== FIREBASE CONFIG ====================
const firebaseConfig = {
    apiKey: "AIzaSyCr9Dejkc-LsxGPxZaY7UBiJ1LdZHlhaos",
    authDomain: "flux-messenger-9afab.firebaseapp.com",
    databaseURL: "https://flux-messenger-9afab-default-rtdb.firebaseio.com",
    projectId: "flux-messenger-9afab",
    storageBucket: "flux-messenger-9afab.firebasestorage.app",
    messagingSenderId: "268837058726",
    appId: "1:268837058726:web:ce018384e9b34a2a4edc67"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// ==================== STATE ====================
let currentUser = null;
let userData = null;
let currentChatId = null;
let currentChatUserId = null;
let allUsers = {};
let friends = {};
let friendRequests = {};
let sentRequests = {};
let chats = {};
let savedMessages = {};
let replyingTo = null;
let editingMessage = null;
let typingTimeout = null;
let activeCall = null;
let callTimer = null;
let callSeconds = 0;

// Unsubscribers
const unsubscribers = [];
let messagesUnsubscribe = null;
let typingUnsubscribe = null;

// Avatar colors
const avatarColors = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 'avatar-6', 'avatar-7'];

// Emojis
const emojiCategories = {
    smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '🤯', '😱', '🥵', '🥶', '😳', '🤪', '😵', '🥴', '😠', '😡', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'],
    gestures: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁', '👅', '👄'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '❤️‍🔥', '❤️‍🩹', '💑', '💏', '👨‍❤️‍👨', '👩‍❤️‍👩', '👨‍❤️‍👨'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊'],
    food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥕', '🌽', '🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫'],
    objects: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🎮', '🕹️', '🎲', '🧩', '♟️', '🎭', '🎨', '🎬', '🎤', '🎧', '🎸', '🎹', '🥁', '🎺', '🎻', '🪕', '🎷']
};

// ==================== DOM HELPERS ====================
const $ = id => document.getElementById(id);

function showToast(message, type = 'info') {
    const container = $('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) return 'Сегодня';
    if (d.toDateString() === yesterday.toDateString()) return 'Вчера';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function formatLastSeen(timestamp) {
    if (!timestamp) return 'Был(а) давно';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Онлайн';
    if (minutes < 5) return 'Был(а) только что';
    if (minutes < 60) return `Был(а) ${minutes} мин. назад`;
    if (hours < 24) return `Был(а) ${hours} ч. назад`;
    if (days < 7) return `Был(а) ${days} дн. назад`;
    return 'Был(а) давно';
}

function isOnline(user) {
    if (!user) return false;
    if (user.online === true) return true;
    if (!user.lastSeen) return false;
    // Consider online if lastSeen within 2 minutes
    return (Date.now() - user.lastSeen) < 120000;
}

function getErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'Этот email уже используется',
        'auth/invalid-email': 'Неверный формат email',
        'auth/weak-password': 'Пароль слишком слабый (мин. 6 символов)',
        'auth/user-not-found': 'Пользователь не найден',
        'auth/wrong-password': 'Неверный пароль',
        'auth/invalid-credential': 'Неверный email или пароль',
        'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
        'auth/network-request-failed': 'Ошибка сети. Проверьте подключение'
    };
    return messages[code] || 'Произошла ошибка';
}

// ==================== INIT ====================
function init() {
    loadTheme();
    loadNotificationSettings();
    setupAuthListeners();
    setupEventListeners();
    setupEmojiPicker();
    
    onAuthStateChanged(auth, async (user) => {
        $('loadingScreen').classList.add('hidden');
        
        if (user) {
            currentUser = user;
            await loadUserData();
            showAppScreen();
            setupPresence();
            subscribeToData();
            showToast(`Добро пожаловать, ${userData?.name || 'Пользователь'}!`, 'success');
        } else {
            currentUser = null;
            userData = null;
            showAuthScreen();
            unsubscribeAll();
        }
    });
}

// ==================== AUTH ====================
function setupAuthListeners() {
    $('showRegister').addEventListener('click', () => {
        $('loginForm').classList.add('hidden');
        $('registerForm').classList.remove('hidden');
    });
    
    $('showLogin').addEventListener('click', () => {
        $('registerForm').classList.add('hidden');
        $('loginForm').classList.remove('hidden');
    });
    
    $('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = $('loginEmail').value.trim();
        const password = $('loginPassword').value;
        
        if (!email || !password) {
            showToast('Заполните все поля', 'warning');
            return;
        }
        
        const btn = $('loginBtn');
        btn.classList.add('loading');
        btn.disabled = true;
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            showToast(getErrorMessage(error.code), 'error');
        }
        
        btn.classList.remove('loading');
        btn.disabled = false;
    });
    
    $('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = $('registerName').value.trim();
        const email = $('registerEmail').value.trim();
        const password = $('registerPassword').value;
        
        if (!name || !email || !password) {
            showToast('Заполните все поля', 'warning');
            return;
        }
        
        const btn = $('registerBtn');
        btn.classList.add('loading');
        btn.disabled = true;
        
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(cred.user, { displayName: name });
            
            const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
            
            await set(ref(database, `users/${cred.user.uid}`), {
                name,
                email,
                avatarColor,
                status: 'Привет! Я использую Flux',
                avatar: null,
                createdAt: serverTimestamp(),
                lastSeen: serverTimestamp(),
                online: true
            });
        } catch (error) {
            showToast(getErrorMessage(error.code), 'error');
        }
        
        btn.classList.remove('loading');
        btn.disabled = false;
    });
    
    $('logoutBtn').addEventListener('click', async () => {
        if (currentUser) {
            await update(ref(database, `users/${currentUser.uid}`), {
                online: false,
                lastSeen: serverTimestamp()
            });
        }
        await signOut(auth);
        showToast('Вы вышли из аккаунта', 'success');
    });
    
    // Toggle password visibility - FIXED
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.classList.add('show');
                } else {
                    input.type = 'password';
                    btn.classList.remove('show');
                }
            }
        });
    });
}

function showAuthScreen() {
    $('authScreen').classList.remove('hidden');
    $('appScreen').classList.add('hidden');
}

function showAppScreen() {
    $('authScreen').classList.add('hidden');
    $('appScreen').classList.remove('hidden');
    updateUserUI();
}

// ==================== USER DATA ====================
async function loadUserData() {
    if (!currentUser) return;
    
    const snapshot = await get(ref(database, `users/${currentUser.uid}`));
    if (snapshot.exists()) {
        userData = snapshot.val();
        await update(ref(database, `users/${currentUser.uid}`), {
            online: true,
            lastSeen: serverTimestamp()
        });
    }
}

function setupPresence() {
    if (!currentUser) return;
    
    const userRef = ref(database, `users/${currentUser.uid}`);
    const connectedRef = ref(database, '.info/connected');
    
    onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            update(userRef, { online: true, lastSeen: serverTimestamp() });
            onDisconnect(userRef).update({ online: false, lastSeen: serverTimestamp() });
        }
    });
    
    // Keep alive - update every 30 seconds
    setInterval(() => {
        if (currentUser) {
            update(ref(database, `users/${currentUser.uid}`), {
                online: true,
                lastSeen: serverTimestamp()
            });
        }
    }, 30000);
    
    // Update on visibility change
    document.addEventListener('visibilitychange', () => {
        if (currentUser) {
            update(ref(database, `users/${currentUser.uid}`), {
                online: !document.hidden,
                lastSeen: serverTimestamp()
            });
        }
    });
}

function updateUserUI() {
    if (!userData) return;
    
    const nav = $('navAvatar');
    if (userData.avatar) {
        nav.innerHTML = `<img src="${userData.avatar}" alt="">`;
    } else {
        nav.innerHTML = userData.name?.[0]?.toUpperCase() || '?';
        nav.className = `nav-avatar ${userData.avatarColor || 'avatar-2'}`;
    }
    
    loadSettings();
}

// ==================== DATA SUBSCRIPTIONS ====================
function subscribeToData() {
    subscribeToUsers();
    subscribeToFriends();
    subscribeToFriendRequests();
    subscribeToSentRequests();
    subscribeToChats();
    subscribeToSaved();
    subscribeToCalls();
}

function unsubscribeAll() {
    unsubscribers.forEach(fn => typeof fn === 'function' && fn());
    unsubscribers.length = 0;
    if (messagesUnsubscribe) messagesUnsubscribe();
    if (typingUnsubscribe) typingUnsubscribe();
}

function subscribeToUsers() {
    const usersRef = ref(database, 'users');
    const unsub = onValue(usersRef, (snapshot) => {
        allUsers = {};
        snapshot.forEach((child) => {
            allUsers[child.key] = { id: child.key, ...child.val() };
        });
        
        renderUsersList();
        updateChatsList();
        
        // Update current chat header and message avatars
        if (currentChatUserId && allUsers[currentChatUserId]) {
            updateChatHeader(currentChatUserId);
            updateMessageAvatars();
        }
    });
    unsubscribers.push(() => off(usersRef));
}

function subscribeToFriends() {
    if (!currentUser) return;
    const friendsRef = ref(database, `friends/${currentUser.uid}`);
    const unsub = onValue(friendsRef, (snapshot) => {
        friends = {};
        snapshot.forEach((child) => {
            friends[child.key] = child.val();
        });
        renderFriendsList('all');
        updateChatsList();
    });
    unsubscribers.push(() => off(friendsRef));
}

function subscribeToFriendRequests() {
    if (!currentUser) return;
    const requestsRef = ref(database, `friendRequests/${currentUser.uid}`);
    const unsub = onValue(requestsRef, (snapshot) => {
        friendRequests = {};
        snapshot.forEach((child) => {
            friendRequests[child.key] = child.val();
        });
        
        const count = Object.keys(friendRequests).length;
        const badge = $('requestsCount');
        const navBadge = $('friendsBadge');
        
        // Only show badge if count > 0
        if (count > 0) {
            if (badge) {
                badge.textContent = count;
                badge.classList.add('show');
            }
            if (navBadge) {
                navBadge.textContent = count;
                navBadge.classList.add('show');
            }
        } else {
            if (badge) {
                badge.textContent = '';
                badge.classList.remove('show');
            }
            if (navBadge) {
                navBadge.textContent = '';
                navBadge.classList.remove('show');
            }
        }
        
        if (document.querySelector('.panel-tab[data-friends-tab="requests"].active')) {
            renderFriendsList('requests');
        }
    });
    unsubscribers.push(() => off(requestsRef));
}

function subscribeToSentRequests() {
    if (!currentUser) return;
    const sentRef = ref(database, `sentRequests/${currentUser.uid}`);
    const unsub = onValue(sentRef, (snapshot) => {
        sentRequests = {};
        snapshot.forEach((child) => {
            sentRequests[child.key] = child.val();
        });
        renderUsersList();
    });
    unsubscribers.push(() => off(sentRef));
}

function subscribeToChats() {
    if (!currentUser) return;
    const chatsRef = ref(database, `userChats/${currentUser.uid}`);
    const unsub = onValue(chatsRef, (snapshot) => {
        chats = {};
        snapshot.forEach((child) => {
            chats[child.key] = child.val();
        });
        updateChatsList();
    });
    unsubscribers.push(() => off(chatsRef));
}

function subscribeToSaved() {
    if (!currentUser) return;
    const savedRef = ref(database, `saved/${currentUser.uid}`);
    const unsub = onValue(savedRef, (snapshot) => {
        savedMessages = {};
        snapshot.forEach((child) => {
            savedMessages[child.key] = { id: child.key, ...child.val() };
        });
        renderSavedMessages();
    });
    unsubscribers.push(() => off(savedRef));
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });
    
    $('navProfile').addEventListener('click', () => switchTab('settings'));
    
    // Friends tabs
    document.querySelectorAll('.panel-tab[data-friends-tab]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.panel-tab[data-friends-tab]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderFriendsList(tab.dataset.friendsTab);
        });
    });
    
    // Search
    let searchTimeout;
    $('searchUsers').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => searchUsers(e.target.value.trim()), 300);
    });
    
    $('searchChats').addEventListener('input', (e) => filterChats(e.target.value.trim()));
    
    // New chat button
    $('newChatBtn').addEventListener('click', () => switchTab('search'));
    
    // Chat
    $('backBtn').addEventListener('click', closeChat);
    $('sendBtn').addEventListener('click', sendMessage);
    
    $('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    $('messageInput').addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        sendTypingIndicator();
    });
    
    // Emoji
    $('emojiBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        $('emojiPicker').classList.toggle('hidden');
    });
    
    document.querySelectorAll('.emoji-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.emoji-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderEmojis(tab.dataset.category);
        });
    });
    
    // Files (15MB limit)
    $('attachBtn').addEventListener('click', () => $('fileInput').click());
    $('fileInput').addEventListener('change', handleFileSelect);
    $('avatarInput').addEventListener('change', handleAvatarUpload);
    
    // User profile view
    $('closeProfileBtn').addEventListener('click', closeProfileView);
    $('chatUserInfo').addEventListener('click', () => {
        if (currentChatUserId) showUserProfile(currentChatUserId);
    });
    
    $('profileMessageBtn').addEventListener('click', closeProfileView);
    $('profileCallBtn').addEventListener('click', () => {
        closeProfileView();
        startCall();
    });
    
    $('removeFriendBtn').addEventListener('click', () => {
        if (currentChatUserId) removeFriend(currentChatUserId);
    });
    
    $('blockUserBtn').addEventListener('click', () => {
        showToast('Функция блокировки в разработке', 'warning');
    });
    
    // Calls
    $('callBtn').addEventListener('click', startCall);
    $('videoCallBtn').addEventListener('click', startCall);
    $('endCallBtn').addEventListener('click', endCall);
    $('acceptCallBtn').addEventListener('click', acceptCall);
    $('declineCallBtn').addEventListener('click', declineCall);
    $('muteBtn').addEventListener('click', () => $('muteBtn').classList.toggle('active'));
    $('speakerBtn').addEventListener('click', () => $('speakerBtn').classList.toggle('active'));
    
    // Chat menu
    $('chatMenuBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        $('chatDropdownMenu').classList.toggle('show');
    });
    
    $('clearHistoryBtn').addEventListener('click', clearChatHistory);
    $('blockChatUserBtn').addEventListener('click', () => {
        $('chatDropdownMenu').classList.remove('show');
        showToast('Функция блокировки в разработке', 'warning');
    });
    
    // Settings
    $('saveProfileBtn').addEventListener('click', saveProfile);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });
    
    $('notifSound').addEventListener('change', saveNotificationSettings);
    $('notifCall').addEventListener('change', saveNotificationSettings);
    
    // Image viewer
    $('closeImageViewer').addEventListener('click', () => {
        $('imageViewer').classList.add('hidden');
    });
    
    // Close menus on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.emoji-picker') && !e.target.closest('.emoji-btn')) {
            $('emojiPicker').classList.add('hidden');
        }
        if (!e.target.closest('.dropdown')) {
            $('chatDropdownMenu').classList.remove('show');
        }
        if (!e.target.closest('.context-menu')) {
            $('messageContextMenu').classList.add('hidden');
        }
    });
}

// ==================== TABS ====================
function switchTab(tab) {
    document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tab);
    });
    
    document.querySelectorAll('.panel-content').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const panel = $(tab + 'Panel');
    if (panel) panel.classList.add('active');
    
    if (tab === 'settings') loadSettings();
    if (tab === 'saved') renderSavedMessages();
}

// ==================== USERS & FRIENDS ====================
function renderUsersList() {
    const search = $('searchUsers')?.value?.toLowerCase() || '';
    const list = Object.values(allUsers)
        .filter(u => u.id !== currentUser?.uid && u.name?.toLowerCase().includes(search));
    
    const container = $('searchResults');
    if (!container) return;
    
    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-panel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="M21 21l-4.35-4.35"></path>
                </svg>
                <p>${search ? 'Никого не найдено' : 'Введите имя для поиска'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = list.map(user => {
        const isFriend = friends[user.id];
        const hasPending = sentRequests[user.id];
        const online = isOnline(user);
        const statusText = online ? 'Онлайн' : formatLastSeen(user.lastSeen);
        
        return `
            <div class="list-item" data-user-id="${user.id}">
                <div class="item-avatar ${user.avatarColor || 'avatar-2'}">
                    ${user.avatar ? `<img src="${user.avatar}" alt="">` : (user.name?.[0]?.toUpperCase() || '?')}
                    ${online ? '<div class="online-indicator"></div>' : ''}
                </div>
                <div class="item-content">
                    <div class="item-name">${escapeHtml(user.name)}</div>
                    <div class="item-preview">${statusText}</div>
                </div>
                <div class="item-actions">
                    ${isFriend ? `
                        <button class="item-action-btn" data-action="chat" data-id="${user.id}" title="Написать">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                    ` : hasPending ? `
                        <span style="font-size: 12px; color: var(--text-light);">Запрос отправлен</span>
                    ` : `
                        <button class="item-action-btn success" data-action="add-friend" data-id="${user.id}" title="Добавить в друзья">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
    
    bindListItemEvents(container);
}

function searchUsers(query) {
    renderUsersList();
}

function renderFriendsList(tab) {
    let list = [];
    
    if (tab === 'requests') {
        list = Object.entries(friendRequests).map(([id, data]) => ({
            id,
            ...data,
            isRequest: true
        }));
    } else {
        list = Object.keys(friends).map(id => allUsers[id]).filter(Boolean);
        if (tab === 'online') {
            list = list.filter(u => isOnline(u));
        }
    }
    
    const container = $('friendsList');
    if (!container) return;
    
    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-panel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                </svg>
                <p>${tab === 'requests' ? 'Нет запросов' : 'Список пуст'}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = list.map(user => {
        if (user.isRequest) {
            return `
                <div class="list-item">
                    <div class="item-avatar ${user.fromAvatar || 'avatar-2'}">
                        ${user.fromAvatarUrl ? `<img src="${user.fromAvatarUrl}" alt="">` : (user.fromName?.[0]?.toUpperCase() || '?')}
                    </div>
                    <div class="item-content">
                        <div class="item-name">${escapeHtml(user.fromName)}</div>
                        <div class="item-preview">Хочет добавить вас в друзья</div>
                    </div>
                    <div class="item-actions">
                        <button class="item-action-btn success" data-action="accept" data-id="${user.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </button>
                        <button class="item-action-btn danger" data-action="decline" data-id="${user.id}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }
        
        const online = isOnline(user);
        const statusText = online ? 'Онлайн' : formatLastSeen(user.lastSeen);
        
        return `
            <div class="list-item" data-user-id="${user.id}">
                <div class="item-avatar ${user.avatarColor || 'avatar-2'}">
                    ${user.avatar ? `<img src="${user.avatar}" alt="">` : (user.name?.[0]?.toUpperCase() || '?')}
                    ${online ? '<div class="online-indicator"></div>' : ''}
                </div>
                <div class="item-content">
                    <div class="item-name">${escapeHtml(user.name)}</div>
                    <div class="item-preview">${statusText}</div>
                </div>
            </div>
        `;
    }).join('');
    
    bindListItemEvents(container);
}

function bindListItemEvents(container) {
    container.onclick = (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
            e.stopPropagation();
            const action = actionBtn.dataset.action;
            const id = actionBtn.dataset.id;
            
            switch (action) {
                case 'chat': openChat(id); break;
                case 'add-friend': sendFriendRequest(id); break;
                case 'accept': acceptFriendRequest(id); break;
                case 'decline': declineFriendRequest(id); break;
            }
            return;
        }
        
        const listItem = e.target.closest('.list-item[data-user-id]');
        if (listItem) {
            const userId = listItem.dataset.userId;
            if (friends[userId]) {
                openChat(userId);
            } else {
                showUserProfile(userId);
            }
        }
    };
}

async function sendFriendRequest(userId) {
    // Check if already sent
    if (sentRequests[userId]) {
        showToast('Запрос уже отправлен', 'warning');
        return;
    }
    
    // Check if already friends
    if (friends[userId]) {
        showToast('Вы уже друзья', 'warning');
        return;
    }
    
    try {
        // Add to their requests
        await set(ref(database, `friendRequests/${userId}/${currentUser.uid}`), {
            from: currentUser.uid,
            fromName: userData?.name || 'Пользователь',
            fromAvatar: userData?.avatarColor || 'avatar-2',
            fromAvatarUrl: userData?.avatar || null,
            timestamp: serverTimestamp()
        });
        
        // Track that we sent this request
        await set(ref(database, `sentRequests/${currentUser.uid}/${userId}`), {
            timestamp: serverTimestamp()
        });
        
        showToast('Запрос отправлен!', 'success');
    } catch (error) {
        showToast('Ошибка отправки', 'error');
    }
}

async function acceptFriendRequest(userId) {
    try {
        await set(ref(database, `friends/${currentUser.uid}/${userId}`), { addedAt: serverTimestamp() });
        await set(ref(database, `friends/${userId}/${currentUser.uid}`), { addedAt: serverTimestamp() });
        await remove(ref(database, `friendRequests/${currentUser.uid}/${userId}`));
        await remove(ref(database, `sentRequests/${userId}/${currentUser.uid}`));
        showToast('Друг добавлен!', 'success');
    } catch (error) {
        showToast('Ошибка', 'error');
    }
}

async function declineFriendRequest(userId) {
    try {
        await remove(ref(database, `friendRequests/${currentUser.uid}/${userId}`));
        await remove(ref(database, `sentRequests/${userId}/${currentUser.uid}`));
        showToast('Запрос отклонён', 'success');
    } catch (error) {
        console.error(error);
    }
}

async function removeFriend(userId) {
    try {
        await remove(ref(database, `friends/${currentUser.uid}/${userId}`));
        await remove(ref(database, `friends/${userId}/${currentUser.uid}`));
        showToast('Друг удалён', 'success');
        closeProfileView();
    } catch (error) {
        console.error(error);
    }
}

// ==================== SAVED MESSAGES ====================
function renderSavedMessages() {
    const list = Object.values(savedMessages);
    const container = $('savedList');
    if (!container) return;
    
    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-panel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>Нет сохранённых сообщений</p>
                <span>Нажмите на сообщение и выберите "В избранное"</span>
            </div>
        `;
        return;
    }
    
    container.innerHTML = list.map(msg => `
        <div class="list-item" data-saved-id="${msg.id}">
            <div class="item-avatar ${msg.avatarColor || 'avatar-2'}">
                ${msg.avatarUrl ? `<img src="${msg.avatarUrl}" alt="">` : (msg.username?.[0]?.toUpperCase() || '?')}
            </div>
            <div class="item-content">
                <div class="item-name">${escapeHtml(msg.username)}</div>
                <div class="item-preview">${escapeHtml(msg.text || '📷 Фото')}</div>
            </div>
            <button class="item-action-btn danger" data-action="remove-saved" data-id="${msg.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('');
    
    container.onclick = async (e) => {
        const actionBtn = e.target.closest('[data-action="remove-saved"]');
        if (actionBtn) {
            const id = actionBtn.dataset.id;
            await remove(ref(database, `saved/${currentUser.uid}/${id}`));
            showToast('Удалено из избранного', 'success');
        }
    };
}

// ==================== CHATS ====================
function updateChatsList() {
    const friendIds = Object.keys(friends);
    const container = $('chatsList');
    if (!container) return;
    
    if (friendIds.length === 0) {
        container.innerHTML = `
            <div class="empty-panel">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>Нет чатов</p>
                <span>Добавьте друзей, чтобы начать общение</span>
            </div>
        `;
        return;
    }
    
    const chatList = friendIds.map(id => {
        const user = allUsers[id];
        if (!user) return null;
        
        const chatInfo = chats[id] || {};
        
        return {
            id,
            user,
            lastMessage: chatInfo.lastMessage || '',
            lastTime: chatInfo.lastTime || 0,
            unread: chatInfo.unread || 0
        };
    }).filter(Boolean).sort((a, b) => b.lastTime - a.lastTime);
    
    container.innerHTML = chatList.map(chat => {
        const online = isOnline(chat.user);
        return `
            <div class="list-item ${currentChatUserId === chat.id ? 'active' : ''}" data-user-id="${chat.id}">
                <div class="item-avatar ${chat.user.avatarColor || 'avatar-2'}">
                    ${chat.user.avatar ? `<img src="${chat.user.avatar}" alt="">` : (chat.user.name?.[0]?.toUpperCase() || '?')}
                    ${online ? '<div class="online-indicator"></div>' : ''}
                </div>
                <div class="item-content">
                    <div class="item-header">
                        <div class="item-name">${escapeHtml(chat.user.name)}</div>
                        ${chat.lastTime ? `<div class="item-time">${formatTime(chat.lastTime)}</div>` : ''}
                    </div>
                    <div class="item-preview">${escapeHtml(chat.lastMessage) || 'Нет сообщений'}</div>
                </div>
                ${chat.unread > 0 ? `<div class="item-badge">${chat.unread}</div>` : ''}
            </div>
        `;
    }).join('');
    
    container.onclick = (e) => {
        const listItem = e.target.closest('.list-item[data-user-id]');
        if (listItem) {
            openChat(listItem.dataset.userId);
        }
    };
}

function filterChats(query) {
    const items = $('chatsList').querySelectorAll('.list-item');
    items.forEach(item => {
        const name = item.querySelector('.item-name')?.textContent?.toLowerCase() || '';
        item.style.display = name.includes(query.toLowerCase()) ? 'flex' : 'none';
    });
}

// ==================== CHAT ====================
function openChat(userId) {
    if (!userId) return;
    
    const user = allUsers[userId];
    if (!user) {
        showToast('Пользователь не найден', 'error');
        return;
    }
    
    currentChatId = getChatId(currentUser.uid, userId);
    currentChatUserId = userId;
    
    // UI
    $('mainEmpty').classList.add('hidden');
    $('userProfileView').classList.add('hidden');
    $('chatContainer').classList.remove('hidden');
    $('mainArea').classList.add('open');
    
    updateChatHeader(userId);
    
    // Clear unread
    update(ref(database, `userChats/${currentUser.uid}/${userId}`), { unread: 0 });
    
    subscribeToMessages();
    subscribeToTyping();
    updateChatsList();
}

function getChatId(id1, id2) {
    return [id1, id2].sort().join('_');
}

function updateChatHeader(userId) {
    const user = allUsers[userId];
    if (!user) return;
    
    const avatar = $('chatAvatar');
    if (user.avatar) {
        avatar.innerHTML = `<img src="${user.avatar}" alt="">`;
    } else {
        avatar.innerHTML = user.name?.[0]?.toUpperCase() || '?';
        avatar.className = `chat-avatar ${user.avatarColor || 'avatar-2'}`;
    }
    
    // Add online dot if online
    const online = isOnline(user);
    if (online) {
        if (!avatar.querySelector('.online-dot')) {
            avatar.insertAdjacentHTML('beforeend', '<div class="online-dot"></div>');
        }
    } else {
        const dot = avatar.querySelector('.online-dot');
        if (dot) dot.remove();
    }
    
    $('chatName').textContent = user.name;
    
    const statusEl = $('chatStatus');
    if (online) {
        statusEl.textContent = 'Онлайн';
        statusEl.className = 'chat-status online';
    } else {
        statusEl.textContent = formatLastSeen(user.lastSeen);
        statusEl.className = 'chat-status';
    }
}

// Update avatars in messages when user changes their avatar
function updateMessageAvatars() {
    const container = $('messagesList');
    if (!container) return;
    
    container.querySelectorAll('.message').forEach(msgEl => {
        const uid = msgEl.dataset.senderId;
        if (uid && allUsers[uid]) {
            const user = allUsers[uid];
            const avatarEl = msgEl.querySelector('.message-avatar');
            if (avatarEl) {
                if (user.avatar) {
                    avatarEl.innerHTML = `<img src="${user.avatar}" alt="">`;
                } else {
                    avatarEl.innerHTML = user.name?.[0]?.toUpperCase() || '?';
                    avatarEl.className = `message-avatar ${user.avatarColor || 'avatar-2'}`;
                }
            }
        }
    });
}

function closeChat() {
    $('mainArea').classList.remove('open');
    
    setTimeout(() => {
        $('chatContainer').classList.add('hidden');
        $('mainEmpty').classList.remove('hidden');
        currentChatId = null;
        currentChatUserId = null;
        updateChatsList();
    }, 300);
}

function subscribeToMessages() {
    if (messagesUnsubscribe) messagesUnsubscribe();
    
    const messagesRef = query(ref(database, `messages/${currentChatId}`), limitToLast(100));
    
    messagesUnsubscribe = onValue(messagesRef, (snapshot) => {
        const messages = [];
        snapshot.forEach((child) => {
            messages.push({ id: child.key, ...child.val() });
        });
        renderMessages(messages);
    });
}

function subscribeToTyping() {
    if (typingUnsubscribe) typingUnsubscribe();
    if (!currentChatUserId) return;
    
    const typingRef = ref(database, `typing/${currentChatId}/${currentChatUserId}`);
    
    typingUnsubscribe = onValue(typingRef, (snapshot) => {
        const indicator = $('typingIndicator');
        if (snapshot.exists() && snapshot.val().isTyping) {
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
        }
    });
}

function renderMessages(messages) {
    const container = $('messagesList');
    if (!container) return;
    
    let html = '';
    let lastDate = '';
    
    messages.forEach(msg => {
        const isOwn = msg.senderId === currentUser.uid;
        const user = allUsers[msg.senderId] || {};
        const msgDate = formatDate(msg.timestamp);
        
        // Date separator
        if (msgDate !== lastDate) {
            html += `<div class="messages-date"><span>${msgDate}</span></div>`;
            lastDate = msgDate;
        }
        
        // Reply
        let replyHtml = '';
        if (msg.replyTo) {
            replyHtml = `
                <div class="message-reply">
                    <div class="message-reply-name">${escapeHtml(msg.replyTo.senderName)}</div>
                    <div class="message-reply-text">${escapeHtml(msg.replyTo.text || '📷 Фото')}</div>
                </div>
            `;
        }
        
        // Content
        let content = '';
        if (msg.image) {
            content = `<img src="${msg.image}" class="message-image" onclick="viewImage('${msg.image}')" alt="Image">`;
        }
        if (msg.text) {
            content += `<div class="message-bubble">${escapeHtml(msg.text)}</div>`;
        }
        
        // Edited indicator
        const editedHtml = msg.edited ? '<span class="message-edited">(ред.)</span>' : '';
        
        html += `
            <div class="message ${isOwn ? 'own' : ''}" data-message-id="${msg.id}" data-sender-id="${msg.senderId}">
                ${!isOwn ? `
                    <div class="message-avatar ${user.avatarColor || 'avatar-2'}">
                        ${user.avatar ? `<img src="${user.avatar}" alt="">` : (user.name?.[0]?.toUpperCase() || '?')}
                    </div>
                ` : ''}
                <div class="message-content">
                    ${replyHtml}
                    ${content}
                    <div class="message-meta">
                        <span class="message-time">${formatTime(msg.timestamp)}</span>
                        ${editedHtml}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Scroll to bottom
    const area = $('messagesArea');
    area.scrollTop = area.scrollHeight;
    
    // Context menu for messages
    container.querySelectorAll('.message').forEach(msgEl => {
        msgEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const msgId = msgEl.dataset.messageId;
            const msg = messages.find(m => m.id === msgId);
            showContextMenu(e, msg, msgEl);
        });
        
        // Long press for mobile
        let longPressTimer;
        msgEl.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                const msgId = msgEl.dataset.messageId;
                const msg = messages.find(m => m.id === msgId);
                showContextMenu(e.touches[0], msg, msgEl);
            }, 500);
        }, { passive: true });
        
        msgEl.addEventListener('touchend', () => clearTimeout(longPressTimer));
        msgEl.addEventListener('touchmove', () => clearTimeout(longPressTimer));
    });
}

function showContextMenu(e, message, msgEl) {
    const menu = $('messageContextMenu');
    menu.classList.remove('hidden');
    
    const x = Math.min(e.clientX || e.pageX, window.innerWidth - 200);
    const y = Math.min(e.clientY || e.pageY, window.innerHeight - 250);
    
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    
    // Show edit/delete only for own messages
    const editBtn = menu.querySelector('[data-action="edit"]');
    const deleteBtn = menu.querySelector('[data-action="delete"]');
    if (editBtn) editBtn.style.display = message.senderId === currentUser.uid ? 'flex' : 'none';
    if (deleteBtn) deleteBtn.style.display = message.senderId === currentUser.uid ? 'flex' : 'none';
    
    // Remove old listeners
    const newMenu = menu.cloneNode(true);
    menu.parentNode.replaceChild(newMenu, menu);
    
    newMenu.querySelectorAll('.context-item').forEach(item => {
        item.addEventListener('click', () => {
            switch (item.dataset.action) {
                case 'reply':
                    setReplyTo(message);
                    break;
                case 'copy':
                    navigator.clipboard.writeText(message.text || '');
                    showToast('Скопировано!', 'success');
                    break;
                case 'edit':
                    startEditMessage(message);
                    break;
                case 'save':
                    saveToFavorites(message);
                    break;
                case 'forward':
                    showToast('Функция в разработке', 'warning');
                    break;
                case 'delete':
                    deleteMessage(message.id);
                    break;
            }
            newMenu.classList.add('hidden');
        });
    });
}

function setReplyTo(message) {
    const user = allUsers[message.senderId] || {};
    replyingTo = {
        id: message.id,
        senderId: message.senderId,
        senderName: user.name || 'Пользователь',
        text: message.text
    };
    
    // Remove edit bar if exists
    const editBar = document.querySelector('.edit-bar');
    if (editBar) editBar.remove();
    editingMessage = null;
    
    let replyBar = document.querySelector('.reply-bar');
    if (!replyBar) {
        replyBar = document.createElement('div');
        replyBar.className = 'reply-bar';
        const inputArea = document.querySelector('.message-input-area');
        inputArea.parentNode.insertBefore(replyBar, inputArea);
    }
    
    replyBar.innerHTML = `
        <div class="reply-bar-content">
            <div class="reply-bar-name">${escapeHtml(replyingTo.senderName)}</div>
            <div class="reply-bar-text">${escapeHtml(replyingTo.text || '📷 Фото')}</div>
        </div>
        <button class="reply-bar-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;
    
    replyBar.querySelector('.reply-bar-close').addEventListener('click', closeReplyBar);
    $('messageInput').focus();
}

function closeReplyBar() {
    replyingTo = null;
    const bar = document.querySelector('.reply-bar');
    if (bar) bar.remove();
}

function startEditMessage(message) {
    editingMessage = message;
    
    // Remove reply bar if exists
    closeReplyBar();
    
    let editBar = document.querySelector('.edit-bar');
    if (!editBar) {
        editBar = document.createElement('div');
        editBar.className = 'edit-bar';
        const inputArea = document.querySelector('.message-input-area');
        inputArea.parentNode.insertBefore(editBar, inputArea);
    }
    
    editBar.innerHTML = `
        <div class="edit-bar-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        </div>
        <div class="edit-bar-content">
            <div class="edit-bar-label">Редактирование</div>
            <div class="edit-bar-text">${escapeHtml(message.text || '')}</div>
        </div>
        <button class="edit-bar-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;
    
    editBar.querySelector('.edit-bar-close').addEventListener('click', closeEditBar);
    
    const input = $('messageInput');
    input.value = message.text || '';
    input.focus();
}

function closeEditBar() {
    editingMessage = null;
    $('messageInput').value = '';
    const bar = document.querySelector('.edit-bar');
    if (bar) bar.remove();
}

async function saveToFavorites(message) {
    try {
        const user = allUsers[message.senderId] || {};
        await set(ref(database, `saved/${currentUser.uid}/${message.id}`), {
            ...message,
            username: user.name || 'Пользователь',
            avatarColor: user.avatarColor,
            avatarUrl: user.avatar,
            savedAt: serverTimestamp()
        });
        showToast('Добавлено в избранное!', 'success');
    } catch (error) {
        showToast('Ошибка', 'error');
    }
}

async function deleteMessage(messageId) {
    if (!currentChatId) return;
    
    try {
        await remove(ref(database, `messages/${currentChatId}/${messageId}`));
        showToast('Сообщение удалено', 'success');
    } catch (error) {
        showToast('Ошибка удаления', 'error');
    }
}

function sendTypingIndicator() {
    if (!currentChatId) return;
    
    clearTimeout(typingTimeout);
    
    set(ref(database, `typing/${currentChatId}/${currentUser.uid}`), {
        isTyping: true,
        timestamp: serverTimestamp()
    });
    
    typingTimeout = setTimeout(() => {
        remove(ref(database, `typing/${currentChatId}/${currentUser.uid}`));
    }, 2000);
}

async function sendMessage() {
    const input = $('messageInput');
    const text = input.value.trim();
    
    if (!text || !currentChatId) return;
    
    // If editing
    if (editingMessage) {
        try {
            await update(ref(database, `messages/${currentChatId}/${editingMessage.id}`), {
                text,
                edited: true,
                editedAt: serverTimestamp()
            });
            closeEditBar();
            showToast('Сообщение изменено', 'success');
        } catch (error) {
            showToast('Ошибка', 'error');
        }
        return;
    }
    
    const messageData = {
        text,
        senderId: currentUser.uid,
        timestamp: serverTimestamp()
    };
    
    if (replyingTo) {
        messageData.replyTo = replyingTo;
        closeReplyBar();
    }
    
    try {
        await push(ref(database, `messages/${currentChatId}`), messageData);
        
        input.value = '';
        input.style.height = 'auto';
        
        // Update chat info
        const chatUpdate = {
            lastMessage: text.substring(0, 50),
            lastTime: Date.now()
        };
        
        await update(ref(database, `userChats/${currentUser.uid}/${currentChatUserId}`), chatUpdate);
        
        // Update unread for other user
        const otherChatRef = ref(database, `userChats/${currentChatUserId}/${currentUser.uid}`);
        const otherSnap = await get(otherChatRef);
        const currentUnread = otherSnap.exists() ? (otherSnap.val().unread || 0) : 0;
        
        await update(otherChatRef, {
            ...chatUpdate,
            unread: currentUnread + 1
        });
        
        remove(ref(database, `typing/${currentChatId}/${currentUser.uid}`));
    } catch (error) {
        console.error(error);
        showToast('Ошибка отправки', 'error');
    }
}

async function sendImage(base64) {
    if (!currentChatId) return;
    
    try {
        await push(ref(database, `messages/${currentChatId}`), {
            image: base64,
            senderId: currentUser.uid,
            timestamp: serverTimestamp()
        });
        
        const chatUpdate = {
            lastMessage: '📷 Фото',
            lastTime: Date.now()
        };
        
        await update(ref(database, `userChats/${currentUser.uid}/${currentChatUserId}`), chatUpdate);
        await update(ref(database, `userChats/${currentChatUserId}/${currentUser.uid}`), chatUpdate);
        
        showToast('Фото отправлено', 'success');
    } catch (error) {
        showToast('Ошибка отправки', 'error');
    }
}

// File handling with 15MB limit
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Поддерживаются только изображения', 'warning');
        return;
    }
    
    // 15MB limit
    if (file.size > 15 * 1024 * 1024) {
        showToast('Максимальный размер файла: 15MB', 'warning');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => sendImage(event.target.result);
    reader.readAsDataURL(file);
    
    e.target.value = '';
}

async function clearChatHistory() {
    if (!currentChatId) return;
    
    $('chatDropdownMenu').classList.remove('show');
    
    if (confirm('Вы уверены, что хотите очистить историю чата?')) {
        try {
            await remove(ref(database, `messages/${currentChatId}`));
            await update(ref(database, `userChats/${currentUser.uid}/${currentChatUserId}`), {
                lastMessage: '',
                lastTime: Date.now()
            });
            showToast('История очищена', 'success');
        } catch (error) {
            showToast('Ошибка', 'error');
        }
    }
}

// Image viewer
window.viewImage = (src) => {
    $('viewerImage').src = src;
    $('imageViewer').classList.remove('hidden');
};

// ==================== USER PROFILE ====================
function showUserProfile(userId) {
    const user = allUsers[userId];
    if (!user) return;
    
    currentChatUserId = userId;
    
    $('chatContainer').classList.add('hidden');
    $('mainEmpty').classList.add('hidden');
    $('userProfileView').classList.remove('hidden');
    
    const avatar = $('viewProfileAvatar');
    if (user.avatar) {
        avatar.innerHTML = `<img src="${user.avatar}" alt="">`;
    } else {
        avatar.innerHTML = user.name?.[0]?.toUpperCase() || '?';
        avatar.className = `profile-avatar-xl ${user.avatarColor || 'avatar-2'}`;
    }
    
    $('viewProfileName').textContent = user.name;
    
    const online = isOnline(user);
    const status = $('viewProfileStatus');
    if (online) {
        status.textContent = 'Онлайн';
        status.className = 'status';
    } else {
        status.textContent = formatLastSeen(user.lastSeen);
        status.className = 'status offline';
    }
    
    $('viewProfileEmail').textContent = user.email || 'Скрыто';
    $('viewProfileBio').textContent = user.status || 'Привет! Я использую Flux';
    
    const createdAt = user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }) 
        : 'Неизвестно';
    $('viewProfileJoined').textContent = createdAt;
    
    $('removeFriendBtn').classList.toggle('hidden', !friends[userId]);
}

function closeProfileView() {
    $('userProfileView').classList.add('hidden');
    
    if (currentChatId) {
        $('chatContainer').classList.remove('hidden');
    } else {
        $('mainEmpty').classList.remove('hidden');
    }
}

// ==================== CALLS ====================
function subscribeToCalls() {
    if (!currentUser) return;
    
    const callsRef = ref(database, `calls/${currentUser.uid}`);
    const unsub = onValue(callsRef, (snapshot) => {
        if (!snapshot.exists()) {
            if (activeCall) {
                endCall(true);
            }
            return;
        }
        
        const data = snapshot.val();
        
        if (data.status === 'incoming' && !activeCall) {
            showIncomingCall(data);
        } else if (data.status === 'accepted' && activeCall) {
            $('callStatusText').textContent = 'Соединено';
            startCallTimer();
        } else if (data.status === 'ended') {
            endCall(true);
        }
    });
    
    unsubscribers.push(() => off(callsRef));
}

async function startCall() {
    if (!currentChatUserId) {
        showToast('Выберите собеседника', 'warning');
        return;
    }
    
    const user = allUsers[currentChatUserId];
    if (!user) return;
    
    if (!isOnline(user)) {
        showToast('Пользователь не в сети', 'warning');
        return;
    }
    
    activeCall = { partnerId: currentChatUserId, role: 'caller' };
    
    // Show call modal
    const avatar = $('callAvatar');
    if (user.avatar) {
        avatar.innerHTML = `<img src="${user.avatar}" alt="">`;
    } else {
        avatar.innerHTML = user.name?.[0]?.toUpperCase() || '?';
        avatar.className = `call-avatar ${user.avatarColor || 'avatar-2'}`;
    }
    
    $('callName').textContent = user.name;
    $('callStatusText').textContent = 'Вызов...';
    $('callTimer').classList.add('hidden');
    $('callModal').classList.remove('hidden');
    
    try {
        // Signal to partner
        await set(ref(database, `calls/${currentChatUserId}`), {
            from: currentUser.uid,
            fromName: userData?.name,
            fromAvatar: userData?.avatarColor,
            fromAvatarUrl: userData?.avatar,
            status: 'incoming',
            timestamp: serverTimestamp()
        });
        
        // Own record
        await set(ref(database, `calls/${currentUser.uid}`), {
            to: currentChatUserId,
            status: 'calling',
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error(error);
        showToast('Ошибка звонка', 'error');
        endCall();
    }
}

function showIncomingCall(data) {
    activeCall = { partnerId: data.from, role: 'receiver', data };
    
    const avatar = $('incomingAvatar');
    if (data.fromAvatarUrl) {
        avatar.innerHTML = `<img src="${data.fromAvatarUrl}" alt="">`;
    } else {
        avatar.innerHTML = data.fromName?.[0]?.toUpperCase() || '?';
        avatar.className = `incoming-avatar ${data.fromAvatar || 'avatar-2'}`;
    }
    
    $('incomingName').textContent = data.fromName || 'Неизвестный';
    $('incomingType').textContent = 'Входящий звонок...';
    $('incomingCall').classList.remove('hidden');
    
    // Play ringtone
    try {
        const audio = $('callSound');
        if (audio) audio.play();
    } catch (e) {}
}

async function acceptCall() {
    if (!activeCall) return;
    
    // Stop ringtone
    try {
        const audio = $('callSound');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    } catch (e) {}
    
    $('incomingCall').classList.add('hidden');
    
    const partnerId = activeCall.partnerId;
    const user = allUsers[partnerId];
    
    // Show call modal
    const avatar = $('callAvatar');
    if (user?.avatar) {
        avatar.innerHTML = `<img src="${user.avatar}" alt="">`;
    } else {
        avatar.innerHTML = user?.name?.[0]?.toUpperCase() || '?';
        avatar.className = `call-avatar ${user?.avatarColor || 'avatar-2'}`;
    }
    
    $('callName').textContent = user?.name || 'Пользователь';
    $('callStatusText').textContent = 'Соединение...';
    $('callModal').classList.remove('hidden');
    
    try {
        await update(ref(database, `calls/${currentUser.uid}`), { status: 'accepted' });
        await update(ref(database, `calls/${partnerId}`), { status: 'accepted' });
        
        startCallTimer();
    } catch (error) {
        console.error(error);
        endCall();
    }
}

async function declineCall() {
    // Stop ringtone
    try {
        const audio = $('callSound');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    } catch (e) {}
    
    $('incomingCall').classList.add('hidden');
    
    if (activeCall) {
        try {
            await update(ref(database, `calls/${activeCall.partnerId}`), { status: 'ended' });
            await remove(ref(database, `calls/${currentUser.uid}`));
        } catch (e) {}
    }
    
    activeCall = null;
}

async function endCall(remote = false) {
    // Stop timer
    if (callTimer) {
        clearInterval(callTimer);
        callTimer = null;
    }
    
    // Stop ringtone
    try {
        const audio = $('callSound');
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    } catch (e) {}
    
    $('callModal').classList.add('hidden');
    $('incomingCall').classList.add('hidden');
    
    if (!remote && activeCall) {
        try {
            await update(ref(database, `calls/${activeCall.partnerId}`), { status: 'ended' });
        } catch (e) {}
    }
    
    try {
        await remove(ref(database, `calls/${currentUser.uid}`));
    } catch (e) {}
    
    if (!remote && callSeconds > 0) {
        showToast(`Звонок завершён (${formatCallTime(callSeconds)})`, 'success');
    }
    
    callSeconds = 0;
    activeCall = null;
}

function startCallTimer() {
    callSeconds = 0;
    $('callTimer').classList.remove('hidden');
    $('callTimer').textContent = '00:00';
    $('callStatusText').textContent = 'В разговоре';
    
    if (callTimer) clearInterval(callTimer);
    
    callTimer = setInterval(() => {
        callSeconds++;
        $('callTimer').textContent = formatCallTime(callSeconds);
    }, 1000);
}

function formatCallTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

// ==================== SETTINGS ====================
function loadSettings() {
    if (!userData) return;
    
    $('settingsName').value = userData.name || '';
    $('settingsStatus').value = userData.status || '';
    $('profileNameDisplay').textContent = userData.name || 'Пользователь';
    $('profileStatusDisplay').textContent = 'Онлайн';
    
    const avatar = $('profileAvatarLarge');
    if (userData.avatar) {
        avatar.innerHTML = `<img src="${userData.avatar}" alt="">`;
    } else {
        avatar.innerHTML = userData.name?.[0]?.toUpperCase() || '?';
        avatar.className = `profile-avatar-large ${userData.avatarColor || 'avatar-2'}`;
    }
}

async function saveProfile() {
    const name = $('settingsName').value.trim();
    const status = $('settingsStatus').value.trim();
    
    if (!name) {
        showToast('Имя не может быть пустым', 'warning');
        return;
    }
    
    try {
        await update(ref(database, `users/${currentUser.uid}`), { name, status });
        userData = { ...userData, name, status };
        $('profileNameDisplay').textContent = name;
        updateUserUI();
        showToast('Профиль сохранён!', 'success');
    } catch (error) {
        showToast('Ошибка сохранения', 'error');
    }
}

async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('Выберите изображение', 'warning');
        return;
    }
    
    // 5MB for avatar
    if (file.size > 5 * 1024 * 1024) {
        showToast('Максимальный размер: 5MB', 'warning');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            await update(ref(database, `users/${currentUser.uid}`), {
                avatar: event.target.result
            });
            userData = { ...userData, avatar: event.target.result };
            
            const avatar = $('profileAvatarLarge');
            avatar.innerHTML = `<img src="${event.target.result}" alt="">`;
            
            updateUserUI();
            showToast('Аватар обновлён!', 'success');
        } catch (error) {
            showToast('Ошибка загрузки', 'error');
        }
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('flux-theme', theme);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

function loadTheme() {
    const theme = localStorage.getItem('flux-theme') || 'light';
    setTheme(theme);
}

function loadNotificationSettings() {
    const sound = localStorage.getItem('flux-notif-sound') !== 'false';
    const call = localStorage.getItem('flux-notif-call') !== 'false';
    
    if ($('notifSound')) $('notifSound').checked = sound;
    if ($('notifCall')) $('notifCall').checked = call;
}

function saveNotificationSettings() {
    localStorage.setItem('flux-notif-sound', $('notifSound').checked);
    localStorage.setItem('flux-notif-call', $('notifCall').checked);
}

// ==================== EMOJI PICKER ====================
function setupEmojiPicker() {
    renderEmojis('smileys');
}

function renderEmojis(category) {
    const emojis = emojiCategories[category] || emojiCategories.smileys;
    const grid = $('emojiGrid');
    
    grid.innerHTML = emojis.map(emoji => 
        `<button type="button">${emoji}</button>`
    ).join('');
    
    grid.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = $('messageInput');
            input.value += btn.textContent;
            input.focus();
        });
    });
}

// ==================== START APP ====================
init();
