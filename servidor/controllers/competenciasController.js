const conexion = require("../conexiondb")

const buscarCompetencias = (req,res) =>{
  const sql = `SELECT * FROM competencia`
  conexion.query(sql, (error, resultado, fields) => {
    if(error){
      console.log("Hubo un error en la consulta", error.message)
      return res.status(404).send("Hubo un error en la consulta")
    } 
    res.status(200).send(JSON.stringify(resultado))
  })
}

const buscarCompetencia = (req,res) => {
  const idCompetencia = req.params.id
  const sql = `SELECT competencia.id, competencia.nombre, genero.nombre genero, director.nombre director, actor.nombre actor FROM competencia LEFT JOIN genero ON genero_id = genero.id LEFT JOIN director ON director_id= director.id LEFT JOIN actor ON actor_id= actor.id WHERE competencia.id = ${idCompetencia}`  
  conexion.query(sql, (error, resultado, fields) => {
    if (error) {
      console.log("Hubo un error en la consulta", error.message)
      return res.status(404).send("Hubo un error en la consulta")
    }
    if (resultado.length === 0) {
        return res.status(404).send("No se encontro ninguna competencia asociada a este id")
    }
    
    let response = {
        'id': resultado,
        'nombre': resultado[0].nombre,
        'genero_nombre': resultado[0].genero,
        'actor_nombre': resultado[0].actor,
        'director_nombre': resultado[0].director
    }
    return res.status(200).send(JSON.stringify(response))
  })
}

const buscarPeliculas = (req, res) => {
  const idCompetencia = req.params.id
  buscarInformacionCompetencia(idCompetencia, (resultado, error) =>{
    if (error) {
      console.log("Hubo un error en la consulta", error.message)
      return res.status(404).send("Hubo un error en la consulta")
    }
    if (resultado.length === 0) {
        return res.status(404).send("No se encontro ninguna competencia asociada a este id")
    }
    const competencia = resultado[0]
    let sql = "SELECT pelicula.id,pelicula.poster,pelicula.titulo FROM pelicula", 
        join = "", 
        where = "" 
      
    if (competencia.actor_id){
        join += " INNER JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id" 
        where += ` WHERE actor_pelicula.actor_id = ${competencia.actor_id}`
    } 
    
    if (competencia.director_id){
        join += " INNER JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id" 
        where+= (where.length > 0) ? " AND " : " WHERE "
        where+=  `director_pelicula.director_id = ${competencia.director_id}`
    } 
    if (competencia.genero_id){
        where+= (where.length > 0) ? " AND " : " WHERE "
        where += `pelicula.genero_id = ${competencia.genero_id}`
    }

    sql += join + where + " ORDER BY FLOOR(1 + RAND() * 100)"

    conexion.query(sql, (error, resultado, fields) => {
        if (error) {
            console.log("Hubo un error en la consulta", error.message)
            return res.status(404).send("Hubo un error en la consulta")
        }
        if(resultado.length == 0){
          return res.status(404).send("No se encontraron peliculas")
        }

        const response = {
            'competencia': competencia.nombre,
            'peliculas': resultado
        }
        res.status(200).send(JSON.stringify(response))
    })             
  })
}

const buscarInformacionCompetencia = (idCompetencia, enviarResultados) => {
  let sql = `SELECT * FROM competencia WHERE id = ${idCompetencia}`
  conexion.query(sql, (error, resultado, fields) => {
    if (error) {
      throw error
    }
    return enviarResultados(resultado)
  })
}

