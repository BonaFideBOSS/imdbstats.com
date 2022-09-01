const file = new XMLHttpRequest();
file.open("GET", "pollData/allimdbpolls.json");
file.send();
file.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    var pollData = JSON.parse(file.responseText)
    var authors = pollData.authors
    var polls = pollData.polls
    var authorData = polls.reduce(function (r, e) {
      if (!r[e.authorid]) {
        r[e.authorid] = {
          author: "",
          polls: 0,
          votes: 0,
          features: 0
        }
      }
      r[e.authorid].author = e.author
      r[e.authorid].polls += 1
      r[e.authorid].votes += e.votes
      var f = e.featured.toLowerCase() == 'yes' ? f = 1 : f = 0
      r[e.authorid].features += f
      return r
    }, {})

    var input;
    var matches = location.hash.match(/#([^&]+)/i);
    var hashFilter = matches && matches[1];
    if (hashFilter) {
      type = hashFilter.substring(0, 2).toLowerCase()
      input = hashFilter.substring(2).replaceAll("+", " ")
      input = input.replaceAll("%20", " ")
      if (type == 'p=' & input.length > 0) {
        $('#poll-search').val(input)
        $('#poll-search-result').html('')
        $('.data-loader.search-loader').show()
        pollSearch(input);
      } else if (type == 'a=' & input.length > 0) {
        $('#item-filter').val('author')
        $('#poll-search').val(input)
        $('#poll-search-result').html('')
        $('.data-loader.search-loader').show()
        pollSearch(input);
      }
    }

    $('form').on('submit', function () {
      input = $('#poll-search').val()
      if (!input.match(/^\s*$/)) {
        $('#poll-search-result').html('')
        $('.data-loader.search-loader').show()
        var type = $('#item-filter').val() == 'author' ? type = '#a=' : type = '#p='
        window.location = (type + input.replaceAll(' ', '+'));
        pollSearch(input);
      }
    })

    $('#item-filter').on('change', function () {
      if (this.value == 'author') {
        $('.search-type-title').html('Author Name:')
        $('.search-filters select').attr('disabled', true)
      } else {
        $('.search-type-title').html('Poll Title:')
        $('.search-filters select').attr('disabled', false)
      }
    })

    function pollSearch(searchString) {
      var searchheader = ''
      var searchfooter = ''
      var keywords = []
      var searchresults = '';
      var filteredlist = []
      var imgurl = 'img/imdbpoll.png'

      var polltype = $('#type-filter').val()
      var orderby = $('#orderby-filter').val()

      if (searchString.length > 0) {
        keywords = searchString.toLowerCase().split(" ")
        if ($('#item-filter').val() == 'poll') {
          for (var i = 0; i < polls.length; i++) {
            if (keywords.every(item => polls[i].title.toLowerCase().includes(item))) {

              if (polltype == 'all') {
                filteredlist.unshift(polls[i])
              } else {
                if (polls[i].type.toLowerCase() == polltype) {
                  filteredlist.unshift(polls[i])
                }
              }

              switch (orderby) {
                case 'oldest':
                  filteredlist.sort(function (a, b) {
                    return new Date(a.date) - new Date(b.date);
                  });
                  break;
                case 'votes':
                  filteredlist.sort(function (a, b) {
                    return b.votes - a.votes;
                  });
                  break;
                case 'featured':
                  filteredlist.sort(function (a, b) {
                    var nameA = a.featured.toUpperCase();
                    var nameB = b.featured.toUpperCase();
                    if (nameA > nameB) {
                      return -1;
                    }
                  });
                  break;
                default:
                  filteredlist.sort(function (a, b) {
                    return new Date(b.date) - new Date(a.date);
                  });
                  break;
              }

            }
          }
          if (filteredlist.length != 0) {
            for (var i = 0; i < filteredlist.length; i++) {
              if (i < 1000) {
                searchheader = '<h3>Search Results (' + (i + 1) + ')</h3><hr>'
                searchfooter = 'Showing ' + (i + 1) + ' out of ' + filteredlist.length + ' results.'
                var avatar = authors.find(entry => entry.authorid == filteredlist[i].authorid).avatar
                if (avatar != "") {
                  imgurl = avatar
                }
                var statusicon = '<i class="bi bi-circle-fill text-success"></i>'
                if (filteredlist[i].status.toLowerCase() == "closed") {
                  statusicon = '<i class="bi bi-circle-fill text-secondary"></i>'
                } else if (filteredlist[i].status.toLowerCase() == "inactive" || filteredlist[i].status.toLowerCase() == "deleted") {
                  statusicon = '<i class="bi bi-circle-fill text-danger"></i>'
                }
                var polldate = ""
                var publishdate = ""
                var featured = ""
                if (filteredlist[i].date != "") {
                  polldate = new Date(filteredlist[i].date).toDateString() + '<i class="bi bi-dot"></i>'
                  publishdate = '<i class="bi bi-dot"></i> Published ' + timelapse(filteredlist[i].date)
                }
                if (filteredlist[i].featured.toLowerCase() == 'yes') {
                  featured = '<i class="bi bi-dot"></i> Featured'
                }
                searchresults += '<div class="card mb-3">' +
                  '<div class="card-body">' +
                  '<div><img src="' + imgurl + '"><span>' +
                  '<h5><a href="' + filteredlist[i].url + '">' + filteredlist[i].title + '</a></h5>' +
                  '<p><a href="user?id=' + filteredlist[i].authorid + '">' + filteredlist[i].author + '</a><span class="text-muted">' + publishdate + '</span></p>' +
                  '<p class="text-muted">' + polldate + filteredlist[i].type + ' Poll<i class="bi bi-dot"></i>' + filteredlist[i].status + '<i class="bi bi-dot"></i>' + filteredlist[i].votes.toLocaleString() + ' votes' + featured + '</p>' +
                  '</span></div>' + statusicon + '</div></div><hr>'
              }
            }
          } else {
            searchheader = '<h3>Search Results (0)</h3><hr>'
            searchresults = 'No poll found.'
          }
        } else if ($('#item-filter').val() == 'author') {
          var authorCount = 0
          for (const i in authorData) {
            if (Object.hasOwnProperty.call(authorData, i)) {
              const element = authorData[i];
              if (element.author.toLowerCase().includes(searchString.toLowerCase())) {
                authorCount = authorCount + 1
                searchheader = '<h3>Search Results (' + (authorCount) + ')</h3><hr>'
                searchfooter = 'Showing ' + (authorCount) + ' out of ' + authors.length + ' authors.'
                var avatar = authors.find(entry => entry.authorid == i).avatar
                if (avatar != "") {
                  imgurl = avatar
                }
                searchresults += '<div class="card mb-3">' +
                  '<div class="card-body"><div>' +
                  '<img src="' + imgurl + '"><span>' +
                  '<span><h5><a href="user?id=' + i + '">' + element.author + '</a></h5>' +
                  '<p class="text-secondary">Polls: ' + element.polls + '<i class="bi bi-dot"></i>Votes: ' + element.votes.toLocaleString() + '<i class="bi bi-dot"></i>Features: ' + element.features + '</p></span>' +
                  '</div></div></div><hr>'
              }
            }
          }
        }
        setTimeout(() => {
          $('.data-loader.search-loader').hide()
          $('#poll-search-result').html(searchheader + searchresults + searchfooter)
          if ($('#poll-search-result').html() == 0) {
            $('#poll-search-result').html('No author found.')
          }
        }, 1000);

      } else {}
    }

    $('.data-loader.loader-one').hide()
    $('main').show()
    $('#poll-search').focus()

  }
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