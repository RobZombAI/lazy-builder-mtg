# GENERATION_ENGINE.md — Motore di Generazione Mazzi

## 1. Panoramica
Il **LazyDeckGenerator** è il componente centrale dell'applicazione. Combina la potenza dell'interpretazione delle euristiche MTG con un algoritmo deterministico di allocazione dei budget quantitativi per garantire mazzi sempre legali, sinergici e aderenti al Power Level scelto (1-5).

## 2. Flusso di Esecuzione in 10 Fasi

1. **Analisi del Comandante & Identità di Colore**: Estrazione dei colori, dei tipi tribali e del testo Oracle.
2. **Parsing dell'Input Utente**: `StrategyHeuristic.parsePrompt` interpreta parole chiave (es. "pedine", "sacrificio", "danni diretti", "combo") ed estrae gli archetipi.
3. **Selezione del Profilo di Potenza**: Recupero dei parametri da `PowerLevelEngine` per il livello selezionato.
4. **Scoring delle Carte Candidate**: Valutazione di oltre 250 carte su 5 fattori:
   - Sinergia con il Comandante
   - Inclusione/Esclusione forzata
   - Efficienza mana (CMC) in base al Power Level
   - Sinergia con l'archetipo estratto
   - Riconoscimento del budget
5. **Allocazione Slot Quantitativi**: Assegnazione dinamica di slot per Terre, Ramp, Pescaggio, Tutor, Rimozioni e Sinergie.
6. **Costruzione della Mana Base**: Generazione di terre base e carte utility bilanciate in base alle fonti colorate necessarie.
7. **Raggiungimento Conteggio Esatto (100 Carte)**: Algoritmo di auto-aggiustamento che bilancia lande e magie per ottenere esattamente 99 carte nel mazzo + 1 Comandante.
8. **Validazione Deterministica**: Invocazione di `CommanderValidator` per verificare Singleton rule, Identità di Colore e Banlist.
9. **Generazione dell'Analisi Strategica**: Produzione di spiegazioni tattiche dettagliate per Inizio, Metà e Fine partita, wincons e debolezze.
10. **Avvisi di Competitività cEDH**: Segnalazione automatica se un comandante non-meta viene configurato al livello 5.
