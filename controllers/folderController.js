const fs = require('fs').promises;
const db = require('../models/queries');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const validation = require('../validation&Authentication/validation');

const prisma = new PrismaClient();
const BASE_DIR = path.join(__dirname, '..', 'folders');

// Ensure BASE_DIR exists
async function ensureBaseDir() {
  await fs.mkdir(BASE_DIR, { recursive: true });
}
ensureBaseDir().catch((err) => console.error('Error creating BASE_DIR:', err));

// Delete all folders (for admin use, returns JSON)
async function deleteAllFolders(req, res) {
  try {
    const folders = await fs.readdir(BASE_DIR);
    await Promise.all(
      folders.map((folder) =>
        fs.rm(path.join(BASE_DIR, folder), { recursive: true, force: true })
      )
    );
    await prisma.folder.deleteMany({});
    return res
      .status(200)
      .json({ message: 'All folders deleted successfully' });
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Failed to delete folders', details: err.message });
  }
}

// Delete folder by name (for API use, returns JSON)
async function deleteFolderByName(req, res) {
  try {
    const { name } = req.params;
    const folderPath = path.join(BASE_DIR, name);
    const exists = await fs
      .access(folderPath)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    await fs.rm(folderPath, { recursive: true, force: true });
    await prisma.folder.deleteMany({ where: { name } });
    return res.status(200).json({ message: `Folder '${name}' deleted` });
  } catch (err) {
    return res
      .status(500)
      .json({ error: 'Failed to delete folder', details: err.message });
  }
}

// Create user root folder (utility function)
async function createUserRootFolder(name) {
  try {
    const folderPath = path.join(BASE_DIR, name);
    await fs.mkdir(folderPath, { recursive: true });
    return folderPath;
  } catch (err) {
    throw new Error(`Failed to create root folder: ${err.message}`);
  }
}

// Get folder list page
async function getFolderPage(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .render('folders', { title: 'Folders', user: null });
    }
    const folders = await db.getFoldersByUserId(req.user.id); // Or prisma.folder.findMany
    res.render('folders', {
      title: 'Your Folders',
      user: req.user,
      folders,
    });
  } catch (err) {
    res.status(500).render('folders', {
      title: 'Folders',
      user: req.user,
      error: [{ msg: `Server error: ${err.message}` }],
    });
  }
}

// Get create folder page
async function getCreateFolderByUser(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .render('folders', { title: 'Folders', user: null });
    }
    res.render('folders', {
      title: 'Create Folder',
      user: req.user,
      path: 'create',
    });
  } catch (err) {
    res.status(500).render('folders', {
      title: 'Create Folder',
      user: req.user,
      error: [{ msg: 'Server error' }],
    });
  }
}

// Create folder
const createFolderByUser = [
  validation.createFolderValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('folders', {
          title: 'Create Folder',
          user: req.user,
          path: 'create',
          error: errors.array(),
        });
      }

      if (!req.user) {
        return res
          .status(401)
          .render('folders', { title: 'Folders', user: null });
      }

      const folderName = req.body.folder_name;
      const rootFolderPath = path.join(BASE_DIR, req.user.email.split('@')[0]);
      const folderPath = path.join(rootFolderPath, folderName);

      await prisma.$transaction(async (prisma) => {
        await fs.mkdir(folderPath, { recursive: true });
        const folder = {
          name: folderName,
          path: folderPath,
          userId: req.user.id,
        };
        await db.createFolderInDb(folder);
      });

      return res.redirect('/folders');
    } catch (err) {
      return res.status(500).render('folders', {
        title: 'Create Folder',
        user: req.user,
        path: 'create',
        error: [{ msg: `Failed to create folder: ${err.message}` }],
      });
    }
  },
];

// Get delete folder page
async function getDeleteFolderById(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .render('folders', { title: 'Folders', user: null });
    }
    const id = Number(req.params.id);
    const folder = await db.getFoldersByUserId(id);

    if (!folder || folder.userId !== req.user.id) {
      return res.status(404).render('folders', {
        title: 'Folders',
        user: req.user,
        error: [{ msg: 'Folder not found or not authorized' }],
      });
    }

    res.render('folders', {
      title: 'Delete Folder',
      user: req.user,
      path: 'delete',
      folder,
    });
  } catch (err) {
    res.status(500).render('folders', {
      title: 'Folders',
      user: req.user,
      error: [{ msg: `Server error: ${err.message}` }],
    });
  }
}

// Delete folder by ID
async function deleteFolderById(req, res) {
  try {
    const id = Number(req.params.id);
    const folder = await db.getFolderByIdInDb(id);

    if (!folder || folder.userId !== req.user.id) {
      return res.status(404).render('folders', {
        title: 'Folders',
        user: req.user,
        error: [{ msg: 'Folder not found or not authorized' }],
      });
    }

    await prisma.$transaction(async (prisma) => {
      await fs.rm(folder.path, { recursive: true, force: true });
      await prisma.folder.delete({ where: { id } });
    });

    return res.redirect('/folders');
  } catch (err) {
    return res.status(500).render('folders', {
      title: 'Folders',
      user: req.user,
      error: [{ msg: `Failed to delete folder: ${err.message}` }],
    });
  }
}

// Get rename folder page
async function getRenameFolder(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .render('folders', { title: 'Folders', user: null });
    }
    const id = Number(req.params.id);
    const folder = await db.getFolderByIdInDb(id);

    if (!folder || folder.userId !== req.user.id) {
      return res.status(404).render('folders', {
        title: 'Folders',
        user: req.user,
        error: [{ msg: 'Folder not found or not authorized' }],
      });
    }

    res.render('folders', {
      title: 'Rename Folder',
      user: req.user,
      path: 'rename',
      folder,
    });
  } catch (err) {
    res.status(500).render('folders', {
      title: 'Folders',
      user: req.user,
      error: [{ msg: `Server error: ${err.message}` }],
    });
  }
}

// Rename folder
const renameFolder = [
  validation.createFolderValidation, // Reuse validation for folder name
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render('folders', {
          title: 'Rename Folder',
          user: req.user,
          path: 'rename',
          folder: { id: req.params.id },
          error: errors.array(),
        });
      }

      if (!req.user) {
        return res
          .status(401)
          .render('folders', { title: 'Folders', user: null });
      }

      const id = Number(req.params.id);
      const newName = req.body.folder_name;
      const folder = await db.getFolderByIdInDb(id);

      if (!folder || folder.userId !== req.user.id) {
        return res.status(404).render('folders', {
          title: 'Folders',
          user: req.user,
          error: [{ msg: 'Folder not found or not authorized' }],
        });
      }

      const newPath = path.join(
        BASE_DIR,
        req.user.email.split('@')[0],
        newName
      );

      await prisma.$transaction(async (prisma) => {
        await fs.rename(folder.path, newPath);
        await prisma.folder.update({
          where: { id },
          data: { name: newName, path: newPath },
        });
      });

      return res.redirect('/folders');
    } catch (err) {
      return res.status(500).render('folders', {
        title: 'Rename Folder',
        user: req.user,
        path: 'rename',
        folder: { id: req.params.id },
        error: [{ msg: `Failed to rename folder: ${err.message}` }],
      });
    }
  },
];

module.exports = {
  deleteAllFolders,
  deleteFolderByName,
  createUserRootFolder,
  getFolderPage,
  getCreateFolderByUser,
  createFolderByUser,
  getDeleteFolderById: getDeleteFolderById, // Renamed for clarity
  deleteFolderById,
  getRenameFolder,
  renameFolder,
};
