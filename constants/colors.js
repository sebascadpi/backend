const fromHexNumberToString = (color) => {
  return `#${color.toString(16).padStart(6, "0")}`;
};

const OBJECT_COLORS = {
  orange: 0xff8c00,
  tomato_soup_can: 0xdc143c,
  master_chef_can: 0xb8860b,
  bleach_cleanser: 0x87ceeb,
  banana: 0xffd700,
  lego_duplo: 0xff4500,
  tuna_fish_can: 0x4682b4,
  gelatin_box: 0xff69b4,
  cracker_box: 0xdeb887,
};

const OBJECT_CHART_COLORS = Object.fromEntries(
  Object.entries(OBJECT_COLORS).map(([key, value]) => [
    key,
    fromHexNumberToString(value),
  ])
);

const SUCCESS_ERROR_COLORS = {
  objectPut: "#00ff00",
  totalErrors: "#ff0000",
};

const DEFAULT_COLOR = 0xcccccc;
const DEFAULT_CHART_COLOR = fromHexNumberToString(DEFAULT_COLOR);

module.exports = {
  OBJECT_COLORS,
  DEFAULT_COLOR,
  OBJECT_CHART_COLORS,
  DEFAULT_CHART_COLOR,
  SUCCESS_ERROR_COLORS,
};
