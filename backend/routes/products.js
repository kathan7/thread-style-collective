const express = require("express");
const pool = require("../db");

const router = express.Router();

async function attachVariants(products) {
  if (products.length === 0) return [];

  const ids = products.map((p) => p.id);
  const variantsRes = await pool.query(
    `SELECT pv.*, COALESCE(pv.price, p.base_price) as effective_price
     FROM product_variants pv
     JOIN products p ON p.id = pv.product_id
     WHERE pv.product_id = ANY($1::int[])
     ORDER BY pv.id`,
    [ids]
  );

  const imagesRes = await pool.query(
    `SELECT product_id, url, sort_order FROM product_images
     WHERE product_id = ANY($1::int[])
     ORDER BY sort_order, id`,
    [ids]
  );

  const variantsByProduct = {};
  for (const v of variantsRes.rows) {
    if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
    variantsByProduct[v.product_id].push(v);
  }

  const imagesByProduct = {};
  for (const img of imagesRes.rows) {
    if (!imagesByProduct[img.product_id]) imagesByProduct[img.product_id] = [];
    imagesByProduct[img.product_id].push(img.url);
  }

  return products.map((p) => {
    const variants = variantsByProduct[p.id] || [];
    const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);
    const images = imagesByProduct[p.id] || [];
    const primaryImage = variants.find((v) => v.image_url)?.image_url || images[0] || null;

    return {
      ...p,
      variants,
      total_stock: totalStock,
      primary_image: primaryImage,
      images,
    };
  });
}

// Public catalog — active products only
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.status = 'active'
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND (c.slug = $1 OR LOWER(c.name) = LOWER($1))`;
    }

    query += " ORDER BY p.created_at DESC";

    const result = await pool.query(query, params);
    const enriched = await attachVariants(result.rows);
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, slug FROM categories ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1 AND p.status = 'active'`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const [product] = await attachVariants(result.rows);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
