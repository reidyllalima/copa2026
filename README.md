# 🏆 Copa do Mundo 2026 — Calendário e Placares

Aplicação web responsiva para acompanhar todos os jogos da Copa do Mundo FIFA 2026 (EUA · Canadá · México).

## ✨ Funcionalidades

- **Jogos encerrados** com placar real (via ESPN API)
- **Jogo ao vivo** destacado, se você acessar durante uma partida
- **Próximos jogos** com data e horário (horário de Brasília)
- **Bandeiras** circulares de todas as seleções via flagcdn.com
- **Auto-refresh** a cada 60 segundos durante jogos ao vivo
- **Design responsivo** em PC e celular
- **Busca por seleção** accent/case-insensitive com filtro em tempo real

## 🔍 Busca por Seleção

O campo de busca na barra de navegação permite filtrar os jogos de qualquer seleção. A busca é insensível a acentos e maiúsculas/minúsculas:

- `México` = `Mexico` = `mexico` = `MEX`
- `Brasil` = `brasil` = `BRA`

Ao buscar, são exibidos **todos os jogos** da seleção de uma vez — encerrados, ao vivo e futuros — independente da aba ativa. Um botão ✕ aparece no campo para limpar o filtro e voltar à visão normal.

## 🗂 Estrutura

```
copa2026/
├── index.html       # Página principal
├── css/
│   └── style.css    # Estilos
├── js/
│   ├── data.js      # Dados de times e partidas
│   └── app.js       # Lógica da aplicação
└── README.md
```

### js/app.js — métodos públicos expostos

| Método | Descrição |
|---|---|
| `App.refresh()` | Busca placares atualizados na ESPN API |
| `App.switchTab(tab, btn)` | Alterna entre as abas "Ao Vivo" e "Histórico" |
| `App.doSearch()` | Executa a busca pelo valor do campo `#teamSearch` |
| `App.clearSearch()` | Limpa o filtro de busca e restaura a visão normal |
| `App.onFlagError(img)` | Fallback chamado pelo `onerror` das bandeiras |

## 🌐 Horários

Todos os horários estão em **horário de Brasília (UTC−3)**.

## 📅 Dados

- **72 jogos** da fase de grupos (rodadas 1, 2 e 3)
- **48 seleções** / **12 grupos**
- Fase de grupos: **11 a 27 de junho de 2026**

## 📋 Histórico de alterações

### v3 — Junho 2026
- **Busca por seleção:** campo accent/case-insensitive (`México == mexico`) com filtro em tempo real e botão Buscar. Exibe todos os jogos da seleção (passados, ao vivo e futuros) em uma única visão.
- **Fallback de bandeiras:** adicionado `onerror` em todas as `<img>` de bandeira — se a imagem do flagcdn falhar, substitui automaticamente pelo emoji ou abreviação da seleção.
- **Correção de dados:** substituído o placeholder "Repescagem M1" pela **República Democrática do Congo** (`COD` / 🇨🇩), que se classificou pela repescagem intercontinental vencendo a Jamaica por 1–0 na prorrogação.
- **Segurança:** escape de HTML no termo buscado para evitar XSS.

### v2 — Junho 2026 (redesign)
- Redesign visual: tema dourado escuro, bandeiras circulares via flagcdn.com, animações de entrada escalonadas nos cards.

### v1 — Junho 2026
- Layout inicial em grade 3×, abas Ao Vivo/Histórico, placares via ESPN API.
