const express = require("express");
const pool = require("../db");
const { adminRequired } = require("../middleware/auth");

const router = express.Router();

router.use(adminRequired);

// --- Dashboard ---
router.get("/dashboard", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersQuery = await pool.query(
      "SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM orders WHERE placed_at >= $1",
      [today]
    );
    const todayOrders = parseInt(ordersQuery.rows[0].count);
    const todayRevenue = parseFloat(ordersQuery.rows[0].revenue);

    const totalCustomers = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const totalProducts = await pool.query("SELECT COUNT(*) as count FROM products WHERE status = 'active'");

    const lowStockQuery = await pool.query(`
      SELECT pv.id, pv.sku, pv.stock_quantity, pv.attributes, p.name 
      FROM product_variants pv 
      JOIN products p ON p.id = pv.product_id 
      WHERE pv.stock_quantity < 10
      ORDER BY pv.stock_quantity ASC
    `);

    res.json({
      todayOrders,
      todayRevenue,
      totalCustomers: parseInt(totalCustomers.rows[0].count),
      totalProducts: parseInt(totalProducts.rows[0].count),
      lowStockAlerts: lowStockQuery.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Categories ---
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, slug FROM categories ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- Orders ---
router.get("/orders", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.email as user_email, u.full_name as user_name
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.placed_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query(
      `SELECT o.*, u.email as user_email, u.full_name as user_name
       FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id = $1`,
      [id]
    );
    if (orderResult.rows.length === 0) return res.status(404).json({ error: "Order not found" });

    const itemsResult = await pool.query(
      `SELECT oi.*, pv.attributes, pv.sku
       FROM order_items oi
       LEFT JOIN product_variants pv ON pv.id = oi.variant_id
       WHERE oi.order_id = $1`,
      [id]
    );
    const paymentsResult = await pool.query("SELECT * FROM payments WHERE order_id = $1", [id]);
    const shipmentsResult = await pool.query("SELECT * FROM shipments WHERE order_id = $1", [id]);

    const addrResult = await pool.query(
      "SELECT * FROM addresses WHERE id = $1",
      [orderResult.rows[0].shipping_address_id]
    );

    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows,
      payments: paymentsResult.rows,
      shipments: shipmentsResult.rows,
      shipping_address: addrResult.rows[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const oldOrder = await client.query("SELECT status FROM orders WHERE id = $1", [id]);
      if (oldOrder.rows.length === 0) throw new Error("Order not found");

      await client.query("UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [status, id]);
      await client.query(
        "INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4)",
        [id, oldOrder.rows[0].status, status, req.user.id]
      );

      await client.query("COMMIT");
      res.json({ success: true, status });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// --- Products ---
router.get("/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name,
        (SELECT COALESCE(SUM(stock_quantity), 0) FROM product_variants WHERE product_id = p.id) as total_stock,
        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variant_count
      FROM products p 
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const productRes = await pool.query(
      `SELECT p.*, c.name as category_name FROM products p
       LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = $1`,
      [req.params.id]
    );
    if (productRes.rows.length === 0) return res.status(404).json({ error: "Product not found" });

    const variantsRes = await pool.query(
      "SELECT * FROM product_variants WHERE product_id = $1 ORDER BY id",
      [req.params.id]
    );

    res.json({ ...productRes.rows[0], variants: variantsRes.rows });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const { name, slug, description, category_id, base_price, status, variants } = req.body;
    if (!name || !base_price) return res.status(400).json({ error: "Name and price are required" });

    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        "INSERT INTO products (name, slug, description, category_id, base_price, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [name, productSlug, description || "", category_id || null, base_price, status || "draft"]
      );
      const product = result.rows[0];

      if (variants && variants.length > 0) {
        for (const v of variants) {
          await client.query(
            "INSERT INTO product_variants (product_id, sku, attributes, price, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6)",
            [
              product.id,
              v.sku,
              JSON.stringify(v.attributes || {}),
              v.price || null,
              v.stock_quantity ?? 0,
              v.image_url || null,
            ]
          );
        }
      } else {
        // Default variant if none provided
        await client.query(
          "INSERT INTO product_variants (product_id, sku, attributes, stock_quantity) VALUES ($1, $2, $3, $4)",
          [product.id, `${productSlug.toUpperCase()}-DEFAULT`, JSON.stringify({ size: "One Size", color: "Default" }), 0]
        );
      }

      await client.query("COMMIT");
      res.json(product);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const { name, description, category_id, base_price, status } = req.body;
    const result = await pool.query(
      `UPDATE products SET name = COALESCE($1, name), description = COALESCE($2, description),
       category_id = COALESCE($3, category_id), base_price = COALESCE($4, base_price),
       status = COALESCE($5, status), updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [name, description, category_id, base_price, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Variants & Stock ---
router.post("/products/:id/variants", async (req, res) => {
  try {
    const { sku, attributes, price, stock_quantity, image_url } = req.body;
    if (!sku) return res.status(400).json({ error: "SKU is required" });

    const result = await pool.query(
      "INSERT INTO product_variants (product_id, sku, attributes, price, stock_quantity, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [req.params.id, sku, JSON.stringify(attributes || {}), price || null, stock_quantity ?? 0, image_url || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

router.put("/variants/:id/stock", async (req, res) => {
  try {
    const { stock_quantity } = req.body;
    if (stock_quantity === undefined || stock_quantity < 0) {
      return res.status(400).json({ error: "Valid stock_quantity required" });
    }

    const result = await pool.query(
      "UPDATE product_variants SET stock_quantity = $1 WHERE id = $2 RETURNING *",
      [stock_quantity, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Variant not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/variants/:id", async (req, res) => {
  try {
    const { attributes, price, stock_quantity, image_url } = req.body;
    const result = await pool.query(
      `UPDATE product_variants SET
        attributes = COALESCE($1, attributes),
        price = COALESCE($2, price),
        stock_quantity = COALESCE($3, stock_quantity),
        image_url = COALESCE($4, image_url)
       WHERE id = $5 RETURNING *`,
      [
        attributes ? JSON.stringify(attributes) : null,
        price,
        stock_quantity,
        image_url,
        req.params.id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Variant not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/variants/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM product_variants WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Variant not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Product Images ---
router.get("/products/:id/images", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order",
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/products/:id/images", async (req, res) => {
  try {
    const { url, sort_order } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    const result = await pool.query(
      "INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3) RETURNING *",
      [req.params.id, url, sort_order || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/images/:id", async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM product_images WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Image not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- Customers ---
router.get("/customers", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.role, u.created_at,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
       FROM users u WHERE u.role = 'customer' ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// --- Coupons ---
router.get("/coupons", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM coupons ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/coupons", async (req, res) => {
  try {
    const { code, discount_type, value, min_order_value, expires_at, usage_limit } = req.body;
    if (!code || !discount_type || !value) {
      return res.status(400).json({ error: "Code, type, and value are required" });
    }
    const result = await pool.query(
      "INSERT INTO coupons (code, discount_type, value, min_order_value, expires_at, usage_limit) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [code.toUpperCase(), discount_type, value, min_order_value || 0, expires_at || null, usage_limit || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;
