package com.sxmxdx.backend.dto;

public class LoginResponse {

    private boolean success;

    private String message;

    private Integer id;

    private String name;

    private String email;

    private String role;


    public LoginResponse() {
    }


    public LoginResponse(
        boolean success,
        String message,
        Integer id,
        String name,
        String email,
        String role
    ) {

        this.success = success;
        this.message = message;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }


    public boolean isSuccess() {
        return success;
    }


    public String getMessage() {
        return message;
    }


    public Integer getId() {
        return id;
    }


    public String getName() {
        return name;
    }


    public String getEmail() {
        return email;
    }


    public String getRole() {
        return role;
    }
}