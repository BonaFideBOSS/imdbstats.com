(function () {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl)
  })
})()

function readableMonth(month) {
  var result;
  switch (month) {
    case 1:
      result = 'Jan'
      break;
    case 2:
      result = 'Feb'
      break;
    case 3:
      result = 'Mar'
      break;
    case 4:
      result = 'Apr'
      break;
    case 5:
      result = 'May'
      break;
    case 6:
      result = 'Jun'
      break;
    case 7:
      result = 'Jul'
      break;
    case 8:
      result = 'Aug'
      break;
    case 9:
      result = 'Sep'
      break;
    case 10:
      result = 'Oct'
      break;
    case 11:
      result = 'Nov'
      break;
    case 12:
      result = 'Dec'
      break;
    default:
      break;
  }
  return result
}

function timelapse(date) {
  var currentDateTime = new Date()
  var difference = Math.abs(currentDateTime - new Date(date))

  var mm = difference;
  var sec = Math.ceil(difference / (1000))
  var min = Math.ceil(difference / (1000 * 60))
  var hr = Math.round(difference / (1000 * 60 * 60))
  var day = Math.round(difference / (1000 * 60 * 60 * 24))
  var month = Math.round(difference / (1000 * 60 * 60 * 24 * 30))
  var year = Math.round(difference / (1000 * 60 * 60 * 24 * 30 * 12))

  difference = mm + ' milliseconds ago';
  if (sec >= 1 && sec < 60) {
    var text = (sec > 1) ? ' seconds ago' : ' second ago'
    difference = sec + text;
  } else if (min >= 1 && min < 60) {
    var text = (min > 1) ? ' minutes ago' : ' minute ago'
    difference = min + text;
  } else if (hr >= 1 && hr < 24) {
    var text = (hr > 1) ? ' hours ago' : ' hour ago'
    difference = hr + text
  } else if (day >= 1 && day < 30) {
    var text = (day > 1) ? ' days ago' : ' day ago'
    difference = day + text
  } else if (month >= 1 && month < 12) {
    var text = (month > 1) ? ' months ago' : ' month ago'
    difference = month + text
  } else if (year >= 1) {
    var text = (year > 1) ? ' years ago' : ' year ago'
    difference = year + text
  }
  return difference
}

Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
}

function addAlpha(color, opacity) {
  // coerce values so ti is between 0 and 1.
  var _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
  return color + _opacity.toString(16).toUpperCase();
}

var monthNames = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12
};