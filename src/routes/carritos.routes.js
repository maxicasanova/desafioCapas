const {Router} = require('express');
const cartRouter = Router();


const {
    getCarrito,
    postCarrito
} = require('../controllers/routesController');

cartRouter.get('/carrito', getCarrito)

cartRouter.post('/carrito', postCarrito)


module.exports = cartRouter;