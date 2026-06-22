import { CommandHandler } from "../types/handler";
import { setUser } from "../config";
import { getUserByName, createUser } from "../lib/db/queries/users";

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
