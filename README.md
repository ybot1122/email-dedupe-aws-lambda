# email-dedupe-aws-lambda
Maven + Java 8; Deployed to AWS Lambda and Invoked on S3 Put Events;

This is a program I wrote with intention of deploying to AWS Lambda. It will read a file called "emails.txt" from an S3 bucket.
Then it will write a file "output.txt" which contains all the unique email addresses in order of which they first appear.

**ASSUMPTION:** All emails have a single "@" character which separates the username from the domain name. 
