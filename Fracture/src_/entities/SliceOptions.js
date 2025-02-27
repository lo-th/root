import { Material, Vector2 } from "three";

export class SliceOptions {
    /**
    * enableReslicing:Enables reslicing of fragments.
    * maxResliceCount:Maximum number of times a fragment can be re-sliced.
    * detectFloatingFragments:Enables detection of "floating" fragments when slicing non-convex meshes. This setting has no effect for convex meshes and should be disabled.
    * insideMaterial:The material to use for the inside faces.
    * textureScale:Scale factor to apply to texture coordinates.
    * textureOffset:Offset to apply to texture coordinates.
    * invokeCallbacks:Enable if re-slicing should also invoke the callback functions.
    */

    constructor() {
        this.enableReslicing = false;
        this.maxResliceCount = 1;
        this.detectFloatingFragments = false;
        this.insideMaterial = undefined;
        this.textureScale = new Vector2(1, 1);
        this.textureOffset = new Vector2();
        this.invokeCallbacks = false;
    }
}
