/** Seconds until every corner of the sheet lies flat. */
export const DROP_DURATION = 1.7;

/*
 * The motion's constants, shared by the shaders and by \`getSheetPose\`.
 * Heights are px above the desk; the camera looks straight down.
 */
const RELEASE_HEIGHT = 130;
const CAMERA_HEIGHT = 1150;
/** Stiffness of the fall (critically damped: no bounce). */
const FALL_RATE = 8.6;
/** Seconds between the first corner touching down and the last. */
const MAX_LAG = 0.42;
const RIPPLE = 0.16;
const RIPPLE_SPEED = 7.5;
const SAG = 0.22;
const TWIST_DEGREES = -3.4;
const TWIST_SPRING = [8, 0.5] as const;
const DRIFT = [-64, -96] as const;
const DRIFT_SPRING = [5.4, 0.7] as const;

/** Formats a number as a GLSL float literal. */
function glsl(value: number) {
  return Number.isInteger(value) ? `${value}.0` : `${value}`;
}

/** Vertices per side of the sheet mesh; enough for the bend to read smooth. */
const SEGMENTS = 56;

/** A box in CSS pixels: x, y, width, height. */
export type Box = [number, number, number, number];

export interface PaperFrame {
  /** Seconds since the sheet was let go. */
  time: number;
  /** Viewport size, CSS px. */
  view: [number, number];
  /** The sheet on the desk, in viewport CSS px. */
  sheet: Box;
  /** The ruled frame inside the sheet, relative to the sheet's corner. */
  frame: Box;
  /** How much of the sheet's height is meshed (the part that can be seen). */
  meshHeight: number;
}

/*
 * The motion, shared by the paper and its shadow. `lift` is the height above
 * the desk: a critically damped spring (no bounce, the air cushion), released
 * a little later the further a point is from the corner that touches down
 * first, so the sheet is laid down rather than dropped flat. A ripple rides
 * on it and dies as each point lands. The whole sheet also drifts and twists
 * on under-damped springs.
 */
const MOTION = /* glsl */ `
uniform vec2 uView;
uniform vec4 uSheet;
uniform float uMeshHeight;
uniform float uTime;

const float RELEASE_HEIGHT = ${glsl(RELEASE_HEIGHT)};
const float CAMERA_HEIGHT = ${glsl(CAMERA_HEIGHT)};

float settle(float t, float w) {
  t = max(t, 0.0);
  return exp(-w * t) * (1.0 + w * t);
}

float swing(float t, float w, float damping) {
  t = max(t, 0.0);
  float wd = w * sqrt(1.0 - damping * damping);
  return exp(-damping * w * t) * (cos(wd * t) + damping * w / wd * sin(wd * t));
}

float lift(vec2 local) {
  vec2 q = local / vec2(uSheet.z, uMeshHeight);
  // Bottom-left touches first, top-right last.
  float lag = ${glsl(MAX_LAG)} * (0.62 * q.x + 0.38 * (1.0 - q.y));
  float fall = settle(uTime - lag, ${glsl(FALL_RATE)});
  float ripple = sin(dot(q, vec2(5.2, 3.4)) - uTime * ${glsl(RIPPLE_SPEED)});
  float sag = sin(3.14159 * q.x) * 0.5;
  return RELEASE_HEIGHT * fall * (1.0 + ${glsl(RIPPLE)} * ripple - ${glsl(SAG)} * sag);
}

vec2 onDesk(vec2 local) {
  vec2 centre = vec2(uSheet.z, uMeshHeight) * 0.5;
  float twist = radians(${glsl(TWIST_DEGREES)}) * swing(uTime, ${glsl(TWIST_SPRING[0])}, ${glsl(TWIST_SPRING[1])});
  vec2 drift = vec2(${glsl(DRIFT[0])}, ${glsl(DRIFT[1])}) * swing(uTime, ${glsl(DRIFT_SPRING[0])}, ${glsl(DRIFT_SPRING[1])});
  vec2 p = local - centre;
  p = vec2(cos(twist) * p.x - sin(twist) * p.y, sin(twist) * p.x + cos(twist) * p.y);
  return uSheet.xy + centre + p + drift;
}

vec4 toClip(vec2 screen) {
  vec2 clip = screen / uView * 2.0 - 1.0;
  return vec4(clip.x, -clip.y, 0.0, 1.0);
}
`;

