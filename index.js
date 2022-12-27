'use strict'

module.exports = {
  LdapMessage: require('./lib/ldap-message'),

  AbandonRequest: require('./lib/messages/abandon-request'),
  AddRequest: require('./lib/messages/add-request'),
  BindRequest: require('./lib/messages/bind-request'),
  CompareRequest: require('./lib/messages/compare-request'),
  DeleteRequest: require('./lib/messages/delete-request'),
  ExtensionRequest: require('./lib/messages/extension-request'),

  AbandonResponse: require('./lib/messages/abandon-response'),
  AddResponse: require('./lib/messages/add-response'),
  BindResponse: require('./lib/messages/bind-response'),
  CompareResponse: require('./lib/messages/compare-response'),
  DeleteResponse: require('./lib/messages/delete-response'),
  ExtensionResponse: require('./lib/messages/extension-response'),

  // Specific extension response implementations.
  PasswordModifyResponse: require('./lib/messages/extension-responses/password-modify'),
  WhoAmIResponse: require('./lib/messages/extension-responses/who-am-i')
}
