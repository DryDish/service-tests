import fetch from "node-fetch";
import { User } from "../src/user.js";
import { createUserTable, dropUserTable } from "../src/mysql/mysql_connection.js";

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
  dropUserTable();
  createUserTable();
  const testUser = new User("FirstName", "LastName", 21);

  it("should test that a user is created correctly", async () => {
    await new Promise(r => setTimeout(r, 1000));
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
    expect(response.users.length > 0).toBe(true);

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
});
