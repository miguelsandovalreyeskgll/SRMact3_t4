package com.srm.actividad3.controlador;

import java.util.List;
import com.srm.actividad3.modelo.Escuela;
import com.srm.actividad3.servicio.EscuelaService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/escuelas")
public class EscuelaController {
    private final EscuelaService servicio;

    public EscuelaController(EscuelaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Escuela> listar() {
        return servicio.listar();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Escuela crear(@RequestBody Escuela escuela) {
        return servicio.crear(escuela);
    }
}
