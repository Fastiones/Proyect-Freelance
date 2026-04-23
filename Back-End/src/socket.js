let _io = null;

const init = (io) => {
  _io = io;
};

const getIo = () => _io;

module.exports = { init, getIo };
