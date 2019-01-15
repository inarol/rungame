import * as THREE from 'three';

/** 为自定义图形添加uv坐标 */
THREE.ShapeGeometry.prototype.assignUVs = function () {
  this.computeBoundingBox();
  const max = this.boundingBox.max;
  const min = this.boundingBox.min;
  const offset = new THREE.Vector2(0 - min.x, 0 - min.y);
  const range = new THREE.Vector2(max.x - min.x, max.y - min.y);
  const faces = this.faces;
  this.faceVertexUvs[0] = [];
  for (let i = 0; i < faces.length; i += 1) {
    const v1 = this.vertices[faces[i].a];
    const v2 = this.vertices[faces[i].b];
    const v3 = this.vertices[faces[i].c];
    this.faceVertexUvs[0].push([
      new THREE.Vector2((v1.x + offset.x) / range.x, (v1.y + offset.y) / range.y),
      new THREE.Vector2((v2.x + offset.x) / range.x, (v2.y + offset.y) / range.y),
      new THREE.Vector2((v3.x + offset.x) / range.x, (v3.y + offset.y) / range.y),
    ]);
  }
  this.uvsNeedUpdate = true;
};
