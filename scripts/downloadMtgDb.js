import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function downloadMtgDb() {
  console.log('📦 Avvio download del Database Completo di Magic: The Gathering (Scryfall Bulk Oracle Cards)...');

  try {
    // 1. Fetch bulk data metadata from Scryfall
    const bulkMetaRes = await fetch('https://api.scryfall.com/bulk-data/oracle-cards', {
      headers: { 'User-Agent': 'LazyBuilder/1.0 (EDH Deck Generator App)' }
    });
    if (!bulkMetaRes.ok) {
      throw new Error(`Errore HTTP Scryfall bulk metadata: ${bulkMetaRes.status}`);
    }
    const bulkMeta = await bulkMetaRes.json();
    const downloadUrl = bulkMeta.download_uri;

    console.log(`🌐 Trovata la versione più recente del DB (${(bulkMeta.size / 1024 / 1024).toFixed(1)} MB). Download in corso da: ${downloadUrl}`);

    const res = await fetch(downloadUrl, {
      headers: { 'User-Agent': 'LazyBuilder/1.0 (EDH Deck Generator App)' }
    });
    if (!res.ok) {
      throw new Error(`Errore download bulk cards: ${res.status}`);
    }

    const rawCards = await res.json();
    console.log(`✨ Scaricate ${rawCards.length} carte grezze. Ottimizzazione e indicizzazione locale per Commander...`);

    // 2. Filter and optimize card objects for fast offline Commander deckbuilding
    const optimizedCards = rawCards
      .filter(sc => sc.legalities && sc.legalities.commander !== 'not_legal')
      .map(sc => {
        const imageUrl = sc.image_uris?.normal || 
                         sc.image_uris?.large || 
                         sc.card_faces?.[0]?.image_uris?.normal || 
                         sc.card_faces?.[0]?.image_uris?.large || 
                         'https://cards.scryfall.io/back.png';
        const oracleText = sc.oracle_text || sc.card_faces?.[0]?.oracle_text || '';
        const typeLine = sc.type_line || '';
        const isLand = typeLine.toLowerCase().includes('land');

        const parts = typeLine.split('—');
        const mainTypeParts = parts[0] ? parts[0].trim().split(' ') : [];
        const subtypes = parts[1] ? parts[1].trim().split(' ') : [];

        const supertypeKeywords = ['Legendary', 'Basic', 'Snow', 'World'];
        const supertypes = mainTypeParts.filter(p => supertypeKeywords.includes(p));
        const types = mainTypeParts.filter(p => !supertypeKeywords.includes(p));

        const priceUsd = sc.prices?.usd ? parseFloat(sc.prices.usd) : undefined;

        return {
          id: sc.id,
          name: sc.name,
          normalizedName: sc.name.toLowerCase(),
          imageUrl,
          manaCost: sc.mana_cost || '',
          cmc: sc.cmc || 0,
          colors: sc.colors || [],
          colorIdentity: sc.color_identity || [],
          typeLine,
          supertypes,
          types,
          subtypes,
          oracleText,
          legalities: { commander: sc.legalities.commander },
          set: sc.set || '',
          setName: sc.set_name || '',
          rarity: sc.rarity || 'common',
          priceUsd,
          keywords: sc.keywords || [],
          isLand,
          producesMana: sc.produced_mana || []
        };
      });

    console.log(`✅ Ottimizzate ${optimizedCards.length} carte Commander legali.`);

    const outputDir = path.resolve(__dirname, '../public/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'mtg-db-full.json');
    fs.writeFileSync(outputPath, JSON.stringify(optimizedCards));

    const fileSizeMb = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
    console.log(`🎉 Database locale salvato con successo in: ${outputPath} (${fileSizeMb} MB)`);
    console.log('🚀 Ora l\'app Lazy Builder può funzionare al 100% offline in locale su Mac!');

  } catch (err) {
    console.error('❌ Errore durante il download del database locale:', err);
    process.exit(1);
  }
}

downloadMtgDb();
