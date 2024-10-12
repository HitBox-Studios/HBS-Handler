const path = require('path')

const getAllFiles = require('../util/get-all-files')
const Command = require('./Command')

class CommandHandler {
  // <commandName, instance of the Command class>
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

      const command = new Command(commandName, commandObject)
      this.commands.set(command.commandName, command)
    }

    console.log(this.commands)
  }

  messageListener(client) {
    const validations = getAllFiles(path.join(__dirname, './validations')).map(
      (filePath) => require(filePath)
    )
    console.log(validations)

    const prefix = '!'

    client.on('messageCreate', (message) => {
      const { content } = message

      if (!content.startsWith(prefix)) {
        return
      }

      const args = content.split(/\s+/)
      const commandName = args.shift().substring(prefix.length).toLowerCase()

      const command = this.commands.get(commandName)
      if (!command) {
        return
      }

      const usage = { message, args, text: args.join(' ') }

      for (const validation of validations) {
        if (!validation(command, usage, prefix)) {
          return
        }
      }

      const { callback } = command.commandObject
      callback(usage)
    })
  }
}

module.exports = CommandHandler
