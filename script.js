const audio = document.getElementById('main-audio');
const playerScreen = document.getElementById('player-screen');
const img = document.getElementById('song-image');
const defaultImg = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300";

audio.preload = "none";
audio.playsInline = true;

let audioUnlocked = false;

/* iOS AUDIO UNLOCK */
function unlockAudioIOS() {
    if (audioUnlocked) return;

    audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audioUnlocked = true;
    }).catch(()=>{});

    document.removeEventListener('click', unlockAudioIOS);
    document.removeEventListener('touchstart', unlockAudioIOS);
}

document.addEventListener('click', unlockAudioIOS);
document.addEventListener('touchstart', unlockAudioIOS);

/* SAFE PLAY */
function safePlay() {
    audio.play().then(() => {
        updatePlayIcons(true);
    }).catch(()=>{});
}

let playlist = [
    { name: "Sapne", artist: "Artcriminal", url: "https://files.catbox.moe/41aleb.mp3", img: "" },
    { name: "2 Gulab", artist: "Billa Sonipat aala", url: "https://files.catbox.moe/eg7n5l.mp3", img: "https://files.catbox.moe/h7bvl8.jpeg" },
    { name: "Yaran gail", artist: "Billa sonipat aala", url: "https://files.catbox.moe/2qgwyk.mp3", img: "https://files.catbox.moe/iswwju.jpeg" },
    { name: "AZUL", artist: "Guru Randhawa", url: "https://files.catbox.moe/z811bh.mp3", img: "https://files.catbox.moe/85n1j0.jpeg" },
    { name: "Pan india", artist: "Guru randhawa", url: "https://files.catbox.moe/vbewzx.mp3", img: "https://files.catbox.moe/uzltk5.jpeg" },
    { name: "Perfect", artist: "Guru randhawa", url: "https://files.catbox.moe/l6goey.mp3", img: "https://files.catbox.moe/k6emom.webp" }
];

let currentIndex = 0;

/* PLAYLIST RENDER */
function renderPlaylist() {
    const container = document.getElementById('song-list-container');
    container.innerHTML = "";

    playlist.forEach((song, index) => {
        const div = document.createElement('div');
        div.className = "song-item";
        div.innerHTML = `
            <img src="${song.img || defaultImg}">
            <div>
                <h4>${song.name}</h4>
                <p>${song.artist}</p>
            </div>
        `;
        div.onclick = () => {
            loadSong(index);
            maximizePlayer();
            safePlay();
        };
        container.appendChild(div);
    });
}

/* LOAD SONG */
function loadSong(index) {
    currentIndex = index;
    const s = playlist[index];

    audio.src = s.url;
    audio.pause();

    document.getElementById('player-title').innerText = s.name;
    document.getElementById('player-artist').innerText = s.artist;
    document.getElementById('mini-title').innerText = s.name;
    document.getElementById('mini-artist').innerText = s.artist;

    img.src = s.img || defaultImg;
    document.getElementById('mini-img').src = s.img || defaultImg;

    renderPlaylist();
}

/* SEEK */
function seekSong() {
    const seekBar = document.getElementById('seek-bar');
    const time = (seekBar.value / 100) * audio.duration;
    if (!isNaN(time)) audio.currentTime = time;
}

audio.ontimeupdate = () => {
    if (!audio.duration) return;

    document.getElementById('seek-bar').value = (audio.currentTime / audio.duration) * 100;
    document.getElementById('current').innerText = formatTime(audio.currentTime);
    document.getElementById('duration').innerText = formatTime(audio.duration);
};

/* BG COLOR */
img.onload = function() {
    const c = document.createElement('canvas');
    const x = c.getContext('2d');
    c.width = c.height = 1;
    x.drawImage(img, 0, 0, 1, 1);
    const d = x.getImageData(0,0,1,1).data;
    document.documentElement.style.setProperty('--bg-color', `rgb(${d[0]},${d[1]},${d[2]})`);
};

/* DRAG */
let startY = 0;
const drag = document.getElementById('drag-area');

drag.addEventListener('touchstart', e => startY = e.touches[0].clientY);
drag.addEventListener('touchmove', e => {
    const diff = e.touches[0].clientY - startY;
    if (diff > 0) playerScreen.style.transform = `translateY(${diff}px)`;
});
drag.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientY - startY;
    diff > 120 ? minimizePlayer() : maximizePlayer();
});

/* CONTROLS */
function togglePlay() {
    if (audio.paused) safePlay();
    else {
        audio.pause();
        updatePlayIcons(false);
    }
}

function nextSong() {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadSong(currentIndex);
    safePlay();
}

function prevSong() {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentIndex);
    safePlay();
}

function updatePlayIcons(p) {
    const i = p ? 'fa-pause' : 'fa-play';
    document.getElementById('play-btn').className = `fas ${i}`;
    document.getElementById('mini-play-btn').className = `fas ${i}`;
}

/* UI */
function minimizePlayer() { playerScreen.classList.add('minimized'); playerScreen.style.transform=''; }
function maximizePlayer() { playerScreen.classList.remove('minimized'); playerScreen.style.transform=''; }
function toggleMenu() {
    const m = document.getElementById('side-menu');
    m.style.display = m.style.display === 'block' ? 'none' : 'block';
}
function toggleLike() {
    const b = document.getElementById('like-btn');
    b.classList.toggle('fas');
    b.classList.toggle('far');
    b.style.color = b.classList.contains('fas') ? '#1DB954' : '#fff';
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sc = Math.floor(s % 60);
    return `${m}:${sc < 10 ? '0' + sc : sc}`;
}

/* INIT */
loadSong(0);
audio.pause();