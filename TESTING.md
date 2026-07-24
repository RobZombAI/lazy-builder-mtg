# TESTING.md — Suite di Test e Casi Demo

## 1. Panoramica
La suite di test per Lazy Builder garantisce il corretto funzionamento di tre componenti critici:
1. **Validatore Commander Deterministico** (`CommanderValidator`)
2. **Motore di Valutazione dei Livelli di Potenza** (`PowerLevelEngine`)
3. **Motore di Generazione Mazzi** (`LazyDeckGenerator`)

Tutti i test sono scritti per **Vitest** e possono essere eseguiti sia offline (usando il `DemoCardProvider`) sia in CI/CD.

## 2. Esecuzione dei Test
```bash
npm run test
```

## 3. Casi di Test Obbligatori (Requirement Test Cases)

### Caso 1: Krenko, Mob Boss (Livello 5 - Goblin Swarm & Burn)
- **Comandante**: Krenko, Mob Boss ({2}{R}{R})
- **Power Level**: 5 / 5
- **Prompt**: *"Voglio creare il maggior numero possibile di pedine Goblin e sfruttarle tramite sacrifici, danni diretti, produzione di mana e altre sinergie. Il mazzo deve essere veloce, esplosivo e molto ottimizzato."*
- **Verifica**: Generazione di esattamente 100 carte (1 Comandante + 99 carte nel mazzo), presenza di Skirk Prospector, Goblin Chieftain, Purphoros, Impact Tremors, zero violazioni Singleton e identità di colore 100% Rossa.

### Caso 2: Comandante Multicolore Control (Atraxa, Praetors' Voice)
- **Comandante**: Atraxa, Praetors' Voice ({G}{W}{U}{B})
- **Power Level**: 4 / 5
- **Prompt**: *"Mazzo control basato su proliferare, walker e counter."*
- **Verifica**: Validazione identità di colore a 4 colori (WUBG), bilanciamento terra multicolore, zero carte rosse.

### Caso 3: Comandante Casual Tematico (Lathril, Blade of the Elves)
- **Comandante**: Lathril, Blade of the Elves ({2}{B}{G})
- **Power Level**: 2 / 5
- **Prompt**: *"Mazzo elfball casalingo per serate tra amici senza combo noiose."*
- **Verifica**: Curva di mana più rilassata, assenza di combo infinite, 37+ terre.

### Caso 4: Vincoli di Budget e Inclusione/Esclusione
- **Filtri**: Budget max $50, include `Skullclamp`, esclude `Mana Crypt`.
- **Verifica**: Presenza obbligatoria di Skullclamp, assenza di Mana Crypt, filtro prezzi rispettato.

### Caso 5: Avviso cEDH su Comandanti Non-Meta al Livello 5
- **Comandante**: Krenko, Mob Boss (o comandante Casual) al Livello 5.
- **Verifica**: Inserimento automatico dell'avviso: *"Questo comandante viene costruito ad alta potenza (Livello 5), ma potrebbe non competere ai vertici dei tavoli cEDH più estremi..."*.
