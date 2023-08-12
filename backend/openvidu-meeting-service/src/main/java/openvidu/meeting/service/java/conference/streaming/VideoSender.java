package openvidu.meeting.service.java.conference.streaming;

import openvidu.meeting.service.java.OpenviduDB;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.entity.mime.MultipartEntityBuilder;
import org.apache.hc.client5.http.impl.classic.CloseableHttpResponse;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class VideoSender {

    @Value("${local.recording.path}")
    private String localRecordingPath;
    private String accessToken;

    public void sendRequest(String classId, String fileName, String identification) throws IOException {

        accessToken = OpenviduDB.getHostToken().get(identification);

        HttpClient httpClient = HttpClients.createDefault();

        HttpPost postRequest = new HttpPost("http://i9d107.p.ssafy.io:8081/api/v1/files/" + classId +"?type=lecture");

        postRequest.addHeader("Authorization", "Bearer " + accessToken);

        MultipartEntityBuilder builder = MultipartEntityBuilder.create();

        Path file = Paths.get(localRecordingPath + classId + "/" + fileName + ".mp4");

        builder.addBinaryBody("file", Files.newInputStream(file), ContentType.APPLICATION_OCTET_STREAM, file.getFileName().toString());

        HttpEntity multipartEntity = builder.build();
        postRequest.setEntity(multipartEntity);

        try (CloseableHttpResponse response = (CloseableHttpResponse) httpClient.execute(postRequest)) {
            String responseBody = EntityUtils.toString(response.getEntity());
            System.out.println("Response: " + responseBody);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}