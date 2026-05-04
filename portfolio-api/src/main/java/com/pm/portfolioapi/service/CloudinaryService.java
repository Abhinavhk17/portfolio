package com.pm.portfolioapi.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.api.ApiResponse;
import com.cloudinary.utils.ObjectUtils;
import com.cloudinary.Transformation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud_name}") String cloudName,
            @Value("${cloudinary.api_key}") String apiKey,
            @Value("${cloudinary.api_secret}") String apiSecret) {

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public List<String> getFiles() throws Exception {
        List<String> fileUrls = new ArrayList<>();
        ApiResponse result = cloudinary.api().resources(ObjectUtils.asMap(
                "type", "upload",
                "max_results", 100
        ));

        List<Map> resources = (List<Map>) result.get("resources");
        for (Map resource : resources) {
            fileUrls.add((String) resource.get("secure_url"));
        }

        return fileUrls;
    }

    public String uploadSkillLogo(MultipartFile file, String skillName) throws IOException {
        String normalizedName = skillName == null ? "skill-logo" : skillName.trim();
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", normalizedName,
                "overwrite", true,
                "resource_type", "image",
                "transformation", new Transformation().width(64).height(64).crop("fit")
        ));
        return (String) uploadResult.get("secure_url");
    }
}
