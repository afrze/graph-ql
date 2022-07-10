### GraphQL Basics
Project structure
Contains simple project to test queries

### Setup
Uses Json-server to mimic REST API based Database
Nodemon to run nodeserver seamlessly

**Run Scripts**
npm run json:server => To run the Database service, hosted on localhost:3000
npm run dev => To run Node server, hosted on localhost:4000


GraphiQL => Express/GraphQL server => Datastore
Uses `"type": "module"` in `package.json` to set up project for ES6

**Working of express**
HTTP server, browsers creates HTTP reqeusts, which process it and gives a response.
Over here the express is going to hand over the request to GraphQL when needed.

**GraphQL Schema**
GraphQL associates all the data in a graph, Schema file has info on how data is arranged.

**Root Query**
It is hard for GraphQL to jump to a node, so we have to give a piece of data called Roote Query. Its like an entry point for GraphQL.

**Basic Query**
```js
{
  user(id: "23") {
    id
    firstName
    age
  }
}
```
**Query to another service**
```js
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve: (parentValue, args) => {
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then((res) => res.data);
      },
    },
  },
});
```
**Hooking mutiple nodes**
```js
const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
  },
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    fname: { type: GraphQLString },
    lname: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve: (parentValue, args) => {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then((res) => res.data);
      },
    },
  },
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve: (parentValue, args) => {
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then((res) => res.data);
      },
    },
  },
});
```
Multiple Root Query entry point
and Bidirectional Relations
```js
const CompanyType = new GraphQLObjectType({
  name: "Company",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve: (parentValue, args) => {
        console.log(parentValue);
        return axios
          .get(`http://localhost:3000/companies/${parentValue.id}/users`)
          .then((res) => res.data);
      },
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    fname: { type: GraphQLString },
    lname: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve: (parentValue, args) => {
        return axios
          .get(`http://localhost:3000/companies/${parentValue.companyId}`)
          .then((res) => res.data);
      },
    },
  },
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve: (parentValue, args) => {
        return axios
          .get(`http://localhost:3000/users/${args.id}`)
          .then((res) => res.data);
      },
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve: (parentValue, args) => {
        return axios
          .get(`http://localhost:3000/companies/${args.id}`)
          .then((res) => res.data);
      },
    },
  },
});
```

**Query example**
```js
{
  company(id: "2"){
    id
    name
    description
    users {
      id
      fname
      lname
    }
  }
}
```

**Mutiple queries and Naming queries**
```js
query findCompany {
  apple: company(id: "2") {
    id
    name
    description
    users {
      id
      fname
      lname
    }
  }
  google: company(id: "2") {
    id
    name
    description
    users {
      id
      fname
      lname
    }
  }
}

```
**Query Fragments**
```js
query findCompany {
  google: company(id: "2") {
   	...companyDetails
    users {
      id
      fname
      lname
    }
  }
}


fragment companyDetails on Company{
  id
  name
  description
}
```
**Mutations**
Use GraphQLNonNull for low level validation

Add user, Delete user, Edit user
```js
const mutations = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addUser: {
      type: UserType,
      args: {
        fname: { type: new GraphQLNonNull(GraphQLString) },
        lname: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
      },
      resolve: async (parentValue, { fname, lname, age }) => {
        const res = await axios.post("http://localhost:3000/users", {
          fname,
          lname,
          age,
        });
        return res.data;
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parentValue, { id }) => {
        const res = await axios.delete(`http://localhost:3000/users/${id}`);
        return res.data;
      },
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        fname: { type: GraphQLString },
        lname: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      resolve: async (parentValue, { id, fname, lname, age, companyId }) => {
        const res = await axios.patch(`http://localhost:3000/users/${id}`, {
          id,
          fname,
          lname,
          age,
          companyId,
        });
        return res.data;
      },
    },
  },
});
```