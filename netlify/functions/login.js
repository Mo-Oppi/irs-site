exports.handler = async (event) => {
  const { password } = JSON.parse(event.body);

  if (password === process.env.ADMIN_PASSWORD) {
    return { statusCode: 200, body: "ok" };
  }

  return { statusCode: 401, body: "bad password" };
};
