import express from "express";
import { graphqlHTTP } from "express-graphql";
import { schema } from './schema/schema.js'

const app = express();

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

const port = 4000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
