const fs = require('fs');
const path = require('path');

// 读取原始数据
const dataPath = path.join(__dirname, '../public/data/hanzi-data.json');
const hanziData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 创建输出目录
const configsDir = path.join(__dirname, '../public/data/configs');
const categoriesDir = path.join(configsDir, 'categories');
const learningStagesDir = path.join(configsDir, 'learning-stages');

// 按类别分组
const byCategory = {};
const byLearningStage = {};

hanziData.forEach(hanzi => {
  // 按类别分组
  if (hanzi.category) {
    if (!byCategory[hanzi.category]) {
      byCategory[hanzi.category] = [];
    }
    byCategory[hanzi.category].push(hanzi);
  }
  
  // 按学习阶段分组
  if (hanzi.learningStage) {
    if (!byLearningStage[hanzi.learningStage]) {
      byLearningStage[hanzi.learningStage] = [];
    }
    byLearningStage[hanzi.learningStage].push(hanzi);
  }
  
  // 处理没有 category 和 learningStage 的旧数据
  if (!hanzi.category && !hanzi.learningStage) {
    // 将旧数据归类到默认分类
    const defaultCategory = '基础汉字';
    const defaultLearningStage = '基础层';
    
    if (!byCategory[defaultCategory]) {
      byCategory[defaultCategory] = [];
    }
    if (!byLearningStage[defaultLearningStage]) {
      byLearningStage[defaultLearningStage] = [];
    }
    
    // 添加缺失的字段
    hanzi.category = defaultCategory;
    hanzi.learningStage = defaultLearningStage;
    
    byCategory[defaultCategory].push(hanzi);
    byLearningStage[defaultLearningStage].push(hanzi);
  }
});

// 保存按类别分组的文件
Object.keys(byCategory).forEach(category => {
  const filename = category.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-') + '.json';
  const filepath = path.join(categoriesDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(byCategory[category], null, 2), 'utf8');
  console.log(`Created category file: ${filename} (${byCategory[category].length} characters)`);
});

// 保存按学习阶段分组的文件
Object.keys(byLearningStage).forEach(stage => {
  const filename = stage.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-') + '.json';
  const filepath = path.join(learningStagesDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(byLearningStage[stage], null, 2), 'utf8');
  console.log(`Created learning stage file: ${filename} (${byLearningStage[stage].length} characters)`);
});

// 创建主配置文件
const masterConfig = {
  version: '1.0.0',
  description: '汉字学习数据主配置文件',
  lastUpdated: new Date().toISOString(),
  categories: Object.keys(byCategory).map(category => ({
    name: category,
    file: `categories/${category.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')}.json`,
    count: byCategory[category].length
  })),
  learningStages: Object.keys(byLearningStage).map(stage => ({
    name: stage,
    file: `learning-stages/${stage.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')}.json`,
    count: byLearningStage[stage].length
  })),
  totalCharacters: hanziData.length
};

const masterConfigPath = path.join(configsDir, 'master-config.json');
fs.writeFileSync(masterConfigPath, JSON.stringify(masterConfig, null, 2), 'utf8');
console.log('Created master config file');

// 创建索引文件（用于快速查找）
const indexConfig = {
  characterIndex: {},
  categoryIndex: {},
  learningStageIndex: {}
};

hanziData.forEach(hanzi => {
  indexConfig.characterIndex[hanzi.character] = {
    id: hanzi.id,
    category: hanzi.category,
    learningStage: hanzi.learningStage
  };
  
  if (!indexConfig.categoryIndex[hanzi.category]) {
    indexConfig.categoryIndex[hanzi.category] = [];
  }
  indexConfig.categoryIndex[hanzi.category].push(hanzi.id);
  
  if (!indexConfig.learningStageIndex[hanzi.learningStage]) {
    indexConfig.learningStageIndex[hanzi.learningStage] = [];
  }
  indexConfig.learningStageIndex[hanzi.learningStage].push(hanzi.id);
});

const indexConfigPath = path.join(configsDir, 'index.json');
fs.writeFileSync(indexConfigPath, JSON.stringify(indexConfig, null, 2), 'utf8');
console.log('Created index file');

console.log('\n=== 拆分完成 ===');
console.log(`总汉字数: ${hanziData.length}`);
console.log(`类别数: ${Object.keys(byCategory).length}`);
console.log(`学习阶段数: ${Object.keys(byLearningStage).length}`);
console.log('\n类别分布:');
Object.keys(byCategory).forEach(category => {
  console.log(`  ${category}: ${byCategory[category].length} 个汉字`);
});
console.log('\n学习阶段分布:');
Object.keys(byLearningStage).forEach(stage => {
  console.log(`  ${stage}: ${byLearningStage[stage].length} 个汉字`);
});