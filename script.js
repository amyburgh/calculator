// Reverse Polish notation & Shunting yard algorithm
const TEST = '√ 15 ^ 3';
const DECIMALS = 6;

const options = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '^': (a, b) => a ** b,
    '√': (a) => a ** (1 / 2),
    '%': (a) => a / 100
};

const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3,
    '√': 3, // Test this!
    '%': 4
};

const toNumberArray = function (string) {
    return string.split(' ').map(token =>
        parseFloat(token) == token ? parseFloat(token) : token
    );
}

// Shunting yard algorithm
const ShuntingYard = function (array) {
    let stack = [];
    let queue = [];

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

const answer = rpn(ShuntingYard(toNumberArray(TEST)));
console.log('answer: ', answer);

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

function getTokenMouse(e) {
    console.log(e.target);
    // const token = document.querySelector(`.key[data-token]="${e.keyCode}"]`);
}

function getTokenKeyboard(e) {
    console.log(e.shiftKey);
    console.log(e.keyCode);
    let key;
    if (e.shiftKey === true)
        key = document.querySelector(`.key[data-key="+shift ${e.keyCode}"]`);
    else
        key = document.querySelector(`.key[data-key="${e.keyCode}"]`);
    console.log(key);
}

function resetShiftKey(e) {
    if (e.keyCode === 16)
        shift = true;
}

const tokens = document.querySelectorAll('.key');
tokens.forEach(token => token.addEventListener('click', getTokenMouse));
document.addEventListener('keydown', getTokenKeyboard);



// key.classList.add('playing');

// window.addEventListener('keydown', playSound);