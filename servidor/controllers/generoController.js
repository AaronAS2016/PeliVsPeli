const conexion = require("../conexiondb")

const buscarGeneros = (req, res) => {
    const sql = "SELECT * FROM genero"
    
    conexion.query(sql, (error, resultado, fields) => {
        if (error) {
            console.log("Hubo un error en la consulta", error.message)
            return res.status(404).send("Hubo un error en la consulta")
        }
        res.send(JSON.stringify(resultado))
    })
}

module.exports = {
    buscarGeneros
}