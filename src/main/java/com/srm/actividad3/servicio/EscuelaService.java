package com.srm.actividad3.servicio;

import java.util.List;
import com.srm.actividad3.modelo.Escuela;
import com.srm.actividad3.repositorio.EscuelaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EscuelaService {
    private final EscuelaRepository escuelas;

    public EscuelaService(EscuelaRepository escuelas) {
        this.escuelas = escuelas;
    }

    public List<Escuela> listar() {
        return escuelas.findAll();
    }

    public Escuela crear(Escuela datos) {
        if (datos.getNombre() == null || datos.getNombre().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre es obligatorio");
        }
        Escuela escuela = new Escuela();
        escuela.setNombre(datos.getNombre().trim());
        return escuelas.save(escuela);
    }
}
