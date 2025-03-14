const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllUsers() {
  const allUsers = await prisma.user.findMany();
  return allUsers;
}

async function getUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  return user;
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });

  return user;
}
async function createUser(user) {
  const createdUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
      rootFolderPath: user.rootFolderPath,
    },
  });
  return createdUser;
}

async function deleteAllUsers() {
  await prisma.user.deleteMany();
}

async function deleteUserById(id) {
  await prisma.user.delete({
    where: {
      id: id,
    },
  });
}

async function createFolderInDb(folder) {
  const createdFolder = await prisma.folder.create({
    data: {
      name: folder.name,
      path: folder.path,
      userId: folder.userId,
    },
  });
  return createdFolder;
}

async function createFileInDb(file) {
  const createdFile = await prisma.file.create({
    data: {
      name: file.name,
      path: file.path,
      folderId: file.folderId,
    },
  });
  return createdFile;
}

async function deleteFolderInDbById(id) {
  await prisma.folder.delete({
    where: {
      id: id,
    },
  });
}

async function deleteAllFoldersInDb() {
  await prisma.folder.deleteMany();
}
async function getFoldersByUserId(id) {
  const folders = await prisma.folder.findMany({
    where: {
      userId: id,
    },
  });
  return folders;
}
module.exports = {
  getAllUsers,
  getUserByEmail,
  deleteAllUsers,
  deleteUserById,
  createUser,
  getUserById,
  createFolderInDb,
  createFileInDb,
  getFoldersByUserId,
  deleteFolderInDbById,
  deleteAllFoldersInDb,
};
