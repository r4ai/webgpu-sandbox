# WebGPU Sandbox

- triangle_2d
- square_2d
- cube_3d

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

### 新規ページの作成

1. `src/` に新しいフォルダを作成する
2. `vite.config.js` の `build.rollupOptions.input.[name]` に、作成したフォルダのパスを追加する。
3. `src/index.html` の `body > ul.page-links` に、作成したページを追加する。
4. `README.md` の最初のとこに、ページの名前を追加する。
