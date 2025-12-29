if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(() => console.log("SW Active"));
    });
}

const audio = document.getElementById('main-audio');
const playerScreen = document.getElementById('player-screen');
const img = document.getElementById('song-image');
const defaultImg = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300";

let playlist = [
    {
        "name": "APSARA",
        "artist": "Billa sonipat aala",
        "url": "music/Apsara.mp3",
        "img": "https://files.catbox.moe/qrgvpq.webp"
    },
    {
        "name": "Yaran gail",
        "artist": "Billa sonipat aala",
        "url": "music/Yaaran Gail.mp3",
        "img": "https://files.catbox.moe/iswwju.jpeg"
    },
    {
        "name": "AZUL",
        "artist": "Guru Randhawa",
        "url": "music/Azul Lavish Dhiman 320 Kbps.mp3",
        "img": "https://files.catbox.moe/85n1j0.jpeg"
    },
    {
        "name": "Pan india",
        "artist": "Guru randhawa",
        "url": "music/PAN INDIA - Guru Randhawa.mp3",
        "img": "https://files.catbox.moe/uzltk5.jpeg"
    },
    {
        "name": "Perfect",
        "artist": "Guru randhawa",
        "url": "music/Perfect.mp3",
        "img": "https://files.catbox.moe/k6emom.webp"
    },
    {
        "name": "Afghan jalebi 8d audio",
        "artist": "Unknown",
        "url": "music/Afghan Jalebi 8D Audio Song 🎧 - Phantom ( Saif Ali Khan ｜ Katrina Kaif ｜ T-Series ) 2.m4a",
        "img": "https://files.catbox.moe/n1feln.jpeg"
    },
    {
        "name": "2 gulab",
        "artist": "Billa sonipat aala",
        "url": "music/2 Gulaab.mp3",
        "img": "https://files.catbox.moe/h7bvl8.jpeg"
    },
    {
        "name": "Suit suit",
        "artist": "Guru randhawa",
        "url": "music/Suit Suit - Guru Randhawa.mp3",
        "img": "https://files.catbox.moe/l1im66.webp"
    },
    {
        "name": "Shaky shaky",
        "artist": "sanju rathod",
        "url": "music/Shaky - Sanju Rathod 320KBPS .mp3",
        "img": "https://files.catbox.moe/umupug.webp"
    },
    {
        "name": "Sapne",
        "artist": "Artcriminal",
        "url": "music/artcriminal - SAPNE (Arabic Afro House).mp3",
        "img": "https://files.catbox.moe/p8ale0.jpeg"
    },
    {
        "name": "Over Confidence",
        "artist": "Billa sonipat ala",
        "url": "music/Over Confidence.mp3",
        "img": "https://files.catbox.moe/9j0hwa.webp"
    }
];

let currentIndex = 0;
let startY = 0;
let isDragging = false;

/* ================= FEATURE: ADAPTIVE COLOR ================= */
img.onload = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1; canvas.height = 1;
    ctx.drawImage(img, 0, 0, 1, 1);
    const d = ctx.getImageData(0,0,1,1).data;
    document.documentElement.style.setProperty('--bg-color', `rgb(${d[0]},${d[1]},${d[2]})`);
};

/* ================= FEATURE: GALLERY COVER CHANGE ================= */
document.getElementById('cover-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const r = new FileReader();
        r.onload = (ev) => {
            img.src = ev.target.result;
            document.getElementById('mini-img').src = ev.target.result;
            playlist[currentIndex].img = ev.target.result; // Playlist update
            renderPlaylist(); // List refresh
            document.getElementById('side-menu').style.display='none';
        };
        r.readAsDataURL(file);
    }
});

/* ================= GESTURE & MINIMIZE LOGIC ================= */
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

/* ================= FIXED MINIMIZE/MAXIMIZE ================= */
function minimizePlayer() { 
    // 1. Pehle animation shuru karo
    playerScreen.classList.add('minimized'); 
    playerScreen.style.transform = 'translateY(100%) scale(0.5)';
    playerScreen.style.opacity = '0';
    playerScreen.style.pointerEvents = 'none'; // Isse library click ho payegi

    // 2. Mini player ko turant dikhao
    const mini = document.getElementById('mini-player');
    mini.classList.remove('hidden');
    mini.style.opacity = '1';

    // 3. Glitch Fix: Animation ke baad bade player ko poori tarah hide kar do
    setTimeout(() => {
        if(playerScreen.classList.contains('minimized')) {
            playerScreen.style.display = 'none';
        }
    }, 400); 
}

