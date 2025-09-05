let letters = document.querySelectorAll(".box");
let text = document.querySelector(".heading")

let loadingDiv = document.querySelector(".info-bar");
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
  let currentGuess = "";
  let currentRow = 0;
  let isLoading = true

  let res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
  let resObj = await res.json();
  let word = resObj.word.toUpperCase();
  let wordParts = word.split("");
  let done = false
  setLoading(false);
  isLoading = false;

  console.log(word);

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
      // add letter to the end
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
      // replace the last lettter
    }

    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText =
      letter;
  }

  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      // rest
      return;
    }

 

    // validate

    isLoading = true;
    setLoading(true)
    const res = await fetch("https://words.dev-apis.com/validate-word" , {
        method: "POST",
        body: JSON.stringify({word: currentGuess})
    }) 
    const resObj = await res.json();
    const validWord = resObj.validWord;

    isLoading = false;
    setLoading(false);

    if (!validWord) {
        markValidWord();
        return;
    }


    // mark

    let guessParts = currentGuess.split("");
    const map = makeMap(wordParts);
    console.log(map);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      // correct
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }

    // incorrect and close

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // already stated
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
        map[guessParts[i]]--;
      } else {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
      }
    }

    currentRow++;
    
    if (currentGuess === word) {
       
       
        text.innerText = "CONGRATULATIONS😁🙌! YOU WON"
        text.classList.add("winner")
        done = true;
        return;
    }else if (currentRow === ROUNDS) {
        text.innerText = "HOW SAD😞💔! THE WORD WAS " + `${word}`
       
        text.classList.add("winner")
        done = true;
    }

    currentGuess = "";

   
  }




  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
  }


  function markValidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
        
        letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

        setTimeout(function () {
            letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");

        }, 10)
    }
    
  }
  document.addEventListener("keydown", function handleKeyPress(event) {
if (done || isLoading) {
    return;
}


    let action = event.key;

    if (action === "Enter") {
      commit();
    } else if (action === "Backspace") {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } else {
      // do nothing
    }
  });
}



document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', (e) => {
        const keyValue = e.target.getAttribute('data-key');
        // Create and dispatch a keyboard event
        const keyboardEvent = new KeyboardEvent('keydown', {
            key: keyValue,
            code: `Key${keyValue}`,
            keyCode: keyValue.length === 1 ? keyValue.charCodeAt(0) : (keyValue === 'Enter' ? 13 : 8),
            which: keyValue.length === 1 ? keyValue.charCodeAt(0) : (keyValue === 'Enter' ? 13 : 8),
            bubbles: true
        });
        document.dispatchEvent(keyboardEvent);
    });
});

function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function makeMap(array) {
  const obj = {};

  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}
init();
