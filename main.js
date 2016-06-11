/**
    Define helper function to handle CloudWatchLogs retrieval    
**/
var cloudwatchlogs = new AWS.CloudWatchLogs();
var getLastLog = function() {
    var reportLogs = document.getElementById("cloudwatch-report");
    var streamParams = {
        logGroupName: "/aws/lambda/test",
        limit: 1,
        logStreamNamePrefix: "2016",
        descending: false
    }
    reportLogs.className = "";
    reportLogs.innerHTML = "";

    // request the log stream with most recent activity
    cloudwatchlogs.describeLogStreams(streamParams, function(err, data) {
        if (err || !data || !data.logStreams || data.logStreams.length < 1
                || !data.logStreams[0].logStreamName) {
            reportLogs.className = "err";
            reportLogs.innerHTML = "failed do retrieve runtime metrics: " + err;
            return;
        }

        var streamName = data.logStreams[0].logStreamName;
        var logParams = {
            logGroupName: "/aws/lambda/test",
            logStreamName: streamName,
            limit: 1,
            startFromHead: true
        }

        // request most recent log from the most recent stream
        cloudwatchlogs.getLogEvents(logParams, function(err, data) {
            if (err || !data || !data.events || data.events.length < 1
                    || !data.events[0].message) {
                reportLogs.className = "err";
                reportLogs.innerHTML = "cloudwatchlogs failure: " + err;
            } else {
                reportLogs.innerHTML = data.events[0].message;
            }
        });
    });
}


/**
    Attach the s3 bucket upload functionality to DOM
**/
var bucket = new AWS.S3({
    params: {
        Bucket: "elasticbeanstalk-us-west-2-365496274414"
    }
});
var button = document.getElementById("upload");
button.addEventListener("click", function() {
    var textarea = document.getElementById("email-list");
    var message = document.getElementById("message");
    var download = document.getElementById("download");

    // handle invalid input
    if (!textarea.value) {
        message.className = "err";
        message.innerHTML = "Cannot submit empty input";
        return;
    }

    // loading state
    message.innerHTML = "";
    message.clasName= "";
    loader.style.display = "block";
    button.style.display = "none";
    download.style.display = "none";

    // start s3 upload, track the duration
    var params = {Key: "emails.txt", Body: textarea.value};
    var startTime = Date.now();
    bucket.upload(params, function (err, data) {
        loader.style.display = "none";
        button.style.display = "block";
        if (err) {
            message.className = "err";
            message.innerHTML = "An error occurred: " + err;
        } else {
            var duration = Date.now() - startTime;
            message.className = "";
            message.innerHTML = "Total time: " + duration + " ms";
            download.style.display = "block";
            getLastLog();
        }
    });
}, false);

