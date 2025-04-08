exports.parseXYZ = (coordString) => {
  const coords = {};
  coordString.split(" ").forEach((part) => {
    const [key, value] = part.split("=");
    coords[key.toLowerCase()] = parseFloat(value);
  });
  return coords;
};

exports.parsePYR = (rotString) => {
  const rotations = {
    pitch: 0,
    yaw: 0,
    roll: 0,
  };

  rotString.split(" ").forEach((part) => {
    const [key, value] = part.split("=");
    switch (key) {
      case "P":
        rotations.pitch = parseFloat(value);
        break;
      case "Y":
        rotations.yaw = parseFloat(value);
        break;
      case "R":
        rotations.roll = parseFloat(value);
        break;
    }
  });

  return rotations;
};
