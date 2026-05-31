package com.meuprojeto.apiruasegura.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.meuprojeto.apiruasegura.entity.PlaceVisited;
import com.meuprojeto.apiruasegura.entity.User;
import com.meuprojeto.apiruasegura.repository.PlaceVisitedRepository;
import com.meuprojeto.apiruasegura.repository.UserRepository;

@Service
public class PlaceVisitedService {

    @Autowired
    private PlaceVisitedRepository repository;

    @Autowired
    private UserRepository userRepository;

    public PlaceVisited createVisit(PlaceVisited placeVisited, String email) {
        if (placeVisited.getProblems() == null || placeVisited.getProblems().isEmpty()) {
            throw new RuntimeException("Informe pelo menos um problema.");
        }

        if (placeVisited.getAuthor() == null || placeVisited.getAuthor().isBlank()) {
            placeVisited.setAuthor("Morador");
        }

        if (email != null && !email.isBlank()) {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            placeVisited.setUser(user);
        }

        if (placeVisited.getDate() == null) {
            placeVisited.setDate(LocalDateTime.now(ZoneId.of("America/Sao_Paulo")));
        }

        return repository.save(placeVisited);
    }

    public List<PlaceVisited> returnAll() {
        return repository.findAll();
    }

    public List<PlaceVisited> findByEmail(String email) {
        return repository.findByUserEmail(email);
    }

    public List<PlaceVisited> findByAuthor(String author) {
        return repository.findByAuthor(author);
    }

    public List<PlaceVisited> findByEmailOrAuthor(String email, String author) {
        if (author != null && !author.isBlank()) {
            return findByAuthor(author);
        }
        if (email != null && !email.isBlank()) {
            return findByEmail(email);
        }
        return returnAll();
    }

    public PlaceVisited updateVisit(Long id, PlaceVisited data) {
        PlaceVisited existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visita não encontrada"));

        if (data.getProblems() != null && !data.getProblems().isEmpty()) {
            existing.setProblems(data.getProblems());
        }
        if (data.getOtherProblem() != null) {
            existing.setOtherProblem(data.getOtherProblem());
        }
        if (data.getLocation() != null) {
            existing.setLocation(data.getLocation());
        }
        if (data.getDetails() != null) {
            existing.setDetails(data.getDetails());
        }
        if (data.getAuthor() != null) {
            existing.setAuthor(data.getAuthor());
        }
        if (data.getLatitude() != null) {
            existing.setLatitude(data.getLatitude());
        }
        if (data.getLongitude() != null) {
            existing.setLongitude(data.getLongitude());
        }
        if (data.getUriImagem() != null) {
            existing.setUriImagem(data.getUriImagem());
        }

        return repository.save(existing);
    }

    public void deleteVisit(Long id) {
        repository.deleteById(id);
    }
}
