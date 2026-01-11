/* ============================================================
   --- APP INITIALIZATION & VARIABLES ---
   ============================================================ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(() => console.log("SW Active"));
    });
}

// Variables sirf EK baar declare honge pure code mein
const audio = document.getElementById('main-audio');
const playerScreen = document.getElementById('player-screen');
const mainImg = document.getElementById('song-image'); 
const defaultImg = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300";


// Load saved playlist OR fallback to default
const savedPlaylist = JSON.parse(localStorage.getItem('appPlaylist'));
let playlist = savedPlaylist && savedPlaylist.length ? savedPlaylist : [
    { "name": "APSARA", "artist": "Billa sonipat aala", "url": "music/Apsara.mp3", "img": "https://files.catbox.moe/qrgvpq.webp" },
    { "name": "Yaran gail", "artist": "Billa sonipat aala", "url": "music/Yaaran Gail.mp3", "img": "https://files.catbox.moe/iswwju.jpeg" },
    { "name": "AZUL", "artist": "Guru Randhawa", "url": "music/Azul Lavish Dhiman 320 Kbps.mp3", "img": "https://files.catbox.moe/85n1j0.jpeg" },
    { "name": "Pan india", "artist": "Guru randhawa", "url": "music/PAN INDIA - Guru Randhawa.mp3", "img": "https://files.catbox.moe/uzltk5.jpeg" },
    { "name": "Perfect", "artist": "Guru randhawa", "url": "music/Perfect.mp3", "img": "https://files.catbox.moe/k6emom.webp" }
];

function savePlaylistToDisk() { localStorage.setItem('appPlaylist', JSON.stringify(playlist)); }

let userLibrary = JSON.parse(localStorage.getItem('userLibrary')) || {
    songs: [],
    favourites: [],
    playlists: {},
    playlistThumbs: {},
    downloaded: []   // ✅ STEP 1 added
};
function saveLibraryToDisk() { localStorage.setItem('userLibrary', JSON.stringify(userLibrary)); }

let currentIndex = 0;
let startY = 0;
let isDragging = false;
let searchOpen = false;
let selectedMenuIndex = null;

/* ================= FEATURE: ADAPTIVE COLOR (PLAYER) ================= */
function updatePlayerAdaptiveColor(imgSrc) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgSrc;
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1; canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        const d = ctx.getImageData(0,0,1,1).data;
        const rgb = `rgb(${d[0]},${d[1]},${d[2]})`;
        document.documentElement.style.setProperty('--bg-color', rgb);
        const pScreen = document.getElementById('player-screen');
        if(pScreen) pScreen.style.background = `linear-gradient(to bottom, ${rgb} 0%, #121212 100%)`;
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
            };
            r.readAsDataURL(file);
        }
    });
}

