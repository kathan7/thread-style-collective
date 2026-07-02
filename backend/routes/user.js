const express = require("express");
const pool = require("../db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired);

// Customer order history
router.get("/orders", async (req, res) => {
  try {
    const userId = req.user.id;
    const ordersRes = await pool.query(
      `SELECT o.*, 
        (SELECT json_agg(oi.*) FROM order_items oi WHERE oi.order_id = o.id) as items
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.placed_at DESC`,
      [userId]
    );
    res.json(ordersRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Profile
router.get("/profile", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const addresses = await pool.query(
      "SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id",
      [req.user.id]
    );

    res.json({ ...result.rows[0], addresses: addresses.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Addresses
router.get("/addresses", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/addresses", async (req, res) => {
  try {
    const { full_name, phone, line1, line2, city, state, pincode, country, type, is_default } = req.body;

    if (!full_name || !line1 || !city || !state || !pincode || !country) {
      return res.status(400).json({ error: "Missing required address fields" });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      if (is_default) {
        await client.query("UPDATE addresses SET is_default = false WHERE user_id = $1", [req.user.id]);
      }

      const result = await client.query(
        `INSERT INTO addresses (user_id, type, full_name, phone, line1, line2, city, state, pincode, country, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          req.user.id,
          type || "shipping",
          full_name,
          phone || null,
          line1,
          line2 || null,
          city,
          state,
          pincode,
          country,
          is_default ?? false,
        ]
      );

      await client.query("COMMIT");
      res.json(result.rows[0]);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
