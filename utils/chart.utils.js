exports.getTotalObjectTime = (experimentData, handKey) => {
  if (!experimentData.length) return {};
  let currentObject = null;
  let startTime = 0;

  const objectTimes = {};
  for (const frame of experimentData) {
    const frameObject = frame[handKey];
    const frameTime = frame.second;

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

exports.mapHandObjectTimeline = (experimentData, handKey) => {
  if (!experimentData.length) return {};
  let currentObject = null;
  let startTime = 0;

  const objectTimes = {};
  for (const frame of experimentData) {
    const frameObject = frame[handKey];
    const frameTime = frame.second;

    if (frameObject !== currentObject) {
      if (!!currentObject) {
        const elapsedTime = frameTime - startTime;
        if (elapsedTime > 0)
          objectTimes[currentObject] = [
            { x: handKey, y: [startTime, frameTime] },
          ];
      }

      currentObject = frameObject;
      startTime = frameTime;
    }
  }

  return objectTimes;
};

exports.mapSuccessesAndErrors = (experimentData, successOrErrorKey) => {
  if (!experimentData.length) return [];

  const propertyData = experimentData.map((frame) => ({
    x: frame.second,
    y: frame[successOrErrorKey] || 0,
  }));

  return { name: successOrErrorKey, data: propertyData };
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

exports.joinObjectTimelines = (
  leftHandObjectTimelines,
  rightHandObjectTimelines
) => {
  const combinedHandTimelines = { ...leftHandObjectTimelines };

  for (const [object, data] of Object.entries(rightHandObjectTimelines)) {
    if (combinedHandTimelines[object]) {
      combinedHandTimelines[object] = [
        ...combinedHandTimelines[object],
        ...data,
      ];
    } else {
      combinedHandTimelines[object] = data;
    }
  }

  return combinedHandTimelines;
};

exports.toHistogramSerie = (objectTimes) => {
  return Object.entries(objectTimes).reduce((acc, [item, time]) => {
    acc = [...acc, { x: item, y: time }];
    return acc;
  }, []);
};
