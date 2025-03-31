// Define the available site settings structure
export interface SiteSettings {
  id: number;
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string | null;
  hero: string | null;
  background: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  whatsappNumber: string | null;
  footerText: string | null;
  enableRegistration: boolean;
  enableVerification: boolean;
  updatedAt: Date;
}

export interface ISettingsStorage {
  getSettings(): Promise<SiteSettings>;
  updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;
}

export class SettingsStorage implements ISettingsStorage {
  private settings: SiteSettings;

  constructor() {
    // Initialize with default settings
    this.settings = {
      id: 1,
      siteName: 'GameCharge',
      primaryColor: '#6200ea', // Deep purple
      secondaryColor: '#00b8d4', // Light blue
      logo: null,
      hero: null,
      background: null,
      contactEmail: 'contact@gamecharge.example',
      contactPhone: '+201234567890',
      whatsappNumber: '+201234567890',
      footerText: 'جميع الحقوق محفوظة © 2023 GameCharge',
      enableRegistration: true,
      enableVerification: false,
      updatedAt: new Date()
    };
  }

  async getSettings(): Promise<SiteSettings> {
    return { ...this.settings };
  }

  async updateSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
    // Merge updates with current settings
    this.settings = {
      ...this.settings,
      ...updates,
      // Always update the timestamp
      updatedAt: new Date()
    };

    return { ...this.settings };
  }
}

// Create and export a singleton instance
export const settingsStorage = new SettingsStorage();