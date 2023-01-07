(function () {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new bootstrap.Tooltip(tooltipTriggerEl)
  })
})()

var toastTrigger = document.getElementById('share-btn')
var toastLiveExample = document.getElementById('liveToast')
if (toastTrigger) {
  toastTrigger.addEventListener('click', function () {
    var toast = new bootstrap.Toast(toastLiveExample)

    toast.show()
  })
}

var userinput = document.getElementById('userinput')
var livepreview = document.getElementById('livepreview')

$(window).on('load', function () {
  userinput.value = 'Type here...\n\nThis is [b]bold[/b]\nThis is [i]italic[/i]\nThis is [u]underlined[/u]\nThis is a [link=https://imdb.com]link[/link]\n\n[url][u][i][b]This is mixed[/b][/i][/u][/url]'
  markdown()
})

function selection() {
  if (document.getSelection()) {
    return document.getSelection().toString();
  }
}

$('.markup-btns .btn').click(function () {
  var id = $(this).prop('id')
  var selectedText = selection()
  text = userinput.value
  switch (id) {
    case 'markup-bold':
      if (selectedText != "") {
        userinput.value = text.replace(selectedText, '[b]' + selectedText + '[/b]')
      } else {
        userinput.value = userinput.value + '[b][/b]'
      }
      break;

    case 'markup-italic':
      if (selectedText != "") {
        userinput.value = text.replace(selectedText, '[i]' + selectedText + '[/i]')
      } else {
        userinput.value = userinput.value + '[i][/i]'
      }
      break;

    case 'markup-underline':
      if (selectedText != "") {
        userinput.value = text.replace(selectedText, '[u]' + selectedText + '[/u]')
      } else {
        userinput.value = userinput.value + '[u][/u]'
      }
      break;

    case 'markup-link':
      if (selectedText != "") {
        userinput.value = text.replace(selectedText, '[link=]' + selectedText + '[/link]')
      } else {
        userinput.value = userinput.value + '[link=][/link]'
      }
      break;

    case 'markup-list':
      if (selectedText != "") {
        userinput.value = text.replace(selectedText, '\n- ' + selectedText)
      } else {
        userinput.value = userinput.value + '\n- '
      }
      break;

    case 'markup-quote':
      if (selectedText != "") {
        userinput.value = text.replace(selectedText, '[quote]' + selectedText + '[/quote]')
      } else {
        userinput.value = userinput.value + '[quote][/quote]'
      }
      break;

    case 'markup-spoiler':
      if (selectedText != "") {
        userinput.value = text.replace(selectedText, '[spoiler]' + selectedText + '[/spoiler]')
      } else {
        userinput.value = userinput.value + '[spoiler][/spoiler]'
      }
      break;

    default:
      break;
  }
  markdown()
  $(userinput).focus()
})

$('#reset-btn').on('click', function () {
  userinput.value = ''
  livepreview.innerHTML = ''
})

$(userinput).on('input', function () {
  if (this.value.length == 0) {
    livepreview.innerHTML = ''
  }
  markdown();
});

function markdown() {
  text = userinput.value
  var marked = text.replaceAll('\n', '<br>')
  marked = marked.replaceAll('[b]', '<b>')
  marked = marked.replaceAll('[/b]', '</b>')
  marked = marked.replaceAll('[i]', '<i>')
  marked = marked.replaceAll('[/i]', '</i>')
  marked = marked.replaceAll('[u]', '<u>')
  marked = marked.replaceAll('[/u]', '</u>')
  marked = marked.replaceAll('[quote]', '<blockquote><hr>')
  marked = marked.replaceAll('[/quote]', '<hr></blockquote>')
  marked = marked.replaceAll('<br>- ', '<li>')
  marked = marked.replaceAll('[red]', '<font color="red">')
  marked = marked.replaceAll('[/red]', '</font>')
  marked = marked.replaceAll('[blue]', '<font color="blue">')
  marked = marked.replaceAll('[/blue]', '</font>')
  marked = marked.replaceAll('[green]', '<font color="green">')
  marked = marked.replaceAll('[/green]', '</font>')
  marked = marked.replaceAll('[orange]', '<font color="orange">')
  marked = marked.replaceAll('[/orange]', '</font>')
  marked = marked.replaceAll('[yellow]', '<font color="yellow">')
  marked = marked.replaceAll('[/yellow]', '</font>')
  marked = marked.replaceAll('[purple]', '<font color="purple">')
  marked = marked.replaceAll('[/purple]', '</font>')
  marked = marked.replaceAll('[spoiler]', '<span class="spoiler"><span>')
  marked = marked.replaceAll('[/spoiler]', '</span></span>')
  marked = marked.replaceAll(/\[link=(.*?)\]/g, '<a class="link">')
  marked = marked.replaceAll('[/link]', '</a>')
  marked = marked.replaceAll(/\[url=(.*?)\]/g, '<a class="link">')
  marked = marked.replaceAll('[url]', '<a class="link">')
  marked = marked.replaceAll('[/url]', '</a>')

  livepreview.innerHTML = marked
}