const {test, expect, request} = require('@playwright/test');

test.describe('Booking API', () => {
    let apiContext;
    let bookingId;
    let authToken;

    test.beforeAll(async ({playwright}) =>
    {
        apiContext = await request.newContext({
            baseURL: 'https://restful-booker.herokuapp.com',
            contentType: 'application/json'
        });

        const response = await apiContext.post('/auth', {
            data: {
                username: "admin",
                password: "password123"
            }
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        authToken = body.token;
        apiContext.authorization = `Bearer ${authToken}`;
    });

    test('should create a new booking', async () => {
    const res = await apiContext.post('/booking', {
      data: {
        firstname: "Dishan",
        lastname: "S",
        totalprice: 123,
        depositpaid: true,
        bookingdates: {
          checkin: "2023-07-01",
          checkout: "2023-07-10"
        },
        additionalneeds: "Breakfast"
      }
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    bookingId = body.bookingid;
  });
});