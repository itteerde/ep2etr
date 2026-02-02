import { LibEp2e } from "../ep2e-tr/scripts/LibEp2e.mjs";

let success = 0;

for (let n = 0; n <= 99; n += 11) {
    if (!LibEp2e.isCritical(n)) {
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

    if (LibEp2e.isCritical(n)) {
        throw new Error(`${n} should not be critical.`);
    } else {
        success++;
    }
}

let pointA = { x: 100, y: 100, z: 100 };
let pointB = { x: 103, y: 104, z: 100 };
let pointC = { x: 103, y: 104, z: 112 };
if (!LibEp2e.distance(pointA, pointB) === 5) {
    throw new Error(`distance should have been 5, was ${LibEp2e.distance(pointA, pointB)}`);
} else {
    success++;
}
if (!LibEp2e.distance(pointA, pointC) === 13) {
    throw new Error(`distance should have been 13, was ${LibEp2e.distance(pointA, pointC)}`);
} else {
    success++;
}
if (!LibEp2e.distance() === 0) {
    throw new Error(`distance should have been 0, was ${LibEp2e.distance()}`);
} else {
    success++;
}


if (LibEp2e.classifyOpposed(50, 60, 49, 60) === 1) {
    success++;
} else {
    throw new Error(`should have been a success: `, [50, 60, 49, 60]);
}
if (LibEp2e.classifyOpposed(0, 0, 49, 60) === 1) {
    success++;
} else {
    throw new Error(`should have been a success: `, [0, 0, 49, 60]);
}
if (LibEp2e.classifyOpposed(11, 0, 49, 60) === 0) {
    success++;
} else {
    throw new Error(`should have been a failure: `, [11, 0, 49, 60]);
}
if (LibEp2e.classifyOpposed(0, 60, 11, 60) === 0) {
    success++;
} else {
    throw new Error(`should have been a failure: `, [0, 60, 11, 60]);
}

console.log(`${success} successful tests.`);