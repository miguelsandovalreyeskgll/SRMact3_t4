package com.srm.actividad3.dto;

// Datos que entran/salen de la API sin exponer entidades completas.
// En un POST basta enviar: nombre y escuelaId.
public record AlumnoDTO(
    Long id,
    String nombre,
    Long escuelaId,
    String escuelaNombre
) { }
