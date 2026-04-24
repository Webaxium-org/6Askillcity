import http from 'http';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk.toString());
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
        });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  try {
    // 1. Login to get token (assuming admin exists with email/pass, or we can just try to see if it responds)
    // Actually we don't know the admin password.
    // Let's create an admin or just find the token if possible.
    // Without token we get 401. 
    console.log("This requires a valid user token.");
  } catch (err) {
    console.error(err);
  }
}

run();
