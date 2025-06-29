const {
  OBJECT_COLORS,
  OBJECT_CHART_COLORS,
} = require("../constants/object-colors");
const { msToSeconds } = require("./time.utils");

exports.getTotalObjectTime = (experimentData, objectKey) => {
  if (!experimentData.length) return {};
  let currentObject = null;
  let startTime = 0;

  const objectTimes = {};
  for (const frame of experimentData) {
    const frameObject = frame[objectKey];
    const frameTime = msToSeconds(frame.millisecond);

    if (frameObject !== currentObject) {
      if (!!currentObject) {
        const elapsedTime = frameTime - startTime;
        if (elapsedTime > 0)
          objectTimes[currentObject] =
            (objectTimes[currentObject] || 0) + elapsedTime;
      }

      currentObject = frameObject;
      startTime = frameTime;
    }
  }

  return objectTimes;
};

exports.joinObjectTimes = (leftHandObjectTimes, rightHandObjectTimes) => {
  const combinedTimes = { ...leftHandObjectTimes };

  for (const [object, time] of Object.entries(rightHandObjectTimes)) {
    if (combinedTimes[object]) {
      combinedTimes[object] += time;
    } else {
      combinedTimes[object] = time;
    }
  }

  return combinedTimes;
};

exports.toChartSerie = (objectTimes) => {
  return Object.entries(objectTimes).reduce((acc, [item, time]) => {
    acc = [...acc, { x: item, y: time }];
    return acc;
  }, []);
};
