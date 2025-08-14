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
  const powerDiv = $("powerups");
  const powerButtons = $("powerButtons");
  const powerTarget = $("powerTarget");
  const powerOverlay = $("powerOverlay");

  const scoreDiv = $("scoreboard");
  const scoresUl = $("scores");

  let currentCode = "";
  let answered = false;
  let deadline = 0;
  let timerHandle = null;
  let myPlayerId = "";
  let myPowerups = [];

  if (window.initQuizMaster) {
    window.initQuizMaster('player3d');
  }

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
        myPlayerId = resp.player.id;
        myPowerups = resp.player.powerups || [];
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

  function renderPowerButtons() {
    powerButtons.innerHTML = "";
    myPowerups.forEach(pu => {
      const btn = document.createElement('button');
      btn.textContent = pu;
      btn.onclick = () => {
        const target = powerTarget.value;
        if (!target) return;
        socket.emit('player:usePower', { code: currentCode, targetId: target, type: pu });
        myPowerups = myPowerups.filter(x => x !== pu);
        renderPowerButtons();
      };
      powerButtons.appendChild(btn);
    });
    powerDiv.style.display = myPowerups.length ? 'block' : 'none';
  }

  socket.on('power:applied', ({ type }) => {
    applyPower(type);
  });

  function applyPower(type) {
    powerOverlay.classList.remove('hidden');
    if (type === 'freeze') {
      powerOverlay.textContent = 'Frozen! tap to thaw';
      let taps = 0;
      powerOverlay.onclick = () => {
        if (++taps >= 5) {
          powerOverlay.classList.add('hidden');
          powerOverlay.onclick = null;
        }
      };
    } else if (type === 'gloop') {
      powerOverlay.textContent = 'Gloop! wipe it off';
      let taps = 0;
      powerOverlay.onclick = () => {
        if (++taps >= 3) {
          powerOverlay.classList.add('hidden');
          powerOverlay.onclick = null;
        }
      };
    } else if (type === 'flash') {
      powerOverlay.textContent = 'Flash!';
      setTimeout(() => powerOverlay.classList.add('hidden'), 1000);
    }
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
    // powerups UI
    powerButtons.innerHTML = "";
    powerTarget.innerHTML = "";
    (q.players || []).forEach(p => {
      if (p.id === myPlayerId) return;
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      powerTarget.appendChild(opt);
    });
    renderPowerButtons();
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
    powerOverlay.classList.add('hidden');
    powerOverlay.onclick = null;
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