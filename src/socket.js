module.exports = (http) => {
  const io = require("socket.io")(http);

  let LAST_LIST = 1;
  let LAST_CARD = 4;

  let LISTS = [
    {
      id: 0,
      cards: [
        { id: 0, content: "card 0" },
        { id: 1, content: "card 1" },
        { id: 2, content: "card 2" },
        { id: 3, content: "card 3" },
        { id: 4, content: "card 4" },
      ],
    },
    {
      id: 1,
      cards: [],
    },
  ];

  io.on("connect", (socket) => {
    socket.emit("connected", socket.id);

    socket.on("get lists", () => {
      socket.emit("receive lists", { LISTS, LAST_CARD, LAST_LIST });
    });

    socket.on("send lists", (data) => {
      LISTS = data.LISTS;
      LAST_CARD = data.LAST_CARD;
      LAST_LIST = data.LAST_LIST;

      socket.broadcast.emit("receive lists", { LISTS, LAST_CARD, LAST_LIST });
    });
  });
};
