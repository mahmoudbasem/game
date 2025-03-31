import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from 'ws';
import { storage, MemStorage, ExtendedUser } from "./storage";
import { adminStorage, AdminUser } from "./admin-storage";
import { settingsStorage, SiteSettings } from "./settings-storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { insertOrderSchema, orderStatusUpdateSchema, User, PriceOption } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws' 
  });
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send a welcome message to the client
    ws.send(JSON.stringify({ type: 'connection', data: 'Connected to server' }));
    
    ws.on('message', (message) => {
      console.log('Received message:', message.toString());
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
  
  // Broadcast updates to all connected clients
  const broadcastUpdate = (type: string, data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // OPEN
        client.send(JSON.stringify({ type, data }));
      }
    });
  };
  
  // Add typescript type for parameters in callback functions
  type DoneCallback = (err: Error | null, user?: any, options?: any) => void;

  // Configure session and passport
  app.use(
    session({
      secret: "very-secret-key-gaming-recharge-service",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport strategies
  // Regular user strategy
  passport.use('user-local', 
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        // Add user type flag for session
        const userWithType = {
          ...user,
          userType: 'regular'
        };
        
        return done(null, userWithType);
      } catch (err) {
        return done(err);
      }
    })
  );
  
  // Admin user strategy
  passport.use('admin-local', 
    new LocalStrategy(async (username, password, done) => {
      try {
        const admin = await adminStorage.getAdminByUsername(username);
        
        if (!admin) {
          return done(null, false, { message: "Incorrect admin username" });
        }
        
        if (admin.password !== password) {
          return done(null, false, { message: "Incorrect admin password" });
        }
        
        // Add admin type flag for session
        const adminWithType = {
          ...admin,
          userType: 'admin'
        };
        
        return done(null, adminWithType);
      } catch (err) {
        return done(err);
      }
    })
  );
  
  // Use default strategy as user-local for backward compatibility
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        // Add user type flag for session
        const userWithType = {
          ...user,
          userType: 'regular'
        };
        
        return done(null, userWithType);
      } catch (err) {
        return done(err);
      }
    })
  );
  
  passport.serializeUser((user: any, done) => {
    // Store both user ID and type
    done(null, {
      id: user.id,
      userType: user.userType || 'regular'
    });
  });
  
  passport.deserializeUser(async (data: { id: number, userType: string }, done) => {
    try {
      // Retrieve user based on type
      if (data.userType === 'admin') {
        const admin = await adminStorage.getAdmin(data.id);
        if (admin) {
          const adminWithType = { ...admin, userType: 'admin' };
          return done(null, adminWithType);
        }
      } else { // regular user
        const user = await storage.getUser(data.id);
        if (user) {
          const userWithType = { ...user, userType: 'regular' };
          return done(null, userWithType);
        }
      }
      done(null, false);
    } catch (err) {
      done(err);
    }
  });
  
  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };
  
  // Regular user middleware
  const isRegularUser = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && (req.user as any)?.userType === 'regular') {
      return next();
    }
    res.status(403).json({ message: "Forbidden - Regular user access only" });
  };
  
  // Admin authentication middleware
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      if ((req.user as any)?.userType === 'admin') {
        return next();
      } else if ((req.user as any)?.isAdmin) {
        // Legacy support for admin users from the user table
        return next();
      }
    }
    res.status(403).json({ message: "Forbidden - Admin access only" });
  };
  
  // Admin authentication routes
  app.post("/api/admin/login", (req, res, next) => {
    passport.authenticate('admin-local', (err: Error | null, user: AdminUser | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Admin authentication failed" });
      
      req.login(user, (err: Error | null) => {
        if (err) return next(err);
        
        // Update last login time
        adminStorage.updateLastLogin(user.id);
        
        // Don't send password to client
        const { password: _, ...adminWithoutPassword } = user;
        return res.json(adminWithoutPassword);
      });
    })(req, res, next);
  });
  
  app.get("/api/admin/profile", isAdmin, (req, res) => {
    const user = req.user as AdminUser;
    const { password: _, ...adminWithoutPassword } = user;
    res.json(adminWithoutPassword);
  });

  app.get("/api/admin/list", isAdmin, async (req, res) => {
    try {
      const admins = await adminStorage.getAllAdmins();
      // Remove passwords from response
      const adminsWithoutPasswords = admins.map(admin => {
        const { password: _, ...adminWithoutPassword } = admin;
        return adminWithoutPassword;
      });
      res.json(adminsWithoutPasswords);
    } catch (err) {
      res.status(500).json({ message: "Error fetching admin list" });
    }
  });

  app.post("/api/admin/create", isAdmin, async (req, res) => {
    try {
      const { username, password, name, role } = req.body;
      
      // Validate input
      if (!username || !password || !name || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Check if admin already exists
      const existingAdmin = await adminStorage.getAdminByUsername(username);
      if (existingAdmin) {
        return res.status(409).json({ message: "Admin user already exists" });
      }
      
      // Create new admin
      const newAdmin = await adminStorage.createAdmin({
        username,
        password,
        name,
        role: role === 'admin' ? 'admin' : 'editor' // Ensure role is valid
      });
      
      // Remove password from response
      const { password: _, ...adminWithoutPassword } = newAdmin;
      
      res.status(201).json(adminWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: "Error creating admin user" });
    }
  });

  // Normal user authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, phone, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      
      // Check if email or phone already exists
      const existingUsers = Array.from((storage as MemStorage).users.values());
      if (email && existingUsers.some(user => user.email === email)) {
        return res.status(409).json({ message: "Email already in use" });
      }
      if (phone && existingUsers.some(user => user.phone === phone)) {
        return res.status(409).json({ message: "Phone number already in use" });
      }
      
      // Create new user
      const newUser = await storage.createUser({
        username,
        email,
        phone,
        password,
        isAdmin: false,
        isVerified: false,
        verificationToken: Math.random().toString(36).substring(2, 15),
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error during registration" });
    }
  });
  
  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const { username, email, phone, password } = req.body;
      
      // At least one of username, email, or phone must be provided
      if (!username && !email && !phone) {
        return res.status(400).json({ message: "Username, email, or phone is required" });
      }
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      
      // First try normal passport authentication with username
      if (username) {
        return passport.authenticate("local", (err: Error | null, user: ExtendedUser | false, info: any) => {
          if (err) return next(err);
          if (!user) return res.status(401).json({ message: "Authentication failed" });
          
          req.login(user, (err: Error | null) => {
            if (err) return next(err);
            const { password: _, ...userWithoutPassword } = user;
            return res.json(userWithoutPassword);
          });
        })(req, res, next);
      }
      
      // If email or phone is used instead of username
      const users = Array.from((storage as MemStorage).users.values());
      let user: ExtendedUser | undefined;
      
      if (email) {
        user = users.find(u => u.email === email);
      } else if (phone) {
        user = users.find(u => u.phone === phone);
      }
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password to client
        const { password: _, ...userWithoutPassword } = user as ExtendedUser;
        return res.json(userWithoutPassword);
      });
      
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error during login" });
    }
  });
  
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { username, token } = req.body;
      
      if (!username || !token) {
        return res.status(400).json({ message: "Username and token are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.isVerified) {
        return res.status(400).json({ message: "User already verified" });
      }
      
      if (user.verificationToken !== token) {
        return res.status(401).json({ message: "Invalid verification token" });
      }
      
      // Update user to verified
      const updatedUser = {
        ...user,
        isVerified: true,
        verificationToken: null
      };
      
      (storage as MemStorage).users.set(user.id, updatedUser);
      
      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: "Error during verification" });
    }
  });
  
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email, phone } = req.body;
      
      if (!email && !phone) {
        return res.status(400).json({ message: "Email or phone is required" });
      }
      
      const users = Array.from((storage as MemStorage).users.values());
      let user;
      
      if (email) {
        user = users.find(u => u.email === email);
      } else if (phone) {
        user = users.find(u => u.phone === phone);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate reset token
      const resetToken = Math.random().toString(36).substring(2, 15);
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // Token valid for 1 hour
      
      // Update user with reset token
      const updatedUser = {
        ...user,
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      };
      
      (storage as MemStorage).users.set(user.id, updatedUser);
      
      // In a real app, send the token via email or SMS
      console.log(`Reset token for ${user.username}: ${resetToken}`);
      
      res.json({ message: "Password reset instructions sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Error processing password reset request" });
    }
  });
  
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { username, token, newPassword } = req.body;
      
      if (!username || !token || !newPassword) {
        return res.status(400).json({ message: "Username, token and new password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.passwordResetToken || user.passwordResetToken !== token) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      
      if (user.passwordResetExpires && new Date(user.passwordResetExpires) < new Date()) {
        return res.status(401).json({ message: "Token expired" });
      }
      
      // Update user's password
      const updatedUser = {
        ...user,
        password: newPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      };
      
      (storage as MemStorage).users.set(user.id, updatedUser);
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Error resetting password" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Successfully logged out" });
    });
  });
  
  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // Game routes
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (err) {
      res.status(500).json({ message: "Error fetching games" });
    }
  });
  
  app.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id, 10);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(game);
    } catch (err) {
      res.status(500).json({ message: "Error fetching game" });
    }
  });

  // Price option routes
  app.get("/api/price-options", async (req, res) => {
    try {
      // If a game ID is provided, get price options for that game
      if (req.query.gameId) {
        const gameId = parseInt(req.query.gameId as string, 10);
        const options = await storage.getPriceOptionsByGameId(gameId);
        return res.json(options);
      }
      
      // Otherwise, get all price options
      const games = await storage.getGames();
      let allOptions: PriceOption[] = [];
      
      for (const game of games) {
        const options = await storage.getPriceOptionsByGameId(game.id);
        allOptions = [...allOptions, ...options];
      }
      
      res.json(allOptions);
    } catch (err) {
      res.status(500).json({ message: "Error fetching price options" });
    }
  });
  
  app.get("/api/price-options/:id", async (req, res) => {
    try {
      const optionId = parseInt(req.params.id, 10);
      const option = await storage.getPriceOption(optionId);
      
      if (!option) {
        return res.status(404).json({ message: "Price option not found" });
      }
      
      res.json(option);
    } catch (err) {
      res.status(500).json({ message: "Error fetching price option" });
    }
  });
  
  // Price option routes - Admin only
  app.post("/api/admin/price-options", isAdmin, async (req, res) => {
    try {
      const { gameId, currency, amount, price, description } = req.body;
      
      if (!gameId || !currency || !amount || !price) {
        return res.status(400).json({ message: "Game ID, currency, amount, and price are required" });
      }
      
      // Check if game exists
      const game = await storage.getGame(parseInt(gameId));
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      const newPriceOption = await storage.createPriceOption({
        gameId: parseInt(gameId),
        currency,
        amount: parseInt(amount),
        price: parseFloat(price),
        description: description || null
      });
      
      res.status(201).json(newPriceOption);
    } catch (err) {
      console.error("Error creating price option:", err);
      res.status(500).json({ message: "Error creating price option" });
    }
  });
  
  app.patch("/api/admin/price-options/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { gameId, currency, amount, price, description } = req.body;
      
      // Get the existing price option
      const existingOption = await storage.getPriceOption(id);
      if (!existingOption) {
        return res.status(404).json({ message: "Price option not found" });
      }
      
      // Update the price option
      const updatedOption = {
        ...existingOption,
        gameId: gameId !== undefined ? parseInt(gameId) : existingOption.gameId,
        currency: currency || existingOption.currency,
        amount: amount !== undefined ? parseInt(amount) : existingOption.amount,
        price: price !== undefined ? parseFloat(price) : existingOption.price,
        description: description !== undefined ? description : existingOption.description
      };
      
      // Save updated price option (for in-memory storage)
      if (storage instanceof MemStorage) {
        (storage as MemStorage).priceOptions.set(id, updatedOption);
        res.json(updatedOption);
      } else {
        res.status(501).json({ message: "Update operation not supported for this storage type" });
      }
    } catch (err) {
      console.error("Error updating price option:", err);
      res.status(500).json({ message: "Error updating price option" });
    }
  });
  
  app.delete("/api/admin/price-options/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the existing price option
      const existingOption = await storage.getPriceOption(id);
      if (!existingOption) {
        return res.status(404).json({ message: "Price option not found" });
      }
      
      // Delete the price option (for in-memory storage)
      if (storage instanceof MemStorage) {
        (storage as MemStorage).priceOptions.delete(id);
        res.json({ message: "Price option deleted successfully" });
      } else {
        res.status(501).json({ message: "Delete operation not supported for this storage type" });
      }
    } catch (err) {
      console.error("Error deleting price option:", err);
      res.status(500).json({ message: "Error deleting price option" });
    }
  });
  
  // Admin game management routes
  app.post("/api/admin/games", isAdmin, async (req, res) => {
    try {
      const { name, imageUrl, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Game name is required" });
      }
      
      const newGame = await storage.createGame({
        name, 
        imageUrl: imageUrl || null, 
        description: description || null
      });
      
      res.status(201).json(newGame);
    } catch (err) {
      res.status(500).json({ message: "Error creating game" });
    }
  });
  
  app.patch("/api/admin/games/:id", isAdmin, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id, 10);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Update game properties
      const updatedGame = {
        ...game,
        ...req.body
      };
      
      // Save updated game - use the games public Map
      const memStorage = storage as MemStorage;
      memStorage.games.set(gameId, updatedGame);
      
      res.json(updatedGame);
    } catch (err) {
      res.status(500).json({ message: "Error updating game" });
    }
  });
  
  app.delete("/api/admin/games/:id", isAdmin, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id, 10);
      
      // Check if game exists
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Delete the game and related price options
      const memStorage = storage as MemStorage;
      memStorage.games.delete(gameId);
      
      // Delete related price options
      const allPriceOptions = Array.from(memStorage.priceOptions.values());
      for (const option of allPriceOptions) {
        if (option.gameId === gameId) {
          memStorage.priceOptions.delete(option.id);
        }
      }
      
      res.status(200).json({ message: "Game deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting game" });
    }
  });
  
  // Price options routes
  app.get("/api/games/:id/price-options", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id, 10);
      const priceOptions = await storage.getPriceOptionsByGameId(gameId);
      res.json(priceOptions);
    } catch (err) {
      res.status(500).json({ message: "Error fetching price options" });
    }
  });
  
  // Admin price option management
  app.post("/api/admin/price-options", isAdmin, async (req, res) => {
    try {
      const { gameId, currency, amount, price, description } = req.body;
      
      if (!gameId || !currency || !amount || !price) {
        return res.status(400).json({ message: "gameId, currency, amount, and price are required" });
      }
      
      // Check if game exists
      const game = await storage.getGame(parseInt(gameId, 10));
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      const newPriceOption = await storage.createPriceOption({
        gameId: parseInt(gameId, 10),
        currency,
        amount: parseInt(amount, 10),
        price: parseFloat(price),
        description: description || null
      });
      
      res.status(201).json(newPriceOption);
    } catch (err) {
      res.status(500).json({ message: "Error creating price option" });
    }
  });
  
  app.patch("/api/admin/price-options/:id", isAdmin, async (req, res) => {
    try {
      const optionId = parseInt(req.params.id, 10);
      const priceOption = await storage.getPriceOption(optionId);
      
      if (!priceOption) {
        return res.status(404).json({ message: "Price option not found" });
      }
      
      // Update price option properties
      const updatedOption = {
        ...priceOption,
        ...req.body
      };
      
      // Ensure gameId, amount, and price are parsed as numbers
      if (req.body.gameId) updatedOption.gameId = parseInt(req.body.gameId, 10);
      if (req.body.amount) updatedOption.amount = parseInt(req.body.amount, 10);
      if (req.body.price) updatedOption.price = parseFloat(req.body.price);
      
      // Save updated option
      const memStorage = storage as MemStorage;
      memStorage.priceOptions.set(optionId, updatedOption);
      
      res.json(updatedOption);
    } catch (err) {
      res.status(500).json({ message: "Error updating price option" });
    }
  });
  
  app.delete("/api/admin/price-options/:id", isAdmin, async (req, res) => {
    try {
      const optionId = parseInt(req.params.id, 10);
      
      // Check if option exists
      const option = await storage.getPriceOption(optionId);
      if (!option) {
        return res.status(404).json({ message: "Price option not found" });
      }
      
      // Delete the option
      const memStorage = storage as MemStorage;
      memStorage.priceOptions.delete(optionId);
      
      res.status(200).json({ message: "Price option deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting price option" });
    }
  });
  
  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      // Validate the order data
      const orderData = insertOrderSchema.parse(req.body);
      
      // Create the order
      const order = await storage.createOrder(orderData);
      
      // Create a notification
      const notification = await storage.createNotification({
        orderId: order.id,
        type: "order_created",
        content: `New order #${order.orderNumber} has been created.`
      });
      
      // Broadcast the update
      broadcastUpdate('new_order', order);
      
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error creating order" });
    }
  });
  
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });
  
  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "Error fetching order" });
    }
  });
  
  app.get("/api/orders/number/:orderNumber", async (req, res) => {
    try {
      const orderNumber = req.params.orderNumber;
      const order = await storage.getOrderByNumber(orderNumber);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (err) {
      res.status(500).json({ message: "Error fetching order" });
    }
  });
  
  app.patch("/api/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id, 10);
      
      // Validate the update data
      const updateData = orderStatusUpdateSchema.parse({
        id: orderId,
        ...req.body
      });
      
      // Update the order
      const updatedOrder = await storage.updateOrderStatus(updateData);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Create notification for status update
      const notificationContent = 
        updateData.orderStatus === "completed" 
          ? `Your order #${updatedOrder.orderNumber} has been completed.`
          : `Your order #${updatedOrder.orderNumber} status has been updated to ${updateData.orderStatus}.`;
      
      const notification = await storage.createNotification({
        orderId: updatedOrder.id,
        type: "order_status_update",
        content: notificationContent
      });
      
      // Broadcast the update
      broadcastUpdate('order_updated', updatedOrder);
      
      res.json(updatedOrder);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Error updating order status" });
    }
  });
  
  // Webhook for WhatsApp notifications (simulated)
  app.post("/api/whatsapp/webhook", (req, res) => {
    // This would be implemented with a real WhatsApp Business API integration
    // For now, we'll just log the notification attempt
    console.log("WhatsApp webhook received:", req.body);
    res.status(200).json({ success: true });
  });
  
  // API for sending WhatsApp notification
  app.post("/api/notifications/whatsapp", isAdmin, async (req, res) => {
    try {
      const { orderId, message, phoneNumber } = req.body;
      
      if (!orderId || !message || !phoneNumber) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const order = await storage.getOrder(parseInt(orderId, 10));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Create a notification record
      const notification = await storage.createNotification({
        orderId: order.id,
        type: "whatsapp",
        content: message
      });
      
      // In a real implementation, here we would call the WhatsApp API
      console.log(`Sending WhatsApp message to ${phoneNumber}: ${message}`);
      
      // Mark as delivered (simulating successful delivery)
      const updatedNotification = await storage.markNotificationDelivered(notification.id);
      
      res.json({ success: true, notification: updatedNotification });
    } catch (err) {
      res.status(500).json({ message: "Error sending WhatsApp notification" });
    }
  });
  
  // Site settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await settingsStorage.getSettings();
      res.json(settings);
    } catch (err) {
      res.status(500).json({ message: "Error fetching site settings" });
    }
  });
  
  app.patch("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const updatedSettings = await settingsStorage.updateSettings(req.body);
      
      // Broadcast the settings update to all connected clients
      broadcastUpdate('settings_updated', updatedSettings);
      
      res.json(updatedSettings);
    } catch (err) {
      res.status(500).json({ message: "Error updating site settings" });
    }
  });

  // Users endpoints
  app.get("/api/users", isAdmin, async (req, res) => {
    try {
      // Get all users from storage
      const users = Array.from(storage.users.values()).map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }));
      
      return res.json(users);
    } catch (error) {
      console.error("[API] Error fetching users:", error);
      return res.status(500).json({ message: "Server error retrieving users" });
    }
  });

  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if the user has permission to access this user's data
      if (!(req.user as any)?.isAdmin && (req.user as any)?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized to access this user data" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive data if not admin
      if (!(req.user as any)?.isAdmin) {
        const { password, ...userData } = user;
        return res.json(userData);
      }
      
      return res.json(user);
    } catch (error) {
      console.error("[API] Error fetching user:", error);
      return res.status(500).json({ message: "Server error retrieving user" });
    }
  });

  // This endpoint is now handled above, removing duplicate

  // User orders endpoint
  app.get("/api/users/:userId/orders", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Check if the user has permission to access this user's orders
      if (!(req.user as any)?.isAdmin && (req.user as any)?.id !== userId) {
        return res.status(403).json({ message: "Unauthorized to access this user's orders" });
      }
      
      const orders = (await storage.getOrders()).filter(order => order.userId === userId);
      return res.json(orders);
    } catch (error) {
      console.error("[API] Error fetching user orders:", error);
      return res.status(500).json({ message: "Server error retrieving user orders" });
    }
  });

  return httpServer;
}
