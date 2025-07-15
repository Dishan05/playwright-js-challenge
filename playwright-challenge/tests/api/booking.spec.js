const {test, expect} = require('@playwright/test');
const testData = require('../../data/testData_api.json');
const {getAuthorizedApiContext, getUnauthorizedApiContext, createNewBooking, getBookings, getBookingById, updateAllBookingDetails, UpdatePartialBookingDetails, deleteBooking, getBookingByQuery} = require('../../utils/apiHelper.js');

test.describe('Booking API functional tests', () => {
    let apiContextWithAuthentication;
    let apiContextWithoutAuthentication;

    test.beforeAll(async ({}) =>
    {
        apiContextWithAuthentication = await getAuthorizedApiContext();
        apiContextWithoutAuthentication = await getUnauthorizedApiContext();;
    });

    test('Given valid booking data, when POST call is made, then a new booking should be created', async () => {
    const response = await createNewBooking(apiContextWithoutAuthentication, testData.bookingData.newBooking);
      
    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty('bookingid');
    expect(body.booking.firstname).toBe(testData.bookingData.newBooking.firstname);
  });

  for (const [key, query] of Object.entries(testData.queryParameterPermutations)) {
    test(`Given different permutations of query parameters, when GetBooking call is made, then the respective booking details should be returned: ${key}`, async () => {
      const createBookingResponse = await createNewBooking(
        apiContextWithAuthentication,
        testData.bookingData.queryParameters
      );
      const { bookingid } = await createBookingResponse.json();

      const res = await getBookingByQuery(apiContextWithoutAuthentication, query);
      expect(res.status()).toBe(200);

      const json = await res.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json.some(b => b.bookingid === bookingid)).toBe(true);
    });
  }

  test('Given valid booking data, when GET call is made, then all bookings should be returned', async () => {
    const response = await getBookings(apiContextWithoutAuthentication);
    expect(response.status()).toBe(200);
  });

  test('Given a booking ID, when GET call is made, then the respective booking details should be returned', async () => {
    const createBookingResponse = await createNewBooking(apiContextWithoutAuthentication, testData.bookingData.newBooking);
    const { bookingid } = await createBookingResponse.json();

    const response = await getBookingById(apiContextWithoutAuthentication, bookingid);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toStrictEqual(testData.bookingData.newBooking);
  });

  test('Given valid booking data, when PUT call is made, then all booking details should be updated', async () => {
    const createBookingResponse = await createNewBooking(apiContextWithAuthentication, testData.bookingData.newBooking);
    const { bookingid } = await createBookingResponse.json();
    
    const response = await updateAllBookingDetails(apiContextWithAuthentication, bookingid, testData.bookingData.updatedBooking);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toStrictEqual(testData.bookingData.updatedBooking);
  });

  test('Given valid booking data, when PUT call is made unauthenticated, then a 403 should be thrown', async () => {
    const createBookingResponse = await createNewBooking(apiContextWithAuthentication, testData.bookingData.newBooking);
    const { bookingid } = await createBookingResponse.json();

    const response = await updateAllBookingDetails(apiContextWithoutAuthentication, bookingid, testData.bookingData.updatedBooking);

    expect(response.status()).toBe(403);
  });

  test('Given valid booking data, when PATCH call is made, then the booking should be partially updated', async () => {
    const createBookingResponse = await createNewBooking(apiContextWithAuthentication, testData.bookingData.newBooking);
    const { bookingid } = await createBookingResponse.json();

    const response = await UpdatePartialBookingDetails(apiContextWithoutAuthentication, bookingid, testData.bookingData.partialUpdate);

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.additionalneeds).toBe(testData.bookingData.partialUpdate.additionalneeds);
  });

  test('Given valid booking data, when an authenticated DELETE call is made, then the booking should be deleted', async () => {
    const createBookingResponse = await createNewBooking(apiContextWithAuthentication, testData.bookingData.newBooking);
    const { bookingid } = await createBookingResponse.json();

    const response = await deleteBooking(apiContextWithAuthentication, bookingid);
    expect(response.status()).toBe(201);
  });

  test('Given valid booking data, when DELETE call is made unauthenticated, then a 403 should be thrown', async () => {
    const createBookingResponse = await createNewBooking(apiContextWithAuthentication, testData.bookingData.newBooking);
    const { bookingid } = await createBookingResponse.json();

    const response = await deleteBooking(apiContextWithoutAuthentication, bookingid);
    expect(response.status()).toBe(403);
  });

  test('Given deleted booking data, when get booking by id call is made, then the booking should not exist', async () => {
    const createBookingResponse = await createNewBooking(apiContextWithAuthentication, testData.bookingData.newBooking);
    const { bookingid } = await createBookingResponse.json();

    await deleteBooking(apiContextWithAuthentication, bookingid);

    const response = await getBookingById(apiContextWithoutAuthentication, bookingid);
    expect(response.status()).toBe(404);
  });
});

test.describe('Booking API - Invalid Scenarios', () => {
  let apiContextWithoutAuthentication;
  let apiContextWithAuthentication;

  test.beforeAll(async () => {
    apiContextWithoutAuthentication = await getUnauthorizedApiContext();
    apiContextWithAuthentication = await getAuthorizedApiContext();
  });

  for (const [key, invalidBookingData] of Object.entries(testData.invalidBooking)) {
    test(`Given invalid booking data, when Create booking call is made, then a 200 should not be returned: ${key}`, async () => {
      const response = await createNewBooking(apiContextWithoutAuthentication, invalidBookingData);

      expect(response.status()).not.toBe(200);
    });
  }

  for (const [key, invalidBookingData] of Object.entries(testData.invalidBooking)) {
    test(`Given invalid booking data, when Update all details of booking call is made, then a 200 should not be returned: ${key}`, async () => {
      const createResponse = await createNewBooking(apiContextWithoutAuthentication, testData.bookingData.newBooking);
      const { bookingid } = await createResponse.json();

      const response = await updateAllBookingDetails(apiContextWithAuthentication, bookingid, invalidBookingData);

      expect(response.status()).not.toBe(200);
    });
  }

  for (const [key, invalidBookingData] of Object.entries(testData.invalidBooking)) {
    test(`Given invalid booking data, when Update partial details of booking call is made, then a 200 should not be returned: ${key}`, async () => {
      const createResponse = await createNewBooking(apiContextWithoutAuthentication, testData.bookingData.newBooking);
      const { bookingid } = await createResponse.json();

      const response = await UpdatePartialBookingDetails(apiContextWithAuthentication, bookingid, invalidBookingData);

      expect(response.status()).not.toBe(200);
    });
  }

  test('Given invalid booking ID, when GET call is made, then a 200 should not be returned', async () => {
    const bookingid ='aze';

    const response = await getBookingById(apiContextWithoutAuthentication, bookingid);
    expect(response.status()).toBe(404);
  });

  test('Given invalid booking data, when an authenticated DELETE call is made, then a 404 should be returned', async () => {
    const bookingid ='xyz';

    const response = await deleteBooking(apiContextWithAuthentication, bookingid);
    expect(response.status()).toBe(404);
  });
});