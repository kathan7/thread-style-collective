const express = require("express");
const pool = require("../db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.use(authRequired);

async function getOrCreateCart(userId) {
  let cartRes = await pool.query("SELECT * FROM carts WHERE user_id = $1", [userId]);
  if (cartRes.rows.length === 0) {
    cartRes = await pool.query("INSERT INTO carts (user_id) VALUES ($1) RETURNING *", [userId]);
  }
  return cartRes.rows[0];
}

async function fetchCartItems(cartId) {
  const itemsRes = await pool.query(
    `SELECT ci.*, pv.sku, pv.stock_quantity, pv.attributes,
            p.name as product_name, p.slug as product_slug,
            COALESCE(pv.image_url, (SELECT url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1)) as image_url, 
            COALESCE(pv.price, p.base_price) as current_price
     FROM cart_items ci
     JOIN product_variants pv ON pv.id = ci.variant_id
     JOIN products p ON p.id = pv.product_id
     WHERE ci.cart_id = $1`,
    [cartId]
  );
  return itemsRes.rows;
}

// Get cart for logged-in user
router.get("/", async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const items = await fetchCartItems(cart.id);
    res.json({ cart, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add to cart
router.post("/add", async (req, res) => {
  try {
    const { variant_id, quantity = 1 } = req.body;
    if (!variant_id) return res.status(400).json({ error: "variant_id is required" });

    const variantRes = await pool.query(
      `SELECT pv.*, p.name as product_name, COALESCE(pv.price, p.base_price) as price
       FROM product_variants pv JOIN products p ON p.id = pv.product_id WHERE pv.id = $1`,
      [variant_id]
    );

    if (variantRes.rows.length === 0) return res.status(404).json({ error: "Variant not found" });

    const variant = variantRes.rows[0];
    if (variant.stock_quantity < 1) {
      return res.status(400).json({ error: "This item is out of stock" });
    }

    const cart = await getOrCreateCart(req.user.id);
    const existingItem = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND variant_id = $2",
      [cart.id, variant_id]
    );

    const newQty = existingItem.rows.length > 0
      ? existingItem.rows[0].quantity + quantity
      : quantity;

    if (newQty > variant.stock_quantity) {
      return res.status(400).json({ error: `Only ${variant.stock_quantity} units available` });
    }

    if (existingItem.rows.length > 0) {
      await pool.query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [newQty, existingItem.rows[0].id]);
    } else {
      await pool.query(
        "INSERT INTO cart_items (cart_id, variant_id, quantity, price_at_add) VALUES ($1, $2, $3, $4)",
        [cart.id, variant_id, quantity, variant.price]
      );
    }

    const items = await fetchCartItems(cart.id);
    res.json({ success: true, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update cart item quantity
router.put("/update", async (req, res) => {
  try {
    const { variant_id, quantity } = req.body;
    if (!variant_id || quantity === undefined) {
      return res.status(400).json({ error: "variant_id and quantity required" });
    }

    const cart = await getOrCreateCart(req.user.id);

    if (quantity <= 0) {
      await pool.query("DELETE FROM cart_items WHERE cart_id = $1 AND variant_id = $2", [cart.id, variant_id]);
    } else {
      const variantRes = await pool.query("SELECT stock_quantity FROM product_variants WHERE id = $1", [variant_id]);
      if (variantRes.rows.length === 0) return res.status(404).json({ error: "Variant not found" });
      if (quantity > variantRes.rows[0].stock_quantity) {
        return res.status(400).json({ error: `Only ${variantRes.rows[0].stock_quantity} units available` });
      }
      await pool.query(
        "UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND variant_id = $3",
        [quantity, cart.id, variant_id]
      );
    }

    const items = await fetchCartItems(cart.id);
    res.json({ success: true, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Remove from cart
router.delete("/remove/:variant_id", async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    await pool.query("DELETE FROM cart_items WHERE cart_id = $1 AND variant_id = $2", [cart.id, req.params.variant_id]);
    const items = await fetchCartItems(cart.id);
    res.json({ success: true, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
