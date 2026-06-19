# 水果 SVG AI 出图提示词

> 通用规格：512×512 矢量风格，透明背景，扁平插画，动森风格。
> 出图后建议用 vectormagic.com 转 SVG，确保描边宽度统一。

---

## 负面提示词（所有图通用）

```
realistic, photorealistic, 3d render, photo, pixel art,
dark mood, glossy, complex shading, multiple highlights,
gradient background, sky, ground, scenery,
text, watermark, signature, logo, frame, border,
multiple objects, scattered elements
```

---

## 1. 6 种基础水果

### apple.svg
```
A cute red apple with a single small green leaf on top,
glossy red body with simple round shape,
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

### cherry.svg
```
Two cute red cherries connected by green stems forming a Y shape,
each cherry round with single white highlight,
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

### peach.svg
```
A cute pink peach with a small green leaf,
soft round body with subtle vertical groove down the middle,
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

### pear.svg
```
A cute yellow-green pear with classic gourd shape,
single small leaf on top, soft round bottom,
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

### orange.svg
```
A cute orange citrus fruit, perfectly round,
small dimple on top with a single tiny green leaf,
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

### coconut.svg
```
A cute brown coconut, round and fuzzy,
three small dark dots arranged in a triangle on the front (the coconut eyes),
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

---

## 2. 3 种特殊食物

### watermelon.svg
```
A cute slice of watermelon, triangular shape,
red flesh with several small black seeds, thin green rind,
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

### persimmon.svg  （柿子）
```
A cute orange persimmon, plump round shape with flat bottom,
four small green sepals forming a calyx at the very top,
body color warm orange-red #f08030,
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

### chestnut.svg  （栗子）
```
A cute brown chestnut, teardrop shape with flat bottom,
slightly pointed top, glossy dark brown body #8b4513,
a small lighter tan patch at the bottom,
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

### golden_apple.svg
```
A cute golden apple with bright gold body and a single green leaf,
small sparkle stars (4-pointed) around it suggesting a glowing aura,
metallic gold color (#ffd700), but flat illustration not 3d,
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

### meteor.svg
```
A cute small meteor or shooting star, round rocky body in deep blue-purple,
small crater dots on surface, soft glow halo around it,
no tail (the tail is rendered separately in code),
colors: deep purple #5b3aa5 with cyan highlights,
flat design illustration, cute and cozy mobile game asset,
in the style of Animal Crossing New Horizons,
solid 2-3px dark brown outline (#794f27),
single soft white highlight on upper-right,
no shading complexity, no gradient background,
centered subject, transparent background,
512x512 vector style, warm friendly mood, soft rounded shapes
```

---

## 3. 出图工作流

1. **先出 6 个基础水果**（最多用），统一风格作为基准
2. **挑出最满意的 2-3 张**，把它们的视觉特征写进后续 prompt（如 "in the same style as my reference apple"）
3. **每张图至少出 4 张候选**，优选
4. **统一后处理**：删除背景 → vectormagic.com 转 SVG → 检查描边宽度一致性
5. **风格不一致时回炉**：宁可重出

---

## 4. 文件放置与集成

生成的 SVG 文件放入 `public/sprites/` 目录：

```
public/sprites/
├── apple.svg
├── cherry.svg
├── peach.svg
├── pear.svg
├── orange.svg
├── coconut.svg
├── watermelon.svg
├── persimmon.svg
├── chestnut.svg
├── golden_apple.svg
└── meteor.svg
```

### 当前状态（代码绘制覆盖）

| 食物种类 | 代码绘制 | SVG 待替换 |
|----------|:------:|:--------:|
| apple   | ✓ | - |
| cherry  | ✓ | - |
| peach   | ✓ | - |
| pear    | ✓ | - |
| orange  | ✓ | - |
| coconut | ✓ | - |
| watermelon | ✗（fallback 到 apple） | **急需** |
| persimmon  | ✗（fallback 到 apple） | **急需** |
| chestnut   | ✗（fallback 到 apple） | **急需** |
| golden  | ✓（带动画光晕） | 核心图替换 |
| meteor  | ✓（带拖尾光晕） | 核心图替换 |

> **优先出图顺序**：watermelon → persimmon → chestnut → 6 基础水果 → golden_apple → meteor
> 
> 前 3 个目前没有代码绘制，游戏内显示为苹果，影响最大。

---

## 5. 集成方式（出图后）

SVG 生成后，`src/game/render/sprites.ts` 需增加图片加载逻辑：

```ts
// 示例集成方式
const spriteImages = new Map<string, HTMLImageElement>();

export function loadSprite(key: string, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { spriteImages.set(key, img); resolve(); };
    img.onerror = reject;
    img.src = url;
  });
}

// 在 drawFoodSprite 中增加 SVG 分支
export function drawFoodSprite(ctx, kind, x, y, size, animPhase) {
  const img = spriteImages.get(kind);
  if (img) {
    ctx.drawImage(img, x - size/2, y - size/2, size, size);
    return;
  }
  // 否则 fallback 到代码绘制
  switch (kind) { /* ... */ }
}
```

此集成工作待出图完成后由 AI 助手执行。
