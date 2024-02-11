'use strict';
const myNote = document.getElementById('notes');
const password = document.getElementById('pwd-area');
const pSpan = document.getElementById('pwordSpan');
const pwd = document.getElementById('pwd-input');
const ind = document.getElementById('indicator');

pwd.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    load();
  }
});

// Set up some things.
myNote.value = '';
let short_words;
fetch('./short_words.json')
  .then((response) => {
    return response.json();
  })
  .then((jsondata) => {
    short_words = jsondata.short_words;
    console.log(`${short_words.length} words available.`);
  });

function copyPwd() {
  let temp = password.select();
  navigator.clipboard.writeText(password.value);
}

function togglePwd() {
  if (pwd.classList.contains('d-none')){
    pwd.classList.remove('d-none');
  } else {
    pwd.classList.add('d-none');
  }
}

function pword() {
  if (pSpan.classList.contains('d-none')) {
    pSpan.classList.remove('d-none');
    pSpan.classList.add('d-inline');
    password.value = genPassword();
  } else {
    pSpan.classList.remove('d-inline');
    pSpan.classList.add('d-none');
    password.value = '';
  }
}

function sync() {
  fetch('/sync', {
    method: 'POST',
    body: JSON.stringify({
      pwd: pwd.value,
      text: myNote.value,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => {
      if (!response.ok) {
        ind.style.backgroundColor = 'Orange';
        throw 'Incorrect password';
      } else {
        ind.style.backgroundColor = 'Green';
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function load() {
  fetch(`/load/?id=${pwd.value}`)
    .then((response) => {
      if (!response.ok) {
        ind.style.backgroundColor = 'Orange';
        throw 'Incorrect password';
      } else {
        ind.style.backgroundColor = 'Green';
      }
      return response.json();
    })
    .then((data) => {
      myNote.value = data.text;
    })
    .catch((error) => {
      console.log(error);
    });
}

function randomElem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
}

function genPassword() {
  let elems = [];
  while (elems.length < 3) {
    let w = randomElem(short_words);
    if (!elems.includes(w)) {
      elems.push(w);
    }
  }
  let i = Math.floor(Math.random() * elems.length);
  elems[i] = elems[i].toUpperCase();
  let special = [
    '!',
    '"',
    '^',
    '*',
    '(',
    ')',
    '-',
    '_',
    '£',
    '$',
    '%',
    '+',
    '=',
    '[',
    ']',
    '{',
    '}',
    ',',
    '.',
    '#',
    '?',
    '/',
    '<',
    '>',
  ];
  elems.push(randomElem(special));
  elems.push(Math.floor(Math.random() * 10).toString());
  shuffle(elems);
  return elems.join('');
}

function saveNote() {
  let link = document.createElement('a');
  let msg = myNote.value;
  let myDate = new Date().toLocaleDateString();
  let dateStr = myDate.replace('/', '_');
  let i = msg.indexOf('\n');
  let fname = 'untitled';
  if (i !== -1) {
    fname = msg.slice(0, i);
    msg = `${fname} ${myDate}\n${msg.slice(i + 1)}`;
  }
  fname = `${fname}_${dateStr}`;
  link.setAttribute(
    'href',
    'data:text/plain;charset=utf-8,' + encodeURIComponent(msg)
  );
  link.download = fname + '.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function clearNote() {
  myNote.value = '';
  ind.style.backgroundColor = '#333';
}
