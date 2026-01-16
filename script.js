/* ================= CONFIGURATION ================= */
const API_KEY = 'AIzaSyB9uVSwB9MAIGH8YW2YnLWHdiwtUXtbaUk'; 

/* ================= SEARCH LOGIC ================= */
async function ytSearch() {
    const query = document.getElementById('yt-search').value;
    const container = document.getElementById('search-results');
    if (!query.trim()) return;

    container.innerHTML = "<p style='text-align:center; color:#1DB954;'>Searching Official Library... 🚀</p>";

    try {
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            renderResults(data.items);
        } else {
            container.innerHTML = "<p style='text-align:center;'>Limit Over. Try tomorrow.</p>";
        }
    } catch (e) {
        container.innerHTML = "<p style='text-align:center; color:red;'>Search Error. Check Internet.</p>";
    }
}

function renderResults(items) {
    const container = document.getElementById('search-results');
    container.innerHTML = "";
    items.forEach(item => {
        const vId = item.id.videoId;
        const div = document.createElement('div');
        div.className = "item";
        div.onclick = () => playSong(vId, item.snippet.title, item.snippet.channelTitle, item.snippet.thumbnails.high.url);
        div.innerHTML = `
            <img src="${item.snippet.thumbnails.default.url}">
            <div style="flex:1">
                <h4 style="margin:0; font-size:14px; color:white;">${item.snippet.title}</h4>
                <p style="margin:2px 0 0; color:#888; font-size:12px;">${item.snippet.channelTitle}</p>
            </div>
            <i class="fas fa-play-circle" style="color:#1DB954; font-size:24px;"></i>`;
        container.appendChild(div);
    });
}

/* ================= POWERFUL PLAYBACK (NO LOADING) ================= */
async function playSong(id, title, artist, thumb) {
    const audio = document.getElementById('yt-audio');
    const titleDisp = document.getElementById('yt-title');
    
    titleDisp.innerText = "Connecting to Stream... 🎧";
    document.getElementById('yt-thumb').src = thumb;
    document.getElementById('yt-thumb').style.display = "block";
    document.getElementById('yt-artist').innerText = artist;

    // List of multiple working proxies (Agar ek load ho, toh dusra try karega)
    const proxyList = [
        `https://iv.ggtyler.dev/latest/videoplayback?id=${id}&itag=140`,
        `https://invidious.flokinet.is/latest/videoplayback?id=${id}&itag=140`,
        `https://pipedproxy.kavin.rocks/videoplayback?id=${id}&itag=140`,
        `https://inv.tux.rs/latest/videoplayback?id=${id}&itag=140`
    ];

    let currentProxy = 0;

    async function tryNextProxy() {
        if (currentProxy < proxyList.length) {
            console.log("Trying Proxy: " + currentProxy);
            audio.src = proxyList[currentProxy];
            currentProxy++;
            
            audio.play().then(() => {
                titleDisp.innerText = title;
            }).catch(e => {
                console.log("Proxy failed, jumping to next...");
                tryNextProxy();
            });
        } else {
            titleDisp.innerText = "All servers busy. Try again later.";
        }
    }

    // Start trying from the first proxy
    tryNextProxy();

    // Error handling if stream stops
    audio.onerror = () => {
        console.warn("Stream broken, switching...");
        tryNextProxy();
    };
}

document.getElementById('yt-search').addEventListener('keypress', (e) => { if (e.key === 'Enter') ytSearch(); });
