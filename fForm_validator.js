// Trigger function to run on form submission
function onFormSubmit(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form responses 1');
  var range = sheet.getDataRange();
  var values = range.getValues();
  var headers = values.shift();

  // Get column indexes
  var emailIndex = headers.indexOf('Email address');
  var amSlotIndex = headers.indexOf('(AM) Slot Selection');
  var pmSlotIndex = headers.indexOf('(PM) Slot Selection');
  var submissionStatusIndex = headers.indexOf('Submission Status');
  var emailSubmissionStatusIndex = headers.indexOf('Email Submission Status');

  // Helper function to check for duplicate submission
function isDuplicateSubmission(email, values, currentIndex) {
    for (var i = 0; i < currentIndex; i++) {
      if (values[i][emailIndex] === email && values[i][submissionStatusIndex] === 'Success') {
        return true;
      }
    }
    return false;
  }

  // Helper function to get the capacity status for a session
function getCapacityStatus(session, values, headers) {
    var capacityIndex = headers.indexOf('Capacity (' + session + ')');
    var maxCapacityIndex = headers.indexOf('Maximum Capacity (' + session + ')');
    var capacity = 0;
    var maxCapacity = 0;

    for (var i = 0; i < values.length; i++) {
      if (values[i][submissionStatusIndex] === 'Success' && values[i][amSlotIndex] === session) {
        capacity++;
      }
    }

    for (var j = 0; j < values.length; j++) {
      if (values[j][maxCapacityIndex] !== '') {
        maxCapacity = parseInt(values[j][maxCapacityIndex]);
        break;
      }
    }

    var availableSlots = maxCapacity - capacity;
    return capacity + '/' + maxCapacity + ' (' + availableSlots + ' available)';
  }

  // Iterate through form responses
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var email = row[emailIndex];
    var amSlot = row[amSlotIndex];
    var pmSlot = row[pmSlotIndex];
    var submissionStatus = row[submissionStatusIndex];
    var emailSubmissionStatus = row[emailSubmissionStatusIndex];

    // Skip already processed rows
    if (emailSubmissionStatus === 'Sent') continue;

    // Check for duplicate submission
    if (submissionStatus !== 'Error - Duplication' && isDuplicateSubmission(email, values, i)) {
      sheet.getRange(i + 2, submissionStatusIndex + 1).setValue('Error - Duplication');
      sheet.getRange(i + 2, 1, 1, headers.length).setBackground('red');
      console.log('Error: Duplicate submission', email);
      sendErrorEmail(email, 'Error: Duplicate submission', '');
      continue;
    }

    // Check for same slot selection
    if (amSlot === pmSlot) {
      sheet.getRange(i + 2, submissionStatusIndex + 1).setValue('Error - Same Slot');
      sheet.getRange(i + 2, 1, 1, headers.length).setBackground('red');
      var formLink = 'https://docs.google.com/forms/d/e/1FAIpQLSeHpyqnepEUIkpAYkg0K6lUn5YrOX7lPbu9sYIQ5CXQE23haw/viewform';
      var errorMessage =
        '- Same career slot chosen for AM and PM sessions\n\n' +
        'AM SESSION CAPACITY STATUS (number of available slots / number of maximum capacity):\n' +
        getCapacityStatus('AM', values, headers) +
        '\nPM SESSION CAPACITY STATUS (number of available slots / number of maximum capacity):\n' +
        getCapacityStatus('PM', values, headers);
      console.log(errorMessage, email);
      sendErrorEmail(email, errorMessage, formLink);
      continue;
    }

    // Check slot capacity
    var amCapacityExceeded = isSlotCapacityExceeded(amSlot, 'AM', values, i);
    var pmCapacityExceeded = isSlotCapacityExceeded(pmSlot, 'PM', values, i);

    if (amCapacityExceeded || pmCapacityExceeded) {
      var amCapacity = getMaxCapacity(amSlot, 'AM');
      var pmCapacity = getMaxCapacity(pmSlot, 'PM');
      var formLink = 'https://docs.google.com/forms/d/e/1FAIpQLSeHpyqnepEUIkpAYkg0K6lUn5YrOX7lPbu9sYIQ5CXQE23haw/viewform';
      var errorMessage = getErrorMessage(amCapacityExceeded, amSlot, amCapacity, 'AM') +
        getErrorMessage(pmCapacityExceeded, pmSlot, pmCapacity, 'PM');

      sheet.getRange(i + 2, submissionStatusIndex + 1).setValue('Error - Over Capacity');
      sheet.getRange(i + 2, 1, 1, headers.length).setBackground('red');
      console.log(errorMessage, email);
      sendErrorEmail(email, errorMessage, formLink);
      continue;
    }

    // Set submission status to success
    sheet.getRange(i + 2, submissionStatusIndex + 1).setValue('Success');

    // Send success email
    console.log('Submission success', email);
    sendSuccessEmail(row, email);
    sheet.getRange(i + 2, emailSubmissionStatusIndex + 1).setValue('Sent');
  }
}

// Function to get the capacity status for a session
function getCapacityStatus(session, values, headers) {
  var capacityIndex = headers.indexOf('Capacity (' + session + ')');
  var maxCapacityIndex = headers.indexOf('Maximum Capacity (' + session + ')');
  var capacity = 0;
  var maxCapacity = 0;

  for (var i = 0; i < values.length; i++) {
    if (values[i][submissionStatusIndex] === 'Success' && values[i][amSlotIndex] === session) {
      capacity++;
    }
  }

  for (var j = 0; j < values.length; j++) {
    if (values[j][maxCapacityIndex] !== '') {
      maxCapacity = parseInt(values[j][maxCapacityIndex]);
      break;
    }
  }

  var availableSlots = maxCapacity - capacity;
  return capacity + '/' + maxCapacity + ' (' + availableSlots + ' available)';
}

