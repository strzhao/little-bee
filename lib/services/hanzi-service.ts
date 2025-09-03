import { hanziDataLoader, HanziCharacter } from '@/lib/hanzi-data-loader';

// The curated list of characters for the toddler game - includes all available characters
const TODDLER_HANZI_LIST = [
  // 天空与气象类 (10个)
  '山', '水', '天', '云', '雨', '风', '雪', '日', '月', '星',
  // 动物王国类 (4个) 
  '鸟', '鱼', '马', '牛',
  // 植物世界类 (3个)
  '树', '花', '草',
  // 水与地理类 (3个)
  '河', '海', '湖'
];

export interface ToddlerGameData {
  characters: HanziCharacter[];
  explanations: Record<string, any>;
}

/**
 * Fetches and prepares the sequence of Hanzi characters and their explanations for the toddler game.
 * 
 * @returns A promise that resolves to an object containing characters and explanations.
 */
export async function getToddlerGameSequence(): Promise<ToddlerGameData> {
  try {
    // Fetch explanations and character data concurrently
    const [explanationsResponse] = await Promise.all([
      fetch('/data/configs/personalized-explanations.json'),
      hanziDataLoader.initialize() // Ensure the data loader is initialized
    ]);

    if (!explanationsResponse.ok) {
      throw new Error('Failed to fetch explanations');
    }
    const explanations = await explanationsResponse.json();

    // To be more efficient, we can try loading only the relevant categories.
    // For now, we load all data for simplicity, as the loader is cached.
    const categories = hanziDataLoader.getAvailableCategories();
    const allHanziPromises = categories.map(category => hanziDataLoader.loadByCategory(category));
    const allHanziArrays = await Promise.all(allHanziPromises);
    const allHanzi = allHanziArrays.flat();

    // Filter the full list to get our curated set of characters.
    const toddlerHanzi = allHanzi.filter(hanzi => 
      TODDLER_HANZI_LIST.includes(hanzi.character) && hanzi.assets.realObjectImage
    );
    
    // Sort the filtered list according to our curated order.
    const characters = TODDLER_HANZI_LIST
      .map(character => toddlerHanzi.find(h => h.character === character))
      .filter((hanzi): hanzi is HanziCharacter => hanzi !== undefined);

    return { characters, explanations };

  } catch (error) {
    console.error("Failed to get toddler game sequence:", error);
    return { characters: [], explanations: {} }; // Return empty data on error
  }
}
