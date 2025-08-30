const fs = require('fs');
const path = require('path');

// 读取所有汉字数据
const hanziDataPath = path.join(__dirname, 'public/data/hanzi-data.json');
const hanziData = JSON.parse(fs.readFileSync(hanziDataPath, 'utf8'));

// 读取分类文件中的汉字数据
const categoriesDir = path.join(__dirname, 'public/data/configs/categories');
const categoryFiles = fs.readdirSync(categoriesDir).filter(file => file.endsWith('.json'));

let allHanziData = [...hanziData];

// 合并所有分类文件中的汉字数据
categoryFiles.forEach(file => {
  const categoryPath = path.join(categoriesDir, file);
  const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
  if (Array.isArray(categoryData) && categoryData.length > 0) {
    allHanziData = allHanziData.concat(categoryData);
  }
});

// 去重（基于id和character的组合）
const uniqueHanziData = [];
const seenKeys = new Set();
allHanziData.forEach(hanzi => {
  const key = `${hanzi.id}-${hanzi.character}`;
  if (!seenKeys.has(key)) {
    seenKeys.add(key);
    uniqueHanziData.push(hanzi);
  }
});

console.log(`总共找到 ${uniqueHanziData.length} 个汉字数据`);

// 图片目录路径
const imagesDir = path.join(__dirname, 'public/assets/hanzi/images');

// 分析缺少实物图片文件的汉字
const missingRealObjectImage = [];

uniqueHanziData.forEach(hanzi => {
  if (hanzi.assets && hanzi.assets.realObjectImage) {
    // 检查实际文件是否存在
    const imageName = `${hanzi.id}-real.png`;
    const imagePath = path.join(imagesDir, imageName);
    
    if (!fs.existsSync(imagePath)) {
      missingRealObjectImage.push({
        character: hanzi.character,
        pinyin: hanzi.pinyin,
        meaning: hanzi.meaning,
        id: hanzi.id,
        category: hanzi.category || '未分类',
        imageName: imageName
      });
    }
  }
});

console.log('=== 缺少实物图片的汉字列表 ===');
console.log(`总共缺少 ${missingRealObjectImage.length} 个汉字的实物图片\n`);

missingRealObjectImage.forEach((hanzi, index) => {
  console.log(`${index + 1}. ${hanzi.character} (${hanzi.pinyin})`);
  console.log(`   英文: ${hanzi.meaning}`);
  console.log(`   图片命名: ${hanzi.imageName}`);
  console.log(`   分类: ${hanzi.category}`);
  console.log('');
});

// 按分类统计
const categoryStats = {};
missingRealObjectImage.forEach(hanzi => {
  if (!categoryStats[hanzi.category]) {
    categoryStats[hanzi.category] = [];
  }
  categoryStats[hanzi.category].push(hanzi);
});

console.log('=== 按分类统计 ===');
Object.keys(categoryStats).forEach(category => {
  console.log(`${category}: ${categoryStats[category].length}个`);
  categoryStats[category].forEach(hanzi => {
    console.log(`  - ${hanzi.character} (${hanzi.pinyin}) - ${hanzi.meaning}`);
  });
  console.log('');
});