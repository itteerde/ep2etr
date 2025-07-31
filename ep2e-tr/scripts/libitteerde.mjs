export { LibItteerde }

class LibItteerde {

    /**
     * 
     * @param {*} min minimum possible
     * @param {*} max maximum possible
     * @returns a random integer from min to max both inclusive using Math.random()
     */
    static getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
