const file = new XMLHttpRequest();
file.open("GET", "pollData/allimdbpolls.json");
file.send();
file.onreadystatechange = function () {

  if (this.readyState == 4 && this.status == 200) {

    var yearSelector = 'All'
    var monthSelector = 'All'
    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      yearSelector = urlParams.get('year')
      monthSelector = urlParams.get('month')
    }

    var pollData = JSON.parse(file.responseText)
    var authors = pollData.authors
    var polls = pollData.polls

    var leaderboardYears = []
    var leaderboardMonths = []

    for (var i = 0; i < polls.length; i++) {
      if (polls[i].date) {
        var year = polls[i].date.split('/')[0]
        var month = polls[i].date.split('/')[1]
      }

      if (!leaderboardYears.includes(year)) {
        leaderboardYears.push(year)
      }
      if (year == yearSelector && !leaderboardMonths.includes(month)) {
        leaderboardMonths.push(month)
      }
    }

    leaderboardYears.forEach(i => $('#year-selector').append('<option>' + i + '</option>'))
    leaderboardMonths.forEach(i => $('#month-selector').append('<option value="' + i + '">' + readableMonthLong(i) + '</option>'))

    $('#year-selector').change(function () {
      const year = this.value != 'All Time' ? '?year=' + this.value : ''
      const month = monthSelector != null && monthSelector != 'All' && this.value != 'All Time' ? '&month=' + monthSelector : ''
      location.href = 'leaderboard' + year + month
    })

    $('#month-selector').change(function () {
      location.href = 'leaderboard?year=' + $('#year-selector').val() + '&month=' + this.value
    })

    if (leaderboardYears.includes(yearSelector)) {
      $('#year-selector').val(yearSelector)
      if (monthSelector != null && monthSelector != 'All' && leaderboardMonths.includes(monthSelector)) {
        $('#month-selector').val(monthSelector)
      }
      $('#month-selector').attr('hidden', false)
      polls = polls.filter(obj => {
        if (leaderboardMonths.includes(monthSelector)) {
          return obj['date'].split('/')[0] === yearSelector && obj['date'].split('/')[1] === monthSelector
        }
        return obj['date'].split('/')[0] === yearSelector
      })
    }

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
      var lbtable = $(leaderboard).DataTable({
        dom: 'rtipB',
        "pageLength": 100,
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

      $('.data-loader.loader-one').hide();
      $('main').show()
    });
  }
}

function arrayUnique(value, index, self) {
  return self.indexOf(value) === index;
}