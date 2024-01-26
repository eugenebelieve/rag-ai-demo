import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sentiment from "sentiment";

import { Dropdown } from "flowbite-react";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [assistantMessage, setAssistantMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [selectedAI, setSelectedAI] = useState("normal");

  // SCROLL DOWN //
  const messagesLeftEndRef = useRef(null);
  const messagesRightEndRef = useRef(null);

  const scrollToBottom = async () => {
    messagesLeftEndRef?.current?.scrollIntoView({ behavior: "smooth" });

    setTimeout(function () {
      messagesRightEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, 500);
  };

  async function fetchData() {
    const { data } = await axios.get("http://localhost:8000/api/messages");
    setConversation(data);
  }

  async function sendData(msg) {
    const result = await axios.post("http://localhost:8000/api/send", msg);
    if (result && result?.status === 200) {
      scrollToBottom();
    }
  }

  async function generateRag(response) {
    console.log("Response", response);
    try {
      const result = await axios.post("http://localhost:8000/api/rag", {
        message: response,
        selected: selectedAI,
      });

      if (result && result?.status === 200) {
        const newMessage = {
          sender: "assistant",
          name: "Shopping AI",
          message: result.data.result,
          products: result.data.vector,
          alignment: "end",
          time: new Date().toLocaleString(),
          avatar:
            "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg",
          location: "Earth, Solar System",
          sentiment: messageSentiment(result.data.result),
        };

        sendData(newMessage);

        setConversation((prev) => [...prev, newMessage]);

        setTimeout(function () {
          scrollToBottom();
        }, 1500);
      }
    } catch (err) {
      console.log("Generate Rag Error", err);
    }
  }

  useEffect(() => {
    try {
      fetchData();
    } catch (err) {
      console.log("error", err);
    }
  }, []);

  const handleCustomerSubmit = (e) => {
    e.preventDefault();

    const newMessage = {
      sender: "customer",
      name: "Eugène",
      message: message,
      products: [],
      alignment: "start",
      time: new Date().toLocaleString(),
      avatar:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxt40gCunCJCXXxc38PaGwswbQSxByo1WvfsRbgiEYHK5EBbQAMVkknmmDnoeHgVCCWfA&usqp=CAU",
      location: "Paris, France",
      sentiment: messageSentiment(message),
    };

    sendData(newMessage);
    setConversation((prev) => [...prev, newMessage]);
    console.log("message", message);
    generateRag(message);
    scrollToBottom();
  };

  const handleAssistantSubmit = (e) => {
    e.preventDefault();

    const newMessage = {
      sender: "assistant",
      name: "Shopping AI",
      message: assistantMessage,
      products: [],
      alignment: "end",
      time: new Date().toLocaleString(),
      avatar:
        "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg",
      location: "Earth, Solar System",
      sentiment: messageSentiment(assistantMessage),
    };

    setConversation((prev) => [...prev, newMessage]);
    scrollToBottom();
  };

  /** SENTIMENT Function */
  function messageSentiment(txt) {
    try {
      var sentiment = new Sentiment();
      return sentiment.analyze(txt);
    } catch (err) {
      console.log("Sentiment Module Error", err);
      return 0;
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 p-10 h-[100%]">
        {/** *********CUSTOMER AREA**********/}
        <div
          className="grid flex-grow card rounded-box place-items-center bg-cover bg-center backdrop-blur-md bg-white/30 mx-5 p-5"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        >
          <div className="backdrop-blur-sm bg-white/30 w-[100%] h-[100%] grid flex-grow card rounded-box place-items-center py-20">
            <h1 className="text-5xl font-bold pt-0">
              Customer &#129489;&#127995;
            </h1>
            <div className="mockup-phone border-primary mb-10">
              {/** CAMERA */}
              <div className="camera"></div>
              <div className="display">
                <div className="artboard artboard-demo phone-2 block pb-20 pt-10 px-2">
                  <div className="overflow-scroll h-[100%]">
                    {/** CONVERSATION */}
                    {conversation?.map((item, index) => (
                      <div className={`chat chat-start w-[100%]`} key={index}>
                        <div className="chat-image avatar">
                          <div className="w-10 rounded-full">
                            <img alt="chat bubble" src={item?.avatar} />
                          </div>
                        </div>
                        <div className="chat-header">
                          {item?.name}
                          <time className="text-xs opacity-50">
                            {" "}
                            - {item?.time?.slice(10, 16)}
                          </time>
                        </div>
                        <div
                          className={`chat-bubble ${
                            item?.sender === "assistant"
                              ? "chat-bubble-primary"
                              : ""
                          }`}
                        >
                          {item.message}

                          {item?.products?.length > 0 && (
                            <div className="carousel carousel-center max-w-md p-2 space-x-2 bg-primary rounded-box">
                              {item?.products?.map((product, index) => (
                                <div className="carousel-item h-32" key={index}>
                                  <img
                                    src={product?.metadata?.img}
                                    className="rounded-box"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div
                          className="chat-footer opacity-50"
                          ref={messagesLeftEndRef}
                        >
                          {item?.location}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form className="py-3 px-3" onSubmit={handleCustomerSubmit}>
                    <label
                      htmlFor="default-search"
                      className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                    >
                      Search
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                          />
                        </svg>
                      </div>
                      <input
                        type="search"
                        id="default-search"
                        className="block w-full p-4 ps-10 pr-20 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Ask the Shopping AI..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        require
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/** >*********END CUSTOMER AREA*********< */}

        {/** ********* COMPANY LOG ********* */}
        <div
          className="grid flex-grow card rounded-box place-items-center bg-cover bg-center backdrop-blur-md bg-white/30 mx-5 p-5"
          style={{
            backgroundImage:
              selectedAI === "shakespear"
                ? "url('https://images.unsplash.com/photo-1486272812091-a9bf3c6376c5?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
                : selectedAI === "younger"
                ? "url('https://images.unsplash.com/photo-1560015534-cee980ba7e13?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29sb3JmdWwlMjB3YWxsfGVufDB8fDB8fHww')"
                : "url('https://images.unsplash.com/photo-1554232456-8727aae0cfa4?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
          }}
        >
          <div className="backdrop-blur-sm bg-white/30 w-[100%] grid flex-grow card rounded-box place-items-center py-20">
            <h1 className="text-5xl font-bold pb-6 text-white">
              Company Log{" "}
              {selectedAI === "shakespear" ? (
                <span>&#129718;</span>
              ) : selectedAI === "younger" ? (
                <span>&#128526;</span>
              ) : (
                ""
              )}
            </h1>
            <div className="mockup-phone border-warning ">
              {/** CAMERA */}
              <div className="camera"></div>
              <div className="display">
                <div className="artboard artboard-demo phone-2 block pb-20 pt-10 px-2">
                  <div className="overflow-scroll h-[100%]">
                    {/** CONVERSATION */}
                    {conversation?.map((item, index) => (
                      <div className={`chat chat-end w-[100%]`} key={index}>
                        <div className="chat-image avatar">
                          <div className="w-10 rounded-full">
                            <img
                              alt="chat bubble component"
                              src={item.avatar}
                            />
                          </div>
                        </div>
                        <div className="chat-header">
                          {item.name}
                          <time className="text-xs opacity-50">
                            {" "}
                            - {item?.time?.slice(10, 16)}
                          </time>
                        </div>
                        <div
                          className={`chat-bubble ${
                            item?.sender === "assistant"
                              ? "chat-bubble-primary"
                              : ""
                          }`}
                        >
                          {/** MESSAGE */}
                          {item?.sender === "assistant" && item.message + " "}

                          {/** SENTIMENT */}
                          {item?.sender === "customer" &&
                            item?.sentiment?.tokens?.map((token) => {
                              return (
                                <>
                                  {item?.sentiment?.negative?.includes(
                                    token
                                  ) ? (
                                    <div className="badge badge-error">
                                      {" " + token + " "}
                                    </div>
                                  ) : (
                                    " " + token + " "
                                  )}
                                </>
                              );
                            })}

                          {item?.products?.length > 0 && (
                            <div className="carousel carousel-center max-w-md p-2 space-x-2 bg-primary rounded-box">
                              {item?.products?.map((product, index) => (
                                <div className="carousel-item h-32" key={index}>
                                  <img
                                    src={product?.metadata?.img}
                                    className="rounded-box"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div
                          className="chat-footer opacity-50"
                          ref={messagesRightEndRef}
                        >
                          {item?.location}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form className="py-3 px-3" onSubmit={handleAssistantSubmit}>
                    <label
                      htmlFor="default-search"
                      className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                    >
                      Search
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-500 dark:text-gray-400"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 20"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                          />
                        </svg>
                      </div>
                      <input
                        type="search"
                        id="default-search"
                        className="block w-full p-4 ps-10 pr-20 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Ask the Shopping AI..."
                        value={assistantMessage}
                        onChange={(e) => setAssistantMessage(e.target.value)}
                        require
                      />
                      <button
                        type="submit"
                        onClick={scrollToBottom}
                        className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="pt-3">
              <Dropdown
                label="Select AI Personality"
                color="warning"
                placement="top"
              >
                <Dropdown.Header>
                  <span className="block text-sm">Select your AI</span>
                </Dropdown.Header>
                <Dropdown.Item onClick={(e) => setSelectedAI("normal")}>
                  Normal
                </Dropdown.Item>
                <Dropdown.Item onClick={(e) => setSelectedAI("younger")}>
                  Young / Cool
                </Dropdown.Item>
                <Dropdown.Item onClick={(e) => setSelectedAI("shakespear")}>
                  Shakespeare
                </Dropdown.Item>
              </Dropdown>
            </div>
          </div>
        </div>
        {/** ********* >END COMPANY LOG< ********* */}
      </div>
    </>
  );
};

export default Chatbot;
