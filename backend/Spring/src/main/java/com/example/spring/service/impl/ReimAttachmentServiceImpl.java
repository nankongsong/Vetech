package com.example.spring.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.spring.entity.ReimAttachment;
import com.example.spring.exception.BizException;
import com.example.spring.mapper.ReimAttachmentMapper;
import com.example.spring.service.ReimAttachmentService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ReimAttachmentServiceImpl implements ReimAttachmentService {

    @Autowired
    private ReimAttachmentMapper attachmentMapper;

    @Value("${vetech.upload.path:./uploads}")
    private String uploadPath;

    private Path resolvedUploadDir;

    @PostConstruct
    public void init() {
        Path p = Paths.get(uploadPath);
        if (!p.isAbsolute()) {
            p = Paths.get(System.getProperty("user.dir"), uploadPath);
        }
        resolvedUploadDir = p.normalize();
        log.info("附件存储路径：{}", resolvedUploadDir);
    }

    @Override
    public ReimAttachment upload(Long mainId, MultipartFile file) {
        if (mainId == null) throw new BizException("报销单ID不能为空");
        if (file.isEmpty()) throw new BizException("上传文件不能为空");

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            originalName = "unknown";
        }

        String ext = "";
        int dot = originalName.lastIndexOf('.');
        if (dot > 0) ext = originalName.substring(dot);

        String storedName = UUID.randomUUID().toString().replace("-", "") + ext;

        try {
            if (!Files.exists(resolvedUploadDir)) Files.createDirectories(resolvedUploadDir);

            Path target = resolvedUploadDir.resolve(storedName);
            file.transferTo(target.toFile());

            ReimAttachment attachment = new ReimAttachment();
            attachment.setMainId(mainId);
            attachment.setFileName(originalName);
            attachment.setFilePath(storedName);
            attachment.setFileSize(file.getSize());
            attachment.setContentType(file.getContentType());
            attachment.setCreationTime(LocalDateTime.now());

            attachmentMapper.insert(attachment);
            return attachment;

        } catch (BizException e) {
            throw e;
        } catch (Exception e) {
            log.error("文件上传失败：", e);
            throw new BizException("文件上传失败：" + e.getMessage());
        }
    }

    @Override
    public void download(Long attachId, HttpServletResponse response) {
        ReimAttachment attachment = attachmentMapper.selectById(attachId);
        if (attachment == null) throw new BizException(404, "附件不存在");

        Path filePath = resolvedUploadDir.resolve(attachment.getFilePath());
        File file = filePath.toFile();
        if (!file.exists()) throw new BizException(404, "附件文件已丢失");

        response.setContentType(attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream");
        response.setHeader("Content-Disposition", "attachment;filename=" + URLEncoder.encode(attachment.getFileName(), java.nio.charset.StandardCharsets.UTF_8));
        response.setContentLengthLong(attachment.getFileSize());

        try (FileInputStream fis = new FileInputStream(file); OutputStream os = response.getOutputStream()) {
            byte[] buffer = new byte[8192];
            int len;
            while ((len = fis.read(buffer)) != -1) os.write(buffer, 0, len);
            os.flush();
        } catch (Exception e) {
            log.error("文件下载失败：", e);
            throw new BizException("文件下载失败");
        }
    }

    @Override
    public List<ReimAttachment> listByMainId(Long mainId) {
        return attachmentMapper.selectList(
                new LambdaQueryWrapper<ReimAttachment>()
                        .eq(ReimAttachment::getMainId, mainId)
                        .orderByAsc(ReimAttachment::getId));
    }

    @Override
    public void delete(Long attachId) {
        ReimAttachment attachment = attachmentMapper.selectById(attachId);
        if (attachment == null) throw new BizException(404, "附件不存在");

        try {
            Path filePath = resolvedUploadDir.resolve(attachment.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            log.warn("删除附件文件失败：{}", e.getMessage());
        }

        attachmentMapper.deleteById(attachId);
    }
}
