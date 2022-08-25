const mongoose = require("mongoose");
const config = require("./config");

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
            const model = new this.model(obj)
            await model.save()
            console.log(`Se agrego el objeto`);
        } catch (error) {
            console.log(`No se ha podido guardar el objeto: ${error}`);
        }
    }
    async getAll(){
        try{
            const data  = await this.model.find({})
            return data;
        } catch (error) {
            console.log(`No se encontro el objeto: ${error}`);
        }
    }
}

module.exports = ContenedorMongo;