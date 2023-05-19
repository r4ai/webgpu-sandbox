import { resolve } from "path";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

/** @type {import('vite').UserConfig} */
export default {
  base: "/webgpu-sandbox/",
  root,
  build: {
    outDir,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        triangle_2d: resolve(root, "triangle_2d", "index.html"),
        square_2d: resolve(root, "square_2d", "index.html"),
        cube_3d: resolve(root, "cube_3d", "index.html"),
        cube_3d_official: resolve(root, "cube_3d_official", "index.html"),
      },
    },
  },
};
