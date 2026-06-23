import { CommandHandler } from "../types/handler";
import { setUser } from "../config";
import {
  getUserByName,
  createUser,
  deleteUsers,
  getAllUsers,
} from "../lib/db/queries/users";
import { readConfig } from "../config";

export const handlerLogin: CommandHandler = async (cmdName, ...args) => {
  if (args.length === 0) {
    throw new Error("Username is required for login command");
  }
  const username = args[0];

  const existingUser = await getUserByName(username);
  if (existingUser.length === 0) {
    throw new Error(`Username "${username}" does not exist.`);
  }

  setUser(username);
  console.log(`User has been set to ${username}.`);
};

export const handlerRegister: CommandHandler = async (cmdName, ...args) => {
  if (args.length === 0) {
    throw new Error("Username is required for register command");
  }
  const username = args[0];

  // check if username already exists
  const existingUser = await getUserByName(username);
  if (existingUser.length > 0) {
    throw new Error(`Username "${username}" is already taken.`);
  }

  // create new user
  const newUser = await createUser(username);
  console.log(newUser);

  setUser(newUser.name);
  console.log(`User "${newUser.name}" has been registered successfully.`);
};

export const handlerUsers: CommandHandler = async (cmdName, ...args) => {
  try {
    const allUsers = await getAllUsers();
    const config = readConfig();

    allUsers.forEach((user) => {
      if (user.name === config.currentUserName) {
        console.log(`* ${user.name} (current)`);
      } else {
        console.log(`* ${user.name}`);
      }
    });
  } catch (error) {
    console.error(`Error fetching users: ${(error as Error).message}`);
  }
};

export const handlerReset: CommandHandler = async (cmdName, ...args) => {
  try {
    await deleteUsers();
    console.log("Users table has been reset successfully.");
    process.exit(0);
  } catch (error) {
    console.error(`Error resetting users table: ${(error as Error).message}`);
    process.exit(1);
  }
};
