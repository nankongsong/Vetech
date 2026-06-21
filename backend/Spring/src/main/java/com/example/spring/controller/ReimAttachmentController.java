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
                "status", attachment.getStatus(),
                "creationTime", attachment.getCreationTime()
        ));
    }

    /** 上传到临时区（status=0，不关联报销单） */
    @PostMapping("/attachment/temp")
    public Result<Map<String, Object>> uploadTemp(@RequestParam("file") MultipartFile file) {
        ReimAttachment attachment = attachmentService.uploadTemp(file);
        return Result.success(Map.of(
                "id", attachment.getId(),
                "fileName", attachment.getFileName(),
                "fileSize", attachment.getFileSize(),
                "contentType", attachment.getContentType(),
                "status", attachment.getStatus(),
                "creationTime", attachment.getCreationTime()
        ));
    }

    /** 确认临时附件（设置 mainId + status=1） */
    @PutMapping("/{mainId}/attachment/confirm")
    public Result<Void> confirmAttachments(
            @PathVariable Long mainId,
            @RequestBody List<Long> attachmentIds) {
        attachmentService.confirmAttachments(mainId, attachmentIds);
        return Result.success("确认成功", null);
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

    /** 删除临时附件（未关联报销单的） */
    @DeleteMapping("/attachment/temp/{attachId}")
    public Result<Void> deleteTemp(@PathVariable Long attachId) {
        attachmentService.delete(attachId);
        return Result.success("删除成功", null);
    }
}
