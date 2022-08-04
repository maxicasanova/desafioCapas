const faker = require("@faker-js/faker").faker
faker.locale = "es"

const getProducts = (req, res) => {
    const list = productos.getAll()
    try{
        res.render('products', {list})
    } catch (e){
        console.log(e)
        res.sendStatus(500);
    }
};


const postProduct = (req, res) => {
    const {title, price, thumbnail} = req.body;
    try {
        const prod = productos.save({title, price, thumbnail});
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.send('Ocurrio un error');
    }
}

const getProduct = (req, res) => {
    const id = Number(req.params.id);
    try {
        const prod = productos.getById(id);
        res.render('productView', prod);
    } catch (error) {
        console.log(error);
        res.send('Ocurrio un error');
    }
}

const getTestProducts = (req, res) => {
    let list = [];

    for (i=0; i<5; i++){
        let producto = {};
        producto.title = faker.commerce.productName();
        producto.thumbnail = faker.image.image();
        producto.price = faker.commerce.price();
        list.push(producto)
    }

    try{
        res.render('products', {list})
    } catch (e){
        console.log(e)
        res.sendStatus(500);
    }
}

module.exports = {
    getProducts,
    postProduct,
    getProduct,
    getTestProducts
}