const express = require("express")
const bodyParser = require("body-parser")
const cors = require('cors')
const competenciasController = require("./controllers/competenciasController")
const actorController = require("./controllers/actorController")
const generoController = require("./controllers/generoController")
const directorController = require("./controllers/directorController")
const app = express()

app.use(cors())

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json())

app.get("/competencias", competenciasController.buscarCompetencias)
app.get('/directores', directorController.buscarDirectores)
app.get('/actores', actorController.buscarActores)
app.get('/generos', generoController.buscarGeneros)
app.get('/competencias/:id', competenciasController.buscarCompetencia)
app.get("/competencias/:id/peliculas", competenciasController.buscarPeliculas)
app.get("/competencias/:id/resultados", competenciasController.buscarResultados)
app.post('/competencias', competenciasController.agregarCompetencia)
app.post('/competencias/:id/voto', competenciasController.agregarVoto)
app.put('/competencias/:id', competenciasController.editarCompetencia)
app.delete('/competencias/:id/votos', competenciasController.eliminarVotos)
app.delete('/competencias/:id', competenciasController.eliminarCompetencia)

const puerto = 8080

app.listen(puerto, () => {
  console.log( "Escuchando en el puerto " + puerto )
})