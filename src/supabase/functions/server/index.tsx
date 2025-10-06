import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-7528fbcc/health", (c) => {
  return c.json({ status: "ok" });
});

// Cosmetic products endpoints
app.get("/make-server-7528fbcc/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json({ products: products || [] });
  } catch (error) {
    console.log("Error fetching products:", error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

app.post("/make-server-7528fbcc/products", async (c) => {
  try {
    const body = await c.req.json();
    const { product } = body;
    
    if (!product || !product.name || !product.brand || !product.type) {
      return c.json({ error: "Missing required product fields" }, 400);
    }
    
    const productId = `product:${Date.now()}`;
    const productData = {
      ...product,
      id: productId,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(productId, productData);
    return c.json({ product: productData });
  } catch (error) {
    console.log("Error creating product:", error);
    return c.json({ error: "Failed to create product" }, 500);
  }
});

app.delete("/make-server-7528fbcc/products/:id", async (c) => {
  try {
    const productId = c.req.param("id");
    
    if (!productId.startsWith("product:")) {
      return c.json({ error: "Invalid product ID" }, 400);
    }
    
    await kv.del(productId);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting product:", error);
    return c.json({ error: "Failed to delete product" }, 500);
  }
});

// Search cosmetic product by barcode
app.get("/make-server-7528fbcc/products/barcode/:barcode", async (c) => {
  try {
    const barcode = c.req.param("barcode");
    
    // Symulacja wyszukiwania produktu przez kod kreskowy
    // W rzeczywistej aplikacji można by integrować z zewnętrznym API (np. Open Food Facts)
    const mockProduct = {
      name: `Produkt ${barcode.slice(-6)}`,
      brand: "Nieznana marka",
      type: "Krem do twarzy",
      barcode: barcode,
      description: "Produkt znaleziony przez kod kreskowy"
    };
    
    return c.json({ product: mockProduct });
  } catch (error) {
    console.log("Error searching product by barcode:", error);
    return c.json({ error: "Failed to search product" }, 500);
  }
});

// Weekly routine endpoints
app.get("/make-server-7528fbcc/routines", async (c) => {
  try {
    const routines = await kv.getByPrefix("routine:");
    return c.json({ routines: routines || [] });
  } catch (error) {
    console.log("Error fetching routines:", error);
    return c.json({ error: "Failed to fetch routines" }, 500);
  }
});

app.post("/make-server-7528fbcc/routines", async (c) => {
  try {
    const body = await c.req.json();
    const { routine } = body;
    
    if (!routine || !routine.day || !routine.timeOfDay) {
      return c.json({ error: "Missing required routine fields" }, 400);
    }
    
    const routineId = `routine:${routine.day}:${routine.timeOfDay}:${Date.now()}`;
    const routineData = {
      ...routine,
      id: routineId,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(routineId, routineData);
    return c.json({ routine: routineData });
  } catch (error) {
    console.log("Error creating routine:", error);
    return c.json({ error: "Failed to create routine" }, 500);
  }
});

app.put("/make-server-7528fbcc/routines/:id", async (c) => {
  try {
    const routineId = c.req.param("id");
    const body = await c.req.json();
    const { routine } = body;
    
    if (!routineId.startsWith("routine:")) {
      return c.json({ error: "Invalid routine ID" }, 400);
    }
    
    const updatedRoutine = {
      ...routine,
      id: routineId,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(routineId, updatedRoutine);
    return c.json({ routine: updatedRoutine });
  } catch (error) {
    console.log("Error updating routine:", error);
    return c.json({ error: "Failed to update routine" }, 500);
  }
});

app.delete("/make-server-7528fbcc/routines/:id", async (c) => {
  try {
    const routineId = c.req.param("id");
    
    if (!routineId.startsWith("routine:")) {
      return c.json({ error: "Invalid routine ID" }, 400);
    }
    
    await kv.del(routineId);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting routine:", error);
    return c.json({ error: "Failed to delete routine" }, 500);
  }
});

Deno.serve(app.fetch);