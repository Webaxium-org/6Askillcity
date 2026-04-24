import axios from 'axios';

async function test() {
  try {
    // We would need to login first
    console.log("We need a token to test.");
  } catch (error) {
    console.error(error);
  }
}

test();
