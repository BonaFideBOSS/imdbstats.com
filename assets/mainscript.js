const file = new XMLHttpRequest();
file.open("GET", "pollData/allimdbpolls.json");
file.send();
file.onreadystatechange = function () {

  var pollTypes = {
    "Total": {
      "Title": 0,
      "People": 0,
      "Image": 0,
      "Character": 0
    },
    "Users": {
      "Title": 0,
      "People": 0,
      "Image": 0,
      "Character": 0
    }
  }
  var pollTimeline = {
    "years": [],
    "pollsInEachYear": []
  }


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

      function upt(type) {
        const count = polls.filter((obj) => (obj.authorid == authors[i].authorid) && obj.type == type).length;
        return count
      }
      if (upt("Titles") != 0) {
        pollTypes["Users"]["Title"]++
      }
      if (upt("Images") != 0) {
        pollTypes["Users"]["Image"]++
      }
      if (upt("People") != 0) {
        pollTypes["Users"]["People"]++
      }
      if (upt("Characters") != 0) {
        pollTypes["Users"]["Character"]++
      }

      var authorname = polls.filter(obj => {
        return obj['authorid'] === authors[i].authorid
      })
      authorlist.push(authorname[0].author)
    }
    authorlist = authorlist.sort()

    $('#total-polls').html(pollData.totalpolls.toLocaleString('en-US'))
    $('#total-authors').html(pollData.totalauthors.toLocaleString('en-US'))
    $('#total-votes').html(pollData.totalvotes.toLocaleString('en-US'))

    $('#home-search').submit(function () {
      location.href = 'search?search_type=' + $('#search-filter').val() + '&query=' + $('#poll-search').val()
    })

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
                searchfooter = '<a href="search?search_type=poll&query=' + this.value.replaceAll(' ', '+') + '">See all results</a>'
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
                  '<a class="card-body d-flex" href="' + filteredlist[i].url + '" target="_blank">' +
                  '<img class="me-3" src="' + imgurl + '">' +
                  '<span><h6>' + filteredlist[i].title + '</h6>' +
                  '<pre>Poll by ' + filteredlist[i].author + '</pre></span>' +
                  '</a></div>'
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
                  searchfooter = '<a href="search?search_type=author&query=' + this.value.replaceAll(' ', '+') + '">See all results</a>'
                  var avatar = authors.find(entry => entry.authorid == i).avatar
                  if (avatar != "") {
                    imgurl = avatar
                  }
                  searchoptions += '<div class="card">' +
                    '<a class="card-body d-flex align-items-center" href="user?id=' + i + '">' +
                    '<img class="me-3" src="' + imgurl + '"><h6>' + element.author + '</h6></a></div>'
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

      if (polls[i].type == "Titles") {
        pollTypes["Total"]["Title"]++
      } else if (polls[i].type == "People") {
        pollTypes["Total"]["People"]++
      } else if (polls[i].type == "Images") {
        pollTypes["Total"]["Image"]++
      } else if (polls[i].type == "Characters") {
        pollTypes["Total"]["Character"]++
      }

      if (polls[i].date) {
        var year = polls[i].date.split('/')[0]
        var month = polls[i].date.split('/')[1].replace(/^0+/, '')
        var day = polls[i].date.split('/')[2].replace(/^0+/, '')
      }

      if (!(pollTimeline["years"].includes(year))) {
        pollTimeline["years"].push(year)
        pollTimeline["pollsInEachYear"].push({
          "year": year,
          "total": 0,
          "months": {
            'Jan': 0,
            'Feb': 0,
            'Mar': 0,
            'Apr': 0,
            'May': 0,
            'Jun': 0,
            'Jul': 0,
            'Aug': 0,
            'Sep': 0,
            'Oct': 0,
            'Nov': 0,
            'Dec': 0
          },
          "userTotal": 0,
          "userMonths": []
        })
      }

      for (let index = 0; index < pollTimeline["pollsInEachYear"].length; index++) {
        if (pollTimeline["pollsInEachYear"][index].year == year) {
          pollTimeline["pollsInEachYear"][index].total++

          if (readableMonth(parseInt(month)) in pollTimeline["pollsInEachYear"][index].months) {
            pollTimeline["pollsInEachYear"][index].months[readableMonth(parseInt(month))]++
          } else {
            pollTimeline["pollsInEachYear"][index].months[readableMonth(parseInt(month))] = 1
          }
        }
      }


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

      for (let index = 0; index < pollTimeline["pollsInEachYear"].length; index++) {
        for (let i2 = 0; i2 < authors.length; i2++) {
          const count = polls.filter((obj) => (obj.authorid == authors[i2].authorid) && obj.date.split('/')[0] == pollTimeline["pollsInEachYear"][index].year);
          if (count.length != 0) {
            pollTimeline["pollsInEachYear"][index].userTotal++

            const userMonth = [];

            count.forEach(i => {
              month = i.date.split('/')[1].replace(/^0+/, '')
              if (!(userMonth.includes(month))) {
                userMonth.push(month)
              }
            })

            userMonth.forEach(j => {
              if (readableMonth(parseInt(j)) in pollTimeline["pollsInEachYear"][index].userMonths) {
                pollTimeline["pollsInEachYear"][index].userMonths[readableMonth(parseInt(j))]++
              } else {
                pollTimeline["pollsInEachYear"][index].userMonths[readableMonth(parseInt(j))] = 1
              }
            })

          }
        }
      }

      setTimeout(() => {
        // ===== STATISTICS =====
        Chart.defaults.plugins.tooltip.displayColors = false;
        Chart.defaults.plugins.tooltip.intersect = false;
        Chart.defaults.plugins.tooltip.padding = '10';
        Chart.defaults.plugins.tooltip.footerMarginTop = 15;

        const chartColors = ['#4dc9f6',
          '#f67019',
          '#f53794',
          '#537bc4',
          '#acc236',
          '#00a950',
          '#8549ba',
          '#d63384',
          '#20c997',
          '#0d6efd',
          '#6610f2',
          '#198754',
          '#0dcaf0',
          '#ffc107',
          '#dc3545',
          '#6f42c1',
          '#fcc477',
          '#E1CE93'
        ]

        const pollTypeGraph = {
          labels: Object.keys(pollTypes["Total"]),
          datasets: [{
            backgroundColor: chartColors,
            data: Object.values(pollTypes["Total"]),
          }]
        };

        const pollTypeConfig = {
          type: 'doughnut',
          data: pollTypeGraph,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  generateLabels(chart) {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                      const {
                        labels: {
                          pointStyle
                        }
                      } = chart.legend.options;

                      return data.labels.map((label, i) => {
                        const meta = chart.getDatasetMeta(0);
                        const style = meta.controller.getStyle(i);

                        return {
                          text: label + ' (' + data.datasets[0].data[i] + ')',
                          fillStyle: style.backgroundColor,
                          strokeStyle: style.borderColor,
                          lineWidth: style.borderWidth,
                          pointStyle: pointStyle,
                          hidden: !chart.getDataVisibility(i),

                          // Extra data used for toggling the correct item
                          index: i
                        };
                      });
                    }
                    return [];
                  }
                },

                onClick(e, legendItem, legend) {
                  legend.chart.toggleDataVisibility(legendItem.index);
                  legend.chart.update();
                },
              },
              title: {
                display: true,
                text: 'Types of Polls',
                font: {
                  size: 16
                }
              }
            }
          },
        };

        new Chart(
          document.getElementById('typeChart'),
          pollTypeConfig
        );

        const userPollTypeGraph = {
          labels: Object.keys(pollTypes["Users"]),
          datasets: [{
            backgroundColor: chartColors,
            data: Object.values(pollTypes["Users"]),
          }]
        };

        const userPollTypeConfig = {
          type: 'doughnut',
          data: userPollTypeGraph,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  generateLabels(chart) {
                    const data = chart.data;
                    if (data.labels.length && data.datasets.length) {
                      const {
                        labels: {
                          pointStyle
                        }
                      } = chart.legend.options;

                      return data.labels.map((label, i) => {
                        const meta = chart.getDatasetMeta(0);
                        const style = meta.controller.getStyle(i);

                        return {
                          text: label + ' (' + data.datasets[0].data[i] + ' users)',
                          fillStyle: style.backgroundColor,
                          strokeStyle: style.borderColor,
                          lineWidth: style.borderWidth,
                          pointStyle: pointStyle,
                          hidden: !chart.getDataVisibility(i),

                          // Extra data used for toggling the correct item
                          index: i
                        };
                      });
                    }
                    return [];
                  }
                },

                onClick(e, legendItem, legend) {
                  legend.chart.toggleDataVisibility(legendItem.index);
                  legend.chart.update();
                },
              },
              title: {
                display: true,
                text: 'Types of Polls by User (out of ' + pollData.totalauthors.toLocaleString('en-US') + ')',
                font: {
                  size: 16
                }
              }
            }
          },
        };

        new Chart(
          document.getElementById('userTypeChart'),
          userPollTypeConfig
        );

        const pollEachYear = []
        const userEachYear = []
        pollTimeline["pollsInEachYear"].forEach(i => {
          pollEachYear.push(i.total)
          userEachYear.push(i.userTotal)
        })

        const yearAll = {
          labels: pollTimeline["years"],
          datasets: [{
              label: "Polls",
              backgroundColor: 'rgb(255,193,7,.5)',
              borderColor: '#ffc107',
              data: pollEachYear,
            },
            {
              label: "Users",
              backgroundColor: addAlpha('#0d6efd', 0.5),
              borderColor: '#0d6efd',
              data: userEachYear,
            }
          ]
        };

        const yearChart = {
          type: 'line',
          data: yearAll,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls and Users in Each Year",
                font: {
                  size: 16
                }
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        };

        new Chart(
          document.getElementById('YearChart'),
          yearChart
        );

        var monthDataset = []

        for (let index = 0; index < pollTimeline["pollsInEachYear"].length; index++) {

          const adjustedMonthValues = Object.values(pollTimeline["pollsInEachYear"][index].months).map(el => el === 0 ? 'N/A' : el);
          monthDataset.push({
            label: pollTimeline["years"][index],
            backgroundColor: addAlpha(chartColors[index], 0.5),
            borderColor: chartColors[index],
            data: adjustedMonthValues,
          })

          const adjustedMonth = Object.entries(pollTimeline["pollsInEachYear"][index].months).filter(([a, b]) => !b == 0);
          const year = {
            labels: adjustedMonth.map(x => x[0]),
            datasets: [{
              backgroundColor: chartColors.sample(),
              data: adjustedMonth.map(x => x[1]),
            }]
          };

          const monthChart = {
            type: 'bar',
            data: year,
            options: {
              plugins: {
                title: {
                  display: true,
                  text: "Polls Published in " + pollTimeline["pollsInEachYear"][index].year,
                  font: {
                    size: 16
                  }
                },
                legend: {
                  display: false
                }
              }
            }
          };

          const sorted = Object.entries(pollTimeline["pollsInEachYear"][index].userMonths).sort((a, b) => monthNames[a[0]] - monthNames[b[0]])
          const users = {
            labels: sorted.map(x => x[0]),
            datasets: [{
              backgroundColor: chartColors.sample(),
              data: sorted.map(x => x[1]),
            }]
          };

          const userChart = {
            type: 'bar',
            data: users,
            options: {
              plugins: {
                title: {
                  display: true,
                  text: "User Participation in " + pollTimeline["pollsInEachYear"][index].year,
                  font: {
                    size: 16
                  }
                },
                legend: {
                  display: false
                }
              }
            }
          };

          var currentyear = pollTimeline["years"][index]
          var isactive = ((index == 0) ? "active" : "");
          var menuTab = '<a class="list-group-item list-group-item-action ' + isactive + '" id="list-' + currentyear + '-list" data-bs-toggle="list" href="#list-' + currentyear + '" role="tab" aria-controls="list-' + currentyear + '">' + currentyear + '</a>'
          var contentTab = '<div class="tab-pane fade show ' + isactive + '" id="list-' + currentyear + '" role="tabpanel" aria-labelledby="list-' + currentyear + '-list">' +
            '<div class="row justify-content-center"><div class="col-lg-6 col-10">' +
            '<canvas id="chart' + index + '"></canvas></div>' +
            '<div class="col-lg-6 col-10">' +
            '<canvas id="userChart' + index + '"></canvas></div>' +
            '</div></div>'
          $('#list-tab').append(menuTab)
          $('#nav-tabContent').append(contentTab)
          new Chart(document.getElementById('chart' + index), monthChart);
          new Chart(document.getElementById('userChart' + index), userChart);

        }

        const monthAll = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          datasets: monthDataset
        };

        const monthAllChart = {
          type: 'line',
          data: monthAll,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published Each Month of Every Year",
                font: {
                  size: 16
                }
              },
              legend: {
                display: true,
                position: 'bottom'
              }
            }
          }
        };

        new Chart(
          document.getElementById('MonthChart'),
          monthAllChart
        );
        $('.data-loader.loader-two').hide()
        $('.data-loader.loader-three').hide()
      }, 3000);

      $('.data-loader.loader-one').hide();
      $('main').show()
    });
  }
}

function arrayUnique(value, index, self) {
  return self.indexOf(value) === index;
}