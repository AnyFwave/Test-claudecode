# Pixel Shooter — 可插拔模块化框架架构文档

## 项目目标

将俯视角射击游戏从 13 个全局脚本的平面结构，重构为基于 ES Module + Registry 模式的可无限扩展模块化框架。零核心文件修改即可新增武器、敌人、伤害类型、装备、特性。

---

## 架构设计

### 入口

```
index.html → <script type="module" src="js/main.js">
                → data/registries.js（引导注册所有默认内容）
                → core/Game.js（编排器）
                → input/InputManager.js
```

### 核心模式

| 模式 | 用途 |
|------|------|
| **Registry** | 武器、敌人类型、伤害类型、特性均通过静态注册表管理，新增内容仅需创建文件 + 导入注册 |
| **EventBus** | 全局发布/订阅，解耦波次通知、特性触发、UI 事件 |
| **Strategy** | 武器开火行为各自独立为 FireBehavior 子类 |
| **Modifier Stack** | 所有属性通过 base + [add|multiply|override] 修饰器栈计算，source 追踪支持卸载 |

---

## 目录结构

```
js/
  main.js                          ← 入口

  core/
    EventBus.js                    ← 全局 on/emit/off
    GameState.js                   ← 中心状态容器（场景、实体数组、波次/分数）
    Game.js                        ← 轻量编排器（循环 + 场景状态机）

  sys/
    damage/
      DamageType.js                ← 基类：typeId, parentType, onHit, onKill, modifiers
      DamageTypeRegistry.js        ← 静态注册表
      damageTypes.js               ← 物理/魔法/精神 15 种伤害类型定义（自注册）
      DamageInstance.js            ← 值对象：baseValue + 加权类型比例
      DamageResult.js              ← 结果：finalDamage, mitigated, breakdown, flags
      DamagePipeline.js            ← 计算引擎：抗性→破甲→穿透→暴击→最终伤害
      DamageResistanceProfile.js   ← 实体抗性/弱点配置

    stats/
      Stat.js                      ← 单属性：baseValue + modifiers[] → getValue()
      StatModifier.js              ← { type: add|multiply|override, value, source }
      StatBlock.js                 ← 具名属性集合，支持克隆与源追踪
      StatBlockFactory.js          ← 预设工厂（playerDefault, enemyByType）
      statDefinitions.js           ← 属性名常量枚举（STATS.HP, STATS.SPEED...）

    traits/
      Trait.js                     ← { id, name, statModifiers, conditions[], rarity }
      TraitCondition.js            ← { event, predicate, effect }
      TraitRegistry.js             ← 静态注册表
      ConditionEvaluator.js        ← 监听 EventBus，匹配 trait conditions 并执行
      Equipment.js                 ← { id, name, slot, statModifiers, traits[] }
      EquipmentSlot.js             ← 枚举：HEAD/BODY/ACCESSORY
      traitDefinitions.js          ← 5 个默认特性（自注册）

    combat/
      CombatSystem.js              ← 集中碰撞处理：玩家子弹/敌弹/体碰撞/爆炸 4 管线
      HitDetection.js              ← 纯函数：circleVsCircle, rayVsCircle

  entities/
    Entity.js                      ← 基类
    Player.js                      ← StatBlock + 装备槽 + 武器库存 + 升级系统
    Enemy.js                       ← StatBlock + 委托 EnemyTypeConfig 绘制/AI/受伤
    Bullet.js                      ← 携带 DamageInstance + pierce/hitEnemies/isExplosive
    Explosion.js                   ← AoE 伤害 + 命中追踪
    Pickup.js                      ← 武器/生命/装备拾取物
    Projectile.js                  ← 弹射物抽象基类

    enemyTypes/
      EnemyTypeConfig.js           ← 接口基类 { typeId, behavior, drawFn, initFn, damageFn... }
      EnemyTypeRegistry.js         ← 静态注册表
      basic.js, fast.js, tank.js, boss.js, sniper.js, swarm.js, shield.js, splitter.js

  weapons/
    Weapon.js                      ← 引用 WeaponData + DamageProfile + 注册表驱动开火行为
    WeaponData.js                  ← Object.freeze 不可变武器定义（8 把武器 × 5 等级）
    WeaponRegistry.js              ← 静态注册表（武器 + 行为）
    DamageProfile.js               ← 武器→伤害类型映射

    behaviors/
      FireBehavior.js              ← 接口
      SingleShotBehavior.js        ← 单发
      ParallelBehavior.js          ← 平行多发（双枪）
      SpreadBehavior.js            ← 扇形散射（散弹枪）
      QuadBehavior.js              ← 十字/八向（四向枪）
      LaserBehavior.js             ← 光束穿透 + 射线检测
      PierceBehavior.js            ← 穿透弹（狙击枪）
      SpinnerBehavior.js           ← 环绕子弹自动射击
      ExplosiveBehavior.js         ← 命中爆炸 AoE（爆破枪）

  spawn/
    Spawner.js                     ← 基于 EnemyTypeRegistry 生成敌人
    WaveManager.js                 ← 波次逻辑 + EventBus 通知
    DropTable.js                   ← 可配置掉落表

  rendering/
    Camera.js                      ← 屏幕震动
    ParticleSystem.js              ← 粒子效果
    Renderer.js                    ← 渲染编排

  input/
    InputManager.js                ← 键盘 + 鼠标输入

  ui/
    HUD.js                         ← 生命/经验/武器/装备显示
    MenuManager.js                 ← 开始/结束/升级/替换/阶段结算画面
    NotificationSystem.js          ← 浮动文字通知

  data/
    registries.js                  ← 统一导入注册所有默认内容
    equipmentDefinitions.js        ← 5 件默认装备定义
```

