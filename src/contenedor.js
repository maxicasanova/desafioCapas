const knex = require('knex');
const logger = require("./logs/logger")

class Contenedor{
    constructor(config, tableName){
        this.tableName = tableName;
        this.config = config;

        async function create() {
            const database = knex(config);
            try {
                const exist = await database.schema.hasTable(tableName);
                if (tableName === 'productos' && !exist){
                    await database.schema.createTable(tableName, table => {
                        table.increments('id').primary();
                        table.string('title', 50).notNullable();
                        table.integer('price').notNullable();
                        table.string('thumbnail', 200).notNullable();
                    });
                    logger.info("Tabla creada con exito");
                } else if (tableName === 'mensajes' && !exist){
                    await database.schema.createTable(tableName, table => {
                        table.increments('id').primary();
                        table.string('username', 50).notNullable();
                        table.string('message', 50).notNullable();
                        table.string('fechaYHora', 50).notNullable();
                        table.string('color', 50).notNullable();
                    });
                    logger.info("Tabla creada con exito");
                }
                database.destroy();
            } catch (error) {
                logger.error("Error creando tabla: ", error);
                database.destroy();
            }
        };
        create();
    }
    async save(obj) {
        const database = knex(this.config);
        try {
            await database(this.tableName).insert(obj)
            logger.info("Producto guardado con exito");
            database.destroy();
        } catch (error) {
            logger.error("Error guardando el objeto: ", error);
            database.destroy();
        }
    }
    async getById(id){
        const database = knex(this.config);
        try {
            const objeto = await database.from(this.tableName).select('*').where('id', '=', id)
            logger.info("Se encontro el objeto: ", objeto.title);
            database.destroy();
            return objeto[0];
        } catch (error) {
            logger.error("No se encontro el objeto: ", error);
            database.destroy();
            return null;
        }
    }
    async getAll(){
        try {
            const database = knex(this.config);
            const objetos = await database.from(this.tableName).select('*')
            logger.info("Se encontro el objetos.");
            database.destroy();
            return objetos;
        } catch (error) {
            logger.error("No se encontro el objetos.");
            database.destroy();
            return null;
        }
    }
    
}

module.exports = Contenedor;