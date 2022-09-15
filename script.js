'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2020-11-18T21:31:17.178Z',
    '2021-12-23T07:42:02.383Z',
    '2021-01-28T09:15:04.904Z',
    '2021-04-01T10:17:24.185Z',
    '2022-05-08T14:11:59.604Z',
    '2022-09-12T17:01:17.194Z',
    '2022-09-13T23:36:17.929Z',
    '2022-09-14T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2021-11-01T13:15:33.035Z',
    '2020-11-30T09:48:16.867Z',
    '2020-12-25T06:04:23.907Z',
    '2021-01-25T14:18:46.235Z',
    '2022-09-05T16:33:06.386Z',
    '2022-04-10T14:43:26.374Z',
    '2022-06-25T18:49:59.371Z',
    '2022-08-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calDaysPassed = (date2, date1) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    // Internalizing Number movement
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCur(
    acc.balance,
    acc.locale,
    acc.currency
  )}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCur(incomes, acc.locale, acc.currency)}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  )}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatCur(
    interest,
    acc.locale,
    acc.currency
  )}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

// fake login to always sta logged in for now
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Setting dates
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Experimenting API in internationalizing Dates
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric', // not perfect declaring it manally
    };
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add Transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Add loan date
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.acc, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// Checking Numbers
// use to bring out a number from a (string value)
// console.log(Number.parseInt('20px'))

// // use to bring out a decimal number fron a (string value)
// console.log(Number.parseFloat('2.5rem'));
// console.log(Number.parseInt('20.5px')) //this will read 20 alone.

// // we also we a method to check if a value is a number
// console.log(Number.isFinite('20px'));
// console.log(Number.isFinite(20));

// Rounding of Numbers
// to find square root of a number
// console.log(Math.sqrt(25));
// console.log(25 ** (1/2));

// To find cube root
// console.log(8 ** (1/3));

// we can also look for min and max
// console.log(Math.max(2,23,51,15))
// console.log(Math.max(2,23,'51',15)) // did type coersion here

// so we also do random num
// console.log(Math.trunc(Math.random() * 6) + 1);

// const randomInt = function (min, max) {
//   Math.trunc(Math.random() * (max - min) + 1) + min;
// };
// console.log(randomInt(5,10));

// const meeeen = (min, max) =>
//   Math.trunc(Math.random() * (max -min) + 1) + min;

// console.log(meeeen(10, 20));

// Rounding Integers
Math.trunc;
Math.floor;
Math.ceil;
Math.round;
// console.log(Math.round(2.9));
// console.log(Math.round(2.3))

/*
// T0 check a number reminder using %
console.log(11 % 2);
console.log(14 % 4);

// To check if a number is Even or Odd
const isEven = n => n % 2 === 0;   // Using the Arrow num to a function for it.
console.log(isEven(34));
console.log(isEven(27));

// Bigint :
console.log(2**53 - 1)
console.log(Number.MAX_SAFE_INTEGER) //Highest value javascript can deal with

console.log(3456789045678909876543)
console.log(3456789045678909876543n)
console.log(BigInt(345678904))

// console.log(21 + 43n)
console.log(21n + 43n)
*/

/*
// Creating a date
// They are 4 ways of creating num in JS
const now = new Date();
console.log(now)

// Passing in the date 
console.log(new Date(`Aug 16 2022 14:40:50`));
console.log(new Date('March 26, 2005'));
console.log(new Date(account1.movementsDates[3]));

// passing in thier number
console.log(new Date(2019, 8, 18, 20, 50, 30))
console.log(new Date(2019, 9, 29));

// Using Multiply
console.log(new Date(0)) // The first date ever
console.log(new Date (3 * 24 * 60 * 60 * 1000)) //Third day
console.log(3 * 24 * 60 * 60 * 1000) //TimeStamp
*/

/*
// working with date
const future = new Date(2019, 8, 18, 20, 50);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getTime()); //timestamp that hae passed since 1970
console.log(future.toISOString()); // Following internation zone base on the region of the person   // Or to turn it into a string that we can store somwwhere

console.log(new Date(1568836200000));
future.setFullYear(2030);
console.log(future);
*/

// To get timeStamp of a date
// const future = new Date(2037, 10, 19, 15, 23);
// console.log(+future); // this will give us the timestamp

// // Calculating diff btw dates
// const calDaysPassed = (date2, date1) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24); // will always give us answer in milli seconds so we have to do divide this CALC (1000 * 60 * 60 * 24) to have either the day months etc.

// const daysPassed = calDaysPassed(new Date(2019, 8, 18), new Date(2019, 8, 10));
// console.log(daysPassed);

// Using Timers: we have 2 type of timer 
// 1) setTimeout : will run just once after a defined time
// 2) setInterval: Runs forever until we stop it

const ingredients = ['olives', 'spinach']
const pizzaTimer = setTimeout((ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`), 3000 ,...ingredients)

// Can also clkear the timer 
if (ingredients.includes('olives')) clearTimeout(pizzaTimer)