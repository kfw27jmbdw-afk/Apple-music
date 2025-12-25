const audio = document.getElementById('main-audio');
const playerScreen = document.getElementById('player-screen');
const img = document.getElementById('song-image');
const defaultImg = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300";

let playlist = [
    { "name": "Sapne", "artist": "Artcriminal", "url": "https://files.catbox.moe/41aleb.mp3", "img": "" },
    { "name": "2 Gulab", "artist": "Billa Sonipat aala", "url": "https://files.catbox.moe/eg7n5l.mp3", "img": "https://files.catbox.moe/h7bvl8.jpeg" },
    { "name": "Yaran gail", "artist": "Billa sonipat aala", "url": "https://files.catbox.moe/2qgwyk.mp3", "img": "https://files.catbox.moe/iswwju.jpeg" },
    { "name": "AZUL", "artist": "Guru Randhawa", "url": "https://files.catbox.moe/z811bh.mp3", "img": "https://files.catbox.moe/85n1j0.jpeg" }
];

let currentIndex = 0;

// --- FEATURE 1: Color Change with Song Cover ---
img.onload = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1; canvas.height = 1;
    ctx.drawImage(img, 0, 0, 1, 1);
    const d = ctx.getImageData(0,0,1,1).data;
    document.documentElement.style.setProperty('--bg-color', `rgb(${d[0]},${d[1]},${d[2]})`);
};

function loadSong(index) {
    currentIndex = index;
    const s = playlist[index];
    audio.src = s.url;
    
    // UI Update
    document.getElementById('player-title').innerText = s.name;
    document.getElementById('player-artist').innerText = s.artist;
    document.getElementById('mini-title').innerText = s.name;
    document.getElementById('mini-artist').innerText = s.artist;
    img.src = s.img || defaultImg;
    document.getElementById('mini-img').src = s.img || defaultImg;

    // --- CHATGPT FIX: Lock Screen Info (Media Metadata) ---
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: s.name,
            artist: s.artist,
            album: 'Apple Music Clone',
            artwork: [{ src: s.img || defaultImg, sizes: '512x512', type: 'image/png' }]
        });
        setupMediaSessionControls(); // ChatGPT fix for Lock Screen Buttons
    }
    renderPlaylist();
}

// --- CHATGPT FIX: Lock Screen Next/Prev/Pause ---
function setupMediaSessionControls() {
    navigator.mediaSession.setActionHandler('play', () => { audio.play(); updatePlayIcons(true); });
    navigator.mediaSession.setActionHandler('pause', () => { audio.pause(); updatePlayIcons(false); });
    navigator.mediaSession.setActionHandler('previoustrack', () => prevSong());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
}

// --- FEATURE 2: Add Cover from Gallery ---
document.getElementById('cover-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const r = new FileReader();
        r.onload = (ev) => {
            img.src = ev.target.result;
            document.getElementById('mini-img').src = ev.target.result;
            playlist[currentIndex].img = ev.target.result;
            renderPlaylist();
            document.getElementById('side-menu').style.display='none';
        };
        r.readAsDataURL(file);
    }
});

// --- FEATURE 3: Add Song with Link ---
function addNewSong() {
    const name = document.getElementById('new-name').value;
    const url = document.getElementById('new-url').value;
    if(!name || !url) return alert("Bhai, Details dalo!");
    
    playlist.push({ name, artist: document.getElementById('new-artist').value || "Unknown", url, img: document.getElementById('new-img').value });
    document.getElementById('final-code').value = `let playlist = ${JSON.stringify(playlist, null, 4)};`;
    document.getElementById('export-area').style.display = 'block';
    renderPlaylist();
}

