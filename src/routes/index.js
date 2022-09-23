const {Router} = require('express');
const router = Router();

const {
        getProducts, 
        postProduct, 
        getProduct,
        getTestProducts,
        getRandoms, 
        getCarrito,
        postCarrito
    } = require('../controllers/routesController');



router.get('/productos', getProducts);

router.post('/productos', postProduct);

router.get('/productos/:id', getProduct);

router.get('/productos-test', getTestProducts)

router.get('/randoms', getRandoms)

router.get('/carrito', getCarrito)

router.post('/carrito', postCarrito)


module.exports = router;