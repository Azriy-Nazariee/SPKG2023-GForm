class FormValidate {
    constructor() {
        this.email = document.getElementById('email');
        this.checkstatus = document.getElementById('checkstatus');
        this.checktime = document.getElementById('checktime');
        this.capacity = document.getElementById('capacity');
    }
}

function emailSubmissionStatus(email, checktime) {
    if (email && !checktime) {
        console.log("Choose your slot time");
    } else if (email && checktime) {
        console.log("Submission successful");
    }
}

function checkTime(checktime) {
    if (!checktime) {
        console.log("Choose your slot time");
    } else {
        console.log("Submission successful");
    }
}
