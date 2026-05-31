package com.meuprojeto.apiruasegura.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.meuprojeto.apiruasegura.entity.PlaceVisited;
import com.meuprojeto.apiruasegura.service.PlaceVisitedService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/visit")
public class PlaceVisitedController {

    @Autowired
    private PlaceVisitedService service;

    @PostMapping("/create")
    public ResponseEntity<PlaceVisited> create(@RequestBody PlaceVisited placeVisited,
                                               @RequestParam(required = false) String email) {
        return ResponseEntity.ok(service.createVisit(placeVisited, email));
    }

    @GetMapping("/returnAll")
    public ResponseEntity<List<PlaceVisited>> returnAll() {
        return ResponseEntity.ok(service.returnAll());
    }

    @GetMapping("/list")
    public ResponseEntity<List<PlaceVisited>> listByEmailOrAuthor(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String author) {
        return ResponseEntity.ok(service.findByEmailOrAuthor(email, author));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<PlaceVisited> update(@PathVariable Long id, @RequestBody PlaceVisited placeVisited) {
        return ResponseEntity.ok(service.updateVisit(id, placeVisited));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteVisit(id);
        return ResponseEntity.noContent().build();
    }
}