// --- Baki UI Logic (Drag, Play, Render) ---
function renderPlaylist() {
    const container = document.getElementById('song-list-container');
    container.innerHTML = "";
    playlist.forEach((song, index) => {
        const div = document.createElement('div');
        div.className = "song-item";
        div.innerHTML = `<img src="${song.img || defaultImg}"><div><h4>${song.name}</h4><p>${song.artist}</p></div>`;
        div.onclick = () => { loadSong(index); maximizePlayer(); audio.play(); updatePlayIcons(true); };
        container.appendChild(div);
    });
}

function togglePlay() { audio.paused ? (audio.play(), updatePlayIcons(true)) : (audio.pause(), updatePlayIcons(false)); }
function updatePlayIcons(p) { const i = p ? 'fa-pause' : 'fa-play'; document.getElementById('play-btn').className=`fas ${i}`; document.getElementById('mini-play-btn').className=`fas ${i}`; }
function nextSong() { currentIndex=(currentIndex+1)%playlist.length; loadSong(currentIndex); audio.play(); updatePlayIcons(true); }
function prevSong() { currentIndex=(currentIndex-1+playlist.length)%playlist.length; loadSong(currentIndex); audio.play(); updatePlayIcons(true); }
function minimizePlayer() { playerScreen.classList.add('minimized'); }
function maximizePlayer() { playerScreen.classList.remove('minimized'); }
function formatTime(s) { let m=Math.floor(s/60), sc=Math.floor(s%60); return `${m}:${sc < 10 ? '0'+sc : sc}`; }

audio.ontimeupdate = () => {
    if(audio.duration) document.getElementById('seek-bar').value = (audio.currentTime/audio.duration)*100;
    document.getElementById('current').innerText = formatTime(audio.currentTime);
    document.getElementById('duration').innerText = formatTime(audio.duration);
};

loadSong(0);

/* ================= TOGGLE MENU FIX ================= */
function toggleMenu() {
    const m = document.getElementById('side-menu');
    if (m) {
        m.style.display = (m.style.display === 'block') ? 'none' : 'block';
    }
}

/* ================= MISSING UI FUNCTIONS (Restored) ================= */

// 1. Add Song Form ko kholne aur band karne ke liye
function openForm() { document.getElementById('add-music-form').style.display = 'block'; }
function closeForm() { document.getElementById('add-music-form').style.display = 'none'; }

// 2. Naya gaana temporary add karne aur code generate karne ke liye
function addNewSong() {
    const name = document.getElementById('new-name').value;
    const artist = document.getElementById('new-artist').value || "Unknown";
    const url = document.getElementById('new-url').value;
    const imgUrl = document.getElementById('new-img').value;

    if(!name || !url) return alert("Bhai, Name aur URL toh dalo!");

    // Playlist array mein naya gaana joddna
    playlist.push({ name, artist, url, img: imgUrl });

    // GitHub par update karne ke liye code generate karna
    document.getElementById('final-code').value = `let playlist = ${JSON.stringify(playlist, null, 4)};`;
    document.getElementById('export-area').style.display = 'block';
    
    renderPlaylist(); // List ko refresh karna
    alert("Gaana add ho gaya! Neeche se code copy karke GitHub file update kar dena.");
}

// 3. Generated code ko copy karne ke liye (iOS friendly)
function copyToClipboard() {
    const area = document.getElementById('final-code');
    area.select();
    area.setSelectionRange(0, 99999); // Mobile selection fix
    navigator.clipboard.writeText(area.value).then(() => {
        alert("Playlist Code Copy ho gaya! Ise GitHub ke script.js mein replace kar do.");
    });
}

// 4. Like button ka logic
function toggleLike() {
    const btn = document.getElementById('like-btn');
    if(!btn) return;
    btn.classList.toggle('far'); 
    btn.classList.toggle('fas');
    btn.style.color = btn.classList.contains('fas') ? '#1DB954' : '#fff';
}

// 5. Menu kholne/band karne ka logic (Jo pehle missing tha)
function toggleMenu() { 
    const m = document.getElementById('side-menu');
    if(m) m.style.display = (m.style.display === 'block') ? 'none' : 'block';
}


