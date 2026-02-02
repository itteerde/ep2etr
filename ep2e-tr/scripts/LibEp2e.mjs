export { LibEp2e }

class LibEp2e {

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
     * Classifies the roll as success or failure.
     * 
     * @param {*} roll 
     * @param {*} target 
     * @returns 1 if successful, otherwise 0. Numerical for counting.
     */
    static classifyUnOpposed(roll, target) {
        if (roll <= target) {
            return 1;
        }

        return 0;
    }

    /**
     * We need this for criticals.
     * 
     * @param {*} ourRoll 
     * @param {*} ourSkill 
     * @param {*} theirRoll 
     * @param {*} theirSkill 
     * @returns 1 if successful, otherwise 0. Numerical for counting.
     */
    static classifyOpposed(ourRoll, ourSkill, theirRoll, theirSkill) {

        if (ourRoll > ourSkill) { // We fail. Should we look at theirs, if they fail worse, for example critcally?
            return 0;
        }

        if (theirRoll > theirSkill) { // They fail. Should we look at theirs, if they fail worse, for example critcally?
            return 1;
        }

        if (LibEp2e.isCritical(ourRoll) && !LibEp2e.isCritical(theirRoll)) {
            return 1;
        }

        if (!LibEp2e.isCritical(ourRoll) && LibEp2e.isCritical(theirRoll)) {
            return 0;
        }

        // both critical success
        if (LibEp2e.isCritical(ourRoll) && LibEp2e.isCritical(theirRoll)) {
            if (ourRoll > theirRoll) {
                return 1;
            } else {
                return 0;
            }
        }

        if (ourRoll > theirRoll) { // no criticals, both succeed
            return 1;
        } else {
            return 0;
        }
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

    static trimToLength(string, max, options = { dots: false, dots_character: '.', dots_length: 3 }) {

        options = Object.assign({ dots: false, dots_character: '.', dots_length: 3 }, options);

        if (!options.dots) {
            return string.substring(0, max);
        } else {
            string = string.substring(0, max - options.dots_length);
            string = string.padEnd(max, options.dots_character);
            return string;
        }
    }
}
