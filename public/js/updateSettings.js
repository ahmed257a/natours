// updateData
// import axios from 'axios';
import { showAlert } from './alert.js';

// type is either "password" or "data"
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/update-my-password'
        : '/api/v1/users/update-me';

    const res = await axios.patch(url, data, {
      withCredentials: true,
    });

    if (res.data.status === 'success')
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    else showAlert('error', 'Something went wrong');
  } catch (err) {
    console.log(err.response.data);
    showAlert('error', err.response.data.message);
  }
};