const PAPER_VERTEX = /* glsl */ `#version 300 es
in vec2 aUv;
out vec2 vLocal;
out float vShade;
${MOTION}
void main() {
  vec2 local = aUv * vec2(uSheet.z, uMeshHeight);
  float z = lift(local);

  // Slope of the sheet, for the light.
  float e = 8.0;
  float dzdx = (lift(local + vec2(e, 0.0)) - lift(local - vec2(e, 0.0))) / (2.0 * e);
  float dzdy = (lift(local + vec2(0.0, e)) - lift(local - vec2(0.0, e))) / (2.0 * e);
  vec3 normal = normalize(vec3(-dzdx, -dzdy, 1.0));
  vec3 light = normalize(vec3(-0.45, -0.6, 0.66));
  vShade = clamp(1.0 + 0.6 * (dot(normal, light) - light.z), 0.9, 1.03);

  // Seen from above: what is higher is closer, so larger.
  vec2 desk = onDesk(local);
  vec2 centre = uView * 0.5;
  vec2 screen = centre + (desk - centre) * CAMERA_HEIGHT / (CAMERA_HEIGHT - z);

  vLocal = local;
  gl_Position = toClip(screen);
}
`;

/* Draws exactly what the real sheet looks like blank, so the swap is unseen. */
const PAPER_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
in vec2 vLocal;
in float vShade;
out vec4 outColor;
uniform vec4 uSheet;
uniform vec4 uFrame;
uniform float uTime;

const vec3 PAPER = vec3(251.0, 244.0, 233.0) / 255.0;
const vec3 INK = vec3(26.0) / 255.0;

float edgeDistance(vec2 p, vec2 size) {
  return min(min(p.x, p.y), min(size.x - p.x, size.y - p.y));
}

// Coverage of a 1px line at the start of every \`step\` px.
float ruled(float x, float step, float pixel) {
  float m = mod(x, step);
  return clamp((1.0 - m) / pixel + 0.5, 0.0, 1.0);
}

void main() {
  float pixel = max(fwidth(vLocal.x), fwidth(vLocal.y));
  vec3 color = PAPER;

  vec2 f = vLocal - uFrame.xy;
  float inFrame = edgeDistance(f, uFrame.zw);
  if (inFrame >= 1.5) {
    vec2 g = f - 1.5;
    color = mix(color, INK, 0.035 * ruled(g.x, 12.0, pixel));
    color = mix(color, INK, 0.035 * ruled(g.y, 12.0, pixel));
    color = mix(color, INK, 0.075 * ruled(g.x, 48.0, pixel));
    color = mix(color, INK, 0.075 * ruled(g.y, 48.0, pixel));
  }
  float frameLine = clamp(inFrame / pixel + 0.5, 0.0, 1.0)
    * clamp((1.5 - inFrame) / pixel + 0.5, 0.0, 1.0);
  color = mix(color, INK, frameLine);

  float outer = edgeDistance(vLocal, uSheet.zw);
  color = mix(color, INK, clamp((2.0 - outer) / pixel + 0.5, 0.0, 1.0));

  float alpha = clamp(uTime / 0.22, 0.0, 1.0);
  outColor = vec4(color * vShade, alpha);
}
`;

/* The shadow is the sheet flattened onto the desk, pushed away from the light. */
const SHADOW_VERTEX = /* glsl */ `#version 300 es
in vec2 aUv;
out vec2 vLocal;
out float vHeight;
${MOTION}
void main() {
  vec2 local = aUv * vec2(uSheet.z, uMeshHeight);
  float z = lift(local);
  vLocal = local;
  vHeight = z;
  gl_Position = toClip(onDesk(local) + vec2(0.34, 0.52) * z);
}
`;

/* Sharper and darker near the desk, wide and faint when the sheet is high. */
const SHADOW_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
in vec2 vLocal;
in float vHeight;
out vec4 outColor;
uniform vec4 uSheet;
uniform float uTime;

void main() {
  vec2 p = vLocal;
  float edge = min(min(p.x, p.y), min(uSheet.z - p.x, uSheet.w - p.y));
  float feather = 3.0 + vHeight * 0.9;
  float strength = 0.3 / (1.0 + vHeight / 70.0);
  float alpha = smoothstep(0.0, feather, edge) * strength;
  outColor = vec4(vec3(26.0) / 255.0, alpha * clamp(uTime / 0.22, 0.0, 1.0));
}
`;

/** Critically damped spring, 1 at rest-start down to 0. Mirrors the GLSL. */
function settle(time: number, rate: number) {
  const t = Math.max(time, 0);
  return Math.exp(-rate * t) * (1 + rate * t);
}

