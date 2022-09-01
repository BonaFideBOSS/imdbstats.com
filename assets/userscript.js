const file = new XMLHttpRequest();
file.open("GET", "pollData/allimdbpolls.json");
file.send();
file.onreadystatechange = function () {
  var pollyears = []
  var polls2013 = 0
  var polls2013Months = []
  var polls2014 = 0
  var polls2014Months = []
  var polls2015 = 0
  var polls2015Months = []
  var polls2016 = 0
  var polls2016Months = []
  var polls2017 = 0
  var polls2017Months = []
  var polls2018 = 0
  var polls2018Months = []
  var polls2019 = 0
  var polls2019Months = []
  var polls2020 = 0
  var polls2020Months = []
  var polls2021 = 0
  var polls2021Months = []
  var polls2022 = 0
  var polls2022Months = []

  if (this.readyState == 4 && this.status == 200) {
    var mydata = JSON.parse(file.responseText)

    var userID;
    var matches = location.hash.match(/#([^&]+)/i);
    var hashFilter = matches && matches[1];
    if (hashFilter) {
      if (mydata['authors'].some(i => i.authorid == hashFilter)) {
        userID = hashFilter
        console.log(hashFilter)
        location.href = 'user?id=' + hashFilter
      }
    }

    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      userID = urlParams.get('id').match(/(ur\d+)/)[0];
      window.history.pushState("", "", 'user.html?id=' + userID);
    }

    var userData = mydata['polls'].filter(obj => {
      return obj['authorid'] === userID
    })

    if (userData.length > 0) {

      var authorData = mydata['authors'].filter(user => {
        return user['authorid'] === userID
      })

      document.title = 'IMDb Polls by ' + userData[0].author
      $('.username').html(userData[0].author)
      $('.userprofile,.navbar-brand').attr("href", 'https://www.imdb.com/user/' + userID)
      if (authorData[0].avatar != "") {
        $('.userprofilepic').attr("src", authorData[0].avatar)
      }

      var totalPolls = userData.length
      var totalVotes = 0
      var totalHomepagePolls = 0
      for (var i = 0; i < userData.length; i++) {
        totalVotes = totalVotes + userData[i].votes
        if (userData[i].featured.toLowerCase() == 'yes') {
          totalHomepagePolls = totalHomepagePolls + 1
        }
      }
      var lastUpdated = mydata.lastupdated
      var rawDate = mydata.rawdate
      var highestVote = 0
      var highestVotedPoll;
      var highestVotedPollURL;
      var lowestVote = Number.MAX_VALUE;
      var lowestVotedPoll;
      var lowestVotedPollURL;
      var onek = 0
      var fivek = 0
      var tenk = 0
      var firstpolldate = new Date()
      var lastpolldate = new Date(0);

      $('#cardtotalpolls').html(totalPolls)
      $('#cardtotalvotes').html(totalVotes.toLocaleString('en-US'))
      $('#cardtotalhp').html(totalHomepagePolls)
      $('#avgvotes').html(Math.round(totalVotes / totalPolls).toLocaleString('en-US'))

      var table = document.getElementById('imdbpolls')
      var tableBody = table.getElementsByTagName('tbody')[0]

      var polldates = []
      for (var i = 0; i < userData.length; i++) {
        polldates.push(userData[i].date)
        if (new Date(firstpolldate) > new Date(userData[i].date)) {
          firstpolldate = userData[i].date
          $('#firstpolldate').html(new Date(firstpolldate).toDateString())
          $('#authorsfirstpoll .card-title').html(userData[i].title)
          $('#authorsfirstpoll a').attr("href", userData[i].url)
        }
        if (new Date(lastpolldate) < new Date(userData[i].date)) {
          lastpolldate = userData[i].date
          $('#lastpolldate').html(new Date(lastpolldate).toDateString())
          var latestPoll = userData[i];
          $('#latest-poll .card-header span').html(new Date(latestPoll.date).toDateString())
          $('#latest-poll .card-title').html(latestPoll.title)
          $('#latest-poll .card-text span').html(latestPoll.votes)
          $('#latest-poll a').attr("href", latestPoll.url)
        }

        const oneDay = 24 * 60 * 60 * 1000;
        var pollingdays = Math.round(Math.abs((new Date(firstpolldate) - new Date()) / oneDay));
        if (pollingdays == 0) {
          pollingdays = 1
        }
        $('#avgvotesdaily').html((totalVotes / pollingdays).toFixed(3).toLocaleString('en-US'))

        if (userData[i].votes >= 1000) {
          onek = onek + 1
        }
        if (userData[i].votes >= 5000) {
          fivek = fivek + 1
        }
        if (userData[i].votes >= 10000) {
          tenk = tenk + 1
        }
        if (highestVote < userData[i].votes) {
          highestVote = userData[i].votes
          highestVotedPoll = userData[i].title
          highestVotedPollURL = userData[i].url
        }
        if (lowestVote >= userData[i].votes) {
          lowestVote = userData[i].votes
          lowestVotedPoll = userData[i].title
          lowestVotedPollURL = userData[i].url
        }

        $('#1kvotes').html(onek)
        $('#5kvotes').html(fivek)
        $('#10kvotes').html(tenk)
        $('#maxvotes').html(highestVote.toLocaleString('en-US'))
        $('#minvotes').html(lowestVote.toLocaleString('en-US'))
        $('#highestvotedpoll .card-title').html(highestVotedPoll)
        $('#highestvotedpoll .card-header a').attr("href", highestVotedPollURL)
        $('#lowestvotedpoll .card-title').html(lowestVotedPoll)
        $('#lowestvotedpoll .card-header a').attr("href", lowestVotedPollURL)

        if (userData[i].date) {
          var year = userData[i].date.split('/')[0]
          var month = userData[i].date.split('/')[1].replace(/^0+/, '')
          var day = userData[i].date.split('/')[2].replace(/^0+/, '')
        }
        pollyears.push(year)
        if (year == 2013) {
          polls2013Months.push(month)
        } else if (year == 2014) {
          polls2014Months.push(month)
        } else if (year == 2015) {
          polls2015Months.push(month)
        } else if (year == 2016) {
          polls2016Months.push(month)
        } else if (year == 2017) {
          polls2017Months.push(month)
        } else if (year == 2018) {
          polls2018Months.push(month)
        } else if (year == 2019) {
          polls2019Months.push(month)
        } else if (year == 2020) {
          polls2020Months.push(month)
        } else if (year == 2021) {
          polls2021Months.push(month)
        } else if (year == 2022) {
          polls2022Months.push(month)
        }

        $(tableBody).append('<tr><td></td>' +
          '<td nowrap><a href="' + userData[i].url + '" target="_blank">' + userData[i].title + '</a></td>' +
          '<td>' + userData[i].date + '</td>' +
          '<td>' + userData[i].votes.toLocaleString('en-US') + '</td>' +
          '<td>' + userData[i].type + '</td>' +
          '<td>' + userData[i].featured + '</td>' +
          '<td>' + userData[i].status + '</td></tr>')
      }

      var maxpolldate = 1;
      var pdc = 0;
      var mostpollitem;
      for (var i = 0; i < polldates.length; i++) {
        for (var j = i; j < polldates.length; j++) {
          if (polldates[i] == polldates[j])
            pdc++;
          if (maxpolldate < pdc) {
            maxpolldate = pdc;
            mostpollitem = polldates[i];
          }
        }
        pdc = 0;
      }
      if (maxpolldate == 1) {
        mostpollitem = polldates[0]
      }
      $('#mostpollsinaday').html(maxpolldate)
      $('#daywithmostpolls').html(new Date(mostpollitem).toDateString())

      $('#table-caption').html('Data as of ' + lastUpdated + ' (' + timelapse(rawDate) + ')')

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
            [3, "desc"]
          ],
          "lengthMenu": [
            [10, 25, 50, 100, -1],
            [10, 25, 50, 100, "All"]
          ],
          "columnDefs": [{
            "targets": [0],
            "orderable": false
          }]
        });

        polltable.buttons().container().appendTo($('#export'));
        $('.dt-button').removeClass('dt-button')
        $('#imdbpolls_info').appendTo($('#table-summary'))
        $('#imdbpolls_paginate').appendTo($('#table-pagination'))

        function pollranking() {
          var lbrow = document.querySelectorAll('#imdbpolls tbody tr')
          var pagelength = document.getElementById('entries').value
          var currentpage = $('#imdbpolls_paginate .paginate_button.current').html().replace(',', '')
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
          var lbrow = document.querySelectorAll('#imdbpolls tbody tr')
          var pagelength = document.getElementById('entries').value
          var currentpage = $('#imdbpolls_paginate .paginate_button.current').html().replace(',', '')
          var startingrank = pagelength * currentpage - pagelength
          startingrank = pollrowtotal - startingrank
          for (var i = 0; i < lbrow.length; i++) {
            if (lbrow[i].querySelectorAll('td')[0].classList.contains('dataTables_empty')) {} else {
              lbrow[i].querySelectorAll('td')[0].innerHTML = startingrank--
            }
          }
        }

        var uniqueyears = pollyears.filter((item, i, ar) => ar.indexOf(item) === i);
        var yearoptions;
        for (var i = 0; i < uniqueyears.length; i++) {
          yearoptions += "<option>" + uniqueyears[i] + "</option>";
        }
        $('#year-filter').append(yearoptions)

        $('#entries').on('change', function () {
          var selectedValue = $(this).val();
          polltable.page.len(selectedValue).draw();
        });
        $('#year-filter').on('change', function () {
          var selectedValue = $(this).val();
          polltable.columns(2).search(selectedValue).draw();
        });
        $('#type-filter').on('change', function () {
          var selectedValue = $(this).val();
          polltable.columns(4).search(selectedValue).draw();
        });
        $('#hp-filter').on('change', function () {
          var selectedValue = $(this).val();
          polltable.columns(5).search(selectedValue).draw();
        });
        $('#status-filter').on('change', function () {
          var selectedValue = $(this).val();
          polltable.columns(6).search(selectedValue).draw();
        });
        $('#tablesearch').on('input', function () {
          var selectedValue = $(this).val();
          polltable.search(selectedValue).draw();
        });

        tableTotal()
        pollranking()
        $('.custom-filter select').on('change', function () {
          tableTotal()
          if ($('#imdbpolls thead .sorting').hasClass('sorting_desc')) {
            pollranking();
          } else {
            pollrankingbottom();
          }
        })
        $('.custom-filter input').on('input', function () {
          tableTotal()
          if ($('#imdbpolls thead .sorting').hasClass('sorting_desc')) {
            pollranking();
          } else {
            pollrankingbottom();
          }
        })
        $('#imdbpolls thead .sorting,#imdbpolls_paginate').on('click', function () {
          tableTotal()
          if ($('#imdbpolls thead .sorting').hasClass('sorting_desc')) {
            pollranking();
          } else {
            pollrankingbottom();
          }
        })

        function tableTotal() {
          var row = document.querySelectorAll('#imdbpolls tbody tr')
          var votesresult = 0;
          var hpresult = 0;
          for (var i = 0; i < row.length; i++) {
            if (row[i].querySelectorAll('td')[0].classList.contains('dataTables_empty')) {} else {
              votesresult += parseInt(row[i].querySelectorAll('td')[3].textContent.replace(',', ''))
              if ((row[i].querySelectorAll('td')[5].textContent).toLowerCase() == "yes") {
                hpresult = hpresult + 1
              }
            }
          }
          $('#sum-votes').html(votesresult.toLocaleString('en-US'))
          $('#sum-features').html(hpresult)
        }
      });


      setTimeout(() => {
        // ====================================================
        // ==================== STATISTICS ====================
        // ====================================================
        //Default Settings
        //Chart.defaults.elements.bar.borderWidth = 0;
        Chart.defaults.plugins.tooltip.displayColors = false;
        Chart.defaults.plugins.tooltip.intersect = false;
        Chart.defaults.plugins.tooltip.padding = '10';
        Chart.defaults.plugins.tooltip.footerMarginTop = 15;

        const pollineachyear = {};
        const months2013 = {};
        const months2014 = {};
        const months2015 = {};
        const months2016 = {};
        const months2017 = {};
        const months2018 = {};
        const months2019 = {};
        const months2020 = {};
        const months2021 = {};
        const months2022 = {};
        pollyears.forEach(function (x) {
          pollineachyear[x] = (pollineachyear[x] || 0) + 1;
        });
        polls2013Months.forEach(function (x) {
          months2013[x] = (months2013[x] || 0) + 1;
        });
        polls2014Months.forEach(function (x) {
          months2014[x] = (months2014[x] || 0) + 1;
        });
        polls2015Months.forEach(function (x) {
          months2015[x] = (months2015[x] || 0) + 1;
        });
        polls2016Months.forEach(function (x) {
          months2016[x] = (months2016[x] || 0) + 1;
        });
        polls2017Months.forEach(function (x) {
          months2017[x] = (months2017[x] || 0) + 1;
        });
        polls2018Months.forEach(function (x) {
          months2018[x] = (months2018[x] || 0) + 1;
        });
        polls2019Months.forEach(function (x) {
          months2019[x] = (months2019[x] || 0) + 1;
        });
        polls2020Months.forEach(function (x) {
          months2020[x] = (months2020[x] || 0) + 1;
        });
        polls2021Months.forEach(function (x) {
          months2021[x] = (months2021[x] || 0) + 1;
        });
        polls2022Months.forEach(function (x) {
          months2022[x] = (months2022[x] || 0) + 1;
        });


        // ===== MILESTONES =====
        var m1 = Math.ceil(totalPolls / 50) * 50;
        if (m1 == totalPolls) {
          m1 = m1 + 50
        }
        $('#m1Text').html(((totalPolls / m1) * 100).toFixed(2) + '%')
        const milestoneOne = {
          labels: ['Polls Published', 'Polls needed to reach next milestone'],
          datasets: [{
            backgroundColor: ['#0dcaf0', '#212529'],
            borderWidth: '0',
            data: [totalPolls, (m1 - totalPolls)],
          }]
        };
        var m2 = Math.ceil(totalVotes / 50000) * 50000;
        if (m2 == totalVotes) {
          m2 = m2 + 50000
        }
        $('#m2Text').html(((totalVotes / m2) * 100).toFixed(2) + '%')
        const milestoneTwo = {
          labels: ['Votes Gained', 'Votes needed to reach next milestone'],
          datasets: [{
            backgroundColor: ['#0dcaf0', '#212529'],
            borderWidth: '0',
            data: [totalVotes, (m2 - totalVotes)],
          }]
        };
        var m3 = Math.ceil(totalHomepagePolls / 10) * 10;
        if (m3 == totalHomepagePolls) {
          m3 = m3 + 10
        }
        $('#m3Text').html(((totalHomepagePolls / m3) * 100).toFixed(2) + '%')
        const milestoneThree = {
          labels: ['Featured Polls', 'More features needed'],
          datasets: [{
            backgroundColor: ['#0dcaf0', '#212529'],
            borderWidth: '0',
            data: [totalHomepagePolls, (m3 - totalHomepagePolls)],
          }]
        };
        var m4 = Math.ceil(highestVote / 5000) * 5000;
        if (m4 == totalPolls) {
          m4 = m4 + 50000
        }
        $('#m4Text').html(((highestVote / m4) * 100).toFixed(2) + '%')
        const milestoneFour = {
          labels: ['Highest Vote', 'Votes needed to reach next milestone'],
          datasets: [{
            backgroundColor: ['#0dcaf0', '#212529'],
            borderWidth: '0',
            data: [highestVote, (m4 - highestVote)],
          }]
        };

        const milestoneChartOne = {
          type: 'doughnut',
          data: milestoneOne,
          options: {
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  footer: function () {
                    return 'Next Milestone: ' + m1
                  },
                }
              }
            }
          }
        };
        const milestoneChartTwo = {
          type: 'doughnut',
          data: milestoneTwo,
          options: {
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  footer: function () {
                    return 'Next Milestone: ' + m2.toLocaleString('en-US')
                  },
                }
              }
            }
          }
        };
        const milestoneChartThree = {
          type: 'doughnut',
          data: milestoneThree,
          options: {
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  footer: function () {
                    return 'Next Milestone: ' + m3
                  },
                }
              }
            }
          }
        };
        const milestoneChartFour = {
          type: 'doughnut',
          data: milestoneFour,
          options: {
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  footer: function () {
                    return 'Next Milestone: ' + m4.toLocaleString('en-US') + '\nHighest Voted Poll: ' + highestVotedPoll
                  },
                }
              }
            }
          }
        };
        // ===== STATISTICS =====
        const chartColors = ['#6610f2', '#6f42c1', '#d63384', '#fd7e14', '#20c997', '#0d6efd', '#198754', '#0dcaf0', '#ffc107', '#dc3545', ]
        const yearAll = {
          labels: Object.keys(pollineachyear),
          datasets: [{
            backgroundColor: 'rgb(255,193,7,.5)',
            borderColor: '#ffc107',
            data: Object.values(pollineachyear),
          }]
        };
        const year2013 = {
          labels: monthsChecker(Object.keys(months2013)),
          datasets: [{
            backgroundColor: chartColors.sample(),
            data: Object.values(months2013),
          }]
        };
        const year2014 = {
          labels: monthsChecker(Object.keys(months2014)),
          datasets: [{
            backgroundColor: chartColors.sample(),
            data: Object.values(months2014),
          }]
        };
        const year2015 = {
          labels: monthsChecker(Object.keys(months2015)),
          datasets: [{
            backgroundColor: chartColors.sample(),
            data: Object.values(months2015),
          }]
        };
        const year2016 = {
          labels: monthsChecker(Object.keys(months2016)),
          datasets: [{
            backgroundColor: chartColors.sample(),
            data: Object.values(months2016),
          }]
        };
        const year2017 = {
          labels: monthsChecker(Object.keys(months2017)),
          datasets: [{
            backgroundColor: chartColors.sample(),
            data: Object.values(months2017),
          }]
        };
        const year2018 = {
          labels: monthsChecker(Object.keys(months2018)),
          datasets: [{
            backgroundColor: chartColors.sample(),
            data: Object.values(months2018),
          }]
        };
        const year2019 = {
          labels: monthsChecker(Object.keys(months2019)),
          datasets: [{
            backgroundColor: chartColors.sample(),
            data: Object.values(months2019),
          }]
        };
        const year2020 = {
          labels: monthsChecker(Object.keys(months2020)),
          datasets: [{
            backgroundColor: chartColors.sample(),
            data: Object.values(months2020),
          }]
        };
        const year2021 = {
          labels: monthsChecker(Object.keys(months2021)),
          datasets: [{
            backgroundColor: chartColors.sample(),
            data: Object.values(months2021),
          }]
        };
        const year2022 = {
          labels: monthsChecker(Object.keys(months2022)),
          datasets: [{
            backgroundColor: chartColors.sample(),
            data: Object.values(months2022),
          }]
        };

        const yearChart = {
          type: 'line',
          data: yearAll,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published Each Year",
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
        const monthChart2013 = {
          type: 'bar',
          data: year2013,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published in 2013",
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
        const monthChart2014 = {
          type: 'bar',
          data: year2014,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published in 2014",
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
        const monthChart2015 = {
          type: 'bar',
          data: year2015,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published in 2015",
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
        const monthChart2016 = {
          type: 'bar',
          data: year2016,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published in 2016",
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
        const monthChart2017 = {
          type: 'bar',
          data: year2017,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published in 2017",
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
        const monthChart2018 = {
          type: 'bar',
          data: year2018,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published in 2018",
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
        const monthChart2019 = {
          type: 'bar',
          data: year2019,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published in 2019",
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
        const monthChart2020 = {
          type: 'bar',
          data: year2020,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published in 2020",
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
        const monthChart2021 = {
          type: 'bar',
          data: year2021,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published in 2021",
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
        const monthChart2022 = {
          type: 'bar',
          data: year2022,
          options: {
            plugins: {
              title: {
                display: true,
                text: "Polls Published in 2022",
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

        new Chart(
          document.getElementById('milestoneOne'),
          milestoneChartOne
        );
        new Chart(
          document.getElementById('milestoneTwo'),
          milestoneChartTwo
        );
        new Chart(
          document.getElementById('milestoneThree'),
          milestoneChartThree
        );
        new Chart(
          document.getElementById('milestoneFour'),
          milestoneChartFour
        );
        new Chart(
          document.getElementById('YearChart'),
          yearChart
        );
        if (2013 in pollineachyear) {
          $('#2013MonthChart').parent().attr('hidden', false)
          new Chart(document.getElementById('2013MonthChart'), monthChart2013);
        }
        if (2014 in pollineachyear) {
          $('#2014MonthChart').parent().attr('hidden', false)
          new Chart(document.getElementById('2014MonthChart'), monthChart2014);
        }
        if (2015 in pollineachyear) {
          $('#2015MonthChart').parent().attr('hidden', false)
          new Chart(document.getElementById('2015MonthChart'), monthChart2015);
        }
        if (2016 in pollineachyear) {
          $('#2016MonthChart').parent().attr('hidden', false)
          new Chart(document.getElementById('2016MonthChart'), monthChart2016);
        }
        if (2017 in pollineachyear) {
          $('#2017MonthChart').parent().attr('hidden', false)
          new Chart(document.getElementById('2017MonthChart'), monthChart2017);
        }
        if (2018 in pollineachyear) {
          $('#2018MonthChart').parent().attr('hidden', false)
          new Chart(document.getElementById('2018MonthChart'), monthChart2018);
        }
        if (2019 in pollineachyear) {
          $('#2019MonthChart').parent().attr('hidden', false)
          new Chart(document.getElementById('2019MonthChart'), monthChart2019);
        }
        if (2020 in pollineachyear) {
          $('#2020MonthChart').parent().attr('hidden', false)
          new Chart(document.getElementById('2020MonthChart'), monthChart2020);
        }
        if (2021 in pollineachyear) {
          $('#2021MonthChart').parent().attr('hidden', false)
          new Chart(document.getElementById('2021MonthChart'), monthChart2021);
        }
        if (2022 in pollineachyear) {
          $('#2022MonthChart').parent().attr('hidden', false)
          new Chart(document.getElementById('2022MonthChart'), monthChart2022);
        }

        $('.data-loader.loader-two').hide()
        $('.data-loader.loader-three').hide()
      }, 3000);

      $('.data-loader.loader-one').hide()
      $('main').show()
    } else {
      location.href = '404'
    }
  }
}

function monthsChecker(months) {
  const monthsArray = []
  for (var i = 0; i < months.length; i++) {
    switch (months[i]) {
      case '1':
        monthsArray.push('Jan')
        break;
      case '2':
        monthsArray.push('Feb')
        break;
      case '3':
        monthsArray.push('Mar')
        break;
      case '4':
        monthsArray.push('Apr')
        break;
      case '5':
        monthsArray.push('May')
        break;
      case '6':
        monthsArray.push('Jun')
        break;
      case '7':
        monthsArray.push('Jul')
        break;
      case '8':
        monthsArray.push('Aug')
        break;
      case '9':
        monthsArray.push('Sep')
        break;
      case '10':
        monthsArray.push('Oct')
        break;
      case '11':
        monthsArray.push('Nov')
        break;
      case '12':
        monthsArray.push('Dec')
        break;
      default:
        break;
    }
  }
  return monthsArray
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