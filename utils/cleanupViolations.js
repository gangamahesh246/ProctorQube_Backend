const fs = require("fs");
const path = require("path");

const violationsDir = path.join(__dirname, "../uploads/violations");
const THREE_DAYS_IN_MS = 3 * 24 * 60 * 60 * 1000;

const deleteOldViolationImages = () => {
  fs.readdir(violationsDir, (err, files) => {
    if (err) return console.error("Error reading violations dir:", err);

    files.forEach((file) => {
      const filePath = path.join(violationsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return console.error("Error reading file stats:", err);

        const now = Date.now();
        const fileCreatedTime = new Date(stats.birthtime).getTime();

        if (now - fileCreatedTime > THREE_DAYS_IN_MS) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Failed to delete file:", file);
            } else {
              console.log("Deleted old violation image:", file);
            }
          });
        }
      });
    });
  });
};

module.exports = deleteOldViolationImages;
