use competencias;
DROP TABLE IF EXISTS competencia;

CREATE TABLE competencia(
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(30) NOT NULL,
  PRIMARY KEY(`id`)
);

DROP TABLE IF EXISTS voto;
CREATE TABLE voto (
  `id` INT NOT NULL AUTO_INCREMENT,
  `id_competencia` INT(11) NOT NULL,
  `id_pelicula` int(11) unsigned NOT NULL,
  PRIMARY KEY(`id`)
 );
 
ALTER TABLE voto ADD FOREIGN KEY (id_competencia) REFERENCES competencia (id);

ALTER TABLE voto ADD FOREIGN KEY (id_pelicula) REFERENCES pelicula (id);



ALTER TABLE competencia ADD COLUMN genero_id INT (11) UNSIGNED, ADD FOREIGN KEY (genero_id) REFERENCES genero(id);

ALTER TABLE competencia ADD COLUMN director_id INT (11) UNSIGNED, ADD FOREIGN KEY (director_id) REFERENCES director(id);

ALTER TABLE competencia ADD COLUMN actor_id INT (11) UNSIGNED, ADD FOREIGN KEY (actor_id) REFERENCES actor(id);

INSERT INTO competencia (`nombre`, `genero_id`, `director_id`, `actor_id`) VALUES('Mejor pelicula de comedia', 2, 3565, 13);
INSERT INTO competencia (`nombre`, `genero_id`, `director_id`, `actor_id`) VALUES('Mejor pelicula de accion', 1, null, null);
