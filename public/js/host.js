(() => {
  const socket = io();
  let currentCode = null;
  const $ = (id) => document.getElementById(id);
  const playersUl = $("players");
  const screen = $("screen");
  const btnCreate = $("btnCreate");
  const btnStart = $("btnStart");
  const btnNext = $("btnNext");
  const roomCodeSpan = $("roomCode");
  const ipSelect = $("ipSelect");
  const btnMakeQR = $("btnMakeQR");
  const joinUrlDiv = $("joinUrl");

  async function fetchIPs() {
    try {
      const res = await fetch('/api/ips');
      const data = await res.json();
      ipSelect.innerHTML = "";
      (data.ips || []).forEach(ip => {
        const opt = document.createElement('option');
        opt.value = ip;
        opt.textContent = ip;
        ipSelect.appendChild(opt);
      });
    } catch {}
  }

  fetchIPs();

  btnCreate.onclick = () => {
    socket.emit('host:createRoom', {}, (resp) => {
      currentCode = resp.code;
      roomCodeSpan.textContent = `Room: ${currentCode}`;
      screen.innerHTML = `<h3>Room ${currentCode} aangemaakt</h3><p>Maak een QR met jouw IP en laat spelers joinen.</p>`;
      btnStart.disabled = true;
      btnNext.disabled = true;
    });
  };

  btnMakeQR.onclick = () => {
    if (!currentCode) return;
    const host = ipSelect.value || location.hostname;
    const url = `http://${host}:3000/player.html`;
    joinUrlDiv.textContent = `Join URL: ${url} — code: ${currentCode}`;
    socket.emit('host:qrMake', { joinUrl: url }, (resp) => {
      if (resp?.ok) {
        const img = new Image();
        img.src = resp.dataUrl;
        const wrap = document.getElementById('qrWrap');
        wrap.innerHTML = "";
        wrap.appendChild(img);
      }
    });
  };

  socket.on('lobby:update', (lobby) => {
    if (!currentCode) currentCode = lobby.code;
    roomCodeSpan.textContent = `Room: ${lobby.code}`;
    playersUl.innerHTML = "";
    lobby.players.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.name} ${p.ready ? '✅' : '⏳'} — ${p.score}p`;
      playersUl.appendChild(li);
    });
    btnStart.disabled = !lobby.players.some(p => p.ready);
  });

  btnStart.onclick = () => {
    if (!currentCode) return;
    socket.emit('host:startGame', { code: currentCode }, (resp) => {
      if (!resp?.ok) alert(resp?.error || 'Kan niet starten');
    });
  };

  btnNext.onclick = () => {
    if (!currentCode) return;
    socket.emit('host:next', { code: currentCode }, (resp) => {
      if (resp?.done) {
        screen.innerHTML = `<h3>Klaar! Terug naar lobby…</h3>`;
      }
    });
  };

  socket.on('question:show', (q) => {
    btnNext.disabled = true;
    screen.innerHTML = `
      <h2>${q.text}</h2>
      <ol>${q.options.map(o => `<li>${o}</li>`).join('')}</ol>
      <div class="timer">⏳</div>
    `;
  });

  socket.on('question:result', (res) => {
    btnNext.disabled = false;
    screen.innerHTML = `
      <h3>Correct: #${res.correctIndex + 1}</h3>
      <ul>${res.players.map(p => `<li>${p.name}: ${p.correct ? '✅' : '❌'} — ${p.score}p`).join('')}</ul>
    `;
  });

  socket.on('scoreboard:update', (players) => {
    // already shown in result; keep button enabled
  });

  socket.on('room:closed', () => {
    alert('Room gesloten (host disconnected)');
    location.reload();
  });
})();