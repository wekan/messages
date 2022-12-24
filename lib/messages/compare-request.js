'use strict'

const { operations } = require('@ldapjs/protocol')
const LdapMessage = require('../ldap-message')
const Protocol = require('@ldapjs/protocol')

/**
 * Implements the compare request message as described in
 * https://www.rfc-editor.org/rfc/rfc4511.html#section-4.10.
 */
class CompareRequest extends LdapMessage {
  #attribute
  #entry
  #value

  /**
   * @param {object} [options]
   * @param {string|null} [options.attribute] The attribute name to compare
   * against.
   * @param {string} [options.entry] The target LDAP entity whose attribute
   * will be compared.
   * @param {string} [options.value] The value of the attribute to compare.
   */
  constructor (options = {}) {
    options.protocolOp = operations.LDAP_REQ_COMPARE
    super(options)

    this.#attribute = options.attribute || ''
    this.#entry = options.entry || null
    this.#value = options.value || ''
  }

  /**
   * The property of an LDAP entry to compare against.
   *
   * @returns {string}
   */
  get attribute () {
    return this.#attribute
  }

  /**
   * Define the LDAP entry property to compare against.
   *
   * @param {string} value
   */
  set attribute (value) {
    this.#attribute = value
  }

  /**
   * The LDAP entry that will be inspected.
   *
   * @returns {string|null}
   */
  get entry () {
    return this.#entry
  }

  /**
   * Define the LDAP entity to inspect.
   *
   * @param {string} value
   */
  set entry (value) {
    this.#entry = value
  }

  /**
   * The name of the request type.
   *
   * @type {string}
   */
  get type () {
    return 'CompareRequest'
  }

  /**
   * The value the attribute should be set to.
   *
   * @returns {string}
   */
  get value () {
    return this.#value
  }

  /**
   * Define the value the attribute should match.
   *
   * @param {string} value
   */
  set value (value) {
    this.#value = value
  }

  get _dn () {
    return this.#entry
  }

  /**
   * Internal use only.
   *
   * @param {import('@ldapjs/asn1').BerWriter} ber
   *
   * @returns {import('@ldapjs/asn1').BerWriter}
   */
  _toBer (ber) {
    ber.startSequence(Protocol.operations.LDAP_REQ_COMPARE)

    ber.writeString(this.#entry)
    ber.startSequence()
    ber.writeString(this.#attribute)
    ber.writeString(this.#value)
    ber.endSequence()

    ber.endSequence()
    return ber
  }

  /**
   * Internal use only.
   *
   * @param {object}
   *
   * @returns {object}
   */
  _pojo (obj = {}) {
    obj.attribute = this.#attribute
    obj.entry = this.#entry
    obj.value = this.#value
    return obj
  }

  /**
   * Implements the standardized `parseToPojo` method.
   *
   * @see LdapMessage.parseToPojo
   *
   * @param {import('@ldapjs/asn1').BerReader} ber
   */
  static parseToPojo (ber) {
    const protocolOp = ber.readSequence()
    if (protocolOp !== operations.LDAP_REQ_COMPARE) {
      const op = protocolOp.toString(16).padStart(2, '0')
      throw Error(`found wrong protocol operation: 0x${op}`)
    }

    const entry = ber.readString()
    ber.readSequence()
    const attribute = ber.readString()
    const value = ber.readString()

    return {
      protocolOp,
      entry,
      attribute,
      value
    }
  }
}

module.exports = CompareRequest
