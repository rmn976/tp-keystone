const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Checkbox, Password, File, Relationship } = require('@keystonejs/fields');
const { AuthedRelationship } = require('@keystonejs/fields-authed-relationship');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const initialiseData = require('./initial-data');
const { LocalFileAdapter } = require('@keystonejs/file-adapters');
const { StaticApp } = require('@keystonejs/app-static');

const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');

const fileAdapter = new LocalFileAdapter({
  src: './public/files',
  path: '/files',
});

const PROJECT_NAME = 'tp-keystone';
const adapterConfig = { mongoUri: 'mongodb://localhost/tp-keystone' };


const keystone = new Keystone({
  name: PROJECT_NAME,
  adapter: new Adapter(adapterConfig),
  onConnect: process.env.CREATE_TABLES !== 'true' && initialiseData,
});

// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) => Boolean(user && user.isAdmin);
const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }

  // Instead of a boolean, you can return a GraphQL query:
  // https://www.keystonejs.com/api/access-control#graphqlwhere
  return { id: user.id };
};

const userIsAdminOrOwner = auth => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};

const userCanPostOrOwner = auth => {
  const canPost = access.userCanPost(auth);
  const isOwner = access.userOwnsItem(auth);
  return canPost ? canPost : isOwner;
};

const userIsRedac = ({ authentication: { item: user } }) => Boolean(user && user.isRedac);
const userIsWritter = ({ authentication: { item: user } }) => Boolean(user && user.isWritter);

const userCanPost = ({ authentication: { item: user } }) => Boolean(user && (user.isRedac || user.isAdmin));

const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner, userIsRedac, userIsWritter, userCanPost, userCanPostOrOwner };

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
    },
    isAdmin: {
      type: Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: access.userIsAdmin,
      },
    },
    isRedac: {
      type: Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: access.userIsAdmin,
      },
    },
    isWritter: {
      type: Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: access.userIsAdmin,
      },
    },
    password: {
      type: Password,
    },
  },
  // List-level access controls
  access: {
    read: access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
});

keystone.createList('Article', {
  fields: {
    title: { type: Text },
    resume: { type: Text },
    image: { type: File, adapter: fileAdapter },
    content: { type: Text },
    category: { type: Relationship, ref: 'Category', many: true },
    author: { type: AuthedRelationship, ref: 'User' },
    publish: {
      type: Checkbox,
      access: {
        update: access.userCanPost,
      },
    },
  },
  // List-level access controls
  access: {
    update: access.userCanPostOrOwner,
    create: access.userCanPostOrOwner,
    delete: access.userCanPostOrOwner,
    auth: true,
  },
});

keystone.createList('Category', {
  fields: {
    name: { type: Text }
  },
  // List-level access controls
  access: {
    update: access.userCanPost,
    create: access.userCanPost,
    delete: access.userCanPost,
    auth: true,
  },
});

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new StaticApp({ path: '/', src: 'public' }),
    new AdminUIApp({
      enableDefaultRoute: true,
      authStrategy,
    }),
  ],
};
