const {Router} = require('express');
const productRouter = Router();

const {
        getProducts, 
        postProduct, 
        getProduct
    } = require('../controllers/routesController');



productRouter.get('/', getProducts);

productRouter.post('/', postProduct);

productRouter.get('/:id', getProduct);

// productRouter.get('/productos-test', getTestProducts)

// productRouter.get('/randoms', getRandoms)

module.exports = productRouter;