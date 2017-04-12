;(function () {

  function toArray (list) {
    return Array.prototype.slice.call(list)
  }
  
  function attachPlaylist (el) {
    var players = toArray(el.querySelectorAll('.audio-player'))
    console.log(players)
    var btns = players.map(function (el) {
      return el.querySelector('button')
    })
    var audios = players.map(function (el) {
      return el.querySelector('audio')
    })

    el.addEventListener('click', onClick)

    function onClick (e) {
      var target = e.target
      
      if (!target) {
        return
      }
      
      if (
        target.nodeName === 'BUTTON' &&
        target.classList.contains('playing')
      ) {
        target.classList.remove('playing')
        target.parentNode.querySelector('audio').pause()
      } else if (
        target.nodeName === 'BUTTON' &&
        !target.classList.contains('playing')
      ) {
        stopAll()
        target.classList.add('playing')
        console.log(target.querySelector('audio'))
        target.parentNode.querySelector('audio').play()
      }
    }

    function stopAll () {
      btns.forEach(function (el) {
        el.classList.remove('playing')
      })

      audios.forEach(function (el) {
        el.pause()
      })
    }
  }

  function attach () {
    const playlists = toArray(document.querySelectorAll('.track-list'))

    playlists.forEach(function (el) {
      attachPlaylist(el)
    })
  }

  document.addEventListener('DOMContentLoaded', function (e) {
    attach()
  })
  
}());
