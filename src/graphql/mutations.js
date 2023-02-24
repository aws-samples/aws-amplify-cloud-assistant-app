/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createConversation = /* GraphQL */ `
  mutation CreateConversation(
    $input: CreateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    createConversation(input: $input, condition: $condition) {
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
export const updateConversation = /* GraphQL */ `
  mutation UpdateConversation(
    $input: UpdateConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    updateConversation(input: $input, condition: $condition) {
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
export const deleteConversation = /* GraphQL */ `
  mutation DeleteConversation(
    $input: DeleteConversationInput!
    $condition: ModelConversationConditionInput
  ) {
    deleteConversation(input: $input, condition: $condition) {
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
export const createUtterance = /* GraphQL */ `
  mutation CreateUtterance(
    $input: CreateUtteranceInput!
    $condition: ModelUtteranceConditionInput
  ) {
    createUtterance(input: $input, condition: $condition) {
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
export const updateUtterance = /* GraphQL */ `
  mutation UpdateUtterance(
    $input: UpdateUtteranceInput!
    $condition: ModelUtteranceConditionInput
  ) {
    updateUtterance(input: $input, condition: $condition) {
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
export const deleteUtterance = /* GraphQL */ `
  mutation DeleteUtterance(
    $input: DeleteUtteranceInput!
    $condition: ModelUtteranceConditionInput
  ) {
    deleteUtterance(input: $input, condition: $condition) {
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
