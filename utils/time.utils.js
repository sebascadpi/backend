exports.timeToMS = (timeString) => {
  const [minutes, seconds, milliseconds] = timeString.split(":").map(Number);
  if (isNaN(minutes) || isNaN(seconds) || isNaN(milliseconds)) {
    throw new Error("Invalid time format");
  }
  return minutes * 60 * 1000 + seconds * 1000 + milliseconds;
};
