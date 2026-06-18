import { readConfig, setUser } from "./config";

function main(): void {
  setUser("Diego");
  const config = readConfig();
  console.log(config);
}

main();
