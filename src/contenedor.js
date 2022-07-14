const knex = require('knex');

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
                } else if (tableName === 'mensajes' && !exist){
                    console.log('entre')
                    await database.schema.createTable(tableName, table => {
                        table.increments('id').primary();
                        table.string('username', 50).notNullable();
                        table.string('message', 50).notNullable();
                        table.string('fechaYHora', 50).notNullable();
                        table.string('color', 50).notNullable();
                    });
                    console.log('tabla creada')
                }
                database.destroy();
            } catch (error) {
                console.log(error);
                database.destroy();
            }
        };
        create();
    }
    async save(obj) {
        const database = knex(this.config);
        try {
            await database(this.tableName).insert(obj)
            console.log(`Se agrego el objeto`);
            database.destroy();
        } catch (error) {
            console.log(`No se ha podido guardar el objeto: ${error}`);
            database.destroy();
        }
    }
    async getById(id){
        const database = knex(this.config);
        try {
            const objeto = await database.from(this.tableName).select('*').where('id', '=', id)
            console.log(`Se encontro el objeto: ${objeto.title}`);
            database.destroy();
            return objeto[0];
        } catch (error) {
            console.log(`No se encontro el objeto: ${error}`);
            database.destroy();
            return null;
        }
    }
    async getAll(){
        try {
            const database = knex(this.config);
            const objetos = await database.from(this.tableName).select('*')
            console.log(`Se encontraron los objetos`);
            database.destroy();
            return objetos;
        } catch (error) {
            console.log(`No se encontraron los objetos: ${error}`);
            database.destroy();
            return null;
        }
    }
    
}

module.exports = Contenedor;