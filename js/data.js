/* ─── DADOS: SELEÇÕES ─── */
const TEAMS = {
  MEX: { name: 'México',           abbr: 'MEX', flag: '🇲🇽', group: 'A' },
  RSA: { name: 'África do Sul',    abbr: 'RSA', flag: '🇿🇦', group: 'A' },
  KOR: { name: 'Coreia do Sul',    abbr: 'KOR', flag: '🇰🇷', group: 'A' },
  CZE: { name: 'Rep. Tcheca',       abbr: 'CZE', flag: '🇨🇿', group: 'A' },
  CAN: { name: 'Canadá',           abbr: 'CAN', flag: '🇨🇦', group: 'B' },
  BIH: { name: 'Bósnia-Herz.',     abbr: 'BIH', flag: '🇧🇦', group: 'B' },
  QAT: { name: 'Catar',            abbr: 'QAT', flag: '🇶🇦', group: 'B' },
  SUI: { name: 'Suíça',            abbr: 'SUI', flag: '🇨🇭', group: 'B' },
  BRA: { name: 'Brasil',           abbr: 'BRA', flag: '🇧🇷', group: 'C' },
  MAR: { name: 'Marrocos',         abbr: 'MAR', flag: '🇲🇦', group: 'C' },
  HAI: { name: 'Haiti',            abbr: 'HAI', flag: '🇭🇹', group: 'C' },
  SCO: { name: 'Escócia',          abbr: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C' },
  USA: { name: 'Estados Unidos',   abbr: 'USA', flag: '🇺🇸', group: 'D' },
  PAR: { name: 'Paraguai',         abbr: 'PAR', flag: '🇵🇾', group: 'D' },
  AUS: { name: 'Austrália',        abbr: 'AUS', flag: '🇦🇺', group: 'D' },
  TUR: { name: 'Turquia',          abbr: 'TUR', flag: '🇹🇷', group: 'D' },
  GER: { name: 'Alemanha',         abbr: 'GER', flag: '🇩🇪', group: 'E' },
  CUW: { name: 'Curaçao',          abbr: 'CUW', flag: '🇨🇼', group: 'E' },
  CIV: { name: 'Costa do Marfim',  abbr: 'CIV', flag: '🇨🇮', group: 'E' },
  ECU: { name: 'Equador',          abbr: 'ECU', flag: '🇪🇨', group: 'E' },
  NED: { name: 'Holanda',          abbr: 'NED', flag: '🇳🇱', group: 'F' },
  JPN: { name: 'Japão',            abbr: 'JPN', flag: '🇯🇵', group: 'F' },
  TUN: { name: 'Tunísia',          abbr: 'TUN', flag: '🇹🇳', group: 'F' },
  SWE: { name: 'Suécia',            abbr: 'SWE', flag: '🇸🇪', group: 'F' },
  BEL: { name: 'Bélgica',          abbr: 'BEL', flag: '🇧🇪', group: 'G' },
  EGY: { name: 'Egito',            abbr: 'EGY', flag: '🇪🇬', group: 'G' },
  IRN: { name: 'Irã',              abbr: 'IRN', flag: '🇮🇷', group: 'G' },
  NZL: { name: 'Nova Zelândia',    abbr: 'NZL', flag: '🇳🇿', group: 'G' },
  ESP: { name: 'Espanha',          abbr: 'ESP', flag: '🇪🇸', group: 'H' },
  CPV: { name: 'Cabo Verde',       abbr: 'CPV', flag: '🇨🇻', group: 'H' },
  KSA: { name: 'Arábia Saudita',   abbr: 'KSA', flag: '🇸🇦', group: 'H' },
  URU: { name: 'Uruguai',          abbr: 'URU', flag: '🇺🇾', group: 'H' },
  FRA: { name: 'França',           abbr: 'FRA', flag: '🇫🇷', group: 'I' },
  SEN: { name: 'Senegal',          abbr: 'SEN', flag: '🇸🇳', group: 'I' },
  NOR: { name: 'Noruega',          abbr: 'NOR', flag: '🇳🇴', group: 'I' },
  IRQ: { name: 'Iraque',            abbr: 'IRQ', flag: '🇮🇶', group: 'I' },
  ARG: { name: 'Argentina',        abbr: 'ARG', flag: '🇦🇷', group: 'J' },
  ALG: { name: 'Argélia',          abbr: 'ALG', flag: '🇩🇿', group: 'J' },
  AUT: { name: 'Áustria',          abbr: 'AUT', flag: '🇦🇹', group: 'J' },
  JOR: { name: 'Jordânia',         abbr: 'JOR', flag: '🇯🇴', group: 'J' },
  POR: { name: 'Portugal',         abbr: 'POR', flag: '🇵🇹', group: 'K' },
  UZB: { name: 'Uzbequistão',      abbr: 'UZB', flag: '🇺🇿', group: 'K' },
  COL: { name: 'Colômbia',         abbr: 'COL', flag: '🇨🇴', group: 'K' },
  COD: { name: 'R.D. Congo',        abbr: 'COD', flag: '🇨🇩', group: 'K' },
  ENG: { name: 'Inglaterra',       abbr: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L' },
  CRO: { name: 'Croácia',          abbr: 'CRO', flag: '🇭🇷', group: 'L' },
  GHA: { name: 'Gana',             abbr: 'GHA', flag: '🇬🇭', group: 'L' },
  PAN: { name: 'Panamá',           abbr: 'PAN', flag: '🇵🇦', group: 'L' },
  TBD: { name: 'A definir',        abbr: '···', flag: '⚽', group: null },
};

/* ─── DADOS: PARTIDAS
   d  = data ISO (hora de Brasília UTC-3)
   h  = horário Brasília HH:MM
   h1 = código time casa
   h2 = código time fora
   g  = grupo
   r  = rodada (1/2/3)
─── */
const MATCHES = [
  /* ── RODADA 1 ── */
  { id:'g001', d:'2026-06-11', h:'16:00', h1:'MEX', h2:'RSA', venue:'Cidade do México', g:'A', r:1 },
  { id:'g002', d:'2026-06-11', h:'23:00', h1:'KOR', h2:'CZE', venue:'Guadalajara',       g:'A', r:1 },
  { id:'g003', d:'2026-06-12', h:'16:00', h1:'CAN', h2:'BIH', venue:'Toronto',           g:'B', r:1 },
  { id:'g004', d:'2026-06-12', h:'22:00', h1:'USA', h2:'PAR', venue:'Los Angeles',       g:'D', r:1 },
  { id:'g005', d:'2026-06-14', h:'01:00', h1:'AUS', h2:'TUR', venue:'Vancouver',         g:'D', r:1 },
  { id:'g006', d:'2026-06-13', h:'16:00', h1:'QAT', h2:'SUI', venue:'San Francisco',     g:'B', r:1 },
  { id:'g007', d:'2026-06-13', h:'19:00', h1:'BRA', h2:'MAR', venue:'Nova York / NJ',   g:'C', r:1 },
  { id:'g008', d:'2026-06-13', h:'22:00', h1:'HAI', h2:'SCO', venue:'Boston',            g:'C', r:1 },
  { id:'g009', d:'2026-06-14', h:'14:00', h1:'GER', h2:'CUW', venue:'Houston',           g:'E', r:1 },
  { id:'g010', d:'2026-06-14', h:'17:00', h1:'NED', h2:'JPN', venue:'Dallas',            g:'F', r:1 },
  { id:'g011', d:'2026-06-14', h:'20:00', h1:'CIV', h2:'ECU', venue:'Filadélfia',        g:'E', r:1 },
  { id:'g012', d:'2026-06-14', h:'23:00', h1:'SWE', h2:'TUN', venue:'Monterrey',         g:'F', r:1 },
  { id:'g013', d:'2026-06-15', h:'13:00', h1:'ESP', h2:'CPV', venue:'Atlanta',           g:'H', r:1 },
  { id:'g014', d:'2026-06-15', h:'16:00', h1:'BEL', h2:'EGY', venue:'Seattle',           g:'G', r:1 },
  { id:'g015', d:'2026-06-15', h:'19:00', h1:'KSA', h2:'URU', venue:'Miami',             g:'H', r:1 },
  { id:'g016', d:'2026-06-15', h:'22:00', h1:'IRN', h2:'NZL', venue:'Los Angeles',       g:'G', r:1 },
  { id:'g018', d:'2026-06-16', h:'16:00', h1:'FRA', h2:'SEN', venue:'Nova York / NJ',   g:'I', r:1 },
  { id:'g019', d:'2026-06-16', h:'19:00', h1:'IRQ', h2:'NOR', venue:'Boston',            g:'I', r:1 },
  { id:'g017', d:'2026-06-16', h:'22:00', h1:'ARG', h2:'ALG', venue:'Kansas City',       g:'J', r:1 },
  { id:'g020', d:'2026-06-17', h:'01:00', h1:'AUT', h2:'JOR', venue:'San Francisco',     g:'J', r:1 },
  { id:'g021', d:'2026-06-17', h:'14:00', h1:'POR', h2:'COD', venue:'Houston',           g:'K', r:1 },
  { id:'g022', d:'2026-06-17', h:'17:00', h1:'ENG', h2:'CRO', venue:'Dallas',            g:'L', r:1 },
  { id:'g023', d:'2026-06-17', h:'20:00', h1:'GHA', h2:'PAN', venue:'Toronto',           g:'L', r:1 },
  { id:'g024', d:'2026-06-17', h:'23:00', h1:'UZB', h2:'COL', venue:'Cidade do México', g:'K', r:1 },
  /* ── RODADA 2 ── */
  { id:'g025', d:'2026-06-18', h:'13:00', h1:'CZE', h2:'RSA', venue:'Atlanta',           g:'A', r:2 },
  { id:'g026', d:'2026-06-18', h:'16:00', h1:'SUI', h2:'BIH', venue:'Los Angeles',       g:'B', r:2 },
  { id:'g027', d:'2026-06-18', h:'19:00', h1:'CAN', h2:'QAT', venue:'Vancouver',         g:'B', r:2 },
  { id:'g028', d:'2026-06-18', h:'22:00', h1:'MEX', h2:'KOR', venue:'Guadalajara',       g:'A', r:2 },
  { id:'g029', d:'2026-06-20', h:'00:00', h1:'TUR', h2:'PAR', venue:'San Francisco',     g:'D', r:2 },
  { id:'g030', d:'2026-06-19', h:'16:00', h1:'USA', h2:'AUS', venue:'Seattle',           g:'D', r:2 },
  { id:'g031', d:'2026-06-19', h:'19:00', h1:'SCO', h2:'MAR', venue:'Boston',            g:'C', r:2 },
  { id:'g032', d:'2026-06-19', h:'21:30', h1:'BRA', h2:'HAI', venue:'Filadélfia',        g:'C', r:2 },
  { id:'g033', d:'2026-06-20', h:'14:00', h1:'NED', h2:'SWE', venue:'Houston',           g:'F', r:2 },
  { id:'g034', d:'2026-06-20', h:'17:00', h1:'GER', h2:'CIV', venue:'Toronto',           g:'E', r:2 },
  { id:'g035', d:'2026-06-20', h:'21:00', h1:'ECU', h2:'CUW', venue:'Kansas City',       g:'E', r:2 },
  { id:'g036', d:'2026-06-21', h:'01:00', h1:'TUN', h2:'JPN', venue:'Monterrey',         g:'F', r:2 },
  { id:'g037', d:'2026-06-21', h:'13:00', h1:'ESP', h2:'KSA', venue:'Atlanta',           g:'H', r:2 },
  { id:'g038', d:'2026-06-21', h:'16:00', h1:'BEL', h2:'IRN', venue:'Los Angeles',       g:'G', r:2 },
  { id:'g039', d:'2026-06-21', h:'19:00', h1:'URU', h2:'CPV', venue:'Miami',             g:'H', r:2 },
  { id:'g040', d:'2026-06-21', h:'22:00', h1:'NZL', h2:'EGY', venue:'Vancouver',         g:'G', r:2 },
  { id:'g041', d:'2026-06-22', h:'14:00', h1:'ARG', h2:'AUT', venue:'Dallas',            g:'J', r:2 },
  { id:'g042', d:'2026-06-22', h:'18:00', h1:'FRA', h2:'IRQ', venue:'Filadélfia',        g:'I', r:2 },
  { id:'g043', d:'2026-06-22', h:'21:00', h1:'NOR', h2:'SEN', venue:'Nova York / NJ',   g:'I', r:2 },
  { id:'g044', d:'2026-06-23', h:'00:00', h1:'JOR', h2:'ALG', venue:'San Francisco',     g:'J', r:2 },
  { id:'g045', d:'2026-06-23', h:'14:00', h1:'POR', h2:'UZB', venue:'Houston',           g:'K', r:2 },
  { id:'g046', d:'2026-06-23', h:'17:00', h1:'ENG', h2:'GHA', venue:'Boston',            g:'L', r:2 },
  { id:'g047', d:'2026-06-23', h:'20:00', h1:'PAN', h2:'CRO', venue:'Toronto',           g:'L', r:2 },
  { id:'g048', d:'2026-06-23', h:'23:00', h1:'COL', h2:'COD', venue:'Guadalajara',       g:'K', r:2 },
  /* ── RODADA 3 ── */
  { id:'g049', d:'2026-06-24', h:'16:00', h1:'SUI', h2:'CAN', venue:'Vancouver',         g:'B', r:3 },
  { id:'g050', d:'2026-06-24', h:'16:00', h1:'BIH', h2:'QAT', venue:'Seattle',           g:'B', r:3 },
  { id:'g051', d:'2026-06-24', h:'19:00', h1:'SCO', h2:'BRA', venue:'Miami',             g:'C', r:3 },
  { id:'g052', d:'2026-06-24', h:'19:00', h1:'MAR', h2:'HAI', venue:'Atlanta',           g:'C', r:3 },
  { id:'g053', d:'2026-06-24', h:'22:00', h1:'CZE', h2:'MEX', venue:'Cidade do México', g:'A', r:3 },
  { id:'g054', d:'2026-06-24', h:'22:00', h1:'RSA', h2:'KOR', venue:'Monterrey',         g:'A', r:3 },
  { id:'g055', d:'2026-06-25', h:'17:00', h1:'ECU', h2:'GER', venue:'Nova York / NJ',   g:'E', r:3 },
  { id:'g056', d:'2026-06-25', h:'17:00', h1:'CUW', h2:'CIV', venue:'Filadélfia',        g:'E', r:3 },
  { id:'g057', d:'2026-06-25', h:'20:00', h1:'JPN', h2:'SWE', venue:'Dallas',            g:'F', r:3 },
  { id:'g058', d:'2026-06-25', h:'20:00', h1:'TUN', h2:'NED', venue:'Kansas City',       g:'F', r:3 },
  { id:'g059', d:'2026-06-25', h:'23:00', h1:'TUR', h2:'USA', venue:'Los Angeles',       g:'D', r:3 },
  { id:'g060', d:'2026-06-25', h:'23:00', h1:'PAR', h2:'AUS', venue:'San Francisco',     g:'D', r:3 },
  { id:'g061', d:'2026-06-26', h:'16:00', h1:'NOR', h2:'FRA', venue:'Boston',            g:'I', r:3 },
  { id:'g062', d:'2026-06-26', h:'16:00', h1:'SEN', h2:'IRQ', venue:'Toronto',           g:'I', r:3 },
  { id:'g063', d:'2026-06-26', h:'21:00', h1:'CPV', h2:'KSA', venue:'Houston',           g:'H', r:3 },
  { id:'g064', d:'2026-06-26', h:'21:00', h1:'URU', h2:'ESP', venue:'Guadalajara',       g:'H', r:3 },
  { id:'g065', d:'2026-06-27', h:'00:00', h1:'EGY', h2:'IRN', venue:'Seattle',           g:'G', r:3 },
  { id:'g066', d:'2026-06-27', h:'00:00', h1:'NZL', h2:'BEL', venue:'Vancouver',         g:'G', r:3 },
  { id:'g067', d:'2026-06-27', h:'18:00', h1:'PAN', h2:'ENG', venue:'Nova York / NJ',   g:'L', r:3 },
  { id:'g068', d:'2026-06-27', h:'18:00', h1:'CRO', h2:'GHA', venue:'Filadélfia',        g:'L', r:3 },
  { id:'g069', d:'2026-06-27', h:'20:30', h1:'COL', h2:'POR', venue:'Miami',             g:'K', r:3 },
  { id:'g070', d:'2026-06-27', h:'20:30', h1:'COD', h2:'UZB', venue:'Atlanta',           g:'K', r:3 },
  { id:'g071', d:'2026-06-27', h:'23:00', h1:'ALG', h2:'AUT', venue:'Kansas City',       g:'J', r:3 },
  { id:'g072', d:'2026-06-27', h:'23:00', h1:'JOR', h2:'ARG', venue:'Dallas',            g:'J', r:3 },

  /* ─── MATA-MATA ─── */
  /* ── RODADA DE 32 ── */
  { id:'k073', d:'2026-06-28', h:'16:00', h1:'RSA', h2:'CAN', venue:'Los Angeles',       phase:'R32' },
  { id:'k076', d:'2026-06-29', h:'14:00', h1:'BRA', h2:'JPN', venue:'Houston',           phase:'R32' },
  { id:'k074', d:'2026-06-29', h:'17:30', h1:'GER', h2:'PAR', venue:'Boston',            phase:'R32' },
  { id:'k075', d:'2026-06-29', h:'22:00', h1:'NED', h2:'MAR', venue:'Monterrey',         phase:'R32' },
  { id:'k078', d:'2026-06-30', h:'14:00', h1:'CIV', h2:'NOR', venue:'Dallas',            phase:'R32' },
  { id:'k077', d:'2026-06-30', h:'18:00', h1:'FRA', h2:'SWE', venue:'Nova York / NJ',   phase:'R32' },
  { id:'k079', d:'2026-06-30', h:'22:00', h1:'MEX', h2:'ECU', venue:'Cidade do México', phase:'R32' },
  { id:'k080', d:'2026-07-01', h:'13:00', h1:'ENG', h2:'COD', venue:'Atlanta',           phase:'R32' },
  { id:'k082', d:'2026-07-01', h:'17:00', h1:'BEL', h2:'SEN', venue:'Seattle',           phase:'R32' },
  { id:'k081', d:'2026-07-01', h:'21:00', h1:'USA', h2:'BIH', venue:'San Francisco',     phase:'R32' },
  { id:'k084', d:'2026-07-02', h:'16:00', h1:'ESP', h2:'AUT', venue:'Los Angeles',       phase:'R32' },
  { id:'k083', d:'2026-07-02', h:'20:00', h1:'POR', h2:'CRO', venue:'Toronto',           phase:'R32' },
  { id:'k085', d:'2026-07-03', h:'00:00', h1:'SUI', h2:'ALG', venue:'Vancouver',         phase:'R32' },
  { id:'k088', d:'2026-07-03', h:'15:00', h1:'AUS', h2:'EGY', venue:'Dallas',            phase:'R32' },
  { id:'k086', d:'2026-07-03', h:'17:00', h1:'ARG', h2:'CPV', venue:'Miami',             phase:'R32' },
  { id:'k087', d:'2026-07-03', h:'22:30', h1:'COL', h2:'GHA', venue:'Kansas City',       phase:'R32' },

  /* ── OITAVAS DE FINAL ── */
  { id:'k089', d:'2026-07-04', h:'15:00', h1:'TBD', h2:'TBD', venue:'Nova York / NJ',   phase:'R16' },
  { id:'k090', d:'2026-07-04', h:'19:00', h1:'TBD', h2:'TBD', venue:'Boston',            phase:'R16' },
  { id:'k091', d:'2026-07-05', h:'15:00', h1:'TBD', h2:'TBD', venue:'Seattle',           phase:'R16' },
  { id:'k092', d:'2026-07-05', h:'19:00', h1:'TBD', h2:'TBD', venue:'Atlanta',           phase:'R16' },
  { id:'k093', d:'2026-07-06', h:'15:00', h1:'TBD', h2:'TBD', venue:'Los Angeles',       phase:'R16' },
  { id:'k094', d:'2026-07-06', h:'19:00', h1:'TBD', h2:'TBD', venue:'Kansas City',       phase:'R16' },
  { id:'k095', d:'2026-07-07', h:'15:00', h1:'TBD', h2:'TBD', venue:'Monterrey',         phase:'R16' },
  { id:'k096', d:'2026-07-07', h:'19:00', h1:'TBD', h2:'TBD', venue:'Dallas',            phase:'R16' },

  /* ── QUARTAS DE FINAL ── */
  { id:'k097', d:'2026-07-09', h:'17:00', h1:'TBD', h2:'TBD', venue:'Nova York / NJ',   phase:'QF' },
  { id:'k098', d:'2026-07-09', h:'20:00', h1:'TBD', h2:'TBD', venue:'San Francisco',     phase:'QF' },
  { id:'k099', d:'2026-07-10', h:'17:00', h1:'TBD', h2:'TBD', venue:'Filadélfia',        phase:'QF' },
  { id:'k100', d:'2026-07-11', h:'17:00', h1:'TBD', h2:'TBD', venue:'Houston',           phase:'QF' },

  /* ── SEMIFINAIS ── */
  { id:'k101', d:'2026-07-14', h:'19:00', h1:'TBD', h2:'TBD', venue:'Dallas',            phase:'SF' },
  { id:'k102', d:'2026-07-15', h:'19:00', h1:'TBD', h2:'TBD', venue:'Nova York / NJ',   phase:'SF' },

  /* ── DISPUTA DE 3º LUGAR ── */
  { id:'k103', d:'2026-07-18', h:'17:00', h1:'TBD', h2:'TBD', venue:'Miami',             phase:'3P' },

  /* ── FINAL ── */
  { id:'k104', d:'2026-07-19', h:'16:00', h1:'TBD', h2:'TBD', venue:'Nova York / NJ',   phase:'F' },
];

/* ─── CHAVEAMENTO MATA-MATA ───
   Verificado via ESPN API (junho/2026).
   side: 'h1' = time da casa, 'h2' = time visitante no próximo jogo.
─── */
const BRACKET = {
  /* ── R32 → R16 (ESPN: R32-N = ordem cronológica dos jogos da R32) ── */
  k073: { winner: { to:'k089', side:'h1' } }, // R32-1  → Oitavas jogo 1 (casa)
  k075: { winner: { to:'k089', side:'h2' } }, // R32-4  → Oitavas jogo 1 (visita)
  k074: { winner: { to:'k090', side:'h1' } }, // R32-3  → Oitavas jogo 2 (casa)
  k078: { winner: { to:'k090', side:'h2' } }, // R32-5  → Oitavas jogo 2 (visita)
  k076: { winner: { to:'k091', side:'h1' } }, // R32-2  → Oitavas jogo 3 (casa)
  k077: { winner: { to:'k091', side:'h2' } }, // R32-6  → Oitavas jogo 3 (visita)
  k079: { winner: { to:'k092', side:'h1' } }, // R32-7  → Oitavas jogo 4 (casa)
  k080: { winner: { to:'k092', side:'h2' } }, // R32-8  → Oitavas jogo 4 (visita)
  k084: { winner: { to:'k093', side:'h1' } }, // R32-11 → Oitavas jogo 5 (casa)
  k083: { winner: { to:'k093', side:'h2' } }, // R32-12 → Oitavas jogo 5 (visita)
  k082: { winner: { to:'k094', side:'h1' } }, // R32-9  → Oitavas jogo 6 (casa)
  k081: { winner: { to:'k094', side:'h2' } }, // R32-10 → Oitavas jogo 6 (visita)
  k088: { winner: { to:'k095', side:'h1' } }, // R32-14 → Oitavas jogo 7 (casa)
  k087: { winner: { to:'k095', side:'h2' } }, // R32-16 → Oitavas jogo 7 (visita)
  k085: { winner: { to:'k096', side:'h1' } }, // R32-13 → Oitavas jogo 8 (casa)
  k086: { winner: { to:'k096', side:'h2' } }, // R32-15 → Oitavas jogo 8 (visita)
  /* ── R16 → QF (ESPN: QF-1=R16-1×2, QF-2=R16-5×6, QF-3=R16-3×4, QF-4=R16-7×8) ── */
  k089: { winner: { to:'k097', side:'h1' } }, // R16-1 → QF-1 (casa)
  k090: { winner: { to:'k097', side:'h2' } }, // R16-2 → QF-1 (visita)
  k093: { winner: { to:'k098', side:'h1' } }, // R16-5 → QF-2 (casa)
  k094: { winner: { to:'k098', side:'h2' } }, // R16-6 → QF-2 (visita)
  k091: { winner: { to:'k099', side:'h1' } }, // R16-3 → QF-3 (casa)
  k092: { winner: { to:'k099', side:'h2' } }, // R16-4 → QF-3 (visita)
  k095: { winner: { to:'k100', side:'h1' } }, // R16-7 → QF-4 (casa)
  k096: { winner: { to:'k100', side:'h2' } }, // R16-8 → QF-4 (visita)
  /* ── QF → SF (ESPN: SF-1=QF1×QF2, SF-2=QF3×QF4) ── */
  k097: { winner: { to:'k101', side:'h1' } },
  k098: { winner: { to:'k101', side:'h2' } },
  k099: { winner: { to:'k102', side:'h1' } },
  k100: { winner: { to:'k102', side:'h2' } },
  /* ── SF → Final e 3º Lugar ── */
  k101: { winner: { to:'k104', side:'h1' }, loser: { to:'k103', side:'h1' } },
  k102: { winner: { to:'k104', side:'h2' }, loser: { to:'k103', side:'h2' } },
};
