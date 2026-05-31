package com.meuprojeto.apiruasegura.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.meuprojeto.apiruasegura.entity.PlaceVisited;

public interface PlaceVisitedRepository extends JpaRepository<PlaceVisited, Long> {
    @Query("SELECT p FROM PlaceVisited p WHERE p.user.email = :email")
    List<PlaceVisited> findByUserEmail(@Param("email") String email);

    List<PlaceVisited> findByAuthor(String author);
}
