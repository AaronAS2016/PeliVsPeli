const conexion = require("../conexiondb")

const buscarCompetencias = (req,res) =>{
  const sql = `SELECT *
               FROM competencia`
  conexion.query(sql, (error, resultado, fields) =>{
    if(error){
      console.log("Hubo un error en la consulta", error.message)
      return res.status(404).send("Hubo un error en la consulta")
    } 
    res.status(200).send(JSON.stringify(resultado))
  })
}

const buscarCompetencia = (req, res) => {
  const idCompetencia = req.params.id; 
  buscarInformacionCompetencia(idCompetencia, function(resultado, error){
    if (error) {
      console.log("Hubo un error en la consulta", error.message);
      return res.status(404).send("Hubo un error en la consulta");
    }
    if (resultado.length === 0) {
        return res.status(404).send("No se encontro ninguna competencia asociada a este id");
    }
    const competencia = resultado[0];
    let sql = "SELECT pelicula.id,pelicula.poster,pelicula.titulo FROM pelicula", 
        join = "", //Consultas join para agregar datos de las tablas en el caso que sea necesario
        where = ""; //Fijamos que datos van a recibir de esas tablas
      
    if (competencia.actor_id){
        join += " INNER JOIN actor_pelicula ON pelicula.id = actor_pelicula.pelicula_id" ;
        where += " WHERE actor_pelicula.actor_id = " + competencia.actor_id;
    } 
    
    if (competencia.director_id){
        join += " INNER JOIN director_pelicula ON pelicula.id = director_pelicula.pelicula_id" ;
        if (where.length > 0){
            where += " AND ";
        } else {
            where += " WHERE ";
        }
        where +=  "director_pelicula.director_id = " + competencia.director_id;
    } 
    if (competencia.genero_id){
        if (where.length > 0){
            where += " AND ";
        } else {
            where += " WHERE ";
        }
        where += "pelicula.genero_id = " + competencia.genero_id;
    }

    if (competencia.anio){
        if (where.length > 0){
            where += " AND ";
        } else {
            where += " WHERE ";
        }
        where += "pelicula.anio = " + competencia.anio;
    }
  //Juntamos todas las partes de la consulta
    sql += join + where + " ORDER BY FLOOR(1 + RAND() * 100000)";
  //Realizamos la peticion para las peliculas
    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }
        if(resultado.length == 0){
          return res.status(404).send("No se encontraron peliculas");
        }

        const response = {
            'competencia': competencia.nombre,
            'peliculas': resultado
        };
        res.status(200).send(JSON.stringify(response));    
    });             
  })
}

const buscarInformacionCompetencia = (idCompetencia, enviarResultados) => {
  let sql = "SELECT * FROM competencia WHERE id = " + idCompetencia;
  conexion.query(sql, function(error, resultado, fields) {
    if (error) {
      throw error;
    }
    return enviarResultados(resultado);
  })
}

const test = (req, res) =>{
  let resultado = buscarInformacionCompetencia(2, function(resultado){
    res.status(200).send(JSON.stringify(resultado));
  });
}

const agregarVoto = (req,res) => {
  const idCompetencia = req.params.id,
        idPelicula = req.body.idPelicula;
  buscarInformacionCompetencia(idCompetencia, function(resultado, error){
    if (error) {
      console.log("Hubo un error en la consulta", error.message);
      return res.status(404).send("Hubo un error en la consulta");
    }
    if (resultado.length === 0) {
        return res.status(404).send("No se encontro ninguna competencia asociada a este id");
    }
    sql = "SELECT * FROM pelicula WHERE id = " + idPelicula;
    
    conexion.query(sql, function(error, resultado, fields) {
        if (error) {
            console.log("Hubo un error en la consulta", error.message);
            return res.status(404).send("Hubo un error en la consulta");
        }

        if (resultado.length === 0) {
            console.log("No se encontro ninguna pelicula con este id");
            return res.status(404).send("No se encontro ninguna pelicula con este id");
        }

        sql = "INSERT INTO voto ( id_competencia, id_pelicula ) VALUES (" + idCompetencia + "," + idPelicula + ")";

        conexion.query(sql, function(error, resultado, fields) {
            if (error) {
                console.log("Hubo un error en la insercion", error.message);
                return res.status(500).send(error.message);
            }
            res.status(200).send({data:"Se voto correctamente"});    
        });      
     })
  })
}

const buscarResultados = (req, res) =>{
   const idCompetencia = req.params.id;
   buscarInformacionCompetencia(idCompetencia, function(resultado, error){
      if (error) {
        console.log("Hubo un error en la consulta", error.message);
        return res.status(404).send("Hubo un error en la consulta");
      }

      if (resultado.length === 0) {
          console.log("No se encontro ninguna competencia con este id");
          return res.status(404).send("No se encontro ninguna competencia con este id");
      }
      const competencia = resultado[0];

      let sql = "SELECT voto.id_pelicula, pelicula.poster, pelicula.titulo, COUNT(id_pelicula) As votos FROM voto INNER JOIN pelicula ON voto.id_pelicula = pelicula.id WHERE voto.id_competencia = " + idCompetencia + " GROUP BY voto.id_pelicula ORDER BY COUNT(id_pelicula) DESC LIMIT 3";

      conexion.query(sql, function(error, resultado, fields) {
          if (error) {
              console.log("Hubo un error en la consulta", error.message);
              return res.status(404).send("Hubo un error en la consulta");
          }
          const response = {
              'competencia': competencia.nombre,
              'resultados': resultado
          };
          res.status(200).send(JSON.stringify(response));    
      });             
   })

}

module.exports = {
  buscarCompetencias,
  buscarCompetencia,
  agregarVoto,
  buscarResultados,
  test
}