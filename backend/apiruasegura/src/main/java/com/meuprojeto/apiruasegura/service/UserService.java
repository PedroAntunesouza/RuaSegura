package com.meuprojeto.apiruasegura.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.meuprojeto.apiruasegura.entity.User;
import com.meuprojeto.apiruasegura.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository repository;

    public User create(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Email obrigatório");
        }

        if (repository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado");
        }

        if (user.getAtivo() == null) {
            user.setAtivo(true);
        }

        LocalDateTime now = LocalDateTime.now();
        user.setCriadoEm(now);
        user.setAtualizadoEm(now);

        return repository.save(user);
    }

    public User login(User user) {
        User encontrado = null;

        // Tenta encontrar pelo email
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            encontrado = repository.findByEmail(user.getEmail()).orElse(null);
        }

        // Se não achou pelo email, tenta pelo name
        if (encontrado == null && user.getName() != null && !user.getName().isBlank()) {
            encontrado = repository.findByName(user.getName()).orElse(null);
        }

        if (encontrado == null) {
            throw new RuntimeException("Usuário não encontrado");
        }

        if (!encontrado.getSenha().equals(user.getSenha())) {
            throw new RuntimeException("Senha incorreta");
        }

        return encontrado;
    }

    public List<User> returnAll(){
        return repository.findAll();
    }
}