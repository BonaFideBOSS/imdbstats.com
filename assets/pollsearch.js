$('main').show()
$('#search-query').focus()

var searchOptions = $('form option').map(function () {
  return $(this).val();
}).get();

$('#search-type').change(function () {
  $('select:not(:eq(0))').attr('disabled', function (_, attr) {
    return !attr
  });
})

$('form').submit(function () {
  const url = new URLSearchParams();
  const searchType = $('#search-type').val()
  url.set('query', $('#search-query').val())
  url.set('search_type', searchType)
  if (searchType != 'author') {
    url.set('poll_type', $('#poll-type').val())
    url.set('feature', $('#feature').val())
    url.set('status', $('#status').val())
    url.set('order', $('#order').val())
  }
  location.href = 'search?' + url
})

if (window.location.search) {
  const url = new URLSearchParams(window.location.search);
  var searchQuery = url.get('query')

  if (searchQuery != null && searchQuery != "") {
    searchQuery = searchQuery.split(" ")

    var searchType = url.get('search_type')
    var pollType = url.get('poll_type')
    var feature = url.get('feature')
    var status = url.get('status')
    var order = url.get('order')

    searchType = (searchType != null && searchType != "" && searchOptions.includes(searchType.toLowerCase())) ? searchType.toLowerCase() : 'poll'
    pollType = (pollType != null && pollType != "" && searchOptions.includes(pollType.toLowerCase())) ? pollType.toLowerCase() : 'all'
    feature = (feature != null && feature != "" && searchOptions.includes(feature.toLowerCase())) ? feature.toLowerCase() : 'all'
    status = (status != null && status != "" && searchOptions.includes(status.toLowerCase())) ? status.toLowerCase() : 'all'
    order = (order != null && order != "" && searchOptions.includes(order.toLowerCase())) ? order.toLowerCase() : 'latest'

    $('#search-query').val(searchQuery.join(" "))
    $('#search-type').val(searchType)
    $('#poll-type').val(pollType)
    $('#feature').val(feature)
    $('#status').val(status)
    $('#order').val(order)

    if (searchType == 'author') {
      $('select:not(:eq(0))').attr('disabled', true)
    }

    $('.data-loader.search-loader').show()

    const file = new XMLHttpRequest();
    file.open("GET", "pollData/allimdbpolls.json");
    file.send();
    file.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var pollData = JSON.parse(file.responseText)
        var authors = pollData.authors
        var polls = pollData.polls

        var authorData = polls.reduce((acc, x) => {
          if (acc.find(y => y.authorid === x.authorid)) return acc;
          const poll = polls.filter(y => y.authorid === x.authorid).length;
          const votes = polls.filter(y => y.authorid === x.authorid).map(y => y.votes).reduce((a, b) => a + b, 0);
          const features = polls.filter(y => y.authorid === x.authorid).map(y => y.featured).reduce((a, b) => a += b == 'Yes' ? 1 : 0, 0)
          const avatar = authors.find(y => y.authorid == x.authorid).avatar
          acc.push({
            authorid: x.authorid,
            author: x.author,
            polls: poll,
            votes: votes,
            features: features,
            avatar
          })
          return acc
        }, []);

        var avatar = 'img/imdbpoll.png'
        var searchResult = ""

        if (searchType == 'poll') {
          // Query Filter
          polls = polls.filter(obj => {
            if (searchQuery.every(word => obj['title'].toLowerCase().includes(word.toLowerCase()))) {
              return obj
            }
          })
          // Type Filter
          if (pollType != 'all') {
            polls = polls.filter(obj => {
              return obj['type'].toLowerCase() === pollType
            })
          }
          // Featured Filter
          if (feature != 'all') {
            polls = polls.filter(obj => {
              return obj['featured'].toLowerCase() === feature
            })
          }
          // Status Filter
          if (status != 'all') {
            polls = polls.filter(obj => {
              return obj['status'].toLowerCase() === status
            })
          }

          switch (order) {
            case 'oldest':
              polls.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
              });
              break;
            case 'votes':
              polls.sort(function (a, b) {
                return b.votes - a.votes;
              });
              break;
            default:
              polls.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
              });
              break;
          }

          searchResult += '<h3>Search Results (' + polls.length + ')</h3><hr>'
          if (polls.length != 0) {
            polls.forEach(i => {
              var authorAvatar = authors.find(entry => entry.authorid == i.authorid).avatar
              if (authorAvatar != "") {
                avatar = authorAvatar
              }

              var statusicon = '<i class="bi bi-circle-fill text-success"></i>'
              if (i.status.toLowerCase() == "closed") {
                statusicon = '<i class="bi bi-circle-fill text-secondary"></i>'
              } else if (i.status.toLowerCase() == "inactive" || i.status.toLowerCase() == "deleted") {
                statusicon = '<i class="bi bi-circle-fill text-danger"></i>'
              }

              var polldate = ""
              var publishdate = ""
              var featured = ""
              if (i.date != "") {
                polldate = new Date(i.date).toDateString() + '<i class="bi bi-dot"></i>'
                publishdate = '<i class="bi bi-dot"></i> Published ' + timelapse(i.date)
              }
              if (i.featured.toLowerCase() == 'yes') {
                featured = '<i class="bi bi-dot"></i> Featured'
              }

              searchResult += '<div class="card mb-3">' +
                '<div class="card-body">' +
                '<div><img src="' + avatar + '"><span>' +
                '<h5><a href="' + i.url + '">' + i.title + '</a></h5>' +
                '<p><a href="user?id=' + i.authorid + '">' + i.author + '</a><span class="text-muted">' + publishdate + '</span></p>' +
                '<p class="text-muted">' + polldate + i.type + ' Poll<i class="bi bi-dot"></i>' + i.status + '<i class="bi bi-dot"></i>' + i.votes.toLocaleString() + ' votes' + featured + '</p>' +
                '</span></div>' + statusicon + '</div></div><hr>'
            });
          } else {
            searchResult += '<p class="fs-5 d-grid gap-2 fw-bold text-center py-5"><i class="fs-1 bi bi-emoji-frown"></i> No polls found!</p><hr>'
          }
          searchResult += 'Showing ' + polls.length + ' out of ' + polls.length + ' results.'
        }

        if (searchType == 'author') {
          authorData = authorData.filter(obj => {
            if (searchQuery.every(word => obj['author'].toLowerCase().includes(word.toLowerCase()))) {
              return obj
            }
          })

          searchResult += '<h3>Search Results (' + authorData.length + ')</h3><hr>'
          if (authorData.length != 0) {
            authorData.forEach(i => {
              searchResult += '<div class="card mb-3">' +
                '<div class="card-body"><div>' +
                '<img src="' + i.avatar + '"><span>' +
                '<span><h5><a href="user?id=' + i.authorid + '">' + i.author + '</a></h5>' +
                '<p class="text-secondary">Polls: ' + i.polls + '<i class="bi bi-dot"></i>Votes: ' + i.votes.toLocaleString() + '<i class="bi bi-dot"></i>Features: ' + i.features + '</p></span>' +
                '</div></div></div><hr>'
            })
          } else {
            searchResult += '<p class="fs-5 d-grid gap-2 fw-bold text-center py-5"><i class="fs-1 bi bi-emoji-frown"></i> No authors found!</p><hr>'
          }
          searchResult += 'Showing ' + authorData.length + ' out of ' + authorData.length + ' results.'
        }

        $('#search-result').html(searchResult)
        $('.data-loader.search-loader').hide()
        $('#search-result').show()
      }

    }
  }
}