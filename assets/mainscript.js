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
          features: 0,
          maxvotes: 0,
          firstpoll: new Date(),
          lastpoll: new Date(0)
        }
      }
      r[e.authorid].author = e.author
      r[e.authorid].polls += 1
      r[e.authorid].votes += e.votes
      var f = e.featured.toLowerCase() == 'yes' ? f = 1 : f = 0
      r[e.authorid].features += f
      if (r[e.authorid].maxvotes < e.votes) {
        r[e.authorid].maxvotes = e.votes
      }
      if (new Date(r[e.authorid].firstpoll) > new Date(e.date)) {
        r[e.authorid].firstpoll = e.date
      }
      if (new Date(r[e.authorid].lastpoll) < new Date(e.date)) {
        r[e.authorid].lastpoll = e.date
      }
      return r
    }, {})

    var mostvotes = 0;
    var mostpolls = 0;
    var mosthp = 0;
    for (const i in authorData) {
      if (Object.hasOwnProperty.call(authorData, i)) {
        const user = authorData[i];
        var avatar = authors.find(entry => entry.authorid == i).avatar
        if (avatar == "") {
          avatar = 'img/imdbpoll.png'
        }
        if (mostvotes < user.votes) {
          mostvotes = user.votes
          $('#author-with-most-votes img').attr('src', avatar)
          $('#author-with-most-votes .card-title').html('<a href="user?id=' + i + '">' + user.author + '</a>')
          $('#author-with-most-votes .fs-4').html(user.votes.toLocaleString('en-US'))
        }
        if (mostpolls < user.polls) {
          mostpolls = user.polls
          $('#author-with-most-polls img').attr('src', avatar)
          $('#author-with-most-polls .card-title').html('<a href="user?id=' + i + '">' + user.author + '</a>')
          $('#author-with-most-polls .fs-4').html(user.polls.toLocaleString('en-US'))
        }
        if (mosthp < user.features) {
          mosthp = user.features
          $('#author-with-most-features img').attr('src', avatar)
          $('#author-with-most-features .card-title').html('<a href="user?id=' + i + '">' + user.author + '</a>')
          $('#author-with-most-features .fs-4').html(user.features.toLocaleString('en-US'))
        }
      }
    }

    var authorlist = []
    for (var i = 0; i < authors.length; i++) {
      var authorname = polls.filter(obj => {
        return obj['authorid'] === authors[i].authorid
      })
      authorlist.push(authorname[0].author)
    }
    authorlist = authorlist.sort()

    $('#total-polls').html(pollData.totalpolls.toLocaleString('en-US'))
    $('#total-authors').html(pollData.totalauthors.toLocaleString('en-US'))
    $('#total-votes').html(pollData.totalvotes.toLocaleString('en-US'))

    $('#poll-search').on('input', function () {
      var searchheader = ''
      var searchfooter = ''
      var keywords = []
      var searchoptions = '';
      var filteredlist = []
      var imgurl = 'img/imdbpoll.png'
      if ($(this).val().length >= 2) {
        keywords = $('#poll-search').val().toLowerCase().split(" ")
        if ($('#search-filter').val() == 'poll') {
          for (var i = 0; i < polls.length; i++) {
            if (keywords.every(item => polls[i].title.toLowerCase().includes(item))) {
              filteredlist.push(polls[i])
              filteredlist = filteredlist.reverse()
            }
          }
          if (filteredlist.length != 0) {
            for (var i = 0; i < filteredlist.length; i++) {
              if (i < 5) {
                searchheader = '<p>Top ' + (i + 1) + ' results</p>'
                searchfooter = '<a href="search#p=' + this.value.replaceAll(' ', '+') + '">See all results</a>'
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
                if (filteredlist[i].date != "") {
                  polldate = filteredlist[i].date
                }
                searchoptions += '<div class="card">' +
                  '<a class="card-body" href="' + filteredlist[i].url + '" target="_blank">' +
                  '<img src="' + imgurl + '">' +
                  '<div>' +
                  '<span><h6>' + filteredlist[i].title + '</h6>' +
                  '<pre>Poll by ' + filteredlist[i].author + '</pre></span>' +
                  '<pre class="text-end">' + polldate + ' ' + statusicon + '<br>' +
                  filteredlist[i].votes.toLocaleString('en-US') + ' votes</pre>' +
                  '</div></a></div>'
              }
            }
          } else {
            searchoptions = 'No poll found.'
          }
        } else if ($('#search-filter').val() == 'author') {
          var authorCount = 0
          for (const i in authorData) {
            if (Object.hasOwnProperty.call(authorData, i)) {
              const element = authorData[i];
              if (element.author.toLowerCase().includes($('#poll-search').val().toLowerCase())) {
                authorCount = authorCount + 1
                if (authorCount <= 5) {
                  searchheader = '<p>Top ' + authorCount + ' results</p>'
                  searchfooter = '<a href="search#a=' + this.value.replaceAll(' ', '+') + '">See all results</a>'
                  var avatar = authors.find(entry => entry.authorid == i).avatar
                  if (avatar != "") {
                    imgurl = avatar
                  }
                  searchoptions += '<div class="card">' +
                    '<a class="card-body" href="user?id=' + i + '">' +
                    '<img src="' + imgurl + '"><h6>' + element.author + '</h6>' +
                    '<pre>Polls: ' + element.polls + ' | Votes: ' + element.votes + ' | Features: ' + element.features + '</pre></a></div>'
                }
              }
            }
          }
        }
        $('#search-result').show()
        $('#search-result').html(searchheader + searchoptions + searchfooter)
        if ($('#search-result').html() == 0) {
          $('#search-result').html('No author found.')
        }
      } else {
        $('#search-result').hide()
      }
    })

    var table = document.getElementById('allimdbpolls')
    var tablebody = table.getElementsByTagName('tbody')[0]
    for (var i = 0; i < polls.length; i++) {
      $(tablebody).append('<tr><td></td>' +
        '<td nowrap><a href="' + polls[i].url + '" target="_blank">' + polls[i].title + '</a></td>' +
        '<td><a href="user?id=' + polls[i].authorid + '">' + polls[i].author + '</a></td>' +
        '<td>' + polls[i].date + '</td>' +
        '<td>' + polls[i].votes.toLocaleString('en-US') + '</td>' +
        '<td>' + polls[i].type + '</td>' +
        '<td>' + polls[i].featured + '</td>' +
        '<td>' + polls[i].status + '</td></tr>')
    }
    $('#table-caption').html('Data as of ' + pollData.lastupdated + ' (' + timelapse(pollData.rawdate) + ')')

    var authoroptions = yearoptions = '<option value="">All</option>';
    for (var i = 0; i < authorlist.length; i++) {
      authoroptions += '<option value="' + authorlist[i] + '">' + authorlist[i] + '</option>';
    }
    for (var i = 2013; i <= new Date().getFullYear(); i++) {
      yearoptions += "<option>" + i + "</option>";
    }
    $('#author-list').html(authoroptions)
    $('#year-filter').html(yearoptions)

    var leaderboard = document.getElementById('leaderboard')
    var lbbody = leaderboard.getElementsByTagName('tbody')[0]

    for (const i in authorData) {
      if (Object.hasOwnProperty.call(authorData, i)) {
        const element = authorData[i];
        var avatar = authors.find(entry => entry.authorid == i).avatar
        if (avatar == "") {
          avatar = 'img/imdbpoll.png'
        }
        const oneDay = 24 * 60 * 60 * 1000;
        var pollingdays = Math.round(Math.abs((new Date(element.firstpoll) - new Date()) / oneDay));
        if (pollingdays == 0) {
          pollingdays = 1
        }
        $(lbbody).append('<tr><td></td>' +
          '<td nowrap><a href="user?id=' + i + '"><img src="' + avatar + '">' + element.author + '</a></td>' +
          '<td>' + element.polls + '</td>' +
          '<td>' + element.votes.toLocaleString('en-US') + '</td>' +
          '<td>' + element.features + '</td>' +
          '<td>' + element.maxvotes.toLocaleString('en-US') + '</td>' +
          '<td>' + Math.round(element.votes / element.polls).toLocaleString('en-US') + '</td>' +
          '<td>' + (element.votes / pollingdays).toFixed(2).toLocaleString('en-US') + '</td>' +
          '<td>' + element.firstpoll + '</td>' +
          '<td>' + element.lastpoll + '</td></tr>')
      }
    }

    $(document).ready(function () {
      var polltable = $(table).DataTable({
        dom: 'rtipB',
        buttons: [{
          extend: 'excel',
          text: '<i class="bi bi-file-earmark-excel"></i> Export',
          className: 'btn btn-success',
          footer: true
        }],
        "order": [
          [4, "desc"]
        ],
        "lengthMenu": [
          [10, 25, 50, 100, 250],
          [10, 25, 50, 100, 250]
        ],
        "columnDefs": [{
          "targets": [0],
          "orderable": false
        }]
      });
      polltable.buttons().container().appendTo($('#export'));
      $('.dt-button').removeClass('dt-button')
      $('#allimdbpolls_info').appendTo($('#table-summary'))
      $('#allimdbpolls_paginate').appendTo($('#table-pagination'))

      function pollranking() {
        var lbrow = document.querySelectorAll('#allimdbpolls tbody tr')
        var pagelength = document.getElementById('entries').value
        var currentpage = $('#allimdbpolls_paginate .paginate_button.current').html().replace(',', '')
        var startingrank = pagelength * currentpage - pagelength
        for (var i = 0; i < lbrow.length; i++) {
          if (lbrow[i].querySelectorAll('td')[0].classList.contains('dataTables_empty')) {} else {
            startingrank = startingrank + 1
            lbrow[i].querySelectorAll('td')[0].innerHTML = startingrank
          }
        }
      }

      function pollrankingbottom() {
        var pollrowtotal = polltable.rows({
          search: 'applied'
        }).count()
        var lbrow = document.querySelectorAll('#allimdbpolls tbody tr')
        var pagelength = document.getElementById('entries').value
        var currentpage = $('#allimdbpolls_paginate .paginate_button.current').html().replace(',', '')
        var startingrank = pagelength * currentpage - pagelength
        startingrank = pollrowtotal - startingrank
        for (var i = 0; i < lbrow.length; i++) {
          if (lbrow[i].querySelectorAll('td')[0].classList.contains('dataTables_empty')) {} else {
            lbrow[i].querySelectorAll('td')[0].innerHTML = startingrank--
          }
        }
      }

      $('#entries').on('change', function () {
        var selectedValue = $(this).val();
        polltable.page.len(selectedValue).draw();
      });
      $('#author-filter').on('change', function () {
        var selectedValue = $(this).val();
        polltable.columns(2).search(selectedValue).draw();
      });
      $('#year-filter').on('change', function () {
        var selectedValue = $(this).val();
        polltable.columns(3).search(selectedValue).draw();
      });
      $('#type-filter').on('change', function () {
        var selectedValue = $(this).val();
        polltable.columns(5).search(selectedValue).draw();
      });
      $('#hp-filter').on('change', function () {
        var selectedValue = $(this).val();
        polltable.columns(6).search(selectedValue).draw();
      });
      $('#status-filter').on('change', function () {
        var selectedValue = $(this).val();
        polltable.columns(7).search(selectedValue).draw();
      });
      $('#tablesearch').on('input', function () {
        var selectedValue = $(this).val();
        polltable.search(selectedValue).draw();
      });

      function tableTotal() {
        var row = document.querySelectorAll('#allimdbpolls tbody tr')
        var sumauthors = [];
        var sumvotes = 0;
        var sumhp = 0;
        for (var i = 0; i < row.length; i++) {
          if (row[i].querySelectorAll('td')[0].classList.contains('dataTables_empty')) {} else {
            sumauthors.push(row[i].querySelectorAll('td')[2].textContent)
            sumvotes += parseInt(row[i].querySelectorAll('td')[4].textContent.replace(',', ''))
            if ((row[i].querySelectorAll('td')[6].innerHTML).toLowerCase() == "yes") {
              sumhp = sumhp + 1
            }
          }
        }
        $('#sum-authors').html(sumauthors.filter(arrayUnique).length)
        $('#sum-votes').html(sumvotes.toLocaleString('en-US'))
        $('#sum-features').html(sumhp)
      }

      tableTotal()
      pollranking()
      $('.custom-filter select').on('change', function () {
        tableTotal()
        if ($('#allimdbpolls thead .sorting').hasClass('sorting_desc')) {
          pollranking();
        } else {
          pollrankingbottom();
        }
      })
      $('.custom-filter input').on('input', function () {
        tableTotal()
        if ($('#allimdbpolls thead .sorting').hasClass('sorting_desc')) {
          pollranking();
        } else {
          pollrankingbottom();
        }
      })
      $('#allimdbpolls thead .sorting,#allimdbpolls_paginate').on('click', function () {
        tableTotal()
        if ($('#allimdbpolls thead .sorting').hasClass('sorting_desc')) {
          pollranking();
        } else {
          pollrankingbottom();
        }
      })

      var lbtable = $(leaderboard).DataTable({
        dom: 'rtipB',
        buttons: [{
          extend: 'excel',
          text: '<i class="bi bi-file-earmark-excel"></i> Export',
          className: 'btn btn-success',
          title: 'IMDb Polls - Leaderboard',
          footer: true
        }],
        "order": [
          [3, "desc"]
        ],
        "columnDefs": [{
          "targets": [0, 1],
          "orderable": false
        }]
      });
      lbtable.buttons().container().appendTo($('#export-leaderboard'));
      $('.dt-button').removeClass('dt-button')
      $('#leaderboard_info').appendTo($('#lb-summary'))
      $('#leaderboard_paginate').appendTo($('#lb-pagination'))

      $('#lb-entries').on('change', function () {
        var selectedValue = $(this).val();
        lbtable.page.len(selectedValue).draw();
      });
      $('#pollmaker').on('change', function () {
        $.fn.dataTable.ext.search.pop()
        var selectedValue = $(this).val();
        if (selectedValue == 1) {
          $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            return data[3].length >= 7
          })
        } else if (selectedValue == 2) {
          $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            return data[3].length < 7
          })
        }
        lbtable.draw()
      });
      $('#lb-search').on('input', function () {
        var selectedValue = $(this).val();
        lbtable.search(selectedValue).draw();
      });

      $('#lbsort-1').click(function () {
        lbtable.order([2, 'desc']).draw()
      });
      $('#lbsort-2').click(function () {
        lbtable.order([3, 'desc']).draw()
      });
      $('#lbsort-3').click(function () {
        lbtable.order([4, 'desc']).draw()
      });

      function ranking() {
        var lbrow = document.querySelectorAll('#leaderboard tbody tr')
        var pagelength = document.getElementById('lb-entries').value
        var currentpage = $('#leaderboard_paginate .paginate_button.current').html().replace(',', '')
        var startingrank = pagelength * currentpage - pagelength
        for (var i = 0; i < lbrow.length; i++) {
          if (lbrow[i].querySelectorAll('td')[0].classList.contains('dataTables_empty')) {} else {
            startingrank = startingrank + 1
            lbrow[i].querySelectorAll('td')[0].innerHTML = startingrank
          }
        }
      }

      function rankingbottom() {
        lbrowtotal = lbtable.rows({
          search: 'applied'
        }).count()
        var lbrow = document.querySelectorAll('#leaderboard tbody tr')
        var pagelength = document.getElementById('lb-entries').value
        var currentpage = $('#leaderboard_paginate .paginate_button.current').html().replace(',', '')
        var startingrank = pagelength * currentpage - pagelength
        startingrank = lbrowtotal - startingrank
        for (var i = 0; i < lbrow.length; i++) {
          if (lbrow[i].querySelectorAll('td')[0].classList.contains('dataTables_empty')) {} else {
            lbrow[i].querySelectorAll('td')[0].innerHTML = startingrank--
          }
        }
      }

      function leaderboardTotal() {
        var row = document.querySelectorAll('#leaderboard tbody tr')
        var sumauthorpolls = 0;
        var sumauthorvotes = 0;
        var sumauthorhp = 0;
        var sumauthormax = 0;
        var sumauthoravg = 0;
        var sumauthoravgday = 0
        for (var i = 0; i < row.length; i++) {
          if (row[i].querySelectorAll('td')[0].classList.contains('dataTables_empty')) {} else {
            sumauthorpolls += parseInt(row[i].querySelectorAll('td')[2].textContent.replace(',', ''))
            sumauthorvotes += parseInt(row[i].querySelectorAll('td')[3].textContent.replace(',', ''))
            sumauthorhp += parseInt(row[i].querySelectorAll('td')[4].textContent.replace(',', ''))
            sumauthormax += parseInt(row[i].querySelectorAll('td')[5].textContent.replace(',', ''))
            sumauthoravg += parseInt(row[i].querySelectorAll('td')[6].textContent.replace(',', ''))
            sumauthoravgday += parseInt(row[i].querySelectorAll('td')[7].textContent.replace(',', ''))
          }
        }
        $('#sum-author-polls').html(sumauthorpolls.toLocaleString('en-US'))
        $('#sum-author-votes').html(sumauthorvotes.toLocaleString('en-US'))
        $('#sum-author-features').html(sumauthorhp.toLocaleString('en-US'))
        $('#sum-author-maxvotes').html(sumauthormax.toLocaleString('en-US'))
        $('#sum-author-avgvotes').html(sumauthoravg.toLocaleString('en-US'))
        $('#sum-author-avgvotesdaily').html(sumauthoravgday.toLocaleString('en-US'))
      }

      ranking();
      leaderboardTotal();
      $('.custom-filter select').on('change', function () {
        leaderboardTotal();
        if ($('#leaderboard thead .sorting').hasClass('sorting_desc')) {
          ranking();
        } else {
          rankingbottom();
        }
      })
      $('.custom-filter input').on('input', function () {
        leaderboardTotal();
        if ($('#leaderboard thead .sorting').hasClass('sorting_desc')) {
          ranking();
        } else {
          rankingbottom();
        }
      })
      $('#leaderboard thead .sorting,#leaderboard_paginate').on('click', function () {
        leaderboardTotal();
        if ($('#leaderboard thead .sorting').hasClass('sorting_desc')) {
          ranking();
        } else {
          rankingbottom();
        }
      })

      $('.data-loader.loader-one').hide()
      $('main').show()
    });
  }
}

function arrayUnique(value, index, self) {
  return self.indexOf(value) === index;
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