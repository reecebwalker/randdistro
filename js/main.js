;(function () {

  // Attach an event listener
  function on (el, event, fn, capture) {
    return el.addEventListener(
      event,
      fn,
      typeof capture === 'undefined' ? false : true
    )
  }

  function off (el, event, listener, capture) {
    return el.removeEventListener(
      event,
      listener,
      typeof capture === 'undefined' ? false : true
    )
  }

  function toArray (list) {
    return Array.prototype.slice.call(list)
  }

  function nodeTypeChecker (type) {
    type = type.toUpperCase()
    return function (node) {
      return node.nodeName === type
    }
  }

  function canPlay (audio) {
    return audio.readyState === 4
  }

  var isRoot = nodeTypeChecker('html')

  var isButton = nodeTypeChecker('button')

  function hasClass (el, cls) {
    return el.classList.contains(cls)
  }

  function removeClass(el, cls) {
    return el.classList.remove(cls)
  }

  function addClass(el, cls) {
    return el.classList.add(cls)
  }

  function linearGradient (deg, steps) {
    return [
      'linear-gradient(',
      deg,
      'deg,',
      steps.map(function (step) {
        return step[0] + ' ' + parseInt(step[1] * 100) + '%'
      }).join(','),
      ')'
    ].join('')
  }

  var matchesFn = (
    Element.prototype.matches ||
    Element.prototype.matchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.webkitMatchesSelector
  )

  function matches(el, selector) {
    return matchesFn.call(el, selector)
  }

  function querySelectorUpwards (el, selector) {
    return next(el.parentNode)

    function next (el) {
      if (!el || isRoot(el)) {
        return null
      } else if (matches(el, selector)) {
        return el
      } else {
        return next(el.parentNode)
      }
    }
  }

  function attachPlaylist (el) {
    var listeners = []
    var states = [ 'stopped', 'loading', 'playing' ]
    var players = toArray(el.querySelectorAll('.audio-player'))
    var btns = players.map(function (el) {
      return el.querySelector('button')
    })
    var audios = players.map(function (el) {
      return el.querySelector('audio')
    })

    // Players hidden by default. Unhide
    players.forEach(function (el) {
      el.style.display = 'inline-flex'
    })

    on(el, 'click', onClick, true)

    function onClick (e) {
      var button = e.target

      if (!button || !isButton(button)) {
        return
      }

      var player = querySelectorUpwards(button, '.audio-player')
      var audio = player.querySelector('audio')

      if (btnType(button, 'play')) {
        play(player, audio)
      } else if (btnType(button, 'pause')) {
        stop(player, audio)
      } else if (btnType(button, 'forward')) {
        forward(player, audio)
      } else if (btnType(button, 'reverse')) {
        reverse(player, audio)
      }
    }

    function btnType (btn, type) {
      return hasClass(btn, 'audio-player__btn--' + type)
    }

    function changeState (player, state) {
      var toRemove = states.slice(0)
      toRemove.splice(states.indexOf(state), 1)

      addClass(player, 'audio-player--' + state)
      toRemove.forEach(function (state) {
        removeClass(player, 'audio-player--' + state)
      })
    }

    function stopAll () {
      listeners.forEach(function (args) { off.apply(null, args) })
      players.forEach(function (el) { changeState(el, 'stopped') })
      audios.forEach(function (el) { el.pause() })
      listeners = []
    }

    function play (player, audio) {
      stopAll()
      if (canPlay(audio)) {
        doPlay()
      } else {
        listenWeak(audio, 'canplaythrough', onCanPlay)
        changeState(player, 'loading')
        audio.load()
      }

      function doPlay () {
        changeState(player, 'playing')
        listenWeak(audio, 'timeupdate', timeListener(audio))
        audio.play()
      }

      function onCanPlay () {
        doPlay()
      }

      function timeListener (audio) {
        return function onTimeUpdate (e) {
          var progress = audio.currentTime / audio.duration
          player.style.backgroundImage = linearGradient(90, [
            [ 'rgba(0, 0, 0, 0.10)', progress ],
            [ 'rgba(0, 0, 0, 0.10)', progress ],
            [ 'rgba(0, 0, 0, 0)', progress ]
          ])

          if (audio.currentTime >= audio.duration) {
            playNext(player)
          }
        }
      }
    }

    function stop (player, audio) {
      changeState(player, 'stopped')
      audio.pause()
    }

    function forward (player, audio) {
      audio.currentTime = audio.currentTime + audio.duration / 6
    }

    function reverse (player, audio) {
      audio.currentTime = audio.currentTime - audio.duration / 6
    }

    function playNext (player) {
      stopAll()
      var index = players.indexOf(player)
      if (index < players.length - 1) {
        play(players[index + 1], audios[index + 1])
      }
    }

    function listenWeak (el, event, listener) {
      on(el, event, listener)
      listeners.push([ el, event, listener ])
    }
  }

  function attach () {
    const playlists = toArray(document.querySelectorAll('.track-list'))

    playlists.forEach(function (el) {
      attachPlaylist(el)
    })
  }

  on(document, 'DOMContentLoaded', function (e) {
    attach()
  })

}());
