package com.example.spring.service;

import com.example.spring.entity.ReimAttachment;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ReimAttachmentService {

    ReimAttachment upload(Long mainId, MultipartFile file);

    void download(Long attachId, jakarta.servlet.http.HttpServletResponse response);

    List<ReimAttachment> listByMainId(Long mainId);

    void delete(Long attachId);
}
