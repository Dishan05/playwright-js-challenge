const {request, default: test} = require('@playwright/test');
const testData = require('../data/testData_api.json');

const BASE_URL = testData.config.baseUrl;
const AUTH_ENDPOINT = '/auth';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

async function getAuthorizedApiContext()
{
    const apiContext = await request.newContext({
        baseURL: BASE_URL,
        extraHTTPHeaders: DEFAULT_HEADERS,
    });

    const authResponse = await apiContext.post(AUTH_ENDPOINT, {
        data: {
            username: testData.config.auth.username,
            password: testData.config.auth.password,
        },
    });

    if (!authResponse.ok()) {
        throw new Error('Failed to authenticate');
    }

    const { token } = await authResponse.json();

    return await request.newContext({
        baseURL: BASE_URL,
        extraHTTPHeaders: {
            ...DEFAULT_HEADERS,
            Cookie: `token=${token}`,
        },
    });
}

async function getUnauthorizedApiContext() {
    return await request.newContext({
        baseURL: BASE_URL,
        extraHTTPHeaders: DEFAULT_HEADERS,
    });
}

async function createNewBooking(apiContext, bookingData) {
    const response = await apiContext.post('/booking', {
        data: bookingData,
    });

    return await response;
}

async function getBookings(apiContext) {
    const response = await apiContext.get('/booking');

    return await response;
}

async function getBookingById(apiContext, bookingId) {
    const response = await apiContext.get(`/booking/${bookingId}`);

    return await response;
}

async function updateAllBookingDetails(apiContext, bookingId, bookingData) {
    const response = await apiContext.put(`/booking/${bookingId}`, {
        data: bookingData,
    });

    return await response;
}

async function UpdatePartialBookingDetails(apiContext, bookingId, partialData) {
    const response = await apiContext.patch(`/booking/${bookingId}`, {
        data: partialData,
    });

    return await response;
}

async function deleteBooking(apiContext, bookingId) {
    const response = await apiContext.delete(`/booking/${bookingId}`);

    return await response;
}

async function getBookingByQuery(apiContext, queryParams) {
  const url = new URLSearchParams(queryParams).toString();
  return await apiContext.get(`/booking?${url}`);
}

module.exports = {
    getAuthorizedApiContext,
    getUnauthorizedApiContext,
    createNewBooking,
    getBookings,
    getBookingById,
    getBookingByQuery,
    updateAllBookingDetails,
    UpdatePartialBookingDetails,
    deleteBooking
};