PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT UNIQUE NOT NULL,
  displayName TEXT,
  createdAt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
, profilePicture TEXT, role TEXT DEFAULT 'customer', provider TEXT DEFAULT 'email');
CREATE TABLE settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT
);
CREATE TABLE subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, createdAt TEXT NOT NULL);
CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  author_id TEXT,
  author_name TEXT,
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
, createdAt TEXT, authorId INTEGER DEFAULT 1);
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available', -- 'available' or 'unavailable'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
, category TEXT, slug TEXT, long_description TEXT);
CREATE TABLE reviews (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  serviceName TEXT,
  customerName TEXT,
  rating INTEGER NOT NULL,
  comment TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved
  createdAt TEXT NOT NULL
, newColumnName TEXT);
CREATE TABLE support_tickets (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    lastReplier TEXT
);
CREATE TABLE support_messages (
    id TEXT PRIMARY KEY,
    ticketId TEXT,
    sender TEXT,
    message TEXT,
    attachmentUrl TEXT,
    createdAt TEXT,
    FOREIGN KEY (ticketId) REFERENCES support_tickets(id) ON DELETE CASCADE
);
CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    customerName TEXT NOT NULL,
    email TEXT NOT NULL,
    serviceName TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    paymentAmount REAL,
    paymentMethod TEXT NOT NULL,
    phone TEXT NOT NULL,
    price REAL NOT NULL,
    serviceDetails TEXT,
    serviceLink TEXT,
    receiptUrl TEXT,
    cancellationReason TEXT
, paymentCancellationReason TEXT);
CREATE TABLE service_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serviceId TEXT NOT NULL,
    userId TEXT NOT NULL,
    authorName TEXT,
    authorAvatar TEXT,
    commentText TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
, parentId INTEGER);
CREATE TABLE comment_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    commentId INTEGER NOT NULL,
    userId TEXT NOT NULL,
    reactionType TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(commentId, userId)
);
DELETE FROM sqlite_sequence;
CREATE UNIQUE INDEX idx_services_slug ON services(slug);
