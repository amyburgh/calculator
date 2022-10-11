const DECIMALS = 6;

function toggle_mode() {
    const toggle = {
        light: 'dark',
        dark: 'light',
    };
    const body = document.querySelector('body');
    const token = localStorage.getItem('colorMode');

    localStorage.colorMode = toggle[token];
    body.classList.replace(`${token}-mode`, `${toggle[token]}-mode`);
}

const getTokenFromMouse = (e) => setToken(e.target.dataset.token);
const getTokenFromKeyboard = (e) => {
    let key;
    if (e.shiftKey === true)
        key = document.querySelector(`.key[data-key="shift ${e.keyCode}"]`);
    else
        key = document.querySelector(`.key[data-key="${e.keyCode}"]`);
    if (!key) return;
    setToken(key.dataset.token);
    key.classList.add('key-press');
};

function removeTransition(e) {
    if (e.propertyName !== 'transform') return;
    this.classList.remove('key-press');
}

const tokens = document.querySelectorAll('.key');
const outputEq = document.querySelector('.output .equation');
const outputRt = document.querySelector('.output .result');
const historyEq = Array.from(document.querySelectorAll('.history-item .equation'));
const historyRt = Array.from(document.querySelectorAll('.history-item .result'));

tokens.forEach(token => token.addEventListener('click', getTokenFromMouse));
document.addEventListener('keydown', getTokenFromKeyboard);
tokens.forEach(key => key.addEventListener('transitionend', removeTransition));

/**
 * Calculator Functionality
 */

const options = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '×': (a, b) => a * b,
    '÷': (a, b) => a / b,
    '^': (a, b) => a ** b,
    '√': (a) => a ** (1 / 2),
    '%': (a = 0) => a / 100
};

const precedence = {
    '+': 1,
    '-': 1,
    '×': 2,
    '÷': 2,
    '^': 3,
    '√': 3,
    '%': 4,
    '(': 5,
    ')': 5
};

const toArray = function (string) {
    return string.split(' ').map(token =>
        parseFloat(token) == token ? parseFloat(token) : token
    ).filter(item => item !== '');
}

/* Shunting yard algorithm - produces the postfix notation, Reverse Polish notation (RPN) */
const shuntingYard = function (array) {
    let stack = [];
    let queue = [];

    for (let token of array) {
        if (token in options && token !== '%') {
            while (precedence[token] <= precedence[stack.at(-1)] && precedence[token] < 3) {
                queue.push(stack.pop());
            }
            stack.push(token);
        }
        else if (token === '(')
            stack.push(token);
        else if (token === ')') {
            while (stack.at(-1) !== '(' && stack.length) {
                queue.push(stack.at(-1));
                stack.pop();
            }
            stack.pop();
        }
        else
            queue.push(token);
    }
    return [...queue, ...stack.reverse()];
}

/* Reverse Polish notation (RPN) - notation in which operators follow their operands e.g [3,4,+] = 7 */
const rpn = function (array) {
    /* if (parseFloat(array[0]) === NaN) return 'Error'; Guard against bad input */
    let stack = [];
    console.log(array);
    for (let token of array) {
        if (token in options) {
            if ((token === '%' || token === '√') && stack.length)
                stack.push(options[token](stack.pop()));
            else if (stack.length >= 2) {
                console.log(`%c${stack.at(-1)} ${token} ${stack.at(-2)}`, "color: yellow");
                stack.push(options[token](...stack.splice(-2)));
            }
        }
        else
            stack.push(token);
    }
    return Number(stack.pop().toFixed(DECIMALS));
}

function calculate(string) {
    const array = toArray(string);
    const syArray = shuntingYard(array);
    const result = rpn(syArray);
    return isFinite(result) ? result : 'Error';
}

function makeValid(string) {
    let validString = string.at(0) === '%' ? '0' : ''; /* Edge case: (%n -to-> 0% * n) */

    const format = {
        '^': () => ' ^ ',
        '√': (before, after) => parseFloat(before) ? ' × √ ' : ' √ ',
        '%': (before, after) => parseFloat(after) ? ' % × ' : ' % ',
        '(': (before, after) => parseFloat(before) ? ' × ( ' : ' ( ',
        ')': (before, after) => parseFloat(after) ? ' ) × ' : ' ) '
    };

    for (let i = 0; i < string.length; i++) {
        if (string.at(i) in format && i < string.length)
            validString += format[string.at(i)](string.at(i - 1), string.at(i + 1));
        else
            validString += string.at(i);
    }
    return validString;
}

function setDisplay(array) {
    outputEq.textContent = `${array[0].equation} =`;
    outputRt.textContent = array[0].result;
    for (let i = 0; i < 3; i++) {
        if (!array[3 - i]) continue;
        historyEq[i].textContent = `${array[3 - i].equation} =`;
        historyRt[i].textContent = array[3 - i].result;
    }
}

function storeHistory(array, a, b) {
    const obj = {
        equation: `${a}`,
        result: `${b}`
    }
    array.unshift(obj);
    if (array.length > 4)
        array.pop();
}

function findToken(string) {
    for (let token in precedence) {
        if (string.includes(token))
            return true;
    }
    return false;
}

const inputArray = [];
let userInput = '';
let keepResult = false;

function setToken(token) {
    if (token === '=') {
        if (findToken(userInput)) {
            const validString = makeValid(userInput);
            const answer = calculate(validString);

            storeHistory(inputArray, userInput, answer);
            setDisplay(inputArray);
            keepResult = true;
        }
        userInput = outputRt.textContent;
    }
    else if (token === 'b') {
        if (userInput.at(-1) === ' ')
            userInput = userInput.slice(0, -3);
        else
            userInput = userInput.slice(0, -1);
        outputRt.textContent = userInput;
    }
    else if (token === 'c') {
        if (inputArray.length)
            outputEq.textContent = inputArray[0].result;
        outputRt.textContent = '0';
        userInput = '';
    }
    else if (token === '~') {
        const validString = makeValid(userInput);
        const answer = calculate(validString) * -1;

        userInput = answer.toString();
        outputRt.textContent = userInput;
    }
    else {
        if (keepResult === true && parseFloat(token))
            userInput = '';
        userInput += token;
        outputRt.textContent = userInput;
        keepResult = false;
    }
}