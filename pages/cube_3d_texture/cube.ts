export const cubeVertexSize = 4 * (4 + 4 + 2); // Byte size of one cube vertex.
export const cubePositionOffset = 0;
export const cubeColorOffset = 4 * 4; // Byte offset of cube vertex color attribute.
export const UVOffset = 4 * (4 + 4); // Byte offset of cube vertex UV attribute.
export const cubeVertexCount = 24;

/* prettier-ignore */
export const cubeVertexArray = new Float32Array([
  // Position(4), Color(4), UV(2)
  // 背面 (赤)
  -1, -1, -1, 1,   1, 0, 0, 1,  0, 1, // 左下
  -1, 1, -1, 1,    1, 0, 0, 1,  0, 0, // 左上
  1, 1, -1, 1,     1, 0, 0, 1,  1, 0, // 右上
  1, -1, -1, 1,    1, 0, 0, 1,  1, 1, // 右下

  // 前面 (青)
  -1, -1, 1, 1,    0, 0, 1, 1,  0, 1,
  -1, 1, 1, 1,     0, 0, 1, 1,  0, 0,
  1, 1, 1, 1,      0, 0, 1, 1,  1, 0,
  1, -1, 1, 1,     0, 0, 1, 1,  1, 1,

  // 左面 (黄)
  -1, -1, -1, 1,   1, 1, 0, 1,  0, 1,
  -1, 1, -1, 1,    1, 1, 0, 1,  0, 0,
  -1, 1, 1, 1,     1, 1, 0, 1,  1, 0,
  -1, -1, 1, 1 ,   1, 1, 0, 1,  1, 1,

  // 右面 (白)
  1, -1, -1, 1,    1, 1, 1, 1,  0, 1,
  1, 1, -1, 1,     1, 1, 1, 1,  0, 0,
  1, 1, 1, 1,      1, 1, 1, 1,  1, 0,
  1, -1, 1, 1 ,    1, 1, 1, 1,  1, 1,

  // 上面 (緑)
  -1, 1, -1, 1,    0, 1, 0, 1,  0, 1,
  -1, 1, 1, 1,     0, 1, 0, 1,  0, 0,
  1, 1, 1, 1,      0, 1, 0, 1,  1, 0,
  1, 1, -1, 1,     0, 1, 0, 1,  1, 1,

  // 底面 (紫)
  -1, -1, -1, 1,   1, 0, 1, 1,  0, 1,
  -1, -1, 1, 1,    1, 0, 1, 1,  0, 0,
  1, -1, 1, 1,     1, 0, 1, 1,  1, 0,
  1, -1, -1, 1,    1, 0, 1, 1,  1, 1
]);

/* prettier-ignore */
export const cubeIndicesArray = new Uint16Array([
  // 背面
  3, 2, 1, 3, 1, 0,

  // 前面
  4, 5, 6, 4, 6, 7,

  // 左面
  9, 10, 11, 8, 9, 11,

  // 右面
  15, 14, 13, 15, 13, 12,

  // 上面
  19, 18, 17, 19, 17, 16,

  // 底面
  21, 22, 23, 20, 21, 23
]);
