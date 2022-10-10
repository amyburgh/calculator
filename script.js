// Reverse Polish notation & Shunting yard algorithm
const TEST = '√ 15 ^ 3';
const DECIMALS = 6;

// Default values fix single inputs
const options = {
    '+': (a = 0, b = 0) => a + b,
    '-': (a = 0, b = 0) => a - b,
    '×': (a = 1, b = 1) => a * b,
    '÷': (a = 1, b = 1) => a / b,
    '^': (a, b = 1) => a ** b,
    '√': (a) => a ** (1 / 2),
    '%': (a) => a / 100
};

const precedence = {
    '+': 1,
    '-': 1,
    '×': 2,
    '÷': 2,
    '^': 3,
    '√': 3, // Test this!
    '%': 4
};

const toNumberArray = function (string) {
    return string.trim().split(' ').map(token =>
        parseFloat(token) == token ? parseFloat(token) : token
    ).filter(item => item !== '');
}

// Shunting yard algorithm
const ShuntingYard = function (array) {
    let stack = [];
    let queue = [];

    console.log('array: ', array);

    for (let token of array) {
        if (token in options && token !== '%') {
            while (precedence[token] <= precedence[stack.at(-1)] && precedence[token] < 3) {
                queue.push(stack.pop());
            }
            stack.push(token);
        }
        else if (token === '(') {
            stack.push(token);
        }
        else if (token === ')') {
            while (stack.at(-1) !== '(' && stack.length) {
                queue.push(stack.at(-1));
                stack.pop();
            }
            stack.pop();
        }
        else {
            queue.push(token);
        }
    }
    return [...queue, ...stack.reverse()];
}

// reverse polish notation
const rpn = function (array) {
    let stack = [];

    for (let token of array) {
        if (token in options) {
            if (token === '%' || token === '√')
                stack.push(options[token](stack.pop()));
            else
                stack.push(options[token](...stack.splice(-2)));
        }
        else
            stack.push(token);
    }
    return Number(stack.pop().toFixed(DECIMALS));
}

// const answer = rpn(ShuntingYard(toNumberArray(TEST)));
// console.log('answer: ', answer);

// Color mode selector
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

// CALCS STUFF
const inputArr = [];
let userInput = '';

const tokens = document.querySelectorAll('.key');
const outputEq = document.querySelector('.output .equation');
const outputRt = document.querySelector('.output .result');
const historyEq = Array.from(document.querySelectorAll('.history-item .equation'));
const historyRt = Array.from(document.querySelectorAll('.history-item .result'));

const getTokenMouse = (e) => setToken(e.target.dataset.token);
const getTokenKeyboard = (e) => {
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

tokens.forEach(token => token.addEventListener('click', getTokenMouse));
document.addEventListener('keydown', getTokenKeyboard);
tokens.forEach(key => key.addEventListener('transitionend', removeTransition));

const calculate = (string) => rpn(ShuntingYard(toNumberArray(string)));

function setArr(array, a, b) {
    const obj = {
        equation: `${a}`,
        result: `${b}`
    }
    array.unshift(obj);
    if (array.length > 4)
        array.pop();
    // console.table(array);
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

function findToken(string) {
    const array = string.split(' ');
    if (string.length === 1) return true;

    for (let token in precedence) {
        if (array.includes(token))
            return true;
    }
    return false;
}

let keepResult = false;

function setToken(token) {
    if (token === '=') {
        console.log(findToken(userInput));
        if (findToken(userInput)) {
            setArr(inputArr, userInput, calculate(userInput));
            setDisplay(inputArr);
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
        outputRt.textContent = '0';
        userInput = '';
    }
    else if (token === '~') {
        userInput = '- ( ' + userInput + ' ) ';
        outputRt.textContent = userInput;
    }
    else {
        if (keepResult === true && parseFloat(token)) {
            userInput = '';
        }
        userInput += token;
        outputRt.textContent = userInput;
        keepResult = false;
    }
}