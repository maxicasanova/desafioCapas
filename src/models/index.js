const ContenedorMongo = require('../daos/contenedorMongo');

const productos = new ContenedorMongo('productos',  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String, required: true },
});
const messages = new ContenedorMongo('mensajes', {
    author: {
        id: { type: String, required: true },
        nombre: { type: String, required: false },
        apellido: { type: String, required: false },
        edad: { type: Number, required: false },
        alias: { type: String, required: false },
        avatar: { type: String, required: false },
        admin:{type:Boolean, default:false}
    },
    text: { type: String, required: true }
});

const carritos = new ContenedorMongo('carritos',  {
    user: { type: String, required: true },
    products: { type: Array, required: false }
});

module.exports = {
    productos,
    carritos,
    messages
}