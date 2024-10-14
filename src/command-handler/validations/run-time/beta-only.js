module.exports = (command, usage) => {
    const { instance, commandObject } = command
    const { guild } = usage

    if (commandObject.betaOnly !== true) {
      return true
    }

    return instance.betaServers.includes(guild?.id)
}