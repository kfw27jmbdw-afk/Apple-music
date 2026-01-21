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
    
{ 
  "name": "First Kiss", 
  "artist": "Yo Yo Honey Singh,IPSITAA", 
  "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS91Z3lkdmk4MDNrcDRndTZpZTQ4Y2UvRmlyc3QtS2lzcy1Zby1Zby1Ib25leS1TaW5naC5tcDM/cmxrZXk9dWpkN3lvMzM2cmZvOWptMTIyYW5peXJheSZzdD1sajVzcG8yaCZyYXc9MQ==", 
  "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2430.jpeg"},
{ "name": "Tere Bina", "artist": "A.R Rahman", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS9wOWJnbHprbTd2aGlwZXR1bWh4ZXUvVGVyZS1CaW5hLUd1cnUtMzIwLUticHMubXAzP3Jsa2V5PThyNXNhMm1yZnVreTN5Z2IwZ21jdXpxcTImc3Q9bXFjOGdkMjImcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2375.webp"},
{ "name": "Sarpanch", "artist": "Masoom sharma,Shiva choudhary", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS82cGg5eTRleDJvajV1dmZpcHFkMXYvU2FycGFuY2gubXAzP3Jsa2V5PWh6Mmg5OXd1Zzl5N3RkbGNtdjJ4aThzbTImc3Q9bjBtenVtbGwmcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2407.webp" },
{ "name": "Circle", "artist": "Amanraj Gill,Manisha Sharma", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS85bjFjOTY3cWNqcWwxeHJzNDF2eTAvQ2lyY2xlLTMyMEticHMtTXItSmF0LmluLm1wMz9ybGtleT1rM2FyeG52cDh6N2kza3RxMGhibXB5YW9kJnN0PTZqY2lxeTkxJnJhdz0x", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2409.webp" },
{ "name": "Big Things", "artist": "Jordan Sandhu", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS9hN3E2MW9vOW14NTAzYTYzeHI2MmYvQmlnLVRoaW5ncy1Kb3JkYW4tU2FuZGh1Lm1wMz9ybGtleT1ldWFnNXc5OXNwZHgzYzN3ejZpeDVjczNwJnN0PWY4NnlrczUxJnJhdz0x", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2420.webp" },
{ "name": "Lut Le Gaya", "artist": "Shashwat Sachdev", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS9mYXZ2b2Z6NTB6NmdncHpmNDI3ejgvTHV0dC1MZS1HYXlhLURodXJhbmRoYXItMzIwLUticHMubXAzP3Jsa2V5PTh2eXBnaXBoZ3hmam1pcXlzaWtxMHJybWYmc3Q9ZDM4NTUyamQmcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2408.jpeg" },
{ "name": "Hopeless", "artist": "Amanraj Gill,Prem Lata", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS82YXVkaWhobnQ5ZWc5bGoyb3R1NDEvSG9wZWxlc3MtMzIwS2Jwcy1Nci1KYXQuaW4ubXAzP3Jsa2V5PXF3bWdtYW01N3NtaHo2eDJpZDlha205M3gmc3Q9N3JuemxoYTEmcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2406.webp" },
{ "name": "Ez-Ez", "artist": "Diljit Dosanjh,Hanuman Kind", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS96NzlhbHJoczZoYXpzYXNjbjJjcHEvRXotRXotRGh1cmFuZGhhci0zMjAtS2Jwcy5tcDM/cmxrZXk9dXlzN3Z4ZTA5bzMyZ3Fuemp6bTVqNTQ3ciZzdD14MXEyN3E5diZyYXc9MQ==", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2381.jpeg" },
{ "name": "Cheri Cheri Ladies", "artist": "Modern Talking", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS9iMmR4NmUwOWl5NWNvdWp0cDhheWQvQ2hlcmktQ2hlcmktTGFkeS1TYW1iYWxwdXJpU3Rhci5Jbi5tcDM/cmxrZXk9b2NzOWY2M3ZrbDN3M2RoYzQyNzl2amp6ciZzdD1iem1vNHZxcyZyYXc9MQ==", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2379.webp" },
{ "name": "College ki ladkiyon", "artist": "Udit Narayan", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS9ocnlxbXNqZmp6bng4ZG85enRrZjUvQ29sbGVnZS1LaS1MYWRraXlhbi1ZZWgtRGlsLUFhc2hpcWFuYS0zMjAtS2Jwcy5tcDM/cmxrZXk9NTlleTg3OHlxcmdjazI2cW9qeXQxZTN6ciZzdD1lY20xYnl3bCZyYXc9MQ==", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2378.jpeg" },
{ "name": "Aakh Ye Taalibaani", "artist": "Manish Sonipat Aala", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS82aGFheXB0b2RoaTNqNmpzcTVqcWMvQWFraC1ZZS1UYWFsaWJhYW5pLU1hbmlzaC1Tb25pcGF0LUFhbGEtMzIwLUticHMubXAzP3Jsa2V5PTdiNmlrMzJlZnY0b2JoeTl2YnJwNHZ2eTEmc3Q9bXp3NnY4dnMmcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2380.jpeg" },
{ "name": "Financer", "artist": "Bintu Pabra", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS9zcXY1bXczeG9lZGVlZHoxaTJnMXAvRmluYW5jZXIubXAzP3Jsa2V5PTBsdTE5M3Flc203amg0Z3YwMGpydjY1bmYmc3Q9b3piZnYwcDQmcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2377.webp" },
{ "name": "Kufar", "artist": "Diljit Dosanjh", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS8zZnZlNmo0cDY2OHhiaGllNzJkc3IvS3VmYXIubXAzP3Jsa2V5PXA5eGc0bWhmeDBoYnNxdjhmODFjeHUwYzImc3Q9amg1c2h6M3QmcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2376.webp" },
{ "name": "Afghan Jalebi", "artist": "8d Audio", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS96dHV2YjQyMzNlbmZyZ2Nkb2xwbnMvQWZnaGFuLUphbGViaS04RC1BdWRpby1Tb25nLVBoYW50b20tU2FpZi1BbGktS2hhbi1LYXRyaW5hLUthaWYtVC1TZXJpZXMubXAzP3Jsa2V5PWc2YTNhMTVlYTMzaXNyNmoxb282NjU2bnUmc3Q9eDIwMmFhcm4mcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2076.jpeg" },
{ "name": "APSARA", "artist": "Billa Sonipat Aala", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS92OXg3a25pM2FmODhxN3F1ZGVyenkvQXBzYXJhLm1wMz9ybGtleT01Mjg2MGd3ODYzczRuZHB6dzZqcXZwNjdpJnN0PTV1bDN6YjlvJnJhdz0x", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2065.webp" },
{ "name": "Shkini", "artist": "Guru Randhawa", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS8wZjFmNnhzYTBqZ3J3amdybDd2MWMvU0hLSU5JLUd1cnUtUmFuZGhhd2EubXAzP3Jsa2V5PXBleWZ2MjJ1YTVueTliZHl2ejNkbjhyMWImc3Q9dXY2eTh1YWgmcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2056.webp" },
{ "name": "Shararat", "artist": "Shashwat sachdev", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS96YnZ1dDcyYjBxNnlvanR0eHVscG0vU2hhcmFyYXQtRGh1cmFuZGhhci0zMjAtS2Jwcy5tcDM/cmxrZXk9dnlia2o5MHUzaG9zam4xdDhpeXg4YXlkbyZzdD05bnBhZWZ1eSZyYXc9MQ==", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2461.jpeg" },
{ "name": "Sira", "artist": "Guru Randhawa,Kiran Bajwa", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS9zM2VoYW1tMXh3bmdzcDlpZzc4eW8vU2lycmEtV2l0aG91dC1QcmVqdWRpY2UtMzIwLUticHMubXAzP3Jsa2V5PWRheWcyeWpuZzdhYWJ4aXZva25jeTl6bzMmc3Q9bXgxOGpmdmcmcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2487.jpeg" },
{ "name": "Qatal", "artist": "Guru Randhawa", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS93Zm1kcHUzejZpaGd3amxuaDg2MHYvUWF0YWwtV2l0aG91dC1QcmVqdWRpY2UtMzIwLUticHMubXAzP3Jsa2V5PTJyY2d2YzVjdXJkM2g3NTFqbzFtbGF3d24mc3Q9bnd2N20ycm0mcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2487.jpeg" },
{ "name": "Suit suit", "artist": "Guru Randhawa", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS9jcXk5YnlpdHluaXdtaTVpMXlqa28vU3VpdC1TdWl0LUd1cnUtUmFuZGhhd2EubXAzP3Jsa2V5PWJrNDZwbHhzdTZ5bTd5ZDQxajFvNWtuOHomc3Q9cTkwMnljYjcmcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2486.png" },
{ "name": "Lahore", "artist": "Guru Randhawa", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS80M25jNHpxcnJldjM2aGx3amMxazQvTGFob3JlLm1wMz9ybGtleT03bWswZGZvbGh6MTV5cHo4dGl5aTQ0ZHgyJnN0PXl2emsyNndkJnJhdz0x", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2483.png" },
{ "name": "Azul", "artist": "Guru Randhawa", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS9tNDdwcDlqejBqMWU3MmlpdzU3a3EvQXp1bC1MYXZpc2gtRGhpbWFuLTMyMC1LYnBzLm1wMz9ybGtleT1vd2lneXJpZTE5Y2U4NGdwd2FzbjRhY3llJnN0PWp2dGlwZ2JzJnJhdz0x", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2475.webp" },
{ "name": "Brother Louie", "artist": "Modern Talking", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS94a29xZjNlYW9qNnlzaGxlZHNyMmEvQnJvdGhlci1Mb3VpZS1Nb2Rlcm4tVGFsa2luZy5tcDM/cmxrZXk9OWltMDhld2FjMXpvYnA0em1hYzFpc2puOCZzdD14cmxsaTA1cCZyYXc9MQ==", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2474.jpeg" },
{ "name": "Kaho na kaho", "artist": "Amir jamal,Anu Malik", "url": "aHR0cHM6Ly9kbC5kcm9wYm94dXNlcmNvbnRlbnQuY29tL3NjbC9maS8yNmJlZnF3b2Rwdzl6eHBnOWtrNGkvS2Foby1OYS1LYWhvLVBlbmR1SmF0dC5Db20uU2UubXAzP3Jsa2V5PTl6cnJyajRzbXFtcjFnN3F4aTl1ejZ5a2kmc3Q9Mmt2cTN2N3kmcmF3PTE=", "img": "https://raw.githubusercontent.com/kfw27jmbdw-afk/Apple-music/main/music/IMG_2473.jpeg" },

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


/* ================= CORE PLAYER LOGIC /* ================= CORE PLAYER LOGIC (FIXED & CLEAN) ================= */
async function loadSong(index) {
    currentIndex = index;
    const s = playlist[index];
    if(!s || !audio) return; // Safety check taaki undefined error na aaye

    // 1. UI Updates
    document.getElementById('player-title').innerText = s.name;
    document.getElementById('player-artist').innerText = s.artist;
    document.getElementById('mini-title').innerText = s.name;
    document.getElementById('mini-artist').innerText = s.artist;
    
    // 2. Normal Image Logic (Bina decoding ke seedha GitHub/Direct link support)
    const finalImg = s.img || defaultImg;
    if(mainImg) mainImg.src = finalImg;
    const miniImg = document.getElementById('mini-img');
    if(miniImg) miniImg.src = finalImg;
    
    // 3. Adaptive Color & UI Sync
    updatePlayerAdaptiveColor(finalImg);
    updatePlayingUI(); 
    updateMediaSession(s);

    const mini = document.getElementById('mini-player');
    if(mini) {
        mini.classList.remove('hidden');
        mini.style.display = 'flex';
        mini.style.opacity = '1';
    }

    // 4. Playback Logic with Smart Decoding (Sirf Audio ke liye)
    try {
        const cache = await caches.open('apple-music-v2');
        let decodedURL;
        
        if (s.url.startsWith("http") || s.url.startsWith("music/")) {
            decodedURL = s.url; 
        } else {
            // Base64 Padding Fix taaki encoded audio crash na ho
            let base64String = s.url.trim();
            while (base64String.length % 4 !== 0) { base64String += '='; }
            decodedURL = atob(base64String); 
        }
        
        const songURL = new URL(decodedURL, window.location.origin).href;
        const cachedResponse = await cache.match(songURL);

        if (cachedResponse) {
            const blob = await cachedResponse.blob();
            audio.src = URL.createObjectURL(blob);
        } else {
            audio.src = decodedURL; 
        }
        
        audio.load();

setTimeout(() => {
    audio.play()
        .then(() => updatePlayIcons(true))
        .catch(() => updatePlayIcons(false));
}, 50);
    } catch (e) {
        // Fallback for any errors
        let fallbackURL = (s.url.startsWith("http") || s.url.startsWith("music/")) ? s.url : atob(s.url);
        audio.src = fallbackURL; 
        audio.load();
        audio.play().catch(() => {});
        updatePlayIcons(false);
    }

    audio.onended = () => {
        nextSong(); 
        audio.play().catch(e => {});
    };
} 

function togglePlay() { 
    if(!audio) return;
    if(audio.paused) { 
        audio.play(); 
        updatePlayIcons(true); 
    } else { 
        audio.pause(); 
        updatePlayIcons(false); 
    } 
}



function updatePlayIcons(isPlaying) { 
    const iconClass = isPlaying ? 'fa-pause' : 'fa-play'; 
    const pBtn = document.getElementById('play-btn');
    const mBtn = document.getElementById('mini-play-btn');
    if(pBtn) pBtn.className = `fas ${iconClass}`; 
    if(mBtn) mBtn.className = `fas ${iconClass}`; 

    // Equalizer bars ko pause/play karo
    document.querySelectorAll('.playing-animation').forEach(anim => {
        if(isPlaying) anim.classList.remove('paused');
        else anim.classList.add('paused');
    });
}

function nextSong() { currentIndex = (currentIndex + 1) % playlist.length; loadSong(currentIndex); audio.play(); updatePlayIcons(true); }
function prevSong() { currentIndex = (currentIndex - 1 + playlist.length) % playlist.length; loadSong(currentIndex); audio.play(); updatePlayIcons(true); }

async function renderPlaylist() {
    const container = document.getElementById('song-list-container');
    if(!container) return;
    
    const cache = await caches.open('apple-music-v2');
    const isOffline = !navigator.onLine;
    container.innerHTML = ""; 

    // Loop through the playlist
    for (let index = 0; index < playlist.length; index++) {
        const song = playlist[index];
        
        // 🟢 SAFETY CHECK: Agar array mein koi empty entry ya galti se comma reh gaya ho
        if (!song) continue;

        const div = document.createElement('div');
        div.className = "song-item";
        
        const isCurrent = (index === currentIndex);
        const isPlaying = isCurrent && audio && !audio.paused;
        const isPaused = isCurrent && audio && audio.paused;

        // Offline mode feature
        const isCached = await cache.match(song.url);
        if (isOffline && !isCached) { 
            div.style.opacity = "0.3"; 
            div.style.pointerEvents = "none"; 
        }

        // 🟢 FIX: song.img check taaki undefined crash na ho
        const songImg = song.img || defaultImg;

        div.innerHTML = `
            <div class="song-info-container" onclick="loadSong(${index});">
                <img src="${songImg}">
                <div>
                    <h4 style="color: ${isCurrent ? '#1DB954' : 'white'}">${song.name || 'Unknown Title'}</h4>
                    <p>${song.artist || 'Unknown Artist'}</p>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                ${isCurrent ? `
                    <div class="playing-animation ${isPaused ? 'paused' : ''}">
                        <span></span><span></span><span></span>
                    </div>` : ''}
                <div class="song-menu-btn" onclick="event.stopPropagation(); openSongMenu(event, ${index})">
                    <i class="fas fa-ellipsis-v"></i>
                </div>
            </div>`;

        container.appendChild(div);
    }
    
    // Status sync update
    if (typeof updatePlayingUI === "function") {
        updatePlayingUI();
    }
}



function updatePlayIcons(isPlaying) {
    const iconClass = isPlaying ? 'fa-pause' : 'fa-play';
    const pBtn = document.getElementById('play-btn');
    const mBtn = document.getElementById('mini-play-btn');
    if(pBtn) pBtn.className = `fas ${iconClass}`;
    if(mBtn) mBtn.className = `fas ${iconClass}`;

    // Saare animation bars ko control karo (Browse aur Playlist dono)
    document.querySelectorAll('.playing-animation').forEach(anim => {
        if(isPlaying) anim.classList.remove('paused');
        else anim.classList.add('paused');
    });
}





/* ================= FIXED: SEEK BAR & TIME UPDATE ================= */
if(audio) {
    audio.ontimeupdate = () => {
        if(audio.duration) {
            const seekBar = document.getElementById('seek-bar');
            const currentText = document.getElementById('current');
            const durationText = document.getElementById('duration');

            // Bar update
            if(seekBar) seekBar.value = (audio.currentTime / audio.duration) * 100;
            
            // Time text update (00:00)
            if(currentText) currentText.innerText = formatTime(audio.currentTime);
            if(durationText) durationText.innerText = formatTime(audio.duration);
        }
    };
}

// Drag karne par gaana aage-piche karne ke liye
function seekSong() { 
    if (audio && audio.duration) {
        const seekBar = document.getElementById('seek-bar');
        audio.currentTime = (seekBar.value / 100) * audio.duration;
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

/* ================= FINAL UPDATED OPEN PLAYLIST DETAIL (FIXED) ================= */
function openPlaylistDetail(playlistName) {
    const container = document.getElementById('library-content-area');
    const subNavs = document.querySelectorAll('.library-sub-nav');
    
    // 1. UI Clean-up
    const libHeader = document.querySelector('.library-header');
    if(libHeader) libHeader.style.display = 'none'; 
    
    subNavs.forEach(nav => nav.style.setProperty('display', 'none', 'important'));
    container.classList.remove('grid-view');

    const songIndices = userLibrary.playlists[playlistName] || [];
    const thumb = (userLibrary.playlistThumbs && userLibrary.playlistThumbs[playlistName]) 
                  ? userLibrary.playlistThumbs[playlistName] 
                  : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300';

    // 2. Header Render
    container.innerHTML = `
        <div class="playlist-detail-header" id="playlist-header-bg" 
             style="display: flex; flex-direction: column; align-items: center; padding: 10px 20px; margin-top: 0; transition: background 0.5s ease;">
            
            <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 10px; padding-top: 5px;">
                <div onclick="backToLibraryPlaylists()" style="background: rgba(0,0,0,0.4); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor:pointer;">
                    <i class="fas fa-chevron-left" style="font-size: 14px; color: white;"></i>
                </div>
                <div onclick="document.getElementById('pl-cover-upload').click()" style="background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 20px; color: white; cursor:pointer; font-size: 11px; font-weight: bold; border: 1px solid rgba(255,255,255,0.2);">
                    Edit Cover
                </div>
            </div>

            <input type="file" id="pl-cover-upload" hidden accept="image/*" onchange="uploadPlaylistCover(event, '${playlistName}')">

            <img id="pl-detail-img" src="${thumb}" 
                 style="width: 170px; height: 170px; border-radius: 6px; object-fit: cover; box-shadow: 0 10px 35px rgba(0,0,0,0.6);">
            
            <div style="text-align: center; margin-top: 12px;">
                <h1 style="font-size: 24px; font-weight: 800; color: white; margin: 0; letter-spacing: -0.5px;">${playlistName}</h1>
                <p style="color: rgba(255,255,255,0.6); margin-top: 2px; font-size: 12px; font-weight: 500;">Playlist • ${songIndices.length} songs</p>
            </div>
            
            <div onclick="deletePlaylist('${playlistName}')" style="margin-top: 8px; color: rgba(255,255,255,0.25); cursor:pointer; font-size: 11px;">
                <i class="fas fa-trash"></i> Delete
            </div>
        </div>

        <div id="playlist-internal-songs" style="padding: 5px 0 160px 0; background: transparent;"></div>
    `;

    updatePlaylistAdaptiveColor(thumb);

    const listArea = document.getElementById('playlist-internal-songs');
    if (songIndices.length === 0) {
        listArea.innerHTML = `<p style="text-align:center; padding:40px; color:#666;">No songs yet.</p>`;
    } else {
        songIndices.forEach(idx => {
            const song = playlist[idx];
            
            // 🟢 SAFETY CHECK: Agar gaana undefined hai toh skip karo
            if (!song) return; 

            const div = document.createElement('div');
            div.className = "song-item";
            div.id = `song-item-${idx}`; 
            div.innerHTML = `
                <div class="song-info-container" onclick="loadSong(${idx}); maximizePlayer(); if(audio) audio.play(); updatePlayIcons(true);">
                    <img src="${song.img || defaultImg}" style="border-radius: 4px; width: 45px; height: 45px;">
                    <div>
                        <h4 class="song-name-text" style="font-size: 14px; margin-bottom: 2px;">${song.name || 'Unknown'}</h4>
                        <p style="font-size: 12px;">${song.artist || 'Unknown'}</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div class="status-container"></div>
                    <div class="song-menu-btn" onclick="confirmRemoveFromPlaylist(event, '${playlistName}', ${idx})">
                        <i class="fas fa-trash-alt" style="color: rgba(255,255,255,0.15); font-size: 13px;"></i>
                    </div>
                </div>`;
            listArea.appendChild(div);
        });
    }
    updatePlayingUI();
}


/* ================= UI SYNC FUNCTION ================= */
function updatePlayingUI() {
    // 1. Purani saari highlights aur animations hatao
    document.querySelectorAll('.song-item h4').forEach(h4 => h4.style.color = 'white');
    document.querySelectorAll('.playing-animation').forEach(a => a.remove());

    if (!audio || !audio.src) return;

    // 2. Sabhi gaano ki list mein current gaana dhoondho
    const allItems = document.querySelectorAll('.song-item');
    allItems.forEach((item, idx) => {
        const infoContainer = item.querySelector('.song-info-container');
        const onclickAttr = infoContainer ? infoContainer.getAttribute('onclick') : null;
        const match = onclickAttr ? onclickAttr.match(/loadSong\((\d+)\)/) : null;
        
        if (match && parseInt(match[1]) === currentIndex) {
            // 3. Naam ko green karo
            const title = item.querySelector('h4');
            if (title) title.style.color = '#1DB954';

            // 4. Animation bars ko yahan dalo (Inject bars)
            const statusContainer = item.querySelector('.status-container') || item.querySelector('div[style*="display: flex"]');
            if (statusContainer) {
                const isPaused = audio.paused;
                // Pehle check karo animation hai ya nahi, fir dalo
                if (!statusContainer.querySelector('.playing-animation')) {
                    const animDiv = document.createElement('div');
                    animDiv.className = `playing-animation ${isPaused ? 'paused' : ''}`;
                    animDiv.innerHTML = `<span></span><span></span><span></span>`;
                    statusContainer.prepend(animDiv); // Bars ko menu button se pehle dalo
                }
            }
        }
    });
}




/**
 * Playlist detail se wapas Library par jaane ka logic
 */
function backToLibraryPlaylists() {
    // 1. Ye lines buttons (Download, Playlist, Fav) ko wapas dikhati hain
    const subNavs = document.querySelectorAll('.library-sub-nav');
    subNavs.forEach(nav => nav.style.setProperty('display', 'flex', 'important'));
    
    // 2. Full screen color ko wapas default black karo
    // document.documentElement use karne se upar ka black area bhi reset hoga
    document.documentElement.style.setProperty('--pl-pl-bg-color', '#121212');
    document.documentElement.style.setProperty('--pl-bg-color', '#121212');
    
    // 3. Wapas library ki main screen par jao
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
        
        // --- FIX STARTS HERE ---
        // 1. Library Title aur Sub-Nav (Download, Playlist buttons) wapas dikhao
        const libHeader = document.querySelector('.library-header');
        if(libHeader) libHeader.style.display = 'block'; 
        
        const subNavs = document.querySelectorAll('.library-sub-nav');
        subNavs.forEach(nav => nav.style.setProperty('display', 'flex', 'important'));

        // 2. Color reset karo taaki black patti na aaye
        document.documentElement.style.setProperty('--pl-bg-color', '#121212');

        // 3. Default view 'playlists' par set karo
        renderLibraryContent('playlists'); 
        
        // Buttons mein active class update karo
        document.querySelectorAll('.sub-nav-btn').forEach(btn => btn.classList.remove('active'));
        const plBtn = document.querySelector('[onclick*="playlists"]');
        if(plBtn) plBtn.classList.add('active');
        // --- FIX ENDS HERE ---

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
/* ================= FEATURE: BACKGROUND DOWNLOAD ================= */
/* ================= COMPLETE UPGRADED DOWNLOAD BLOCK ================= */
/* ================= FULL UPDATED DOWNLOAD /* ================= FEATURE: BACKGROUND DOWNLOAD (FIXED) ================= */
async function handleDownload() {
    if (selectedMenuIndex === null || selectedMenuIndex === undefined) {
        showTempMessage("Please select a song first!");
        return;
    }

    if (!userLibrary.downloaded) { userLibrary.downloaded = []; }

    const song = playlist[selectedMenuIndex];
    let finalURL;

    // 🟢 STEP 1: Pehle Base64 link ko asli URL mein badlo
    try {
        if (song.url.startsWith("http") || song.url.startsWith("music/")) {
            finalURL = song.url; 
        } else {
            // Padding fix taaki decoding crash na ho
            let base64String = song.url.trim();
            while (base64String.length % 4 !== 0) { base64String += '='; }
            finalURL = atob(base64String); 
        }
    } catch (e) {
        console.error("URL Decoding Failed", e);
        showTempMessage("Invalid Song URL!");
        return;
    }

    // 🟢 STEP 2: Browser ko batao ye ek valid web address hai
    const songURL = new URL(finalURL, window.location.origin).href;
    
    const progressContainer = document.getElementById('download-progress-container');
    const progressBar = document.getElementById('download-progress-bar');
    
    if (progressContainer) progressContainer.style.display = 'block';
    showTempMessage("Downloading " + song.name);

    try {
        // 🟢 STEP 3: Asli URL se gaana fetch karo
        const response = await fetch(songURL, { mode: 'cors' });
        if (!response.ok) throw new Error("Network error");

        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length'); 
        
        let receivedLength = 0; 
        let chunks = []; 

        while(true) {
            const {done, value} = await reader.read();
            if (done) break;
            chunks.push(value);
            receivedLength += value.length;
            if (contentLength && progressBar) {
                progressBar.style.width = (receivedLength / contentLength) * 100 + "%";
            }
        }

        const blob = new Blob(chunks, { type: 'audio/mpeg' }); 
        const cache = await caches.open('apple-music-v2');
        
        const responseToCache = new Response(blob, {
            headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': blob.size }
        });

        // 🟢 STEP 4: Cache mein asli URL ke naam se save karo
        await cache.put(songURL, responseToCache);

        if (!userLibrary.downloaded.includes(selectedMenuIndex)) {
            userLibrary.downloaded.push(selectedMenuIndex);
            saveLibraryToDisk();
        }

        showTempMessage("Saved for Offline: " + song.name);
        renderPlaylist();

    } catch (err) {
        console.error("Download failed:", err);
        showTempMessage("Download failed: Network/CORS Issue");
    } finally {
        setTimeout(() => { if (progressContainer) progressContainer.style.display = 'none'; }, 500);
        const menu = document.getElementById('song-options-menu');
        if (menu) menu.style.display = 'none';
    }
}



/* ================= TEMP MESSAGE HELPER ================= */
function showTempMessage(msg) {
    let div = document.getElementById('temp-msg');
    if (!div) {
        div = document.createElement('div');
        div.id = 'temp-msg';
        div.style.position = 'fixed';
        div.style.top = '10px';
        div.style.left = '50%';
        div.style.transform = 'translateX(-50%)';
        div.style.background = 'rgba(0,0,0,0.8)';
        div.style.color = 'white';
        div.style.padding = '10px 20px';
        div.style.borderRadius = '10px';
        div.style.zIndex = '9999';
        div.style.transition = 'opacity 0.3s ease';
        div.style.opacity = '0';
        document.body.appendChild(div);
    }
    div.innerText = msg;
    div.style.opacity = '1';
    setTimeout(() => { div.style.opacity = '0'; }, 2500);
}
/* ================= DOWNLOADED SONGS RENDER FIXED ================= */
/*/* ================= FEATURE: DOWNLOADED SONGS SCANNER ================= */
function renderDownloadedSongs() {
    const container = document.getElementById('library-content-area');
    if (!container) return;
    container.innerHTML = "";

    if (!userLibrary.downloaded || userLibrary.downloaded.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px; color:#666;"><p>No downloads</p></div>`;
        return;
    }

    userLibrary.downloaded.forEach(index => {
        const song = playlist[index];
        if (!song) return;
        const div = document.createElement('div');
        div.className = "song-item";
        // 🟢 Yahan status-container add kiya hai animation ke liye
        div.innerHTML = `
            <div class="song-info-container" onclick="loadSong(${index});">
                <img src="${song.img || defaultImg}">
                <div><h4>${song.name}</h4><p>${song.artist}</p></div>
            </div>
            <div class="status-container" style="display: flex; align-items: center; padding-right: 15px;"></div>`;
        container.appendChild(div);
    });
    updatePlayingUI(); // 🟢 Sync status immediately
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
        // 🟢 Yahan bhi status-container add kar diya
        div.innerHTML = `
            <div class="song-info-container" onclick="loadSong(${idx});">
                <img src="${song.img || defaultImg}">
                <div><h4>${song.name}</h4><p>${song.artist}</p></div>
            </div>
            <div class="status-container" style="display: flex; align-items: center; padding-right: 15px;"></div>`;
        container.appendChild(div);
    });
    updatePlayingUI(); // 🟢 Sync status
}



function openSongMenu(e, index) {
    e.stopPropagation(); selectedMenuIndex = index;
    const menu = document.getElementById('song-options-menu');
    menu.style.display = 'block'; menu.style.left = (e.clientX - 150) + "px"; menu.style.top = e.clientY + "px";
}

async function updateMediaSession(s) {
    if (!('mediaSession' in navigator)) return;

    // 1. Branding wala Artwork generate karne ka function
    const getBrandedImg = (imgSrc) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = imgSrc;

            img.onload = () => {
                canvas.width = 1000; // High quality size
                canvas.height = 1000;

                // Main Cover Image draw karo
                ctx.drawImage(img, 0, 0, 1000, 1000);

                // 2.  Music Branding Style
                ctx.fillStyle = "rgba(0,0,0,0.5)"; // Thoda dark overlay corner mein
                ctx.roundRect(750, 40, 210, 60, 30); // Logo background
                ctx.fill();

                ctx.fillStyle = "white";
                ctx.font = "bold 40px -apple-system, sans-serif";
                ctx.fillText(" Music", 780, 82); // Logo Text

                resolve(canvas.toDataURL("image/jpeg", 0.8));
            };
            img.onerror = () => resolve(imgSrc); // Fallback agar image fail ho
        });
    };

    // 3. Lock Screen par metadata set karo
    const brandedCover = await getBrandedImg(s.img || defaultImg);

    navigator.mediaSession.metadata = new MediaMetadata({
        title: s.name,
        artist: s.artist,
        album: " Music", // Album name ki jagah branding
        artwork: [
            { src: brandedCover, sizes: '512x512', type: 'image/jpeg' }
        ]
    });
}

/* =================  HOME ENGINE INITIALIZATION ================= */

// 1. History aur Mix ko track karne ke liye variables
let recentPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
let dailyMixIndices = []; // Made For You ko stable rakhne ke liye

// Made For You generation (Sirf app khulte hi ya naye session par)
function generateDailyMix() {
    dailyMixIndices = [...Array(playlist.length).keys()]
        .sort(() => 0.5 - Math.random())
        .slice(0, 8); // Top 8 random songs
}

// Recently Played logic
function addToRecent(index) {
    recentPlayed = recentPlayed.filter(i => i !== index);
    recentPlayed.unshift(index);
    if(recentPlayed.length > 15) recentPlayed.pop(); // Limit history to 15
    localStorage.setItem('recentlyPlayed', JSON.stringify(recentPlayed));
    
    // Agar user home screen par hai toh turant UI update karo
    if(document.getElementById('home-screen').style.display !== 'none') {
        renderHomeScreen(); 
    }
}

// loadSong override (History update karne ke liye)
const originalLoadSong = loadSong;
loadSong = function(index) {
    originalLoadSong(index);
    addToRecent(index);
};

// Main Home Rendering Function
function renderHomeScreen() {
    const container = document.getElementById('recent-played-container');
    if (!container) return;
    container.innerHTML = "";

    let homeHTML = "";

    // --- ROW 1: RECENTLY PLAYED ---
    if(recentPlayed.length > 0) {
        homeHTML += createHomeRow("Recently Played", recentPlayed, true);
    }

    // --- ROW 2: MADE FOR YOU (Uses Stable Mix) ---
    if(dailyMixIndices.length === 0) generateDailyMix();
    homeHTML += createHomeRow("Made For You", dailyMixIndices, false);

    // --- ROW 3+: USER PLAYLISTS (Dynamic Sync) ---
    const currentLib = JSON.parse(localStorage.getItem('userLibrary')) || userLibrary;
    if (currentLib.playlists) {
        Object.keys(currentLib.playlists).forEach(name => {
            const indices = currentLib.playlists[name];
            // Sirf wahi playlist dikhao jisme gaane hon
            if(indices && indices.length > 0) {
                homeHTML += createHomeRow(name, indices, false);
            }
        });
    }

    container.innerHTML = homeHTML || `<p style="text-align:center; margin-top:50px; color:#444;">No Music Found</p>`;
}

// Home Row Generator
function createHomeRow(title, indices, showSeeAll) {
    let row = `
        <div class="home-section" style="margin-bottom: 35px; padding-left: 15px;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding-right:15px; margin-bottom:12px;">
                <h2 style="font-size:22px; margin:0; font-weight:700; letter-spacing:-0.5px;">${title}</h2>
                ${showSeeAll ? `<span onclick="showFullRecentList()" style="color:#ff3b30; font-size:14px; font-weight:500; cursor:pointer;">See All</span>` : ''}
            </div>
            <div class="scroll-row" style="display:flex; overflow-x:auto; gap:15px; scrollbar-width:none; padding-bottom:5px;">`;

    indices.forEach(idx => {
        const s = playlist[idx];
        if(s) {
            row += `
                <div class="home-card" onclick="loadSong(${idx});" style="min-width:145px; max-width:145px; cursor:pointer;">
                    <img src="${s.img || defaultImg}" style="width:145px; height:145px; border-radius:12px; object-fit:cover; box-shadow:0 8px 20px rgba(0,0,0,0.5); background:#1c1c1e;">
                    <p style="margin:10px 0 2px; font-size:13px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.name}</p>
                    <span style="font-size:11px; color:#8e8e93;">${s.artist}</span>
                </div>`;
        }
    });

    row += `</div></div>`;
    return row;
}

// Full History View (See All)
function showFullRecentList() {
    const container = document.getElementById('recent-played-container');
    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="display:flex; align-items:center; gap:15px; margin-bottom:20px;">
                <i class="fas fa-chevron-left" onclick="renderHomeScreen()" style="font-size:20px; color:#ff3b30; cursor:pointer;"></i>
                <h2 style="margin:0;">Recently Played</h2>
            </div>
            <div id="full-recent-list"></div>
        </div>`;
    
    const listArea = document.getElementById('full-recent-list');
    recentPlayed.forEach(idx => {
        const s = playlist[idx];
        if(s) {
            const div = document.createElement('div');
            div.className = "song-item";
            div.innerHTML = `
                <div class="song-info-container" onclick="loadSong(${idx})">
                    <img src="${s.img || defaultImg}" style="width:50px; height:50px; border-radius:6px;">
                    <div><h4>${s.name}</h4><p>${s.artist}</p></div>
                </div>`;
            listArea.appendChild(div);
        }
    });
}



/* =================  FINAL INITIALIZATION FIX ================= */
window.addEventListener('load', async () => { 
    // 1. Home screen ko default set karo
    document.querySelectorAll('.tab-content').forEach(screen => screen.style.display = 'none');
    document.getElementById('home-screen').style.display = 'block';
    
    // 2. Navigation items mein Home highlight karo
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById('tab-home').classList.add('active');

    // 3. Pehle playlist load hone ka wait karo
    await renderPlaylist(); 

    // 4. Ab Home Screen render karo (Taki playlist empty na mile)
    renderHomeScreen(); 

    // 5. Full Player aur Mini Player ko shuruat mein hide rakho
    if(playerScreen) {
        playerScreen.style.display = 'none';
        playerScreen.classList.add('minimized');
    }
    const mini = document.getElementById('mini-player');
    if(mini) mini.style.display = 'none'; 
});


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
/**
 * Equalizer bars generate karne ka function
 */
function getPlayingAnimation() {
    return `
        <div class="playing-animation">
            <span></span>
            <span></span>
            <span></span>
        </div>`;
}
/* ================= PLAYLIST COVER & COLOR LOGIC ================= */

/**
 * 1. Playlist ki photo badalne aur save karne ke liye
 */
function uploadPlaylistCover(event, playlistName) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const newImg = e.target.result;
            
            // UI par turant photo badlo
            const plImg = document.getElementById('pl-detail-img');
            if(plImg) plImg.src = newImg;
            
            // Library Object mein save karo
            if (!userLibrary.playlistThumbs) userLibrary.playlistThumbs = {};
            userLibrary.playlistThumbs[playlistName] = newImg;
            
            // Disk par permanent save karo
            saveLibraryToDisk();
            
            // Background color bhi update karo
            updatePlaylistAdaptiveColor(newImg);
            
            // Library screen refresh karo taaki thumbnail wahan bhi dikhe
            renderLibraryContent('playlists');
        };
        reader.readAsDataURL(file);
    }
}

/**
/* ================= ADAPTIVE COLOR FIX ================= */
function updatePlaylistAdaptiveColor(imgSrc) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgSrc;
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 1; canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        const d = ctx.getImageData(0,0,1,1).data;
        const rgb = `rgb(${Math.floor(d[0]*0.6)},${Math.floor(d[1]*0.6)},${Math.floor(d[2]*0.6)})`;
        document.documentElement.style.setProperty('--pl-bg-color', rgb);
    };
} // 🟢 File ends here with correct bracket balance



