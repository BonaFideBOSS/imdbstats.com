const file = new XMLHttpRequest();
file.open("GET", "pollData/allimdbpolls.json");
file.send();
file.onreadystatechange = function () {
  var pollTypes = {
    "Title": 0,
    "People": 0,
    "Image": 0,
    "Character": 0
  }
  var pollTimeline = {
    "years": [],
    "pollsInEachYear": []
  }

  if (this.readyState == 4 && this.status == 200) {
    var mydata = JSON.parse(file.responseText)

    var userID;
    var matches = location.hash.match(/#([^&]+)/i);
    var hashFilter = matches && matches[1];
    if (hashFilter) {
      if (mydata['authors'].some(i => i.authorid == hashFilter)) {
        userID = hashFilter
        location.href = 'user?id=' + hashFilter
      }
    }

    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      userID = urlParams.get('id')
      pollID = urlParams.get('poll')

      if (userID) {
        userID = userID.match(/(ur\d+)/)[0]
        window.history.pushState("", "", 'user.html?id=' + userID);
      }

      if (pollID && !userID) {
        pollID = pollID.split('/')[0]
        var pollData = mydata['polls'].filter(obj => {
          return obj['url'].includes(pollID)
        })
        if (pollData.length != 0) {
          userID = pollData[0].authorid
          window.history.pushState("", "", 'user.html?id=' + userID);
        }
      }
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

        if (userData[i].type == "Titles") {
          pollTypes["Title"]++
        } else if (userData[i].type == "People") {
          pollTypes["People"]++
        } else if (userData[i].type == "Images") {
          pollTypes["Image"]++
        } else if (userData[i].type == "Characters") {
          pollTypes["Character"]++
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

        if (!(pollTimeline["years"].includes(year))) {
          pollTimeline["years"].push(year)
          pollTimeline["pollsInEachYear"].push({
            "year": year,
            "total": 0,
            "months": {}
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

        pollTimeline["years"].forEach(i => {
          $('#year-filter').append("<option>" + i + "</option>")
        })

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

        // ===== STATISTICS =====

        const chartColors = ['#4dc9f6',
          '#f67019',
          '#f53794',
          '#537bc4',
          '#acc236',
          '#166a8f',
          '#00a950',
          '#58595b',
          '#8549ba',
          '#6610f2',
          '#6f42c1',
          '#d63384',
          '#fd7e14',
          '#20c997',
          '#0d6efd',
          '#198754',
          '#0dcaf0',
          '#ffc107',
          '#dc3545'
        ]

        const pollTypeGraph = {
          labels: Object.keys(pollTypes),
          datasets: [{
            backgroundColor: chartColors,
            data: Object.values(pollTypes),
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

        const polllEachYear = []
        pollTimeline["pollsInEachYear"].forEach(i => {
          polllEachYear.push(i.total)
        })

        const yearAll = {
          labels: pollTimeline["years"],
          datasets: [{
            backgroundColor: 'rgb(255,193,7,.5)',
            borderColor: '#ffc107',
            data: polllEachYear,
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

        new Chart(
          document.getElementById('YearChart'),
          yearChart
        );

        for (let index = 0; index < pollTimeline["pollsInEachYear"].length; index++) {
          const year = {
            labels: Object.keys(pollTimeline["pollsInEachYear"][index].months),
            datasets: [{
              backgroundColor: chartColors.sample(),
              data: Object.values(pollTimeline["pollsInEachYear"][index].months),
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

          var chart = '<div class="col-lg-6 col-12 mb-4"><canvas id="chart' + index + '"></canvas></div>'
          $('#charts').append(chart)
          new Chart(document.getElementById('chart' + index), monthChart);
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