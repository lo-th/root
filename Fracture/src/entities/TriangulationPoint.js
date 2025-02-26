import { Vector2 } from "three";
import { IBinSortable, BinSort } from "../utils/BinSort.js";

/**
 * This data structure is used to represent a point during triangulation.
 */
export default class TriangulationPoint {
  /**
   * coords:2D coordinates of the point on the triangulation plane
   * bin:Bin used for sorting points in grid
   * index: Original index prior to sorting
   */

  /**
   * Instantiates a new triangulation point
   * @param index The index of the point in the original point list
   * @param coords The 2D coordinates of the point in the triangulation plane
   */
    constructor( index, coords ) {
        this.index = index;
        this.coords = coords;
        this.bin = 0;
        //this.bin = IBinSortable.bin;
    }

    toString() {
        return `${this.coords} -> ${this.bin}`;
    }

    /*sort( input, lastIndex, binCount ){
        return BinSort.sort( input, lastIndex, binCount )
    }

    getBinNumber( i, j, n ){
        return BinSort.getBinNumber( i, j, n )
    }*/

    /*static getBinNumber(i, j, n) {
        return i % 2 === 0 ? i * n + j : (i + 1) * n - j - 1;
    }

    static sort( input, lastIndex, binCount ) {

        if (binCount <= 1) return input; // Need at least two bins to sort

        if (lastIndex > input.length) {
            lastIndex = input.length; // If lastIndex is out of range, sort the entire array
        }

        const count = new Array(binCount).fill(0);
        const output = new Array(input.length);

        for (let i = 0; i < lastIndex; i++) {
            count[input[i].bin]++;
        }

        for (let i = 1; i < binCount; i++) {
            count[i] += count[i - 1];
        }

        for (let i = lastIndex - 1; i >= 0; i--) {
            const binIndex = input[i].bin;
            count[binIndex]--;
            output[count[binIndex]] = input[i];
        }

        // Copy over the rest of the unsorted points
        for (let i = lastIndex; i < output.length; i++) {
            output[i] = input[i];
        }

        return output;
    }*/
}