function maximizePlayer() { 
    // 1. Pehle display on karo
    playerScreen.style.display = 'flex';
    
    // 2. Thoda gap de kar animation start karo (browser rendering ke liye)
    setTimeout(() => {
        playerScreen.classList.remove('minimized'); 
        playerScreen.style.transform = 'translateY(0) scale(1)';
        playerScreen.style.opacity = '1';
        playerScreen.style.pointerEvents = 'auto';
    }, 10);

    // 3. Mini player ko chhupao
    document.getElementById('mini-player').classList.add('hidden');
}


/* ================= CORE PLAYER LOGIC ================= */
function loadSong(index) {
    currentIndex = index;
    const s = playlist[index];
    audio.src = s.url;
    document.getElementById('player-title').innerText = s.name;
    document.getElementById('player-artist').innerText = s.artist;
    document.getElementById('mini-title').innerText = s.name;
    document.getElementById('mini-artist').innerText = s.artist;
    img.src = s.img || defaultImg;
    document.getElementById('mini-img').src = s.img || defaultImg;
    renderPlaylist();
    updateMediaSession(s);
}

function togglePlay() { 
    if(audio.paused) { audio.play(); updatePlayIcons(true); } 
    else { audio.pause(); updatePlayIcons(false); } 
}

function updatePlayIcons(p) { 
    const i = p ? 'fa-pause' : 'fa-play'; 
    document.getElementById('play-btn').className=`fas ${i}`; 
    document.getElementById('mini-play-btn').className=`fas ${i}`; 
}

function nextSong() { currentIndex=(currentIndex+1)%playlist.length; loadSong(currentIndex); audio.play(); updatePlayIcons(true); }
function prevSong() { currentIndex=(currentIndex-1+playlist.length)%playlist.length; loadSong(currentIndex); audio.play(); updatePlayIcons(true); }

function renderPlaylist() {
    const container = document.getElementById('song-list-container');
    container.innerHTML = "";
    playlist.forEach((song, index) => {
        const div = document.createElement('div');
        div.className = "song-item";
        div.innerHTML = `
            <div class="song-info-container" onclick="loadSong(${index}); maximizePlayer(); audio.play(); updatePlayIcons(true);">
                <img src="${song.img || defaultImg}">
                <div>
                    <h4>${song.name}</h4>
                    <p>${song.artist}</p>
                </div>
            </div>
            <div class="song-menu-btn" onclick="event.stopPropagation(); openSongMenu(event, ${index})">
                <i class="fas fa-ellipsis-v"></i>
            </div>
        `;
        container.appendChild(div);
    });
}



audio.ontimeupdate = () => {
    if(audio.duration) {
        document.getElementById('seek-bar').value = (audio.currentTime/audio.duration)*100;
        document.getElementById('current').innerText = formatTime(audio.currentTime);
        document.getElementById('duration').innerText = formatTime(audio.duration);
    }
};

function formatTime(s) { let m=Math.floor(s/60), sc=Math.floor(s%60); return `${m}:${sc < 10 ? '0'+sc : sc}`; }

function seekSong() {
    if (audio.duration) {
        audio.currentTime = (document.getElementById('seek-bar').value / 100) * audio.duration;
    }
}

function updateMediaSession(song) {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
        title: song.name,
        artist: song.artist,
        artwork: [{ src: song.img || defaultImg, sizes: '512x512', type: 'image/png' }]
    });

    // PLAY: Lock screen se resume karne ke liye hamara naya function call hoga
    navigator.mediaSession.setActionHandler('play', () => {
        resumeAudioContext(); 
    });

    // PAUSE: Normal pause logic
    navigator.mediaSession.setActionHandler('pause', () => {
        audio.pause();
        updatePlayIcons(false);
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevSong());
}


/* ================= UI OVERLAYS ================= */
function openForm() { document.getElementById('add-music-form').style.display = 'block'; }
function closeForm() { document.getElementById('add-music-form').style.display = 'none'; }
function toggleMenu() { 
    const m = document.getElementById('side-menu'); 
    m.style.display = (m.style.display === 'block') ? 'none' : 'block'; 
}


