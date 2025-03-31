import {
  User, InsertUser, Game, InsertGame, PriceOption, InsertPriceOption,
  Order, InsertOrder, Notification, InsertNotification, OrderStatusUpdate
} from "@shared/schema";
import { v4 as uuidv4 } from 'uuid';
import { db } from './db'; // Added import for database connection
import { eq } from 'drizzle-orm';
import { users } from '../shared/schema'; // Added import for users schema


// Define extended User type with explicit fields to match the schema
export interface ExtendedUser extends Omit<User, 'email' | 'phone' | 'verificationToken' | 'passwordResetToken' | 'passwordResetExpires'> {
  email: string | null;
  phone: string | null;
  verificationToken: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Games
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, game: Partial<Game>): Promise<Game | undefined>;
  deleteGame(id: number): Promise<boolean>;

  // Price Options
  getPriceOptionsByGameId(gameId: number): Promise<PriceOption[]>;
  getPriceOption(id: number): Promise<PriceOption | undefined>;
  createPriceOption(option: InsertPriceOption): Promise<PriceOption>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(update: OrderStatusUpdate): Promise<Order | undefined>;

  // Notifications
  getNotificationsByOrderId(orderId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationDelivered(id: number): Promise<Notification | undefined>;
}

export class MemStorage implements IStorage {
  public users: Map<string, ExtendedUser>;
  public games: Map<number, Game>;
  public priceOptions: Map<number, PriceOption>;
  public orders: Map<number, Order>;
  public notifications: Map<number, Notification>;

  // Counters (we don't need currentUserId anymore since we'll use UUIDs)
  private currentGameId: number;
  private currentPriceOptionId: number;
  private currentOrderId: number;
  private currentNotificationId: number;

  // Fixed UUIDs for demo users to ensure consistency
  private ADMIN_USER_ID = "admin-uuid-12345678-fixed-id";
  private AHMED_USER_ID = "ahmed-uuid-12345678-fixed-id";
  private MOHAMED_USER_ID = "mohamed-uuid-12345678-fixed-id";
  private SARA_USER_ID = "sara-uuid-12345678-fixed-id";

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.priceOptions = new Map();
    this.orders = new Map();
    this.notifications = new Map();

    this.currentGameId = 1;
    this.currentPriceOptionId = 1;
    this.currentOrderId = 1;
    this.currentNotificationId = 1;

    // Seed with default admin user
    this.createUser({
      username: "admin",
      password: "admin123", // Insecure, but it's just for demo
      isAdmin: true,
      isVerified: true,
      email: "admin@example.com",
      phone: undefined,
      verificationToken: undefined
    }, this.ADMIN_USER_ID);

    // Seed with some games
    this.seedGames();

