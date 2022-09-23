const mongoose = require("mongoose");
const config = require("./config");
const logger = require("./logs/logger")

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
            const data  = await this.model.findOne({_id:id})
            logger.info("Se encontro el producto con id", id);
            return data;
        } catch (error) {
            logger.error("Error cargando productos.", error)
            return {error: "Error guardando productos"}
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
}

module.exports = ContenedorMongo;