const agregarVoto = (req,res) => {
  const idCompetencia = req.params.id,
        idPelicula = req.body.idPelicula
  buscarInformacionCompetencia(idCompetencia, (resultado, error) =>{
    if (error) {
      console.log("Hubo un error en la consulta", error.message)
      return res.status(404).send("Hubo un error en la consulta")
    }
    if (resultado.length === 0) {
        return res.status(404).send("No se encontro ninguna competencia asociada a este id")
    }
    sql = `SELECT * FROM pelicula WHERE id = ${idPelicula}`
    
    conexion.query(sql, (error, resultado, fields) => {
        if (error) {
            console.log("Hubo un error en la consulta", error.message)
            return res.status(404).send("Hubo un error en la consulta")
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna pelicula con este id")
            return res.status(404).send("No se encontro ninguna pelicula con este id")
        }

        sql = `INSERT INTO voto ( id_competencia, id_pelicula ) VALUES (${idCompetencia},${idPelicula})`

        conexion.query(sql,(error, resultado, fields) => {
            if (error) {
                console.log("Hubo un error en la insercion", error.message)
                return res.status(500).send(error.message)
            }
            res.status(200).send({data:"Se voto correctamente"})
        })
     })
  })
}

const buscarResultados = (req, res) =>{
   const idCompetencia = req.params.id
   buscarInformacionCompetencia(idCompetencia, (resultado, error) =>{
      if (error) {
        console.log("Hubo un error en la consulta", error.message)
        return res.status(404).send("Hubo un error en la consulta")
      }

      if (resultado.length === 0) {
          console.log("No se encontro ninguna competencia con este id")
          return res.status(404).send("No se encontro ninguna competencia con este id")
      }
      const competencia = resultado[0]

      let sql = `SELECT voto.id_pelicula, pelicula.poster, pelicula.titulo, COUNT(id_pelicula) As votos FROM voto INNER JOIN pelicula ON voto.id_pelicula = pelicula.id WHERE voto.id_competencia = ${idCompetencia}  GROUP BY voto.id_pelicula ORDER BY COUNT(id_pelicula) DESC LIMIT 3`

      conexion.query(sql, (error, resultado, fields) => {
          if (error) {
              console.log("Hubo un error en la consulta", error.message)
              return res.status(404).send("Hubo un error en la consulta")
          }
          const response = {
              'competencia': competencia.nombre,
              'resultados': resultado
          }
          res.status(200).send(JSON.stringify(response))    
      })             
   })
}

const agregarCompetencia = (req, res) => {
  const nombreCompetencia = req.body.nombre,
  idGenero = req.body.genero,
  idDirector = req.body.director,
  idActor = req.body.actor 

  if (!nombreCompetencia) {
      console.log("Debe completar el nombre de la competencia")
      return res.status(422).send("Debe completar el nombre de la competencia")    
  }

  let sql = `SELECT * FROM competencia WHERE nombre = 'nombreCompetencia'`

  conexion.query(sql, (error, resultado, fields) => {
      if (error) {
          console.log("Hubo un error en la consulta", error.message)
          return res.status(404).send("Hubo un error en la consulta")
      }

      if (resultado.length === 1) {
          console.log("Ya hay una competencia con este nomnbre")
          return res.status(422).send("Ya hay una competencia con este nomnbre")
      }

      let sql = "SELECT count(pelicula.id) As cantidad FROM pelicula", 
      join = "", 
      where = "", 
      campos = "nombre", 
      valores = `) VALUES ('${nombreCompetencia}'`

      if (idGenero > 0) {
          where+= (where.length > 0) ? " AND " : " WHERE "
          where += `pelicula.genero_id = ${idGenero}`
          campos += ",genero_id"
          valores += `, ${idGenero}`
      }
  
      if (idDirector > 0) {
          join += " INNER JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id" 
          where+= (where.length > 0) ? " AND " : " WHERE "
          where +=  `director_pelicula.director_id = ${idDirector}`
          campos += ",director_id"
          valores += `,${idDirector}`
      }
  
      if (idActor > 0) {
          join += " INNER JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id" 
          where+= (where.length > 0) ? " AND " : " WHERE "
          where += `actor_pelicula.actor_id = ${idActor}`
          campos += `,actor_id`
          valores += `,${idActor}`
      }

      sql += join + where
      
      conexion.query(sql, (error, resultado, fields) => {
          if (error) {
              console.log("Hubo un error en la consulta", error.message)
              return res.status(404).send("Hubo un error en la consulta")
          }
          
          if (resultado.length === 0 || resultado[0].cantidad < 2) {
              console.log("Con este criterio no hay 2 peliculas como minimo")
              return res.status(422).send("Con este criterio no hay 2 peliculas como minimo")
          }
  
          sql = `INSERT INTO competencia (${campos} ${valores})`

          conexion.query(sql, (error, resultado, fields) => {
              if (error) {
                  console.log("Hubo un error en la consulta", error.message)
                  return res.status(404).send("Hubo un error en la consulta")
              }
  
              res.status(200).send()    
          })                
      })        
  })
}

