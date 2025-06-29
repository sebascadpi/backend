exports.getTotalObjectTime = (experimentData, objectKey) => {
  if (!experimentData.length) return {};
  let currentObject = null;
  let startTime = 0;

  const objectTimes = {};
  for (const frame of experimentData) {
    const frameObject = frame[objectKey];
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

exports.mapHandObjectTimeline = (experimentData, objectKey) => {
  if (!experimentData.length) return {};
  let currentObject = null;
  let startTime = 0;

  const objectTimes = {};
  for (const frame of experimentData) {
    const frameObject = frame[objectKey];
    const frameTime = frame.second;

    if (frameObject !== currentObject) {
      if (!!currentObject) {
        const elapsedTime = frameTime - startTime;
        if (elapsedTime > 0)
          objectTimes[currentObject] = [
            { x: objectKey, y: [startTime, frameTime] },
          ];
      }

      currentObject = frameObject;
      startTime = frameTime;
    }
  }

  return objectTimes;
};

exports.mapSuccessesAndErrors = (experimentData, key) => {
  if (!experimentData.length) return [];

  const propertyData = experimentData.map((frame) => ({
    x: frame.second,
    y: frame[key] || 0,
  }));

  return { name: key, data: propertyData };
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

exports.joinObjectTimelines = (leftHandObjectTimes, rightHandObjectTimes) => {
  const combinedTimes = { ...leftHandObjectTimes };

  for (const [object, data] of Object.entries(rightHandObjectTimes)) {
    if (combinedTimes[object]) {
      combinedTimes[object] = [...combinedTimes[object], ...data];
    } else {
      combinedTimes[object] = data;
    }
  }

  return combinedTimes;
};

exports.toHistogramSerie = (objectTimes) => {
  return Object.entries(objectTimes).reduce((acc, [item, time]) => {
    acc = [...acc, { x: item, y: time }];
    return acc;
  }, []);
};
