const pool = require("./db");

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Dropping existing tables to start fresh...");
    await client.query(`
      DROP TABLE IF EXISTS 
        order_status_history, shipments, payments, order_items, orders,
        cart_items, carts, product_images, product_variants, products,
        categories, addresses, users, coupons CASCADE;
    `);

    console.log("Creating tables...");

    // 1. Users & Auth
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) NOT NULL DEFAULT 'customer', -- 'customer', 'admin', 'staff'
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE addresses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL, -- 'shipping', 'billing'
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        line1 TEXT NOT NULL,
        line2 TEXT,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(20) NOT NULL,
        country VARCHAR(100) NOT NULL,
        is_default BOOLEAN DEFAULT false
      );
    `);

    // 2. Product Catalog
    await client.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
      );
    `);

    await client.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        base_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'archived'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE product_variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        sku VARCHAR(255) UNIQUE NOT NULL,
        attributes JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., {"size":"M", "color":"Red"}
        price DECIMAL(10, 2), -- Overrides base_price if set
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        image_url TEXT
      );
    `);

    await client.query(`
      CREATE TABLE product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0
      );
    `);

    // 3. Cart
    await client.query(`
      CREATE TABLE carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- null for guests
        session_id VARCHAR(255), -- for guest carts
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
        variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        price_at_add DECIMAL(10, 2) NOT NULL
      );
    `);

    // 4. Orders
    await client.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(100) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
        subtotal DECIMAL(10, 2) NOT NULL,
        discount DECIMAL(10, 2) DEFAULT 0,
        shipping_fee DECIMAL(10, 2) DEFAULT 0,
        tax DECIMAL(10, 2) DEFAULT 0,
        total DECIMAL(10, 2) NOT NULL,
        shipping_address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
        billing_address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
        placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
        product_name_snapshot VARCHAR(255) NOT NULL,
        price_snapshot DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        gateway VARCHAR(50) NOT NULL, -- 'razorpay', 'stripe'
        gateway_payment_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'initiated', -- 'initiated', 'success', 'failed', 'refunded'
        amount DECIMAL(10, 2) NOT NULL,
        raw_response JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE shipments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        courier_name VARCHAR(100),
        tracking_number VARCHAR(255),
        status VARCHAR(50) DEFAULT 'packed', -- 'packed', 'shipped', 'out_for_delivery', 'delivered'
        shipped_at TIMESTAMP,
        delivered_at TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE order_status_history (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Discounts
    await client.query(`
      CREATE TABLE coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        discount_type VARCHAR(50) NOT NULL, -- 'flat', 'percentage'
        value DECIMAL(10, 2) NOT NULL,
        min_order_value DECIMAL(10, 2) DEFAULT 0,
        expires_at TIMESTAMP,
        usage_limit INTEGER,
        times_used INTEGER DEFAULT 0
      );
    `);

    await client.query("COMMIT");
    console.log("Database schema initialized successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error initializing database schema:", err);
  } finally {
    client.release();
  }
};

initDB().then(() => process.exit(0)).catch(() => process.exit(1));
