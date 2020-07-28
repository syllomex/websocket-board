import React, { useState, useEffect } from "react";
import "./styles.css";

import io from "socket.io-client";
const socket = io("http://localhost");

function App() {
  const [lists, setLists] = useState([]);
  const [lastCard, setLastCard] = useState();
  const [lastList, setLastList] = useState();

  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(null);
  const [overList, setOverList] = useState(null);

  function changeCardToList(card_id, list_id) {
    lists.forEach((list, i) =>
      list.cards.forEach((card, j) => {
        if (card.id === card_id) {
          let tmp_card = lists[i].cards.splice(j, 1);
          let tmp_lists = lists;

          tmp_lists.forEach((to_list, k) => {
            if (to_list.id === list_id) {
              tmp_lists[k].cards.push(...tmp_card);
              setLists([...tmp_lists]);

              let data = {
                LISTS: [...tmp_lists],
                LAST_CARD: lastCard,
                LAST_LIST: lastList,
              };

              socket.emit("send lists", data);
            }
          });
        }
      })
    );
  }

  function changeCardToCard(from_id, to_id, position) {
    let rollback = JSON.parse(JSON.stringify(lists));

    let tmp_lists = [...lists];
    let tmp_card;

    let from_index;
    let from_list;
    let to_index;
    let to_list;

    tmp_lists.forEach((list, i) =>
      list.cards.forEach((card, j) => {
        if (card.id === from_id) {
          from_index = j;
          from_list = i;
        }
        if (card.id === to_id) {
          to_list = i;
          to_index = j;
        }
      })
    );

    if (
      from_list === to_list &&
      position === "below" &&
      to_index === from_index - 1
    )
      return;
    if (
      from_list === to_list &&
      position !== "below" &&
      from_index === to_index - 1
    )
      return;

    tmp_card = tmp_lists[from_list].cards.splice(from_index, 1);

    try {
      if (to_list === undefined) to_list = 0;
      if (position === "below") {
        if (to_index < from_index || from_list !== to_list) {
          tmp_lists[to_list].cards.splice(to_index + 1, 0, ...tmp_card);
        } else {
          tmp_lists[to_list].cards.splice(to_index, 0, ...tmp_card);
        }
      } else {
        if (to_index > from_index && from_list === to_list) {
          tmp_lists[to_list].cards.splice(to_index - 1, 0, ...tmp_card);
        } else {
          tmp_lists[to_list].cards.splice(to_index, 0, ...tmp_card);
        }
      }
      setLists([...tmp_lists]);

      let data = {
        LISTS: [...tmp_lists],
        LAST_CARD: lastCard,
        LAST_LIST: lastList,
      };

      socket.emit("send lists", data);
    } catch (err) {
      console.log(rollback);
      console.error(err);
      setLists([...rollback]);
      return;
    }
  }

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = "move";
    setDragging(e.target.id);
    setDragging(e.target);
  }

  function handleDragEnd(e) {
    e.preventDefault();
    setDragging(null);

    toggleListDropzone(false);
  }

  function handleDragOverCard(e) {
    e.preventDefault();

    if (overList !== null) {
      setOverList(null);
    }

    if (e.target.className !== "card") {
      setOver(null);
      return;
    }

    if (over?.id === e.target.id) return;

    if (e.target.id !== dragging.id) {
      setOver(e.target);
      return;
    }

    if (e.target.id === dragging?.id && over !== null) {
      setOver(null);
    }
  }

  function handleDragOverList(e) {
    e.preventDefault();

    toggleListDropzone(true);

    if (e.target.className !== "list") return;

    if (overList === null) {
      setOver(null);
      setOverList(e.target);
      return;
    }

    if (overList?.id !== e.target.id) {
      setOver(null);
      setOverList(e.target);
      return;
    }
  }

  function handleDropOnCard(e) {
    toggleListDropzone(false);

    if (over === null || overList !== null) return;

    const draggingId = parseInt(dragging.id);
    const overId = parseInt(over.id);

    const offset = e.target.getBoundingClientRect().top;
    const height = e.target.getBoundingClientRect().height;

    const center = offset + height / 2;

    let position;
    if (e.clientY < center) position = "above";
    else position = "below";

    changeCardToCard(draggingId, overId, position);
  }

  function handleDropOnList(e) {
    toggleListDropzone(false);
    if (overList === null || over !== null) return;

    const draggingId = parseInt(dragging.id);
    const overListId = parseInt(overList.id);

    changeCardToList(draggingId, overListId);
  }

  function handleDragOverCreate(e) {
    e.preventDefault();
  }

  function handleDropOnCreate(e) {
    toggleListDropzone(false);
    let tmp_lists = lists;
    let tmp_card;

    const draggingId = parseInt(dragging.id);

    tmp_lists.forEach((list, i) =>
      list.cards.forEach((card, j) => {
        if (card.id === draggingId) {
          tmp_card = tmp_lists[i].cards.splice(j, 1);
        }
      })
    );

    let LAST_LIST = lastList;
    LAST_LIST++;

    tmp_lists.push({ id: LAST_LIST, cards: [...tmp_card] });
    setLastList(LAST_LIST);
    setLists(tmp_lists);

    let data = {
      LISTS: [...tmp_lists],
      LAST_CARD: lastCard,
      LAST_LIST: LAST_LIST,
    };

    socket.emit("send lists", data);
  }

  function createCardOnList(listId) {
    let tmp_lists = lists;

    let LAST_CARD = lastCard;
    LAST_CARD++;

    tmp_lists.forEach((list, i) => {
      if (list.id === listId) {
        tmp_lists[i].cards.push({
          id: LAST_CARD,
          content: `card ${LAST_CARD}`,
        });
      }
    });

    setLastCard(LAST_CARD);
    setLists([...tmp_lists]);

    let data = {
      LISTS: [...tmp_lists],
      LAST_CARD: LAST_CARD,
      LAST_LIST: lastList,
    };

    socket.emit("send lists", data);
  }

  function createList() {
    let tmp_lists = lists;

    let LAST_LIST = lastList;
    LAST_LIST++;

    tmp_lists.push({ id: LAST_LIST, cards: [] });
    setLists([...tmp_lists]);
    setLastList(LAST_LIST);

    let data = {
      LISTS: [...tmp_lists],
      LAST_CARD: lastCard,
      LAST_LIST: LAST_LIST,
    };

    socket.emit("send lists", data);
  }

  function deleteList(listId) {
    let tmp_lists = lists;

    tmp_lists.forEach((list, i) => {
      if (list.id === listId) {
        tmp_lists.splice(i, 1);

        setLists([...tmp_lists]);

        let data = {
          LISTS: [...tmp_lists],
          LAST_CARD: lastCard,
          LAST_LIST: lastList,
        };

        socket.emit("send lists", data);
      }
    });
  }

  function handleDeleteCard(cardId) {
    let tmp_lists = lists;

    tmp_lists.forEach((list, i) =>
      list.cards.forEach((card, j) => {
        if (cardId === card.id) {
          tmp_lists[i].cards.splice(j, 1);
          setLists([...tmp_lists]);

          let data = {
            LISTS: [...tmp_lists],
            LAST_CARD: lastCard,
            LAST_LIST: lastList,
          };

          socket.emit("send lists", data);
        }
      })
    );
  }

  socket.on("connect", () => console.log("connected"));

  socket.on("receive lists", (data) => {
    setLists(data.LISTS);
    setLastList(data.LAST_LIST);
    setLastCard(data.LAST_CARD);
  });

  useEffect(() => {
    socket.emit("get lists");
  }, []);

  return (
    <div>
      <div className="board">
        {lists?.map((list) => (
          <div
            key={list.id}
            id={list.id}
            onDragOver={handleDragOverList}
            onDrop={handleDropOnList}
            className="list"
          >
            {list.cards.map((card) => (
              <div
                key={card.id}
                id={card.id}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOverCard}
                onDrop={handleDropOnCard}
                className="card"
              >
                {card.content}
                <button onClick={() => handleDeleteCard(card.id)}>
                  &times;
                </button>
              </div>
            ))}
            <button
              className="create-card"
              onClick={() => createCardOnList(list.id)}
            >
              +
            </button>
            <button className="delete-list" onClick={() => deleteList(list.id)}>
              Delete List
            </button>
          </div>
        ))}

        <button
          onClick={createList}
          onDragOver={handleDragOverCreate}
          onDrop={handleDropOnCreate}
          className="create"
        >
          Add List
        </button>
      </div>
    </div>
  );
}

function toggleListDropzone(state) {
  if (state) {
    document.querySelectorAll(".list").forEach((list) => {
      list.style.backgroundColor = "rgba(240, 240, 240, 1)";
      list.style.border = "5px dashed rgba(220, 220, 220, 1)";
    });
    document.querySelectorAll(".create").forEach((button) => {
      button.style.backgroundColor = "rgba(240, 240, 240, 1)";
      button.style.border = "5px dashed rgba(220, 220, 220, 1)";
      button.innerText = "Drop here to add to new list";
    });
  }
  if (!state) {
    document.querySelectorAll(".list").forEach((list) => {
      list.style.backgroundColor = "rgba(240, 240, 240, 0.7)";
      list.style.border = "5px solid rgba(240, 240, 240, 0)";
    });
    document.querySelectorAll(".create").forEach((button) => {
      button.style.backgroundColor = "rgba(240, 240, 240, 0.7)";
      button.style.border = "5px solid rgba(240, 240, 240, 0)";
      button.innerText = "Add List";
    });
  }
}

export default App;
