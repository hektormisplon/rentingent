// Only import the compile function from handlebars instead of the entire library
import { compile } from 'handlebars';
import update from '../helpers/update';

// Navigo
import Navigo from 'navigo';

// Import the template to use
const authTemplate = require('../templates/auth.hbs');

// Firebase
const { getInstance } = require('../firebase/firebase');
const firebase = getInstance();
const database = firebase.database();

export default () => {
  update(compile(authTemplate)({}));
  // Update DOM and get DOM elements
  const signTypeBtn = document.querySelector('.auth__form__header__indicator');
  const signTypeEl = document.querySelector('.auth__form__header__signtype');
  const signInBtn = document.querySelector('.auth__submit__signin');
  const signUpBtn = document.querySelector('.auth__submit__signup');
  const registerFormEl = document.querySelector('.auth__register');
  const googleAuthBtn = document.querySelector('.auth__provider__google');
  const emailEl = document.querySelector('.auth__input__email');
  const passwordEl = document.querySelector('.auth__input__password');
  const passwordConfirmEl = document.querySelector(
    '.auth__input__password-confirm'
  );
  const formHelperEl = document.querySelector('.auth__form__helper');

  // Navigo router
  const router = new Navigo(window.location.origin, true, '#');

  // Sign type toggle
  signTypeBtn.addEventListener('click', e => {
    if (signTypeEl.textContent === 'up') {
      signTypeEl.textContent = 'in';
      signUpBtn.style.display = 'none';
      signInBtn.style.display = 'block';
      registerFormEl.style.display = 'none';
    } else if (signTypeEl.textContent === 'in') {
      signTypeEl.textContent = 'up';
      signInBtn.style.display = 'none';
      signUpBtn.style.display = 'block';
      registerFormEl.style.display = 'block';
    }
  });

  //===============| GOOGLE AUTH FUNCTIONALITY |============== //
  //Sign In
  signInBtn.addEventListener('click', e => {
    e.preventDefault();
    firebase
      .auth()
      .signInWithEmailAndPassword(emailEl.value, passwordEl.value)
      .then(response => {
        console.log({ 'sign in': response.user });
      })
      .then(() => {
        router.navigate('/home');
      })
      .catch(error => {
        formHelperEl.setAttribute('class', 'auth__form__helper_active');
        formHelperEl.textContent = error.message;
      });
  });

  // Sign Up
  signUpBtn.addEventListener('click', e => {
    e.preventDefault();
    if (passwordEl.value === passwordConfirmEl.value) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(emailEl.value, passwordEl.value)
        .then(response => {
          addUserToDatabase(response.user);
        })
        .then(() => {
          router.navigate('/home');
        })
        // catch errors from auth promise
        .catch(error => {
          formHelperEl.setAttribute('class', 'auth__form__helper_active');
          formHelperEl.textContent = error.message;
        });
    } else {
      formHelperEl.setAttribute('class', 'auth__form__helper_active');
      formHelperEl.textContent = 'Please make sure the passwords match.';
    }
  });

  // Sign In w/ Provider - Google
  googleAuthBtn.addEventListener('click', e => {
    let provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    e.preventDefault();
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(result => {
        console.log(result);
        console.log('successful google account link');
      })
      .catch(error => {
        console.log(error.message);
      });
  });

  function addUserToDatabase(user) {
    const userTypeEl = document.getElementById('switch__user-type');
    const userType = userTypeEl.checked ? 'kotbaas' : 'student';
    const firstName = document.querySelector('.auth__input__first-name').value;
    const lastName = document.querySelector('.auth__input__last-name').value;

    user.updateProfile({ displayName: firstName });
    database.ref('user/' + user.uid).set({
      user_type: userType
    });
  }
};
