module.exports = (command) => {
    const { commandObject, commandName } = command
  
    if (!commandObject.callback) {
      throw new Error(
        `Command "${commandName}" does not have a callback function. Error Code: 99688`
      )
    }
  }
  