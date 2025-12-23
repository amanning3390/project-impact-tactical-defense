import {
  validateCoordinates,
  getCurrentUTCHour,
  getCurrentDay,
  getGamePhase,
  calculateBurnRate,
  calculateMatch,
  assignToBattery,
} from "@/lib/gameLogic";

describe("Game Logic", () => {
  test("validateCoordinates should accept valid coordinates", () => {
    expect(validateCoordinates(0, 0, 0)).toBe(true);
    expect(validateCoordinates(10, 10, 10)).toBe(true);
    expect(validateCoordinates(5, 5, 5)).toBe(true);
  });

  test("validateCoordinates should reject invalid coordinates", () => {
    expect(validateCoordinates(-1, 5, 5)).toBe(false);
    expect(validateCoordinates(11, 5, 5)).toBe(false);
    expect(validateCoordinates(5, -1, 5)).toBe(false);
    expect(validateCoordinates(5, 11, 5)).toBe(false);
  });

  test("calculateBurnRate should return correct rates", () => {
    expect(calculateBurnRate(500)).toBe(5);
    expect(calculateBurnRate(2000)).toBe(3);
    expect(calculateBurnRate(10000)).toBe(1.5);
    expect(calculateBurnRate(25000)).toBe(0.5);
  });

  test("calculateMatch should count correct matches", () => {
    expect(
      calculateMatch({ x: 5, y: 5, z: 5 }, { x: 5, y: 5, z: 5 })
    ).toBe(3);
    expect(
      calculateMatch({ x: 5, y: 5, z: 5 }, { x: 5, y: 5, z: 4 })
    ).toBe(2);
    expect(
      calculateMatch({ x: 5, y: 5, z: 5 }, { x: 5, y: 4, z: 4 })
    ).toBe(1);
    expect(
      calculateMatch({ x: 5, y: 5, z: 5 }, { x: 4, y: 4, z: 4 })
    ).toBe(0);
  });

  test("assignToBattery should assign correctly", () => {
    expect(assignToBattery(0)).toBe(0);
    expect(assignToBattery(9)).toBe(0);
    expect(assignToBattery(10)).toBe(1);
    expect(assignToBattery(19)).toBe(1);
  });
});


