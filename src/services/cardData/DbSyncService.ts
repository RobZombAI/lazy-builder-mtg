import { Card } from '../../types/card';

const INDEXED_DB_NAME = 'LazyBuilderDB';
const STORE_NAME = 'mtg_cards';
const METADATA_KEY = 'db_metadata';

export interface DbSyncProgress {
  status: 'idle' | 'downloading' | 'parsing' | 'saving' | 'completed' | 'error';
  progressPercent: number;
  message: string;
  totalCardsProcessed?: number;
  lastUpdatedDate?: string;
}

export class DbSyncService {
  /**
   * Opens IndexedDB
   */
  private static openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(INDEXED_DB_NAME, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get metadata info (last updated date, total card count)
   */
  static async getMetadata(): Promise<{ lastUpdatedDate?: string; totalCards?: number } | null> {
    try {
      const db = await this.openDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(METADATA_KEY);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Get custom downloaded cards from IndexedDB if present
   */
  static async getCustomLocalCards(): Promise<Card[] | null> {
    try {
      const db = await this.openDb();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get('commander_cards');

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Downloads the latest Scryfall Bulk Dataset in browser and updates local storage
   */
  static async downloadAndSyncLocalDb(onProgress: (progress: DbSyncProgress) => void): Promise<void> {
    try {
      onProgress({
        status: 'downloading',
        progressPercent: 10,
        message: 'Connessione a Scryfall API per verificare la versione più recente...'
      });

      // 1. Get bulk data URL
      const bulkRes = await fetch('https://api.scryfall.com/bulk-data/oracle-cards', {
        headers: { 'User-Agent': 'LazyBuilder/1.0' }
      });

      if (!bulkRes.ok) {
        throw new Error(`Impossibile contattare Scryfall API: HTTP ${bulkRes.status}`);
      }

      const bulkData = await bulkRes.json();
      const downloadUrl = bulkData.download_uri;

      onProgress({
        status: 'downloading',
        progressPercent: 30,
        message: `Download del Database Scryfall in corso (${(bulkData.size / (1024 * 1024)).toFixed(1)} MB)...`
      });

      // 2. Fetch raw cards bulk JSON
      const cardsRes = await fetch(downloadUrl);
      if (!cardsRes.ok) {
        throw new Error('Download del file Scryfall fallito.');
      }

      const rawCards = await cardsRes.json();

      onProgress({
        status: 'parsing',
        progressPercent: 70,
        message: `Filtraggio ed elaborazione di ${rawCards.length.toLocaleString()} carte per Commander...`
      });

      // 3. Process & Map legal Commander cards
      const commanderCards: Card[] = rawCards
        .filter((sc: any) => sc.legalities && sc.legalities.commander !== 'not_legal')
        .map((sc: any) => {
          const imageUrl = sc.image_uris?.normal || 
                           sc.image_uris?.large || 
                           sc.card_faces?.[0]?.image_uris?.normal || 
                           sc.card_faces?.[0]?.image_uris?.large || 
                           `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(sc.name)}&format=image`;

          const oracleText = sc.oracle_text || sc.card_faces?.[0]?.oracle_text || '';
          const typeLine = sc.type_line || '';
          const isLand = typeLine.toLowerCase().includes('land');
          const producesMana = sc.produced_mana || [];

          return {
            id: sc.id,
            name: sc.name,
            normalizedName: sc.name.toLowerCase().trim(),
            imageUrl,
            manaCost: sc.mana_cost || '',
            cmc: sc.cmc || 0,
            colors: sc.colors || [],
            colorIdentity: sc.color_identity || [],
            typeLine,
            oracleText,
            legalities: sc.legalities || { commander: 'legal' },
            set: sc.set || '',
            setName: sc.set_name || '',
            rarity: sc.rarity || 'common',
            priceUsd: parseFloat(sc.prices?.usd || '0'),
            keywords: sc.keywords || [],
            strategicTags: [],
            isLand,
            producesMana
          };
        });

      onProgress({
        status: 'saving',
        progressPercent: 90,
        message: `Salvataggio di ${commanderCards.length.toLocaleString()} carte in IndexedDB locale...`
      });

      // 4. Save to IndexedDB
      const db = await this.openDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const metadata = {
        lastUpdatedDate: new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        totalCards: commanderCards.length
      };

      store.put(commanderCards, 'commander_cards');
      store.put(metadata, METADATA_KEY);

      await new Promise((res) => { tx.oncomplete = res; });

      onProgress({
        status: 'completed',
        progressPercent: 100,
        message: `Database aggiornato con successo! ${commanderCards.length.toLocaleString()} carte pronte per l'uso offline.`,
        totalCardsProcessed: commanderCards.length,
        lastUpdatedDate: metadata.lastUpdatedDate
      });

    } catch (err: any) {
      onProgress({
        status: 'error',
        progressPercent: 0,
        message: err.message || 'Errore durante l\'aggiornamento del database.'
      });
    }
  }
}
