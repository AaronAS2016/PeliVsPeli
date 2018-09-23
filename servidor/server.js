const express = require("express")
const bodyParser = require("body-parser")
const cors = require('cors')
const competenciasController = require("./controllers/competenciasController")
const app = express()

app.use(cors())

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json())

app.get("/competencias", competenciasController.buscarCompetencias)
app.get("/competencias/:id/peliculas", competenciasController.buscarCompetencia)
app.get("/competencias/:id/resultados", competenciasController.buscarResultados)
app.post('/competencias/:id/voto', competenciasController.agregarVoto);
app.get("/test", competenciasController.test);

const puerto = 8080

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
})