package emaildedupe;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.S3Object;

public class Hello {
    public void myHandler(Map<String, Object> input, Context context) throws IOException {
        AmazonS3 s3Client = new AmazonS3Client();
        
    	// reading input
    	S3Object emailList = s3Client.getObject("elasticbeanstalk-us-west-2-365496274414", "emails.txt");
    	InputStream stream = emailList.getObjectContent();
    	BufferedReader buffReader = new BufferedReader(new InputStreamReader(stream));
    	
    	// producing output
    	File output = File.createTempFile("output", "txt");
		BufferedWriter writer = new BufferedWriter(new FileWriter(output, true));
		
		// auxiliary data structures
		Map<String, Set<String>> storedEmails = new HashMap<String, Set<String>>();
		String currEmail;
		
		// read input by line and write out email only the first time they appear
		while((currEmail = buffReader.readLine()) != null) {
			String[] splitEmail = currEmail.split("@", 2);
			Set<String> names = storedEmails.get(splitEmail[1]);
			
			if (names == null) {
				names = new HashSet<String>();
				storedEmails.put(splitEmail[1], names);
			}
			
			if (!names.contains(splitEmail[0])) {
				names.add(splitEmail[0]);
				writer.write(currEmail, 0, currEmail.length());
				writer.newLine();
			}
		}

		writer.flush();
		
		s3Client.putObject("elasticbeanstalk-us-west-2-365496274414", "output.txt", output);

		writer.close();
		buffReader.close();
		stream.close();
    }
}
