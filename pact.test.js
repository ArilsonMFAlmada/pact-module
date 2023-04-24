const { Pact } = require('@pact-foundation/pact');
const { Matchers } = require('@pact-foundation/pact');
const { like } = Matchers;
const axios = require('axios');

// Set up the Pact provider
const provider = new Pact({
  consumer: 'MyConsumer',
  provider: 'MyProvider',
  port: 8090,
  log: 'logs/pact.log',
  dir: 'pacts',
});

// Define the contract for the POST /products endpoint
const expectedRequest = {
  productName: 'Nintend 3DS',
  productBrand: 'Nintendo',
  productPrice: '100.5',
  unitMeasurement: like('Unity')
};

const expectedResponse = {
  productName: 'Nintend 3DS',
  productBrand: 'Nintendo',
  productPrice: '100.5',
  unitMeasurement: like('Unity')
};

// Start the mock service
beforeAll(() => provider.setup());

// Define the interaction
beforeEach(() =>
  provider.addInteraction({
    state: 'A request to create a product',
    uponReceiving: 'A request to create a new product',
    withRequest: {
      method: 'POST',
      path: '/products',
      headers: {
        'Content-Type': 'application/json'
      },
      body: expectedRequest
    },
    willRespondWith: {
      status: 201,
      headers: {
        'Content-Type': 'application/json'
      },
      body: expectedResponse
    }
  })
);

// Test the interaction using the actual provider
it('should create a product', async () => {
  const response = await axios.post('http://localhost:8090/products', expectedRequest);
  expect(response.status).toEqual(201);
  expect(response.data).toEqual(expectedResponse);
});

// Verify the Pact contract
afterEach(() => provider.verify());

// Stop the mock service and write the Pact file
afterAll(() => provider.finalize());
