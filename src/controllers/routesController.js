// const listaProductos = require('../../utils/listaProductos');
// const Contenedor = require('../contenedor');

// const productos = new Contenedor('productos');

// async function cargarProductos () {
//     for(let i = 0; i< listaProductos.length; i++ ){
//         await productos.save(listaProductos[i]);
//     }
// }

// cargarProductos();


const getProducts = (req, res) => {
    const list = productos.getAll()
    try{
        res.render('products', {list})
    } catch (e){
        console.log(e)
        res.sendStatus(500);
    }
};

// const getHome = (req, res) => {
//     res.render('form', {})
// }

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

module.exports = {
    getProducts,
    // getHome,
    postProduct,
    getProduct
}