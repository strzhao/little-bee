const fs = require('fs');
const path = require('path');

// 配置路径
const configsDir = path.join(__dirname, '../public/data/configs');
const indexPath = path.join(configsDir, 'index.json');
const categoriesDir = path.join(configsDir, 'categories');

/**
 * 修复index.json文件，确保ID映射与实际文件数据一致
 */
async function fixIndexJson() {
  console.log('🔧 开始修复 index.json 数据不一致问题...');
  
  try {
    // 读取当前index.json
    const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    console.log('📖 已读取当前 index.json');
    
    // 初始化新的索引数据
    const newCharacterIndex = {};
    const newCategoryIndex = {};
    const newLearningStageIndex = {};
    
    // 读取所有分类文件
    const categoryFiles = fs.readdirSync(categoriesDir)
      .filter(file => file.endsWith('.json') && file !== 'index.json');
    
    console.log(`📂 发现 ${categoryFiles.length} 个分类文件`);
    
    for (const categoryFile of categoryFiles) {
      const categoryName = path.basename(categoryFile, '.json');
      const categoryPath = path.join(categoriesDir, categoryFile);
      
      try {
        const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
        
        // 跳过空文件
        if (!Array.isArray(categoryData) || categoryData.length === 0) {
          console.log(`⚠️  跳过空分类文件: ${categoryName}`);
          continue;
        }
        
        console.log(`📝 处理分类: ${categoryName} (${categoryData.length} 个汉字)`);
        
        // 初始化分类索引
        if (!newCategoryIndex[categoryName]) {
          newCategoryIndex[categoryName] = [];
        }
        
        // 处理每个汉字
        for (const hanzi of categoryData) {
          if (!hanzi.id || !hanzi.character) {
            console.log(`⚠️  跳过无效汉字数据:`, hanzi);
            continue;
          }
          
          // 更新字符索引
          newCharacterIndex[hanzi.character] = {
            id: hanzi.id,
            category: hanzi.category || categoryName,
            learningStage: hanzi.learningStage || '基础层'
          };
          
          // 更新分类索引
          newCategoryIndex[categoryName].push(hanzi.id);
          
          // 更新学习阶段索引
          const learningStage = hanzi.learningStage || '基础层';
          if (!newLearningStageIndex[learningStage]) {
            newLearningStageIndex[learningStage] = [];
          }
          newLearningStageIndex[learningStage].push(hanzi.id);
        }
        
      } catch (error) {
        console.error(`❌ 处理分类文件 ${categoryName} 时出错:`, error.message);
      }
    }
    
    // 构建新的index.json数据
    const newIndexData = {
      characterIndex: newCharacterIndex,
      categoryIndex: newCategoryIndex,
      learningStageIndex: newLearningStageIndex
    };
    
    // 统计信息
    const totalCharacters = Object.keys(newCharacterIndex).length;
    const totalCategories = Object.keys(newCategoryIndex).length;
    const totalStages = Object.keys(newLearningStageIndex).length;
    
    console.log('\n📊 统计信息:');
    console.log(`   汉字总数: ${totalCharacters}`);
    console.log(`   分类总数: ${totalCategories}`);
    console.log(`   学习阶段: ${totalStages}`);
    
    // 显示分类详情
    console.log('\n📋 分类详情:');
    for (const [category, ids] of Object.entries(newCategoryIndex)) {
      console.log(`   ${category}: ${ids.length} 个汉字`);
    }
    
    // 显示学习阶段详情
    console.log('\n🎯 学习阶段详情:');
    for (const [stage, ids] of Object.entries(newLearningStageIndex)) {
      console.log(`   ${stage}: ${ids.length} 个汉字`);
    }
    
    // 备份原文件
    const backupPath = indexPath + '.backup.' + Date.now();
    fs.copyFileSync(indexPath, backupPath);
    console.log(`\n💾 已备份原文件到: ${path.basename(backupPath)}`);
    
    // 写入新的index.json
    fs.writeFileSync(indexPath, JSON.stringify(newIndexData, null, 2), 'utf8');
    console.log('✅ 已更新 index.json');
    
    // 验证数据完整性
    console.log('\n🔍 验证数据完整性...');
    const issues = [];
    
    // 检查重复ID
    const allIds = [];
    for (const ids of Object.values(newCategoryIndex)) {
      allIds.push(...ids);
    }
    const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      issues.push(`发现重复ID: ${duplicateIds.join(', ')}`);
    }
    
    // 检查ID格式一致性
    for (const [character, info] of Object.entries(newCharacterIndex)) {
      if (!info.id.includes(character)) {
        issues.push(`字符 "${character}" 的ID "${info.id}" 格式可能不正确`);
      }
    }
    
    if (issues.length > 0) {
      console.log('⚠️  发现以下问题:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('✅ 数据验证通过，无发现问题');
    }
    
    console.log('\n🎉 index.json 修复完成!');
    
  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    process.exit(1);
  }
}

// 运行修复脚本
if (require.main === module) {
  fixIndexJson();
}

module.exports = { fixIndexJson };