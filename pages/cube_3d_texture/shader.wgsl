struct Uniforms {
  frame_info: vec4<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var myTexture: texture_2d<f32>;
@group(0) @binding(2) var mySampler: sampler;

struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) color : vec4<f32>,
  @location(1) uv : vec2<f32>,
}

const PI: f32 = 3.1415926535897932384626433832795;

/// 座標を拡大縮小する
fn scale(pos: vec4<f32>, delta: vec3<f32>) -> vec4<f32> {
  // 拡大縮小行列
  // / dx 0  0  0 \
  // | 0  dy 0  0 |
  // | 0  0  dz 0 |
  // \ 0  0  0  1 /
  let scale_matrix = mat4x4<f32>(
    vec4<f32>(delta.x, 0.0, 0.0, 0.0),
    vec4<f32>(0.0, delta.y, 0.0, 0.0),
    vec4<f32>(0.0, 0.0, delta.z, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 1.0)
  );
  return scale_matrix * pos;
}

/// 座標を回転する (X軸中心)
fn rotate_x(pos: vec4<f32>, angle: f32) -> vec4<f32> {
  let c = cos(angle);
  let s = sin(angle);
  let rotate_matrix = mat4x4<f32>(
    vec4<f32>(1.0, 0.0, 0.0, 0.0),
    vec4<f32>(0.0,   c,  -s, 0.0),
    vec4<f32>(0.0,   s,   c, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 1.0)
  );
  return rotate_matrix * pos;
}

/// 座標を回転する (Y軸中心)
fn rotate_y(pos: vec4<f32>, angle: f32) -> vec4<f32> {
  let c = cos(angle);
  let s = sin(angle);
  let rotate_matrix = mat4x4<f32>(
    vec4<f32>(  c, 0.0,  -s, 0.0),
    vec4<f32>(0.0, 1.0, 0.0, 0.0),
    vec4<f32>(  s, 0.0,   c, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 1.0)
  );
  return rotate_matrix * pos;
}

/// 座標を回転する (Z軸中心)
fn rotate_z(pos: vec4<f32>, angle: f32) -> vec4<f32> {
  let c = cos(angle);
  let s = sin(angle);

  // /  c s 0 0 \
  // | -s c 0 0 |
  // |  0 0 1 0 |
  // \  0 0 0 1 /
  let rotate_matrix = mat4x4<f32>(
    vec4<f32>(  c,  -s, 0.0, 0.0),
    vec4<f32>(  s,   c, 0.0, 0.0),
    vec4<f32>(0.0, 0.0, 1.0, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 1.0)
  );
  return rotate_matrix * pos;
}

/// 座標を平行移動する
fn translate(pos: vec4<f32>, delta: vec3<f32>) -> vec4<f32> {
  // / 1 0 0 dx \
  // | 0 1 0 dy |
  // | 0 0 1 dz |
  // \ 0 0 0  1 /
  let translate_matrix = mat4x4<f32>(
    vec4<f32>(1.0, 0.0, 0.0, 0),
    vec4<f32>(0.0, 1.0, 0.0, 0),
    vec4<f32>(0.0, 0.0, 1.0, 0),
    vec4<f32>(delta.x, delta.y, delta.z, 1.0)
  );

  // / 1 0 0 dx \   / x \
  // | 0 1 0 dy |   | y |
  // | 0 0 1 dz | * | z |
  // \ 0 0 0  1 /   \ 1 /
  return translate_matrix * pos;
}

/// 透視投影変換
/// @param pos 座標
/// @param fov 視野角 (radians)
/// @param aspect アスペクト比
/// @param near 前方クリップ面までの距離
/// @param far 後方クリップ面までの距離
fn parspective(pos: vec4<f32>, fov: f32, aspect: f32, near: f32, far: f32) -> vec4<f32> {
  let t = tan(PI * 0.5 - 0.5 * fov);
  let n = near;
  let f = far;
  let a = aspect;

  // / t/a 0 0       0           \
  // | 0   t 0       0           |
  // | 0   0 f/(n-f) (f*n)/(n-f) |
  // \ 0   0 -1      0           /
  let perspective_matrix = mat4x4<f32>(
    vec4<f32>(t/a, 0.0, 0.0, 0.0),
    vec4<f32>(0.0, t, 0.0, 0.0),
    vec4<f32>(0.0, 0.0, f / (n-f), -1),
    vec4<f32>(0.0, 0.0, (f*n)/(n-f), 0.0)
  );
  return perspective_matrix * pos;
}

@vertex
fn vertex_main(
  @location(0) position : vec4<f32>,
  @location(1) uv : vec2<f32>,
) -> VertexOutput {
  var output : VertexOutput;
  let frame = uniforms.frame_info;
  var tmp2 = position;

  tmp2 = scale(tmp2, vec3<f32>(0.3, 0.3, 0.3));
  tmp2 = rotate_x(tmp2, frame.x);
  tmp2 = rotate_y(tmp2, frame.y);
  tmp2 = translate(tmp2, vec3<f32>(0, 0, -20));
  tmp2 = parspective(tmp2, 0.25, frame.z, 0.1, 100.0);

  output.position = tmp2;
  output.uv = uv;
  return output;
}

@fragment
fn fragment_main(
  @location(0) color: vec4<f32>,
  @location(1) fragUV: vec2<f32>
) -> @location(0) vec4<f32> {
  return textureSample(myTexture, mySampler, fragUV);
}