// Send error email
function sendErrorEmail(email, errorMessage, formLink) {
  // Email subject
  var subject = 'Submission Error: SPKG MARESMART 2023 - Career Sharing Slot Registration';

  // Email body
  var body = 'Hi ' + getFullName(email) + ',\n\n';
  body += 'We encountered the following errors with your submission to the SPKG MARESMART 2023 - Career Sharing Slot Registration:\n\n';
  body += 'Here are the details of your submission:\n';
  body += 'Timestamp: ' + new Date() + '\n';
  body += 'Email address: ' + email + '\n';
  body += 'Full Name: ' + getFullName(email) + '\n';
  body += 'Class: ' + getClass(email) + '\n';
  body += 'College Number: ' + getCollegeNumber(email) + '\n';
  body += 'Mobile Number: ' + getMobileNumber(email) + '\n';
  body += 'My Ambition: ' + getAmbition(email) + '\n';
  body += '(AM) Slot Selection: ' + getAMSlotSelection(email) + '\n';
  body += '(PM) Slot Selection: ' + getPMSlotSelection(email) + '\n';
  body += 'Submission Status: ' + errorMessage + '\n\n';
  body += 'AM SESSION CAPACITY STATUS (number of available slots / number of maximum capacity):\n';
  body += getCapacityStatus('AM', values, headers) + '\n\n';
  body += 'PM SESSION CAPACITY STATUS (number of available slots / number of maximum capacity):\n';
  body += getCapacityStatus('PM', values, headers) + '\n\n';
  body += 'Please make the necessary corrections and submit your response again using the following form link:\n';
  body += formLink + '\n\n';
  body += 'Thank you.\n\n';
  body += 'SPKG MARESMART 2023 Secretariat';

  // Send email
  MailApp.sendEmail(email, subject, body);
}

// Trigger function to run on form submission
function onFormSubmit(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form responses 1');
  var range = sheet.getDataRange();
  var values = range.getValues();
  var headers = values.shift();

  // Get column indexes
  var emailIndex = headers.indexOf('Email address');
  var amSlotIndex = headers.indexOf('(AM) Slot Selection');
  var pmSlotIndex = headers.indexOf('(PM) Slot Selection');
  var submissionStatusIndex = headers.indexOf('Submission Status');
  var emailSubmissionStatusIndex = headers.indexOf('Email Submission Status');

  // Iterate through form responses
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var email = row[emailIndex];
    var amSlot = row[amSlotIndex];
    var pmSlot = row[pmSlotIndex];
    var submissionStatus = row[submissionStatusIndex];
    var emailSubmissionStatus = row[emailSubmissionStatusIndex];

    // Skip already processed rows
    if (emailSubmissionStatus === 'Sent') continue;

    // Check for duplicate submission
    if (submissionStatus !== 'Error - Duplication' && isDuplicateSubmission(email, values, i)) {
      sheet.getRange(i + 2, submissionStatusIndex + 1).setValue('Error - Duplication');
      sheet.getRange(i + 2, 1, 1, headers.length).setBackground('red');
      console.log('Error: Duplicate submission', email);
      sendErrorEmail(email, 'Error: Duplicate submission', '');
      continue;
    }

    // Check for same slot selection
    if (amSlot === pmSlot) {
      sheet.getRange(i + 2, submissionStatusIndex + 1).setValue('Error - Same Slot');
      sheet.getRange(i + 2, 1, 1, headers.length).setBackground('red');
      var formLink = 'https://docs.google.com/forms/d/e/1FAIpQLSeHpyqnepEUIkpAYkg0K6lUn5YrOX7lPbu9sYIQ5CXQE23haw/viewform';
      var errorMessage =
        '- Same career slot chosen for AM and PM sessions\n\n' +
        'AM SESSION CAPACITY STATUS (number of available slots / number of maximum capacity):\n' +
        getCapacityStatus('AM', values, headers) +
        '\nPM SESSION CAPACITY STATUS (number of available slots / number of maximum capacity):\n' +
        getCapacityStatus('PM', values, headers);
      console.log(errorMessage, email);
      sendErrorEmail(email, errorMessage, formLink);
      continue;
    }

    // Check slot capacity
    var amCapacityExceeded = isSlotCapacityExceeded(amSlot, 'AM', values, i);
    var pmCapacityExceeded = isSlotCapacityExceeded(pmSlot, 'PM', values, i);

    if (amCapacityExceeded || pmCapacityExceeded) {
      var amCapacity = getMaxCapacity(amSlot, 'AM');
      var pmCapacity = getMaxCapacity(pmSlot, 'PM');
      var formLink = 'https://docs.google.com/forms/d/e/1FAIpQLSeHpyqnepEUIkpAYkg0K6lUn5YrOX7lPbu9sYIQ5CXQE23haw/viewform';
      var errorMessage = getErrorMessage(amCapacityExceeded, amSlot, amCapacity, 'AM') +
        getErrorMessage(pmCapacityExceeded, pmSlot, pmCapacity, 'PM');

      sheet.getRange(i + 2, submissionStatusIndex + 1).setValue('Error - Over Capacity');
      sheet.getRange(i + 2, 1, 1, headers.length).setBackground('red');
      console.log(errorMessage, email);
      sendErrorEmail(email, errorMessage, formLink);
      continue;
    }

    // Set submission status to success
    sheet.getRange(i + 2, submissionStatusIndex + 1).setValue('Success');

    // Send success email
    console.log('Submission success', email);
    sendSuccessEmail(row, email);
    sheet.getRange(i + 2, emailSubmissionStatusIndex + 1).setValue('Sent');
  }
}

