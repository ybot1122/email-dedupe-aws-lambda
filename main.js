/**
    Perform for basic input validation on textarea value

    CAVEAT
        the backend service does NOT have this check which is not best practice
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
    Helper function to parse the CloudWatchLog event message into JSON

    ASSUMES
        the input message is a standard AWS Lambda REPORT logging event
**/
var parseLogMessage = function(message) {
    var reqId = /RequestId: (\S)+/.exec(message);
    var dur = /Duration: (\d|\.)+ ms/.exec(message);
    var mem = /Max Memory Used: (\d|\.)+ \S{2}/.exec(message);

    var result = {
        requestId: (reqId && reqId.length > 0) ? reqId[0] : "ERROR",
        duration: (dur && dur.length > 0) ? dur[0] : "ERROR",
        memoryUsed: (mem && mem.length > 0) ? mem[0] : "ERROR"        
    }

    return result;
}

/**
    Procedure to retrieve Lambda's logStreams, and then the latest event logged

    CAVEAT
        This sequence is not robust to race condition; it is possible that the
        incorrect log event is returned if multiple dedupe's have been triggered
**/
var cloudwatchlogs = new AWS.CloudWatchLogs();
var getLastLog = function() {
    var reportLogs = document.getElementById("cloudwatch-report");
    var streamParams = {
        logGroupName: "/aws/lambda/duplicate-emails",
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
            reportLogs.innerHTML = "failed to retrieve runtime metrics: " + err;
            return;
        }
        var streamName = data.logStreams[0].logStreamName;

        var logParams = {
            logGroupName: "/aws/lambda/duplicate-emails",
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
                var metrics = parseLogMessage(data.events[0].message);
                reportLogs.innerHTML = "CLOUDWATCH LOG METRICS: <br />" +
                    metrics.requestId + "<br />" +
                    metrics.duration + "<br />" +
                    metrics.memoryUsed;
            }
        });
    });
}
