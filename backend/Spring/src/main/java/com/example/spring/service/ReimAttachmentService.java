package com.example.spring.service;

import com.example.spring.entity.ReimAttachment;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ReimAttachmentService {

    /** 上传文件并关联到报销单（已确认） */
    ReimAttachment upload(Long mainId, MultipartFile file);

    /** 上传到暂存区（status=0，不关联报销单） */
    ReimAttachment uploadTemp(MultipartFile file);

    /** 将临时附件确认为正式附件（设置 mainId + status=1） */
    void confirmAttachments(Long mainId, List<Long> attachmentIds);

    void download(Long attachId, jakarta.servlet.http.HttpServletResponse response);

    /** 查询已确认的附件列表（status=1） */
    List<ReimAttachment> listByMainId(Long mainId);

    /** 删除附件（物理删除文件和DB记录） */
    void delete(Long attachId);
}
