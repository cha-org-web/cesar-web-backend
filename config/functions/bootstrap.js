"use strict";

const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const {
  areas,
  paginas,
  sucesos,
  articles,
} = require("../../data/data.json");

async function isFirstRun() {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: "type",
    name: "setup",
  });
  const initHasRun = await pluginStore.get({ key: "initHasRun" });
  await pluginStore.set({ key: "initHasRun", value: true });
  return !initHasRun;
}

async function setPublicPermissions(newPermissions) {
  // Find the ID of the public role
  const publicRole = await strapi
    .query("role", "users-permissions")
    .findOne({ type: "public" });

  // List all available permissions
  const publicPermissions = await strapi
    .query("permission", "users-permissions")
    .find({
      type: ["users-permissions", "application"],
      role: publicRole.id,
    });

  // Update permission to match new config
  const controllersToUpdate = Object.keys(newPermissions);
  const updatePromises = publicPermissions
    .filter((permission) => {
      // Only update permissions included in newConfig
      if (!controllersToUpdate.includes(permission.controller)) {
        return false;
      }
      if (!newPermissions[permission.controller].includes(permission.action)) {
        return false;
      }
      return true;
    })
    .map((permission) => {
      // Enable the selected permissions
      return strapi
        .query("permission", "users-permissions")
        .update({ id: permission.id }, { enabled: true });
    });
  await Promise.all(updatePromises);
}

function getFileSizeInBytes(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats["size"];
  return fileSizeInBytes;
}

function getFileData(fileName) {
  const filePath = `./data/uploads/${fileName}`;

  // Parse the file metadata
  const size = getFileSizeInBytes(filePath);
  const ext = fileName.split(".").pop();
  const mimeType = mime.lookup(ext);

  return {
    path: filePath,
    name: fileName,
    size,
    type: mimeType,
  };
}

// Create an entry and attach files if there are any
async function createEntry({ model, entry, files }) {
  try {
    const createdEntry = await strapi.query(model).create(entry);
    if (files) {
      await strapi.entityService.uploadFiles(createdEntry, files, {
        model,
      });
    }
  } catch (e) {
    console.log("model", entry, e);
  }
}

async function importArticles() {
  return Promise.all(
    articles.map((article) => {
      return createEntry({ model: "article", entry: article });
    })
  );
}
async function importAreas() {
  return Promise.all(
    areas.map((area) => {
      const files = {
        logo: getFileData(`area-${area.slug}.png`),
      };
      return createEntry({ model: "area", entry: area, files });
    })
  );
}
async function importpaginas() {
  return Promise.all(
    paginas.map((pagina) => {
      return createEntry({ model: "pagina", entry: pagina });
    })
  );
}
async function importSucesos() {
  return Promise.all(
    sucesos.map((suceso) => {
      return createEntry({ model: "suceso", entry: suceso });
    })
  );
}

async function importSeedData() {
  // Allow read of application content types
  await setPublicPermissions({
    global: ["find"],
    navegacion: ["find"],
    destacadas: ["find"],
    article: ["find", "findone"],
    area: ["find", "findone"],
    pagina: ["find", "findone"],
    suceso: ["find", "findone"],
  });

  // Create all entries
  await importArticles();
  await importAreas();
  await importpaginas();
  await importSucesos();
  await importGlobal();
}

module.exports = async () => {
  const shouldImportSeedData = await isFirstRun();

  if (shouldImportSeedData) {
    try {
      console.log("Setting up your starter...");
      await importSeedData();
      console.log("Ready to go");
    } catch (error) {
      console.log("Could not import seed data");
      console.error(error);
    }
  }
};
