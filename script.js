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
}

function seekSong() {
    const seekBar = document.getElementById('seek-bar');
    const time = (seekBar.value / 100) * audio.duration;
    if (!isNaN(time)) audio.currentTime = time;
}

audio.ontimeupdate = () => {
    if (audio.duration) {
        document.getElementById('seek-bar').value = (audio.currentTime / audio.duration) * 100;
        document.getElementById('current').innerText = formatTime(audio.currentTime);
        document.getElementById('duration').innerText = formatTime(audio.duration);
    }
};

// Adaptive Background
img.onload = function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1; canvas.height = 1;
    ctx.drawImage(img, 0, 0, 1, 1);
    const d = ctx.getImageData(0,0,1,1).data;
    document.documentElement.style.setProperty('--bg-color', `rgb(${d[0]},${d[1]},${d[2]})`);
};

// Drag to Minimize
let startY = 0;
document.getElementById('drag-area').addEventListener('touchstart', (e) => startY = e.touches[0].clientY);
document.getElementById('drag-area').addEventListener('touchmove', (e) => {
    let diff = e.touches[0].clientY - startY;
    if (diff > 0) playerScreen.style.transform = `translateY(${diff}px)`;
});
document.getElementById('drag-area').addEventListener('touchend', (e) => {
    let diff = e.changedTouches[0].clientY - startY;
    if (diff > 120) minimizePlayer(); else maximizePlayer();
});

function togglePlay() {
    if (audio.paused) { audio.play(); updatePlayIcons(true); }
    else { audio.pause(); updatePlayIcons(false); }
}

function updatePlayIcons(playing) {
    const icon = playing ? 'fa-pause' : 'fa-play';
    document.getElementById('play-btn').className = `fas ${icon}`;
    document.getElementById('mini-play-btn').className = `fas ${icon}`;
}

function toggleMenu() { 
    const m = document.getElementById('side-menu');
    m.style.display = (m.style.display === 'block') ? 'none' : 'block';
}

function toggleLike() {
    const btn = document.getElementById('like-btn');
    btn.classList.toggle('far'); btn.classList.toggle('fas');
    btn.style.color = btn.classList.contains('fas') ? '#1DB954' : '#fff';
}

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

function minimizePlayer() { playerScreen.classList.add('minimized'); playerScreen.style.transform = ''; }
function maximizePlayer() { playerScreen.classList.remove('minimized'); playerScreen.style.transform = ''; }
function formatTime(s) { let m=Math.floor(s/60), sc=Math.floor(s%60); return `${m}:${sc < 10 ? '0'+sc : sc}`; }
function nextSong() { currentIndex=(currentIndex+1)%playlist.length; loadSong(currentIndex); audio.play(); updatePlayIcons(true); }
function prevSong() { currentIndex=(currentIndex-1+playlist.length)%playlist.length; loadSong(currentIndex); audio.play(); updatePlayIcons(true); }
function openForm() { document.getElementById('add-music-form').style.display='block'; }
function closeForm() { document.getElementById('add-music-form').style.display='none'; }

function addNewSong() {
    const name = document.getElementById('new-name').value;
    const url = document.getElementById('new-url').value;
    if(!name || !url) return alert("Bhai, Details dalo!");
    playlist.push({ name, artist: document.getElementById('new-artist').value || "Unknown", url, img: document.getElementById('new-img').value });
    document.getElementById('final-code').value = `let playlist = ${JSON.stringify(playlist, null, 4)};`;
    document.getElementById('export-area').style.display = 'block';
    renderPlaylist();
}

function copyToClipboard() {
    const area = document.getElementById('final-code');
    area.select(); document.execCommand('copy');
    alert("Full Code Copied!");
}

loadSong(0);
