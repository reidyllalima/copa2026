/* ─── COPA DO MUNDO 2026 — APP ─── */

const App = (() => {

  /* ── STATE ── */
  let scores       = {};
  let bracketTeams = {}; // { matchId: { h1: teamKey, h2: teamKey } }
  let matchWinners = {}; // { matchId: { winnerKey, loserKey } } — da ESPN ou por placar
  let matchMeta    = {}; // { matchId: { period, shootoutHome, shootoutAway } }
  let fetching    = false;
  let activeTab   = 'main';
  let searchQuery = '';

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

  /* ── HELPERS ── */

  /* Retorna os times efetivos de um jogo, sobrescrevendo TBD com dados do bracket */
  function getEffectiveTeams(m) {
    const bt = bracketTeams[m.id] || {};
    return { h1: bt.h1 || m.h1, h2: bt.h2 || m.h2 };
  }

  /* Retorna o tipo de decisão de um jogo (pênaltis ou prorrogação), null se tempo normal */
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

  /* Converte emoji de bandeira → URL de imagem (flagcdn.com) */
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

    /* Cabeçalho */
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

    /* Placar ou horário */
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

    /* Rodapé */
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

  /* ── RENDER: CALENDÁRIO (próximos jogos agrupados por dia) ── */
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

      /* Determina vencedor: prefere o campo winner da ESPN (inclui pênaltis) */
      const wd = matchWinners[matchId];
      let winnerKey, loserKey;

      if (wd) {
        winnerKey = wd.winnerKey;
        loserKey  = wd.loserKey;
      } else {
        const [g1, g2] = scores[matchId];
        if      (g1 > g2) { winnerKey = h1key; loserKey = h2key; }
        else if (g2 > g1) { winnerKey = h2key; loserKey = h1key; }
        else continue; /* Empate ainda em aberto (prorrogação?) */
      }

      if (!winnerKey) continue;

      /* Propaga vencedor para o próximo jogo */
      if (rule.winner) {
        if (!bracketTeams[rule.winner.to]) bracketTeams[rule.winner.to] = {};
        bracketTeams[rule.winner.to][rule.winner.side] = winnerKey;
      }
      /* Propaga perdedor (SFs → disputa de 3º lugar) */
      if (rule.loser && loserKey) {
        if (!bracketTeams[rule.loser.to]) bracketTeams[rule.loser.to] = {};
        bracketTeams[rule.loser.to][rule.loser.side] = loserKey;
      }
    }
  }

  /* ── FETCH PLACARES via ESPN API ── */
  async function fetchScores() {
    if (fetching) return;
    fetching = true;

    const btn = document.getElementById('refreshBtn');
    btn.classList.add('loading');
    btn.querySelector('span').textContent = 'Buscando...';

    const datesToFetch = new Set();
    MATCHES.filter(m => getStatus(m) !== 'upcoming').forEach(m => {
      datesToFetch.add(m.d);
      const next = new Date(m.d + 'T12:00:00');
      next.setDate(next.getDate() + 1);
      datesToFetch.add(next.toISOString().slice(0, 10));
    });

    if (datesToFetch.size === 0) {
      showUpdateBar('Nenhum jogo encerrado ainda.');
      btn.classList.remove('loading');
      btn.querySelector('span').textContent = 'Atualizar';
      fetching = false;
      return;
    }

    let updated = false;
    try {
      for (const date of [...datesToFetch].sort()) {
        const yyyymmdd = date.replace(/-/g, '');
        const resp = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${yyyymmdd}`
        );
        if (!resp.ok) continue;
        const data = await resp.json();

        for (const event of data.events || []) {
          const comp = event.competitions?.[0];
          if (!comp) continue;
          if (comp.status?.type?.name === 'STATUS_SCHEDULED') continue;

          const home = comp.competitors?.find(c => c.homeAway === 'home');
          const away = comp.competitors?.find(c => c.homeAway === 'away');
          if (!home || !away) continue;

          const homeKey = ESPN_TO_LOCAL[home.team.displayName] || ESPN_TO_LOCAL[home.team.name];
          const awayKey = ESPN_TO_LOCAL[away.team.displayName] || ESPN_TO_LOCAL[away.team.name];
          if (!homeKey || !awayKey) continue;

          /* Busca jogo local usando times efetivos (suporta R16+ já propagados) */
          const localMatch = MATCHES.find(m => {
            const { h1, h2 } = getEffectiveTeams(m);
            return h1 === homeKey && h2 === awayKey;
          });
          if (!localMatch) continue;

          const h = parseInt(home.score, 10);
          const a = parseInt(away.score, 10);
          if (!isNaN(h) && !isNaN(a)) {
            scores[localMatch.id] = [h, a];
            updated = true;
          }

          /* Captura metadados: período e placar de pênaltis */
          matchMeta[localMatch.id] = {
            period:       comp.status?.period ?? 0,
            shootoutHome: isFinite(+home.shootoutScore) ? +home.shootoutScore : null,
            shootoutAway: isFinite(+away.shootoutScore) ? +away.shootoutScore : null,
          };

          /* Captura vencedor da ESPN (cobre pênaltis e prorrogação) */
          if (home.winner === true) {
            matchWinners[localMatch.id] = { winnerKey: homeKey, loserKey: awayKey };
          } else if (away.winner === true) {
            matchWinners[localMatch.id] = { winnerKey: awayKey, loserKey: homeKey };
          }
        }

        /* Propaga após cada data para que a próxima data resolva times do R16+ */
        propagateBracket();
      }

      render();
      const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      showUpdateBar(updated ? `Atualizado às ${time}` : `Sem novos placares — ${time}`);
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

  /* ── INIT ── */
  function init() {
    render();
    fetchScores();

    setInterval(() => {
      const now         = Date.now();
      const hasLive     = MATCHES.some(m => getStatus(m) === 'live');
      const hasJustDone = MATCHES.some(m => {
        const start    = matchDate(m).getTime();
        const duration = m.phase ? 135 : 110;
        const end      = start + duration * 60 * 1000;
        return now > end && now < end + 5 * 60 * 1000;
      });
      if (hasLive || hasJustDone) fetchScores();
      else render();
    }, 60 * 1000);
  }

  document.addEventListener('DOMContentLoaded', init);

  return { refresh, switchTab, doSearch, clearSearch, onFlagError };

})();
