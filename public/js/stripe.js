/* eslint-disable */
import { showAlert } from './alert.js';
const stripe = Stripe(
  'pk_test_51RKFwZRnEWKsTCJY5G85sNpZe8ojJs0hQlQGdUxeAUgswJDMfCXTDAx86KsNFHIeSK6i3d3T2e8zY4dSgYM1C2yW00uhJMCkNM'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const res = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: res.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
