<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Drive Cloud Test</title>
    <style>
        body { font-family: -apple-system, sans-serif; background: #f0f0f5; padding: 20px; display: flex; justify-content: center; }
        .card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); width: 100%; max-width: 350px; text-align: center; }
        .btn { background: #007aff; color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: 600; width: 100%; margin-bottom: 20px; }
        .btn:disabled { background: #ccc; cursor: not-allowed; }
        #playlist { text-align: left; max-height: 300px; overflow-y: auto; }
        .song-item { background: #f9f9f9; padding: 12px; margin-bottom: 8px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #eee; }
        .play-btn { background: #34c759; color: white; border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; }
    </style>
</head>
<body>

    <div class="card">
        <h2 style="margin-top:0">Cloud Lab </h2>
        <p style="color: #666; font-size: 14px;">Testing 250,000 Song Storage</p>
        
        <button id="auth_btn" class="btn" onclick="handleAuthClick()" disabled>Loading Google...</button>
        
        <div id="playlist">
            <div id="list-container"></div>
        </div>

        <div id="player" style="margin-top: 20px; display:none;">
            <p id="track-name" style="font-size: 14px; font-weight: bold;"></p>
            <audio id="audio-out" controls style="width: 100%;"></audio>
        </div>
    </div>

    <script src="https://accounts.google.com/gsi/client" onload="gisLoaded()"></script>
    <script src="https://apis.google.com/js/api.js" onload="gapiLoaded()"></script>

    <script>
        const CLIENT_ID = '493639014923-7gqsn4g853icgtctj6hhugkcqhm6178e.apps.googleusercontent.com';
        const API_KEY = 'AIzaSyAtjXuMkQe9UZzWb-cNsztYy0II9StI08U';
        
        let tokenClient;
        let accessToken = null;
        let pickerApiLoaded = false;
        let gisApiLoaded = false;

        // Load Playlist from Storage
        let playlist = JSON.parse(localStorage.getItem('cloud_test_v2') || '[]');

        function checkReady() {
            if (gisApiLoaded && pickerApiLoaded) {
                const btn = document.getElementById('auth_btn');
                btn.disabled = false;
                btn.innerText = "Login & Add Music";
            }
        }

        function gisLoaded() {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive.readonly',
                callback: (tokenResponse) => {
                    if (tokenResponse.error) return;
                    accessToken = tokenResponse.access_token;
                    openPicker();
                },
            });
            gisApiLoaded = true;
            checkReady();
        }

        function gapiLoaded() {
            gapi.load('client:picker', async () => {
                await gapi.client.init({ apiKey: API_KEY, discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"] });
                pickerApiLoaded = true;
                checkReady();
            });
        }

        function handleAuthClick() {
            // Check if already have token, else request
            if (accessToken === null) {
                tokenClient.requestAccessToken({prompt: 'consent'});
            } else {
                openPicker();
            }
        }

        function openPicker() {
            const view = new google.picker.View(google.picker.ViewId.DOCS);
            view.setMimeTypes("audio/mpeg,audio/mp3,audio/wav");
            const picker = new google.picker.PickerBuilder()
                .addView(view)
                .setOAuthToken(accessToken)
                .setDeveloperKey(API_KEY)
                .setCallback(pickerCallback)
                .build();
            picker.setVisible(true);
        }

        function pickerCallback(data) {
            if (data.action === google.picker.Action.PICKED) {
                const doc = data.docs[0];
                playlist.push({ name: doc.name, id: doc.id });
                localStorage.setItem('cloud_test_v2', JSON.stringify(playlist));
                render();
            }
        }

        function render() {
            const container = document.getElementById('list-container');
            container.innerHTML = playlist.map((s, i) => `
                <div class="song-item">
                    <span style="font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; width:180px;">${s.name}</span>
                    <button class="play-btn" onclick="play('${s.id}', '${s.name}')">Play</button>
                </div>
            `).join('');
        }

        function play(id, name) {
            const audio = document.getElementById('audio-out');
            const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${API_KEY}`;
            document.getElementById('track-name').innerText = name;
            document.getElementById('player').style.display = 'block';
            audio.src = url;
            audio.play();
        }

        render();
    </script>
</body>
</html>
