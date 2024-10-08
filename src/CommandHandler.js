const getAllFiles = require('./util/get-all-files')

class CommandHandler {
  // <commandName, commandObject>
  commands = new Map()

  constructor(commandsDir, client) {
    this.commandsDir = commandsDir
    this.readFiles()
    this.messageListener(client)
  }

  readFiles() {
    const files = getAllFiles(this.commandsDir)

    for (let file of files) {
      const commandObject = require(file)

      let commandName = file.split(/[/\\]/)
      commandName = commandName.pop()
      commandName = commandName.split('.')[0]

      if (!commandObject.callback) {
        throw new Error(
          `Command "${commandName}" does not have a callback function. Error Code: 94596 `
        )
      }

      this.commands.set(commandName.toLowerCase(), commandObject)
    }

    console.log(this.commands)
  }

  messageListener(client) {
    client.on('messageCreate', (message) => {
      const { content } = message

      if (!content.startsWith('!')) {
        return
      }

      const args = content.split(/\s+/)
      const commandName = args.shift().substring(1).toLowerCase()

      const commandObject = this.commands.get(commandName)
      if (!commandObject) {
        return
      }

      const { callback } = commandObject

      callback({ message, args, text: args.join(' ') })
    })
  }
}

module.exports = CommandHandler
