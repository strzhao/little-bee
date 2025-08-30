const fs = require('fs');
const path = require('path');

/**
 * 修复 index.json 文件，使其 ID 与主数据文件保持一致
 */

const HANZI_DATA_PATH = './public/data/hanzi-data.json';
const INDEX_PATH = './public/data/configs/index.json';
const ID_MAPPING_PATH = './id-mapping-main.json';

function loadJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return null;
  }
}

function saveJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ 已保存: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error saving ${filePath}:`, error.message);
    return false;
  }
}

function fixIndexFile() {
  console.log('🔧 开始修复 index.json 文件...');
  
  // 1. 加载主数据文件
  const hanziData = loadJsonFile(HANZI_DATA_PATH);
  if (!hanziData) {
    console.error('❌ 无法加载主数据文件');
    return false;
  }
  
  // 2. 加载当前索引文件
  const indexData = loadJsonFile(INDEX_PATH);
  if (!indexData) {
    console.error('❌ 无法加载索引文件');
    return false;
  }
  
  // 3. 加载ID映射文件（如果存在）
  const idMapping = loadJsonFile(ID_MAPPING_PATH) || {};
  
  // 4. 创建汉字字符到新ID的映射
  const characterToNewId = {};
  hanziData.forEach(hanzi => {
    characterToNewId[hanzi.character] = hanzi.id;
  });
  
  console.log('📊 汉字字符到新ID映射:');
  Object.entries(characterToNewId).forEach(([char, newId]) => {
    console.log(`  ${char} -> ${newId}`);
  });
  
  // 5. 备份原索引文件
  const backupPath = INDEX_PATH + '.backup';
  fs.writeFileSync(backupPath, JSON.stringify(indexData, null, 2), 'utf8');
  console.log(`💾 已备份原索引文件到: ${backupPath}`);
  
  // 6. 更新索引文件中的ID
  let updatedCount = 0;
  const newCharacterIndex = {};
  
  Object.entries(indexData.characterIndex).forEach(([character, info]) => {
    const newId = characterToNewId[character];
    if (newId && newId !== info.id) {
      newCharacterIndex[character] = {
        ...info,
        id: newId
      };
      console.log(`🔄 更新: ${character} 的ID从 "${info.id}" 改为 "${newId}"`);
      updatedCount++;
    } else {
      newCharacterIndex[character] = info;
    }
  });
  
  // 7. 更新categoryIndex和learningStageIndex
  const newCategoryIndex = {};
  const newLearningStageIndex = {};
  
  Object.entries(indexData.categoryIndex).forEach(([category, ids]) => {
    newCategoryIndex[category] = ids.map(oldId => {
      // 查找对应的汉字字符
      const character = Object.keys(indexData.characterIndex).find(char => 
        indexData.characterIndex[char].id === oldId
      );
      return character ? characterToNewId[character] || oldId : oldId;
    });
  });
  
  Object.entries(indexData.learningStageIndex).forEach(([stage, ids]) => {
    newLearningStageIndex[stage] = ids.map(oldId => {
      // 查找对应的汉字字符
      const character = Object.keys(indexData.characterIndex).find(char => 
        indexData.characterIndex[char].id === oldId
      );
      return character ? characterToNewId[character] || oldId : oldId;
    });
  });
  
  // 8. 保存更新后的索引文件
  const updatedIndexData = {
    characterIndex: newCharacterIndex,
    categoryIndex: newCategoryIndex,
    learningStageIndex: newLearningStageIndex
  };
  
  if (saveJsonFile(INDEX_PATH, updatedIndexData)) {
    console.log(`✅ 索引文件修复完成！共更新了 ${updatedCount} 个ID`);
    return true;
  } else {
    console.error('❌ 保存索引文件失败');
    return false;
  }
}

// 运行修复
if (require.main === module) {
  const success = fixIndexFile();
  process.exit(success ? 0 : 1);
}

module.exports = { fixIndexFile };