const express = require("express");
const pool = require("../db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.post("/process", authRequired, async (req, res) => {
  const { shipping_address, billing_address_id, coupon_code } = req.body;
  const user_id = req.user.id;

  if (!shipping_address) {
    return res.status(400).json({ error: "Shipping address is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get user's cart
    const cartRes = await client.query("SELECT id FROM carts WHERE user_id = $1", [user_id]);
    if (cartRes.rows.length === 0) {
      throw new Error("Cart is empty");
    }
    const cartId = cartRes.rows[0].id;

    const cartItemsRes = await client.query(
      "SELECT variant_id, quantity FROM cart_items WHERE cart_id = $1",
      [cartId]
    );

    if (cartItemsRes.rows.length === 0) {
      throw new Error("Cart is empty");
    }

    const cart_items = cartItemsRes.rows;

    let subtotal = 0;
    const orderItemsToInsert = [];

    for (const item of cart_items) {
      const variantRes = await client.query(
        "SELECT pv.*, p.name as product_name, p.base_price FROM product_variants pv JOIN products p ON p.id = pv.product_id WHERE pv.id = $1",
        [item.variant_id]
      );

      if (variantRes.rows.length === 0) {
        throw new Error(`Variant ${item.variant_id} not found`);
      }

      const variant = variantRes.rows[0];
      if (variant.stock_quantity < item.quantity) {
        throw new Error(`Not enough stock for ${variant.product_name} (${variant.sku})`);
      }

      const price = parseFloat(variant.price || variant.base_price);
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      orderItemsToInsert.push({
        variant_id: variant.id,
        product_name_snapshot: variant.product_name,
        price_snapshot: price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Save shipping address
    const addrRes = await client.query(
      `INSERT INTO addresses (user_id, type, full_name, phone, line1, line2, city, state, pincode, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        user_id,
        "shipping",
        shipping_address.full_name,
        shipping_address.phone || null,
        shipping_address.line1,
        shipping_address.line2 || null,
        shipping_address.city,
        shipping_address.state,
        shipping_address.pincode,
        shipping_address.country,
        false,
      ]
    );
    const shipping_address_id = addrRes.rows[0].id;
    const billing_address_id_final = billing_address_id || shipping_address_id;

    // Handle discounts
    let discount = 0;
    if (coupon_code) {
      const couponRes = await client.query(
        "SELECT * FROM coupons WHERE code = $1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)",
        [coupon_code]
      );
      if (couponRes.rows.length > 0) {
        const coupon = couponRes.rows[0];
        if (subtotal >= parseFloat(coupon.min_order_value)) {
          if (coupon.discount_type === "flat") {
            discount = parseFloat(coupon.value);
          } else if (coupon.discount_type === "percentage") {
            discount = subtotal * (parseFloat(coupon.value) / 100);
          }
        }
      }
    }

    const shipping_fee = subtotal > 5000 ? 0 : 99;
    const tax = (subtotal - discount) * 0.1;
    const total = subtotal - discount + shipping_fee + tax;

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`;

    const orderRes = await client.query(
      `INSERT INTO orders (order_number, user_id, status, subtotal, discount, shipping_fee, tax, total, shipping_address_id, billing_address_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, order_number, total`,
      [orderNumber, user_id, "pending", subtotal, discount, shipping_fee, tax, total, shipping_address_id, billing_address_id_final]
    );
    const orderId = orderRes.rows[0].id;

    for (const item of orderItemsToInsert) {
      await client.query(
        "INSERT INTO order_items (order_id, variant_id, product_name_snapshot, price_snapshot, quantity, subtotal) VALUES ($1, $2, $3, $4, $5, $6)",
        [orderId, item.variant_id, item.product_name_snapshot, item.price_snapshot, item.quantity, item.subtotal]
      );

      await client.query(
        "UPDATE product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2",
        [item.quantity, item.variant_id]
      );
    }

    // Mock payment — simulates successful payment
    await client.query(
      "INSERT INTO payments (order_id, gateway, status, amount) VALUES ($1, $2, $3, $4)",
      [orderId, "mock_gateway", "success", total]
    );

    await client.query("UPDATE orders SET status = 'paid' WHERE id = $1", [orderId]);
    await client.query(
      "INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) VALUES ($1, $2, $3, $4)",
      [orderId, "pending", "paid", user_id]
    );

    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);

    await client.query("COMMIT");
    res.json({
      success: true,
      order_number: orderRes.rows[0].order_number,
      order_id: orderId,
      total: orderRes.rows[0].total,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Checkout Error:", err);
    res.status(400).json({ error: err.message || "Checkout failed" });
  } finally {
    client.release();
  }
});

module.exports = router;
