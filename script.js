/* ============================================================
   --- APP INITIALIZATION & VARIABLES ---
   ============================================================ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(() => console.log("SW Active"));
    });
}

const audio = document.getElementById('main-audio');
const playerScreen = document.getElementById('player-screen');
const mainImg = document.getElementById('song-image'); 
const defaultImg = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300";

/* ================= PLAYLIST PERSISTENCE ================= */

/* ================= PLAYLIST PERSISTENCE ================= */

// Load saved playlist OR fallback to default
const savedPlaylist = JSON.parse(localStorage.getItem('appPlaylist'));

let playlist = savedPlaylist && savedPlaylist.length
    ? savedPlaylist
    : [
        { "name": "APSARA", "artist": "Billa sonipat aala", "url": "music/Apsara.mp3", "img": "https://files.catbox.moe/qrgvpq.webp" },
        { "name": "Yaran gail", "artist": "Billa sonipat aala", "url": "music/Yaaran Gail.mp3", "img": "https://files.catbox.moe/iswwju.jpeg" },
        { "name": "AZUL", "artist": "Guru Randhawa", "url": "music/Azul Lavish Dhiman 320 Kbps.mp3", "img": "https://files.catbox.moe/85n1j0.jpeg" },
        { "name": "Pan india", "artist": "Guru randhawa", "url": "music/PAN INDIA - Guru Randhawa.mp3", "img": "https://files.catbox.moe/uzltk5.jpeg" },
        { "name": "Perfect", "artist": "Guru randhawa", "url": "music/Perfect.mp3", "img": "https://files.catbox.moe/k6emom.webp" }
      ];

function savePlaylistToDisk() {
    localStorage.setItem('appPlaylist', JSON.stringify(playlist));
}
let currentIndex = 0;
let startY = 0;
let isDragging = false;
let searchOpen = false;
let selectedMenuIndex = null;

/* ================= FEATURE: ADAPTIVE COLOR (PLAYER) ================= */
/**
 * Gaane ki photo se rang nikal kar player ka background badalne ke liye
 */
function updatePlayerAdaptiveColor(imgSrc) {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Security bypass
    img.src = imgSrc; // <--- YE RAHI IMG.SRC WALI LINE
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1; canvas.height = 1;
        
        // 1x1 pixel draw karke average color nikalna
        ctx.drawImage(img, 0, 0, 1, 1);
        const d = ctx.getImageData(0,0,1,1).data;
        const rgb = `rgb(${d[0]},${d[1]},${d[2]})`;
        
        // CSS Variable update
        document.documentElement.style.setProperty('--bg-color', rgb);
        
        // Player Screen par gradient apply
        const pScreen = document.getElementById('player-screen');
        if(pScreen) {
            pScreen.style.background = `linear-gradient(to bottom, ${rgb} 0%, #121212 100%)`;
        }
    };
}



/* ================= FEATURE: GALLERY COVER CHANGE ================= */
const coverUpload = document.getElementById('cover-upload');
if(coverUpload) {
    coverUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && mainImg) {
            const r = new FileReader();
            r.onload = (ev) => {
                mainImg.src = ev.target.result;
                const miniImg = document.getElementById('mini-img');
                if(miniImg) miniImg.src = ev.target.result;
                playlist[currentIndex].img = ev.target.result;
savePlaylistToDisk();
                renderPlaylist();
                const sideMenu = document.getElementById('side-menu');
                if(sideMenu) sideMenu.style.display = 'none';
            };
            r.readAsDataURL(file);
        }
    });
}

/* ================= GESTURE & MINIMIZE LOGIC ================= */
if(playerScreen) {
    playerScreen.addEventListener('touchstart', (e) => {
        if (e.touches[0].clientY < window.innerHeight / 2) {
            startY = e.touches[0].clientY;
            isDragging = true;
            playerScreen.style.transition = 'none';
        }
    }, { passive: true });

    playerScreen.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        let diff = e.touches[0].clientY - startY;
        if (diff > 0) {
            let scaleValue = 1 - (diff / (window.innerHeight * 2));
            let opacityValue = 1 - (diff / window.innerHeight);
            window.requestAnimationFrame(() => {
                playerScreen.style.transform = `translateY(${diff}px) scale(${scaleValue})`;
                playerScreen.style.opacity = opacityValue;
            });
        }
    }, { passive: true });

    playerScreen.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        let diff = e.changedTouches[0].clientY - startY;
        playerScreen.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'; 
        if (diff > 150) minimizePlayer(); else maximizePlayer();
    });
}

