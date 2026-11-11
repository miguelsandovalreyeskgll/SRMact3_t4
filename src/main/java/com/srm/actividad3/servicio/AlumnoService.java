package com.srm.actividad3.servicio;

import java.util.List;
import com.srm.actividad3.dto.AlumnoDTO;
import com.srm.actividad3.modelo.Alumno;
import com.srm.actividad3.modelo.Escuela;
import com.srm.actividad3.repositorio.AlumnoRepository;
import com.srm.actividad3.repositorio.EscuelaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AlumnoService {
    private final AlumnoRepository alumnos;
    private final EscuelaRepository escuelas;

    public AlumnoService(AlumnoRepository alumnos, EscuelaRepository escuelas) {
        this.alumnos = alumnos;
        this.escuelas = escuelas;
    }

    @Transactional(readOnly = true)
    public List<AlumnoDTO> listar() {
        return alumnos.findAll().stream().map(this::convertir).toList();
    }

    @Transactional(readOnly = true)
    public AlumnoDTO obtener(Long id) {
        return convertir(buscar(id));
    }

    @Transactional
    public AlumnoDTO crear(AlumnoDTO datos) {
        Alumno alumno = new Alumno();
        llenar(alumno, datos);
        return convertir(alumnos.save(alumno));
    }

    @Transactional
    public AlumnoDTO actualizar(Long id, AlumnoDTO datos) {
        Alumno alumno = buscar(id);
        llenar(alumno, datos);
        return convertir(alumnos.save(alumno));
    }

    @Transactional
    public void eliminar(Long id) {
        alumnos.delete(buscar(id));
    }

    private Alumno buscar(Long id) {
        return alumnos.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe el alumno " + id));
    }

    private void llenar(Alumno alumno, AlumnoDTO datos) {
        if (datos.nombre() == null || datos.nombre().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre es obligatorio");
        }
        if (datos.escuelaId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "escuelaId es obligatorio");
        }
        Escuela escuela = escuelas.findById(datos.escuelaId()).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.BAD_REQUEST, "La escuela no existe"));
        alumno.setNombre(datos.nombre().trim());
        alumno.setEscuela(escuela);
    }

    private AlumnoDTO convertir(Alumno alumno) {
        return new AlumnoDTO(
            alumno.getId(),
            alumno.getNombre(),
            alumno.getEscuela().getId(),
            alumno.getEscuela().getNombre()
        );
    }
}
