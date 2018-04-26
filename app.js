const feathers = require('@feathersjs/feathers');
const { BadRequest } = require("@feathersjs/errors");

class Messages {
  constructor() {
    this.messages = [];
    this.currentId = 0;
  }

  async find(params) {
    return this.messages;
  }

  async get(id, params) {
    const message = this.messages.find(message => message.id === parseInt(id, 10));

    if (!message) {
      throw new Error(`Message with id ${id} not found`);
    }

    return message;
  }

  async create(data, params) {
    const message = Object.assign({id: ++this.currentId}, data);

    this.messages.push(message);

    return message;
  }

  async patch(id, data, params) {
    const message = await this.get(id);

    return Object.assign(message, data);
  }

  async remove(id, params) {
    const message = await this.get(id);

    const index = this.messages.indexOf(message);

    this.messages.splice(index, 1);

    return message;
  }
}

const validate = async context => {
  const {data} = context;

  if (!data.text) {
    throw new BadRequest('Message text must exist');
  }

  if (typeof data.text !== "string" || data.text.trim() === "") {
    throw new BadRequest("Message text is invalid");
  }

  context.data = {
    text: data.text.toString()
  }

  return context;
};

const app = feathers();

// register service
app.use('messages', new Messages());

app.hooks({
  error: async context => {
    console.error(`Error in ${context.path} service, method ${context.method},`, context.error.stack);
  }
});

// use service
const setTimestamp = name => {
  return async context => {
    context.data[name] = new Date();
    return context;
  }
};

async function processMessages() {
  const messagesHooks = {
    before: {
      create: validate,
      update: validate,
      patch: validate,
    }
  };
  app.service('messages').hooks(messagesHooks);

  app.service('messages').on('created', message => {
    console.log('Created a new message', message);
  });
  
  app.service('messages').on('removed', message => {
    console.log('Deleted message', message);
  });

  await app.service('messages').create({
    text: 'First message'
  });

  await app.service('messages').create({
    text: ''
  });

  const lastMessage = await app.service('messages').create({
    text: 'Last message'
  });

  let messageList = await app.service('messages').find();
  console.log('Available messages', messageList);
  
  await app.service('messages').remove(lastMessage.id);

  messageList = await app.service('messages').find();
  console.log('Available messages', messageList);
}

processMessages();