const fs = require('fs');
const path = require('path');

// 配置路径
const configsDir = path.join(__dirname, '../public/data/configs');
const indexPath = path.join(configsDir, 'index.json');
const categoriesDir = path.join(configsDir, 'categories');
const assetsDir = path.join(__dirname, '../public/assets/hanzi');

/**
 * 汉字数据验证脚本
 * 检查数据完整性、一致性和资源文件存在性
 */
class HanziDataValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalCharacters: 0,
      totalCategories: 0,
      missingAssets: 0,
      duplicateIds: 0
    };
  }

  /**
   * 添加错误信息
   */
  addError(message, context = '') {
    this.errors.push({ message, context, type: 'error' });
  }

  /**
   * 添加警告信息
   */
  addWarning(message, context = '') {
    this.warnings.push({ message, context, type: 'warning' });
  }

  /**
   * 验证文件是否存在
   */
  validateFileExists(filePath, description) {
    if (!fs.existsSync(filePath)) {
      this.addError(`文件不存在: ${description}`, filePath);
      return false;
    }
    return true;
  }

  /**
   * 验证汉字数据结构
   */
  validateHanziStructure(hanzi, categoryName) {
    const requiredFields = ['id', 'character', 'pinyin', 'theme', 'meaning', 'emoji', 'assets'];
    const context = `${categoryName}/${hanzi.character || 'unknown'}`;

    for (const field of requiredFields) {
      if (!hanzi[field]) {
        this.addError(`缺少必需字段: ${field}`, context);
      }
    }

    // 验证assets结构
    if (hanzi.assets) {
      const requiredAssets = ['pronunciationAudio', 'mainIllustration', 'lottieAnimation', 'realObjectImage'];
      for (const asset of requiredAssets) {
        if (!hanzi.assets[asset]) {
          this.addError(`缺少资源字段: assets.${asset}`, context);
        }
      }
    }

    // 验证ID格式
    if (hanzi.id && hanzi.character) {
      if (!hanzi.id.includes(hanzi.character)) {
        this.addWarning(`ID格式可能不正确: ${hanzi.id}`, context);
      }
    }

    // 验证evolutionStages
    if (hanzi.evolutionStages && Array.isArray(hanzi.evolutionStages)) {
      hanzi.evolutionStages.forEach((stage, index) => {
        const stageContext = `${context}/evolutionStages[${index}]`;
        const requiredStageFields = ['scriptName', 'timestamp', 'narrationAudio', 'explanation', 'scriptText', 'fontFamily', 'cardColor'];
        
        for (const field of requiredStageFields) {
          if (!stage[field]) {
            this.addError(`演化阶段缺少字段: ${field}`, stageContext);
          }
        }
      });
    }
  }

  /**
   * 验证资源文件存在性
   */
  validateAssets(hanzi, categoryName) {
    if (!hanzi.assets) return;

    const context = `${categoryName}/${hanzi.character}`;
    const assetChecks = [
      { key: 'pronunciationAudio', type: 'audio' },
      { key: 'mainIllustration', type: 'image' },
      { key: 'lottieAnimation', type: 'animation' },
      { key: 'realObjectImage', type: 'image' }
    ];

    for (const { key, type } of assetChecks) {
      const assetPath = hanzi.assets[key];
      if (assetPath) {
        // 构建完整路径
        const fullPath = path.join(__dirname, '../public', assetPath);
        if (!fs.existsSync(fullPath)) {
          this.addError(`${type}资源文件不存在: ${assetPath}`, context);
          this.stats.missingAssets++;
        }
      }
    }

    // 验证演化阶段的音频文件
    if (hanzi.evolutionStages) {
      hanzi.evolutionStages.forEach((stage, index) => {
        if (stage.narrationAudio) {
          const audioPath = path.join(__dirname, '../public', stage.narrationAudio);
          if (!fs.existsSync(audioPath)) {
            this.addError(`演化阶段音频文件不存在: ${stage.narrationAudio}`, `${context}/evolutionStages[${index}]`);
            this.stats.missingAssets++;
          }
        }
      });
    }
  }

  /**
   * 验证index.json与分类文件的一致性
   */
  validateIndexConsistency() {
    if (!this.validateFileExists(indexPath, 'index.json')) {
      return;
    }

    try {
      const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const { characterIndex, categoryIndex, learningStageIndex } = indexData;

      // 收集所有分类文件中的汉字
      const actualCharacters = new Map();
      const actualCategories = new Map();
      const allIds = new Set();

      const categoryFiles = fs.readdirSync(categoriesDir)
        .filter(file => file.endsWith('.json') && file !== 'index.json');

      for (const categoryFile of categoryFiles) {
        const categoryName = path.basename(categoryFile, '.json');
        const categoryPath = path.join(categoriesDir, categoryFile);
        
        try {
          const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
          
          if (Array.isArray(categoryData)) {
            actualCategories.set(categoryName, categoryData.map(h => h.id));
            
            for (const hanzi of categoryData) {
              if (hanzi.character && hanzi.id) {
                actualCharacters.set(hanzi.character, {
                  id: hanzi.id,
                  category: hanzi.category || categoryName,
                  learningStage: hanzi.learningStage || '基础层'
                });
                
                // 检查重复ID
                if (allIds.has(hanzi.id)) {
                  this.addError(`发现重复ID: ${hanzi.id}`, categoryName);
                  this.stats.duplicateIds++;
                } else {
                  allIds.add(hanzi.id);
                }
              }
            }
          }
        } catch (error) {
          this.addError(`无法解析分类文件: ${error.message}`, categoryName);
        }
      }

      // 验证characterIndex一致性
      for (const [character, actualInfo] of actualCharacters) {
        const indexInfo = characterIndex[character];
        if (!indexInfo) {
          this.addError(`index.json中缺少字符: ${character}`, 'characterIndex');
        } else {
          if (indexInfo.id !== actualInfo.id) {
            this.addError(`ID不匹配: ${character} (index: ${indexInfo.id}, actual: ${actualInfo.id})`, 'characterIndex');
          }
          if (indexInfo.category !== actualInfo.category) {
            this.addWarning(`分类不匹配: ${character} (index: ${indexInfo.category}, actual: ${actualInfo.category})`, 'characterIndex');
          }
        }
      }

      // 验证categoryIndex一致性
      for (const [categoryName, actualIds] of actualCategories) {
        const indexIds = categoryIndex[categoryName] || [];
        
        // 检查缺失的ID
        for (const id of actualIds) {
          if (!indexIds.includes(id)) {
            this.addError(`分类索引中缺少ID: ${id}`, `categoryIndex/${categoryName}`);
          }
        }
        
        // 检查多余的ID
        for (const id of indexIds) {
          if (!actualIds.includes(id)) {
            this.addError(`分类索引中存在多余ID: ${id}`, `categoryIndex/${categoryName}`);
          }
        }
      }

      this.stats.totalCharacters = actualCharacters.size;
      this.stats.totalCategories = actualCategories.size;

    } catch (error) {
      this.addError(`解析index.json失败: ${error.message}`, 'index.json');
    }
  }

  /**
   * 验证所有分类文件
   */
  validateCategoryFiles() {
    const categoryFiles = fs.readdirSync(categoriesDir)
      .filter(file => file.endsWith('.json') && file !== 'index.json');

    for (const categoryFile of categoryFiles) {
      const categoryName = path.basename(categoryFile, '.json');
      const categoryPath = path.join(categoriesDir, categoryFile);
      
      if (!this.validateFileExists(categoryPath, `分类文件: ${categoryName}`)) {
        continue;
      }

      try {
        const categoryData = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
        
        if (!Array.isArray(categoryData)) {
          this.addError('分类文件格式错误，应为数组', categoryName);
          continue;
        }

        if (categoryData.length === 0) {
          this.addWarning('分类文件为空', categoryName);
          continue;
        }

        // 验证每个汉字
        for (const hanzi of categoryData) {
          this.validateHanziStructure(hanzi, categoryName);
          this.validateAssets(hanzi, categoryName);
        }

      } catch (error) {
        this.addError(`解析分类文件失败: ${error.message}`, categoryName);
      }
    }
  }

  /**
   * 运行完整验证
   */
  async validate() {
    console.log('🔍 开始验证汉字数据...');
    
    // 验证基础目录结构
    this.validateFileExists(configsDir, '配置目录');
    this.validateFileExists(categoriesDir, '分类目录');
    
    // 验证分类文件
    this.validateCategoryFiles();
    
    // 验证索引一致性
    this.validateIndexConsistency();
    
    // 输出结果
    this.printResults();
    
    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      stats: this.stats
    };
  }

  /**
   * 打印验证结果
   */
  printResults() {
    console.log('\n📊 验证统计:');
    console.log(`   汉字总数: ${this.stats.totalCharacters}`);
    console.log(`   分类总数: ${this.stats.totalCategories}`);
    console.log(`   缺失资源: ${this.stats.missingAssets}`);
    console.log(`   重复ID: ${this.stats.duplicateIds}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ 发现错误:');
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.message}`);
        if (error.context) {
          console.log(`      位置: ${error.context}`);
        }
      });
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告信息:');
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning.message}`);
        if (warning.context) {
          console.log(`      位置: ${warning.context}`);
        }
      });
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ 验证通过，未发现问题!');
    } else {
      console.log(`\n📋 验证完成: ${this.errors.length} 个错误, ${this.warnings.length} 个警告`);
    }
  }
}

/**
 * 运行验证
 */
async function runValidation() {
  const validator = new HanziDataValidator();
  const result = await validator.validate();
  
  if (!result.success) {
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runValidation();
}

module.exports = { HanziDataValidator, runValidation };