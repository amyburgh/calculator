// Reverse Polish notation & Shunting yard algorithm
const TEST = `4 * 2 / 8`;

const options = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '^': (a, b) => a ** b
};

const precedence = {
    '+': 1,
    '-': 1,
    '*': 2,
    '/': 2,
    '^': 3
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
        if (token in options) {
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
        if (token in options)
            stack.push(options[token](...stack.splice(-2)));
        else
            stack.push(token);
    }
    return stack.pop();
}

const answer = rpn(ShuntingYard(toNumberArray(TEST)));
console.log('answer: ', answer);