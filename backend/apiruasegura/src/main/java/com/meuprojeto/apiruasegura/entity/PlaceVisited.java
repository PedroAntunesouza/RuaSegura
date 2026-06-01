package com.meuprojeto.apiruasegura.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class PlaceVisited {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    @CollectionTable(name = "place_visited_problems", joinColumns = @JoinColumn(name = "place_visited_id"))
    @Column(name = "problem")
    private List<String> problems = new ArrayList<>();

    @Column
    private String otherProblem;

    @Column
    private String location;

    @Column
    private String details;

    @Column
    private String author;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column
    private String uriImagem;

    @Column
    private LocalDateTime date;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    @JsonProperty("userEmail")
    public String getUserEmail() {
        return user != null ? user.getEmail() : null;
    }

    public PlaceVisited() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<String> getProblems() {
        return problems;
    }

    public void setProblems(List<String> problems) {
        this.problems = problems;
    }

    public String getOtherProblem() {
        return otherProblem;
    }

    public void setOtherProblem(String otherProblem) {
        this.otherProblem = otherProblem;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    @JsonProperty("photoUri")
    public String getUriImagem() {
        return uriImagem;
    }

    @JsonProperty("photoUri")
    public void setUriImagem(String uriImagem) {
        this.uriImagem = uriImagem;
    }

    @JsonProperty("createdAt")
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    public LocalDateTime getDate() {
        return date;
    }

    @JsonProperty("createdAt")
    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
