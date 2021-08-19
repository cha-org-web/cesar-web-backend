const fs = require("fs");

const filePath = `./package.json`;

try {
  if (fs.existsSync(filePath)) {
    let rawFile = fs.readFileSync(filePath);
    let packageJSON = JSON.parse(rawFile);

    packageJSON.strapi.uuid = "HEROKU-ONE-CLICK-" + "113141412412asfaa4131231sadfafsa";

    let data = JSON.stringify(packageJSON);
    fs.writeFileSync(filePath, data);
  }
} catch (e) {
  console.error(e);
}
