import { eq } from "drizzle-orm";
import { db } from "./connection";
import { users, type NewUser, type User } from "./schema";

export class UserService {
  async createUser(userData: Omit<NewUser, "id" | "createdAt">): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    if (!user) {
      throw new Error("Failed to create user");
    }
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  async findUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount || 0) > 0;
  }

  async updateUser(
    id: string,
    userData: Partial<Omit<NewUser, "id" | "createdAt">>
  ): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }
}

export const userService = new UserService();
