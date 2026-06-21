package com.example.spring.controller;

import com.example.spring.entity.ReimAttachment;
import com.example.spring.service.ReimAttachmentService;
import com.example.spring.vo.Result;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reim")
public class ReimAttachmentController {

    @Autowired
    private ReimAttachmentService attachmentService;

    @PostMapping("/{mainId}/attachment")
    public Result<Map<String, Object>> upload(@PathVariable Long mainId, @RequestParam("file") MultipartFile file) {
        ReimAttachment attachment = attachmentService.upload(mainId, file);
        return Result.success(Map.of(
                "id", attachment.getId(),
                "fileName", attachment.getFileName(),
                "fileSize", attachment.getFileSize(),
                "contentType", attachment.getContentType(),
                "creationTime", attachment.getCreationTime()
        ));
    }

    @GetMapping("/{mainId}/attachment/{attachId}")
    public void download(@PathVariable Long mainId, @PathVariable Long attachId, HttpServletResponse response) {
        attachmentService.download(attachId, response);
    }

    @GetMapping("/{mainId}/attachments")
    public Result<List<ReimAttachment>> list(@PathVariable Long mainId) {
        return Result.success(attachmentService.listByMainId(mainId));
    }

    @DeleteMapping("/{mainId}/attachment/{attachId}")
    public Result<Void> delete(@PathVariable Long mainId, @PathVariable Long attachId) {
        attachmentService.delete(attachId);
        return Result.success("删除成功", null);
    }
}
