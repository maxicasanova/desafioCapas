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
}

module.exports = ContenedorMongo;