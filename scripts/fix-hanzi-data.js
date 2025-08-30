const fs = require('fs');
const path = require('path');

// 读取主数据文件
const dataPath = path.join(__dirname, '../public/data/hanzi-data.json');
const hanziData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 生成汉字到新ID的映射
function generateUniqueId(character, pinyin, existingIds) {
  let baseId = `${character}_${pinyin}`;
  let counter = 1;
  let newId = baseId;
  
  while (existingIds.has(newId)) {
    newId = `${baseId}_${counter}`;
    counter++;
  }
  
  return newId;
}

// 需要更新的旧ID列表（从grep结果中提取）
const oldIds = ['shan', 'shui', 'tian', 'yun', 'yu', 'feng', 'xue', 'ri', 'yue', 'xing', 'he', 'hai', 'hu'];

console.log('开始分析主数据文件中的ID冲突...');

// 收集所有现有的ID
const existingIds = new Set();
const idMapping = new Map();

// 第一遍：收集所有非冲突的ID
hanziData.forEach(item => {
  if (!oldIds.includes(item.id)) {
    existingIds.add(item.id);
  }
});

console.log('\n开始为冲突ID生成新的唯一ID...');
let updatedCount = 0;

// 第二遍：为冲突的ID生成新ID
hanziData.forEach((item, index) => {
  if (oldIds.includes(item.id)) {
    const newId = generateUniqueId(item.character, item.pinyin, existingIds);
    existingIds.add(newId);
    idMapping.set(item.id, newId);
    
    console.log(`第${index + 1}行: ${item.character} (${item.pinyin}): ${item.id} -> ${newId}`);
    item.id = newId;
    updatedCount++;
  }
});

if (updatedCount > 0) {
  // 备份原文件
  const backupPath = path.join(__dirname, '../public/data/hanzi-data.backup.json');
  fs.writeFileSync(backupPath, fs.readFileSync(dataPath, 'utf8'));
  console.log(`\n已备份原文件到: ${backupPath}`);
  
  // 保存更新后的文件
  fs.writeFileSync(dataPath, JSON.stringify(hanziData, null, 2), 'utf8');
  console.log(`成功更新 ${updatedCount} 个汉字的ID`);
  
  // 保存ID映射文件
  const mappingPath = path.join(__dirname, '../public/data/id-mapping-main.json');
  const mappingObj = Object.fromEntries(idMapping);
  fs.writeFileSync(mappingPath, JSON.stringify(mappingObj, null, 2), 'utf8');
  console.log(`ID映射文件已保存到: ${mappingPath}`);
  
  console.log('主数据文件更新完成！');
} else {
  console.log('\n没有需要更新的数据。');
}

// 验证更新结果
console.log('\n验证更新结果...');
const updatedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const remainingConflicts = [];
const idSet = new Set();

updatedData.forEach((item, index) => {
  if (idSet.has(item.id)) {
    remainingConflicts.push(`第${index + 1}行: ${item.character} (${item.id})`);
  } else {
    idSet.add(item.id);
  }
});

if (remainingConflicts.length > 0) {
  console.log('警告：仍存在ID冲突:');
  remainingConflicts.forEach(conflict => console.log(`  ${conflict}`));
} else {
  console.log('✅ 验证通过：所有ID都是唯一的！');
  console.log(`总共有 ${idSet.size} 个唯一ID`);
}