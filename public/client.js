const app = feathers();

// register service
app.use("todos", {
  // implements method
  async get(name) {
    return {
      name,
      text: `You have to do ${name}`
    };
  }
});

// use service
async function getTodo(name) {
  const service = app.service("todos");
  const todo = await service.get(name);

  console.log(todo);
}

getTodo("dishes");
