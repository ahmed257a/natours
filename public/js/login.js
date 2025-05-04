/* eslint-disable */

// import '@babel/polyfill';
// import axios from 'axios';
import { showAlert } from './alert.js';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get('/api/v1/users/logout');
    showAlert('success', 'Logged Out');
    // if (res.data.status === 'success') location.reload(true);
    if (res.data.status === 'success') location.assign('/');
  } catch (err) {
    console.log(err.response);
    showAlert('error', 'Error logging out! Try again.');
  }
};

// //  -------------   ---------------   -------------  //
// const loginForm = document.querySelector('.form--login');
// const logOutBtn = document.querySelector('.nav__el--logout');

// if (loginForm) {
//   loginForm.addEventListener('submit', (e) => {
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     e.preventDefault();
//     login(email, password);
//   });
// }

// if (logOutBtn) logOutBtn.addEventListener('click', logout);
