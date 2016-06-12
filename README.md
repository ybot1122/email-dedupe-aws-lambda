# email-dedupe-aws-lambda

**DEMO LINK:** http://ybot1122.github.io/email-dedupe-aws-lambda/ >>> *temporarily disabled the AWS creds (June 20, 2016)* <<<

This is a Maven project because that made it easier to deploy to AWS Lambda. The actual function is under [src/main/java/emaildedupe/EmailDedupe.java](src/main/java/emaildedupe/EmailDedupe.java)

The demo is deployed via GitHub pages. To view the source code for the frontend, checkout the [gh-pages branch](https://github.com/ybot1122/email-dedupe-aws-lambda/tree/gh-pages)

## AWS Configuration
*AWS Lambda, AWS S3, CloudWatchLogs*
+ The built Maven project is deployed to AWS Lambda. 
+ It will be triggered everytime there is a PUT operation in the S3 bucket for emails.txt
+ CloudWatchLogs are hooked up automatically, so the metrics (duration, memory used) are recorded by AWS themselves.

## Backend Implementation (EmailDedupe.java)
1. Read emails.txt from S3 bucket
2. Create a temporary output.txt file
3. For each line in emails.txt
  1. Split line by "@" to separate address name and domain name **see validation caveat**
  2. If address name has not been stored for the given domain name
    * Store in HashMap
    * Write full email address to output.txt
  3. Else do nothing
4. Upload output.txt to S3 bucket

## Frontend Implementation (gh-pages)
1. User clicks upload
2. Perform validation on input *see validation caveat*
3. Upload textarea contents to S3 *see security caveat*
4. When upload finishes, expose static download link to user *see synchronization caveat*
5. Add static delay before retrieving CloudWatchLogs *see synchronization caveat*

## Caveats
**Security Caveat:** AWS-Key and Secret Key are exposed to client. *Terrible practice*. I've heavily constrained the user's permissions. I will be making the key inactive soon, and study alternative authentication methods.

**Validation Caveat(1):** This program enforces the following: one email address per line, where email address is defined as:
* Any non-whitespace characters
* A single "@" symbol
* A single "." symbol following the "@" symbol
It is not a robust email regex/validation. Just enough so that the backend can consume and run its operations

**Validation Caveat(2):** Unfortunately, I do not have any validation or exception handling on the backend. *Bad Practice*. It became too cumbersome for me after going down the AWS Lambda config.

**Synchronization Caveat:** This whole program will behave unexpectedly if multiple clients trigger uploads. Clearly this is not viable for prodution. The demo is intended to be run, essentially, synchronously. Otherwise, the output.txt may be altered before a client can download it. Additionally, the incorrect logs may be retrieved and returned.

## Acknowledgements
Maven project was created using Eclipse IDE.

Some snippets used from official AWS Documentation

Frontend and backend code written by me.

Email generation python script written by me.

AWS Configuration done by me.

Me me me me me memememememmeme.
