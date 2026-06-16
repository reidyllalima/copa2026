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

## 🌐 Horários

Todos os horários estão em **horário de Brasília (UTC−3)**.

## 📅 Dados

- **72 jogos** da fase de grupos (rodadas 1, 2 e 3)
- **48 seleções** / **12 grupos**
- Fase de grupos: **11 a 27 de junho de 2026**

