const mongoose = require("mongoose");
const config = require("../config");
const logger = require("../logs/logger")

const main = async () => {
    await mongoose.connect(config.mongoconnect)
}

main();

class ContenedorMongo {
    constructor(nombreColeccion, schema) {
        this.model = mongoose.model(nombreColeccion, new mongoose.Schema(schema, {timestamps: true}));
    }
    async save(obj) {
        try {
            const model = new this.model(obj);
            await model.save();
            logger.info("Mensaje guardado con exito");
        } catch (error) {
            logger.error("Error guardando mensaje: ", error)
            return {error: "Error guardando mensaje."}
        }
    }
    async getAll(){
        try{
            const data  = await this.model.find({})
            logger.info("Productos cargados con exito");
            return data;
        } catch (error) {
            logger.error("Error cargando productos.", error)
            return {error: "Error guardando productos"}
        }
    }
    async getById(id){
        try{
            console.log(id)
            const data  = await this.model.findOne({_id:id})
            logger.info("Se encontro el producto con id", id);
            return data;
        } catch (error) {
            logger.error("Error buscando producto", error)
            return {error: "Error buscando producto"}
        }
    }
    async getByUser(user){
        try{
            const data  = await this.model.findOne({user:user})
            logger.info("Se la informacion del usuario", user);
            return data;
        } catch (error) {
            logger.error("Error cargando productos.", error)
            return {error: "Error guardando productos"}
        }
    }
    async updateByUser(user, products) {
        try{
            const data = await this.model.updateOne({user}, {products})
            logger.info("Actualizado con exito");
            return data;
        } catch (error) {
            logger.error("Error actualizando carrito", error)
            return {error: "Error actualizando carrito"}
        }
    }
}

module.exports = ContenedorMongo;