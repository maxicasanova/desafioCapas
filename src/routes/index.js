import { Router } from "express";
import cartRouter from "./carritos.routes.js";
import mainRouter from "./main.routes.js";
import productRouter from "./productos.routes.js";

const router = Router();

router.use("/", mainRouter)
router.use("/productos", productRouter)
router.use("/carrito", cartRouter)

export default router;