// Define the admin user structure
export interface AdminUser {
  id: number;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'editor';
  lastLogin: Date | null;
  createdAt: Date;
}

export interface IAdminStorage {
  getAdmin(id: number): Promise<AdminUser | undefined>;
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  getAllAdmins(): Promise<AdminUser[]>;
  createAdmin(admin: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin'>): Promise<AdminUser>;
  updateAdmin(id: number, data: Partial<AdminUser>): Promise<AdminUser | undefined>;
  updateLastLogin(id: number): Promise<AdminUser | undefined>;
  deleteAdmin(id: number): Promise<boolean>;
}

export class AdminStorage implements IAdminStorage {
  private admins: Map<number, AdminUser>;
  private currentAdminId: number;

  constructor() {
    this.admins = new Map();
    this.currentAdminId = 1;
    
    // Create default super admin
    this.createAdmin({
      username: "mahmoudbasem",
      password: "Ma0107360138", // Note: In a real app, this would be hashed
      name: "محمود باسم",
      role: "admin",
    });
  }

  async getAdmin(id: number): Promise<AdminUser | undefined> {
    return this.admins.get(id);
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.admins.values()).find(
      (admin) => admin.username === username
    );
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    return Array.from(this.admins.values());
  }

  async createAdmin(adminData: Omit<AdminUser, 'id' | 'createdAt' | 'lastLogin'>): Promise<AdminUser> {
    const id = this.currentAdminId++;
    const now = new Date();
    
    const admin: AdminUser = {
      ...adminData,
      id,
      lastLogin: null,
      createdAt: now
    };
    
    this.admins.set(id, admin);
    return admin;
  }

  async updateAdmin(id: number, data: Partial<AdminUser>): Promise<AdminUser | undefined> {
    const admin = this.admins.get(id);
    
    if (!admin) return undefined;
    
    const updatedAdmin: AdminUser = {
      ...admin,
      ...data
    };
    
    this.admins.set(id, updatedAdmin);
    return updatedAdmin;
  }

  async updateLastLogin(id: number): Promise<AdminUser | undefined> {
    const admin = this.admins.get(id);
    
    if (!admin) return undefined;
    
    const updatedAdmin: AdminUser = {
      ...admin,
      lastLogin: new Date()
    };
    
    this.admins.set(id, updatedAdmin);
    return updatedAdmin;
  }

  async deleteAdmin(id: number): Promise<boolean> {
    return this.admins.delete(id);
  }
}

// Create and export a singleton instance
export const adminStorage = new AdminStorage();