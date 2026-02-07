/**
 * vec.ts
 * 3D/2D vector helper functions ported from play.core
 */

export interface Vec2 {
  x: number;
  y: number;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

// Helper to create a Vec3
export function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

// Helper to create a Vec2
export function vec2(x: number, y: number): Vec2 {
  return { x, y };
}

// Copies a vector (Vec3)
export function copy(a: Vec3, out?: Vec3): Vec3 {
  out = out || vec3(0, 0, 0);
  out.x = a.x;
  out.y = a.y;
  out.z = a.z;
  return out;
}

export function add(a: Vec3, b: Vec3, out?: Vec3): Vec3 {
  out = out || vec3(0, 0, 0);
  out.x = a.x + b.x;
  out.y = a.y + b.y;
  out.z = a.z + b.z;
  return out;
}

export function sub(a: Vec3, b: Vec3, out?: Vec3): Vec3 {
  out = out || vec3(0, 0, 0);
  out.x = a.x - b.x;
  out.y = a.y - b.y;
  out.z = a.z - b.z;
  return out;
}

// Multiplies a vector by a scalar
export function mulN(a: Vec2, k: number, out?: Vec2): Vec2 {
  out = out || vec2(0, 0);
  out.x = a.x * k;
  out.y = a.y * k;
  return out;
}

// Rotates a vector around the x axis
export function rotX(v: Vec3, ang: number, out?: Vec3): Vec3 {
  out = out || vec3(0, 0, 0);
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  out.x = v.x;
  out.y = v.y * c - v.z * s;
  out.z = v.y * s + v.z * c;
  return out;
}

// Rotates a vector around the y axis
export function rotY(v: Vec3, ang: number, out?: Vec3): Vec3 {
  out = out || vec3(0, 0, 0);
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  out.x = v.x * c + v.z * s;
  out.y = v.y;
  out.z = -v.x * s + v.z * c;
  return out;
}

// Rotates a vector around the z axis
export function rotZ(v: Vec3, ang: number, out?: Vec3): Vec3 {
  out = out || vec3(0, 0, 0);
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  out.x = v.x * c - v.y * s;
  out.y = v.x * s + v.y * c;
  out.z = v.z;
  return out;
}

// Dot product for Vec2 (used in sdf)
export function dot2(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

// Subtracts two vectors (Vec2)
export function sub2(a: Vec2, b: Vec2, out?: Vec2): Vec2 {
  out = out || vec2(0, 0);
  out.x = a.x - b.x;
  out.y = a.y - b.y;
  return out;
}

// Length of Vec2
export function length2(a: Vec2): number {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}
