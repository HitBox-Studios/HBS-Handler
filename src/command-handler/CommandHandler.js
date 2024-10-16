const path = require('path')

const getAllFiles = require('../util/get-all-files')
const Command = require('./Command')
const SlashCommands = require('./SlashCommands')

class CommandHandler {
  // <commandName, instance of the Command class>
  _commands = new Map()
  _validations = this.getValidations('run-time')
  _prefix = '!'

  constructor(instance, commandsDir, client) {
    this._instance = instance
    this._commandsDir = commandsDir
    this._slashCommands = new SlashCommands(client)

    this.readFiles()
    this.messageListener(client)
    this.interactionListener(client)
  }

  readFiles() {
    const files = getAllFiles(this._commandsDir)
    const validations = this.getValidations('syntax')

    for (let file of files) {
      const commandObject = require(file)

      let commandName = file.split(/[/\\]/)
      commandName = commandName.pop()
      commandName = commandName.split('.')[0]

      const command = new Command(this._instance, commandName, commandObject)

      const {
        description,
        options = [],
        type,
        betaOnly,
        delete: del,
      } = commandObject

      if (del) {
        if (type === 'SLASH' || type === 'BOTH') {
          if (betaOnly) {
            for (const guildId of this._instance.betaServers) {
              this._slashCommands.delete(command.commandName, guildId)
            }
          } else {
            this._slashCommands.delete(command.commandName)
          }
        }

        continue
      }

      for (const validation of validations) {
        validation(command)
      }

      this._commands.set(command.commandName, command)

      if (type === 'SLASH' || type === 'BOTH') {
        if (betaOnly) {
          for (const guildId of this._instance.betaServers) {
            this._slashCommands.create(
              command.commandName,
              description,
              options,
              guildId
            )
          }
        } else {
          this._slashCommands.create(command.commandName, description, options)
        }
      }
    }
  }

  async runCommand(commandName, args, message, interaction) {
    const command = this._commands.get(commandName)
    if (!command) {
      return
    }

    const { callback, type } = command.commandObject

    if (message && type === 'SLASH') {
      return
    }

    const usage = {
      message,
      interaction,
      args,
      text: args.join(' '),
      guild: message ? message.guild : interaction.guild,
    }

    for (const validation of this._validations) {
      if (!validation(command, usage, this._prefix)) {
        return
      }
    }

    return await callback(usage)
  }

  messageListener(client) {
    client.on('messageCreate', async (message) => {
      const { content } = message

      if (!content.startsWith(this._prefix)) {
        return
      }

      const args = content.split(/\s+/)
      const commandName = args
        .shift()
        .substring(this._prefix.length)
        .toLowerCase()

      const response = await this.runCommand(commandName, args, message)
      if (response) {
        message.reply(response).catch(() => {})
      }
    })
  }

  interactionListener(client) {
    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) {
        return
      }

      const args = ['5', '10']

      const response = await this.runCommand(
        interaction.commandName,
        args,
        null,
        interaction
      )
      if (response) {
        interaction.reply(response).catch(() => {})
      }
    })
  }

  getValidations(folder) {
    const validations = getAllFiles(
      path.join(__dirname, `./validations/${folder}`)
    ).map((filePath) => require(filePath))

    return validations
  }
}

module.exports = CommandHandler
