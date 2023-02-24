/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getConversation = /* GraphQL */ `
  query GetConversation($id: ID!) {
    getConversation(id: $id) {
      id
      name
      user
      description
      createdAt
      utterances {
        items {
          id
          text
          author
          conversationId
          data
          createdAt
          updatedAt
          owner
        }
        nextToken
      }
      updatedAt
      owner
    }
  }
`;
export const listConversations = /* GraphQL */ `
  query ListConversations(
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listConversations(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        user
        description
        createdAt
        utterances {
          nextToken
        }
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getUtterance = /* GraphQL */ `
  query GetUtterance($id: ID!) {
    getUtterance(id: $id) {
      id
      text
      author
      conversationId
      data
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listUtterances = /* GraphQL */ `
  query ListUtterances(
    $filter: ModelUtteranceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUtterances(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        text
        author
        conversationId
        data
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const conversationsByUser = /* GraphQL */ `
  query ConversationsByUser(
    $user: String!
    $createdAt: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelConversationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    conversationsByUser(
      user: $user
      createdAt: $createdAt
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        user
        description
        createdAt
        utterances {
          nextToken
        }
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
