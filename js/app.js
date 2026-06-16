/* ─── COPA DO MUNDO 2026 — APP ─── */

const App = (() => {

  /* ── STATE ── */
  let scores    = {};
  let fetching  = false;
  let activeTab = 'main';

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
  };

  /* ── HELPERS ── */
  function matchDate(m) {
    const [Y, Mo, D] = m.d.split('-').map(Number);
    const [H, Min]   = m.h.split(':').map(Number);
    return new Date(Date.UTC(Y, Mo - 1, D, H + 3, Min));
  }

  function getStatus(m) {
    const now   = Date.now();
    const start = matchDate(m).getTime();
    const end   = start + 110 * 60 * 1000;
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

  /* ── RENDER: CARD ── */
  function renderCard(m) {
    const t1     = TEAMS[m.h1] || { name: m.h1, abbr: m.h1, flag: '🏴' };
    const t2     = TEAMS[m.h2] || { name: m.h2, abbr: m.h2, flag: '🏴' };
    const status = getStatus(m);
    const sc     = scores[m.id];

    /* Cabeçalho */
    let headHtml;
    if (status === 'live') {
      headHtml = `
        <span class="live-badge"><span class="live-pulse"></span>AO VIVO</span>
        <span class="card-round">Grupo ${m.g}</span>`;
    } else {
      headHtml = `
        <span class="card-grp">Grupo ${m.g}</span>
        <span class="card-round">${ROUND_LABEL[m.r] || ''}</span>`;
    }

    /* Placar ou horário */
    let vsHtml;
    if (status === 'past' || status === 'live') {
      const g1 = sc != null ? sc[0] : '–';
      const g2 = sc != null ? sc[1] : '–';
      vsHtml = `
        <div class="card-score">
          <span class="card-sc">${g1}</span>
          <span class="card-sc-sep">×</span>
          <span class="card-sc">${g2}</span>
        </div>`;
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
      <article class="match-card ${status}" aria-label="${t1.name} × ${t2.name}">
        <div class="card-head">${headHtml}</div>
        <div class="card-matchup">
          <div class="cb home">
            <span class="cb-flag">${t1.flag}</span>
            <span class="cb-abbr">${t1.abbr}</span>
            <span class="cb-name">${t1.name}</span>
          </div>
          <div class="card-vs">${vsHtml}</div>
          <div class="cb away">
            <span class="cb-flag">${t2.flag}</span>
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
      <div class="cards-grid">${matches.map(renderCard).join('')}</div>`;
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
          <div class="cards-grid">${byDay[day].map(renderCard).join('')}</div>
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
      <div class="cards-grid">${past.map(renderCard).join('')}</div>`;
  }

  /* ── RENDER PRINCIPAL ── */
  function render() {
    const live     = MATCHES.filter(m => getStatus(m) === 'live');
    const upcoming = MATCHES.filter(m => getStatus(m) === 'upcoming');
    const past     = MATCHES.filter(m => getStatus(m) === 'past').reverse();

    let html = '';

    if (activeTab === 'main') {
      html += renderLiveSection(live);
      html += renderCalendar(upcoming);
      if (!live.length && !upcoming.length) {
        html = '<div class="empty-section">Nenhum jogo em andamento ou futuro.</div>';
      }
    } else {
      html = renderHistory(past);
    }

    document.getElementById('sections').innerHTML = html;
    document.getElementById('loadingState').classList.add('hidden');
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

          const localMatch = MATCHES.find(m => m.h1 === homeKey && m.h2 === awayKey);
          if (!localMatch) continue;

          const h = parseInt(home.score, 10);
          const a = parseInt(away.score, 10);
          if (!isNaN(h) && !isNaN(a)) {
            scores[localMatch.id] = [h, a];
            updated = true;
          }
        }
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
      const hasLive = MATCHES.some(m => getStatus(m) === 'live');
      if (hasLive) fetchScores();
      else render();
    }, 60 * 1000);
  }

  document.addEventListener('DOMContentLoaded', init);

  return { refresh, switchTab };

})();
