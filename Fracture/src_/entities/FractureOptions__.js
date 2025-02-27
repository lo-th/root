import { Vector2, Material, MeshBasicMaterial } from "three";

export class FractureOptions {
  /**
   * fragmentCount: Maximum number of times an object and its children are recursively fractured. Larger fragment counts will result in longer computation times.
   * fracturePlanes: Specify which planes to fracture in public  { x: boolean; y: boolean; z: boolean; };
   * fractureMode: . If set to convex, a faster algorithm will be used under
   * the assumption the the geometry being fractured is convex. If set to
   * non-convex, an algorithm which can handle non-convex geometry will be used
   * at the expensive of performance. "Convex" | "Non-Convex";
   * insideMaterial: The material to use for the inside faces
   * textureScale: Scale factor to apply to texture coordinates Vector2
   * textureOffset: Offset to apply to texture coordinates
   */

    constructor() {
        this.fragmentCount = 50;
        this.fracturePlanes = { x: true, y: true, z: true };
        this.fractureMode = "Convex";
        this.insideMaterial = new MeshBasicMaterial({ color: 0x0000ff });
        this.textureScale = new Vector2(1, 1);
        this.textureOffset = new Vector2();
    }
}