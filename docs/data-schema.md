# 数据模式文档

本文档定义了汉字学习应用的数据结构规范。

## character

### 必需字段

- `id`: string
- `character`: string
- `pinyin`: string
- `theme`: string
- `category`: string
- `learningStage`: string
- `meaning`: string
- `emoji`: string
- `assets`: object
- `evolutionStages`: array

### 可选字段

- `description`: string
- `difficulty`: number
- `tags`: array

## assets

### 必需字段

- `pronunciationAudio`: string
- `mainIllustration`: string
- `lottieAnimation`: string
- `realObjectImage`: string
- `realObjectCardColor`: string

### 可选字段

- `videoUrl`: string
- `interactiveElements`: array

## evolutionStage

### 必需字段

- `scriptName`: string
- `timestamp`: number
- `narrationAudio`: string
- `explanation`: string
- `scriptText`: string
- `fontFamily`: string
- `cardColor`: string

### 可选字段

- `duration`: number
- `animationDelay`: number

## masterConfig

### 必需字段

- `version`: string
- `description`: string
- `lastUpdated`: string
- `categories`: array
- `learningStages`: array
- `totalCharacters`: number

### 可选字段

- `metadata`: object
- `features`: array

## category

### 必需字段

- `name`: string
- `file`: string
- `count`: number

### 可选字段

- `description`: string
- `icon`: string
- `color`: string
- `order`: number

## characterIndex

### 必需字段

- `id`: string
- `category`: string
- `learningStage`: string

### 可选字段

- `difficulty`: number
- `frequency`: number

