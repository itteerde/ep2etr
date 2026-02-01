import { LibItteerde } from "../ep2e-tr/scripts/libitteerde.mjs";

let success = 0;

for (let n = 0; n <= 99; n += 11) {
    if (!LibItteerde.isCritical(n)) {
        throw new Error(`${n} should be critical.`);
    } else {
        success++;
    }
}

for (let n = 0; n <= 99; n++) {
    if (n == 0) continue;
    if (n == 11) continue;
    if (n == 22) continue;
    if (n == 33) continue;
    if (n == 44) continue;
    if (n == 55) continue;
    if (n == 66) continue;
    if (n == 77) continue;
    if (n == 88) continue;
    if (n == 99) continue;

    if (LibItteerde.isCritical(n)) {
        throw new Error(`${n} should not be critical.`);
    } else {
        success++;
    }
}

let pointA = { position: { x: 100, y: 100 }, document: { elevation: 0 } };
let pointB = { position: { x: 103, y: 104 }, document: { elevation: 0 } };
if (!LibItteerde.distance(pointA, pointB) === 5) {
    throw new Error(`distance should have been 5, was ${LibItteerde.distance(pointA, pointB)}`);
} else {
    success++;
}

console.log(`${success} successful tests.`);