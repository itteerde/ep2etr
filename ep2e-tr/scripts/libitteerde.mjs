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
     * @param {*} zA elevation of "source". Note that MeasuredTemplate has an elevation.
     * @returns the distance between a and b.
     */
    static distance(a, b, zA) {
        return (
            (a.position.x - b.position.x) ** 2 +
            (a.position.y - b.position.y) ** 2 +
            ((!zA ? 0 : a.document.elevation) - b.document.elevation) ** 2
        ) ** 0.5;
    }
}
