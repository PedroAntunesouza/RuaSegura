package com.meuprojeto.apiruasegura.controller;

import com.meuprojeto.apiruasegura.entity.User;
import com.meuprojeto.apiruasegura.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService service;

    @PostMapping("/create")
    public User criar(@RequestBody User user) {
        return service.create(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            User encontrado = service.login(user);
            return ResponseEntity.ok(encontrado); // retorna o User como está
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    @GetMapping("/returnAll")
    public ResponseEntity<List<User>> getAll(){
        return ResponseEntity.ok(service.returnAll());
    }
}

