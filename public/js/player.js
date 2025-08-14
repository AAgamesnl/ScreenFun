(() => {
  const socket = io();
  const $ = (id) => document.getElementById(id);

  const joinDiv = $("join");
  const joinForm = $("joinForm");
  const codeInp = $("code");
  const nameInp = $("name");
  const joinMsg = $("joinMsg");

  const lobbyDiv = $("lobby");
  const lobbyCode = $("lobbyCode");
  const lobbyPlayers = $("lobbyPlayers");
  const readyChk = $("readyChk");

  const qDiv = $("question");
  const qText = $("qText");
  const optsDiv = $("opts");
  const timerSpan = $("timer");

  const scoreDiv = $("scoreboard");
  const scoresUl = $("scores");

  let currentCode = "";
  let answered = false;
  let deadline = 0;
  let timerHandle = null;

  const urlParams = new URLSearchParams(location.search);
  if (urlParams.get("code")) codeInp.value = urlParams.get("code");

  joinForm.onsubmit = (e) => {
    e.preventDefault();
    currentCode = codeInp.value.trim().toUpperCase();
    const name = nameInp.value.trim() || "Player";
    socket.emit('player:join', { code: currentCode, name }, (resp) => {
      if (!resp?.ok) {
        joinMsg.textContent = resp?.error || "Join failed";
      } else {
        joinDiv.classList.add("hidden");
        lobbyDiv.classList.remove("hidden");
        lobbyCode.textContent = currentCode;
      }
    });
  };

  readyChk.onchange = () => {
    socket.emit('player:setReady', { code: currentCode, ready: readyChk.checked });
  };

  function setTimer(msLeft) {
    if (timerHandle) clearInterval(timerHandle);
    timerHandle = setInterval(() => {
      const left = Math.max(0, deadline - Date.now());
      timerSpan.textContent = `${Math.ceil(left / 1000)}s`;
      if (left <= 0) clearInterval(timerHandle);
    }, 200);
  }

  socket.on('lobby:update', (lobby) => {
    lobbyPlayers.innerHTML = "";
    lobby.players.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.name} ${p.ready ? '✅' : '⏳'} — ${p.score}p`;
      lobbyPlayers.appendChild(li);
    });
  });

  socket.on('question:show', (q) => {
    lobbyDiv.classList.add("hidden");
    scoreDiv.classList.add("hidden");
    qDiv.classList.remove("hidden");
    answered = false;
    qText.textContent = q.text;
    optsDiv.innerHTML = "";
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('div');
      btn.className = 'option';
      btn.textContent = `${idx + 1}. ${opt}`;
      btn.onclick = () => {
        if (answered) return;
        answered = true;
        btn.classList.add('locked');
        socket.emit('player:answer', { code: currentCode, answerIndex: idx });
      };
      optsDiv.appendChild(btn);
    });
    deadline = q.deadline;
    setTimer(q.durationMs);
  });

  socket.on('question:result', (res) => {
    qDiv.classList.add("hidden");
    scoreDiv.classList.remove("hidden");
    scoresUl.innerHTML = "";
    res.players.sort((a,b)=>b.score-a.score).forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.name}: ${p.score}p ${p.correct ? '✅' : ''}`;
      scoresUl.appendChild(li);
    });
  });

  // simple clock sync (not used heavily here, but wired up)
  setInterval(() => {
    const t0 = Date.now();
    socket.emit('time:ping', t0);
  }, 5000);

  socket.on('time:pong', ({t0, t1}) => {
    // could adjust offsets if needed
  });

  socket.on('room:closed', () => {
    alert('Host is weg — room gesloten');
    location.reload();
  });
})();