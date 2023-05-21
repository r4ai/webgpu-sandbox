export const cubeVertexSize = 4 * (4 + 4); // Byte size of one cube vertex.
export const cubePositionOffset = 0;
export const cubeColorOffset = 4 * 4; // Byte offset of cube vertex color attribute.
export const cubeVertexCount = 24;

/* prettier-ignore */
export const cubeVertexArray = new Float32Array([
  // 背面
  -1, -1, -1, 1,    1, 0, 0, 1,  // 左下
  -1, 1, -1, 1,     1, 0, 0, 1,  // 左上
  1, 1, -1, 1,      1, 0, 0, 1,  // 右上
  1, -1, -1, 1,     1, 0, 0, 1,  // 右下

  // 前面
  -1, -1, 1, 1,    0, 0, 1, 1,
  -1, 1, 1, 1,     0, 0, 1, 1,
  1, 1, 1, 1,      0, 0, 1, 1,
  1, -1, 1, 1,     0, 0, 1, 1,

  // 左面
  -1, -1, -1, 1,    1, 1, 0, 1,
  -1, 1, -1, 1,     1, 1, 0, 1,
  -1, 1, 1, 1,      1, 1, 0, 1,
  -1, -1, 1, 1 ,    1, 1, 0, 1,

  // 右面
  1, -1, -1, 1,    0, 1, 1, 1,
  1, 1, -1, 1,     0, 1, 1, 1,
  1, 1, 1, 1,      0, 1, 1, 1,
  1, -1, 1, 1 ,    0, 1, 1, 1,

  // 上面
  -1, 1, -1, 1,    0, 1, 0, 1,
  -1, 1, 1, 1,     0, 1, 0, 1,
  1, 1, 1, 1,      0, 1, 0, 1,
  1, 1, -1, 1,     0, 1, 0, 1,

  // 底面
  -1, -1, -1, 1,    1, 0, 1, 1,
  -1, -1, 1, 1,     1, 0, 1, 1,
  1, -1, 1, 1,      1, 0, 1, 1,
  1, -1, -1, 1,     1, 0, 1, 1,
]);

/* prettier-ignore */
export const cubeIndicesArray = new Uint16Array([
  // 前面
  3, 2, 1, 3, 1, 0,

  // 背面
  7, 6, 5, 7, 5, 4,

  // 左面
  11, 10, 9, 11, 9, 8,

  // 右面
  13, 14, 15, 12, 13, 15,

  // 上面
  17, 18, 19, 16, 17, 19,

  // 底面
  20, 23, 22, 21, 20, 22
]);
