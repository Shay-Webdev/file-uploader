const fs = require('fs').promises;
const db = require('../models/queries');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', 'folders');

async function deleteAllFolders() {
  const folders = await fs.readdir(BASE_DIR);
  for (const folder of folders) {
    await fs.rmdir(path.join(BASE_DIR, folder), { recursive: true });
  }
  return res.status(200).json({ message: 'All folders deleted successfully' });
}

async function deleteFolderByName(name) {
  const folders = await fs.readdir(BASE_DIR);
  const id = folders.find((folder) => folder === name);
  if (id) {
    await fs.rmdir(path.join(BASE_DIR, id), { recursive: true });
  } else {
    return console.log('folder not found');
  }
}

async function createFolder(name) {
  const folderPath = path.join(BASE_DIR, name);
  await fs.mkdir(folderPath);
  return folderPath;
}
module.exports = { deleteAllFolders, deleteFolderByName, createFolder };
