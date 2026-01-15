/* ================= SEARCH LOGIC (JSONP BYPASS) ================= */
function ytSearch() {
    const query = document.getElementById('yt-search').value;
    const container = document.getElementById('search-results');
    
    if (!query.trim()) return;
    container.innerHTML = "<p style='text-align:center; color:#1DB954;'>Connecting to Global Library... 🚀</p>";

    // JSONP Technique: Ye CORS error ko bypass karne ka sabse purana aur pakka tareeka hai
    const script = document.createElement('script');
    const callbackName = 'appleCallback';
    
    window[callbackName] = function(data) {
        renderResults(data.results);
        delete window[callbackName];
        document.body.removeChild(script);
    };

    script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=15&callback=${callbackName}`;
    script.onerror = () => {
        container.innerHTML = "<p style='text-align:center; color:red;'>Network Blocked. Try switching to Mobile Data/Wi-Fi.</p>";
    };
    document.body.appendChild(script);
}

function renderResults(results) {
    const container = document.getElementById('search-results');
    container.innerHTML = ""; 

    if (results && results.length > 0) {
        results.forEach(track => {
            const div = document.createElement('div');
            div.className = "item";
            // Thumbnail quality increase
            const highResThumb = track.artworkUrl100.replace('100x100', '300x300');
            
            div.onclick = () => playSong(track.trackName, track.artistName, highResThumb);
            div.innerHTML = `
                <img src="${track.artworkUrl100}">
                <div style="flex:1; overflow:hidden;">
                    <h4 style="margin:0; font-size:14px; color:white; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${track.trackName}</h4>
                    <p style="margin:2px 0 0; color:#888; font-size:12px;">${track.artistName}</p>
                </div>
                <i class="fas fa-play-circle" style="color:#1DB954; font-size:24px;"></i>`;
            container.appendChild(div);
        });
    } else {
        container.innerHTML = "<p style='text-align:center;'>Gaana nahi mila bhai.</p>";
    }
}

/* ================= PLAYBACK LOGIC ================= */
async function playSong(name, artist, thumb) {
    const audio = document.getElementById('yt-audio');
    const titleDisp = document.getElementById('yt-title');
    
    titleDisp.innerText = "Searching Sound... 🎧";
    document.getElementById('yt-thumb').src = thumb;
    document.getElementById('yt-thumb').style.display = "block";
    document.getElementById('yt-artist').innerText = artist;

    try {
        // Direct stream fetcher
        const searchUrl = `https://inv.tux.rs/api/v1/search?q=${encodeURIComponent(name + " " + artist)}`;
        const res = await fetch(searchUrl);
        const data = await res.json();
        
        if(data && data[0]) {
            // Cobalt fallback
            audio.src = `https://pipedproxy.kavin.rocks/videoplayback?id=${data[0].videoId}&itag=140`;
            titleDisp.innerText = name;
            audio.play();
        }
    } catch (e) {
        titleDisp.innerText = "Playback Error. Try again.";
    }
}
