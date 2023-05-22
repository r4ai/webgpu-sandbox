# WebGPU Sandbox 🌐

自分の学習用に作った WebGPU のサンプルコードを置いていく場所。  
余分なライブラリは極力使わず、WebGPU の API のみで実装している。

## Table of Contents

- triangle_2d
- square_2d
- cube_3d
- cube_3d_wgpu_matrix

## Development

```sh
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build
pnpm build

# Preview build
pnpm preview
```

### Requirements

- [pnpm](https://pnpm.io/)
- [Node.js](https://nodejs.org/en/)

### Tech Stack

- [webGPU](https://gpuweb.github.io/gpuweb/) - Graphics API
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Programming language

### 新規ページの作成

1. `pages/` に新しいフォルダを作成する
2. `vite.config.js` の `build.rollupOptions.input.[name]` に、作成したフォルダのパスを追加する。
3. `components/links.html` の `body > ul.page-links` に、作成したページを追加する。
4. `README.md` の最初のとこに、ページの名前を追加する。
