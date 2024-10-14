module.exports = (command) => {
    const { instance, commandName, commandObject } = command
  
    if (commandObject.betaOnly !== true || instance.betaServers.length) {
      return
    }
    throw new Error(
      `Command "${commandName}" is a beta command but no beta servers were provided. Error Code: 85465`
    )
  }
  