/* ================= GESTURE & MINIMIZE LOGIC ================= */
if(playerScreen) {
    playerScreen.addEventListener('touchstart', (e) => {
        if (e.touches[0].clientY < window.innerHeight / 2) {
            startY = e.touches[0].clientY; isDragging = true; playerScreen.style.transition = 'none';
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
/* ================= FIXED MINIMIZE/MAXIMIZE FUNCTIONS ================= */

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
    // Screen ko hide karna taaki background buttons kaam karein
    setTimeout(() => { 
        if(playerScreen.classList.contains('minimized')) playerScreen.style.display = 'none';
    }, 400); 
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


/* ================= CORE PLAYER LOGIC (FIXED) ================= */
function loadSong(index) {
    currentIndex = index;
    const s = playlist[index];
    if(audio) audio.src = s.url;
    
    /* ================= FEATURE: AUTO-PLAY NEXT ================= */
    if (audio) {
        audio.onended = () => {
            console.log("Song ended, playing next...");
            nextSong(); 
            audio.play().catch(e => console.log("Auto-play blocked"));
        };
    }

    // 1. Main Player update karo
    document.getElementById('player-title').innerText = s.name;
    document.getElementById('player-artist').innerText = s.artist;
    
    // 2. MINI PLAYER UPDATE (Ye lines uda di thi maine pehle, ab wapas hain)
    document.getElementById('mini-title').innerText = s.name;
    document.getElementById('mini-artist').innerText = s.artist;
    
    // 3. Photos update karo
    if(mainImg) mainImg.src = s.img || defaultImg;
    const miniImg = document.getElementById('mini-img');
    if(miniImg) miniImg.src = s.img || defaultImg;
    
    // 4. Adaptive color aur baki features
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
    document.getElementById('play-btn').className = `fas ${iconClass}`; 
    document.getElementById('mini-play-btn').className = `fas ${iconClass}`; 
}

function nextSong() { currentIndex = (currentIndex + 1) % playlist.length; loadSong(currentIndex); audio.play(); updatePlayIcons(true); }
function prevSong() { currentIndex = (currentIndex - 1 + playlist.length) % playlist.length; loadSong(currentIndex); audio.play(); updatePlayIcons(true); }

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
            <div class="song-info-container" onclick="loadSong(${index}); maximizePlayer(); audio.play(); updatePlayIcons(true);">
                <img src="${song.img || defaultImg}">
                <div><h4>${song.name}</h4><p>${song.artist}</p></div>
            </div>
            <div class="song-menu-btn" onclick="event.stopPropagation(); openSongMenu(event, ${index})"><i class="fas fa-ellipsis-v"></i></div>`;
        container.appendChild(div);
    }
}
/* ================= STEP 1: MODAL & STORAGE CORE ================= */

/**
 * Gaane ka menu khulne par ya Player se '+' dabane par modal dikhao
 */
function handleMenuAddPlaylist() {
    // 1. Purana menu band karo
    const songMenu = document.getElementById('song-options-menu');
    if(songMenu) songMenu.style.display = 'none'; 

    // 2. Index set karo (selectedMenuIndex playlist list se aata hai)
    currentModalIndex = selectedMenuIndex; 
    
    if (currentModalIndex === null) return;

    const song = playlist[currentModalIndex];

    // 3. Modal UI mein gaane ka naam aur artist update karo
    document.getElementById('modal-song-name').innerText = song.name;
    document.getElementById('modal-song-artist').innerText = song.artist;

    // 4. Tick status update karo (Check karo ki library/fav mein pehle se hai ya nahi)
    updateTickUI('library', userLibrary.songs.includes(currentModalIndex));
    updateTickUI('favourite', userLibrary.favourites.includes(currentModalIndex));

    // 5. Playlists ki list Modal ke andar dikhao
    renderModalPlaylists();

    // 6. Modal ko screen par show karo
    document.getElementById('action-modal').style.display = 'block';
}

/**
 * Modal ke andar Playlists render karne ka logic
 */
function renderModalPlaylists() {
    const container = document.getElementById('modal-playlists-list');
    if(!container) return;
    container.innerHTML = "";

    Object.keys(userLibrary.playlists).forEach(name => {
        // Possibility: Check if song is already in this specific playlist
        const isAdded = userLibrary.playlists[name].includes(currentModalIndex);
        const safeId = name.replace(/\s/g, '');
        
        container.innerHTML += `
            <div class="modal-option" onclick="toggleTick('playlist', '${name}')">
                <i class="fas fa-list-ul"></i>
                <span>${name}</span>
                <i class="fas fa-check-circle tick-icon ${isAdded ? 'active' : ''}" id="tick-pl-${safeId}"></i>
            </div>`;
    });
}

/* ================= STEP 2: TICK TOGGLE & STORAGE ================= */

/**
 * Kisi playlist ya library mein gaana add ya remove (toggle) karna
 */
function toggleTick(type, playlistName = null) {
    // 1. Tick icon ki ID dhoondho (Playlist ke liye alag, Fav/Library ke liye alag)
    const tickId = playlistName ? `tick-pl-${playlistName.replace(/\s/g, '')}` : `tick-${type}`;
    const tickIcon = document.getElementById(tickId);
    
    if (!tickIcon) return;

    // Check karo ki icon pehle se active (Red/Green) hai ya nahi
    const isActive = tickIcon.classList.contains('active');
    
    if (playlistName) {
        // POSSIBLITY 1: Playlist logic
        if (!isActive) {
            // Agar active nahi hai, toh array mein push karo
            userLibrary.playlists[playlistName].push(currentModalIndex);
            tickIcon.classList.add('active');
        } else {
            // Agar pehle se hai, toh filter karke nikal do (Untick)
            userLibrary.playlists[playlistName] = userLibrary.playlists[playlistName].filter(idx => idx !== currentModalIndex);
            tickIcon.classList.remove('active');
        }
    } else {
        // POSSIBLITY 2: Library aur Favourite logic
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

    // SABSE IMPORTANT: Har badlav ke baad storage mein save karo
    saveLibraryToDisk();
    
    // Agar Library screen khuli hai, toh use piche refresh kar do taaki change dikhe
    if(document.getElementById('library-screen').style.display === 'block') {
        renderLibraryContent('playlists'); 
    }
}

/**
 * Tick UI status update (Simple helper)
 */
function updateTickUI(type, status) {
    const tick = document.getElementById(`tick-${type}`);
    if(tick) status ? tick.classList.add('active') : tick.classList.remove('active');
}
/* ================= STEP 3: PLAYLIST DETAIL & OPEN LOGIC ================= */

/**
 * Kisi specific playlist par click karne par uske andar ke gaane dikhana
 */
/**
 * Kisi specific playlist par click karne par uske andar ke gaane dikhana
 */
function openPlaylistDetail(playlistName) {
    const container = document.getElementById('library-content-area');
    const subNavs = document.querySelectorAll('.library-sub-nav');
    
    // 1. Library ke tabs hide karo
    subNavs.forEach(nav => nav.style.setProperty('display', 'none', 'important'));
    
    // 2. Grid view hatao taaki gaane list mein dikhein
    container.classList.remove('grid-view');

    const songIndices = userLibrary.playlists[playlistName] || [];
    const thumb = (userLibrary.playlistThumbs && userLibrary.playlistThumbs[playlistName]) 
                  ? userLibrary.playlistThumbs[playlistName] 
                  : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300';

    // 3. Playlist Header (Isme Delete Button add kiya gaya hai)
    container.innerHTML = `
        <div class="playlist-detail-header" style="padding: 20px; text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div onclick="backToLibraryPlaylists()" style="color: #ff3b30; cursor:pointer; font-weight: 600;">
                    <i class="fas fa-chevron-left"></i> Library
                </div>
                <div onclick="deletePlaylist('${playlistName}')" style="color: #8e8e93; cursor:pointer; font-size: 14px;">
                    <i class="fas fa-trash"></i> Delete
                </div>
            </div>
            <img src="${thumb}" style="width: 180px; height: 180px; border-radius: 15px; object-fit: cover; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h1 style="margin-top: 15px; font-size: 28px; color: white;">${playlistName}</h1>
            <p style="color: #8e8e93;">${songIndices.length} Songs</p>
        </div>
        <div id="playlist-internal-songs"></div>
    `;

    // 4. Playlist ke andar ke gaane render karo
    const listArea = document.getElementById('playlist-internal-songs');
    if (songIndices.length === 0) {
        listArea.innerHTML = `<p style="text-align:center; padding:40px; color:#666;">No songs in this playlist.</p>`;
    } else {
        songIndices.forEach(idx => {
            const song = playlist[idx];
            const div = document.createElement('div');
            div.className = "song-item";
            div.innerHTML = `
                <div class="song-info-container" onclick="loadSong(${idx}); maximizePlayer(); audio.play(); updatePlayIcons(true);">
                    <img src="${song.img || defaultImg}">
                    <div><h4>${song.name}</h4><p>${song.artist}</p></div>
                </div>
                <div class="song-menu-btn" onclick="confirmRemoveFromPlaylist(event, '${playlistName}', ${idx})">
                    <i class="fas fa-trash-alt" style="color: #ff453a;"></i>
                </div>`;
            listArea.appendChild(div);
        });
    }
}


/**
 * Playlist detail se wapas Library par jaane ka logic
 */
function backToLibraryPlaylists() {
    const subNavs = document.querySelectorAll('.library-sub-nav');
    subNavs.forEach(nav => nav.style.setProperty('display', 'flex', 'important'));
    switchLibraryView('playlists');
}

/**
 * Playlist ke andar se gaana delete karne ka logic
 */
function confirmRemoveFromPlaylist(e, playlistName, songIdx) {
    e.stopPropagation();
    if(confirm("Remove this song from " + playlistName + "?")) {
        userLibrary.playlists[playlistName] = userLibrary.playlists[playlistName].filter(idx => idx !== songIdx);
        saveLibraryToDisk();
        openPlaylistDetail(playlistName); // UI Refresh
    }
}

/* ================= STEP 4: CREATE PLAYLIST POPUP LOGIC ================= */

/**
 * Nayi playlist confirm karke gaana auto-add karne ka logic
 */
function confirmCreatePlaylist() {
    const nameInput = document.getElementById('new-playlist-input');
    const name = nameInput.value.trim();

    if (name) {
        // 1. Check karo agar ye naam pehle se toh nahi hai
        if (!userLibrary.playlists[name]) {
            
            // 2. Nayi playlist array banao aur current gaana dalo
            userLibrary.playlists[name] = [currentModalIndex]; 
            
            // 3. Storage mein permanent save karo
            saveLibraryToDisk(); 
            
            // 4. UI saaf karo aur popups band karo
            nameInput.value = "";
            document.getElementById('playlist-name-modal').style.display = 'none';
            document.getElementById('action-modal').style.display = 'none';
            
            alert(`Playlist "${name}" created and song added!`);
            
            // 5. Agar user Library screen par hai, toh turant refresh karo
            if(document.getElementById('library-screen').style.display === 'block') {
                renderLibraryContent('playlists'); 
            }
        } else {
            alert("This playlist name already exists!");
        }
    } else {
        alert("Please enter a playlist name.");
    }
}

/**
 * Modal band karne ka simple helper function
 */
function saveAndCloseModal() {
    const modal = document.getElementById('action-modal');
    if(modal) modal.style.display = 'none';
    currentModalIndex = null;
}
/* ================= STEP 5: MISSING UI FUNCTIONS ================= */

/**
 * Nayi Playlist banane ka popup (input field) dikhane ke liye
 */
function showNewPlaylistPrompt() {
    const promptModal = document.getElementById('playlist-name-modal');
    if (promptModal) {
        promptModal.style.display = 'block';
        // Input field par auto-focus karne ke liye
        const input = document.getElementById('new-playlist-input');
        if (input) input.focus();
    }
}

/**
 * Nayi Playlist banane ka popup band karne ke liye
 */
function closePlaylistPrompt() {
    const promptModal = document.getElementById('playlist-name-modal');
    if (promptModal) {
        promptModal.style.display = 'none';
        const input = document.getElementById('new-playlist-input');
        if (input) input.value = ""; // Input clear kar dega
    }
}

/**
 * Nayi playlist confirm karke sirf SELECTED gaana add karna
 */
function confirmCreatePlaylist() {
    const nameInput = document.getElementById('new-playlist-input');
    const name = nameInput.value.trim();

    if (name) {
        if (!userLibrary.playlists[name]) {
            
            // POSSIBLITY FIX: Pehle poora array ja raha tha, ab sirf selected index jayega
            // Hum ek naya array [ ] banayenge jisme sirf currentModalIndex hoga
            userLibrary.playlists[name] = [currentModalIndex];
            
            saveLibraryToDisk(); // Permanent save
            
            // UI Cleanup
            nameInput.value = "";
            document.getElementById('playlist-name-modal').style.display = 'none';
            document.getElementById('action-modal').style.display = 'none';
            
            alert(`Playlist "${name}" created with 1 song.`);
            
            if(document.getElementById('library-screen').style.display === 'block') {
                renderLibraryContent('playlists');
            }
        } else {
            alert("This playlist name already exists!");
        }
    }
}

/**
 * 7 Poori Playlist delete karne ka function
 */
function deletePlaylist(playlistName) {
    // 1. User se confirmation lo
    if (confirm(`Are you sure you want to delete "${playlistName}"?`)) {
        
        // 2. userLibrary se woh playlist mita do
        delete userLibrary.playlists[playlistName];
        
        // 3. Agar uski koi custom thumbnail (photo) hai toh use bhi mita do
        if (userLibrary.playlistThumbs && userLibrary.playlistThumbs[playlistName]) {
            delete userLibrary.playlistThumbs[playlistName];
        }

        // 4. Storage mein save karo
        saveLibraryToDisk();

        // 5. UI refresh karo aur wapas Library view par jao
        backToLibraryPlaylists();
        alert("Playlist deleted successfully.");
    }
}


/* ================= NAVIGATION & SEARCH ================= */
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
        renderLibraryContent('all');
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
    setTimeout(() => { const input = document.getElementById('app-search-input'); if(input) input.focus(); }, 150);
}

function closeSearchStack() {
    const sStack = document.getElementById('search-stack');
    const tStack = document.getElementById('tab-stack');
    if (sStack) sStack.style.display = 'none';
    if (tStack) tStack.style.display = 'flex';
    searchOpen = false;
}
/* ================= FEATURE: CLICK ANYWHERE TO CLOSE ================= */
document.addEventListener('click', (e) => {
    // 1. Search Stack Logic
    const searchStack = document.getElementById('search-stack');
    const searchTrigger = document.querySelector('.nav-item i.fa-search')?.parentElement; 
    
    if (searchOpen && searchStack && !searchStack.contains(e.target) && !searchTrigger?.contains(e.target)) {
        closeSearchStack();
    }

    // 2. Song Options Menu Logic
    const songMenu = document.getElementById('song-options-menu');
    const menuBtn = e.target.closest('.song-menu-btn'); // Check agar menu button par click kiya hai
    
    if (songMenu && songMenu.style.display === 'block' && !songMenu.contains(e.target) && !menuBtn) {
        songMenu.style.display = 'none';
    }

    // 3. Side Menu Logic
    const sideMenu = document.getElementById('side-menu');
    const menuTrigger = document.querySelector('.fa-bars')?.parentElement;
    
    if (sideMenu && sideMenu.style.display === 'block' && !sideMenu.contains(e.target) && !menuTrigger?.contains(e.target)) {
        sideMenu.style.display = 'none';
    }
});


/* ================= FEATURE: BACKGROUND DOWNLOAD ================= */
async function handleDownload() {
    const song = playlist[selectedMenuIndex];
    const cache = await caches.open('apple-music-v2');

    // 🔥 IMPORTANT: absolute URL banao
    const songURL = new URL(song.url, window.location.origin).href;

    const isCached = await cache.match(songURL);

    if (isCached) {
        // ❌ REMOVE OFFLINE
        await cache.delete(songURL);

        // Library se bhi hatao
        userLibrary.downloaded =
            userLibrary.downloaded.filter(i => i !== selectedMenuIndex);

        alert("Offline removed");
    } else {
        // ⬇️ DOWNLOAD
        alert("Downloading " + song.name);
        await cache.add(songURL);

        // Library me mark karo
        if (!userLibrary.downloaded.includes(selectedMenuIndex)) {
            userLibrary.downloaded.push(selectedMenuIndex);
        }

        alert("Available offline");
    }

    // 💾 save + UI refresh
    saveLibraryToDisk();
    renderPlaylist();

    if (document.getElementById('library-screen').style.display === 'block') {
        renderLibraryContent('down');
    }

    document.getElementById('song-options-menu').style.display = 'none';
}

/* ================= DOWNLOADED SONGS RENDER FIXED ================= */
/*/* ================= FEATURE: DOWNLOADED SONGS SCANNER ================= */
async function renderDownloadedSongs() {
    const container = document.getElementById('library-content-area');
    if (!container) return;

    // 1. Scanning message dikhao
    container.innerHTML = '<p style="text-align:center; padding:20px; color:#aaa;">Scanning offline storage...</p>';

    try {
        // 2. Cache folder ko open karo
        const cache = await caches.open('apple-music-v2');
        const cachedRequests = await cache.keys();
        
        // 3. Saare cached URLs ka ek Set banao (matching fast karne ke liye)
        const cachedURLs = new Set(cachedRequests.map(req => req.url));

        container.innerHTML = '';
        let found = false;

        // 4. Apni playlist ke har gaane ko check karo
        playlist.forEach((song, index) => {
            // Song URL ko absolute path mein badlo taaki cache URL se match ho sake
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

        // 5. Agar koi gaana nahi mila toh empty state dikhao
        if (!found) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px; color:#666;">
                    <i class="fas fa-cloud-download-alt" style="font-size:40px; margin-bottom:10px;"></i>
                    <p>No offline songs found.<br><small>Download some songs to see them here.</small></p>
                </div>`;
        }
    } catch (e) {
        console.error("Cache Scan Error:", e);
        container.innerHTML = `<p style="text-align:center; color:red; padding:20px;">Storage Error: Could not scan downloads.</p>`;
    }
}



/* ================= LIBRARY VIEW RENDERING ================= */
function switchLibraryView(view) {
    document.querySelectorAll('.sub-nav-btn').forEach(btn => btn.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    renderLibraryContent(view);
}

function renderLibraryContent(view = 'all') {
    const container = document.getElementById('library-content-area');
    if (!container) return;
    container.innerHTML = ""; container.classList.remove('grid-view'); 

    if (view === 'playlists') {
        container.classList.add('grid-view'); 
        Object.keys(userLibrary.playlists).forEach(name => {
            const thumb = userLibrary.playlistThumbs[name] || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300';
            const div = document.createElement('div');
            div.className = "playlist-card";
            div.innerHTML = `<div class="playlist-thumb-container" onclick="openPlaylistDetail('${name}')"><img src="${thumb}"></div><h4>${name}</h4>`;
            container.appendChild(div);
        });
    } 
    else if (view === 'down') { renderDownloadedSongs(); } 
    else if (view === 'fav') { renderSongList(userLibrary.favourites, container, "No favorites."); } 
    else { renderSongList(userLibrary.songs, container, "Library empty."); }
}

function renderSongList(indices, container, msg) {
    if (!indices || indices.length === 0) { container.innerHTML = `<p style="text-align:center; padding:20px;">${msg}</p>`; return; }
    indices.forEach(idx => {
        const song = playlist[idx];
        const div = document.createElement('div');
        div.className = "song-item";
        div.innerHTML = `<div class="song-info-container" onclick="loadSong(${idx}); maximizePlayer(); audio.play();"><img src="${song.img || defaultImg}"><div><h4>${song.name}</h4><p>${song.artist}</p></div></div>`;
        container.appendChild(div);
    });
}

function openSongMenu(e, index) {
    e.stopPropagation(); selectedMenuIndex = index;
    const menu = document.getElementById('song-options-menu');
    menu.style.display = 'block'; menu.style.left = (e.clientX - 150) + "px"; menu.style.top = e.clientY + "px";
}

function updateMediaSession(s) {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: s.name, artist: s.artist, artwork: [{ src: s.img || defaultImg, sizes: '512x512', type: 'image/png' }] });
}

