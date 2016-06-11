/**
    Helper function for basic input validation
    Unfortunately, the backend service does NOT have this check
        which is not best practice. Should be suitable for demo purposes.
**/
var inputValidation = function() {
    var textarea = document.getElementById("email-list");
    var input = textarea.value;
    var validationResult = {
        status: "FAILURE",
        reason: ""
    };

    // case: empty input
    if (!input) {
        validationResult.reason = "Empty Input";
        return validationResult;
    }

    // split input by newline, and test each line with regex
    var lines = input.split("\n");

    // case: string split yielded invalid or empty array
    if (!lines || lines.length === 0) {
        validationResult.reason = "Couldn't Parse NewLines";
        return validationResult;
    }

    var len = lines.length;

    // omit the last line if it is an empty line
    if (len > 1 && (lines[len - 1] || lines[len - 1].length === 0)) {
        lines.pop();
    }

    // every element must pass regex test
    var reg = new RegExp(/^[^@]+@[^@]+\.[^@]+$/);
    var regTest = lines.every(function(val, ind) {
        var result = reg.test(val);
        if (!result) {
            validationResult.reason = "regex failed for: " + val;
        }
        return result;
    });

    if (regTest) {
        validationResult.status = "SUCCESS";
    }

    return validationResult;
}

/**
    Define helper function to handle CloudWatchLogs retrieval    
**/
var cloudwatchlogs = new AWS.CloudWatchLogs();
var getLastLog = function() {
    var reportLogs = document.getElementById("cloudwatch-report");
    var streamParams = {
        logGroupName: "/aws/lambda/test",
        limit: 1,
        orderBy: "LastEventTime",
        descending: true
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
            startFromHead: false
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
    var reportLogs = document.getElementById("cloudwatch-report");
    reportLogs.innerHTML = "";

    // handle invalid input
    var validationResult = inputValidation();
    if (validationResult.status === "FAILURE") {
        message.className = "err";
        message.innerHTML = validationResult.reason;
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

