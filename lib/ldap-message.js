'use strict'

const { BerReader, BerWriter } = require('@ldapjs/asn1')
const warning = require('./deprecations')

/**
 * Implements a base LDAP message as defined in
 * https://www.rfc-editor.org/rfc/rfc4511.html#section-4.1.1.
 */
class LdapMessage {
  #messageId = 0
  #protocolOp
  #controls = []

  /**
   * @param {object} [options]
   * @param {number} [options.messageId=1] An identifier for the message.
   * @param {number} [options.protocolOp] The tag for the message operation.
   * @param {object[]} [options.controls] A set of LDAP controls to send with
   * the message. See the `@ldapjs/controls` package.
   */
  constructor (options = {}) {
    this.#messageId = parseInt(options.messageId || options.messageID || '1', 10)
    if (options.messageID) {
      warning.emit('LDAP_MESSAGE_DEP_001')
    }

    if (options.protocolOp) {
      this.#protocolOp = options.protocolOp
    }

    if (Array.isArray(options.controls)) {
      Array.prototype.push.apply(this.#controls, options.controls)
    }
  }

  get [Symbol.toStringTag] () {
    return 'LdapMessage'
  }

  /**
   * The message identifier.
   *
   * @type {number}
   */
  get id () {
    return this.#messageId
  }

  /**
   * Message type specific. Each message type must implement a `_dn` property
   * that provides this value.
   *
   * @type {string}
   */
  get dn () {
    return this._dn
  }

  /**
   * The LDAP protocol operation code for the message.
   *
   * @type {number}
   */
  get protocolOp () {
    return this.#protocolOp
  }

  /**
   * The name of the message class.
   *
   * @type {string}
   */
  get type () {
    return 'LdapMessage'
  }

  /**
   * Use {@link pojo} instead.
   *
   * @deprecated
   */
  get json () {
    warning.emit('LDAP_MESSAGE_DEP_002')
    return this.pojo
  }

  /**
   * A serialized representation of the message as a plain JavaScript object.
   * Specific message types must implement the `_pojo(obj)` method. The passed
   * in `obj` must be extended with the specific message's unique properties
   * and returned as the result.
   *
   * @returns {object}
   */
  get pojo () {
    let result = {
      messageId: this.id,
      protocolOp: this.#protocolOp,
      type: this.type
    }

    if (typeof this._pojo === 'function') {
      result = this._pojo(result)
    }

    result.controls = this.#controls

    return result
  }

  addControl (control) {
    this.#controls.push(control)
  }

  /**
   * Converts an {@link LdapMessage} object into a set of BER bytes that can
   * be sent across the wire. Specific message implementations must implement
   * the `_toBer(ber)` method. This method will write its unique sequence(s)
   * to the passed in `ber` object.
   *
   * @returns {import('@ldapjs/asn1').BerReader}
   */
  toBer () {
    if (typeof this._toBer !== 'function') {
      throw Error(`${this.type} does not implement _toBer`)
    }

    const writer = new BerWriter()
    writer.startSequence()
    writer.writeInt(this.id)

    this._toBer(writer)

    if (Array.isArray(this.#controls) === true && this.#controls.length > 0) {
      writer.startSequence(0xa0)
      this.#controls.forEach(function (c) {
        c.toBer(writer)
      })
      writer.endSequence()
    }

    writer.endSequence()
    return new BerReader(writer.buffer)
  }

  /**
   * Serializes the message into a JSON representation.
   *
   * @returns {string}
   */
  toString () {
    return JSON.stringify(this.pojo)
  }

  /**
   * Parses a BER into a message object. The offset of the BER _must_ point
   * to the start of an LDAP Message sequence. That is, the first few bytes
   * must indicate:
   *
   * 1. a sequence tag and how many bytes are in that sequence
   * 2. an integer representing the message identifier
   * 3. a protocol operation, e.g. BindRequest, and the number of bytes in
   * that operation
   *
   * @param {import('@ldapjs/asn1').BerReader} ber
   *
   * @returns {LdapMessage}
   */
  static parse (ber) {
    // We  must require here because `parseToMessage` imports subclasses
    // that need `LdapMessage` to be defined. If we try importing earlier,
    // then `LdapMessage` will not be available, and we will get errors about
    // trying to subclass null objects.
    return require('./parse-to-message')(ber)
  }

  /**
   * When invoked on specific message types, e.g. {@link BindRequest}, this
   * method will parse a BER into a plain JavaScript object that is usable as
   * an options object for constructing that specific message object.
   *
   * @param {import('@ldapjs/asn1').BerReader} ber A BER to parse. The reader
   * offset must point to the start of a valid sequence, i.e. the "tag" byte
   * in the TLV tuple, that represents the message to be parsed. For example,
   * in a {@link BindRequest} the starting sequence and message identifier must
   * already be read such that the offset is at the protocol operation sequence
   * byte.
   */
  static parseToPojo (ber) {
    throw Error('Use LdapMessage.parse, or a specific message type\'s parseToPojo, instead.')
  }
}

module.exports = LdapMessage
