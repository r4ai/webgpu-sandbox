struct Uniforms {
  modelViewProjectionMatrix: mat4x4<f32>,
}
@binding(0) @group(0)  var<uniform> uniforms: Uniforms;

struct VertexOut {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>
}

/// 座標を拡大縮小する
fn scale(pos: vec4<f32>, delta: vec3<f32>) -> vec4<f32> {
  // 拡大縮小行列
  // | dx 0  0  0 |
  // | 0  dy 0  0 |
  // | 0  0  dz 0 |
  // | 0  0  0  1 |
  let scale_matrix = mat4x4<f32>(
    vec4<f32>(delta.x, 0.0, 0.0, 0.0),
    vec4<f32>(0.0, delta.y, 0.0, 0.0),
    vec4<f32>(0.0, 0.0, delta.z, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 1.0)
  );

  //               | dx 0  0  0 |
  // | x y z 1 | * | 0  dy 0  0 |
  //               | 0  0  dz 0 |
  //               | 0  0  0  1 |
  return pos * scale_matrix;
}

/// 座標を回転する (X軸中心)
fn rotate_x(pos: vec4<f32>, angle: f32) -> vec4<f32> {
  let c = cos(angle);
  let s = sin(angle);
  let rotate_matrix = mat4x4<f32>(
    vec4<f32>(1.0, 0.0, 0.0, 0.0),
    vec4<f32>(0.0,   c,   s, 0.0),
    vec4<f32>(0.0,  -s,   c, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 1.0)
  );
  return pos * rotate_matrix;
}

/// 座標を回転する (Y軸中心)
fn rotate_y(pos: vec4<f32>, angle: f32) -> vec4<f32> {
  let c = cos(angle);
  let s = sin(angle);
  let rotate_matrix = mat4x4<f32>(
    vec4<f32>(  c, 0.0,   s, 0.0),
    vec4<f32>(0.0, 1.0, 0.0, 0.0),
    vec4<f32>( -s, 0.0,   c, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 1.0)
  );
  return pos * rotate_matrix;
}

/// 座標を回転する (Z軸中心)
fn rotate_z(pos: vec4<f32>, angle: f32) -> vec4<f32> {
  let c = cos(angle);
  let s = sin(angle);
  let rotate_matrix = mat4x4<f32>(
    vec4<f32>(  c,  -s, 0.0, 0.0),
    vec4<f32>(  s,   c, 0.0, 0.0),
    vec4<f32>(0.0, 0.0, 1.0, 0.0),
    vec4<f32>(0.0, 0.0, 0.0, 1.0)
  );
  return pos * rotate_matrix;
}

/// 座標を平行移動する
fn translate(pos: vec4<f32>, delta: vec3<f32>) -> vec4<f32> {
  let translate_matrix = mat4x4<f32>(
    vec4<f32>(1.0, 0.0, 0.0, delta.x),
    vec4<f32>(0.0, 1.0, 0.0, delta.y),
    vec4<f32>(0.0, 0.0, 1.0, delta.z),
    vec4<f32>(0.0, 0.0, 0.0, 1.0)
  );
  return pos * translate_matrix;
}

// 頂点シェーダー
@vertex
fn vertexShader(@location(0) position: vec4<f32>, @location(1) color: vec4<f32>) -> VertexOut {
    var output: VertexOut;
    var pos = position;

    let tmp = uniforms.modelViewProjectionMatrix;

    // pos = rotate_x(pos, 0.8);
    // pos = rotate_y(pos, 0.8);
    // pos = rotate_z(pos, 0.0);

    pos = translate(pos, vec3<f32>(0.0, 0.0, -10));
    // pos = scale(pos, vec3<f32>(0.3, 0.3, 0.3));
    pos = uniforms.modelViewProjectionMatrix * pos;

    output.position = pos;
    output.color = color;
    return output;
}

// フラグメントシェーダー
@fragment
fn fragmentShader(fragData: VertexOut) -> @location(0) vec4<f32> {
    return fragData.color;
}
