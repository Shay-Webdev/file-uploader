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
module.exports = {
  getAllUsers,
  getUserByEmail,
  deleteAllUsers,
  deleteUserById,
  createUser,
  getUserById,
};
