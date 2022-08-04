const normalize = require("normalizr").normalize
const schema = require("normalizr").schema

function normalizeMensajes(mensajes) {
    const author = new schema.Entity(
        "author"
        );

    const mensaje = new schema.Entity(
        "mensaje",
        { author: author },
        { idAttribute: "_id" }
    );

    const schemaMensajes = new schema.Entity(
        "mensajes",
        {
        mensajes: [mensaje],
        }
    );

    const normalizedPost = normalize(
        { id: "mensajes", mensajes },
        schemaMensajes
    );

/*   print(normalizedPost) */

    return normalizedPost;
}

module.exports = normalizeMensajes;