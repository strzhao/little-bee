const fs = require('fs');
const path = require('path');

// 测试配置文件结构
async function testConfigStructure() {
  console.log('=== 测试汉字配置文件结构 ===\n');
  
  const configsDir = path.join(__dirname, '../public/data/configs');
  
  try {
    // 1. 测试主配置文件
    console.log('1. 测试主配置文件...');
    const masterConfigPath = path.join(configsDir, 'master-config.json');
    if (!fs.existsSync(masterConfigPath)) {
      throw new Error('主配置文件不存在');
    }
    
    const masterConfig = JSON.parse(fs.readFileSync(masterConfigPath, 'utf8'));
    console.log(`   ✓ 主配置文件加载成功`);
    console.log(`   ✓ 版本: ${masterConfig.version}`);
    console.log(`   ✓ 总汉字数: ${masterConfig.totalCharacters}`);
    console.log(`   ✓ 类别数: ${masterConfig.categories.length}`);
    console.log(`   ✓ 学习阶段数: ${masterConfig.learningStages.length}`);
    
    // 2. 测试索引文件
    console.log('\n2. 测试索引文件...');
    const indexPath = path.join(configsDir, 'index.json');
    if (!fs.existsSync(indexPath)) {
      throw new Error('索引文件不存在');
    }
    
    const indexConfig = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    console.log(`   ✓ 索引文件加载成功`);
    console.log(`   ✓ 汉字索引数: ${Object.keys(indexConfig.characterIndex).length}`);
    console.log(`   ✓ 类别索引数: ${Object.keys(indexConfig.categoryIndex).length}`);
    console.log(`   ✓ 学习阶段索引数: ${Object.keys(indexConfig.learningStageIndex).length}`);
    
    // 3. 测试类别配置文件
    console.log('\n3. 测试类别配置文件...');
    for (const category of masterConfig.categories) {
      const categoryPath = path.join(configsDir, category.file);
      if (!fs.existsSync(categoryPath)) {
        throw new Error(`类别文件不存在: ${category.file}`);
      }
      
      const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
      console.log(`   ✓ ${category.name}: ${categoryData.length} 个汉字`);
      
      // 验证数据结构
      if (categoryData.length > 0) {
        const firstChar = categoryData[0];
        const requiredFields = ['id', 'character', 'pinyin', 'theme', 'meaning', 'assets', 'evolutionStages'];
        for (const field of requiredFields) {
          if (!firstChar.hasOwnProperty(field)) {
            throw new Error(`类别 ${category.name} 中的汉字缺少必需字段: ${field}`);
          }
        }
        console.log(`   ✓ ${category.name}: 数据结构验证通过`);
      }
    }
    
    // 4. 测试学习阶段配置文件
    console.log('\n4. 测试学习阶段配置文件...');
    for (const stage of masterConfig.learningStages) {
      const stagePath = path.join(configsDir, stage.file);
      if (!fs.existsSync(stagePath)) {
        throw new Error(`学习阶段文件不存在: ${stage.file}`);
      }
      
      const stageData = JSON.parse(fs.readFileSync(stagePath, 'utf8'));
      console.log(`   ✓ ${stage.name}: ${stageData.length} 个汉字`);
    }
    
    // 5. 数据一致性检查
    console.log('\n5. 数据一致性检查...');
    let totalFromCategories = 0;
    let totalFromStages = 0;
    
    for (const category of masterConfig.categories) {
      totalFromCategories += category.count;
    }
    
    for (const stage of masterConfig.learningStages) {
      totalFromStages += stage.count;
    }
    
    if (totalFromCategories !== masterConfig.totalCharacters) {
      console.warn(`   ⚠ 类别汉字总数 (${totalFromCategories}) 与主配置总数 (${masterConfig.totalCharacters}) 不一致`);
    } else {
      console.log(`   ✓ 类别汉字总数一致: ${totalFromCategories}`);
    }
    
    if (totalFromStages !== masterConfig.totalCharacters) {
      console.warn(`   ⚠ 学习阶段汉字总数 (${totalFromStages}) 与主配置总数 (${masterConfig.totalCharacters}) 不一致`);
    } else {
      console.log(`   ✓ 学习阶段汉字总数一致: ${totalFromStages}`);
    }
    
    // 6. 文件大小对比
    console.log('\n6. 文件大小对比...');
    const originalPath = path.join(__dirname, '../public/data/hanzi-data.json');
    if (fs.existsSync(originalPath)) {
      const originalSize = fs.statSync(originalPath).size;
      
      let totalNewSize = 0;
      totalNewSize += fs.statSync(masterConfigPath).size;
      totalNewSize += fs.statSync(indexPath).size;
      
      for (const category of masterConfig.categories) {
        totalNewSize += fs.statSync(path.join(configsDir, category.file)).size;
      }
      
      for (const stage of masterConfig.learningStages) {
        totalNewSize += fs.statSync(path.join(configsDir, stage.file)).size;
      }
      
      console.log(`   原始文件大小: ${(originalSize / 1024).toFixed(2)} KB`);
      console.log(`   新配置文件总大小: ${(totalNewSize / 1024).toFixed(2)} KB`);
      console.log(`   大小变化: ${totalNewSize > originalSize ? '+' : ''}${((totalNewSize - originalSize) / 1024).toFixed(2)} KB`);
    }
    
    console.log('\n=== 所有测试通过！配置文件结构正常 ===');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
  }
}

// 运行测试
testConfigStructure();