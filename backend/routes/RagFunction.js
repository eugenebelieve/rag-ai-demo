const { config } = require("dotenv");
config();

const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");
const { formatDocumentsAsString } = require("langchain/util/document");
const { PromptTemplate } = require("@langchain/core/prompts");
const {
  RunnableSequence,
  RunnablePassthrough,
} = require("@langchain/core/runnables");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const {
  MongoDBAtlasVectorSearch,
} = require("@langchain/community/vectorstores/mongodb_atlas");
const { MongoClient } = require("mongodb");

exports.RagFunction = async function (message, selected) {
  /**************** MONGODB CLIENT START ****************/
  const client = new MongoClient(process.env.MONGODB_ATLAS_URI);
  await client.connect();
  const collection = client
    .db(process.env.DATABASE_NAME)
    .collection("products");
  /****************  MONGODB CLIENT END  ****************/

  /****************  LLM START  ****************/
  const model = new ChatOpenAI();
  /****************  LLMs END  ****************/

  /**************** PROMPT START ****************/
  let promptStart =
    "Make a short recommendation based only on the following context:";

  switch (selected) {
    case "shakespear":
      promptStart =
        "Act as Shakespear, make a short recommendation based only on the following context:";
      break;
    case "younger":
      promptStart =
        "Act as a teenager and make a very short recommendation based only on the following context";
      break;
  }
  /**************** PROMPT END ****************/

  /**************** VECTOR RETRIEVAL START ****************/
  const vectorStore = new MongoDBAtlasVectorSearch(new OpenAIEmbeddings(), {
    collection,
    indexName: "vector", // The name of the Atlas search index. Defaults to "default"
    textKey: "name", // The name of field containing the raw content. Defaults to "text"
    embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
  });

  const retriever = vectorStore.asRetriever({ k: 2 });
  /**************** VECTOR RETRIEVAL END ****************/

  /**************** PROMPT TEMPLATE START ****************/

  const prompt = PromptTemplate.fromTemplate(`${promptStart}
{context}

Question: {question}`);

  /**************** PROMPT TEMPLATE END ****************/

  /**************** CHAIN START ****************/

  const chain = RunnableSequence.from([
    {
      context: retriever.pipe(formatDocumentsAsString),
      question: new RunnablePassthrough(),
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke(message);
  /**************** CHAIN START ****************/

  /**************** OUTPUT START ****************/
  const vector = await vectorStore.similaritySearch(result, 2);
  return JSON.stringify({ result: result, vector: vector });
  /**************** OUTPUT END ****************/
};
