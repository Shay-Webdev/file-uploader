# file-uploader`

# instructions to setup project

npm init -y

# setup express and other dependencies

npm i \
express
ejs
passport
passport-local
express-validator
express-session
pg
bcryptjs
dotenv
connect-flash
connect-pg-simple

# setup prisma

npm i prisma -D

# prisma cli

npx prisma

# creates prisma & .env

npx prisma init -- setup prisma schema in prisma.schema file
-set ENVIRONMENT VARIABLES in .env file

# migrate prisma schema to db schema

npx prisma migrate dev --name init \*\* use whenever prisma schema changes to keep db in sync

# install prisma client

npm i @prisma/client -- optional-auto installed while migrating

# install prisma-session-store for using session along with express-session

npm install @quixo3/prisma-session-store express-session(install express-session if not already installed)

# add session model to prisma schema

model Session {
id String @id
sid String @unique
data String @db.VarChar(255)
expiresAt DateTime
}

# instal multer for file upload

npm i --save multer

# cloudinary for file upload

npm i cloudinary