---

## 伤害类型体系

```
伤害基类
├── 物理
│   ├── 碰撞（近战/体碰）
│   └── 穿透（狙击/穿甲）
├── 魔法
│   ├── 火焰（onHit: 燃烧DoT）
│   ├── 冰冻（onHit: 减速）
│   ├── 闪电（onHit: 连锁）
│   ├── 毒素（onHit: 中毒DoT）
│   ├── 元素反应（水火蒸发/冰火融化）
│   └── 元素穿透（无视元素抗性）
└── 精神
    ├── 精神碰撞
    ├── 精神干扰（onHit: 混乱/反向操作）
    ├── 精神穿透（无视精神抗性）
    └── 精神撕裂（onHit: 持续精神伤害）
```

### 武器→伤害映射

| 武器 | 伤害构成 |
|------|---------|
| 手枪 | 100% 物理穿透 |
| 双枪 | 100% 物理碰撞 |
| 散弹枪 | 100% 物理碰撞 |
| 四向枪 | 70% 碰撞 + 30% 闪电 |
| 激光 | 30% 穿透 + 70% 火焰 |
| 狙击枪 | 100% 物理穿透 |
| 旋转枪 | 100% 物理碰撞 |
| 爆破枪 | 50% 碰撞 + 50% 火焰 |

### 伤害计算管线

```
原始伤害(DamageInstance)
  → 按类型拆分(getDamageByType)
  → 每种类型独立计算:
     1. 抗性减免: rawValue × (1 − (resistance − vulnerability))
     2. 护甲减免: 仅物理类型, max(0, afterResist − armor × (1 − pen))
     3. 伤害加成: afterArmor × (1 + damage_bonus_<type>)
     4. 弱点增伤: 若 vulnerability > resistance, × weaknessMultiplier
     5. 暴击判定: Math.random() < critChance → × critMultiplier
     6. 执行 onHit 钩子（DoT/减速等状态效果）
  → 汇总: DamageResult { finalDamage, mitigated, bonus, breakdown[], flags[] }
```

---

## 属性系统

```
StatBlock（实体属性集）
  max_hp:      Stat(base=100) + [Modifier(trait:+20)] + [Modifier(equip:+15)]
  speed:       Stat(base=200) + [Modifier(buff:×1.1)]
  armor:       Stat(base=0)   + [Modifier(equip:+15)]
  critical_chance:   Stat(base=0.05)
  critical_multiplier: Stat(base=1.5)
  fire_rate:   Stat(base=1.0, min=0.1)      ← 射速修正器
  resistance_fire:     Stat(base=0)
  vulnerability_ice:   Stat(base=0)          ← 负值=弱点
  damage_bonus_physical: Stat(base=0)
  ...
```

**关键修复**：武器升级不再修改 `WEAPON_DATA`。升级时给玩家 StatBlock 添加 `damage_bonus_<type>` 修正器（source = `upgrade:damageAll`），每局游戏独立不污染。

---

## 特性/装备系统

### 5 个默认特性

| 特性 | 稀有度 | 触发事件 | 效果 |
|------|--------|---------|------|
| 生命偷取 | 稀有 | bullet:hit | 造成伤害的 5% 转化为治疗 |
| 连锁反应 | 史诗 | enemy:killed | 死亡敌人以 30% 伤害爆炸（半径60px） |
| 冰霜护甲 | 罕见 | player:damaged | +5护甲；150px内敌人减速70%持续2秒 |
| 狂战士 | 稀有 | bullet:hit | 生命越低伤害越高（最多+50%） |
| 吸血鬼之触 | 罕见 | enemy:killed | 击杀回复 10 HP |

