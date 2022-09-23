const faker = require("@faker-js/faker").faker;
faker.locale = "es";
const {fork} = require("child_process");
const {productos, carritos} = require('../models/index.js')

const getProducts =  async (req, res) => {
    const list =  await productos.getAll()
    try{
        res.render('products', {list})
    } catch (e){
        console.log(e)
        res.sendStatus(500);
    }
};


const postProduct = async (req, res) => {
    const {title, price, thumbnail} = req.body;
    try {
        const prod = await productos.save({title, price, thumbnail});
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.send('Ocurrio un error');
    }
}

const getProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const prod = await productos.getById(id);
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

const getRandoms = (req, res) => {
    const calc = fork("./utils/calcRandoms.js");

    let cant = req.query.cant;
    if (isNaN(cant)){
        cant = 1000000;
    }

    calc.send(cant);
    calc.on('message', numbers=>{
        res.json(numbers);
    })
}

const getCarrito = async (req, res) => {
    try {
        const cart = await carritos.getByUser(req.user.username).products;
        res.render('carrito', cart)
    } catch (error) {
        console.log(error);
        res.send('Ocurrio un error');
    }
}

const postCarrito = async (req, res) => {
    const {prod} = req.body;
    const cart = await carritos.getByUser(req.user.username)
    try{
        if (cart) {
            const products = cart.productos.push(prod)
            await carritos.updateByUser(req.user.username, products)
        }
        res.redirect('/api/carrito');
    } catch (error) {
        console.log(error);
        res.send('Ocurrio un error');
    }
}

module.exports = {
    getProducts,
    postProduct,
    getProduct,
    getTestProducts,
    getRandoms, 
    getCarrito,
    postCarrito
}