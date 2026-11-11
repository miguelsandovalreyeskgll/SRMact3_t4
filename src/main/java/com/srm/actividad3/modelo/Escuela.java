package com.srm.actividad3.modelo;

import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "escuela")
public class Escuela {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    // Una escuela puede tener muchos alumnos.
    @JsonIgnore
    @OneToMany(mappedBy = "escuela")
    private List<Alumno> alumnos = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public List<Alumno> getAlumnos() { return alumnos; }
    public void setAlumnos(List<Alumno> alumnos) { this.alumnos = alumnos; }
}
