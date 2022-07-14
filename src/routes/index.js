const {Router} = require('express');
const router = Router();

const {
        getProducts, 
        // getHome, 
        postProduct, 
        getProduct
    } = require('../controllers/routesController');


// router.get('/', getHome);

router.get('/productos', getProducts);

router.post('/productos', postProduct);

// en funcion del id

router.get('/productos/:id', getProduct);


module.exports = router;