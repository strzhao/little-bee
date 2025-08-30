const fs = require('fs');
const path = require('path');

// 读取所有汉字数据并检查ID冲突
function analyzeIdConflicts() {
  const allHanzi = [];
  const idMap = new Map();
  const conflicts = new Map();
  
  // 读取主数据文件
  const dataPath = path.join(__dirname, '../public/data/hanzi-data.json');
  if (fs.existsSync(dataPath)) {
    const hanziData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    allHanzi.push(...hanziData.map(h => ({ ...h, source: 'hanzi-data.json' })));
  }
  
  // 读取分类配置文件
  const categoriesDir = path.join(__dirname, '../public/data/configs/categories');
  if (fs.existsSync(categoriesDir)) {
    const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.json'));
    categoryFiles.forEach(file => {
      const filePath = path.join(categoriesDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      allHanzi.push(...data.map(h => ({ ...h, source: `categories/${file}` })));
    });
  }
  
  // 读取学习阶段配置文件
  const learningStagesDir = path.join(__dirname, '../public/data/configs/learning-stages');
  if (fs.existsSync(learningStagesDir)) {
    const stageFiles = fs.readdirSync(learningStagesDir).filter(f => f.endsWith('.json'));
    stageFiles.forEach(file => {
      const filePath = path.join(learningStagesDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      allHanzi.push(...data.map(h => ({ ...h, source: `learning-stages/${file}` })));
    });
  }
  
  // 统计ID使用情况
  allHanzi.forEach((hanzi, index) => {
    const { id, character, pinyin, source } = hanzi;
    
    if (idMap.has(id)) {
      // 发现冲突
      if (!conflicts.has(id)) {
        conflicts.set(id, [idMap.get(id)]);
      }
      conflicts.get(id).push({ character, pinyin, source, index });
    } else {
      idMap.set(id, { character, pinyin, source, index });
    }
  });
  
  console.log('=== ID冲突分析 ===');
  console.log(`总汉字条目数: ${allHanzi.length}`);
  console.log(`唯一ID数: ${idMap.size}`);
  console.log(`冲突ID数: ${conflicts.size}`);
  
  console.log('\n=== 冲突详情 ===');
  for (const [id, items] of conflicts) {
    console.log(`ID "${id}" 冲突:`);
    items.forEach(item => {
      console.log(`  - ${item.character} (${item.pinyin}) [来源: ${item.source}]`);
    });
    console.log('');
  }
  
  return { allHanzi, conflicts, idMap };
}

// 生成新的唯一ID
function generateUniqueId(character, pinyin, existingIds) {
  // 方案1: 汉字 + 拼音首字母
  let baseId = character + '_' + pinyin.replace(/[0-9]/g, ''); // 移除声调数字
  
  // 如果仍有冲突，添加序号
  let counter = 1;
  let newId = baseId;
  while (existingIds.has(newId)) {
    newId = `${baseId}_${counter}`;
    counter++;
  }
  
  return newId;
}

// 修复ID冲突
function fixIdConflicts() {
  const { allHanzi, conflicts } = analyzeIdConflicts();
  
  if (conflicts.size === 0) {
    console.log('没有发现ID冲突！');
    return { idMapping: new Map() };
  }
  
  console.log('\n=== 开始修复ID冲突 ===');
  
  const newIds = new Set();
  const idMapping = new Map(); // 旧ID -> 新ID的映射
  
  // 首先为冲突的汉字生成新的唯一ID
  const conflictIds = new Set(conflicts.keys());
  
  allHanzi.forEach((hanzi, index) => {
    if (conflictIds.has(hanzi.id)) {
      const newId = generateUniqueId(hanzi.character, hanzi.pinyin, newIds);
      newIds.add(newId);
      
      if (hanzi.id !== newId) {
        idMapping.set(hanzi.id, newId);
        console.log(`${hanzi.character} (${hanzi.pinyin}): ${hanzi.id} -> ${newId} [来源: ${hanzi.source}]`);
      }
      
      hanzi.id = newId;
    } else {
      newIds.add(hanzi.id);
    }
  });
  
  console.log(`\n共需要修复 ${idMapping.size} 个ID冲突`);
  
  // 生成ID映射文件，用于更新其他引用
  const mappingPath = path.join(__dirname, '../public/data/id-mapping.json');
  const mappingObj = Object.fromEntries(idMapping);
  fs.writeFileSync(mappingPath, JSON.stringify(mappingObj, null, 2), 'utf8');
  
  console.log(`ID映射文件已保存到: ${mappingPath}`);
  
  return { allHanzi, idMapping };
}

// 更新配置文件中的ID引用
function updateConfigFiles(idMapping) {
  // 更新主数据文件
  const dataPath = path.join(__dirname, '../public/data/hanzi-data.json');
  if (fs.existsSync(dataPath)) {
    const hanziData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    let updated = false;
    
    hanziData.forEach(item => {
      if (idMapping.has(item.id)) {
        item.id = idMapping.get(item.id);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(dataPath, JSON.stringify(hanziData, null, 2), 'utf8');
      console.log('已更新主数据文件: hanzi-data.json');
    }
  }
  
  const configsDir = path.join(__dirname, '../public/data/configs');
  
  // 更新分类文件
  const categoriesDir = path.join(configsDir, 'categories');
  const categoryFiles = fs.readdirSync(categoriesDir).filter(f => f.endsWith('.json'));
  
  categoryFiles.forEach(file => {
    const filePath = path.join(categoriesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let updated = false;
    data.forEach(hanzi => {
      if (idMapping.has(hanzi.id)) {
        hanzi.id = idMapping.get(hanzi.id);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`已更新分类文件: ${file}`);
    }
  });
  
  // 更新学习阶段文件
  const learningStagesDir = path.join(configsDir, 'learning-stages');
  const stageFiles = fs.readdirSync(learningStagesDir).filter(f => f.endsWith('.json'));
  
  stageFiles.forEach(file => {
    const filePath = path.join(learningStagesDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let updated = false;
    data.forEach(hanzi => {
      if (idMapping.has(hanzi.id)) {
        hanzi.id = idMapping.get(hanzi.id);
        updated = true;
      }
    });
    
    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`已更新学习阶段文件: ${file}`);
    }
  });
  
  // 更新索引文件
  const indexPath = path.join(configsDir, 'index.json');
  const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  
  let indexUpdated = false;
  
  // 更新characterIndex
  const newCharacterIndex = {};
  for (const [oldId, info] of Object.entries(indexData.characterIndex)) {
    const newId = idMapping.get(oldId) || oldId;
    if (newId !== oldId) {
      indexUpdated = true;
    }
    newCharacterIndex[newId] = { ...info, id: newId };
  }
  indexData.characterIndex = newCharacterIndex;
  
  // 更新categoryIndex
  for (const [category, ids] of Object.entries(indexData.categoryIndex)) {
    const newIds = ids.map(id => idMapping.get(id) || id);
    if (JSON.stringify(newIds) !== JSON.stringify(ids)) {
      indexData.categoryIndex[category] = newIds;
      indexUpdated = true;
    }
  }
  
  // 更新learningStageIndex
  for (const [stage, ids] of Object.entries(indexData.learningStageIndex)) {
    const newIds = ids.map(id => idMapping.get(id) || id);
    if (JSON.stringify(newIds) !== JSON.stringify(ids)) {
      indexData.learningStageIndex[stage] = newIds;
      indexUpdated = true;
    }
  }
  
  if (indexUpdated) {
    fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf8');
    console.log('已更新索引文件: index.json');
  }
}

// 主函数
function main() {
  console.log('开始分析和修复汉字ID冲突问题...');
  
  // 先分析冲突
  analyzeIdConflicts();
  
  // 询问是否继续修复
  console.log('\n是否继续修复？(输入 yes 继续)');
  
  // 直接修复（在脚本环境中）
  const result = fixIdConflicts();
  
  if (result && result.idMapping && result.idMapping.size > 0) {
    console.log('\n开始更新配置文件...');
    updateConfigFiles(result.idMapping);
    console.log('\n所有文件更新完成！');
  } else {
    console.log('\n无需更新配置文件。');
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeIdConflicts, fixIdConflicts, updateConfigFiles };