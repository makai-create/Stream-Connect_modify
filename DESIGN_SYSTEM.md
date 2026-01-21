# DESIGN_SYSTEM.md

このファイルは、アプリケーション「Stream Connect」のデザインシステム（Tone & Manner）を定義する絶対的な仕様書です。
AIモデルが新規コードを生成、または修正を行う際は、必ず以下のルールに準拠し、既存の世界観を破壊しないようにしてください。

## 1. デザインコンセプト (Atmosphere)

* **テーマ:** Cyberpunk / Sci-Fi HUD / Futuristic System Interface
* **キーワード:** `High-Tech`, `Industrial`, `Dark Mode`, `Glassmorphism`, `Terminal`
* **視覚的特徴:**
    * **Cut Corners:** ボタンやフレームの角は丸めず、斜めにカットする（45度）。
    * **HUD Accents:** 枠線の四隅に装飾的なライン（ブラケット）を配置する。
    * **Scanlines / Glow:** 発光表現や走査線エフェクトを使用し、デジタル感を演出する。
    * **Transparency:** 背景は不透明ではなく、半透明（Glassmorphism）で背景のグリッドを透けさせる。

---

## 2. カラーパレット (Color Palette)

Tailwind CSSの標準カラーに加え、以下の特定のシェードを厳守すること。

### Primary Colors (System)
* **Cyan (Main):** `#22d3ee` (`text-cyan-400`, `border-cyan-400`)
    * 用途: メインアクション、強調、正常ステータス、システム境界線。
    * **Glow:** `shadow-[0_0_15px_rgba(34,211,238,0.6)]`

### Secondary Colors (Accents)
* **Magenta/Pink:** `#ec4899` (`text-pink-500`, `border-pink-500`)
    * 用途: 重要な数値、強調ラベル、装飾的なアクセント。
* **Amber:** `#f59e0b` (`text-amber-500`, `border-amber-500`)
    * 用途: 注意、警告、休憩中ステータス、修正申請。

### Base Colors (Background)
* **App Background:** `#050a14` (Deep Dark Blue/Black)
    * `bg-[#050a14]` を使用。完全な黒（#000）ではなく、わずかに青みのある黒。
* **Panel Background:** `bg-slate-900/40` or `bg-cyan-950/20`
    * 必ず不透明度を下げ、`backdrop-blur-md` (ぼかし) を併用すること。

---

## 3. タイポグラフィ (Typography)

フォントの使い分けがデザインの肝となる。

* **Display / Headings / HUD Numbers:**
    * **Font:** `font-orbitron` (Google Fonts: Orbitron)
    * **Style:** `font-black`, `italic`, `uppercase` (大文字固定)
    * **Tracking:** `tracking-widest` (文字間を広く) または `tracking-tighter` (詰める) を極端に使い分ける。
    * 例: `HOME / ホーム`, `09:00`

* **Subtitles / Metadata:**
    * **Font:** `font-mono`
    * **Style:** `text-[10px]`, `opacity-70`
    * **Text:** 英語表記をメインにし、日本語は補足として添えるスタイル（例: `SHIFT / シフト`）。

* **Body Text:**
    * **Font:** `font-sans` (Default sans-serif)
    * **Color:** `text-slate-200` (真っ白 `#fff` は避け、少し落とす)

---

## 4. UIコンポーネント (UI Components)

新規コンポーネントを作成する際は、既存の `components/CyberUI.tsx` のロジックを継承すること。

### 4.1. CyberFrame (枠組み)
カードやセクションを囲む基本コンポーネント。
* **Border:** 細い線 (`border-[1px]`)。色は透明度60%程度 (`border-cyan-400/60`)。
* **Decorations:** 四隅に `w-6 h-[2px]` のアクセントラインを配置（HUDらしさの強調）。
* **Label:** 左上に枠線に乗る形でタイトルラベルを配置（背景色でマスクする）。

### 4.2. CutCornerButton (ボタン)
* **Shape:** `border-radius` は使用しない。CSS `clip-path` を使用して角をカットする。
    * Style: `clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)`
* **Interaction:**
    * Hover: `brightness-110`
    * Active: `scale-95`
* **Variant:**
    * `filled`: 背景色あり（文字色は黒 `text-slate-950` 推奨）。
    * `outline`: 背景透明、枠線のみ。

---

## 5. コーディング規約 (Coding Rules)

* **Framework:** React + TypeScript + Vite
* **Styling:** Tailwind CSS (インライン記述を基本とする)
* **Icon Set:** `lucide-react`
    * アイコンのサイズは `w-4 h-4` から `w-6 h-6` を基本とする。
    * 線幅 (`stroke-width`) は細めを維持する。
* **Animation:** `tailwindcss-animate` を想定。
    * `animate-in`, `fade-in`, `slide-in-from-bottom-4` などを多用し、画面遷移時にサイバーパンク的な「起動感」を出す。

## 6. 実装時の禁止事項

1.  **角丸の禁止:** `rounded-lg`, `rounded-xl` などの大きな角丸は世界観に合わないため使用禁止（`rounded-sm` や `rounded-full` は一部許可）。
2.  **フラットすぎるデザインの禁止:** 常に「枠線」「グリッド」「光沢」を意識する。
3.  **白い背景の禁止:** アプリ全体の背景を白くしてはならない。常にDark Modeを維持する。
