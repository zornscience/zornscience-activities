/* ZornScience Tutor front end */
(function () {
  'use strict';

  var CFG = window.ZST_CONFIG || {};
  var STORE_KEY = 'zst_chat_v1';
  var SPEAK_KEY = 'zst_speak_v1';
  var LANG_KEY = 'zst_lang_v1';
  var MAX_IMG_EDGE = 1568;

  /* ---------- Interface text in English and Spanish ---------- */

  var I18N = {
    en: {
      sub: 'Here to help with chemistry, physics, and biology',
      newChat: 'New chat',
      yourQuestion: 'Your question',
      placeholder: 'Type your chemistry, physics, or biology question...',
      placeholderShort: 'Ask a question...',
      fullscreen: 'Full screen',
      exitFullscreen: 'Exit full screen',
      listeningPlaceholder: 'Listening...',
      send: 'Send',
      voice: 'Voice',
      language: 'Language',
      note: "AI tutors can make mistakes, so double-check important work. Please don't share personal information, and crop names out of photos.",
      noteVoice: " Voice typing uses your browser's speech recognition. ZornScience does not record or save your voice.",
      chips: [
        ['Stuck on stoichiometry', "I'm stuck on a stoichiometry problem. Can you help me get started?"],
        ["Explain Newton's 2nd law", "Can you explain Newton's second law in simple terms?"],
        ['How natural selection works', 'Can you help me understand how natural selection works?'],
        ['Check my work', 'I solved a problem and want to check my work.']
      ],
      welcomeFallback: 'Hi! What chemistry, physics, or biology question are you working on?',
      attach: 'Attach a photo of your work',
      mic: 'Start voice input',
      micListening: 'Listening',
      micNoSpeech: "I didn't hear anything. Tap the mic and try again, or type your question.",
      micNetwork: "Voice typing couldn't connect right now. You can type your question instead.",
      speakOn: 'Reading replies aloud (click to stop)',
      speakOff: 'Read replies aloud',
      bestVoice: ' (best on this device)',
      voiceSample: "Hi! This is how I'll sound when I read my replies.",
      photoReady: 'Photo ready to send',
      photoAttached: 'Photo attached',
      removePhoto: 'Remove photo',
      photoYouShared: 'Photo you shared',
      photoShared: 'Photo shared',
      thinking: 'Thinking',
      chooseImage: 'Please choose an image file.',
      photoOpenFail: "That photo couldn't be opened. Try a JPG or PNG.",
      micDenied: 'To use the microphone, allow microphone access for this site in your browser settings.',
      micUnclear: "I couldn't hear that clearly. Try again, or type your question.",
      photoDefault: 'Here is a photo of my work.',
      tooLong: 'That message is a little long. Please keep it under {n} characters.',
      genericError: 'Something went wrong. Please try again.',
      noConnect: "I couldn't connect. Check your internet connection and try again.",
      earlierPhoto: '(I shared a photo with this message earlier.)',
      loadFail: 'The tutor could not load. Please refresh the page.',
      micLang: 'en-US',
      recLang: 'en-US'
    },
    es: {
      sub: 'Te ayudo con química, física y biología',
      newChat: 'Nuevo chat',
      yourQuestion: 'Tu pregunta',
      placeholder: 'Escribe tu pregunta de química, física o biología...',
      placeholderShort: 'Haz una pregunta...',
      fullscreen: 'Pantalla completa',
      exitFullscreen: 'Salir de pantalla completa',
      listeningPlaceholder: 'Escuchando...',
      send: 'Enviar',
      voice: 'Voz',
      language: 'Idioma',
      note: 'Los tutores de IA pueden equivocarse, así que revisa bien el trabajo importante. No compartas información personal y recorta los nombres de tus fotos.',
      noteVoice: ' Escribir con la voz usa el reconocimiento de voz de tu navegador. ZornScience no graba ni guarda tu voz.',
      chips: [
        ['Ayuda con estequiometría', 'No me sale un problema de estequiometría. ¿Me ayudas a empezar?'],
        ['Explica la 2.ª ley de Newton', '¿Me puedes explicar la segunda ley de Newton de forma sencilla?'],
        ['Cómo funciona la selección natural', '¿Me puedes ayudar a entender cómo funciona la selección natural?'],
        ['Revisa mi trabajo', 'Resolví un problema y quiero revisar mi trabajo.']
      ],
      welcomeFallback: '¡Hola! ¿En qué pregunta de química, física o biología estás trabajando?',
      attach: 'Adjunta una foto de tu trabajo',
      mic: 'Iniciar entrada de voz',
      micListening: 'Escuchando',
      micNoSpeech: 'No escuché nada. Toca el micrófono e inténtalo de nuevo, o escribe tu pregunta.',
      micNetwork: 'Escribir con la voz no se pudo conectar ahora. Puedes escribir tu pregunta.',
      speakOn: 'Leyendo las respuestas en voz alta (clic para parar)',
      speakOff: 'Leer las respuestas en voz alta',
      bestVoice: ' (la mejor en este dispositivo)',
      voiceSample: '¡Hola! Así voy a sonar cuando lea mis respuestas.',
      photoReady: 'Foto lista para enviar',
      photoAttached: 'Foto adjunta',
      removePhoto: 'Quitar foto',
      photoYouShared: 'Foto que compartiste',
      photoShared: 'Foto compartida',
      thinking: 'Pensando',
      chooseImage: 'Elige un archivo de imagen.',
      photoOpenFail: 'No se pudo abrir esa foto. Prueba con una imagen JPG o PNG.',
      micDenied: 'Para usar el micrófono, permite el acceso al micrófono para este sitio en la configuración de tu navegador.',
      micUnclear: 'No te escuché bien. Inténtalo de nuevo o escribe tu pregunta.',
      photoDefault: 'Aquí está una foto de mi trabajo.',
      tooLong: 'Ese mensaje es un poco largo. Escribe menos de {n} caracteres, por favor.',
      genericError: 'Algo salió mal. Inténtalo de nuevo.',
      noConnect: 'No me pude conectar. Revisa tu conexión a internet e inténtalo de nuevo.',
      earlierPhoto: '(Compartí una foto con este mensaje antes.)',
      loadFail: 'No se pudo cargar el tutor. Actualiza la página.',
      micLang: 'es-US',
      recLang: 'es-MX'
    }
  };

  // Words used when reading math and chemistry aloud.
  var SAY = {
    en: {
      equals: 'equals', plus: 'plus', minus: 'minus', negative: 'negative', times: 'times', over: 'over',
      per: 'per', dividedBy: 'divided by', squared: 'squared', cubed: 'cubed', toThe: 'to the',
      sqrt: 'the square root of', yields: 'yields', equilibrium: 'is in equilibrium with',
      about: 'is about', le: 'is less than or equal to', ge: 'is greater than or equal to',
      lt: 'is less than', gt: 'is greater than', pm: 'plus or minus', degrees: 'degrees',
      aq: 'aqueous', s: 'solid', l: 'liquid', g: 'gas', link: 'the link', sum: 'sum', ohms: 'ohms'
    },
    es: {
      equals: 'es igual a', plus: 'más', minus: 'menos', negative: 'menos', times: 'por', over: 'entre',
      per: 'por', dividedBy: 'dividido entre', squared: 'al cuadrado', cubed: 'al cubo', toThe: 'a la',
      sqrt: 'la raíz cuadrada de', yields: 'produce', equilibrium: 'está en equilibrio con',
      about: 'es aproximadamente', le: 'es menor o igual a', ge: 'es mayor o igual a',
      lt: 'es menor que', gt: 'es mayor que', pm: 'más o menos', degrees: 'grados',
      aq: 'acuoso', s: 'sólido', l: 'líquido', g: 'gaseoso', link: 'el enlace', sum: 'suma', ohms: 'ohmios'
    }
  };

  var ATOM_SVG =
    '<svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">' +
    '<circle cx="24" cy="24" r="4" fill="currentColor"/>' +
    '<g fill="none" stroke="currentColor" stroke-width="2.4">' +
    '<ellipse cx="24" cy="24" rx="19" ry="7.5"/>' +
    '<ellipse cx="24" cy="24" rx="19" ry="7.5" transform="rotate(60 24 24)"/>' +
    '<ellipse cx="24" cy="24" rx="19" ry="7.5" transform="rotate(-60 24 24)"/>' +
    '</g></svg>';

  var ICONS = {
    camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13.2" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    speakerOn: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    expand: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    collapse: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    speakerOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  };

  /* ---------- Safe rendering: light markdown + KaTeX math ---------- */

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderMath(tex, display) {
    if (window.katex && typeof window.katex.renderToString === 'function') {
      try {
        return window.katex.renderToString(tex, {
          displayMode: display,
          throwOnError: false,
          strict: 'ignore',
          trust: false
        });
      } catch (e) { /* fall through */ }
    }
    return '<code>' + escapeHtml(display ? '$$' + tex + '$$' : '$' + tex + '$') + '</code>';
  }

  function inlineFormat(s) {
    // s is already HTML-escaped.
    s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    // Links are only kept when they point to this website.
    s = s.replace(/\[([^\]\n]{1,200})\]\((https?:\/\/[^\s)]+)\)/g, function (m, label, url) {
      var host;
      try {
        host = new URL(url.replace(/&amp;/g, '&')).hostname.replace(/^www\./i, '').toLowerCase();
      } catch (e) {
        return label;
      }
      var site = String(CFG.siteHost || '').replace(/^www\./i, '').toLowerCase();
      if (!site || host !== site) return label;
      return '<a class="zst-link" href="' + url + '" target="_blank" rel="noopener">' + label + '</a>';
    });
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[\s(])\*(?=\S)([^*\n]*?\S)\*(?=[\s).,!?:;]|$)/g, '$1<em>$2</em>');
    return s;
  }

  var MATH_RE = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$\n]+?)\$/g;

  function renderText(text) {
    var math = [];
    // Pull math out first so markdown never touches it.
    var protectedText = String(text).replace(MATH_RE, function (m, d1, d2, i1, i2) {
      var display = d1 !== undefined || d2 !== undefined;
      var tex = d1 || d2 || i1 || i2 || '';
      math.push({ tex: tex, display: display });
      return '\u0000' + (math.length - 1) + '\u0000';
    });

    var lines = escapeHtml(protectedText).split(/\r?\n/);
    var html = '';
    var listType = null;
    var para = [];

    function flushPara() {
      if (para.length) {
        html += '<p>' + inlineFormat(para.join('<br>')) + '</p>';
        para = [];
      }
    }
    function closeList() {
      if (listType) {
        html += '</' + listType + '>';
        listType = null;
      }
    }

    lines.forEach(function (line) {
      var ul = line.match(/^\s*[-*•]\s+(.*)$/);
      var ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
      if (ul || ol) {
        flushPara();
        var type = ul ? 'ul' : 'ol';
        if (listType !== type) {
          closeList();
          html += '<' + type + '>';
          listType = type;
        }
        html += '<li>' + inlineFormat((ul || ol)[1]) + '</li>';
      } else if (/^\s*$/.test(line)) {
        flushPara();
        closeList();
      } else {
        closeList();
        para.push(line.replace(/^#{1,6}\s+/, ''));
      }
    });
    flushPara();
    closeList();

    return html.replace(/\u0000(\d+)\u0000/g, function (m, i) {
      var item = math[+i];
      return item ? renderMath(item.tex, item.display) : '';
    });
  }

  /* ---------- Turning replies into speakable text ---------- */

  var GREEK = {
    alpha: 'alpha', beta: 'beta', gamma: 'gamma', delta: 'delta', Delta: 'delta', epsilon: 'epsilon',
    theta: 'theta', lambda: 'lambda', mu: 'mu', nu: 'nu', pi: 'pi', rho: 'rho', sigma: 'sigma',
    tau: 'tau', phi: 'phi', omega: 'omega'
  };

  function chemToSpeech(f, W) {
    return f
      .replace(/<=>|<->|\\rightleftharpoons/g, ' ' + W.equilibrium + ' ')
      .replace(/->|\\rightarrow|\\to/g, ' ' + W.yields + ' ')
      .replace(/\^\{?(\d*)\+\}?/g, function (m, n) { return ' ' + (n || '') + ' ' + W.plus + ' '; })
      .replace(/\^\{?(\d*)-\}?/g, function (m, n) { return ' ' + (n || '') + ' ' + W.minus + ' '; })
      .replace(/\((aq|s|l|g)\)/g, function (m, p) { return ' ' + W[p] + ' '; })
      .replace(/(\d)([A-Z])/g, '$1 $2')
      .replace(/([A-Z][a-z]?)(?=[A-Z])/g, '$1 ')
      .replace(/([A-Z][a-z]?)(\d+)/g, '$1 $2 ')
      .replace(/(\))(\d+)/g, '$1 $2 ')
      .replace(/\s\+\s/g, ' ' + W.plus + ' ')
      .replace(/[{}]/g, ' ');
  }

  function mathToSpeech(tex, W) {
    var s = ' ' + tex + ' ';
    var kept = [];
    function keep(str) { kept.push(str); return ' \u0001' + (kept.length - 1) + '\u0001 '; }
    s = s.replace(/\\ce\{((?:[^{}]|\{[^{}]*\})*)\}/g, function (m, f) { return keep(chemToSpeech(f, W)); });
    s = s.replace(/\\(?:text|mathrm|mathbf|operatorname)\{([^{}]*)\}/g, function (m, t) {
      return keep(t.replace(/\//g, ' ' + W.per + ' '));
    });
    // Spell out variable groups like PV or nRT so they are read letter by letter.
    s = s.replace(/(^|[^\\a-zA-Z])([a-zA-Z]{2,4})(?=[^a-zA-Z]|$)/g, function (m, pre, w) {
      return pre + w.split('').join(' ');
    });
    s = s.replace(/(^|[\s=(])-\s*(?=\d)/g, '$1 ' + W.negative + ' ');
    for (var i = 0; i < 3; i++) {
      s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, ' $1 ' + W.over + ' $2 ');
      s = s.replace(/\\sqrt\{([^{}]*)\}/g, ' ' + W.sqrt + ' $1 ');
    }
    s = s.replace(/\^\{?2\}?(?![\d])/g, ' ' + W.squared + ' ')
      .replace(/\^\{?3\}?(?![\d])/g, ' ' + W.cubed + ' ')
      .replace(/\^\{([^{}]*)\}/g, ' ' + W.toThe + ' $1 ')
      .replace(/\^(-?\w)/g, ' ' + W.toThe + ' $1 ')
      .replace(/_\{([^{}]*)\}/g, ' $1 ')
      .replace(/_(\w)/g, ' $1 ')
      .replace(/\\(?:times|cdot)/g, ' ' + W.times + ' ')
      .replace(/\\div/g, ' ' + W.dividedBy + ' ')
      .replace(/\\approx/g, ' ' + W.about + ' ')
      .replace(/\\(?:leq|le)\b/g, ' ' + W.le + ' ')
      .replace(/\\(?:geq|ge)\b/g, ' ' + W.ge + ' ')
      .replace(/\\pm/g, ' ' + W.pm + ' ')
      .replace(/\\degree|\^\\circ|\\circ/g, ' ' + W.degrees + ' ')
      .replace(/\\(?:rightarrow|to)\b|->/g, ' ' + W.yields + ' ')
      .replace(/\\Sigma/g, ' ' + W.sum + ' ')
      .replace(/\\Omega/g, ' ' + W.ohms + ' ')
      .replace(/\\([A-Za-z]+)/g, function (m, name) { return GREEK[name] ? ' ' + GREEK[name] + ' ' : ' '; })
      .replace(/(\d),(\d{3})/g, '$1$2')
      .replace(/(\w|\))\s*-\s*(?=[\w(])/g, '$1 ' + W.minus + ' ')
      .replace(/\+/g, ' ' + W.plus + ' ')
      .replace(/=/g, ' ' + W.equals + ' ')
      .replace(/</g, ' ' + W.lt + ' ')
      .replace(/>/g, ' ' + W.gt + ' ')
      .replace(/\//g, ' ' + W.over + ' ')
      .replace(/[{}\\]/g, ' ');
    s = s.replace(/\u0001(\d+)\u0001/g, function (m, i) { return kept[+i] || ''; });
    return s.replace(/\s+/g, ' ').trim();
  }

  function toSpeech(text, lang) {
    var W = SAY[lang] || SAY.en;
    var s = String(text).replace(MATH_RE, function (m, d1, d2, i1, i2) {
      return ' ' + mathToSpeech(d1 || d2 || i1 || i2 || '', W) + ' ';
    });
    s = s
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/(^|\s)\*([^*\n]+)\*/g, '$1$2')
      .replace(/^\s*#{1,6}\s+/gm, '')
      .replace(/^\s*[-*•]\s+/gm, '')
      .replace(/^\s*(\d+)[.)]\s+/gm, '$1. ')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '$1')
      .replace(/https?:\/\/\S+/g, W.link);
    return s.replace(/[ \t]+/g, ' ').trim();
  }

  /* ---------- Storage (optional; the chat works without it) ---------- */

  function storeGet(key) {
    try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function storeSet(key, val) {
    try { window.sessionStorage.setItem(key, val); } catch (e) { /* keep in memory only */ }
  }
  function storeDel(key) {
    try { window.sessionStorage.removeItem(key); } catch (e) { /* ignore */ }
  }
  function localGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function localSet(key, val) {
    try { window.localStorage.setItem(key, val); } catch (e) { /* ignore */ }
  }
  function loadHistory() {
    try {
      var parsed = JSON.parse(storeGet(STORE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  function saveHistory(h) {
    storeSet(STORE_KEY, JSON.stringify(h.slice(-40)));
  }

  function startingLang() {
    var saved = localGet(LANG_KEY);
    if (saved === 'en' || saved === 'es') return saved;
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    return /^es\b/i.test(nav) ? 'es' : 'en';
  }

  /* ---------- Image shrinking ---------- */

  function shrinkImage(file, T) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) {
        reject(new Error(T('chooseImage')));
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        var scale = Math.min(1, MAX_IMG_EDGE / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale));
        var ch = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        var dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve({ dataUrl: dataUrl, data: dataUrl.split(',')[1], mediaType: 'image/jpeg' });
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error(T('photoOpenFail')));
      };
      img.src = url;
    });
  }

  /* ---------- Chat widget ---------- */

  function initChat(root) {
    try {
      var own = JSON.parse(root.getAttribute('data-zst-config') || '{}');
      Object.keys(own).forEach(function (k) { CFG[k] = own[k]; });
    } catch (e) { /* keep defaults */ }

    var lang = startingLang();
    function T(key) {
      var table = I18N[lang] || I18N.en;
      return table[key] !== undefined ? table[key] : I18N.en[key];
    }

    if (!CFG.endpoint) {
      root.querySelector('[data-zst-log]').textContent = T('loadFail');
      return;
    }

    var log = root.querySelector('[data-zst-log]');
    var form = root.querySelector('[data-zst-form]');
    var input = root.querySelector('[data-zst-input]');
    var send = root.querySelector('[data-zst-send]');
    var chips = root.querySelector('[data-zst-chips]');
    var newBtn = root.querySelector('[data-zst-new]');
    var headerAvatar = root.querySelector('.zst-avatar');
    var attachBtn = root.querySelector('[data-zst-attach]');
    var fileInput = root.querySelector('[data-zst-file]');
    var preview = root.querySelector('[data-zst-preview]');
    var micBtn = root.querySelector('[data-zst-mic]');
    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var speakBtn = root.querySelector('[data-zst-speak]');
    var langBtns = root.querySelectorAll('[data-zst-lang]');
    var fsBtn = root.querySelector('[data-zst-fs]');
    var narrowMq = window.matchMedia ? window.matchMedia('(max-width: 560px)') : null;
    var isFullscreen = false;

    var history = loadHistory();
    var busy = false;
    var pendingImage = null;
    var listening = false;

    function welcomeText() {
      if (lang === 'es') return CFG.welcomeEs || T('welcomeFallback');
      return CFG.welcome || T('welcomeFallback');
    }

    function avatarHtml() {
      if (CFG.avatar) {
        return '<img src="' + escapeHtml(CFG.avatar) + '" alt="">';
      }
      return ATOM_SVG;
    }
    headerAvatar.innerHTML = avatarHtml();

    function scrollDown() {
      log.scrollTop = log.scrollHeight;
    }

    function addBubble(role, text, extraClass, imageUrl, hadImage) {
      var row = document.createElement('div');
      row.className = 'zst-row zst-' + role + (extraClass ? ' ' + extraClass : '');
      if (role === 'bot') {
        var av = document.createElement('div');
        av.className = 'zst-mini-avatar';
        av.innerHTML = avatarHtml();
        row.appendChild(av);
      }
      var bubble = document.createElement('div');
      bubble.className = 'zst-bubble';
      if (role === 'bot') {
        bubble.innerHTML = renderText(text);
      } else {
        if (imageUrl) {
          var im = document.createElement('img');
          im.className = 'zst-photo';
          im.src = imageUrl;
          im.alt = T('photoYouShared');
          bubble.appendChild(im);
        } else if (hadImage) {
          var tag = document.createElement('span');
          tag.className = 'zst-photo-tag';
          tag.textContent = T('photoShared');
          bubble.appendChild(tag);
        }
        var t = document.createElement('span');
        t.textContent = text;
        bubble.appendChild(t);
      }
      row.appendChild(bubble);
      log.appendChild(row);
      scrollDown();
      return row;
    }

    function addTyping() {
      var row = document.createElement('div');
      row.className = 'zst-row zst-bot zst-typing';
      row.innerHTML =
        '<div class="zst-mini-avatar">' + avatarHtml() + '</div>' +
        '<div class="zst-bubble" aria-label="' + escapeHtml(T('thinking')) + '"><span></span><span></span><span></span></div>';
      log.appendChild(row);
      scrollDown();
      return row;
    }

    function renderAll() {
      log.innerHTML = '';
      addBubble('bot', welcomeText());
      history.forEach(function (m) {
        addBubble(m.role === 'assistant' ? 'bot' : 'user', m.content, '', null, !!m.img);
      });
      chips.hidden = history.length > 0;
    }

    function renderChips() {
      chips.innerHTML = '';
      T('chips').forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-zst-chip', c[1]);
        b.textContent = c[0];
        chips.appendChild(b);
      });
    }

    function setBusy(b) {
      busy = b;
      send.disabled = b;
      input.disabled = b;
      if (attachBtn) attachBtn.disabled = b;
      if (micBtn) micBtn.disabled = b;
      root.classList.toggle('zst-is-busy', b);
    }

    function autosize() {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 180) + 'px';
    }

    /* ----- Photo attach ----- */

    function clearImage() {
      pendingImage = null;
      preview.hidden = true;
      preview.innerHTML = '';
      if (fileInput) fileInput.value = '';
    }

    function showPreview(img) {
      preview.innerHTML = '';
      var thumb = document.createElement('img');
      thumb.src = img.dataUrl;
      thumb.alt = T('photoReady');
      var label = document.createElement('span');
      label.textContent = T('photoAttached');
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'zst-preview-remove';
      rm.setAttribute('aria-label', T('removePhoto'));
      rm.textContent = '×';
      rm.addEventListener('click', clearImage);
      preview.appendChild(thumb);
      preview.appendChild(label);
      preview.appendChild(rm);
      preview.hidden = false;
    }

    if (CFG.images && attachBtn && fileInput) {
      attachBtn.innerHTML = ICONS.camera;
      attachBtn.hidden = false;
      attachBtn.addEventListener('click', function () {
        if (!busy) fileInput.click();
      });
      fileInput.addEventListener('change', function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        shrinkImage(file, T).then(function (img) {
          pendingImage = img;
          showPreview(img);
          input.focus();
        }).catch(function (err) {
          clearImage();
          addBubble('bot', err.message, 'zst-error');
        });
      });
    }

    /* ----- Read aloud ----- */

    var synth = window.speechSynthesis;
    var canSpeak = !!(CFG.voice && synth && window.SpeechSynthesisUtterance);
    var speakOn = canSpeak && storeGet(SPEAK_KEY) === '1';
    var voiceBar = root.querySelector('[data-zst-voicebar]');
    var voiceSelect = root.querySelector('[data-zst-voice]');
    var rankedVoices = [];

    function voiceKey() { return 'zst_voice_' + lang + '_v1'; }

    // Novelty and low-quality voices that sound robotic.
    var POOR = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|organ|ralph|superstar|trinoids|whisper|wobble|zarvox|grandma|grandpa|espeak|robot)\b/i;

    function voiceScore(v) {
      var n = v.name || '';
      var l = v.lang || '';
      var score = 0;
      if (lang === 'es') {
        if (/^es[-_](US|MX|419)/i.test(l)) score += 4;
        else if (/^es[-_](CO|AR|CL|PE|VE)/i.test(l)) score += 3;
        else if (/^es/i.test(l)) score += 1;
      } else {
        if (/^en[-_]US/i.test(l)) score += 4;
        else if (/^en[-_](GB|CA|AU|IE|NZ)/i.test(l)) score += 3;
        else if (/^en/i.test(l)) score += 1;
      }
      if (/natural|neural/i.test(n)) score += 30;
      if (/premium/i.test(n)) score += 25;
      if (/enhanced|siri/i.test(n)) score += 20;
      if (/google/i.test(n)) score += 12;
      if (/\b(ava|samantha|allison|evan|nathan|zoe|tom|susan|aria|jenny|guy|emma|andrew|brian|ana|libby|sonia|ryan|paulina|dalia|jorge|elvira|alvaro|paloma|monica|juan)\b/i.test(n)) score += 6;
      if (/microsoft (david|zira|mark|sabina|raul|helena|pablo)\b/i.test(n) && !/natural/i.test(n)) score -= 4;
      if (POOR.test(n)) score -= 100;
      if (v.default) score += 1;
      return score;
    }

    function friendlyName(v) {
      return (v.name || 'Voice')
        .replace(/^Microsoft\s+/i, '')
        .replace(/\s*Online\s*/i, ' ')
        .replace(/\s*-\s*(English|Spanish|Español).*$/i, '')
        .replace(/\s*\((Natural)\)\s*/i, ' (natural)')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function loadVoices() {
      var prefix = lang === 'es' ? /^es/i : /^en/i;
      var all = (synth.getVoices() || []).filter(function (v) { return prefix.test(v.lang); });
      rankedVoices = all
        .map(function (v) { return { v: v, s: voiceScore(v) }; })
        .filter(function (x) { return x.s > -50; })
        .sort(function (a, b) { return b.s - a.s; })
        .map(function (x) { return x.v; });
      if (!voiceSelect) return;
      var saved = localGet(voiceKey());
      voiceSelect.innerHTML = '';
      rankedVoices.slice(0, 15).forEach(function (v, i) {
        var opt = document.createElement('option');
        opt.value = v.name;
        opt.textContent = friendlyName(v) + (i === 0 ? T('bestVoice') : '');
        if (saved ? v.name === saved : i === 0) opt.selected = true;
        voiceSelect.appendChild(opt);
      });
      if (voiceBar) voiceBar.hidden = !speakOn || rankedVoices.length < 2;
    }

    function chosenVoice() {
      var name = voiceSelect && voiceSelect.value;
      for (var i = 0; i < rankedVoices.length; i++) {
        if (rankedVoices[i].name === name) return rankedVoices[i];
      }
      return rankedVoices[0] || null;
    }

    function stopSpeaking() {
      if (canSpeak) synth.cancel();
    }

    function speakNow(text) {
      stopSpeaking();
      var spoken = toSpeech(text, lang);
      // Sentence-sized chunks avoid a Chrome bug that cuts off long speech.
      var chunks = spoken.match(/[^.!?\n]+[.!?]*|\n+/g) || [spoken];
      var voice = chosenVoice();
      chunks.forEach(function (c) {
        c = c.trim();
        if (!c) return;
        var u = new window.SpeechSynthesisUtterance(c);
        if (voice) {
          u.voice = voice;
          u.lang = voice.lang;
        } else {
          u.lang = T('micLang');
        }
        // Natural voices sound best at normal speed; older voices a touch slower.
        u.rate = voice && /natural|neural|premium|enhanced/i.test(voice.name) ? 1 : 0.95;
        u.pitch = 1;
        synth.speak(u);
      });
    }

    function speak(text) {
      if (!canSpeak || !speakOn || !text) return;
      if (rankedVoices.length) {
        speakNow(text);
        return;
      }
      // Voices load late in some browsers. Wait briefly so the first reply
      // doesn't fall back to the default robotic voice.
      var done = false;
      function go() {
        if (done) return;
        done = true;
        loadVoices();
        speakNow(text);
      }
      if (synth.addEventListener) synth.addEventListener('voiceschanged', go, { once: true });
      setTimeout(go, 1200);
    }

    function updateSpeakBtn() {
      if (!speakBtn) return;
      speakBtn.innerHTML = speakOn ? ICONS.speakerOn : ICONS.speakerOff;
      speakBtn.setAttribute('aria-pressed', speakOn ? 'true' : 'false');
      var label = speakOn ? T('speakOn') : T('speakOff');
      speakBtn.title = label;
      speakBtn.setAttribute('aria-label', label);
      speakBtn.classList.toggle('zst-on', speakOn);
      if (voiceBar) voiceBar.hidden = !speakOn || rankedVoices.length < 2;
    }

    if (canSpeak && speakBtn) {
      speakBtn.hidden = false;
      loadVoices();
      if (synth.addEventListener) {
        synth.addEventListener('voiceschanged', loadVoices);
      }
      updateSpeakBtn();

      speakBtn.addEventListener('click', function () {
        speakOn = !speakOn;
        storeSet(SPEAK_KEY, speakOn ? '1' : '0');
        updateSpeakBtn();
        if (!speakOn) {
          stopSpeaking();
        } else {
          var lastReply = null;
          for (var i = history.length - 1; i >= 0; i--) {
            if (history[i].role === 'assistant') { lastReply = history[i].content; break; }
          }
          speak(lastReply || welcomeText());
        }
      });

      if (voiceSelect) {
        voiceSelect.addEventListener('change', function () {
          localSet(voiceKey(), voiceSelect.value);
          speakNow(T('voiceSample'));
        });
      }
    }

    /* ----- Microphone (voice typing) ----- */

    // Uses the browser's own speech recognition. The text goes into the box so
    // the student can edit it. It is never sent automatically, and nothing is stored.
    var recognizer = null;
    var baseText = '';
    var finalText = '';
    var micStatus = root.querySelector('[data-zst-micstatus]');
    var micStatusTimer = null;

    function showMicStatus(msg, autoHide) {
      if (!micStatus) return;
      clearTimeout(micStatusTimer);
      micStatus.textContent = msg || '';
      micStatus.hidden = !msg;
      if (msg && autoHide) {
        micStatusTimer = setTimeout(function () {
          micStatus.textContent = '';
          micStatus.hidden = true;
        }, 6000);
      }
    }

    function setListening(on) {
      listening = on;
      if (!micBtn) return;
      micBtn.classList.toggle('zst-listening', on);
      micBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      // The label stays the same while listening. aria-pressed carries the state.
      micBtn.title = T('mic');
      micBtn.setAttribute('aria-label', T('mic'));
      input.placeholder = on ? T('listeningPlaceholder') : idlePlaceholder();
      if (on) showMicStatus(T('micListening'), false);
      else if (micStatus && micStatus.textContent === T('micListening')) showMicStatus('', false);
    }

    if (CFG.voice && Recognition && micBtn) {
      micBtn.innerHTML = ICONS.mic;
      micBtn.hidden = false;

      micBtn.addEventListener('click', function () {
        if (busy) return;
        if (listening && recognizer) {
          recognizer.stop();
          return;
        }
        stopSpeaking();
        var rec;
        try {
          rec = new Recognition();
        } catch (err) {
          micBtn.hidden = true;
          return;
        }
        recognizer = rec;
        rec.lang = T('recLang');
        rec.interimResults = true;
        rec.continuous = false;
        rec.maxAlternatives = 1;
        baseText = input.value ? input.value.replace(/\s+$/, '') + ' ' : '';
        finalText = '';
        var failed = false;

        rec.onresult = function (e) {
          var interim = '';
          for (var i = e.resultIndex; i < e.results.length; i++) {
            var r = e.results[i];
            if (r.isFinal) finalText += r[0].transcript;
            else interim += r[0].transcript;
          }
          input.value = (baseText + finalText + interim).slice(0, CFG.maxChars || 1500);
          autosize();
        };
        rec.onerror = function (e) {
          failed = true;
          setListening(false);
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            showMicStatus(T('micDenied'), true);
          } else if (e.error === 'no-speech') {
            showMicStatus(T('micNoSpeech'), true);
          } else if (e.error === 'network') {
            showMicStatus(T('micNetwork'), true);
          } else if (e.error !== 'aborted') {
            showMicStatus(T('micUnclear'), true);
          }
        };
        rec.onend = function () {
          if (recognizer === rec) recognizer = null;
          if (listening) setListening(false);
          // Leave the text in the box for the student to edit. Do not send.
          if (!failed && finalText.trim().length > 0) {
            input.value = input.value.replace(/\s+$/, '');
            input.focus();
          }
        };

        try {
          rec.start();
          setListening(true);
        } catch (err) {
          recognizer = null;
          setListening(false);
        }
      });
    }

    /* ----- Full screen ----- */

    function idlePlaceholder() {
      return narrowMq && narrowMq.matches ? T('placeholderShort') : T('placeholder');
    }
    if (narrowMq) {
      var onNarrow = function () {
        if (!listening) input.placeholder = idlePlaceholder();
      };
      if (narrowMq.addEventListener) narrowMq.addEventListener('change', onNarrow);
      else if (narrowMq.addListener) narrowMq.addListener(onNarrow);
    }

    function updateFsBtn() {
      if (!fsBtn) return;
      fsBtn.innerHTML = isFullscreen ? ICONS.collapse : ICONS.expand;
      var label = isFullscreen ? T('exitFullscreen') : T('fullscreen');
      fsBtn.title = label;
      fsBtn.setAttribute('aria-label', label);
      fsBtn.setAttribute('aria-pressed', isFullscreen ? 'true' : 'false');
    }

    var pushedState = false;

    function setFullscreen(on, fromHistory) {
      if (on === isFullscreen) return;
      isFullscreen = on;
      root.classList.toggle('zst-fullscreen', on);
      document.documentElement.classList.toggle('zst-noscroll', on);
      updateFsBtn();
      if (on) {
        // Let the phone's back button close full screen instead of leaving the page.
        try {
          window.history.pushState({ zstFullscreen: true }, '');
          pushedState = true;
        } catch (e) { pushedState = false; }
      } else if (pushedState && !fromHistory) {
        pushedState = false;
        try { window.history.back(); } catch (e) { /* ignore */ }
      } else {
        pushedState = false;
      }
      scrollDown();
      if (!narrowMq || !narrowMq.matches) input.focus();
    }

    if (fsBtn) {
      fsBtn.addEventListener('click', function () { setFullscreen(!isFullscreen); });
      window.addEventListener('popstate', function () {
        if (isFullscreen) setFullscreen(false, true);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isFullscreen) setFullscreen(false);
      });
    }

    /* ----- Language ----- */

    function applyLanguage() {
      root.setAttribute('lang', lang);
      root.querySelectorAll('[data-zst-i18n]').forEach(function (el) {
        el.textContent = T(el.getAttribute('data-zst-i18n'));
      });
      var note = root.querySelector('[data-zst-note]');
      if (note) note.textContent = T('note') + (CFG.voice && Recognition ? T('noteVoice') : '');
      input.placeholder = listening ? T('listeningPlaceholder') : idlePlaceholder();
      if (newBtn) {
        newBtn.title = T('newChat');
        newBtn.setAttribute('aria-label', T('newChat'));
      }
      send.setAttribute('aria-label', T('send'));
      updateFsBtn();
      if (attachBtn) {
        attachBtn.title = T('attach');
        attachBtn.setAttribute('aria-label', T('attach'));
      }
      setListening(listening);
      updateSpeakBtn();
      langBtns.forEach(function (b) {
        var on = b.getAttribute('data-zst-lang') === lang;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.classList.toggle('zst-on', on);
      });
      var group = root.querySelector('[data-zst-langgroup]');
      if (group) group.setAttribute('aria-label', T('language'));
      renderChips();
    }

    function setLanguage(next) {
      if (next === lang || !I18N[next]) return;
      if (listening && recognizer) recognizer.stop();
      stopSpeaking();
      lang = next;
      localSet(LANG_KEY, lang);
      applyLanguage();
      if (canSpeak) loadVoices();
      renderAll();
    }

    langBtns.forEach(function (b) {
      b.addEventListener('click', function () { setLanguage(b.getAttribute('data-zst-lang')); });
    });

    /* ----- Sending ----- */

    function ask(text) {
      text = (text || '').trim();
      if (busy) return;
      var usedDefault = false;
      if (!text && pendingImage) {
        text = T('photoDefault');
        usedDefault = true;
      }
      if (!text) return;
      if (CFG.maxChars && text.length > CFG.maxChars) {
        addBubble('bot', T('tooLong').replace('{n}', CFG.maxChars), 'zst-error');
        return;
      }

      stopSpeaking();
      chips.hidden = true;
      var image = pendingImage;
      var entry = { role: 'user', content: text };
      if (image) entry.img = 1;
      history.push(entry);
      saveHistory(history);
      addBubble('user', text, '', image ? image.dataUrl : null);
      input.value = '';
      autosize();
      clearImage();
      setBusy(true);
      var typing = addTyping();

      var limit = CFG.historyLimit || 12;
      var outgoing = history.slice(-limit).map(function (m, idx, arr) {
        var c = m.content;
        // Earlier photos are not re-sent, so leave a note in their place.
        if (m.img && idx < arr.length - 1) c = c + '\n\n' + T('earlierPhoto');
        return { role: m.role, content: c };
      });
      var payload = { messages: outgoing, lang: lang };
      if (image) payload.image = { media_type: image.mediaType, data: image.data };

      fetch(CFG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (r) {
          typing.remove();
          if (r.ok && r.data && r.data.reply) {
            history.push({ role: 'assistant', content: r.data.reply });
            saveHistory(history);
            addBubble('bot', r.data.reply);
            speak(r.data.reply);
          } else {
            // Take the unanswered question back out so the student can retry.
            history.pop();
            saveHistory(history);
            addBubble('bot', (r.data && r.data.error) || T('genericError'), 'zst-error');
            if (!(r.data && r.data.limited)) {
              input.value = usedDefault ? '' : text;
              autosize();
              if (image && !(r.data && r.data.imageLimited)) {
                pendingImage = image;
                showPreview(image);
              }
            }
          }
        })
        .catch(function () {
          typing.remove();
          history.pop();
          saveHistory(history);
          addBubble('bot', T('noConnect'), 'zst-error');
          input.value = usedDefault ? '' : text;
          autosize();
          if (image) {
            pendingImage = image;
            showPreview(image);
          }
        })
        .then(function () {
          setBusy(false);
          input.focus();
        });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (listening && recognizer) recognizer.abort();
      ask(input.value);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        ask(input.value);
      }
    });
    input.addEventListener('input', autosize);

    // Pasting a screenshot straight into the box also attaches it.
    input.addEventListener('paste', function (e) {
      if (!CFG.images || !e.clipboardData) return;
      var items = e.clipboardData.items || [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && /^image\//.test(items[i].type)) {
          var f = items[i].getAsFile();
          if (f) {
            e.preventDefault();
            shrinkImage(f, T).then(function (img) {
              pendingImage = img;
              showPreview(img);
            }).catch(function () { /* ignore */ });
          }
          break;
        }
      }
    });

    chips.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-zst-chip]');
      if (btn) ask(btn.getAttribute('data-zst-chip'));
    });

    newBtn.addEventListener('click', function () {
      if (busy) return;
      stopSpeaking();
      history = [];
      storeDel(STORE_KEY);
      clearImage();
      renderAll();
      input.focus();
    });

    applyLanguage();
    renderAll();
  }

  function boot() {
    var roots = document.querySelectorAll('[data-zst-chat]');
    Array.prototype.forEach.call(roots, initChat);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Exposed for testing only.
  window.ZST_renderText = renderText;
  window.ZST_toSpeech = toSpeech;
})();
