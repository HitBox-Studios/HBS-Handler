const mongoose = require('mongoose')
const CommandHandler = require('./command-handler/CommandHandler')

class Main {
  constructor({ client, mongoUri ,commandsDir, betaServers = [] }) {
    if (!client) {
      throw new Error('A client is required.  Error Code: 56351')
    }

    this._betaServers = betaServers

    if (mongoUri) {
        this.connectToMongo(mongoUri)
      }

    if (commandsDir) {
      new CommandHandler(this, commandsDir, client)
    }
  }

  get betaServers() {
    return this._betaServers
  }

  connectToMongo(mongoUri) {
    mongoose.connect(mongoUri, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // keepAlive: true,
    })
  }
}

module.exports = Main