function minimizePlayer() { 
    if(!playerScreen) return;
    playerScreen.classList.add('minimized'); 
    playerScreen.style.transform = 'translateY(100%) scale(0.5)';
    playerScreen.style.opacity = '0';
    playerScreen.style.pointerEvents = 'none';
    const mini = document.getElementById('mini-player');
    if(mini) {
        mini.classList.remove('hidden');
        mini.style.opacity = '1';
    }
    setTimeout(() => { if(playerScreen.classList.contains('minimized')) playerScreen.style.display = 'none'; }, 400); 
}

function maximizePlayer() { 
    if(!playerScreen) return;
    playerScreen.style.display = 'flex';
    setTimeout(() => {
        playerScreen.classList.remove('minimized'); 
        playerScreen.style.transform = 'translateY(0) scale(1)';
        playerScreen.style.opacity = '1';
        playerScreen.style.pointerEvents = 'auto';
    }, 10);
    const mini = document.getElementById('mini-player');
    if(mini) mini.classList.add('hidden');
}

/* ================= CORE PLAYER LOGIC ================= */
function loadSong(index) {
    currentIndex = index;
    const s = playlist[index];
    if(audio) audio.src = s.url;
    /* ================= FEATURE: AUTO-PLAY NEXT ================= */

if (audio) {
    // Jab gaana poora khatam ho jaye
    audio.onended = () => {
        console.log("Song ended, playing next...");
        
        // Agar tumne 'Repeat' feature abhi nahi banaya hai, 
        // toh ye seedha agla gaana chala dega
        nextSong(); 
        
        // Browser safety: gaana load hone ke baad play trigger karna
        audio.play().catch(e => console.log("Auto-play blocked by browser, click play."));
    };
}

    
    // UI Update karo
    document.getElementById('player-title').innerText = s.name;
    document.getElementById('player-artist').innerText = s.artist;
    document.getElementById('mini-title').innerText = s.name;
    document.getElementById('mini-artist').innerText = s.artist;
    
    // Photo update karo
    if(mainImg) mainImg.src = s.img || defaultImg;
    const miniImg = document.getElementById('mini-img');
    if(miniImg) miniImg.src = s.img || defaultImg;
    
    // --- YE RAHI WOH LINE JO PLAYER KA COLOR BADLEGI ---
    updatePlayerAdaptiveColor(s.img || defaultImg); 
    
    renderPlaylist();
    updateMediaSession(s);
}


function togglePlay() { 
    if(!audio) return;
    if(audio.paused) { audio.play(); updatePlayIcons(true); } 
    else { audio.pause(); updatePlayIcons(false); } 
}

function updatePlayIcons(isPlaying) { 
    const iconClass = isPlaying ? 'fa-pause' : 'fa-play'; 
    const playBtn = document.getElementById('play-btn');
    const miniPlayBtn = document.getElementById('mini-play-btn');
    if(playBtn) playBtn.className = `fas ${iconClass}`; 
    if(miniPlayBtn) miniPlayBtn.className = `fas ${iconClass}`; 
}

function nextSong() { currentIndex = (currentIndex + 1) % playlist.length; loadSong(currentIndex); if(audio) audio.play(); updatePlayIcons(true); }
function prevSong() { currentIndex = (currentIndex - 1 + playlist.length) % playlist.length; loadSong(currentIndex); if(audio) audio.play(); updatePlayIcons(true); }

async function renderPlaylist() {
    const container = document.getElementById('song-list-container');
    if(!container) return;
    const cache = await caches.open('apple-music-v2');
    const isOffline = !navigator.onLine;
    container.innerHTML = "";
    for (let index = 0; index < playlist.length; index++) {
        const song = playlist[index];
        const div = document.createElement('div');
        div.className = "song-item";
        const isCached = await cache.match(song.url);
        if (isOffline && !isCached) { div.style.opacity = "0.3"; div.style.pointerEvents = "none"; }
        div.innerHTML = `
            <div class="song-info-container" onclick="loadSong(${index}); maximizePlayer(); if(audio) audio.play(); updatePlayIcons(true);">
                <img src="${song.img || defaultImg}">
                <div><h4>${song.name}</h4><p>${song.artist}</p></div>
            </div>
            <div class="song-menu-btn" onclick="event.stopPropagation(); openSongMenu(event, ${index})"><i class="fas fa-ellipsis-v"></i></div>`;
        container.appendChild(div);
    }
}

