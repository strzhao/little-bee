const fs = require('fs');
const path = require('path');

// 移动汉字类别的脚本
async function moveHanziCategories() {
  console.log('=== 移动汉字类别 ===\n');
  
  const configsDir = path.join(__dirname, '../public/data/configs');
  const categoriesDir = path.join(configsDir, 'categories');
  
  try {
    // 1. 读取基础汉字配置文件
    console.log('1. 读取基础汉字配置文件...');
    const basicHanziPath = path.join(categoriesDir, '基础汉字.json');
    const basicHanziData = JSON.parse(fs.readFileSync(basicHanziPath, 'utf8'));
    console.log(`   原始基础汉字数量: ${basicHanziData.length}`);
    
    // 2. 读取水与地理配置文件
    console.log('\n2. 读取水与地理配置文件...');
    const waterGeoPath = path.join(categoriesDir, '水与地理.json');
    const waterGeoData = JSON.parse(fs.readFileSync(waterGeoPath, 'utf8'));
    console.log(`   原始水与地理汉字数量: ${waterGeoData.length}`);
    
    // 3. 找到要移动的汉字（山和水）
    console.log('\n3. 查找要移动的汉字...');
    const targetCharacters = ['山', '水'];
    const charactersToMove = [];
    const remainingBasicHanzi = [];
    
    for (const hanzi of basicHanziData) {
      if (targetCharacters.includes(hanzi.character)) {
        // 更新类别信息
        hanzi.category = '水与地理';
        hanzi.learningStage = '基础层';
        charactersToMove.push(hanzi);
        console.log(`   找到要移动的汉字: ${hanzi.character} (${hanzi.id})`);
      } else {
        remainingBasicHanzi.push(hanzi);
      }
    }
    
    if (charactersToMove.length === 0) {
      console.log('   未找到要移动的汉字');
      return;
    }
    
    // 4. 更新水与地理配置文件
    console.log('\n4. 更新水与地理配置文件...');
    const updatedWaterGeoData = [...waterGeoData, ...charactersToMove];
    fs.writeFileSync(waterGeoPath, JSON.stringify(updatedWaterGeoData, null, 2), 'utf8');
    console.log(`   更新后水与地理汉字数量: ${updatedWaterGeoData.length}`);
    
    // 5. 更新基础汉字配置文件
    console.log('\n5. 更新基础汉字配置文件...');
    fs.writeFileSync(basicHanziPath, JSON.stringify(remainingBasicHanzi, null, 2), 'utf8');
    console.log(`   更新后基础汉字数量: ${remainingBasicHanzi.length}`);
    
    // 6. 更新主配置文件
    console.log('\n6. 更新主配置文件...');
    const masterConfigPath = path.join(configsDir, 'master-config.json');
    const masterConfig = JSON.parse(fs.readFileSync(masterConfigPath, 'utf8'));
    
    // 更新类别计数
    for (const category of masterConfig.categories) {
      if (category.name === '基础汉字') {
        category.count = remainingBasicHanzi.length;
      } else if (category.name === '水与地理') {
        category.count = updatedWaterGeoData.length;
      }
    }
    
    // 更新时间戳
    masterConfig.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(masterConfigPath, JSON.stringify(masterConfig, null, 2), 'utf8');
    console.log('   主配置文件已更新');
    
    // 7. 更新索引文件
    console.log('\n7. 更新索引文件...');
    const indexPath = path.join(configsDir, 'index.json');
    const indexConfig = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    // 更新汉字索引中的类别信息
    for (const hanzi of charactersToMove) {
      if (indexConfig.characterIndex[hanzi.id]) {
        indexConfig.characterIndex[hanzi.id].category = '水与地理';
      }
    }
    
    // 更新类别索引
    if (indexConfig.categoryIndex['基础汉字']) {
      indexConfig.categoryIndex['基础汉字'] = remainingBasicHanzi.map(h => h.id);
    }
    if (indexConfig.categoryIndex['水与地理']) {
      indexConfig.categoryIndex['水与地理'] = updatedWaterGeoData.map(h => h.id);
    }
    
    fs.writeFileSync(indexPath, JSON.stringify(indexConfig, null, 2), 'utf8');
    console.log('   索引文件已更新');
    
    // 8. 显示移动结果
    console.log('\n=== 移动完成 ===');
    console.log(`移动的汉字: ${charactersToMove.map(h => h.character).join('、')}`);
    console.log(`基础汉字: ${remainingBasicHanzi.length} 个`);
    console.log(`水与地理: ${updatedWaterGeoData.length} 个`);
    console.log('所有配置文件已更新！');
    
  } catch (error) {
    console.error('\n❌ 移动失败:', error.message);
    process.exit(1);
  }
}

// 运行移动脚本
moveHanziCategories();