window.addEventListener('load', async () => { await renderPlaylist(); loadSong(0); });
window.addEventListener('online', () => renderPlaylist());
window.addEventListener('offline', () => renderPlaylist());

function formatTime(s) { let m = Math.floor(s / 60), sc = Math.floor(s % 60); return `${m}:${sc < 10 ? '0' + sc : sc}`; }

/* ================= FEATURE: ADD TO PLAYLIST LOGIC ================= */

/**
 * Modal ko band karne aur UI saaf karne ka function
 */
function saveAndCloseModal() {
    const modal = document.getElementById('action-modal');
    if(modal) modal.style.display = 'none';
    currentModalIndex = null;
}

/**
 * Playlist modal ke andar playlists render karna
 */
function renderModalPlaylists() {
    const container = document.getElementById('modal-playlists-list');
    if(!container) return;
    container.innerHTML = "";

    Object.keys(userLibrary.playlists).forEach(name => {
        // Check karo ki gaana pehle se is playlist mein hai ya nahi
        const isAdded = userLibrary.playlists[name].includes(currentModalIndex);
        const safeId = name.replace(/\s/g, '');
        
        const div = document.createElement('div');
        div.className = "modal-option";
        div.onclick = () => toggleTick('playlist', name);
        div.innerHTML = `
            <i class="fas fa-list-ul"></i>
            <span>${name}</span>
            <i class="fas fa-check-circle tick-icon ${isAdded ? 'active' : ''}" id="tick-pl-${safeId}"></i>
        `;
        container.appendChild(div);
    });
}

