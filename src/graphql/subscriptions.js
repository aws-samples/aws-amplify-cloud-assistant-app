/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateConversation = /* GraphQL */ `
  subscription OnCreateConversation($owner: String) {
    onCreateConversation(owner: $owner) {
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
export const onUpdateConversation = /* GraphQL */ `
  subscription OnUpdateConversation($owner: String) {
    onUpdateConversation(owner: $owner) {
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
export const onDeleteConversation = /* GraphQL */ `
  subscription OnDeleteConversation($owner: String) {
    onDeleteConversation(owner: $owner) {
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
export const onCreateUtterance = /* GraphQL */ `
  subscription OnCreateUtterance($owner: String) {
    onCreateUtterance(owner: $owner) {
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
export const onUpdateUtterance = /* GraphQL */ `
  subscription OnUpdateUtterance($owner: String) {
    onUpdateUtterance(owner: $owner) {
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
export const onDeleteUtterance = /* GraphQL */ `
  subscription OnDeleteUtterance($owner: String) {
    onDeleteUtterance(owner: $owner) {
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
