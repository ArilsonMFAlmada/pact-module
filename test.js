const { Pact } = require('@pact-foundation/pact');
const { Matchers } = require('@pact-foundation/pact');
const { like } = Matchers;
const axios = require('axios');

// Set up the Pact provider
const provider = new Pact({
  consumer: 'MyConsumer',
  provider: 'MyProvider',
  port: 8080,
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

// Define the interaction
provider
  .setup()
  .then(() =>
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
  )
  .then(() => {
    // Test the interaction using the actual provider
    return axios.post('http://localhost:8080/products', expectedRequest);
  })
  .then(response => {
    expect(response.status).toEqual(201);
    expect(response.data).toEqual(expectedResponse);

    // Verify the Pact contract
    return provider.verify();
  })
  .finally(() => {
    // Tear down the provider and write the Pact file
    provider.finalize();
  });