if(audio) {
    audio.ontimeupdate = () => {
        if(audio.duration) {
            const seekBar = document.getElementById('seek-bar');
            if(seekBar) seekBar.value = (audio.currentTime / audio.duration) * 100;
            document.getElementById('current').innerText = formatTime(audio.currentTime);
            document.getElementById('duration').innerText = formatTime(audio.duration);
        }
    };
}

function formatTime(s) { let m = Math.floor(s / 60), sc = Math.floor(s % 60); return `${m}:${sc < 10 ? '0' + sc : sc}`; }

function seekSong() { if (audio && audio.duration) audio.currentTime = (document.getElementById('seek-bar').value / 100) * audio.duration; }

function updateMediaSession(song) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
        title: song.name, artist: song.artist,
        artwork: [{ src: song.img || defaultImg, sizes: '512x512', type: 'image/png' }]
    });
    navigator.mediaSession.setActionHandler('play', () => { if(audio) audio.play(); updatePlayIcons(true); });
    navigator.mediaSession.setActionHandler('pause', () => { if(audio) audio.pause(); updatePlayIcons(false); });
    navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevSong());
}

/* ================= NAVIGATION & SEARCH LOGIC ================= */
function switchTab(tabName) {
    closeSearchStack();
    document.querySelectorAll('.tab-content').forEach(screen => screen.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    if (tabName === 'home') {
        document.getElementById('home-screen').style.display = 'block';
        document.getElementById('tab-home').classList.add('active');
    } else if (tabName === 'library') {
        document.getElementById('library-screen').style.display = 'block';
        document.getElementById('tab-library').classList.add('active');
    } else if (tabName === 'all-songs') {
        document.getElementById('playlist-screen').style.display = 'block';
        document.getElementById('tab-browse').classList.add('active');
    }
}

function openSearchStack() {
    const tabStack = document.getElementById('tab-stack');
    const searchStack = document.getElementById('search-stack');
    if(tabStack) tabStack.style.display = 'none';
    if(searchStack) { searchStack.style.display = 'flex'; searchStack.style.opacity = '1'; }
    searchOpen = true;
    
    setTimeout(() => {
        const input = document.getElementById('app-search-input');
        if(input) input.focus();
    }, 150);
}

function closeSearchStack() {
    const sStack = document.getElementById('search-stack');
    const tStack = document.getElementById('tab-stack');
    const mainList = document.getElementById('song-list-container');
    const results = document.getElementById('global-search-results');

    if (sStack) sStack.style.display = 'none';
    if (tStack) tStack.style.display = 'flex';
    if (mainList) mainList.style.display = 'block';
    if (results) { results.innerHTML = ""; results.style.display = 'none'; }
    
    const input = document.getElementById('app-search-input');
    if (input) input.value = "";
    searchOpen = false;
}

function filterSongs() {
    const termInput = document.getElementById('app-search-input');
    if (!termInput) return;
    const term = termInput.value.trim().toLowerCase();

    const mainList = document.getElementById('song-list-container');
    const playlistList = document.getElementById('playlist-songs-list');
    const resultsArea = document.getElementById('global-search-results');
    
    const isInsidePlaylist = playlistList && playlistList.innerHTML !== "";

    if (isInsidePlaylist) {
        const songItems = playlistList.querySelectorAll('.song-item');
        songItems.forEach(item => {
            const title = item.querySelector('h4').innerText.toLowerCase();
            item.style.display = title.includes(term) ? 'flex' : 'none';
        });
    } else {
        if (term.length > 0) {
            if (mainList) mainList.style.display = 'none'; 
            if (resultsArea) {
                resultsArea.style.display = 'block';
                renderGlobalSearch(term); 
            }
        } else {
            if (mainList) mainList.style.display = 'block';
            if (resultsArea) { resultsArea.innerHTML = ""; resultsArea.style.display = 'none'; }
        }
    }
}



// Any where click logic
document.addEventListener('click', (e) => {
    const searchStack = document.getElementById('search-stack');
    const searchTrigger = document.querySelector('.search-trigger-icon');
    if (searchOpen && searchStack && !searchStack.contains(e.target) && !searchTrigger.contains(e.target)) {
        closeSearchStack();
    }
});

/* ================= UI OVERLAYS & MENU ================= */
function openForm() { const form = document.getElementById('add-music-form'); if(form) form.style.display = 'block'; }
function closeForm() { const form = document.getElementById('add-music-form'); if(form) form.style.display = 'none'; }
function toggleMenu() { 
    const m = document.getElementById('side-menu'); 
    if(m) m.style.display = (m.style.display === 'block') ? 'none' : 'block'; 
}

function openSongMenu(e, index) {
    if (e.stopPropagation) e.stopPropagation();
    selectedMenuIndex = index;
    const menu = document.getElementById('song-options-menu');
    if (!menu) return;
    menu.style.display = 'block';
    updateDownloadButtonUI(); 
    let x = e.clientX - 170, y = e.clientY;
    if (y + 150 > window.innerHeight) y -= 130;
    if (x < 10) x = 10;
    menu.style.left = x + "px"; menu.style.top = y + "px";
    
    const closeListener = (event) => {
        if (!menu.contains(event.target)) { menu.style.display = 'none'; document.removeEventListener('click', closeListener); }
    };
    setTimeout(() => document.addEventListener('click', closeListener), 10);
}

async function updateDownloadButtonUI() {
    const song = playlist[selectedMenuIndex]; 
    const cache = await caches.open('apple-music-v2');
    const isCached = await cache.match(song.url);
    const btn = document.getElementById('download-toggle-btn');
    if (btn) {
        if (isCached) {
            btn.innerHTML = `<i class="fas fa-trash"></i> Remove Download`;
            btn.style.color = "#ff453a"; 
        } else {
            btn.innerHTML = `<i class="fas fa-arrow-down"></i> Download`;
            btn.style.color = "white";
        }
    }
}

/* ================= FEATURE: BACKGROUND DOWNLOAD ================= */
async function handleDownload() {
    // 1. Current gaana aur cache folder ki detail lo
    const song = playlist[selectedMenuIndex];
    const cache = await caches.open('apple-music-v2');
    const isCached = await cache.match(song.url);

    if (isCached) {
        // Agar pehle se hai toh delete kar do
        await cache.delete(song.url);
        alert("Gana remove ho gaya!");
        renderPlaylist();
    } else {
        // 2. Info popup dikhao (Non-blocking)
        // Ye OK dabate hi hat jayega, par download niche chalta rahega
        alert("Downloading " + song.name + "...\nClick OK to continue using the app.");

        // 3. Background Download Start (No 'await' here)
        // Isse browser line-by-line rukega nahi
        cache.add(song.url).then(() => {
            console.log("Download Success: " + song.name);
            
            // Jab download finish ho jaye tab choti si info
            alert("Ready Offline: " + song.name);
            
            // List refresh karo taaki Downloaded section mein dikhne lage
            renderPlaylist(); 
            if (typeof renderDownloadedSongs === 'function') {
                renderDownloadedSongs(); 
            }
        }).catch((err) => {
            console.error("Download Error:", err);
            alert("Download failed! Please check your internet connection.");
        });
    }
    
    // Options menu ko band karo
    const menu = document.getElementById('song-options-menu');
    if(menu) menu.style.display = 'none';
}

/* ================= APP START ================= */
window.addEventListener('load', async () => {
    await renderPlaylist();
    if(playlist.length > 0) loadSong(0);
    setTimeout(() => switchTab('all-songs'), 250);
});

/* ============================================================
   --- LIBRARY & PLAYLIST CORE LOGIC ---
   ============================================================ */

// 1. Storage Objects (App start hone par empty rahengi)
let userLibrary = JSON.parse(localStorage.getItem('userLibrary')) || {
    songs: [],
    favourites: [],
    playlists: {},
    playlistThumbs: {}
};

function saveLibraryToDisk() {
    localStorage.setItem('userLibrary', JSON.stringify(userLibrary));
}


let currentModalIndex = null; // Kis gaane ke liye modal khula hai

/**
 /**
 * Gaane ka menu khulne par ya Player se '+' dabane par modal dikhao
 */
function handleMenuAddPlaylist() {
    // 1. Agar gaane ki list wala menu khula hai toh use band karo
    const songMenu = document.getElementById('song-options-menu');
    if(songMenu) songMenu.style.display = 'none'; 

    // 2. selectedMenuIndex check karo (Player se aayega ya List se)
    currentModalIndex = selectedMenuIndex; 
    
    // Safety check: agar koi gaana select nahi hai toh wapas jao
    if (currentModalIndex === null || currentModalIndex === undefined) return;

    // YE RAHI TUMHARI 6th LINE
    const song = playlist[currentModalIndex];

    // 3. Modal UI mein gaane ka naam aur artist dalo
    document.getElementById('modal-song-name').innerText = song.name;
    document.getElementById('modal-song-artist').innerText = song.artist;

    // 4. Tick status update karo (Library aur Favourite ke liye)
    updateTickUI('library', userLibrary.songs.includes(currentModalIndex));
    updateTickUI('favourite', userLibrary.favourites.includes(currentModalIndex));

    // 5. Playlists Render karo Modal ke andar
    renderModalPlaylists();

    // 6. Modal ko screen par lao
    document.getElementById('action-modal').style.display = 'block';
}



/**
 * Tick toggle karne ka logic (Tick & Untickable)
 */
function toggleTick(type, playlistName = null) {
    const tickId = playlistName ? `tick-pl-${playlistName.replace(/\s/g, '')}` : `tick-${type}`;
    const tickIcon = document.getElementById(tickId);
    
    if (!tickIcon) return;

    const isActive = tickIcon.classList.contains('active');
    
    if (playlistName) {
        // Playlist logic
        if (!isActive) {
            userLibrary.playlists[playlistName].push(currentModalIndex);
            tickIcon.classList.add('active');
        } else {
            userLibrary.playlists[playlistName] = userLibrary.playlists[playlistName].filter(idx => idx !== currentModalIndex);
            tickIcon.classList.remove('active');
        }
    } else {
        // Library or Favourite logic
        const targetArray = type === 'library' ? userLibrary.songs : userLibrary.favourites;
        if (!isActive) {
            targetArray.push(currentModalIndex);
            tickIcon.classList.add('active');
        } else {
            const index = targetArray.indexOf(currentModalIndex);
            if (index > -1) targetArray.splice(index, 1);
            tickIcon.classList.remove('active');
        }
    }
    saveLibraryToDisk();
}

function updateTickUI(type, status) {
    const tick = document.getElementById(`tick-${type}`);
    if(tick) status ? tick.classList.add('active') : tick.classList.remove('active');
}

/**
 * Modal ke andar Playlists ki list dikhao
 */
function renderModalPlaylists() {
    const container = document.getElementById('modal-playlists-list');
    container.innerHTML = "";

    Object.keys(userLibrary.playlists).forEach(name => {
        const isAdded = userLibrary.playlists[name].includes(currentModalIndex);
        const safeId = name.replace(/\s/g, '');
        
        container.innerHTML += `
            <div class="modal-option" onclick="toggleTick('playlist', '${name}')">
                <i class="fas fa-list-ul"></i>
                <span>${name}</span>
                <i class="fas fa-check-circle tick-icon ${isAdded ? 'active' : ''}" id="tick-pl-${safeId}"></i>
            </div>
        `;
    });
}

/**
 * Nayi Playlist banane ka Popup dikhao
 */
function showNewPlaylistPrompt() {
    document.getElementById('playlist-name-modal').style.display = 'block';
}

function closePlaylistPrompt() {
    document.getElementById('playlist-name-modal').style.display = 'none';
}

/**
 * Nayi playlist banate hi gaana usme auto-add ho jaye aur modal band ho jaye
 */
function confirmCreatePlaylist() {
    const nameInput = document.getElementById('new-playlist-input');
    const name = nameInput.value.trim();

    if (name) {
        if (!userLibrary.playlists[name]) {
            userLibrary.playlists[name] = [currentModalIndex];
saveLibraryToDisk();
nameInput.value = "";
            closePlaylistPrompt();
            saveAndCloseModal(); // Pura modal band kar do
            alert(`Created & Added to "${name}"`);
        } else {
            alert("Playlist already exists!");
        }
    }
}


/* ============================================================
   --- LIBRARY VIEW SWITCHING & RENDERING ---
   ============================================================ */

/**
 * Library ke sub-tabs (Downloaded, Playlist, etc.) switch karne ke liye
 */
function switchLibraryView(view) {
    // 1. Saare sub-nav buttons se 'active' class hatao
    document.querySelectorAll('.sub-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 2. Click kiye huye button ko active (Red) karo
    if (event && event.target) {
        event.target.classList.add('active');
    }

    // 3. Content render karo
    renderLibraryContent(view);
}

/**
 /**
 * Library Content ko render karne ka main function (Grid View Fixed)
 */
function renderLibraryContent(view = 'all') {
    const container = document.getElementById('library-content-area');
    if (!container) return;
    
    container.innerHTML = ""; 
    // Pehle grid class hatao taaki Fav/Album list mein dikhein
    container.classList.remove('grid-view'); 

    if (view === 'playlists') {
        // Sirf Playlists ke liye Grid class lagao
        container.classList.add('grid-view'); 
        
        const playlistNames = Object.keys(userLibrary.playlists);
        
        if (playlistNames.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>No playlists yet.</p></div>`;
            return;
        }

        // Playlists ko Grid (Badi Photo) mein dikhao
        playlistNames.forEach(name => {
            // Check karo agar user ne photo upload ki hai, nahi toh default dalo
            const thumb = (userLibrary.playlistThumbs && userLibrary.playlistThumbs[name]) 
                          ? userLibrary.playlistThumbs[name] 
                          : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300';

            const div = document.createElement('div');
            div.className = "playlist-card";
            div.innerHTML = `
                <div class="playlist-thumb-container" onclick="openPlaylistDetail('${name}')">
                    <img src="${thumb}">
                    <div class="edit-thumb-btn" onclick="event.stopPropagation(); triggerPlaylistUpload('${name}')">
                        <i class="fas fa-camera"></i>
                    </div>
                </div>
                <h4>${name}</h4>
            `;
            container.appendChild(div);
        });
    } 
    else if (view === 'fav') {
        renderSongList(userLibrary.favourites, container, "No favorites added.");
    } 
    else if (view === 'all') { // Album/All
        renderSongList(userLibrary.songs, container, "Library is empty.");
    } 
    else if (view === 'down') {
        if (typeof renderDownloadedSongs === 'function') {
            renderDownloadedSongs();
        } else {
            container.innerHTML = `<div class="empty-state"><p>No downloads yet.</p></div>`;
        }
    }
}


/**
 * Common function gaano ki list dikhane ke liye
 */
function renderSongList(songIndices, container, emptyMsg) {
    if (!songIndices || songIndices.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>${emptyMsg}</p></div>`;
        return;
    }

    songIndices.forEach(idx => {
        const song = playlist[idx];
        const div = document.createElement('div');
        div.className = "song-item";
        div.innerHTML = `
            <div class="song-info-container" onclick="loadSong(${idx}); maximizePlayer(); if(audio) audio.play(); updatePlayIcons(true);">
                <img src="${song.img || defaultImg}">
                <div>
                    <h4>${song.name}</h4>
                    <p>${song.artist}</p>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

/**
 * Jab user kisi Playlist par click kare, toh uske andar ke gaane dikhao
 */
function openPlaylistDetail(playlistName) {
    const container = document.getElementById('library-content-area');
    const subNavs = document.querySelectorAll('.library-sub-nav');
    
    // Tabs hide karo
    subNavs.forEach(nav => nav.style.setProperty('display', 'none', 'important'));

    if (!container) return;
    container.classList.remove('grid-view');

    const songIndices = userLibrary.playlists[playlistName] || [];
    const thumb = (userLibrary.playlistThumbs && userLibrary.playlistThumbs[playlistName]) 
                  ? userLibrary.playlistThumbs[playlistName] : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300';

    // Header Render karo
    container.innerHTML = `
        <div class="playlist-detail-header" style="width: 100%; margin-bottom: 30px;">
            <div onclick="backToLibraryPlaylists()" style="cursor:pointer; color: #ff3b30; margin-bottom: 20px; font-weight: 600;">
                <i class="fas fa-chevron-left"></i> Library
            </div>
            <img src="${thumb}" id="playlist-cover-img" style="width: 180px; height: 180px; border-radius: 15px; object-fit: cover; box-shadow: 0 15px 35px rgba(0,0,0,0.6); margin-bottom: 15px;">
            <h1 style="font-size: 36px; font-weight: 800; margin: 0; color: #fff;">${playlistName}</h1>
            <p style="color: #8e8e93; font-size: 16px;">Playlist • ${songIndices.length} Songs</p>
        </div>
        <div id="playlist-songs-list"></div>
    `;

    // Background color update
    if (typeof updatePlaylistCanvas === 'function') updatePlaylistCanvas(thumb);
    
    // Gaane render karo
    renderSongListInPlaylist(songIndices, playlistName);
}



function renderSongListInPlaylist(songIndices, playlistName) {
    const list = document.getElementById('playlist-songs-list');
    if (!list) return;
    list.innerHTML = ""; 

    if (songIndices.length === 0) {
        list.innerHTML = `<div class="empty-state"><p>No songs yet.</p></div>`;
        return;
    }

    songIndices.forEach(idx => {
        const song = playlist[idx];
        const div = document.createElement('div');
        div.className = "song-item";
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        
        div.innerHTML = `
            <div class="song-info-container" style="flex:1" onclick="loadSong(${idx}); maximizePlayer(); if(audio) audio.play();">
                <img src="${song.img || defaultImg}">
                <div><h4>${song.name}</h4><p>${song.artist}</p></div>
            </div>
            <div class="song-menu-btn" style="padding:10px; cursor:pointer;" onclick="confirmRemove(event, '${playlistName}', ${idx})">
                <i class="fas fa-ellipsis-v" style="color:#b3b3b3"></i>
            </div>`;
        list.appendChild(div);
    });
}

function backToLibraryPlaylists() {
    // Tabs waapis lao
    const subNavs = document.querySelectorAll('.library-sub-nav');
    subNavs.forEach(nav => nav.style.setProperty('display', 'flex', 'important'));
    
    // Background color wapis black karo
    document.getElementById('library-screen').style.background = '#121212';
    switchLibraryView('playlists');
}


function confirmRemove(event, playlistName, songIndex) {
    event.stopPropagation(); // Isse gaana play nahi hoga
    if (confirm("Remove this song from " + playlistName + "?")) {
        userLibrary.playlists[playlistName] = userLibrary.playlists[playlistName].filter(idx => idx !== songIndex);
        openPlaylistDetail(playlistName); // UI refresh
    }
}


// ... Step 4 ka 'removeFromPlaylist' function yahan khatam ho raha hai ...
function removeFromPlaylist(event, playlistName, songIndex) {
    // ... uska logic ...
}

// ================= STEP 2: DOWNLOADED SONGS RENDER (FIXED) =================
async function renderDownloadedSongs() {
    const container = document.getElementById('library-content-area');
    if (!container) return;

    // Loading state dikhao
    container.innerHTML = '<p style="text-align:center; padding:20px; color:#aaa;">Scanning Downloads...</p>';

    try {
        const cache = await caches.open('apple-music-v2');
        const cachedRequests = await cache.keys();
        // Browser cache se saare stored URLs ki list lo
        const cachedURLs = new Set(cachedRequests.map(req => req.url));

        container.innerHTML = '';
        let found = false;

        playlist.forEach((song, index) => {
            // Song URL ko absolute path mein badalna zaroori hai match karne ke liye
            const songFullURL = new URL(song.url, window.location.origin).href;
            
            if (cachedURLs.has(songFullURL)) {
                found = true;
                const div = document.createElement('div');
                div.className = 'song-item';
                div.innerHTML = `
                    <div class="song-info-container" onclick="loadSong(${index}); maximizePlayer(); if(audio) audio.play(); updatePlayIcons(true);">
                        <img src="${song.img || defaultImg}">
                        <div>
                            <h4>${song.name}</h4>
                            <p>${song.artist}</p>
                        </div>
                    </div>`;
                container.appendChild(div);
            }
        });

        if (!found) {
            container.innerHTML = `<p style="text-align:center; padding:20px; color:#aaa;">No downloaded songs found.</p>`;
        }
    } catch (e) {
        console.error("Cache Error:", e);
        container.innerHTML = `<p style="text-align:center; color:red;">Error loading storage.</p>`;
    }
}

/**
 * Playlist cover photo se color nikal kar background badalne ka function
 */
function updatePlaylistCanvas(imgSrc) {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Security bypass taaki color read ho sake
    img.src = imgSrc;
    
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1; 
        canvas.height = 1;
        
        // Photo ko 1x1 pixel mein draw karo average color nikalne ke liye
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        
        const libScreen = document.getElementById('library-screen');
        if (libScreen) {
            // Screen par smooth gradient apply karo
            libScreen.style.background = `linear-gradient(to bottom, rgb(${r},${g},${b}) 0%, #121212 100%)`;
        }
    };
    
    // Agar image load nahi hoti toh default black rakho
    img.onerror = () => {
        const libScreen = document.getElementById('library-screen');
        if (libScreen) libScreen.style.background = '#121212';
    };
}
/**
 * Gallery se photo select karke playlist cover badalne ka function
 */
function triggerPlaylistUpload(name) {
    // 1. Ek invisible file input create karo agar pehle se nahi hai
    let fileInput = document.getElementById('playlist-photo-input');
    
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'playlist-photo-input';
        fileInput.accept = 'image/*'; // Sirf photos allow karein
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }

    // 2. Jab user photo select kare
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newImgData = event.target.result;

                // Library Object mein photo save karo
                if (!userLibrary.playlistThumbs) userLibrary.playlistThumbs = {};
                userLibrary.playlistThumbs[name] = newImgData;

                // UI refresh karo taaki nayi photo dikhe
                renderLibraryContent('playlists'); 
                
                // Agar playlist detail khuli hai toh uska color bhi badlo
                if (typeof updatePlaylistCanvas === 'function') {
                    updatePlaylistCanvas(newImgData);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // 3. Click trigger karo
    fileInput.click();
}

function renderGlobalSearch(term) {
    const list = document.getElementById('global-search-results');
    if (!list) return;

    list.innerHTML = `<h3>SEARCH RESULTS</h3>`; // Heading set karo

    let found = false;
    playlist.forEach((song, index) => {
        if (song.name.toLowerCase().includes(term) || song.artist.toLowerCase().includes(term)) {
            found = true;
            const div = document.createElement('div');
            div.className = "song-item";
            div.style.padding = "12px 15px";
            // Click karte hi tray band hogi aur gaana chalega
            div.innerHTML = `
                <div class="song-info-container" style="display: flex; align-items: center; width: 100%;" 
                     onclick="loadSong(${index}); maximizePlayer(); if(audio) audio.play(); closeSearchStack();">
                    <img src="${song.img || defaultImg}" style="width: 50px; height: 50px; border-radius: 8px; margin-right: 15px; object-fit: cover;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0; color: #fff; font-size: 16px;">${song.name}</h4>
                        <p style="margin: 0; color: #8e8e93; font-size: 13px;">${song.artist}</p>
                    </div>
                </div>
            `;
            list.appendChild(div);
        }
    });

    if (found) {
        list.style.display = 'block'; // Results mile toh tray dikhao
    } else {
        list.innerHTML += `<p style="color: #8e8e93; text-align: center; padding: 30px;">No results found</p>`;
    }
}

// Any where click logic - Isse search tab har jagah click karne par band hoga
document.addEventListener('click', (e) => {
    const searchStack = document.getElementById('search-stack');
    // Nav-item check karega taaki search button dabate hi band na ho jaye
    const searchTrigger = document.querySelector('.nav-item i.fa-search')?.parentElement; 
    
    if (searchOpen && searchStack && !searchStack.contains(e.target) && !searchTrigger?.contains(e.target)) {
        closeSearchStack();
    }
});


function handleMenuAddPlaylistFromPlayer() {
    selectedMenuIndex = currentIndex; 
    handleMenuAddPlaylist(); 
}
