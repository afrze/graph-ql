import graphql from "graphql";
import axios from "axios";

const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
} = graphql;

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

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: mutations,
});

export { schema };
