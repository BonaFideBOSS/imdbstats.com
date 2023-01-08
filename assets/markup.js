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
    var selection = document.getSelection()
    var startingPoint = userinput.selectionStart;
    return {
      text: selection.toString(),
      index: startingPoint,
      textEnd: userinput.selectionEnd
    }
  }
}

String.prototype.myReplace = function (search, replace, from) {
  if (this.length > from) {
    return this.slice(0, from) + this.slice(from).replace(search, replace);
  }
  return this;
}

$('.markup-btns .btn').click(function () {
  var id = $(this).prop('id')
  var selectedText = selection()
  var selectedTextIndex = selectedText.index
  var textEnd = selectedText.textEnd
  selectedText = selectedText.text
  text = userinput.value

  switch (id) {
    case 'markup-bold':
      if (selectedText != "") {
        userinput.value = text.myReplace(selectedText, '[b]' + selectedText + '[/b]', selectedTextIndex)
        textEnd += 7
      } else {
        userinput.value = text.slice(0, textEnd) + '[b][/b]' + text.slice(textEnd)
        textEnd = textEnd + 3
      }
      break;

    case 'markup-italic':
      if (selectedText != "") {
        userinput.value = text.myReplace(selectedText, '[i]' + selectedText + '[/i]', selectedTextIndex)
        textEnd += 7
      } else {
        userinput.value = text.slice(0, textEnd) + '[i][/i]' + text.slice(textEnd)
        textEnd = textEnd + 3
      }
      break;

    case 'markup-underline':
      if (selectedText != "") {
        userinput.value = text.myReplace(selectedText, '[u]' + selectedText + '[/u]', selectedTextIndex)
        textEnd += 7
      } else {
        userinput.value = text.slice(0, textEnd) + '[u][/u]' + text.slice(textEnd)
        textEnd = textEnd + 3
      }
      break;

    case 'markup-link':
      if (selectedText != "") {
        userinput.value = text.myReplace(selectedText, '[link=]' + selectedText + '[/link]', selectedTextIndex)
        textEnd += 14
      } else {
        userinput.value = text.slice(0, textEnd) + '[link=][/link]' + text.slice(textEnd)
        textEnd = textEnd + 7
      }
      break;

    case 'markup-list':
      var lineBreak = '\n'
      if (selectedTextIndex != 0) {
        if (text[selectedTextIndex - 1].charCodeAt(0) == 10) {
          lineBreak = ''
        }
      }

      if (selectedText != "") {
        userinput.value = text.myReplace(selectedText, lineBreak + '- ' + selectedText, selectedTextIndex)
        textEnd += (lineBreak != '') ? 3 : 2
      } else {
        userinput.value = text.slice(0, textEnd) + lineBreak + '- ' + text.slice(textEnd)
        textEnd += (lineBreak != '') ? 3 : 2
      }
      break;

    case 'markup-quote':
      if (selectedText != "") {
        userinput.value = text.myReplace(selectedText, '[quote]' + selectedText + '[/quote]', selectedTextIndex)
        textEnd += 15
      } else {
        userinput.value = text.slice(0, textEnd) + '[quote][/quote]' + text.slice(textEnd)
        textEnd = textEnd + 7
      }
      break;

    case 'markup-spoiler':
      if (selectedText != "") {
        userinput.value = text.myReplace(selectedText, '[spoiler]' + selectedText + '[/spoiler]', selectedTextIndex)
        textEnd += 19
      } else {
        userinput.value = text.slice(0, textEnd) + '[spoiler][/spoiler]' + text.slice(textEnd)
        textEnd = textEnd + 9
      }
      break;

    default:
      break;
  }
  markdown()
  $(userinput).focus()
  userinput.selectionStart = userinput.selectionEnd = textEnd
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