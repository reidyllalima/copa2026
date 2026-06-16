# 🏆 Copa do Mundo 2026 — Calendário e Placares

Aplicação web responsiva para acompanhar todos os jogos da Copa do Mundo FIFA 2026 (EUA · Canadá · México).

## ✨ Funcionalidades

- **Jogos encerrados** com placar real (via IA)
- **Jogo ao vivo** destacado, se você acessar durante uma partida
- **Próximos jogos** com data e horário (horário de Brasília)
- **Filtro por grupo** (A–L), com destaque para o Grupo C 🇧🇷
- **Bandeiras** e nomes das seleções
- **Auto-refresh** a cada 5 minutos durante jogos ao vivo
- Design responsivo: funciona em PC e celular

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

## 🚀 Como subir no GitHub Pages

1. Suba a pasta no seu repositório GitHub
2. Vá em **Settings → Pages**
3. Em *Source*, selecione **main** branch, pasta **/ (root)**
4. Pronto — a URL será `https://SEU-USUARIO.github.io/NOME-DO-REPO/`

## 🔄 Como os placares funcionam

Ao carregar a página (e ao clicar em **Atualizar**), a app consulta a API da Anthropic (`claude-sonnet-4-6`) com a lista dos jogos já encerrados e solicita os placares reais. O modelo responde com JSON puro, que é aplicado nos cartões correspondentes.

> ℹ️ A API key é passada automaticamente pelo proxy da Anthropic (claude.ai). Para uso externo, configure sua própria chave no `app.js`.

## 🌐 Horários

Todos os horários estão em **horário de Brasília (UTC−3)**.

## 📅 Dados

- **72 jogos** da fase de grupos (rodadas 1, 2 e 3)
- **48 seleções** / **12 grupos**
- Fase de grupos: **11 a 27 de junho de 2026**
