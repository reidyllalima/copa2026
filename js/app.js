/* ─── COPA DO MUNDO 2026 — APP ─── */

const App = (() => {

  /* ── STATE ── */
  let scores       = {};
  let bracketTeams = {}; // { matchId: { h1: teamKey, h2: teamKey } }
  let matchWinners = {}; // { matchId: { winnerKey, loserKey } } — da ESPN ou por placar
  let matchMeta    = {}; // { matchId: { period, shootoutHome, shootoutAway } }
  let stableDates  = new Set(); // datas já buscadas e estáveis — não são refetchadas
  let fetching    = false;
  let activeTab   = 'main';
  let searchQuery = '';
  let lastAdjustments = []; // ajustes de integridade (data/hora/local) aplicados no fetch atual

  /* ── MAPEAMENTO ESPN → chave local ── */
  const ESPN_TO_LOCAL = {
    'Mexico':'MEX', 'South Africa':'RSA',
    'Korea Republic':'KOR', 'South Korea':'KOR',
    'Czech Republic':'CZE', 'Czechia':'CZE',
    'Canada':'CAN',
    'Bosnia and Herzegovina':'BIH', 'Bosnia-Herzegovina':'BIH', 'Bosnia':'BIH',
    'Qatar':'QAT', 'Switzerland':'SUI',
    'Brazil':'BRA', 'Morocco':'MAR', 'Haiti':'HAI', 'Scotland':'SCO',
    'United States':'USA', 'United States of America':'USA',
    'Paraguay':'PAR', 'Australia':'AUS',
    'Turkey':'TUR', 'Türkiye':'TUR', 'Germany':'GER',
    'Curacao':'CUW', 'Curaçao':'CUW',
    'Ivory Coast':'CIV', "Côte d'Ivoire":'CIV', "Cote d'Ivoire":'CIV',
    'Ecuador':'ECU', 'Netherlands':'NED', 'Japan':'JPN',
    'Tunisia':'TUN', 'Sweden':'SWE',
    'Belgium':'BEL', 'Egypt':'EGY', 'Iran':'IRN', 'New Zealand':'NZL',
    'Spain':'ESP', 'Cape Verde':'CPV', 'Saudi Arabia':'KSA', 'Uruguay':'URU',
    'France':'FRA', 'Senegal':'SEN', 'Norway':'NOR', 'Iraq':'IRQ',
    'Argentina':'ARG', 'Algeria':'ALG', 'Austria':'AUT', 'Jordan':'JOR',
    'Portugal':'POR', 'Uzbekistan':'UZB', 'Colombia':'COL',
    'England':'ENG', 'Croatia':'CRO', 'Ghana':'GHA', 'Panama':'PAN',
    'DR Congo':'COD', 'Congo DR':'COD', 'Democratic Republic of Congo':'COD',
    'Congo, DR':'COD', 'Congo (DR)':'COD',
  };

  /* ── MAPEAMENTO ESPN → cidade local (para checagem de integridade) ── */
  const VENUE_ESPN_TO_CITY = {
    'NRG Stadium': 'Houston',
    'Lincoln Financial Field': 'Filadélfia',
    'MetLife Stadium': 'Nova York / NJ',
    'Estadio Banorte': 'Cidade do México',
    'AT&T Stadium': 'Dallas',
    'Lumen Field': 'Seattle',
    'Mercedes-Benz Stadium': 'Atlanta',
    'BC Place': 'Vancouver',
    'Gillette Stadium': 'Boston',
    'SoFi Stadium': 'Los Angeles',
    'Hard Rock Stadium': 'Miami',
    'GEHA Field at Arrowhead Stadium': 'Kansas City',
    'Levi\'s Stadium': 'San Francisco',
    'BMO Field': 'Toronto',
    'Estadio Akron': 'Guadalajara',
    'Estadio BBVA': 'Monterrey',
  };

  /* ── HELPERS ── */

  function getEffectiveTeams(m) {
    const bt = bracketTeams[m.id] || {};
    return { h1: bt.h1 || m.h1, h2: bt.h2 || m.h2 };
  }

  function getMatchDecision(matchId) {
    const meta = matchMeta[matchId];
    if (!meta) return null;
    if (meta.period >= 5) {
      return { type: 'pen', homePen: meta.shootoutHome, awayPen: meta.shootoutAway };
    }
    if (meta.period >= 3) {
      return { type: 'aet' };
    }
    return null;
  }

  function normalize(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function matchDate(m) {
    const [Y, Mo, D] = m.d.split('-').map(Number);
    const [H, Min]   = m.h.split(':').map(Number);
    return new Date(Date.UTC(Y, Mo - 1, D, H + 3, Min));
  }

  function getStatus(m) {
    const now      = Date.now();
    const start    = matchDate(m).getTime();
    const duration = m.phase ? 135 : 110; // mata-mata: +25 min p/ prorrogação/pênaltis
    const end      = start + duration * 60 * 1000;
    if (now < start) return 'upcoming';
    if (now > end)   return 'past';
    return 'live';
  }

  /* Verdadeiro se o jogo acabou de encerrar (até 5 min após a janela ao vivo) */
  function isJustDone(m) {
    const now   = Date.now();
    const start = matchDate(m).getTime();
    const dur   = m.phase ? 135 : 110;
    const end   = start + dur * 60 * 1000;
    return now > end && now < end + 5 * 60 * 1000;
  }

  /* Verdadeiro se a data possui algum jogo ativo (ao vivo ou acabou de encerrar) */
  function dateIsActive(dateStr) {
    return MATCHES.some(m => m.d === dateStr && (getStatus(m) === 'live' || isJustDone(m)));
  }

  function fmtDateShort(isoDate) {
    return new Date(isoDate + 'T12:00:00').toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'short'
    });
  }

  function fmtDateLong(isoDate) {
    return new Date(isoDate + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }

  const ROUND_LABEL = { 1: 'Rodada 1', 2: 'Rodada 2', 3: 'Rodada 3' };

  const PHASE_LABEL = {
    R32: 'Rodada de 32',
    R16: 'Oitavas de Final',
    QF:  'Quartas de Final',
    SF:  'Semifinal',
    '3P':'3º Lugar',
    F:   'Final',
  };

  function flagURL(teamKey, emoji) {
    const overrides = { ENG: 'gb-eng', SCO: 'gb-sct', WAL: 'gb-wls' };
    if (overrides[teamKey]) return `https://flagcdn.com/w80/${overrides[teamKey]}.png`;
    try {
      const code = [...emoji]
        .filter(c => c.codePointAt(0) >= 0x1F1E6 && c.codePointAt(0) <= 0x1F1FF)
        .map(c => String.fromCharCode(c.codePointAt(0) - 0x1F1E6 + 65))
        .join('').toLowerCase();
      return code.length === 2 ? `https://flagcdn.com/w80/${code}.png` : null;
    } catch(e) { return null; }
  }

  function onFlagError(img) {
    const key  = img.dataset.teamkey;
    const team = TEAMS[key] || { flag: '🏳', abbr: key };
    const span = document.createElement('span');
    span.className = 'cb-flag';
    span.textContent = ['ENG', 'SCO'].includes(key) ? team.abbr : team.flag;
    if (img.parentNode) img.parentNode.replaceChild(span, img);
  }

  function flagEl(teamKey, team) {
    const url = flagURL(teamKey, team.flag);
    return url
      ? `<img class="cb-flag" src="${url}" alt="${team.name}" loading="lazy" data-teamkey="${teamKey}" onerror="App.onFlagError(this)">`
      : `<span class="cb-flag">${team.flag}</span>`;
  }

  /* ── RENDER: CARD ── */
  function renderCard(m, idx) {
    const { h1: h1key, h2: h2key } = getEffectiveTeams(m);
    const t1     = TEAMS[h1key] || { name: h1key, abbr: h1key, flag: '🏴' };
    const t2     = TEAMS[h2key] || { name: h2key, abbr: h2key, flag: '🏴' };
    const status = getStatus(m);
    const sc     = scores[m.id];
    const delay  = idx !== undefined ? ` style="--card-delay:${(idx % 9) * 0.06}s"` : '';

    const phaseLabel = m.phase ? PHASE_LABEL[m.phase] : null;
    let headHtml;
    if (status === 'live') {
      headHtml = `
        <span class="live-badge"><span class="live-pulse"></span>AO VIVO</span>
        <span class="card-round">${phaseLabel || 'Grupo ' + m.g}</span>`;
    } else {
      headHtml = `
        <span class="card-grp">${phaseLabel || 'Grupo ' + m.g}</span>
        <span class="card-round">${phaseLabel ? '' : (ROUND_LABEL[m.r] || '')}</span>`;
    }

    let vsHtml;
    if (status === 'past' || status === 'live') {
      const g1 = sc != null ? sc[0] : '–';
      const g2 = sc != null ? sc[1] : '–';
      let decisionHtml = '';
      if (m.phase && status === 'past') {
        const dec = getMatchDecision(m.id);
        if (dec?.type === 'pen') {
          decisionHtml = `<div class="card-decision pen">Pên. ${dec.homePen}-${dec.awayPen}</div>`;
        } else if (dec?.type === 'aet') {
          decisionHtml = `<div class="card-decision aet">Prorrogação</div>`;
        }
      }
      vsHtml = `
        <div class="card-score">
          <span class="card-sc">${g1}</span>
          <span class="card-sc-sep">×</span>
          <span class="card-sc">${g2}</span>
        </div>${decisionHtml}`;
    } else {
      vsHtml = `<div class="card-time">${m.h}</div>`;
    }

    let footHtml;
    if (status === 'past') {
      footHtml = `${fmtDateShort(m.d)} · ${m.h} · 📍 ${m.venue}`;
    } else if (status === 'live') {
      footHtml = `📍 ${m.venue}`;
    } else {
      footHtml = `${m.h} · 📍 ${m.venue}`;
    }

    return `
      <article class="match-card ${status}"${delay} aria-label="${t1.name} × ${t2.name}">
        <div class="card-head">${headHtml}</div>
        <div class="card-matchup">
          <div class="cb home">
            ${flagEl(h1key, t1)}
            <span class="cb-abbr">${t1.abbr}</span>
            <span class="cb-name">${t1.name}</span>
          </div>
          <div class="card-vs">${vsHtml}</div>
          <div class="cb away">
            ${flagEl(h2key, t2)}
            <span class="cb-abbr">${t2.abbr}</span>
            <span class="cb-name">${t2.name}</span>
          </div>
        </div>
        <div class="card-foot">${footHtml}</div>
      </article>`;
  }

  /* ── RENDER: SEÇÃO AO VIVO ── */
  function renderLiveSection(matches) {
    if (matches.length === 0) return '';
    return `
      <div class="section-header">
        <div class="section-dot live" aria-hidden="true"></div>
        <span class="section-label">Ao vivo agora</span>
        <div class="section-line"></div>
        <span class="section-count">${matches.length} jogo${matches.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="cards-grid">${matches.map((m, i) => renderCard(m, i)).join('')}</div>`;
  }

  /* ── RENDER: CALENDÁRIO ── */
  function renderCalendar(matches) {
    if (matches.length === 0) return '';

    const byDay = {};
    matches.forEach(m => {
      if (!byDay[m.d]) byDay[m.d] = [];
      byDay[m.d].push(m);
    });

    let html = `
      <div class="section-header">
        <div class="section-dot upcoming" aria-hidden="true"></div>
        <span class="section-label">Calendário</span>
        <div class="section-line"></div>
        <span class="section-count">${matches.length} jogo${matches.length !== 1 ? 's' : ''}</span>
      </div>`;

    for (const day of Object.keys(byDay).sort()) {
      html += `
        <div class="cal-day">
          <div class="cal-label">${fmtDateLong(day)}</div>
          <div class="cards-grid">${byDay[day].map((m, i) => renderCard(m, i)).join('')}</div>
        </div>`;
    }

    return html;
  }

  /* ── RENDER: HISTÓRICO ── */
  function renderHistory(past) {
    if (past.length === 0) {
      return '<div class="empty-section">Nenhum jogo encerrado ainda.</div>';
    }
    return `
      <div class="section-header">
        <div class="section-dot past" aria-hidden="true"></div>
        <span class="section-label">Jogos encerrados</span>
        <div class="section-line"></div>
        <span class="section-count">${past.length} jogo${past.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="cards-grid">${past.map((m, i) => renderCard(m, i)).join('')}</div>`;
  }

  /* ── RENDER PRINCIPAL ── */
  function render() {
    let html = '';

    if (searchQuery) {
      const q        = normalize(searchQuery);
      const filtered = MATCHES.filter(m => {
        const { h1: h1k, h2: h2k } = getEffectiveTeams(m);
        const t1 = TEAMS[h1k] || {};
        const t2 = TEAMS[h2k] || {};
        return [t1.name, t1.abbr, h1k, t2.name, t2.abbr, h2k]
          .filter(Boolean)
          .some(v => normalize(v).includes(q));
      });

      if (!filtered.length) {
        html = `<div class="empty-section">Nenhuma seleção encontrada para "<em>${escHtml(searchQuery)}</em>".</div>`;
      } else {
        const fLive     = filtered.filter(m => getStatus(m) === 'live');
        const fUpcoming = filtered.filter(m => getStatus(m) === 'upcoming');
        const fPast     = filtered.filter(m => getStatus(m) === 'past').reverse();
        html += `
          <div class="search-result-banner">
            <span>Filtrando: <strong>${escHtml(searchQuery)}</strong></span>
            <span>${filtered.length} jogo${filtered.length !== 1 ? 's' : ''}</span>
          </div>`;
        html += renderLiveSection(fLive);
        html += renderCalendar(fUpcoming);
        if (fPast.length) html += renderHistory(fPast);
      }
    } else {
      const live     = MATCHES.filter(m => getStatus(m) === 'live');
      const upcoming = MATCHES.filter(m => getStatus(m) === 'upcoming');
      const past     = MATCHES.filter(m => getStatus(m) === 'past').reverse();

      if (activeTab === 'main') {
        html += renderLiveSection(live);
        html += renderCalendar(upcoming);
        if (!live.length && !upcoming.length) {
          html = '<div class="empty-section">Nenhum jogo em andamento ou futuro.</div>';
        }
      } else {
        html = renderHistory(past);
      }
    }

    document.getElementById('sections').innerHTML = html;
    document.getElementById('loadingState').classList.add('hidden');
  }

  /* ── PROPAGAÇÃO DO CHAVEAMENTO ── */
  function propagateBracket() {
    for (const matchId of Object.keys(scores)) {
      const rule = BRACKET[matchId];
      if (!rule) continue;

      const match = MATCHES.find(m => m.id === matchId);
      if (!match) continue;

      const { h1: h1key, h2: h2key } = getEffectiveTeams(match);
      if (h1key === 'TBD' || h2key === 'TBD') continue;

      const wd = matchWinners[matchId];
      let winnerKey, loserKey;

      if (wd) {
        winnerKey = wd.winnerKey;
        loserKey  = wd.loserKey;
      } else {
        const [g1, g2] = scores[matchId];
        if      (g1 > g2) { winnerKey = h1key; loserKey = h2key; }
        else if (g2 > g1) { winnerKey = h2key; loserKey = h1key; }
        else continue;
      }

      if (!winnerKey) continue;

      if (rule.winner) {
        if (!bracketTeams[rule.winner.to]) bracketTeams[rule.winner.to] = {};
        bracketTeams[rule.winner.to][rule.winner.side] = winnerKey;
      }
      if (rule.loser && loserKey) {
        if (!bracketTeams[rule.loser.to]) bracketTeams[rule.loser.to] = {};
        bracketTeams[rule.loser.to][rule.loser.side] = loserKey;
      }
    }
  }

  /* ── CHECAGEM DE INTEGRIDADE: data/hora e local do jogo ──
     Compara o que a ESPN reporta como horário/estádio oficial contra o
     data.js local e autocorrige divergências em memória (sem precisar
     de deploy). Roda a cada fetch — manual (botão Atualizar) ou automático. */
  function reconcileMatch(m, event, comp) {
    const changes = [];

    const espnInstant = new Date(event.date);
    if (!isNaN(espnInstant)) {
      const localInstant = matchDate(m);
      if (Math.abs(espnInstant - localInstant) >= 60 * 1000) {
        const shifted = new Date(espnInstant.getTime() - 3 * 60 * 60 * 1000);
        const newD = shifted.toISOString().slice(0, 10);
        const newH = shifted.toISOString().slice(11, 16);
        changes.push(`horário (${m.d} ${m.h} → ${newD} ${newH})`);
        m.d = newD;
        m.h = newH;
      }
    }

    const venueName = comp.venue?.fullName;
    const mappedCity = venueName && VENUE_ESPN_TO_CITY[venueName];
    if (mappedCity && mappedCity !== m.venue) {
      changes.push(`local (${m.venue} → ${mappedCity})`);
      m.venue = mappedCity;
    }

    if (changes.length) {
      lastAdjustments.push(`${m.id}: ${changes.join(', ')}`);
    }
  }

  /* ── FETCH: UMA DATA ── */
  async function fetchDate(dateStr) {
    const yyyymmdd = dateStr.replace(/-/g, '');
    const resp = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${yyyymmdd}`
    );
    if (!resp.ok) return false;
    const data = await resp.json();
    let updated = false;

    for (const event of data.events || []) {
      const comp = event.competitions?.[0];
      if (!comp) continue;

      const home = comp.competitors?.find(c => c.homeAway === 'home');
      const away = comp.competitors?.find(c => c.homeAway === 'away');
      if (!home || !away) continue;

      const homeKey = ESPN_TO_LOCAL[home.team.displayName] || ESPN_TO_LOCAL[home.team.name];
      const awayKey = ESPN_TO_LOCAL[away.team.displayName] || ESPN_TO_LOCAL[away.team.name];
      if (!homeKey || !awayKey) continue;

      /* Casamento por CONJUNTO de times, não por ordem mandante/visitante:
         em jogo de campo neutro a FIFA/ESPN define "mandante" de forma
         administrativa, que nem sempre bate com o lado h1/h2 que o nosso
         BRACKET usa. Exigir a ordem exata já causou jogos decididos (ex:
         Portugal x Espanha, EUA x Bélgica) nunca serem reconhecidos e
         travarem a propagação para a fase seguinte. */
      const localMatch = MATCHES.find(m => {
        const { h1, h2 } = getEffectiveTeams(m);
        return (h1 === homeKey && h2 === awayKey) || (h1 === awayKey && h2 === homeKey);
      });
      if (!localMatch) continue;

      reconcileMatch(localMatch, event, comp);
      if (comp.status?.type?.name === 'STATUS_SCHEDULED') continue;

      /* Reordena os dados da ESPN para a orientação local (h1/h2), já que o
         mandante da ESPN pode corresponder ao nosso h2 (visitante). */
      const { h1: localH1 } = getEffectiveTeams(localMatch);
      const espnHomeIsLocalH1 = localH1 === homeKey;

      const h = parseInt(home.score, 10);
      const a = parseInt(away.score, 10);
      if (!isNaN(h) && !isNaN(a)) {
        scores[localMatch.id] = espnHomeIsLocalH1 ? [h, a] : [a, h];
        updated = true;
      }

      const homeShoot = isFinite(+home.shootoutScore) ? +home.shootoutScore : null;
      const awayShoot = isFinite(+away.shootoutScore) ? +away.shootoutScore : null;
      matchMeta[localMatch.id] = {
        period:       comp.status?.period ?? 0,
        shootoutHome: espnHomeIsLocalH1 ? homeShoot : awayShoot,
        shootoutAway: espnHomeIsLocalH1 ? awayShoot : homeShoot,
      };

      if (home.winner === true) {
        matchWinners[localMatch.id] = { winnerKey: homeKey, loserKey: awayKey };
      } else if (away.winner === true) {
        matchWinners[localMatch.id] = { winnerKey: awayKey, loserKey: homeKey };
      }
    }

    return updated;
  }

  /* ── FETCH PLACARES via ESPN API ── */
  async function fetchScores() {
    if (fetching) return;
    fetching = true;
    lastAdjustments = [];

    const btn = document.getElementById('refreshBtn');
    btn.classList.add('loading');
    btn.querySelector('span').textContent = 'Buscando...';

    /* Coleta datas que precisam ser buscadas, pulando as estáveis sem jogo ativo.
       Jogos futuros dentro da janela de checagem de integridade (próximos 5 dias)
       também entram, para detectar divergência de horário/local ANTES do jogo
       acontecer (e não só depois). */
    const INTEGRITY_WINDOW_MS = 5 * 24 * 60 * 60 * 1000;
    const needed = new Set();
    MATCHES.filter(m => {
      const status = getStatus(m);
      if (status !== 'upcoming') return true;
      return matchDate(m).getTime() - Date.now() <= INTEGRITY_WINDOW_MS;
    }).forEach(m => {
      const d = m.d;
      if (!stableDates.has(d) || dateIsActive(d)) needed.add(d);
      /* Dia seguinte — jogos com início após 22h podem aparecer no dia seguinte na ESPN */
      const [h] = m.h.split(':').map(Number);
      if (h >= 22) {
        const next = new Date(d + 'T12:00:00');
        next.setDate(next.getDate() + 1);
        const nextStr = next.toISOString().slice(0, 10);
        if (!stableDates.has(nextStr) || dateIsActive(nextStr)) needed.add(nextStr);
      }
    });

    if (needed.size === 0) {
      const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      showUpdateBar(`Sem novos placares — ${time}`);
      btn.classList.remove('loading');
      btn.querySelector('span').textContent = 'Atualizar';
      fetching = false;
      return;
    }

    const allDates = [...needed].sort();

    /*
     * Fetches por fase — paralelo dentro de cada fase, sequencial entre fases.
     * O bracket depende de R32 estar resolvido antes de R16, e assim por diante.
     * Datas de grupo/R32 não têm times TBD, portanto podem ir em paralelo sem
     * precisar de propagação prévia.
     */
    const phases = [
      allDates.filter(d => d <  '2026-07-04'),            // Grupo + R32
      allDates.filter(d => d >= '2026-07-04' && d <= '2026-07-07'), // R16
      allDates.filter(d => d >= '2026-07-09' && d <= '2026-07-11'), // QF
      allDates.filter(d => d >= '2026-07-14'),             // SF, 3P, Final
    ];

    let updated = false;
    try {
      for (const phase of phases) {
        if (!phase.length) continue;
        const results = await Promise.all(phase.map(fetchDate));
        if (results.some(Boolean)) updated = true;
        propagateBracket();
      }

      /* Marca datas sem jogo ativo como estáveis para não rebuscar */
      allDates.forEach(d => { if (!dateIsActive(d)) stableDates.add(d); });

      render();
      const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      if (lastAdjustments.length) {
        console.warn('Ajustes de integridade aplicados:', lastAdjustments);
        const n = lastAdjustments.length;
        showUpdateBar(`Atualizado às ${time} · ${n} ajuste${n !== 1 ? 's' : ''} de dados aplicado${n !== 1 ? 's' : ''}`);
      } else {
        showUpdateBar(updated ? `Atualizado às ${time}` : `Sem novos placares — ${time}`);
      }
    } catch (err) {
      console.error('Erro ESPN:', err);
      showUpdateBar('Não foi possível atualizar. Tente novamente.');
    }

    btn.classList.remove('loading');
    btn.querySelector('span').textContent = 'Atualizar';
    fetching = false;
  }

  function doSearch() {
    searchQuery = (document.getElementById('teamSearch').value || '').trim();
    document.getElementById('searchClear').classList.toggle('hidden', !searchQuery);
    render();
  }

  function clearSearch() {
    searchQuery = '';
    document.getElementById('teamSearch').value = '';
    document.getElementById('searchClear').classList.add('hidden');
    render();
  }

  function showUpdateBar(msg) {
    const bar = document.getElementById('updateBar');
    bar.textContent = msg;
    bar.classList.add('visible');
  }

  function switchTab(tab, btn) {
    activeTab = tab;
    document.querySelectorAll('.ntab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    render();
  }

  function refresh() { fetchScores(); }

  /* ── INTERVALO ADAPTATIVO ──
     30s com jogo ao vivo, 5 min sem jogos ativos.
     Usa setTimeout recursivo para ajustar o delay a cada tick. */
  function scheduleNext() {
    const hasLive = MATCHES.some(m => getStatus(m) === 'live');
    const delay   = hasLive ? 30_000 : 5 * 60_000;
    setTimeout(async () => {
      const active = MATCHES.some(m => getStatus(m) === 'live' || isJustDone(m));
      if (active) await fetchScores();
      else render();
      scheduleNext();
    }, delay);
  }

  /* ── INIT ── */
  function init() {
    render();
    fetchScores();
    scheduleNext();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { refresh, switchTab, doSearch, clearSearch, onFlagError };

})();
