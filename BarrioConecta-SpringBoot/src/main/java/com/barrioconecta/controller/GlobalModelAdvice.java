package com.barrioconecta.controller;

import com.barrioconecta.repository.NotificacionRepository;
import com.barrioconecta.util.Catalogos;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.List;

/** Datos disponibles en todas las vistas: avisos sin leer y listas de opciones. */
@ControllerAdvice
public class GlobalModelAdvice {
    private final NotificacionRepository notificaciones;

    public GlobalModelAdvice(NotificacionRepository notificaciones) { this.notificaciones = notificaciones; }

    @ModelAttribute("noLeidas")
    public long noLeidas(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return 0;
        Object id = session.getAttribute("usuarioId");
        return id instanceof Long ? notificaciones.countByUsuarioIdAndLeidaFalse((Long) id) : 0;
    }

    @ModelAttribute("catServicio") public List<String> catServicio() { return Catalogos.CATEGORIAS_SERVICIO; }
    @ModelAttribute("catFavor") public List<String> catFavor() { return Catalogos.CATEGORIAS_FAVOR; }
    @ModelAttribute("catEmergencia") public List<String> catEmergencia() { return Catalogos.CATEGORIAS_EMERGENCIA; }
    @ModelAttribute("opcionesDisponibilidad") public List<String> disponibilidad() { return Catalogos.DISPONIBILIDAD; }
}
