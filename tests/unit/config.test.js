const connectionString = require("../../config/connection");

describe("Config/connection.js", () => {
  const ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ENV }; //Make a copy of the environment variables
  });

  afterAll(() => {
    process.env = ENV; //Restore old env
  });

  it('should pass if environment is "development"', async () => {
    if ((ENV.NODE_ENV = "development")) {
      expect(process.env.DB_HOST).toMatch(/0.0.0.0/);
      expect(process.env.DB_PORT).toMatch(/27017/);
      expect(process.env.DB_NAME).toMatch(/fundDB/);
      expect(connectionString).toMatch(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    }
  });

  it('should pass if environment is "test"', async () => {
    if ((ENV.NODE_ENV = "test")) {
      expect(process.env.DB_HOST).toMatch(/0.0.0.0/);
      expect(process.env.DB_PORT).toMatch(/27017/);
      expect(process.env.TEST_DB_NAME).toMatch(/fundDB_test/);
      expect(connectionString).toMatch(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.TEST_DB_NAME}`);
    }
  });

  it('should pass if environment is "production"', async () => {
    if ((ENV.NODE_ENV = "production")) {
      expect(process.env.DB_HOST).toMatch(/0.0.0.0/);
      expect(process.env.DB_PORT).toMatch(/27017/);
      expect(process.env.DB_NAME).toMatch(/fundDB/);
      expect(connectionString).toMatch(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    }
  });
});
