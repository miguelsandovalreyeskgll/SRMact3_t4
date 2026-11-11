package com.srm.actividad3.repositorio;

import com.srm.actividad3.modelo.Alumno;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlumnoRepository extends JpaRepository<Alumno, Long> { }