/** Under-damped spring, 1 down to 0 with overshoot. Mirrors the GLSL. */
function swing(time: number, rate: number, damping: number) {
  const t = Math.max(time, 0);
  const damped = rate * Math.sqrt(1 - damping * damping);
  return (
    Math.exp(-damping * rate * t) *
    (Math.cos(damped * t) + ((damping * rate) / damped) * Math.sin(damped * t))
  );
}

export interface SheetPose {
  /** Transform origin, relative to the sheet's corner. */
  origin: [number, number];
  translate: [number, number];
  scale: number;
  degrees: number;
}

/**
 * Where the sheet as a whole is at this frame, ignoring its bend: the same
 * twist, drift and closeness to the camera as the mesh, taken at its centre.
 * Lets the page drawn on the sheet ride along with it as a CSS transform.
 */
export function getSheetPose(frame: PaperFrame): SheetPose {
  const { time, view, sheet, meshHeight } = frame;
  const lag = MAX_LAG * 0.5;
  const ripple = Math.sin(0.5 * (5.2 + 3.4) - time * RIPPLE_SPEED);
  const lift =
    RELEASE_HEIGHT *
    settle(time - lag, FALL_RATE) *
    (1 + RIPPLE * ripple - SAG * 0.5);
  const scale = CAMERA_HEIGHT / (CAMERA_HEIGHT - lift);
  const origin: [number, number] = [sheet[2] / 2, meshHeight / 2];
  const drift = swing(time, ...DRIFT_SPRING);
  // Centre of the sheet on the desk, then pushed out from the screen centre.
  const deskX = sheet[0] + origin[0] + DRIFT[0] * drift;
  const deskY = sheet[1] + origin[1] + DRIFT[1] * drift;
  return {
    origin,
    translate: [
      view[0] / 2 + (deskX - view[0] / 2) * scale - (sheet[0] + origin[0]),
      view[1] / 2 + (deskY - view[1] / 2) * scale - (sheet[1] + origin[1]),
    ],
    scale,
    degrees: TWIST_DEGREES * swing(time, ...TWIST_SPRING),
  };
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (shader === null) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const vertexShader = compile(gl, gl.VERTEX_SHADER, vertex);
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (vertexShader === null || fragmentShader === null || program === null) {
    return null;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.bindAttribLocation(program, 0, "aUv");
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return null;
  }
  return program;
}

/** A flat grid of triangles, as UVs from 0 to 1. */
function getSheetMesh() {
  const uvs: number[] = [];
  const indices: number[] = [];
  const side = SEGMENTS + 1;
  for (let row = 0; row < side; row += 1) {
    for (let column = 0; column < side; column += 1) {
      uvs.push(column / SEGMENTS, row / SEGMENTS);
    }
  }
  for (let row = 0; row < SEGMENTS; row += 1) {
    for (let column = 0; column < SEGMENTS; column += 1) {
      const topLeft = row * side + column;
      const bottomLeft = topLeft + side;
      indices.push(topLeft, bottomLeft, topLeft + 1);
      indices.push(topLeft + 1, bottomLeft, bottomLeft + 1);
    }
  }
  return { uvs: new Float32Array(uvs), indices: new Uint16Array(indices) };
}

/**
 * Sets up the sheet and its shadow on a WebGL2 context. Returns a function
 * that draws one frame, or null when the context cannot run the shaders.
 */
export function createPaperRenderer(gl: WebGL2RenderingContext) {
  const paper = link(gl, PAPER_VERTEX, PAPER_FRAGMENT);
  const shadow = link(gl, SHADOW_VERTEX, SHADOW_FRAGMENT);
  if (paper === null || shadow === null) {
    return null;
  }
  const paperProgram: WebGLProgram = paper;
  const shadowProgram: WebGLProgram = shadow;

  const mesh = getSheetMesh();
  const vertexArray = gl.createVertexArray();
  gl.bindVertexArray(vertexArray);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, mesh.uvs, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  function drawLayer(program: WebGLProgram, frame: PaperFrame) {
    gl.useProgram(program);
    gl.uniform2f(gl.getUniformLocation(program, "uView"), ...frame.view);
    gl.uniform4f(gl.getUniformLocation(program, "uSheet"), ...frame.sheet);
    gl.uniform4f(gl.getUniformLocation(program, "uFrame"), ...frame.frame);
    gl.uniform1f(
      gl.getUniformLocation(program, "uMeshHeight"),
      frame.meshHeight,
    );
    gl.uniform1f(gl.getUniformLocation(program, "uTime"), frame.time);
    gl.drawElements(gl.TRIANGLES, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  return function draw(frame: PaperFrame) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);
    drawLayer(shadowProgram, frame);
    drawLayer(paperProgram, frame);
  };
}