const eliminarVotos = (req, res) => {
  const idCompetencia = req.params.id 

  let sql = `DELETE FROM voto WHERE voto.id_competencia = ${idCompetencia}`

  conexion.query(sql, (error, resultado, fields) => {
      if (error) {
          console.log("Hubo un error en la eliminacion de los votos", error.message)
          return res.status(500).send("Hubo un error en la eliminacion de los votos")
      }
      res.status(200).send({data:"Se restableció los votos"})    
  })         
}

const eliminarCompetencia = (req, res) => {
  const idCompetencia = req.params.id
  buscarInformacionCompetencia(idCompetencia, (resultado,error) =>{
      if (error) {
          console.log("Hubo un error en la consulta", error.message)
          return res.status(404).send("Hubo un error en la consulta")
      }

      if (resultado.length === 0) {
          console.log("No se encontro ninguna competencia con este id")
          return res.status(404).send("No se encontro ninguna competencia con este id")
      }

      let sql = `DELETE FROM voto WHERE voto.id_competencia = ${idCompetencia}`

      conexion.query(sql, (error, resultado, fields) => {
          if (error) {
              console.log("Hubo un error en la eliminacion de los votos", error.message)
              return res.status(500).send("Hubo un error en la eliminacion de los votos")
          }

          let sql = `DELETE FROM competencia WHERE id = ${idCompetencia}`

          conexion.query(sql, (error, resultado, fields) => {
              if (error) {
                  console.log("Hubo un error en la eliminacion de la competencia", error.message)
                  return res.status(500).send("Hubo un error en la eliminacion de la competencia")
              }
              res.status(200).send()  
          })              
      }) 
  })
}

const editarCompetencia = (req, res) => {
  const idCompetencia = req.params.id, 
        nombreCompetencia = req.body.nombre

  if (!nombreCompetencia) {
      console.log("Debe completar el nombre de la competencia")
      return res.status(422).send("Debe completar el nombre de la competencia")   
  }

  let sql = `SELECT * FROM competencia WHERE nombre = '${nombreCompetencia}' AND id <> ${idCompetencia}`

  conexion.query(sql, (error, resultado, fields) => {
      if (error) {
          console.log("Hubo un error en la consulta", error.message)
          return res.status(404).send("Hubo un error en la consulta")
      }

      if (resultado.length === 1) {
          console.log("Ya hay otra competencia con este nomnbre")
          return res.status(422).send("Ya hay otra competencia con este nomnbre")
      }


      buscarInformacionCompetencia(idCompetencia, (resultado, error)=>{
          if (error) {
              console.log("Hubo un error en la consulta", error.message)
              return res.status(404).send("Hubo un error en la consulta")
          }

          if (resultado.length === 0) {
              console.log("No se encontro ninguna competencia con este id")
              return res.status(404).send("No se encontro ninguna competencia con este id")
          }
      
          let sql = `UPDATE competencia SET nombre = '${nombreCompetencia}' WHERE id = ${idCompetencia}`

          conexion.query(sql, (error, resultado, fields) => {
              if (error) {
                  console.log("Hubo un error en la modificacion de la competencia", error.message)
                  return res.status(500).send("Hubo un error en la modificacion de la competencia")
              }
              res.status(200).send()    
          })                
      })             
  })
}


module.exports = {
  buscarCompetencias,
  buscarCompetencia,
  eliminarCompetencia,
  editarCompetencia,
  agregarVoto,
  buscarResultados,
  buscarPeliculas,
  agregarCompetencia,
  eliminarVotos,
}