### 5 件默认装备

| 装备 | 槽位 | 属性加成 | 携带特性 |
|------|------|---------|---------|
| 吸血鬼王冠 | 头部 | +15 最大生命 | 吸血鬼之触 |
| 狂战士板甲 | 身体 | +20 最大生命, +5 护甲 | 狂战士 |
| 冰霜之戒 | 饰品 | +5 护甲 | 冰霜护甲 |
| 灵魂护符 | 饰品 | +5% 暴击率 | 生命偷取 |
| 锁子甲 | 身体 | +10 护甲 | 连锁反应 |

### 触发流程

```
EventBus.emit('bullet:hit', { bullet, enemy, damageResult, source: player })
  → ConditionEvaluator.evaluate(player, 'bullet:hit', data, worldState)
    → 遍历 player.equipment → 装备.traits → trait.conditions
      → 匹配 event + predicate → 执行 effect
        → LIFESTEAL: source.heal(finalDamage × 0.05)
        → BERSERKER: 修改 damageResult.finalDamage（在 takeDamage() 之前生效）
```

---

## 已实现功能清单

### 已修复 Bug
- [x] `WEAPON_DATA` 跨局污染 → Object.freeze + StatModifier 替代直接修改
- [x] 敌人 type 大 switch → EnemyTypeRegistry 注册表模式
- [x] 武器 fire() 巨 switch → WeaponRegistry.getBehavior() 策略模式
- [x] `require_hack()` 未定义引用 → 移除
- [x] Game.start() 重复创建 Player 3 次 → 简化为 1 次
- [x] 爆炸伤害双重计算 → 爆炸使用固定伤害，不经过 DamagePipeline

### 已实现系统
- [x] ES Module 全模块化（50+ 文件）
- [x] EventBus 全局发布/订阅
- [x] 15 种伤害类型层级体系 + 自注册
- [x] DamagePipeline 完整计算管线
- [x] StatBlock + StatModifier 属性系统
- [x] 8 种武器 5 级升级 × 8 种开火行为策略
- [x] 8 种敌人类型注册表 + 独立文件
- [x] CombatSystem 4 管线碰撞处理
- [x] WaveManager 波次管理 + 阶段结算
- [x] ConditionEvaluator + 5 个特性 + EventBus 接线
- [x] 5 件装备 + 装备掉落 + 装备升级选项
- [x] 装备 HUD 显示（头部/身体/饰品槽位）
- [x] 所有文件通过 `node --check` 语法验证

---

## 扩展指南

### 新增伤害类型
```js
// 1. 创建文件定义类型
const MY_TYPE = new DamageType({ typeId: 'holy', typeName: '神圣', parentType: MAGIC, ... });
DamageTypeRegistry.register(MY_TYPE);

// 2. 在 registries.js 中导入该文件
// 3. 武器 DamageProfile 引用该类型即可
```

### 新增武器
```js
// 1. 在 WeaponData.js 的 WEAPON_DEFINITIONS 中添加定义
// 2. 如需新开火行为，创建 FireBehavior 子类并在 registries.js 注册
```

### 新增敌人类型
```js
// 1. 创建 enemyTypes/xxx.js，定义 EnemyTypeConfig
// 2. EnemyTypeRegistry.register('xxx', config)
// 3. 在 registries.js 中导入
// 4. 在 WaveManager._spawnEnemy() 的可用类型池中添加
```

### 新增特性
```js
// 1. 在 traitDefinitions.js 中创建 Trait 实例
// 2. 指定 event（bullet:hit / enemy:killed / player:damaged）
// 3. TraitRegistry.register(trait)
// 4. 将特性附加到装备上
```

### 新增装备
```js
// 1. 在 equipmentDefinitions.js 中创建 Equipment 实例
// 2. 指定 slot、statModifiers、traits
// 3. Game.registerEquipment(eq)
```

---

## 待验证项目

- [ ] 浏览器端到端测试（8武器×8敌人×波次流转×升级×替换×装备×特性效果）
- [ ] 激光击杀经验值追踪正确
- [ ] 双枪开火不产生 NaN
- [ ] 替换武器界面无 UI 残留
- [ ] 游戏结束重启状态完全重置
- [ ] Stage Complete 画面正常流转
