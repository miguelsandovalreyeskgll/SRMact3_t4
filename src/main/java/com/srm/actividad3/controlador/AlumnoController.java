package com.srm.actividad3.controlador;

import java.util.List;
import com.srm.actividad3.dto.AlumnoDTO;
import com.srm.actividad3.servicio.AlumnoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/alumnos")
public class AlumnoController {
    private final AlumnoService servicio;

    public AlumnoController(AlumnoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<AlumnoDTO> listar() { return servicio.listar(); }

    @GetMapping("/{id}")
    public AlumnoDTO obtener(@PathVariable Long id) { return servicio.obtener(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AlumnoDTO crear(@RequestBody AlumnoDTO datos) { return servicio.crear(datos); }

    @PutMapping("/{id}")
    public AlumnoDTO actualizar(@PathVariable Long id, @RequestBody AlumnoDTO datos) {
        return servicio.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) { servicio.eliminar(id); }
}
