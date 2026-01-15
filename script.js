/* ================= CONFIGURATION ================= */
// Multiple backup servers
const instances = [
    'https://inv.vern.cc',
    'https://invidious.nerdvpn.de',
    'https://invidious.asir.dev',
    'https://invidious.projectsegfau.lt'
];

let activeServer = instances[0];

/* ================= SEARCH LOGIC ================= */
async function ytSearch() {
    const query = document.getElementById('yt-search').value;
    const container = document.getElementById('search-results');
    if (!query.trim()) return;

    container.innerHTML = "<p style='text-align:center; color:#1DB954;'>Searching YouTube...</p>";

    // Try multiple servers for search
    for (let url of instances) {
        try {
            const res = await fetch(`${url}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, { signal: AbortSignal.timeout(5000) });
            if (!res.ok) continue;
            const data = await res.json();
            if (data && data.length > 0) {
                activeServer = url; // Update current working server
                renderResults(data);
                return;
            }
        } catch (e) { console.warn("Trying next search server..."); }
    }
    container.innerHTML = "<p style='text-align:center;'>Search failed. Try again.</p>";
}

function renderResults(data) {
    const container = document.getElementById('search-results');
    container.innerHTML = "";
    data.slice(0, 10).forEach(video => {
        const div = document.createElement('div');
        div.className = "item";
        div.onclick = () => playSong(video.videoId, video.title, video.author, video.videoThumbnails[0].url);
        div.innerHTML = `
            <img src="${video.videoThumbnails[0].url}">
            <div style="flex:1">
                <h4 style="margin:0; font-size:14px; color:white;">${video.title}</h4>
                <p style="margin:2px 0 0; color:#888; font-size:12px;">${video.author}</p>
            </div>
            <i class="fas fa-play-circle" style="color:#1DB954; font-size:20px;"></i>`;
        container.appendChild(div);
    });
}

/* ================= POWERFUL PLAYBACK LOGIC ================= */
async function playSong(id, title, artist, thumb) {
    const audio = document.getElementById('yt-audio');
    const titleDisp = document.getElementById('yt-title');
    const thumbDisp = document.getElementById('yt-thumb');
    
    titleDisp.innerText = "Connecting...";
    thumbDisp.src = thumb;
    thumbDisp.style.display = "block";
    document.getElementById('yt-artist').innerText = artist;

    // Method 1: Try Multiple Invidious Servers for Stream
    for (let server of instances) {
        try {
            titleDisp.innerText = `Trying Server...`;
            const res = await fetch(`${server}/api/v1/videos/${id}`, { signal: AbortSignal.timeout(5000) });
            const data = await res.json();
            
            // Audio formats find karo (m4a/webm)
            const format = data.adaptiveFormats.find(f => f.type.includes('audio'));
            
            if (format && format.url) {
                audio.src = format.url;
                titleDisp.innerText = title;
                audio.play().catch(() => titleDisp.innerText = "Tap Play");
                return; // SUCCESS!
            }
        } catch (e) {
            console.error(`Server ${server} failed, moving to next.`);
        }
    }

    // Method 2: Final Backup (Piped API)
    try {
        titleDisp.innerText = "Final attempt...";
        const res = await fetch(`https://pipedapi.kavin.rocks/streams/${id}`);
        const data = await res.json();
        const audioStream = data.audioStreams.sort((a, b) => b.bitrate - a.bitrate)[0];
        
        if (audioStream) {
            audio.src = audioStream.url;
            titleDisp.innerText = title;
            audio.play();
            return;
        }
    } catch (e) {
        console.error("All streaming methods failed.");
    }

    titleDisp.innerText = "Stream Error. Try another song.";
}
