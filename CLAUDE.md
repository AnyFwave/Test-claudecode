# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Test-claudecode — Pixel Shooter Game

俯视角射击游戏，ES Module + ECS + Registry 可插拔模块化架构。

## 开发命令

```bash
# 启动开发服务器
python -m http.server 8080
# 浏览器打开 http://localhost:8080

# 语法检查所有模块
node --check js/**/*.js
```

无构建步骤，纯 ES Module 直接在浏览器运行。无 package.json / npm 依赖。

## GitHub Workflow

每次修改代码后，主动执行以下流程（用户不需要提醒）：

1. **git add** — 暂存所有改动
2. **git commit** — 提交（简洁英文 commit message）
3. **git push** — 推送到 origin/master
4. 如果 commit 前 remote 有更新，先 `git pull --rebase`

**代理配置**：git 全局代理已设 127.0.0.1:7897，gh CLI 需要 `HTTP_PROXY`/`HTTPS_PROXY` 环境变量。

**仓库**：https://github.com/AnyFwave/Test-claudecode

## 架构总览

```
index.html → js/main.js（单入口）
  → data/registries.js（引导注册所有默认内容）
  → core/Game.js（编排器 + 场景状态机）
  → input/InputManager.js
  → requestAnimationFrame 主循环
```

### 核心设计模式

| 模式 | 用途 |
|------|------|
| **Registry** | 武器、敌人类型、伤害类型、特性均通过静态注册表管理。新增内容仅需创建文件 + 导入注册，零核心文件修改 |
| **EventBus** | 全局发布/订阅（`on`/`emit`/`off`），解耦波次通知、特性触发、UI 事件 |
| **Strategy** | 武器开火行为各自独立为 `FireBehavior` 子类；敌人 AI 通过 `EnemyTypeConfig` 委托 |
| **Modifier Stack** | 所有属性通过 `base + [add|multiply|override]` 修饰器栈计算，带 `source` 追踪支持卸载 |

### 关键子系统

- **伤害系统** (`sys/damage/`)：15 种伤害类型（物理/魔法/精神三大分支），`DamagePipeline` 计算管线：抗性→破甲→穿透→暴击→最终伤害
- **属性系统** (`sys/stats/`)：`StatBlock`（实体属性集）+ `StatModifier`（add/multiply/override），武器升级通过添加 StatModifier 实现，不修改 `WEAPON_DATA`
- **特性/装备** (`sys/traits/`)：`ConditionEvaluator` 监听 EventBus（`bullet:hit`/`enemy:killed`/`player:damaged`），匹配特性条件并执行效果。装备携带特性，通过装备槽系统赋予玩家
- **战斗系统** (`sys/combat/`)：4 条碰撞管线 — 玩家子弹 vs 敌人、敌人子弹 vs 玩家、体碰撞、爆炸 AoE
- **波次管理** (`spawn/WaveManager.js`)：每 5 波 Boss，阶段结算，EventBus 通知

### 数据流

```
武器开火 → WeaponRegistry.getBehavior(id).fire()
  → Bullet（携带 DamageInstance）
    → 碰撞检测（HitDetection 纯函数）
      → EventBus.emit('bullet:hit')
        → ConditionEvaluator 执行特性效果（生命偷取/狂战士等，在 takeDamage 之前）
      → DamagePipeline.calculate()
        → DamageResult → 实体.takeDamage()
```

### 关键约束

- `WEAPON_DATA` 是 `Object.freeze` 不可变的，升级时给玩家 StatBlock 添加 `damage_bonus_<type>` 修正器（source = `upgrade:damageAll`），每局独立不污染
- 爆炸伤害使用固定值，不经过 DamagePipeline（避免双重计算）
- 敌人的 AI/绘制/受伤全部委托给 `EnemyTypeConfig`，敌人自身不含类型特定逻辑

## 扩展方式

新增内容**不需要修改核心文件**，只需创建新文件并在 `data/registries.js` 中导入：

- **新武器**：在 `WeaponData.js` 添加定义 → 如需新开火行为，创建 `behaviors/XxxBehavior.js` 并注册
- **新敌人**：创建 `enemyTypes/xxx.js` → `EnemyTypeRegistry.register()` → 在 `registries.js` 导入
- **新伤害类型**：创建类型定义 → `DamageTypeRegistry.register()` → 在 `registries.js` 导入
- **新特性**：在 `traitDefinitions.js` 创建 `Trait` → `TraitRegistry.register()`
- **新装备**：在 `equipmentDefinitions.js` 创建 `Equipment` → `Game.registerEquipment()`
