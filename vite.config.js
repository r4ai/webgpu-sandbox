import { resolve } from "path";

const root = resolve(__dirname, "pages");
const outDir = resolve(__dirname, "dist");

/** @type {import('vite').UserConfig} */
export default {
  base: `/webgpu-sandbox/`,
  root,
  build: {
    outDir,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        triangle_2d: resolve(root, "triangle_2d", "index.html"),
        square_2d: resolve(root, "square_2d", "index.html"),
        cube_3d: resolve(root, "cube_3d", "index.html"),
        cube_3d_wgpu_matrix: resolve(root, "cube_3d_wgpu_matrix", "index.html"),
        cube_3d_texture: resolve(root, "cube_3d_texture", "index.html"),
        triangle_2d_msaa: resolve(root, "triangle_2d_msaa", "index.html"),
      },
    },
  },
};
