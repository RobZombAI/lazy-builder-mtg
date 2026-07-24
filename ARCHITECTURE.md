# ARCHITECTURE.md — Lazy Builder

## 1. Panoramica dell'Architettura
Lazy Builder è un'applicazione web Single Page Application (SPA) realizzata in **React**, **TypeScript** e **Vite**, concepita per essere veloce, modulare, totalmente eseguibile in locale su Mac e fruibile sia in modalità standalone/demo sia con chiavi API per servizi AI.

```
[ UI Layer (React Components) ]
          │
          ▼
[ State & Application Controller (React Hooks / Context) ]
          │
   ┌──────┴───────────────────────────┬─────────────────────────────┐
   ▼                                   ▼                             ▼
[ Card Data Service ]        [ Deck Generator Engine ]     [ Commander Validator ]
  ├─ Scryfall API Provider     ├─ Strategy Parser            ├─ Color Identity Check
  └─ Local Demo Fixture DB     ├─ Power Level Scaler (1-5)   ├─ 100 Cards Exact Check
                               ├─ Quantitative Budgeter      ├─ Banlist & Legality
                               └─ Mana Base Calculator       └─ Duplicates Inspector
                                       │
                                       ▼
                             [ Deck Exporter Service ]
```

## 2. Componenti Chiave del Sistema

### 2.1 UI Layer (`src/components/`)
- `Navbar` & `Header`: Brand identity, status indicatori (Demo Mode / AI Active).
- `CommanderSearch`: Input autocompletato con anteprima carta, identità di colore e indicatori legali.
- `PowerLevelSelector`: Widget visivo da 1 a 5 con dettagli strategici per livello.
- `DeckRequestForm`: Form di personalizzazione (prompt libero, budget, combo infinite, carte in/out, terre).
- `GenerationProgress`: UI con feedback incrementale durante l'elaborazione.
- `DeckView`: Visualizzazione divisa in tab (Vista per Tipo, Vista Funzionale, Analisi Strategica, Mana Curve & Stats).
- `DeckCardItem`: Singolo elemento carta con foto, mana cost, tag e pulsanti di Lock/Swap/Remove.
- `DeckExporterModal`: Finestra modale per la copia o il download del mazzo in vari formati.

### 2.2 Card Data Layer (`src/services/cardData/`)
- `CardDataProvider` (Interfaccia Astratta): Definisce i metodi `searchCards`, `getCardByName`, `getCardById`, `searchCommanders`.
- `ScryfallProvider`: Implementazione delle chiamate all'API Scryfall con caching integrato.
- `DemoCardProvider`: Fixture locale con un catalogo bilanciato di oltre 200 carte classiche MTG per funzionamento senza connessione/API.

### 2.3 Commander Validator (`src/services/validator/`)
- `CommanderValidator`: Modulo deterministico in TypeScript puro. Non dipende da LLM.
- Controlla 9 vincoli fondamentali:
  1. Esattamente 100 carte (o 99 + 1 Comandante).
  2. Nessun duplicato (tranne terre base e carte con testo speciale come *Relentless Rats*).
  3. Rispetto dell'identità di colore del comandante.
  4. Legalità specifica nel formato Commander.
  5. Assenza di carte nella Banlist ufficiale MTG Commander.
  6. Validità del Comandante (Creatura Leggendaria o speciale).
  7. Quantità corrette.
  8. Presenza di terre sufficienti per la mana curve.
  9. Esistenza reale dei nomi/ID carte.

### 2.4 Power Level Engine (`src/services/powerLevel/`)
- Configurazione dinamica per i livelli da 1 a 5:
  - **Livello 1 (Casual Introduttivo)**: Avg CMC 3.8-4.5, ~38-40 terre, 0 tutor, no combo.
  - **Livello 2 (Casual)**: Avg CMC 3.4-3.9, ~37-38 terre, 0-1 tutor lenti, sinergia morbida.
  - **Livello 3 (Ottimizzato)**: Avg CMC 2.9-3.4, ~36 terre, 1-2 tutor, interazioni veloci, wincon affidabili.
  - **Livello 4 (Alta Potenza)**: Avg CMC 2.3-2.8, ~34-35 terre, 3+ tutor, ramp veloce (sol ring, signet, mana vault), combo solide.
  - **Livello 5 (Massima Competitività / cEDH)**: Avg CMC 1.6-2.2, ~30-33 terre, tutor ottimali, interazioni a 0-1 mana, combo veloci. Avviso se il comandante non è cEDH tier.

### 2.5 Deck Generation Engine (`src/services/generator/`)
- `LazyDeckGenerator`: Orchestratore principale che unisce:
  - Interpretazione delle parole chiave e strategie dal prompt utente.
  - Assegnazione dei budget quantitativi per categoria (Ramp, Pescaggio, Rimozioni, Sinergie, Terre).
  - Punteggio euristico delle carte candidate.
  - Generazione adattiva della Mana Base in base ai simboli di mana colorati del mazzo.
  - Esecuzione del Validatore con correzione automatica delle discrepanze di conteggio carte.

### 2.6 Deck Exporter & Editor Services
- `DeckExporter`: Genera output in formato Clipboard, Plain Text, Moxfield/Archidekt, JSON, CSV.
- `DeckModifier`: Gestisce l'aggiunta/rimozione di carte, lo swap intelligente e la rigenerazione parziale mantenendo bloccati i fari scelti dall'utente.

## 3. Struttura delle Cartelle del Progetto

```
MAGIC CON CHEF/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── CommanderSearch.tsx
│   │   ├── PowerLevelSelector.tsx
│   │   ├── DeckRequestForm.tsx
│   │   ├── GenerationProgress.tsx
│   │   ├── DeckView.tsx
│   │   ├── DeckCardItem.tsx
│   │   ├── ManaCurveChart.tsx
│   │   ├── StrategyAnalysis.tsx
│   │   └── ExportModal.tsx
│   ├── data/
│   │   ├── demoCards.ts
│   │   └── commanderRules.ts
│   ├── types/
│   │   ├── card.ts
│   │   ├── deck.ts
│   │   └── generator.ts
│   ├── services/
│   │   ├── cardData/
│   │   │   ├── CardDataProvider.ts
│   │   │   ├── ScryfallProvider.ts
│   │   │   └── DemoCardProvider.ts
│   │   ├── validator/
│   │   │   └── CommanderValidator.ts
│   │   ├── powerLevel/
│   │   │   └── PowerLevelEngine.ts
│   │   ├── generator/
│   │   │   ├── LazyDeckGenerator.ts
│   │   │   └── strategyHeuristics.ts
│   │   ├── modifier/
│   │   │   └── DeckModifierEngine.ts
│   │   └── exporter/
│   │       └── DeckExporter.ts
│   ├── context/
│   │   └── DeckContext.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tests/
│   ├── validator.test.ts
│   ├── powerLevel.test.ts
│   └── generator.test.ts
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── PRODUCT_SPEC.md
├── ARCHITECTURE.md
├── DATA_MODEL.md
├── GENERATION_ENGINE.md
├── TESTING.md
├── ROADMAP.md
└── README.md
```

## 4. Variabili d'Ambiente (`.env.example`)
```env
VITE_APP_TITLE=Lazy Builder — MTG Commander Deck Generator
VITE_ENABLE_DEMO_MODE=true
VITE_GEMINI_API_KEY=
```