function addNewSong() {
    const name = document.getElementById('new-name').value;
    const url = document.getElementById('new-url').value;
    if(!name || !url) return alert("Bhai details dalo!");
    playlist.push({ name, artist: document.getElementById('new-artist').value || "Unknown", url, img: document.getElementById('new-img').value });
    document.getElementById('final-code').value = `let playlist = ${JSON.stringify(playlist, null, 4)};`;
    document.getElementById('export-area').style.display = 'block';
    renderPlaylist();
}

function copyToClipboard() {
    const area = document.getElementById('final-code');
    area.select();
    navigator.clipboard.writeText(area.value).then(() => alert("Code Copied!"));
}
/* --- iOS LOCK SCREEN SYNC FIX --- */
async function resumeAudioContext() {
    try {
        // Normal play try karein
        await audio.play();
        updatePlayIcons(true);
    } catch (err) {
        console.log("iOS Resume Hack Active");
        // Agar iOS mana kare, toh ye backup trick:
        const currentTime = audio.currentTime;
        audio.load(); // Stream re-connect
        audio.currentTime = currentTime;
        audio.play().then(() => updatePlayIcons(true));
    }
}
let selectedMenuIndex = null;

function openSongMenu(e, index) {
    // Event ko bubble hone se roko
    if (e.stopPropagation) e.stopPropagation();
    
    selectedMenuIndex = index;
    const menu = document.getElementById('song-options-menu');
    
    // Check karo ki menu mil raha hai ya nahi
    if (!menu) {
        console.error("Menu element nahi mila! HTML check karein.");
        return;
    }

    // Forcefully show menu
    menu.style.display = 'block';
// openSongMenu function ke andar yahan add karo:
updateDownloadButtonUI(); 


    // Position setup
    let x = e.clientX - 170; 
    let y = e.clientY;

    // Boundary check
    if (y + 150 > window.innerHeight) y -= 130;
    if (x < 10) x = 10; // Left side screen se bahar na jaye

    menu.style.left = x + "px";
    menu.style.top = y + "px";

    // Bahar click karne par band karne ka makkhan logic
    const closeListener = (event) => {
        if (!menu.contains(event.target)) {
            menu.style.display = 'none';
            document.removeEventListener('click', closeListener);
        }
    };

    setTimeout(() => {
        document.addEventListener('click', closeListener);
    }, 10);
}

function handleMenuChangeCover() {
    currentIndex = selectedMenuIndex;
    document.getElementById('cover-upload').click();
    document.getElementById('song-options-menu').style.display = 'none';
}

function handleMenuAddPlaylist() {
    alert("Song " + (selectedMenuIndex + 1) + " Added to Playlist!");
    document.getElementById('song-options-menu').style.display = 'none';
}
// ================= BUBU'S OFFLINE MAGIC LOGIC =================

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

async function handleDownload() {
    const song = playlist[selectedMenuIndex];
    const cache = await caches.open('apple-music-v2');
    const isCached = await cache.match(song.url);

    if (isCached) {
        await cache.delete(song.url);
        alert("Gana remove ho gaya! 🗑️");
    } else {
        try {
            alert("Downloading... 📥");
            await cache.add(song.url);
            alert("Downloaded! ✅");
        } catch(e) {
            alert("Download fail! GitHub link check kar.");
        }
    }
    // Menu band karo
    document.getElementById('song-options-menu').style.display = 'none';
    applyFadeLogic(); 
}

async function applyFadeLogic() {
    const isOffline = !navigator.onLine;
    const songListItems = document.querySelectorAll('.song-item'); 
    const cache = await caches.open('apple-music-v2');

    for (let i = 0; i < songListItems.length; i++) {
        if (playlist[i]) {
            const isCached = await cache.match(playlist[i].url);
            if (isOffline && !isCached) {
                songListItems[i].style.opacity = "0.3";
                songListItems[i].style.pointerEvents = "none";
            } else {
                songListItems[i].style.opacity = "1";
                songListItems[i].style.pointerEvents = "all";
            }
        }
    }
}

// Network Events
window.addEventListener('online', applyFadeLogic);
window.addEventListener('offline', applyFadeLogic);
window.addEventListener('load', applyFadeLogic);


loadSong(0); 


