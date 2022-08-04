const {Router} = require('express');
const router = Router();

const {
        getProducts, 
        postProduct, 
        getProduct,
        getTestProducts
    } = require('../controllers/routesController');



router.get('/productos', getProducts);

router.post('/productos', postProduct);

router.get('/productos/:id', getProduct);

router.get('/productos-test', getTestProducts)


module.exports = router;