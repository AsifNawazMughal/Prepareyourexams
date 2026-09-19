import "server-only";
import { Client, Account, Databases, Storage, Users } from "node-appwrite";
import { cookies } from "next/headers";
import { appwriteConfig, SESSION_COOKIE } from "./config";

// Used inside a logged-in request (server components, server actions, route
// handlers) to act as the current user, scoped to their own session.
export async function createSessionClient() {
  const session = (await cookies()).get(SESSION_COOKIE);
  if (!session?.value) {
    throw new Error("No active session");
  }

  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setSession(session.value);

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
  };
}

// Used for privileged, admin-only operations (logging in, and provisioning
// scripts). Never expose this client or the API key it uses to the browser.
export function createAdminClient() {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setKey(appwriteConfig.apiKey);

  return {
    account: new Account(client),
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch {
    return null;
  }
}
