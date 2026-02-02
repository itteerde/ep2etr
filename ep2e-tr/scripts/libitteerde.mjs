export { LibItteerde }

class LibItteerde {

    /**
     * 
     * @param {*} min minimum possible
     * @param {*} max maximum possible
     * @returns a random integer from min to max both inclusive using Math.random()
     */
    static randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static isCritical(roll) {
        if (roll % 10 == Math.floor(roll / 10)) {
            return true;
        }
        return false;
    }

    /**
     * Compute distance between a and b.
     * 
     * @param {*} a "source" for this macro
     * @param {*} b "affected" for this macro
     * @returns the distance between a and b.
     */
    static distance(a = { x: 0, y: 0, z: 0 }, b = { x: 0, y: 0, z: 0 }) {
        return (
            (a.x - b.x) ** 2 +
            (a.y - b.y) ** 2 +
            (a.z - b.z) ** 2
        ) ** 0.5;
    }
}
