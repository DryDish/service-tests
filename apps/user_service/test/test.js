import fetch from "node-fetch";
import { User } from "../src/user.js";
import { connection } from "../src/mysql/mysql_connection.js";

beforeAll(() => {
  connection.query(
    `CREATE TABLE IF NOT EXISTS user (id INT AUTO_INCREMENT PRIMARY KEY, first_name VARCHAR(50), last_name VARCHAR(50), age INT)`,
    (error, result) => {
      if (error) {
        console.error("Failed to create table");
        throw error;
      }
    }
  );
});

afterAll(async () => {
  connection.query(`DROP TABLE IF EXISTS user`, async(error, result) => {
    if (error) {
      console.error("Failed to drop table");
      throw error;
    }
  });
  connection.end();
  await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});

describe("Sample Test", () => {
  it("should test that true === true", () => {
    expect(true).toBe(true);
  });

  it("should test that false === false", () => {
    expect(false).toBe(false);
  });
});

describe("Check that the API is alive", () => {
  
  it("should test that /health-check responds correctly", async () => {

    const promise = await fetch(`http://${process.env.SERVICE_HOST}:5000/user/health-check`, { method: "GET" });
    const response = await promise.json();
    expect(response.message).toBe("I am alive");
  });
});

describe("Create, update and delete a user", () => {
  const testUser = new User("FirstName", "LastName", 21);

  it("should test that a user is created correctly", async () => {
    const promise = await fetch(`http://${process.env.SERVICE_HOST}:5000/user`, {
      method: "POST",
      body: JSON.stringify(testUser),
      headers: { "Content-Type": "application/json" },
    });
    const response = await promise.json();

    expect(response.description).toBe("User added");
    expect(response.new_user.first_name).toBe(testUser.first_name);
    expect(response.new_user.last_name).toBe(testUser.last_name);
    expect(response.new_user.age).toBe(testUser.age);
  });

  let id = -1;
  it("should test that a list of all users can be retrieved", async () => {
    const promise = await fetch(`http://${process.env.SERVICE_HOST}:5000/user`, {
      method: "GET",
    });
    const response = await promise.json();

    expect(Array.isArray(response.users)).toBe(true);
    expect(response.users.length === 1).toBe(true);

    // Get the ID of the created testUser
    let responseArray = [];
    response.users.forEach((user) => {
      if (user.first_name === testUser.first_name && user.last_name === testUser.last_name && user.age === testUser.age) {
        responseArray.push(user);
      }
    });
    // Store it for later
    id = responseArray[0].id;    
  });

  it("should test that a user is updated correctly", async () => {
    testUser.first_name = "updatedName";
    testUser.last_name = "updatedLast";
    testUser.age = 99;

    const promise = await fetch(`http://${process.env.SERVICE_HOST}:5000/user/${id}`, {
      method: "PATCH",
      body: JSON.stringify(testUser),
      headers: {'Content-Type': 'application/json'}
    });
    const response = await promise.json();
    expect(response.description).toBe("User updated");
    expect(response.new_user.first_name).toBe(testUser.first_name);
    expect(response.new_user.last_name).toBe(testUser.last_name);
    expect(response.new_user.age).toBe(testUser.age);
  });

  it("should test that a user is deleted correctly", async () => {

    const promise = await fetch(`http://${process.env.SERVICE_HOST}:5000/user/${id}`, {
      method: "DELETE",
      body: JSON.stringify(testUser),
      headers: {'Content-Type': 'application/json'}
    });
    const response = await promise.json();
    
    expect(response.description).toBe("User deleted");
  });
});