    // Seed with some users and orders
    this.seedUsers();
  }

  // Helper to seed initial users and their orders
  private async seedUsers() {
    // Create some regular users with fixed UUIDs
    const user1 = await this.createUser({
      username: "ahmed123",
      password: "password123",
      isAdmin: false,
      isVerified: true,
      email: "ahmed@example.com",
      phone: "+201012345678",
      verificationToken: undefined
    }, this.AHMED_USER_ID);

    const user2 = await this.createUser({
      username: "mohamed456",
      password: "password456",
      isAdmin: false,
      isVerified: true,
      email: "mohamed@example.com",
      phone: "+201123456789",
      verificationToken: undefined
    }, this.MOHAMED_USER_ID);

    const user3 = await this.createUser({
      username: "sara789",
      password: "password789",
      isAdmin: false,
      isVerified: true,
      email: "sara@example.com",
      phone: "+201234567890",
      verificationToken: undefined
    }, this.SARA_USER_ID);

    // Create some orders for the users
    // Orders for user1 (PUBG)
    const game1 = await this.getGame(1); // PUBG
    if (game1) {
      const priceOption1 = (await this.getPriceOptionsByGameId(game1.id))[0];
      const order1 = await this.createOrder({
        userId: user1.id,
        gameId: game1.id,
        gameName: game1.name,
        priceOptionId: priceOption1.id,
        gameAccountId: "PUBG-12345",
        serverName: "Asia",
        amount: priceOption1.amount,
        price: priceOption1.price,
        paymentMethod: "vodafoneCash",
        customerPhone: user1.phone || "",
        notes: "شحن سريع من فضلك"
      });

      // Update order status manually
      await this.updateOrderStatus({
        id: order1.id,
        orderStatus: "completed",
        paymentStatus: "paid"
      });

      // Update createdAt manually
      this.orders.set(order1.id, {
        ...this.orders.get(order1.id)!,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      });

      const order2 = await this.createOrder({
        userId: user1.id,
        gameId: game1.id,
        gameName: game1.name,
        priceOptionId: priceOption1.id,
        gameAccountId: "PUBG-12345",
        serverName: "Asia",
        amount: priceOption1.amount * 3,
        price: priceOption1.price * 2,
        paymentMethod: "instaPay",
        customerPhone: user1.phone || "",
        notes: ""
      });

      // Update order status manually
      await this.updateOrderStatus({
        id: order2.id,
        orderStatus: "completed",
        paymentStatus: "paid"
      });

      // Update createdAt manually
      this.orders.set(order2.id, {
        ...this.orders.get(order2.id)!,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      });
    }

    // Orders for user2 (Fortnite)
    const game2 = await this.getGame(2); // Fortnite
    if (game2) {
      const priceOption2 = (await this.getPriceOptionsByGameId(game2.id))[1];
      const order3 = await this.createOrder({
        userId: user2.id,
        gameId: game2.id,
        gameName: game2.name,
        priceOptionId: priceOption2.id,
        gameAccountId: "Fortnite-67890",
        serverName: "Europe",
        amount: priceOption2.amount,
        price: priceOption2.price,
        paymentMethod: "bankTransfer",
        customerPhone: user2.phone || "",
        notes: "إرسال رمز التفعيل على الواتساب"
      });

      // Update createdAt manually
      this.orders.set(order3.id, {
        ...this.orders.get(order3.id)!,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      });
    }

    // Orders for user3 (Call of Duty & Free Fire)
    const game3 = await this.getGame(3); // Call of Duty
    if (game3) {
      const priceOptions3 = await this.getPriceOptionsByGameId(game3.id);
      if (priceOptions3.length > 0) {
        // Use the first price option instead of trying to access index 2
        const priceOption3 = priceOptions3[0];
        const order4 = await this.createOrder({
          userId: user3.id,
          gameId: game3.id,
          gameName: game3.name,
          priceOptionId: priceOption3.id,
          gameAccountId: "COD-54321",
          serverName: "Global",
          amount: priceOption3.amount,
          price: priceOption3.price,
          paymentMethod: "vodafoneCash",
          customerPhone: user3.phone || "",
          notes: ""
        });

        // Update order status manually
        await this.updateOrderStatus({
          id: order4.id,
          orderStatus: "completed",
          paymentStatus: "paid"
        });

        // Update createdAt manually
        this.orders.set(order4.id, {
          ...this.orders.get(order4.id)!,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        });
      }
    }

    const game4 = await this.getGame(4); // Free Fire
    if (game4) {
      const priceOptions4 = await this.getPriceOptionsByGameId(game4.id);
      if (priceOptions4.length > 0) {
        const priceOption4 = priceOptions4[0];
        const order5 = await this.createOrder({
          userId: user3.id,
          gameId: game4.id,
          gameName: game4.name,
          priceOptionId: priceOption4.id,
          gameAccountId: "FF-98765",
          serverName: "Middle East",
          amount: priceOption4.amount,
          price: priceOption4.price,
          paymentMethod: "instaPay",
          customerPhone: user3.phone || "",
          notes: "تم إلغاء الطلب بناءً على طلب العميل"
        });

        // Update order status manually
        await this.updateOrderStatus({
          id: order5.id,
          orderStatus: "cancelled",
          paymentStatus: "failed"
        });

        // Update createdAt manually
        this.orders.set(order5.id, {
          ...this.orders.get(order5.id)!,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        });
      }
    }
  }

  // Helper to seed initial game data
  private async seedGames() {
    // Add some game examples
    const games = [
      {
        name: "PUBG Mobile",
        imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&h=300&fit=crop",
        description: "شحن UC | متوفر جميع الفئات"
      },
      {
        name: "Fortnite",
        imageUrl: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=500&h=300&fit=crop",
        description: "شحن V-Bucks | جميع المنصات"
      },
      {
        name: "Free Fire",
        imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&h=300&fit=crop",
        description: "شحن الجواهر | عروض خاصة"
      },
      {
        name: "Call of Duty Mobile",
        imageUrl: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=500&h=300&fit=crop",
        description: "شحن CP | خصومات حصرية"
      }
    ];

    for (const game of games) {
      const newGame = await this.createGame(game);

      // Add price options for each game
      if (newGame.name === "PUBG Mobile") {
        await this.createPriceOption({ gameId: newGame.id, currency: "UC", amount: 60, price: 15, description: "باقة مبتدئين" });
        await this.createPriceOption({ gameId: newGame.id, currency: "UC", amount: 180, price: 40, description: "باقة أساسية" });
        await this.createPriceOption({ gameId: newGame.id, currency: "UC", amount: 325, price: 70, description: "باقة متوسطة" });
        await this.createPriceOption({ gameId: newGame.id, currency: "UC", amount: 660, price: 140, description: "باقة كبيرة" });
        await this.createPriceOption({ gameId: newGame.id, currency: "UC", amount: 1800, price: 350, description: "باقة محترفين" });
        await this.createPriceOption({ gameId: newGame.id, currency: "UC", amount: 3850, price: 700, description: "باقة رويال" });
      } else if (newGame.name === "Fortnite") {
        await this.createPriceOption({ gameId: newGame.id, currency: "V-Bucks", amount: 1000, price: 90, description: "باقة أساسية" });
        await this.createPriceOption({ gameId: newGame.id, currency: "V-Bucks", amount: 2800, price: 230, description: "باقة متوسطة" });
        await this.createPriceOption({ gameId: newGame.id, currency: "V-Bucks", amount: 5000, price: 400, description: "باقة كبيرة" });
      } else if (newGame.name === "Free Fire") {
        await this.createPriceOption({ gameId: newGame.id, currency: "Diamonds", amount: 100, price: 20, description: "باقة مبتدئين" });
        await this.createPriceOption({ gameId: newGame.id, currency: "Diamonds", amount: 310, price: 60, description: "باقة متوسطة" });
        await this.createPriceOption({ gameId: newGame.id, currency: "Diamonds", amount: 520, price: 100, description: "باقة كبيرة" });
      } else if (newGame.name === "Call of Duty Mobile") {
        await this.createPriceOption({ gameId: newGame.id, currency: "CP", amount: 400, price: 70, description: "باقة أساسية" });
        await this.createPriceOption({ gameId: newGame.id, currency: "CP", amount: 800, price: 130, description: "باقة متوسطة" });
        await this.createPriceOption({ gameId: newGame.id, currency: "CP", amount: 2000, price: 300, description: "باقة كبيرة" });
      }
    }
  }

  // User Methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser, fixedId?: string): Promise<User> {
    // Use the provided fixed ID if available, otherwise generate a UUID
    const id = fixedId || uuidv4();
    const now = new Date();

    // Create extended user with all required fields
    const extendedUser: ExtendedUser = {
      ...insertUser,
      id,
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      isVerified: insertUser.isVerified || false,
      verificationToken: insertUser.verificationToken || null,
      passwordResetToken: null,
      passwordResetExpires: null,
      createdAt: now
    };

    this.users.set(id, extendedUser);
    return extendedUser;
  }

  // Game Methods
  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentGameId++;
    const game: Game = { ...insertGame, id };
    this.games.set(id, game);
    return game;
  }

  async updateGame(id: number, gameData: Partial<Game>): Promise<Game | undefined> {
    const game = this.games.get(id);

    if (!game) return undefined;

    const updatedGame: Game = {
      ...game,
      ...gameData
    };

    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async deleteGame(id: number): Promise<boolean> {
    // First check if game exists
    if (!this.games.has(id)) return false;

    // Check if there are any orders associated with this game
    const gameOrders = Array.from(this.orders.values()).filter(
      order => order.gameId === id
    );

    // Don't delete if there are orders (for data integrity)
    if (gameOrders.length > 0) return false;

    // Delete all price options for this game
    const priceOptionsToDelete = Array.from(this.priceOptions.values())
      .filter(option => option.gameId === id)
      .map(option => option.id);

    for (const optionId of priceOptionsToDelete) {
      this.priceOptions.delete(optionId);
    }

    // Delete the game
    return this.games.delete(id);
  }

  // Price Option Methods
  async getPriceOptionsByGameId(gameId: number): Promise<PriceOption[]> {
    return Array.from(this.priceOptions.values()).filter(
      (option) => option.gameId === gameId
    );
  }

  async getPriceOption(id: number): Promise<PriceOption | undefined> {
    return this.priceOptions.get(id);
  }

  async createPriceOption(insertOption: InsertPriceOption): Promise<PriceOption> {
    const id = this.currentPriceOptionId++;
    const option: PriceOption = {
      ...insertOption,
      id,
      description: insertOption.description || null
    };
    this.priceOptions.set(id, option);
    return option;
  }

  // Order Methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => {
      // Sort by createdAt desc
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.orderNumber === orderNumber
    );
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const orderNumber = `GC-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

    const order: Order = {
      ...insertOrder,
      id,
      orderNumber,
      orderStatus: "pending",
      paymentStatus: "pending",
      createdAt: new Date(),
      completedAt: null,
      serverName: insertOrder.serverName || null,
      notes: insertOrder.notes || null
    };

    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(update: OrderStatusUpdate): Promise<Order | undefined> {
    const order = this.orders.get(update.id);

    if (!order) return undefined;

    const updatedOrder: Order = {
      ...order,
      orderStatus: update.orderStatus,
      paymentStatus: update.paymentStatus,
      completedAt: update.orderStatus === "completed" ? new Date() : order.completedAt,
    };

    this.orders.set(update.id, updatedOrder);
    return updatedOrder;
  }

  // Notification Methods
  async getNotificationsByOrderId(orderId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.orderId === orderId
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = {
      ...insertNotification,
      id,
      sentAt: new Date(),
      delivered: false
    };

    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationDelivered(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);

    if (!notification) return undefined;

    const updatedNotification: Notification = {
      ...notification,
      delivered: true
    };

    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
}

export const storage = new MemStorage();