/**
 * Kisi playlist ya library mein gaana add/remove (tick) karna
 */
function toggleTick(type, playlistName = null) {
    const tickId = playlistName ? `tick-pl-${playlistName.replace(/\s/g, '')}` : `tick-${type}`;
    const tickIcon = document.getElementById(tickId);
    
    if (!tickIcon) return;

    const isActive = tickIcon.classList.contains('active');
    
    if (playlistName) {
        // Playlist logic: Add or Remove
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
    // Storage mein save karo taaki refresh par na udde
    saveLibraryToDisk();
}

/**
 * Gaane ka menu khulne par ya Player se '+' dabane par modal dikhao
 */
function handleMenuAddPlaylist() {
    // 1. Agar gaane ki list wala menu khula hai toh use band karo
    const songMenu = document.getElementById('song-options-menu');
    if(songMenu) songMenu.style.display = 'none'; 

    // 2. Index set karo
    currentModalIndex = selectedMenuIndex; 
    
    if (currentModalIndex === null || currentModalIndex === undefined) return;

    const song = playlist[currentModalIndex];

    // 3. Modal UI update
    document.getElementById('modal-song-name').innerText = song.name;
    document.getElementById('modal-song-artist').innerText = song.artist;

    // 4. Tick status update
    updateTickUI('library', userLibrary.songs.includes(currentModalIndex));
    updateTickUI('favourite', userLibrary.favourites.includes(currentModalIndex));

    renderModalPlaylists();
    document.getElementById('action-modal').style.display = 'block';
}

function updateTickUI(type, status) {
    const tick = document.getElementById(`tick-${type}`);
    if(tick) status ? tick.classList.add('active') : tick.classList.remove('active');
}

function handleMenuAddPlaylistFromPlayer() {
    selectedMenuIndex = currentIndex; 
    handleMenuAddPlaylist(); 
}

/**
 * Nayi Playlist banane ka logic
 */
function confirmCreatePlaylist() {
    const nameInput = document.getElementById('new-playlist-input');
    const name = nameInput.value.trim();

    if (name) {
        if (!userLibrary.playlists[name]) {
            userLibrary.playlists[name] = [currentModalIndex];
            saveLibraryToDisk();
            nameInput.value = "";
            document.getElementById('playlist-name-modal').style.display = 'none';
            saveAndCloseModal();
            alert(`Created & Added to "${name}"`);
        } else {
            alert("Playlist already exists!");
        }
    }
}
