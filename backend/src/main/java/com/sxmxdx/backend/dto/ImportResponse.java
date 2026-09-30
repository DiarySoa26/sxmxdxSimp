package com.sxmxdx.backend.dto;

public class ImportResponse {

    private boolean success;
    private String message;
    private String fileName;

    public ImportResponse() {
    }

    public ImportResponse(
            boolean success,
            String message,
            String fileName
    ) {
        this.success = success;
        this.message = message;
        this.fileName = fileName;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}